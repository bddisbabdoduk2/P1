import Link from "next/link";
export default function NotFound() {
  return (
    <>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소를 확인하거나 공개된 자료 목록에서 다시 찾아보세요.</p>
      <Link className="button" href="/">
        홈으로
      </Link>
    </>
  );
}
