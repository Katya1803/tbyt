"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImageFile, UPLOAD_URL_PATTERN } from "@/lib/upload";
import { emptyToNull, isUniqueError, type ActionResult } from "@/lib/utils-server";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập slug")
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu -"),
  parentId: z.number().int().nullable(),
  description: z.string().max(5000),
  image: z.string().regex(UPLOAD_URL_PATTERN).nullable(),
  sortOrder: z.number().int().min(0).max(100000),
  metaTitle: z.string().max(200),
  metaDesc: z.string().max(500),
});

export type CategoryInput = z.input<typeof categorySchema>;

export async function saveCategory(id: number | null, input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (data.parentId !== null) {
    if (data.parentId === id) return { ok: false, error: "Danh mục không thể là cha của chính nó" };
    const parent = await db.category.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.parentId !== null) return { ok: false, error: "Danh mục cha phải là danh mục cấp 1" };
    if (id !== null && (await db.category.count({ where: { parentId: id } })) > 0) {
      return { ok: false, error: "Danh mục đang có danh mục con nên không thể gán danh mục cha" };
    }
  }

  const values = {
    name: data.name,
    slug: data.slug,
    parentId: data.parentId,
    description: emptyToNull(data.description),
    image: data.image,
    sortOrder: data.sortOrder,
    metaTitle: emptyToNull(data.metaTitle),
    metaDesc: emptyToNull(data.metaDesc),
  };

  const previous = id === null ? null : await db.category.findUnique({ where: { id }, select: { image: true } });

  try {
    const saved =
      id === null
        ? await db.category.create({ data: values })
        : await db.category.update({ where: { id }, data: values });
    if (previous?.image && previous.image !== data.image) await deleteImageFile(previous.image);
    return { ok: true, id: saved.id };
  } catch (e) {
    if (isUniqueError(e)) return { ok: false, error: "Slug đã tồn tại, vui lòng chọn slug khác" };
    throw e;
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  await requireAdmin();

  const [products, children] = await Promise.all([
    db.product.count({ where: { categoryId: id } }),
    db.category.count({ where: { parentId: id } }),
  ]);
  if (products > 0) return { ok: false, error: `Không thể xóa: danh mục còn ${products} sản phẩm` };
  if (children > 0) return { ok: false, error: `Không thể xóa: danh mục còn ${children} danh mục con` };

  const deleted = await db.category.delete({ where: { id } });
  if (deleted.image) await deleteImageFile(deleted.image);
  return { ok: true };
}
