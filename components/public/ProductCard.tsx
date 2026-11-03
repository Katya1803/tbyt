import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { CardProduct } from "@/lib/products";

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-white transition hover:border-primary hover:shadow-md"
    >
      {product.image ? (
        <Image
          src={product.image.url}
          alt={product.image.alt}
          width={400}
          height={400}
          unoptimized
          loading={priority ? "eager" : "lazy"}
          className="aspect-square w-full bg-white object-contain"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
          Chưa có ảnh
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 border-t p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{product.name}</h3>
        <p className="mt-auto text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

// eagerCount: number of leading cards (above the fold) loaded eagerly.
export function ProductGrid({ products, eagerCount = 0, compact = false }: { products: CardProduct[]; eagerCount?: number; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 ${compact ? "" : "lg:grid-cols-4"}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < eagerCount} />
      ))}
    </div>
  );
}
