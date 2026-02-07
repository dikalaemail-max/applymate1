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

    const { cvText } = await req.json();
    if (!cvText || typeof cvText !== "string") {
      return new Response(JSON.stringify({ error: "cvText is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Parsing CV for user:", user.id);

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
            content: "You are a CV/resume parser. Extract structured information from the provided text. Be thorough and accurate.",
          },
          {
            role: "user",
            content: `Parse the following CV/resume text and extract structured information:\n\n${cvText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cv_data",
              description: "Extract structured CV data from resume text",
              parameters: {
                type: "object",
                properties: {
                  display_name: { type: "string", description: "Full name of the person" },
                  bio: { type: "string", description: "A brief professional summary (2-3 sentences)" },
                  education_level: {
                    type: "string",
                    enum: ["high_school", "associate", "bachelor", "master", "phd", "other"],
                    description: "Highest level of education",
                  },
                  major: { type: "string", description: "Primary field of study" },
                  gpa: { type: "string", description: "GPA if mentioned" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of skills",
                  },
                  achievements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Awards, honors, and notable achievements",
                  },
                  interests: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas of interest or hobbies",
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        degree: { type: "string" },
                        field: { type: "string" },
                        start_year: { type: "string" },
                        end_year: { type: "string" },
                        gpa: { type: "string" },
                      },
                      required: ["institution", "degree"],
                      additionalProperties: false,
                    },
                    description: "Education history",
                  },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        organization: { type: "string" },
                        start_date: { type: "string" },
                        end_date: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "organization"],
                      additionalProperties: false,
                    },
                    description: "Work and volunteer experience",
                  },
                },
                required: ["display_name", "bio", "skills", "education", "experience"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_cv_data" } },
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
    if (!toolCall) throw new Error("No structured data returned from AI");

    const parsed = JSON.parse(toolCall.function.arguments);
    console.log("CV parsed successfully for user:", user.id);

    return new Response(JSON.stringify({ parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-cv error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
