import { test } from "node:test";
import assert from "node:assert/strict";
import products from "../src/lib/data/products.json";
import { filterProducts, validConcern } from "../src/lib/matching";
import { safeNext, postSchema } from "../src/lib/validation";
test("unknown concerns and prototype keys are rejected", () => {
  assert.equal(validConcern("atopic"), true);
  assert.equal(validConcern("__proto__"), false);
  assert.equal(validConcern("constructor"), false);
});
test("numeric clothing sizes are never inferred as age ranges", () => {
  const rows = filterProducts(products, { fabric: "cotton", age: "0~6개월" });
  assert(rows.every((p) => /0~6m|3~6m/i.test(p.size.replace(/\s/g, ""))));
  assert(!rows.some((p) => p.id === "P002"));
});
test("fabric matching respects mixed fibre classification", () => {
  assert(
    !filterProducts(products, { fabric: "cotton" }).some(
      (p) => p.id === "P001",
    ),
  );
  assert(
    filterProducts(products, { fabric: "cotton-blend" }).some(
      (p) => p.id === "P001",
    ),
  );
});
test("auth redirects reject external URLs and malformed paths", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil",
  ])
    assert.equal(safeNext(value), "/account");
  assert.equal(safeNext("/community/new"), "/community/new");
});
test("short posts and unrecognized categories are rejected", () => {
  assert(
    !postSchema.safeParse({ title: "ok", body: "short", category: "광고" })
      .success,
  );
});
