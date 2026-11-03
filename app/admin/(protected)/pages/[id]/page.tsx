import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/PageForm";
import { db } from "@/lib/db";
import { ABOUT_SLUG } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sửa trang</h1>
      <PageForm
        id={page.id}
        slugLocked={page.slug === ABOUT_SLUG}
        initial={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          metaTitle: page.metaTitle ?? "",
          metaDesc: page.metaDesc ?? "",
        }}
      />
    </div>
  );
}
