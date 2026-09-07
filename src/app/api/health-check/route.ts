import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

/**
 * Same-origin proxy for the Core API's /healthz, polled client-side by
 * ApiBootGate while the API is unreachable. /healthz has no CORS headers
 * (it's meant for infra/uptime checks, not browser JS), so a direct
 * cross-origin fetch from the browser would be blocked; this route exists
 * purely to relay that existing endpoint's result, not to add a new
 * capability.
 */
export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE_URL}/healthz`, {
      cache: "no-store",
      signal: controller.signal,
    });
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 503 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
