import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Current Supabase session (server-side), or null if signed out. */
export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/** Session + access token, redirecting to /login if signed out. */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
