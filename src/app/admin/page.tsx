import Link from "next/link";
import { currentUser, supabase } from "@/lib/supabase/server";
import { moderate, editEvidence } from "./actions";
import type { Evidence, Post } from "@/lib/types";
export const metadata = {
  title: "자료·커뮤니티 관리",
  robots: { index: false, follow: false },
};
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [user, p] = await Promise.all([currentUser(), searchParams]);
  if (!user || !["admin", "editor"].includes(user.app_metadata.role))
    return (
      <>
        <h1>운영자 권한이 필요합니다</h1>
        <Link className="button" href="/account">
          회원 공간으로
        </Link>
      </>
    );
  const db = (await supabase())!;
  const [es, posts, reports] = await Promise.all([
    db.from("evidence").select("*").order("id"),
    db
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("reports")
      .select("id,post_id,reason,status")
      .eq("status", "open")
      .limit(30),
  ]);
  if (es.error || posts.error || reports.error)
    throw new Error("관리 자료를 불러오지 못했습니다.");
  return (
    <>
      <h1>자료·커뮤니티 관리</h1>
      {p.saved && <p role="status">저장했습니다.</p>}
      {p.error && (
        <p role="alert">저장하지 못했습니다. 입력 내용을 확인하세요.</p>
      )}
      <h2>접수된 신고</h2>
      {reports.data.map((x) => (
        <p className="notice" key={x.id}>
          <Link href={`/community/${x.post_id}`}>해당 글</Link> · {x.reason}
        </p>
      ))}
      <h2>게시글 운영</h2>
      {(posts.data as Post[]).map((x) => (
        <form action={moderate} key={x.id} className="reading">
          <input type="hidden" name="id" value={x.id} />
          <h3>{x.title}</h3>
          <p>
            {x.nickname} · {x.status}
          </p>
          <select
            name="status"
            defaultValue={x.status === "hidden" ? "hidden" : "published"}
          >
            <option value="hidden">숨김</option>
            <option value="published">공개</option>
          </select>{" "}
          <button className="button">상태 저장</button>
        </form>
      ))}
      <h2>근거자료 검토</h2>
      {(es.data as Evidence[]).map((e) => (
        <details key={e.id} className="reading">
          <summary>
            {e.id} · {e.title} · {e.status}
          </summary>
          <form action={editEvidence} className="stack">
            <input type="hidden" name="id" value={e.id} />
            <label>
              제목
              <input name="title" defaultValue={e.title} required />
            </label>
            <label>
              원문 URL
              <input name="url" type="url" defaultValue={e.url} required />
            </label>
            <label>
              확인된 내용
              <textarea name="finding" defaultValue={e.finding} required />
            </label>
            <label>
              적용 한계
              <textarea
                name="limitation"
                defaultValue={e.limitation}
                required
              />
            </label>
            <label>
              검토 상태
              <select name="status" defaultValue={e.status}>
                <option value="draft">초안</option>
                <option value="published">검토 후 공개</option>
              </select>
            </label>
            <button className="button primary">검토 내용 저장</button>
          </form>
        </details>
      ))}
    </>
  );
}
