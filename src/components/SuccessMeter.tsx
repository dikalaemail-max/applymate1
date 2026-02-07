import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Gauge, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships">;

interface Analysis {
  score: number;
  confidence: "low" | "medium" | "high";
  summary: string;
  strengths: string[];
  gaps: string[];
  tips: string[];
}

const confidenceColors: Record<string, string> = {
  low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function getScoreColor(score: number) {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500";
}

function getProgressColor(score: number) {
  if (score >= 70) return "[&>div]:bg-green-500";
  if (score >= 40) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-red-500";
}

export function SuccessMeter({ scholarship }: { scholarship: Scholarship }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incompleteProfile, setIncompleteProfile] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setIncompleteProfile(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("success-meter", {
        body: { scholarshipId: scholarship.id },
      });
      if (fnError) throw fnError;
      if (data.error === "incomplete_profile") {
        setIncompleteProfile(true);
        return;
      }
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e: any) {
      setError(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Success Meter
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={analyze}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {analysis ? "Re-analyze" : "Analyze"}
        </Button>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && !error && !incompleteProfile && (
          <p className="text-sm text-muted-foreground">
            Get an AI-powered estimate of your chances based on your profile and this scholarship's requirements.
          </p>
        )}

        {incompleteProfile && (
          <div className="text-center py-4 space-y-3">
            <UserCircle className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Complete your profile to get a success estimate.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              Complete Profile
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Analyzing your match...</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {analysis && !loading && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}%</p>
                <Badge className={`text-xs mt-1 ${confidenceColors[analysis.confidence]}`}>
                  {analysis.confidence} confidence
                </Badge>
              </div>
              <div className="flex-1">
                <Progress value={analysis.score} className={`h-3 ${getProgressColor(analysis.score)}`} />
                <p className="text-sm text-muted-foreground mt-2">{analysis.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Strengths
                </p>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {analysis.gaps.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" /> Areas to Improve
                </p>
                <ul className="space-y-1">
                  {analysis.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {analysis.tips.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" /> Tips
                </p>
                <ul className="space-y-1">
                  {analysis.tips.map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
