import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactActions } from "@/components/admin/ContactActions";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: PageProps<"/admin/contacts/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const contact = await db.contactRequest.findUnique({
    where: { id },
    include: { product: { select: { name: true, slug: true } } },
  });
  if (!contact) notFound();

  if (!contact.isRead) await db.contactRequest.update({ where: { id }, data: { isRead: true } });

  const rows: [string, React.ReactNode][] = [
    ["Thời gian", formatDateTime(contact.createdAt)],
    ["Họ tên", contact.name],
    ["Số điện thoại", <a key="tel" href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>],
    ["Cơ sở / phòng khám", contact.organization ?? "—"],
    [
      "Sản phẩm quan tâm",
      contact.product ? (
        <a key="p" href={`/san-pham/${contact.product.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {contact.product.name}
        </a>
      ) : (
        "—"
      ),
    ],
    ["Nội dung", <span key="m" className="whitespace-pre-wrap">{contact.message ?? "—"}</span>],
  ];

  return (
    <div className="space-y-4">
      <Link href="/admin/contacts" className="text-sm text-primary hover:underline">
        ← Danh sách liên hệ
      </Link>
      <h1 className="text-2xl font-semibold">Chi tiết liên hệ</h1>
      <dl className="max-w-2xl divide-y rounded-xl border bg-background">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 p-4 sm:grid-cols-3">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
      <ContactActions id={contact.id} />
    </div>
  );
}
