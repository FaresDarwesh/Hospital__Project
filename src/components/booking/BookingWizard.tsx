"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Home,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  User,
} from "lucide-react";
import type { AppointmentDTO, DepartmentDTO, DoctorDTO, SlotDTO } from "@/lib/types";
import {
  AR_DAYS,
  SHORT_AR_DAYS,
  addDaysStr,
  dayOfWeekOf,
  formatDateAr,
  formatTimeAr,
  todayCairo,
} from "@/lib/time";
import { DepartmentIcon } from "@/components/Icons";
import { deptImage } from "@/lib/deptImages";

const STEP_LABELS = ["اختيار العيادة", "اختيار الطبيب", "اختيار الموعد", "بياناتك"];

const toAr = (v: number | string) =>
  String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

type Props = { initialDeptId?: number; initialDoctorId?: number };

type FormState = {
  patientName: string;
  phone: string;
  address: string;
  age: string;
  visitType: "new" | "followup";
  notes: string;
};

export default function BookingWizard({ initialDeptId, initialDoctorId }: Props) {
  const [depts, setDepts] = useState<DepartmentDTO[] | null>(null);
  const [doctors, setDoctors] = useState<DoctorDTO[] | null>(null);
  const [deptId, setDeptId] = useState<number | null>(initialDeptId ?? null);
  const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotDTO[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    patientName: "",
    phone: "",
    address: "",
    age: "",
    visitType: "new",
    notes: "",
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [result, setResult] = useState<AppointmentDTO | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // تحميل الأقسام والأطباء
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/doctors").then((r) => r.json()),
    ]).then(([d1, d2]) => {
      if (!alive) return;
      setDepts(d1.departments ?? []);
      setDoctors(d2.doctors ?? []);
      if (initialDoctorId) {
        const doc = (d2.doctors ?? []).find(
          (x: DoctorDTO) => x.id === initialDoctorId
        );
        if (doc) {
          setDoctor(doc);
          setDeptId(doc.departmentId);
          setStep(2);
          return;
        }
      }
      if (initialDeptId) setStep(2);
    });
    return () => {
      alive = false;
    };
  }, [initialDeptId, initialDoctorId]);

  // جلب المواعيد المتاحة عند اختيار اليوم
  useEffect(() => {
    if (!doctor || !date) {
      setSlots(null);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    setSlot(null);
    fetch(`/api/slots?doctorId=${doctor.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setSlots(d.slots ?? []);
        setSlotsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [doctor, date]);

  const filteredDoctors = useMemo(
    () => (doctors ?? []).filter((d) => !deptId || d.departmentId === deptId),
    [doctors, deptId]
  );
  const selectedDept = useMemo(
    () => depts?.find((d) => d.id === deptId) ?? null,
    [depts, deptId]
  );
  const days = useMemo(() => {
    const t = todayCairo();
    return Array.from({ length: 14 }, (_, i) => addDaysStr(t, i));
  }, []);
  const doctorWorkDays = useMemo(
    () => new Set((doctor?.schedules ?? []).map((s) => s.dayOfWeek)),
    [doctor]
  );

  const goTo = (s: number) => {
    setStep(s);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canNext = () => {
    if (step === 1) return !!deptId;
    if (step === 2) return !!doctor;
    if (step === 3) return !!slot;
    return true;
  };

  const next = () => {
    if (!canNext()) return;
    if (step === 4) return submit();
    setSubmitErr("");
    goTo(step + 1);
  };

  const back = () => {
    setSubmitErr("");
    goTo(Math.max(1, step - 1));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.patientName.trim().length < 5) e.patientName = "اكتب الاسم بالكامل";
    if (!/^01\d{9}$/.test(form.phone.trim()))
      e.phone = "رقم الموبايل 11 رقمًا ويبدأ بـ 01";
    if (form.address.trim().length < 3) e.address = "اكتب عنوان السكن";
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 1 || age > 120)
      e.age = "اكتب سنًا صحيحًا";
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!doctor || !date || !slot || submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    setSubmitErr("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          date,
          time: slot,
          patientName: form.patientName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          age: Number(form.age),
          visitType: form.visitType,
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "SLOT_TAKEN") {
          // أعد تحميل المواعيد وارجع لخطوة الموعد
          setSlot(null);
          fetch(`/api/slots?doctorId=${doctor.id}&date=${date}`)
            .then((r) => r.json())
            .then((d) => setSlots(d.slots ?? []));
          goTo(3);
        }
        setSubmitErr(data.message || "حدث خطأ أثناء الحجز");
        setSubmitting(false);
        return;
      }
      setResult(data.appointment);
      setSubmitting(false);
      goTo(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitErr("تعذر الاتصال بالخادم — حاول مرة أخرى");
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setDeptId(null);
    setDoctor(null);
    setDate(null);
    setSlot(null);
    setSlots(null);
    setForm({
      patientName: "",
      phone: "",
      address: "",
      age: "",
      visitType: "new",
      notes: "",
    });
    setResult(null);
    setStep(1);
  };

  // ───────── شاشة النجاح ─────────
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] border border-teal/15 bg-white p-8 text-center shadow-2xl shadow-teal-deep/10 sm:p-12">
          <div className="absolute -top-20 right-1/2 h-40 w-[30rem] translate-x-1/2 rounded-full bg-mint blur-3xl" />
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.25 }}
            className="relative mx-auto mb-6 grid size-24 place-items-center rounded-full bg-gradient-to-bl from-teal to-teal-deep text-gold-light shadow-xl shadow-teal/30"
          >
            <BadgeCheck size={48} strokeWidth={1.6} />
          </motion.div>
          <h2 className="relative font-display text-3xl font-black text-teal-dark">
            تم تأكيد حجزك بنجاح
          </h2>
          <p className="relative mt-2 text-ink-soft">
            شكرًا لثقتكم في مستشفى برج النور الخيري — نتشرف بخدمتكم
          </p>

          <div className="relative mt-8 rounded-3xl border-2 border-dashed border-gold/60 bg-gold/5 p-6">
            <p className="text-xs font-extrabold text-ink-soft">
              كود الحجز — احتفظ به جيدًا
            </p>
            <p className="mt-1 font-mono text-4xl font-black tracking-[0.2em] text-teal-dark" dir="ltr">
              {result.refCode}
            </p>
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-teal-deep px-5 py-2 text-sm font-extrabold text-gold-light">
              <ClipboardList size={15} />
              رقمك في الكشك: {toAr(result.queueNumber)}
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 text-right sm:grid-cols-2">
            {[
              { icon: Stethoscope, label: "الطبيب", value: result.doctorName ?? "" },
              { icon: MapPin, label: "العيادة", value: result.departmentName ?? "" },
              { icon: CalendarDays, label: "اليوم", value: formatDateAr(result.date) },
              { icon: Clock, label: "الساعة", value: formatTimeAr(result.time) },
              {
                icon: User,
                label: "المريض",
                value: `${result.patientName} — ${toAr(result.age)} سنة`,
              },
              {
                icon: ClipboardList,
                label: "نوع الزيارة",
                value: result.visitType === "new" ? "كشف جديد" : "إعادة",
              },
            ].map((it, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-sand/60 px-4 py-3"
              >
                <it.icon size={18} className="shrink-0 text-teal" />
                <span>
                  <span className="block text-[11px] font-bold text-ink-soft">
                    {it.label}
                  </span>
                  <span className="block text-sm font-extrabold text-teal-dark">
                    {it.value}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-6 rounded-2xl bg-mint/70 p-4 text-sm leading-7 text-teal-deep">
            ستصلك الأولوية برقم الكشك — يُرجى الحضور قبل الموعد بربع ساعة،
            وإحضار كود الحجز ورقم الموبايل المُسجَّل به (
            <span dir="ltr" className="font-mono font-bold">{result.phone}</span>).
          </div>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-teal-dark shadow-lg shadow-gold/30 transition hover:-translate-y-0.5"
            >
              <Search size={16} /> تتبع أو ألغِ حجزك
            </Link>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-full border-2 border-teal/25 px-6 py-3 text-sm font-extrabold text-teal-deep transition hover:bg-mint"
            >
              <RefreshCw size={15} /> حجز موعد آخر
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-transparent px-6 py-3 text-sm font-extrabold text-ink-soft transition hover:text-teal"
            >
              <Home size={15} /> الرئيسية
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={topRef} className="grid scroll-mt-28 gap-8 lg:grid-cols-[330px_1fr]">
      {/* ═══ الشريط الجانبي — ملخص الحجز ═══ */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        {/* خطوات التقدم */}
        <ol className="mb-6 flex items-center justify-between lg:flex-col lg:items-stretch lg:gap-1">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const current = step === n;
            return (
              <li key={n}>
                <button
                  onClick={() => done && goTo(n)}
                  disabled={!done}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition lg:px-4 ${
                    current
                      ? "bg-teal-deep text-white shadow-lg shadow-teal-deep/25"
                      : done
                        ? "text-teal-deep hover:bg-mint"
                        : "text-ink/40"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-black transition ${
                      current
                        ? "border-gold bg-gold text-teal-dark"
                        : done
                          ? "border-teal bg-teal text-white"
                          : "border-ink/15 bg-white text-ink/40"
                    }`}
                  >
                    {done ? <Check size={16} strokeWidth={3} /> : toAr(n)}
                  </span>
                  <span className="hidden text-sm font-extrabold sm:block">
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* بطاقة الملخص */}
        <div className="overflow-hidden rounded-3xl border border-teal/10 bg-white shadow-lg shadow-teal-deep/5">
          <div className="bg-teal-deep px-5 py-3.5">
            <p className="font-display text-sm font-extrabold text-gold-light">
              ملخص حجزك
            </p>
          </div>
          <div className="space-y-3.5 p-5 text-sm">
            <SummaryRow
              label="العيادة"
              value={selectedDept?.name}
              placeholder="لم تُختر بعد"
            />
            {doctor && (
              <div className="flex items-center gap-3 rounded-2xl bg-sand/50 p-3">
                <Image
                  src={doctor.image || "/images/dr-1.jpg"}
                  alt={doctor.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-xl object-cover"
                />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-teal-dark">
                    {doctor.name}
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft">
                    {doctor.title}
                  </p>
                </div>
              </div>
            )}
            {!doctor && <SummaryRow label="الطبيب" placeholder="لم يُختر بعد" />}
            <SummaryRow
              label="اليوم"
              value={date ? formatDateAr(date) : undefined}
              placeholder="لم يُختر بعد"
            />
            <SummaryRow
              label="الساعة"
              value={slot ? formatTimeAr(slot) : undefined}
              placeholder="—"
            />
          </div>
        </div>
      </aside>

      {/* ═══ محتوى الخطوة الحالية ═══ */}
      <div className="min-h-[480px]">
        {submitErr && (
          <div className="mb-5 rounded-2xl border border-rose-soft/30 bg-rose-soft/10 px-5 py-3.5 text-sm font-bold text-rose-soft">
            {submitErr}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ─── خطوة 1: العيادة ─── */}
            {step === 1 && (
              <section>
                <StepTitle
                  n={1}
                  title="اختر العيادة المناسبة"
                  sub="اضغط على التخصص الذي تريد الحجز فيه"
                />
                {!depts ? (
                  <GridSkeleton />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {depts.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDeptId(d.id);
                          setDoctor(null);
                          setDate(null);
                          setSlot(null);
                        }}
                        className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl border-2 bg-white p-4 text-right transition-all duration-300 ${
                          deptId === d.id
                            ? "border-teal shadow-xl shadow-teal/15"
                            : "border-transparent shadow-sm hover:-translate-y-1 hover:shadow-lg"
                        }`}
                      >
                        <span className="relative size-14 shrink-0">
                          <Image
                            src={deptImage(d.icon)}
                            alt={d.name}
                            fill
                            className="rounded-2xl object-cover"
                            sizes="56px"
                          />
                          <span
                            className="absolute -bottom-1.5 -left-1.5 grid size-6 place-items-center rounded-lg border-2 border-white text-white shadow"
                            style={{ backgroundColor: d.color }}
                          >
                            <DepartmentIcon name={d.icon} size={12} />
                          </span>
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-base font-extrabold text-teal-dark">
                            {d.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-bold text-ink-soft">
                            عيادات: {toAr(d.doctorCount ?? 0)}
                          </span>
                        </span>
                        <span
                          className={`grid size-7 place-items-center rounded-full border-2 transition ${
                            deptId === d.id
                              ? "border-teal bg-teal text-white"
                              : "border-ink/15 text-transparent"
                          }`}
                        >
                          <Check size={14} strokeWidth={3.5} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ─── خطوة 2: الطبيب ─── */}
            {step === 2 && (
              <section>
                <StepTitle
                  n={2}
                  title="اختر طبيبك"
                  sub={
                    selectedDept
                      ? `أطباء عيادة ${selectedDept.name}`
                      : "كل الأطباء المتاحين"
                  }
                />
                {!doctors ? (
                  <GridSkeleton />
                ) : filteredDoctors.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-teal/25 bg-white p-10 text-center text-ink-soft">
                    لا يوجد أطباء متاحون في هذه العيادة حاليًا — جرّب عيادة أخرى
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredDoctors.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDoctor(d);
                          setDate(null);
                          setSlot(null);
                        }}
                        className={`group flex items-start gap-4 rounded-3xl border-2 bg-white p-4 text-right transition-all duration-300 ${
                          doctor?.id === d.id
                            ? "border-teal shadow-xl shadow-teal/15"
                            : "border-transparent shadow-sm hover:-translate-y-1 hover:shadow-lg"
                        }`}
                      >
                        <Image
                          src={d.image || "/images/dr-1.jpg"}
                          alt={d.name}
                          width={72}
                          height={72}
                          className="size-[72px] shrink-0 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base font-extrabold text-teal-dark">
                            {d.name}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-gold">
                            {d.title}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-soft">
                            {d.bio}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {d.schedules.map((s) => (
                              <span
                                key={s.id}
                                className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-extrabold text-teal-deep"
                              >
                                {SHORT_AR_DAYS[s.dayOfWeek]} {formatTimeAr(s.startTime)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full border-2 transition ${
                            doctor?.id === d.id
                              ? "border-teal bg-teal text-white"
                              : "border-ink/15 text-transparent"
                          }`}
                        >
                          <Check size={14} strokeWidth={3.5} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ─── خطوة 3: الموعد ─── */}
            {step === 3 && doctor && (
              <section>
                <StepTitle
                  n={3}
                  title="اختر اليوم والساعة"
                  sub={`أيام عمل ${doctor.name} — المواعيد المحجوزة تظهر باللون الرمادي`}
                />
                {doctor.queueMode === "arrival" && (
                  <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-bold leading-7 text-teal-dark">
                    تنبيه مهم: هذا الطبيب يعمل بنظام أسبقية الحضور. الموعد تقريبي لتنظيم اليوم، وبرجاء الحضور قبل الموعد بـ15 دقيقة وتسجيل الوصول من الاستقبال. في حالة التأخير قد تنتظر 4 أدوار من نفس الطبيب.
                  </div>
                )}

                {/* أيام الأسبوعين القادمين */}
                <div className="mb-6 flex gap-2.5 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:var(--color-teal)_transparent]">
                  {days.map((d) => {
                    const dow = dayOfWeekOf(d);
                    const works = doctorWorkDays.has(dow);
                    const selected = date === d;
                    const dayNum = toAr(d.slice(8));
                    return (
                      <button
                        key={d}
                        disabled={!works}
                        onClick={() => setDate(d)}
                        className={`flex w-[76px] shrink-0 flex-col items-center rounded-2xl border-2 py-3 transition-all duration-300 ${
                          selected
                            ? "border-teal bg-teal-deep text-white shadow-lg shadow-teal-deep/25"
                            : works
                              ? "border-teal/15 bg-white hover:-translate-y-0.5 hover:border-teal/50"
                              : "cursor-not-allowed border-transparent bg-sand/70 text-ink/30"
                        }`}
                      >
                        <span className="text-[11px] font-bold">
                          {SHORT_AR_DAYS[dow]}
                        </span>
                        <span className="mt-1 font-display text-lg font-black">
                          {dayNum}
                        </span>
                        <span
                          className={`mt-1 h-1.5 w-1.5 rounded-full ${
                            works
                              ? selected
                                ? "bg-gold"
                                : "bg-teal"
                              : "bg-ink/10"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="-mt-3 mb-5 text-center text-[11px] font-bold text-ink-soft sm:hidden">
                  اسحب أفقيًا لرؤية باقي الأيام
                </p>

                {/* الساعات */}
                {!date ? (
                  <div className="grid place-items-center rounded-3xl border border-dashed border-teal/25 bg-white/70 p-12 text-center">
                    <CalendarDays size={36} className="mb-3 text-teal/40" />
                    <p className="font-bold text-ink-soft">
                      اختر يومًا من الأعلى لعرض المواعيد المتاحة
                    </p>
                  </div>
                ) : slotsLoading || !slots ? (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-sand"
                      />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-teal/25 bg-white p-10 text-center font-bold text-ink-soft">
                    لا توجد مواعيد لهذا اليوم — اختر يومًا آخر
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-bold text-ink-soft">
                      <span className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full border-2 border-teal/60 bg-white" /> متاح
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full bg-sand" /> محجوز
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full bg-teal" /> اخترته
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                      {slots.map((s) => {
                        const selected = slot === s.time;
                        return (
                          <button
                            key={s.time}
                            disabled={s.booked}
                            onClick={() => setSlot(s.time)}
                            className={`relative rounded-xl border-2 py-3 text-sm font-extrabold transition-all duration-200 ${
                              s.booked
                                ? "cursor-not-allowed border-transparent bg-sand/80 text-ink/30 line-through"
                                : selected
                                  ? "border-teal bg-teal text-white shadow-lg shadow-teal/25"
                                  : "border-teal/20 bg-white text-teal-deep hover:-translate-y-0.5 hover:border-teal/60 hover:bg-mint"
                            }`}
                          >
                            {formatTimeAr(s.time)}
                            {s.booked && (
                              <span className="absolute -bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 rounded-full bg-ink/50 px-2 py-0.5 text-[9px] font-bold text-white no-underline">
                                محجوز
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* ─── خطوة 4: البيانات ─── */}
            {step === 4 && (
              <section>
                <StepTitle
                  n={4}
                  title="بيانات المريض"
                  sub="اكتب بياناتك بدقة لإتمام الحجز — كل الحقول المميزة بنجمة مطلوبة"
                />
                <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-bold leading-7 text-teal-dark">
                  ملاحظة مهمة: برجاء الحضور قبل الموعد بـ15 دقيقة. في حالة التأخير قد يتم تغيير ترتيب الدخول، وقد تنتظر 4 أدوار من نفس الطبيب.
                </div>
                <div className="grid gap-5 rounded-3xl border border-teal/10 bg-white p-6 shadow-lg shadow-teal-deep/5 sm:p-8 md:grid-cols-2">
                  <Field
                    label="الاسم بالكامل"
                    error={formErr.patientName}
                    required
                  >
                    <div className="relative">
                      <User size={17} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal/50" />
                      <input
                        className="field pr-11"
                        placeholder="مثال: أحمد محمود عبد الله"
                        value={form.patientName}
                        onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                      />
                    </div>
                  </Field>

                  <Field label="رقم الموبايل" error={formErr.phone} required>
                    <div className="relative">
                      <Phone size={17} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal/50" />
                      <input
                        className="field pr-11 text-left"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="01xxxxxxxxx"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                        }
                      />
                    </div>
                  </Field>

                  <Field label="عنوان السكن" error={formErr.address} required>
                    <div className="relative">
                      <MapPin size={17} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal/50" />
                      <input
                        className="field pr-11"
                        placeholder="مثال: أجا — شارع الجمهورية"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>
                  </Field>

                  <Field label="السن" error={formErr.age} required>
                    <input
                      className="field"
                      type="number"
                      min={1}
                      max={120}
                      placeholder="بالسنوات"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <p className="mb-2.5 text-sm font-extrabold text-teal-dark">
                      نوع الزيارة <span className="text-rose-soft">*</span>
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        { v: "new", t: "كشف جديد", d: "أول زيارة لهذا الطبيب — كشف رمزي" },
                        { v: "followup", t: "إعادة / متابعة", d: "متابعة لنفس الطبيب — بدون رسوم جديدة" },
                      ] as const).map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => setForm({ ...form, visitType: o.v })}
                          className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-right transition-all ${
                            form.visitType === o.v
                              ? "border-teal bg-mint/60 shadow-md"
                              : "border-ink/10 bg-white hover:border-teal/40"
                          }`}
                        >
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                              form.visitType === o.v
                                ? "border-teal bg-teal text-white"
                                : "border-ink/20 text-transparent"
                            }`}
                          >
                            <Check size={12} strokeWidth={4} />
                          </span>
                          <span>
                            <span className="block text-sm font-extrabold text-teal-dark">
                              {o.t}
                            </span>
                            <span className="block text-xs text-ink-soft">{o.d}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-2.5 text-sm font-extrabold text-teal-dark">
                      ملاحظات للطبيب <span className="font-normal text-ink-soft">(اختياري)</span>
                    </p>
                    <textarea
                      className="field min-h-24 resize-none"
                      placeholder="أي أعراض أو ملاحظات تود إخبار الطبيب بها…"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* أزرار التنقل */}
        <div className="sticky bottom-3 z-20 mt-8 flex items-center justify-between rounded-2xl border border-teal/10 bg-cream/95 p-2 shadow-xl shadow-teal-deep/10 backdrop-blur-md">
          <button
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-full border-2 border-teal/20 px-6 py-3 text-sm font-extrabold text-teal-deep transition enabled:hover:bg-mint disabled:opacity-0"
          >
            <ArrowRight size={16} />
            السابق
          </button>
          <button
            onClick={next}
            disabled={!canNext() || submitting}
            className="group inline-flex items-center gap-2.5 rounded-full bg-teal-deep px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-teal-deep/25 transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                جارٍ تأكيد الحجز…
              </>
            ) : step === 4 ? (
              <>
                <BadgeCheck size={17} className="text-gold-light" />
                تأكيد الحجز
              </>
            ) : (
              <>
                التالي
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="mb-7">
      <p className="mb-1.5 font-display text-xs font-black tracking-wide text-gold">
        الخطوة {n} من 4
      </p>
      <h2 className="font-display text-2xl font-black text-teal-dark sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mt-1.5 text-sm font-bold text-ink-soft">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-extrabold text-teal-dark">
        {label} {required && <span className="text-rose-soft">*</span>}
      </p>
      {children}
      {error && <p className="mt-1.5 text-xs font-bold text-rose-soft">{error}</p>}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-bold text-ink-soft">{label}</span>
      <span
        className={`text-sm font-extrabold ${value ? "text-teal-dark" : "text-ink/30"}`}
      >
        {value || placeholder}
      </span>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-3xl bg-sand" />
      ))}
    </div>
  );
}
