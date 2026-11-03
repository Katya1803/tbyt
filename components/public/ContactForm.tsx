"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/(public)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  productId?: number;
};

export function ContactForm({ title, productId }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, {});
  const v = state.values;

  return (
    <section className="rounded-xl border bg-white p-4 md:p-6">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <form action={action} className="space-y-4">
        {productId && <input type="hidden" name="productId" value={productId} />}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-name">Họ tên *</Label>
          <Input id="contact-name" name="name" defaultValue={v?.name} required minLength={2} maxLength={100} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Số điện thoại *</Label>
          <Input id="contact-phone" name="phone" defaultValue={v?.phone} type="tel" required autoComplete="tel" placeholder="0901 234 567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-org">Tên cơ sở / phòng khám</Label>
          <Input id="contact-org" name="organization" defaultValue={v?.organization} maxLength={200} autoComplete="organization" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Nội dung</Label>
          <Textarea id="contact-message" name="message" defaultValue={v?.message} rows={4} maxLength={2000} />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.ok && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">Cảm ơn, chúng tôi sẽ liên hệ lại sớm</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Đang gửi..." : "Gửi"}
        </Button>
      </form>
    </section>
  );
}
