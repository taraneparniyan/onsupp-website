import type { Metadata } from "next";
import { getCaseStudyBySlug } from "@/lib/case-studies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getCaseStudyBySlug(slug);

  if (!project) {
    return {
      title: "پروژه یافت نشد",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${project.client} — ${project.titleFa}`;

  return {
    title,
    description: project.taglineFa,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
  };
}

export default function CaseStudyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
