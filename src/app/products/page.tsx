import { getProducts, getFabrics } from "@/lib/catalog";
import { ProductCard } from "@/components/cards";
import { filterProducts } from "@/lib/matching";
export const metadata = {
  title: "제품 표시사항",
  alternates: { canonical: "/products" },
};
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ fabric?: string; category?: string; q?: string }>;
}) {
  const filters = await searchParams;
  const [ps, fs] = await Promise.all([getProducts(filters), getFabrics()]);
  const shown = filterProducts(ps, filters);
  return (
    <>
      <span className="eyebrow">FROM FABRIC TO CLOTHES</span>
      <h1>제품 표시사항 살펴보기</h1>
      <p className="lead">
        국내 브랜드의 공식 표시사항을 수집한 후보입니다. 피부 적합성 추천
        순위와는 구분합니다.
      </p>
      <form className="filter-form">
        <label>
          검색
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="제품명·브랜드·소재"
          />
        </label>
        <label>
          원단
          <select name="fabric" defaultValue={filters.fabric || ""}>
            <option value="">전체 원단</option>
            {fs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          품목
          <select name="category" defaultValue={filters.category || ""}>
            <option value="">전체 품목</option>
            {Array.from(new Set(ps.map((p) => p.category))).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="button primary">찾기</button>
      </form>
      <p>{shown.length}개 후보 · 가격과 재고는 확인일 이후 바뀔 수 있습니다.</p>
      <div className="grid">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!shown.length && (
        <p className="empty">조건에 맞는 공개 후보가 없습니다.</p>
      )}
    </>
  );
}
