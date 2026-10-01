import { NextResponse, type NextRequest } from "next/server";
export function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams
    .getAll("fabric")
    .filter((x) => /^[a-z-]+$/.test(x))
    .slice(0, 3);
  return NextResponse.redirect(
    new URL("/compare?ids=" + ids.join(","), req.url),
  );
}
