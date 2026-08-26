import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors, schedules } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { isTimeStr } from "@/lib/time";

type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

function validSchedules(input: unknown): ScheduleInput[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((s) => ({
      dayOfWeek: Number((s as ScheduleInput).dayOfWeek),
      startTime: String((s as ScheduleInput).startTime ?? ""),
      endTime: String((s as ScheduleInput).endTime ?? ""),
      slotMinutes: Number((s as ScheduleInput).slotMinutes) || 15,
    }))
    .filter(
      (s) =>
        s.dayOfWeek >= 0 &&
        s.dayOfWeek <= 6 &&
        isTimeStr(s.startTime) &&
        isTimeStr(s.endTime) &&
        s.endTime > s.startTime
    );
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const rows = await db
    .select({ d: doctors, deptName: departments.name, deptColor: departments.color, deptIcon: departments.icon })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .orderBy(doctors.id);

  const ids = rows.map((r) => r.d.id);
  const scheds = ids.length
    ? await db.select().from(schedules).where(inArray(schedules.doctorId, ids))
    : [];

  return NextResponse.json({
    ok: true,
    doctors: rows.map(({ d, deptName, deptColor, deptIcon }) => ({
      id: d.id,
      name: d.name,
      title: d.title,
      departmentId: d.departmentId,
      departmentName: deptName ?? "",
      departmentColor: deptColor ?? "#0f6b5e",
      departmentIcon: deptIcon ?? "activity",
      code: d.code,
      bio: d.bio,
      image: d.image,
      reservationFee: d.reservationFee,
      active: d.active,
      schedules: scheds
        .filter((s) => s.doctorId === d.id)
        .map((s) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotMinutes: s.slotMinutes,
        })),
    })),
  });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 80);
  const title = String(body.title ?? "").trim().slice(0, 60) || "أخصائي";
  const departmentId = Number(body.departmentId);
  const bio = String(body.bio ?? "").trim().slice(0, 500);
  // السماح فقط بمسارات صور محلية آمنة (منع حقن روابط خارجية)
  let image = String(body.image ?? "").trim();
  if (image && !/^\/images\/[\w.\-]+$/.test(image)) image = "";
  const reservationFee = String(body.reservationFee ?? "").trim().slice(0, 40) || "كشف رمزي";
  let code = String(body.code ?? "").trim().toUpperCase().slice(0, 12);
  const schedInput = validSchedules(body.schedules);

  if (name.length < 5 || !Number.isFinite(departmentId)) {
    return NextResponse.json(
      { ok: false, message: "اسم الطبيب والقسم مطلوبان" },
      { status: 400 }
    );
  }
  if (schedInput.length === 0) {
    return NextResponse.json(
      { ok: false, message: "أضِف يوم عمل واحد على الأقل في جدول الطبيب" },
      { status: 400 }
    );
  }

  if (code && !/^[A-Z0-9-]{2,12}$/.test(code)) {
    return NextResponse.json(
      { ok: false, message: "صيغة الكود غير صحيحة — حروف إنجليزية وأرقام وشرطة فقط" },
      { status: 400 }
    );
  }

  if (!code) {
    const all = await db.select({ c: doctors.code }).from(doctors);
    const maxNum = all.reduce((acc, r) => {
      const m = r.c.match(/(\d+)$/);
      return Math.max(acc, m ? Number(m[1]) : 100);
    }, 100);
    code = `BN-${maxNum + 1}`;
  }

  const existing = await db
    .select({ id: doctors.id })
    .from(doctors)
    .where(eq(doctors.code, code));
  if (existing.length > 0) {
    return NextResponse.json(
      { ok: false, message: `الكود ${code} مستخدم من قبل — اختر كودًا آخر` },
      { status: 409 }
    );
  }

  const created = await db.transaction(async (tx) => {
    const [doc] = await tx
      .insert(doctors)
      .values({ name, title, departmentId, code, bio, image, reservationFee })
      .returning();
    await tx.insert(schedules).values(
      schedInput.map((s) => ({ ...s, doctorId: doc.id }))
    );
    return doc;
  });

  return NextResponse.json({ ok: true, doctor: created }, { status: 201 });
}
