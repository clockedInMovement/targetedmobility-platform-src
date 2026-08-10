import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage() {
  const supabase = createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort, lessons ( id, title, description, sort )")
    .order("sort");

  const hasLessons = (modules ?? []).some(
    (m: any) => (m.lessons ?? []).length > 0
  );

  return (
    <>
      <h1 className="page-title">The Course</h1>
      <p className="page-sub">
        Protocols drop in the order the Founding 20 need them - new modules
        weekly until the full system is complete.
      </p>

      {!hasLessons && (
        <div className="card">
          <b>First protocols drop Monday, September 14.</b>
          <p className="muted" style={{ marginTop: 8 }}>
            Until then: head to the Community tab and tell me which joint is
            wrecking you - the build order comes from you.
          </p>
        </div>
      )}

      {(modules ?? []).map((m: any) =>
        (m.lessons ?? []).length === 0 ? null : (
          <div className="module" key={m.id}>
            <h2>{m.title}</h2>
            <div className="lesson-list">
              {[...m.lessons]
                .sort((a: any, b: any) => a.sort - b.sort)
                .map((l: any, i: number) => (
                  <Link className="lesson" href={`/course/${l.id}`} key={l.id}>
                    <span className="lesson-num">{i + 1}</span>
                    <span>
                      <b>{l.title}</b>
                      {l.description && <span>{l.description}</span>}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )
      )}
    </>
  );
}
