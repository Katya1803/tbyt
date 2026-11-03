import Image from "next/image";
import Link from "next/link";
import { getMenuCategories, getSiteSetting } from "@/lib/site";

export async function Header() {
  const [setting, categories] = await Promise.all([getSiteSetting(), getMenuCategories()]);
  const phoneHref = setting.phone?.replace(/\s/g, "");

  const linkClass = "rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {setting.logoUrl && (
            <Image src={setting.logoUrl} alt={setting.companyName} width={120} height={40} unoptimized loading="eager" className="h-10 w-auto object-contain" />
          )}
          <span className="text-lg font-bold text-primary">{setting.companyName}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Menu chính">
          <Link href="/" className={linkClass}>
            Trang chủ
          </Link>
          <div className="group relative">
            <span className={`${linkClass} inline-block cursor-default`} tabIndex={0}>
              Sản phẩm ▾
            </span>
            <div className="absolute left-0 top-full hidden min-w-64 rounded-lg border bg-white p-2 shadow-lg group-focus-within:block group-hover:block">
              {categories.map((c) => (
                <div key={c.id}>
                  <Link href={`/danh-muc/${c.slug}`} className="block rounded px-3 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary">
                    {c.name}
                  </Link>
                  {c.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/danh-muc/${child.slug}`}
                      className="block rounded py-1 pl-7 pr-3 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Link href="/gioi-thieu" className={linkClass}>
            Giới thiệu
          </Link>
          <Link href="/lien-he" className={linkClass}>
            Liên hệ
          </Link>
        </nav>

        <form action="/tim-kiem" role="search" className="ml-auto hidden flex-1 max-w-xs md:block">
          <input
            type="search"
            name="q"
            placeholder="Tìm sản phẩm..."
            aria-label="Tìm kiếm sản phẩm"
            className="h-9 w-full rounded-full border bg-muted/40 px-4 text-sm outline-none focus:border-primary"
          />
        </form>

        {setting.phone && (
          <a href={`tel:${phoneHref}`} className="ml-auto shrink-0 text-sm font-semibold text-primary md:ml-0">
            <span className="hidden sm:inline">Hotline: </span>
            {setting.phone}
          </a>
        )}
      </div>

      <details className="border-t lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-2 text-sm font-medium">☰ Menu</summary>
        <div className="space-y-1 px-4 pb-3">
          <form action="/tim-kiem" role="search" className="mb-2">
            <input
              type="search"
              name="q"
              placeholder="Tìm sản phẩm..."
              aria-label="Tìm kiếm sản phẩm"
              className="h-9 w-full rounded-full border bg-muted/40 px-4 text-sm outline-none focus:border-primary"
            />
          </form>
          <Link href="/" className="block py-1.5 text-sm">
            Trang chủ
          </Link>
          {categories.map((c) => (
            <div key={c.id}>
              <Link href={`/danh-muc/${c.slug}`} className="block py-1.5 text-sm font-medium">
                {c.name}
              </Link>
              {c.children.map((child) => (
                <Link key={child.id} href={`/danh-muc/${child.slug}`} className="block py-1 pl-4 text-sm text-muted-foreground">
                  {child.name}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/gioi-thieu" className="block py-1.5 text-sm">
            Giới thiệu
          </Link>
          <Link href="/lien-he" className="block py-1.5 text-sm">
            Liên hệ
          </Link>
        </div>
      </details>
    </header>
  );
}
