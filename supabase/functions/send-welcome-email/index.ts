import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  name?: string;
  email: string;
}

const SITE_URL = "https://fintodo.com.ua";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(name?: string): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Вітаємо, ${safeName}!` : "Вітаємо, шановний користувачу!";

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Вітаємо в OblikAI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">OblikAI</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Розумний помічник для бухгалтерії та податків</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">${greeting}</h2>
              <p style="margin:0 0 20px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Дякуємо за інтерес до OblikAI — розумного помічника для бухгалтерії та податків.
              </p>
              <p style="margin:0 0 20px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Ви серед перших, хто дізнається про запуск платформи. Це означає:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:6px 0;color:#3f3f46;font-size:15px;">✅ Ранній доступ раніше за всіх</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#3f3f46;font-size:15px;">🎁 Бонус на старті для перших користувачів</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#3f3f46;font-size:15px;">🎧 Пріоритетна підтримка від команди</td>
                </tr>
              </table>
              <h3 style="margin:0 0 12px;color:#18181b;font-size:16px;font-weight:600;">Що далі?</h3>
              <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Ми активно працюємо над запуском. Ви отримаєте лист, щойно платформа буде готова до використання.
              </p>
              <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;">Тим часом можете поділитися з колегами:</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#16a34a;border-radius:8px;">
                    <a href="${SITE_URL}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                      Поділитися посиланням →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:13px;">З повагою, команда OblikAI</p>
              <p style="margin:8px 0 0;color:#a1a1aa;font-size:12px;">
                <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none;">${SITE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email обов'язковий" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Невірний формат email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate name length
    if (name && name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Ім'я занадто довге" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("Welcome email skipped — Resend not configured");
      return new Response(
        JSON.stringify({ success: true, demo: true, message: "Email logged (Resend not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildHtml(name);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL") || "OblikAI <onboarding@resend.dev>",
        to: [email],
        subject: "Вітаємо в OblikAI — ви серед перших!",
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", res.status);
      return new Response(
        JSON.stringify({ error: "Помилка відправки email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-welcome-email:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
