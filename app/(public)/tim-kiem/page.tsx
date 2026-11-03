import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/public/ProductCard";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/products";
import { normalizeSearch } from "@/lib/search";
import { getMenuCategories } from "@/lib/site";
import { parsePage } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tìm kiếm sản phẩm", robots: { index: false, follow: true } };

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }: PageProps<"/tim-kiem">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const normalized = normalizeSearch(q);
  const page = parsePage(sp.page);

  const where = { isActive: true, searchText: { contains: normalized } };
  const [products, total, categories] = normalized
    ? await Promise.all([
        db.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: cardInclude,
        }),
        db.product.count({ where }),
        getMenuCategories(),
      ])
    : [[], 0, await getMenuCategories()];

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">{q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm sản phẩm"}</h1>

      {!normalized && <p className="mt-4 text-muted-foreground">Nhập từ khóa vào ô tìm kiếm để tìm sản phẩm.</p>}

      {normalized && products.length > 0 && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">Tìm thấy {total} sản phẩm</p>
          <div className="mt-6">
            <ProductGrid products={products.map(toCard)} />
          </div>
          <Pagination basePath="/tim-kiem" page={page} totalPages={Math.ceil(total / PAGE_SIZE)} params={{ q }} />
        </>
      )}

      {(!normalized || products.length === 0) && (
        <div className="mt-6 space-y-3">
          {normalized && <p>Không tìm thấy sản phẩm nào phù hợp. Bạn có thể xem theo danh mục:</p>}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/danh-muc/${c.slug}`} className="rounded-full border px-4 py-1.5 text-sm hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
