import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { createHash, timingSafeEqual } from "node:crypto";

type SessionData = { isAdmin?: boolean };

async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET as string,
    cookieName: "admin_session",
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    ttl: 60 * 60 * 24 * 7,
  });
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdminCredentials(email: string, password: string): boolean {
  const okEmail = safeEqual(email.trim().toLowerCase(), (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase());
  const okPassword = safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
  return okEmail && okPassword;
}

export async function loginAdmin() {
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
}

export async function logoutAdmin() {
  const session = await getSession();
  session.destroy();
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession()).isAdmin === true;
}

// Call at the top of every admin page layout and Server Action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
