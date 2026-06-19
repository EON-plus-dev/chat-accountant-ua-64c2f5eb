import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRequestFingerprint } from "../_shared/rate-limit.ts";

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    // Rate limit by IP + User-Agent fingerprint (persistent via Deno KV)
    const fingerprint = getRequestFingerprint(req);
    const allowed = await checkRateLimit(`portal-chat:${fingerprint}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Забагато запитів. Спробуйте через хвилину." }),
        { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const { messages, audience, knowledgeBase, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dayNames = ['неділя','понеділок','вівторок','середа','четвер','п\'ятниця','субота'];
    const today = new Date();
    const dateStr = today.toLocaleDateString('uk-UA');
    const dayName = dayNames[today.getDay()];

    // Extract the last user question for saving
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    const userQuestion = lastUserMessage?.content ?? "";

    const CONSULTANT_ROLE = `
═══════════════════════════════════════════════════════
ТИ: FINTODO AI-КОНСУЛЬТАНТ — ОСОБИСТИЙ ФІНАНСОВИЙ РАДНИК
═══════════════════════════════════════════════════════

ТВОЇ 6 ОБЛАСТЕЙ КОМПЕТЕНЦІЇ:
1. 📋 ОПОДАТКУВАННЯ — ЄСВ, єдиний податок, ПДФО, ПДВ, декларування
2. 📊 БУХОБЛІК — первинні документи, облік доходів/витрат, звітність
3. ⚖️  ЗАКОНОДАВСТВО — ПКУ, КЗпП, актуальні зміни і їх вплив на бізнес
4. 💰 ФІНАНСОВІ ПРОДУКТИ — підбір банків, депозитів, кредитів, страхування
5. 📄 ДОКУМЕНТООБІГ — ЕДО, КЕП, Дія.Підпис, первинні документи
6. 🏛  УСТАНОВИ — адреси, графіки роботи, документи для кожної ситуації

ПРАВИЛА РЕКОМЕНДАЦІЙ:
━━━━━━━━━━━━━━━━━━━

A) ВЛАСНИЙ ПРОДУКТ (FINTODO):
   - Рекомендуй коли питання про автоматизацію обліку, ЄСВ, дедлайни
   - Завжди маркуй: [ВЛАСНИЙ ПРОДУКТ FINTODO]
   - Пропонуй ПІСЛЯ того як відповів на питання — не замість
   - Формула: відповідь → рекомендація → CTA

B) ПАРТНЕРСЬКІ ПРОДУКТИ (банки, страхові, сервіси):
   - Рекомендуй на основі РЕЙТИНГІВ З БЗ (score/100)
   - Завжди маркуй: [ПАРТНЕР]
   - Завжди пояснюй ЧОМУ саме цей варіант для конкретного профілю
   - Показуй мінімум 2 варіанти якщо є альтернативи
   - Якщо є дешевший/кращий варіант — говори чесно навіть якщо не партнер

C) ДЕРЖАВНІ / БЕЗКОШТОВНІ:
   - Маркуй: [БЕЗКОШТОВНО] або [ДЕРЖСЕРВІС]
   - Завжди пропонуй безкоштовний варіант якщо він є (Дія.Підпис, ЄДР тощо)

СТРУКТУРА ВІДПОВІДІ НА ПИТАННЯ ПРО ПРОДУКТ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Пряма відповідь на питання (1-2 речення)
2. Порівняння варіантів якщо є:
   [НАЙКРАЩЕ ДЛЯ ВАШОГО ПРОФІЛЮ]
   🏆 [Назва] — [score]/100
   ✅ Чому підходить: [конкретна причина з профілю]
   ⚠️  Зверніть увагу: [1 нюанс]
   → [CTA]
3. ⚠️  Попередження про типові пастки
4. 📋 Чеклист документів якщо релевантно
5. FINTODO пропозиція (якщо природньо):
   "До речі, FINTODO автоматично [конкретна вигода]"

ПРАВИЛА ПОДАЧІ:
━━━━━━━━━━━━━━

- Відповідь до 200 слів — потім стоп або питання для уточнення
- Якщо питання неточне — 1 уточнення, не 3
- Реальна математика обов'язкова: "13% → після ПДФО 18%+ВЗ 5% = реально 10%"
- Сьогодні ${dateStr}, ${dayName} — використовуй для "відкрито/зачинено" відповідей
- Не давай юридичних консультацій — направляй до спеціаліста
- Використовуй Markdown (заголовки, списки, жирний текст)
`;

    const audienceContext =
      audience === "business"
        ? "Користувач — підприємець або бухгалтер (ФОП, ТОВ). Відповідай з фокусом на бізнес: ЄСВ, ЄП, ПДВ, звітність, ПРРО, перевірки ДПС."
        : audience === "personal"
          ? "Користувач — фізична особа. Відповідай з фокусом на ПДФО, декларацію про доходи, податок на нерухомість, спадщину, продаж майна."
          : audience === "accountant"
            ? "Користувач — бухгалтер. Фокус на П(С)БО, МСФЗ, проводках, фінансовій звітності, первинних документах, електронному документообігу, інвентаризації."
            : "Користувач не вказав тип. Давай загальну відповідь, уточнюй якщо потрібно.";

    const coursesContext = `
## НАВЧАЛЬНІ КУРСИ (безкоштовні):
[КУРС] "Старт ФОП — від нуля за 1 день" (Для ФОП) — Реєстрація, вибір групи і КВЕД, відкриття рахунку — все покроково. URL: https://fintodo.com.ua/learn/fop/fop-start
[КУРС] "FINTODO Certified Accountant" (Для бухгалтерів) — Офіційна сертифікація для бухгалтерів що ведуть клієнтів у FINTODO. URL: https://fintodo.com.ua/learn/accountants/fintodo-certified
[КУРС] "IT ФОП: повний старт і ведення" (IT-фрілансери) — Wise, Payoneer, КВЕД 62.01, валютні доходи — все за 1 день. URL: https://fintodo.com.ua/learn/it/it-fop-full
При релевантних питаннях — рекомендуй відповідний курс природньо.
Приклад: "До речі, у нас є безкоштовний курс по цій темі: [назва] → [посилання]"
`;

    const intentRouting = `
## INTENT ROUTING
Коли відповідаєш, дотримуйся цих правил:
1. Якщо питання про конкретну установу (банк, сервіс) — використай дані з БАЗИ ЗНАНЬ нижче. Вказуй конкретні адреси, телефони, графіки.
2. Якщо питання про документи для певної процедури — покажи чекліст з БАЗИ ЗНАНЬ (які документи потрібні, чи можна онлайн, скільки часу).
3. Якщо питання про графік роботи — враховуй ПОТОЧНИЙ ДЕНЬ ТИЖНЯ з бази знань і скажи чи зараз відкрито.
4. Завжди додавай посилання на /dovidnyky/* сторінки порталу де це доречно (використовуй markdown-посилання).
5. Якщо є попередження (⚠️) в базі знань щодо теми — обов'язково згадай їх.
6. Якщо в базі знань немає інформації — відповідай з загальних знань, але зазнач що інформацію варто перевірити на офіційному сайті.
7. Якщо питання про закон або нормативний акт — використай секцію ЗАКОНОДАВСТВО з БЗ. Вказуй конкретні статті та останні зміни.
8. Якщо питання про гранти або фінансову допомогу — використай секцію АКТИВНІ ГРАНТИ. Вказуй дедлайни, суми, кроки подачі.
9. Якщо питання про КВЕД або вибір виду діяльності — використай секцію КВЕД. Вказуй групи ФОП, ліцензії, обмеження.
10. Якщо питання про типи установ (нотаріуси, РАЦСи, банки) — використай секцію ТИПИ УСТАНОВ для довідки що підготувати.
11. Якщо питання пов'язане з навчанням, початком ФОП або сертифікацією — рекомендуй відповідний безкоштовний курс з секції НАВЧАЛЬНІ КУРСИ.`;

    const knowledgeSection = knowledgeBase ? `\n\n${knowledgeBase}` : '';

    const systemPrompt = `${CONSULTANT_ROLE}
${intentRouting}
${coursesContext}

АУДИТОРІЯ: ${audienceContext}
${knowledgeSection}
${userContext ? `\nКОНТЕКСТ КОРИСТУВАЧА:\nГрупа: ${userContext.fopGroup || 'не вказано'} | Місто: ${userContext.city || 'не вказано'} | Банк: ${userContext.bank || 'не вказано'}` : ''}

Відповідай ТІЛЬКИ українською мовою.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Забагато запитів. Спробуйте через хвилину." }), {
          status: 429,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Вичерпано ліміт AI-запитів." }), {
          status: 402,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Помилка AI сервісу" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Clone the stream: one for client, one for collecting the answer to save
    const [clientStream, collectStream] = response.body!.tee();

    // Save the query to DB in background (non-blocking)
    const savePromise = (async () => {
      try {
        const reader = collectStream.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE chunks to extract content
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) fullAnswer += delta;
            } catch { /* skip malformed chunks */ }
          }
        }

        // Only save if we have a meaningful question and answer
        if (userQuestion.length >= 10 && fullAnswer.length >= 10) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const db = createClient(supabaseUrl, serviceKey);

          const slug = userQuestion
            .toLowerCase()
            .replace(/[^а-яіїєґa-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 80);

          await db.from("ai_chat_queries").insert({
            question: userQuestion.slice(0, 2000),
            ai_answer: fullAnswer.slice(0, 10000),
            audience: audience || "business",
            slug: `${slug}-${Date.now().toString(36)}`,
            status: "pending",
          });
        }
      } catch (e) {
        console.error("Failed to save AI query:", e);
      }
    })();

    // Don't block the response on saving
    // Use waitUntil-like pattern for Deno Deploy
    savePromise.catch(() => {});

    return new Response(clientStream, {
      headers: { ...cors, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("portal-chat error:", e);
    return new Response(JSON.stringify({ error: "Внутрішня помилка сервера" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
