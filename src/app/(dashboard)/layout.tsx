import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/features/auth/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
