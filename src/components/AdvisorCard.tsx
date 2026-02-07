import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, RefreshCw, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

interface Props {
  scholarships: Scholarship[];
  loading: boolean;
}

export function AdvisorCard({ scholarships, loading: dataLoading }: Props) {
  const { toast } = useToast();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const summary = scholarships.map((s) => ({
        name: s.name,
        status: s.status,
        deadline: s.deadline,
        amount: s.amount,
        notes: s.notes ? "yes" : "no",
      }));
      const { data, error } = await supabase.functions.invoke("ai-advisor", {
        body: { mode: "dashboard", applications: summary },
      });
      if (error) throw error;
      setAdvice(data?.advice || "No advice available.");
      setHasFetched(true);
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Advisor
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdvice}
          disabled={loading || dataLoading}
          className="gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {hasFetched ? "Refresh" : "Get Advice"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your applications...
          </div>
        ) : advice ? (
          <p className="text-sm leading-relaxed">{advice}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click "Get Advice" to receive personalized, AI-powered strategic guidance based on your applications.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
