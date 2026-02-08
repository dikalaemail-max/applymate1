

# Power Up ApplyMate: Smart Features & Polish

Here's a plan to add genuinely useful features that make the app feel more alive and data-driven.

---

## 1. Activity Timeline / Recent Activity Feed

Add a "Recent Activity" section to the Dashboard that shows a chronological feed of what the user has done -- applications added, statuses changed, files uploaded, checklist items completed. This gives users a sense of momentum and helps them pick up where they left off.

- Track activity by querying recent scholarship updates (using `updated_at`), recent checklist completions, and recent community posts
- Display as a compact timeline with icons and relative timestamps ("2h ago", "Yesterday")
- Placed below the AI Advisor card on the Dashboard

---

## 2. Deadline Calendar View

Add a visual mini-calendar to the Dashboard that highlights days with upcoming deadlines. Users can see at a glance which days are busy.

- Use a lightweight month-view grid (built with the existing `date-fns` library, no new dependencies)
- Days with deadlines get a dot indicator; clicking a day scrolls to or filters the deadline list
- Placed alongside the Upcoming Deadlines card

---

## 3. Quick Notes / Scratch Pad

A persistent, always-accessible notepad on the Dashboard for jotting down quick thoughts, links, or reminders that don't belong to a specific application.

- Stored in the `profiles` table (add a `quick_notes` TEXT column)
- Auto-saves on blur/debounce
- Collapsible card on the Dashboard

---

## 4. Application Insights Chart

A simple visual chart showing application activity over time -- how many applications were added per week/month, and status distribution trends.

- Use the already-installed `recharts` library
- Bar chart showing applications added per month
- Gives users a sense of their application pace

---

## 5. Keyboard Shortcuts & Quick Actions

Add a command palette (Cmd+K / Ctrl+K) for power users to quickly navigate, search applications, or create new ones without clicking through menus.

- Use the already-installed `cmdk` library
- Actions: "New Application", "Go to Dashboard", "Go to Settings", search by app name
- Accessible from any page within the dashboard layout

---

## Technical Details

### Database Migration

Add a `quick_notes` column to the profiles table:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quick_notes TEXT DEFAULT '';
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ActivityTimeline.tsx` | Recent activity feed component |
| `src/components/DeadlineCalendar.tsx` | Mini month-view calendar with deadline dots |
| `src/components/QuickNotes.tsx` | Auto-saving scratch pad |
| `src/components/InsightsChart.tsx` | Recharts bar chart for application trends |
| `src/components/CommandPalette.tsx` | Cmd+K command palette using cmdk |

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add ActivityTimeline, DeadlineCalendar, QuickNotes, and InsightsChart components |
| `src/components/layout/DashboardLayout.tsx` | Mount CommandPalette globally |

### No new dependencies needed
Everything uses libraries already installed: `recharts`, `cmdk`, `date-fns`, `framer-motion`.

