"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  HeartPulse,
  Plus,
  Sparkles,
  Siren,
} from "lucide-react";
import { HOSPITAL } from "@/lib/hospital";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden plus-pattern pt-28 pb-24">
      {/* توهجات الخلفية */}
      <div className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-gold/25 blur-[130px]" />
      <div className="absolute top-1/3 -right-40 size-[30rem] rounded-full bg-teal/20 blur-[130px]" />
      <div className="absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-mint blur-[110px]" />

      {/* علامات زائد عائمة */}
      {[
        { top: "18%", right: "6%", delay: "0s", size: 26 },
        { top: "65%", right: "45%", delay: "1.2s", size: 18 },
        { top: "30%", left: "8%", delay: "0.6s", size: 22 },
        { top: "80%", left: "16%", delay: "1.8s", size: 16 },
      ].map((p, i) => (
        <Plus
          key={i}
          size={p.size}
          className="animate-float absolute text-teal/20"
          style={{ top: p.top, right: p.right, left: p.left, animationDelay: p.delay }}
        />
      ))}

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* النص */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-right"
        >
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/70 px-4 py-1.5 text-xs font-extrabold text-teal-deep shadow-sm backdrop-blur"
          >
            <Sparkles size={14} className="text-gold" />
            مؤسسة خيرية · {HOSPITAL.city}
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-black leading-[1.18] text-teal-dark sm:text-6xl lg:text-7xl"
          >
            برجُ <span className="text-shimmer">النور</span>
            <br />
            <span className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl lg:text-5xl">
              رعايةٌ خيرية تليق بكم
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-base leading-8 text-ink-soft sm:text-lg lg:mx-0"
          >
            في {HOSPITAL.name} نستقبلكم بنخبة من الاستشاريين وأحدث الأجهزة،
            بـ<span className="font-extrabold text-teal">{HOSPITAL.fee}</span> لكل
            المرضى. احجز عيادتك أونلاين في أقل من دقيقة — بدون طوابير وبدون
            انتظار.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link
              href="/book"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-teal-deep px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-teal-deep/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-teal-deep/40"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <CalendarCheck2 size={19} className="text-gold-light" />
              احجز موعدك الآن
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
            <Link
              href="/#departments"
              className="inline-flex items-center gap-2 rounded-full border-2 border-teal-deep/15 bg-white/60 px-7 py-4 text-base font-extrabold text-teal-deep backdrop-blur transition hover:border-teal/40 hover:bg-mint"
            >
              استكشف العيادات
            </Link>
          </motion.div>

          {/* شريط الثقة */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start"
          >
            {[
              { num: "٢٥ ألف+", label: "حالة سنويًا" },
              { num: "٤٠+", label: "طبيبًا واستشاريًا" },
              { num: "١٠ سنوات", label: "من العطاء" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="h-8 w-1 rounded-full bg-gold" />
                <span>
                  <span className="block font-display text-lg font-black text-teal-dark">
                    {s.num}
                  </span>
                  <span className="block text-xs font-bold text-ink-soft">
                    {s.label}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* الصورة والبطاقات العائمة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="absolute -inset-4 -rotate-2 rounded-[3rem] bg-gradient-to-bl from-teal/15 to-gold/20" />
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-teal-deep/25 ring-8 ring-white/80">
            <Image
              src="/images/hospital-tower.jpg"
              alt={`برج ${HOSPITAL.name}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/40 via-transparent to-transparent" />
          </div>

          {/* بطاقة عائمة: موعد */}
          <motion.div
            className="animate-float absolute -bottom-6 -right-3 sm:right-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <div className="glass flex items-center gap-3 rounded-2xl border border-white/60 p-3.5 pl-5 shadow-xl shadow-teal-deep/15">
              <Image
                src="/images/dr-2.jpg"
                alt="طبيبة"
                width={44}
                height={44}
                className="size-11 rounded-xl object-cover"
              />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-teal-dark">
                  د. سارة محمود
                </p>
                <p className="text-[11px] font-bold text-ink-soft">
                  قلب وأوعية دموية
                </p>
              </div>
              <span className="mr-1 rounded-full bg-mint px-3 py-1.5 text-[11px] font-extrabold text-teal">
                متاح الحجز
              </span>
            </div>
          </motion.div>

          {/* بطاقة عائمة: قلب */}
          <motion.div
            className="animate-float-slow absolute -top-6 left-2 sm:-left-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
          >
            <div className="glass flex items-center gap-3 rounded-2xl border border-white/60 p-3.5 shadow-xl shadow-teal-deep/15">
              <span className="grid size-11 place-items-center rounded-xl bg-rose-soft/10 text-rose-soft">
                <HeartPulse size={22} className="animate-heartbeat" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-teal-dark">٢٤/٧</p>
                <p className="text-[11px] font-bold text-ink-soft">
                  استقبال وطوارئ
                </p>
              </div>
            </div>
          </motion.div>

          {/* شارة طوارئ دوّارة */}
          <motion.div
            className="absolute -top-8 right-8 hidden sm:grid"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
          >
            <div className="relative grid size-24 place-items-center rounded-full bg-teal-deep text-white shadow-xl shadow-teal-deep/30">
              <svg
                viewBox="0 0 100 100"
                className="animate-spin-slow absolute inset-0 size-full"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
                  />
                </defs>
                <text className="fill-gold-light font-bold" fontSize="10.5">
                  <textPath href="#circlePath">
                    مستشفى برج النور الخيرى · كشف رمزي ·
                  </textPath>
                </text>
              </svg>
              <Siren size={26} className="text-gold" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* خط النبض */}
      <div className="absolute inset-x-0 bottom-0 h-14 overflow-hidden opacity-70">
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0,32 L140,32 L160,32 L172,10 L184,52 L196,32 L260,32 L280,32 L292,14 L304,48 L316,32 L500,32 L520,32 L532,10 L544,52 L556,32 L700,32 L720,32 L732,14 L744,48 L756,32 L940,32 L960,32 L972,10 L984,52 L996,32 L1200,32"
            fill="none"
            stroke="var(--color-teal)"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-ecg"
          />
        </svg>
      </div>
    </section>
  );
}
