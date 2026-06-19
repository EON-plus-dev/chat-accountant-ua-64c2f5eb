import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, content, brandVoice, checks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const enabledChecks = Object.entries(checks || {})
      .filter(([, v]) => v)
      .map(([k]) => k);

    const checkDescriptions: Record<string, string> = {
      brandVoice: "Brand Voice — відповідність тону та стилю бренду FINTODO",
      uniqueness: "Унікальність — чи не повторює існуючий контент, оригінальність формулювань",
      facts: "Факти — достовірність цифр, дат, посилань на нормативні акти",
      seo: "SEO — наявність ключових слів, структура заголовків, meta-оптимізація",
      structure: "Структура — використання :::intro, :::container, :::conclusion блоків, таблиці, списки",
    };

    const systemPrompt = `Ти — AI-редактор українського фінансового порталу FINTODO.
Brand Voice порталу: ${brandVoice || "Професійний, доступний, з конкретними цифрами."}

Твоє завдання — перевірити якість статті за заданими критеріями та надати об'єктивну оцінку.
Будь суворим але справедливим. Оцінюй реальну якість контенту.`;

    const userPrompt = `Перевір цю статтю за наступними критеріями:
${enabledChecks.map(c => `- ${checkDescriptions[c] || c}`).join("\n")}

Заголовок: ${title}
Контент (перші 3000 символів):
${(content || "").slice(0, 3000)}`;

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
              name: "verify_article",
              description: "Return verification scores and recommendations for the article",
              parameters: {
                type: "object",
                properties: {
                  brandVoiceScore: { type: "number", description: "Brand voice compliance score 0-100" },
                  uniquenessScore: { type: "number", description: "Content uniqueness score 0-100" },
                  structureScore: { type: "number", description: "Article structure quality score 0-100" },
                  factsScore: { type: "number", description: "Factual accuracy score 0-100" },
                  seoScore: { type: "number", description: "SEO optimization score 0-100" },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific improvement recommendations in Ukrainian",
                  },
                  verdict: { type: "string", description: "Overall verdict in Ukrainian, 1-2 sentences" },
                },
                required: ["brandVoiceScore", "uniquenessScore", "structureScore", "factsScore", "seoScore", "recommendations", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_article" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted", code: "PAYMENT_REQUIRED" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI verification failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = JSON.parse(toolCall.function.arguments);

    // Compute overall score
    const scores = [
      checks?.brandVoice ? data.brandVoiceScore : 100,
      checks?.uniqueness ? data.uniquenessScore : 100,
      checks?.structure ? data.structureScore : 100,
      checks?.facts ? data.factsScore : 100,
      checks?.seo ? data.seoScore : 100,
    ];
    const overallScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    const decision = overallScore >= 85 ? "approve" : overallScore >= 65 ? "revise" : "reject";
    const status = overallScore >= 85 ? "passed" : overallScore >= 65 ? "warnings" : "failed";

    return new Response(JSON.stringify({
      ...data,
      overallScore,
      decision,
      status,
      checkedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
