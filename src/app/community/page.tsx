import Link from "next/link";
import { getPosts } from "@/lib/catalog";
export const metadata = {
  title: "육아톡톡",
  alternates: { canonical: "/community" },
};
export default async function Community() {
  const posts = await getPosts();
  return (
    <>
      <div className="section-title">
        <div>
          <span className="eyebrow">OUR LITTLE DAYS</span>
          <h1>육아톡톡</h1>
          <p className="lead">
            아기옷과 피부 고민, 아이와 함께하는 일상을 나눠요.
          </p>
        </div>
        <Link className="button primary" href="/community/new">
          글 쓰기
        </Link>
      </div>
      <p className="notice">
        커뮤니티 글은 개인의 경험입니다. 임상 효과나 안전성을 확인한 근거자료와
        구분해 주세요.
      </p>
      {posts.map((p) => (
        <Link className="post-row" key={p.id} href={`/community/${p.id}`}>
          <span className="tag">{p.category}</span>
          <h3>{p.title}</h3>
          <small>
            {p.nickname} ·{" "}
            {new Date(p.created_at).toLocaleDateString("ko-KR", {
              timeZone: "Asia/Seoul",
            })}
          </small>
        </Link>
      ))}
      {!posts.length && (
        <div className="empty">
          <h3>첫 이야기를 기다리고 있어요</h3>
          <p>실제 회원이 작성한 공개 글만 표시합니다.</p>
        </div>
      )}
    </>
  );
}
