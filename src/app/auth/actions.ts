"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabase, currentUser } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
import { nicknameSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
export async function sendLogin(form: FormData) {
  const email = z.email().safeParse(form.get("email"));
  if (!email.success) redirect("/login?error=email");
  const db = await supabase();
  if (!db) redirect("/login?error=unconfigured");
  const { error } = await db.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: new URL("/auth/callback", siteUrl).href },
  });
  redirect(error ? "/login?error=send" : "/login?sent=1");
}
export async function signOut() {
  const db = await supabase();
  if (db) await db.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
export async function saveNickname(form: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const parsed = nicknameSchema.safeParse(form.get("nickname"));
  if (!parsed.success) redirect("/account?error=nickname");
  const db = (await supabase())!;
  const { error } = await db
    .from("profiles")
    .upsert({ id: user.id, nickname: parsed.data });
  if (error) redirect("/account?error=save");
  revalidatePath("/account");
  redirect("/account?saved=1");
}
