# SEO/GEO 성장형 쇼핑몰 기술스택 — Supabase 기준

## 1. 목표

이 문서는 **SEO·GEO로 성장하는 쇼핑몰**을 ChatGPT 아스트라가 반복적으로 개발·검증·운영할 수 있도록 하는 기본 기술스택과 운영 기준을 정리한 문서다.

핵심 원칙은 다음과 같다.

- 공개 상품·카테고리·콘텐츠는 검색엔진과 AI 검색이 읽기 쉬운 서버 HTML 중심으로 제공한다.
- 회원·상품·후기·주문 데이터는 PostgreSQL 기반으로 관리한다.
- 상품 가격·쿠폰·재고·주문·환불처럼 돈과 상태를 바꾸는 핵심 규칙은 Rust가 최종 판단한다.
- 이미지·영상·검색·실시간·AI 기능은 필요할 때만 활성화한다.
- 개발은 ChatGPT 아스트라가 주도하되, 실제 배포는 테스트와 검증 결과를 기준으로 판단한다.

---

## 2. 기본 기술스택

| 영역 | 기본 선택 | 역할 |
|---|---|---|
| 개발·설계 | ChatGPT 아스트라 | 설계, 구현, 점검, 수정, 인계 |
| 소스 관리 | GitHub | 코드, 문서, PR, 변경 이력 |
| 웹 | Next.js + React + TypeScript | 공개 상품, 카테고리, 콘텐츠, 관리자 |
| 웹 배포 | Vercel | Preview, Production, CDN |
| DB | Supabase PostgreSQL | 상품, 주문, 후기, 회원, 콘텐츠 |
| 인증 | Supabase Auth | 로그인, 세션 |
| 파일 | Supabase Storage | 초기 상품 이미지, 후기 이미지, 첨부 |
| 실시간 | Supabase Realtime | 실시간 상태 반영, 알림성 업데이트 |
| 핵심 백엔드 | Rust + Axum | 주문, 재고, 결제검증, 쿠폰, 환불, 정산 |
| 결제 | PortOne V2 | 국내 PG 통합 |
| 이메일 | Resend | 주문/회원/알림 메일 |
| 검색 | PostgreSQL FTS + pg_trgm | 기본 상품/콘텐츠 검색 |
| 벡터검색 | pgvector | AI 검색, 의미 기반 검색 |
| 대규모 검색 | OpenSearch | 상품 수/검색량 증가 시 선택 |
| 관측 | OpenTelemetry + Sentry | 오류, 성능, 추적 |
| 자동검증 | GitHub Actions + Playwright | CI, E2E, 배포 전 점검 |

---

## 3. 전체 구조

```text
Google / Naver / AI Search / 사용자
                ↓
         Next.js + Vercel
                ↓
      ┌─────────┼─────────┐
      ▼         ▼         ▼
 Supabase DB  Supabase   Rust API
   / Auth     Storage    주문/재고/
 /Realtime               결제검증
      │                    │
      └─────────┬──────────┘
                ▼
            PortOne
```

---

## 4. 역할 분리

### Supabase가 맡는 것

- 회원
- 인증
- 상품 데이터
- 카테고리
- 후기
- 콘텐츠
- 주문 조회용 데이터
- 파일
- 실시간 상태 전달

### Rust가 맡는 것

- 최종 상품 가격 계산
- 쿠폰 검증
- 할인 중복 규칙
- 재고 예약
- 재고 차감
- 주문 상태 변경
- 결제 금액 검증
- 환불 규칙
- 정산
- 중요 권한 검증
- 중복 요청 방지

중요 원칙:

```text
브라우저가 보내는 가격
!=
최종 결제 가격
```

최종 가격은 항상 서버에서 다시 계산한다.

---

## 5. 상품 데이터 구조

```text
Product
├ Variant
├ Option
├ Price
├ Inventory
├ Category
├ Brand
├ Asset
├ Review
├ SEO Metadata
├ Content
└ Relation
```

### Product와 Variant는 분리

예:

```text
Product
= 티셔츠

Variant
= 검정 / M
= 검정 / L
= 흰색 / M
```

가격과 재고는 Variant 단위로 관리할 수 있어야 한다.

---

## 6. 재고 상태 모델

권장 상태:

```text
AVAILABLE
   ↓
RESERVED
   ↓
PAID
   ↓
FULFILLED
```

결제 실패 또는 시간초과:

```text
RESERVED
   ↓
AVAILABLE
```

필수 불변조건:

- 재고 1개를 동시에 2명이 결제해도 2개 판매되지 않는다.
- 같은 주문/결제 이벤트가 여러 번 도착해도 한 번만 처리된다.
- 취소/환불 시 재고 복원 규칙이 일관적이다.

---

## 7. 결제 흐름

```text
장바구니
   ↓
Rust 서버
   ↓
상품가격 재조회
쿠폰 검증
배송비 계산
재고 확인
   ↓
최종 금액 확정
   ↓
PortOne 결제
   ↓
서버에서 결제금액 재검증
   ↓
주문 확정
```

클라이언트가 보내는 금액은 신뢰하지 않는다.

---

## 8. SEO/GEO 구조

상품 페이지는 검색엔진과 AI 검색이 읽기 쉬운 서버 HTML로 제공한다.

예:

```text
/product/{slug}
```

페이지에 포함할 항목:

- 상품명
- 가격
- 재고 상태
- 브랜드
- 옵션
- 상품 설명
- 실제 이미지
- 영상
- 배송
- 교환/반품
- 후기
- FAQ
- Product JSON-LD
- Breadcrumb
- 관련 상품
- 비교 콘텐츠
- 관련 가이드

---

## 9. 콘텐츠 확장 구조

상품만 늘리는 구조가 아니라, 상품과 콘텐츠를 연결한다.

```text
Entity
  │
Product
  │
├ Review
├ Comparison
├ Guide
├ Q&A
├ Video
├ Evidence
└ Related Content
```

예:

```text
홍차
├ 상품
├ 브랜드 비교
├ 우리는 법
├ 등급 차이
├ 음식 페어링
├ 후기
├ 영상
└ Q&A
```

이 구조가 SEO + GEO + Commerce를 연결한다.

---

## 10. Supabase 보안 기준

### RLS 필수

다음 테이블은 단순 로그인 여부만 확인하면 안 된다.

- orders
- payments
- addresses
- customers
- reviews
- admin
- private_assets

예:

```sql
create policy "read own orders"
on orders
for select
to authenticated
using (auth.uid() = user_id);
```

UPDATE 정책은 `USING`과 `WITH CHECK`를 함께 검토한다.

### 금지

- `service_role`을 브라우저에 노출
- `user_metadata`를 권한 판단에 사용
- `authenticated` role만으로 소유권 검증을 끝냄
- public view에서 RLS 우회 가능성을 방치
- SECURITY DEFINER를 권한 문제 해결용으로 남용

---

## 11. Supabase Storage 사용 기준

초기에는 다음 파일을 Supabase Storage에 둬도 된다.

- 상품 이미지
- 후기 이미지
- 프로필
- 첨부파일

대용량 미디어가 커지면:

```text
Supabase
= DB / Auth / Realtime

Cloudflare R2
= 대용량 원본 미디어
```

로 분리한다.

---

## 12. 개발·검증 흐름

```text
ChatGPT 아스트라
      ↓
Git Branch
      ↓
Supabase Preview Branch
      ↓
Vercel Preview
      ↓
Playwright
      ↓
DB Migration Test
      ↓
RLS / 권한 Test
      ↓
결제 / 재고 Test
      ↓
SEO / HTML Test
      ↓
Merge
      ↓
Production
```

### AI가 완료라고 말해도 반드시 확인할 것

- 실제 빌드
- 실제 DB migration
- 실제 RLS
- 실제 브라우저 화면
- 실제 결제 webhook 테스트
- 중복 결제 이벤트
- 재고 동시성
- canonical
- sitemap
- structured data
- 비공개 데이터 노출 여부

---

## 13. 월 예산

### 최소형

```text
Vercel Pro      약 $20
Supabase Pro    약 $25
Resend          $0부터
PortOne         거래액 기준
Rust 실행비     소규모면 매우 낮게 시작 가능
```

대략:

**월 6~8만원 + PG 결제수수료**

---

### 최적형

```text
Vercel Pro      약 $20
Supabase Pro    약 $25
Rust API        약 $5~15
메일/로그       약 $0~10
스토리지 여유   약 $0~10
```

대략:

**월 8~15만원 + PG 결제수수료**

---

### 완벽형

추가 가능 항목:

- 더 큰 Supabase compute
- 별도 Rust 서버
- OpenSearch
- Valkey
- Temporal
- NATS
- 독립 백업
- AI 검색
- 추천 시스템
- 대량 이미지/영상
- staging 환경
- 멀티창고
- 멀티셀러
- ERP/WMS

대략:

**월 25~60만원 이상**

트래픽, AI, 검색, 영상, 로그 사용량에 따라 더 커질 수 있다.

---

## 14. 세 단계 구성

### 최소형

```text
Next.js
Vercel
Supabase
PortOne
Resend
```

Rust는 중요한 결제/재고 검증부터 적용.

### 최적형

```text
Next.js
Vercel
Supabase
Rust + Axum
PortOne
Resend
GitHub Actions
Playwright
OpenTelemetry
Sentry
SEO/GEO 자동검사
```

기본 추천 구성.

### 완벽형

최적형 +

```text
OpenSearch
Valkey
Temporal
NATS
AI Search
추천 시스템
멀티창고
멀티셀러
해외결제
다국어
다중통화
ERP/WMS
Fraud Detection
```

단, 처음부터 전부 활성화하지 않는다.

---

## 15. 아스트라용 쇼핑몰 Profile

```text
PROFILE: COMMERCE-SEO-GEO-SUPABASE

CORE
├ Next.js
├ Vercel
├ Supabase PostgreSQL
├ Supabase Auth
├ Supabase Storage
├ Supabase Realtime
├ Rust / Axum
├ PortOne V2
├ Resend
├ GitHub Actions
├ Playwright
└ OpenTelemetry / Sentry

DOMAIN
├ Product
├ Variant
├ Option
├ Inventory
├ Price
├ Cart
├ Order
├ Payment
├ Refund
├ Shipment
├ Customer
├ Review
└ Coupon

SEO/GEO
├ Server rendered product pages
├ Canonical
├ Sitemap
├ Product Schema
├ Breadcrumb
├ Internal Linking
├ Comparison Content
├ Guide Content
├ Review Content
├ Image SEO
└ AI Search Readability

OPTIONAL
├ OpenSearch
├ pgvector
├ Valkey
├ Temporal
├ NATS
├ Stripe
├ Recommendation
├ AI Search
├ Multi-vendor
├ Subscription
├ Marketplace
└ ERP
```

---

## 16. 최종 권장안

쇼핑몰 기본 구조는 다음으로 고정한다.

> **Next.js + Vercel + Supabase + Rust + PortOne**

### Supabase
상품·콘텐츠·회원·후기·파일·실시간.

### Rust
주문·재고·결제·쿠폰·환불·정산.

### Next.js
SEO/GEO 성장형 공개 웹.

### Vercel
배포와 캐시.

### ChatGPT 아스트라
설계·구현·검증·수정.

핵심은 **Supabase를 단순 DB로 쓰는 것이 아니라 통합 플랫폼으로 활용하면서, 돈과 재고 같은 핵심 상태변경은 Rust가 통제하는 구조**다.
