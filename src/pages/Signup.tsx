import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Building2, GraduationCap, Briefcase, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

type AppRole = "founder" | "investor" | "student" | "applicant";

const SKILLS = ["Engineering", "Design", "Product", "Sales", "Marketing", "Finance", "Research", "Operations"];
const INDUSTRIES = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech", "Other"];
const STAGES = ["Pre-idea", "Idea", "Pre-seed", "Seed", "Series A+", "Series B+", "Revenue Stage", "Bootstrapped"];
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
      className={`flex flex-col items-start gap-2 p-4 text-left w-full transition-all duration-150 border rounded-sm ${
        selected
          ? "border-ink bg-[#EDE9DE]"
          : "border-[#D6D0C4] bg-white hover:border-ink"
      }`}
    >
      <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${selected ? "bg-crimson text-white" : "bg-[#EDE9DE] text-slate"}`}>
        {icon}
      </div>
      <div>
        <p className="font-body font-medium text-[14px] text-ink">{title}</p>
        <p className="font-body text-[12px] text-slate mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </button>
  );
}

function TogglePill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 font-body text-[13px] rounded-sm border transition-colors duration-150 ${
        selected ? "bg-ink text-white border-ink" : "border-[#D6D0C4] text-ink bg-[#EDE9DE] hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

const inputCls = "w-full h-11 px-4 font-body text-[15px] text-ink placeholder:text-slate bg-white border border-[#D6D0C4] rounded-sm outline-none focus:border-ink transition-colors duration-150";
const labelCls = "font-body text-[13px] font-medium text-ink uppercase tracking-[0.04em]";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"account" | "profile">("account");
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

  const toggleSkill     = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleIndustry  = (s: string) => setIndustriesFocus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleStage     = (s: string) => setStageFocus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleLooking   = (s: string) => setLookingFor(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const validateStep1 = () => {
    if (!fullName.trim()) { setError("Please enter your name."); return false; }
    if (selectedRole === "founder" && !isHarvardEmail(email)) { setError("Founders must use a Harvard .edu email."); return false; }
    if (selectedRole === "student" && !isEduEmail(email)) { setError("Students must use a .edu email address."); return false; }
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
      options: { emailRedirectTo: window.location.origin, data: { full_name: fullName.trim() } },
    });
    if (signUpError || !authData.user) { setError(signUpError?.message ?? "Signup failed."); setLoading(false); return; }
    const userId = authData.user.id;
    await supabase.from("user_roles").insert({ user_id: userId, role: selectedRole! });
    await supabase.from("profiles").upsert({ user_id: userId, email: email.trim(), full_name: fullName.trim(), linkedin_url: linkedinUrl || null });
    if (selectedRole === "founder") {
      await supabase.from("founder_profiles").upsert({ user_id: userId, harvard_school: harvardSchool, graduation_year: gradYear ? parseInt(gradYear) : null, concentration: concentration || null, role_at_startup: roleAtStartup || null, bio: bio || null, previously_founded: prevFounded, previous_founding_description: prevFoundedDesc || null, skills });
    } else if (selectedRole === "investor") {
      await supabase.from("investor_profiles").upsert({ user_id: userId, firm_name: firmName, title, investment_thesis: thesis || null, industries_focus: industriesFocus, stage_focus: stageFocus, check_size_range: checkSize || null, linkedin_url: linkedinUrl || null, status: "pending" });
    } else if (selectedRole === "student") {
      await supabase.from("student_profiles").upsert({ user_id: userId, harvard_school: harvardSchool, graduation_year: gradYear ? parseInt(gradYear) : null, concentration: concentration || null, skills, looking_for: lookingFor, bio: bio || null, github_url: githubUrl || null, open_to_cofounding: openToCofounder });
    }
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <div className="flex items-center justify-center py-24 px-6">
          <div className="w-full max-w-md text-center">
            <div className="bg-white border border-[#D6D0C4] rounded-sm p-12">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h2 className="font-display font-bold text-[25px] text-ink mb-3">Account created.</h2>
              {selectedRole === "investor"
                ? <p className="font-body text-[15px] text-slate leading-relaxed">Check your email to confirm your address. Your investor account will then be reviewed before you gain full access.</p>
                : <p className="font-body text-[15px] text-slate leading-relaxed">Check your email to confirm your address, then sign in to start exploring.</p>
              }
              <Link to="/login" className="mt-8 inline-block">
                <button className="h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                  Go to sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-3">
              {step === "account" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h1 className="font-display font-bold text-[39px] text-ink leading-[1.1]">
              Join <span className="text-crimson">Source.</span>
            </h1>
            <p className="font-body text-[16px] text-slate mt-2">
              {step === "account" ? "Create your account" : "Tell us about yourself"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-[2px] flex-1 transition-colors duration-200 ${step === "account" || step === "profile" ? "bg-crimson" : "bg-[#D6D0C4]"}`} />
            <div className={`h-[2px] flex-1 transition-colors duration-200 ${step === "profile" ? "bg-crimson" : "bg-[#D6D0C4]"}`} />
          </div>

          {/* Step 1: Account */}
          {step === "account" && (
            <form onSubmit={handleNextToProfile} className="bg-white border border-[#D6D0C4] rounded-sm p-8 shadow-card space-y-6">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Harvard" className={`mt-2 ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@college.harvard.edu" className={`mt-2 ${inputCls}`} />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className={`mt-2 ${inputCls}`} />
              </div>

              <div>
                <label className={`${labelCls} mb-3 block`}>I am a… *</label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard icon={<Building2 className="w-4 h-4" />} title="Founder" subtitle="Building a startup. Harvard domain required." role="founder" selected={selectedRole === "founder"} onClick={() => setSelectedRole("founder")} />
                  <RoleCard icon={<Briefcase className="w-4 h-4" />} title="Investor / VC" subtitle="Looking to invest in Harvard ventures." role="investor" selected={selectedRole === "investor"} onClick={() => setSelectedRole("investor")} />
                  <RoleCard icon={<GraduationCap className="w-4 h-4" />} title="Student" subtitle="Exploring roles & co-founding." role="student" selected={selectedRole === "student"} onClick={() => setSelectedRole("student")} />
                  <RoleCard icon={<Search className="w-4 h-4" />} title="Job Seeker" subtitle="Browsing open roles at Harvard startups." role="applicant" selected={selectedRole === "applicant"} onClick={() => setSelectedRole("applicant")} />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-sm p-3 font-body text-[14px]">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <button type="submit" className="w-full h-11 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                Continue →
              </button>
              <p className="text-center font-body text-[14px] text-slate">
                Already have an account?{" "}
                <Link to="/login" className="text-crimson hover:text-crimson-dim underline underline-offset-2 font-medium">Sign in</Link>
              </p>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === "profile" && (
            <form onSubmit={handleSubmit} className="bg-white border border-[#D6D0C4] rounded-sm p-8 shadow-card space-y-6">
              <button type="button" onClick={() => { setStep("account"); setError(""); }} className="font-body text-[13px] text-slate hover:text-ink transition-colors">
                ← Back
              </button>

              {/* Founder */}
              {selectedRole === "founder" && (
                <>
                  <h3 className="font-display font-bold text-[20px] text-ink">Founder Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Harvard School *</label><input value={harvardSchool} onChange={e => setHarvardSchool(e.target.value)} required placeholder="Harvard College" className={`mt-2 ${inputCls}`} /></div>
                    <div><label className={labelCls}>Graduation Year</label><input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2026" min={2020} max={2035} className={`mt-2 ${inputCls}`} /></div>
                  </div>
                  <div><label className={labelCls}>Concentration</label><input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Computer Science" className={`mt-2 ${inputCls}`} /></div>
                  <div><label className={labelCls}>Your Role at Startup</label><input value={roleAtStartup} onChange={e => setRoleAtStartup(e.target.value)} placeholder="CEO / CTO / CPO…" className={`mt-2 ${inputCls}`} /></div>
                  <div><label className={labelCls}>Short Bio</label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="2–3 sentences about yourself…" maxLength={400} rows={3} className="mt-2 resize-none font-body text-[15px]" /></div>
                  <div>
                    <label className={`${labelCls} mb-3 block`}>Skills</label>
                    <div className="flex flex-wrap gap-2">{SKILLS.map(s => <TogglePill key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="prevFounded" checked={prevFounded} onChange={e => setPrevFounded(e.target.checked)} className="rounded-sm" />
                    <label htmlFor="prevFounded" className="font-body text-[14px] text-ink cursor-pointer">Previously founded a company</label>
                  </div>
                  {prevFounded && <input value={prevFoundedDesc} onChange={e => setPrevFoundedDesc(e.target.value)} placeholder="One-line description of previous venture" className={inputCls} />}
                  <div><label className={labelCls}>LinkedIn URL</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className={`mt-2 ${inputCls}`} /></div>
                </>
              )}

              {/* Investor */}
              {selectedRole === "investor" && (
                <>
                  <h3 className="font-display font-bold text-[20px] text-ink">Investor Profile</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 font-body text-[13px] text-amber-700">
                    Your account will be reviewed before you gain full access. You'll receive an email once approved.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Firm Name *</label><input value={firmName} onChange={e => setFirmName(e.target.value)} required placeholder="Sequoia Capital" className={`mt-2 ${inputCls}`} /></div>
                    <div><label className={labelCls}>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Partner" className={`mt-2 ${inputCls}`} /></div>
                  </div>
                  <div><label className={labelCls}>Investment Thesis</label><Textarea value={thesis} onChange={e => setThesis(e.target.value)} placeholder="What you look for in startups…" rows={3} className="mt-2 resize-none font-body text-[15px]" /></div>
                  <div>
                    <label className={`${labelCls} mb-3 block`}>Industries of Focus</label>
                    <div className="flex flex-wrap gap-2">{INDUSTRIES.map(s => <TogglePill key={s} label={s} selected={industriesFocus.includes(s)} onClick={() => toggleIndustry(s)} />)}</div>
                  </div>
                  <div>
                    <label className={`${labelCls} mb-3 block`}>Stage Focus</label>
                    <div className="flex flex-wrap gap-2">{STAGES.map(s => <TogglePill key={s} label={s} selected={stageFocus.includes(s)} onClick={() => toggleStage(s)} />)}</div>
                  </div>
                  <div><label className={labelCls}>Check Size Range</label><input value={checkSize} onChange={e => setCheckSize(e.target.value)} placeholder="$50k–$500k" className={`mt-2 ${inputCls}`} /></div>
                  <div><label className={labelCls}>LinkedIn URL</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className={`mt-2 ${inputCls}`} /></div>
                </>
              )}

              {/* Student */}
              {selectedRole === "student" && (
                <>
                  <h3 className="font-display font-bold text-[20px] text-ink">Student Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>School *</label><input value={harvardSchool} onChange={e => setHarvardSchool(e.target.value)} required placeholder="Harvard College" className={`mt-2 ${inputCls}`} /></div>
                    <div><label className={labelCls}>Graduation Year</label><input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2026" min={2020} max={2035} className={`mt-2 ${inputCls}`} /></div>
                  </div>
                  <div><label className={labelCls}>Concentration</label><input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Economics" className={`mt-2 ${inputCls}`} /></div>
                  <div><label className={labelCls}>Short Bio</label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="2–3 sentences…" maxLength={400} rows={3} className="mt-2 resize-none font-body text-[15px]" /></div>
                  <div>
                    <label className={`${labelCls} mb-3 block`}>Skills</label>
                    <div className="flex flex-wrap gap-2">{SKILLS.map(s => <TogglePill key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />)}</div>
                  </div>
                  <div>
                    <label className={`${labelCls} mb-3 block`}>I'm looking for</label>
                    <div className="flex flex-wrap gap-2">{LOOKING_FOR.map(s => <TogglePill key={s} label={s} selected={lookingFor.includes(s)} onClick={() => toggleLooking(s)} />)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="openCofounder" checked={openToCofounder} onChange={e => setOpenToCofounder(e.target.checked)} className="rounded-sm" />
                    <label htmlFor="openCofounder" className="font-body text-[14px] text-ink cursor-pointer">Open to co-founding a startup</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>LinkedIn</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/…" className={`mt-2 ${inputCls}`} /></div>
                    <div><label className={labelCls}>GitHub</label><input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="github.com/…" className={`mt-2 ${inputCls}`} /></div>
                  </div>
                </>
              )}

              {/* Applicant */}
              {selectedRole === "applicant" && (
                <>
                  <h3 className="font-display font-bold text-[20px] text-ink">Almost done!</h3>
                  <p className="font-body text-[14px] text-slate">No additional info needed for job seekers. You can browse open roles right away.</p>
                  <div><label className={labelCls}>LinkedIn URL (optional)</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className={`mt-2 ${inputCls}`} /></div>
                </>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-sm p-3 font-body text-[14px]">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full h-11 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150 disabled:opacity-60">
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
