import Link from "next/link";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getMenuCategories } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const categories = await getMenuCategories();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-3 text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã được chuyển đi.</p>
        <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Về trang chủ
        </Link>
        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/danh-muc/${c.slug}`} className="rounded-full border px-4 py-1.5 text-sm hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
