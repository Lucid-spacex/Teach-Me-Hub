import { cookies } from "next/headers";
import { cookieNames, cookieOptions } from "./cookies";
import type { Role, User } from "./types";

const { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE, user: USER_COOKIE } =
  cookieNames;

export interface Session {
  accessToken: string;
  refreshToken: string | null;
  user: User;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const rawUser = store.get(USER_COOKIE)?.value;
  if (!accessToken || !rawUser) return null;
  try {
    return {
      accessToken,
      refreshToken: store.get(REFRESH_COOKIE)?.value ?? null,
      user: JSON.parse(rawUser) as User,
    };
  } catch {
    return null;
  }
}

/** Only callable from Server Actions and Route Handlers. */
export async function setSession(session: {
  accessToken: string;
  refreshToken?: string | null;
  user?: User;
}): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.accessToken, cookieOptions);
  if (session.refreshToken) {
    store.set(REFRESH_COOKIE, session.refreshToken, cookieOptions);
  }
  if (session.user) {
    store.set(USER_COOKIE, JSON.stringify(session.user), cookieOptions);
  }
}

/** Only callable from Server Actions and Route Handlers. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE]) {
    store.delete(name);
  }
}

export function dashboardPath(role: Role): string {
  switch (role) {
    case "PARENT":
      return "/parent";
    case "TUTOR":
      return "/tutor";
    case "ADMIN":
      return "/admin";
  }
}
