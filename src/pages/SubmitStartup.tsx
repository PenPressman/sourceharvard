import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { Database } from "@/integrations/supabase/types";

type IndustryType = Database["public"]["Enums"]["industry_type"];
type StageType = Database["public"]["Enums"]["stage_type"];
type CompensationType = Database["public"]["Enums"]["compensation_type"];

interface OpenRole { title: string; compensation: CompensationType; hours_per_week: number; }

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech" as IndustryType, "Other"];
const STAGES: StageType[] = ["Pre-idea" as StageType, "Idea", "Pre-seed", "Seed", "Series A+"];
const COMPENSATIONS: CompensationType[] = ["Paid", "Equity", "Unpaid"];
const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "Marketplace", "Other"];

const inputCls = "w-full h-11 px-4 font-body text-[15px] text-ink placeholder:text-slate bg-white border border-[#D6D0C4] rounded-sm outline-none focus:border-ink transition-colors duration-150";
const labelCls = "font-body text-[13px] font-medium text-ink uppercase tracking-[0.04em]";

export default function SubmitStartupPage() {
  const { user, loading, role, roleLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", description: "", full_description: "",
    industry: "" as IndustryType | "", stage: "" as StageType | "",
    founded_year: new Date().getFullYear(), team_size: 1,
    website_url: "", tech_stack: "", business_model: "",
    target_market: "", traction: "", funding_raised: "",
    pitch_deck_url: "", harvard_affiliation: "",
    is_hiring: false, open_to_vc: false, looking_for_cofounder: false,
    twitter_url: "", linkedin_url: "", contact_email: "",
    contact_visible_to_vcs: false, contact_visible_to_founders: false, contact_visible_to_public: false,
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
  const updateRole = (i: number, field: keyof OpenRole, value: string | number) =>
    setRoles(roles.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

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
        name: form.name.trim(), description: form.description.trim(),
        full_description: form.full_description.trim() || null,
        industry: form.industry as IndustryType, stage: form.stage as StageType,
        founded_year: form.founded_year, team_size: form.team_size,
        website_url: form.website_url.trim() || null, tech_stack: form.tech_stack.trim() || null,
        business_model: form.business_model as any || null, target_market: form.target_market.trim() || null,
        traction: form.traction.trim() || null, funding_raised: form.funding_raised.trim() || null,
        pitch_deck_url: form.pitch_deck_url.trim() || null, harvard_affiliation: form.harvard_affiliation.trim(),
        is_hiring: form.is_hiring, open_to_vc: form.open_to_vc, looking_for_cofounder: form.looking_for_cofounder,
        twitter_url: form.twitter_url.trim() || null, linkedin_url: form.linkedin_url.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_visible_to_vcs: form.contact_visible_to_vcs,
        contact_visible_to_founders: form.contact_visible_to_founders,
        contact_visible_to_public: form.contact_visible_to_public,
      })
      .select().single();

    if (insertError || !startup) { setSubmitting(false); setError(insertError?.message ?? "Failed to create startup."); return; }

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

  const sectionCls = "bg-white border border-[#D6D0C4] rounded-sm p-6 space-y-5";
  const sectionHeadCls = "font-display font-bold text-[20px] text-ink";

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="container mx-auto py-16 px-6 max-w-2xl">

        <div className="mb-12">
          <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-3">New Listing</p>
          <h1 className="font-display font-bold text-[39px] text-ink leading-[1.1]">Add Your Startup</h1>
          <p className="font-body text-[16px] text-slate mt-2">Share your venture with the Harvard founder community.</p>
        </div>

        <hr className="border-[#D6D0C4] mb-10" />

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <section className={sectionCls}>
            <h2 className={sectionHeadCls}>Basic Info</h2>
            <div>
              <label className={labelCls}>Startup Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} placeholder="Acme Labs" className={`mt-2 ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>One-line Description * <span className="text-slate normal-case tracking-normal">(max 160 chars)</span></label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required maxLength={160} placeholder="What do you do in one sentence?" className={`mt-2 ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>Full Description</label>
              <Textarea value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} rows={4} placeholder="Tell the full story of what you're building and why…" className="mt-2 resize-none font-body text-[15px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Industry *</label>
                <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v as IndustryType })}>
                  <SelectTrigger className="mt-2 h-11 font-body text-[15px] rounded-sm border-[#D6D0C4]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i} className="font-body text-[14px]">{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>Stage *</label>
                <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v as StageType })}>
                  <SelectTrigger className="mt-2 h-11 font-body text-[15px] rounded-sm border-[#D6D0C4]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s} className="font-body text-[14px]">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Founded *</label>
                <input type="number" min={2000} max={new Date().getFullYear()} value={form.founded_year} onChange={e => setForm({ ...form, founded_year: parseInt(e.target.value) })} required className={`mt-2 ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>Team Size *</label>
                <input type="number" min={1} max={10000} value={form.team_size} onChange={e => setForm({ ...form, team_size: parseInt(e.target.value) })} required className={`mt-2 ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>Business Model</label>
                <Select value={form.business_model} onValueChange={v => setForm({ ...form, business_model: v })}>
                  <SelectTrigger className="mt-2 h-11 font-body text-[15px] rounded-sm border-[#D6D0C4]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BUSINESS_MODELS.map(m => <SelectItem key={m} value={m} className="font-body text-[14px]">{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Target Market</label>
              <input value={form.target_market} onChange={e => setForm({ ...form, target_market: e.target.value })} placeholder="Who is your customer?" className={`mt-2 ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>Tech Stack</label>
              <input value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Python, AWS…" className={`mt-2 ${inputCls}`} />
            </div>
          </section>

          {/* Traction & Funding */}
          <section className={sectionCls}>
            <h2 className={sectionHeadCls}>Traction & Funding</h2>
            <div>
              <label className={labelCls}>Traction <span className="text-slate normal-case tracking-normal">(optional)</span></label>
              <input value={form.traction} onChange={e => setForm({ ...form, traction: e.target.value })} placeholder="500 users, $10k MRR, 2,000 waitlist…" className={`mt-2 ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>Funding Raised <span className="text-slate normal-case tracking-normal">(founders & investors only)</span></label>
              <input value={form.funding_raised} onChange={e => setForm({ ...form, funding_raised: e.target.value })} placeholder="$150k pre-seed from XYZ…" className={`mt-2 ${inputCls}`} />
            </div>
            <div>
              <label className={labelCls}>Pitch Deck URL <span className="text-slate normal-case tracking-normal">(investors only)</span></label>
              <input type="url" value={form.pitch_deck_url} onChange={e => setForm({ ...form, pitch_deck_url: e.target.value })} placeholder="https://docsend.com/…" className={`mt-2 ${inputCls}`} />
            </div>
          </section>

          {/* Links */}
          <section className={sectionCls}>
            <h2 className={sectionHeadCls}>Links</h2>
            <div>
              <label className={labelCls}>Harvard Affiliation *</label>
              <input value={form.harvard_affiliation} onChange={e => setForm({ ...form, harvard_affiliation: e.target.value })} required placeholder="Harvard College '26, HBS '25" className={`mt-2 ${inputCls}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://…" className={`mt-2 ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>LinkedIn</label>
                <input type="url" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="linkedin.com/company/…" className={`mt-2 ${inputCls}`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Twitter / X</label>
              <input type="url" value={form.twitter_url} onChange={e => setForm({ ...form, twitter_url: e.target.value })} placeholder="twitter.com/…" className={`mt-2 ${inputCls}`} />
            </div>
          </section>

          {/* Preferences */}
          <section className={sectionCls}>
            <h2 className={sectionHeadCls}>Preferences</h2>
            {[
              { key: "is_hiring",             label: "Actively Hiring",              desc: "Show a hiring badge on your listing" },
              { key: "open_to_vc",            label: "Open to VC Introductions",     desc: "Signal you're fundraising" },
              { key: "looking_for_cofounder", label: "Looking for a Co-Founder",     desc: "Appear in co-founder matching" },
            ].map(({ key, label, desc }, i) => (
              <div key={key} className={i > 0 ? "border-t border-[#D6D0C4] pt-5" : ""}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-medium text-[15px] text-ink">{label}</p>
                    <p className="font-body text-[13px] text-slate mt-0.5">{desc}</p>
                  </div>
                  <Switch checked={form[key as keyof typeof form] as boolean} onCheckedChange={v => setForm({ ...form, [key]: v })} />
                </div>
              </div>
            ))}
          </section>

          {/* Contact Info */}
          <section className={sectionCls}>
            <div>
              <h2 className={sectionHeadCls}>Contact Info</h2>
              <p className="font-body text-[13px] text-slate mt-1">Control who can see your contact email on your profile.</p>
            </div>
            <div>
              <label className={labelCls}>Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} placeholder="founder@example.com" className={`mt-2 ${inputCls}`} />
            </div>
            {form.contact_email && (
              <div className="space-y-4 border-t border-[#D6D0C4] pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate">Visible to</p>
                {[
                  { key: "contact_visible_to_vcs",     label: "Investors (VCs)",  desc: "Approved investors can see your email" },
                  { key: "contact_visible_to_founders",label: "Other Founders",   desc: "Founders in the community can see your email" },
                  { key: "contact_visible_to_public",  label: "Everyone",         desc: "Visible to anyone browsing the directory" },
                ].map(({ key, label, desc }, i) => (
                  <div key={key} className={i > 0 ? "border-t border-[#D6D0C4] pt-4" : ""}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body font-medium text-[15px] text-ink">{label}</p>
                        <p className="font-body text-[13px] text-slate mt-0.5">{desc}</p>
                      </div>
                      <Switch checked={form[key as keyof typeof form] as boolean} onCheckedChange={v => setForm({ ...form, [key]: v })} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Open Roles */}
          <section className={sectionCls}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadCls}>Open Roles</h2>
              <button type="button" onClick={addRole} className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#EDE9DE] text-ink font-body text-[13px] border border-[#D6D0C4] rounded-sm hover:border-ink transition-colors duration-150">
                <Plus className="w-3.5 h-3.5" />Add Role
              </button>
            </div>
            {roles.length === 0 && <p className="font-body text-[14px] text-slate text-center py-4">No open roles yet.</p>}
            <div className="space-y-4">
              {roles.map((role, i) => (
                <div key={i} className="border border-[#D6D0C4] rounded-sm p-4 space-y-3 relative">
                  <button type="button" onClick={() => removeRole(i)} className="absolute top-3 right-3 p-1 text-slate hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className={labelCls}>Role Title</label>
                    <input value={role.title} onChange={e => updateRole(i, "title", e.target.value)} placeholder="Full-stack Engineer" className={`mt-2 ${inputCls}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Compensation</label>
                      <Select value={role.compensation} onValueChange={v => updateRole(i, "compensation", v)}>
                        <SelectTrigger className="mt-2 h-11 font-body text-[15px] rounded-sm border-[#D6D0C4]"><SelectValue /></SelectTrigger>
                        <SelectContent>{COMPENSATIONS.map(c => <SelectItem key={c} value={c} className="font-body text-[14px]">{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={labelCls}>Hrs / Week</label>
                      <input type="number" min={1} max={80} value={role.hours_per_week} onChange={e => updateRole(i, "hours_per_week", parseInt(e.target.value) || 1)} className={`mt-2 ${inputCls}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-sm p-3 font-body text-[14px]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full h-12 bg-ink text-white font-body font-medium text-[15px] rounded-sm hover:bg-crimson transition-colors duration-150 disabled:opacity-60">
            {submitting ? "Publishing…" : "Publish Startup"}
          </button>
        </form>
      </div>
    </div>
  );
}
