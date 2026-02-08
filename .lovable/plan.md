

# ApplyMate: AI Expansion, Visual Overhaul, Logo Refresh, and New Features

## Overview
A major upgrade covering four areas: deeper AI integration across the app, a refined high-end black-and-white visual redesign, a new custom logo mark, and new dashboard quick-action buttons and features.

---

## 1. New AI Features

### A. AI Scholarship Recommender (Dashboard Widget)
A new "Discover Scholarships" card on the dashboard. Based on the user's profile (education, major, GPA, skills), AI suggests scholarships the user should look for -- categories, types, and search strategies personalized to them.
- New edge function: `ai-recommender`
- New dashboard component: `ScholarshipRecommender.tsx`
- Uses profile data to generate tailored suggestions

### B. AI Notes Summarizer (Scholarship Detail)
On each scholarship detail page, a "Summarize Notes" button that uses AI to condense the user's notes, eligibility info, and checklist into a quick brief they can review before applying.
- Reuses the existing `ai-advisor` edge function with a new `mode: "summarize"`
- Appears as a collapsible summary card on ScholarshipDetail

### C. AI Community Reply Suggestions
When viewing a community thread, an "AI Suggest Reply" button that drafts a helpful response based on the post context.
- New edge function: `ai-community-assist`
- Small button in the ThreadPanel reply area

### D. AI Deadline Priority Ranking (Dashboard)
Instead of just listing upcoming deadlines chronologically, AI ranks them by urgency + success probability + amount, giving a smart "Focus Next" recommendation at the top of the dashboard.
- Extends the `ai-advisor` edge function with `mode: "prioritize"`
- New component: `FocusNext.tsx` -- a highlighted card showing the single most important application to work on right now

---

## 2. Visual Overhaul (Black and White, Non-Ordinary)

### A. Typography Refinement
- Increase use of `Instrument Serif` italic for display headings and accent text
- Add variable letter-spacing for a more editorial, magazine-like feel
- Larger, bolder hero numbers on dashboard stat cards

### B. Card and Surface Redesign
- Replace uniform `glass-card` with a mix of surface treatments:
  - **Elevated cards**: Subtle outer shadow with micro-border for primary content
  - **Inset cards**: Slightly recessed look (inner shadow) for secondary info
  - **Borderless cards**: Clean flat areas for content-heavy sections
- Add subtle noise texture overlay to cards for tactile depth
- Rounded corners increased to `2xl` / `3xl` for a softer, premium feel

### C. Sidebar Refinement
- Add a thin animated gradient line (white-to-transparent) along the top of the sidebar
- User avatar area gets a frosted glass treatment
- Active nav item gets a subtle left-edge accent bar instead of background fill
- Hover states become more fluid with scale micro-animations

### D. Dashboard Layout
- Asymmetric grid: hero stat row becomes a featured large card + 3 smaller cards instead of 4 equal cards
- Add subtle divider lines between sections (thin, faded)
- Section labels styled as small uppercase monospaced tags

### E. Buttons and Interactions
- Primary buttons get a subtle inner highlight (top edge lighter) for depth
- Hover states use `scale(1.02)` + shadow elevation
- Focus rings become offset double-rings for accessibility with style
- Add micro-animations: cards fade-slide-up on scroll into view

### F. Landing Page Polish
- Parallax depth on hero section background grid
- Smoother scroll-linked transforms
- Feature cards get a staggered reveal with slight rotation

---

## 3. Logo Change

Replace the Rocket icon with a custom SVG logo mark:
- Concept: An abstract "A" letterform made of two converging lines meeting at a point (like a compass/arrow pointing up), representing ambition and direction
- Monochrome: works in black on white and white on black
- Used in: Sidebar, MobileNav, LandingPage nav, Auth page, favicon
- The logo will be an inline SVG component (`ApplyMateLogo.tsx`) for crisp rendering at all sizes

---

## 4. New Dashboard Features and Quick Actions

### A. Quick Action Buttons Row
A new horizontal row below the greeting with one-tap actions:
- **"Add Application"** (existing, restyled)
- **"Scan URL"** -- opens a modal to paste a URL and auto-import a scholarship
- **"AI Brief"** -- triggers the AI advisor for a quick status summary
- **"Export CSV"** -- one-click export of all applications

### B. Streak / Activity Counter
A small widget showing the user's activity streak (consecutive days they've logged in or made changes), encouraging engagement.
- Tracked via `profiles.last_active_at` (new column)
- Visual: flame icon with day count

### C. Goal Tracker
A configurable goal card: "Apply to X scholarships this month" with a progress ring.
- New column on profiles: `monthly_goal` (integer)
- Shows progress toward the goal with visual ring

---

## Technical Details

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/ApplyMateLogo.tsx` | SVG logo component |
| `src/components/ScholarshipRecommender.tsx` | AI recommendation widget |
| `src/components/FocusNext.tsx` | AI-prioritized next action card |
| `src/components/QuickActions.tsx` | Dashboard quick action buttons row |
| `src/components/StreakCounter.tsx` | Activity streak widget |
| `src/components/GoalTracker.tsx` | Monthly goal progress ring |
| `src/components/NotesSummary.tsx` | AI notes summarizer for detail page |
| `supabase/functions/ai-recommender/index.ts` | Scholarship recommendation edge function |
| `supabase/functions/ai-community-assist/index.ts` | Community reply suggestion edge function |

### Files to Modify
| File | Changes |
|------|---------|
| `src/index.css` | New utility classes, noise texture, card variants, animations |
| `src/components/layout/AppSidebar.tsx` | New logo, nav styling, accent bar |
| `src/components/layout/MobileNav.tsx` | New logo, updated styles |
| `src/pages/Dashboard.tsx` | New layout grid, integrate new widgets |
| `src/pages/LandingPage.tsx` | New logo, visual polish |
| `src/pages/Auth.tsx` | New logo |
| `src/pages/ScholarshipDetail.tsx` | Add NotesSummary component |
| `src/components/community/ThreadPanel.tsx` | Add AI reply suggestion button |
| `src/components/AdvisorCard.tsx` | Visual refresh |
| `supabase/functions/ai-advisor/index.ts` | Add "prioritize" and "summarize" modes |
| `supabase/config.toml` | Register new edge functions |
| `index.html` | Update favicon reference |
| `tailwind.config.ts` | New animation keyframes |

### Database Changes
- `profiles` table: add `last_active_at` (timestamptz), `monthly_goal` (integer, default 5), `activity_streak` (integer, default 0)

### Edge Function Architecture
All new AI functions follow the existing pattern:
- CORS headers
- Auth check via authorization header
- Lovable AI Gateway call with `google/gemini-3-flash-preview`
- Proper 429/402 error handling
- Non-streaming (tool calling / JSON response) for structured outputs

