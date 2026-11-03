import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [category, parents, childCount] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { parentId: null, NOT: { id } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.category.count({ where: { parentId: id } }),
  ]);
  if (!category) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sửa danh mục</h1>
      <CategoryForm
        id={category.id}
        parents={parents}
        hasChildren={childCount > 0}
        initial={{
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          description: category.description ?? "",
          sortOrder: category.sortOrder,
          metaTitle: category.metaTitle ?? "",
          metaDesc: category.metaDesc ?? "",
        }}
      />
    </div>
  );
}
