import Link from "next/link";
import { currentUser, supabase } from "@/lib/supabase/server";
import { saveNickname, signOut } from "@/app/auth/actions";
export const metadata = {
  title: "회원 공간",
  robots: { index: false, follow: false },
};
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [user, p] = await Promise.all([currentUser(), searchParams]);
  if (!user)
    return (
      <div className="stack">
        <h1>회원 공간</h1>
        <p>글을 작성하려면 이메일 인증으로 로그인해 주세요.</p>
        <Link className="button primary" href="/login">
          가입·로그인
        </Link>
      </div>
    );
  const db = (await supabase())!;
  const { data: profile, error } = await db
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error("프로필을 불러오지 못했습니다.");
  return (
    <div className="stack">
      <h1>회원 공간</h1>
      <p>{user.email}</p>
      {p.saved && <p role="status">닉네임을 저장했습니다.</p>}
      {p.error && (
        <p role="alert">
          닉네임을 저장하지 못했습니다. 2~20자로 입력해 주세요.
        </p>
      )}
      <form action={saveNickname}>
        <label>
          공개 닉네임
          <input
            name="nickname"
            required
            minLength={2}
            maxLength={20}
            defaultValue={profile?.nickname}
          />
        </label>
        <button className="button primary">닉네임 저장</button>
      </form>
      <p>
        <Link href="/community/new">육아톡톡 글 쓰기</Link>
      </p>
      <form action={signOut}>
        <button className="button">로그아웃</button>
      </form>
    </div>
  );
}
