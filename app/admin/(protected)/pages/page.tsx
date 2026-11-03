import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { ABOUT_SLUG } from "@/lib/utils-server";
import { deletePage } from "./actions";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await db.page.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trang tĩnh</h1>
        <Link
          href="/admin/pages/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
        >
          + Thêm trang
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                <TableCell>{formatDateTime(p.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted"
                    >
                      Sửa
                    </Link>
                    {p.slug !== ABOUT_SLUG && (
                      <DeleteButton action={deletePage.bind(null, p.id)} title={`Xóa trang "${p.title}"?`} />
                    )}
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
