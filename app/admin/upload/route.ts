import { isAdmin } from "@/lib/session";
import { saveImage } from "@/lib/upload";

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file" }, { status: 400 });

  try {
    return Response.json({ url: await saveImage(file) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Không tải được ảnh" }, { status: 400 });
  }
}
