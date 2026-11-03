import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadRoot } from "@/lib/upload";

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await ctx.params;
  const root = uploadRoot();
  const filePath = path.resolve(/*turbopackIgnore: true*/ root, ...segments);

  if (!filePath.startsWith(root + path.sep) || !filePath.endsWith(".webp")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
