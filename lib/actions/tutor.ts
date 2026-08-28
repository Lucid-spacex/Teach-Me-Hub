"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiAuthedMutation } from "@/lib/api";
import type { ActionState } from "@/components/form";
import type { ProgressReport, TutoringSession } from "@/lib/types";

export async function logSession(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("sessionId") ?? "");
  try {
    await apiAuthedMutation<TutoringSession>(`/sessions/${id}`, {
      method: "PATCH",
      body: {
        status: String(formData.get("status") ?? "COMPLETED"),
        tutorNotes: String(formData.get("tutorNotes") ?? ""),
        homeworkAssigned: String(formData.get("homeworkAssigned") ?? ""),
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "Could not update session.",
    };
  }

  revalidatePath("/tutor/sessions");
  return { success: "Session updated." };
}

export async function submitProgressReport(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiAuthedMutation<ProgressReport>("/progress-reports", {
      method: "POST",
      body: {
        enrollmentId: String(formData.get("enrollmentId") ?? ""),
        period: String(formData.get("period") ?? ""),
        summary: String(formData.get("summary") ?? ""),
        strengths: String(formData.get("strengths") ?? ""),
        areasToImprove: String(formData.get("areasToImprove") ?? ""),
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "Could not submit report.",
    };
  }

  revalidatePath("/tutor/reports");
  return { success: "Progress report submitted." };
}
