import type { Metadata } from "next";
import AboutPageView from "@/components/about/AboutPageView";
import { getAboutPageContent } from "@/lib/about";

export const metadata: Metadata = {
  title: "درباره ما | آن‌ساپ — About OnSupp",
  description:
    "با تیم آن‌ساپ آشنا شوید؛ رویکرد، ارزش‌ها، مدیرعامل و اعضای تیمی که استراتژی، طراحی، فناوری و رسانه را کنار هم می‌آورند.",
};

export default async function AboutPage() {
  const content = await getAboutPageContent();
  return <AboutPageView content={content} />;
}
