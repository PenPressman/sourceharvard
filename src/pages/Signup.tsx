import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isHarvardEmail = (email: string) => {
    return email.trim().toLowerCase().endsWith(".edu") &&
      (email.includes("harvard.edu") || email.endsWith(".edu"));
  };

  const validateHarvardEmail = (email: string) => {
    const lower = email.trim().toLowerCase();
    return lower.endsWith("@harvard.edu") ||
      lower.endsWith(".harvard.edu") ||
      lower.match(/@[a-z]+\.harvard\.edu$/) !== null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateHarvardEmail(email)) {
      setError("You must use a Harvard .edu email address (e.g. name@college.harvard.edu).");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-display font-bold text-xl">H</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">Join HarvardFounders</h1>
            <p className="text-muted-foreground text-sm">Harvard .edu email required to create a startup profile</p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <p className="font-medium text-emerald-800">Check your email!</p>
              <p className="text-emerald-700 text-sm mt-1">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Harvard Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@college.harvard.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? "Creating account…" : "Create account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
