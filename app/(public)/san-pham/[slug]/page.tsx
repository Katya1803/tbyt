import { notFound } from "next/navigation";
import { ContactForm } from "@/components/public/ContactForm";
import { ProductGrid } from "@/components/public/ProductCard";
import { ProductView } from "@/components/public/ProductView";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/products";
import { getSiteSetting } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: { include: { parent: true } } },
  });
  if (!product || !product.isActive) notFound();

  const [setting, related] = await Promise.all([
    getSiteSetting(),
    db.product.findMany({
      where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: cardInclude,
    }),
  ]);

  const { category } = product;
  const breadcrumb = [
    ...(category.parent ? [{ name: category.parent.name, href: `/danh-muc/${category.parent.slug}` }] : []),
    { name: category.name, href: `/danh-muc/${category.slug}` },
  ];

  return (
    <div className="space-y-12">
      <ProductView
        name={product.name}
        price={product.price === null ? null : Number(product.price)}
        attributes={(product.attributes as { label: string; value: string }[]) ?? []}
        images={product.images.map((img) => ({ url: img.url, alt: img.alt || product.name }))}
        description={product.description}
        breadcrumb={breadcrumb}
        phone={setting.phone}
        zalo={setting.zalo}
      />

      <div id="bao-gia" className="mx-auto max-w-2xl scroll-mt-24">
        <ContactForm title="Yêu cầu báo giá" productId={product.id} />
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Sản phẩm liên quan</h2>
          <ProductGrid products={related.map(toCard)} />
        </section>
      )}
    </div>
  );
}
