// app/(protected)/layout.tsx
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import RequireAuth from "@/features/auth/components/RequireAuth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
