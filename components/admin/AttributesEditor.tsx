"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AttributeItem = { label: string; value: string };

type Props = {
  value: AttributeItem[];
  onChange: (items: AttributeItem[]) => void;
  suggestions: string[];
};

export function AttributesEditor({ value, onChange, suggestions }: Props) {
  const listId = useId();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function update(index: number, patch: Partial<AttributeItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {value.map((item, i) => (
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null) move(dragIndex, i);
            setDragIndex(null);
          }}
          className={cn("flex items-center gap-2", dragIndex === i && "opacity-50")}
        >
          <span
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => setDragIndex(null)}
            className="cursor-grab select-none px-1 text-muted-foreground"
            title="Kéo để sắp xếp"
          >
            ⠿
          </span>
          <Input
            list={listId}
            value={item.label}
            placeholder="Nhãn"
            aria-label="Nhãn"
            className="w-2/5"
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            value={item.value}
            placeholder="Giá trị"
            aria-label="Giá trị"
            className="flex-1"
            onChange={(e) => update(i, { value: e.target.value })}
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Xóa dòng" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { label: "", value: "" }])}>
        + Thêm chi tiết
      </Button>
    </div>
  );
}
