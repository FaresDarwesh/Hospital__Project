"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  DoorOpen,
  KeyRound,
  Loader2,
  LogOut,
  Phone,
  RefreshCw,
  Undo2,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import type { AppointmentDTO } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import {
  SHORT_AR_DAYS,
  addDaysStr,
  dayOfWeekOf,
  formatDateAr,
  formatTimeAr,
  todayCairo,
} from "@/lib/time";

const toAr = (v: number | string) =>
  String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

type Doctor = {
  id: number;
  name: string;
  title: string;
  departmentName: string;
  departmentColor: string;
  image: string;
  code: string;
};

type Summary = {
  total: number;
  waiting: number;
  inside: number;
  done: number;
  absent: number;
};

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-mint text-teal-deep",
  checked_in: "bg-gold text-teal-dark",
  completed: "bg-teal text-white",
  no_show: "bg-white/10 text-cream/60 border border-white/15",
};

export default function AssistantPortal() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [booting, setBooting] = useState(true);
  const [code, setCode] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [date, setDate] = useState(todayCairo());
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0, waiting: 0, inside: 0, done: 0, absent: 0,
  });
  const [loadingList, setLoadingList] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const days = useMemo(() => {
    const t = todayCairo();
    return Array.from({ length: 7 }, (_, i) => addDaysStr(t, i));
  }, []);

  const loadAppointments = useCallback(
    async (d: string, quiet = false) => {
      if (!quiet) setLoadingList(true);
      try {
        const res = await fetch(`/api/assistant/appointments?date=${d}`);
        const data = await res.json();
        if (data.ok) {
          setAppointments(data.appointments ?? []);
          setSummary(data.summary);
        }
      } finally {
        setLoadingList(false);
      }
    },
    []
  );

  // التحقق من الجلسة عند الفتح
  useEffect(() => {
    fetch("/api/assistant/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authed) setDoctor(data.doctor);
        setBooting(false);
      });
  }, []);

  // تحميل الحجوزات عند تغيير التاريخ + تحديث تلقائي
  useEffect(() => {
    if (!doctor) return;
    loadAppointments(date);
    const iv = setInterval(() => loadAppointments(date, true), 30000);
    return () => clearInterval(iv);
  }, [doctor, date, loadAppointments]);

  const login = async () => {
    setLoginErr("");
    setLoggingIn(true);
    const res = await fetch("/api/assistant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setDoctor(data.doctor);
    } else {
      setLoginErr(data.message || "الكود غير صحيح");
    }
    setLoggingIn(false);
  };

  const logout = async () => {
    await fetch("/api/assistant/logout", { method: "POST" });
    setDoctor(null);
    setCode("");
    setAppointments([]);
  };

  const setStatus = async (id: number, status: string) => {
    setBusyId(id);
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadAppointments(date, true);
    setBusyId(null);
  };

  const current = appointments.find((a) => a.status === "checked_in");
  const nextUp = appointments.find((a) => a.status === "confirmed");

  if (booting) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  // ───────── شاشة الدخول ─────────
  if (!doctor) {
    return (
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div className="absolute -top-20 right-1/2 h-36 w-72 translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative text-center">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-3xl bg-gold text-teal-dark shadow-xl shadow-gold/30">
              <KeyRound size={28} strokeWidth={1.8} />
            </span>
            <h1 className="font-display text-2xl font-black text-white">
              بوابة الطاقم الطبي
            </h1>
            <p className="mt-2 text-sm leading-7 text-cream/60">
              أدخل كود الطبيب (مثل: BN-101) لمتابعة حجوزاته وقائمة الانتظار —
              الكود موجود لدى إدارة المستشفى.
            </p>

            <div className="relative mt-6">
              <input
                className="w-full rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-4 text-center font-mono text-xl font-black tracking-[0.3em] text-gold-light outline-none transition placeholder:text-cream/30 focus:border-gold"
                dir="ltr"
                placeholder="BN-000"
                maxLength={9}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
            {loginErr && (
              <p className="mt-3 rounded-xl bg-rose-soft/20 px-4 py-2.5 text-sm font-bold text-rose-200">
                {loginErr}
              </p>
            )}
            <button
              onClick={login}
              disabled={loggingIn || code.trim().length < 4}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-base font-extrabold text-teal-dark shadow-xl shadow-gold/25 transition hover:-translate-y-0.5 disabled:opacity-40"
            >
              {loggingIn ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <>
                  دخول
                  <ArrowRight size={18} className="rotate-180" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────── لوحة المتابعة ─────────
  return (
    <div>
      {/* بيانات الطبيب */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <Image
            src={doctor.image || "/images/dr-1.jpg"}
            alt={doctor.name}
            width={64}
            height={64}
            className="size-16 rounded-2xl border-2 border-gold/60 object-cover"
          />
          <div>
            <h1 className="font-display text-xl font-black text-white">
              {doctor.name}
            </h1>
            <p className="text-xs font-bold text-gold-light">
              {doctor.title} — {doctor.departmentName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadAppointments(date)}
            className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-cream transition hover:bg-white/15"
            aria-label="تحديث"
          >
            <RefreshCw size={17} className={loadingList ? "animate-spin" : ""} />
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-xs font-extrabold text-rose-200 transition hover:bg-rose-500/25"
          >
            <LogOut size={15} />
            خروج
          </button>
        </div>
      </motion.div>

      {/* أيام الأسبوع */}
      <div className="no-scrollbar mb-6 flex gap-2.5 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setDate(d)}
            className={`flex w-[78px] shrink-0 flex-col items-center rounded-2xl border-2 py-3 transition ${
              date === d
                ? "border-gold bg-gold text-teal-dark shadow-lg shadow-gold/25"
                : "border-white/10 bg-white/5 text-cream/70 hover:bg-white/10"
            }`}
          >
            <span className="text-[11px] font-bold">{SHORT_AR_DAYS[dayOfWeekOf(d)]}</span>
            <span className="mt-1 font-display text-lg font-black">{toAr(d.slice(8))}</span>
          </button>
        ))}
      </div>

      {/* الحالة الحالية + الإحصائيات */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-bl from-gold/20 to-transparent p-5 backdrop-blur">
            <p className="mb-1 flex items-center gap-2 text-xs font-extrabold text-gold-light">
              <DoorOpen size={15} /> بالداخل الآن
            </p>
            {current ? (
              <p className="font-display text-lg font-black text-white">
                {current.patientName}
                <span className="mr-2 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-black text-teal-dark">
                  رقم {toAr(current.queueNumber)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-bold text-cream/50">لا أحد بالداخل حاليًا</p>
            )}
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
            <p className="mb-1 flex items-center gap-2 text-xs font-extrabold text-teal-soft">
              <BellRing size={15} /> التالي في الانتظار
            </p>
            {nextUp ? (
              <p className="font-display text-lg font-black text-white">
                {nextUp.patientName}
                <span className="mr-2 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-black text-gold-light">
                  رقم {toAr(nextUp.queueNumber)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-bold text-cream/50">لا يوجد منتظرون</p>
            )}
          </div>
        </div>
        <div className="flex items-stretch gap-2.5">
          {[
            { label: "الكل", v: summary.total, c: "text-white" },
            { label: "انتظار", v: summary.waiting, c: "text-teal-soft" },
            { label: "داخل", v: summary.inside, c: "text-gold-light" },
            { label: "تم", v: summary.done, c: "text-teal-soft" },
            { label: "غياب", v: summary.absent, c: "text-rose-300" },
          ].map((s) => (
            <div
              key={s.label}
              className="grid min-w-[58px] place-items-center rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-center backdrop-blur"
            >
              <p className={`font-display text-2xl font-black ${s.c}`}>{toAr(s.v)}</p>
              <p className="text-[10px] font-bold text-cream/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الحجوزات */}
      <p className="mb-4 flex items-center gap-2 text-sm font-extrabold text-cream/70">
        <CalendarDays size={16} className="text-gold" />
        حجوزات يوم {formatDateAr(date)} — مرتبة حسب الساعة
      </p>

      {loadingList ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/15 p-14 text-center">
          <Users size={36} className="mb-3 text-cream/30" />
          <p className="font-bold text-cream/50">لا توجد حجوزات في هذا اليوم</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {appointments.map((a, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={`relative overflow-hidden rounded-3xl border p-4 backdrop-blur transition ${
                  a.status === "checked_in"
                    ? "border-gold/50 bg-gold/10"
                    : "border-white/10 bg-white/[0.05]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* رقم الكشك */}
                  <span
                    className={`grid size-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-black ${
                      a.status === "checked_in"
                        ? "bg-gold text-teal-dark shadow-lg shadow-gold/30"
                        : a.status === "completed"
                          ? "bg-teal text-white"
                          : "bg-white/10 text-gold-light"
                    }`}
                  >
                    {toAr(a.queueNumber)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-base font-extrabold text-white">
                      {a.patientName}
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${STATUS_STYLE[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-cream/60">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList size={13} className="text-gold" />
                        {formatTimeAr(a.time)} · {a.visitType === "new" ? "كشف جديد" : "إعادة"} · {toAr(a.age)} سنة
                      </span>
                      <span className="flex items-center gap-1.5" dir="ltr">
                        <Phone size={12} className="text-gold" />
                        {a.phone}
                      </span>
                      {a.notes && (
                        <span className="basis-full text-cream/45">
                          ملاحظة: {a.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* أزرار الحالة */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {busyId === a.id ? (
                      <Loader2 size={18} className="animate-spin text-gold" />
                    ) : (
                      <>
                        {a.status === "confirmed" && (
                          <>
                            <ActionBtn
                              onClick={() => setStatus(a.id, "checked_in")}
                              className="bg-gold text-teal-dark hover:shadow-gold/30"
                              icon={<DoorOpen size={15} />}
                              label="نداء ودخول"
                            />
                            <ActionBtn
                              onClick={() => setStatus(a.id, "no_show")}
                              className="border border-rose-300/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/25"
                              icon={<UserRoundX size={15} />}
                              label="لم يحضر"
                            />
                          </>
                        )}
                        {a.status === "checked_in" && (
                          <>
                            <ActionBtn
                              onClick={() => setStatus(a.id, "completed")}
                              className="bg-teal text-white hover:shadow-teal/40"
                              icon={<CheckCheck size={15} />}
                              label="إنهاء الكشف"
                            />
                            <ActionBtn
                              onClick={() => setStatus(a.id, "confirmed")}
                              className="border border-white/20 bg-white/5 text-cream hover:bg-white/15"
                              icon={<Undo2 size={14} />}
                              label="للانتظار"
                            />
                          </>
                        )}
                        {(a.status === "completed" || a.status === "no_show") && (
                          <ActionBtn
                            onClick={() => setStatus(a.id, "confirmed")}
                            className="border border-white/20 bg-white/5 text-cream hover:bg-white/15"
                            icon={<Undo2 size={14} />}
                            label="إعادة للانتظار"
                          />
                        )}
                        {a.status === "completed" && (
                          <UserRoundCheck size={20} className="text-teal-soft" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ActionBtn({
  onClick,
  className,
  icon,
  label,
}: {
  onClick: () => void;
  className: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-lg transition hover:-translate-y-0.5 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
