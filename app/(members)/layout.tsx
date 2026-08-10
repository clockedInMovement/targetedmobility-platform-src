import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Membership check: RLS lets a user read only their own purchase row.
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .maybeSingle();

  if (!purchase) {
    return (
      <>
        <Nav isMember={false} />
        <div className="notice">
          <h1>Almost there - no purchase found for {user.email}</h1>
          <p>
            Your access is tied to the email you used at checkout. If you
            bought with a different email, sign out and sign back in with that
            one.
          </p>
          <p>
            Just purchased? Access can take a few minutes to sync. If it still
            does not appear, email{" "}
            <strong style={{ color: "var(--text)" }}>
              austin@targetedmobility.com
            </strong>{" "}
            and it will get fixed fast.
          </p>
          <p style={{ marginTop: 18 }}>
            <a className="btn" href="https://targetedmobility.com">
              Not a member yet? Claim a founding spot
            </a>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav isMember={true} />
      <main className="page">
        <div className="wrap">{children}</div>
      </main>
    </>
  );
}
