import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getAssistantDoctorId } from "@/lib/auth";
import { isDateStr, todayCairo } from "@/lib/time";

export async function GET(req: Request) {
  const doctorId = await getAssistantDoctorId();
  if (!doctorId) {
    return NextResponse.json(
      { ok: false, message: "غير مصرّح — سجّل الدخول أولًا" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const date = isDateStr(dateParam) ? dateParam : todayCairo();

  const rows = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.doctorId, doctorId), eq(appointments.date, date)))
    .orderBy(asc(appointments.time));

  const summary = {
    total: rows.length,
    waiting: rows.filter((r) => r.status === "confirmed").length,
    inside: rows.filter((r) => r.status === "checked_in").length,
    done: rows.filter((r) => r.status === "completed").length,
    absent: rows.filter((r) => r.status === "no_show").length,
  };

  return NextResponse.json({ ok: true, date, appointments: rows, summary });
}
