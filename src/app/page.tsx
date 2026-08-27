import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import StatsSection from "@/components/StatsSection";
import DepartmentsSection from "@/components/DepartmentsSection";
import DoctorsSection from "@/components/DoctorsSection";
import HowItWorks from "@/components/HowItWorks";
import CharitySection from "@/components/CharitySection";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { departments, doctors, schedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEPARTMENTS, DOCTORS, ensureSeeded } from "@/db/seed";
import type { DepartmentDTO, DoctorDTO } from "@/lib/types";

// Public home data can be revalidated instead of querying Supabase on every visitor.
export const revalidate = 30;

export default async function HomePage() {
  const previewMode = process.env.PREVIEW_MODE === "true";
  let deptRows: typeof departments.$inferSelect[] = [];
  let docRows: Array<{
    d: typeof doctors.$inferSelect;
    deptName: string | null;
    deptColor: string | null;
    deptIcon: string | null;
  }> = [];
  let schedRows: typeof schedules.$inferSelect[] = [];

  // المعاينة البصرية لا تتصل بقاعدة البيانات؛ الإنتاج يعمل دائمًا بالبيانات الحقيقية.
  if (!previewMode) {
    await ensureSeeded();
    deptRows = await db.select().from(departments).orderBy(departments.id);
    docRows = await db
      .select({
        d: doctors,
        deptName: departments.name,
        deptColor: departments.color,
        deptIcon: departments.icon,
      })
      .from(doctors)
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.active, true));
    schedRows = await db.select().from(schedules);
  }

  const previewDeptDTOs: DepartmentDTO[] = DEPARTMENTS.map((d, index) => ({
    id: index + 1,
    name: d.name,
    description: d.description,
    icon: d.icon,
    color: d.color,
    doctorCount: DOCTORS.filter((doctor) => doctor.dept === index + 1).length,
  }));
  const previewDoctorDTOs: DoctorDTO[] = DOCTORS.map((d, index) => ({
    id: index + 1,
    name: d.name,
    title: d.title,
    departmentId: d.dept,
    departmentName: previewDeptDTOs[d.dept - 1]?.name,
    departmentColor: previewDeptDTOs[d.dept - 1]?.color,
    departmentIcon: previewDeptDTOs[d.dept - 1]?.icon,
    code: d.code,
    bio: d.bio,
    image: d.image,
    reservationFee: "كشف رمزي",
    active: true,
    schedules: [],
  }));

  const deptDTOs: DepartmentDTO[] = previewMode ? previewDeptDTOs : deptRows.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    color: d.color,
    doctorCount: docRows.filter((r) => r.d.departmentId === d.id).length,
  }));

  const doctorDTOs: DoctorDTO[] = previewMode ? previewDoctorDTOs : docRows.map(({ d, deptName, deptColor, deptIcon }) => ({
    id: d.id,
    name: d.name,
    title: d.title,
    departmentId: d.departmentId,
    departmentName: deptName ?? "",
    departmentColor: deptColor ?? "#0f6b5e",
    departmentIcon: deptIcon ?? "activity",
    code: d.code,
    bio: d.bio,
    image: d.image,
    reservationFee: d.reservationFee,
    active: d.active,
    schedules: schedRows
      .filter((s) => s.doctorId === d.id)
      .map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotMinutes: s.slotMinutes,
      })),
  }));

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Marquee />
      <StatsSection />
      <DepartmentsSection departments={deptDTOs} />
      <DoctorsSection doctors={doctorDTOs} />
      <HowItWorks />
      <CharitySection />
      <Footer />
    </main>
  );
}
