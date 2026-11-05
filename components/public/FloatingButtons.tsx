import Image from "next/image";
import { Phone } from "lucide-react";
import { getSiteSetting } from "@/lib/site";

// Light gold circles that shake and pulse; staggered so they don't move together.
const circle =
  "flex size-12 items-center justify-center rounded-full border-2 border-white bg-[#f6e3a4] text-gold-ink shadow-gold animate-wiggle-pulse transition-[scale] hover:scale-110 [--pulse:rgb(212_169_60/0.55)]";

export async function FloatingButtons() {
  const setting = await getSiteSetting();
  const zalo = setting.zalo?.replace(/\D/g, "");
  const phone = setting.phone?.replace(/\s/g, "");
  const facebook = setting.facebookUrl;

  if (!zalo && !phone && !facebook) return null;

  return (
    <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
      {phone && (
        <a href={`tel:${phone}`} aria-label="Gọi ngay" className={circle}>
          <Phone className="size-6 text-[#1877F2]" aria-hidden />
        </a>
      )}
      {zalo && (
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className={`${circle} [animation-delay:0.7s]`}
        >
          <Image src="/zalo-1.svg" alt="" width={28} height={28} unoptimized className="size-7" />
        </a>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`${circle} [animation-delay:1.4s]`}>
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
            <path
              fill="#1877F2"
              d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
