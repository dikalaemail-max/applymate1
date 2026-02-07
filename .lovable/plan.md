

# 📚 ScholarTrack — Scholarship Application Manager

A full-stack dashboard app to help you track, manage, and never miss a scholarship deadline again.

---

## 🔐 Authentication
- **Google Sign-In** (continue with Google) for quick, frictionless login
- Email/password signup as a fallback option
- Protected routes — unauthenticated users redirected to login

## 👤 User Dashboard (Main Experience)
- **Overview page** with stats: total scholarships saved, upcoming deadlines, applications submitted, success rate
- **Deadline timeline** showing upcoming due dates with urgency indicators (color-coded)
- **Quick-add button** to rapidly save a new scholarship

## 📋 Scholarship Manager
- **Add/Edit scholarships** with fields: name, organization, amount, deadline, link, status (Saved → In Progress → Submitted → Awarded/Rejected), eligibility notes, and tags/categories
- **Rich text notes** per scholarship — draft essays, talking points, requirements checklists
- **File attachments** — upload PDFs (essays, transcripts, recommendation letters) stored in Supabase Storage
- **Status board** — Kanban-style or table view to see all scholarships by status
- **Search, filter & sort** — by deadline, amount, status, tags

## 🔗 Sharing
- **Share via link** — generate a public read-only link for any scholarship so friends can view details and apply
- **Email invite** — send an invite so a friend sees the scholarship in their own dashboard
- Shared scholarships appear in a "Shared with me" section

## 🛡️ Admin Panel
- **User management** — view all registered users, see their activity
- **User details** — inspect a user's scholarships and account info
- **Delete/disable accounts** if needed
- Role-based access using a secure `user_roles` table (admin vs. user)

## 🗄️ Backend (Supabase)
- **Database tables**: profiles, scholarships, scholarship_files, user_roles, shared_scholarships
- **Supabase Storage** for document uploads (essays, transcripts, etc.)
- **Row-Level Security** on all tables so users only see their own data (admins see all)
- **Google OAuth** configured through Supabase Auth

## 🎨 Design
- Dashboard-style layout with a sidebar navigation
- Data-dense views with stats cards, progress indicators, and deadline countdowns
- Clean data tables with inline status badges
- Mobile-responsive design
- Dark/light mode support

## 📄 Pages
1. **Auth page** — Login / Sign up with Google
2. **Dashboard** — Overview stats + upcoming deadlines
3. **My Scholarships** — Full list with filters, search, and status management
4. **Scholarship Detail** — View/edit a single scholarship, notes, and files
5. **Shared with Me** — Scholarships friends have shared
6. **Admin: Users** — User list and management (admin only)
7. **Settings** — Profile, preferences

