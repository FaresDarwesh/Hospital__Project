import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors, schedules } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const deptId = Number(searchParams.get("departmentId"));

  const conditions = [eq(doctors.active, true)];
  if (Number.isFinite(deptId) && deptId > 0) {
    conditions.push(eq(doctors.departmentId, deptId));
  }

  const rows = await db
    .select({
      d: doctors,
      deptName: departments.name,
      deptColor: departments.color,
      deptIcon: departments.icon,
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(and(...conditions))
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
