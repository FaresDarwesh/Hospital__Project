# 🚀 دليل النشر الكامل — موقع مستشفى برج النور الخيرى

الخطة: **GitHub** (الكود) → **Vercel** (الاستضافة) → **Supabase** (قاعدة البيانات).
بعد الربط، أي تعديل على الكود في GitHub يُنشر تلقائيًا **بدون أي توقف** للزوار.

---

## ١) رفع الكود على GitHub

1. أنشئ حسابًا على [github.com](https://github.com) ثم اضغط **New repository**
   - الاسم: `borg-nour-hospital` — اجعله **Private**
   - لا تضف أي ملفات (No README/.gitignore)
2. من مجلد المشروع نفذ:

```bash
git init
git add .
git commit -m "موقع مستشفى برج النور الخيرى"
git branch -M main
git remote add origin https://github.com/USERNAME/borg-nour-hospital.git
git push -u origin main
```

> ملف `.env` مُستبعد تلقائيًا عبر `.gitignore` — أسرارك لن تُرفع أبدًا.

---

## ٢) إنشاء قاعدة بيانات Supabase

1. ادخل على [supabase.com](https://supabase.com) → **New project**
   - اختر اسمًا مثل: `borg-nour` وكلمة مرور قوية لقاعدة البيانات (احفظها!)
   - المنطقة: الأقرب لمصر — **Central EU (Frankfurt)**
2. بعد إنشاء المشروع: من القائمة اليسرى **Project Settings → Database**
   - في قسم **Connection string** اختر **Session pooler** (وضع Transaction لا يناسب الجلسات الطويلة)
   - انسخ الرابط — شكله هكذا:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
     ```
   - استبدل `[YOUR-PASSWORD]` بكلمة مرور قاعدة البيانات التي أنشأتها
3. **تجهيز الجداول والبيانات الأولية** — من جهازك ومجلد المشروع:

```bash
# ضع الرابط مؤقتًا في ملف .env المحلي
echo 'DATABASE_URL="postgresql://postgres.xxxxx:كلمة-المرور@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"' > .env

npx drizzle-kit push    # إنشاء الجداول
npx tsx src/db/seed.ts  # تعبئة الأقسام والأطباء والمواعيد
```

> لاحقًا قاعدة البيانات تُبنى ذاتيًا: أول زيارة للموقع تستكشف أنها فارغة وتعبئها.

---

## ٣) النشر على Vercel

1. ادخل على [vercel.com](https://vercel.com) بحساب GitHub نفسه
2. **Add New → Project** → اختر مستودع `borg-nour-hospital` → **Import**
3. Vercel سيتعرف تلقائيًا على Next.js — لا تغيّر أي إعداد بناء
4. في قسم **Environment Variables** أضف:

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط Supabase (Session Pooler) من الخطوة السابقة |
| `ADMIN_PASSWORD` | كلمة مرور قوية للإدارة — اخترها بنفسك |
| `SESSION_SECRET` | نص عشوائي طويل — نفّذ `openssl rand -base64 32` وانسخ الناتج |

5. اضغط **Deploy** — خلال دقيقة تقريبًا موقعك حيّ على رابط مثل:
   `https://borg-nour-hospital.vercel.app`

---

## ٤) كيف تتم التعديلات بعد ذلك؟

| نوع التعديل | أين يتم؟ | متى يظهر؟ |
|---|---|---|
| دكاترة / مواعيد / أقسام / حالات | **لوحة الأدمن** `/admin` | فورًا — بدون إعادة نشر |
| نصوص / ألوان / مزايا جديدة | أطلب مني التعديل → أعطيك الكود المحدَّث → تدفعه لـ GitHub (`git push`) | Vercel تنشر تلقائيًا خلال ~دقيقة **بدون انقطاع** للزوار (Zero-Downtime) |
| بيانات المستشفى (تليفون / عنوان) | ملف واحد: `src/lib/hospital.ts` | نفس طريقة GitHub أعلاه |

- كل `git push` على فرع `main` = نشر إنتاجي تلقائي.
- لو عملت فرعًا آخر فتحصل على **Preview URL** للتجربة قبل الدمج.
- لو نشرٌ ما فشل: Vercel تبقى تلقائيًا على آخر نسخة سليمة — الزوار لا يتأثرون أبدًا.

---

## ٥) ملاحظات أمنية مهمة

- **غيّر `ADMIN_PASSWORD` قبل النشر** — القيمة الافتراضية للتجربة المحلية فقط.
- الموقع محمي بطبقات: كوكيز موقعة HMAC + `httpOnly` + `Secure` + مقارنة آمنة ضد هجمات التوقيت + تحديد معدل محاولات الدخول (٥ محاولات/١٠ دقائق) + تحديد معدل الحجوزات + ترويسات أمان HTTP + تحقق صارم من كل المدخلات.
- أكواد مساعدي الأطباء (BN-101…) يديرها الأدمن من اللوحة — غيّرها متى شئت.
- أسرار Supabase لا تظهر للمتصفح إطلاقًا (تُقرأ على الخادم فقط).

---

## ٦) روابط يومية مفيدة

- الموقع: رابط Vercel الخاص بك
- لوحة الإدارة: `/admin` — بوابة الطاقم الطبي: `/assistant`
- حالة قاعدة البيانات: Supabase → Table Editor (جداول: departments, doctors, schedules, appointments)
- نسخ احتياطي: Supabase → Settings → Backups (تلقائي يومي في الخطة المجانية عبر Point-in-time للمدفوعة)
