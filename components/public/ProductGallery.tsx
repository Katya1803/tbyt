"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  images: { url: string; alt: string }[];
  name: string;
};

export function ProductGallery({ images, name }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-white text-sm text-muted-foreground">
        Chưa có ảnh
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    setIndex((i) => (delta < 0 ? Math.min(i + 1, images.length - 1) : Math.max(i - 1, 0)));
  }

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-lg border bg-white"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={current.url}
          alt={current.alt || name}
          width={800}
          height={800}
          unoptimized
          loading="eager"
          fetchPriority="high"
          className="aspect-square w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              className={cn(
                "size-16 shrink-0 snap-start overflow-hidden rounded-md border bg-white",
                i === index && "border-primary ring-2 ring-primary/40",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || name}
                width={128}
                height={128}
                unoptimized
                className="size-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
