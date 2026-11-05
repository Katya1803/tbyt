"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveCategory } from "@/app/admin/(protected)/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import { uploadImageFile } from "./upload-client";

type Props = {
  id: number | null;
  parents: { id: number; name: string }[];
  hasChildren: boolean;
  initial: {
    name: string;
    slug: string;
    parentId: number | null;
    description: string;
    image: string | null;
    sortOrder: number;
    metaTitle: string;
    metaDesc: string;
  };
};

export function CategoryForm({ id, parents, hasChildren, initial }: Props) {
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      set("image", await uploadImageFile(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được ảnh");
    }
    setUploading(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveCategory(id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã lưu danh mục");
      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border bg-background p-4 md:p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tên danh mục *</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => {
            set("name", e.target.value);
            if (!slugTouched) set("slug", slugify(e.target.value));
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", e.target.value);
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="parentId">Danh mục cha</Label>
        <NativeSelect
          id="parentId"
          value={values.parentId ?? ""}
          disabled={hasChildren}
          onChange={(e) => set("parentId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— Không (danh mục cấp 1) —</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
        {hasChildren && <p className="text-xs text-muted-foreground">Danh mục đang có danh mục con nên luôn là cấp 1.</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Ảnh danh mục</Label>
        {values.image && (
          <Image src={values.image} alt={values.name} width={240} height={200} unoptimized className="h-28 w-auto max-w-full rounded border bg-white object-cover" />
        )}
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadImage(file);
            }}
          />
          {values.image && (
            <Button type="button" variant="destructive" onClick={() => set("image", null)}>
              Xóa ảnh
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Hiển thị ở mục &quot;Giải pháp thiết bị y tế&quot; trên trang chủ (chỉ danh mục cấp 1). Nên dùng ảnh gần vuông.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Thứ tự (nhỏ hơn hiện trước)</Label>
        <Input
          id="sortOrder"
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metaTitle">Meta title ({values.metaTitle.length}/60)</Label>
        <Input id="metaTitle" value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metaDesc">Meta description ({values.metaDesc.length}/160)</Label>
        <Textarea id="metaDesc" rows={3} value={values.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
        <Link href="/admin/categories" className="inline-flex h-8 items-center rounded-lg border px-3 text-sm hover:bg-muted">
          Hủy
        </Link>
      </div>
    </form>
  );
}
