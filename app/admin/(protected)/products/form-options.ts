import { db } from "@/lib/db";

const DEFAULT_LABELS = ["Model", "Hãng sản xuất", "Xuất xứ", "Bảo hành", "Tình trạng"];

export async function getProductFormOptions() {
  const [categories, usedLabels, setting] = await Promise.all([
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    db.$queryRaw<{ label: string }[]>`
      SELECT DISTINCT jsonb_array_elements(attributes)->>'label' AS label FROM "Product"
    `,
    db.siteSetting.findUnique({ where: { id: 1 } }),
  ]);

  const labelSuggestions = Array.from(new Set([...DEFAULT_LABELS, ...usedLabels.map((r) => r.label).filter(Boolean)]));

  return { categories, labelSuggestions, phone: setting?.phone ?? null, zalo: setting?.zalo ?? null };
}
