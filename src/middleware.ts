import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16's proxy.ts convention is hard-locked to the nodejs runtime
// (cannot be configured otherwise — see the version-16 upgrade guide's
// "middleware to proxy" section), which @opennextjs/cloudflare does not
// yet support. Using the deprecated-but-still-supported middleware.ts
// convention instead keeps this on the edge runtime, which Cloudflare
// Workers/OpenNext do support — same behavior, same matcher, only the
// file and export names differ.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
