"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadImageFile } from "./upload-client";

export type ImageItem = { url: string; alt: string };

type Props = {
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  defaultAlt: string;
};

export function ImageUploader({ value, onChange, defaultAlt }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setUploading(true);
    const added: ImageItem[] = [];
    for (const file of Array.from(files)) {
      try {
        added.push({ url: await uploadImageFile(file), alt: "" });
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof Error ? e.message : "Không tải được ảnh"}`);
      }
    }
    if (added.length > 0) onChange([...value, ...added]);
    setUploading(false);
  }

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function update(index: number, patch: Partial<ImageItem>) {
    onChange(value.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <div
            key={img.url}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn("space-y-2 rounded-lg border bg-background p-2", dragIndex === i && "opacity-50")}
          >
            <div className="relative cursor-grab">
              <Image
                src={img.url}
                alt={img.alt || defaultAlt}
                width={300}
                height={300}
                unoptimized
                draggable={false}
                className="aspect-square w-full rounded-md bg-white object-contain"
              />
              {i === 0 && <Badge className="absolute top-1 left-1">Ảnh chính</Badge>}
            </div>
            <Input
              value={img.alt}
              placeholder={defaultAlt || "Mô tả ảnh (alt)"}
              onChange={(e) => update(i, { alt: e.target.value })}
              aria-label="Mô tả ảnh (alt)"
            />
            <div className="flex gap-1">
              {i > 0 && (
                <Button type="button" variant="outline" size="xs" onClick={() => move(i, 0)}>
                  Đặt làm ảnh chính
                </Button>
              )}
              <Button type="button" variant="destructive" size="xs" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>
        {uploading ? "Đang tải ảnh..." : "+ Tải ảnh lên"}
      </Button>
      <p className="text-xs text-muted-foreground">
        jpg, png, webp, tối đa 10MB mỗi ảnh. Kéo thả để sắp xếp; ảnh đầu tiên là ảnh chính.
      </p>
    </div>
  );
}
