const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.zenyukti.in";

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
 * Calls the Core API (api.zenyukti.in). Pass the Supabase access token for
 * authenticated requests, or `null` for the public invitation-accept flow.
 */
export async function apiFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
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
