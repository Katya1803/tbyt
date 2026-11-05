import Link from "next/link";
import { ChevronDown, LayoutGrid, Phone, Search, Sparkles } from "lucide-react";
import { NavLink } from "@/components/public/NavLink";
import { getMenuCategories, getPolicyPages, getSiteSetting } from "@/lib/site";

const dropdownClass =
  "absolute left-0 top-full z-50 hidden min-w-72 rounded-b-xl border bg-white p-2 shadow-gold group-focus-within:block group-hover:block";
const dropdownItemClass = "block rounded px-3 py-1.5 text-sm font-medium lg:py-2 lg:text-[1.05rem] hover:bg-accent hover:text-primary";
const dropdownChildClass = "block rounded py-1 pl-7 pr-3 text-sm text-muted-foreground lg:text-[1.05rem] hover:bg-accent hover:text-primary";

export async function Header() {
  const [setting, categories, policies] = await Promise.all([getSiteSetting(), getMenuCategories(), getPolicyPages()]);
  const phoneHref = setting.phone?.replace(/\s/g, "");

  const categoryLinks = categories.map((c) => (
    <div key={c.id}>
      <Link href={`/danh-muc/${c.slug}`} className={dropdownItemClass}>
        {c.name}
      </Link>
      {c.children.map((child) => (
        <Link key={child.id} href={`/danh-muc/${child.slug}`} className={dropdownChildClass}>
          {child.name}
        </Link>
      ))}
    </div>
  ));

  const searchForm = (className: string) => (
    <form action="/tim-kiem" role="search" className={`flex ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="Tìm sản phẩm..."
        aria-label="Tìm kiếm sản phẩm"
        className="h-10 min-w-0 flex-1 rounded-l-full border border-r-0 bg-white px-4 text-sm outline-none lg:h-12 lg:px-5 lg:text-[1.05rem] transition focus:border-primary"
      />
      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="flex h-10 w-12 items-center justify-center rounded-r-full lg:h-12 lg:w-14 bg-gold text-gold-ink transition hover:brightness-105"
      >
        <Search className="size-4 lg:size-5" aria-hidden />
      </button>
    </form>
  );

  return (
    <header className="relative z-40 border-b bg-white shadow-sm">
      <div aria-hidden className="h-1 bg-gold animate-shimmer" />

      {/* Row 1: logo, search, hotline */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:py-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label={setting.companyName || "Trang chủ"}>
          <span role="img" aria-label={setting.companyName} className="logo-gold aspect-[613/342] h-12 lg:h-[3.6rem]" />
        </Link>

        {searchForm("mx-auto hidden w-full max-w-xl md:flex lg:max-w-[43rem]")}

        {setting.phone && (
          <a
            href={`tel:${phoneHref}`}
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-gold-ink shadow-gold animate-shimmer transition hover:scale-105 md:ml-0 lg:px-5 lg:py-2.5 lg:text-[1.05rem]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/60 lg:size-8">
              <Phone className="size-4 lg:size-5" aria-hidden />
            </span>
            <span className="hidden sm:inline">Hotline: </span>
            {setting.phone}
          </a>
        )}
      </div>

      {/* Row 2 (desktop): product categories tab + main menu */}
      <div className="mx-auto hidden max-w-7xl items-stretch gap-6 px-4 lg:flex">
        <div className="group relative w-[16.8rem] shrink-0">
          <span
            tabIndex={0}
            className="flex h-full cursor-default items-center gap-2 rounded-t-xl bg-gold px-5 py-3.5 text-[1.05rem] font-bold uppercase tracking-wide text-gold-ink animate-shimmer"
          >
            <LayoutGrid className="size-5" aria-hidden />
            Danh mục sản phẩm
          </span>
          <div className={`${dropdownClass} w-full rounded-t-none`}>{categoryLinks}</div>
        </div>

        {setting.showSlogan && setting.slogan && (
          <p className="hidden flex-1 items-center justify-center gap-2 animate-drift xl:flex">
            <Sparkles className="size-5 shrink-0 text-[#d4a93c] animate-twinkle" aria-hidden />
            <span className="text-gold animate-shimmer text-[1.05rem] font-bold italic">{setting.slogan}</span>
          </p>
        )}

        <nav className="ml-auto flex items-center" aria-label="Menu chính">
          <NavLink href="/">Trang chủ</NavLink>
          <NavLink href="/gioi-thieu">Giới thiệu</NavLink>
          {policies.length > 0 && (
            <div className="group relative">
              <span
                tabIndex={0}
                className="inline-flex cursor-default items-center gap-1 px-5 py-3.5 text-[1.05rem] font-semibold uppercase tracking-wide transition-colors hover:text-primary"
              >
                Chính sách
                <ChevronDown className="size-5 transition-transform group-hover:rotate-180" aria-hidden />
              </span>
              <div className={dropdownClass}>
                {policies.map((p) => (
                  <Link key={p.slug} href={`/chinh-sach/${p.slug}`} className={dropdownItemClass}>
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <NavLink href="/lien-he">Liên hệ</NavLink>
        </nav>
      </div>

      {/* Mobile menu */}
      <details className="border-t lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-2 text-sm font-medium">☰ Menu</summary>
        <div className="space-y-1 px-4 pb-3">
          {searchForm("mb-2 w-full")}
          <Link href="/" className="block py-1.5 text-sm font-semibold uppercase">
            Trang chủ
          </Link>
          <Link href="/gioi-thieu" className="block py-1.5 text-sm font-semibold uppercase">
            Giới thiệu
          </Link>
          <p className="pt-2 text-xs font-bold uppercase tracking-wide text-primary">Danh mục sản phẩm</p>
          {categoryLinks}
          {policies.length > 0 && <p className="pt-2 text-xs font-bold uppercase tracking-wide text-primary">Chính sách</p>}
          {policies.map((p) => (
            <Link key={p.slug} href={`/chinh-sach/${p.slug}`} className={dropdownItemClass}>
              {p.title}
            </Link>
          ))}
          <Link href="/lien-he" className="block py-1.5 text-sm font-semibold uppercase">
            Liên hệ
          </Link>
        </div>
      </details>
    </header>
  );
}
