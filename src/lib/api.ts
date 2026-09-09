export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.zenyukti.in";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Statuses a gateway/proxy in front of the Core API returns on its own —
 * before the request ever reaches zenyukti-os — while the Render free-tier
 * instance is cold-starting from sleep. fetch() resolves normally for
 * these (they're real HTTP responses, not network failures), so without
 * this check they'd fall through to the generic ApiError path below and
 * never trigger ApiBootGate's recovery UI, even though "the API is
 * unreachable right now" is exactly what's happening.
 */
const GATEWAY_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Thrown when the Core API can't be reached at all — connection failure,
 * DNS error, or timeout — as opposed to `ApiError`, which means the API
 * responded but with a non-2xx status. Callers use this distinction to
 * treat a genuinely unreachable API (e.g. a cold start) differently from
 * ordinary HTTP errors like 401/403/500.
 */
export class ApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("The ZenYukti API is unreachable");
    this.name = "ApiUnavailableError";
    this.cause = cause;
  }
}

/**
 * Calls the Core API (api.zenyukti.in). Pass the Supabase access token for
 * authenticated requests, or `null` for the public invitation-accept flow.
 */
export async function apiFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiUnavailableError(err);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    if (GATEWAY_UNAVAILABLE_STATUSES.has(res.status)) {
      throw new ApiUnavailableError(res.statusText || res.status);
    }

    let message = res.statusText || "Request failed";
    let detail: string | undefined;
    try {
      const body = await res.json();
      message = body.title ?? message;
      detail = body.detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, message, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
