import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://hospital-project-five-gray.vercel.app";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/assistant", "/reception", "/api/"] }], sitemap: `${base}/sitemap.xml` };
}
