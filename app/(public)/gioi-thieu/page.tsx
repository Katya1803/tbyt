import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { db } from "@/lib/db";
import { ABOUT_SLUG } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await db.page.findUnique({ where: { slug: ABOUT_SLUG } });
  if (!page) notFound();

  return (
    <article>
      <Breadcrumb items={[{ name: page.title }]} />
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{page.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
