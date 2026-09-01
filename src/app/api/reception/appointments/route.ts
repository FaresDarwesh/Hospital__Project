import crypto from "crypto";
import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, departments, doctors, schedules } from "@/db/schema";
import { isReception } from "@/lib/auth";
import { addDaysStr, dayOfWeekOf, generateSlots, isDateStr, isTimeStr, nowCairoMinutes, toMinutes, todayCairo } from "@/lib/time";

type Body = Record<string, unknown>;
function phoneOf(v: unknown) { return String(v ?? "").replace(/[\s\-+]/g, "").replace(/^20/, "0"); }

async function validSlot(doctorId: number, date: string, time: string) {
  const rows = await db.select().from(schedules).where(and(eq(schedules.doctorId, doctorId), eq(schedules.dayOfWeek, dayOfWeekOf(date))));
  return rows.some((s) => generateSlots(s.startTime, s.endTime, s.slotMinutes).includes(time));
}

export async function GET(req: Request) {
  if (!(await isReception())) return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const date = q.get("date");
  const doctorId = Number(q.get("doctorId"));
  const departmentId = Number(q.get("departmentId"));
  const conditions = [];
  if (isDateStr(date)) conditions.push(eq(appointments.date, date));
  if (Number.isInteger(doctorId) && doctorId > 0) conditions.push(eq(appointments.doctorId, doctorId));
  if (Number.isInteger(departmentId) && departmentId > 0) conditions.push(eq(doctors.departmentId, departmentId));
  const rows = await db.select({ a: appointments, doctorName: doctors.name, doctorTitle: doctors.title, departmentName: departments.name, departmentColor: departments.color, queueMode: doctors.queueMode })
    .from(appointments).innerJoin(doctors, eq(appointments.doctorId, doctors.id)).innerJoin(departments, eq(doctors.departmentId, departments.id))
    .where(conditions.length ? and(...conditions) : undefined).orderBy(asc(appointments.date), asc(appointments.time)).limit(500);
  return NextResponse.json({ ok: true, appointments: rows.map(({ a, ...extra }) => ({ ...a, ...extra })) });
}

export async function POST(req: Request) {
  if (!(await isReception())) return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Body;
  const doctorId = Number(b.doctorId), date = String(b.date ?? ""), time = String(b.time ?? "");
  const patientName = String(b.patientName ?? "").trim().slice(0, 100), phone = phoneOf(b.phone);
  const address = String(b.address ?? "").trim().slice(0, 200), age = Number(b.age);
  const visitType = b.visitType === "followup" ? "followup" : "new";
  const notes = String(b.notes ?? "").trim().slice(0, 500);
  if (!Number.isInteger(doctorId) || !isDateStr(date) || !isTimeStr(time) || patientName.length < 5 || !/^01\d{9}$/.test(phone) || address.length < 3 || !Number.isInteger(age) || age < 1 || age > 120) {
    return NextResponse.json({ ok: false, message: "راجع بيانات المريض والموعد ورقم الهاتف" }, { status: 400 });
  }
  const today = todayCairo();
  if (date < today || date > addDaysStr(today, 30) || (date === today && toMinutes(time) <= nowCairoMinutes())) return NextResponse.json({ ok: false, message: "اختر موعدًا قادمًا خلال 30 يومًا" }, { status: 400 });
  const [doc] = await db.select().from(doctors).where(eq(doctors.id, doctorId));
  if (!doc?.active || !(await validSlot(doctorId, date, time))) return NextResponse.json({ ok: false, message: "الطبيب أو الموعد غير متاح" }, { status: 400 });
  try {
    const created = await db.transaction(async (tx) => {
      const clash = await tx.select({ id: appointments.id }).from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.date, date), eq(appointments.time, time))).limit(1);
      if (clash.length) throw new Error("SLOT_TAKEN");
      const last = await tx.select({ q: appointments.queueNumber }).from(appointments).where(and(eq(appointments.doctorId, doctorId), eq(appointments.date, date))).orderBy(desc(appointments.queueNumber)).limit(1);
      const [row] = await tx.insert(appointments).values({ refCode: `BN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, doctorId, date, time, queueNumber: (last[0]?.q ?? 0) + 1, patientName, phone, address, age, visitType, notes: notes ? `حجز استقبال: ${notes}` : "حجز استقبال" }).returning();
      return row;
    });
    return NextResponse.json({ ok: true, appointment: created }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && (e.message === "SLOT_TAKEN" || e.message.includes("appointments_unique_slot"))) return NextResponse.json({ ok: false, message: "الموعد حُجز للتو — اختر موعدًا آخر" }, { status: 409 });
    console.error("reception booking error", e);
    return NextResponse.json({ ok: false, message: "حدث خطأ أثناء الحجز" }, { status: 500 });
  }
}
