import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/validation";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const db = await supabase();
  if (code && db) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(req.nextUrl.searchParams.get("next")), req.url),
        { headers: { "Cache-Control": "private, no-store" } },
      );
  }
  return NextResponse.redirect(new URL("/login?error=callback", req.url), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
