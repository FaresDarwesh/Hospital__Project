import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { hashAccessPassword, isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const deptId = Number(id);
  if (!Number.isFinite(deptId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const VALID_ICONS = new Set([
    "stethoscope", "heart", "baby", "bone", "flower", "tooth", "sparkles",
    "ear", "brain", "eye", "activity", "syringe", "pill", "microscope",
    "bandage", "personstanding", "scaneheart",
  ]);

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, string> = {};
  const password = typeof body.password === "string" ? body.password : "";
  if (password && password.length >= 8) updates.accessPasswordHash = hashAccessPassword(password);
  if (typeof body.name === "string" && body.name.trim().length >= 3)
    updates.name = body.name.trim().slice(0, 80);
  if (typeof body.description === "string")
    updates.description = body.description.trim().slice(0, 300);
  if (typeof body.icon === "string" && VALID_ICONS.has(body.icon.trim()))
    updates.icon = body.icon.trim();
  if (typeof body.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(body.color.trim()))
    updates.color = body.color.trim();

  if (Object.keys(updates).length > 0) {
    await db.update(departments).set(updates).where(eq(departments.id, deptId));
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const deptId = Number(id);
  if (!Number.isFinite(deptId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const [docs] = await db
    .select({ v: count() })
    .from(doctors)
    .where(eq(doctors.departmentId, deptId));
  if (docs.v > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "لا يمكن حذف قسم به أطباء — انقل الأطباء أو احذفهم أولًا",
      },
      { status: 409 }
    );
  }

  await db.delete(departments).where(eq(departments.id, deptId));
  return NextResponse.json({ ok: true });
}
