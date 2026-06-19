import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const MODEL = "google/gemini-3-flash-preview";
  const SYSTEM_PROMPT_VERSION = "v1-2026-05";
  try {
    const { topic, type, audience, hub, keywords, brandVoice, tone, template, guardrails } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeLabels: Record<string, string> = {
      news: "новина", guide: "покроковий гайд", analysis: "аналітична стаття",
      review: "огляд/порівняння", digest: "дайджест", dps: "роз'яснення ДПС",
      change: "огляд змін у законодавстві", podcast: "текст для подкасту",
      video: "сценарій відео", consultation: "консультація",
    };
    const audienceLabels: Record<string, string> = {
      fop: "ФОП (фізичні особи-підприємці)", accountant: "бухгалтери",
      director: "керівники підприємств", personal: "фізичні особи",
    };

    const systemPrompt = `Ти — професійний автор українського фінансового порталу FINTODO.
Brand Voice: ${brandVoice || "Професійний, доступний, з конкретними цифрами та посиланнями на нормативні акти."}
Тон: ${tone === "friendly" ? "дружній та доступний" : tone === "formal" ? "офіційний та формальний" : "професійний але зрозумілий"}
Guardrails: ${guardrails || "Уникай політики, перевіряй факти, посилайся на офіційні джерела."}

Правила:
1. Пиши ВИКЛЮЧНО українською мовою
2. Використовуй markdown з блоками :::intro, :::container, :::conclusion
3. Додавай конкретні цифри, дати та суми де можливо
4. Посилайся на нормативні акти (номер, дата)
5. Структуруй текст: заголовки ##, підзаголовки ###, списки, таблиці
6. Мінімум 500 слів для статей, 300 для новин
7. Завжди додавай блок :::conclusion з практичними рекомендаціями`;

    const templateHint = template ? `\nВикористовуй структуру: ${template.join(" → ")}` : "";

    const userPrompt = `Напиши ${typeLabels[type] || "статтю"} на тему: "${topic}"
Аудиторія: ${audienceLabels[audience] || audience}
Хаб: ${hub}
Ключові слова: ${(keywords || []).join(", ")}${templateHint}

Поверни повний текст статті у markdown форматі.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No content in response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract a TL;DR from first paragraph
    const lines = content.split("\n").filter((l: string) => l.trim() && !l.startsWith("#") && !l.startsWith(":::"));
    const tldr = (lines[0] || topic).slice(0, 200);
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return new Response(JSON.stringify({
      content, tldr, wordCount,
      model: MODEL,
      systemPromptVersion: SYSTEM_PROMPT_VERSION,
      durationMs: Date.now() - startedAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
