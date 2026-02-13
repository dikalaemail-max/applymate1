import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pipeline, total, scholarshipCount, jobCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an application strategy advisor. Analyze this pipeline and give actionable insights.

Pipeline data:
- Total active applications: ${total}
- Scholarships: ${scholarshipCount}, Jobs: ${jobCount}
- Saved: ${pipeline.saved?.total || 0} (scholarships: ${pipeline.saved?.scholarships || 0}, jobs: ${pipeline.saved?.jobs || 0})
- In Progress: ${pipeline.in_progress?.total || 0} (scholarships: ${pipeline.in_progress?.scholarships || 0}, jobs: ${pipeline.in_progress?.jobs || 0})
- Submitted: ${pipeline.submitted?.total || 0} (scholarships: ${pipeline.submitted?.scholarships || 0}, jobs: ${pipeline.submitted?.jobs || 0})
- Awarded: ${pipeline.awarded?.total || 0} (scholarships: ${pipeline.awarded?.scholarships || 0}, jobs: ${pipeline.awarded?.jobs || 0})
- Rejected: ${pipeline.rejected?.total || 0} (scholarships: ${pipeline.rejected?.scholarships || 0}, jobs: ${pipeline.rejected?.jobs || 0})

Provide analysis with:
- summary: 1-2 sentence overview of where they stand
- highlights: 1-3 positive observations
- warnings: 0-2 areas needing attention (bottlenecks, imbalances)
- tips: 2-3 specific actionable tips to improve their pipeline

Keep each point concise (under 20 words).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a concise application strategy advisor." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_insights",
              description: "Return pipeline insights",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                  warnings: { type: "array", items: { type: "string" } },
                  tips: { type: "array", items: { type: "string" } },
                },
                required: ["summary", "highlights", "warnings", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const insights = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pipeline-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
