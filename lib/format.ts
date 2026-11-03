const priceFormatter = new Intl.NumberFormat("vi-VN");

export function formatPrice(price: number | bigint | null | undefined): string {
  if (price === null || price === undefined) return "Liên hệ";
  return `${priceFormatter.format(price)} ₫`;
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}
