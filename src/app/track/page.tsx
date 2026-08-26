import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import TrackForm from "@/components/track/TrackForm";

export const metadata: Metadata = {
  title: "تتبع حجزك",
  description: "استعلم عن حجزك أو ألغِه برقم الموبايل وكود الحجز.",
};

export default function TrackPage() {
  return (
    <main>
      <Navbar />
      <PageHeader
        title="تتبع أو إلغاء حجزك"
        subtitle="اكتب رقم الموبايل الذي حجزت به — وأضِف كود الحجز لو أردت حجزًا بعينه."
      />
      <section className="bg-cream py-14 plus-pattern">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <TrackForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
