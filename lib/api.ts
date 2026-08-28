import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearSession, getSession, setSession } from "./session";
import type { RefreshResponse } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://smart-tutor-9rjd.onrender.com";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** The endpoint isn't implemented on the backend yet. */
  get isMissingEndpoint(): boolean {
    return this.status === 404 || this.status === 501;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.replace(/^\/?/, "/"), API_BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as {
      error?: string;
      message?: string;
      details?: { field?: string; message?: string }[];
    };
    const details = parsed.details
      ?.map((d) => [d.field, d.message].filter(Boolean).join(": "))
      .join(", ");
    return (
      [parsed.message ?? parsed.error, details].filter(Boolean).join(" — ") ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, query } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function refreshTokens(refreshToken: string): Promise<string> {
  const tokens = await apiRequest<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
  await setSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
  return tokens.accessToken;
}

/**
 * Authenticated request from a Server Action or Route Handler. Refreshes the
 * access token once on 401 and retries.
 */
export async function apiAuthedMutation<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    return await apiRequest<T>(path, { ...options, token: session.accessToken });
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 401 ||
      !session.refreshToken
    ) {
      throw error;
    }
    let accessToken: string;
    try {
      accessToken = await refreshTokens(session.refreshToken);
    } catch {
      await clearSession();
      redirect("/login");
    }
    return apiRequest<T>(path, { ...options, token: accessToken });
  }
}

/**
 * Same as `apiAuthedQuery`, but returns null when the backend rejects the
 * request, so pages can degrade to a "not available yet" message.
 */
export async function apiAuthedQueryOptional<T>(
  path: string,
  query?: RequestOptions["query"],
): Promise<T | null> {
  try {
    return await apiAuthedQuery<T>(path, query);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

/**
 * Authenticated read during render. Cookies cannot be written while rendering,
 * so an expired token bounces through the refresh route handler instead.
 */
export async function apiAuthedQuery<T>(
  path: string,
  query?: RequestOptions["query"],
): Promise<T> {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    return await apiRequest<T>(path, { token: session.accessToken, query });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const headerList = await headers();
      const next = headerList.get("x-pathname") ?? "/";
      redirect(`/session/refresh?next=${encodeURIComponent(next)}`);
    }
    throw error;
  }
}
