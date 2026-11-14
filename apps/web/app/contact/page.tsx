import type { Metadata } from "next";
import { getSiteSettings, getContactContent } from "@/lib/publicApi";
import ContactPageView from "@/components/contact/ContactPageView";

export const metadata: Metadata = {
    title: "تماس با ما | آن‌ساپ — Contact OnSupp",
    description:
        "با تیم آن‌ساپ (OnSupp) در ارتباط باشید — مشاوره تخصصی طراحی و توسعه وب، مدیریت سوشال مدیا، تولید محتوا، سئو و تبلیغات دیجیتال در کرج و تهران.",
    openGraph: {
        title: "تماس با ما | آن‌ساپ — Contact OnSupp",
        description:
            "راه‌های ارتباطی، مشاوره مستقیم و ثبت درخواست همکاری با آژانس خلاقیت و دیجیتال مارکتینگ آن‌ساپ.",
        type: "website",
    },
};

export default async function ContactPage() {
    const [settings, contactContent] = await Promise.all([
        getSiteSettings().catch(() => null),
        getContactContent().catch(() => null),
    ]);

    return (
        <ContactPageView
            initialSettings={settings}
            initialContactContent={contactContent}
        />
    );
}
