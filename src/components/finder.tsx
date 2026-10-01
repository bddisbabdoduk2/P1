import { concernData, ages, type Concern } from "@/lib/matching";
export function Finder({
  concern,
  age = "전체",
}: {
  concern?: Concern;
  age?: string;
}) {
  return (
    <form action="/find" className="finder">
      <div className="section-title">
        <div>
          <span className="eyebrow">FOR YOUR LITTLE ONE</span>
          <h2>지금, 우리 아이는 어떤가요?</h2>
        </div>
        <span className="muted">회원정보에 저장하지 않아요</span>
      </div>
      <fieldset>
        <legend>아이의 피부 고민</legend>
        <div className="concern-grid">
          {Object.entries(concernData).map(([key, c]) => (
            <label className="concern" key={key}>
              <input
                type="radio"
                name="concern"
                value={key}
                required
                defaultChecked={key === concern}
              />
              <span className="number">{c.symbol}</span>
              <span>
                <strong>{c.name}</strong>
                <small>{c.desc}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          아이 월령 <small>선택사항</small>
        </legend>
        <div className="chips">
          {ages.map((a) => (
            <label key={a}>
              <input
                type="radio"
                name="age"
                value={a}
                defaultChecked={age === a}
              />
              <span>{a === "전체" ? "0~3세 전체" : a}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="finder-bottom">
        <p>아이 상태에 맞춰 살펴볼 소재와 확인된 근거를 안내해요.</p>
        <button className="button primary">우리 아이 원단 살펴보기</button>
      </div>
    </form>
  );
}
