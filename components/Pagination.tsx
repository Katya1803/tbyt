import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
};

function href(basePath: string, page: number, params: Props["params"]) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) query.set(k, v);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, page, totalPages, params }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );

  return (
    <nav aria-label="Phân trang" className="mt-6 flex flex-wrap justify-center gap-1">
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={href(basePath, p, params)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-md border px-3 py-1.5 text-center text-sm hover:bg-muted",
              p === page && "border-primary bg-primary text-primary-foreground hover:bg-primary",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
    </nav>
  );
}
