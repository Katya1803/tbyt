# CLAUDE.md — Website catalog thiết bị y tế

## Mục tiêu
Website catalog giới thiệu thiết bị y tế cho khách hàng (phòng khám, spa, bệnh viện).
Mục tiêu chính: **SEO tốt trên Google** + khách xem sản phẩm và liên hệ dễ dàng.
Không bán hàng online. Website sẽ được **bàn giao cho khách không biết code**, nên mọi nội dung
(sản phẩm, danh mục, trang tĩnh, thông tin công ty) phải sửa được trong trang admin.
Riêng tài khoản admin nằm trong `.env` (do dev quản lý).

Tài liệu chi tiết:
- `SPEC.md` — chức năng từng trang (public + admin), checklist SEO
- `DATA_MODEL.md` — Prisma schema
- `DEPLOY.md` — Docker, Cloudflare Tunnel, backup

## Nguyên tắc code (QUAN TRỌNG)
- **Đơn giản, sạch, KHÔNG over-engineering.** Ưu tiên code dễ đọc hơn code "thông minh".
- Một app Next.js duy nhất (monolith). Không tách backend riêng, không microservices.
- Không thêm thư viện nếu vài dòng code tự viết là đủ. Không thêm abstraction (repository layer,
  service layer, DI…) khi chưa cần — gọi Prisma trực tiếp trong Server Components / Server Actions.
- Không làm những gì nằm ngoài SPEC.md. Nếu spec chưa rõ → hỏi lại, không tự đoán rồi làm thêm.
- TypeScript strict. Validate input bằng **zod** ở mọi Server Action.
- Code, tên biến, comment: tiếng Anh. Giao diện (UI text): **tiếng Việt**.

## Tech stack
- Next.js (bản stable mới nhất), App Router, TypeScript
- PostgreSQL + Prisma
- Tailwind CSS + shadcn/ui (dùng cho cả admin và public)
- Tiptap (rich text editor cho mô tả sản phẩm và trang tĩnh)
- sharp (resize + convert ảnh sang WebP khi upload)
- sanitize-html (sanitize HTML từ editor trước khi lưu)
- iron-session (session cookie cho admin)
- zod (validation)

## Quyết định kỹ thuật đã chốt
- **Render:** các trang public là Server Components, render động khi có request
  (`export const dynamic = "force-dynamic"` cho trang đọc DB). Traffic thấp, DB ở cùng máy,
  nên đơn giản và luôn hiển thị dữ liệu mới. `next build` **không được** cần kết nối DB.
- **Ảnh:** lưu file trong thư mục `UPLOAD_DIR` (Docker volume). Phục vụ qua route handler
  `app/uploads/[...path]/route.ts` (đọc file, trả về với header
  `Cache-Control: public, max-age=31536000, immutable`). Tên file là random (uuid) nên cache vĩnh viễn được.
  Dùng `<Image unoptimized />` hoặc `<img>` vì ảnh đã được resize sẵn khi upload.
- **Auth admin:** 1 tài khoản duy nhất, lấy từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`.
  Không lưu trong DB. So sánh bằng `crypto.timingSafeEqual`. Đổi mật khẩu = sửa `.env` rồi
  restart container. Kiểm tra session trong
  `app/admin/(protected)/layout.tsx`, chưa đăng nhập → redirect `/admin/login`. Mọi Server Action
  của admin cũng phải tự kiểm tra session.
- **Thông tin công ty:** bảng `SiteSetting` (1 dòng, id = 1), sửa trong admin. Không hardcode
  tên/SĐT/địa chỉ ở bất kỳ đâu trong code.
- **Slug:** tự sinh từ tên (bỏ dấu tiếng Việt, `đ` → `d`, lowercase, nối bằng `-`), admin sửa được.
  Viết 1 hàm nhỏ trong `lib/slug.ts`, không cần thư viện.
- **Tìm kiếm:** cột `searchText` = (tên + giá trị của mọi chi tiết trong `attributes`) bỏ dấu,
  lowercase, tính lại mỗi khi lưu sản phẩm. Query cũng bỏ dấu rồi tìm bằng `contains`. Gõ "may tho" vẫn ra "Máy thở".
- **Xem trước sản phẩm:** trang chi tiết sản phẩm dùng 1 component thuần hiển thị
  `components/public/ProductView.tsx` (nhận props, không tự query DB). Trang sửa sản phẩm trong
  admin có tab "Xem trước" render đúng component này với dữ liệu form hiện tại → giống 100% trang thật.
- **Giá:** `BigInt?` (VND). `null` → hiển thị "Liên hệ". Format bằng `Intl.NumberFormat("vi-VN")`.

## Cấu trúc thư mục (gợi ý)
```
app/
  (public)/
    layout.tsx              # header, footer, nút Zalo/gọi nổi
    page.tsx                # trang chủ
    danh-muc/[slug]/page.tsx
    san-pham/[slug]/page.tsx
    tim-kiem/page.tsx
    gioi-thieu/page.tsx
    chinh-sach/[slug]/page.tsx
    lien-he/page.tsx
  admin/
    login/page.tsx
    (protected)/
      layout.tsx            # sidebar + check session
      page.tsx              # dashboard
      categories/...
      products/...
      pages/...
      contacts/...
      settings/page.tsx     # thông tin công ty
  uploads/[...path]/route.ts
  sitemap.ts
  robots.ts
components/
  ui/                       # shadcn
  admin/                    # RichTextEditor, ImageUploader, AttributesEditor...
  public/                   # ProductView (dùng chung cho trang public + preview admin), ProductGallery...
lib/
  db.ts  session.ts  slug.ts  search.ts  sanitize.ts  upload.ts  format.ts  jsonld.ts
prisma/
  schema.prisma  seed.ts
```

## Thứ tự làm (phases)
Làm xong + chạy được từng phase rồi mới sang phase sau. Cuối mỗi phase chạy `npm run lint` và `npm run build`.
1. **Khởi tạo:** Next.js, Tailwind, shadcn/ui, Prisma schema, migration, seed, docker-compose chỉ có Postgres để dev.
2. **Admin auth:** login, logout, session, bảo vệ route.
3. **Admin CRUD:** Category → Product (ảnh chính + ảnh phụ, chi tiết key-value, mô tả Tiptap, tab Xem trước) → Page → SiteSetting → Contacts.
4. **Trang public:** layout, trang chủ, danh mục, chi tiết sản phẩm, tìm kiếm, giới thiệu, chính sách, liên hệ.
5. **SEO:** metadata, JSON-LD, sitemap, robots, canonical, kiểm tra theo checklist trong SPEC.md.
6. **Deploy:** Dockerfile, docker-compose đầy đủ (web + db + cloudflared), script backup theo DEPLOY.md.

## Lệnh
```
npm run dev                 # dev server
npx prisma migrate dev      # tạo migration khi đổi schema
npx prisma db seed          # seed dữ liệu ban đầu
npm run lint && npm run build
```

## Biến môi trường (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/medical
SESSION_SECRET=chuoi-ngau-nhien-it-nhat-32-ky-tu
ADMIN_EMAIL=admin@example.com       # tài khoản đăng nhập admin
ADMIN_PASSWORD=mat-khau-manh-it-nhat-12-ky-tu
UPLOAD_DIR=./uploads
SITE_URL=https://tenmien.com        # dùng cho canonical, sitemap, OG
```
