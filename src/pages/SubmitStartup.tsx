import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { Database } from "@/integrations/supabase/types";

type IndustryType = Database["public"]["Enums"]["industry_type"];
type StageType = Database["public"]["Enums"]["stage_type"];
type CompensationType = Database["public"]["Enums"]["compensation_type"];

interface OpenRole {
  title: string;
  compensation: CompensationType;
  hours_per_week: number;
}

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Other"];
const STAGES: StageType[] = ["Idea", "Pre-seed", "Seed", "Series A+"];
const COMPENSATIONS: CompensationType[] = ["Paid", "Equity", "Unpaid"];

export default function SubmitStartupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "" as IndustryType | "",
    stage: "" as StageType | "",
    founded_year: new Date().getFullYear(),
    team_size: 1,
    website_url: "",
    is_hiring: false,
    open_to_vc: false,
    harvard_affiliation: "",
  });
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const addRole = () => {
    setRoles([...roles, { title: "", compensation: "Paid", hours_per_week: 20 }]);
  };

  const removeRole = (i: number) => {
    setRoles(roles.filter((_, idx) => idx !== i));
  };

  const updateRole = (i: number, field: keyof OpenRole, value: string | number) => {
    setRoles(roles.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.industry || !form.stage) {
      setError("Please select an industry and stage.");
      return;
    }

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    setSubmitting(true);

    const { data: startup, error: insertError } = await supabase
      .from("startups")
      .insert({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim(),
        industry: form.industry as IndustryType,
        stage: form.stage as StageType,
        founded_year: form.founded_year,
        team_size: form.team_size,
        website_url: form.website_url.trim() || null,
        is_hiring: form.is_hiring,
        open_to_vc: form.open_to_vc,
        harvard_affiliation: form.harvard_affiliation.trim(),
      })
      .select()
      .single();

    if (insertError || !startup) {
      setSubmitting(false);
      setError(insertError?.message ?? "Failed to create startup.");
      return;
    }

    // Insert roles
    if (roles.length > 0) {
      const validRoles = roles.filter(r => r.title.trim());
      if (validRoles.length > 0) {
        await supabase.from("open_roles").insert(
          validRoles.map(r => ({ startup_id: startup.id, ...r }))
        );
      }
    }

    setSubmitting(false);
    navigate(`/startup/${startup.id}`);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Add Your Startup</h1>
          <p className="text-muted-foreground">Share your venture with the Harvard founder community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Basic Info</h2>

            <div>
              <Label htmlFor="name" className="text-sm font-medium">Startup Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                placeholder="e.g. Acme Labs"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">One-line Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                maxLength={200}
                placeholder="What does your startup do in one sentence?"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Industry *</Label>
                <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v as IndustryType })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Stage *</Label>
                <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v as StageType })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="founded_year" className="text-sm font-medium">Founded Year *</Label>
                <Input
                  id="founded_year"
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={form.founded_year}
                  onChange={e => setForm({ ...form, founded_year: parseInt(e.target.value) })}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="team_size" className="text-sm font-medium">Team Size *</Label>
                <Input
                  id="team_size"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.team_size}
                  onChange={e => setForm({ ...form, team_size: parseInt(e.target.value) })}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-sm font-medium">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={form.website_url}
                onChange={e => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://yourstartup.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="affiliation" className="text-sm font-medium">Harvard Affiliation *</Label>
              <Input
                id="affiliation"
                value={form.harvard_affiliation}
                onChange={e => setForm({ ...form, harvard_affiliation: e.target.value })}
                required
                placeholder="e.g. Harvard College '26, Harvard Business School '25"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Preferences</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Actively Hiring</p>
                <p className="text-xs text-muted-foreground mt-0.5">Show a hiring badge on your card</p>
              </div>
              <Switch
                checked={form.is_hiring}
                onCheckedChange={v => setForm({ ...form, is_hiring: v })}
              />
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Open to VC Introductions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Let investors know you're fundraising</p>
              </div>
              <Switch
                checked={form.open_to_vc}
                onCheckedChange={v => setForm({ ...form, open_to_vc: v })}
              />
            </div>
          </div>

          {/* Open Roles */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground text-lg">Open Roles</h2>
              <Button type="button" variant="outline" size="sm" onClick={addRole} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Role
              </Button>
            </div>

            {roles.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No open roles yet. Click "Add Role" to add one.</p>
            )}

            <div className="space-y-4">
              {roles.map((role, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 w-7 h-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRole(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role Title</Label>
                    <Input
                      value={role.title}
                      onChange={e => updateRole(i, "title", e.target.value)}
                      placeholder="e.g. Full-stack Engineer"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Compensation</Label>
                      <Select value={role.compensation} onValueChange={v => updateRole(i, "compensation", v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPENSATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hrs / Week</Label>
                      <Input
                        type="number"
                        min={1}
                        max={80}
                        value={role.hours_per_week}
                        onChange={e => updateRole(i, "hours_per_week", parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base">
            {submitting ? "Publishing…" : "Publish Startup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
