import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", claimsData.claims.sub);

    const { rows, currentLabel, previousLabel, cabinetType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a concise metrics summary for the prompt
    const metricsSummary = (rows || [])
      .map((r: any) => {
        const sign = r.deltaPercent > 0 ? "+" : "";
        return `${r.metric}: ${r.currentValue} (було ${r.previousValue}, ${sign}${r.deltaPercent}%)`;
      })
      .join("\n");

    const cabinetContext = cabinetType === "fop"
      ? "ФОП (фізична особа-підприємець, Україна)"
      : cabinetType === "tov"
        ? "ТОВ (товариство з обмеженою відповідальністю, Україна)"
        : "бізнес в Україні";

    const systemPrompt = `Ти — фінансовий аналітик для ${cabinetContext}. Аналізуй зміни між двома періодами. Відповідай українською, лаконічно, конкретно. Не повторюй числа — фокусуйся на причинах і рекомендаціях.`;

    const userPrompt = `Порівняння: "${currentLabel}" vs "${previousLabel}"\n\n${metricsSummary}\n\nДай структурований аналіз.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "provide_analysis",
              description: "Structured financial period comparison analysis",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "1-2 речення: основний тренд" },
                  highlights: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 ключові спостереження",
                  },
                  recommendation: { type: "string", description: "Конкретна рекомендація" },
                },
                required: ["summary", "highlights", "recommendation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Перевищено ліміт запитів. Спробуйте пізніше." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Недостатньо кредитів AI. Поповніть баланс." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Помилка AI-сервісу" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return raw content
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ summary: content, highlights: [], recommendation: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analytics-ai-comment error:", e);
    return new Response(JSON.stringify({ error: "Внутрішня помилка сервера" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
