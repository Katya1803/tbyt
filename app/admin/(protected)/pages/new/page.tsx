import { PageForm } from "@/components/admin/PageForm";

export default function NewPagePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm trang</h1>
      <PageForm id={null} slugLocked={false} initial={{ title: "", slug: "", content: "", metaTitle: "", metaDesc: "" }} />
    </div>
  );
}
