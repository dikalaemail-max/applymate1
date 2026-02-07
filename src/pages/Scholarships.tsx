import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, ExternalLink, Download, LayoutGrid, LayoutList, X } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
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

function getUrgencyColor(deadline: string) {
  const days = differenceInDays(new Date(deadline), new Date());
  if (days < 0) return "text-destructive";
  if (days <= 3) return "text-destructive";
  if (days <= 7) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

function exportCSV(scholarships: Scholarship[]) {
  const headers = ["Name", "Organization", "Amount", "Deadline", "Status", "Tags", "Link", "Notes"];
  const rows = scholarships.map((s) => [
    s.name,
    s.organization || "",
    s.amount?.toString() || "",
    s.deadline ? format(new Date(s.deadline), "yyyy-MM-dd") : "",
    statusLabels[s.status],
    (s.tags || []).join("; "),
    s.link || "",
    (s.notes || "").replace(/\n/g, " "),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `applymate-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Scholarships() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [compact, setCompact] = useState(false);

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

  const allTags = useMemo(() => {
    const set = new Set<string>();
    scholarships.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [scholarships]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filtered = useMemo(() => {
    let result = scholarships.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.organization?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchTags =
        selectedTags.length === 0 || selectedTags.every((t) => s.tags?.includes(t));
      return matchSearch && matchStatus && matchTags;
    });

    switch (sortBy) {
      case "deadline":
        result = [...result].sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      case "amount":
        result = [...result].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return result;
  }, [scholarships, search, statusFilter, selectedTags, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground mt-1">
              {scholarships.length} application{scholarships.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCSV(scholarships)} disabled={scholarships.length === 0}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Link to="/scholarships/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add New
              </Button>
            </Link>
          </div>
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
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
              <SelectItem value="amount">Amount (Highest)</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => setCompact(!compact)} title={compact ? "Detailed view" : "Compact view"}>
            {compact ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        )}

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
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "grid gap-3"}>
            {filtered.map((s) => (
              <Link key={s.id} to={`/scholarships/${s.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className={compact ? "py-3 px-4" : "flex items-center justify-between py-4 px-5"}>
                    {compact ? (
                      <div className="space-y-1">
                        <p className="font-semibold truncate text-sm">{s.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${statusColors[s.status]}`}>{statusLabels[s.status]}</Badge>
                          {s.amount && <span className="text-xs font-semibold">${Number(s.amount).toLocaleString()}</span>}
                          {s.deadline && (
                            <span className={`text-xs ${getUrgencyColor(s.deadline)}`}>
                              {format(new Date(s.deadline), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{s.name}</p>
                            {s.link && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{s.organization || "No organization"}</p>
                          {s.tags && s.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {s.tags.slice(0, 3).map((t) => (
                                <Badge key={t} variant="outline" className="text-xs py-0">{t}</Badge>
                              ))}
                              {s.tags.length > 3 && <span className="text-xs text-muted-foreground">+{s.tags.length - 3}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {s.amount && <span className="text-sm font-semibold">${Number(s.amount).toLocaleString()}</span>}
                          {s.deadline && (
                            <span className={`text-xs ${getUrgencyColor(s.deadline)}`}>
                              {format(new Date(s.deadline), "MMM d, yyyy")}
                            </span>
                          )}
                          <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                        </div>
                      </>
                    )}
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
