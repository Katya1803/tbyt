import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/public/ProductCard";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const setting = await getSiteSetting();
  return buildMetadata({
    title: setting.defaultMetaTitle || setting.companyName,
    description: setting.defaultMetaDesc,
    path: "/",
  });
}

export default async function HomePage() {
  const [setting, categories, featured] = await Promise.all([
    getSiteSetting(),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    db.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: cardInclude,
    }),
  ]);

  const roots = categories.filter((c) => c.parentId === null);
  const sections = await Promise.all(
    roots.map(async (root) => {
      const ids = [
        root.id,
        ...categories.filter((c) => c.parentId === root.id).map((c) => c.id),
      ];
      const products = await db.product.findMany({
        where: { isActive: true, categoryId: { in: ids } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: cardInclude,
      });
      return { root, products: products.map(toCard) };
    }),
  );

  return (
    <div className="gap-8 lg:grid lg:grid-cols-[14rem_1fr]">
      <aside className="hidden lg:block">
        <nav
          aria-label="Danh mục sản phẩm"
          className="sticky top-24 rounded-lg border bg-white"
        >
          <h2 className="border-b bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
            Danh mục sản phẩm
          </h2>
          <ul className="py-2">
            {roots.map((root) => (
              <li key={root.id}>
                <Link
                  href={`/danh-muc/${root.slug}`}
                  className="block px-4 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary"
                >
                  {root.name}
                </Link>
                {categories
                  .filter((c) => c.parentId === root.id)
                  .map((child) => (
                    <Link
                      key={child.id}
                      href={`/danh-muc/${child.slug}`}
                      className="block py-1 pr-4 pl-8 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {child.name}
                    </Link>
                  ))}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 space-y-12">
        <h1 className="sr-only">{setting.companyName}</h1>
        {(setting.bannerWide || setting.bannerLeft || setting.bannerRight) && (
          <section className="space-y-3 md:space-y-4" aria-label="Giới thiệu">
            {setting.bannerWide && (
              <Image
                src={setting.bannerWide}
                alt={setting.companyName}
                width={1200}
                height={400}
                unoptimized
                loading="eager"
                fetchPriority="high"
                className="aspect-[3/1] w-full rounded-xl object-cover"
              />
            )}
            {(setting.bannerLeft || setting.bannerRight) && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[setting.bannerLeft, setting.bannerRight].map(
                  (url, i) =>
                    url && (
                      <Image
                        key={i}
                        src={url}
                        alt={setting.companyName}
                        width={600}
                        height={300}
                        unoptimized
                        className="aspect-[2/1] w-full rounded-xl object-cover"
                      />
                    ),
                )}
              </div>
            )}
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">Sản phẩm nổi bật</h2>
            <ProductGrid products={featured.map(toCard)} compact />
          </section>
        )}

        {sections
          .filter((s) => s.products.length > 0)
          .map(({ root, products }) => (
            <section key={root.id}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-2xl font-bold">{root.name}</h2>
                <Link
                  href={`/danh-muc/${root.slug}`}
                  className="shrink-0 text-sm font-medium text-primary hover:underline"
                >
                  Xem tất cả →
                </Link>
              </div>
              <ProductGrid products={products} compact />
            </section>
          ))}
      </div>
    </div>
  );
}
