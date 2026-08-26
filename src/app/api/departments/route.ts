import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export async function GET() {
  await ensureSeeded();
  const rows = await db
    .select({ d: departments, dc: count(doctors.id) })
    .from(departments)
    .leftJoin(doctors, eq(doctors.departmentId, departments.id))
    .groupBy(departments.id)
    .orderBy(departments.id);

  return NextResponse.json({
    ok: true,
    departments: rows.map(({ d, dc }) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
      color: d.color,
      doctorCount: dc,
    })),
  });
}
