import crypto from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, setAdminCookie } from "@/lib/auth";
import {
  clientIp,
  consumeRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/ratelimit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password ?? "");

  // حماية من التخمين: ٥ محاولات فاشلة كل ١٠ دقائق لكل عنوان IP فقط
  const ip = clientIp(req);
  const rl = consumeRateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: `${RATE_LIMIT_MESSAGE} (${Math.ceil(rl.retryAfterSec / 60)} دقيقة)`,
      },
      { status: 429 }
    );
  }

  // مقارنة آمنة ضد هجمات التوقيت
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    return NextResponse.json(
      { ok: false, message: "كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
