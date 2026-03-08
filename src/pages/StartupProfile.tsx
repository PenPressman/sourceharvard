import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Users, Calendar, TrendingUp, Briefcase, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type OpenRole = Database["public"]["Tables"]["open_roles"]["Row"];

const industryColors: Record<string, string> = {
  "Fintech": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Biotech": "bg-blue-50 text-blue-700 border-blue-200",
  "AI/ML": "bg-violet-50 text-violet-700 border-violet-200",
  "Consumer": "bg-orange-50 text-orange-700 border-orange-200",
  "B2B SaaS": "bg-sky-50 text-sky-700 border-sky-200",
  "Hardware": "bg-stone-50 text-stone-700 border-stone-200",
  "Social Impact": "bg-teal-50 text-teal-700 border-teal-200",
  "Other": "bg-muted text-muted-foreground border-border",
};

const compensationColors: Record<string, string> = {
  "Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Equity": "bg-violet-50 text-violet-700 border-violet-200",
  "Unpaid": "bg-muted text-muted-foreground border-border",
};

export default function StartupProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [{ data: startupData }, { data: rolesData }] = await Promise.all([
        supabase.from("startups").select("*").eq("id", id).single(),
        supabase.from("open_roles").select("*").eq("startup_id", id),
      ]);

      setStartup(startupData);
      setRoles(rolesData ?? []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-16 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Startup not found</h2>
          <Link to="/"><Button variant="outline">← Back to directory</Button></Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === startup.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to directory
        </Link>

        {/* Hero card */}
        <div className="bg-card border border-border rounded-xl p-7 shadow-card mb-5 animate-fade-in">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-primary text-2xl">
                {startup.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-foreground leading-tight">{startup.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  {startup.is_hiring && (
                    <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      Hiring
                    </span>
                  )}
                  {startup.open_to_vc && (
                    <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-crimson-muted text-accent-foreground font-medium border border-primary/15">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Open to VCs
                    </span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mt-1.5 text-base leading-relaxed">{startup.description}</p>
            </div>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`inline-block text-sm px-3 py-1 rounded-full border font-medium ${industryColors[startup.industry] ?? industryColors["Other"]}`}>
              {startup.industry}
            </span>
            <span className="inline-block text-sm px-3 py-1 rounded-full border border-border text-muted-foreground">
              {startup.stage}
            </span>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-t border-border">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="font-medium text-foreground">{startup.founded_year}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Team size</p>
                <p className="font-medium text-foreground">{startup.team_size} {startup.team_size === 1 ? "person" : "people"}</p>
              </div>
            </div>
            {startup.website_url && (
              <div className="flex items-center gap-2.5 text-sm">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block max-w-[140px]">
                    {startup.website_url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Harvard Affiliation */}
          <div className="border-t border-border pt-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Harvard Affiliation</p>
            <p className="text-foreground font-medium">{startup.harvard_affiliation}</p>
          </div>
        </div>

        {/* Open Roles */}
        {roles.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-fade-in">
            <h2 className="font-display font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Open Roles
            </h2>
            <div className="space-y-3">
              {roles.map(role => (
                <div key={role.id} className="flex items-center justify-between p-3.5 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-medium text-foreground text-sm">{role.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${compensationColors[role.compensation] ?? compensationColors["Unpaid"]}`}>
                        {role.compensation}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {role.hours_per_week}h/wk
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">This is your startup listing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
