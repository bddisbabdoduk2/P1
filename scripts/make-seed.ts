import { writeFileSync } from "node:fs";
import fabrics from "../src/lib/data/fabrics.json";
import evidence from "../src/lib/data/sources.json";
import products from "../src/lib/data/products.json";
const configs = [
  [
    "evidence",
    evidence,
    [
      "id",
      "title",
      "url",
      "kind",
      "publication",
      "finding",
      "limitation",
      "access",
      "checked_at",
      "status",
    ],
  ],
  [
    "fabrics",
    fabrics,
    [
      "id",
      "name",
      "definition",
      "source_ids",
      "summary",
      "limitation",
      "image",
      "image_credit",
      "image_url",
      "image_rights",
      "checked_at",
      "status",
    ],
  ],
  [
    "products",
    products,
    [
      "id",
      "brand",
      "title",
      "category",
      "material",
      "size",
      "country",
      "price",
      "kc",
      "stock",
      "note",
      "url",
      "image",
      "image_rights",
      "fabric_ids",
      "checked_at",
      "verification_status",
      "status",
    ],
  ],
] as const;
const sql = [
  "-- Collected 2026-09-30. All records stay DRAFT. Photo rights pending.",
  "begin;",
];
for (const [table, rows, cols] of configs) {
  for (const row of rows) {
    const picked = Object.fromEntries(
      cols.map((c) => [
        c,
        (row as unknown as Record<string, unknown>)[c] ?? "",
      ]),
    );
    const encoded = JSON.stringify(picked).replaceAll("'", "''");
    sql.push(
      `insert into public.${table} (${cols.join(",")}) select ${cols.join(",")} from json_populate_record(null::public.${table}, '${encoded}'::json) on conflict(id) do nothing;`,
    );
  }
}
sql.push("commit;");
writeFileSync("supabase/seed.sql", sql.join("\n") + "\n");
console.log("Draft seed generated");
