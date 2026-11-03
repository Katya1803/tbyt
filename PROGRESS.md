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

## Phase 4: Trang public — XONG
- Layout (header + dropdown danh mục, footer, nút nổi Gọi/Zalo), trang chủ, danh mục (phân trang 24), chi tiết sản phẩm (`ProductView` + form báo giá + liên quan), tìm kiếm không dấu, giới thiệu, chính sách, liên hệ, 404.
- Test Playwright: các trang trả đúng status, mỗi trang đúng 1 `<h1>`, tìm "may tho" ra "Máy thở", form lỗi giữ dữ liệu, form thành công lưu `ContactRequest` (có `productId` khi gửi từ trang sản phẩm).
- Cảnh báo hydration trong console chỉ do Playwright chèn `caret-color` vào input, không phải lỗi code.

## Phase 5: SEO — XONG
- `generateMetadata` mọi trang public (title/description/canonical/OG; canonical của `?page=N` trỏ về chính nó; `/tim-kiem` noindex), JSON-LD `Organization` (layout), `Product` (chỉ có `offers` khi có giá) + `BreadcrumbList`, `sitemap.xml`, `robots.txt`, `<html lang="vi">`, 404 thân thiện.
- Đã kiểm bằng curl trên dev server. Chưa chạy Lighthouse thật (xem phần cuối).

## Phase 6: Deploy — XONG
- `Dockerfile` (multi-stage, node:22-alpine, standalone, user non-root, build không cần DB), `docker-compose.yml` (web + db + tunnel), `docker-compose.dev.yml` (chỉ db), `.dockerignore`, `scripts/backup.sh`, `.gitattributes`.
- Đã build image và chạy thật (web + db): migrate + seed tự chạy, đăng nhập admin, tạo danh mục/sản phẩm, upload ảnh (sharp trên alpine), xem trước, lưu — không lỗi.
- Lighthouse mobile (bản Docker, localhost): Trang chủ Perf 95 / SEO 100; Sản phẩm 92 / 100; Liên hệ 96 / 100.
- Chưa thử: service `tunnel` (cloudflared) vì cần token Cloudflare thật; `scripts/backup.sh` chưa chạy thật (cần môi trường bash + compose `db` đang chạy).

## Lỗi / việc chưa làm
- Không có lỗi nào còn tồn đọng khi lint/build.
- Chưa test thủ công: kéo-thả sắp xếp ảnh/chi tiết trong trình duyệt (code dùng HTML5 drag-drop, chưa tự động hóa test), chèn ảnh/bảng trong Tiptap, thao tác xóa qua dialog (code đã viết, chưa chạy kịch bản).
- Chưa có rate limit cho đăng nhập admin / form liên hệ (ngoài honeypot) vì SPEC không yêu cầu.
- Tiptap/Next.js là phiên bản mới (Next 16, Tiptap 3, Prisma 6 cố ý) — khi nâng cấp cần kiểm tra lại.

## TÓM TẮT & HƯỚNG DẪN CHẠY THỬ
Đã hoàn thành cả 6 phase theo CLAUDE.md/SPEC.md; mỗi phase có commit riêng ("Phase N: ..."). Các quyết định tự chọn nằm trong `DECISIONS.md`.

Chạy thử trên máy dev:
1. `docker compose -f docker-compose.dev.yml up -d` (Postgres).
2. `.env` đã có sẵn cho dev (mẫu ở `.env.example`). Tài khoản admin dev: `admin@example.com` / `admin-password-123`.
3. `npx prisma migrate deploy && npx prisma db seed` (seed tạo thêm 3 danh mục + 6 sản phẩm mẫu ở môi trường dev).
4. `npm run dev` → web http://localhost:3000, admin http://localhost:3000/admin.
5. Vào admin → "Thông tin công ty" điền tên, hotline, Zalo… (không hardcode trong code).

Chạy production: điền `.env` theo `.env.example` (thêm `DB_PASSWORD`, `CF_TUNNEL_TOKEN`), rồi `docker compose up -d --build` (xem `DEPLOY.md`).
