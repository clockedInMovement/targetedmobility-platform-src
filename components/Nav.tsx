"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Nav({ isMember }: { isMember: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          Targeted<span>Mobility</span>
        </div>
        {isMember && (
          <div className="tabs">
            <Link
              href="/course"
              className={`tab ${pathname.startsWith("/course") ? "active" : ""}`}
            >
              Course
            </Link>
            <Link
              href="/community"
              className={`tab ${pathname.startsWith("/community") ? "active" : ""}`}
            >
              Community
            </Link>
          </div>
        )}
        <button className="signout" onClick={signOut} style={{ marginLeft: "auto" }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
