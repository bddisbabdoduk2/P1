import type { Metadata } from "next";
import Link from "next/link";
import { Finder } from "@/components/finder";
import { FabricCard, ProductCard, EvidenceCard } from "@/components/cards";
import { getFabrics, getProducts, getEvidence } from "@/lib/catalog";
import {
  validConcern,
  concernData,
  ages,
  filterProducts,
} from "@/lib/matching";
export const metadata: Metadata = {
  title: "우리 아이 원단 찾기",
  robots: { index: false, follow: true },
};
export default async function Find({
  searchParams,
}: {
  searchParams: Promise<{ concern?: string; age?: string }>;
}) {
  const params = await searchParams;
  if (!validConcern(params.concern))
    return (
      <>
        <h1>우리 아이 원단 찾기</h1>
        <Finder />
        <p className="notice">피부 고민을 먼저 선택해 주세요.</p>
      </>
    );
  const c = concernData[params.concern];
  const age = ages.includes(params.age || "") ? params.age! : "전체";
  const [fabrics, products, evidence] = await Promise.all([
    getFabrics(),
    getProducts(),
    getEvidence(),
  ]);
  const primary = fabrics.find((f) => f.id === c.primary);
  const ps = filterProducts(products, {
    fabric: c.primary || undefined,
    category: "내의·바디수트",
    age,
  }).filter((p) => p.verification_status === "공식 상세페이지 확인");
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/">홈</Link> / 우리 아이 원단
      </div>
      <span className="tag">
        {c.short} · {age === "전체" ? "0~3세" : age}
      </span>
      <h1>{c.title}</h1>
      <p className="lead">{c.intro}</p>
      <div className="split">
        <article className="reading">
          <h2>
            {primary
              ? "먼저 살펴볼 소재 · " + primary.name
              : "먼저 확인할 제품 정보"}
          </h2>
          <p>{c.why}</p>
          {primary && (
            <Link className="button primary" href={`/fabrics/${primary.id}`}>
              원단의 근거 읽기
            </Link>
          )}
        </article>
        <aside className="reading">
          <h2>옷에서 확인할 세 가지</h2>
          <ul>
            {c.checks.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="notice">
        <b>어디까지 확인됐나요?</b>
        <p>{c.limit}</p>
        <small>
          부모가 선택한 탐색 조건이며, 진단이나 개인별 적합성 판정 결과가
          아닙니다.
        </small>
      </div>
      <h2>함께 읽을 근거</h2>
      {evidence
        .filter((e) => c.refs.includes(e.id))
        .map((e) => (
          <EvidenceCard key={e.id} evidence={e} />
        ))}
      <h2>다른 소재의 근거도 살펴보세요</h2>
      <div className="grid">
        {fabrics
          .filter((f) => c.extras.some((e) => e.id === f.id))
          .map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
      </div>
      <h2>표시사항을 확인한 제품 후보</h2>
      <p>
        피부 적합성 순위가 아닙니다. 숫자 사이즈를 월령으로 임의 변환하지
        않습니다.
      </p>
      <div className="grid">
        {ps.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!ps.length && (
        <p className="empty">
          현재 조건에 맞는 월령·소재 표시사항을 확인한 후보가 없습니다.
        </p>
      )}
      <Finder concern={params.concern} age={age} />
    </>
  );
}
