import { sendLogin } from "@/app/auth/actions";
import { configured } from "@/lib/config";
export const metadata = {
  title: "가입·로그인",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const p = await searchParams;
  return (
    <div className="stack">
      <span className="eyebrow">WELCOME</span>
      <h1>육아톡톡과 함께해요</h1>
      <p>
        이메일 인증 링크로 가입하거나 로그인합니다. 원단·제품 정보는 가입 없이
        볼 수 있어요.
      </p>
      {!configured && (
        <p className="notice">
          회원 서비스 연결을 준비하고 있습니다. 현재는 가입·로그인을 사용할 수
          없습니다.
        </p>
      )}
      {p.sent && (
        <p role="status" className="notice">
          인증 메일 발송을 요청했습니다. 받은 편지함에서 링크를 확인해 주세요.
        </p>
      )}
      {p.error && (
        <p role="alert" className="notice">
          로그인을 완료하지 못했습니다. 이메일과 인증 링크를 확인하고 다시
          시도해 주세요.
        </p>
      )}
      <form action={sendLogin}>
        <label>
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="name@example.com"
            disabled={!configured}
          />
        </label>
        <button disabled={!configured} className="button primary">
          인증 링크 받기
        </button>
      </form>
      <p className="auth-note">
        인증 링크는 본인만 사용해 주세요. 소셜 로그인은 제공자 설정과 연결 검증
        후 추가합니다.
      </p>
    </div>
  );
}
