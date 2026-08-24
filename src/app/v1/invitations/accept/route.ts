import { NextResponse, type NextRequest } from "next/server";

/**
 * zenyukti-os's Service.acceptURL (internal/modules/invitations/service.go)
 * builds the emailed invitation link as `${APP_BASE_URL}/v1/invitations/accept?token=...`
 * — a path that only exists on the API, not this frontend. APP_BASE_URL is
 * meant to be this app's origin, so once it's pointed here, emailed links
 * land on this route instead of api.zenyukti.in directly. This can't be
 * fixed by changing APP_BASE_URL alone (the /v1 prefix is hardcoded
 * backend-side), so this route exists purely to catch that exact path and
 * forward to the real acceptance page.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const url = new URL("/invitations/accept", request.url);
  if (token) url.searchParams.set("token", token);
  return NextResponse.redirect(url);
}
