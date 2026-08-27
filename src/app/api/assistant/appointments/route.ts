import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors } from "@/db/schema";
import { getAssistantDepartmentId } from "@/lib/auth";
import { isDateStr, todayCairo } from "@/lib/time";

export async function GET(req: Request) {
  const departmentId = await getAssistantDepartmentId();
  if (!departmentId) {
    return NextResponse.json(
      { ok: false, message: "غير مصرّح — سجّل الدخول أولًا" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const date = isDateStr(dateParam) ? dateParam : todayCairo();

  const rows = await db
    .select()
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(and(eq(doctors.departmentId, departmentId), eq(appointments.date, date)))
    .orderBy(asc(appointments.time));

  const appointmentsForDepartment = rows.map(({ appointments }) => appointments);
  const summary = {
    total: appointmentsForDepartment.length,
    waiting: appointmentsForDepartment.filter((r) => r.status === "confirmed").length,
    inside: appointmentsForDepartment.filter((r) => r.status === "checked_in").length,
    done: appointmentsForDepartment.filter((r) => r.status === "completed").length,
    absent: appointmentsForDepartment.filter((r) => r.status === "no_show").length,
  };

  return NextResponse.json({ ok: true, date, appointments: appointmentsForDepartment, summary });
}
