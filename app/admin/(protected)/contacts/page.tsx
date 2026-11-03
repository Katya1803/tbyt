import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { parsePage } from "@/lib/utils-server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ContactsPage({ searchParams }: PageProps<"/admin/contacts">) {
  const sp = await searchParams;
  const unreadOnly = sp.filter === "unread";
  const page = parsePage(sp.page);
  const where = unreadOnly ? { isRead: false } : {};

  const [contacts, total] = await Promise.all([
    db.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { product: { select: { id: true, name: true, slug: true } } },
    }),
    db.contactRequest.count({ where }),
  ]);

  const tab = (active: boolean) =>
    cn("rounded-md px-3 py-1.5 text-sm", active ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Liên hệ</h1>
      <div className="flex gap-2">
        <Link href="/admin/contacts" className={tab(!unreadOnly)}>
          Tất cả
        </Link>
        <Link href="/admin/contacts?filter=unread" className={tab(unreadOnly)}>
          Chưa đọc
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Cơ sở</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có liên hệ nào
                </TableCell>
              </TableRow>
            )}
            {contacts.map((c) => (
              <TableRow key={c.id} className={cn(!c.isRead && "font-semibold")}>
                <TableCell>
                  <Link href={`/admin/contacts/${c.id}`} className="hover:underline">
                    {formatDateTime(c.createdAt)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/contacts/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.organization}</TableCell>
                <TableCell>
                  {c.product && (
                    <a href={`/san-pham/${c.product.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {c.product.name}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={c.isRead ? "secondary" : "default"}>{c.isRead ? "Đã đọc" : "Chưa đọc"}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        basePath="/admin/contacts"
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        params={{ filter: unreadOnly ? "unread" : undefined }}
      />
    </div>
  );
}
