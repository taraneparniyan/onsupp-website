import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decoded = decodeURIComponent(name);

  return {
    title: `مقالات ${decoded}`,
    description: `مجموعه مقالات و یادداشت‌های تخصصی منتشر شده توسط ${decoded} در آژانس دیجیتال مارکتینگ آن‌ساپ.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
