import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Globe, Users, Calendar, TrendingUp, Briefcase, Clock, Twitter, Linkedin, Lock, ExternalLink, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import EndorseButton from "@/components/EndorseButton";
import SaveButton from "@/components/SaveButton";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type OpenRole = Database["public"]["Tables"]["open_roles"]["Row"];

const compensationColors: Record<string, string> = {
  "Paid":   "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
  "Equity": "bg-violet-950/60 text-violet-400 border-violet-800/60",
  "Unpaid": "bg-[#1C1C1A] text-[#C8C9C0] border-[#2A2A28]",
};

export default function StartupProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [loading, setLoading] = useState(true);

  const canSeeFunding   = role === "founder" || role === "investor" || role === "admin";
  const canSeePitchDeck = role === "investor" || role === "founder" || role === "admin";

  const canSeeContactAs = (s: any) => {
    if (!s) return false;
    if (s.contact_visible_to_public) return true;
    if (!user) return false;
    if (role === "investor" && s.contact_visible_to_vcs) return true;
    if (role === "founder"  && s.contact_visible_to_founders) return true;
    if (role === "admin") return true;
    return false;
  };

  const contactHiddenReason = (s: any) => {
    if (!s?.contact_email) return null;
    if (s.contact_visible_to_public) return null;
    if (!s.contact_visible_to_vcs && !s.contact_visible_to_founders) return "hidden";
    const groups = [];
    if (s.contact_visible_to_vcs) groups.push("investors");
    if (s.contact_visible_to_founders) groups.push("founders");
    return groups.join(" & ");
  };

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
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!startup) return (
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />
      <div className="container mx-auto py-24 text-center">
        <h2 className="font-display font-bold text-[31px] text-white mb-4">Startup not found</h2>
        <Link to="/" className="font-body text-[14px] text-crimson underline underline-offset-2">← Back to directory</Link>
      </div>
    </div>
  );

  const s = startup as any;

  return (
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />

      {/* Crimson glow behind content */}
      <div className="absolute top-16 left-0 right-0 h-64 bg-gradient-to-b from-crimson/5 to-transparent pointer-events-none" />

      <div className="container mx-auto py-12 px-6 max-w-3xl relative">

        <Link to="/" className="inline-flex items-center gap-1.5 font-body text-[13px] text-[#C8C9C0] hover:text-white mb-8 transition-colors duration-150">
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </Link>

        {/* Main card */}
        <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-8 mb-6 animate-fade-in">

          {/* Top row */}
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-sm bg-crimson/10 border border-crimson/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-crimson text-[28px]">{startup.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="font-display font-bold text-[31px] text-white leading-[1.1] tracking-tight">{startup.name}</h1>
                <div className="flex gap-2 flex-wrap items-center">
                  {startup.is_hiring && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-crimson text-white rounded-sm">
                      <Briefcase className="w-3 h-3" />Hiring
                    </span>
                  )}
                  {startup.open_to_vc && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-[#1C1C1A] text-[#C8C9C0] border border-[#2A2A28] rounded-sm">
                      <TrendingUp className="w-3 h-3" />Open to VCs
                    </span>
                  )}
                  {s.looking_for_cofounder && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-[#1C1C1A] text-[#C8C9C0] border border-[#2A2A28] rounded-sm">
                      Co-Founder Needed
                    </span>
                  )}
                  <SaveButton startupId={startup.id} />
                </div>
              </div>
              <p className="font-body text-[16px] text-[#C8C9C0] mt-2 leading-relaxed">{startup.description}</p>
            </div>
          </div>

          {/* Industry + stage badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-[#1C1C1A] text-white border border-[#2A2A28] rounded-sm">
              {startup.industry}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-[#1C1C1A] text-[#C8C9C0] border border-[#2A2A28] rounded-sm">
              {startup.stage}
            </span>
            {s.business_model && (
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 bg-[#1C1C1A] text-[#C8C9C0] border border-[#2A2A28] rounded-sm">
                {s.business_model}
              </span>
            )}
          </div>

          {/* Full description */}
          {s.full_description && (
            <p className="font-body text-[15px] text-white leading-relaxed mb-6 whitespace-pre-line">{s.full_description}</p>
          )}

          {/* Endorsement */}
          <div className="py-6 border-t border-[#2A2A28]">
            <EndorseButton targetType="startup" targetId={startup.id} ownerId={startup.user_id} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 py-6 border-t border-[#2A2A28]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#8A8B80] mb-1">Founded</p>
              <p className="font-display font-bold text-[17px] text-white">{startup.founded_year}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#8A8B80] mb-1">Team Size</p>
              <p className="font-display font-bold text-[17px] text-white">{startup.team_size}</p>
            </div>
            {startup.website_url && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#8A8B80] mb-1">Website</p>
                <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="font-body text-[14px] text-crimson hover:underline flex items-center gap-1 truncate">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  {startup.website_url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          {/* Extended fields */}
          <div className="space-y-5 border-t border-[#2A2A28] pt-6">
            {s.target_market && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Target Market</p>
                <p className="font-body text-[15px] text-white">{s.target_market}</p>
              </div>
            )}
            {s.tech_stack && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Tech Stack</p>
                <p className="font-body text-[15px] text-white">{s.tech_stack}</p>
              </div>
            )}
            {s.traction && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Traction</p>
                <p className="font-body text-[15px] text-white">{s.traction}</p>
              </div>
            )}

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Funding Raised</p>
              {canSeeFunding
                ? <p className="font-body text-[15px] text-white">{s.funding_raised ?? <span className="text-[#8A8B80]">Not disclosed</span>}</p>
                : <div className="flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0]"><Lock className="w-3.5 h-3.5" />Visible to founders and investors</div>
              }
            </div>

            {canSeePitchDeck && s.pitch_deck_url ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Pitch Deck</p>
                <a href={s.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-[14px] text-crimson hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />View pitch deck
                </a>
              </div>
            ) : !canSeePitchDeck && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Pitch Deck</p>
                <div className="flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0]"><Lock className="w-3.5 h-3.5" />Investors only</div>
              </div>
            )}

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Harvard Affiliation</p>
              <p className="font-body font-medium text-[15px] text-white">{startup.harvard_affiliation}</p>
            </div>

            {s.contact_email && (() => {
              const canSee = canSeeContactAs(s);
              const reason = contactHiddenReason(s);
              return (
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A8B80] mb-1">Contact</p>
                  {canSee ? (
                    <a href={`mailto:${s.contact_email}`} className="inline-flex items-center gap-1.5 font-body text-[14px] text-crimson hover:underline">
                      <Mail className="w-3.5 h-3.5" />{s.contact_email}
                    </a>
                  ) : reason === "hidden" ? (
                    <div className="flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0]">
                      <Lock className="w-3.5 h-3.5" />Contact info is private
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0]">
                      <Lock className="w-3.5 h-3.5" />
                      {user ? `Only visible to ${reason}` : "Sign in as an investor or founder to view contact info"}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Social links */}
          {(s.twitter_url || s.linkedin_url) && (
            <div className="flex gap-6 border-t border-[#2A2A28] pt-6 mt-2">
              {s.twitter_url  && <a href={s.twitter_url}  target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0] hover:text-white transition-colors"><Twitter  className="w-4 h-4" />Twitter</a>}
              {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-body text-[14px] text-[#C8C9C0] hover:text-white transition-colors"><Linkedin className="w-4 h-4" />LinkedIn</a>}
            </div>
          )}
        </div>

        {/* Open Roles */}
        {roles.length > 0 && (
          <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-8 animate-fade-in">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-crimson mb-3">Open Positions</p>
            <h2 className="font-display font-bold text-[25px] text-white mb-6">Open Roles</h2>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border border-[#2A2A28] rounded-sm hover:border-crimson/40 transition-colors duration-150 bg-[#0D0D0C]">
                  <div>
                    <p className="font-body font-medium text-[15px] text-white">{role.title}</p>
                    <span className={`inline-block mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-sm border ${compensationColors[role.compensation] ?? compensationColors["Unpaid"]}`}>
                      {role.compensation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[12px] text-[#C8C9C0]">
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
