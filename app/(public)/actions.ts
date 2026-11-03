"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { emptyToNull } from "@/lib/utils-server";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Họ tên cần từ 2 đến 100 ký tự").max(100, "Họ tên cần từ 2 đến 100 ký tự"),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s.]/g, ""))
    .pipe(z.string().regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0")),
  organization: z.string().trim().max(200, "Tên cơ sở tối đa 200 ký tự"),
  message: z.string().trim().max(2000, "Nội dung tối đa 2000 ký tự"),
  productId: z.coerce.number().int().positive().nullable().catch(null),
});

export type ContactState = {
  ok?: boolean;
  error?: string;
  values?: { name: string; phone: string; organization: string; message: string };
};

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: bots fill hidden fields. Pretend success and store nothing.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    organization: String(formData.get("organization") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const productIdRaw = formData.get("productId");
  const parsed = contactSchema.safeParse({
    ...values,
    productId: productIdRaw ? productIdRaw : null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const data = parsed.data;

  const product = data.productId ? await db.product.findUnique({ where: { id: data.productId }, select: { id: true } }) : null;

  await db.contactRequest.create({
    data: {
      name: data.name,
      phone: data.phone,
      organization: emptyToNull(data.organization),
      message: emptyToNull(data.message),
      productId: product?.id ?? null,
    },
  });
  return { ok: true };
}
