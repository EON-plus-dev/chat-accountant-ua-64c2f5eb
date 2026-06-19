import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  newEmail: string;
  password: string;
  currentEmail: string;
  resend?: boolean;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Не авторизовано" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's auth
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for service operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Невалідний токен" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const body: RequestBody = await req.json();
    const { newEmail, password, currentEmail, resend } = body;

    // Validate inputs
    if (!newEmail || !password) {
      return new Response(
        JSON.stringify({ error: "Email та пароль обов'язкові" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return new Response(
        JSON.stringify({ error: "Невірний формат email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if new email is same as current
    if (newEmail.toLowerCase() === userEmail.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Новий email співпадає з поточним" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password by re-authenticating
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (signInError) {
      console.error("Password verification failed:", signInError);
      return new Response(
        JSON.stringify({ error: "Невірний пароль" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email is already in use
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === newEmail.toLowerCase() && u.id !== userId
    );

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: "Цей email вже використовується" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cancel any existing pending requests for this user
    await supabaseAdmin
      .from("email_change_requests")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "pending");

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the code for storage
    const codeHash = await bcrypt.hash(otpCode);

    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Store the request
    const { error: insertError } = await supabaseAdmin
      .from("email_change_requests")
      .insert({
        user_id: userId,
        current_email: userEmail,
        new_email: newEmail,
        verification_code_hash: codeHash,
        code_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error("Error creating email change request:", insertError);
      return new Response(
        JSON.stringify({ error: "Помилка створення запиту" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log non-sensitive metadata only
    console.log("OTP verification code generated for email change request");

    // TODO: Implement email delivery (e.g. via Resend or Lovable Email)
    // Do NOT log the OTP code itself

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Код підтвердження надіслано"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-email-verification:", error);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});