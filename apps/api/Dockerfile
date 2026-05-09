# ─────────────────────────────────────────────────────────────────
# API (NestJS) Dockerfile - Production
# ─────────────────────────────────────────────────────────────────

# ─── Base Stage ─────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

# ─── Dependencies Stage ─────────────────────────────────────────
FROM base AS dependencies

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/

# Install all dependencies (ignore scripts to skip husky)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Builder Stage ────────────────────────────────────────────────
FROM dependencies AS builder

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages
COPY turbo.json ./

# Build packages first
RUN pnpm --filter "@repo/trpc-contract" build

# Build the API
RUN pnpm --filter "@repo/api" build

# ─── Production Stage ───────────────────────────────────────────
FROM node:20-alpine AS production

# Install Chrome for Puppeteer (PDF generation)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install -g pnpm@9
WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install production dependencies only (ignore scripts to skip husky)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]
