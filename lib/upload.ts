import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

export const UPLOAD_URL_PATTERN = /^\/uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.webp$/;

export function uploadRoot(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
}

export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_SIZE) throw new Error("Ảnh vượt quá 10MB");

  const input = Buffer.from(await file.arrayBuffer());
  let format: string | undefined;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    throw new Error("File không phải ảnh hợp lệ");
  }
  if (!format || !ALLOWED_FORMATS.includes(format)) throw new Error("Chỉ chấp nhận ảnh jpg, png, webp");

  const output = await sharp(input)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}.webp`;
  const dir = path.join(/*turbopackIgnore: true*/ uploadRoot(), yyyy, mm);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), output);

  return `/uploads/${yyyy}/${mm}/${filename}`;
}

export async function deleteImageFile(url: string): Promise<void> {
  if (!UPLOAD_URL_PATTERN.test(url)) return;
  const relative = url.replace(/^\/uploads\//, "");
  await unlink(path.join(/*turbopackIgnore: true*/ uploadRoot(), relative)).catch(() => {});
}
