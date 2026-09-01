import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReceptionApp from "@/components/reception/ReceptionApp";

export const metadata: Metadata = { title: "صفحة الاستقبال", description: "متابعة حجوزات المستشفى وإضافة الحجوزات اليدوية." };

export default function ReceptionPage() {
  return <main><Navbar /><div className="min-h-screen bg-sand/50 pt-28 pb-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><ReceptionApp /></div></div><Footer /></main>;
}
