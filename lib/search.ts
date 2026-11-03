import { removeDiacritics } from "./slug";

export function normalizeSearch(text: string): string {
  return removeDiacritics(text).toLowerCase().replace(/\s+/g, " ").trim();
}

export type Attribute = { label: string; value: string };

export function buildSearchText(name: string, attributes: Attribute[]): string {
  return normalizeSearch([name, ...attributes.map((a) => a.value)].join(" "));
}
