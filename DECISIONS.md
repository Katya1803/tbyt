# DECISIONS

Các điểm spec chưa rõ hoặc phải chọn khi xây dựng. Mỗi mục: vấn đề → lựa chọn → lý do.

1. **Next.js 16 + cacheComponents** — `create-next-app` bật sẵn `cacheComponents` và `partialPrefetching`. Đã tắt vì CLAUDE.md chốt render động bằng `force-dynamic`. Lý do: đơn giản, đúng quyết định kỹ thuật đã chốt.
2. **Prisma 6 (không dùng 7)** — DATA_MODEL.md dùng `provider = "prisma-client-js"` và `url = env(...)` trong schema; Prisma 7 bỏ cách này. Lý do: giữ đúng schema trong tài liệu.
3. **shadcn/ui bản base-nova (Base UI)** — `shadcn init -d` mặc định dùng Base UI thay Radix. Giữ nguyên. Lý do: là mặc định hiện tại của shadcn.
4. **Font Inter (subset latin + vietnamese)** — Geist mặc định không hỗ trợ đủ dấu tiếng Việt.
5. **Kéo-thả sắp xếp** — dùng HTML5 drag-and-drop gốc, không thêm thư viện (CLAUDE.md: không thêm thư viện nếu vài dòng đủ). Chỉ dùng trên desktop (admin).
