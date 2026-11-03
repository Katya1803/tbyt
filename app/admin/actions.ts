"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { checkAdminCredentials, loginAdmin, logoutAdmin } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success || !checkAdminCredentials(parsed.data.email, parsed.data.password)) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }
  await loginAdmin();
  redirect("/admin");
}

export async function logout() {
  await logoutAdmin();
  redirect("/admin/login");
}
