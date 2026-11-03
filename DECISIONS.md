# DECISIONS

Các điểm spec chưa rõ hoặc phải chọn khi xây dựng. Mỗi mục: vấn đề → lựa chọn → lý do.

1. **Next.js 16 + cacheComponents** — `create-next-app` bật sẵn `cacheComponents` và `partialPrefetching`. Đã tắt vì CLAUDE.md chốt render động bằng `force-dynamic`. Lý do: đơn giản, đúng quyết định kỹ thuật đã chốt.
2. **Prisma 6 (không dùng 7)** — DATA_MODEL.md dùng `provider = "prisma-client-js"` và `url = env(...)` trong schema; Prisma 7 bỏ cách này. Lý do: giữ đúng schema trong tài liệu.
3. **shadcn/ui bản base-nova (Base UI)** — `shadcn init -d` mặc định dùng Base UI thay Radix. Giữ nguyên. Lý do: là mặc định hiện tại của shadcn.
4. **Font Inter (subset latin + vietnamese)** — Geist mặc định không hỗ trợ đủ dấu tiếng Việt.
5. **Kéo-thả sắp xếp** — dùng HTML5 drag-and-drop gốc, không thêm thư viện (CLAUDE.md: không thêm thư viện nếu vài dòng đủ). Chỉ dùng trên desktop (admin).
6. **lib/utils.ts (cn)** — shadcn CLI sinh `export { cn } from "cn"` (kéo gói npm `cn` lạ). Đã thay bằng chuẩn `clsx` + `tailwind-merge`.
7. **Upload ảnh từ client** — dùng route handler `POST /admin/upload` (kiểm tra session) thay vì Server Action, vì Server Action giới hạn body 1MB mặc định mà ảnh tới 10MB.
8. **Xóa dòng trong form (ảnh, chi tiết sản phẩm)** — chỉ bỏ khỏi form, chưa ghi DB cho đến khi bấm Lưu nên không hiện dialog xác nhận. Xóa bản ghi thật (danh mục, sản phẩm, trang, liên hệ) đều có dialog.
9. **Cảnh báo rời trang chưa lưu** — dùng `beforeunload` (đóng tab / reload / đổi URL). Không chặn điều hướng nội bộ qua link Next.js để giữ code đơn giản.
10. **Ảnh upload nhưng chưa lưu sản phẩm** — file mồ côi, không dọn tự động (spec chỉ yêu cầu xóa file khi ảnh bị gỡ khỏi sản phẩm đã lưu).
11. **Khung xem trước desktop/mobile** — `ProductView` dùng container query (`@2xl:`) thay vì breakpoint theo viewport, để khung mobile trong tab Xem trước hiển thị đúng bố cục mobile.
12. **Select trong form admin** — dùng `<select>` native (`NativeSelect`) thay vì Select của shadcn (Base UI) cho đơn giản và dễ đưa vào form.
13. **Ảnh đại diện danh mục ở trang chủ** — lấy ảnh chính của sản phẩm mới nhất (có ảnh) trong danh mục (kể cả danh mục con); không có thì hiện icon ống nghe mặc định.
14. **Form liên hệ giữ dữ liệu khi lỗi** — React 19 tự reset form sau action, nên Server Action trả lại `values` để gán `defaultValue`; thành công thì form được reset trống.
15. **Menu mobile** — dùng thẻ `<details>` thuần HTML (không JS), menu desktop dùng dropdown CSS hover/focus.
16. **Docker: Prisma CLI** — image runtime (standalone) không có Prisma CLI, nên cài `prisma` vào thư mục riêng `/prisma-cli` (chỉ dùng cho `migrate deploy` lúc khởi động). Seed được biên dịch sang `prisma/seed.js` bằng esbuild khi build image, thay cho `npx prisma db seed` (cần tsx). Hành vi giống spec: seed idempotent, môi trường production không tạo dữ liệu mẫu.
17. **Docker: base image** — `node:22-alpine` (sharp chạy tốt trên alpine, đã test upload ảnh). User non-root uid 1001; trên Linux cần `chown 1001:1001 data/uploads` (đã ghi vào DEPLOY.md).
18. **`.gitattributes`** — ép `*.sh` dùng LF để `scripts/backup.sh` chạy được khi commit từ Windows.
19. **Mô tả meta dự phòng** — nếu trang không có mô tả và `defaultMetaDesc` trống, dùng tên công ty làm description để không thiếu thẻ `meta description` (Lighthouse SEO).
20. **Ảnh eager/lazy** — chỉ vài thẻ đầu tiên (above the fold) tải eager; còn lại lazy, đúng checklist SEO "lazy load trừ ảnh đầu tiên".
21. **Ảnh trang chủ** — thêm 3 cột `bannerWide`, `bannerLeft`, `bannerRight` vào `SiteSetting` (migration `site_banners`), chọn trong admin → Thông tin công ty. Trang chủ vẫn giữ 1 thẻ `<h1>` (tên công ty, ẩn bằng `sr-only`) cho SEO.
22. **Header/footer dùng file tĩnh** `public/cnmed-icon.svg`, `public/cnmed-logo.svg` theo yêu cầu của chủ dự án; nút nổi dùng `public/zalo-1.svg` và icon điện thoại (hiện ở cả desktop và mobile).
23. **Danh mục ở trang chủ** — thay lưới danh mục có ảnh bằng sidebar trái dạng chữ (2 cấp), chỉ hiện từ màn hình lớn (lg); mobile dùng menu ở header.
24. **Địa chỉ** — dùng lại trường `address` có sẵn, nhập mỗi dòng một địa chỉ (nhiều chi nhánh), footer hiển thị từng dòng kèm icon định vị; không thêm bảng/cột mới. Bỏ ô Logo khỏi admin (header/footer dùng file tĩnh; cột `logoUrl` vẫn còn trong DB nhưng không dùng).
25. **Favicon + dev indicator** — thay `favicon.ico` mặc định của Next bằng `app/icon.svg` (icon CNMed); tắt `devIndicators` (nút "N" của Next.js chỉ hiện khi chạy dev, không có trên bản production). Icon Facebook vẽ bằng SVG inline vì lucide-react không còn icon thương hiệu.
