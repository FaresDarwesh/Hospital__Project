import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "احجز موعدك",
  description: "احجز موعدك أونلاين في عيادات مستشفى برج النور الخيري في أقل من دقيقة.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; doctor?: string }>;
}) {
  const sp = await searchParams;
  const initialDeptId = Number(sp.dept) || undefined;
  const initialDoctorId = Number(sp.doctor) || undefined;

  return (
    <main>
      <Navbar />
      <PageHeader
        title="احجز موعدك أونلاين"
        subtitle="أربع خطوات بسيطة وتأكيد فوري — المواعيد المحجوزة تُقفل لحظيًا أمام الآخرين."
      />
      <section className="relative bg-cream py-14 plus-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BookingWizard
            initialDeptId={initialDeptId}
            initialDoctorId={initialDoctorId}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
