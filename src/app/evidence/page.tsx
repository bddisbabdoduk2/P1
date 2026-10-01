import { getEvidence } from "@/lib/catalog";
import { EvidenceCard } from "@/components/cards";
export const metadata = {
  title: "선정 기준·출처",
  alternates: { canonical: "/evidence" },
};
export default async function Evidence() {
  const es = await getEvidence();
  return (
    <>
      <span className="eyebrow">EVIDENCE FIRST</span>
      <h1>선정 기준·출처</h1>
      <p className="lead">
        무엇을 확인했고, 어디까지 적용할 수 있는지 공개합니다.
      </p>
      <article className="reading">
        <h2>순위를 공개하기 전 확인할 기준</h2>
        <ul>
          <li>원단 연구와 개별 제품의 시험 결과를 구분합니다.</li>
          <li>
            연구 대상 연령·섬유 사양·비교 조건·결과와 한계를 함께 기록합니다.
          </li>
          <li>자료가 없는 항목에는 임의 점수나 순위를 부여하지 않습니다.</li>
          <li>동일 품목·비교 가능한 조건을 갖춘 후보만 평가합니다.</li>
          <li>광고·제휴 여부는 편집 평가와 분리합니다.</li>
        </ul>
      </article>
      {es.map((e) => (
        <EvidenceCard key={e.id} evidence={e} />
      ))}
      {!es.length && (
        <p className="empty">검토를 마친 출처를 준비하고 있습니다.</p>
      )}
    </>
  );
}
