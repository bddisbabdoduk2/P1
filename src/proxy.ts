import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configured, showReviewImages } from "@/lib/config";
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/review-assets/")) {
    return showReviewImages
      ? NextResponse.next()
      : new NextResponse(null, { status: 404 });
  }
  let response = NextResponse.next({ request });
  if (!configured) return response;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items, headers) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );
  await db.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/review-assets/:path*",
    "/account/:path*",
    "/login",
    "/auth/:path*",
    "/community/:path*",
    "/admin/:path*",
  ],
};
