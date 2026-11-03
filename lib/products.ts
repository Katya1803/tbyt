import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";

export const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

export type CardProduct = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  image: { url: string; alt: string } | null;
};

type ProductWithCardImage = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: ProductWithCardImage): CardProduct {
  const image = p.images[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price === null ? null : Number(p.price),
    image: image ? { url: image.url, alt: image.alt || p.name } : null,
  };
}

export const getProductBySlug = cache((slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: { include: { parent: true } } },
  }),
);

export const getCategoryBySlug = cache((slug: string) =>
  db.category.findUnique({
    where: { slug },
    include: { parent: true, children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  }),
);

export const getPageBySlug = cache((slug: string) => db.page.findUnique({ where: { slug } }));
