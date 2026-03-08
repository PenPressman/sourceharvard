import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Trash2, ShieldCheck } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvestorRow = {
  id: string;
  user_id: string;
  firm_name: string;
  title: string;
  linkedin_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile_name: string | null;
  profile_email: string | null;
};

type StartupRow = {
  id: string;
  name: string;
  industry: string;
  stage: string;
  founded_year: number;
  user_id: string;
  profile_email: string | null;
  profile_name: string | null;
};

type UserRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

const APP_ROLES = ["founder", "investor", "student", "applicant", "admin"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 border-yellow-500/25",
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  rejected: "bg-destructive/15 text-destructive border-destructive/25",
};

const roleColors: Record<string, string> = {
  founder: "bg-primary/15 text-primary border-primary/25",
  investor: "bg-blue-500/15 text-blue-600 border-blue-500/25",
  student: "bg-secondary text-muted-foreground border-border",
  applicant: "bg-secondary text-muted-foreground border-border",
  admin: "bg-destructive/15 text-destructive border-destructive/25",
};

// ─── Investors Tab ─────────────────────────────────────────────────────────────

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

    if (error) {
      toast({ title: "Error loading investors", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch matching profiles
    const userIds = invData?.map((r) => r.user_id) ?? [];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds)
      : { data: [] };

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

    setInvestors(
      (invData ?? []).map((inv) => ({
        ...inv,
        status: inv.status as "pending" | "approved" | "rejected",
        profile_name: profileMap[inv.user_id]?.full_name ?? null,
        profile_email: profileMap[inv.user_id]?.email ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchInvestors(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id + status);
    const update: Record<string, unknown> = { status };
    if (status === "approved") update.approved_at = new Date().toISOString();
    const { error } = await supabase.from("investor_profiles").update(update).eq("id", id);
    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? "Investor approved ✓" : "Investor rejected", description: "" });
      fetchInvestors();
    }
    setActionLoading(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (!investors.length) return <p className="text-center text-muted-foreground py-12 text-sm">No investor applications yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Firm / Title</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investors.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium">{inv.profile_name ?? "—"}</TableCell>
            <TableCell>
              <span className="font-medium">{inv.firm_name}</span>
              <span className="text-muted-foreground text-xs ml-1">· {inv.title}</span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{inv.profile_email ?? "—"}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[inv.status]}`}>
                {inv.status}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 text-xs"
                disabled={inv.status === "approved" || actionLoading !== null}
                onClick={() => updateStatus(inv.id, "approved")}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                disabled={inv.status === "rejected" || actionLoading !== null}
                onClick={() => updateStatus(inv.id, "rejected")}
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Startups Tab ─────────────────────────────────────────────────────────────

function StartupsTab() {
  const [startups, setStartups] = useState<StartupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStartups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("startups")
      .select("id, name, industry, stage, founded_year, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading startups", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userIds = data?.map((r) => r.user_id) ?? [];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds)
      : { data: [] };

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

    setStartups(
      (data ?? []).map((s) => ({
        ...s,
        profile_name: profileMap[s.user_id]?.full_name ?? null,
        profile_email: profileMap[s.user_id]?.email ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchStartups(); }, []);

  const deleteStartup = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from("startups").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete startup", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `"${name}" deleted` });
      setStartups((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (!startups.length) return <p className="text-center text-muted-foreground py-12 text-sm">No startups found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Startup</TableHead>
          <TableHead>Founder</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Founded</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {startups.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{s.profile_email ?? s.profile_name ?? "—"}</TableCell>
            <TableCell className="text-sm">{s.industry}</TableCell>
            <TableCell className="text-sm">{s.stage}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{s.founded_year}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                disabled={deletingId === s.id}
                onClick={() => deleteStartup(s.id, s.name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading users", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userIds = profilesData?.map((p) => p.user_id) ?? [];
    const { data: rolesData } = userIds.length
      ? await supabase.from("user_roles").select("user_id, role").in("user_id", userIds)
      : { data: [] };

    const roleMap = Object.fromEntries((rolesData ?? []).map((r) => [r.user_id, r.role]));

    setUsers(
      (profilesData ?? []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        role: roleMap[p.user_id] ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveRole = async (userId: string) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setSavingId(userId);

    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole as typeof APP_ROLES[number] }, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role updated ✓" });
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
      setPendingRoles((prev) => { const next = { ...prev }; delete next[userId]; return next; });
    }
    setSavingId(null);
  };

  if (loading) return <div className="space-y-2 mt-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (!users.length) return <p className="text-center text-muted-foreground py-12 text-sm">No users found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead className="text-right">Change Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const selected = pendingRoles[u.user_id] ?? u.role ?? "";
          const isDirty = pendingRoles[u.user_id] !== undefined;
          return (
            <TableRow key={u.user_id}>
              <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{u.email ?? "—"}</TableCell>
              <TableCell>
                {u.role ? (
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[u.role] ?? roleColors.applicant}`}>
                    {u.role}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">no role</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Select
                    value={selected}
                    onValueChange={(val) => setPendingRoles((prev) => ({ ...prev, [u.user_id]: val }))}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1"
                    disabled={!isDirty || savingId === u.user_id}
                    onClick={() => saveRole(u.user_id)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Save
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Admin() {
  const { role, loading, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !roleLoading && role !== "admin") {
      navigate("/");
    }
  }, [loading, roleLoading, role, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    );
  }

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage investors, startups, and users</p>
        </div>

        <Tabs defaultValue="investors">
          <TabsList className="mb-6">
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="startups">Startups</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="investors">
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-semibold text-foreground">Investor Applications</h2>
                <p className="text-xs text-muted-foreground">Approve or reject VC/investor accounts</p>
              </div>
              <InvestorsTab />
            </div>
          </TabsContent>

          <TabsContent value="startups">
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-semibold text-foreground">All Startups</h2>
                <p className="text-xs text-muted-foreground">View and remove startup listings</p>
              </div>
              <StartupsTab />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-semibold text-foreground">All Users</h2>
                <p className="text-xs text-muted-foreground">View and reassign user roles</p>
              </div>
              <UsersTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
