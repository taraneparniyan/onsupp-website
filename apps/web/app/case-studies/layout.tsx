import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مطالعات موردی و داستان‌های موفقیت",
  description:
    "روایت چالش‌ها، استراتژی‌ها و نتایج ملموس در پروژه‌های دیجیتال مارکتینگ و مهندسی نرم‌افزار آن‌ساپ برای کسب‌وکارهای پیشرو.",
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "مطالعات موردی آن‌ساپ | OnSupp Case Studies",
    description: "بررسی عمیق راهکارهای استراتژیک، معماری محصول و رشد ترافیک مشتریان.",
    url: "https://onsupp.ir/case-studies",
    locale: "fa_IR",
    type: "website",
  },
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
