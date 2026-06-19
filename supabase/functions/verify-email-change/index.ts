import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  code: string;
  newEmail: string;
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

    const body: RequestBody = await req.json();
    const { code, newEmail } = body;

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Введіть 6-значний код" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find pending request for this user
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from("email_change_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("new_email", newEmail)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching email change request:", fetchError);
      return new Response(
        JSON.stringify({ error: "Помилка пошуку запиту" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!requests || requests.length === 0) {
      return new Response(
        JSON.stringify({ error: "Запит не знайдено або вже використано" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const request = requests[0];

    // Check if expired
    if (new Date(request.code_expires_at) < new Date()) {
      await supabaseAdmin
        .from("email_change_requests")
        .update({ status: "expired" })
        .eq("id", request.id);

      return new Response(
        JSON.stringify({ error: "Код підтвердження прострочено" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts limit
    if (request.attempts >= 5) {
      await supabaseAdmin
        .from("email_change_requests")
        .update({ status: "cancelled" })
        .eq("id", request.id);

      return new Response(
        JSON.stringify({ error: "Перевищено кількість спроб. Створіть новий запит." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabaseAdmin
      .from("email_change_requests")
      .update({ attempts: request.attempts + 1 })
      .eq("id", request.id);

    // Verify code
    const isValidCode = await bcrypt.compare(code, request.verification_code_hash);

    if (!isValidCode) {
      return new Response(
        JSON.stringify({ error: "Невірний код підтвердження" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update email via admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: newEmail,
      email_confirm: true,
    });

    if (updateError) {
      console.error("Error updating user email:", updateError);
      return new Response(
        JSON.stringify({ error: "Помилка оновлення email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark request as verified
    await supabaseAdmin
      .from("email_change_requests")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    console.log(`Email changed for user ${userId}: ${request.current_email} -> ${newEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email успішно змінено",
        newEmail 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-email-change:", error);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});