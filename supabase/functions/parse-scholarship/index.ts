import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTRACTION_PROMPT = `You are a scholarship data extractor. Given the following text about a scholarship, extract the structured information. 

Extract these fields:
- name: The scholarship name/title
- organization: The organization offering it
- amount: The dollar amount as a number (just the number, no $ sign or commas). If a range, use the maximum.
- deadline: The application deadline in YYYY-MM-DD format. If no year is specified, assume the next upcoming occurrence.
- link: Any application URL mentioned
- eligibility_notes: Key eligibility requirements summarized
- tags: An array of relevant category tags (e.g., "STEM", "graduate", "need-based", "minority", "women", "international")

Return a JSON object with these fields. Use null for any field you cannot determine.`;

async function extractWithAI(text: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  console.log("Calling AI for extraction, text length:", text.length);

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("AI API error:", response.status, err);
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in AI response");

  console.log("AI raw response:", content);
  return JSON.parse(content);
}

async function scrapeUrl(url: string): Promise<string> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  console.log("Scraping URL:", formattedUrl);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: formattedUrl,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Firecrawl error:", response.status, err);
    throw new Error(`Failed to scrape URL: ${response.status}`);
  }

  const data = await response.json();
  const markdown = data.data?.markdown || data.markdown;
  if (!markdown) throw new Error("No content scraped from URL");

  console.log("Scraped content length:", markdown.length);
  return markdown;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { text, url } = body;

    if (!text && !url) {
      return new Response(
        JSON.stringify({ error: "Provide either 'text' or 'url'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let contentToExtract: string;

    if (url) {
      // URL mode: scrape then extract
      contentToExtract = await scrapeUrl(url);
    } else {
      // Text mode: extract directly
      contentToExtract = text;
    }

    const extracted = await extractWithAI(contentToExtract);

    // If URL was provided and no link was extracted, use the input URL
    if (url && !extracted.link) {
      extracted.link = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    }

    console.log("Extraction result:", JSON.stringify(extracted));

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("parse-scholarship error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
