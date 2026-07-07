import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

// Explicitly kept out of search engines (also covered by robots.ts), and
// never linked from anywhere in the public site — the only way in is
// typing /admin manually, per the project's requirements.
export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <LoginForm />
    </div>
  );
}
