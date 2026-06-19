import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  actorRole?: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}

interface TimelineData {
  entries: AuditEntry[];
  documentType: string;
  milestoneActions: string[];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { entries, documentType, milestoneActions }: TimelineData = await req.json();
    
    // Validate input size to prevent abuse
    if (!entries || !Array.isArray(entries)) {
      return new Response(
        JSON.stringify({ error: "Invalid entries format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (entries.length > 500) {
      return new Response(
        JSON.stringify({ error: "Too many entries (max 500)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Processing timeline summary for", entries.length, "entries");

    // Prepare timeline data for AI
    const timelineContext = entries.map(e => ({
      action: e.action,
      timestamp: e.timestamp,
      actor: e.actor,
      role: e.actorRole,
      isMilestone: milestoneActions.includes(e.action),
      fieldChange: e.fieldName ? {
        field: e.fieldName,
        from: e.previousValue,
        to: e.newValue
      } : null,
    }));

    const systemPrompt = `Ти — помічник для аналізу документообігу українською мовою.
Проаналізуй timeline документа та виклич функцію generate_summary з результатами:
1. Короткий огляд (1-2 речення): скільки етапів пройдено, загальний час від створення до останньої дії
2. Ключові highlights: важливі події, затримки, зміни сум чи ключових полів
3. Рекомендації (якщо є проблеми або потенційні ризики)

Тип документа: ${documentType || "Документ"}
Milestone дії (ключові етапи): ${milestoneActions.join(", ")}

Відповідай ТІЛЬКИ українською мовою. Будь конкретним та лаконічним.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(timelineContext) }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_summary",
              description: "Generate a structured timeline summary in Ukrainian",
              parameters: {
                type: "object",
                properties: {
                  summary: { 
                    type: "string", 
                    description: "Короткий огляд документа (1-2 речення)" 
                  },
                  highlights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ключові моменти (2-4 пункти)"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Рекомендації якщо є проблеми (0-2 пункти)"
                  }
                },
                required: ["summary", "highlights", "recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_summary" } },
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
        return new Response(JSON.stringify({ error: "Необхідно поповнити баланс." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_summary") {
      throw new Error("Invalid AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Timeline AI summary error:", error);
    return new Response(
      JSON.stringify({ error: "Внутрішня помилка сервера" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
