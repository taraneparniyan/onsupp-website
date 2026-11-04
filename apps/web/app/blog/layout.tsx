import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "وبلاگ تخصصی و تحلیل‌های فناوری و مارکتینگ",
  description:
    "مجموعه مقالات تخصصی در حوزه سئو تکنیکال، معماری وب مدرن، طراحی رابط کاربری سیستم‌محور و استراتژی‌های رشد دیجیتال از متخصصان استودیو آن‌ساپ.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "وبلاگ تخصصی استودیو آن‌ساپ | OnSupp Blog",
    description: "دانش به‌روز دیجیتال مارکتینگ، هویت برند و مهندسی نرم‌افزار.",
    url: "https://onsupp.ir/blog",
    locale: "fa_IR",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
