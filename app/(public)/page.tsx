import Image from "next/image";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
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
      const ids = [root.id, ...categories.filter((c) => c.parentId === root.id).map((c) => c.id)];
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
    <div className="space-y-12">
      <section className="rounded-2xl bg-primary/10 px-6 py-10 text-center md:py-14">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{setting.companyName}</h1>
        {setting.defaultMetaDesc && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{setting.defaultMetaDesc}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="#san-pham" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Xem sản phẩm
          </a>
          <Link href="/lien-he" className="inline-flex h-10 items-center rounded-lg border border-primary bg-white px-5 text-sm font-medium text-primary hover:bg-primary/10">
            Liên hệ
          </Link>
        </div>
      </section>

      {sections.length > 0 && (
        <section id="san-pham">
          <h2 className="mb-4 text-2xl font-bold">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {sections.map(({ root, products }) => {
              const image = products.find((p) => p.image)?.image;
              return (
                <Link
                  key={root.id}
                  href={`/danh-muc/${root.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-white transition hover:border-primary hover:shadow-md"
                >
                  {image ? (
                    <Image src={image.url} alt={root.name} width={400} height={400} unoptimized className="aspect-square w-full bg-white object-contain" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-muted/40 text-primary/50">
                      <Stethoscope className="size-12" aria-hidden />
                    </div>
                  )}
                  <span className="border-t p-3 text-center text-sm font-semibold group-hover:text-primary">{root.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Sản phẩm nổi bật</h2>
          <ProductGrid products={featured.map(toCard)} />
        </section>
      )}

      {sections
        .filter((s) => s.products.length > 0)
        .map(({ root, products }) => (
          <section key={root.id}>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-bold">{root.name}</h2>
              <Link href={`/danh-muc/${root.slug}`} className="shrink-0 text-sm font-medium text-primary hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <ProductGrid products={products} />
          </section>
        ))}
    </div>
  );
}
