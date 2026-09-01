"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import type { AppointmentDTO, DepartmentDTO, DoctorDTO } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { formatDateAr, formatTimeAr, todayCairo } from "@/lib/time";

const toAr = (v: number | string) =>
  String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const STATUSES = ["confirmed", "checked_in", "completed", "late", "no_show"];

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-mint text-teal-deep",
  checked_in: "bg-gold/25 text-teal-dark",
  completed: "bg-teal text-white",
  late: "bg-rose-soft/20 text-rose-soft",
  no_show: "bg-ink/10 text-ink/60",
};

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [depts, setDepts] = useState<DepartmentDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayCairo());
  const [deptId, setDeptId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadFilters = async () => {
    const [dep, doc] = await Promise.all([
      fetch("/api/admin/departments").then((r) => r.json()),
      fetch("/api/admin/doctors").then((r) => r.json()),
    ]);
    if (dep.ok) setDepts(dep.departments ?? []);
    if (doc.ok) setDoctors(doc.doctors ?? []);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (date) q.set("date", date);
    if (deptId) q.set("departmentId", deptId);
    if (doctorId) q.set("doctorId", doctorId);
    const res = await fetch(`/api/admin/appointments?${q}`);
    const data = await res.json();
    if (data.ok) setAppointments(data.appointments ?? []);
    setLoading(false);
  }, [date, deptId, doctorId]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: string) => {
    setBusyId(id);
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: status as AppointmentDTO["status"] } : a))
    );
    setBusyId(null);
  };

  const del = async (id: number) => {
    setBusyId(id);
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setBusyId(null);
    setDeleteId(null);
  };

  const filteredDoctors = deptId
    ? doctors.filter((d) => String(d.departmentId) === deptId)
    : doctors;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-teal-dark">
            إدارة الحجوزات
          </h2>
          <p className="mt-1 text-xs font-bold text-ink-soft">
            فلترة حسب اليوم والقسم والطبيب — تعديل الحالة أو إلغاء الحجز (الإلغاء يفتح الموعد للحجز من جديد)
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-teal/20 bg-white px-4 py-2.5 text-xs font-extrabold text-teal-deep transition hover:bg-mint"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* الفلاتر */}
      <div className="grid gap-3 rounded-3xl border border-teal/10 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div>
          <p className="mb-1.5 text-[11px] font-extrabold text-ink-soft">اليوم</p>
          <input
            type="date"
            className="field !py-2.5 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-extrabold text-ink-soft">القسم</p>
          <select
            className="field !py-2.5 text-sm"
            value={deptId}
            onChange={(e) => {
              setDeptId(e.target.value);
              setDoctorId("");
            }}
          >
            <option value="">كل الأقسام</option>
            {depts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-extrabold text-ink-soft">الطبيب</p>
          <select
            className="field !py-2.5 text-sm"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">كل الأطباء</option>
            {filteredDoctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setDate("");
              setDeptId("");
              setDoctorId("");
            }}
            className="w-full rounded-xl border-2 border-dashed border-teal/25 py-2.5 text-xs font-extrabold text-teal transition hover:bg-mint"
          >
            عرض كل الحجوزات
          </button>
        </div>
      </div>

      <p className="text-xs font-extrabold text-ink-soft">
        النتائج: {toAr(appointments.length)} حجز
      </p>

      {/* القائمة */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-teal/25 bg-white p-12 text-center font-bold text-ink-soft">
          لا توجد حجوزات مطابقة للفلاتر الحالية
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="relative overflow-hidden rounded-3xl border border-teal/10 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <span
                className="absolute inset-y-0 right-0 w-1.5"
                style={{ backgroundColor: a.departmentColor ?? "#0f6b5e" }}
              />
              <div className="flex flex-wrap items-center gap-4 pr-2">
                {/* الساعة والكشك */}
                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-dark text-center">
                  <div>
                    <p className="font-display text-lg font-black leading-none text-gold-light">
                      {formatTimeAr(a.time).split(" ")[0]}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-cream/70">
                      {formatTimeAr(a.time).split(" ")[1]} · كشك {toAr(a.queueNumber)}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-teal-dark">
                    <User size={14} className="text-teal" />
                    {a.patientName}
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-black text-teal-deep" dir="ltr">
                      {a.refCode}
                    </span>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold text-teal-dark">
                      {a.visitType === "new" ? "كشف" : "إعادة"}
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-ink-soft">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} className="text-teal" />
                      {formatDateAr(a.date)}
                    </span>
                    <span className="flex items-center gap-1" dir="ltr">
                      <Phone size={11} className="text-teal" /> {a.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-teal" /> {a.address} · {toAr(a.age)} سنة
                    </span>
                    <span className="font-extrabold text-teal-deep">
                      {a.doctorName} — {a.departmentName}
                    </span>
                  </div>
                </div>

                {/* الحالة والأزرار */}
                <div className="flex shrink-0 items-center gap-2">
                  {busyId === a.id ? (
                    <Loader2 size={18} className="animate-spin text-teal" />
                  ) : (
                    <>
                      <select
                        value={a.status}
                        onChange={(e) => setStatus(a.id, e.target.value)}
                        className={`rounded-xl border-0 px-3 py-2.5 text-xs font-extrabold outline-none transition cursor-pointer ${STATUS_STYLE[a.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      {deleteId === a.id ? (
                        <button
                          onClick={() => del(a.id)}
                          className="rounded-xl bg-rose-soft px-3 py-2.5 text-[11px] font-extrabold text-white"
                        >
                          تأكيد الإلغاء
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteId(a.id)}
                          onBlur={() => setDeleteId(null)}
                          className="grid size-10 place-items-center rounded-xl border border-rose-soft/25 bg-rose-soft/10 text-rose-soft transition hover:bg-rose-soft hover:text-white"
                          title="إلغاء الحجز"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
