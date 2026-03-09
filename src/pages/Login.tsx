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
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-3">Sign In</p>
            <h1 className="font-display font-bold text-[39px] text-ink leading-[1.1] mb-2">
              Welcome back.
            </h1>
            <p className="font-body text-[16px] text-slate">Sign in to manage your profile</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white border border-[#D6D0C4] rounded-sm p-8 shadow-card space-y-6">
            <div>
              <Label htmlFor="email" className="font-body text-[13px] font-medium text-ink uppercase tracking-[0.04em]">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="name@college.harvard.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-2 w-full h-11 px-4 font-body text-[15px] text-ink placeholder:text-slate bg-white border border-[#D6D0C4] rounded-sm outline-none focus:border-ink transition-colors duration-150"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-body text-[13px] font-medium text-ink uppercase tracking-[0.04em]">
                Password
              </Label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-2 w-full h-11 px-4 font-body text-[15px] text-ink placeholder:text-slate bg-white border border-[#D6D0C4] rounded-sm outline-none focus:border-ink transition-colors duration-150"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-sm p-3 font-body text-[14px]">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center font-body text-[14px] text-slate">
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
