import type { Prisma } from "@prisma/client";

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
