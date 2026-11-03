"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import type { ActionResult } from "@/lib/utils-server";

export async function markContactUnread(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.contactRequest.update({ where: { id }, data: { isRead: false } });
  return { ok: true };
}

export async function deleteContact(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.contactRequest.deleteMany({ where: { id } });
  return { ok: true };
}
