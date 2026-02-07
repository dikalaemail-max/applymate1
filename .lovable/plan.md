

# Power-Up ApplyMate with AI and Smart Features

This plan adds five high-impact features that make ApplyMate significantly more useful and intelligent.

---

## 1. AI Essay/Statement Assistant

An AI-powered writing assistant on each application's detail page that helps users draft, improve, and tailor personal statements and essays.

**How it works:**
- On the `ScholarshipDetail` page, add an "AI Writing Assistant" card
- Users type a prompt like "Draft a 300-word personal statement about my passion for engineering" or "Improve this paragraph to sound more professional"
- Streams the AI response token-by-token in real time
- Users can copy the result or insert it directly into their notes
- Context-aware: the AI knows the scholarship name, organization, eligibility notes, and amount so it can tailor advice

**What gets built:**
- New edge function `supabase/functions/essay-assistant/index.ts` -- streaming endpoint that takes scholarship context + user prompt, returns streamed AI response
- New `EssayAssistant` component embedded in `ScholarshipDetail.tsx`
- Update `supabase/config.toml` to register the new function

---

## 2. AI Deadline Advisor on Dashboard

A smart "Advisor" card on the Dashboard that analyzes all your applications and gives personalized, actionable advice.

**How it works:**
- On Dashboard load, a card shows an AI-generated summary like: "You have 3 deadlines this week. Focus on [X] first -- it has the highest award amount. [Y] is missing notes, consider adding requirements."
- A "Refresh" button re-generates the advice
- Non-streaming (single call) since it's a short summary

**What gets built:**
- New edge function `supabase/functions/ai-advisor/index.ts` -- takes a summary of user's applications (names, deadlines, statuses, amounts) and returns strategic advice
- New `AdvisorCard` component on `Dashboard.tsx`
- Update `supabase/config.toml`

---

## 3. Application Checklist / To-Do System

A per-application checklist so users can track granular progress (e.g., "Write essay", "Get recommendation letter", "Submit transcript").

**How it works:**
- Each application detail page gets a "Checklist" section
- Users can add, check off, and delete checklist items
- Dashboard shows an aggregate "X of Y tasks complete" stat
- AI can auto-generate a suggested checklist when a new application is added (based on eligibility notes and scholarship type)

**What gets built:**
- New database table `application_checklist` with columns: `id`, `scholarship_id`, `user_id`, `label`, `is_done`, `position`, `created_at`
- RLS policies so users only see their own checklist items
- New checklist UI component on `ScholarshipDetail.tsx`
- Button "AI: Suggest Tasks" that calls the `ai-advisor` function with a different mode to generate checklist items

---

## 4. Smart Search with Tag Filtering and Sort Options

Upgrade the My Applications page with powerful filtering, sorting, and tag-based browsing.

**What gets built:**
- Multi-select tag filter chips (extracted from all user's tags)
- Sort dropdown: by deadline (soonest), amount (highest), recently added, name A-Z
- Visual improvements: tag badges on each card, deadline urgency coloring (same as Dashboard)
- Compact/detailed view toggle

---

## 5. Export to CSV

Let users export their application data for external tracking or sharing.

**What gets built:**
- "Export" button on the My Applications page
- Generates a CSV file with all columns: name, organization, amount, deadline, status, tags, link, notes
- Pure client-side using Blob/download -- no backend needed

---

## Technical Details

### Database Migration

New table for the checklist feature:

```sql
CREATE TABLE public.application_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.application_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own checklist"
  ON public.application_checklist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### New Edge Functions

1. **`supabase/functions/essay-assistant/index.ts`** -- Streaming endpoint. Takes `{ scholarshipContext, userPrompt, conversationHistory }`. System prompt instructs AI to be a scholarship essay writing coach. Streams response via SSE.

2. **`supabase/functions/ai-advisor/index.ts`** -- Non-streaming endpoint. Two modes:
   - `mode: "dashboard"` -- Takes array of application summaries, returns strategic advice paragraph
   - `mode: "checklist"` -- Takes scholarship details, returns suggested checklist items as JSON via tool calling

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/essay-assistant/index.ts` | New -- streaming AI writing assistant |
| `supabase/functions/ai-advisor/index.ts` | New -- dashboard advice and checklist suggestions |
| `supabase/config.toml` | Register two new functions |
| `src/pages/Dashboard.tsx` | Add AdvisorCard component, add checklist stats |
| `src/pages/ScholarshipDetail.tsx` | Add EssayAssistant component, add Checklist component |
| `src/pages/Scholarships.tsx` | Add tag filters, sort options, view toggle, export CSV button |
| `src/pages/ScholarshipForm.tsx` | After save, offer "AI: Suggest Tasks" to auto-generate checklist |

### Model Usage
- Essay Assistant: `google/gemini-3-flash-preview` with streaming
- Dashboard Advisor: `google/gemini-3-flash-preview` non-streaming
- Checklist Suggestions: `google/gemini-3-flash-preview` with tool calling for structured output

