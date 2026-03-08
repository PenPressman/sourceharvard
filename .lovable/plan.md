
## Admin Panel Plan

### What exists
- `app_role` enum includes `"admin"` 
- `has_role()` and `get_user_role()` DB functions already exist
- `investor_profiles` table has `status` column (`pending | approved | rejected`) with an "Admins can update investor profiles" RLS policy already in place
- `AuthContext` already exposes `role`
- No admin UI exists anywhere

### What to build

**1. New page: `/admin`**
A protected page that redirects non-admins away. Contains three tabs:

- **Investors** — table of all investor applications with status badge + Approve / Reject buttons
- **Startups** — table of all startups with startup name, founder email, industry, stage, and a Delete button (owner: admin can delete any)
- **Users** — table of all profiles with name, email, role badge, and ability to change role

**2. Navbar update**
Add an "Admin" link in the navbar that only shows for `role === "admin"`.

**3. App.tsx route**
Add `<Route path="/admin" element={<Admin />} />`.

### Database changes needed
- The `investor_profiles` SELECT policy currently only shows rows to founders/students/admins. Admins can already see all rows due to the policy `has_role(auth.uid(), 'admin')`. No migration needed for investor approval.
- For the Users tab we need to read `profiles` + `user_roles` together. Both tables have permissive SELECT policies already.
- For startup deletion by admin: current RLS only allows `auth.uid() = user_id`. Need a migration to add an admin delete policy on `startups`.

**Migration needed:**
```sql
-- Allow admins to delete any startup
CREATE POLICY "Admins can delete any startup"
ON public.startups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read all investor profiles (already covered by existing policy)
-- Allow admins to update investor_profiles status (already covered by existing policy)
```

### File changes

```text
src/
  pages/
    Admin.tsx          [NEW] - full admin panel with 3 tabs
  components/
    Navbar.tsx         [EDIT] - add admin link
  App.tsx              [EDIT] - add /admin route
supabase/migrations/
  [NEW].sql            - admin can delete any startup
```

### Admin Panel Layout (Admin.tsx)

```text
+--------------------------------------------+
| Admin Panel                      [3 tabs]  |
|  [Investors]  [Startups]  [Users]          |
+--------------------------------------------+
| INVESTORS TAB                               |
| Name   Firm     Status    Actions           |
| Jane   a16z    [pending]  [Approve][Reject] |
| ...                                         |
+--------------------------------------------+
| STARTUPS TAB                                |
| Name    Industry  Stage  Founded  [Delete]  |
| ...                                         |
+--------------------------------------------+
| USERS TAB                                   |
| Name    Email      Role    [Change Role]    |
| ...                                         |
+--------------------------------------------+
```

### Key implementation details
- Admin page checks `role === "admin"` after auth loads; redirects to `/` otherwise
- Investor approve sets `status = 'approved'` and `approved_at = now()`; reject sets `status = 'rejected'`
- Users tab: join `profiles` + `user_roles` to show current role; dropdown to reassign role (uses upsert on `user_roles` — but note: admins manage roles per the existing RLS policy)
- Startup delete: calls `supabase.from('startups').delete().eq('id', id)` — needs new admin RLS policy
- All mutations use `useToast` for feedback and refetch data after success
- Loading skeletons on each tab
