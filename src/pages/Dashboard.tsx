import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FolderOpen, Clock, Send, Trophy, TrendingUp, FileText, Target, ArrowRight } from "lucide-react";
import { format, differenceInDays, isPast, subDays } from "date-fns";
import { AdvisorCard } from "@/components/AdvisorCard";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

export default function Dashboard() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("scholarships")
      .select("*")
      .eq("user_id", user.id)
      .order("deadline", { ascending: true })
      .then(({ data }) => {
        setScholarships(data || []);
        setLoading(false);
      });
  }, [user]);

  const active = scholarships.filter((s) => s.status !== "archived");
  const total = active.length;
  const submitted = active.filter((s) => s.status === "submitted").length;
  const awarded = active.filter((s) => s.status === "awarded").length;
  const inProgress = active.filter((s) => s.status === "in_progress").length;
  const rejected = active.filter((s) => s.status === "rejected").length;
  const upcoming = active.filter(
    (s) => s.deadline && !isPast(new Date(s.deadline)) && s.status !== "submitted" && s.status !== "awarded" && s.status !== "rejected"
  );
  const totalAmount = active
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const recentlyAdded = active
    .filter((s) => new Date(s.created_at) >= subDays(new Date(), 7))
    .length;

  const completionRate = total > 0 ? Math.round(((submitted + awarded) / total) * 100) : 0;

  const stats = [
    { label: "Total Applications", value: total, icon: FolderOpen, gradient: "from-violet-500 to-purple-600" },
    { label: "Upcoming Deadlines", value: upcoming.length, icon: Clock, gradient: "from-amber-400 to-orange-500" },
    { label: "Submitted", value: submitted, icon: Send, gradient: "from-blue-400 to-indigo-500" },
    { label: "Awarded", value: awarded, icon: Trophy, gradient: "from-emerald-400 to-green-500" },
  ];

  const getUrgencyColor = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return "bg-destructive/10 text-destructive";
    if (days <= 3) return "bg-destructive/10 text-destructive";
    if (days <= 7) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  };

  const statusBreakdown = [
    { label: "Saved", count: active.filter((s) => s.status === "saved").length, color: "bg-secondary" },
    { label: "In Progress", count: inProgress, color: "bg-blue-500" },
    { label: "Submitted", count: submitted, color: "bg-purple-500" },
    { label: "Awarded", count: awarded, color: "bg-emerald-500" },
    { label: "Rejected", count: rejected, color: "bg-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Your application overview</p>
          </div>
          <Link to="/scholarships/new">
            <Button className="gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all rounded-xl h-10 px-5 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={stat.label} className="hover-lift glass-card rounded-2xl border-0 overflow-hidden animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms`, opacity: 0 }}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold tracking-tight">{loading ? "–" : stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-xl shadow-sm`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Advisor */}
        <div className="animate-fade-up" style={{ animationDelay: '400ms', opacity: 0 }}>
          <AdvisorCard scholarships={scholarships} loading={loading} />
        </div>

        {/* Middle Row: Progress + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass-card rounded-2xl border-0 animate-fade-up" style={{ animationDelay: '480ms', opacity: 0 }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1.5 rounded-lg">
                  <Target className="h-3.5 w-3.5 text-white" />
                </div>
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight">{loading ? "–" : `${completionRate}%`}</span>
                <span className="text-xs text-muted-foreground pb-1.5">submitted or awarded</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full gradient-primary transition-all duration-700" style={{ width: loading ? '0%' : `${completionRate}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-0 animate-fade-up" style={{ animationDelay: '560ms', opacity: 0 }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-1.5 rounded-lg">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Won</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {loading ? "–" : `$${totalAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Added This Week</span>
                  <span className="font-bold">{loading ? "–" : recentlyAdded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-bold">{loading ? "–" : inProgress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-0 animate-fade-up" style={{ animationDelay: '640ms', opacity: 0 }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-lg">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </div>
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {statusBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-sm font-bold tabular-nums">{loading ? "–" : item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="glass-card rounded-2xl border-0 animate-fade-up" style={{ animationDelay: '720ms', opacity: 0 }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
              {upcoming.length > 0 && (
                <Link to="/scholarships" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No upcoming deadlines</p>
                <Link to="/scholarships/new">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 8).map((s) => {
                  const days = differenceInDays(new Date(s.deadline!), new Date());
                  return (
                    <Link
                      key={s.id}
                      to={`/scholarships/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.organization}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.amount && (
                          <span className="text-sm font-bold">${Number(s.amount).toLocaleString()}</span>
                        )}
                        <Badge className={`${getUrgencyColor(s.deadline!)} font-semibold text-xs`}>
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
      </div>
    </DashboardLayout>
  );
}
