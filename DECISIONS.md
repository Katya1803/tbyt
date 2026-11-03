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
