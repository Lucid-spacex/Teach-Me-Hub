"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiAuthedMutation } from "@/lib/api";
import type { ActionState } from "@/components/form";
import type { Enrollment, Student } from "@/lib/types";

function optional(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? undefined : value;
}

export async function addChild(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiAuthedMutation<Student>("/students", {
      method: "POST",
      body: {
        fullName: String(formData.get("fullName") ?? ""),
        dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
        gradeLevel: String(formData.get("gradeLevel") ?? ""),
        school: optional(formData, "school"),
        notes: optional(formData, "notes"),
      },
    });
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not add child.",
    };
  }

  revalidatePath("/parent");
  return { success: "Child added." };
}

export async function createEnrollment(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiAuthedMutation<Enrollment>("/enrollments", {
      method: "POST",
      body: {
        studentId: String(formData.get("studentId") ?? ""),
        subjectId: String(formData.get("subjectId") ?? ""),
        frequency: String(formData.get("frequency") ?? "WEEKLY"),
        startDate: String(formData.get("startDate") ?? ""),
        endDate: optional(formData, "endDate"),
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Could not create enrollment.",
    };
  }

  revalidatePath("/parent/enrollments");
  return { success: "Enrollment created." };
}
