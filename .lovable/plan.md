

# Smart Scholarship Auto-Fill

Add two quick-entry methods above the existing form so users can rapidly add scholarships without manually filling every field.

## How It Works

**Option A -- Paste Text**: A large text box where users paste raw scholarship info (from an email, flyer, etc.). AI parses it and fills the form fields below.

**Option B -- Paste a URL**: A URL input with a "Fetch" button. The system scrapes the webpage, then AI extracts scholarship details and fills the form.

In both cases, the form fields are pre-populated but fully editable before saving.

## What Gets Built

### 1. Backend function: `parse-scholarship`
A single backend function that handles both modes:
- **Text mode**: Sends the pasted text to Lovable AI (Gemini Flash) with a structured extraction prompt, returns parsed fields (name, organization, amount, deadline, link, eligibility, tags).
- **URL mode**: Uses Firecrawl to scrape the webpage into markdown, then sends that markdown to Lovable AI for the same structured extraction.

Uses tool calling to get clean JSON output matching the form fields.

### 2. Firecrawl connector
Firecrawl will be connected to enable webpage scraping. This lets the backend fetch and parse any scholarship URL the user provides.

### 3. Updated Add Scholarship page
The form page gets a new "Smart Import" section at the top with two tabs:
- **Paste Text** tab: A large textarea + "Extract" button
- **From URL** tab: A URL input + "Fetch & Extract" button

When the user clicks either button:
- A loading spinner shows while processing
- On success, all form fields below auto-populate with extracted data
- A toast confirms "Fields auto-filled -- review and save!"
- The user can edit any field before hitting Save

## Technical Details

- **AI Model**: `google/gemini-3-flash-preview` (fast, cost-effective for extraction)
- **Scraping**: Firecrawl `/v1/scrape` with `markdown` format and `onlyMainContent: true`
- **Structured output**: Tool calling to extract `name`, `organization`, `amount`, `deadline`, `link`, `eligibility_notes`, `tags` as clean JSON
- **Edge function**: `supabase/functions/parse-scholarship/index.ts` -- handles both `{ text: "..." }` and `{ url: "..." }` request bodies
- **Error handling**: Graceful fallback if scraping fails or AI can't extract certain fields (leaves them empty for manual entry)
- **Security**: Function requires authentication (JWT verification enabled)

