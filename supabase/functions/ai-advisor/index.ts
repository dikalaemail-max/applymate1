import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, applications, scholarshipContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("AI Advisor request, mode:", mode);

    let body: any;

    if (mode === "dashboard") {
      const summary = (applications || []).map((a: any) =>
        `- "${a.name}" | Status: ${a.status} | Deadline: ${a.deadline || "none"} | Amount: ${a.amount ? "$" + a.amount : "N/A"} | Notes: ${a.notes ? "yes" : "no"}`
      ).join("\n");

      body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are ApplyMate's AI Advisor. Analyze the user's scholarship/application portfolio and give brief, actionable strategic advice in 2-4 sentences. Focus on: upcoming deadlines, priority applications, missing information, and next steps. Be encouraging but practical. If there are no applications, encourage the user to add some.`,
          },
          {
            role: "user",
            content: applications?.length
              ? `Here are my current applications:\n${summary}\n\nToday's date: ${new Date().toISOString().split("T")[0]}. What should I focus on?`
              : "I don't have any applications yet. What should I do?",
          },
        ],
      };
    } else if (mode === "checklist") {
      body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are ApplyMate's AI assistant. Generate a practical checklist of tasks for a scholarship application. Return tasks using the suggest_tasks tool.",
          },
          {
            role: "user",
            content: `Generate a checklist for this application:\n- Name: ${scholarshipContext?.name || "Unknown"}\n- Organization: ${scholarshipContext?.organization || "N/A"}\n- Amount: ${scholarshipContext?.amount || "N/A"}\n- Eligibility: ${scholarshipContext?.eligibility_notes || "N/A"}\n- Notes: ${scholarshipContext?.notes || "N/A"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tasks",
              description: "Return 4-8 actionable checklist items for this application.",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                      },
                      required: ["label"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["tasks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } },
      };
    } else if (mode === "prioritize") {
      const appList = (applications || []).map((a: any) =>
        `- ID: ${a.id} | "${a.name}" | Status: ${a.status} | Deadline: ${a.deadline || "none"} | Amount: ${a.amount ? "$" + a.amount : "N/A"}`
      ).join("\n");

      body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are ApplyMate's priority advisor. Given a list of scholarship applications, pick the ONE most important to work on right now based on deadline urgency, amount, and status. Return using the pick_focus tool.",
          },
          {
            role: "user",
            content: `Today: ${new Date().toISOString().split("T")[0]}\n\nMy applications:\n${appList}\n\nWhich one should I focus on and why?`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "pick_focus",
              description: "Pick the single most important application to focus on.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The application ID" },
                  name: { type: "string", description: "The application name" },
                  reason: { type: "string", description: "Brief reason (1-2 sentences) why this is the priority" },
                },
                required: ["id", "name", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "pick_focus" } },
      };
    } else if (mode === "summarize") {
      const ctx = scholarshipContext || {};
      body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are ApplyMate's notes summarizer. Condense the scholarship's notes, eligibility info, and details into a brief 3-5 sentence summary the student can quickly review before applying. Be clear and actionable.",
          },
          {
            role: "user",
            content: `Scholarship: ${ctx.name || "Unknown"}\nOrganization: ${ctx.organization || "N/A"}\nAmount: ${ctx.amount || "N/A"}\nDeadline: ${ctx.deadline || "N/A"}\nStatus: ${ctx.status || "N/A"}\nEligibility: ${ctx.eligibility_notes || "N/A"}\nNotes: ${ctx.notes || "N/A"}\n\nSummarize this for me:`,
          },
        ],
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    if (mode === "dashboard") {
      const advice = data.choices?.[0]?.message?.content || "Unable to generate advice right now.";
      return new Response(JSON.stringify({ advice }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (mode === "checklist") {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ tasks: args.tasks }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ tasks: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (mode === "prioritize") {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ focus: args }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ focus: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (mode === "summarize") {
      const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";
      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
