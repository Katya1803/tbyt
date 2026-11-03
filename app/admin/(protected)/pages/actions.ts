"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize";
import { requireAdmin } from "@/lib/session";
import { ABOUT_SLUG, emptyToNull, isUniqueError, type ActionResult } from "@/lib/utils-server";

const pageSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập slug")
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu -"),
  content: z.string().max(500000),
  metaTitle: z.string().max(200),
  metaDesc: z.string().max(500),
});

export type PageInput = z.input<typeof pageSchema>;

export async function savePage(id: number | null, input: PageInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (id !== null) {
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Trang không tồn tại" };
    if (existing.slug === ABOUT_SLUG && data.slug !== ABOUT_SLUG) {
      return { ok: false, error: "Không được đổi slug của trang Giới thiệu" };
    }
  }

  const values = {
    title: data.title,
    slug: data.slug,
    content: sanitizeContent(data.content),
    metaTitle: emptyToNull(data.metaTitle),
    metaDesc: emptyToNull(data.metaDesc),
  };

  try {
    const saved =
      id === null ? await db.page.create({ data: values }) : await db.page.update({ where: { id }, data: values });
    return { ok: true, id: saved.id };
  } catch (e) {
    if (isUniqueError(e)) return { ok: false, error: "Slug đã tồn tại, vui lòng chọn slug khác" };
    throw e;
  }
}

export async function deletePage(id: number): Promise<ActionResult> {
  await requireAdmin();

  const page = await db.page.findUnique({ where: { id } });
  if (!page) return { ok: true };
  if (page.slug === ABOUT_SLUG) return { ok: false, error: "Không được xóa trang Giới thiệu" };

  await db.page.delete({ where: { id } });
  return { ok: true };
}
