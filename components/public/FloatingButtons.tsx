import { getSiteSetting } from "@/lib/site";

export async function FloatingButtons() {
  const setting = await getSiteSetting();
  const zalo = setting.zalo?.replace(/\D/g, "");
  const phone = setting.phone?.replace(/\s/g, "");

  if (!zalo && !phone) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="rounded-full bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-green-700 md:hidden"
        >
          Gọi ngay
        </a>
      )}
      {zalo && (
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-blue-600"
        >
          Zalo
        </a>
      )}
    </div>
  );
}
