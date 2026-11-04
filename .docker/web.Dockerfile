# =============================================================================
# Production Dockerfile for OnSupp Web Frontend (Next.js 16 + React 19)
# =============================================================================

# --- Stage 1: Build Next.js Application ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root workspace definitions
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/

# Install all dependencies for web workspace
RUN npm ci --workspace=apps/web

# Copy web source directory
COPY apps/web ./apps/web

WORKDIR /app/apps/web

# Disable Next.js telemetry & run production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy workspace package definitions
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install production dependencies only
RUN npm ci --workspace=apps/web --omit=dev

# Copy Next.js production build output and static public assets
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
