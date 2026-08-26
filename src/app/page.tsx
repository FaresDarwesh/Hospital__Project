import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import StatsSection from "@/components/StatsSection";
import DepartmentsSection from "@/components/DepartmentsSection";
import DoctorsSection from "@/components/DoctorsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import HowItWorks from "@/components/HowItWorks";
import CharitySection from "@/components/CharitySection";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { departments, doctors, schedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";
import type { DepartmentDTO, DoctorDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();

  const deptRows = await db.select().from(departments).orderBy(departments.id);
  const docRows = await db
    .select({
      d: doctors,
      deptName: departments.name,
      deptColor: departments.color,
      deptIcon: departments.icon,
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(eq(doctors.active, true));
  const schedRows = await db.select().from(schedules);

  const deptDTOs: DepartmentDTO[] = deptRows.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    color: d.color,
    doctorCount: docRows.filter((r) => r.d.departmentId === d.id).length,
  }));

  const doctorDTOs: DoctorDTO[] = docRows.map(({ d, deptName, deptColor, deptIcon }) => ({
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
      <TestimonialsSection />
      <HowItWorks />
      <CharitySection />
      <Footer />
    </main>
  );
}
