import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Trash2, ShieldCheck } from "lucide-react";

type InvestorRow = {
  id: string; user_id: string; firm_name: string; title: string;
  linkedin_url: string | null; status: "pending" | "approved" | "rejected";
  created_at: string; profile_name: string | null; profile_email: string | null;
};
type StartupRow = {
  id: string; name: string; industry: string; stage: string;
  founded_year: number; user_id: string;
  profile_email: string | null; profile_name: string | null;
};
type UserRow = { user_id: string; full_name: string | null; email: string | null; role: string | null; };

const APP_ROLES = ["founder", "investor", "student", "applicant", "admin"] as const;

const statusBadge: Record<string, string> = {
  pending:  "bg-amber-950/60 text-amber-400 border-amber-800/60",
  approved: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
  rejected: "bg-red-950/60 text-red-400 border-red-800/60",
};
const roleBadge: Record<string, string> = {
  founder:  "bg-crimson/15 text-crimson border-crimson/30",
  investor: "bg-[#1C1C1A] text-[#8A8B80] border-[#2A2A28]",
  student:  "bg-[#1C1C1A] text-[#8A8B80] border-[#2A2A28]",
  applicant:"bg-[#1C1C1A] text-[#8A8B80] border-[#2A2A28]",
  admin:    "bg-crimson/20 text-crimson border-crimson/30",
};

function InvestorsTab() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvestors = async () => {
    setLoading(true);
    const { data: invData, error } = await supabase
      .from("investor_profiles")
      .select("id, user_id, firm_name, title, linkedin_url, status, created_at")
      .order("created_at", { ascending: false });
    if (error) { toast({ title: "Error loading investors", description: error.message, variant: "destructive" }); setLoading(false); return; }
    const userIds = invData?.map((r) => r.user_id) ?? [];
    const { data: profiles } = userIds.length ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds) : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
    setInvestors((invData ?? []).map((inv) => ({ ...inv, status: inv.status as "pending" | "approved" | "rejected", profile_name: profileMap[inv.user_id]?.full_name ?? null, profile_email: profileMap[inv.user_id]?.email ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchInvestors(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id + status);
    const update: Record<string, unknown> = { status };
    if (status === "approved") update.approved_at = new Date().toISOString();
    const { error } = await supabase.from("investor_profiles").update(update).eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    else { toast({ title: status === "approved" ? "Investor approved ✓" : "Investor rejected" }); fetchInvestors(); }
    setActionLoading(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#1C1C1A]" />)}</div>;
  if (!investors.length) return <p className="text-center font-body text-[14px] text-[#5A5B53] py-12">No investor applications yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#2A2A28] hover:bg-transparent">
          <TableHead className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Name</TableHead>
          <TableHead className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Firm / Title</TableHead>
          <TableHead className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Email</TableHead>
          <TableHead className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Status</TableHead>
          <TableHead className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Applied</TableHead>
          <TableHead className="text-right font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investors.map((inv) => (
          <TableRow key={inv.id} className="border-[#2A2A28] hover:bg-[#1C1C1A]/50">
            <TableCell className="font-body font-medium text-[#F5F1E8]">{inv.profile_name ?? "—"}</TableCell>
            <TableCell className="font-body text-[14px]">
              <span className="font-medium text-[#F5F1E8]">{inv.firm_name}</span>
              <span className="text-[#5A5B53] text-[13px] ml-1">· {inv.title}</span>
            </TableCell>
            <TableCell className="font-body text-[13px] text-[#8A8B80]">{inv.profile_email ?? "—"}</TableCell>
            <TableCell>
              <span className={`font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-sm border ${statusBadge[inv.status]}`}>
                {inv.status}
              </span>
            </TableCell>
            <TableCell className="font-body text-[13px] text-[#8A8B80]">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-1">
              <button
                className="inline-flex items-center gap-1 font-body text-[13px] text-emerald-400 hover:underline disabled:opacity-40"
                disabled={inv.status === "approved" || actionLoading !== null}
                onClick={() => updateStatus(inv.id, "approved")}
              >
                <CheckCircle className="w-3.5 h-3.5" />Approve
              </button>
              <button
                className="inline-flex items-center gap-1 font-body text-[13px] text-red-400 hover:underline disabled:opacity-40 ml-3"
                disabled={inv.status === "rejected" || actionLoading !== null}
                onClick={() => updateStatus(inv.id, "rejected")}
              >
                <XCircle className="w-3.5 h-3.5" />Reject
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StartupsTab() {
  const [startups, setStartups] = useState<StartupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStartups = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("startups").select("id, name, industry, stage, founded_year, user_id").order("created_at", { ascending: false });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setLoading(false); return; }
    const userIds = data?.map((r) => r.user_id) ?? [];
    const { data: profiles } = userIds.length ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds) : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
    setStartups((data ?? []).map((s) => ({ ...s, profile_name: profileMap[s.user_id]?.full_name ?? null, profile_email: profileMap[s.user_id]?.email ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchStartups(); }, []);

  const deleteStartup = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from("startups").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    else { toast({ title: `"${name}" deleted` }); setStartups((prev) => prev.filter((s) => s.id !== id)); }
    setDeletingId(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#1C1C1A]" />)}</div>;
  if (!startups.length) return <p className="text-center font-body text-[14px] text-[#5A5B53] py-12">No startups found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#2A2A28] hover:bg-transparent">
          {["Startup", "Founder", "Industry", "Stage", "Founded", "Actions"].map(h => (
            <TableHead key={h} className={`font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]${h === "Actions" ? " text-right" : ""}`}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {startups.map((s) => (
          <TableRow key={s.id} className="border-[#2A2A28] hover:bg-[#1C1C1A]/50">
            <TableCell className="font-body font-medium text-[#F5F1E8]">{s.name}</TableCell>
            <TableCell className="font-body text-[13px] text-[#8A8B80]">{s.profile_email ?? s.profile_name ?? "—"}</TableCell>
            <TableCell className="font-mono text-[11px] text-[#8A8B80] uppercase tracking-[0.04em]">{s.industry}</TableCell>
            <TableCell className="font-mono text-[11px] text-[#8A8B80] uppercase tracking-[0.04em]">{s.stage}</TableCell>
            <TableCell className="font-body text-[13px] text-[#8A8B80]">{s.founded_year}</TableCell>
            <TableCell className="text-right">
              <button
                className="inline-flex items-center gap-1 font-body text-[13px] text-red-400 hover:underline disabled:opacity-40"
                disabled={deletingId === s.id}
                onClick={() => deleteStartup(s.id, s.name)}
              >
                <Trash2 className="w-3.5 h-3.5" />Delete
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profilesData, error } = await supabase.from("profiles").select("user_id, full_name, email").order("created_at", { ascending: false });
    if (error) { toast({ title: "Error loading users", description: error.message, variant: "destructive" }); setLoading(false); return; }
    const userIds = profilesData?.map((p) => p.user_id) ?? [];
    const { data: rolesData } = userIds.length ? await supabase.from("user_roles").select("user_id, role").in("user_id", userIds) : { data: [] };
    const roleMap = Object.fromEntries((rolesData ?? []).map((r) => [r.user_id, r.role]));
    setUsers((profilesData ?? []).map((p) => ({ user_id: p.user_id, full_name: p.full_name, email: p.email, role: roleMap[p.user_id] ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveRole = async (userId: string) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setSavingId(userId);
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole as typeof APP_ROLES[number] }, { onConflict: "user_id" });
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Role updated ✓" });
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
      setPendingRoles((prev) => { const next = { ...prev }; delete next[userId]; return next; });
    }
    setSavingId(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#1C1C1A]" />)}</div>;
  if (!users.length) return <p className="text-center font-body text-[14px] text-[#5A5B53] py-12">No users found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#2A2A28] hover:bg-transparent">
          {["Name", "Email", "Current Role", "Change Role"].map((h, i) => (
            <TableHead key={h} className={`font-mono text-[11px] uppercase tracking-[0.06em] text-[#5A5B53]${i === 3 ? " text-right" : ""}`}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const selected = pendingRoles[u.user_id] ?? u.role ?? "";
          const isDirty = pendingRoles[u.user_id] !== undefined;
          return (
            <TableRow key={u.user_id} className="border-[#2A2A28] hover:bg-[#1C1C1A]/50">
              <TableCell className="font-body font-medium text-[#F5F1E8]">{u.full_name ?? "—"}</TableCell>
              <TableCell className="font-body text-[13px] text-[#8A8B80]">{u.email ?? "—"}</TableCell>
              <TableCell>
                {u.role
                  ? <span className={`font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-sm border ${roleBadge[u.role] ?? roleBadge.applicant}`}>{u.role}</span>
                  : <span className="font-body text-[13px] text-[#5A5B53]">no role</span>
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Select value={selected} onValueChange={(val) => setPendingRoles((prev) => ({ ...prev, [u.user_id]: val }))}>
                    <SelectTrigger className="w-32 h-8 text-[13px] font-body bg-[#1C1C1A] border-[#2A2A28] text-[#F5F1E8]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1A] border-[#2A2A28]">
                      {APP_ROLES.map((r) => <SelectItem key={r} value={r} className="text-[13px] font-body text-[#F5F1E8] focus:bg-[#2A2A28] focus:text-[#F5F1E8]">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <button
                    className="inline-flex items-center gap-1.5 h-8 px-3 bg-crimson text-white font-body text-[12px] rounded-sm hover:bg-crimson-dim transition-colors disabled:opacity-40"
                    disabled={!isDirty || savingId === u.user_id}
                    onClick={() => saveRole(u.user_id)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />Save
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function Admin() {
  const { role, loading, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !roleLoading && role !== "admin") navigate("/");
  }, [loading, roleLoading, role, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A09]">
        <Navbar />
        <div className="container mx-auto px-6 py-16 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full bg-[#1C1C1A]" />)}
        </div>
      </div>
    );
  }

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-20" />

      <div className="relative container mx-auto px-6 py-16 max-w-6xl">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-crimson" />
            <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.12em]">Administration</p>
          </div>
          <h1 className="font-display font-bold text-[39px] text-[#F5F1E8] leading-[1.1]">Admin Panel</h1>
          <p className="font-body text-[16px] text-[#5A5B53] mt-2">Manage investors, startups, and users</p>
        </div>

        <div className="h-px bg-[#2A2A28] mb-10" />

        <Tabs defaultValue="investors">
          <TabsList className="mb-8 bg-[#141413] border border-[#2A2A28] rounded-sm p-1 gap-1">
            <TabsTrigger value="investors" className="font-body text-[13px] font-medium rounded-sm text-[#8A8B80] data-[state=active]:bg-[#1C1C1A] data-[state=active]:text-[#F5F1E8]">Investors</TabsTrigger>
            <TabsTrigger value="startups"  className="font-body text-[13px] font-medium rounded-sm text-[#8A8B80] data-[state=active]:bg-[#1C1C1A] data-[state=active]:text-[#F5F1E8]">Startups</TabsTrigger>
            <TabsTrigger value="users"     className="font-body text-[13px] font-medium rounded-sm text-[#8A8B80] data-[state=active]:bg-[#1C1C1A] data-[state=active]:text-[#F5F1E8]">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="investors">
            <div className="bg-[#141413] border border-[#2A2A28] rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2A2A28]">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-crimson mb-1">Review Queue</p>
                <h2 className="font-display font-bold text-[20px] text-[#F5F1E8]">Investor Applications</h2>
              </div>
              <div className="p-4">
                <InvestorsTab />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="startups">
            <div className="bg-[#141413] border border-[#2A2A28] rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2A2A28]">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-crimson mb-1">Directory</p>
                <h2 className="font-display font-bold text-[20px] text-[#F5F1E8]">All Startups</h2>
              </div>
              <div className="p-4">
                <StartupsTab />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-[#141413] border border-[#2A2A28] rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2A2A28]">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-crimson mb-1">Accounts</p>
                <h2 className="font-display font-bold text-[20px] text-[#F5F1E8]">All Users</h2>
              </div>
              <div className="p-4">
                <UsersTab />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
