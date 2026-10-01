import Link from "next/link";
import { Finder } from "@/components/finder";
import { FabricCard } from "@/components/cards";
import { getFabrics } from "@/lib/catalog";
export default async function Home() {
  const fabrics = await getFabrics();
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">A SOFTER START</span>
          <h1>
            좋다는 원단보다,
            <br />
            <em>우리 아이에게 맞는 기준.</em>
          </h1>
          <p>
            아토피, 민감한 피부, 땀과 열감.
            <br />
            아이의 상태에서 시작해 원단과 실제 옷의 표시사항을 살펴보세요.
          </p>
        </div>
        <aside className="hero-note">
          <span>01 / 02 / 03</span>
          <h3>
            아이 상태
            <br />
            원단 근거
            <br />
            제품 표시사항
          </h3>
          <p>세 가지를 함께 보고 선택해요.</p>
        </aside>
      </section>
      <Finder />
      <section className="steps">
        <div>
          <b>01</b>
          <h3>아이의 상태에서 시작</h3>
          <p>지금 걱정되는 피부 고민을 선택해요.</p>
        </div>
        <div>
          <b>02</b>
          <h3>확인된 근거 읽기</h3>
          <p>연구 대상과 적용 한계를 함께 봐요.</p>
        </div>
        <div>
          <b>03</b>
          <h3>실제 옷의 사양 확인</h3>
          <p>혼용률과 피부에 닿는 부분을 살펴요.</p>
        </div>
      </section>
      <section>
        <div className="section-title">
          <div>
            <span className="eyebrow">FABRIC LIBRARY</span>
            <h2>궁금한 원단, 하나씩 알아보기</h2>
          </div>
          <Link href="/fabrics">전체 보기</Link>
        </div>
        <div className="grid">
          {fabrics.slice(0, 6).map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
        {!fabrics.length && (
          <p className="empty">검토를 마친 원단 자료를 준비하고 있습니다.</p>
        )}
      </section>
      <section className="community-banner">
        <div>
          <span className="eyebrow">육아톡톡</span>
          <h2>옷 이야기부터, 아이와 보낸 하루까지.</h2>
          <p>직접 겪은 이야기를 나누고 서로의 선택을 들어보세요.</p>
        </div>
        <Link className="button" href="/community">
          이야기 둘러보기
        </Link>
      </section>
    </>
  );
}
