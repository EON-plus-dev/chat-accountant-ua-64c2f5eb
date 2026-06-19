import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";

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
    const { password, reason } = body;

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

    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create deletion request audit log
    const { error: auditError } = await supabaseAdmin
      .from("account_deletion_requests")
      .insert({
        user_id: userId,
        user_email: userEmail,
        status: "processing",
        ip_address: ipAddress,
        user_agent: userAgent,
        reason: reason || null,
      });

    if (auditError) {
      console.error("Error creating audit log:", auditError);
      // Continue anyway - audit is not critical
    }

    // Collect summary of deleted data
    const deletedDataSummary: Record<string, number> = {};

    // Delete user's 2FA settings
    const { data: deleted2FA } = await supabaseAdmin
      .from("user_2fa_settings")
      .delete()
      .eq("user_id", userId)
      .select();
    if (deleted2FA?.length) deletedDataSummary["2fa_settings"] = deleted2FA.length;

    // Delete user's backup codes
    const { data: deletedCodes } = await supabaseAdmin
      .from("user_backup_codes")
      .delete()
      .eq("user_id", userId)
      .select();
    if (deletedCodes?.length) deletedDataSummary["backup_codes"] = deletedCodes.length;

    // Delete email change requests
    const { data: deletedRequests } = await supabaseAdmin
      .from("email_change_requests")
      .delete()
      .eq("user_id", userId)
      .select();
    if (deletedRequests?.length) deletedDataSummary["email_requests"] = deletedRequests.length;

    // Update audit log with summary
    await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        status: "completed",
        executed_at: new Date().toISOString(),
        deleted_data_summary: deletedDataSummary,
      })
      .eq("user_id", userId)
      .eq("status", "processing");

    // Finally, delete the user account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      
      // Update audit log with failure
      await supabaseAdmin
        .from("account_deletion_requests")
        .update({ status: "failed" })
        .eq("user_id", userId)
        .eq("status", "processing");

      return new Response(
        JSON.stringify({ error: "Помилка видалення акаунту" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Account deleted for user ${userId} (${userEmail})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Акаунт успішно видалено" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-account:", error);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});