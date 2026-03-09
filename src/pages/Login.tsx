import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />

      {/* Background grid */}
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-50" />
      {/* Crimson glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-crimson/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-crimson" />
              <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.12em]">Sign In</p>
            </div>
            <h1 className="font-display font-bold text-[39px] text-[#F5F1E8] leading-[1.1] mb-2">
              Welcome back.
            </h1>
            <p className="font-body text-[16px] text-[#8A8B80]">Sign in to manage your profile</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#141413] border border-[#2A2A28] rounded-sm p-8 space-y-6">
            <div>
              <Label htmlFor="email" className="font-body text-[13px] font-medium text-[#8A8B80] uppercase tracking-[0.04em]">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="name@college.harvard.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-2 w-full h-11 px-4 font-body text-[15px] text-[#F5F1E8] placeholder:text-[#5A5B53] bg-[#0D0D0C] border border-[#2A2A28] rounded-sm outline-none focus:border-crimson focus:shadow-glow transition-all duration-150"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-body text-[13px] font-medium text-[#8A8B80] uppercase tracking-[0.04em]">
                Password
              </Label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-2 w-full h-11 px-4 font-body text-[15px] text-[#F5F1E8] placeholder:text-[#5A5B53] bg-[#0D0D0C] border border-[#2A2A28] rounded-sm outline-none focus:border-crimson focus:shadow-glow transition-all duration-150"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-crimson/10 border border-crimson/30 text-crimson rounded-sm p-3 font-body text-[14px]">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-crimson text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson-dim transition-colors duration-150 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center font-body text-[14px] text-[#5A5B53]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-crimson hover:text-crimson-dim underline underline-offset-2 font-medium">
                Join now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
