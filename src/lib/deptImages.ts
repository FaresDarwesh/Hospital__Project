// صورة كل تخصص — مربوطة باسم الأيقونة حتى تعمل تلقائيًا مع أي قسم جديد
export const DEPT_IMAGES: Record<string, string> = {
  stethoscope: "/images/dept-internal.jpg",
  bandage: "/images/dept-surgery.jpg",
  heart: "/images/dept-heart.jpg",
  baby: "/images/dept-pediatrics.jpg",
  bone: "/images/dept-ortho.jpg",
  flower: "/images/dept-gyn.jpg",
  tooth: "/images/dept-dental.jpg",
  personstanding: "/images/dept-physio.jpg",
};

export function deptImage(icon: string): string {
  return DEPT_IMAGES[icon] ?? "/images/dept-internal.jpg";
}
