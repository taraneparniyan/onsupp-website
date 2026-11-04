import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCaseStudyBySlug } from "@/lib/case-studies";
import { SITE_URL } from "@/config/site";
import PortfolioDetailClient from "./PortfolioDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchCaseStudyBySlug(slug);

  if (!project) {
    return {
      title: "پروژه یافت نشد",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = project.seoTitle || `${project.client} — ${project.titleFa}`;
  const description = project.seoDescription || project.taglineFa || `بررسی مشخصات، چالش‌ها و نتایج پروژه ${project.titleFa} پیاده‌سازی شده برای ${project.client} توسط تیم آن‌ساپ.`;
  const canonicalUrl = `${SITE_URL}/portfolio/${project.slug}`;
  const imageUrl = project.image
    ? project.image.startsWith("http")
      ? project.image
      : `${SITE_URL}${project.image}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
    openGraph: {
      title: `${title} | نمونه‌کار آن‌ساپ`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "fa_IR",
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchCaseStudyBySlug(slug);

  if (!project) {
    notFound();
  }

  return <PortfolioDetailClient project={project} />;
}
