import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRequestFingerprint } from "../_shared/rate-limit.ts";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// ─── Tool registry (дублюємо з src/lib/analytics/aiToolSchemas.ts через Deno-обмеження імпортів) ───
const ANALYTICS_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "apply_analytics_filters",
      description:
        "Налаштувати фільтри аналітики кабінету (період, метрики, view, активна вкладка). Викликати коли користувач просить показати/проаналізувати конкретні дані.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["today", "week", "month", "quarter", "year", "custom"] },
          customRange: {
            type: "object",
            properties: { from: { type: "string" }, to: { type: "string" } },
          },
          viewMode: { type: "string", enum: ["table", "chart"] },
          metrics: { type: "array", items: { type: "string" } },
          analysisMode: { type: "string", enum: ["today", "period", "compare", "passive"] },
          compareBaseline: {
            type: "string",
            enum: ["previous_period", "previous_year", "custom"],
            description: "previous_period — попередній період такої ж тривалості; previous_year — той самий період торік (YoY); custom — власний діапазон через compareBaselineRange",
          },
          compareBaselineRange: {
            type: "object",
            properties: { from: { type: "string" }, to: { type: "string" } },
          },
          activeTab: { type: "string" },
          reasoning: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_cashflow_forecast",
      description:
        "Запит прогнозу cash flow на N днів. Викликати на 'чи вистачить грошей', 'що буде далі', 'прогноз залишку'.",
      parameters: {
        type: "object",
        required: ["horizonDays"],
        properties: {
          horizonDays: { type: "number", enum: [7, 30, 90] },
          includeUpcomingTaxes: { type: "boolean" },
          includeRecurringExpenses: { type: "boolean" },
          scenario: { type: "string", enum: ["base", "optimistic", "pessimistic"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_to_benchmark",
      description:
        "Порівняння метрики з бенчмарком. Викликати на 'порівняй', 'як у інших', 'краще/гірше ніж'.",
      parameters: {
        type: "object",
        required: ["metric", "benchmarkType"],
        properties: {
          metric: { type: "string" },
          benchmarkType: {
            type: "string",
            enum: ["market", "category", "previous_period", "year_over_year"],
          },
          period: { type: "string", enum: ["month", "quarter", "year"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explain_health_score",
      description:
        "Пояснити Health Score. Викликати на 'чому такий score', 'що покращити', 'слабкі місця'.",
      parameters: {
        type: "object",
        properties: {
          pillar: {
            type: "string",
            enum: ["liquidity", "compliance", "growth", "efficiency", "all"],
          },
          includeActionPlan: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_action",
      description:
        "Запропонувати дію користувачу (платіжка, нагадування, подія). НЕ виконує — лише пропозиція.",
      parameters: {
        type: "object",
        required: ["type", "title"],
        properties: {
          type: {
            type: "string",
            enum: ["payment_slip", "reminder", "calendar_event", "tax_report", "expense_log"],
          },
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string" },
          amount: { type: "number" },
          payload: { type: "object" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_clarification",
      description:
        "Уточнююче питання з варіантами. Викликати коли запит неоднозначний.",
      parameters: {
        type: "object",
        required: ["question", "options"],
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "value"],
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  // ─── L3 Cabinet Network Protocol tools ───
  {
    type: "function",
    function: {
      name: "list_my_places",
      description:
        "Фізособа: показати «Мої місця» — всі заклади, на каталог яких підписаний користувач (перукарня, тенісний клуб, ресторан тощо). Викликати на 'мої заклади', 'куди я ходжу', 'забронюй у моєму салоні'.",
      parameters: {
        type: "object",
        properties: {
          categoryKey: { type: "string", description: "Фільтр за категорією (salon, tennis_club, hotel, restaurant)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_place_catalog",
      description:
        "Отримати каталог послуг/товарів конкретного підписаного закладу. Викликати на 'що є у …', 'покажи меню/прайс', перед бронюванням.",
      parameters: {
        type: "object",
        required: ["placeId"],
        properties: {
          placeId: { type: "string", description: "id підписки (subscription) або slug закладу" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_at_place",
      description:
        "Створити бронювання/замовлення у підписаному закладі від імені фізособи. Викликати на 'забронюй', 'запиши на', 'замов'.",
      parameters: {
        type: "object",
        required: ["placeId"],
        properties: {
          placeId: { type: "string" },
          serviceCode: { type: "string", description: "Код послуги/SKU з каталогу" },
          when: { type: "string", description: "ISO datetime або фраза українською" },
          notes: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reorder_last",
      description:
        "Повторити останнє замовлення/візит у підписаному закладі. Викликати на 'як зазвичай', 'повтори минулий раз'.",
      parameters: {
        type: "object",
        required: ["placeId"],
        properties: {
          placeId: { type: "string" },
        },
      },
    },
  },
  // ─── L3: B2B tools для бізнес-кабінету ───
  {
    type: "function",
    function: {
      name: "list_subscribed_suppliers",
      description:
        "Бізнес: показати постачальників, на каталог яких підписаний цей кабінет. Викликати на 'мої постачальники', 'у кого замовити'.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_supplier_catalog",
      description:
        "Отримати каталог постачальника зі знижкою за тарифом цього кабінету. Викликати перед створенням закупівельного замовлення.",
      parameters: {
        type: "object",
        required: ["supplierId"],
        properties: {
          supplierId: { type: "string", description: "id підписки на постачальника" },
          search: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_purchase_order",
      description:
        "Створити чернетку замовлення постачальнику. Не відправляє — пропозиція на підтвердження користувачем.",
      parameters: {
        type: "object",
        required: ["supplierId", "lines"],
        properties: {
          supplierId: { type: "string" },
          lines: {
            type: "array",
            items: {
              type: "object",
              required: ["sku", "qty"],
              properties: {
                sku: { type: "string" },
                qty: { type: "number" },
                priceUah: { type: "number" },
              },
            },
          },
          notes: { type: "string" },
        },
      },
    },
  },
];

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const fingerprint = getRequestFingerprint(req);
    const allowed = await checkRateLimit(`cabinet-chat:${fingerprint}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Забагато запитів. Спробуйте через хвилину." }),
        { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const phase = url.searchParams.get("phase") ?? "chat"; // "analyst" | "chat"

    const body = await req.json();
    const { messages, analyticsContext, lastIntent, userPermissions } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dayNames = ["неділя","понеділок","вівторок","середа","четвер","п'ятниця","субота"];
    const today = new Date();
    const dateStr = today.toLocaleDateString("uk-UA");
    const dayName = dayNames[today.getDay()];

    // ─────────────────────────────────────────────────────────────
    // PHASE 1: ANALYST — повертає JSON з tool_calls (без streaming)
    // ─────────────────────────────────────────────────────────────
    if (phase === "analyst") {
      const analystPrompt = `
Ти — AI-аналітик-роутер кабінету Fintodo. Твоя задача: проаналізувати запит користувача
та викликати один або кілька з 6 інструментів для відповіді.

ПРАВИЛА ВИБОРУ ІНСТРУМЕНТА:
• "Покажи / проаналізуй / скільки за період" → apply_analytics_filters
• "Чи вистачить / прогноз / що буде далі" → query_cashflow_forecast
• "Порівняй / як у інших / краще ніж" → compare_to_benchmark
• "Чому Health Score / що покращити" → explain_health_score
• "Створи платіжку / нагадай / запиши" → propose_action
• Запит неоднозначний (не ясний період/тип) → ask_clarification

ПОРІВНЯННЯ (apply_analytics_filters → analysisMode="compare"):
• "vs минулий місяць/період" → compareBaseline="previous_period"
• "торік / vs минулий рік / YoY / рік до року" → compareBaseline="previous_year"
• "vs [конкретний діапазон]" → compareBaseline="custom" + compareBaselineRange
• Лише слово "порівняй" без уточнення → не задавай compareBaseline (буде дефолт)

КОНТЕКСТ:
• Сьогодні: ${dateStr}, ${dayName}
• Останній intent: ${lastIntent ?? "немає"}
• Permissions: ${JSON.stringify(userPermissions ?? { canViewSalaries: false })}
${analyticsContext ? `\nАНАЛІТИЧНИЙ КОНТЕКСТ:\n${analyticsContext}` : ""}

ВАЖЛИВО:
- ЗАВЖДИ викликай хоча б один інструмент через tool_calls.
- Якщо викликаєш apply_analytics_filters — додай коротке reasoning (1 речення).
- Якщо userPermissions.canViewSalaries=false — НЕ запитуй метрику "salaries".
- Можеш викликати кілька інструментів (наприклад apply_filters + propose_action).
`;

      const analystResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: analystPrompt },
            ...messages,
          ],
          tools: ANALYTICS_TOOL_DEFINITIONS,
          tool_choice: "auto",
        }),
      });

      if (!analystResp.ok) {
        if (analystResp.status === 429) {
          return new Response(JSON.stringify({ error: "Забагато запитів." }), {
            status: 429, headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        if (analystResp.status === 402) {
          return new Response(JSON.stringify({ error: "Вичерпано ліміт AI-запитів." }), {
            status: 402, headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        const t = await analystResp.text();
        console.error("Analyst phase error:", analystResp.status, t);
        return new Response(JSON.stringify({ error: "Помилка AI-аналізу" }), {
          status: 500, headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      const data = await analystResp.json();
      const choice = data.choices?.[0]?.message;
      const toolCalls = (choice?.tool_calls ?? []).map((tc: any) => ({
        name: tc.function?.name,
        args: (() => {
          try { return JSON.parse(tc.function?.arguments ?? "{}"); }
          catch { return {}; }
        })(),
      }));

      return new Response(
        JSON.stringify({ toolCalls, content: choice?.content ?? "" }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // PHASE 2: CHAT — streaming response з повним контекстом
    // ─────────────────────────────────────────────────────────────
    const rbacNote = userPermissions?.canViewSalaries === false
      ? "\n\nRBAC: Користувач НЕ має доступу до зарплат — НЕ розкривай конкретні суми зарплат, лише агрегати."
      : "";

    const systemPrompt = `
═══════════════════════════════════════════════════════
ТИ: FINTODO AI-АНАЛІТИК КАБІНЕТУ (Conversational BI)
═══════════════════════════════════════════════════════

ТВОЯ РОЛЬ:
Аналітик з ПОВНИМ ДОСТУПОМ до даних кабінету. Кожна відповідь спирається на реальні числа.

ПРАВИЛА:
1. ЗАВЖДИ посилайся на конкретні числа з аналітики (Health Score, KPI, ризики)
2. НЕ вигадуй дані — лише з контексту
3. Пропонуй конкретні дії на основі ризиків
4. Health Score < 70 → акцентуй на найслабшому pillar
5. Critical/warning ризики → починай з них
6. Markdown (заголовки, списки, жирний)
7. До 250 слів
8. Сьогодні ${dateStr}, ${dayName}
${rbacNote}

═══ КАЛЕНДАР І НАГАДУВАННЯ ═══
Якщо користувач просить нагадати/створити подію — додай у КІНЕЦЬ:

[CALENDAR_EVENT]
title: <назва>
event_at: <ISO 8601>
remind_before_minutes: <15|60|1440|10080>
notes: <опційно>
[/CALENDAR_EVENT]

ФОРМАТ:
- Insight (1-2 речення)
- Конкретні рекомендації з числами
- CTA
- (за потреби) [CALENDAR_EVENT]

${analyticsContext ? `\n══ АНАЛІТИЧНИЙ КОНТЕКСТ ══\n${analyticsContext}\n══════════════════════════` : "Аналітичний контекст не надано."}

Відповідай ТІЛЬКИ українською.`;

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
          status: 429, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Вичерпано ліміт AI-запитів." }), {
          status: 402, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Помилка AI сервісу" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...cors, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cabinet-chat error:", e);
    return new Response(JSON.stringify({ error: "Внутрішня помилка сервера" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
