"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/pages", label: "Trang tĩnh" },
  { href: "/admin/contacts", label: "Liên hệ" },
  { href: "/admin/settings", label: "Thông tin công ty" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b bg-background md:min-h-screen md:w-56 md:shrink-0 md:border-r md:border-b-0">
      <div className="px-4 py-3 text-lg font-semibold">Quản trị</div>
      <nav className="flex flex-wrap gap-1 px-2 pb-2 md:flex-col">
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm hover:bg-muted",
                active && "bg-primary/10 font-medium text-primary",
              )}
            >
              {l.label}
            </Link>
          );
        })}
        <form action={logout} className="md:mt-4">
          <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted">
            Đăng xuất
          </button>
        </form>
      </nav>
    </aside>
  );
}
