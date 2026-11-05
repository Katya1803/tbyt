import { CategoryForm } from "@/components/admin/CategoryForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const parents = await db.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm danh mục</h1>
      <CategoryForm
        id={null}
        parents={parents}
        hasChildren={false}
        initial={{ name: "", slug: "", parentId: null, description: "", image: null, sortOrder: 0, metaTitle: "", metaDesc: "" }}
      />
    </div>
  );
}
