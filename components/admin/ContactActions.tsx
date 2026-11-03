"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteContact, markContactUnread } from "@/app/admin/(protected)/contacts/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./DeleteButton";

export function ContactActions({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function markUnread() {
    startTransition(async () => {
      const result = await markContactUnread(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã đánh dấu chưa đọc");
      router.push("/admin/contacts");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" disabled={pending} onClick={markUnread}>
        Đánh dấu chưa đọc
      </Button>
      <DeleteButton
        action={deleteContact.bind(null, id)}
        title="Xóa liên hệ này?"
        redirectTo="/admin/contacts"
        size="default"
      />
    </div>
  );
}
