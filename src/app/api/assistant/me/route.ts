import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { getAssistantDepartmentId } from "@/lib/auth";

export async function GET() {
  const departmentId = await getAssistantDepartmentId();
  if (!departmentId) return NextResponse.json({ ok: true, authed: false });

  const [department] = await db.select().from(departments).where(eq(departments.id, departmentId));
  if (!department) return NextResponse.json({ ok: true, authed: false });
  const [doctor] = await db.select().from(doctors).where(eq(doctors.departmentId, departmentId)).limit(1);

  return NextResponse.json({
    ok: true,
    authed: true,
    doctor: {
      id: doctor?.id ?? 0,
      name: `طاقم ${department.name}`,
      title: "متابعة حجوزات القسم",
      departmentName: department.name,
      departmentColor: department.color,
      image: doctor?.image ?? "/images/doctor-placeholder.jpg",
      code: `DEPT-${department.id}`,
    },
  });
}
