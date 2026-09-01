import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors } from "@/db/schema";
import { getAssistantDepartmentId, isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// تعديل حالة الحجز (للأدمن أو مساعد الطبيب صاحب الحجز)
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const apptId = Number(id);
  if (!Number.isFinite(apptId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");
  const valid = ["confirmed", "checked_in", "completed", "no_show", "late"];
  if (!valid.includes(status)) {
    return NextResponse.json(
      { ok: false, message: "حالة غير صالحة" },
      { status: 400 }
    );
  }

  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, apptId));
  if (!appt) {
    return NextResponse.json(
      { ok: false, message: "الحجز غير موجود" },
      { status: 404 }
    );
  }

  const admin = await isAdmin();
  const assistantDepartmentId = await getAssistantDepartmentId();
  let assistantAllowed = false;
  if (assistantDepartmentId) {
    const [doctor] = await db.select({ departmentId: doctors.departmentId }).from(doctors).where(eq(doctors.id, appt.doctorId));
    assistantAllowed = doctor?.departmentId === assistantDepartmentId;
  }
  if (!admin && !assistantAllowed) {
    return NextResponse.json(
      { ok: false, message: "غير مصرّح" },
      { status: 401 }
    );
  }

  const [updated] = await db
    .update(appointments)
    .set({ status, checkedInAt: status === "checked_in" ? new Date() : status === "confirmed" ? null : appt.checkedInAt })
    .where(eq(appointments.id, apptId))
    .returning();

  return NextResponse.json({ ok: true, appointment: updated });
}

// إلغاء الحجز — للأدمن مباشرة أو للمريض بعد التحقق من الهاتف والكود
export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const apptId = Number(id);
  if (!Number.isFinite(apptId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, apptId));
  if (!appt) {
    return NextResponse.json(
      { ok: false, message: "الحجز غير موجود" },
      { status: 404 }
    );
  }

  const admin = await isAdmin();
  if (!admin) {
    const body = await req.json().catch(() => ({}));
    const phone = String(body.phone ?? "").replace(/[\s\-+]/g, "");
    const code = String(body.code ?? "").trim().toUpperCase();
    if (appt.phone !== phone || appt.refCode !== code) {
      return NextResponse.json(
        { ok: false, message: "بيانات التحقق غير صحيحة" },
        { status: 403 }
      );
    }
  }

  await db.delete(appointments).where(eq(appointments.id, apptId));
  return NextResponse.json({ ok: true });
}
