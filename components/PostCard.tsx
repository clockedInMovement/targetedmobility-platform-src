"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function PostCard({
  post,
  meId,
  meIsAdmin,
}: {
  post: any;
  meId: string;
  meIsAdmin: boolean;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const canDelete = meIsAdmin || post.author_id === meId;

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    await supabase
      .from("comments")
      .insert({ post_id: post.id, body: comment.trim(), author_id: meId });
    setComment("");
    setBusy(false);
    router.refresh();
  }

  async function deletePost() {
    await supabase.from("posts").delete().eq("id", post.id);
    router.refresh();
  }

  async function togglePin() {
    await supabase
      .from("posts")
      .update({ pinned: !post.pinned })
      .eq("id", post.id);
    router.refresh();
  }

  async function deleteComment(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    router.refresh();
  }

  const comments = [...(post.comments ?? [])].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="card post">
      <div className="post-head">
        <span className="post-author">
          {post.profiles?.display_name ?? "Member"}
        </span>
        {post.profiles?.is_admin && <span className="badge">Coach</span>}
        {post.pinned && <span className="badge pin">Pinned</span>}
        <span className="post-time">{timeAgo(post.created_at)}</span>
      </div>
      <p className="post-body">{post.body}</p>
      <div className="post-actions">
        {meIsAdmin && (
          <button className="link-btn" onClick={togglePin}>
            {post.pinned ? "Unpin" : "Pin"}
          </button>
        )}
        {canDelete && (
          <button className="link-btn" onClick={deletePost}>
            Delete
          </button>
        )}
      </div>

      <div className="comments">
        {comments.map((c: any) => (
          <div className="comment" key={c.id}>
            <b>{c.profiles?.display_name ?? "Member"}</b>
            {c.profiles?.is_admin && <span className="badge">Coach</span>}
            <span> {c.body}</span>
            <span className="post-time">{timeAgo(c.created_at)}</span>
            {(meIsAdmin || c.author_id === meId) && (
              <button className="link-btn" onClick={() => deleteComment(c.id)}>
                x
              </button>
            )}
          </div>
        ))}
        <form className="comment-form" onSubmit={addComment}>
          <input
            placeholder="Reply..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn-ghost" disabled={busy || !comment.trim()}>
            Reply
          </button>
        </form>
      </div>
    </div>
  );
}

