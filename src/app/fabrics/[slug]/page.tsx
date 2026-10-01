import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/config";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFabrics, getProducts, getEvidence } from "@/lib/catalog";
import { Photo, EvidenceCard, ProductCard } from "@/components/cards";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = (await getFabrics()).find((x) => x.id === slug);
  return {
    title: f?.name || "원단을 찾을 수 없습니다",
    description: f?.definition,
    alternates: { canonical: `/fabrics/${slug}` },
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [fs, ps, es] = await Promise.all([
    getFabrics(),
    getProducts(),
    getEvidence(),
  ]);
  const f = fs.find((x) => x.id === slug);
  if (!f) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: f.name,
          description: f.definition,
          url: siteUrl + "/fabrics/" + f.id,
          citation: es
            .filter((e) => f.source_ids.includes(e.id))
            .map((e) => e.url),
        }}
      />
      <div className="breadcrumbs">
        <Link href="/fabrics">원단 알아보기</Link> / {f.name}
      </div>
      <div className="split">
        <Photo
          src={f.image}
          alt={`${f.name} 원단 예시`}
          rights={f.image_rights}
        />
        <div>
          <span className="eyebrow">FABRIC PROFILE</span>
          <h1>{f.name}</h1>
          <p className="lead">{f.definition}</p>
          <p>{f.summary}</p>
          <p className="notice">{f.limitation}</p>
          <small>
            자료 확인일 {f.checked_at} · 사진은 특정 판매 원단 예시이며 모든{" "}
            {f.name}의 성능을 대표하지 않습니다.
          </small>
          <p>
            <Link className="button" href={`/compare?ids=${f.id}`}>
              비교에 담기
            </Link>
          </p>
        </div>
      </div>
      <h2>연결된 근거자료</h2>
      {es
        .filter((e) => f.source_ids.includes(e.id))
        .map((e) => (
          <EvidenceCard key={e.id} evidence={e} />
        ))}
      <div className="section-title">
        <h2>이 원단의 제품 표시사항</h2>
        <Link href={`/products?fabric=${f.id}`}>품목별 후보 보기</Link>
      </div>
      <p>
        검증된 평가 방식이 확정되기 전에는 TOP 10과 점수를 공개하지 않습니다.
      </p>
      <div className="grid">
        {ps
          .filter((p) => p.fabric_ids.includes(f.id))
          .slice(0, 6)
          .map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
      </div>
    </>
  );
}
