import { JsonLd } from "@/components/json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { Photo } from "@/components/cards";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = (await getProducts()).find((x) => x.id === id);
  return {
    title: p?.title || "제품을 찾을 수 없습니다",
    description: p?.material,
    alternates: { canonical: `/products/${id}` },
  };
}
export default async function Product({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = (await getProducts()).find((x) => x.id === id);
  if (!p) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          brand: { "@type": "Brand", name: p.brand },
          material: p.material,
        }}
      />
      <div className="breadcrumbs">
        <Link href="/products">제품 표시사항</Link> / {p.brand}
      </div>
      <div className="split">
        <Photo src={p.image} alt={p.title} rights={p.image_rights} />
        <div>
          <span className="tag">
            {p.brand} · {p.category}
          </span>
          <h1>{p.title}</h1>
          <p className="lead">{p.material || "혼용률 확인 필요"}</p>
          <dl>
            {[
              ["사이즈", p.size],
              ["제조국", p.country],
              ["수집 가격", p.price],
              ["KC 표기", p.kc],
              ["판매 상태", p.stock],
              ["확인일", p.checked_at],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "확인 필요"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <article className="notice">
        <h2>확인된 범위와 남은 검토</h2>
        <p>{p.note}</p>
        <p>
          제조사 표기와 실제 시험·안전성 검증은 구분합니다. 숫자 사이즈만으로
          월령을 판단하지 않습니다.
        </p>
      </article>
      <h2>공식 자료·판매처 확인</h2>
      <p>
        가격·옵션·재고는 판매처에서 다시 확인하세요. 현재 제휴 수수료를 설정하지
        않았습니다.
      </p>
      <a
        className="button primary"
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        공식 페이지 확인
      </a>
    </>
  );
}
