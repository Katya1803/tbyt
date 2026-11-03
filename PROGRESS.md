# PROGRESS

## Phase 1: Khởi tạo — XONG
- Next.js 16 (App Router, TS strict), Tailwind 4 + typography, shadcn/ui, Prisma 6 schema + migration `init`, seed, `docker-compose.dev.yml`.
- Lib cơ bản: `db`, `slug`, `search`, `format`, `sanitize`.
- `npm run lint` + `npm run build` sạch.

## Phase 2: Admin auth — XONG
- `lib/session.ts` (iron-session, `timingSafeEqual` qua hash sha256), `/admin/login`, đăng xuất, `app/admin/(protected)/layout.tsx` kiểm tra session, sidebar.
- Đã test bằng curl: sai mật khẩu → báo lỗi; đúng → cookie + vào được `/admin`; chưa đăng nhập → 307 `/admin/login`.

## Phase 3: Admin CRUD — XONG
- Danh mục (cây 2 cấp, chặn xóa), Sản phẩm (ảnh nhiều + kéo thả + ảnh chính, chi tiết key-value, Tiptap, SEO, tab Xem trước desktop/mobile, nút Lưu sticky, cảnh báo chưa lưu), Trang tĩnh (khóa slug/xóa `gioi-thieu`), Thông tin công ty (logo), Liên hệ (lọc, đã đọc, xóa), Dashboard.
- Upload ảnh: `lib/upload.ts` (sharp → WebP ≤1200px), `/admin/upload`, `/uploads/[...path]`.
- Đã test bằng Playwright (login → tạo danh mục → tạo sản phẩm có 2 ảnh → xem trước → lưu → reload): không lỗi console.
