"use server";

import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearSession, dashboardPath, getSession, setSession } from "@/lib/session";
import type { ActionState } from "@/components/form";
import type { LoginResponse, RegisterResponse, Role } from "@/lib/types";

function message(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export async function login(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let role: Role;
  try {
    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    await setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    role = data.user.role;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      redirect(`/verify?email=${encodeURIComponent(email)}`);
    }
    return { error: message(error, "Could not log in.") };
  }

  redirect(dashboardPath(role));
}

export async function register(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const email = String(formData.get("email") ?? "");
  const body = {
    fullName: String(formData.get("fullName") ?? ""),
    email,
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "PARENT"),
  };

  try {
    await apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body,
    });
  } catch (error) {
    return { error: message(error, "Could not register.") };
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verify(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  try {
    await apiRequest("/auth/verify", {
      method: "POST",
      body: {
        email: String(formData.get("email") ?? ""),
        otp: String(formData.get("otp") ?? ""),
      },
    });
  } catch (error) {
    return { error: message(error, "Could not verify account.") };
  }

  redirect("/login?verified=1");
}

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session) {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        token: session.accessToken,
      });
    } catch {
      // The local session is cleared regardless of what the API says.
    }
  }
  await clearSession();
  redirect("/login");
}
