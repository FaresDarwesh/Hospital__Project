import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { setAssistantCookie, verifyAccessPassword } from "@/lib/auth";
import { clientIp, consumeRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const departmentId = Number(body.departmentId);
  const password = String(body.password ?? "");
  if (!Number.isInteger(departmentId) || departmentId < 1 || password.length < 1 || password.length > 200) {
    return NextResponse.json({ ok: false, message: "اختر القسم واكتب كلمة المرور" }, { status: 400 });
  }

  const rl = consumeRateLimit(`department-login:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, message: `${RATE_LIMIT_MESSAGE} (${Math.ceil(rl.retryAfterSec / 60)} دقيقة)` }, { status: 429 });
  }

  const [department] = await db.select().from(departments).where(eq(departments.id, departmentId));
  const valid = Boolean(department && verifyAccessPassword(password, department.accessPasswordHash));
  if (!department || !valid) {
    return NextResponse.json({ ok: false, message: "القسم أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const [doctor] = await db.select().from(doctors).where(eq(doctors.departmentId, departmentId)).limit(1);
  await setAssistantCookie(departmentId);
  return NextResponse.json({
    ok: true,
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
