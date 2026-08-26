"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  LayoutGrid,
  UserRoundPlus,
} from "lucide-react";
import Reveal from "./Reveal";

const STEPS = [
  {
    icon: LayoutGrid,
    title: "اختر العيادة",
    desc: "تصفح تخصصاتنا الثمانية واختر العيادة المناسبة لحالتك.",
  },
  {
    icon: UserRoundPlus,
    title: "اختر طبيبك",
    desc: "تعرف على أطباء كل عيادة ومواعيد عملهم واختر الأنسب لك.",
  },
  {
    icon: CalendarClock,
    title: "اختر الموعد",
    desc: "تظهر لك المواعيد المتاحة فقط — المواعيد المحجوزة مغلقة لحظيًا.",
  },
  {
    icon: BadgeCheck,
    title: "أكّد بياناتك",
    desc: "الاسم ورقم الهاتف والعنوان والسن ونوع الزيارة (كشف أو إعادة) — وتم!",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-teal-dark py-24 text-white plus-pattern-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/40 px-4 py-1.5 text-xs font-extrabold text-gold-light">
            أربع خطوات فقط
          </span>
          <h2 className="font-display text-4xl font-black sm:text-5xl">
            احجز كشفك في <span className="text-shimmer">أقل من دقيقة</span>
          </h2>
          <p className="mt-4 leading-8 text-cream/65">
            صممنا نظام الحجز ليكون أسهل وأسرع طريقة للوصول لطبيبك.
          </p>
        </Reveal>

        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* الخط الواصل */}
          <div className="absolute top-14 right-[12%] left-[12%] hidden border-t-2 border-dashed border-gold/25 lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 0.12} className="relative">
              <div className="group flex h-full flex-col items-center text-center">
                <div className="relative mb-6">
                  <span className="pointer-events-none absolute -top-7 right-1/2 translate-x-1/2 font-display text-7xl font-black text-white/[0.07] transition-colors duration-500 group-hover:text-gold/20">
                    0{i + 1}
                  </span>
                  <span className="relative grid size-[4.5rem] place-items-center rounded-3xl border border-gold/25 bg-teal-deep text-gold-light shadow-xl shadow-black/20 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-gold/60">
                    <s.icon size={28} strokeWidth={1.6} />
                    <span className="absolute -top-2 -left-2 grid size-7 place-items-center rounded-full bg-gold font-display text-xs font-black text-teal-dark">
                      {i + 1}
                    </span>
                  </span>
                </div>
                <h3 className="font-display text-lg font-extrabold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-cream/60">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link
            href="/book"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-9 py-4 text-base font-extrabold text-teal-dark shadow-2xl shadow-gold/25 transition-all hover:-translate-y-1 hover:shadow-gold/40"
          >
            ابدأ الحجز الآن
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
