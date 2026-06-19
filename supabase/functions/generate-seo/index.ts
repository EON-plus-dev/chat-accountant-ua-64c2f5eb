import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, content, tldr, type, audience } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const textSnippet = (content || tldr || "").slice(0, 1500);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Ти — SEO-спеціаліст для українського фінансового порталу FINTODO. Генеруй SEO-метадані українською мовою.`,
          },
          {
            role: "user",
            content: `Згенеруй SEO для контенту:
Тип: ${type || "article"}
Аудиторія: ${audience || "ФОП та фізособи"}
Заголовок: ${title}
Зміст: ${textSnippet}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_seo",
              description: "Generate SEO metadata for Ukrainian financial content",
              parameters: {
                type: "object",
                properties: {
                  seoTitle: {
                    type: "string",
                    description: "SEO title, max 60 chars, Ukrainian, with keywords",
                  },
                  seoDescription: {
                    type: "string",
                    description: "Meta description, max 155 chars, Ukrainian, with CTA",
                  },
                  slug: {
                    type: "string",
                    description: "URL slug in Latin transliteration, lowercase, hyphens only",
                  },
                },
                required: ["seoTitle", "seoDescription", "slug"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_seo" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const seoData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-seo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
