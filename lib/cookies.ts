export const cookieNames = {
  access: "tmh_access",
  refresh: "tmh_refresh",
  user: "tmh_user",
} as const;

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} as const;
