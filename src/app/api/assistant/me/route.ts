import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { getAssistantDoctorId } from "@/lib/auth";

export async function GET() {
  const doctorId = await getAssistantDoctorId();
  if (!doctorId) {
    return NextResponse.json({ ok: true, authed: false });
  }

  const [row] = await db
    .select({
      d: doctors,
      deptName: departments.name,
      deptColor: departments.color,
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(eq(doctors.id, doctorId));

  if (!row) {
    return NextResponse.json({ ok: true, authed: false });
  }

  return NextResponse.json({
    ok: true,
    authed: true,
    doctor: {
      id: row.d.id,
      name: row.d.name,
      title: row.d.title,
      departmentName: row.deptName ?? "",
      departmentColor: row.deptColor ?? "#0f6b5e",
      image: row.d.image,
      code: row.d.code,
    },
  });
}
