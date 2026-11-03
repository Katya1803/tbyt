import type { Metadata } from "next";
import { htmlToText } from "@/lib/sanitize";
import { getSiteSetting } from "@/lib/site";

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function productDescription(p: {
  name: string;
  description: string;
  attributes: { label: string; value: string }[];
  metaDesc: string | null;
}): string {
  if (p.metaDesc) return p.metaDesc;
  const text = htmlToText(p.description);
  if (text) return truncate(text, 155);
  const details = p.attributes.map((a) => `${a.label}: ${a.value}`);
  return truncate([p.name, ...details].join(". "), 155);
}

type PageMetaInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  noindex?: boolean;
};

export async function buildMetadata({ title, description, path, image, noindex }: PageMetaInput): Promise<Metadata> {
  const setting = await getSiteSetting();
  const desc = description || setting.defaultMetaDesc || setting.companyName || undefined;
  const ogImage = image ?? undefined;

  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description: desc,
      url: path,
      siteName: setting.companyName,
      locale: "vi_VN",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}
