import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

interface SendTeamInviteRequest {
  cabinetId: string;
  cabinetName: string;
  cabinetType: "fop" | "tov" | "individual";
  inviterName: string;
  inviterRole: string;
  inviteeEmail: string;
  role: string;          // machine key (e.g. "accountant")
  roleLabel: string;     // display label (e.g. "Бухгалтер")
  inviteCode: string;
  personalMessage?: string;
  expiresIn?: string;
}

const cabinetTypeLabels: Record<string, string> = {
  fop: "ФОП",
  tov: "ТОВ",
  individual: "Фізична особа",
};

// Escape HTML to prevent XSS in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateEmailHtml(props: {
  cabinetName: string;
  cabinetType: string;
  inviterName: string;
  inviterRole: string;
  inviteeEmail: string;
  roleLabel: string;
  inviteCode: string;
  inviteLink: string;
  personalMessage?: string;
  expiresIn: string;
}): string {
  const typeLabel = cabinetTypeLabels[props.cabinetType] || escapeHtml(props.cabinetType);
  
  // Escape all user-provided values
  const safeCabinetName = escapeHtml(props.cabinetName);
  const safeInviterName = escapeHtml(props.inviterName);
  const safeInviterRole = escapeHtml(props.inviterRole);
  const safeRoleLabel = escapeHtml(props.roleLabel);
  const safeInviteCode = escapeHtml(props.inviteCode);
  const safeInviteeEmail = escapeHtml(props.inviteeEmail);
  const safeExpiresIn = escapeHtml(props.expiresIn);
  const safeInviteLink = encodeURI(props.inviteLink);
  
  const personalMessageHtml = props.personalMessage ? `
    <div style="background-color: #f9fafb; border-radius: 8px; margin: 16px 0; padding: 16px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Повідомлення:</p>
      <p style="color: #374151; font-size: 15px; font-style: italic; line-height: 1.6; margin: 0;">«${escapeHtml(props.personalMessage)}»</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Запрошення до кабінету</title>
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 20px 0;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; max-width: 600px; border-radius: 8px;">
    
    <!-- Header -->
    <div style="padding: 24px 40px 0;">
      <p style="font-size: 20px; font-weight: 600; color: #1a1a2e; margin: 0;">📋 Електронний Кабінет</p>
    </div>
    
    <!-- Hero -->
    <h1 style="color: #1a1a2e; font-size: 24px; font-weight: 600; line-height: 1.3; margin: 32px 40px 8px; padding: 0;">
      Вас запрошено до кабінету
    </h1>
    <p style="color: #3b82f6; font-size: 22px; font-weight: 700; margin: 0 40px 8px;">
      «${safeCabinetName}»
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0 40px 24px;">
      ${typeLabel}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Inviter Info -->
    <div style="padding: 0 40px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${safeInviterName}</strong> (${safeInviterRole}) запрошує вас приєднатися до команди.
      </p>
    </div>
    
    <!-- Role Badge -->
    <div style="padding: 0 40px; margin-bottom: 16px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Ваша роль:</p>
      <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 16px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">
        🏷️ ${safeRoleLabel}
      </span>
    </div>
    
    <!-- Personal Message -->
    ${personalMessageHtml}
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Invite Code Block -->
    <div style="text-align: center; padding: 24px 40px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px;">Ваш код запрошення:</p>
      <div style="background-color: #1a1a2e; color: #ffffff; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 4px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
        ${safeInviteCode}
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; padding: 8px 40px 24px;">
      <a href="${safeInviteLink}" style="background-color: #3b82f6; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
        Приєднатися до команди
      </a>
    </div>
    
    <!-- Link Fallback -->
    <div style="text-align: center; padding: 0 40px 16px;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Або скопіюйте посилання:</p>
      <a href="${safeInviteLink}" style="color: #3b82f6; font-size: 13px; word-break: break-all;">
        ${safeInviteLink}
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Instructions -->
    <div style="background-color: #f0fdf4; border-radius: 8px; margin: 16px 40px; padding: 20px;">
      <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0 0 12px;">Як приєднатися:</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0;">
        1. Натисніть кнопку «Приєднатися до команди» або відкрийте посилання<br>
        2. Введіть код <strong>${safeInviteCode}</strong> (якщо потрібно)<br>
        3. Підтвердьте свою особу через КЕП або Дія.Підпис<br>
        4. Готово — ви в команді! 🎉
      </p>
    </div>
    
    <!-- Expiry Notice -->
    <div style="text-align: center; padding: 8px 40px;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        ⏰ Запрошення дійсне ${safeExpiresIn}
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Footer -->
    <div style="padding: 0 40px;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Цей лист надіслано на адресу ${safeInviteeEmail}, оскільки вас запросили приєднатися до кабінету «${safeCabinetName}».
      </p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Якщо ви не очікували цього листа, просто проігноруйте його.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
        © Електронний Кабінет
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const body: SendTeamInviteRequest = await req.json();
    
    // Validate required fields
    const { cabinetId, cabinetName, cabinetType, inviterName, inviterRole, inviteeEmail, role, roleLabel, inviteCode } = body;
    
    if (!cabinetId || !cabinetName || !cabinetType || !inviterName || !inviteeEmail || !role || !roleLabel || !inviteCode) {
      return new Response(
        JSON.stringify({ error: "Відсутні обов'язкові поля" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field lengths to prevent abuse
    if (cabinetName.length > 200 || inviterName.length > 100 || roleLabel.length > 100 || inviteCode.length > 50) {
      return new Response(
        JSON.stringify({ error: "Перевищено допустиму довжину поля" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.personalMessage && body.personalMessage.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Персональне повідомлення занадто довге (макс. 1000 символів)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteeEmail)) {
      return new Response(
        JSON.stringify({ error: "Некоректний формат email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Persist invitation in cabinet_invitations (service-role, bypasses RLS).
    // The user's identity (invited_by) is already verified above via JWT.
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invitationRow, error: invitationError } = await adminSupabase
      .from("cabinet_invitations")
      .insert({
        code: inviteCode,
        cabinet_id: cabinetId,
        cabinet_name: cabinetName,
        cabinet_type: cabinetType,
        invited_email: inviteeEmail.toLowerCase(),
        role,
        role_label: roleLabel,
        invited_by: user.id,
        personal_message: body.personalMessage ?? null,
      })
      .select("id")
      .maybeSingle();

    if (invitationError) {
      // Unique violation on code → ask client to regenerate.
      const isDuplicate = invitationError.code === "23505";
      console.error("Failed to persist invitation:", invitationError);
      return new Response(
        JSON.stringify({
          error: isDuplicate
            ? "Код запрошення вже використовується. Згенеруйте новий."
            : "Не вдалось зберегти запрошення",
        }),
        { status: isDuplicate ? 409 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invitation persisted:", invitationRow?.id, "code:", inviteCode);

    // Generate invite link
    const baseUrl = Deno.env.get("SITE_URL") || "https://lovable.dev";
    const inviteLink = `${baseUrl}/add-cabinet?code=${encodeURIComponent(inviteCode)}`;
    const expiresIn = body.expiresIn || "7 днів";

    // Generate email HTML
    const html = generateEmailHtml({
      cabinetName,
      cabinetType,
      inviterName,
      inviterRole,
      inviteeEmail,
      roleLabel,
      inviteCode,
      inviteLink,
      personalMessage: body.personalMessage,
      expiresIn,
    });

    // Check for Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const isDemoMode = !resendApiKey;

    if (isDemoMode) {
      // Demo mode - log and return preview
      console.log("📧 [DEMO MODE] Email would be sent:");
      console.log(`   To: ${inviteeEmail}`);
      console.log(`   Subject: Запрошення до кабінету «${cabinetName}»`);
      console.log(`   Invite Code: ${inviteCode}`);
      console.log(`   Role: ${roleLabel}`);
      console.log(`   Inviter: ${inviterName} (${inviterRole})`);
      
      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: "Демо-режим: email не відправлено (потрібен RESEND_API_KEY)",
          preview: {
            to: inviteeEmail,
            subject: `Запрошення до кабінету «${cabinetName}»`,
            inviteCode,
            inviteLink,
          },
          html,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Production mode - send via Resend
    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: "Електронний Кабінет <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `Запрошення до кабінету «${cabinetName}»`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("📧 Email sent successfully:", data);
    
    return new Response(
      JSON.stringify({
        success: true,
        demo: false,
        messageId: data?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("Error in send-team-invite:", err);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
