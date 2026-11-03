import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "./ProductGallery";

export type ProductViewProps = {
  name: string;
  price: number | null;
  attributes: { label: string; value: string }[];
  images: { url: string; alt: string }[];
  description: string;
  breadcrumb: { name: string; href: string }[];
  phone: string | null;
  zalo: string | null;
};

const buttonClass = "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium";

export function ProductView({ name, price, attributes, images, description, breadcrumb, phone, zalo }: ProductViewProps) {
  const details = attributes.filter((a) => a.label.trim() && a.value.trim());
  const zaloNumber = zalo?.replace(/\D/g, "");

  return (
    <div className="@container">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
          </li>
          {breadcrumb.map((b) => (
            <li key={b.href} className="flex items-center gap-1">
              <span>›</span>
              <Link href={b.href} className="hover:text-primary">
                {b.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <span>›</span>
            <span className="text-foreground">{name || "Tên sản phẩm"}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 @2xl:grid-cols-2">
        <ProductGallery images={images} name={name} />

        <div className="space-y-5">
          <h1 className="text-2xl font-bold @2xl:text-3xl">{name || "Tên sản phẩm"}</h1>

          {details.length > 0 && (
            <ul className="space-y-1.5 text-sm @2xl:text-base">
              {details.map((a, i) => (
                <li key={`${a.label}-${i}`}>
                  <strong>{a.label}:</strong> {a.value}
                </li>
              ))}
            </ul>
          )}

          <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>

          <div className="flex flex-wrap gap-3">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`}>
                Gọi ngay
              </a>
            )}
            {zaloNumber && (
              <a
                href={`https://zalo.me/${zaloNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClass} bg-blue-500 text-white hover:bg-blue-600`}
              >
                Chat Zalo
              </a>
            )}
            <a href="#bao-gia" className={`${buttonClass} border border-primary text-primary hover:bg-primary/10`}>
              Yêu cầu báo giá
            </a>
          </div>
        </div>
      </div>

      {description && (
        <section className="mt-10">
          <div className="prose max-w-none prose-headings:scroll-mt-20" dangerouslySetInnerHTML={{ __html: description }} />
        </section>
      )}
    </div>
  );
}
