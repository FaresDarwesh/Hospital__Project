"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import type { DoctorDTO } from "@/lib/types";
import { formatTimeAr } from "@/lib/time";
import Reveal from "./Reveal";

const SHORT_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function DoctorsSection({ doctors }: { doctors: DoctorDTO[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    // في وضع RTL يكون التمرير للأمام بالقيمة السالبة
    scroller.current?.scrollBy({ left: dir * -380, behavior: "smooth" });
  };

  return (
    <section id="doctors" className="relative scroll-mt-24 overflow-hidden py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(40rem 30rem at 85% 20%, rgba(227,168,47,0.15), transparent), radial-gradient(36rem 28rem at 10% 85%, rgba(15,107,94,0.12), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="mb-4 inline-block rounded-full bg-gold/15 px-4 py-1.5 text-xs font-extrabold text-teal-deep">
              نخبة الأطباء
            </span>
            <h2 className="font-display text-4xl font-black text-teal-dark sm:text-5xl">
              أيدٍ أمينة… <span className="text-gold">وقلوب رحيمة</span>
            </h2>
            <p className="mt-4 leading-8 text-ink-soft">
              استشاريون وأخصائيون يهتمون بأدق التفاصيل — اختر طبيبك واحجز معه
              مباشرة.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll(-1)}
              aria-label="السابق"
              className="grid size-12 place-items-center rounded-full border border-teal/20 bg-white text-teal-deep shadow-sm transition hover:bg-teal-deep hover:text-gold-light"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="التالي"
              className="grid size-12 place-items-center rounded-full bg-teal-deep text-gold-light shadow-lg shadow-teal-deep/25 transition hover:bg-teal"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </Reveal>

        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {doctors.map((doc, i) => (
            <Reveal key={doc.id} delay={Math.min(i, 4) * 0.06} className="snap-start">
              <Link
                href={`/book?doctor=${doc.id}`}
                className="group block w-[290px] shrink-0"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lg shadow-teal-deep/10 ring-1 ring-teal/10 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-teal-deep/25 group-hover:ring-2"
                  style={{ ["--ring" as never]: doc.departmentColor }}
                >
                  <Image
                    src={doc.image || "/images/dr-1.jpg"}
                    alt={doc.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    sizes="290px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/95 via-teal-dark/20 to-transparent" />
                  {/* لمعة تمر عند التحويم */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <span
                    className="absolute top-4 right-4 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold text-white backdrop-blur"
                    style={{ backgroundColor: `${doc.departmentColor ?? "#0f6b5e"}cc` }}
                  >
                    {doc.departmentName}
                  </span>
                  <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold text-teal-deep backdrop-blur">
                    <span className="size-1.5 animate-pulse rounded-full bg-teal" />
                    يستقبل الحجوزات
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl font-extrabold text-white">
                      {doc.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-gold-light/90">
                      {doc.title}
                    </p>
                    <span className="mt-4 inline-flex translate-y-1 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-teal-dark shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:shadow-gold/40">
                      <CalendarPlus size={14} />
                      احجز موعدك معه
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-1.5 px-1">
                  <CircleCheck size={13} className="text-teal" />
                  {doc.schedules.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full border border-teal/15 bg-white px-2.5 py-1 text-[10px] font-bold text-teal-deep transition group-hover:border-teal/40"
                    >
                      {SHORT_DAYS[s.dayOfWeek]} {formatTimeAr(s.startTime)}
                    </span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
