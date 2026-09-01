import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors, schedules } from "@/db/schema";
import { isReception } from "@/lib/auth";

export async function GET() {
  if (!(await isReception())) return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  const depts = await db.select().from(departments).orderBy(asc(departments.id));
  const docs = await db.select().from(doctors).where(eq(doctors.active, true)).orderBy(asc(doctors.id));
  const sched = await db.select().from(schedules);
  return NextResponse.json({ ok: true, departments: depts.map(({ accessPasswordHash: _hash, ...d }) => d), doctors: docs.map((d) => ({ ...d, schedules: sched.filter((s) => s.doctorId === d.id) })) });
}
