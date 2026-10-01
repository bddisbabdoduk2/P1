import type { MetadataRoute } from "next";
import { getFabrics, getProducts, getEvidence } from "@/lib/catalog";
import { siteUrl, reviewMode } from "@/lib/config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (reviewMode) return [];
  const [fs, ps, es] = await Promise.all([
    getFabrics(),
    getProducts(),
    getEvidence(),
  ]);
  return [
    "/",
    "/fabrics",
    "/products",
    "/evidence",
    "/community",
    ...fs.map((f) => "/fabrics/" + f.id),
    ...ps.map((p) => "/products/" + p.id),
    ...es.map((e) => "/evidence/" + e.id),
  ].map((path) => ({ url: siteUrl + path }));
}
