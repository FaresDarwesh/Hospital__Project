import type { NextConfig } from "next";

const securityHeaders = [
  // منع تخمين نوع المحتوى (يمنع هجمات MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // منع تضمين الموقع داخل إطارات أجنبية (Clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // سياسة الإحالة
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // تقييد أذونات المتصفح
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // حماية XSS في المتصفحات القديمة
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // منع إعادة التوجيه لبروتوكولات خطيرة
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
