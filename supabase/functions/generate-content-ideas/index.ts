import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pagePath, pageContext } = await req.json();
    if (!pagePath || typeof pagePath !== "string" || pagePath.length > 200) {
      return new Response(JSON.stringify({ error: "invalid pagePath" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth: require admin
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userRes } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull recent uncovered chat queries
    const { data: queries } = await supabase
      .from("ai_chat_queries").select("question, audience, tags, id")
      .order("created_at", { ascending: false }).limit(15);

    // Existing ideas to avoid dupes
    const { data: existing } = await supabase
      .from("content_ideas").select("title").eq("page_path", pagePath);
    const existingTitles = new Set((existing ?? []).map((e: { title: string }) => e.title.toLowerCase()));

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Ти — продуктовий контент-стратег FINTODO. Пропонуй ідеї статей, які закривають реальні запити користувачів.
Поверни ВИКЛЮЧНО валідний JSON масив із 5 об'єктів виду:
[{"title":"...","description":"...","audience":"business|individual|fop","tags":["t1","t2"],"priority":1-5}]
Без жодного тексту до або після JSON.`;

    const userPrompt = `Сторінка: ${pageContext?.title || pagePath} (${pagePath})
Категорія: ${pageContext?.category || "—"}
Опис: ${pageContext?.description || "—"}

Останні запити користувачів у чаті (українською):
${(queries ?? []).slice(0, 10).map((q: { question: string }) => `- ${q.question}`).join("\n") || "(порожньо)"}

Запропонуй 5 ідей контенту для цієї сторінки. Уникай дублів цих заголовків:
${[...existingTitles].slice(0, 20).join("; ") || "(немає)"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t.slice(0, 200) }), {
        status: aiRes.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const aiJson = await aiRes.json();
    const text: string = aiJson.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    let ideas: Array<{ title: string; description?: string; audience?: string; tags?: string[]; priority?: number }> = [];
    if (match) {
      try { ideas = JSON.parse(match[0]); } catch { /* ignore */ }
    }
    if (!Array.isArray(ideas) || ideas.length === 0) {
      return new Response(JSON.stringify({ error: "AI returned no parseable ideas", raw: text.slice(0, 300) }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = ideas
      .filter((i) => i?.title && !existingTitles.has(i.title.toLowerCase()))
      .slice(0, 5)
      .map((i) => ({
        page_path: pagePath,
        title: String(i.title).slice(0, 250),
        description: i.description ? String(i.description).slice(0, 600) : null,
        content_target: pageContext?.contentTarget === "page-section" ? "page-section" : "article",
        audience: ["business", "individual", "fop"].includes(i.audience ?? "") ? i.audience : "business",
        tags: Array.isArray(i.tags) ? i.tags.slice(0, 8).map((t) => String(t).slice(0, 40)) : [],
        priority: Math.max(1, Math.min(5, Number(i.priority) || 3)),
        status: "todo",
        source: "ai_suggested",
        created_by: userRes.user.id,
      }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await supabase.from("content_ideas").insert(rows);
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, created: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content-ideas error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
