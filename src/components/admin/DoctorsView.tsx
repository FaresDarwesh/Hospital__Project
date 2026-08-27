"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { DepartmentDTO, DoctorDTO } from "@/lib/types";
import { SHORT_AR_DAYS, AR_DAYS, formatTimeAr } from "@/lib/time";
import { DepartmentIcon } from "@/components/Icons";

const AVATARS = [
  "/images/dr-1.jpg",
  "/images/dr-2.jpg",
  "/images/dr-3.jpg",
  "/images/dr-4.jpg",
  "/images/dr-5.jpg",
  "/images/dr-6.jpg",
  "/images/dr-7.jpg",
  "/images/dr-8.jpg",
];
const TITLES = ["استشاري", "أخصائي", "أستاذ", "مدرس"];
const SLOT_OPTIONS = [10, 15, 20, 30];

type SchedEdit = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

type FormState = {
  name: string;
  title: string;
  departmentId: string;
  code: string;
  bio: string;
  image: string;
  active: boolean;
  schedules: SchedEdit[];
};

const EMPTY_FORM: FormState = {
  name: "",
  title: "أخصائي",
  departmentId: "",
  code: "",
  bio: "",
  image: AVATARS[0],
  active: true,
  schedules: [{ dayOfWeek: 0, startTime: "17:00", endTime: "21:00", slotMinutes: 15 }],
};

export default function DoctorsView() {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [depts, setDepts] = useState<DepartmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DoctorDTO | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const [dRes, depRes] = await Promise.all([
      fetch("/api/admin/doctors").then((r) => r.json()),
      fetch("/api/admin/departments").then((r) => r.json()),
    ]);
    if (dRes.ok) setDoctors(dRes.doctors ?? []);
    if (depRes.ok) setDepts(depRes.departments ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, departmentId: depts[0] ? String(depts[0].id) : "" });
    setFormErr("");
    setShowForm(true);
  };

  const openEdit = (d: DoctorDTO) => {
    setEditing(d);
    setForm({
      name: d.name,
      title: d.title,
      departmentId: String(d.departmentId),
      code: d.code,
      bio: d.bio,
      image: d.image || AVATARS[0],
      active: d.active,
      schedules: d.schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotMinutes: s.slotMinutes,
      })),
    });
    setFormErr("");
    setShowForm(true);
  };

  const save = async () => {
    setFormErr("");
    if (form.name.trim().length < 5) {
      setFormErr("اكتب اسم الطبيب بالكامل");
      return;
    }
    if (!form.departmentId) {
      setFormErr("اختر القسم");
      return;
    }
    if (form.schedules.length === 0) {
      setFormErr("أضِف يوم عمل واحدًا على الأقل");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      title: form.title,
      departmentId: Number(form.departmentId),
      code: form.code.trim(),
      bio: form.bio.trim(),
      image: form.image,
      active: form.active,
      schedules: form.schedules,
    };
    const res = await fetch(
      editing ? `/api/admin/doctors/${editing.id}` : "/api/admin/doctors",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormErr(data.message || "حدث خطأ أثناء الحفظ");
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const toggleActive = async (d: DoctorDTO) => {
    setDoctors((prev) =>
      prev.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x))
    );
    await fetch(`/api/admin/doctors/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    });
  };

  const del = async (id: number) => {
    setDeleting(true);
    await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);
    load();
  };

  const copyCode = async (id: number, code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard is optional in restricted preview iframes.
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="animate-spin text-teal" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-teal-dark">
            إدارة الأطباء
          </h2>
          <p className="mt-1 text-xs font-bold text-ink-soft">
            الكود الظاهر بجانب كل طبيب هو كود دخول مساعده لبوابة الطاقم الطبي
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-teal-dark shadow-lg shadow-gold/30 transition hover:-translate-y-0.5"
        >
          <Plus size={17} strokeWidth={2.5} />
          إضافة طبيب
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((d) => (
          <div
            key={d.id}
            className={`relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition ${
              d.active ? "border-teal/10" : "border-ink/10 opacity-70"
            }`}
          >
            <div className="flex items-start gap-4">
              <Image
                src={d.image || "/images/dr-1.jpg"}
                alt={d.name}
                width={72}
                height={72}
                className="size-[72px] rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-display text-base font-extrabold text-teal-dark">
                  {d.name}
                  {!d.active && (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-extrabold text-ink/50">
                      موقوف مؤقتًا
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs font-bold text-gold">{d.title}</p>
                <span
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                  style={{ backgroundColor: d.departmentColor }}
                >
                  <DepartmentIcon name={d.departmentIcon ?? "activity"} size={12} />
                  {d.departmentName}
                </span>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {d.schedules.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-teal-deep"
                    >
                      {SHORT_AR_DAYS[s.dayOfWeek]} {formatTimeAr(s.startTime)}–{formatTimeAr(s.endTime)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* الكود + الأزرار */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-teal/15 pt-4">
              <button
                onClick={() => copyCode(d.id, d.code)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-dark px-3.5 py-2 font-mono text-sm font-black tracking-widest text-gold-light transition hover:bg-teal-deep"
                title="نسخ الكود — أعطه لمساعد الطبيب"
                dir="ltr"
              >
                {copiedId === d.id ? <Check size={14} /> : <Copy size={14} />}
                {d.code}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(d)}
                  className={`grid size-10 place-items-center rounded-xl border transition ${
                    d.active
                      ? "border-teal/25 bg-mint text-teal hover:bg-teal hover:text-white"
                      : "border-ink/15 bg-sand text-ink/40 hover:bg-teal hover:text-white"
                  }`}
                  title={d.active ? "إيقاف الحجز مؤقتًا" : "إعادة التفعيل"}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={() => openEdit(d)}
                  className="grid size-10 place-items-center rounded-xl border border-gold/40 bg-gold/10 text-teal-deep transition hover:bg-gold"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                {deleteId === d.id ? (
                  <button
                    onClick={() => del(d.id)}
                    disabled={deleting}
                    className="rounded-xl bg-rose-soft px-3 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    {deleting ? "…" : "تأكيد الحذف"}
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteId(d.id)}
                    onBlur={() => setDeleteId(null)}
                    className="grid size-10 place-items-center rounded-xl border border-rose-soft/25 bg-rose-soft/10 text-rose-soft transition hover:bg-rose-soft hover:text-white"
                    title="حذف الطبيب"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <p className="rounded-3xl border border-dashed border-teal/25 bg-white p-12 text-center font-bold text-ink-soft">
          لا يوجد أطباء بعد — أضِف أول طبيب
        </p>
      )}

      {/* ═══ نموذج إضافة/تعديل طبيب ═══ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-teal-dark/70 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-xl font-black text-teal-dark">
                  {editing ? `تعديل بيانات ${editing.name}` : "إضافة طبيب جديد"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="grid size-10 place-items-center rounded-xl bg-sand text-ink transition hover:bg-ink/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>اسم الطبيب *</Label>
                  <input
                    className="field"
                    placeholder="د. …"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الدرجة العلمية</Label>
                  <select
                    className="field"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  >
                    {TITLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>القسم *</Label>
                  <select
                    className="field"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">— اختر —</option>
                    {depts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>كود الدخول (اتركه فارغًا للتوليد التلقائي)</Label>
                  <input
                    className="field text-left font-mono font-bold"
                    dir="ltr"
                    placeholder="BN-109"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* صورة الطبيب */}
              <div className="mt-5">
                <Label>صورة الطبيب المعروضة بالموقع</Label>
                <div className="flex flex-wrap gap-2.5">
                  {AVATARS.map((img) => (
                    <button
                      key={img}
                      onClick={() => setForm({ ...form, image: img })}
                      className={`relative size-14 overflow-hidden rounded-xl border-2 transition ${
                        form.image === img
                          ? "border-teal shadow-lg ring-2 ring-teal/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, image: "" })}
                      className={`grid size-14 place-items-center rounded-xl border-2 transition ${
                        form.image === ""
                          ? "border-teal bg-mint shadow-lg ring-2 ring-teal/30"
                          : "border-transparent bg-sand opacity-70 hover:opacity-100"
                      }`}
                    title="بدون صورة"
                  >
                    <UserRound size={20} className="text-ink/40" />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <Label>نبذة مختصرة</Label>
                <textarea
                  className="field min-h-20 resize-none"
                  placeholder="خبرات الطبيب وتخصصاته الدقيقة…"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              {/* جدول المواعيد */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <Label>جدول المواعيد الأسبوعي *</Label>
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        schedules: [
                          ...form.schedules,
                          { dayOfWeek: 0, startTime: "17:00", endTime: "21:00", slotMinutes: 15 },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-xs font-extrabold text-teal-deep transition hover:bg-teal hover:text-white"
                  >
                    <Plus size={13} strokeWidth={3} /> إضافة يوم
                  </button>
                </div>
                <div className="space-y-2.5">
                  {form.schedules.map((s, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-2xl bg-sand/60 p-3"
                    >
                      <select
                        className="field !w-auto !py-2 text-sm"
                        value={s.dayOfWeek}
                        onChange={(e) =>
                          updateSched(form, setForm, i, { dayOfWeek: Number(e.target.value) })
                        }
                      >
                        {AR_DAYS.map((d, idx) => (
                          <option key={idx} value={idx}>{d}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                        من
                        <input
                          type="time"
                          className="field !w-auto !py-2"
                          dir="ltr"
                          value={s.startTime}
                          onChange={(e) =>
                            updateSched(form, setForm, i, { startTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                        إلى
                        <input
                          type="time"
                          className="field !w-auto !py-2"
                          dir="ltr"
                          value={s.endTime}
                          onChange={(e) =>
                            updateSched(form, setForm, i, { endTime: e.target.value })
                          }
                        />
                      </div>
                      <select
                        className="field !w-auto !py-2 text-sm"
                        value={s.slotMinutes}
                        onChange={(e) =>
                          updateSched(form, setForm, i, { slotMinutes: Number(e.target.value) })
                        }
                      >
                        {SLOT_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m} دقيقة للحالة</option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          setForm({ ...form, schedules: form.schedules.filter((_, x) => x !== i) })
                        }
                        className="grid size-9 place-items-center rounded-lg bg-rose-soft/10 text-rose-soft transition hover:bg-rose-soft hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {form.schedules.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-teal/25 p-4 text-center text-xs font-bold text-ink-soft">
                      لا يوجد أيام عمل — أضِف يومًا على الأقل
                    </p>
                  )}
                </div>
              </div>

              {formErr && (
                <p className="mt-5 rounded-xl bg-rose-soft/10 px-4 py-3 text-sm font-bold text-rose-soft">
                  {formErr}
                </p>
              )}

              <button
                onClick={save}
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-deep px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-teal-deep/25 transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : editing ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة الطبيب"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function updateSched(
  form: FormState,
  setForm: (f: FormState) => void,
  i: number,
  patch: Partial<SchedEdit>
) {
  setForm({
    ...form,
    schedules: form.schedules.map((s, x) => (x === i ? { ...s, ...patch } : s)),
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-extrabold text-teal-dark">{children}</p>;
}
