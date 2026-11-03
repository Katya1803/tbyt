"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePage } from "@/app/admin/(protected)/pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import { RichTextEditor } from "./RichTextEditor";

type Props = {
  id: number | null;
  slugLocked: boolean;
  initial: { title: string; slug: string; content: string; metaTitle: string; metaDesc: string };
};

export function PageForm({ id, slugLocked, initial }: Props) {
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await savePage(id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã lưu trang");
      router.push("/admin/pages");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-4 rounded-xl border bg-background p-4 md:p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => {
            set("title", e.target.value);
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
          disabled={slugLocked}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", e.target.value);
          }}
          required
        />
        {slugLocked && <p className="text-xs text-muted-foreground">Trang này không được đổi slug.</p>}
      </div>
      <div className="space-y-2">
        <Label>Nội dung</Label>
        <RichTextEditor value={values.content} onChange={(html) => set("content", html)} />
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
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
        <Link href="/admin/pages" className="inline-flex h-8 items-center rounded-lg border px-3 text-sm hover:bg-muted">
          Hủy
        </Link>
      </div>
    </form>
  );
}
