# SPEC — Website catalog thiết bị y tế

## 1. Phạm vi

**Có làm**
- Trang public: Trang chủ, Danh mục, Chi tiết sản phẩm, Tìm kiếm, Giới thiệu, Chính sách, Liên hệ
- Trang admin: Đăng nhập, Dashboard, Danh mục, Sản phẩm, Trang tĩnh, Liên hệ (lead), Thông tin công ty

**KHÔNG làm**
- Blog / tin tức, giỏ hàng, thanh toán, tài khoản khách hàng, đa ngôn ngữ
- Thông báo email/Telegram khi có lead mới (để sau)
- Nhiều tài khoản admin / phân quyền / đổi mật khẩu trong admin (tài khoản nằm trong `.env`)

---

## 2. Trang public

### Layout chung
- **Header:** logo + tên công ty (từ SiteSetting), menu: Trang chủ, Sản phẩm (dropdown danh mục 2 cấp), Giới thiệu, Liên hệ. Ô tìm kiếm. SĐT hotline.
- **Footer:** tên công ty, địa chỉ, SĐT, email, giờ làm việc, link Facebook/Zalo; danh sách link các trang chính sách; `footerNote`.
- **Nút nổi góc phải dưới:** "Gọi ngay" (`tel:`) và "Zalo" (`https://zalo.me/<số>`). Luôn hiện trên mobile; trên desktop hiện nút Zalo. Chỉ hiện nút nào có dữ liệu trong SiteSetting.
- Responsive, mobile-first. Giao diện sạch, nền trắng, màu chủ đạo xanh y tế.

### Trang chủ `/`
- Khối giới thiệu ngắn: tên công ty + 1–2 câu (dùng `defaultMetaDesc`) + nút "Xem sản phẩm", "Liên hệ".
- Lưới danh mục cấp 1 (ảnh đại diện = ảnh sản phẩm đầu tiên của danh mục, hoặc icon mặc định).
- "Sản phẩm nổi bật": tối đa 8 sản phẩm `isFeatured = true`.
- Với mỗi danh mục cấp 1 (theo `sortOrder`): tối đa 8 sản phẩm mới nhất + link "Xem tất cả".
- Chỉ hiện sản phẩm `isActive = true`.

### Danh mục `/danh-muc/[slug]`
- Breadcrumb: Trang chủ › Danh mục cha › Danh mục hiện tại.
- Tên danh mục, mô tả (nếu có).
- Nếu là danh mục cha: hiện các danh mục con dạng chip/link; danh sách sản phẩm gồm sản phẩm của nó **và** của danh mục con.
- Phân trang 24 sản phẩm/trang qua `?page=`. Sắp xếp: mới nhất.
- Thẻ sản phẩm: ảnh chính (khung vuông, nền trắng, `object-contain`), tên, giá hoặc "Liên hệ".
- Slug không tồn tại → 404.

### Chi tiết sản phẩm `/san-pham/[slug]`
- Breadcrumb.
- Desktop: 2 cột. **Trái:** gallery. **Phải:** tên (H1), danh sách chi tiết, giá, các nút. Mobile: xếp dọc.
- **Gallery ảnh:** ảnh chính hiển thị lớn (khung vuông, nền trắng, `object-contain`) + hàng thumbnail ảnh phụ bên dưới, bấm để đổi ảnh; trên mobile vuốt ngang được.
- **Chi tiết sản phẩm** (từ `attributes`): mỗi dòng dạng **Nhãn:** giá trị (nhãn in đậm). Ẩn nếu rỗng.
- Giá, hoặc "Liên hệ".
- Nút "Gọi ngay", "Chat Zalo", "Yêu cầu báo giá" (cuộn tới form bên dưới).
- **Mô tả** (HTML đã sanitize) ở dưới, full width, style bằng Tailwind Typography (`prose`).
- Phần hiển thị trên nằm trong component `ProductView` (dùng chung với tab Xem trước của admin).
- **Form yêu cầu báo giá** (giống form liên hệ, tự gắn `productId`).
- "Sản phẩm liên quan": tối đa 8 sản phẩm cùng danh mục.
- `isActive = false` hoặc không tồn tại → 404.

### Tìm kiếm `/tim-kiem?q=`
- Tìm theo `searchText` (không dấu). Phân trang 24/trang.
- Không có kết quả → thông báo + gợi ý xem danh mục.
- Trang này đặt `noindex`.

### Giới thiệu `/gioi-thieu`
- Hiện Page có slug `gioi-thieu`.

### Chính sách `/chinh-sach/[slug]`
- Hiện Page tương ứng (mọi Page trừ `gioi-thieu`). Không tồn tại → 404.

### Liên hệ `/lien-he`
- Thông tin công ty, nút mở Google Maps (`googleMapsUrl`).
- Form liên hệ.

### Form liên hệ / báo giá (dùng chung 1 component)
| Trường | Bắt buộc | Validation |
|---|---|---|
| Họ tên | Có | 2–100 ký tự |
| Số điện thoại | Có | số VN: 10 chữ số, bắt đầu bằng 0 (cho phép khoảng trắng, dấu chấm, tự loại bỏ) |
| Tên cơ sở / phòng khám | Không | ≤ 200 ký tự |
| Nội dung | Không | ≤ 2000 ký tự |
| Sản phẩm quan tâm | Ẩn | `productId`, tự gắn khi gửi từ trang sản phẩm |

- Chống spam: 1 trường honeypot ẩn; nếu bị điền → giả vờ thành công, không lưu.
- Gửi bằng Server Action. Thành công → hiện "Cảm ơn, chúng tôi sẽ liên hệ lại sớm" và reset form.

---

## 3. Trang admin (`/admin`)

UI dùng shadcn/ui: sidebar trái, bảng dữ liệu, form. Mọi thao tác xóa phải có dialog xác nhận. Lưu thành công/thất bại → toast.

### Đăng nhập `/admin/login`
- Email + mật khẩu, so với `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`. Sai → "Email hoặc mật khẩu không đúng". Đăng xuất ở sidebar.

### Dashboard
- Số sản phẩm (đang hiện / tổng), số danh mục, số liên hệ chưa đọc (link tới trang Liên hệ).
- 5 liên hệ mới nhất.

### Danh mục
- Bảng dạng cây (cha → con), cột: tên, slug, số sản phẩm, thứ tự.
- Thêm/sửa: tên, slug (tự sinh, sửa được), danh mục cha (chỉ chọn được danh mục cấp 1 → tối đa 2 cấp), mô tả, thứ tự, meta title, meta description.
- Xóa: chặn nếu còn sản phẩm hoặc danh mục con (báo lỗi rõ ràng).
- Slug trùng → báo lỗi.

### Sản phẩm
- Bảng: ảnh chính, tên, danh mục, giá, trạng thái hiện/ẩn, nổi bật. Tìm theo tên, lọc theo danh mục, phân trang 20/trang.
- Trang thêm/sửa có 2 tab: **Chỉnh sửa** | **Xem trước**.
- Tab **Chỉnh sửa**:
  - **Thông tin chung:** tên*, slug (tự sinh, sửa được), danh mục*, giá (để trống = "Liên hệ"; input hiển thị dấu chấm phân cách nghìn), hiện/ẩn, nổi bật.
  - **Ảnh:** upload nhiều ảnh (jpg/png/webp, ≤ 10MB/ảnh), xem thumbnail, kéo-thả sắp xếp, xóa từng ảnh, sửa alt (mặc định = tên sản phẩm). Ảnh đứng đầu là **ảnh chính** (có badge "Ảnh chính"; hiện ở trang chủ, danh mục, OG image); mỗi ảnh phụ có nút "Đặt làm ảnh chính" (đưa lên đầu).
  - **Chi tiết sản phẩm:** danh sách dòng `Nhãn | Giá trị`, không giới hạn số dòng. Nút **+ Thêm chi tiết**, nút xóa từng dòng, kéo-thả sắp xếp.
    - Ô nhãn có gợi ý (`<datalist>`): Model, Hãng sản xuất, Xuất xứ, Bảo hành, Tình trạng + các nhãn đã dùng ở sản phẩm khác.
    - Sản phẩm mới có sẵn 3 dòng: Model, Hãng sản xuất, Xuất xứ (giá trị trống).
    - Khi lưu: trim, bỏ dòng thiếu nhãn hoặc thiếu giá trị.
  - **Mô tả:** Tiptap editor — bold, italic, heading (chỉ H2, H3), bullet/numbered list, link, chèn ảnh (upload như trên), bảng đơn giản, undo/redo. Dán từ Word/web giữ định dạng cơ bản. Vùng soạn thảo dùng cùng class `prose` với trang public. Sản phẩm mới có sẵn khung: `H2 Đặc điểm`, `H2 Thông số kỹ thuật`, `H2 Cấu hình và phụ kiện`.
  - **SEO:** meta title, meta description (để trống → tự sinh, xem mục 5). Hiện đếm ký tự.
- Tab **Xem trước:** render component `ProductView` với dữ liệu form hiện tại (kể cả khi chưa lưu), đúng như trang khách xem. Có nút chuyển khung desktop / mobile (đổi độ rộng khung bao).
- Nút "Lưu" luôn hiển thị (sticky). Rời trang khi có thay đổi chưa lưu → cảnh báo.
- Nút "Xem trên web" (sản phẩm đã lưu) mở trang sản phẩm ở tab mới.
- Xóa sản phẩm → xóa luôn record ảnh và file ảnh.

### Trang tĩnh
- Danh sách Page. Sửa: tiêu đề, slug, nội dung (Tiptap), meta title/description.
- Thêm/xóa trang chính sách được. Trang `gioi-thieu` **không** được xóa hoặc đổi slug.

### Liên hệ (lead)
- Bảng: thời gian, họ tên, SĐT, tên cơ sở, sản phẩm (link), trạng thái đã đọc. Mới nhất lên đầu. Lọc: tất cả / chưa đọc. Phân trang 20/trang.
- Bấm vào → xem chi tiết, tự đánh dấu đã đọc. SĐT là link `tel:`. Có nút đánh dấu chưa đọc và xóa.

### Thông tin công ty
- Form sửa toàn bộ trường của `SiteSetting`: tên công ty, logo (upload), hotline, số Zalo, email, địa chỉ, link Google Maps, link Facebook, giờ làm việc, ghi chú footer, meta title mặc định, meta description mặc định.

---

## 4. Upload ảnh (`lib/upload.ts`)
- Nhận file → kiểm tra loại (jpg/png/webp) và dung lượng (≤ 10MB).
- sharp: tự xoay theo EXIF, resize về chiều rộng tối đa 1200px (không phóng to), convert WebP chất lượng ~80.
- Lưu `UPLOAD_DIR/<yyyy>/<mm>/<uuid>.webp`, trả về URL `/uploads/<yyyy>/<mm>/<uuid>.webp`.
- Khi xóa ảnh khỏi sản phẩm → xóa file. Không cần dọn ảnh mồ côi trong mô tả.

---

## 5. Checklist SEO
- [ ] Mọi trang public có `generateMetadata`: title, description, canonical (`SITE_URL` + path), Open Graph (ảnh = ảnh chính của sản phẩm hoặc logo).
- [ ] Title mặc định:
  - Sản phẩm: `{name} - {companyName}` (nếu không có metaTitle)
  - Danh mục: `{name} chính hãng, giá tốt - {companyName}`
  - Description sản phẩm: 155 ký tự đầu của mô tả (bỏ HTML); nếu mô tả rỗng → ghép tên + các chi tiết (`Nhãn: giá trị`).
- [ ] Mỗi trang đúng 1 thẻ `<h1>`. Heading đúng thứ bậc.
- [ ] `<html lang="vi">`.
- [ ] JSON-LD:
  - `Organization` (hoặc `LocalBusiness`) ở layout: tên, logo, SĐT, địa chỉ, url
  - `Product` ở trang sản phẩm: name, image (tất cả ảnh, ảnh chính đầu tiên), description; có `offers` (price, priceCurrency VND, availability InStock) **chỉ khi có giá**
  - `BreadcrumbList` ở trang danh mục và sản phẩm
- [ ] `app/sitemap.ts`: trang chủ, giới thiệu, liên hệ, chính sách, mọi danh mục, mọi sản phẩm `isActive` (có `lastModified`).
- [ ] `app/robots.ts`: allow `/`, disallow `/admin` và `/tim-kiem`, khai báo sitemap.
- [ ] Trang phân trang (`?page=2`): canonical trỏ về chính nó.
- [ ] Ảnh có `alt`, kích thước width/height để tránh layout shift, lazy load (trừ ảnh đầu tiên trên trang).
- [ ] URL tiếng Việt không dấu, chỉ chữ thường và `-`.
- [ ] Trang 404 thân thiện, có link về trang chủ và danh mục.
- [ ] Lighthouse mobile: Performance và SEO ≥ 90.
