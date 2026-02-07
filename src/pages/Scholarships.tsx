import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, ExternalLink } from "lucide-react";
import { format, isPast } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

const statusColors: Record<string, string> = {
  saved: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  submitted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  awarded: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  saved: "Saved",
  in_progress: "In Progress",
  submitted: "Submitted",
  awarded: "Awarded",
  rejected: "Rejected",
};

export default function Scholarships() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("scholarships")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setScholarships(data || []);
        setLoading(false);
      });
  }, [user]);

  const filtered = scholarships.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.organization?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground mt-1">{scholarships.length} application{scholarships.length !== 1 ? "s" : ""} tracked</p>
          </div>
          <Link to="/scholarships/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="awarded">Awarded</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No applications found</p>
              <Link to="/scholarships/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((s) => (
              <Link key={s.id} to={`/scholarships/${s.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4 px-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{s.name}</p>
                        {s.link && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{s.organization || "No organization"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {s.amount && <span className="text-sm font-semibold">${Number(s.amount).toLocaleString()}</span>}
                      {s.deadline && (
                        <span className={`text-xs ${isPast(new Date(s.deadline)) ? "text-destructive" : "text-muted-foreground"}`}>
                          {format(new Date(s.deadline), "MMM d, yyyy")}
                        </span>
                      )}
                      <Badge className={statusColors[s.status]}>
                        {statusLabels[s.status]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}