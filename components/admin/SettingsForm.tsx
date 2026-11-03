"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSettings } from "@/app/admin/(protected)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageFile } from "./upload-client";

export type SettingsValues = {
  companyName: string;
  bannerWide: string | null;
  bannerLeft: string | null;
  bannerRight: string | null;
  phone: string;
  zalo: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  facebookUrl: string;
  workingHours: string;
  footerNote: string;
  defaultMetaTitle: string;
  defaultMetaDesc: string;
};

type ImageKey = "bannerWide" | "bannerLeft" | "bannerRight";

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function uploadImage(key: ImageKey, file: File) {
    setUploading(true);
    try {
      set(key, await uploadImageFile(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được ảnh");
    }
    setUploading(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã lưu thông tin công ty");
      router.refresh();
    });
  }

  const field = (key: Exclude<keyof SettingsValues, ImageKey>, label: string, multiline = false, hint?: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea id={key} rows={3} value={values[key]} onChange={(e) => set(key, e.target.value)} />
      ) : (
        <Input id={key} value={values[key]} onChange={(e) => set(key, e.target.value)} />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  const imageField = (key: ImageKey, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {values[key] && (
        <Image src={values[key]} alt={label} width={320} height={160} unoptimized className="h-24 w-auto max-w-full rounded border bg-white object-contain p-1" />
      )}
      <div className="flex gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) uploadImage(key, file);
          }}
        />
        {values[key] && (
          <Button type="button" variant="destructive" onClick={() => set(key, null)}>
            Xóa ảnh
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border bg-background p-4 md:p-6">
      {field("companyName", "Tên công ty *")}

      <div className="space-y-4 rounded-lg border p-4">
        <p className="font-medium">Ảnh trang chủ</p>
        {imageField("bannerWide", "Ảnh dài (bên trên) — nên dùng ảnh ngang, tỉ lệ khoảng 3:1")}
        {imageField("bannerLeft", "Ảnh nhỏ bên trái — tỉ lệ khoảng 2:1")}
        {imageField("bannerRight", "Ảnh nhỏ bên phải — tỉ lệ khoảng 2:1")}
      </div>

      {field("phone", "Hotline")}
      {field("zalo", "Số Zalo", false, "Nhập số điện thoại, ví dụ 0901234567")}
      {field("email", "Email")}
      {field("address", "Địa chỉ", true, "Mỗi dòng một địa chỉ (ví dụ trụ sở, chi nhánh). Hiện ở chân trang kèm icon định vị.")}
      {field("googleMapsUrl", "Link Google Maps")}
      {field("facebookUrl", "Link Facebook")}
      {field("workingHours", "Giờ làm việc", true)}
      {field("footerNote", "Ghi chú chân trang", true)}
      {field("defaultMetaTitle", "Meta title mặc định")}
      {field("defaultMetaDesc", "Meta description mặc định (cũng dùng làm giới thiệu ngắn ở trang chủ)", true)}

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu"}
      </Button>
    </form>
  );
}
