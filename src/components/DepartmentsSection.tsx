"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { DepartmentDTO } from "@/lib/types";
import { DepartmentIcon } from "./Icons";
import { deptImage } from "@/lib/deptImages";
import Reveal from "./Reveal";

export default function DepartmentsSection({
  departments,
}: {
  departments: DepartmentDTO[];
}) {
  return (
    <section id="departments" className="relative scroll-mt-24 bg-sand/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-teal/10 px-4 py-1.5 text-xs font-extrabold text-teal">
            عياداتنا التخصصية
          </span>
          <h2 className="font-display text-4xl font-black text-teal-dark sm:text-5xl">
            كل التخصصات التي تحتاجها…
            <span className="text-gold"> تحت سقف واحد</span>
          </h2>
          <p className="mt-4 leading-8 text-ink-soft">
            باطنة · جراحة · قلب · أطفال · عظام · نساء · أسنان · علاج طبيعي —
            اختر العيادة واحجز موعدك في أقل من دقيقة.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept, i) => (
            <Reveal key={dept.id} delay={(i % 4) * 0.07}>
              <Link
                href={`/book?dept=${dept.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-teal/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-teal/30 hover:shadow-2xl hover:shadow-teal/15"
              >
                {/* صورة التخصص */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={deptImage(dept.icon)}
                    alt={dept.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    quality={75}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/55 via-teal-dark/10 to-transparent transition-opacity duration-500 group-hover:opacity-70" />
                  {/* شارة لمعان */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <span
                    className="absolute -bottom-6 right-5 grid size-12 place-items-center rounded-2xl border-4 border-white text-white shadow-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${dept.color}, color-mix(in srgb, ${dept.color} 65%, black))`,
                    }}
                  >
                    <DepartmentIcon name={dept.icon} size={22} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 pt-9">
                  <h3 className="font-display text-lg font-extrabold text-teal-dark transition-colors group-hover:text-teal">
                    {dept.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-6 text-ink-soft">
                    {dept.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-dashed border-teal/15 pt-4">
                    <span className="text-xs font-extrabold text-teal">
                      {dept.doctorCount
                        ? `عدد الأطباء: ${dept.doctorCount}`
                        : "فريق متخصص"}
                    </span>
                    <span className="grid size-8 place-items-center rounded-full bg-sand text-teal-deep transition-all duration-300 group-hover:bg-gold group-hover:text-teal-dark">
                      <ArrowLeft
                        size={15}
                        className="transition-transform duration-300 group-hover:-translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
