"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, Plus, Stethoscope, Trash2, Users, X } from "lucide-react";
import type { DepartmentDTO } from "@/lib/types";
import { DepartmentIcon, ICON_OPTIONS } from "@/components/Icons";

const PALETTE = [
  "#0F6B5E",
  "#0FA3B1",
  "#3D7DF2",
  "#8A5CF6",
  "#E46BA8",
  "#B4436C",
  "#E8912D",
  "#5DA85D",
];

type FormState = { name: string; description: string; icon: string; color: string; password: string };
const EMPTY: FormState = { name: "", description: "", icon: "stethoscope", color: PALETTE[0], password: "" };

export default function DepartmentsView() {
  const [depts, setDepts] = useState<DepartmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DepartmentDTO | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteErr, setDeleteErr] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/departments");
    const data = await res.json();
    if (data.ok) setDepts(data.departments ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setFormErr("");
    if (form.name.trim().length < 3) {
      setFormErr("اكتب اسم القسم");
      return;
    }
    if (!editing && form.password.length < 8) {
      setFormErr("كلمة مرور القسم يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (editing && form.password.length > 0 && form.password.length < 8) {
      setFormErr("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setSaving(true);
    const res = await fetch(
      editing ? `/api/admin/departments/${editing.id}` : "/api/admin/departments",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormErr(data.message || "حدث خطأ");
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const del = async (id: number) => {
    setDeleteErr("");
    const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setDeleteErr(data.message || "تعذر الحذف");
      setDeleteId(null);
      return;
    }
    setDeleteId(null);
    load();
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
            الأقسام والعيادات
          </h2>
          <p className="mt-1 text-xs font-bold text-ink-soft">
            عدد الأطباء وإجمالي الحالات في كل قسم
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
            setFormErr("");
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-teal-dark shadow-lg shadow-gold/30 transition hover:-translate-y-0.5"
        >
          <Plus size={17} strokeWidth={2.5} />
          إضافة قسم
        </button>
      </div>

      {deleteErr && (
        <p className="rounded-2xl bg-rose-soft/10 px-5 py-3.5 text-sm font-bold text-rose-soft">
          {deleteErr}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {depts.map((d) => (
          <div
            key={d.id}
            className="group relative overflow-hidden rounded-3xl border border-teal/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className="absolute -top-8 -left-8 size-24 rounded-full opacity-10 blur-xl"
              style={{ backgroundColor: d.color }}
            />
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid size-13 place-items-center rounded-2xl p-3 text-white shadow-md"
                style={{ backgroundColor: d.color }}
              >
                <DepartmentIcon name={d.icon} size={24} />
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditing(d);
                    setForm({
                      name: d.name,
                      description: d.description,
                      password: "",
                      icon: d.icon,
                      color: d.color,
                    });
                    setFormErr("");
                    setShowForm(true);
                  }}
                  className="grid size-9 place-items-center rounded-lg border border-gold/40 bg-gold/10 text-teal-deep transition hover:bg-gold"
                >
                  <Pencil size={14} />
                </button>
                {deleteId === d.id ? (
                  <button
                    onClick={() => del(d.id)}
                    className="rounded-lg bg-rose-soft px-2.5 py-2 text-[10px] font-extrabold text-white"
                  >
                    تأكيد
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteId(d.id)}
                    onBlur={() => setDeleteId(null)}
                    className="grid size-9 place-items-center rounded-lg border border-rose-soft/25 bg-rose-soft/10 text-rose-soft transition hover:bg-rose-soft hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <h3 className="mt-3 font-display text-base font-extrabold text-teal-dark">
              {d.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-soft">
              {d.description}
            </p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[11px] font-extrabold text-teal-deep">
                <Stethoscope size={12} /> {d.doctorCount ?? 0} طبيب
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[11px] font-extrabold text-teal-deep">
                <Users size={12} /> {d.caseCount ?? 0} حالة
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* نموذج القسم */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto overscroll-contain bg-teal-dark/70 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-[2rem] bg-white p-7 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-xl font-black text-teal-dark">
                  {editing ? "تعديل القسم" : "إضافة قسم جديد"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="grid size-10 place-items-center rounded-xl bg-sand transition hover:bg-ink/10"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mb-2 text-xs font-extrabold text-teal-dark">اسم القسم *</p>
              <input
                className="field"
                placeholder="مثال: العيون"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <p className="mt-4 mb-2 text-xs font-extrabold text-teal-dark">الوصف</p>
              <textarea
                className="field min-h-20 resize-none"
                placeholder="وصف مختصر يظهر للمرضى…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <p className="mt-4 mb-2 text-xs font-extrabold text-teal-dark">كلمة مرور القسم *</p>
              <input
                className="field"
                type="password"
                dir="ltr"
                placeholder={editing ? "اتركها فارغة بدون تغيير" : "8 أحرف على الأقل"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="mt-1 text-[11px] font-bold text-ink-soft">تُحفظ مشفرة ولا تظهر في لوحة التحكم.</p>

              <p className="mt-4 mb-2 text-xs font-extrabold text-teal-dark">الأيقونة</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={`grid size-11 place-items-center rounded-xl border-2 transition ${
                      form.icon === ic
                        ? "border-teal bg-mint text-teal shadow"
                        : "border-transparent bg-sand text-ink/50 hover:text-teal"
                    }`}
                  >
                    <DepartmentIcon name={ic} size={20} />
                  </button>
                ))}
              </div>

              <p className="mt-4 mb-2 text-xs font-extrabold text-teal-dark">اللون</p>
              <div className="flex flex-wrap gap-2.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`size-9 rounded-full transition ${
                      form.color === c
                        ? "scale-125 shadow-lg ring-2 ring-teal-dark ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>

              {formErr && (
                <p className="mt-4 rounded-xl bg-rose-soft/10 px-4 py-3 text-sm font-bold text-rose-soft">
                  {formErr}
                </p>
              )}

              <button
                onClick={save}
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-deep px-6 py-4 text-base font-extrabold text-white shadow-xl transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? <Loader2 size={19} className="animate-spin" /> : editing ? "حفظ التعديلات" : "إضافة القسم"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
