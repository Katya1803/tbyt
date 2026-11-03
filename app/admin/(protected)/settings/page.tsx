import { SettingsForm } from "@/components/admin/SettingsForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await db.siteSetting.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thông tin công ty</h1>
      <SettingsForm
        initial={{
          companyName: s?.companyName ?? "",
          bannerWide: s?.bannerWide ?? null,
          bannerLeft: s?.bannerLeft ?? null,
          bannerRight: s?.bannerRight ?? null,
          phone: s?.phone ?? "",
          zalo: s?.zalo ?? "",
          email: s?.email ?? "",
          address: s?.address ?? "",
          googleMapsUrl: s?.googleMapsUrl ?? "",
          facebookUrl: s?.facebookUrl ?? "",
          workingHours: s?.workingHours ?? "",
          footerNote: s?.footerNote ?? "",
          defaultMetaTitle: s?.defaultMetaTitle ?? "",
          defaultMetaDesc: s?.defaultMetaDesc ?? "",
        }}
      />
    </div>
  );
}
