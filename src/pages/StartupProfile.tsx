import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Users, Calendar, TrendingUp, Briefcase, Clock, Twitter, Linkedin, Lock, ExternalLink, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import EndorseButton from "@/components/EndorseButton";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type OpenRole = Database["public"]["Tables"]["open_roles"]["Row"];

const industryColors: Record<string, string> = {
  "Fintech":       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Biotech":       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "AI/ML":         "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Consumer":      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "B2B SaaS":      "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Hardware":      "bg-stone-500/10 text-stone-400 border-stone-500/20",
  "Social Impact": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Deep Tech":     "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Other":         "bg-muted text-muted-foreground border-border",
};

const compensationColors: Record<string, string> = {
  "Paid":   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Equity": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Unpaid": "bg-muted text-muted-foreground border-border",
};

export default function StartupProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [loading, setLoading] = useState(true);

  const canSeeFunding  = role === "founder" || role === "investor" || role === "admin";
  const canSeePitchDeck = role === "investor" || role === "founder" || role === "admin";

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("startups").select("*").eq("id", id).single(),
      supabase.from("open_roles").select("*").eq("startup_id", id),
    ]).then(([{ data: s }, { data: r }]) => {
      setStartup(s);
      setRoles(r ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!startup) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Startup not found</h2>
        <Link to="/"><Button variant="outline">← Back</Button></Link>
      </div>
    </div>
  );

  const s = startup as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-3xl">

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </Link>

        {/* Hero card */}
        <div className="bg-card border border-border rounded-xl p-7 mb-4 animate-fade-in">
          {/* Top row */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-primary text-2xl">{startup.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">{startup.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  {startup.is_hiring && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold">
                      <Briefcase className="w-3 h-3" />Hiring
                    </span>
                  )}
                  {startup.open_to_vc && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-accent-muted text-accent border border-accent/20 font-semibold">
                      <TrendingUp className="w-3 h-3" />Open to VCs
                    </span>
                  )}
                  {s.looking_for_cofounder && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground font-semibold">
                      Co-Founder Needed
                    </span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mt-1.5 leading-relaxed">{startup.description}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${industryColors[startup.industry] ?? industryColors["Other"]}`}>{startup.industry}</span>
            <span className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">{startup.stage}</span>
            {s.business_model && <span className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">{s.business_model}</span>}
          </div>

          {/* Full description */}
          {s.full_description && (
            <p className="text-foreground leading-relaxed mb-5 whitespace-pre-line text-sm">{s.full_description}</p>
          )}

          {/* Endorsement section */}
          <div className="py-5 border-t border-border">
            <EndorseButton targetType="startup" targetId={startup.id} ownerId={startup.user_id} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-t border-border">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div><p className="text-xs text-muted-foreground">Founded</p><p className="font-semibold text-foreground text-sm">{startup.founded_year}</p></div>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <div><p className="text-xs text-muted-foreground">Team</p><p className="font-semibold text-foreground text-sm">{startup.team_size}</p></div>
            </div>
            {startup.website_url && (
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <div><p className="text-xs text-muted-foreground">Website</p>
                  <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline text-sm truncate block max-w-[130px]">
                    {startup.website_url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Extra fields */}
          <div className="space-y-3 border-t border-border pt-5">
            {s.target_market && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Market</p><p className="text-foreground text-sm">{s.target_market}</p></div>}
            {s.tech_stack    && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tech Stack</p><p className="text-foreground text-sm">{s.tech_stack}</p></div>}
            {s.traction      && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Traction</p><p className="text-foreground text-sm">{s.traction}</p></div>}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Funding Raised</p>
              {canSeeFunding
                ? <p className="text-foreground text-sm">{s.funding_raised ?? <span className="text-muted-foreground">Not disclosed</span>}</p>
                : <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Lock className="w-3.5 h-3.5" />Visible to founders and investors</div>
              }
            </div>

            {canSeePitchDeck && s.pitch_deck_url ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pitch Deck</p>
                <a href={s.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />View pitch deck
                </a>
              </div>
            ) : !canSeePitchDeck && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pitch Deck</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Lock className="w-3.5 h-3.5" />Investors only</div>
              </div>
            )}

            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Harvard Affiliation</p><p className="text-foreground font-semibold text-sm">{startup.harvard_affiliation}</p></div>
          </div>

          {/* Social links */}
          {(s.twitter_url || s.linkedin_url) && (
            <div className="flex gap-4 border-t border-border pt-5">
              {s.twitter_url  && <a href={s.twitter_url}  target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><Twitter  className="w-4 h-4" />Twitter</a>}
              {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" />LinkedIn</a>}
            </div>
          )}
        </div>

        {/* Open Roles */}
        {roles.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
            <h2 className="font-display font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />Open Roles
            </h2>
            <div className="space-y-2.5">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3.5 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{role.title}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium ${compensationColors[role.compensation] ?? compensationColors["Unpaid"]}`}>
                      {role.compensation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />{role.hours_per_week}h/wk
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
