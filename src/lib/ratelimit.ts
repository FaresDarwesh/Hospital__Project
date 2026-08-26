// محدد معدل المحاولات (في الذاكرة) — حماية من التخمين والسبام
// ملاحظة: عند التوسع على عدة خوادم استخدم مخزنًا مشتركًا (Upstash Redis)

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

// تنظيف دوري للمدخلات المنتهية حتى لا تتضخم الذاكرة
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }
}

/**
 * @param key معرف الحاوية (مسار + IP + أي بادئة)
 * @param limit عدد المحاولات المسموحة
 * @param windowMs نافذة الزمن بالمللي ثانية
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  cleanup(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

export const RATE_LIMIT_MESSAGE =
  "محاولات كثيرة جدًا — انتظر قليلًا ثم حاول مرة أخرى";
