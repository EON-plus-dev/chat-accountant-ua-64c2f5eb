import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRequestFingerprint } from "../_shared/rate-limit.ts";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limit by IP + User-Agent fingerprint (persistent via Deno KV)
    const fingerprint = getRequestFingerprint(req);
    const allowed = await checkRateLimit(`roi-advice:${fingerprint}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Перевищено ліміт запитів. Спробуйте пізніше." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const body = await req.json();
    const { audienceType = "business" } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (audienceType === "individual") {
      const { incomeSources = 2, rentalObjects = 0, brokerReports = 0, foreignIncome = false } = body;
      const context = [
        `${incomeSources} джерел доходу`,
        rentalObjects > 0 ? `${rentalObjects} об'єктів оренди` : null,
        brokerReports > 0 ? `${brokerReports} брокерських/крипто звітів на рік` : null,
        `Іноземні доходи: ${foreignIncome ? 'Так' : 'Ні'}`,
      ].filter(Boolean).join(', ');

      systemPrompt = `Ти — експерт з декларування доходів фізичних осіб в Україні. Користувач вводить свої параметри в ROI-калькулятор. Дай КОРОТКУ персональну пораду (2-3 речення) українською мовою, яка:
1. Аналізує конкретні параметри користувача (джерела доходу, оренда, інвестиції, іноземні доходи)
2. Вказує, де найбільша вигода від автоматизації (декларація, облік оренди, імпорт брокерських звітів, конвенції)
3. Рекомендує конкретний тариф:
   - Базовий (249 грн/міс): до 2 джерел доходу, без інвестицій та іноземних доходів
   - Стандарт (349 грн/міс): брокерські звіти, кілька об'єктів оренди, або іноземні доходи (автоімпорт звітів, конвертація валют)
   - Професійний (699 грн/міс): 5+ джерел, складні інвестиції з іноземними доходами, е-декларування НАЗК
Будь конкретним. Використовуй числа та специфіку ситуації.`;

      userPrompt = `Параметри декларування: ${context}`;
    } else {
      const { documents, payments, employees, contractors, vatPayer, entityType, fopGroup } = body;
      const businessContext = [
        `Тип: ${entityType === 'tov' ? 'ТОВ' : 'ФОП'}`,
        fopGroup ? `Група ЄП: ${fopGroup}` : null,
        `ПДВ: ${vatPayer ? 'Так' : 'Ні'}`,
        `${documents} документів/міс`,
        `${payments} платежів/міс`,
        `${employees} співробітників`,
        `${contractors} контрагентів`,
      ].filter(Boolean).join(', ');

      systemPrompt = `Ти — експерт з автоматизації бухгалтерії в Україні. Користувач вводить свої параметри бізнесу в ROI-калькулятор. Дай КОРОТКУ персональну пораду (2-3 речення) українською мовою, яка:
1. Аналізує конкретні параметри користувача (тип бізнесу, група ФОП, ПДВ, контрагенти)
2. Вказує, де найбільша вигода від автоматизації (документи, ПДВ-реєстри, перевірка контрагентів, зарплата)
3. Рекомендує конкретний тариф:
   - Старт (399 грн/міс): для ФОП 1-2 групи з мінімальним обсягом
   - Смарт (799 грн/міс): для ФОП 3 групи з ПДВ, або з працівниками, або з >10 контрагентами (має модуль перевірки контрагентів та зарплатний модуль)
   - Преміум (1199 грн/міс): для ТОВ з ПДВ з >10 працівників, великих обсягів (мульти-кабінет, персональний менеджер)
Будь конкретним. Використовуй числа та специфіку бізнесу. Згадай ПДВ-реєстри/ЄРПН якщо платник ПДВ.`;

      userPrompt = `Параметри бізнесу: ${businessContext}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Занадто багато запитів, спробуйте пізніше." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Ліміт AI-запитів вичерпано." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || "Не вдалося згенерувати пораду.";

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roi-advice error:", e);
    return new Response(JSON.stringify({ error: "Внутрішня помилка сервера" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
