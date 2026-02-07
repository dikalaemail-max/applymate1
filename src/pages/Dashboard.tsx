import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, GraduationCap, Clock, Send, Trophy } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
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
  const upcoming = scholarships.filter(
    (s) => s.deadline && !isPast(new Date(s.deadline)) && s.status !== "submitted" && s.status !== "awarded" && s.status !== "rejected"
  );

  const stats = [
    { label: "Total Saved", value: total, icon: GraduationCap, color: "text-primary" },
    { label: "Upcoming Deadlines", value: upcoming.length, icon: Clock, color: "text-warning" },
    { label: "Submitted", value: submitted, icon: Send, color: "text-blue-500" },
    { label: "Awarded", value: awarded, icon: Trophy, color: "text-success" },
  ];

  const getUrgencyColor = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return "bg-destructive/10 text-destructive";
    if (days <= 3) return "bg-destructive/10 text-destructive";
    if (days <= 7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your scholarship overview</p>
          </div>
          <Link to="/scholarships/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Scholarship
            </Button>
          </Link>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines. Add a scholarship to get started!</p>
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
