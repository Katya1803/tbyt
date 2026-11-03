import { FloatingButtons } from "@/components/public/FloatingButtons";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
