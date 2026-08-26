"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import { LighthouseIcon } from "./Icons";
import { HOSPITAL } from "@/lib/hospital";

const LINKS = [
  { href: "/#departments", label: "العيادات" },
  { href: "/#doctors", label: "الأطباء" },
  { href: "/#how", label: "كيف تحجز؟" },
  { href: "/track", label: "تتبع حجزك" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const dark = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        dark
          ? "glass border-b border-teal/10 py-2 shadow-[0_10px_40px_-18px_rgba(6,43,40,0.35)]"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* الشعار */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid size-11 place-items-center rounded-2xl bg-teal-deep text-gold shadow-lg shadow-teal-deep/25 transition-transform duration-300 group-hover:-rotate-6">
            <LighthouseIcon size={22} strokeWidth={1.8} />
            <span className="absolute -top-1 -left-1 size-3 rounded-full bg-gold animate-heartbeat" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-800 font-extrabold text-teal-dark">
              {HOSPITAL.name}
            </span>
            <span className="block text-[11px] font-bold text-teal/70">
              {HOSPITAL.city}
            </span>
          </span>
        </Link>

        {/* روابط سطح المكتب */}
        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-bold text-ink/75 transition-colors hover:text-teal after:absolute after:-bottom-1.5 after:right-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gold after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${HOSPITAL.phone}`}
            className="flex items-center gap-2 rounded-full border border-teal/20 px-4 py-2 text-sm font-bold text-teal-deep transition hover:bg-mint"
          >
            <Phone size={15} />
            <span dir="ltr">{HOSPITAL.phoneDisplay}</span>
          </a>
          <Link
            href="/book"
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-teal-dark shadow-lg shadow-gold/30 transition hover:shadow-xl hover:shadow-gold/40"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <CalendarCheck size={16} />
            احجز كشفك
          </Link>
        </div>

        {/* زر القائمة للموبايل */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center rounded-2xl border border-teal/15 bg-white/70 text-teal-deep lg:hidden"
          aria-label="القائمة"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* قائمة الموبايل */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mx-4 mt-3 flex flex-col gap-1 rounded-3xl border border-teal/10 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-ink/80 transition hover:bg-mint"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-extrabold text-teal-dark"
              >
                <CalendarCheck size={16} /> احجز كشفك الآن
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
