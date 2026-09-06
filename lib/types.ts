export type StudentStatus = "active" | "inactive";

export type Student = {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  studentPhone: string;
  className: string;
  monthlyFee: number;
  admissionDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
};

export type StudentForm = Omit<Student, "id" | "createdAt" | "updatedAt">;
