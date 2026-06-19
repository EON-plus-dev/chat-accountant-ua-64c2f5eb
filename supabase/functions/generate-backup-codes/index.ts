import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Generate a random code in format XXXXX-XXXXX
function generateBackupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars: 0, O, I, 1
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += "-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    const { password } = body;

    if (!password) {
      return new Response(
        JSON.stringify({ error: "Пароль обов'язковий" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password
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

    // Check if 2FA is enabled
    const { data: settings } = await supabaseAdmin
      .from("user_2fa_settings")
      .select("is_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (!settings?.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Спочатку увімкніть двофакторну автентифікацію" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete old backup codes
    await supabaseAdmin
      .from("user_backup_codes")
      .delete()
      .eq("user_id", userId);

    // Generate 10 new codes
    const plainCodes: string[] = [];
    const hashedCodes: { user_id: string; code_hash: string }[] = [];

    for (let i = 0; i < 10; i++) {
      const code = generateBackupCode();
      plainCodes.push(code);
      const hash = await bcrypt.hash(code);
      hashedCodes.push({
        user_id: userId,
        code_hash: hash,
      });
    }

    // Insert new codes
    const { error: insertError } = await supabaseAdmin
      .from("user_backup_codes")
      .insert(hashedCodes);

    if (insertError) {
      console.error("Error inserting backup codes:", insertError);
      return new Response(
        JSON.stringify({ error: "Помилка збереження кодів" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update 2FA settings with generation timestamp
    await supabaseAdmin
      .from("user_2fa_settings")
      .update({ backup_codes_generated_at: new Date().toISOString() })
      .eq("user_id", userId);

    console.log(`Generated ${plainCodes.length} backup codes for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        codes: plainCodes,
        message: "Резервні коди згенеровано"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-backup-codes:", error);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});