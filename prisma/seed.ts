import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const pages = [
  { slug: "gioi-thieu", title: "Giới thiệu" },
  { slug: "chinh-sach-bao-hanh", title: "Chính sách bảo hành" },
  { slug: "chinh-sach-doi-tra", title: "Chính sách đổi trả" },
  { slug: "chinh-sach-van-chuyen", title: "Chính sách vận chuyển" },
  { slug: "chinh-sach-bao-mat", title: "Chính sách bảo mật" },
];

const sampleProducts = [
  { name: "Máy thở xâm nhập ICU", slug: "may-tho-xam-nhap-icu", cat: "may-tho", price: 450000000n, featured: true },
  { name: "Máy thở không xâm nhập", slug: "may-tho-khong-xam-nhap", cat: "may-tho", price: null, featured: true },
  { name: "Máy theo dõi bệnh nhân 12 inch", slug: "may-theo-doi-benh-nhan-12-inch", cat: "theo-doi", price: 85000000n, featured: false },
  { name: "Máy đo SpO2 cầm tay", slug: "may-do-spo2-cam-tay", cat: "theo-doi", price: 2500000n, featured: false },
  { name: "Giường bệnh nhân 3 tay quay", slug: "giuong-benh-nhan-3-tay-quay", cat: "giuong-benh", price: 12000000n, featured: true },
  { name: "Giường bệnh nhân điện đa năng", slug: "giuong-benh-nhan-dien-da-nang", cat: "giuong-benh", price: null, featured: false },
];

async function main() {
  await db.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, companyName: "Tên công ty" },
  });

  for (const p of pages) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, content: `<p>Nội dung ${p.title.toLowerCase()} đang được cập nhật.</p>` },
    });
  }

  if (process.env.NODE_ENV === "production") return;
  if ((await db.category.count()) > 0) return;

  const cats = [
    { name: "Máy thở", slug: "may-tho", sortOrder: 1 },
    { name: "Thiết bị theo dõi", slug: "theo-doi", sortOrder: 2 },
    { name: "Giường bệnh", slug: "giuong-benh", sortOrder: 3 },
  ];
  const bySlug: Record<string, number> = {};
  for (const c of cats) bySlug[c.slug] = (await db.category.create({ data: c })).id;

  for (const p of sampleProducts) {
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: bySlug[p.cat],
        price: p.price,
        isFeatured: p.featured,
        attributes: [
          { label: "Model", value: "XY-100" },
          { label: "Hãng sản xuất", value: "MediCorp" },
          { label: "Xuất xứ", value: "Đức" },
        ],
        searchText: `${p.name} xy-100 medicorp duc`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase(),
        description: "<h2>Đặc điểm</h2><p>Mô tả mẫu.</p><h2>Thông số kỹ thuật</h2><p>Đang cập nhật.</p>",
      },
    });
  }
}

main().finally(() => db.$disconnect());
