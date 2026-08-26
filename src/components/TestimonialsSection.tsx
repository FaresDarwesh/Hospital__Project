"use client";

import { Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

const TESTIMONIALS = [
  {
    quote:
      "حجزت لوالدي من الموبايل في دقيقة، ولما وصلنا لقينا رقمنا جاهز والدكتور مستني — منظمين جدًا والكشف رمزي بجد.",
    name: "أم محمد",
    place: "أجا",
    clinic: "عيادة الباطنة",
    initial: "م",
    color: "#0F6B5E",
  },
  {
    quote:
      "ابني اتكسرت يده ودخلنا العظام على طول — النظام بالأرقام خلّى الدور عادل ومحدش اتزحلق. ربنا يبارك فيهم.",
    name: "أبو يوسف",
    place: "ميت غمر",
    clinic: "عيادة العظام",
    initial: "ي",
    color: "#E8912D",
  },
  {
    quote:
      "متابعة حملي كانت كلها هنا — تعامل راقي واهتمام بكل التفاصيل، وكأننا في مستشفى خاص رغم إنها خيرية.",
    name: "نهى سامي",
    place: "طناح",
    clinic: "عيادة النساء والتوليد",
    initial: "ن",
    color: "#E46BA8",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-24">
      <div className="absolute top-10 right-10 font-amiri text-[16rem] leading-none text-teal/[0.04] select-none">
        ”
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-gold/15 px-4 py-1.5 text-xs font-extrabold text-teal-deep">
            حكايات حقيقية
          </span>
          <h2 className="font-display text-4xl font-black text-teal-dark sm:text-5xl">
            كلامهم أمانة…<span className="text-gold"> وسام على صدرنا</span>
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <figure className="group relative flex h-full flex-col rounded-[1.75rem] border border-teal/10 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal/10">
                <Quote
                  size={40}
                  className="absolute left-6 top-6 text-teal/10 transition-colors duration-300 group-hover:text-gold/40"
                />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} className="fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="flex-1 text-[15px] font-bold leading-8 text-ink/80">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-dashed border-teal/15 pt-5">
                  <span
                    className="grid size-12 place-items-center rounded-full font-display text-lg font-black text-white shadow-md"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initial}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-teal-dark">
                      {t.name}
                    </span>
                    <span className="block text-xs font-bold text-ink-soft">
                      {t.place} — {t.clinic}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
