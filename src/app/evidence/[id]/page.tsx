import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/config";
import { notFound } from "next/navigation";
import { getEvidence } from "@/lib/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = (await getEvidence()).find((x) => x.id === id);
  return { title: e?.title, alternates: { canonical: `/evidence/${id}` } };
}
export default async function Evidence({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = (await getEvidence()).find((x) => x.id === id);
  if (!e) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: e.title,
          url: siteUrl + "/evidence/" + e.id,
          citation: e.url,
        }}
      />
      <span className="tag">
        {e.kind} · {e.publication}
      </span>
      <h1>{e.title}</h1>
      <article className="reading">
        <h2>자료에서 확인한 내용</h2>
        <p>{e.finding}</p>
        <h2>적용 범위와 한계</h2>
        <p>{e.limitation}</p>
        <p>확인 방식: {e.access}</p>
        <small>확인일 {e.checked_at}</small>
      </article>
      <a
        className="button"
        href={e.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        근거 원문 확인
      </a>
    </>
  );
}
