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
  securityHeaders.push(
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      // Next.js يحتاج inline scripts/styles لتشغيل hydration وinline style props.
      // لا نسمح بمصادر خارجية للسكريبتات أو النماذج أو الإطارات.
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests",
      ].join("; "),
    },
  );
}

const nextConfig: NextConfig = {
  // عدم كشف أن التطبيق مبني باستخدام Next.js في response headers.
  poweredByHeader: false,
  // يسمح للمعاينة داخل Arena بالوصول إلى موارد Next.js أثناء التطوير
  allowedDevOrigins: ["*.e2b.app"],
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
