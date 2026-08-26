"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Search,
  Stethoscope,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react";
import type { AppointmentDTO } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { formatDateAr, formatTimeAr, todayCairo } from "@/lib/time";

const toAr = (v: number | string) =>
  String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-mint text-teal-deep",
  checked_in: "bg-gold/20 text-teal-dark",
  completed: "bg-teal text-white",
  no_show: "bg-ink/10 text-ink/60",
};

export default function TrackForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<AppointmentDTO[] | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const search = async () => {
    setError("");
    if (!/^01\d{9}$/.test(phone.trim())) {
      setError("اكتب رقم الموبايل المكوّن من 11 رقمًا ويبدأ بـ 01");
      return;
    }
    setLoading(true);
    try {
      const q = new URLSearchParams({ phone: phone.trim() });
      if (code.trim()) q.set("code", code.trim());
      const res = await fetch(`/api/appointments?${q}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "حدث خطأ");
        setResults(null);
      } else {
        setResults(data.appointments ?? []);
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    }
    setLoading(false);
  };

  const cancel = async (a: AppointmentDTO) => {
    setActionId(a.id);
    try {
      const res = await fetch(`/api/appointments/${a.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: a.refCode }),
      });
      if (res.ok) {
        setResults((prev) => prev?.filter((x) => x.id !== a.id) ?? []);
      }
    } finally {
      setActionId(null);
      setConfirmId(null);
    }
  };

  return (
    <div>
      {/* نموذج الاستعلام */}
      <div className="rounded-3xl border border-teal/10 bg-white p-6 shadow-xl shadow-teal-deep/5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Phone size={17} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal/50" />
            <input
              className="field pr-11 text-left"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              placeholder="رقم الموبايل 01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="relative">
            <ClipboardList size={17} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal/50" />
            <input
              className="field pr-11 text-left"
              dir="ltr"
              placeholder="كود الحجز (اختياري) BN-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={9}
            />
          </div>
          <button
            onClick={search}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-deep px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-teal-deep/25 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
            استعلام
          </button>
        </div>
        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-soft/10 px-4 py-3 text-sm font-bold text-rose-soft">
            <TriangleAlert size={16} /> {error}
          </p>
        )}
      </div>

      {/* النتائج */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            {results.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-teal/25 bg-white p-10 text-center font-bold text-ink-soft">
                لا توجد حجوزات مسجلة بهذا الرقم
              </div>
            ) : (
              results.map((a) => {
                const past = a.date < todayCairo();
                const cancellable = a.status === "confirmed";
                return (
                  <motion.div
                    key={a.id}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative overflow-hidden rounded-3xl border bg-white p-5 shadow-lg shadow-teal-deep/5 ${
                      past ? "border-ink/10 opacity-70" : "border-teal/15"
                    }`}
                  >
                    <span
                      className="absolute inset-y-0 right-0 w-1.5"
                      style={{ backgroundColor: a.departmentColor ?? "#0f6b5e" }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-sand px-3 py-1 font-mono text-xs font-black tracking-widest text-teal-dark" dir="ltr">
                            {a.refCode}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${STATUS_STYLE[a.status]}`}>
                            {STATUS_LABELS[a.status]}
                          </span>
                          {past && (
                            <span className="rounded-full bg-ink/10 px-3 py-1 text-[11px] font-extrabold text-ink/50">
                              موعد منقضٍ
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-2 font-display text-lg font-extrabold text-teal-dark">
                          <Stethoscope size={17} className="text-teal" />
                          {a.doctorName}
                          <span className="text-xs font-bold text-ink-soft">
                            — {a.departmentName}
                          </span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-bold text-ink-soft">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-teal" />
                            {formatDateAr(a.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-teal" />
                            {formatTimeAr(a.time)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User size={14} className="text-teal" />
                            رقم الكشك: {toAr(a.queueNumber)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-teal" />
                            {a.visitType === "new" ? "كشف جديد" : "إعادة"}
                          </span>
                        </div>
                      </div>

                      {cancellable && (
                        <div>
                          {confirmId === a.id ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-rose-soft/10 p-2">
                              <button
                                onClick={() => cancel(a)}
                                disabled={actionId === a.id}
                                className="rounded-xl bg-rose-soft px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
                              >
                                {actionId === a.id ? "جارٍ الإلغاء…" : "تأكيد الإلغاء"}
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-extrabold text-ink"
                              >
                                تراجع
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmId(a.id)}
                              className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-soft/30 px-5 py-2.5 text-xs font-extrabold text-rose-soft transition hover:bg-rose-soft hover:text-white"
                            >
                              <Trash2 size={14} />
                              إلغاء الحجز
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
