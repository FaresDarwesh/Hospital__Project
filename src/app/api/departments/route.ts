import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { DEPARTMENTS, ensureSeeded } from "@/db/seed";

export async function GET() {
  if (process.env.PREVIEW_MODE === "true") {
    return NextResponse.json({
      ok: true,
      departments: DEPARTMENTS.map((d, index) => ({ id: index + 1, name: d.name, description: d.description, icon: d.icon, color: d.color, doctorCount: 1 })),
    });
  }
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
  }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}
