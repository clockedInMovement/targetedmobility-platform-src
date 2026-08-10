import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, video_embed_url, modules ( title )")
    .eq("id", params.id)
    .maybeSingle();

  if (!lesson) notFound();

  return (
    <>
      <Link className="back-link" href="/course">
        Back to course
      </Link>
      <h1 className="page-title">{lesson.title}</h1>
      {(lesson as any).modules?.title && (
        <p className="page-sub">{(lesson as any).modules.title}</p>
      )}

      {lesson.video_embed_url ? (
        <div className="video-frame">
          <iframe
            src={lesson.video_embed_url}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="muted">Video coming soon.</p>
        </div>
      )}

      {lesson.description && (
        <div className="card">
          <p style={{ whiteSpace: "pre-wrap" }}>{lesson.description}</p>
        </div>
      )}
    </>
  );
}
