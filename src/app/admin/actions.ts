"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase, currentUser } from "@/lib/supabase/server";
async function editor() {
  const user = await currentUser();
  if (!user || !["admin", "editor"].includes(user.app_metadata.role))
    redirect("/account");
  return (await supabase())!;
}
export async function moderate(form: FormData) {
  const db = await editor();
  const input = z
    .object({ id: z.uuid(), status: z.enum(["hidden", "published"]) })
    .safeParse(Object.fromEntries(form));
  if (!input.success) redirect("/admin?error=validation");
  const { error } = await db
    .from("posts")
    .update({ status: input.data.status })
    .eq("id", input.data.id);
  revalidatePath("/community");
  revalidatePath("/community/" + input.data.id);
  redirect(error ? "/admin?error=save" : "/admin?saved=1");
}
export async function editEvidence(form: FormData) {
  const db = await editor();
  const input = z
    .object({
      id: z.string().regex(/^[ES]\d{2}$/),
      title: z.string().trim().min(3).max(500),
      url: z.url().refine((v) => v.startsWith("https://")),
      finding: z.string().trim().min(3).max(5000),
      limitation: z.string().trim().min(3).max(5000),
      status: z.enum(["draft", "published"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!input.success) redirect("/admin?error=validation");
  const { id, ...values } = input.data;
  const { error } = await db.from("evidence").update(values).eq("id", id);
  revalidatePath("/evidence");
  revalidatePath("/evidence/" + id);
  redirect(error ? "/admin?error=save" : "/admin?saved=1");
}
