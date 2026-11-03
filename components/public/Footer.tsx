import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSiteSetting } from "@/lib/site";
import { ABOUT_SLUG } from "@/lib/utils-server";

export async function Footer() {
  const [setting, policies] = await Promise.all([
    getSiteSetting(),
    db.page.findMany({ where: { slug: { not: ABOUT_SLUG } }, orderBy: { id: "asc" }, select: { slug: true, title: true } }),
  ]);

  return (
    <footer className="mt-12 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-2 text-sm">
          <Image src="/cnmed-logo.svg" alt={setting.companyName} width={640} height={470} unoptimized className="mb-2 h-18 w-auto" />
          {setting.address && <p>Địa chỉ: {setting.address}</p>}
          {setting.phone && (
            <p>
              Hotline: <a href={`tel:${setting.phone.replace(/\s/g, "")}`}>{setting.phone}</a>
            </p>
          )}
          {setting.email && (
            <p>
              Email: <a href={`mailto:${setting.email}`}>{setting.email}</a>
            </p>
          )}
          {setting.workingHours && <p className="whitespace-pre-line">Giờ làm việc: {setting.workingHours}</p>}
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Chính sách</p>
          <ul className="space-y-1">
            {policies.map((p) => (
              <li key={p.slug}>
                <Link href={`/chinh-sach/${p.slug}`} className="hover:text-primary">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Kết nối</p>
          <ul className="space-y-1">
            {setting.facebookUrl && (
              <li>
                <a href={setting.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Facebook
                </a>
              </li>
            )}
            {setting.zalo && (
              <li>
                <a href={`https://zalo.me/${setting.zalo.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Zalo: {setting.zalo}
                </a>
              </li>
            )}
          </ul>
          {setting.footerNote && <p className="whitespace-pre-line pt-2 text-muted-foreground">{setting.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
