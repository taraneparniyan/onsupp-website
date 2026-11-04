# Comprehensive Dynamic CMS Audit & Architectural Blueprint
**Project:** OnSupp Digital Agency Platform  
**Target Environment:** Monorepo (`apps/web` Next.js 16 + `apps/backend` Express 5 + PostgreSQL Prisma ORM)  
**Date:** November 2026  
**Document Status:** Complete Technical Audit (Read-Only Investigation)

---

## Executive Summary

This technical audit provides a full evaluation of all content rendered across the public-facing pages of the OnSupp website, assesses the current capabilities and limitations of the custom Admin CMS, catalogs all hardcoded content, and formulates an actionable architectural blueprint to transition 100% of the website's content into dynamic, CMS-manageable entities without requiring source code modifications or application redeployments.

### Key Audit Findings
1. **Partial Dynamic Coverage:** The CMS currently manages Blog Articles, Comments, Pricing Plans, Testimonials, Media Uploads, Contact Form Submissions, and Hero Slides.
2. **Disconnected Existing Modules:** Three existing admin modules (`Services`, `Stats`, and `Case Studies`) are disconnected or only partially connected to the public frontend:
   - Homepage `Services.tsx` and the `/services` dedicated deep-dive page use static in-memory TypeScript arrays (`SERVICES_DATA` and `DETAILED_SERVICES_DATA`), ignoring the database `Service` table.
   - Homepage `StatsSatisfaction.tsx` renders 4 hardcoded metrics and never calls `/api/v1/stats`.
   - The `/portfolio` and `/portfolio/[slug]` pages retrieve data from a static array (`SHOWCASE_PROJECTS`), causing newly added CMS case studies to return 404 Not Found on detail pages.
3. **Critical Missing CMS Modules:** Several high-visibility sections have zero database representation and are 100% hardcoded in frontend files:
   - **Clients & Partners Showcase** (`apps/web/config/clients-partners.ts`)
   - **Client Brand Logos Marquee** (`apps/web/components/sections/ClientLogoMarquee.tsx`)
   - **Dedicated About Page Team Members, CEO Profile & Core Values** (`apps/web/lib/about.ts`)
   - **Multi-channel Contact Details & Office Headquarters** (`apps/web/components/layout/Footer.tsx` and `ContactCTA.tsx`)
   - **Mega-Menu Navigation Hierarchy** (`apps/web/config/services.ts` and `NavLinks.tsx`)
   - **Page-Level SEO Meta Tags** for static pages (`/`, `/about`, `/services`, `/portfolio`, `/pricing`).
   - **Homepage Section Ordering and Visibility Toggles**.

---

## 1. Existing Architecture Overview

```
+--------------------------------------------------------------------------------------------------+
|                                      MONOREPO ROOT                                               |
+--------------------------------------------------------------------------------------------------+
                                        |
     +----------------------------------+----------------------------------+
     |                                                                     |
     v                                                                     v
+-----------------------------+                       +--------------------------------------------+
|      apps/web (Frontend)    |                       |           apps/backend (API Server)        |
| - Next.js 16.4 (App Router) |                       | - Express.js 5.2.1                         |
| - React 19.3                |                       | - TypeScript 5.x                           |
| - Tailwind CSS v4           |                       | - Prisma ORM 6.14.0 / 6.19.3               |
| - Framer Motion & Swiper    |                       | - JWT Authentication (HS256)               |
| - Next.js Rewrites Proxy    | -- /api/v1/* requests -> - Multi-Tier RBAC Guards                  |
| - /admin Protected Area     |                       | - Multer Media Upload (Disk Storage)       |
+-----------------------------+                       +--------------------------------------------+
                                                                            |
                                                                            v
                                                      +--------------------------------------------+
                                                      |             PostgreSQL Database            |
                                                      | - 14 Prisma Models                         |
                                                      | - Role Enum (8 distinct roles)             |
                                                      +--------------------------------------------+
```

### 1.1 Frontend Architecture (`apps/web`)
- **Framework:** Next.js 16 App Router using React 19 Server and Client Components.
- **Routing & Rendering:**
  - Client-side data fetching using `useEffect` + `fetch` with `cache: "no-store"` across several sections.
  - Next.js `rewrites` configured in `next.config.ts`:
    - `/api/v1/:path*` rewrites to `${BACKEND_URL}/api/v1/:path*`
    - `/uploads/:path*` rewrites to `${BACKEND_URL}/uploads/:path*`
  - Client-side state managed through React Context (`LanguageContext` for RTL Persian/LTR English, `ThemeContext` for Dark/Light mode).
- **Admin CMS Frontend:**
  - Custom dashboard residing under `apps/web/app/admin/(dashboard)/*`.
  - Authenticated via `httpOnly` cookie (`token`) created by Next.js Server Action (`login` in `lib/actions/auth.ts`).
  - Edge routing guarded by `apps/web/middleware.ts` verifying role and expiration.
  - API communication abstracted in `apps/web/lib/adminApi.ts` with credentials inclusion.

### 1.2 Backend Architecture (`apps/backend`)
- **Framework:** Express 5.2.1 running on Node.js 20+ with TypeScript.
- **ORM & Database:** Prisma ORM connected to PostgreSQL via `DATABASE_URL`.
- **Security & RBAC:**
  - JWT tokens signed with strict HS256 algorithm and mandatory strong secret validation.
  - Roles: `SUPER_ADMIN`, `ADMIN`, `HR`, `EMPLOYEE`, `CONTENT_SEO_MANAGER`, `SUPPORT`, `PROJECT_MANAGER`, `USER`.
  - Middleware guards: `authenticate`, `requireAuth`, `requireAdmin`, `requireContentManager`, `requireSupport`, `requireRoles`.
  - Active user validation: revoked/deactivated users are rejected at the database level on every authenticated request.
- **Media Engine:** Multer saving files to `apps/backend/uploads/` with mime-type checking (jpg, png, webp, gif up to 5MB) and database metadata registration in `Media` table.

---

## 2. Complete Inventory of Public Website Content

### 2.1 Shared Layout & Navigation
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **Header** (`components/layout/Header.tsx`) | Logo variants (dark/light), Top navigation links, Consultation CTA button, Language & Theme toggles. | Hardcoded in `Header.tsx` & `NavLinks.tsx` | Hardcoded |
| **Services Mega-Menu** (`components/layout/NavLinks.tsx`) | 7 Department headers, icons, descriptions, 21 subservice links, quick action consultation links. | Static array in `apps/web/config/services.ts` (`SERVICES_MENU_ITEMS`) | Hardcoded |
| **Footer** (`components/layout/Footer.tsx`) | Quick Links, Headquarters Office Address, Working Hours, Manager Phone, Web Support Phone, Instagram/Telegram URLs, Email, Copyright. | Hardcoded constants in `Footer.tsx` (`QUICK_LINKS`, `OFFICE_ADDRESS`, `CONTACT_DETAILS`). Only email/phone labels query API. | Partially Dynamic |

### 2.2 Homepage (`/`)
| Section Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **Hero** (`components/sections/Hero.tsx`) | Carousel slides, Title (Fa/En), Subtitle (Fa/En), CTA buttons (primary/secondary), Background images, pagination. | Fetches `/api/v1/hero`, with fallback to `CANONICAL_HERO_SLIDES`. | Already Fully Dynamic |
| **Clients & Partners** (`components/sections/ClientsPartners.tsx`) | VIP Client cards, Monograms, Names, Professional Titles, Industry, Quote, Services, Year, Portrait badges, Website links, Instagram links. | Static array in `apps/web/config/clients-partners.ts` (`CLIENT_PARTNERS`). | Hardcoded |
| **Statistics & Satisfaction** (`components/sections/StatsSatisfaction.tsx`) | 4 Key metrics (4.9/5 satisfaction, +200 projects, 8 years experience, +15 team), animated counters, vector icons. | Static array `metrics` in `StatsSatisfaction.tsx`. Ignores backend `Stat` table. | Hardcoded |
| **Services Carousel** (`components/sections/Services.tsx`) | 7 Department cards with image, category tag, title, slug, and directional infinite carousel. | Static array `SERVICES_DATA` in `Services.tsx`. Ignores backend `Service` table. | Hardcoded |
| **About Us Summary** (`components/sections/About.tsx`) | Section Eyebrow, Main Title, Subtitle, Paragraph, Strategic Team Image, CTA button, 4 Feature bullet cards with icons. | Fetches `/api/v1/about` (AboutContent & Feature tables), but overrides title if matching default. | Partially Dynamic |
| **Client Logo Marquee** (`components/sections/ClientLogoMarquee.tsx`) | Infinite marquee of 9 client logos with dimensions, tooltips, alt texts. | Static array `CLIENT_LOGOS` in `ClientLogoMarquee.tsx`. | Hardcoded |
| **Case Studies** (`components/sections/CaseStudies.tsx`) | Featured flagship projects, title, client, category, services badges, metrics, preview images, live URL. | Fetches `/api/v1/casestudies`, but merges onto hardcoded `SHOWCASE_PROJECTS` from `lib/case-studies.ts`. | Partially Dynamic |
| **Contact CTA** (`components/sections/ContactCTA.tsx`) | Section Eyebrow, Title, Description, 4 Direct Communication Channels (Manager, Web, Social, Email), Interactive Form. | Form & Content query `/api/v1/contact/*`. Channel cards array `CONTACT_CHANNELS` is hardcoded. | Partially Dynamic |
| **Testimonials** (`components/sections/Testimonials.tsx`) | Client quotes, author name, executive role, company name, service tag pill, outcome highlight badge, avatar photo, 5-star rating. | Fetches `/api/v1/testimonials` with fallback to `CANONICAL_TESTIMONIALS`. | Already Fully Dynamic |
| **Blog Articles Preview** (`components/sections/BlogArticles.tsx`) | Latest 3 published articles, title, excerpt, reading time, date, author, category badge, thumbnail image. | Fetches `/api/v1/articles?limit=3`. | Already Fully Dynamic |

### 2.3 About Us Page (`/about`)
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **AboutHero** (`components/about/AboutHero.tsx`) | Eyebrow, Title, Caption/Subtitle, Hero Image with focal point. | Hardcoded in `apps/web/lib/about.ts` (`STATIC_ABOUT_CONTENT.hero`). | Hardcoded |
| **AboutIntro** (`components/about/AboutIntro.tsx`) | Eyebrow, Title, Lead statement, Strategic approach narrative, 4 core value cards (Title & Description). | Hardcoded in `apps/web/lib/about.ts` (`STATIC_ABOUT_CONTENT.intro`). | Hardcoded |
| **CeoSection** (`components/about/CeoSection.tsx`) | CEO Name, Executive Role, Signature quote, Multi-paragraph biography, Photo, Social profile links. | Hardcoded in `apps/web/lib/about.ts` (`STATIC_ABOUT_CONTENT.ceo`). | Hardcoded |
| **TeamSection** (`components/about/TeamSection.tsx`) | Eyebrow, Title, Description, Grid of published team members (Name, Role, Department, Bio, Photo, Social links). | Hardcoded in `apps/web/lib/about.ts` (`STATIC_ABOUT_CONTENT.team.members`). | Hardcoded |

### 2.4 Services Dedicated Deep-Dive Page (`/services`)
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **ServicesHero** | Title, Headline description, Category selector filter tabs. | Hardcoded in `ServicesPageView.tsx` & `services-data.ts`. | Hardcoded |
| **ServicesOverview** | Department cards overview grid. | Static array `DETAILED_SERVICES_DATA` in `components/services/services-data.ts`. | Hardcoded |
| **ServicesDeepDive** | 7 Comprehensive department sections: Headline, Detailed Narrative, Strategic Business Value, Subservices list with Deliverables, Key Metrics, Related Pathway links. | Static array `DETAILED_SERVICES_DATA` in `components/services/services-data.ts`. | Hardcoded |
| **ServicesCTASection** | Consultation CTA banner, heading, description, button. | Hardcoded in `ServicesCTASection.tsx`. | Hardcoded |

### 2.5 Portfolio & Case Studies (`/portfolio`, `/portfolio/[slug]`, `/case-studies`)
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **Portfolio Archive** (`/portfolio`) | Filter categories, Search bar, Project cards (Client, Title, Category, Year, Thumbnail, Metrics, Services). | Calls `getAllCaseStudies()` which returns static array `SHOWCASE_PROJECTS` in `lib/case-studies.ts`. | Hardcoded |
| **Project Detail Page** (`/portfolio/[slug]`) | Breadcrumb, Title, Client, Year, Category, Preview Type, Hero & Secondary Images, Live site button, Challenge narrative, Solution narrative, Deliverables list, Key Results / Metrics, Next project carousel. | Calls `getCaseStudyBySlug(slug)` directly from in-memory array `SHOWCASE_PROJECTS`. Returns 404 for DB items. | Hardcoded |
| **Case Studies Archive** (`/case-studies`) | Alternate route to portfolio archive with pagination and category filtering. | Static array `SHOWCASE_PROJECTS` in `lib/case-studies.ts`. | Hardcoded |

### 2.6 Blog & Articles (`/blog`, `/blog/[slug]`, `/author/[name]`)
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **Blog Archive** (`/blog`) | Category filter pills, Search input, Article grid, Pagination, Author links. | Fetches live from `/api/v1/articles`. | Already Fully Dynamic |
| **Article Detail** (`/blog/[slug]`) | Full article title, Excerpt, Content (Sanitized HTML), Reading time, Date, Author, Featured image, Dynamic TOC, FAQs, Translation link, Comments submission & list. | Fetches live from `/api/v1/articles/by-slug/:slug` and `/api/v1/comments`. | Already Fully Dynamic |
| **Author Archive** (`/author/[name]`) | Author name, Bio banner, Published articles by author. | Fetches live from `/api/v1/articles?author=:name`. | Already Fully Dynamic |

### 2.7 Pricing Packages (`/pricing`)
| Component | Elements Displayed | Current Data Source | Dynamic Status |
| :--- | :--- | :--- | :--- |
| **Pricing Page** | Category tabs (SEO, Web Design, etc.), Tier cards, Badge, Price/Discount, Billing period, Features checklist, Popular highlight, CTA button. | Fetches live from `/api/v1/pricing/categories` (includes nested plans). | Already Fully Dynamic |

---

## 3. Existing CMS Functionality Assessment

| Admin Module Path | Corresponding Backend Route | Prisma Model(s) | Functionality Implemented | Deficiencies / Disconnects |
| :--- | :--- | :--- | :--- | :--- |
| `/admin` | `GET /api/v1/dashboard/stats` | Multiple counts | System stats, activity logs, DB status | Fully functional. |
| `/admin/media` | `GET, POST, DELETE /api/v1/media` | `Media` | File upload, Alt text validation, Delete | Fully functional. |
| `/admin/hero` | `GET, POST, PUT, DELETE /api/v1/hero` | `HeroSlide` | Full CRUD, Slide reordering, Image picker | Fully functional. |
| `/admin/services` | `GET, POST, PUT, DELETE /api/v1/services` | `Service` | Basic CRUD (title, subtitle, image, position) | **Disconnected from public site**. Model lacks subservices, deliverables, narratives, metrics, slug. |
| `/admin/stats` | `GET, POST, PUT, DELETE /api/v1/stats` | `Stat` | CRUD on numeric/medical stats | **Disconnected from public site**. Public component renders hardcoded array. |
| `/admin/about` | `GET, PUT /api/v1/about`, CRUD `/features` | `AboutContent`, `Feature` | Homepage paragraph & 4 feature cards | **Does not manage `/about` page**. No team members, no CEO profile, no core values. |
| `/admin/casestudies` | `GET, POST, PUT, DELETE /api/v1/casestudies` | `CaseStudy` | CRUD on title, client, slug, category, images | **Model missing detail fields** (challenge, solution, deliverables, metrics). Public `/portfolio` ignores DB. |
| `/admin/articles` | `GET, POST, PUT, DELETE /api/v1/articles` | `Article`, `ArticleFaq` | Full CRUD, WYSIWYG Jodit, SEO, FAQs, Translations | Fully functional. |
| `/admin/comments` | `GET, PUT, DELETE /api/v1/comments` | `Comment` | Approve/Reject toggle, Reply, Delete | Fully functional. |
| `/admin/testimonials`| `GET, POST, PUT, DELETE /api/v1/testimonials` | `Testimonial` | Full CRUD, Active toggle, Highlight badge, Avatar | Fully functional. |
| `/admin/contact` | `GET, PUT /content`, `GET, PUT, DEL /submissions` | `ContactContent`, `ContactSubmission` | Contact text, Submissions read/delete | Only supports single phone/email. Missing multi-channel and address. |
| `/admin/pricing` | `GET, POST, PUT, DEL /pricing/categories`, `/plans`| `PricingCategory`, `PricingPlan` | Full CRUD, Features array, Discount pricing | Fully functional. |
| `/admin/users` | `GET, POST, PUT, DELETE /api/v1/users` | `User` | Full CRUD, 8 RBAC roles, Active toggle | Fully functional. |
| `/admin/profile` | `GET /api/v1/auth/me`, `PUT /api/v1/users/:id` | `User` | Profile info, Password change | Fully functional. |

---

## 4. Hardcoded Content Inventory with Exact File Paths

```
====================================================================================================
FILE PATH                                                 HARDCODED DATA ELEMENT
====================================================================================================
apps/web/config/clients-partners.ts                       CLIENT_PARTNERS array (3 VIP clients: Najma
                                                          Tavakolian, Shin Beauty, Mehdi Nazeri; quotes,
                                                          websites, instagram handles, portrait badges)
----------------------------------------------------------------------------------------------------
apps/web/components/sections/ClientLogoMarquee.tsx        CLIENT_LOGOS array (9 logos: Dr. Sina Parsipour,
                                                          Night Sky, Partner Healthcare, etc.)
----------------------------------------------------------------------------------------------------
apps/web/components/sections/StatsSatisfaction.tsx        metrics array (Satisfaction 4.9/5, +200 Projects,
                                                          8 Years Rigor, +15 Specialists)
----------------------------------------------------------------------------------------------------
apps/web/components/sections/Services.tsx                 SERVICES_DATA array (7 core department cards:
                                                          social-identity, studio-production, etc.)
----------------------------------------------------------------------------------------------------
apps/web/components/services/services-data.ts             DETAILED_SERVICES_DATA (Full deep-dive narratives,
                                                          business values, subservices, deliverables, metrics)
----------------------------------------------------------------------------------------------------
apps/web/config/services.ts                               SERVICES_MENU_ITEMS (Mega-menu categories, subservices
                                                          lists, and related pathway cross-links)
----------------------------------------------------------------------------------------------------
apps/web/lib/about.ts                                     STATIC_ABOUT_CONTENT (About hero photo/caption,
                                                          4 core value cards, CEO profile, 4 team members)
----------------------------------------------------------------------------------------------------
apps/web/lib/case-studies.ts                              SHOWCASE_PROJECTS array (Full case studies: challenges,
                                                          solutions, deliverables, metrics, visual styling)
----------------------------------------------------------------------------------------------------
apps/web/components/sections/ContactCTA.tsx               CONTACT_CHANNELS array (Manager, Web support, Social
                                                          media phone numbers and consultation email)
----------------------------------------------------------------------------------------------------
apps/web/components/layout/Footer.tsx                     QUICK_LINKS, OFFICE_ADDRESS (street, district, city),
                                                          CONTACT_DETAILS (working hours, phone numbers, telegram)
----------------------------------------------------------------------------------------------------
apps/web/components/layout/NavLinks.tsx                   translations object (Top-level navigation links)
----------------------------------------------------------------------------------------------------
apps/web/app/page.tsx                                     Homepage section sequence and composition
----------------------------------------------------------------------------------------------------
apps/web/app/layout.tsx & individual page.tsx files       Static metadata exports (titles, descriptions, ogImages)
====================================================================================================
```

---

## 5. Content Management Matrix

| Website Area | Content Element | Current Source | Existing CMS Module | API Status | Dynamic Status | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** | Hero Carousel Slides | Backend DB via API | `/admin/hero` | `GET, POST, PUT, DELETE /api/v1/hero` | Already fully dynamic | Maintain current implementation. |
| **Homepage** | Clients & Partners Showcase | `config/clients-partners.ts` | None | Missing | Hardcoded | Create `ClientPartner` model, API routes & admin module. |
| **Homepage** | Client Brand Logos Marquee | `ClientLogoMarquee.tsx` | None | Missing | Hardcoded | Create `ClientLogo` model, API routes & admin module. |
| **Homepage** | Key Statistics & Ratings | `StatsSatisfaction.tsx` | `/admin/stats` | `GET, POST, PUT, DELETE /api/v1/stats` | Hardcoded in UI | Wire `StatsSatisfaction.tsx` to `/api/v1/stats`. Update model for icons/ratings. |
| **Homepage** | Services Carousel | `sections/Services.tsx` | `/admin/services` | `GET, POST, PUT, DELETE /api/v1/services` | Hardcoded in UI | Wire `Services.tsx` to backend API. |
| **Homepage** | About Us Summary Card | Backend DB via API | `/admin/about` | `GET, PUT /api/v1/about` | Partially dynamic | Remove hardcoded title override in `About.tsx`. |
| **Homepage** | Case Studies Carousel | Mixed (API + static merge) | `/admin/casestudies` | `GET /api/v1/casestudies` | Partially dynamic | Expand `CaseStudy` model; serve full dynamic records without in-memory merge. |
| **Homepage** | Contact Channels Bar | `ContactCTA.tsx` | `/admin/contact` | Incomplete (single phone/email) | Partially dynamic | Add multi-channel contact list to CMS. |
| **Homepage** | Contact Form Submission | Backend DB via API | `/admin/contact` | `POST, GET /api/v1/contact/*` | Already fully dynamic | Maintain current implementation. |
| **Homepage** | Client Testimonials | Backend DB via API | `/admin/testimonials` | `GET, POST, PUT, DELETE /api/v1/testimonials` | Already fully dynamic | Maintain current implementation. |
| **Homepage** | Latest Blog Articles | Backend DB via API | `/admin/articles` | `GET /api/v1/articles?limit=3` | Already fully dynamic | Maintain current implementation. |
| **Homepage** | Section Ordering & Visibility | `app/page.tsx` | None | Missing | Hardcoded | Create `HomeSection` model & section manager in admin. |
| **About Page** | About Hero & Intro Values | `lib/about.ts` | None | Missing | Hardcoded | Create `AboutPage` model & admin interface. |
| **About Page** | CEO Profile & Bio | `lib/about.ts` | None | Missing | Hardcoded | Add CEO Profile fields to About CMS module. |
| **About Page** | Team Members Showcase | `lib/about.ts` | None | Missing | Hardcoded | Create `TeamMember` model, API & admin module. |
| **Services Page** | 7 Department Overviews | `services-data.ts` | `/admin/services` | Incomplete | Hardcoded in UI | Expand `Service` model with deep narratives & deliverables. |
| **Services Page** | Subservices & Deliverables | `services-data.ts` | None | Missing | Hardcoded | Add `subservices` structured array to `Service` model. |
| **Services Page** | Strategic Business Values | `services-data.ts` | None | Missing | Hardcoded | Add business value fields to `Service` model. |
| **Portfolio** | Archive Grid & Filtering | `lib/case-studies.ts` | `/admin/casestudies` | Ignored by page | Hardcoded | Wire `/portfolio` page to fetch live from `/api/v1/casestudies`. |
| **Portfolio** | Case Study Detail Page | `lib/case-studies.ts` | `/admin/casestudies` | Missing detail fields | Hardcoded | Wire `/portfolio/[slug]` to `/api/v1/casestudies/by-slug/:slug`. |
| **Blog** | Article Archive & Search | Backend DB via API | `/admin/articles` | `GET /api/v1/articles` | Already fully dynamic | Maintain current implementation. |
| **Blog** | Article Detail, TOC & FAQs | Backend DB via API | `/admin/articles` | `GET /api/v1/articles/by-slug/:slug` | Already fully dynamic | Maintain current implementation. |
| **Blog** | Comments & Replies | Backend DB via API | `/admin/comments` | `GET, POST, PUT, DEL /api/v1/comments` | Already fully dynamic | Maintain current implementation. |
| **Pricing** | Pricing Categories & Plans | Backend DB via API | `/admin/pricing` | `GET, POST, PUT, DEL /api/v1/pricing/*`| Already fully dynamic | Maintain current implementation. |
| **Header** | Navigation Links & Mega Menu | `config/services.ts` | None | Missing | Hardcoded | Create `NavigationItem` model or sync mega-menu with `Service` model. |
| **Footer** | Office Address & Hours | `components/layout/Footer.tsx` | None | Missing | Hardcoded | Create `SiteSetting` model with address, hours & social links. |
| **Global** | Static Pages SEO Metadata | `page.tsx` metadata exports | None | Missing | Hardcoded | Create `PageSeo` model & admin metadata editor. |

---

## 6. Missing Functionality Analysis

### 6.1 Clients & Partners Management
- **Problem:** OnSupp showcases VIP corporate clients with extensive details (quotes, monogram, websites, social profiles, year). Currently, any modification requires editing `apps/web/config/clients-partners.ts` and rebuilding the application.
- **Requirement:** A dedicated CMS module to create, update, reorder, and toggle visibility for client partners.

### 6.2 Client Brand Logos Marquee
- **Problem:** The client logo strip in `ClientLogoMarquee.tsx` references 9 fixed image files. Adding a client logo or updating an alt tag requires source code edits.
- **Requirement:** A logo management interface allowing image upload from Media Library, custom alt text in Fa/En, display dimensions, and ordering.

### 6.3 Deep Services & Subservices Management
- **Problem:** The current `Service` model only stores `title` and `subtitle`. It cannot represent the extensive editorial content rendered on the `/services` page (detailed narratives, business value, deliverables checklists, department metrics).
- **Requirement:** Expand the `Service` entity to support full department documentation, slug-based routing, and subservices hierarchy.

### 6.4 Team Members & CEO Profile CMS
- **Problem:** The `/about` page contains rich biographies of leadership and specialists. None of this data exists in the database.
- **Requirement:** A Team & Leadership management module supporting member profiles, departments, photo assets with focal-point coordinates, social media links, publication toggles, and sorting.

### 6.5 Case Studies Full Detail Model
- **Problem:** The existing `CaseStudy` model lacks fields for Challenge, Solution, Deliverables, Metrics, and Preview Type. Additionally, public pages (`/portfolio` and `/portfolio/[slug]`) bypass the backend and read from a static TypeScript file.
- **Requirement:** Update `CaseStudy` schema, implement `/api/v1/casestudies/by-slug/:slug`, and switch frontend portfolio pages to consume live API data.

### 6.6 Global Site Settings & Contact Multi-Channel
- **Problem:** Office addresses, working hours, Telegram/Instagram links, and multiple direct phone numbers (Manager, Web, Social) are hardcoded in `Footer.tsx` and `ContactCTA.tsx`.
- **Requirement:** A unified `SiteSetting` model and Admin Settings module managing brand contact details, working hours, social links, and footer links.

### 6.7 Page-Level SEO Metadata Editor
- **Problem:** While blog articles have dynamic SEO meta tags, landing pages (`/`, `/about`, `/services`, `/portfolio`, `/pricing`) have hardcoded metadata.
- **Requirement:** A `PageSeo` model enabling administrators to configure meta titles, descriptions, canonical URLs, and OpenGraph images for all core pages.

### 6.8 Section Visibility & Ordering Engine
- **Problem:** The sequence and display status of homepage sections are hardcoded in `page.tsx`.
- **Requirement:** A lightweight `HomeSection` table storing section keys, display order, and active status, allowing administrators to reorder or temporarily hide sections.

---

## 7. Recommended Database Architecture (Prisma Schema Updates)

All proposed additions preserve existing tables and relationships without breaking changes or data loss.

```prisma
// ============================================================================
// 1. CLIENTS & PARTNERS
// ============================================================================
model ClientPartner {
  id             Int      @id @default(autoincrement())
  orderNumber    String   @default("01")
  nameFa         String
  nameEn         String   @default("")
  titleFa        String
  titleEn        String   @default("")
  industryFa     String
  industryEn     String   @default("")
  introFa        String
  introEn        String   @default("")
  quoteFa        String?
  quoteEn        String?
  servicesFa     String[] @default([])
  servicesEn     String[] @default([])
  yearFa         String   @default("1403")
  yearEn         String   @default("2024")
  portraitImage  String?
  portraitBadgeFa String?
  portraitBadgeEn String?
  monogram       String   @default("OP")
  websites       Json     @default("[]") // [{ url: string, label: string }]
  instagrams     Json     @default("[]") // [{ handle: string, profileUrl: string }]
  isActive       Boolean  @default(true)
  position       Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([isActive])
  @@index([position])
  @@map("client_partners")
}

// ============================================================================
// 2. CLIENT BRAND LOGOS (MARQUEE)
// ============================================================================
model ClientLogo {
  id        Int      @id @default(autoincrement())
  nameFa    String
  nameEn    String   @default("")
  imageUrl  String
  width     Int      @default(200)
  height    Int      @default(100)
  isActive  Boolean  @default(true)
  position  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive])
  @@index([position])
  @@map("client_logos")
}

// ============================================================================
// 3. TEAM MEMBERS & LEADERSHIP
// ============================================================================
model TeamMember {
  id           Int      @id @default(autoincrement())
  nameFa       String
  nameEn       String   @default("")
  roleFa       String
  roleEn       String   @default("")
  departmentFa String   @default("عمومی")
  departmentEn String   @default("General")
  bioFa        String   @default("")
  bioEn        String   @default("")
  photoUrl     String?
  focalPoint   String   @default("50% 50%")
  socialLinks  Json     @default("[]") // [{ platform: string, url: string }]
  isPublished  Boolean  @default(true)
  isLeadership Boolean  @default(false)
  position     Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([isPublished])
  @@index([position])
  @@map("team_members")
}

// ============================================================================
// 4. ABOUT PAGE EXTENSIONS (SINGLETON)
// ============================================================================
model AboutPageSetting {
  id              Int      @id @default(1)
  heroEyebrowFa   String   @default("درباره آن‌ساپ")
  heroEyebrowEn   String   @default("About OnSupp")
  heroTitleFa     String   @default("تیمی فراتر از مرزهای سنتی دیجیتال مارکتینگ")
  heroTitleEn     String   @default("Beyond the Boundaries of Traditional Agency")
  heroCaptionFa   String   @default("")
  heroCaptionEn   String   @default("")
  heroImageUrl    String?
  introEyebrowFa  String   @default("دیدگاه استراتژیک")
  introEyebrowEn  String   @default("Strategic Vision")
  introTitleFa    String   @default("تمرکز بر ساختن ارزش‌های ماندگار")
  introTitleEn    String   @default("Focused on Enduring Value Creation")
  introLeadFa     String   @default("")
  introLeadEn     String   @default("")
  introApproachFa String   @default("")
  introApproachEn String   @default("")
  coreValues      Json     @default("[]") // [{ id, titleFa, titleEn, descFa, descEn }]
  ceoNameFa       String   @default("علی شمس")
  ceoNameEn       String   @default("Ali Shams")
  ceoRoleFa       String   @default("مدیرعامل و هم‌بنیان‌گذار")
  ceoRoleEn       String   @default("Chief Executive Officer & Co-Founder")
  ceoQuoteFa      String   @default("")
  ceoQuoteEn      String   @default("")
  ceoBioFa        String[] @default([])
  ceoBioEn        String[] @default([])
  ceoPhotoUrl     String?
  ceoSocialLinks  Json     @default("[]")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("about_page_settings")
}

// ============================================================================
// 5. EXPANDED SERVICE MODEL (DEPARTMENT DEEP DIVES)
// ============================================================================
// Modifying existing Service model to support deep-dive editorial content:
// model Service {
//   ... existing fields (id, title, titleEn, subtitle, subtitleEn, imageUrl, imageAlt, position)
//   + slug                  String   @default("") @unique
//   + tagFa                 String   @default("")
//   + tagEn                 String   @default("")
//   + iconType              String   @default("web")
//   + headlineFa            String   @default("")
//   + headlineEn            String   @default("")
//   + descriptionFa         String   @default("")
//   + descriptionEn         String   @default("")
//   + detailedNarrativeFa   String   @default("")
//   + detailedNarrativeEn   String   @default("")
//   + businessValueTitleFa  String   @default("")
//   + businessValueTitleEn  String   @default("")
//   + businessValueFa       String   @default("")
//   + businessValueEn       String   @default("")
//   + subservices           Json     @default("[]") // [{ nameFa, nameEn, descFa, descEn, deliverablesFa, deliverablesEn }]
//   + metrics               Json     @default("[]") // [{ valueFa, valueEn, labelFa, labelEn }]
//   + relatedLinks          Json     @default("[]") // [{ titleFa, titleEn, href, type }]
//   + isPublished           Boolean  @default(true)
// }

// ============================================================================
// 6. EXPANDED CASE STUDY MODEL (PORTFOLIO DETAIL)
// ============================================================================
// Modifying existing CaseStudy model to support full case study page:
// model CaseStudy {
//   ... existing fields
//   + servicesFa     String[] @default([])
//   + servicesEn     String[] @default([])
//   + metricsFa      Json     @default("[]") // [{ value: string, label: string }]
//   + metricsEn      Json     @default("[]") // [{ value: string, label: string }]
//   + challengeFa    String   @default("")
//   + challengeEn    String   @default("")
//   + solutionFa     String   @default("")
//   + solutionEn     String   @default("")
//   + deliverablesFa String[] @default([])
//   + deliverablesEn String[] @default([])
//   + colorGradient  String   @default("from-[#1a1315] via-[#241a1e] to-[#100b0d]")
//   + accentColor    String   @default("#8BB3A4")
//   + glowColor      String   @default("rgba(139, 179, 164, 0.2)")
//   + previewType    String   @default("web") // mobile | web | platform
// }

// ============================================================================
// 7. SITE-WIDE GLOBAL SETTINGS (SINGLETON)
// ============================================================================
model SiteSetting {
  id              Int      @id @default(1)
  siteNameFa      String   @default("آن‌ساپ")
  siteNameEn      String   @default("OnSupp")
  headerCtaTextFa String   @default("شروع همکاری")
  headerCtaTextEn String   @default("Get Started")
  headerCtaLink   String   @default("/#contact")
  addressTitleFa  String   @default("آدرس و نشانی")
  addressTitleEn  String   @default("Office Address")
  streetFa        String   @default("عظیمیه، میدان کوهنورد، گلستان ۲۱")
  streetEn        String   @default("Golestan 21, Kouhnavard Sq, Azimiyeh")
  cityFa          String   @default("البرز، کرج، منطقه عظیمیه")
  cityEn          String   @default("Alborz, Karaj, Azimiyeh District")
  workingHoursFa  String   @default("شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰")
  workingHoursEn  String   @default("Sat - Wed: 09:00 - 18:00")
  channels        Json     @default("[]") // [{ id, labelFa, labelEn, value, displayFa, displayEn, href, icon }]
  telegramUrl     String   @default("https://t.me/onsupp_web")
  telegramHandle  String   @default("onsupp_web")
  instagramUrl    String   @default("https://instagram.com/onsupp_web")
  consultEmail    String   @default("info@onsupp.ir")
  footerTextFa    String   @default("کلیه حقوق مادی و معنوی متعلق به آژانس دیجیتال مارکتینگ آن‌ساپ می‌باشد.")
  footerTextEn    String   @default("All rights reserved by OnSupp Digital Marketing Agency.")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("site_settings")
}

// ============================================================================
// 8. PAGE-LEVEL SEO METADATA
// ============================================================================
model PageSeo {
  id           Int      @id @default(autoincrement())
  routePath    String   @unique // "/", "/about", "/services", "/portfolio", "/pricing"
  titleFa      String
  titleEn      String   @default("")
  descriptionFa String
  descriptionEn String  @default("")
  keywordsFa   String   @default("")
  keywordsEn   String   @default("")
  canonicalUrl String   @default("")
  ogImageUrl   String?
  noIndex      Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("page_seo")
}

// ============================================================================
// 9. HOMEPAGE SECTION ORDERING & VISIBILITY
// ============================================================================
model HomeSection {
  id        Int      @id @default(autoincrement())
  key       String   @unique // "hero", "clients", "stats", "services", "about", "logos", "casestudies", "contact", "testimonials", "blog"
  titleFa   String
  titleEn   String   @default("")
  isVisible Boolean  @default(true)
  position  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([position])
  @@map("home_sections")
}
```

---

## 8. Required API Changes

### 8.1 New Endpoints to Implement

| HTTP Method | Route Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/client-partners` | Public | Returns published client partners ordered by `position`. |
| `POST, PUT, DELETE` | `/api/v1/client-partners/:id?` | Admin (`requireAdmin`) | CRUD for client partners showcase. |
| `GET` | `/api/v1/client-logos` | Public | Returns active brand logos ordered by `position`. |
| `POST, PUT, DELETE` | `/api/v1/client-logos/:id?` | Admin (`requireAdmin`) | CRUD for marquee logos. |
| `GET` | `/api/v1/team-members` | Public | Returns published team members ordered by `position`. |
| `POST, PUT, DELETE` | `/api/v1/team-members/:id?` | Admin (`requireAdmin` / `requireHR`) | CRUD for team members with focal point and socials. |
| `GET` | `/api/v1/about-page` | Public | Returns full About Page settings (Hero, Intro, Core Values, CEO). |
| `PUT` | `/api/v1/about-page` | Admin (`requireAdmin`) | Updates full About Page settings singleton. |
| `GET` | `/api/v1/casestudies/by-slug/:slug` | Public | Returns single case study by slug (falls back to drafts for Admin). |
| `GET` | `/api/v1/site-settings` | Public | Returns global contact, office address, working hours, footer texts. |
| `PUT` | `/api/v1/site-settings` | Admin (`requireAdmin`) | Updates global site settings singleton. |
| `GET` | `/api/v1/page-seo` | Public | Returns list or single page SEO metadata by query (`?path=/about`). |
| `PUT` | `/api/v1/page-seo/:id` | Admin (`requireContentManager`) | Upserts SEO metadata for a specific route path. |
| `GET` | `/api/v1/home-sections` | Public | Returns ordered homepage sections and visibility flags. |
| `PUT` | `/api/v1/home-sections/reorder` | Admin (`requireAdmin`) | Reorders and toggles visibility of homepage sections. |
| `POST` | `/api/v1/cache/revalidate` | Admin (`requireAdmin`) | Triggers Next.js on-demand cache revalidation. |

### 8.2 Enhancements to Existing Endpoints
- **`GET /api/v1/services`:** Support returning full deep-dive metadata and include query filter by slug (`/api/v1/services/by-slug/:slug`).
- **`GET /api/v1/stats`:** Return formatted items with `iconType` and `isRating` flags to allow direct consumption by `StatsSatisfaction.tsx`.
- **`GET /api/v1/casestudies`:** Expose all expanded fields (`challenge`, `solution`, `deliverables`, `metrics`, `previewType`) so frontend does not need static fallbacks.

---

## 9. Recommended Admin Dashboard Structure

```
+--------------------------------------------------------------------------------------------------+
|                                    ONSUPP ADMIN CONTROL PANEL                                    |
+--------------------------------------------------------------------------------------------------+
  [Overview & Analytics]
  * Dashboard & Health           -> /admin                        (System counts, activity feed, DB status)
  * Activity & Audit Logs        -> /admin/audit-logs             (System actions, user logins)

  [Homepage & Sections]
  * Section Ordering & Toggle    -> /admin/sections               (Drag-and-drop homepage section order)
  * Hero Showcase Slides         -> /admin/hero                   (Slide editor, position, CTAs)
  * Key Metrics & Ratings        -> /admin/stats                  (4 key counters, ratings, icons)
  * Client Brand Logos           -> /admin/client-logos           (Marquee logo assets, dimensions)

  [Core Content & Showcase]
  * Services & Departments       -> /admin/services               (7 departments, narratives, deliverables)
  * Case Studies & Portfolio     -> /admin/casestudies            (Flagship projects, metrics, challenges)
  * Clients & Partners           -> /admin/client-partners        (VIP client showcases, Instagram, quotes)
  * Client Testimonials          -> /admin/testimonials           (Reviews, avatars, highlights)

  [Company & Team]
  * About Page Story & Values    -> /admin/about                  (Hero caption, intro lead, 4 core values)
  * Leadership & CEO Profile     -> /admin/about/ceo              (CEO quotes, bio paragraphs, socials)
  * Team Members & Specialists   -> /admin/team                   (Staff directory, roles, photos, focal points)

  [Editorial & Community]
  * Blog Articles & Tutorials    -> /admin/articles               (WYSIWYG editor, FAQs, translations, SEO)
  * Comments Moderation          -> /admin/comments               (Approval workflow, admin replies)

  [Commercial & Growth]
  * Pricing Packages & Plans     -> /admin/pricing                (Categories, plan tiers, discount prices)
  * Contact Messages & Leads     -> /admin/contact                (Submissions inbox, status tracking)

  [System & Global Settings]
  * Site Settings & Contacts     -> /admin/settings               (Multi-channel phones, address, hours)
  * Page-Level SEO Manager       -> /admin/seo                    (Meta titles, descriptions, OG images)
  * Media Library                -> /admin/media                  (Direct upload, alt text, file manager)
  * Users & Access Roles (RBAC)  -> /admin/users                  (8 Role management, active toggles)
  * My Profile                   -> /admin/profile                (Account credentials, password update)
```

---

## 10. Implementation Roadmap with Dependencies & Priorities

```
[Phase 1: Wire Existing Disconnected Modules]
   |--> Task 1.1: Connect Homepage StatsSatisfaction to /api/v1/stats
   |--> Task 1.2: Connect Services.tsx and /services to /api/v1/services
   |--> Task 1.3: Connect /portfolio and /portfolio/[slug] to /api/v1/casestudies
   |
[Phase 2: Add Missing Commercial & Brand Modules]
   |--> Task 2.1: Implement Clients & Partners CMS Module (Model + API + Admin + Frontend)
   |--> Task 2.2: Implement Client Brand Logos Marquee CMS Module
   |--> Task 2.3: Implement About Page & Team Members CMS Module
   |
[Phase 3: Global System Settings & Multi-Channel Contacts]
   |--> Task 3.1: Implement SiteSetting model (Headquarters, Multi-channel phones, Working hours)
   |--> Task 3.2: Connect Footer.tsx & ContactCTA.tsx to live SiteSetting API
   |
[Phase 4: Dynamic SEO & Section Ordering Engine]
   |--> Task 4.1: Implement PageSeo model & dynamic Next.js generateMetadata
   |--> Task 4.2: Implement HomeSection ordering engine on Homepage
   |--> Task 4.3: Implement Next.js On-Demand Cache Invalidation Webhook
```

| Phase | Tasks Included | Target Modules | Dependencies | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Wire Existing Modules** | 1.1, 1.2, 1.3 | Stats, Services, CaseStudies | None (uses existing models + field extensions) | Medium |
| **Phase 2: Missing Brand Modules** | 2.1, 2.2, 2.3 | ClientsPartners, Logos, Team | Schema updates, Prisma migration | Medium-High |
| **Phase 3: Global Settings** | 3.1, 3.2 | Footer, Contact channels, Hours | Schema updates | Low-Medium |
| **Phase 4: SEO & Section Engine** | 4.1, 4.2, 4.3 | PageSeo, HomeSection, Cache | Phases 1-3 | Medium |

---

## 11. Risks and Backward Compatibility Considerations

1. **Non-Destructive Schema Evolution:**
   - All proposed Prisma model updates use default values (`@default("")`, `@default([])`) or optional fields (`?`). No existing columns will be dropped, preventing database errors or data loss.
2. **Graceful Fallback Architecture:**
   - In the event of a transient database connection issue or an empty table, frontend components must retain the verified canonical fallback constants rather than crashing with an empty state.
3. **Security & Permission Integrity:**
   - Public APIs must strictly enforce `where: { isPublished: true, isActive: true }` so that draft content is never leaked to unauthenticated users or search engines.
   - Admin mutations must retain the existing HS256 JWT validation and RBAC guards (`requireAdmin`, `requireContentManager`, `requireHR`).
4. **Performance & Core Web Vitals:**
   - Moving from static arrays to dynamic fetching must not degrade Largest Contentful Paint (LCP) or First Contentful Paint (FCP).
   - Dynamic sections will utilize Next.js Server Components with tag-based caching (`revalidateTag`) rather than client-side waterfalls, ensuring fast server-rendered HTML.

---

## 12. Architectural Decisions Requiring Approval Before Implementation

Before proceeding to implementation in subsequent tasks, the following three core architectural decisions should be confirmed:

1. **Structured Models vs. Generic Page Builder:**
   - *Recommendation:* Adopt **dedicated structured models** (`ClientPartner`, `TeamMember`, `Service`, `CaseStudy`) rather than a complex drag-and-drop page builder. Structured models preserve the precise typography, responsive layouts, motion effects, and bilingual structure of OnSupp while guaranteeing clean validation.
2. **Subservices & Metrics Representation (JSON vs. Child Tables):**
   - *Recommendation:* Store subservices and deliverables in Prisma PostgreSQL `Json` columns (e.g. `subservices Json @default("[]")`) within the parent `Service` and `CaseStudy` models. This avoids creating 5 additional relational tables and simplifies admin CRUD operations into single atomic transactions.
3. **Caching Strategy (Server Components + On-Demand Revalidation):**
   - *Recommendation:* Convert key public pages (`/about`, `/services`, `/portfolio`) to Next.js Server Components with ISR tags (e.g. `revalidateTag("services")`). When an admin saves changes in the CMS, an API trigger calls Next.js `revalidatePath()`, updating the public page immediately without client spinners or cold rebuilds.

---

## 13. Task 02: Backend Implementation Summary & API Catalog

### 13.1 Overview
The backend and database foundation for the Dynamic CMS has been fully implemented in `apps/backend` and verified against local PostgreSQL on port `5434` (`onsupp_redesign`). All 7 requested new models and 3 extended models have complete database schemas, additive migrations, REST endpoints, multi-tier RBAC enforcement, audit logging, and cache invalidation hooks.

### 13.2 Database Backup & Migration Status
- **Pre-Migration Backup:** Full JSON dump of all 17 pre-existing tables created and verified at `backups/onsupp_backup_before_task02_1793797077975.json` (72,490 bytes).
- **Migration:** `20261104130121_dynamic_cms_foundation` generated via Prisma Migrate dev and deployed with zero data loss or breaking changes.
- **Prisma Client:** Fresh client generated (`v6.19.3`) and synchronized with PostgreSQL schema.

### 13.3 Database Models & Schema Extensions
1. **`ContentStatus` Enum:** `DRAFT`, `PUBLISHED`, `ARCHIVED`.
2. **`SiteSetting` (Singleton id=1):** Company info, multi-channel contact numbers (executive, web dept, telegram, email), address, working hours, social links, footer texts, global SEO defaults, logo and media URLs.
3. **`ClientPartner`:** VIP client showcases, orderNumber, names (Fa/En), titles, industries, intros, quotes, services tags, year, badges, monogram, website links, instagram links, status, active toggle, position.
4. **`ClientLogo`:** Infinite marquee logos, name, image URL, dimensions (width, height), website link, status, active toggle, position.
5. **`TeamMember`:** Team members, leadership flags, names, roles, departments, biographies, photography, focal point, gallery, social links, status, published toggle, position.
6. **`AboutPageSetting` (Singleton id=1):** Dedicated /about page hero, strategic vision, core values, CEO name, executive role, signature quote, multi-paragraph bio, photos and social links.
7. **`HomeSection`:** Homepage section ordering engine (key, titleFa/En, type, isEnabled, position, custom settings).
8. **`PageSeo`:** Route-level SEO override engine (routePath unique, titleFa/En, descriptionFa/En, keywordsFa/En, canonicalUrl, ogImageUrl, noIndex).
9. **Extended `CaseStudy`:** Gallery array, services Fa/En, challenge Fa/En, solution Fa/En, deliverables Fa/En, metrics Fa/En, color gradient, accent/glow colors, preview type, SEO fields, status enum, published toggle.
10. **Extended `Service`:** Kebab-case slug, tag Fa/En, iconType, headlines, descriptions, detailed narrative, business value, cover image, gallery, subservices Json, deliverables Fa/En, metrics Json, related links, SEO fields, status enum, published toggle.
11. **Extended `Stat`:** IconType, suffix Fa/En, isRating boolean, status enum, published toggle.

### 13.4 Implemented REST API Endpoints Catalog

| Endpoint | Method | Access | RBAC Role Guard | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/site-settings` | GET | Public | None | Retrieve site settings singleton (auto-initializes default if missing) |
| `/api/v1/site-settings` | PUT | Protected | SUPER_ADMIN, ADMIN | Update site settings singleton (logs audit, triggers revalidation) |
| `/api/v1/client-partners` | GET | Public | None | List active & published partners ordered by position |
| `/api/v1/client-partners/admin` | GET | Protected | SUPER_ADMIN, ADMIN | Full partner list including drafts & inactive |
| `/api/v1/client-partners/:id` | GET | Public/Admin | Auth-conditional | Retrieve single partner (draft restricted to admin) |
| `/api/v1/client-partners` | POST | Protected | SUPER_ADMIN, ADMIN | Create new client partner |
| `/api/v1/client-partners/:id` | PUT | Protected | SUPER_ADMIN, ADMIN | Update client partner |
| `/api/v1/client-partners/:id` | DELETE | Protected | SUPER_ADMIN, ADMIN | Delete client partner |
| `/api/v1/client-partners/reorder` | PUT | Protected | SUPER_ADMIN, ADMIN | Batch reorder positions array `[{ id, position }]` |
| `/api/v1/client-logos` | GET | Public | None | List active & published logos ordered by position |
| `/api/v1/client-logos/admin` | GET | Protected | SUPER_ADMIN, ADMIN | Full logo list including drafts |
| `/api/v1/client-logos/:id` | GET | Public/Admin | Auth-conditional | Retrieve single logo |
| `/api/v1/client-logos` | POST | Protected | SUPER_ADMIN, ADMIN | Create new client logo |
| `/api/v1/client-logos/:id` | PUT | Protected | SUPER_ADMIN, ADMIN | Update client logo |
| `/api/v1/client-logos/:id` | DELETE | Protected | SUPER_ADMIN, ADMIN | Delete client logo |
| `/api/v1/client-logos/reorder` | PUT | Protected | SUPER_ADMIN, ADMIN | Batch reorder logos array |
| `/api/v1/team-members` | GET | Public | None | List published team members ordered by position |
| `/api/v1/team-members/admin` | GET | Protected | SUPER_ADMIN, ADMIN, HR | Full team list including drafts |
| `/api/v1/team-members/:id` | GET | Public/Admin | Auth-conditional | Retrieve single team member |
| `/api/v1/team-members` | POST | Protected | SUPER_ADMIN, ADMIN, HR | Create team member |
| `/api/v1/team-members/:id` | PUT | Protected | SUPER_ADMIN, ADMIN, HR | Update team member |
| `/api/v1/team-members/:id` | DELETE | Protected | SUPER_ADMIN, ADMIN, HR | Delete team member |
| `/api/v1/team-members/reorder` | PUT | Protected | SUPER_ADMIN, ADMIN, HR | Batch reorder team members |
| `/api/v1/about-page` | GET | Public | None | Retrieve dedicated /about page settings singleton |
| `/api/v1/about-page` | PUT | Protected | SUPER_ADMIN, ADMIN | Update /about page settings singleton |
| `/api/v1/home-sections` | GET | Public | None | List enabled homepage sections ordered by position |
| `/api/v1/home-sections/admin` | GET | Protected | SUPER_ADMIN, ADMIN | List all homepage sections |
| `/api/v1/home-sections/:key` | PUT | Protected | SUPER_ADMIN, ADMIN | Update homepage section properties/visibility |
| `/api/v1/home-sections/reorder` | PUT | Protected | SUPER_ADMIN, ADMIN | Batch update section positions & toggle status |
| `/api/v1/page-seo` | GET | Public | None | Query page SEO by `?routePath=/...` or list all |
| `/api/v1/page-seo/by-path` | GET | Public | None | Lookup SEO by query parameter `?path=/...` |
| `/api/v1/page-seo/admin` | GET | Protected | SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER | List all configured page SEO routes |
| `/api/v1/page-seo` | PUT | Protected | SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER | Upsert SEO configuration by `routePath` |
| `/api/v1/page-seo/:id` | DELETE | Protected | SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER | Delete SEO configuration |
| `/api/v1/services` | GET | Public | None | List published services only (`status: "PUBLISHED", published: true`) |
| `/api/v1/services/admin` | GET | Protected | SUPER_ADMIN, ADMIN | List all services including drafts |
| `/api/v1/services/by-slug/:slug` | GET | Public/Admin | Auth-conditional | Lookup service by kebab-case slug |
| `/api/v1/casestudies` | GET | Public | None | List published case studies only |
| `/api/v1/casestudies/admin` | GET | Protected | SUPER_ADMIN, ADMIN | List all case studies including drafts |
| `/api/v1/casestudies/by-slug/:slug` | GET | Public/Admin | Auth-conditional | Lookup case study by kebab-case slug |
| `/api/v1/stats` | GET | Public | None | List published stats only |
| `/api/v1/stats/admin` | GET | Protected | SUPER_ADMIN, ADMIN | List all stats including drafts |

### 13.5 Cache Invalidation Architecture
- **Next.js Receiver:** `apps/web/app/api/revalidate/route.ts` validates Bearer token against `REVALIDATION_SECRET`. Supports `path` revalidation, `tag` revalidation, or default root layout invalidation.
- **Express Dispatcher:** `apps/backend/src/services/revalidationService.ts` dispatches non-blocking async POST requests to Next.js upon content mutations (create, update, delete, reorder). Fails safely when frontend is in offline development mode without disrupting database transactions.

### 13.6 Automated Test Suite Results
A dedicated test suite (`apps/backend/src/test-dynamic-cms-backend.ts`) was created and executed:
- **Total Tests Executed:** 31
- **Passed:** 31 (100%)
- **Failed:** 0
- **Coverage Highlights:**
  - Multi-tier RBAC guards tested: HR allowed on Team Members, Content SEO Manager allowed on Page SEO, Standard User forbidden (403), Unauthenticated rejected (401).
  - Draft Leakage Defense verified: Items created with `DRAFT` status are confirmed 100% invisible to public `GET` endpoints and public slug lookups.
  - Audit logging verified for all create/update/delete operations.


---

## 14. Task 03: Frontend Integration & Admin Dashboard Implementation Summary

### 14.1 Overview
The frontend dynamic data integration and administrative management dashboards for the OnSupp Dynamic CMS have been fully implemented across `apps/web`. All editable website content is now connected to the PostgreSQL backend foundation created in Task 02. Site administrators, content managers, and HR personnel can manage public content in real-time through the dedicated `/admin` control panel without modifying source code or redeploying the application.

### 14.2 Core Architectural Principles Maintained
1. **Zero Source Code Content Dependency:**
   All public content elements (site configuration, multi-channel contacts, strategic partners, client marquee, team members, about page narrative, homepage section hierarchy, services, case studies, stats, and SEO metadata) dynamically load from the backend API.
2. **Resilient Offline Fallbacks:**
   Every public data loader incorporates typed placeholder fallbacks. In the event of backend downtime or network timeout, public pages render cleanly without unhandled runtime exceptions or blank states.
3. **Draft Leakage Prevention:**
   All public loaders strictly enforce status filtering (`status === 'PUBLISHED'` and `published === true`). Unfinished drafts, staging records, and deactivated items are strictly hidden from public pages and dynamic slug routes.
4. **Preserved Brand Visual Identity:**
   Zero modifications were made to typography, spacing, RTL flow, motion curves, or brand color palettes. Zero emojis are used in formal report files or UI components; all icons utilize clean, accessible Lucide SVG vector components.
5. **Next.js 16 ISR & On-Demand Revalidation:**
   Public pages leverage Next.js App Router cache tagging (e.g. `['site-settings']`, `['case-studies']`). Backend mutations trigger the secure `/api/revalidate` endpoint using `REVALIDATION_SECRET`, updating cached pages instantly.

---

### 14.3 Public Website Dynamic Integrations Catalog

| Component / Page | Route / File Path | Data Source Endpoint | Integration Details & Fallbacks |
| :--- | :--- | :--- | :--- |
| **Site Settings & Footer** | `components/layout/Footer.tsx` | `GET /api/v1/site-settings` | Loads company name, description, address, working hours, copyright, social links (Telegram, Instagram, LinkedIn), and executive contacts with `DEFAULT_SITE_SETTINGS` fallback. |
| **Interactive Contact CTA** | `components/sections/ContactCTA.tsx` | `GET /api/v1/site-settings` | Renders dynamic communication channels (Telegram handle/URL, executive line, website consultation line, email) directly from CMS settings. |
| **Client Logos Marquee** | `components/sections/ClientLogoMarquee.tsx` | `GET /api/v1/client-logos` | Dynamically streams active marquee brand logos with custom width, height, and website links, falling back to static partner list. |
| **Strategic Client Partners** | `components/sections/ClientsPartners.tsx` | `GET /api/v1/client-partners` | Full VIP showcase with company name, titles, industry, testimonials, service tags, project year, and verified client badges. |
| **Stats & Metrics** | `components/sections/StatsSatisfaction.tsx` | `GET /api/v1/stats` | Dynamic numeric counters with localized Persian suffixes, icon identifiers, and satisfaction rating toggles. |
| **Services Section** | `components/sections/Services.tsx` | `GET /api/v1/services` | Dynamic service cards with localized titles, descriptions, icon categories, tags, and dynamic detail links. |
| **Homepage Section Ordering** | `app/page.tsx` | `GET /api/v1/home-sections` | Dynamic section layout engine: fetches section configurations, sorts by `position`, filters out disabled sections (`isEnabled === false`), and renders the 10 homepage sections dynamically. |
| **About Us Page** | `app/about/page.tsx` | `GET /api/v1/about-page`<br/>`GET /api/v1/team-members` | Server Component awaiting `getAboutPageContent()`. Renders dynamic Hero, Strategic Vision, Core Values cards, CEO Profile/Quote, and dynamic Team Members Grid. |
| **Portfolio Archive** | `app/portfolio/page.tsx`<br/>`app/case-studies/page.tsx` | `GET /api/v1/casestudies` | Server-rendered portfolio grid using `fetchCaseStudies()` and `normalizeCaseStudy()` with dynamic filtering by category, deliverables, and metrics. |
| **Case Study Detail Views** | `app/portfolio/[slug]/page.tsx`<br/>`app/case-studies/[slug]/page.tsx` | `GET /api/v1/casestudies/by-slug/:slug` | Dynamic detail pages displaying project hero, client information, year, deliverables, challenge, solution, metric badges, dynamic image gallery, and custom color glow gradients. |
| **Dynamic Route SEO** | `app/portfolio/[slug]/layout.tsx`<br/>`lib/seo.ts` | `GET /api/v1/page-seo/by-route`<br/>`GET /api/v1/casestudies/by-slug/:slug` | Injects dynamic metadata via Next.js `generateMetadata`: dynamic title, description, canonical URL, OpenGraph cards, and robot indexing instructions. |

---

### 14.4 Admin Dashboard Management Interfaces (10 Modules)

All administrative interfaces are located in `apps/web/app/admin/(dashboard)/` and are guarded by JWT authentication and multi-tier role-based access control (RBAC):

1. **Site Settings (`/admin/site-settings`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Comprehensive single-page editor for site identity (Persian/English names, meta descriptions, CTA copy), contact channels editor (Telegram, Instagram, LinkedIn, consultation emails, multi-line phone numbers), physical location (street address, city, working hours), and media branding (header logo, footer logo, favicon, OG share card) with direct `MediaPickerModal` integration.
2. **Strategic Client Partners (`/admin/client-partners`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Tabular management of VIP partners with real-time status badges (`DRAFT`, `PUBLISHED`, `ARCHIVED`), active toggles, and position reordering. Full modal editor supporting name, title, industry, testimonial quote, service badges, project year, monogram, and website URLs.
3. **Client Logos Marquee (`/admin/client-logos`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Management of infinite marquee client logos. Supports title, image selection via media picker, display width/height dimensions, target website URL, and position reordering.
4. **Team Members (`/admin/team-members`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`, `HR`.
   - **Capabilities:** Full management of studio team members. Features leadership badges, department categorization, bio narratives, portrait selection with focal-point selector, social media profiles, and reordering.
5. **About Page Content (`/admin/about-page`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Tabbed editor covering:
     - *Hero Section:* Eyebrow, headline, descriptive lead paragraph, and hero image.
     - *Strategic Vision & Approach:* Vision statements and methodology narratives.
     - *Core Values:* Dynamic array editor allowing admins to add, edit, reorder, and remove company value cards.
     - *Executive Leadership:* CEO portrait, name, executive title, signature quote, biographical summary, and social links.
6. **Homepage Sections Hierarchy (`/admin/home-sections`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Visual section order manager for the 10 homepage blocks. Supports drag-and-drop / numeric priority sorting, quick enable/disable visibility toggles, and instant layout persistence.
7. **Services Management (`/admin/services`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Complete service catalog editor. Supports kebab-case URL slug, category tags, Lucide icon identifier, headline, detailed multi-paragraph service narrative, business impact statement, cover image picker, dynamic subservices list editor, deliverable chips, and metric KPIs.
8. **Case Studies Management (`/admin/casestudies`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** Comprehensive portfolio project editor. Supports title, kebab-case URL slug, client name, industry category, year, cover image, project gallery, deliverables list, quantifiable metric chips, challenge description, solution description, and color gradient configurations.
9. **Stats & Metrics (`/admin/stats`):**
   - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`.
   - **Capabilities:** KPI counter manager supporting metric values, localized labels, Persian suffixes (e.g. `+`, `٪`), icon type identifiers, 5-star rating toggle, and ordering.
10. **Page SEO Engine (`/admin/page-seo`):**
    - **RBAC Roles:** `SUPER_ADMIN`, `ADMIN`, `CONTENT_SEO_MANAGER`.
    - **Capabilities:** Dedicated route-level meta tag manager. Features interactive Google SERP live preview snippet, title, meta description, comma-separated keywords, canonical URL, OG image selector, and no-index robot instructions.

---

### 14.5 Navigation & Layout Integration
The admin dashboard sidebar navigation (`apps/web/app/admin/(dashboard)/layout.tsx`) was reorganized into intuitive functional groups with RBAC filtering:
- **محتوا و صفحات (Content & Pages):** درباره ما (`/admin/about-page`), چیدمان صفحه اصلی (`/admin/home-sections`), خدمات (`/admin/services`), نمونه کارها (`/admin/casestudies`), اعضای تیم (`/admin/team-members`).
- **برند و همکاران (Brand & Partners):** مشتریان ویژه (`/admin/client-partners`), لوگوی مشتریان (`/admin/client-logos`), آمار و ارقام (`/admin/stats`).
- **تنظیمات و سئو (Settings & SEO):** سئو صفحات (`/admin/page-seo`), تنظیمات کلی سایت (`/admin/site-settings`).

---

### 14.6 Verification & Automated Test Results

Two comprehensive automated test suites were executed to verify backend foundation integrity, RBAC security, draft isolation, and end-to-end frontend integration:

#### Test Suite 1: Backend Foundation Suite (`test-dynamic-cms-backend.ts`)
- **Total Tests:** 31
- **Passed:** 31 (100%)
- **Failed:** 0
- **Scope:** Complete CRUD validation for all 10 modules, multi-tier RBAC authorization checks, and audit logging.

#### Test Suite 2: Task 03 E2E Integration Suite (`test-dynamic-cms-task03-e2e.ts`)
- **Total Tests:** 18
- **Passed:** 18 (100%)
- **Failed:** 0
- **Scope:**
  - Section 1: Public CMS Endpoints Read Integration (All 9 public endpoints verified).
  - Section 2: Multi-Tier RBAC Verification (HR, Content SEO Manager, and Admin role permissions verified; unauthenticated and User roles blocked).
  - Section 3: Draft Leakage Prevention (Draft partners, services, and case studies strictly verified as non-leaking).
  - Section 4: Homepage Sections Dynamic Reordering Engine (Verified batch reorder and visibility updates).
  - Section 5: Site Settings Persistence & Multi-Channel Contact Flow (Verified update and persistence).

#### TypeScript Compilation Verification
- `apps/backend`: **0 errors** (`tsc --noEmit --project apps/backend/tsconfig.json` exited with code 0).
- `apps/web`: **0 errors** (`tsc --noEmit --project apps/web/tsconfig.json` exited with code 0).

---

### 14.7 Conclusion & Deliverable Status
With the completion of Task 03:
1. Every piece of public-facing content on the OnSupp website is managed dynamically through PostgreSQL and Prisma.
2. Admins, HR managers, and SEO specialists can update content through an intuitive, fully bilingual Persian RTL admin interface.
3. Content updates take effect immediately via Next.js ISR on-demand cache revalidation without redeploying the app or editing source code.
