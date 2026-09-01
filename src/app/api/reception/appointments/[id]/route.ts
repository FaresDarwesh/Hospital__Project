import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, schedules } from "@/db/schema";
import { isReception } from "@/lib/auth";
import { dayOfWeekOf, generateSlots, isDateStr, isTimeStr } from "@/lib/time";

type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isReception())) return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  const id = Number((await ctx.params).id);
  const b = await req.json().catch(() => ({}));
  const [current] = await db.select().from(appointments).where(eq(appointments.id, id));
  if (!current) return NextResponse.json({ ok: false, message: "الحجز غير موجود" }, { status: 404 });
  const status = b.status ? String(b.status) : current.status;
  if (!["confirmed", "checked_in", "completed", "no_show"].includes(status)) return NextResponse.json({ ok: false, message: "حالة غير صالحة" }, { status: 400 });
  const doctorId = b.doctorId === undefined ? current.doctorId : Number(b.doctorId);
  const date = b.date === undefined ? current.date : String(b.date);
  const time = b.time === undefined ? current.time : String(b.time);
  if (!Number.isInteger(doctorId) || !isDateStr(date) || !isTimeStr(time)) return NextResponse.json({ ok: false, message: "بيانات النقل غير صالحة" }, { status: 400 });
  const [doc] = await db.select().from(doctors).where(eq(doctors.id, doctorId));
  if (!doc?.active) return NextResponse.json({ ok: false, message: "الطبيب غير متاح" }, { status: 400 });
  if (doctorId !== current.doctorId || date !== current.date || time !== current.time) {
    const schedulesRows = await db.select().from(schedules).where(and(eq(schedules.doctorId, doctorId), eq(schedules.dayOfWeek, dayOfWeekOf(date))));
    if (!schedulesRows.some((s) => generateSlots(s.startTime, s.endTime, s.slotMinutes).includes(time))) return NextResponse.json({ ok: false, message: "الموعد غير موجود في جدول الطبيب" }, { status: 400 });
    const clash = await db.select({ id: appointments.id }).from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.date, date), eq(appointments.time, time))).limit(1);
    if (clash.length && clash[0].id !== id) return NextResponse.json({ ok: false, message: "الموعد محجوز بالفعل" }, { status: 409 });
  }
  const [updated] = await db.update(appointments).set({ doctorId, date, time, status }).where(eq(appointments.id, id)).returning();
  return NextResponse.json({ ok: true, appointment: updated });
}
