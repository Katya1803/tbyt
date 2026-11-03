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
  logoUrl: string | null;
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

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      set("logoUrl", await uploadImageFile(file));
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

  const field = (key: Exclude<keyof SettingsValues, "logoUrl">, label: string, multiline = false, hint?: string) => (
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

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border bg-background p-4 md:p-6">
      {field("companyName", "Tên công ty *")}

      <div className="space-y-2">
        <Label>Logo</Label>
        {values.logoUrl && (
          <Image src={values.logoUrl} alt="Logo" width={160} height={80} unoptimized className="h-20 w-auto rounded border bg-white object-contain p-1" />
        )}
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadLogo(file);
            }}
          />
          {values.logoUrl && (
            <Button type="button" variant="destructive" onClick={() => set("logoUrl", null)}>
              Xóa logo
            </Button>
          )}
        </div>
      </div>

      {field("phone", "Hotline")}
      {field("zalo", "Số Zalo", false, "Nhập số điện thoại, ví dụ 0901234567")}
      {field("email", "Email")}
      {field("address", "Địa chỉ", true)}
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
