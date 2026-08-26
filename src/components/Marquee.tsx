import { Plus } from "lucide-react";

const ITEMS = [
  "كشف رمزي لكل المرضى",
  "نخبة من الاستشاريين",
  "أحدث الأجهزة الطبية",
  "حجز أونلاين بدون انتظار",
  "استقبال وطوارئ ٢٤ ساعة",
  "رعاية إنسانية متكاملة",
  "معامل وأشعة بجودة عالية",
  "دعم الحالات غير القادرة",
];

export default function Marquee() {
  return (
    <div className="relative z-10 -rotate-[0.5deg] border-y-4 border-gold bg-teal-deep py-4 shadow-xl" dir="ltr">
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {ITEMS.map((item, i) => (
              <span
                key={i}
                dir="rtl"
                className="mx-6 flex items-center gap-6 text-sm font-extrabold tracking-wide text-cream"
              >
                {item}
                <Plus size={16} className="text-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
