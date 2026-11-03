import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ProductGrid } from "@/components/public/ProductCard";
import { db } from "@/lib/db";
import { JsonLd } from "@/components/public/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { cardInclude, getCategoryBySlug, toCard } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";
import { parsePage } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function generateMetadata({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const setting = await getSiteSetting();
  return buildMetadata({
    title: category.metaTitle || `${category.name} chính hãng, giá tốt - ${setting.companyName}`,
    description: category.metaDesc || category.description,
    path: `/danh-muc/${category.slug}${page > 1 ? `?page=${page}` : ""}`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const where = { isActive: true, categoryId: { in: [category.id, ...category.children.map((c) => c.id)] } };
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: cardInclude,
    }),
    db.product.count({ where }),
  ]);

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          ...(category.parent ? [{ name: category.parent.name, path: `/danh-muc/${category.parent.slug}` }] : []),
          { name: category.name, path: `/danh-muc/${category.slug}` },
        ])}
      />
      <Breadcrumb
        items={[
          ...(category.parent ? [{ name: category.parent.name, href: `/danh-muc/${category.parent.slug}` }] : []),
          { name: category.name },
        ]}
      />
      <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
      {category.description && <p className="mt-2 whitespace-pre-line text-muted-foreground">{category.description}</p>}

      {category.children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.children.map((c) => (
            <Link key={c.id} href={`/danh-muc/${c.slug}`} className="rounded-full border px-4 py-1.5 text-sm hover:border-primary hover:text-primary">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        {products.length > 0 ? (
          <ProductGrid products={products.map(toCard)} />
        ) : (
          <p className="py-10 text-center text-muted-foreground">Chưa có sản phẩm trong danh mục này.</p>
        )}
      </div>
      <Pagination basePath={`/danh-muc/${category.slug}`} page={page} totalPages={Math.ceil(total / PAGE_SIZE)} />
    </div>
  );
}
