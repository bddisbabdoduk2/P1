import concerns from "@/lib/data/concerns.json";
import type { Product } from "./types";
export type Concern = keyof typeof concerns;
export const concernData = concerns;
export const ages = ["전체", "0~6개월", "6~12개월", "12~24개월", "24~36개월"];
export function validConcern(value: string | undefined): value is Concern {
  return Boolean(value && Object.hasOwn(concerns, value));
}
export function matchesAge(product: Product, age: string) {
  if (age === "전체") return true;
  const tokens: Record<string, string[]> = {
    "0~6개월": ["0~6m", "3~6m"],
    "6~12개월": ["6~12m"],
    "12~24개월": ["12~24m"],
    "24~36개월": ["24~36m"],
  };
  return (tokens[age] ?? []).some((x) =>
    product.size.replace(/\s/g, "").toLowerCase().includes(x),
  );
}
export function filterProducts(
  products: Product[],
  filters: { fabric?: string; age?: string; category?: string; q?: string },
) {
  const q = filters.q?.normalize("NFKC").toLowerCase().trim();
  return products.filter(
    (p) =>
      (!filters.fabric || p.fabric_ids.includes(filters.fabric)) &&
      matchesAge(p, filters.age || "전체") &&
      (!filters.category || p.category === filters.category) &&
      (!q ||
        [p.title, p.brand, p.material]
          .join(" ")
          .normalize("NFKC")
          .toLowerCase()
          .includes(q)),
  );
}
