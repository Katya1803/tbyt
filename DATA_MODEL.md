# DATA MODEL

## Prisma schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id          Int        @id @default(autoincrement())
  name        String
  slug        String     @unique
  description String?
  image       String? // shown on the home page category grid
  parentId    Int?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  sortOrder   Int        @default(0)
  metaTitle   String?
  metaDesc    String?
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([parentId])
}

model Product {
  id              Int              @id @default(autoincrement())
  name            String
  slug            String           @unique
  categoryId      Int
  category        Category         @relation(fields: [categoryId], references: [id])
  price           BigInt?          // VND; null = "Liên hệ"
  attributes      Json             @default("[]") // ordered [{ "label": string, "value": string }], e.g. Model, Hãng sản xuất, Xuất xứ
  description     String           @default("")   // sanitized HTML
  searchText      String           @default("")   // name + all attribute values, no diacritics, lowercase
  isActive        Boolean          @default(true)
  isFeatured      Boolean          @default(false)
  metaTitle       String?
  metaDesc        String?
  images          ProductImage[]
  contactRequests ContactRequest[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([categoryId])
  @@index([isActive, createdAt])
}

model ProductImage {
  id        Int     @id @default(autoincrement())
  productId Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0) // smallest = ảnh chính (main image), the rest = ảnh phụ

  @@index([productId, sortOrder])
}

model Page {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  title     String
  content   String   @default("") // sanitized HTML
  metaTitle String?
  metaDesc  String?
  updatedAt DateTime @updatedAt
}

model ContactRequest {
  id           Int      @id @default(autoincrement())
  name         String
  phone        String
  organization String?
  message      String?
  productId    Int?
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  isRead       Boolean  @default(false)
  consentAt    DateTime? // when the visitor agreed to personal data processing
  createdAt    DateTime @default(now())

  @@index([isRead, createdAt])
}

// Single row, id = 1. Edited in admin → "Thông tin công ty".
model SiteSetting {
  id              Int      @id @default(1)
  companyName     String
  logoUrl         String?
  phone           String?
  zalo            String?
  email           String?
  address         String?
  googleMapsUrl   String?
  facebookUrl     String?
  workingHours    String?
  footerNote      String?
  defaultMetaTitle String?
  defaultMetaDesc  String?
  updatedAt       DateTime @updatedAt
}
```

Tài khoản admin **không** lưu trong DB — lấy từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`.

## Ghi chú
- `attributes` validate bằng zod: `z.array(z.object({ label: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(500) }))`. Thứ tự trong mảng = thứ tự hiển thị.
- Gợi ý nhãn trong admin: danh sách mặc định + `SELECT DISTINCT jsonb_array_elements(attributes)->>'label' FROM "Product"`.
- Ảnh chính = `ProductImage` có `sortOrder` nhỏ nhất. Khi lưu thứ tự ảnh, ghi lại `sortOrder` = 0, 1, 2… theo thứ tự trong form.
- `price` là `BigInt` vì thiết bị y tế có thể vượt 2,1 tỷ (giới hạn của Int). Chuyển sang `Number` khi render/serialize.
- `description` và `Page.content`: luôn chạy qua `sanitize-html` (whitelist thẻ Tiptap sinh ra: p, h2, h3, strong, em, ul, ol, li, a, img, table, thead, tbody, tr, th, td, br) trước khi lưu.
- `searchText` được tính lại trong Server Action mỗi lần tạo/sửa sản phẩm.
- Danh mục tối đa 2 cấp: khi lưu, kiểm tra danh mục cha phải có `parentId = null`, và danh mục đang có con thì không được gán cha.

## Seed (`prisma/seed.ts`)
Chỉ tạo khi chưa có dữ liệu (chạy lại nhiều lần không bị trùng):
1. `SiteSetting` id = 1, `companyName = "Tên công ty"`, các trường khác để trống.
2. `Page`: `gioi-thieu` (Giới thiệu), `chinh-sach-bao-hanh`, `chinh-sach-doi-tra`, `chinh-sach-van-chuyen`, `chinh-sach-bao-mat` — nội dung placeholder.
3. (Chỉ môi trường dev) 3 danh mục + 6 sản phẩm mẫu để test giao diện.
