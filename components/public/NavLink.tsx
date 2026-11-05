"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Top menu link; highlighted in gold with an underline when it is the current page.
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative px-5 py-3.5 text-[1.05rem] font-semibold uppercase tracking-wide transition-colors hover:text-primary after:absolute after:inset-x-5 after:bottom-2 after:h-0.5 after:rounded-full after:bg-gold after:transition-transform ${
        active ? "text-primary after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
      }`}
    >
      {children}
    </Link>
  );
}
