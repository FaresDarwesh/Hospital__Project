import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, schedules } from "@/db/schema";
import {
  AR_DAYS,
  addDaysStr,
  dayOfWeekOf,
  generateSlots,
  isDateStr,
  nowCairoMinutes,
  toMinutes,
  todayCairo,
} from "@/lib/time";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = Number(searchParams.get("doctorId"));
  const date = searchParams.get("date") ?? "";

  if (!Number.isFinite(doctorId) || doctorId <= 0 || !isDateStr(date)) {
    return NextResponse.json(
      { ok: false, message: "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const today = todayCairo();
  if (date < today || date > addDaysStr(today, 30)) {
    return NextResponse.json({
      ok: true,
      slots: [],
      message: "هذا اليوم خارج نطاق الحجز",
    });
  }

  const [doc] = await db
    .select({ id: doctors.id, active: doctors.active })
    .from(doctors)
    .where(eq(doctors.id, doctorId));
  if (!doc || !doc.active) {
    return NextResponse.json(
      { ok: false, message: "الطبيب غير متاح للحجز حاليًا" },
      { status: 404 }
    );
  }

  const dow = dayOfWeekOf(date);
  const scheds = await db
    .select()
    .from(schedules)
    .where(and(eq(schedules.doctorId, doctorId), eq(schedules.dayOfWeek, dow)));

  if (scheds.length === 0) {
    return NextResponse.json({
      ok: true,
      dayName: AR_DAYS[dow],
      slots: [],
    });
  }

  const takenRows = await db
    .select({ time: appointments.time })
    .from(appointments)
    .where(
      and(eq(appointments.doctorId, doctorId), eq(appointments.date, date))
    );
  const taken = new Set(takenRows.map((r) => r.time));

  const allSlots = new Set<string>();
  for (const s of scheds) {
    for (const t of generateSlots(s.startTime, s.endTime, s.slotMinutes)) {
      allSlots.add(t);
    }
  }

  const nowMin = date === today ? nowCairoMinutes() : -1;
  const slots = [...allSlots].sort().map((time) => ({
    time,
    booked: taken.has(time) || toMinutes(time) <= nowMin,
  }));

  return NextResponse.json({ ok: true, dayName: AR_DAYS[dow], slots });
}
