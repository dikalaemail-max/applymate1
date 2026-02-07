import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

const statusLabels: Record<string, string> = {
  saved: "Saved", in_progress: "In Progress", submitted: "Submitted", awarded: "Awarded", rejected: "Rejected",
};

export default function SharedWithMe() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("shared_scholarships")
      .select("scholarship_id")
      .eq("shared_with", user.id)
      .then(async ({ data: shared }) => {
        if (shared && shared.length > 0) {
          const ids = shared.map((s) => s.scholarship_id);
          const { data } = await supabase.from("scholarships").select("*").in("id", ids);
          setScholarships(data || []);
        }
        setLoading(false);
      });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shared with Me</h1>
          <p className="text-muted-foreground mt-1">Scholarships friends have shared</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : scholarships.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No shared scholarships yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {scholarships.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.organization || "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {s.amount && <span className="text-sm font-semibold">${Number(s.amount).toLocaleString()}</span>}
                    {s.deadline && <span className="text-xs text-muted-foreground">{format(new Date(s.deadline), "MMM d, yyyy")}</span>}
                    <Badge variant="secondary">{statusLabels[s.status]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
