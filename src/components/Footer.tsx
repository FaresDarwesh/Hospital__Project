import Link from "next/link";
import {
  Clock,
  KeyRound,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { FacebookIcon, LighthouseIcon } from "./Icons";
import { HOSPITAL } from "@/lib/hospital";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-teal-dark text-cream/85 plus-pattern-dark">
      <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-teal/30 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* عن المستشفى */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gold text-teal-dark">
              <LighthouseIcon size={22} strokeWidth={1.8} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-extrabold text-white">
                {HOSPITAL.name}
              </p>
              <p className="text-xs text-gold-light/80">{HOSPITAL.tagline}</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-cream/65">
            مؤسسة طبية خيرية تقدّم رعاية صحية بكشف رمزي لجميع أبناء {HOSPITAL.city}{" "}
            والقرى المجاورة بأحدث الأجهزة ونخبة من الاستشاريين.
          </p>
          <a
            href={HOSPITAL.facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-cream/90 transition hover:bg-white/10"
          >
            <FacebookIcon size={15} /> تابعنا على فيسبوك
          </a>
        </div>

        {/* روابط سريعة */}
        <div>
          <h4 className="mb-4 font-display text-base font-extrabold text-gold-light">
            روابط سريعة
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/book", label: "حجز موعد جديد" },
              { href: "/track", label: "تتبع / إلغاء حجزك" },
              { href: "/#departments", label: "العيادات والتخصصات" },
              { href: "/#doctors", label: "فريق الأطباء" },
              { href: "/#how", label: "طريقة الحجز" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-2 text-cream/70 transition hover:text-gold-light"
                >
                  <span className="h-1 w-3 rounded-full bg-gold/60" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* تواصل معنا */}
        <div>
          <h4 className="mb-4 font-display text-base font-extrabold text-gold-light">
            تواصل معنا
          </h4>
          <ul className="space-y-3.5 text-sm text-cream/70">
            <li className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-gold" />
              <span>{HOSPITAL.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-gold" />
              <span dir="ltr">{HOSPITAL.phoneDisplay}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={17} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {HOSPITAL.hours}
                <br />
                <span className="text-xs text-cream/50">{HOSPITAL.friday}</span>
              </span>
            </li>
          </ul>
        </div>

        {/* دخول العاملين */}
        <div>
          <h4 className="mb-4 font-display text-base font-extrabold text-gold-light">
            بوابات العاملين
          </h4>
          <div className="space-y-3">
            <Link
              href="/assistant"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-gold/40 hover:bg-white/10"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-teal text-gold-light">
                <KeyRound size={18} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-white">
                  بوابة الطاقم الطبي
                </span>
                <span className="block text-xs text-cream/55">
                  دخول مساعدي الأطباء برقم الكود
                </span>
              </span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-gold/40 hover:bg-white/10"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gold text-teal-dark">
                <ShieldCheck size={18} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-white">
                  لوحة تحكم الإدارة
                </span>
                <span className="block text-xs text-cream/55">
                  إدارة الأطباء والمواعيد والحالات
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {HOSPITAL.name} — جميع الحقوق محفوظة ·{" "}
        <span className="text-gold-light/70">رعاية تليق بكم</span>
      </div>
    </footer>
  );
}
