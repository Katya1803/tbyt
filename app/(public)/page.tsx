import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/public/ProductCard";
import { db } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const setting = await getSiteSetting();
  return buildMetadata({
    title: setting.defaultMetaTitle || setting.companyName,
    description: setting.defaultMetaDesc,
    path: "/",
  });
}

export default async function HomePage() {
  const [setting, categories, featured] = await Promise.all([
    getSiteSetting(),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    db.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: cardInclude,
    }),
  ]);

  const roots = categories.filter((c) => c.parentId === null);
  const sections = await Promise.all(
    roots.map(async (root) => {
      const ids = [
        root.id,
        ...categories.filter((c) => c.parentId === root.id).map((c) => c.id),
      ];
      const products = await db.product.findMany({
        where: { isActive: true, categoryId: { in: ids } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: cardInclude,
      });
      return { root, products: products.map(toCard) };
    }),
  );

  return (
    <div>

      <div className="min-w-0 space-y-12">
        <h1 className="sr-only">{setting.companyName}</h1>
        {(setting.bannerWide || setting.bannerLeft || setting.bannerRight) && (
          <section className="reveal space-y-3 md:space-y-4" aria-label="Giới thiệu">
            {setting.bannerWide && (
              <Image
                src={setting.bannerWide}
                alt={setting.companyName}
                width={1200}
                height={400}
                unoptimized
                loading="eager"
                fetchPriority="high"
                className="aspect-[3/1] w-full rounded-xl object-cover shadow-gold"
              />
            )}
            {(setting.bannerLeft || setting.bannerRight) && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[setting.bannerLeft, setting.bannerRight].map(
                  (url, i) =>
                    url && (
                      <Image
                        key={i}
                        src={url}
                        alt={setting.companyName}
                        width={600}
                        height={300}
                        unoptimized
                        className="aspect-[2/1] w-full rounded-xl object-cover shadow-gold transition duration-300 hover:-translate-y-1"
                      />
                    ),
                )}
              </div>
            )}
          </section>
        )}

        {roots.length > 0 && (
          <section className="reveal">
            <div className="mb-6 text-center">
              <h2 className="text-gold animate-shimmer text-2xl font-extrabold uppercase tracking-wide md:text-3xl">Giải pháp thiết bị y tế</h2>
              <HeartbeatLine />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {roots.map((c) => (
                <Link
                  key={c.id}
                  href={`/danh-muc/${c.slug}`}
                  className="card-shine group flex flex-col rounded-2xl border bg-white shadow-md transition duration-300 hover:-translate-y-1.5 hover:border-[#d4a93c] hover:shadow-gold"
                >
                  <div className="overflow-hidden">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.name}
                        width={400}
                        height={360}
                        unoptimized
                        className="aspect-[10/9] w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex aspect-[10/9] w-full items-center justify-center bg-gradient-to-br from-[#fff6da] to-[#f4dc7c]">
                        <Image src="/cnmed-icon.svg" alt="" width={613} height={342} unoptimized className="w-1/2 opacity-70" />
                      </div>
                    )}
                  </div>
                  <h3 className="flex flex-1 items-center justify-center px-2 py-3 text-center text-sm font-bold uppercase transition-colors group-hover:text-primary md:py-4 md:text-base">
                    {c.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="reveal relative overflow-hidden rounded-2xl border border-[#e9d38f] bg-gradient-to-br from-[#fff6da] via-white to-[#fdeec4] p-4 shadow-gold md:p-6">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#f2d777]/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-[#d4a93c]/25 blur-3xl" />
            <div className="relative mb-6 text-center">
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <Sparkles className="size-6 text-[#d4a93c] animate-twinkle md:size-8" aria-hidden />
                <h2 className="text-gold animate-shimmer text-2xl font-extrabold uppercase tracking-wide md:text-4xl">Sản phẩm nổi bật</h2>
                <Sparkles className="size-6 text-[#d4a93c] animate-twinkle [animation-delay:0.9s] md:size-8" aria-hidden />
              </div>
              <div aria-hidden className="mx-auto mt-3 h-1 w-28 rounded-full bg-gold animate-shimmer" />
            </div>
            <div className="relative">
              <ProductGrid products={featured.map(toCard)} badge="Hot" />
            </div>
          </section>
        )}

        {sections
          .filter((s) => s.products.length > 0)
          .map(({ root, products }) => (
            <section key={root.id} className="reveal">
              <div className="mb-4 border-b border-[#ecdcae] pb-3">
                <h2 className="flex items-center gap-3 text-2xl font-bold">
                  <span aria-hidden className="h-7 w-1.5 rounded-full bg-gold" />
                  {root.name}
                </h2>
              </div>
              <ProductGrid products={products} />
              <div className="mt-6 text-center">
                <Link
                  href={`/danh-muc/${root.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-gold-ink shadow-gold animate-shimmer transition hover:-translate-y-0.5 hover:scale-105"
                >
                  Xem tất cả
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

// Gold divider with a heartbeat blip in the middle.
function HeartbeatLine() {
  return (
    <svg viewBox="0 0 200 24" className="mx-auto mt-2 h-6 w-48" aria-hidden>
      <defs>
        <linearGradient id="heartbeat-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#c99a2e" />
          <stop offset="0.5" stopColor="#e2bb55" />
          <stop offset="1" stopColor="#c99a2e" />
        </linearGradient>
      </defs>
      <path
        d="M0 12 H84 L88 8 L92 18 L97 3 L102 21 L106 9 L109 12 H200"
        fill="none"
        stroke="url(#heartbeat-gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
