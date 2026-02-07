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

    const { scholarshipId } = await req.json();
    if (!scholarshipId) {
      return new Response(JSON.stringify({ error: "scholarshipId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch scholarship and profile data
    const [scholarshipRes, profileRes] = await Promise.all([
      supabase.from("scholarships").select("*").eq("id", scholarshipId).single(),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);

    if (scholarshipRes.error || !scholarshipRes.data) {
      return new Response(JSON.stringify({ error: "Scholarship not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scholarship = scholarshipRes.data;
    const profile = profileRes.data;

    if (!profile || (!profile.skills?.length && !profile.education?.length && !profile.bio)) {
      return new Response(JSON.stringify({
        error: "incomplete_profile",
        message: "Please complete your profile with education, skills, and experience to get a success estimate.",
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Success meter analysis for scholarship:", scholarship.name, "user:", user.id);

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
            content: `You are a scholarship application analyst. Evaluate the match between a student's profile and a scholarship opportunity. Be honest but encouraging. Consider education level, field of study, skills, experience, and achievements relative to the scholarship's requirements and focus.`,
          },
          {
            role: "user",
            content: `Analyze this student's chance of success for this scholarship.

STUDENT PROFILE:
- Name: ${profile.display_name || "N/A"}
- Bio: ${profile.bio || "N/A"}
- Education Level: ${profile.education_level || "N/A"}
- Major: ${profile.major || "N/A"}
- GPA: ${profile.gpa || "N/A"}
- Skills: ${(profile.skills || []).join(", ") || "N/A"}
- Achievements: ${(profile.achievements || []).join(", ") || "N/A"}
- Education History: ${JSON.stringify(profile.education || [])}
- Experience: ${JSON.stringify(profile.experience || [])}
- Interests: ${(profile.interests || []).join(", ") || "N/A"}

SCHOLARSHIP:
- Name: ${scholarship.name}
- Organization: ${scholarship.organization || "N/A"}
- Amount: ${scholarship.amount ? "$" + Number(scholarship.amount).toLocaleString() : "N/A"}
- Eligibility: ${scholarship.eligibility_notes || "N/A"}
- Tags: ${(scholarship.tags || []).join(", ") || "N/A"}
- Notes: ${scholarship.notes || "N/A"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_success_analysis",
              description: "Provide a structured success analysis for the scholarship application",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Success probability score from 0 to 100",
                  },
                  confidence: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "How confident the analysis is, based on available data",
                  },
                  summary: {
                    type: "string",
                    description: "A 2-3 sentence summary of the overall match",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths that make this a good match (2-4 items)",
                  },
                  gaps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas where the profile could be stronger (1-3 items)",
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable tips to improve chances (2-3 items)",
                  },
                },
                required: ["score", "confidence", "summary", "strengths", "gaps", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_success_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
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
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned from AI");

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("Success meter result:", analysis.score, "confidence:", analysis.confidence);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("success-meter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
