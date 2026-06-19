// CMS AI Agent — streaming chat with tools for content management
// Phase 2: navigation + content_ideas + consultations CRUD with human-in-the-loop
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "npm:ai@^6.0.185";
import { z } from "npm:zod@^3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getRequestFingerprint } from "../_shared/rate-limit.ts";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const SYSTEM_PROMPT = `Ти — FINTODO AI-редактор контенту. Ти працюєш у CMS-консолі та допомагаєш адміну керувати статтями (консультаціями), ідеями, налаштуваннями та публікаціями.

Що ти вмієш:
- Навігація прев'ю (navigation_go).
- Банк ідей: content_ideas_list, content_ideas_create, content_ideas_update_status.
- Статті-консультації: consultations_list, consultations_get, consultations_update_field, consultations_publish_toggle.
- Генерація нової статті-консультації як чернетки (articles_generate) — потребує підтвердження.
- Налаштування CMS: cms_settings_get, cms_settings_set (наприклад, key="webhook_url" — POST на події публікації).
- Загальний зріз: cms_overview.

ПРАВИЛА:
1. Відповідай українською, стисло (2–6 речень + список за потреби).
2. Markdown: жирний для назв, списки, інлайн-код для шляхів типу \`/overview\` і slug'ів.
3. Перед мутацією (update_field, publish_toggle, settings_set, articles_generate) — стисло опиши намір і виклич тулзу. UI попросить підтвердження.
4. «Знайди статтю» → consultations_list (фільтри query/audience/status).
5. Не вигадуй ID/slug — опирайся на результат тулзів.
6. Якщо 0 рядків — кажи це чесно і пропонуй наступний крок.
7. Для articles_generate спершу запропонуй тему і audience у відповіді, потім виклич тулзу — користувач підтвердить.`;

interface RequestBody {
  messages?: UIMessage[];
  threadId?: string;
  currentPath?: string;
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email ?? null;

    const { data: isAdminData } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdminData) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const fp = getRequestFingerprint(req);
    const ok = await checkRateLimit(`cms-agent:${userId}:${fp}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const threadId = body.threadId;
    const currentPath = body.currentPath ?? "/";

    if (!threadId) {
      return new Response(JSON.stringify({ error: "threadId is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data: thread, error: threadErr } = await supabase
      .from("cms_chat_threads")
      .select("id, user_id, title")
      .eq("id", threadId)
      .maybeSingle();
    if (threadErr || !thread || thread.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);
    const model = gateway("google/gemini-3-flash-preview");

    const CONSULTATION_FIELDS = [
      "question",
      "answer",
      "seo_title",
      "seo_description",
      "status",
    ] as const;

    // Fire-and-forget webhook on CMS events (URL stored in cms_settings.webhook_url).
    const fireWebhook = async (event: string, payload: Record<string, unknown>) => {
      try {
        const { data: row } = await supabase
          .from("cms_settings")
          .select("value")
          .eq("scope", "global")
          .eq("key", "webhook_url")
          .maybeSingle();
        const url = typeof row?.value === "string" ? row.value : (row?.value as { url?: string } | null)?.url;
        if (!url || !/^https?:\/\//.test(url)) return;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            at: new Date().toISOString(),
            actor: { id: userId, email: userEmail },
            ...payload,
          }),
        }).catch(() => undefined);
      } catch {
        /* swallow — webhooks must not break tool flow */
      }
    };

    // --- Tool registry ---
    const tools = {
      navigation_go: tool({
        description: "Навігація прев'ю CMS до заданої сторінки сайту.",
        inputSchema: z.object({
          path: z.string().describe("URL-шлях сторінки, напр. /overview"),
          reason: z.string().optional(),
        }),
        execute: async ({ path }) => ({ ok: true, navigated_to: path }),
      }),

      cms_overview: tool({
        description: "Загальний зріз CMS: ідеї, опубліковані консультації.",
        inputSchema: z.object({}),
        execute: async () => {
          const [ideasRes, consRes] = await Promise.all([
            supabase
              .from("content_ideas")
              .select("status, source, created_at, title")
              .order("created_at", { ascending: false })
              .limit(50),
            supabase
              .from("consultations")
              .select("status")
              .limit(500),
          ]);
          const byStatus: Record<string, number> = {};
          (ideasRes.data ?? []).forEach((i: { status: string }) => {
            byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
          });
          const consByStatus: Record<string, number> = {};
          (consRes.data ?? []).forEach((c: { status: string }) => {
            consByStatus[c.status] = (consByStatus[c.status] ?? 0) + 1;
          });
          return {
            ideas_total: ideasRes.data?.length ?? 0,
            ideas_by_status: byStatus,
            consultations_total: consRes.data?.length ?? 0,
            consultations_by_status: consByStatus,
            recent_ideas: (ideasRes.data ?? []).slice(0, 5).map((i: { title: string; status: string }) => ({
              title: i.title,
              status: i.status,
            })),
          };
        },
      }),

      content_ideas_list: tool({
        description: "Список ідей контенту з фільтрами.",
        inputSchema: z.object({
          status: z.enum(["todo", "generating", "generated", "published", "dismissed"]).optional(),
          audience: z.enum(["business", "individual", "fop"]).optional(),
          source: z.enum(["ai_chat_query", "seo_gap", "manual", "ai_suggested"]).optional(),
          page_path: z.string().optional(),
          limit: z.number().int().min(1).max(50).default(10),
        }),
        execute: async ({ status, audience, source, page_path, limit }) => {
          let q = supabase
            .from("content_ideas")
            .select("id, page_path, title, description, status, audience, source, priority, created_at")
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(limit);
          if (status) q = q.eq("status", status);
          if (audience) q = q.eq("audience", audience);
          if (source) q = q.eq("source", source);
          if (page_path) q = q.eq("page_path", page_path);
          const { data, error } = await q;
          if (error) return { ok: false, error: error.message };
          return { ok: true, count: data?.length ?? 0, ideas: data ?? [] };
        },
      }),

      content_ideas_create: tool({
        description: "Створити нову ідею контенту.",
        inputSchema: z.object({
          page_path: z.string(),
          title: z.string().min(3).max(200),
          description: z.string().optional(),
          audience: z.enum(["business", "individual", "fop"]).default("business"),
          content_target: z.enum(["article", "page-section", "none"]).default("article"),
          priority: z.number().int().min(1).max(5).default(3),
          tags: z.array(z.string()).default([]),
        }),
        execute: async (input) => {
          const { data, error } = await supabase
            .from("content_ideas")
            .insert({
              page_path: input.page_path,
              title: input.title,
              description: input.description ?? null,
              audience: input.audience,
              content_target: input.content_target,
              priority: input.priority,
              tags: input.tags,
              source: "ai_suggested",
              status: "todo",
              created_by: userId,
            })
            .select("id, title, page_path, status")
            .single();
          if (error) return { ok: false, error: error.message };
          return { ok: true, idea: data };
        },
      }),

      content_ideas_update_status: tool({
        description: "Оновити статус ідеї.",
        inputSchema: z.object({
          id: z.string().uuid(),
          status: z.enum(["todo", "generating", "generated", "published", "dismissed"]),
        }),
        execute: async ({ id, status }) => {
          const { data, error } = await supabase
            .from("content_ideas")
            .update({ status })
            .eq("id", id)
            .select("id, title, status")
            .single();
          if (error) return { ok: false, error: error.message };
          return { ok: true, idea: data };
        },
      }),

      consultations_list: tool({
        description: "Список статей-консультацій з фільтрами (повертає до 20).",
        inputSchema: z.object({
          query: z.string().optional().describe("Пошук по question/slug (ilike)"),
          audience: z.enum(["business", "individual", "fop"]).optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          limit: z.number().int().min(1).max(20).default(10),
        }),
        execute: async ({ query, audience, status, limit }) => {
          let q = supabase
            .from("consultations")
            .select("id, slug, question, audience, status, views_count, published_at")
            .order("published_at", { ascending: false, nullsFirst: false })
            .limit(limit);
          if (audience) q = q.eq("audience", audience);
          if (status) q = q.eq("status", status);
          if (query) q = q.or(`question.ilike.%${query}%,slug.ilike.%${query}%`);
          const { data, error } = await q;
          if (error) return { ok: false, error: error.message };
          return { ok: true, count: data?.length ?? 0, consultations: data ?? [] };
        },
      }),

      consultations_get: tool({
        description: "Повний об'єкт консультації за slug.",
        inputSchema: z.object({ slug: z.string() }),
        execute: async ({ slug }) => {
          const { data, error } = await supabase
            .from("consultations")
            .select("id, slug, question, answer, audience, tags, status, seo_title, seo_description, seo_keywords, views_count, published_at, created_at")
            .eq("slug", slug)
            .maybeSingle();
          if (error) return { ok: false, error: error.message };
          if (!data) return { ok: false, error: "not_found" };
          return { ok: true, consultation: data };
        },
      }),

      consultations_update_field: tool({
        description: "Оновити одне поле консультації. Потребує підтвердження користувача (Human-in-the-Loop).",
        inputSchema: z.object({
          slug: z.string(),
          field: z.enum(CONSULTATION_FIELDS),
          new_value: z.string().describe("Нове значення поля (для status: draft/published/archived)"),
          reason: z.string().optional().describe("Чому ця зміна — коротко"),
        }),
        needsApproval: true,
        execute: async ({ slug, field, new_value }) => {
          const { data: row, error: getErr } = await supabase
            .from("consultations")
            .select(`id, ${field}`)
            .eq("slug", slug)
            .maybeSingle();
          if (getErr || !row) return { ok: false, error: getErr?.message ?? "not_found" };
          const before = (row as Record<string, unknown>)[field];

          const { error: updErr } = await supabase
            .from("consultations")
            .update({ [field]: new_value })
            .eq("slug", slug);
          if (updErr) return { ok: false, error: updErr.message };

          await supabase.from("article_revisions").insert({
            article_slug: slug,
            field,
            before_value: before == null ? null : String(before),
            after_value: new_value,
            author_id: userId,
            author_email: userEmail,
            source: "ai_cms",
          });

          return { ok: true, slug, field, before, after: new_value };
        },
      }),

      consultations_publish_toggle: tool({
        description: "Перемикнути статус публікації консультації (draft ↔ published). Потребує підтвердження.",
        inputSchema: z.object({
          slug: z.string(),
          target_status: z.enum(["draft", "published", "archived"]),
        }),
        needsApproval: true,
        execute: async ({ slug, target_status }) => {
          const patch: Record<string, unknown> = { status: target_status };
          if (target_status === "published") patch.published_at = new Date().toISOString();

          const { data: row } = await supabase
            .from("consultations")
            .select("status")
            .eq("slug", slug)
            .maybeSingle();
          const before = row?.status ?? null;

          const { error } = await supabase
            .from("consultations")
            .update(patch)
            .eq("slug", slug);
          if (error) return { ok: false, error: error.message };

          await supabase.from("article_revisions").insert({
            article_slug: slug,
            field: "status",
            before_value: before,
            after_value: target_status,
            author_id: userId,
            author_email: userEmail,
            source: "ai_cms",
          });

          if (target_status === "published" && before !== "published") {
            await fireWebhook("consultation.published", { slug, from: before });
          } else if (target_status !== before) {
            await fireWebhook("consultation.status_changed", { slug, from: before, to: target_status });
          }

          return { ok: true, slug, from: before, to: target_status };
        },
      }),

      cms_settings_get: tool({
        description: "Прочитати глобальні налаштування CMS (key/value JSON).",
        inputSchema: z.object({
          key: z.string().optional(),
        }),
        execute: async ({ key }) => {
          let q = supabase.from("cms_settings").select("key, value, updated_at").eq("scope", "global");
          if (key) q = q.eq("key", key);
          const { data, error } = await q;
          if (error) return { ok: false, error: error.message };
          return { ok: true, settings: data ?? [] };
        },
      }),

      cms_settings_set: tool({
        description: "Зберегти/оновити налаштування CMS (upsert по key). Потребує підтвердження.",
        inputSchema: z.object({
          key: z.string().min(1).max(100),
          value: z.unknown().describe("JSON-значення (об'єкт, рядок, число, масив)"),
        }),
        needsApproval: true,
        execute: async ({ key, value }) => {
          const { error } = await supabase
            .from("cms_settings")
            .upsert(
              { key, value: value as never, scope: "global", updated_by: userId },
              { onConflict: "key" },
            );
          if (error) return { ok: false, error: error.message };
          return { ok: true, key, value };
        },
      }),

      articles_generate: tool({
        description: "Згенерувати нову статтю-консультацію (markdown answer) як чернетку. Потребує підтвердження користувача. Створює запис у consultations зі статусом 'draft'.",
        inputSchema: z.object({
          question: z.string().min(10).max(300).describe("Питання-заголовок статті"),
          audience: z.enum(["business", "individual", "fop"]).default("business"),
          slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/).describe("URL-slug (kebab-case)"),
          outline: z.string().optional().describe("Короткий план/конспект (буде розгорнуто моделлю)"),
          tags: z.array(z.string()).default([]),
        }),
        needsApproval: true,
        execute: async ({ question, audience, slug, outline, tags }) => {
          const { data: existing } = await supabase
            .from("consultations")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          if (existing) return { ok: false, error: `slug_exists: ${slug}` };

          const draftPrompt = `Згенеруй markdown-відповідь на питання для FINTODO ${audience === "business" ? "бізнес-аудиторії" : audience === "fop" ? "ФОП" : "фізосіб"} в Україні (квітень 2026).

Питання: ${question}

${outline ? `План: ${outline}\n\n` : ""}Вимоги:
- 400–700 слів, structured markdown (## заголовки, списки, **жирний**).
- Без вигаданих сум/норм. Якщо не впевнений — позначай «уточнюй у консультанта».
- В кінці — секція "## Що робити" з 3–5 кроками.`;

          let answer = "_(генерація не вдалася)_";
          try {
            const gen = await generateText({ model, prompt: draftPrompt });
            if (gen.text?.trim()) answer = gen.text.trim();
          } catch (e) {
            console.error("[articles_generate] generation error", e);
          }

          const seoTitle = question.slice(0, 60);
          const seoDescription = answer.replace(/[#*`_>-]/g, "").slice(0, 155);

          const { data: ins, error: insErr } = await supabase
            .from("consultations")
            .insert({
              question,
              answer,
              audience,
              slug,
              status: "draft",
              tags,
              seo_title: seoTitle,
              seo_description: seoDescription,
            })
            .select("id, slug, status")
            .single();
          if (insErr) return { ok: false, error: insErr.message };

          await supabase.from("article_revisions").insert({
            article_slug: slug,
            field: "created",
            before_value: null,
            after_value: `draft (${answer.length} chars)`,
            author_id: userId,
            author_email: userEmail,
            source: "ai_cms",
          });

          return { ok: true, consultation: ins, preview: answer.slice(0, 300) };
        },
      }),

      consultations_bulk_publish: tool({
        description: "Масово опублікувати декілька консультацій-чернеток за списком slug. Потребує підтвердження.",
        inputSchema: z.object({
          slugs: z.array(z.string()).min(1).max(20).describe("Список slug консультацій для публікації"),
        }),
        needsApproval: true,
        execute: async ({ slugs }) => {
          const now = new Date().toISOString();
          const { data: before } = await supabase
            .from("consultations")
            .select("slug, status")
            .in("slug", slugs);
          const beforeMap = new Map((before ?? []).map((r) => [r.slug, r.status]));

          const { data: updated, error } = await supabase
            .from("consultations")
            .update({ status: "published", published_at: now })
            .in("slug", slugs)
            .eq("status", "draft")
            .select("slug");
          if (error) return { ok: false, error: error.message };

          const publishedSlugs = (updated ?? []).map((r) => r.slug);
          if (publishedSlugs.length > 0) {
            await supabase.from("article_revisions").insert(
              publishedSlugs.map((s) => ({
                article_slug: s,
                field: "status",
                before_value: beforeMap.get(s) ?? null,
                after_value: "published",
                author_id: userId,
                author_email: userEmail,
                source: "ai_cms_bulk",
              })),
            );
          }

          if (publishedSlugs.length > 0) {
            await fireWebhook("consultations.bulk_published", { slugs: publishedSlugs });
          }

          const skipped = slugs.filter((s) => !publishedSlugs.includes(s));
          return { ok: true, published_count: publishedSlugs.length, published: publishedSlugs, skipped };
        },
      }),

      consultations_bulk_seo_refresh: tool({
        description: "Перегенерувати SEO-title/description для статей з порожніми SEO-полями (на основі question + answer). Потребує підтвердження.",
        inputSchema: z.object({
          limit: z.number().int().min(1).max(20).default(5),
        }),
        needsApproval: true,
        execute: async ({ limit }) => {
          const { data: rows, error } = await supabase
            .from("consultations")
            .select("slug, question, answer, seo_title, seo_description")
            .or("seo_title.is.null,seo_description.is.null")
            .limit(limit);
          if (error) return { ok: false, error: error.message };
          if (!rows || rows.length === 0) return { ok: true, updated: [], message: "Немає статей із порожнім SEO" };

          const updated: { slug: string; seo_title: string; seo_description: string }[] = [];
          for (const r of rows) {
            const title = (r.seo_title ?? r.question ?? "").slice(0, 60);
            const desc =
              r.seo_description ??
              (r.answer ?? "").replace(/[#*`_>-]/g, "").replace(/\s+/g, " ").trim().slice(0, 155);
            const { error: updErr } = await supabase
              .from("consultations")
              .update({ seo_title: title, seo_description: desc })
              .eq("slug", r.slug);
            if (!updErr) updated.push({ slug: r.slug, seo_title: title, seo_description: desc });
          }
          return { ok: true, count: updated.length, updated };
        },
      }),
    };

    const systemMessage = `${SYSTEM_PROMPT}\n\nКОНТЕКСТ:\n- Активна сторінка прев'ю: \`${currentPath}\`\n- Поточна дата: ${new Date().toISOString().slice(0, 10)}`;

    const result = streamText({
      model,
      system: systemMessage,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(50),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: { ...cors },
      onFinish: async ({ messages: finalMessages }) => {
        try {
          const lastUser = [...messages].reverse().find((m) => m.role === "user");
          const lastAssistant = finalMessages[finalMessages.length - 1];

          const rows: { thread_id: string; role: string; parts: unknown }[] = [];
          if (lastUser) {
            rows.push({ thread_id: threadId, role: "user", parts: lastUser.parts ?? [] });
          }
          if (lastAssistant && lastAssistant.role === "assistant") {
            rows.push({ thread_id: threadId, role: "assistant", parts: lastAssistant.parts ?? [] });
          }
          if (rows.length > 0) {
            const { error: insErr } = await supabase.from("cms_chat_messages").insert(rows);
            if (insErr) console.error("[cms-agent] insert messages error", insErr);
          }

          if (!thread.title && lastUser) {
            const text = (lastUser.parts ?? [])
              .filter((p: { type?: string }) => p.type === "text")
              .map((p: { text?: string }) => p.text ?? "")
              .join(" ")
              .trim()
              .slice(0, 80);
            if (text) {
              await supabase.from("cms_chat_threads").update({ title: text }).eq("id", threadId);
            }
          } else {
            await supabase.from("cms_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
          }
        } catch (e) {
          console.error("[cms-agent] onFinish error", e);
        }
      },
    });
  } catch (e) {
    console.error("[cms-agent] fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
