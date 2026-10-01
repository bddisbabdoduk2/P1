import { getFabrics } from "@/lib/catalog";
import { FabricCard } from "@/components/cards";
export const metadata = {
  title: "원단 알아보기",
  alternates: { canonical: "/fabrics" },
};
export default async function Fabrics() {
  const fabrics = await getFabrics();
  return (
    <>
      <span className="eyebrow">FABRIC LIBRARY</span>
      <h1>원단 알아보기</h1>
      <p className="lead">
        섬유 이름, 제품 사양, 연구 근거를 나눠서 확인하세요.
      </p>
      <div className="grid">
        {fabrics.map((f) => (
          <FabricCard key={f.id} fabric={f} />
        ))}
      </div>
      {!fabrics.length && (
        <p className="empty">공개 자료를 준비하고 있습니다.</p>
      )}
    </>
  );
}
