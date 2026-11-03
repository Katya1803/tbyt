import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const all = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const roots = all.filter((c) => c.parentId === null);
  const rows = roots.flatMap((root) => [
    { ...root, level: 0 },
    ...all.filter((c) => c.parentId === root.id).map((c) => ({ ...c, level: 1 })),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
        >
          + Thêm danh mục
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Sản phẩm</TableHead>
              <TableHead className="text-right">Thứ tự</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có danh mục nào
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className={c.level ? "pl-8" : "font-medium"}>
                  {c.level ? "└ " : ""}
                  {c.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-right">{c._count.products}</TableCell>
                <TableCell className="text-right">{c.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted"
                    >
                      Sửa
                    </Link>
                    <DeleteButton action={deleteCategory.bind(null, c.id)} title={`Xóa danh mục "${c.name}"?`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
