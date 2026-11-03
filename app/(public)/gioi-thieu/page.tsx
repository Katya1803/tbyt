import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { getPageBySlug } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";
import { ABOUT_SLUG } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug(ABOUT_SLUG);
  if (!page) return {};
  const setting = await getSiteSetting();
  return buildMetadata({
    title: page.metaTitle || `${page.title} - ${setting.companyName}`,
    description: page.metaDesc,
    path: "/gioi-thieu",
  });
}

export default async function AboutPage() {
  const page = await getPageBySlug(ABOUT_SLUG);
  if (!page) notFound();

  return (
    <article>
      <Breadcrumb items={[{ name: page.title }]} />
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{page.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
