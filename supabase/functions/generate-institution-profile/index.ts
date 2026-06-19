import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { name, description, url, types } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Назва установи обов'язкова (мін. 2 символи)" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Ти — експерт з українського фінансового ринку. Генеруй профілі фінансових установ українською мовою.
Заповнюй усі поля максимально реалістично. Якщо точних даних немає — генеруй правдоподібні.
ЄДРПОУ має бути 8 цифр. Рік заснування — реалістичний. Slug — латинкою через дефіс.
Колір логотипу — HEX. Ініціали — 2-3 літери з назви.`;

    const userPrompt = `Згенеруй повний профіль установи:
Назва: ${name.trim()}
${description ? `Опис: ${description}` : ""}
${url ? `Сайт: ${url}` : ""}
${types?.length ? `Типи послуг: ${types.join(", ")}` : ""}`;

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
        tools: [{
          type: "function",
          function: {
            name: "create_institution_profile",
            description: "Створити профіль фінансової установи",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Назва установи" },
                shortName: { type: "string" },
                legalName: { type: "string", description: "Повна юридична назва" },
                slug: { type: "string", description: "URL slug латинкою через дефіс" },
                types: { type: "array", items: { type: "string" }, description: "Типи послуг: банк, страхова, МФО тощо" },
                website: { type: "string" },
                logo: {
                  type: "object",
                  properties: {
                    initials: { type: "string", description: "2-3 літери" },
                    color: { type: "string", description: "HEX колір" },
                  },
                  required: ["initials", "color"],
                },
                legal: {
                  type: "object",
                  properties: {
                    edrpou: { type: "string", description: "8-значний ЄДРПОУ" },
                    legalForm: { type: "string" },
                    registrationNumber: { type: "string" },
                    registrationDate: { type: "string" },
                    registrationOrgan: { type: "string" },
                    legalAddress: { type: "string" },
                    actualAddress: { type: "string" },
                    regulators: { type: "array", items: { type: "string" } },
                    taxStatus: { type: "string" },
                    status: { type: "string", enum: ["active", "reorganizing", "liquidation", "bankrupt"] },
                  },
                  required: ["edrpou", "legalForm", "status"],
                },
                company: {
                  type: "object",
                  properties: {
                    foundedYear: { type: "number" },
                    foundedCity: { type: "string" },
                    story: { type: "string", description: "Коротка історія 2-3 речення" },
                    headquarters: { type: "string" },
                    employeesCount: { type: "string" },
                    publiclyTraded: { type: "boolean" },
                  },
                  required: ["foundedYear", "headquarters"],
                },
                contacts: {
                  type: "object",
                  properties: {
                    address: { type: "string" },
                    city: { type: "string" },
                    country: { type: "string" },
                    phones: { type: "array", items: { type: "string" } },
                    emails: { type: "array", items: { type: "string" } },
                    supportPhone: { type: "string" },
                    supportEmail: { type: "string" },
                    is247: { type: "boolean" },
                    workingHours: { type: "string" },
                    telegram: { type: "string" },
                    facebook: { type: "string" },
                    instagram: { type: "string" },
                  },
                  required: ["address", "city"],
                },
                editorial: {
                  type: "object",
                  properties: {
                    oneLiner: { type: "string", description: "Одне речення — суть установи" },
                    shortTake: { type: "string", description: "2-3 речення коротко" },
                  },
                  required: ["oneLiner"],
                },
              },
              required: ["name", "slug", "types", "logo", "legal", "company", "contacts"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_institution_profile" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Перевищено ліміт запитів. Спробуйте через хвилину." }), {
          status: 429, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Недостатньо кредитів AI. Поповніть баланс." }), {
          status: 402, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const profile = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ profile }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-institution-profile error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Невідома помилка" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
