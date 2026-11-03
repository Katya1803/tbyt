import type { Metadata } from "next";
import { FloatingButtons } from "@/components/public/FloatingButtons";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { JsonLd } from "@/components/public/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { getSiteSetting } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  return {
    title: { default: setting.defaultMetaTitle || setting.companyName, template: `%s - ${setting.companyName}` },
    description: setting.defaultMetaDesc || undefined,
  };
}

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const setting = await getSiteSetting();

  return (
    <>
      <JsonLd data={organizationJsonLd(setting)} />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
