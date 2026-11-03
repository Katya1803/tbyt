import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [activeProducts, totalProducts, categories, unread, latest] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.product.count(),
    db.category.count(),
    db.contactRequest.count({ where: { isRead: false } }),
    db.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Sản phẩm (đang hiện / tổng)", value: `${activeProducts} / ${totalProducts}`, href: "/admin/products" },
    { label: "Danh mục", value: String(categories), href: "/admin/categories" },
    { label: "Liên hệ chưa đọc", value: String(unread), href: "/admin/contacts?filter=unread" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border bg-background p-4 hover:border-primary">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-3xl font-bold">{s.value}</div>
          </Link>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Liên hệ mới nhất</h2>
        <div className="divide-y rounded-xl border bg-background">
          {latest.length === 0 && <p className="p-4 text-sm text-muted-foreground">Chưa có liên hệ nào</p>}
          {latest.map((c) => (
            <Link key={c.id} href={`/admin/contacts/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-muted/50">
              <span className={c.isRead ? "" : "font-semibold"}>
                {c.name} — {c.phone}
              </span>
              <span className="text-sm text-muted-foreground">{formatDateTime(c.createdAt)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
