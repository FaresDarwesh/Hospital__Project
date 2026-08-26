import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { setAssistantCookie } from "@/lib/auth";
import {
  clientIp,
  consumeRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/ratelimit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();

  if (!code || code.length > 12) {
    return NextResponse.json(
      { ok: false, message: "من فضلك اكتب كود الطبيب" },
      { status: 400 }
    );
  }

  // حماية من تخمين الأكواد: ٥ محاولات فاشلة / ١٠ دقائق لكل IP
  const ip = clientIp(req);
  const rl = consumeRateLimit(`asst-login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: `${RATE_LIMIT_MESSAGE} (${Math.ceil(rl.retryAfterSec / 60)} دقيقة)`,
      },
      { status: 429 }
    );
  }

  const [row] = await db
    .select({
      d: doctors,
      deptName: departments.name,
      deptColor: departments.color,
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(sql`upper(${doctors.code}) = ${code}`);

  if (!row || !row.d.active) {
    return NextResponse.json(
      { ok: false, message: "الكود غير صحيح — تأكد من الكود مع إدارة المستشفى" },
      { status: 401 }
    );
  }

  await setAssistantCookie(row.d.id);
  return NextResponse.json({
    ok: true,
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
