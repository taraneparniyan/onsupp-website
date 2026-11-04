import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col w-full bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-32 text-center">
        <span className="font-mono text-7xl sm:text-9xl font-black text-foreground/10 select-none">
          404
        </span>
        <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          صفحه یا محتوای مورد نظر یافت نشد
        </h1>
        <p className="mt-4 max-w-md text-sm sm:text-base text-foreground/60 leading-relaxed">
          ممکن است نشانی را اشتباه وارد کرده باشید، این صفحه حذف شده باشد و یا هنوز در وضعیت پیش‌نویس قرار داشته باشد.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#9f2334] text-white text-sm font-semibold hover:bg-[#b0293b] transition-colors shadow-sm"
          >
            بازگشت به صفحه اصلی
          </Link>
          <Link
            href="/portfolio"
            className="px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm font-medium transition-colors border border-foreground/10"
          >
            مشاهده نمونه‌کارها
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
