import crypto from "crypto";
import { NextResponse } from "next/server";
import { RECEPTION_PASSWORD, setReceptionCookie } from "@/lib/auth";
import { clientIp, consumeRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password ?? "");
  const rl = consumeRateLimit(`reception-login:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, message: `${RATE_LIMIT_MESSAGE} (${Math.ceil(rl.retryAfterSec / 60)} دقيقة)` }, { status: 429 });
  }
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(RECEPTION_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, message: "كلمة المرور غير صحيحة" }, { status: 401 });
  }
  await setReceptionCookie();
  return NextResponse.json({ ok: true });
}
