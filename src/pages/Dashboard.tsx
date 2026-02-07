import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FolderOpen, Clock, Send, Trophy, TrendingUp, FileText, Target } from "lucide-react";
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

  const total = scholarships.length;
  const submitted = scholarships.filter((s) => s.status === "submitted").length;
  const awarded = scholarships.filter((s) => s.status === "awarded").length;
  const inProgress = scholarships.filter((s) => s.status === "in_progress").length;
  const rejected = scholarships.filter((s) => s.status === "rejected").length;
  const upcoming = scholarships.filter(
    (s) => s.deadline && !isPast(new Date(s.deadline)) && s.status !== "submitted" && s.status !== "awarded" && s.status !== "rejected"
  );
  const totalAmount = scholarships
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const recentlyAdded = scholarships
    .filter((s) => new Date(s.created_at) >= subDays(new Date(), 7))
    .length;

  const completionRate = total > 0 ? Math.round(((submitted + awarded) / total) * 100) : 0;

  const stats = [
    { label: "Total Applications", value: total, icon: FolderOpen, color: "text-primary" },
    { label: "Upcoming Deadlines", value: upcoming.length, icon: Clock, color: "text-yellow-500" },
    { label: "Submitted", value: submitted, icon: Send, color: "text-blue-500" },
    { label: "Awarded", value: awarded, icon: Trophy, color: "text-green-500" },
  ];

  const getUrgencyColor = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return "bg-destructive/10 text-destructive";
    if (days <= 3) return "bg-destructive/10 text-destructive";
    if (days <= 7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  };

  const statusBreakdown = [
    { label: "Saved", count: scholarships.filter((s) => s.status === "saved").length, color: "bg-secondary" },
    { label: "In Progress", count: inProgress, color: "bg-blue-500" },
    { label: "Submitted", count: submitted, color: "bg-purple-500" },
    { label: "Awarded", count: awarded, color: "bg-green-500" },
    { label: "Rejected", count: rejected, color: "bg-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your application overview</p>
          </div>
          <Link to="/scholarships/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{loading ? "–" : stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Advisor */}
        <AdvisorCard scholarships={scholarships} loading={loading} />

        {/* Middle Row: Progress + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{loading ? "–" : `${completionRate}%`}</span>
                <span className="text-sm text-muted-foreground pb-1">submitted or awarded</span>
              </div>
              <Progress value={loading ? 0 : completionRate} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Won</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {loading ? "–" : `$${totalAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Added This Week</span>
                  <span className="font-semibold">{loading ? "–" : recentlyAdded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-semibold">{loading ? "–" : inProgress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statusBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-sm font-semibold">{loading ? "–" : item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines. Add an application to get started!</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 8).map((s) => {
                  const days = differenceInDays(new Date(s.deadline!), new Date());
                  return (
                    <Link
                      key={s.id}
                      to={`/scholarships/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.organization}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.amount && (
                          <span className="text-sm font-semibold">${Number(s.amount).toLocaleString()}</span>
                        )}
                        <Badge className={getUrgencyColor(s.deadline!)}>
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
