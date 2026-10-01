import Link from "next/link";
import { getFabrics } from "@/lib/catalog";
export const metadata = {
  title: "원단 비교",
  robots: { index: false, follow: true },
};
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const fs = await getFabrics();
  const selected = fs
    .filter((f) => (ids || "").split(",").includes(f.id))
    .slice(0, 3);
  return (
    <>
      <h1>원단 비교</h1>
      <p className="lead">
        관리법을 제외하고, 확인된 설명과 근거를 나란히 살펴보세요.
      </p>
      <form action="/compare" className="reading">
        <fieldset>
          <legend>최대 3개 원단을 선택하세요</legend>
          <div className="chips">
            {fs.map((f) => (
              <label key={f.id}>
                <input
                  type="checkbox"
                  name="fabric"
                  value={f.id}
                  defaultChecked={selected.some((x) => x.id === f.id)}
                />
                <span>{f.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button formAction="/compare/select" className="button primary">
          비교하기
        </button>
      </form>
      {selected.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>항목</th>
                {selected.map((f) => (
                  <th key={f.id}>
                    <Link href={`/fabrics/${f.id}`}>{f.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["분류·표시사항", "definition"],
                ["확인된 설명", "summary"],
                ["적용 한계", "limitation"],
                ["확인일", "checked_at"],
              ].map(([label, key]) => (
                <tr key={key}>
                  <th>{label}</th>
                  {selected.map((f) => (
                    <td key={f.id}>{String(f[key as keyof typeof f])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">비교할 원단을 선택해 주세요.</p>
      )}
    </>
  );
}
