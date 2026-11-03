import { ProductForm } from "@/components/admin/ProductForm";
import { getProductFormOptions } from "../form-options";

export const dynamic = "force-dynamic";

const DESCRIPTION_TEMPLATE =
  "<h2>Đặc điểm</h2><p></p><h2>Thông số kỹ thuật</h2><p></p><h2>Cấu hình và phụ kiện</h2><p></p>";

export default async function NewProductPage() {
  const options = await getProductFormOptions();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm sản phẩm</h1>
      <ProductForm
        id={null}
        {...options}
        initial={{
          name: "",
          slug: "",
          categoryId: null,
          price: "",
          isActive: true,
          isFeatured: false,
          images: [],
          attributes: [
            { label: "Model", value: "" },
            { label: "Hãng sản xuất", value: "" },
            { label: "Xuất xứ", value: "" },
          ],
          description: DESCRIPTION_TEMPLATE,
          metaTitle: "",
          metaDesc: "",
        }}
      />
    </div>
  );
}
