import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiRequest } from "@/lib/api";
import { clearSession, getSession, setSession } from "@/lib/session";
import type { RefreshResponse } from "@/lib/types";

/** Renders can't write cookies, so expired access tokens are refreshed here. */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const session = await getSession();

  if (session?.refreshToken) {
    try {
      const tokens = await apiRequest<RefreshResponse>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: session.refreshToken },
      });
      await setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return NextResponse.redirect(new URL(next, request.url));
    } catch {
      // Fall through to a logged-out state.
    }
  }

  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
