import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteSetting } from "@/lib/site";
import { ABOUT_SLUG } from "@/lib/utils-server";

export async function Footer() {
  const [setting, policies] = await Promise.all([
    getSiteSetting(),
    db.page.findMany({ where: { slug: { not: ABOUT_SLUG } }, orderBy: { id: "asc" }, select: { slug: true, title: true } }),
  ]);

  const addresses = (setting.address ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <footer className="mt-12 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-2 text-sm">
          <Image src="/cnmed-logo.svg" alt={setting.companyName} width={640} height={470} unoptimized className="mb-2 h-18 w-auto" />
          {addresses.map((line) => (
            <p key={line} className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{line}</span>
            </p>
          ))}
          {setting.phone && (
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${setting.phone.replace(/\s/g, "")}`}>{setting.phone}</a>
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
          <ul className="space-y-2">
            {setting.facebookUrl && (
              <li>
                <a href={setting.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Facebook
                </a>
              </li>
            )}
            {setting.zalo && (
              <li>
                <a
                  href={`https://zalo.me/${setting.zalo.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary"
                >
                  <Image src="/zalo-1.svg" alt="Zalo" width={24} height={24} unoptimized className="size-6" />
                  {setting.zalo}
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
