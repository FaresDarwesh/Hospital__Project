import { NextResponse } from "next/server";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, departments, doctors } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { addDaysStr, todayCairo } from "@/lib/time";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const today = todayCairo();

  const [[total], [patients], [todayTotal], [upcoming], [docs], [depts]] =
    await Promise.all([
      db.select({ v: count() }).from(appointments),
      db.select({ v: sql<number>`count(distinct ${appointments.phone})` }).from(appointments),
      db.select({ v: count() }).from(appointments).where(eq(appointments.date, today)),
      db.select({ v: count() }).from(appointments).where(gte(appointments.date, today)),
      db.select({ v: count() }).from(doctors),
      db.select({ v: count() }).from(departments),
    ]);

  // الحالات لكل قسم
  const perDept = await db
    .select({
      name: departments.name,
      color: departments.color,
      v: count(appointments.id),
    })
    .from(departments)
    .leftJoin(doctors, eq(doctors.departmentId, departments.id))
    .leftJoin(appointments, eq(appointments.doctorId, doctors.id))
    .groupBy(departments.name, departments.color, departments.id)
    .orderBy(departments.id);

  // الحالات آخر ١٤ يوم
  const fromDate = addDaysStr(today, -13);
  const trendRows = await db
    .select({ date: appointments.date, v: count() })
    .from(appointments)
    .where(gte(appointments.date, fromDate))
    .groupBy(appointments.date);
  const trendMap = new Map(trendRows.map((r) => [r.date, r.v]));
  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = addDaysStr(fromDate, i);
    return { date: d, count: trendMap.get(d) ?? 0 };
  });

  // حالات اليوم لكل طبيب
  const todayByDoctor = await db
    .select({
      id: doctors.id,
      name: doctors.name,
      deptName: departments.name,
      total: count(appointments.id),
      done: sql<number>`count(*) filter (where ${appointments.status} = 'completed')`,
      inside: sql<number>`count(*) filter (where ${appointments.status} = 'checked_in')`,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(and(eq(appointments.date, today)))
    .groupBy(doctors.id, doctors.name, departments.name);

  return NextResponse.json({
    ok: true,
    stats: {
      total: total.v,
      patients: patients.v,
      today: todayTotal.v,
      upcoming: upcoming.v,
      doctors: docs.v,
      departments: depts.v,
      perDept,
      trend,
      todayByDoctor,
    },
  });
}
