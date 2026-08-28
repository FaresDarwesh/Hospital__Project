"use client";

import Image from "next/image";
import { HandHeart, Pill, Stethoscope, Syringe } from "lucide-react";
import { FacebookIcon } from "./Icons";
import Reveal from "./Reveal";
import { HOSPITAL } from "@/lib/hospital";

const PILLARS = [
  { icon: Stethoscope, label: "كشف رمزي لكل عياداتنا" },
  { icon: Pill, label: "دواء مدعوم من صيدلية المستشفى" },
  { icon: Syringe, label: "قوافل طبية مجانية للقرى" },
];

export default function CharitySection() {
  return (
    <section className="relative bg-cream py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-bl from-teal-deep via-teal to-teal-deep shadow-2xl shadow-teal-deep/30">
          <div className="absolute inset-0 plus-pattern-dark" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-gold/20 blur-[100px]" />

          <div className="relative grid items-center gap-10 p-8 sm:p-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <Reveal>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-extrabold text-gold-light">
                  <HandHeart size={15} />
                  صدقة جارية… وأجر مضاعف
                </span>
                <p className="font-amiri text-3xl font-bold leading-[1.9] text-white sm:text-4xl">
                  « وَمَنْ أَحْيَاهَا فَكَأَنَّمَا
                  <span className="text-gold-light"> أَحْيَا النَّاسَ جَمِيعًا »</span>
                </p>
                <p className="mt-5 max-w-xl leading-8 text-cream/75">
                  مساهمتك — مهما كانت بسيطة — تشارك في علاج مريض لا يملك ثمن
                  الكشف أو الدواء. تبرعاتكم هي شريان الحياة الذي يبقي أبوابنا
                  مفتوحة للجميع.
                </p>
              </Reveal>

              <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
                {PILLARS.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-cream/90"
                  >
                    <p.icon size={14} className="text-gold-light" />
                    {p.label}
                  </span>
                ))}
              </Reveal>

              <Reveal delay={0.25} className="mt-9 flex flex-wrap gap-4">
                <a
                  href={HOSPITAL.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-extrabold text-teal-dark shadow-xl shadow-gold/25 transition hover:-translate-y-0.5"
                >
                  <HandHeart size={18} />
                  ساهم معنا عبر صفحتنا
                </a>
                <a
                  href={`tel:${HOSPITAL.phone}`}
                  className="inline-flex items-center gap-2.5 rounded-full border-2 border-white/25 px-8 py-4 text-sm font-extrabold text-white transition hover:bg-white/10"
                >
                  <FacebookIcon size={16} />
                  تواصل للتبرعات: {HOSPITAL.phoneDisplay}
                </a>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="relative hidden lg:block">
              <div className="relative aspect-[4/3.2] overflow-hidden rounded-[2rem] border-4 border-white/15 shadow-2xl">
                <Image
                  src="/images/hero-hospital.jpg"
                  alt={`مبنى ${HOSPITAL.name}`}
                  fill
                  className="object-cover"
                  quality={75}
                  loading="lazy"
                  sizes="(min-width: 1280px) 420px, 35vw"
                />
              </div>
              <div className="glass absolute -bottom-6 right-6 left-6 flex items-center justify-between rounded-2xl border border-white/40 p-4 shadow-xl">
                <span className="text-sm font-extrabold text-teal-dark">
                  كل جنيه في مكانه الصحيح
                </span>
                <span className="rounded-full bg-teal px-3 py-1 text-[11px] font-extrabold text-gold-light">
                  شفافية كاملة
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
