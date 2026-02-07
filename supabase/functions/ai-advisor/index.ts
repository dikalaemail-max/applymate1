import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
    } else {
      // checklist mode — extract tool call
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
    }
  } catch (e) {
    console.error("ai-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
