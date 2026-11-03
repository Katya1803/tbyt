import { siteUrl } from "@/lib/site";

type Setting = {
  companyName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebookUrl: string | null;
};

export function organizationJsonLd(s: Setting) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.companyName,
    url: siteUrl("/"),
    logo: siteUrl("/cnmed-logo.svg"),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.address ? { address: { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "VN" } } : {}),
    ...(s.facebookUrl ? { sameAs: [s.facebookUrl] } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Trang chủ", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function productJsonLd(p: {
  name: string;
  description: string;
  path: string;
  images: string[];
  price: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    ...(p.images.length > 0 ? { image: p.images.map((url) => siteUrl(url)) } : {}),
    ...(p.price !== null
      ? {
          offers: {
            "@type": "Offer",
            url: siteUrl(p.path),
            price: p.price,
            priceCurrency: "VND",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}
