# Task 14 — Dynamic Category Attributes System: Technical & Architectural Documentation

## 1. Overview
In accordance with **Task 14**, the dynamic category attributes system was audited, expanded, and validated across the database, backend APIs, admin panel, and public frontend in `D:\Projects\Antigravity\onsupp website\onsupp-redesign`.

## 2. Architecture & Data Model

### 2.1 Prisma Schema & Database Models
The architecture avoids adding static, fixed columns for each new attribute and requires zero schema migrations when new attributes are defined by an administrator:

1. **`PortfolioCategory` (`portfolio_categories`)**:
   - Represents the content category (e.g. `website-design`, `seo`, `branding`, `social-media`).
   - Fields: `id`, `slug`, `titleFa`, `titleEn`, `descriptionFa`, `descriptionEn`, `icon`, `color`, `position`, `isActive`.
   - Has a 1-to-many relation with `PortfolioAttributeTemplate`.
   - Has a 1-to-many relation with `CaseStudy`.

2. **`PortfolioAttributeTemplate` (`portfolio_attribute_templates`)**:
   - Defines a custom attribute rule for a category.
   - Fields:
     - `key`: Unique system identifier for the attribute (e.g. `tech_stack`, `has_online_booking`, `target_industry`).
     - `titleFa` / `titleEn`: Display titles in Persian and English.
     - `descriptionFa` / `descriptionEn`: Helper / tooltip instructions for editors.
     - `type`: Enum `AttributeType`.
     - `isRequired`: Boolean indicating whether the field must be populated.
     - `unit`: Optional measurement or KPI unit (e.g. `٪`, `رتبه`, `ثانیه`).
     - `showInFrontend`: Boolean controlling public display on the website.
     - `position`: Display sort order.
     - `isActive`: Toggle active/inactive without deleting previous data.
     - `options`: JSON payload holding choices for `SELECT` and `MULTI_SELECT` fields (`{ "choices": ["...", "..."] }`).

3. **`PortfolioAttributeValue` (`portfolio_attribute_values`)**:
   - Stores the actual content values mapped to each project.
   - Compound unique index: `@@unique([caseStudyId, attributeKey])`.
   - Fields:
     - `caseStudyId`: ID of the project.
     - `attributeId`: Foreign key to template (SetNull on delete to preserve historical data).
     - `attributeKey`: Denormalized key to prevent data loss even if template is modified.
     - `type`: Data type.
     - `valueText`: Stored string representation (or primary value).
     - `valueNumber`: Numerical value for KPIs and percentages.
     - `valueJson`: Structured payload for complex data types (options arrays, before/after images, links with labels).

4. **Supported Attribute Types (`AttributeType`)**:
   - **`TEXT`**: Short single-line text.
   - **`TEXTAREA`**: Multi-line description / specifications.
   - **`NUMBER`**: Numeric KPI or counter value.
   - **`PERCENTAGE`**: Percentage metric with progress indicators.
   - **`SELECT`**: Single choice dropdown from predefined options.
   - **`MULTI_SELECT`**: Multiple tag choices from predefined options.
   - **`BOOLEAN`**: Yes/No switch / toggle.
   - **`IMAGE`**: Image selection integrated with `MediaPickerModal` / media library.
   - **`LINK`**: External live URL with optional label.
   - **`BEFORE_AFTER`**: Comparative benchmark with before & after images and notes.

---

## 3. Backend APIs

- **`GET /api/v1/portfolio/categories`**: Public endpoint returning all active categories and their active attribute templates.
- **`GET /api/v1/portfolio/categories/all`**: Admin endpoint returning all categories (including drafts/inactive), template counts, and case study counts.
- **`POST /api/v1/portfolio/categories`**: Admin endpoint to create a new category.
- **`PUT /api/v1/portfolio/categories/:id`**: Admin endpoint to update category details.
- **`DELETE /api/v1/portfolio/categories/:id`**: Admin endpoint to safely delete or archive category.
- **`POST /api/v1/portfolio/categories/:id/attributes`**: Admin endpoint to add an attribute template with Zod schema validation.
- **`PUT /api/v1/portfolio/categories/attributes/:attrId`**: Admin endpoint to update an existing attribute template.
- **`DELETE /api/v1/portfolio/categories/attributes/:attrId`**: Admin endpoint to delete an attribute template without dropping existing stored values.
- **`PUT /api/v1/portfolio/categories/:id/attributes/reorder`**: Admin endpoint for drag-and-drop / bulk sorting of attributes.
- **`POST /api/v1/casestudies` & `PUT /api/v1/casestudies/:id`**:
  - Automatically receives `attributeValues` payload.
  - Automatically parses and validates values according to their `AttributeType`.
  - Upserts to `PortfolioAttributeValue` while preserving historical values if the category changes.

---

## 4. Frontend & Admin Panel Components

1. **`CategoryTemplateManager.tsx` (`apps/web/components/admin/portfolio/CategoryTemplateManager.tsx`)**:
   - Category management modal (titleFa, titleEn, slug, description, color, active state).
   - Attribute template modal supporting all 10 attribute types, including options editor for `SELECT` and `MULTI_SELECT`.
   - Inline badges, reordering, and preview of dynamic forms.

2. **`DynamicAttributesForm.tsx` (`apps/web/components/admin/portfolio/DynamicAttributesForm.tsx`)**:
   - Dynamically loaded inside case study edit modal (`apps/web/app/admin/(dashboard)/casestudies/page.tsx`).
   - Renders appropriate UI input controls based on `attr.type`:
     - Text inputs with unit tags.
     - Number inputs with floating point support.
     - Percentage sliders.
     - Single select dropdowns.
     - Multi-select interactive pills.
     - Boolean toggle switch.
     - Media library image picker trigger (`MediaPickerModal`).
     - Live link input with label.
     - Before/After dual-image comparison uploader.
   - Dynamic switching: changing the category dynamically refreshes available attribute fields while maintaining previous values in state.

3. **`DynamicAttributesShowcase.tsx` (`apps/web/components/portfolio/DynamicAttributesShowcase.tsx`)**:
   - Rendered in public case study detail pages (`apps/web/app/portfolio/[slug]/page.tsx`).
   - Strictly respects **Design Freeze**: preserves layout, typography, and existing glassmorphic styling.
   - Categorized rendering:
     - Numerical KPI strips with custom units.
     - Before / After benchmark cards.
     - Technical specifications and custom attributes grid.
     - Boolean pills (`بله / فعال`, `خیر / غیرفعال`).
     - Multi-select badge lists.
     - Attached media and verified live links.

---

## 5. Verification & TypeScript Check
- **Database Migration:** Created and executed `20261106174500_expand_attribute_types/migration.sql` to extend `AttributeType` enum in PostgreSQL without data loss.
- **Backend Typecheck:** `npx tsc --noEmit` in `apps/backend` passed with **0 errors**.
- **Frontend Typecheck:** `npx tsc --noEmit` in `apps/web` passed with **0 errors**.
