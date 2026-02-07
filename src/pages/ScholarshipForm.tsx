import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Globe, FileText, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ScholarshipStatus = Database["public"]["Enums"]["scholarship_status"];

export default function ScholarshipForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    organization: "",
    amount: "",
    deadline: "",
    link: "",
    status: "saved" as ScholarshipStatus,
    eligibility_notes: "",
    tags: "",
    notes: "",
  });

  const handleExtract = async (mode: "text" | "url") => {
    const payload = mode === "text" ? { text: pasteText } : { url: pasteUrl };

    if (mode === "text" && !pasteText.trim()) {
      toast({ title: "Paste some text first", variant: "destructive" });
      return;
    }
    if (mode === "url" && !pasteUrl.trim()) {
      toast({ title: "Enter a URL first", variant: "destructive" });
      return;
    }

    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-scholarship", {
        body: payload,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Extraction failed");

      const d = data.data;
      setForm((prev) => ({
        ...prev,
        name: d.name || prev.name,
        organization: d.organization || prev.organization,
        amount: d.amount != null ? String(d.amount) : prev.amount,
        deadline: d.deadline || prev.deadline,
        link: d.link || prev.link,
        eligibility_notes: d.eligibility_notes || prev.eligibility_notes,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : prev.tags,
      }));

      toast({ title: "Fields auto-filled — review and save!" });
    } catch (err: any) {
      console.error("Extraction error:", err);
      toast({
        title: "Extraction failed",
        description: err.message || "Could not extract scholarship details",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    const { error } = await supabase.from("scholarships").insert({
      user_id: user.id,
      name: form.name,
      organization: form.organization || null,
      amount: form.amount ? parseFloat(form.amount) : null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      link: form.link || null,
      status: form.status,
      eligibility_notes: form.eligibility_notes || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Scholarship added!" });
      navigate("/scholarships");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Smart Import Section */}
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Import
            </CardTitle>
            <CardDescription>
              Paste scholarship text or a URL and let AI fill in the details for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text">
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1 gap-2">
                  <Globe className="h-4 w-4" />
                  From URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3 mt-3">
                <Textarea
                  placeholder="Paste scholarship details from an email, flyer, website, etc..."
                  className="min-h-[120px]"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  disabled={extracting}
                />
                <Button
                  onClick={() => handleExtract("text")}
                  disabled={extracting || !pasteText.trim()}
                  className="w-full gap-2"
                >
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {extracting ? "Extracting..." : "Extract Details"}
                </Button>
              </TabsContent>

              <TabsContent value="url" className="space-y-3 mt-3">
                <Input
                  type="url"
                  placeholder="https://example.com/scholarship-page"
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  disabled={extracting}
                />
                <Button
                  onClick={() => handleExtract("url")}
                  disabled={extracting || !pasteUrl.trim()}
                  className="w-full gap-2"
                >
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  {extracting ? "Fetching & Extracting..." : "Fetch & Extract"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Scholarship</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scholarship Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ScholarshipStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Application Link</Label>
                <Input id="link" type="url" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" placeholder="STEM, graduate, need-based" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Notes</Label>
                <Textarea id="eligibility" value={form.eligibility_notes} onChange={(e) => setForm({ ...form, eligibility_notes: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Draft ideas, requirements, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save Scholarship"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
