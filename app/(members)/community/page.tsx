import { createClient } from "@/lib/supabase/server";
import { Composer } from "@/components/Composer";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: posts }, { data: me }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `id, title, body, pinned, created_at, author_id,
         profiles ( display_name, is_admin ),
         comments ( id, body, created_at, author_id, profiles ( display_name, is_admin ) )`
      )
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, display_name, is_admin")
      .eq("id", user!.id)
      .maybeSingle(),
  ]);

  return (
    <>
      <h1 className="page-title">The Community</h1>
      <p className="page-sub">
        Ask anything - questions get answered daily. Tell me what is
        wrecking you and it shapes what gets built next.
      </p>
      <Composer />
      {(posts ?? []).map((p: any) => (
        <PostCard
          key={p.id}
          post={p}
          meId={me?.id ?? ""}
          meIsAdmin={me?.is_admin ?? false}
        />
      ))}
      {(posts ?? []).length === 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <p className="muted">
            No posts yet - be the first. What joint should the course fix
            first?
          </p>
        </div>
      )}
    </>
  );
}
