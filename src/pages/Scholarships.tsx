import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus, Search, ExternalLink, Download, LayoutGrid, LayoutList, X,
  GripVertical, Star, Archive, ArchiveRestore, Trash2, CheckSquare,
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Database } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;
type ScholarshipStatus = Database["public"]["Enums"]["scholarship_status"];

const statusColors: Record<string, string> = {
  saved: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  submitted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  awarded: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-destructive/10 text-destructive",
  archived: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  saved: "Saved",
  in_progress: "In Progress",
  submitted: "Submitted",
  awarded: "Awarded",
  rejected: "Rejected",
  archived: "Archived",
};

function getUrgencyColor(deadline: string) {
  const days = differenceInDays(new Date(deadline), new Date());
  if (days < 0) return "text-destructive";
  if (days <= 3) return "text-destructive";
  if (days <= 7) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

function getUrgencyLabel(deadline: string) {
  const days = differenceInDays(new Date(deadline), new Date());
  if (days < 0) return "Overdue";
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days}d left`;
  return format(new Date(deadline), "MMM d, yyyy");
}

function exportCSV(scholarships: Scholarship[]) {
  const headers = ["Name", "Organization", "Amount", "Deadline", "Status", "Tags", "Link", "Notes"];
  const rows = scholarships.map((s) => [
    s.name, s.organization || "", s.amount?.toString() || "",
    s.deadline ? format(new Date(s.deadline), "yyyy-MM-dd") : "",
    statusLabels[s.status] || s.status, (s.tags || []).join("; "),
    s.link || "", (s.notes || "").replace(/\n/g, " "),
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
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("position");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [compact, setCompact] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [showAllTags, setShowAllTags] = useState(false);

  const fetchScholarships = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    setScholarships(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    scholarships.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [scholarships]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeScholarships = useMemo(() => scholarships.filter((s) => s.status !== "archived"), [scholarships]);
  const archivedScholarships = useMemo(() => scholarships.filter((s) => s.status === "archived"), [scholarships]);

  const filtered = useMemo(() => {
    const source = tab === "active" ? activeScholarships : archivedScholarships;
    let result = source.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.organization?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchTags = selectedTags.length === 0 || selectedTags.every((t) => s.tags?.includes(t));
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
      case "favorited":
        result = [...result].sort((a, b) => (b.is_favorited ? 1 : 0) - (a.is_favorited ? 1 : 0));
        break;
      case "position":
      default:
        result = [...result].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        break;
    }
    return result;
  }, [scholarships, search, statusFilter, selectedTags, sortBy, tab, activeScholarships, archivedScholarships]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || sortBy !== "position" || tab !== "active") return;
    const items = [...filtered];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Optimistic update
    const updates = items.map((item, idx) => ({ ...item, position: idx }));
    setScholarships((prev) =>
      prev.map((s) => {
        const updated = updates.find((u) => u.id === s.id);
        return updated ? { ...s, position: updated.position } : s;
      })
    );

    // Persist
    await Promise.all(
      updates.map((item) =>
        supabase.from("scholarships").update({ position: item.position }).eq("id", item.id)
      )
    );
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const s = scholarships.find((s) => s.id === id);
    if (!s) return;
    const newVal = !s.is_favorited;
    setScholarships((prev) => prev.map((p) => p.id === id ? { ...p, is_favorited: newVal } : p));
    await supabase.from("scholarships").update({ is_favorited: newVal }).eq("id", id);
  };

  const bulkArchive = async () => {
    const ids = Array.from(selectedIds);
    setScholarships((prev) => prev.map((s) => ids.includes(s.id) ? { ...s, status: "archived" as ScholarshipStatus } : s));
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => supabase.from("scholarships").update({ status: "archived" }).eq("id", id)));
    toast({ title: `${ids.length} application(s) archived` });
  };

  const bulkRestore = async () => {
    const ids = Array.from(selectedIds);
    setScholarships((prev) => prev.map((s) => ids.includes(s.id) ? { ...s, status: "saved" as ScholarshipStatus } : s));
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => supabase.from("scholarships").update({ status: "saved" }).eq("id", id)));
    toast({ title: `${ids.length} application(s) restored` });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setScholarships((prev) => prev.filter((s) => !ids.includes(s.id)));
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => supabase.from("scholarships").delete().eq("id", id)));
    toast({ title: `${ids.length} application(s) deleted` });
  };

  const quickStatusChange = async (id: string, status: ScholarshipStatus, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScholarships((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    await supabase.from("scholarships").update({ status }).eq("id", id);
  };

  const isDragEnabled = sortBy === "position" && tab === "active" && !search && statusFilter === "all" && selectedTags.length === 0;

  const renderCard = (s: Scholarship, index: number) => {
    const isSelected = selectedIds.has(s.id);
    const inner = (
      <Card className={`hover:shadow-md transition-all cursor-pointer group ${isSelected ? "ring-2 ring-primary" : ""} ${s.is_favorited ? "border-amber-300/50" : ""}`}>
        <CardContent className={compact ? "py-3 px-4" : "flex items-center gap-3 py-3 px-4"}>
          {!compact && isDragEnabled && (
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <button
            onClick={(e) => toggleSelect(s.id, e)}
            className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"}`}
          >
            {isSelected && <CheckSquare className="h-3.5 w-3.5" />}
          </button>
          {compact ? (
            <div className="space-y-1 min-w-0 mt-2">
              <div className="flex items-center gap-1.5">
                <button onClick={(e) => toggleFavorite(s.id, e)} className="shrink-0">
                  <Star className={`h-3.5 w-3.5 transition-colors ${s.is_favorited ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 hover:text-amber-400"}`} />
                </button>
                <p className="font-semibold truncate text-sm">{s.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${statusColors[s.status]}`}>{statusLabels[s.status]}</Badge>
                {s.amount && <span className="text-xs font-semibold">${Number(s.amount).toLocaleString()}</span>}
                {s.deadline && (
                  <span className={`text-xs ${getUrgencyColor(s.deadline)}`}>{getUrgencyLabel(s.deadline)}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => toggleFavorite(s.id, e)} className="shrink-0">
                    <Star className={`h-3.5 w-3.5 transition-colors ${s.is_favorited ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 hover:text-amber-400"}`} />
                  </button>
                  <p className="font-semibold truncate">{s.name}</p>
                  {s.link && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground truncate ml-6">{s.organization || "No organization"}</p>
                {s.tags && s.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap ml-6">
                    {s.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs py-0">{t}</Badge>
                    ))}
                    {s.tags.length > 3 && <span className="text-xs text-muted-foreground">+{s.tags.length - 3}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-6 sm:ml-0">
                {s.amount && <span className="text-sm font-semibold">${Number(s.amount).toLocaleString()}</span>}
                {s.deadline && (
                  <span className={`text-xs whitespace-nowrap ${getUrgencyColor(s.deadline)}`}>{getUrgencyLabel(s.deadline)}</span>
                )}
                <Select
                  value={s.status}
                  onValueChange={(v) => quickStatusChange(s.id, v as ScholarshipStatus, { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent)}
                >
                  <SelectTrigger className={`h-7 text-xs w-auto gap-1 border-0 ${statusColors[s.status]}`} onClick={(e) => e.preventDefault()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );

    if (isDragEnabled && !compact) {
      return (
        <Draggable key={s.id} draggableId={s.id} index={index}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <Link to={`/scholarships/${s.id}`}>{inner}</Link>
            </div>
          )}
        </Draggable>
      );
    }

    return (
      <Link key={s.id} to={`/scholarships/${s.id}`}>{inner}</Link>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground mt-1">
              {activeScholarships.length} active · {archivedScholarships.length} archived
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCSV(scholarships)} disabled={scholarships.length === 0}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Link to="/scholarships/new">
              <Button className="gradient-primary border-0 text-white shadow-lg shadow-primary/20 rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add New
              </Button>
            </Link>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl glass-card animate-fade-in">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <div className="flex-1" />
            {tab === "active" ? (
              <Button variant="outline" size="sm" onClick={bulkArchive} className="gap-1">
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={bulkRestore} className="gap-1">
                <ArchiveRestore className="h-3.5 w-3.5" /> Restore
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={bulkDelete} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v as "active" | "archived"); setSelectedIds(new Set()); }}>
          <Select value={tab} onValueChange={(v) => { setTab(v as "active" | "archived"); setSelectedIds(new Set()); }}>
            <SelectTrigger className="w-auto gap-2 font-semibold text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active ({activeScholarships.length})</SelectItem>
              <SelectItem value="archived">Archived ({archivedScholarships.length})</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              {tab === "active" && (
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
              )}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">Custom Order</SelectItem>
                  <SelectItem value="favorited">Favorites First</SelectItem>
                  <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                  <SelectItem value="amount">Amount (Highest)</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setCompact(!compact)} title={compact ? "Detailed view" : "Compact view"}>
                {compact ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                {allTags.slice(0, showAllTags ? allTags.length : 5).map((tag) => (
                  <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleTag(tag)}>
                    {tag}
                    {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
                {allTags.length > 5 && (
                  <button onClick={() => setShowAllTags(!showAllTags)} className="text-xs text-primary hover:underline">
                    {showAllTags ? "Show less" : `+${allTags.length - 5} more`}
                  </button>
                )}
              </div>
            )}

        {/* List */}
            <DragDropContext onDragEnd={handleDragEnd}>
            <TabsContent value="active" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No applications found</p>
                    <Link to="/scholarships/new">
                      <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Your First Application</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : isDragEnabled && !compact ? (
                <Droppable droppableId="scholarships">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid gap-2">
                      {filtered.map((s, i) => renderCard(s, i))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ) : (
                <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" : "grid gap-2"}>
                  {filtered.map((s, i) => renderCard(s, i))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-0">
              {archivedScholarships.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Archive className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">No archived applications</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Archive completed or inactive applications to keep your list clean</p>
                  </CardContent>
                </Card>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No archived applications match your search</p>
              ) : (
                <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" : "grid gap-2"}>
                  {filtered.map((s, i) => renderCard(s, i))}
                </div>
              )}
            </TabsContent>
            </DragDropContext>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
