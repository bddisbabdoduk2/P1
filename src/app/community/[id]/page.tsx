import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { supabase, currentUser } from "@/lib/supabase/server";
import { createComment, reportPost } from "@/app/community/actions";
import type { Post, Comment } from "@/lib/types";
export const metadata = { title: "육아톡톡 이야기" };
export default async function PostDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reported?: string; error?: string }>;
}) {
  const [{ id }, p, db, user] = await Promise.all([
    params,
    searchParams,
    supabase(),
    currentUser(),
  ]);
  if (!db || !z.uuid().safeParse(id).success) notFound();
  const [post, comments] = await Promise.all([
    db
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),
    db
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at"),
  ]);
  if (post.error || comments.error)
    throw new Error("글을 불러오지 못했습니다.");
  if (!post.data) notFound();
  const row = post.data as Post;
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/community">육아톡톡</Link> / {row.category}
      </div>
      <span className="tag">{row.category}</span>
      <h1>{row.title}</h1>
      <small>
        {row.nickname} ·{" "}
        {new Date(row.created_at).toLocaleDateString("ko-KR", {
          timeZone: "Asia/Seoul",
        })}
      </small>
      <article className="reading post-body">{row.body}</article>
      {p.error && (
        <p role="alert">요청을 완료하지 못했습니다. 다시 시도해 주세요.</p>
      )}
      {p.reported && <p role="status">신고를 접수했습니다.</p>}
      <h2>댓글</h2>
      {(comments.data as Comment[]).map((c) => (
        <article className="reading" key={c.id}>
          <b>{c.nickname}</b>
          <p className="post-body">{c.body}</p>
        </article>
      ))}
      {user ? (
        <>
          <form action={createComment} className="reading">
            <input type="hidden" name="post_id" value={id} />
            <label>
              댓글
              <textarea name="body" minLength={2} maxLength={2000} required />
            </label>
            <button className="button primary">댓글 작성</button>
          </form>
          <details className="reading">
            <summary>게시글 신고</summary>
            <form action={reportPost}>
              <input type="hidden" name="post_id" value={id} />
              <label>
                신고 이유
                <textarea
                  name="reason"
                  minLength={5}
                  maxLength={500}
                  required
                />
              </label>
              <button className="button">신고 접수</button>
            </form>
          </details>
        </>
      ) : (
        <p>
          <Link href="/login">로그인 후 댓글을 남길 수 있습니다.</Link>
        </p>
      )}
    </>
  );
}
