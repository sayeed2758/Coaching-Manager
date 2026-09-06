"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  BookOpenCheck,
  Check,
  ChevronDown,
  Edit3,
  IndianRupee,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X
} from "lucide-react";
import type { Student, StudentForm } from "@/lib/types";
import { loadStudents, saveStudents } from "@/lib/storage";

const EMPTY_FORM: StudentForm = {
  name: "",
  parentName: "",
  parentPhone: "",
  studentPhone: "",
  className: "",
  monthlyFee: 0,
  admissionDate: new Date().toISOString().slice(0, 10),
  status: "active"
};

const SAMPLE_CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeStudent(form: StudentForm): StudentForm {
  return {
    ...form,
    name: form.name.trim(),
    parentName: form.parentName.trim(),
    parentPhone: digitsOnly(form.parentPhone).slice(-10),
    studentPhone: digitsOnly(form.studentPhone).slice(-10),
    className: form.className.trim(),
    monthlyFee: Number.isFinite(form.monthlyFee) ? Math.max(0, Math.round(form.monthlyFee)) : 0
  };
}

export default function StudentsApp() {
  const [students, setStudents] = useState<Student[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [sort, setSort] = useState<"name" | "recent">("name");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setStudents(loadStudents());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStudents(students);
  }, [hydrated, students]);

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className).filter(Boolean));
    SAMPLE_CLASSES.forEach((c) => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...students]
      .filter((student) => {
        const matchesQuery =
          !normalizedQuery ||
          student.name.toLowerCase().includes(normalizedQuery) ||
          student.parentName.toLowerCase().includes(normalizedQuery) ||
          student.className.toLowerCase().includes(normalizedQuery) ||
          student.parentPhone.includes(normalizedQuery);

        const matchesClass = classFilter === "all" || student.className === classFilter;
        const matchesStatus = statusFilter === "all" || student.status === statusFilter;

        return matchesQuery && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "recent") return b.updatedAt.localeCompare(a.updatedAt);
        return a.name.localeCompare(b.name);
      });
  }, [students, query, classFilter, statusFilter, sort]);

  const activeCount = students.filter((s) => s.status === "active").length;
  const totalFee = students
    .filter((s) => s.status === "active")
    .reduce((sum, student) => sum + student.monthlyFee, 0);

  const openAdd = () => {
    setEditingStudentId(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsSheetOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setForm({
      name: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      studentPhone: student.studentPhone,
      className: student.className,
      monthlyFee: student.monthlyFee,
      admissionDate: student.admissionDate,
      status: student.status
    });
    setError("");
    setIsSheetOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clean = normalizeStudent(form);

    if (clean.name.length < 2) {
      setError("Student name must be at least 2 characters.");
      return;
    }

    if (clean.parentName.length < 2) {
      setError("Parent name must be at least 2 characters.");
      return;
    }

    if (clean.parentPhone.length !== 10) {
      setError("Enter a valid 10-digit parent WhatsApp/phone number.");
      return;
    }

    if (!clean.className) {
      setError("Please enter the class or batch.");
      return;
    }

    if (clean.monthlyFee < 0) {
      setError("Monthly fee cannot be negative.");
      return;
    }

    const now = new Date().toISOString();

    if (editingStudentId) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudentId
            ? {
                ...student,
                ...clean,
                updatedAt: now
              }
            : student
        )
      );
    } else {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        ...clean,
        createdAt: now,
        updatedAt: now
      };
      setStudents((current) => [newStudent, ...current]);
    }

    setIsSheetOpen(false);
    setError("");
  };

  const deleteStudent = (id: string) => {
    setStudents((current) => current.filter((student) => student.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="app-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark"><BookOpenCheck size={21} /></div>
            <div>
              <div className="brand-name">EZEE</div>
              <div className="brand-subtitle">Fee & Attendance</div>
            </div>
          </div>

          <div className="header-actions">
            <div className="offline-pill">
              <ShieldCheck size={15} />
              Saved on this device
            </div>
            <button className="icon-button profile-button" aria-label="Teacher profile">
              <UserRound size={19} />
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> Phase 1 · Students</div>
              <h1>Student Management</h1>
              <p>Keep your student records clean today. Attendance and fees will connect to this data in later phases.</p>
            </div>
            <button className="primary-button desktop-add" onClick={openAdd}>
              <Plus size={18} /> Add Student
            </button>
          </section>

          <section className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon"><Users size={18} /></div>
              <div>
                <span>Total Students</span>
                <strong>{students.length}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Check size={18} /></div>
              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><BadgeIndianRupee size={18} /></div>
              <div>
                <span>Active Monthly Fees</span>
                <strong>{formatCurrency(totalFee)}</strong>
              </div>
            </div>
          </section>

          <section className="workspace-card">
            <div className="toolbar">
              <label className="search-box">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search student, parent, class..."
                  aria-label="Search students"
                />
                {query && (
                  <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </label>

              <div className="filter-row">
                <div className="select-wrap">
                  <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Filter by class">
                    <option value="all">All classes</option>
                    {classes.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </div>

                <div className="segmented">
                  {(["active", "inactive", "all"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={statusFilter === status ? "selected" : ""}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status[0].toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="select-wrap compact">
                  <select value={sort} onChange={(e) => setSort(e.target.value as "name" | "recent")} aria-label="Sort students">
                    <option value="name">A–Z</option>
                    <option value="recent">Recently updated</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>
            </div>

            <div className="list-meta">
              <span>{filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}</span>
              <span className="list-meta-note">Phase 1 data is stored locally in this browser.</span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={24} /></div>
                <h2>{students.length === 0 ? "No students added yet" : "No students match these filters"}</h2>
                <p>{students.length === 0 ? "Start with your first student. The record will be ready for attendance and fees in later phases." : "Try changing the search or filters."}</p>
                {students.length === 0 && <button className="primary-button" onClick={openAdd}><Plus size={18} /> Add First Student</button>}
              </div>
            ) : (
              <div className="student-list">
                {filteredStudents.map((student) => (
                  <article className="student-row" key={student.id}>
                    <div className="avatar">
                      {student.name.trim().slice(0, 1).toUpperCase() || "S"}
                    </div>

                    <div className="student-main">
                      <div className="student-title-row">
                        <h3>{student.name}</h3>
                        <span className={`status-badge ${student.status}`}>{student.status}</span>
                      </div>
                      <div className="student-details">
                        <span>{student.className}</span>
                        <span>Parent: {student.parentName}</span>
                        <span><Phone size={13} /> {student.parentPhone}</span>
                      </div>
                    </div>

                    <div className="student-fee">
                      <span>Monthly fee</span>
                      <strong>{formatCurrency(student.monthlyFee)}</strong>
                    </div>

                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => openEdit(student)}>
                        <Edit3 size={16} /> Edit
                      </button>
                      <button className="danger-icon" onClick={() => setConfirmDeleteId(student.id)} aria-label={`Delete ${student.name}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <button className="mobile-fab" onClick={openAdd} aria-label="Add student">
          <Plus size={22} />
        </button>

        {isSheetOpen && (
          <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.currentTarget === e.target && setIsSheetOpen(false)}>
            <div className="student-modal" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
              <div className="modal-header">
                <div>
                  <div className="eyebrow">Student Record</div>
                  <h2 id="student-modal-title">{editingStudentId ? "Edit Student" : "Add Student"}</h2>
                </div>
                <button className="icon-button" onClick={() => setIsSheetOpen(false)} aria-label="Close">
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <div className="form-section-title">Student details</div>
                  <div className="form-grid">
                    <label>
                      <span>Student name *</span>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Rahul Kumar"
                        autoFocus
                      />
                    </label>
                    <label>
                      <span>Class / Batch *</span>
                      <input
                        value={form.className}
                        onChange={(e) => setForm({ ...form, className: e.target.value })}
                        placeholder="e.g. Class 10 · Batch A"
                      />
                    </label>
                    <label>
                      <span>Student phone</span>
                      <input
                        value={form.studentPhone}
                        onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </label>
                    <label>
                      <span>Admission date</span>
                      <input
                        type="date"
                        value={form.admissionDate}
                        onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Parent & fee details</div>
                  <div className="form-grid">
                    <label>
                      <span>Parent name *</span>
                      <input
                        value={form.parentName}
                        onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                        placeholder="e.g. Mr. Raj Kumar"
                      />
                    </label>
                    <label>
                      <span>Parent WhatsApp / phone *</span>
                      <input
                        value={form.parentPhone}
                        onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </label>
                    <label>
                      <span>Monthly fee *</span>
                      <div className="money-input">
                        <IndianRupee size={16} />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.monthlyFee || ""}
                          onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })}
                          placeholder="1000"
                        />
                      </div>
                    </label>
                    <label>
                      <span>Status</span>
                      <div className="status-toggle">
                        <button type="button" className={form.status === "active" ? "active" : ""} onClick={() => setForm({ ...form, status: "active" })}>Active</button>
                        <button type="button" className={form.status === "inactive" ? "active" : ""} onClick={() => setForm({ ...form, status: "inactive" })}>Inactive</button>
                      </div>
                    </label>
                  </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="modal-footer">
                  <button type="button" className="secondary-button large" onClick={() => setIsSheetOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-button large">{editingStudentId ? "Save Changes" : "Add Student"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="confirm-backdrop">
            <div className="confirm-card" role="dialog" aria-modal="true" aria-label="Confirm delete">
              <div className="danger-circle"><Trash2 size={20} /></div>
              <h2>Delete student?</h2>
              <p>This permanently removes the student from this browser. Attendance and fee data for this student does not exist yet in Phase 1.</p>
              <div className="confirm-actions">
                <button className="secondary-button large" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                <button className="danger-button large" onClick={() => deleteStudent(confirmDeleteId)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
