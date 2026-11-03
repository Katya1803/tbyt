import { notFound } from "next/navigation";
import { ContactForm } from "@/components/public/ContactForm";
import { ProductGrid } from "@/components/public/ProductCard";
import { ProductView } from "@/components/public/ProductView";
import { db } from "@/lib/db";
import { JsonLd } from "@/components/public/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import { cardInclude, getProductBySlug, toCard } from "@/lib/products";
import { buildMetadata, productDescription } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";

type Attributes = { label: string; value: string }[];

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) return {};
  const setting = await getSiteSetting();
  return buildMetadata({
    title: product.metaTitle || `${product.name} - ${setting.companyName}`,
    description: productDescription({ ...product, attributes: product.attributes as Attributes }),
    path: `/san-pham/${product.slug}`,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
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
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: productDescription({ ...product, attributes: (product.attributes as Attributes) ?? [] }),
          path: `/san-pham/${product.slug}`,
          images: product.images.map((img) => img.url),
          price: product.price === null ? null : Number(product.price),
        })}
      />
      <JsonLd data={breadcrumbJsonLd([...breadcrumb.map((b) => ({ name: b.name, path: b.href })), { name: product.name, path: `/san-pham/${product.slug}` }])} />
      <ProductView
        name={product.name}
        price={product.price === null ? null : Number(product.price)}
        attributes={(product.attributes as Attributes) ?? []}
        images={product.images.map((img) => ({ url: img.url, alt: img.alt || product.name }))}
        description={product.description}
        breadcrumb={breadcrumb}
        phone={setting.phone}
        zalo={setting.zalo}
      />

      <div id="bao-gia" className="mx-auto max-w-2xl scroll-mt-24">
        <ContactForm title="Yêu cầu báo giá" companyName={setting.companyName} productId={product.id} />
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
