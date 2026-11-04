import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تعرفه‌ها و پکیج‌های خدمات تخصصی",
  description:
    "مشاهده شفاف تعرفه‌ها، پلن‌های اجرایی سئو تکنیکال، طراحی وب‌سایت‌های سازمانی، هویت بصری و تولید محتوای استودیویی در آژانس دیجیتال مارکتینگ آن‌ساپ.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "تعرفه‌ها و پلن‌های خدمات آن‌ساپ | OnSupp Pricing",
    description: "قیمت‌گذاری شفاف و بسته‌های سرمایه‌گذاری رشد دیجیتال کسب‌وکارها.",
    url: "https://onsupp.ir/pricing",
    locale: "fa_IR",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
