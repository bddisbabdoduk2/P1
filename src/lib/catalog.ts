import "server-only";
import fabricData from "@/lib/data/fabrics.json";
import productData from "@/lib/data/products.json";
import evidenceData from "@/lib/data/sources.json";
import type { Fabric, Product, Evidence } from "@/lib/types";
import { supabase } from "@/lib/supabase/server";
import { reviewMode } from "@/lib/config";
async function read<T>(table: string, fixtures: T[]): Promise<T[]> {
  if (reviewMode) return fixtures;
  const db = await supabase();
  if (!db) return [];
  const { data, error } = await db
    .from(table)
    .select("*")
    .eq("status", "published")
    .order("id");
  if (error)
    throw new Error("자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return data as T[];
}
export const getFabrics = () => read<Fabric>("fabrics", fabricData);
export async function getProducts(filters?: {
  q?: string;
  fabric?: string;
  category?: string;
}): Promise<Product[]> {
  if (!filters || reviewMode) return read<Product>("products", productData);
  const db = await supabase();
  if (!db) return [];
  const { data, error } = await db.rpc("search_products", {
    query: filters.q?.slice(0, 200) || "",
    fabric: filters.fabric || null,
    product_category: filters.category || null,
  });
  if (error) throw new Error("제품 검색 결과를 불러오지 못했습니다.");
  return data as Product[];
}
export const getEvidence = () => read<Evidence>("evidence", evidenceData);
export async function getPosts() {
  const db = await supabase();
  if (!db) return [];
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("게시글을 불러오지 못했습니다.");
  return data as import("@/lib/types").Post[];
}
