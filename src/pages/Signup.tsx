import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Building2, GraduationCap, Briefcase, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

type AppRole = "founder" | "investor" | "student" | "applicant";

const SKILLS = ["Engineering", "Design", "Product", "Sales", "Marketing", "Finance", "Research", "Operations"];
const INDUSTRIES = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech", "Other"];
const STAGES = ["Idea", "Pre-seed", "Seed", "Series A+"];
const LOOKING_FOR = ["Internship", "Part-time role", "Co-founder opportunity", "Full-time after graduation"];

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  role: AppRole;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ icon, title, subtitle, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all w-full ${
        selected
          ? "border-primary bg-crimson-muted ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </button>
  );
}

function TogglePill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        selected ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30"
      }`}
    >
      {label}
    </button>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"account" | "role" | "profile">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [harvardSchool, setHarvardSchool] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [concentration, setConcentration] = useState("");
  const [roleAtStartup, setRoleAtStartup] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [prevFounded, setPrevFounded] = useState(false);
  const [prevFoundedDesc, setPrevFoundedDesc] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [firmName, setFirmName] = useState("");
  const [title, setTitle] = useState("");
  const [thesis, setThesis] = useState("");
  const [industriesFocus, setIndustriesFocus] = useState<string[]>([]);
  const [stageFocus, setStageFocus] = useState<string[]>([]);
  const [checkSize, setCheckSize] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [openToCofounder, setOpenToCofounder] = useState(false);

  const isHarvardEmail = (e: string) => /(@[a-z]+\.harvard\.edu|@harvard\.edu)$/i.test(e.trim());
  const isEduEmail = (e: string) => e.trim().toLowerCase().endsWith(".edu");

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleIndustry = (s: string) => setIndustriesFocus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleStage = (s: string) => setStageFocus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleLooking = (s: string) => setLookingFor(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const validateStep1 = () => {
    if (!fullName.trim()) { setError("Please enter your name."); return false; }
    if (selectedRole === "founder" && !isHarvardEmail(email)) {
      setError("Founders must use a Harvard .edu email (e.g. name@college.harvard.edu)."); return false;
    }
    if (selectedRole === "student" && !isEduEmail(email)) {
      setError("Students must use a .edu email address."); return false;
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return false; }
    if (!selectedRole) { setError("Please select an account type."); return false; }
    return true;
  };

  const handleNextToProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateStep1()) return;
    setStep("profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? "Signup failed.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // Insert role
    await supabase.from("user_roles").insert({ user_id: userId, role: selectedRole! });

    // Insert base profile
    await supabase.from("profiles").upsert({
      user_id: userId,
      email: email.trim(),
      full_name: fullName.trim(),
      linkedin_url: linkedinUrl || null,
    });

    // Insert role-specific profile
    if (selectedRole === "founder") {
      await supabase.from("founder_profiles").upsert({
        user_id: userId,
        harvard_school: harvardSchool,
        graduation_year: gradYear ? parseInt(gradYear) : null,
        concentration: concentration || null,
        role_at_startup: roleAtStartup || null,
        bio: bio || null,
        previously_founded: prevFounded,
        previous_founding_description: prevFoundedDesc || null,
        skills,
      });
    } else if (selectedRole === "investor") {
      await supabase.from("investor_profiles").upsert({
        user_id: userId,
        firm_name: firmName,
        title,
        investment_thesis: thesis || null,
        industries_focus: industriesFocus,
        stage_focus: stageFocus,
        check_size_range: checkSize || null,
        linkedin_url: linkedinUrl || null,
        status: "pending",
      });
    } else if (selectedRole === "student") {
      await supabase.from("student_profiles").upsert({
        user_id: userId,
        harvard_school: harvardSchool,
        graduation_year: gradYear ? parseInt(gradYear) : null,
        concentration: concentration || null,
        skills,
        looking_for: lookingFor,
        bio: bio || null,
        github_url: githubUrl || null,
        open_to_cofounding: openToCofounder,
      });
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="font-display font-bold text-xl text-emerald-800 mb-2">Account created!</p>
              {selectedRole === "investor" ? (
                <p className="text-emerald-700 text-sm">Check your email to confirm your address. Your investor account will then be reviewed before you gain full access.</p>
              ) : (
                <p className="text-emerald-700 text-sm">Check your email to confirm your address, then sign in to start exploring.</p>
              )}
              <Link to="/login" className="mt-4 inline-block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">Go to sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-display font-bold text-xl">H</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Join HarvardFounders</h1>
            <p className="text-muted-foreground text-sm">
              {step === "account" ? "Create your account" : "Tell us about yourself"}
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-7">
            {["account", "profile"].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  (step === "account" && i === 0) || step === "profile"
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {step === "account" && (
            <form onSubmit={handleNextToProfile} className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Harvard" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@college.harvard.edu" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Password *</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="mt-1.5" />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">I am a… *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleCard
                    icon={<Building2 className="w-4 h-4" />}
                    title="Founder"
                    subtitle="Building a startup. Harvard domain verification required."
                    role="founder"
                    selected={selectedRole === "founder"}
                    onClick={() => setSelectedRole("founder")}
                  />
                  <RoleCard
                    icon={<Briefcase className="w-4 h-4" />}
                    title="Investor / VC"
                    subtitle="Looking to invest in Harvard ventures."
                    role="investor"
                    selected={selectedRole === "investor"}
                    onClick={() => setSelectedRole("investor")}
                  />
                  <RoleCard
                    icon={<GraduationCap className="w-4 h-4" />}
                    title="Student"
                    subtitle="Exploring roles & co-founding. .edu required."
                    role="student"
                    selected={selectedRole === "student"}
                    onClick={() => setSelectedRole("student")}
                  />
                  <RoleCard
                    icon={<Search className="w-4 h-4" />}
                    title="Job Seeker"
                    subtitle="Browsing open roles at Harvard startups."
                    role="applicant"
                    selected={selectedRole === "applicant"}
                    onClick={() => setSelectedRole("applicant")}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue →
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <button type="button" onClick={() => { setStep("account"); setError(""); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
                ← Back
              </button>

              {/* Founder profile fields */}
              {selectedRole === "founder" && (
                <>
                  <h3 className="font-semibold text-foreground">Founder Profile</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Harvard School *</Label>
                      <Input value={harvardSchool} onChange={e => setHarvardSchool(e.target.value)} required placeholder="Harvard College" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Graduation Year</Label>
                      <Input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2026" min={2020} max={2035} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Concentration / Field</Label>
                    <Input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Computer Science" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Your Role at Startup</Label>
                    <Input value={roleAtStartup} onChange={e => setRoleAtStartup(e.target.value)} placeholder="CEO / CTO / CPO…" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Short Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="2–3 sentences about yourself…" maxLength={400} rows={3} className="mt-1.5 resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Skills</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILLS.map(s => <TogglePill key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="prevFounded" checked={prevFounded} onChange={e => setPrevFounded(e.target.checked)} className="rounded" />
                    <Label htmlFor="prevFounded" className="text-sm cursor-pointer">Previously founded a company</Label>
                  </div>
                  {prevFounded && (
                    <Input value={prevFoundedDesc} onChange={e => setPrevFoundedDesc(e.target.value)} placeholder="One-line description of previous venture" className="mt-1.5" />
                  )}
                  <div>
                    <Label className="text-sm font-medium">LinkedIn URL</Label>
                    <Input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className="mt-1.5" />
                  </div>
                </>
              )}

              {/* Investor profile fields */}
              {selectedRole === "investor" && (
                <>
                  <h3 className="font-semibold text-foreground">Investor Profile</h3>
                  <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">Your account will be reviewed before you gain full access. You'll receive an email once approved.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Firm Name *</Label>
                      <Input value={firmName} onChange={e => setFirmName(e.target.value)} required placeholder="Sequoia Capital" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Title *</Label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Partner" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Investment Thesis</Label>
                    <Textarea value={thesis} onChange={e => setThesis(e.target.value)} placeholder="What you look for in startups…" rows={3} className="mt-1.5 resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Industries of Focus</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {INDUSTRIES.map(s => <TogglePill key={s} label={s} selected={industriesFocus.includes(s)} onClick={() => toggleIndustry(s)} />)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Stage Focus</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {STAGES.map(s => <TogglePill key={s} label={s} selected={stageFocus.includes(s)} onClick={() => toggleStage(s)} />)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Check Size Range</Label>
                    <Input value={checkSize} onChange={e => setCheckSize(e.target.value)} placeholder="$50k–$500k" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">LinkedIn URL</Label>
                    <Input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className="mt-1.5" />
                  </div>
                </>
              )}

              {/* Student profile fields */}
              {selectedRole === "student" && (
                <>
                  <h3 className="font-semibold text-foreground">Student Profile</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">School *</Label>
                      <Input value={harvardSchool} onChange={e => setHarvardSchool(e.target.value)} required placeholder="Harvard College" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Graduation Year</Label>
                      <Input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2026" min={2020} max={2035} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Concentration</Label>
                    <Input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Economics" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Short Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="2–3 sentences…" maxLength={400} rows={3} className="mt-1.5 resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Skills</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILLS.map(s => <TogglePill key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">I'm looking for</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {LOOKING_FOR.map(s => <TogglePill key={s} label={s} selected={lookingFor.includes(s)} onClick={() => toggleLooking(s)} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="openCofounder" checked={openToCofounder} onChange={e => setOpenToCofounder(e.target.checked)} className="rounded" />
                    <Label htmlFor="openCofounder" className="text-sm cursor-pointer">Open to co-founding a startup</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">LinkedIn</Label>
                      <Input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/…" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">GitHub</Label>
                      <Input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="github.com/…" className="mt-1.5" />
                    </div>
                  </div>
                </>
              )}

              {/* Applicant — minimal */}
              {selectedRole === "applicant" && (
                <>
                  <h3 className="font-semibold text-foreground">Almost done!</h3>
                  <p className="text-sm text-muted-foreground">No additional profile info needed for job seekers. You can browse and apply to open roles right away.</p>
                  <div>
                    <Label className="text-sm font-medium">LinkedIn URL (optional)</Label>
                    <Input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className="mt-1.5" />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
