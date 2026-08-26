import { NextResponse } from "next/server";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, departments, doctors } from "@/db/schema";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const rows = await db.select().from(departments).orderBy(departments.id);
  const docCounts = await db
    .select({ departmentId: doctors.departmentId, v: count() })
    .from(doctors)
    .groupBy(doctors.departmentId);
  const caseCounts = await db
    .select({ departmentId: doctors.departmentId, v: count(appointments.id) })
    .from(doctors)
    .leftJoin(appointments, eq(appointments.doctorId, doctors.id))
    .groupBy(doctors.departmentId);

  const dcMap = new Map(docCounts.map((r) => [r.departmentId, r.v]));
  const ccMap = new Map(caseCounts.map((r) => [r.departmentId, r.v]));

  return NextResponse.json({
    ok: true,
    departments: rows.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
      color: d.color,
      doctorCount: dcMap.get(d.id) ?? 0,
      caseCount: ccMap.get(d.id) ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const VALID_ICONS = new Set([
    "stethoscope", "heart", "baby", "bone", "flower", "tooth", "sparkles",
    "ear", "brain", "eye", "activity", "syringe", "pill", "microscope",
    "bandage", "personstanding", "scaneheart",
  ]);

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 80);
  const description = String(body.description ?? "").trim().slice(0, 300);
  let icon = String(body.icon ?? "stethoscope").trim();
  if (!VALID_ICONS.has(icon)) icon = "stethoscope";
  let color = String(body.color ?? "#0F6B5E").trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) color = "#0F6B5E";

  if (name.length < 3) {
    return NextResponse.json(
      { ok: false, message: "اسم القسم مطلوب" },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: departments.id })
    .from(departments)
    .where(sql`${departments.name} = ${name}`);
  if (existing.length > 0) {
    return NextResponse.json(
      { ok: false, message: "هذا القسم موجود بالفعل" },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(departments)
    .values({ name, description, icon, color })
    .returning();

  return NextResponse.json({ ok: true, department: created }, { status: 201 });
}
