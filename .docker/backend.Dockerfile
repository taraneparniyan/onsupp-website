# =============================================================================
# Production Dockerfile for OnSupp Backend Service (Express + Prisma + TS)
# =============================================================================

# --- Stage 1: Build & Prune Dependencies ---
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root workspace definitions
COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies for backend workspace
RUN npm ci --workspace=apps/backend

# Generate Prisma Client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Copy source code and TypeScript config
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src/

# Compile TypeScript to dist
RUN cd apps/backend && npx tsc

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy workspace package definitions
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install production dependencies only
RUN npm ci --workspace=apps/backend --omit=dev

# Generate Prisma client for runtime
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Copy compiled backend dist from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Create uploads directory
RUN mkdir -p /app/apps/backend/uploads

WORKDIR /app/apps/backend

EXPOSE 3001

CMD ["node", "dist/server.js"]
