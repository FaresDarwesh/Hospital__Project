import crypto from "crypto";
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, departments, doctors, schedules } from "@/db/schema";
import {
  addDaysStr,
  dayOfWeekOf,
  generateSlots,
  isDateStr,
  isTimeStr,
  nowCairoMinutes,
  toMinutes,
  todayCairo,
} from "@/lib/time";
import {
  clientIp,
  consumeRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/ratelimit";

function normPhone(p: unknown): string {
  return String(p ?? "").replace(/[\s\-+]/g, "").replace(/^20/, "0");
}

export async function GET(req: Request) {
  // حماية من محاولات تخمين بيانات المرضى: ٣٠ استعلام / ١٠ دقائق لكل IP
  const rlTrack = consumeRateLimit(`track:${clientIp(req)}`, 30, 10 * 60 * 1000);
  if (!rlTrack.allowed) {
    return NextResponse.json(
      { ok: false, message: RATE_LIMIT_MESSAGE },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const phone = normPhone(searchParams.get("phone"));
  const code = String(searchParams.get("code") ?? "").trim().toUpperCase();

  if (!/^01\d{9}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, message: "اكتب رقم الموبايل المكوّن من 11 رقمًا" },
      { status: 400 }
    );
  }

  const conds = [eq(appointments.phone, phone)];
  if (code) conds.push(eq(appointments.refCode, code));

  const rows = await db
    .select({
      a: appointments,
      doctorName: doctors.name,
      doctorTitle: doctors.title,
      deptName: departments.name,
      deptColor: departments.color,
    })
    .from(appointments)
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(and(...conds))
    .orderBy(desc(appointments.date), desc(appointments.time))
    .limit(10);

  return NextResponse.json({
    ok: true,
    appointments: rows.map(({ a, doctorName, doctorTitle, deptName, deptColor }) => ({
      ...a,
      doctorName,
      doctorTitle,
      departmentName: deptName,
      departmentColor: deptColor,
    })),
  });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "طلب غير صالح" },
      { status: 400 }
    );
  }

  const doctorId = Number(body.doctorId);
  const date = body.date;
  const time = body.time;
  const patientName = String(body.patientName ?? "").trim();
  const phone = normPhone(body.phone);
  const address = String(body.address ?? "").trim();
  const age = Number(body.age);
  const visitType = body.visitType === "followup" ? "followup" : "new";
  const notes = String(body.notes ?? "").trim().slice(0, 500);

  // ═══ حماية من السبام: حد أقصى للحجوزات لكل IP ولكل هاتف ═══
  const rlIp = consumeRateLimit(`book:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!rlIp.allowed) {
    return NextResponse.json(
      { ok: false, message: RATE_LIMIT_MESSAGE },
      { status: 429 }
    );
  }
  if (/^01\d{9}$/.test(phone)) {
    const rlPhone = consumeRateLimit(`bookph:${phone}`, 3, 10 * 60 * 1000);
    if (!rlPhone.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "عدد كبير من الحجوزات بهذا الرقم خلال وقت قصير — انتظر قليلًا",
        },
        { status: 429 }
      );
    }
  }

  // ═══ التحقق من البيانات ═══
  if (!Number.isFinite(doctorId) || !isDateStr(date) || !isTimeStr(time)) {
    return NextResponse.json(
      { ok: false, message: "بيانات الموعد غير مكتملة" },
      { status: 400 }
    );
  }
  if (patientName.length < 5) {
    return NextResponse.json(
      { ok: false, message: "من فضلك اكتب الاسم بالكامل" },
      { status: 400 }
    );
  }
  if (!/^01\d{9}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, message: "رقم الموبايل غير صحيح — مثال: 01012345678" },
      { status: 400 }
    );
  }
  if (address.length < 3) {
    return NextResponse.json(
      { ok: false, message: "من فضلك اكتب عنوان السكن" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return NextResponse.json(
      { ok: false, message: "من فضلك اكتب السن بشكل صحيح" },
      { status: 400 }
    );
  }

  const today = todayCairo();
  if (date < today || date > addDaysStr(today, 30)) {
    return NextResponse.json(
      { ok: false, message: "الحجز متاح خلال 30 يومًا فقط" },
      { status: 400 }
    );
  }
  if (date === today && toMinutes(time as string) <= nowCairoMinutes()) {
    return NextResponse.json(
      { ok: false, message: "هذا الموعد فات — اختر موعدًا لاحقًا" },
      { status: 400 }
    );
  }

  // ═══ التحقق من الطبيب وجدوله ═══
  const [doc] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, doctorId));
  if (!doc || !doc.active) {
    return NextResponse.json(
      { ok: false, message: "الطبيب غير متاح للحجز حاليًا" },
      { status: 404 }
    );
  }

  const schedRows = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.doctorId, doctorId),
        eq(schedules.dayOfWeek, dayOfWeekOf(date as string))
      )
    );
  const slotValid = schedRows.some((s) =>
    generateSlots(s.startTime, s.endTime, s.slotMinutes).includes(time as string)
  );
  if (!slotValid) {
    return NextResponse.json(
      { ok: false, message: "هذا الموعد غير متاح في جدول الطبيب" },
      { status: 400 }
    );
  }

  // ═══ إنشاء الحجز داخل معاملة (منع الحجز المزدوج) ═══
  try {
    const created = await db.transaction(async (tx) => {
      const clash = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, doctorId),
            eq(appointments.date, date as string),
            eq(appointments.time, time as string)
          )
        )
        .limit(1);
      if (clash.length > 0) throw new Error("SLOT_TAKEN");

      const last = await tx
        .select({ q: appointments.queueNumber })
        .from(appointments)
        .where(
          and(eq(appointments.doctorId, doctorId), eq(appointments.date, date as string))
        )
        .orderBy(desc(appointments.queueNumber))
        .limit(1);

      const refCode = `BN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const rows = await tx
        .insert(appointments)
        .values({
          refCode,
          doctorId,
          date: date as string,
          time: time as string,
          queueNumber: (last[0]?.q ?? 0) + 1,
          patientName,
          phone,
          address,
          age,
          visitType,
          notes,
        })
        .returning();
      return rows[0];
    });

    const [dept] = await db
      .select({ name: departments.name, color: departments.color })
      .from(departments)
      .where(eq(departments.id, doc.departmentId));

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          ...created,
          doctorName: doc.name,
          doctorTitle: doc.title,
          departmentName: dept?.name ?? "",
          departmentColor: dept?.color ?? "#0f6b5e",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "SLOT_TAKEN" || msg.includes("appointments_unique_slot")) {
      return NextResponse.json(
        {
          ok: false,
          message: "للأسف حُجز هذا الموعد للتو — من فضلك اختر موعدًا آخر",
          code: "SLOT_TAKEN",
        },
        { status: 409 }
      );
    }
    console.error("booking error:", err);
    return NextResponse.json(
      { ok: false, message: "حدث خطأ أثناء الحجز — حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
