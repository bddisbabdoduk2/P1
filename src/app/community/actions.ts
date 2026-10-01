"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase, currentUser } from "@/lib/supabase/server";
import { postSchema, commentSchema } from "@/lib/validation";
async function author() {
  const user = await currentUser();
  if (!user || user.is_anonymous) redirect("/login");
  const db = (await supabase())!;
  const { data, error } = await db
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();
  if (error || !data) redirect("/account");
  return { db, user, nickname: data.nickname as string };
}
export async function createPost(form: FormData) {
  const input = postSchema.safeParse(Object.fromEntries(form));
  if (!input.success) redirect("/community/new?error=validation");
  const { db, user, nickname } = await author();
  const { data, error } = await db
    .from("posts")
    .insert({ ...input.data, user_id: user.id, nickname, status: "published" })
    .select("id")
    .single();
  if (error) redirect("/community/new?error=save");
  revalidatePath("/community");
  redirect("/community/" + data.id);
}
export async function createComment(form: FormData) {
  const input = commentSchema.safeParse(Object.fromEntries(form));
  if (!input.success) redirect("/community?error=validation");
  const { db, user, nickname } = await author();
  const { error } = await db
    .from("comments")
    .insert({ ...input.data, user_id: user.id, nickname, status: "published" });
  revalidatePath("/community/" + input.data.post_id);
  redirect(
    "/community/" + input.data.post_id + (error ? "?error=comment" : ""),
  );
}
export async function reportPost(form: FormData) {
  const id = z.uuid().safeParse(form.get("post_id"));
  const reason = z
    .string()
    .trim()
    .min(5)
    .max(500)
    .safeParse(form.get("reason"));
  if (!id.success || !reason.success) redirect("/community?error=report");
  const { db, user } = await author();
  const { error } = await db
    .from("reports")
    .insert({
      post_id: id.data,
      user_id: user.id,
      reason: reason.data,
      status: "open",
    });
  redirect("/community/" + id.data + (error ? "?error=report" : "?reported=1"));
}
