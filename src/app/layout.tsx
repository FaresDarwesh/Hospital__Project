import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Almarai, Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { HOSPITAL } from "@/lib/hospital";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${HOSPITAL.name} | رعاية تليق بكم`,
    template: `%s | ${HOSPITAL.shortName}`,
  },
  description: `${HOSPITAL.name} في ${HOSPITAL.city} — احجز موعدك أونلاين في عيادات الباطنة والقلب والأطفال والعظام والنساء والأسنان والجلدية والأنف والأذن. كشف رمزي ورعاية إنسانية متكاملة.`,
  metadataBase: new URL("https://hospital-project-five-gray.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: HOSPITAL.name,
    title: `${HOSPITAL.name} | رعاية تليق بكم`,
    description: "احجز موعدك أونلاين بسهولة في عيادات مستشفى برج النور الخيري.",
    images: [{ url: "/images/hospital-banner.png", width: 596, height: 335, alt: "مستشفى برج النور الخيري" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${HOSPITAL.name} | رعاية تليق بكم`,
    description: "احجز موعدك أونلاين بسهولة في عيادات مستشفى برج النور الخيري.",
    images: ["/images/hospital-banner.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a443e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${almarai.variable} ${cairo.variable} ${amiri.variable} font-sans antialiased`}
      >
        <div className="noise-overlay" aria-hidden />
        {children}
      </body>
    </html>
  );
}
