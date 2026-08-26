"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { HandHeart, Stethoscope, Users, Award } from "lucide-react";
import Reveal from "./Reveal";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 2000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return <span ref={ref}>{val.toLocaleString("ar-EG")}</span>;
}

const STATS = [
  { icon: Users, to: 25000, suffix: "+", label: "حالة يخدمها المستشفى سنويًا", accent: "#0F6B5E" },
  { icon: Stethoscope, to: 40, suffix: "+", label: "طبيبًا واستشاريًا في خدمتكم", accent: "#B4436C" },
  { icon: HandHeart, to: 120000, suffix: "+", label: "حالة منذ افتتاح المستشفى", accent: "#E3A82F" },
  { icon: Award, to: 10, suffix: "", label: "سنوات من العطاء المتواصل", accent: "#3D7DF2" },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="group relative overflow-hidden rounded-3xl border border-teal/10 bg-white p-6 text-center shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal/15 hover:ring-2 hover:ring-gold/40 sm:p-8">
              {/* شريط علوي ملوّن */}
              <span
                className="absolute inset-x-0 top-0 h-1.5 origin-center scale-x-50 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }}
              />
              <span
                className="absolute -top-8 -left-8 size-24 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-25"
                style={{ backgroundColor: s.accent }}
              />
              <span
                className="relative mx-auto mb-4 grid size-14 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${s.accent}, color-mix(in srgb, ${s.accent} 60%, black))`,
                }}
              >
                <s.icon size={24} strokeWidth={1.8} />
              </span>
              <p className="relative font-display text-3xl font-black text-teal-dark sm:text-4xl">
                <Counter to={s.to} />
                <span className="text-gold">{s.suffix}</span>
              </p>
              <p className="relative mt-1.5 text-xs font-bold text-ink-soft sm:text-sm">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
