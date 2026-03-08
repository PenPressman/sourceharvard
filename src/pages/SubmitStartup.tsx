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

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech" as IndustryType, "Other"];
const STAGES: StageType[] = ["Idea", "Pre-seed", "Seed", "Series A+"];
const COMPENSATIONS: CompensationType[] = ["Paid", "Equity", "Unpaid"];
const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "Marketplace", "Other"];

export default function SubmitStartupPage() {
  const { user, loading, role, roleLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    full_description: "",
    industry: "" as IndustryType | "",
    stage: "" as StageType | "",
    founded_year: new Date().getFullYear(),
    team_size: 1,
    website_url: "",
    tech_stack: "",
    business_model: "",
    target_market: "",
    traction: "",
    funding_raised: "",
    pitch_deck_url: "",
    harvard_affiliation: "",
    is_hiring: false,
    open_to_vc: false,
    looking_for_cofounder: false,
    twitter_url: "",
    linkedin_url: "",
  });
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) navigate("/login");
      else if (role && role !== "founder") navigate("/");
    }
  }, [user, loading, role, roleLoading, navigate]);

  const addRole = () => setRoles([...roles, { title: "", compensation: "Paid", hours_per_week: 20 }]);
  const removeRole = (i: number) => setRoles(roles.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: keyof OpenRole, value: string | number) => {
    setRoles(roles.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.industry || !form.stage) { setError("Please select an industry and stage."); return; }
    if (!user) { setError("You must be signed in."); return; }
    setSubmitting(true);

    const { data: startup, error: insertError } = await supabase
      .from("startups")
      .insert({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim(),
        full_description: form.full_description.trim() || null,
        industry: form.industry as IndustryType,
        stage: form.stage as StageType,
        founded_year: form.founded_year,
        team_size: form.team_size,
        website_url: form.website_url.trim() || null,
        tech_stack: form.tech_stack.trim() || null,
        business_model: form.business_model as any || null,
        target_market: form.target_market.trim() || null,
        traction: form.traction.trim() || null,
        funding_raised: form.funding_raised.trim() || null,
        pitch_deck_url: form.pitch_deck_url.trim() || null,
        harvard_affiliation: form.harvard_affiliation.trim(),
        is_hiring: form.is_hiring,
        open_to_vc: form.open_to_vc,
        looking_for_cofounder: form.looking_for_cofounder,
        twitter_url: form.twitter_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
      })
      .select().single();

    if (insertError || !startup) {
      setSubmitting(false);
      setError(insertError?.message ?? "Failed to create startup.");
      return;
    }

    if (roles.length > 0) {
      const validRoles = roles.filter(r => r.title.trim());
      if (validRoles.length > 0) {
        await supabase.from("open_roles").insert(validRoles.map(r => ({ startup_id: startup.id, ...r })));
      }
    }

    setSubmitting(false);
    navigate(`/startup/${startup.id}`);
  };

  if (loading || roleLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Add Your Startup</h1>
          <p className="text-muted-foreground">Share your venture with the Harvard founder community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Basic Info</h2>
            <div>
              <Label className="text-sm font-medium">Startup Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} placeholder="Acme Labs" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">One-line Description * <span className="text-muted-foreground font-normal">(max 160 chars)</span></Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required maxLength={160} placeholder="What do you do in one sentence?" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Full Description</Label>
              <Textarea value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} rows={4} placeholder="Tell the full story of what you're building and why…" className="mt-1.5 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Industry *</Label>
                <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v as IndustryType })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Stage *</Label>
                <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v as StageType })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Founded *</Label>
                <Input type="number" min={2000} max={new Date().getFullYear()} value={form.founded_year} onChange={e => setForm({ ...form, founded_year: parseInt(e.target.value) })} required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Team Size *</Label>
                <Input type="number" min={1} max={10000} value={form.team_size} onChange={e => setForm({ ...form, team_size: parseInt(e.target.value) })} required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Business Model</Label>
                <Select value={form.business_model} onValueChange={v => setForm({ ...form, business_model: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BUSINESS_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Target Market</Label>
              <Input value={form.target_market} onChange={e => setForm({ ...form, target_market: e.target.value })} placeholder="Who is your customer?" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Tech Stack</Label>
              <Input value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Python, AWS…" className="mt-1.5" />
            </div>
          </section>

          {/* Traction & Funding */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Traction & Funding</h2>
            <div>
              <Label className="text-sm font-medium">Traction <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input value={form.traction} onChange={e => setForm({ ...form, traction: e.target.value })} placeholder="500 users, $10k MRR, 2,000 waitlist…" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Funding Raised <span className="text-muted-foreground font-normal">(visible to founders & investors only)</span></Label>
              <Input value={form.funding_raised} onChange={e => setForm({ ...form, funding_raised: e.target.value })} placeholder="$150k pre-seed from XYZ…" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Pitch Deck URL <span className="text-muted-foreground font-normal">(visible to investors only)</span></Label>
              <Input type="url" value={form.pitch_deck_url} onChange={e => setForm({ ...form, pitch_deck_url: e.target.value })} placeholder="https://docsend.com/…" className="mt-1.5" />
            </div>
          </section>

          {/* Links */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Links</h2>
            <div>
              <Label className="text-sm font-medium">Harvard Affiliation *</Label>
              <Input value={form.harvard_affiliation} onChange={e => setForm({ ...form, harvard_affiliation: e.target.value })} required placeholder="Harvard College '26, HBS '25" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Website</Label>
                <Input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://…" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">LinkedIn</Label>
                <Input type="url" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="linkedin.com/company/…" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Twitter / X</Label>
              <Input type="url" value={form.twitter_url} onChange={e => setForm({ ...form, twitter_url: e.target.value })} placeholder="twitter.com/…" className="mt-1.5" />
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-foreground text-lg">Preferences</h2>
            {[
              { key: "is_hiring", label: "Actively Hiring", desc: "Show a hiring badge on your listing" },
              { key: "open_to_vc", label: "Open to VC Introductions", desc: "Signal you're fundraising" },
              { key: "looking_for_cofounder", label: "Looking for a Co-Founder", desc: "Appear in co-founder matching" },
            ].map(({ key, label, desc }) => (
              <div key={key} className={key !== "is_hiring" ? "border-t border-border pt-4" : ""}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={v => setForm({ ...form, [key]: v })}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Open Roles */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground text-lg">Open Roles</h2>
              <Button type="button" variant="outline" size="sm" onClick={addRole} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />Add Role
              </Button>
            </div>
            {roles.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No open roles yet.</p>
            )}
            <div className="space-y-4">
              {roles.map((role, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeRole(i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role Title</Label>
                    <Input value={role.title} onChange={e => updateRole(i, "title", e.target.value)} placeholder="Full-stack Engineer" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Compensation</Label>
                      <Select value={role.compensation} onValueChange={v => updateRole(i, "compensation", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{COMPENSATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hrs / Week</Label>
                      <Input type="number" min={1} max={80} value={role.hours_per_week} onChange={e => updateRole(i, "hours_per_week", parseInt(e.target.value) || 1)} className="mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
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
