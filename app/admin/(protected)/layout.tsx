import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
