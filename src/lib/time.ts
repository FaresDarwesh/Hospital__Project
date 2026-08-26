// دوال الوقت والتاريخ (توقيت القاهرة) — مشتركة بين السيرفر والعميل

export const AR_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const SHORT_AR_DAYS = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];

export const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function cairoParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const out: Record<string, string> = {};
  for (const p of fmt.formatToParts(now)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return out;
}

export function todayCairo(): string {
  const p = cairoParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

export function nowCairoMinutes(): number {
  const p = cairoParts(new Date());
  return (Number(p.hour) % 24) * 60 + Number(p.minute);
}

export function dayOfWeekOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatDateAr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${AR_DAYS[dayOfWeekOf(dateStr)]}، ${d} ${AR_MONTHS[m - 1]} ${y}`;
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateSlots(
  start: string,
  end: string,
  slotMinutes: number
): string[] {
  const s = toMinutes(start);
  const e = toMinutes(end);
  const step = slotMinutes || 15;
  const out: string[] = [];
  for (let t = s; t + step <= e; t += step) out.push(toHHMM(t));
  return out;
}

export function formatTimeAr(t: string): string {
  const parts = t.split(":").map(Number);
  let h = parts[0];
  const m = parts[1] ?? 0;
  const period = h < 12 ? "ص" : "م";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

export function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/** أقرب يوم قادم (من اليوم أو بعده) يوافق أحد أيام الجدول */
export function nextScheduledDate(
  daysOfWeek: number[],
  fromDate: string
): string {
  for (let i = 0; i < 8; i++) {
    const cand = addDaysStr(fromDate, i);
    if (daysOfWeek.includes(dayOfWeekOf(cand))) return cand;
  }
  return fromDate;
}

export function isDateStr(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function isTimeStr(s: unknown): s is string {
  return typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}
