import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { CardProduct } from "@/lib/products";

type CardProps = { product: CardProduct; priority?: boolean; badge?: string };

export function ProductCard({ product, priority = false, badge }: CardProps) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="card-shine group flex flex-col rounded-xl border bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d4a93c] hover:shadow-gold"
    >
      <div className="relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={400}
            height={400}
            unoptimized
            loading={priority ? "eager" : "lazy"}
            className="aspect-square w-full bg-white object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[0.7rem] font-bold uppercase text-gold-ink shadow-gold animate-shimmer">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t p-3">
        <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">{product.name}</h3>
        <p className="mt-auto text-sm font-bold text-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

// eagerCount: number of leading cards (above the fold) loaded eagerly.
export function ProductGrid({
  products,
  eagerCount = 0,
  compact = false,
  badge,
}: {
  products: CardProduct[];
  eagerCount?: number;
  compact?: boolean;
  badge?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 ${compact ? "" : "lg:grid-cols-4"}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < eagerCount} badge={badge} />
      ))}
    </div>
  );
}
