import { z } from "zod";
export const postSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(10000),
  category: z.enum(["아기옷", "피부 고민", "일상"]),
});
export const commentSchema = z.object({
  post_id: z.uuid(),
  body: z.string().trim().min(2).max(2000),
});
export const nicknameSchema = z.string().trim().min(2).max(20);
export function safeNext(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\r\n]/.test(value)
    ? value
    : "/account";
}
