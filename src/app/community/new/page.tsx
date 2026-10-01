import Link from "next/link";
import { currentUser } from "@/lib/supabase/server";
import { createPost } from "@/app/community/actions";
export const metadata = {
  title: "육아톡톡 글 쓰기",
  robots: { index: false, follow: false },
};
export default async function NewPost({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [user, p] = await Promise.all([currentUser(), searchParams]);
  if (!user)
    return (
      <div className="stack">
        <h1>이야기를 나누려면 로그인해 주세요</h1>
        <p>원단과 공개 게시글은 회원가입 없이 볼 수 있습니다.</p>
        <Link className="button primary" href="/login">
          가입·로그인
        </Link>
      </div>
    );
  return (
    <div className="stack">
      <h1>육아톡톡 글 쓰기</h1>
      {p.error && (
        <p role="alert" className="notice">
          저장하지 못했습니다. 제목·내용을 확인하고 다시 시도해 주세요.
        </p>
      )}
      <form action={createPost}>
        <label>
          이야기 종류
          <select name="category">
            <option>아기옷</option>
            <option>피부 고민</option>
            <option>일상</option>
          </select>
        </label>
        <label>
          제목
          <input name="title" minLength={3} maxLength={120} required />
        </label>
        <label>
          내용
          <textarea name="body" minLength={10} maxLength={10000} required />
        </label>
        <p className="auth-note">
          아이의 실명·연락처 등 개인정보는 적지 마세요.
        </p>
        <button className="button primary">이야기 올리기</button>
      </form>
    </div>
  );
}
