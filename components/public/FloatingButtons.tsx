import Image from "next/image";
import { Phone } from "lucide-react";
import { getSiteSetting } from "@/lib/site";

const circle = "flex size-12 items-center justify-center rounded-full shadow-lg transition hover:scale-105";

export async function FloatingButtons() {
  const setting = await getSiteSetting();
  const zalo = setting.zalo?.replace(/\D/g, "");
  const phone = setting.phone?.replace(/\s/g, "");

  if (!zalo && !phone) return null;

  return (
    <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
      {phone && (
        <a href={`tel:${phone}`} aria-label="Gọi ngay" className={`${circle} bg-green-600 text-white hover:bg-green-700`}>
          <Phone className="size-6" aria-hidden />
        </a>
      )}
      {zalo && (
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className={`${circle} bg-[#0068FF]`}
        >
          <Image src="/zalo-button.svg" alt="" width={48} height={48} unoptimized className="size-12" />
        </a>
      )}
    </div>
  );
}
