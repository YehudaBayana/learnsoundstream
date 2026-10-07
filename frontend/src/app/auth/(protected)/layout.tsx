// app/(protected)/layout.tsx
import RequireAuth from "@/features/auth/components/RequireAuth";
import LikedInitializer from "@/features/liked/components/LikedInitializer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <LikedInitializer>{children}</LikedInitializer>
    </RequireAuth>
  );
}
