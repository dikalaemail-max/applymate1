import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus, FolderOpen, Clock, Send, Trophy, TrendingUp, FileText, Target, ArrowRight,
  CalendarDays, DollarSign, Flame, Award, BarChart3, Sparkles,
} from "lucide-react";
import { format, differenceInDays, isPast, subDays, isThisWeek } from "date-fns";
import { AdvisorCard } from "@/components/AdvisorCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { DeadlineCalendar } from "@/components/DeadlineCalendar";
import { QuickNotes } from "@/components/QuickNotes";
import { InsightsChart } from "@/components/InsightsChart";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

export default function Dashboard() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("scholarships").select("*").eq("user_id", user.id).order("deadline", { ascending: true }),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]).then(([{ data: schData }, { data: profData }]) => {
      setScholarships(schData || []);
      setProfile(profData);
      setLoading(false);
    });
  }, [user]);

  const active = scholarships.filter((s) => s.status !== "archived");
  const total = active.length;
  const submitted = active.filter((s) => s.status === "submitted").length;
  const awarded = active.filter((s) => s.status === "awarded").length;
  const inProgress = active.filter((s) => s.status === "in_progress").length;
  const rejected = active.filter((s) => s.status === "rejected").length;
  const saved = active.filter((s) => s.status === "saved").length;
  const upcoming = active.filter(
    (s) => s.deadline && !isPast(new Date(s.deadline)) && s.status !== "submitted" && s.status !== "awarded" && s.status !== "rejected"
  );
  const overdue = active.filter(
    (s) => s.deadline && isPast(new Date(s.deadline)) && s.status !== "submitted" && s.status !== "awarded" && s.status !== "rejected" && s.status !== "archived"
  );
  const totalAmount = active
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalPotential = active
    .filter((s) => s.status !== "rejected" && s.status !== "awarded")
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const recentlyAdded = active
    .filter((s) => new Date(s.created_at) >= subDays(new Date(), 7))
    .length;
  const completionRate = total > 0 ? Math.round(((submitted + awarded) / total) * 100) : 0;
  const successRate = (submitted + awarded) > 0 ? Math.round((awarded / (submitted + awarded + rejected)) * 100) : 0;

  // Deadlines this week
  const thisWeekDeadlines = upcoming.filter((s) => isThisWeek(new Date(s.deadline!), { weekStartsOn: 1 }));

  // Profile completeness
  const profileFields = ['display_name', 'bio', 'education_level', 'major', 'gpa', 'skills', 'achievements'];
  const filledFields = profile ? profileFields.filter((f) => {
    const val = profile[f];
    return val && (Array.isArray(val) ? val.length > 0 : true);
  }).length : 0;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const getUrgencyColor = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return "bg-destructive/10 text-destructive";
    if (days <= 3) return "bg-destructive/10 text-destructive";
    if (days <= 7) return "bg-warning/10 text-warning";
    return "bg-success/10 text-success";
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting()}, <span className="font-serif-display italic font-normal">{displayName}</span>
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {overdue.length > 0
                ? `⚠ ${overdue.length} overdue deadline${overdue.length > 1 ? "s" : ""} need attention`
                : thisWeekDeadlines.length > 0
                ? `${thisWeekDeadlines.length} deadline${thisWeekDeadlines.length > 1 ? "s" : ""} this week`
                : "You're all caught up!"}
            </p>
          </div>
          <Link to="/scholarships/new">
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 px-5 w-full sm:w-auto shadow-lg shadow-foreground/5">
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Active", value: total, icon: FolderOpen, sub: `${recentlyAdded} new this week` },
            { label: "Upcoming", value: upcoming.length, icon: Clock, sub: overdue.length > 0 ? `${overdue.length} overdue` : "On track", alert: overdue.length > 0 },
            { label: "Submitted", value: submitted, icon: Send, sub: `${inProgress} in progress` },
            { label: "Awarded", value: awarded, icon: Trophy, sub: totalAmount > 0 ? `$${totalAmount.toLocaleString()} won` : "Keep applying!" },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card rounded-2xl border-0 hover-lift">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums">{loading ? "–" : stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.alert ? "bg-destructive/10" : "bg-foreground/5"}`}>
                    <stat.icon className={`h-4 w-4 ${stat.alert ? "text-destructive" : "text-foreground/60"}`} />
                  </div>
                </div>
                <p className={`text-[10px] mt-2 ${stat.alert ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {loading ? "" : stat.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Advisor */}
        <AdvisorCard scholarships={scholarships} loading={loading} />

        {/* Insights + Calendar Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightsChart scholarships={scholarships} loading={loading} />
          <DeadlineCalendar
            deadlines={upcoming.map((s) => ({ id: s.id, name: s.name, deadline: s.deadline! }))}
          />
        </div>

        {/* Financial + Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Financial Summary */}
          <Card className="glass-card rounded-2xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-foreground/5">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Won</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums text-success">
                    {loading ? "–" : `$${totalAmount.toLocaleString()}`}
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Potential</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">
                    {loading ? "–" : `$${totalPotential.toLocaleString()}`}
                  </p>
                </div>
              </div>
              {!loading && total > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Avg. application value: ${total > 0 ? Math.round((totalAmount + totalPotential) / total).toLocaleString() : 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="glass-card rounded-2xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-foreground/5">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Completion</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-bold tabular-nums">{loading ? "–" : `${completionRate}%`}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: loading ? '0%' : `${completionRate}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-bold tabular-nums">{loading ? "–" : `${successRate}%`}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-success transition-all duration-700" style={{ width: loading ? '0%' : `${successRate}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Pipeline + Profile Strength */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Pipeline */}
          <Card className="glass-card rounded-2xl border-0 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-foreground/5">
                  <Flame className="h-3.5 w-3.5" />
                </div>
                Application Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : total === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Add your first application to see your pipeline.</p>
              ) : (
                <div className="space-y-3">
                  {/* Visual bar */}
                  <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                    {[
                      { count: saved, color: "bg-muted-foreground/40" },
                      { count: inProgress, color: "bg-foreground/60" },
                      { count: submitted, color: "bg-foreground" },
                      { count: awarded, color: "bg-success" },
                      { count: rejected, color: "bg-destructive" },
                    ].map((seg, i) => seg.count > 0 && (
                      <div key={i} className={`${seg.color} transition-all duration-500`} style={{ width: `${(seg.count / total) * 100}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "Saved", count: saved },
                      { label: "In Progress", count: inProgress },
                      { label: "Submitted", count: submitted },
                      { label: "Awarded", count: awarded },
                      { label: "Rejected", count: rejected },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-lg font-bold tabular-nums">{item.count}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Strength */}
          <Card className="glass-card rounded-2xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-foreground/5">
                  <Award className="h-3.5 w-3.5" />
                </div>
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="hsl(var(--foreground))" strokeWidth="3"
                    strokeDasharray={`${profileCompletion}, 100`}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold tabular-nums">{loading ? "–" : `${profileCompletion}%`}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {profileCompletion === 100 ? "Profile complete! 🎉" : "Complete your profile for better AI matches."}
              </p>
              {profileCompletion < 100 && (
                <Link to="/settings" className="block">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="glass-card rounded-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-foreground/5">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
                Upcoming Deadlines
              </CardTitle>
              {upcoming.length > 0 && (
                <Link to="/scholarships" className="text-xs font-semibold hover:underline flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : upcoming.length === 0 && overdue.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No upcoming deadlines</p>
                <Link to="/scholarships/new">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Overdue first */}
                {overdue.map((s) => (
                  <Link
                    key={s.id}
                    to={`/scholarships/${s.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 hover:bg-destructive/10 transition-all duration-200 group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.organization}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive font-semibold text-xs border-0">
                      Overdue
                    </Badge>
                  </Link>
                ))}
                {upcoming.slice(0, 8).map((s) => {
                  const days = differenceInDays(new Date(s.deadline!), new Date());
                  return (
                    <Link
                      key={s.id}
                      to={`/scholarships/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-foreground transition-colors">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.organization}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.amount && (
                          <span className="text-sm font-bold tabular-nums">${Number(s.amount).toLocaleString()}</span>
                        )}
                        <Badge className={`${getUrgencyColor(s.deadline!)} font-semibold text-xs border-0`}>
                          {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline + Quick Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActivityTimeline />
          <QuickNotes />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/scholarships/new" className="block">
            <Card className="glass-card rounded-2xl border-0 hover-lift cursor-pointer group">
              <CardContent className="py-5 px-5 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Application</p>
                  <p className="text-xs text-muted-foreground">Track a scholarship</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/community" className="block">
            <Card className="glass-card rounded-2xl border-0 hover-lift cursor-pointer group">
              <CardContent className="py-5 px-5 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Community</p>
                  <p className="text-xs text-muted-foreground">Tips & discussions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/settings" className="block">
            <Card className="glass-card rounded-2xl border-0 hover-lift cursor-pointer group">
              <CardContent className="py-5 px-5 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Update Profile</p>
                  <p className="text-xs text-muted-foreground">Improve AI matches</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
