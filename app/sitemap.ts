import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { ABOUT_SLUG } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, categories, products] = await Promise.all([
    db.page.findMany({ select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: siteUrl("/") },
    { url: siteUrl("/lien-he") },
    ...pages.map((p) => ({
      url: siteUrl(p.slug === ABOUT_SLUG ? "/gioi-thieu" : `/chinh-sach/${p.slug}`),
      lastModified: p.updatedAt,
    })),
    ...categories.map((c) => ({ url: siteUrl(`/danh-muc/${c.slug}`), lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: siteUrl(`/san-pham/${p.slug}`), lastModified: p.updatedAt })),
  ];
}
