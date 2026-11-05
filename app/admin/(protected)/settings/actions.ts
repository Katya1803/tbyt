"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteImageFile, UPLOAD_URL_PATTERN } from "@/lib/upload";
import { emptyToNull, type ActionResult } from "@/lib/utils-server";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Đường dẫn phải bắt đầu bằng http:// hoặc https://");

const settingsSchema = z.object({
  companyName: z.string().trim().min(1, "Vui lòng nhập tên công ty").max(200),
  bannerWide: z.string().regex(UPLOAD_URL_PATTERN).nullable(),
  bannerLeft: z.string().regex(UPLOAD_URL_PATTERN).nullable(),
  bannerRight: z.string().regex(UPLOAD_URL_PATTERN).nullable(),
  footerImage: z.string().regex(UPLOAD_URL_PATTERN).nullable(),
  slogan: z.string().trim().max(120, "Khẩu hiệu tối đa 120 ký tự"),
  showSlogan: z.boolean(),
  phone: z.string().trim().max(30),
  zalo: z.string().trim().max(30),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Email không hợp lệ"),
  address: z.string().trim().max(500),
  googleMapsUrl: optionalUrl,
  facebookUrl: optionalUrl,
  workingHours: z.string().trim().max(500),
  footerNote: z.string().trim().max(1000),
  defaultMetaTitle: z.string().trim().max(200),
  defaultMetaDesc: z.string().trim().max(500),
});

export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const values = {
    companyName: d.companyName,
    bannerWide: d.bannerWide,
    bannerLeft: d.bannerLeft,
    bannerRight: d.bannerRight,
    footerImage: d.footerImage,
    slogan: emptyToNull(d.slogan),
    showSlogan: d.showSlogan,
    phone: emptyToNull(d.phone),
    zalo: emptyToNull(d.zalo),
    email: emptyToNull(d.email),
    address: emptyToNull(d.address),
    googleMapsUrl: emptyToNull(d.googleMapsUrl),
    facebookUrl: emptyToNull(d.facebookUrl),
    workingHours: emptyToNull(d.workingHours),
    footerNote: emptyToNull(d.footerNote),
    defaultMetaTitle: emptyToNull(d.defaultMetaTitle),
    defaultMetaDesc: emptyToNull(d.defaultMetaDesc),
  };

  const previous = await db.siteSetting.findUnique({ where: { id: 1 } });
  await db.siteSetting.upsert({ where: { id: 1 }, update: values, create: { id: 1, ...values } });
  const replaced = [
    [previous?.bannerWide, d.bannerWide],
    [previous?.bannerLeft, d.bannerLeft],
    [previous?.bannerRight, d.bannerRight],
    [previous?.footerImage, d.footerImage],
  ];
  for (const [oldUrl, newUrl] of replaced) {
    if (oldUrl && oldUrl !== newUrl) await deleteImageFile(oldUrl);
  }

  return { ok: true };
}
