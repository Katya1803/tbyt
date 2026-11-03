import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ContactForm } from "@/components/public/ContactForm";
import { buildMetadata } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const setting = await getSiteSetting();
  return buildMetadata({ title: `Liên hệ - ${setting.companyName}`, path: "/lien-he" });
}

export default async function ContactPage() {
  const setting = await getSiteSetting();

  return (
    <div>
      <Breadcrumb items={[{ name: "Liên hệ" }]} />
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Liên hệ</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-3 text-sm md:text-base">
          <h2 className="text-xl font-semibold">{setting.companyName}</h2>
          {setting.address && <p>Địa chỉ: {setting.address}</p>}
          {setting.phone && (
            <p>
              Hotline: <a href={`tel:${setting.phone.replace(/\s/g, "")}`} className="font-semibold text-primary">{setting.phone}</a>
            </p>
          )}
          {setting.email && (
            <p>
              Email: <a href={`mailto:${setting.email}`} className="text-primary">{setting.email}</a>
            </p>
          )}
          {setting.workingHours && <p className="whitespace-pre-line">Giờ làm việc: {setting.workingHours}</p>}
          {setting.googleMapsUrl && (
            <a
              href={setting.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-lg border border-primary px-5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Xem bản đồ Google Maps
            </a>
          )}
        </section>
        <ContactForm title="Gửi yêu cầu liên hệ" />
      </div>
    </div>
  );
}
