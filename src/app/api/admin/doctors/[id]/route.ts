import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { doctors, schedules } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { isTimeStr } from "@/lib/time";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const doctorId = Number(id);
  if (!Number.isFinite(doctorId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim().length >= 5)
    updates.name = body.name.trim().slice(0, 80);
  if (typeof body.title === "string") updates.title = body.title.trim().slice(0, 60);
  if (typeof body.bio === "string") updates.bio = body.bio.trim().slice(0, 500);
  if (typeof body.image === "string") {
    const img = body.image.trim();
    // السماح فقط بمسارات صور محلية آمنة
    if (img === "" || /^\/images\/[\w.\-]+$/.test(img)) updates.image = img;
  }
  if (typeof body.reservationFee === "string")
    updates.reservationFee = body.reservationFee.trim().slice(0, 40);
  if (Number.isFinite(Number(body.departmentId)))
    updates.departmentId = Number(body.departmentId);
  if (typeof body.active === "boolean") updates.active = body.active;
  if (typeof body.code === "string" && body.code.trim()) {
    const code = body.code.trim().toUpperCase().slice(0, 12);
    if (!/^[A-Z0-9-]{2,12}$/.test(code)) {
      return NextResponse.json(
        { ok: false, message: "صيغة الكود غير صحيحة" },
        { status: 400 }
      );
    }
    const clash = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(sql`upper(${doctors.code}) = ${code} and ${doctors.id} <> ${doctorId}`);
    if (clash.length > 0) {
      return NextResponse.json(
        { ok: false, message: `الكود ${code} مستخدم من قبل` },
        { status: 409 }
      );
    }
    updates.code = code;
  }

  await db.transaction(async (tx) => {
    if (Object.keys(updates).length > 0) {
      await tx.update(doctors).set(updates).where(eq(doctors.id, doctorId));
    }
    if (Array.isArray(body.schedules)) {
      const rows = body.schedules
        .map((s: Record<string, unknown>) => ({
          dayOfWeek: Number(s.dayOfWeek),
          startTime: String(s.startTime ?? ""),
          endTime: String(s.endTime ?? ""),
          slotMinutes: Number(s.slotMinutes) || 15,
        }))
        .filter(
          (s: { dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }) =>
            s.dayOfWeek >= 0 &&
            s.dayOfWeek <= 6 &&
            isTimeStr(s.startTime) &&
            isTimeStr(s.endTime) &&
            s.endTime > s.startTime
        );
      await tx.delete(schedules).where(eq(schedules.doctorId, doctorId));
      if (rows.length > 0) {
        await tx.insert(schedules).values(
          rows.map((s: { dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }) => ({ ...s, doctorId }))
        );
      }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const doctorId = Number(id);
  if (!Number.isFinite(doctorId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await db.delete(doctors).where(eq(doctors.id, doctorId));
  return NextResponse.json({ ok: true });
}
