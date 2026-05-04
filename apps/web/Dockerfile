# ─────────────────────────────────────────────────────────────────
# Web (Next.js) Dockerfile - Production & Development
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
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ─── Builder Stage ────────────────────────────────────────────────
FROM dependencies AS builder

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages
COPY turbo.json ./

# Build packages first
RUN pnpm --filter "@repo/trpc-contract" build

# Build the Web app
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter "@repo/web" build

# ─── Production Stage ───────────────────────────────────────────
FROM node:20-alpine AS production

RUN npm install -g pnpm@9
WORKDIR /app

# Copy necessary files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.* ./apps/web/
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]

# ─── Development Stage ──────────────────────────────────────────
FROM dependencies AS development

# Copy source code for hot reload
COPY apps/web ./apps/web
COPY packages ./packages
COPY turbo.json ./

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]
