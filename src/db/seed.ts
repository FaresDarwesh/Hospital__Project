import "dotenv/config";
import { db } from "./index";
import { departments, doctors, schedules, appointments } from "./schema";
import { generateSlots, nextScheduledDate, todayCairo } from "../lib/time";

// العيادات الفعلية بمستشفى برج النور (حسب الدليل الرسمي):
// باطنة - جراحة - عظام - أسنان - علاج طبيعي - قلب + الأكثر طلبًا
const DEPARTMENTS = [
  { name: "الباطنة والأمراض العامة", description: "تشخيص ومتابعة أمراض الباطنة والسكر والضغط والجهاز الهضمي بأحدث الأجهزة.", icon: "stethoscope", color: "#0F6B5E" },
  { name: "الجراحة العامة والمناظير", description: "جراحات عامة ومناظير تشخيصية وعلاجية بأيدي استشاريين وبأعلى معايير التعقيم.", icon: "bandage", color: "#8A5CF6" },
  { name: "القلب والأوعية الدموية", description: "كشف متخصص على القلب وشرايينه مع رسم قلب ومتابعة دقيقة لحالات الضغط.", icon: "heart", color: "#B4436C" },
  { name: "طب الأطفال وحديثي الولادة", description: "رعاية متكاملة لأطفالكم من الولادة حتى المراهقة مع متابعة النمو والتطعيمات.", icon: "baby", color: "#3D7DF2" },
  { name: "العظام والمفاصل", description: "علاج الكسور وإصابات العظام والمفاصل والعمود الفقري بأحدث التقنيات.", icon: "bone", color: "#E8912D" },
  { name: "النساء والتوليد", description: "متابعة الحمل والولادة الآمنة وعلاج أمراض النساء بأعلى درجات الخصوصية.", icon: "flower", color: "#E46BA8" },
  { name: "الأسنان", description: "علاج وتجميل الأسنان والتركيبات والتقويم بأحدث الوسائل وخامات عالمية.", icon: "tooth", color: "#0FA3B1" },
  { name: "العلاج الطبيعي والتأهيل", description: "جلسات علاج طبيعي وتأهيل بعد الإصابات والعمليات وعلاج آلام العمود الفقري.", icon: "personstanding", color: "#5DA85D" },
];

const DOCTORS = [
  { name: "د. أحمد سامي الشريف", title: "استشاري الباطنة والأمراض العامة", dept: 1, code: "BN-101", image: "/images/dr-1.jpg", bio: "خبرة أكثر من 18 عامًا في تشخيص وعلاج أمراض الباطنة والسكر والضغط." },
  { name: "د. خالد فؤاد الرفاعي", title: "استشاري الجراحة العامة والمناظير", dept: 2, code: "BN-108", image: "/images/dr-8.jpg", bio: "جراحات عامة ومناظير تشخيصية وعلاجية بخبرة تتجاوز 20 عامًا." },
  { name: "د. سارة محمود الخشاب", title: "استشاري أمراض القلب والقسطرة", dept: 3, code: "BN-102", image: "/images/dr-2.jpg", bio: "متخصصة في تشخيص أمراض القلب والشرايين ومتابعة حالات الضغط والقسطرة." },
  { name: "د. منى السيد عبد الله", title: "أخصائي طب الأطفال وحديثي الولادة", dept: 4, code: "BN-103", image: "/images/dr-3.jpg", bio: "رعاية فائقة للأطفال وحديثي الولادة ومتابعة دورية للنمو والتطعيمات." },
  { name: "د. محمد عبد الرحمن عوض", title: "استشاري جراحة العظام والمفاصل", dept: 5, code: "BN-104", image: "/images/dr-4.jpg", bio: "خبرة 25 عامًا في جراحات العظام والمفاصل وإصابات الملاعب." },
  { name: "د. نادية حسن الفقي", title: "استشاري النساء والتوليد", dept: 6, code: "BN-105", image: "/images/dr-5.jpg", bio: "متابعة شاملة للحمل والولادة الآمنة وعلاج حالات تأخر الإنجاب." },
  { name: "د. عمر الشاذلي النجار", title: "أخصائي طب وتجميل الأسنان", dept: 7, code: "BN-106", image: "/images/dr-6.jpg", bio: "أحدث تقنيات تجميل وزراعة الأسنان والتركيبات الثابتة والمتحركة." },
  { name: "د. هبة إبراهيم مصطفى", title: "أخصائي العلاج الطبيعي والتأهيل", dept: 8, code: "BN-107", image: "/images/dr-7.jpg", bio: "برامج علاج طبيعي وتأهيل حركي مخصصة لكل حالة بأحدث الأجهزة." },
];

// dayOfWeek: 0 الأحد ... 6 السبت
const SCHEDULES: { code: string; dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number }[] = [
  { code: "BN-101", dayOfWeek: 0, startTime: "17:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-101", dayOfWeek: 2, startTime: "17:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-101", dayOfWeek: 4, startTime: "17:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-102", dayOfWeek: 6, startTime: "18:00", endTime: "22:00", slotMinutes: 20 },
  { code: "BN-102", dayOfWeek: 1, startTime: "18:00", endTime: "22:00", slotMinutes: 20 },
  { code: "BN-102", dayOfWeek: 3, startTime: "18:00", endTime: "22:00", slotMinutes: 20 },
  { code: "BN-103", dayOfWeek: 0, startTime: "10:00", endTime: "14:00", slotMinutes: 15 },
  { code: "BN-103", dayOfWeek: 2, startTime: "10:00", endTime: "14:00", slotMinutes: 15 },
  { code: "BN-103", dayOfWeek: 3, startTime: "17:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-104", dayOfWeek: 6, startTime: "17:00", endTime: "21:00", slotMinutes: 20 },
  { code: "BN-104", dayOfWeek: 2, startTime: "17:30", endTime: "21:30", slotMinutes: 20 },
  { code: "BN-105", dayOfWeek: 0, startTime: "12:00", endTime: "16:00", slotMinutes: 20 },
  { code: "BN-105", dayOfWeek: 3, startTime: "12:00", endTime: "16:00", slotMinutes: 20 },
  { code: "BN-105", dayOfWeek: 4, startTime: "12:00", endTime: "16:00", slotMinutes: 20 },
  { code: "BN-106", dayOfWeek: 6, startTime: "12:00", endTime: "16:30", slotMinutes: 30 },
  { code: "BN-106", dayOfWeek: 1, startTime: "12:00", endTime: "16:30", slotMinutes: 30 },
  { code: "BN-106", dayOfWeek: 3, startTime: "16:00", endTime: "20:00", slotMinutes: 30 },
  { code: "BN-107", dayOfWeek: 0, startTime: "18:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-107", dayOfWeek: 2, startTime: "18:00", endTime: "21:00", slotMinutes: 15 },
  { code: "BN-108", dayOfWeek: 6, startTime: "17:00", endTime: "20:00", slotMinutes: 15 },
  { code: "BN-108", dayOfWeek: 1, startTime: "17:00", endTime: "20:00", slotMinutes: 15 },
  { code: "BN-108", dayOfWeek: 4, startTime: "17:00", endTime: "20:00", slotMinutes: 15 },
];

const DEMO_PATIENTS: { name: string; phone: string; address: string; age: number; visitType: "new" | "followup" }[] = [
  { name: "محمود عبد العزيز محمد", phone: "01012345678", address: "أجا — شارع الجمهورية", age: 42, visitType: "new" },
  { name: "فاطمة الزهراء إبراهيم", phone: "01098765432", address: "أجا — حي السلام", age: 35, visitType: "followup" },
  { name: "أشرف سيد خليل", phone: "01112340098", address: "ميت غمر — شارع بورسعيد", age: 51, visitType: "new" },
];

let seededRun = false;

export async function ensureSeeded(force = false): Promise<void> {
  if (seededRun && !force) return;
  try {
    const existing = await db
      .select({ id: departments.id })
      .from(departments)
      .limit(1);
    if (existing.length > 0) {
      seededRun = true;
      return;
    }

    // الأقسام
    const deptRows = await db.insert(departments).values(DEPARTMENTS).returning();
    const deptIdByOrder = new Map<number, number>();
    deptRows.forEach((row, idx) => deptIdByOrder.set(idx + 1, row.id));

    // الأطباء
    const doctorRows = await db
      .insert(doctors)
      .values(
        DOCTORS.map((d) => ({
          name: d.name,
          title: d.title,
          departmentId: deptIdByOrder.get(d.dept)!,
          code: d.code,
          bio: d.bio,
          image: d.image,
        }))
      )
      .returning();
    const doctorIdByCode = new Map<string, number>();
    doctorRows.forEach((row) => doctorIdByCode.set(row.code, row.id));

    // الجداول
    await db.insert(schedules).values(
      SCHEDULES.map((s) => ({
        doctorId: doctorIdByCode.get(s.code)!,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotMinutes: s.slotMinutes,
      }))
    );

    // حجوزات تجريبية لتوضيح نظام الحجز وقائمة الانتظار
    const today = todayCairo();
    const demoFor = [
      { code: "BN-101", days: [0, 2, 4], start: "17:00", step: 15 },
      { code: "BN-103", days: [0, 2, 3], start: "10:00", step: 15 },
    ];
    let demoIdx = 0;
    for (const d of demoFor) {
      const doctorId = doctorIdByCode.get(d.code)!;
      const date = nextScheduledDate(d.days, today);
      const slots = generateSlots(d.start, "21:00", d.step);
      for (let i = 0; i < DEMO_PATIENTS.length; i++) {
        const p = DEMO_PATIENTS[demoIdx % DEMO_PATIENTS.length];
        const time = slots[i + 2] ?? "18:00";
        await db.insert(appointments).values({
          refCode: `BN-D${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          doctorId,
          date,
          time,
          queueNumber: i + 1,
          patientName: p.name,
          phone: p.phone,
          address: p.address,
          age: p.age,
          visitType: p.visitType,
          status: i === 0 ? "checked_in" : "confirmed",
        });
        demoIdx++;
      }
    }

    seededRun = true;
    // eslint-disable-next-line no-console
    console.log("Seed completed: مستشفى برج النور الخيرى");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Seeding failed:", err);
  }
}

// تشغيل مباشر عبر: npx tsx src/db/seed.ts
if (typeof process !== "undefined" && process.argv[1] && process.argv[1].includes("seed")) {
  ensureSeeded(true).then(() => process.exit(0));
}
