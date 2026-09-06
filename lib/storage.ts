import type { Student } from "@/lib/types";

export const STUDENTS_STORAGE_KEY = "ezee_fee_attendance_students_v1";

export function loadStudents(): Student[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStudent);
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
}

function isStudent(value: unknown): value is Student {
  if (!value || typeof value !== "object") return false;
  const student = value as Record<string, unknown>;

  return (
    typeof student.id === "string" &&
    typeof student.name === "string" &&
    typeof student.parentName === "string" &&
    typeof student.parentPhone === "string" &&
    typeof student.studentPhone === "string" &&
    typeof student.className === "string" &&
    typeof student.monthlyFee === "number" &&
    typeof student.admissionDate === "string" &&
    (student.status === "active" || student.status === "inactive") &&
    typeof student.createdAt === "string" &&
    typeof student.updatedAt === "string"
  );
}
