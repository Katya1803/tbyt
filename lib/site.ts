import { cache } from "react";
import { db } from "@/lib/db";
import { ABOUT_SLUG } from "@/lib/utils-server";

export const getSiteSetting = cache(async () => {
  const setting = await db.siteSetting.findUnique({ where: { id: 1 } });
  return setting ?? { id: 1, companyName: "", logoUrl: null, bannerWide: null, bannerLeft: null, bannerRight: null, footerImage: null, slogan: null, showSlogan: false, phone: null, zalo: null, email: null, address: null,
    googleMapsUrl: null, facebookUrl: null, workingHours: null, footerNote: null, defaultMetaTitle: null,
    defaultMetaDesc: null, updatedAt: new Date() };
});

export const getMenuCategories = cache(async () => {
  const all = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, parentId: true },
  });
  return all
    .filter((c) => c.parentId === null)
    .map((root) => ({ ...root, children: all.filter((c) => c.parentId === root.id) }));
});

// Static pages other than "Giới thiệu" (policies), for the header menu and footer.
export const getPolicyPages = cache(() =>
  db.page.findMany({ where: { slug: { not: ABOUT_SLUG } }, orderBy: { id: "asc" }, select: { slug: true, title: true } }),
);

export function siteUrl(path = ""): string {
  return `${(process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
