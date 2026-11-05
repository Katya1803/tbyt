import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getPolicyPages, getSiteSetting } from "@/lib/site";

const headingClass = "text-gold text-base font-bold uppercase tracking-wide";
const iconClass = "size-4 shrink-0 text-primary";

export async function Footer() {
  const [setting, policies] = await Promise.all([getSiteSetting(), getPolicyPages()]);

  const addresses = (setting.address ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const fanpage = (
    <Image
      src={setting.footerImage ?? "/cnmed-page.webp"}
      alt={`Fanpage Facebook ${setting.companyName}`}
      width={576}
      height={324}
      unoptimized
      className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
  const fanpageClass =
    "group mt-2 block w-72 max-w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#e3cd8a] transition hover:-translate-y-1 hover:shadow-gold hover:ring-[#d4a93c]";

  return (
    <footer className="mt-12 border-t border-[#ecdcae] bg-gradient-to-b from-[#fdf6e3] to-[#f8ecc9]">
      <div aria-hidden className="h-1 bg-gold animate-shimmer" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-2 text-sm">
          <span role="img" aria-label={setting.companyName} className="logo-gold mb-3 aspect-[640/470] h-24 [--logo:url(/cnmed-logo.svg)]" />
          {addresses.map((line) => (
            <p key={line} className="flex items-start gap-2">
              <MapPin className={`mt-0.5 ${iconClass}`} aria-hidden />
              <span>{line}</span>
            </p>
          ))}
          {setting.phone && (
            <p className="flex items-center gap-2">
              <Phone className={iconClass} aria-hidden />
              <a href={`tel:${setting.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                {setting.phone}
              </a>
            </p>
          )}
          {setting.email && (
            <p className="flex items-center gap-2">
              <Mail className={iconClass} aria-hidden />
              <a href={`mailto:${setting.email}`} className="hover:text-primary">
                {setting.email}
              </a>
            </p>
          )}
          {setting.workingHours && <p className="whitespace-pre-line">Giờ làm việc: {setting.workingHours}</p>}
        </div>

        <div className="space-y-3 text-sm">
          <p className={headingClass}>Chính sách</p>
          <ul className="space-y-1.5">
            {policies.map((p) => (
              <li key={p.slug}>
                <Link href={`/chinh-sach/${p.slug}`} className="transition-colors hover:text-primary">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className={headingClass}>Kết nối</p>
          <ul className="flex flex-wrap items-center gap-4">
            {setting.facebookUrl && (
              <li>
                <a
                  href={setting.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex items-center transition hover:scale-110"
                >
                  <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                    <path
                      fill="#1877F2"
                      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
                    />
                  </svg>
                </a>
              </li>
            )}
            {setting.zalo && (
              <li>
                <a
                  href={`https://zalo.me/${setting.zalo.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <Image src="/zalo-1.svg" alt="Zalo" width={24} height={24} unoptimized className="size-6" />
                  {setting.zalo}
                </a>
              </li>
            )}
          </ul>
          {setting.facebookUrl ? (
            <a href={setting.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Fanpage Facebook" className={fanpageClass}>
              {fanpage}
            </a>
          ) : (
            <div className={fanpageClass}>{fanpage}</div>
          )}
          {setting.footerNote && <p className="whitespace-pre-line pt-2 text-muted-foreground">{setting.footerNote}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <p className="border-t border-[#e3cd8a] py-4 text-center text-sm text-muted-foreground">
          Copyright © {new Date().getFullYear()} {setting.companyName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
