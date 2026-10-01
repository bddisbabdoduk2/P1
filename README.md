# 원단랭킹 · P1

0~3세 아이의 상태에서 시작해 원단 근거와 국내 제품 표시사항을 확인하는 서비스입니다. 서비스 이름과 정식 로고는 미정입니다. 확정한 코랄 HTML은 디자인 참고 시안이며 운영 앱은 Next.js + Supabase로 구현합니다.

## 개발 실행

Node.js 24 이상을 사용합니다.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

- `CONTENT_MODE=review`: 2026-09-30 수집 자료를 사용하는 명시적인 개발 검토 모드입니다. 검색엔진 색인과 sitemap에서 제외합니다. 운영에 사용하지 않습니다.
- `CONTENT_MODE=live`: Supabase의 `published` 자료만 읽습니다. 연결 실패는 오류로 표시하며 검토용 자료로 자동 대체하지 않습니다.
- `SHOW_REVIEW_IMAGES=true`: 사전 허가가 없는 사진을 비공개 검토 환경에서만 표시합니다. 기본값은 false입니다. 사진 파일은 GitHub에 올리지 않습니다. 권한을 확보한 운영 이미지는 Storage 등에 업로드한 뒤 `image_rights=cleared`로 설정합니다.
- `SITE_URL`: 배포할 실제 서비스의 HTTPS 주소를 지정합니다. 이메일 인증 리디렉션과 canonical/sitemap에 사용합니다.

## 첫 개발 범위

- Server Components로 홈·원단·제품·출처 페이지를 서버 HTML로 렌더링합니다.
- 아이 고민 4종과 월령을 기준으로 탐색합니다. 숫자 사이즈를 월령으로 추정하지 않습니다.
- 원단 비교는 최대 3개이며 관리법을 제외합니다.
- 수집한 원단 10종·제품 후보 60개·출처 22개는 모두 초안으로 가져옵니다. 검토 전에는 실제 추천 순위나 점수를 표시하지 않습니다.
- 제품 페이지에서만 판매처 링크를 제공합니다. 가격과 재고는 수집일 기준입니다.
- 이메일 인증 가입/로그인, 공개 닉네임, 육아톡톡 게시글·댓글·신고, 운영자 게시글 숨김 및 근거자료 편집 코드를 제공합니다.
- JSON-LD, canonical, sitemap, robots와 GitHub Actions 검증을 포함합니다.

## Supabase 연결

아직 실제 Supabase 프로젝트에 연결하거나 마이그레이션을 적용하지 않았습니다.

1. 개발용 프로젝트를 선정하고 URL·publishable key를 `.env.local` 및 Vercel Preview에 설정합니다. 서비스 비밀 키는 브라우저나 GitHub에 넣지 않습니다.
2. Supabase CLI의 현재 `--help`로 link / db push 명령을 확인한 뒤 `supabase/migrations`를 개발 DB에 적용합니다. seed는 초안 데이터만 생성합니다. 실제 DB에 적용하기 전 대상을 확인합니다.
3. `supabase/seed.sql`을 개발 DB에서 실행합니다. 중복 ID는 덮어쓰지 않습니다.
4. Auth URL Configuration에서 `SITE_URL`과 `/auth/callback`을 허용합니다. 이메일 전달과 인증 링크를 실제로 검증합니다.
5. 운영자는 서버 측 Admin API 또는 Dashboard로 `app_metadata.role=editor` 혹은 `admin`을 부여합니다. `user_metadata`는 권한에 사용하지 않습니다. 권한 변경 후에는 세션을 갱신합니다.
6. RLS 정책과 공개/비공개 접근, 신고와 운영자 숨김을 실제 연결 환경에서 재검증합니다.
7. 공개 배포는 `CONTENT_MODE=live`, 검토된 자료·이미지 사용권·실제 도메인을 확인한 뒤 진행합니다.

## 데이터 구조

`fabrics`, `products`, `evidence`는 편집 자료입니다. `profiles`, `posts`, `comments`, `reports`는 회원·커뮤니티 자료입니다. 모든 공개 스키마 테이블에 RLS를 적용합니다. 공개 자료 조회에는 publish 상태를 적용하고 회원 변경은 소유권, 운영자 변경은 app_metadata 권한으로 제한합니다.

PostgreSQL simple FTS와 한국어 문자열 부분 일치를 함께 사용합니다. 형태소 분석·동의어·대규모 검색은 이후 고도화 대상입니다. 전체 검색 결과는 현재 100개로 제한합니다.

## 검증

```sh
npm run lint
npm run test
CONTENT_MODE=review npm run build
npm run typecheck
npx playwright install --with-deps chromium
npm run test:e2e
```

단위 테스트는 입력·월령·소재 분류를 검사합니다. PGlite 테스트는 실제 PostgreSQL 엔진에서 migration/seed와 RLS를 실행합니다. Auth 함수는 테스트용 스텁이므로 실제 Supabase 인증과 완전히 동일한 검증은 아닙니다. Playwright는 PC·모바일 탐색/비교/제품 상세, 비회원 작성 제한, JavaScript 없이 읽히는 본문을 검사합니다.

## 후속 범위

실제 Supabase 연결·메일 전송·Vercel Preview 배포 검증, 소셜 로그인 제공자 설정, 회원 탈퇴·개인정보/약관, 스팸·사용량 제한, 회원 첨부파일 업로드, 제품·원단 관리자 편집 확장, 검토 변경 이력, 평가 방법 승인 후 순위 발행이 남아 있습니다. 직접 판매·결제·재고·Rust·PortOne은 직접 판매 도입 시 구현합니다.

운영 기준은 `docs/product-plan.md`, 기술스택 원본은 `docs/architecture-profile.md`를 참고하세요.
