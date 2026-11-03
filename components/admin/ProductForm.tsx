"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProduct } from "@/app/admin/(protected)/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ProductView } from "@/components/public/ProductView";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { AttributesEditor, type AttributeItem } from "./AttributesEditor";
import { ImageUploader, type ImageItem } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";

export type ProductFormState = {
  name: string;
  slug: string;
  categoryId: number | null;
  price: string; // digits only
  isActive: boolean;
  isFeatured: boolean;
  images: ImageItem[];
  attributes: AttributeItem[];
  description: string;
  metaTitle: string;
  metaDesc: string;
};

type CategoryOption = { id: number; name: string; slug: string; parentId: number | null };

type Props = {
  id: number | null;
  initial: ProductFormState;
  categories: CategoryOption[];
  labelSuggestions: string[];
  phone: string | null;
  zalo: string | null;
};

function formatPriceInput(digits: string): string {
  return digits ? Number(digits).toLocaleString("vi-VN") : "";
}

export function ProductForm({ id, initial, categories, labelSuggestions, phone, zalo }: Props) {
  const [state, setState] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [savedSlug, setSavedSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [frame, setFrame] = useState<"desktop" | "mobile">("desktop");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dirty = JSON.stringify(state) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const categoryOptions = useMemo(() => {
    const roots = categories.filter((c) => c.parentId === null);
    return roots.flatMap((root) => [
      { id: root.id, label: root.name },
      ...categories.filter((c) => c.parentId === root.id).map((c) => ({ id: c.id, label: `— ${c.name}` })),
    ]);
  }, [categories]);

  const breadcrumb = useMemo(() => {
    const category = categories.find((c) => c.id === state.categoryId);
    if (!category) return [];
    const parent = categories.find((c) => c.id === category.parentId);
    return [...(parent ? [parent] : []), category].map((c) => ({ name: c.name, href: `/danh-muc/${c.slug}` }));
  }, [categories, state.categoryId]);

  function save() {
    if (state.categoryId === null) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    startTransition(async () => {
      const result = await saveProduct(id, {
        ...state,
        categoryId: state.categoryId as number,
        price: state.price ? Number(state.price) : null,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã lưu sản phẩm");
      setBaseline(JSON.stringify(state));
      setSavedSlug(state.slug);
      if (id === null && result.id) router.replace(`/admin/products/${result.id}`);
      else router.refresh();
    });
  }

  const tabClass = (active: boolean) =>
    cn("rounded-md px-4 py-2 text-sm font-medium", active ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" className={tabClass(tab === "edit")} onClick={() => setTab("edit")}>
          Chỉnh sửa
        </button>
        <button type="button" className={tabClass(tab === "preview")} onClick={() => setTab("preview")}>
          Xem trước
        </button>
      </div>

      <div className={cn("space-y-6", tab !== "edit" && "hidden")}>
        <section className="space-y-4 rounded-xl border bg-background p-4 md:p-6">
          <h2 className="font-semibold">Thông tin chung</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => {
                const name = e.target.value;
                setState((s) => ({ ...s, name, slug: slugTouched ? s.slug : slugify(name) }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={state.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Danh mục *</Label>
              <NativeSelect
                id="categoryId"
                value={state.categoryId ?? ""}
                onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Chọn danh mục —</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VND) — để trống = &quot;Liên hệ&quot;</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={formatPriceInput(state.price)}
                onChange={(e) => set("price", e.target.value.replace(/\D/g, "").slice(0, 15))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={state.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Hiển thị trên web
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={state.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
              Sản phẩm nổi bật
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-background p-4 md:p-6">
          <h2 className="font-semibold">Ảnh</h2>
          <ImageUploader value={state.images} onChange={(images) => set("images", images)} defaultAlt={state.name} />
        </section>

        <section className="space-y-4 rounded-xl border bg-background p-4 md:p-6">
          <h2 className="font-semibold">Chi tiết sản phẩm</h2>
          <AttributesEditor value={state.attributes} onChange={(a) => set("attributes", a)} suggestions={labelSuggestions} />
        </section>

        <section className="space-y-4 rounded-xl border bg-background p-4 md:p-6">
          <h2 className="font-semibold">Mô tả</h2>
          <RichTextEditor value={state.description} onChange={(html) => set("description", html)} />
        </section>

        <section className="space-y-4 rounded-xl border bg-background p-4 md:p-6">
          <h2 className="font-semibold">SEO</h2>
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta title ({state.metaTitle.length}/60)</Label>
            <Input
              id="metaTitle"
              value={state.metaTitle}
              placeholder="Để trống = tự sinh từ tên sản phẩm"
              onChange={(e) => set("metaTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDesc">Meta description ({state.metaDesc.length}/160)</Label>
            <Textarea
              id="metaDesc"
              rows={3}
              value={state.metaDesc}
              placeholder="Để trống = tự sinh từ mô tả"
              onChange={(e) => set("metaDesc", e.target.value)}
            />
          </div>
        </section>
      </div>

      {tab === "preview" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={frame === "desktop" ? "default" : "outline"} onClick={() => setFrame("desktop")}>
              Desktop
            </Button>
            <Button type="button" size="sm" variant={frame === "mobile" ? "default" : "outline"} onClick={() => setFrame("mobile")}>
              Mobile
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-muted/40 p-4">
            <div className={cn("mx-auto rounded-lg bg-white p-4 md:p-6", frame === "mobile" ? "max-w-[390px]" : "max-w-6xl")}>
              <ProductView
                name={state.name}
                price={state.price ? Number(state.price) : null}
                attributes={state.attributes}
                images={state.images.map((img) => ({ url: img.url, alt: img.alt || state.name }))}
                description={state.description}
                breadcrumb={breadcrumb}
                phone={phone}
                zalo={zalo}
              />
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
        {id !== null && (
          <a
            href={`/san-pham/${savedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Xem trên web
          </a>
        )}
        {dirty && <span className="text-sm text-muted-foreground">Có thay đổi chưa lưu</span>}
      </div>
    </div>
  );
}
