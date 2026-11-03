import { Prisma } from "@prisma/client";

export const ABOUT_SLUG = "gioi-thieu";

export type ActionResult = { ok: true; id?: number } | { ok: false; error: string };

export function isUniqueError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function emptyToNull(value: string | undefined | null): string | null {
  const v = value?.trim();
  return v ? v : null;
}
