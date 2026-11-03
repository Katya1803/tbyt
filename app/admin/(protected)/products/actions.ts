"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize";
import { buildSearchText } from "@/lib/search";
import { requireAdmin } from "@/lib/session";
import { deleteImageFile, UPLOAD_URL_PATTERN } from "@/lib/upload";
import { emptyToNull, isUniqueError, type ActionResult } from "@/lib/utils-server";

const attributesSchema = z.array(
  z.object({
    label: z.string().trim().min(1).max(100),
    value: z.string().trim().min(1).max(500),
  }),
);

const productSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm").max(300),
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập slug")
    .max(300)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu -"),
  categoryId: z.number().int("Vui lòng chọn danh mục"),
  price: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z
    .array(z.object({ url: z.string().regex(UPLOAD_URL_PATTERN), alt: z.string().max(300) }))
    .max(30, "Tối đa 30 ảnh"),
  attributes: z.array(z.object({ label: z.string(), value: z.string() })).max(100),
  description: z.string().max(500000),
  metaTitle: z.string().max(200),
  metaDesc: z.string().max(500),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(id: number | null, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const cleaned = data.attributes
    .map((a) => ({ label: a.label.trim(), value: a.value.trim() }))
    .filter((a) => a.label && a.value);
  const attributes = attributesSchema.safeParse(cleaned);
  if (!attributes.success) return { ok: false, error: "Chi tiết sản phẩm không hợp lệ (nhãn ≤ 100, giá trị ≤ 500 ký tự)" };

  if (!(await db.category.findUnique({ where: { id: data.categoryId } }))) {
    return { ok: false, error: "Danh mục không tồn tại" };
  }

  const values = {
    name: data.name,
    slug: data.slug,
    categoryId: data.categoryId,
    price: data.price === null ? null : BigInt(data.price),
    attributes: attributes.data,
    description: sanitizeContent(data.description),
    searchText: buildSearchText(data.name, attributes.data),
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    metaTitle: emptyToNull(data.metaTitle),
    metaDesc: emptyToNull(data.metaDesc),
  };
  const imageRows = data.images.map((img, i) => ({ url: img.url, alt: emptyToNull(img.alt), sortOrder: i }));

  try {
    if (id === null) {
      const created = await db.product.create({ data: { ...values, images: { create: imageRows } } });
      return { ok: true, id: created.id };
    }

    const existing = await db.productImage.findMany({ where: { productId: id } });
    await db.product.update({
      where: { id },
      data: { ...values, images: { deleteMany: {}, create: imageRows } },
    });
    const keep = new Set(data.images.map((img) => img.url));
    await Promise.all(existing.filter((img) => !keep.has(img.url)).map((img) => deleteImageFile(img.url)));
    return { ok: true, id };
  } catch (e) {
    if (isUniqueError(e)) return { ok: false, error: "Slug đã tồn tại, vui lòng chọn slug khác" };
    throw e;
  }
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  await requireAdmin();

  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } });
  await Promise.all(images.map((img) => deleteImageFile(img.url)));
  return { ok: true };
}
