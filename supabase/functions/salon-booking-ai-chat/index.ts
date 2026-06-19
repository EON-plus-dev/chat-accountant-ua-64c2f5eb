/**
 * AI-консʼєрж для публічної форми запису салону.
 * Викликається з:
 *   - текстового чату (mode: "chat")
 *   - голосового режиму (mode: "voice", відповіді коротші)
 *
 * Архітектура tool-calling: модель сама викликає search_services,
 * check_availability, lookup_client. Логіка вибору слотів дублює
 * клієнтський computeAvailability — у production треба об'єднати
 * через спільну БД.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Демо-каталоги per cabinet ──────────────────────────────────────────────
const SALON_SERVICES = [
  { id: "svc-h-1", name: "Жіноча стрижка", category: "hair", durationMin: 60, price: 600 },
  { id: "svc-h-2", name: "Чоловіча стрижка", category: "hair", durationMin: 45, price: 400 },
  { id: "svc-h-3", name: "Фарбування одним тоном", category: "hair", durationMin: 120, price: 1500 },
  { id: "svc-h-4", name: "Укладка", category: "hair", durationMin: 45, price: 450 },
  { id: "svc-n-1", name: "Манікюр класичний", category: "nails", durationMin: 60, price: 450 },
  { id: "svc-n-2", name: "Манікюр з гель-лаком", category: "nails", durationMin: 90, price: 750 },
  { id: "svc-n-3", name: "Педикюр", category: "nails", durationMin: 75, price: 700 },
  { id: "svc-m-1", name: "Класичний масаж 60 хв", category: "massage", durationMin: 60, price: 800 },
  { id: "svc-m-2", name: "SPA-програма", category: "spa", durationMin: 90, price: 1400 },
  { id: "svc-b-1", name: "Корекція брів", category: "brows", durationMin: 30, price: 350 },
];

const SALON_MASTERS = [
  { id: "m-s-1", name: "Світлана", specs: ["hair"] },
  { id: "m-s-2", name: "Олена", specs: ["nails"] },
  { id: "m-s-3", name: "Андрій", specs: ["massage", "spa"] },
  { id: "m-f-1", name: "Анна", specs: ["hair"] },
  { id: "m-f-2", name: "Марина", specs: ["hair"] },
  { id: "m-f-5", name: "Тетяна", specs: ["nails"] },
  { id: "m-f-6", name: "Катерина", specs: ["nails", "brows"] },
];

const TENNIS_SERVICES = [
  { id: "tsvc-rent-clay", name: "Оренда корту (ґрунт)", category: "court_rent", durationMin: 60, price: 280 },
  { id: "tsvc-rent-hard-out", name: "Оренда корту (хард, outdoor)", category: "court_rent", durationMin: 60, price: 320 },
  { id: "tsvc-rent-hard-in", name: "Оренда корту (хард, indoor)", category: "court_rent", durationMin: 60, price: 420 },
  { id: "tsvc-train-60", name: "Індивідуальне тренування 60 хв", category: "training", durationMin: 60, price: 700 },
  { id: "tsvc-train-90", name: "Індивідуальне тренування 90 хв", category: "training", durationMin: 90, price: 1000 },
  { id: "tsvc-train-kids", name: "Тренування дитяче 45 хв", category: "training", durationMin: 45, price: 500 },
  { id: "tsvc-group", name: "Групове тренування", category: "group_class", durationMin: 60, price: 350 },
];

const TENNIS_MASTERS = [
  { id: "tc-m-1", name: "Андрій", specs: ["training", "group_class"] },
  { id: "tc-m-2", name: "Олена", specs: ["training", "group_class"] },
  { id: "tc-m-3", name: "Дмитро", specs: ["training"] },
  { id: "tc-m-4", name: "Ірина", specs: ["training", "group_class"] },
  { id: "tc-m-5", name: "Богдан", specs: ["training", "group_class"] },
];

interface DemoCatalog {
  services: typeof SALON_SERVICES;
  masters: typeof SALON_MASTERS;
  domainNoun: string; // "салон краси", "тенісний клуб", ...
  bookingNoun: string; // "запис", "бронювання"
}

function getDemoCatalog(cabinetId?: string): DemoCatalog {
  if (cabinetId === "demo-tennis-3") {
    return {
      services: TENNIS_SERVICES,
      masters: TENNIS_MASTERS,
      domainNoun: "тенісний клуб",
      bookingNoun: "бронювання корту / тренування",
    };
  }
  return {
    services: SALON_SERVICES,
    masters: SALON_MASTERS,
    domainNoun: "салон краси",
    bookingNoun: "запис",
  };
}

// Tools для LLM
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_services",
      description: "Знайти послуги салону за вільним запитом клієнта",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "пошуковий запит, напр. 'манікюр з покриттям'" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_slots",
      description:
        "Запропонувати 2-3 найближчих вільних слоти для обраних послуг. Викликати після того, як клієнт обрав послуги.",
      parameters: {
        type: "object",
        properties: {
          serviceIds: { type: "array", items: { type: "string" } },
          preference: {
            type: "string",
            description: "Часова перевага клієнта: 'morning', 'afternoon', 'evening', 'asap' або YYYY-MM-DD",
          },
        },
        required: ["serviceIds"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_draft",
      description:
        "Оновити чернетку запису. Викликати, коли клієнт підтвердив послугу, слот, або повідомив контакти.",
      parameters: {
        type: "object",
        properties: {
          serviceIds: { type: "array", items: { type: "string" } },
          masterId: { type: "string" },
          date: { type: "string", description: "YYYY-MM-DD" },
          startTime: { type: "string", description: "HH:MM" },
          clientName: { type: "string" },
          clientPhone: { type: "string" },
        },
      },
    },
  },
];

// ── Реалізації tools на сервері (демо) ─────────────────────────────────────
function execSearchServices({ query }: { query: string }, catalog: DemoCatalog) {
  const q = (query || "").toLowerCase();
  const matches = catalog.services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      q.split(/\s+/).some((w) => w.length > 2 && s.name.toLowerCase().includes(w)),
  ).slice(0, 5);
  return { results: matches };
}

function execProposeSlots(
  { serviceIds, preference }: { serviceIds: string[]; preference?: string },
  catalog: DemoCatalog,
) {
  const services = serviceIds
    .map((id) => catalog.services.find((s) => s.id === id))
    .filter(Boolean) as DemoCatalog["services"];
  if (services.length === 0) return { error: "no_services" };
  const duration = services.reduce((s, x) => s + x.durationMin, 0);
  const cats = new Set(services.map((s) => s.category));
  const masters = catalog.masters.filter((m) => [...cats].every((c) => m.specs.includes(c)));

  const slots: Array<{ date: string; startTime: string; masterId: string; masterName: string; durationMin: number }> = [];
  const today = new Date();
  const hourPrefMap: Record<string, number[]> = {
    morning: [10, 11, 12],
    afternoon: [13, 14, 15],
    evening: [17, 18, 19],
    asap: [11, 14, 17],
  };
  const hours = hourPrefMap[preference ?? "asap"] ?? hourPrefMap.asap;

  for (let d = 1; d <= 5 && slots.length < 6; d++) {
    const day = new Date(today);
    day.setDate(day.getDate() + d);
    const date = day.toISOString().slice(0, 10);
    for (const h of hours) {
      if (slots.length >= 6) break;
      const m = masters[(d + h) % Math.max(masters.length, 1)];
      if (!m) continue;
      slots.push({
        date,
        startTime: `${String(h).padStart(2, "0")}:00`,
        masterId: m.id,
        masterName: m.name,
        durationMin: duration,
      });
    }
  }
  return { slots: slots.slice(0, 3), totalPrice: services.reduce((s, x) => s + x.price, 0) };
}

function execSetDraft(args: Record<string, unknown>) {
  return { draftPatch: args };
}

function executeTool(name: string, args: Record<string, unknown>, catalog: DemoCatalog) {
  if (name === "search_services") return execSearchServices(args as { query: string }, catalog);
  if (name === "propose_slots") return execProposeSlots(args as { serviceIds: string[]; preference?: string }, catalog);
  if (name === "set_draft") return execSetDraft(args);
  return { error: "unknown_tool" };
}

// ── Rate limit (in-memory, демо) ───────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(key: string, max = 15, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (rateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  rateLimitMap.set(key, arr);
  return arr.length <= max;
}

// ── Main handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages = [], draft = {}, mode = "chat", cabinetId, brandName } = body;
    const venueName = (typeof brandName === "string" && brandName.trim()) || "наш заклад";
    const catalog = getDemoCatalog(cabinetId);

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${cabinetId}`)) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Ти — ввічливий україномовний AI-асистент закладу "${venueName}" (${catalog.domainNoun}).
Твоя мета — допомогти клієнту оформити ${catalog.bookingNoun}.
${mode === "voice" ? "ВАЖЛИВО: ти у голосовому режимі. Відповідай КОРОТКО — 1-2 речення максимум. Без markdown, без списків." : ""}

Правила:
- Поточна чернетка: ${JSON.stringify(draft)}.
- Спочатку зрозумій, яку послугу/ресурс хоче клієнт — викликай search_services.
- Коли визначено — викликай propose_slots з часовою преференцією (ранок/день/вечір) або конкретною датою.
- Запропонуй максимум 2-3 варіанти — не перевантажуй.
- Коли клієнт обрав слот — викликай set_draft з serviceIds, masterId, date, startTime.
- Збери імʼя і телефон (формат +380XXXXXXXXX). Підтверди фінальні дані словами.
- НЕ створюй сам запис — користувач натисне кнопку "Підтвердити".
- Якщо не впевнений — скажи "передам адміністратору" і запропонуй залишити телефон.
- Завжди українською. Без російської.
- В кінці відповіді можеш запропонувати 2-3 короткі підказки клієнту — оформи як рядок з "SUGGESTIONS: підказка1 | підказка2 | підказка3" (тільки в текстовому режимі).`;

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Цикл tool-calling: даємо моделі до 4 кроків
    let draftPatch: Record<string, unknown> = {};
    let finalReply = "";
    let suggestions: string[] = [];

    for (let iter = 0; iter < 4; iter++) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools: TOOLS,
        }),
      });

      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "ai_rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "ai_payment_required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("AI gateway error", aiResp.status, errText);
        throw new Error(`AI gateway ${aiResp.status}`);
      }

      const data = await aiResp.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;
      if (!msg) break;

      // Якщо модель повернула tool_calls — виконуємо
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        conversationMessages.push(msg);
        for (const tc of msg.tool_calls) {
          let parsedArgs: Record<string, unknown> = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments || "{}");
          } catch (e) {
            console.warn("tool args parse fail", e);
          }
          const result = executeTool(tc.function.name, parsedArgs, catalog);
          if (tc.function.name === "set_draft" && parsedArgs) {
            draftPatch = { ...draftPatch, ...parsedArgs };
          }
          conversationMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue; // ще ітерація щоб модель сформулювала відповідь
      }

      // Текстова відповідь
      finalReply = msg.content || "";
      // Витягуємо SUGGESTIONS: ... з тексту, якщо є
      const sugMatch = finalReply.match(/SUGGESTIONS:\s*(.+?)$/im);
      if (sugMatch) {
        suggestions = sugMatch[1]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 3);
        finalReply = finalReply.replace(/SUGGESTIONS:\s*.+$/im, "").trim();
      }
      break;
    }

    return new Response(
      JSON.stringify({
        reply: finalReply || "Перепрошую, не зрозуміла. Спробуйте ще раз.",
        draftPatch: Object.keys(draftPatch).length ? draftPatch : undefined,
        suggestions: suggestions.length ? suggestions : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("salon-booking-ai-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
