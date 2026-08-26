import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "لوحة تحكم الإدارة",
  description: "إدارة الأطباء والأقسام والحجوزات ومتابعة الحالات.",
};

export default function AdminPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-sand/50 pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AdminApp />
        </div>
      </div>
      <Footer />
    </main>
  );
}
