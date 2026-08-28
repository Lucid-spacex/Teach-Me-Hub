"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiAuthedMutation } from "@/lib/api";
import type { ActionState } from "@/components/form";
import type { Enrollment, TutorProfile } from "@/lib/types";

export async function setVettingStatus(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const tutorId = String(formData.get("tutorId") ?? "");
  const vettingStatus = String(formData.get("vettingStatus") ?? "");
  try {
    await apiAuthedMutation<TutorProfile>(`/admin/tutors/${tutorId}/vetting`, {
      method: "PATCH",
      body: { vettingStatus },
    });
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "Could not update tutor.",
    };
  }

  revalidatePath("/admin");
  return { success: `Tutor ${vettingStatus.toLowerCase()}.` };
}

export async function assignTutor(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  try {
    await apiAuthedMutation<Enrollment>(
      `/admin/enrollments/${enrollmentId}/assign-tutor`,
      {
        method: "PATCH",
        body: { tutorId: String(formData.get("tutorId") ?? "") },
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "Could not assign tutor.",
    };
  }

  revalidatePath("/admin");
  return { success: "Tutor assigned." };
}
