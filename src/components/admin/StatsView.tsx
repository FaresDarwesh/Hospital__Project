"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  CalendarClock,
  Loader2,
  RefreshCw,
  Stethoscope,
  Users,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";
import { SHORT_AR_DAYS, dayOfWeekOf } from "@/lib/time";

const toAr = (v: number | string) =>
  String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

type Stats = {
  total: number;
  patients: number;
  today: number;
  upcoming: number;
  doctors: number;
  departments: number;
  perDept: { name: string; color: string; v: number }[];
  trend: { date: string; count: number }[];
  todayByDoctor: {
    id: number;
    name: string;
    deptName: string | null;
    total: number;
    done: number;
    inside: number;
  }[];
};

export default function StatsView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    if (data.ok) setStats(data.stats);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="animate-spin text-teal" size={36} />
      </div>
    );
  }

  const kpis = [
    { label: "حالات اليوم", v: stats.today, icon: CalendarCheck, chip: "bg-gold/15 text-gold" },
    { label: "إجمالي الحالات", v: stats.total, icon: ClipboardList, chip: "bg-mint text-teal" },
    { label: "مواعيد قادمة", v: stats.upcoming, icon: CalendarClock, chip: "bg-mint text-teal" },
    { label: "مرضى فريدون", v: stats.patients, icon: Users, chip: "bg-mint text-teal" },
    { label: "الأطباء", v: stats.doctors, icon: Stethoscope, chip: "bg-mint text-teal" },
    { label: "الأقسام", v: stats.departments, icon: LayoutGrid, chip: "bg-mint text-teal" },
  ];

  const trendData = stats.trend.map((t) => ({
    day: `${t.date.slice(8)}/${t.date.slice(5, 7)}`,
    weekDay: SHORT_AR_DAYS[dayOfWeekOf(t.date)],
    count: t.count,
  }));

  const maxToday = Math.max(1, ...stats.todayByDoctor.map((d) => d.total));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black text-teal-dark">
          نظرة عامة على الحالات
        </h2>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-teal/20 bg-white px-4 py-2.5 text-xs font-extrabold text-teal-deep transition hover:bg-mint"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* بطاقات الأرقام */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="group rounded-3xl border border-teal/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className={`mb-3 grid size-11 place-items-center rounded-xl ${k.chip} transition group-hover:scale-110`}
            >
              <k.icon size={20} strokeWidth={1.9} />
            </span>
            <p className="font-display text-3xl font-black text-teal-dark">
              {toAr(k.v)}
            </p>
            <p className="mt-0.5 text-xs font-bold text-ink-soft">{k.label}</p>
          </div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-teal/10 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-display text-base font-extrabold text-teal-dark">
            عدد الحالات في كل قسم
          </h3>
          <div dir="ltr" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perDept} margin={{ top: 5, right: 5, left: -18, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f6b5e10" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#46615b", fontWeight: 700 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#46615b" }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#0f6b5e08" }}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #0f6b5e20",
                    fontSize: 12,
                    fontWeight: 800,
                    direction: "rtl",
                  }}
                  formatter={(v) => [`${toAr(Number(v))} حالة`, "الحالات"] as never}
                />
                <Bar dataKey="v" radius={[8, 8, 0, 0]} maxBarSize={42}>
                  {stats.perDept.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-teal/10 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-display text-base font-extrabold text-teal-dark">
            معدل الحجوزات — آخر ١٤ يومًا
          </h3>
          <div dir="ltr" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f6b5e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f6b5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f6b5e10" vertical={false} />
                <XAxis
                  dataKey="weekDay"
                  tick={{ fontSize: 10, fill: "#46615b", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#46615b" }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #0f6b5e20",
                    fontSize: 12,
                    fontWeight: 800,
                    direction: "rtl",
                  }}
                  formatter={(v) => [`${toAr(Number(v))} حجز`, "الحجوزات"] as never}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0f6b5e"
                  strokeWidth={3}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* حالات اليوم حسب الطبيب */}
      <div className="rounded-3xl border border-teal/10 bg-white p-6 shadow-sm">
        <h3 className="mb-5 font-display text-base font-extrabold text-teal-dark">
          حالات اليوم حسب الطبيب
        </h3>
        {stats.todayByDoctor.length === 0 ? (
          <p className="rounded-2xl bg-sand/60 p-6 text-center text-sm font-bold text-ink-soft">
            لا توجد حجوزات اليوم
          </p>
        ) : (
          <div className="space-y-4">
            {stats.todayByDoctor.map((d) => (
              <div key={d.id} className="flex items-center gap-4">
                <div className="w-44 shrink-0">
                  <p className="truncate text-sm font-extrabold text-teal-dark">
                    {d.name}
                  </p>
                  <p className="truncate text-[11px] font-bold text-ink-soft">
                    {d.deptName}
                  </p>
                </div>
                <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-sand">
                  <div
                    className="absolute inset-y-0 right-0 rounded-full bg-teal/25"
                    style={{ width: `${(d.total / maxToday) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-teal to-teal-deep"
                    style={{ width: `${(d.done / maxToday) * 100}%` }}
                  />
                </div>
                <div className="flex shrink-0 gap-3 text-[11px] font-extrabold">
                  <span className="text-ink-soft">الكل: {toAr(d.total)}</span>
                  <span className="text-gold">داخل: {toAr(d.inside)}</span>
                  <span className="text-teal">تم: {toAr(d.done)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
