# PROGRESS

## Phase 1: Khởi tạo — XONG
- Next.js 16 (App Router, TS strict), Tailwind 4 + typography, shadcn/ui, Prisma 6 schema + migration `init`, seed, `docker-compose.dev.yml`.
- Lib cơ bản: `db`, `slug`, `search`, `format`, `sanitize`.
- `npm run lint` + `npm run build` sạch.

## Phase 2: Admin auth — XONG
- `lib/session.ts` (iron-session, `timingSafeEqual` qua hash sha256), `/admin/login`, đăng xuất, `app/admin/(protected)/layout.tsx` kiểm tra session, sidebar.
- Đã test bằng curl: sai mật khẩu → báo lỗi; đúng → cookie + vào được `/admin`; chưa đăng nhập → 307 `/admin/login`.
