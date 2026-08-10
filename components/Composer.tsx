"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Composer() {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function post() {
    if (!body.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("posts")
        .insert({ body: body.trim(), author_id: user.id });
      setBody("");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="card composer">
      <textarea
        placeholder="What is on your mind? A question, a win, a joint giving you trouble..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button className="btn" onClick={post} disabled={busy || !body.trim()}>
        {busy ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
