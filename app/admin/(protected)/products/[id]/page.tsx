import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { deleteProduct } from "../actions";
import { getProductFormOptions } from "../form-options";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [product, options] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    getProductFormOptions(),
  ]);
  if (!product) notFound();

  const attributes = (product.attributes as { label: string; value: string }[]) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Sửa sản phẩm</h1>
        <DeleteButton
          action={deleteProduct.bind(null, product.id)}
          title={`Xóa sản phẩm "${product.name}"?`}
          description="Sản phẩm cùng toàn bộ ảnh sẽ bị xóa vĩnh viễn."
          redirectTo="/admin/products"
        />
      </div>
      <ProductForm
        id={product.id}
        {...options}
        initial={{
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          price: product.price === null ? "" : product.price.toString(),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
          attributes,
          description: product.description,
          metaTitle: product.metaTitle ?? "",
          metaDesc: product.metaDesc ?? "",
        }}
      />
    </div>
  );
}
