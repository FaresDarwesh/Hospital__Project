"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Eye,
  EyeOff,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  LogOut,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { LighthouseIcon } from "@/components/Icons";
import StatsView from "./StatsView";
import DoctorsView from "./DoctorsView";
import DepartmentsView from "./DepartmentsView";
import AppointmentsView from "./AppointmentsView";

type Tab = "stats" | "doctors" | "departments" | "appointments";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "stats", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "doctors", label: "الأطباء", icon: Stethoscope },
  { id: "departments", label: "الأقسام", icon: LayoutGrid },
  { id: "appointments", label: "الحجوزات", icon: CalendarDays },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("stats");

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    // لا نحتفظ بدخول الإدارة عند فتح الصفحة مرة أخرى.
    // يتم إبطال الكوكي القديمة أولًا لفرض كلمة المرور في كل زيارة.
    fetch("/api/admin/logout", { method: "POST" })
      .catch(() => undefined)
      .finally(() => setAuthed(false));
  }, []);

  const login = async () => {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.message || "كلمة المرور غير صحيحة");
      setShakeKey((k) => k + 1);
      setPassword("");
    }
    setBusy(false);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  if (authed === null) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-teal" size={40} />
      </div>
    );
  }

  // ───────── شاشة تسجيل الدخول ─────────
  if (!authed) {
    return (
      <div className="mx-auto max-w-md pt-6">
        <motion.div
          key={shakeKey}
          animate={{ x: shakeKey ? [0, -10, 10, -7, 7, 0] : 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-teal/10 bg-teal-dark p-8 shadow-2xl shadow-teal-deep/30 plus-pattern-dark sm:p-10"
        >
          <div className="absolute -top-16 right-1/2 h-32 w-72 translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative text-center">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-3xl bg-gold text-teal-dark shadow-xl shadow-gold/30">
              <ShieldCheck size={28} strokeWidth={1.8} />
            </span>
            <h1 className="font-display text-2xl font-black text-white">
              لوحة تحكم الإدارة
            </h1>
            <p className="mt-2 text-sm text-cream/60">
              منطقة مخصصة لإدارة المستشفى فقط — أدخل كلمة المرور للمتابعة
            </p>

            <div className="relative mt-7">
              <input
                type={showPw ? "text" : "password"}
                className="w-full rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-4 pl-12 text-center text-lg font-bold tracking-widest text-gold-light outline-none transition placeholder:text-cream/30 focus:border-gold"
                dir="ltr"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                autoComplete="current-password"
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-cream/50 transition hover:text-gold-light"
                aria-label="إظهار كلمة المرور"
              >
                {showPw ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {err && (
              <p className="mt-3 rounded-xl bg-rose-soft/20 px-4 py-2.5 text-sm font-bold text-rose-200">
                {err}
              </p>
            )}
            <button
              onClick={login}
              disabled={busy || password.length < 4}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-base font-extrabold text-teal-dark shadow-xl shadow-gold/25 transition hover:-translate-y-0.5 disabled:opacity-40"
            >
              {busy ? <Loader2 size={19} className="animate-spin" /> : "تسجيل الدخول"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────── لوحة التحكم ─────────
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* القائمة الجانبية */}
      <aside className="shrink-0 lg:w-64">
        <div className="rounded-3xl bg-teal-dark p-4 shadow-xl shadow-teal-deep/20 plus-pattern-dark lg:sticky lg:top-28">
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 px-2 pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-gold text-teal-dark">
              <LighthouseIcon size={20} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-black text-white">
                لوحة الإدارة
              </p>
              <p className="text-[10px] font-bold text-gold-light/80">
                مستشفى برج النور الخيري
              </p>
            </div>
          </div>

          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                  tab === t.id
                    ? "bg-gold text-teal-dark shadow-lg shadow-gold/25"
                    : "text-cream/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-5 flex gap-1.5 border-t border-white/10 pt-4 lg:flex-col">
            <Link
              href="/"
              className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-cream/70 transition hover:bg-white/10"
            >
              <LighthouseIcon size={18} />
              عرض الموقع
            </Link>
            <button
              onClick={logout}
              className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-200/90 transition hover:bg-rose-500/20"
            >
              <LogOut size={18} />
              تسجيل خروج
            </button>
          </div>
        </div>
      </aside>

      {/* المحتوى */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {tab === "stats" && <StatsView />}
            {tab === "doctors" && <DoctorsView />}
            {tab === "departments" && <DepartmentsView />}
            {tab === "appointments" && <AppointmentsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
