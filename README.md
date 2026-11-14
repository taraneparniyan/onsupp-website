# OnSupp Web Platform (وب‌سایت و سامانه مدیریت محتوای آن‌ساپ)

پلتفرم یکپارچه وب‌سایت سازمانی و سامانه مدیریت محتوای اختصاصی (Headless CMS) آژانس دیجیتال مارکتینگ و فناوری **آن‌ساپ (OnSupp)**. این پروژه به صورت معماری مونو-ریپو (Monorepo) طراحی شده و شامل بخش فرانت‌اند مدرن با **Next.js 16 (App Router)**، سرویس بک‌اند با **Node.js Express** و پایگاه داده رابطه‌ای **PostgreSQL** با لایه **Prisma ORM** است.

---

## ۱. ساختار پروژه (Project Structure)

```text
onsupp-redesign/
├── apps/
│   ├── backend/               # سرویس API و هسته مدیریت دیتابیس
│   │   ├── prisma/            # شمای دیتابیس و فایل‌های Migration
│   │   ├── src/               # روت‌ها، کنترلرها، میدلورها و سیدها
│   │   ├── uploads/           # فایل‌های چندرسانه‌ای بارگذاری‌شده
│   │   └── .env.example       # نمونه متغیرهای محیطی بک‌اند
│   └── web/                   # رابط کاربری وب‌سایت و پنل مدیریت
│       ├── app/               # صفحات و روت‌های Next.js 16 App Router
│       ├── components/        # کامپوننت‌های بصری و بخش‌های داینامیک
│       ├── context/           # کانتکست‌های تم (تیره/روشن) و زبان (فارسی/انگلیسی)
│       ├── lib/               # لایه‌های کلاینت API و توابع کمکی
│       ├── public/            # تصاویر، آیکون‌ها و فونت‌های استاتیک
│       └── .env.example       # نمونه متغیرهای محیطی فرانت‌اند
└── README.md                  # راهنمای جامع راه‌اندازی و اجرا
```

---

## ۲. پیش‌نیازهای سیستم (Prerequisites)

پیش از شروع، مطمئن شوید نرم‌افزارهای زیر روی سیستم شما نصب هستند:
- **Node.js**: نسخه `20.x` یا بالاتر (تست‌شده با Node.js 20 و 24)
- **PostgreSQL**: نسخه `15.x` یا بالاتر (پورت پیش‌فرض `5432` یا پورت دلخواه)
- **npm** یا **pnpm**: نسخه `10.x` یا بالاتر
- **Git**

---

## ۳. راهنمای گام‌به‌گام راه‌اندازی و اجرا (Quick Start Guide)

### مرحله ۱: دریافت مخزن
```bash
git clone https://github.com/taraneparniyan/onsupp-website.git
cd onsupp-website
```

### مرحله ۲: نصب وابستگی‌ها (Dependencies)
وابستگی‌های پکیج‌ها را برای هر دو برنامه نصب کنید:
```bash
# نصب پکیج‌های ریشه (در صورت وجود)
npm install

# نصب پکیج‌های بک‌اند
cd apps/backend
npm install

# نصب پکیج‌های فرانت‌اند
cd ../web
npm install
cd ../..
```

---

## ۴. تنظیم متغیرهای محیطی (Environment Configuration)

پروژه به متغیرهای محرمانه وابسته نیست و فایل‌های نمونه برای راه‌اندازی سریع در نظر گرفته شده‌اند:

### ۱. تنظیم متغیرهای بک‌اند (`apps/backend/.env`):
یک فایل به نام `.env` در مسیر `apps/backend/` بسازید یا از فایل نمونه کپی بگیرید:
```bash
cp apps/backend/.env.example apps/backend/.env
```
محتوای نمونه `apps/backend/.env`:
```env
PORT=3002
NODE_ENV=development
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/onsupp_db?schema=public"
JWT_SECRET="a-very-secure-random-secret-key-at-least-32-chars-long"
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3004"
```
> **نکته:** در `DATABASE_URL`، نام کاربری، رمز عبور، پورت و نام دیتابیس لوکال خود را قرار دهید. دیتابیس را در PostgreSQL بسازید (`CREATE DATABASE onsupp_db;`).

### ۲. تنظیم متغیرهای فرانت‌اند (`apps/web/.env.local`):
یک فایل به نام `.env.local` در مسیر `apps/web/` بسازید یا از فایل نمونه کپی بگیرید:
```bash
cp apps/web/.env.example apps/web/.env.local
```
محتوای نمونه `apps/web/.env.local`:
```env
PORT=3000
NEXT_PUBLIC_BACKEND_URL="http://localhost:3002"
BACKEND_URL="http://localhost:3002"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## ۵. آماده‌سازی پایگاه داده و بارگذاری داده‌های اولیه (Database Setup & Seeding)

ابتدا مایگریشن‌های پایگاه داده را اجرا کنید:
```bash
cd apps/backend
npx prisma migrate deploy
```

سپس کلاینت Prisma را تولید و داده‌های پایه را در دیتابیس بارگذاری کنید:
```bash
npx prisma generate
npm run seed
```
> **توضیح اسکریپت Seed:**
> اسکریپت سید به صورت خودکار موارد زیر را در دیتابیس مقداردهی می‌کند:
> ۱. کاربر ادمین پیش‌فرض (`admin@onsupp.ir`)
> ۲. اسلایدهای هیرو سکشن صفحه اصلی
> ۳. دقیقاً **۷ خدمت کانونیکال و تاییدشده آن‌ساپ** (طراحی سایت، سئو، اینستاگرام، فیلم‌برداری، انیمیشن، CRM، برنامه‌نویسی) با تمام ساب‌سرویس‌ها و متریک‌ها
> ۴. آمارهای رضایت مشتری و پروژه‌ها

---

## ۶. اجرای پروژه در محیط توسعه (Running Development Servers)

برای اجرای هم‌زمان پروژه، دو ترمینال مجزا باز کنید:

### ترمینال ۱ – سرویس بک‌اند (Backend API):
```bash
cd apps/backend
npm run dev
```
- خروجی API در آدرس `http://localhost:3002/api/v1` در دسترس خواهد بود.
- تست سلامت سرور: `http://localhost:3002/api/v1/services`

### ترمینال ۲ – سرویس فرانت‌اند (Frontend Web & Admin):
```bash
cd apps/web
npm run dev
```
- وب‌سایت در آدرس `http://localhost:3000` (یا پورت مشخص‌شده در کنسول) در دسترس خواهد بود.

---

## ۷. ورود به پنل مدیریت (Admin Dashboard)

سامانه مدیریت محتوای اختصاصی آن‌ساپ در مسیر زیر در دسترس است:
- **آدرس:** `http://localhost:3000/admin` یا `http://localhost:3000/admin/login`
- **ایمیل پیش‌فرض:** `admin@onsupp.ir`
- **رمز عبور:** در زمان اجرای اسکریپت سید از طریق متغیر محیطی `ADMIN_PASSWORD` تعیین می‌شود (یا مقدار هش‌شده اولیه).

امکانات پنل مدیریت:
- مدیریت ۷ خدمت اصلی و ساب‌سرویس‌ها
- مدیریت نمونه‌کارها (Portfolio & Case Studies)
- مدیریت مقالات و وبلاگ
- مدیریت اعضای تیم، گواهینامه‌ها، لوگوهای مشتریان و نظرات
- تنظیمات سئو، متاتگ‌ها و اطلاعات تماس

---

## ۸. بیلد و استقرار نسخه نهایی (Production Build)

برای ساخت نسخه آماده پروداکشن:

```bash
# بیلد بک‌اند
cd apps/backend
npm run build

# بیلد فرانت‌اند
cd ../web
npm run build
```

---

## ۹. نکات مهم و عیب‌یابی (Troubleshooting)

1. **خطای اتصال دیتابیس:** مطمئن شوید سرویس PostgreSQL فعال است و دسترسی کاربر و پورت در `DATABASE_URL` صحیح است.
2. **عدم نمایش تصاویر خدمات یا نمونه‌کارها:** در محیط توسعه، پوشه `apps/backend/uploads` به صورت خودکار ایجاد می‌شود. فایل‌های استاتیک عمومی نیز در `apps/web/public/` نگهداری می‌شوند.
3. **همگام‌سازی کش Next.js:** سرویس بک‌اند پس از هر ویرایش در پنل ادمین، مسیرهای مربوطه را به صورت آنی Revalidate می‌کند.
