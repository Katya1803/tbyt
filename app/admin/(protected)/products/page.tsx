import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { parsePage } from "@/lib/utils-server";
import { deleteProduct } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryId = Number(sp.category) || undefined;
  const page = parsePage(sp.page);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sản phẩm</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="Tìm theo tên..." className="max-w-xs" />
        <NativeSelect name="category" defaultValue={categoryId ?? ""} className="max-w-xs">
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? "— " : ""}
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">
          Lọc
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images[0] ? (
                    <Image src={p.images[0].url} alt={p.name} width={48} height={48} unoptimized className="size-12 rounded border bg-white object-contain" />
                  ) : (
                    <div className="size-12 rounded border bg-muted" />
                  )}
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal font-medium">{p.name}</TableCell>
                <TableCell>{p.category.name}</TableCell>
                <TableCell className="text-right">{formatPrice(p.price === null ? null : Number(p.price))}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Hiện" : "Ẩn"}</Badge>
                    {p.isFeatured && <Badge variant="outline">Nổi bật</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted"
                    >
                      Sửa
                    </Link>
                    <DeleteButton
                      action={deleteProduct.bind(null, p.id)}
                      title={`Xóa sản phẩm "${p.name}"?`}
                      description="Sản phẩm cùng toàn bộ ảnh sẽ bị xóa vĩnh viễn."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        basePath="/admin/products"
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        params={{ q, category: categoryId ? String(categoryId) : undefined }}
      />
    </div>
  );
}
