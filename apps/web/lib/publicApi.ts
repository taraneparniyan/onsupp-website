import { BACKEND_URL } from "@/config/api";
import type { SocialLinkItem } from "@/lib/socialIcons";

export interface SiteSettingsData {
  id: number;
  siteNameFa: string;
  siteNameEn: string;
  siteTitleFa: string;
  siteTitleEn: string;
  siteDescFa: string;
  siteDescEn: string;
  defaultKeywordsFa: string;
  defaultKeywordsEn: string;
  metaTitleTemplate: string;
  canonicalBaseUrl: string;
  headerLogoUrl: string | null;
  headerDarkLogoUrl: string | null;
  footerLogoUrl: string | null;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  phone: string;
  secondaryPhone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
  telegramHandle: string;
  telegramUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  socialLinks?: SocialLinkItem[];
  contactChannels: Array<{ platform: string; url: string; labelFa?: string; labelEn?: string }>;
  addressFa: string;
  addressEn: string;
  workingHoursFa: string;
  workingHoursEn: string;
  googleMapsUrl: string;
  footerCopyrightFa: string;
  footerCopyrightEn: string;
  footerDescriptionFa: string;
  footerDescriptionEn: string;
  footerLinks: Array<{ nameFa: string; nameEn: string; href: string; position?: number }>;
  headerNavJson: Array<{ nameFa: string; nameEn: string; href: string; isServices?: boolean; position?: number }>;
}

export interface HomepageSectionData {
  id: number;
  key: string;
  sectionType: string;
  titleFa: string;
  titleEn: string;
  position: number;
  isEnabled: boolean;
  settingsJson: Record<string, any>;
}

export interface ClientPartnerData {
  id: number;
  slug: string;
  nameFa: string;
  nameEn: string;
  titleFa: string;
  titleEn: string;
  industryFa: string;
  industryEn: string;
  introFa: string;
  introEn: string;
  quoteFa?: string | null;
  quoteEn?: string | null;
  servicesFa: string[];
  servicesEn: string[];
  yearFa: string;
  yearEn: string;
  portraitImage?: string | null;
  portraitBadgeFa?: string | null;
  portraitBadgeEn?: string | null;
  monogram?: string | null;
  websites: Array<{ url: string; label?: string }>;
  instagrams: Array<{ handle: string; profileUrl: string; name?: string }>;
  position: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface ClientLogoData {
  id: number;
  key: string;
  nameFa: string;
  nameEn: string;
  logoUrl: string;
  darkLogoUrl?: string | null;
  altFa: string;
  altEn: string;
  width: number;
  height: number;
  linkUrl?: string | null;
  position: number;
  isPublished: boolean;
}

export interface StatItemData {
  id: number;
  kind: string;
  valueFa: string;
  valueEn: string;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
  position: number;
  isPublished: boolean;
}

export interface ServiceData {
  id: number;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  tagFa: string;
  tagEn: string;
  headlineFa: string;
  headlineEn: string;
  detailedNarrativeFa: string;
  detailedNarrativeEn: string;
  businessValueTitleFa: string;
  businessValueTitleEn: string;
  businessValueFa: string;
  businessValueEn: string;
  imageUrl: string | null;
  imageAlt: string | null;
  coverImage: string | null;
  gallery: Array<{ url: string; altFa?: string; altEn?: string; caption?: string }>;
  iconType: string;
  badgeAccentFa?: string | null;
  badgeAccentEn?: string | null;
  ctaLabelFa: string;
  ctaLabelEn: string;
  subservices: Array<{
    id: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    deliverablesFa?: string[];
    deliverablesEn?: string[];
  }>;
  kpiMetrics: Array<{
    valueFa: string;
    valueEn: string;
    labelFa: string;
    labelEn: string;
  }>;
  pathways: Array<{
    step: number;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
  }>;
  position: number;
  isPublished: boolean;
  status?: string;
  metrics?: Array<{
    valueFa: string;
    valueEn: string;
    labelFa: string;
    labelEn: string;
  }>;
  relatedLinks?: Array<{
    titleFa: string;
    titleEn: string;
    href: string;
    type: "portfolio" | "service" | "pricing" | "blog";
  }>;
}

export interface CaseStudyData {
  id: number;
  slug: string;
  client: string;
  clientEn: string;
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  categoryFa: string;
  categoryEn: string;
  projectType: string;
  descriptionFa: string;
  descriptionEn: string;
  imageUrl: string | null;
  secondaryImage: string | null;
  gallery: Array<{ url: string; caption?: string }>;
  liveUrl: string;
  featured: boolean;
  position: number;
  year: string;
  challengeFa: string;
  challengeEn: string;
  solutionFa: string;
  solutionEn: string;
  resultsFa: string;
  resultsEn: string;
  deliverablesFa: string[];
  deliverablesEn: string[];
  servicesFa: string[];
  servicesEn: string[];
  metricsFa: Array<{ value: string; label: string }>;
  metricsEn: Array<{ value: string; label: string }>;
  colorGradient: string;
  accentColor: string;
  glowColor: string;
  previewType: string;
  metaTitleFa?: string;
  metaTitleEn?: string;
  metaDescFa?: string;
  metaDescEn?: string;
  keywords?: string;
  ogImage?: string;
  isPublished: boolean;
}

export interface TestimonialData {
  id: number;
  quoteFa: string;
  quoteEn: string;
  authorFa: string;
  authorEn: string;
  roleFa: string;
  roleEn: string;
  companyFa?: string | null;
  companyEn?: string | null;
  serviceTagFa?: string | null;
  serviceTagEn?: string | null;
  highlightFa?: string | null;
  highlightEn?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  position: number;
}

async function safeFetch<T>(endpoint: string, tags: string[], fallback: T): Promise<T> {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    const res = await fetch(url, {
      next: { tags },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch (err) {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  return safeFetch<SiteSettingsData | null>("/api/v1/settings", ["settings", "navigation", "footer"], null);
}

export async function getHomepageSections(): Promise<HomepageSectionData[]> {
  return safeFetch<HomepageSectionData[]>("/api/v1/sections", ["sections", "homepage"], []);
}

export async function getClientPartners(): Promise<ClientPartnerData[]> {
  return safeFetch<ClientPartnerData[]>("/api/v1/clients", ["clients", "homepage"], []);
}

export async function getClientLogos(): Promise<ClientLogoData[]> {
  return safeFetch<ClientLogoData[]>("/api/v1/client-logos", ["client-logos", "homepage"], []);
}

export async function getStats(): Promise<StatItemData[]> {
  return safeFetch<StatItemData[]>("/api/v1/stats", ["stats", "homepage"], []);
}

export async function getServices(): Promise<ServiceData[]> {
  return safeFetch<ServiceData[]>("/api/v1/services", ["services", "homepage"], []);
}

export async function getServiceBySlug(slug: string): Promise<ServiceData | null> {
  return safeFetch<ServiceData | null>(`/api/v1/services/${encodeURIComponent(slug)}`, ["services", `service-${slug}`], null);
}

export async function getCaseStudies(): Promise<CaseStudyData[]> {
  return safeFetch<CaseStudyData[]>("/api/v1/casestudies", ["casestudies", "portfolio", "homepage"], []);
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyData | null> {
  return safeFetch<CaseStudyData | null>(`/api/v1/casestudies/${encodeURIComponent(slug)}`, ["casestudies", `casestudy-${slug}`], null);
}

export interface ContactContentData {
  id?: number;
  eyebrowFa: string;
  eyebrowEn: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  phone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
}

export async function getTestimonials(): Promise<TestimonialData[]> {
  return safeFetch<TestimonialData[]>("/api/v1/testimonials", ["testimonials", "homepage"], []);
}

export async function getContactContent(): Promise<ContactContentData | null> {
  return safeFetch<ContactContentData | null>("/api/v1/contact/content", ["contact", "homepage"], null);
}
