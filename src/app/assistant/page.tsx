import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssistantPortal from "@/components/assistant/AssistantPortal";

export const metadata: Metadata = {
  title: "بوابة الطاقم الطبي",
  description: "دخول مساعدي الأطباء لمتابعة الحجوزات وقائمة الانتظار.",
};

export default function AssistantPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-teal-dark plus-pattern-dark pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <AssistantPortal />
        </div>
      </div>
      <Footer />
    </main>
  );
}
