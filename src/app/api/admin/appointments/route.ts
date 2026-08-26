import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, departments, doctors } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { isDateStr } from "@/lib/time";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const doctorId = Number(searchParams.get("doctorId"));
  const deptId = Number(searchParams.get("departmentId"));

  const conds = [];
  if (isDateStr(date)) conds.push(eq(appointments.date, date));
  if (Number.isFinite(doctorId) && doctorId > 0)
    conds.push(eq(appointments.doctorId, doctorId));
  if (Number.isFinite(deptId) && deptId > 0)
    conds.push(eq(doctors.departmentId, deptId));

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
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(appointments.date), asc(appointments.time))
    .limit(400);

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
