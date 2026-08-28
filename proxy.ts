import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieNames } from "@/lib/cookies";
import type { Role } from "@/lib/types";

const ROLE_HOME: Record<Role, string> = {
  PARENT: "/parent",
  TUTOR: "/tutor",
  ADMIN: "/admin",
};

const PUBLIC_PATHS = ["/login", "/register", "/verify"];

function roleFromCookie(request: NextRequest): Role | null {
  const raw = request.cookies.get(cookieNames.user)?.value;
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { role?: Role }).role ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname + request.nextUrl.search);
  const forward = () => NextResponse.next({ request: { headers: requestHeaders } });

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const authenticated = Boolean(request.cookies.get(cookieNames.access)?.value);
  const role = roleFromCookie(request);

  if (isPublic) {
    if (authenticated && role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return forward();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const owner = (Object.entries(ROLE_HOME) as [Role, string][]).find(([, home]) =>
    pathname.startsWith(home),
  );
  if (owner && role && owner[0] !== role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return forward();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
