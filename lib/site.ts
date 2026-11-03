import { cache } from "react";
import { db } from "@/lib/db";

export const getSiteSetting = cache(async () => {
  const setting = await db.siteSetting.findUnique({ where: { id: 1 } });
  return setting ?? { id: 1, companyName: "", logoUrl: null, bannerWide: null, bannerLeft: null, bannerRight: null, phone: null, zalo: null, email: null, address: null,
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

export function siteUrl(path = ""): string {
  return `${(process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
