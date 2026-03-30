# Build stage
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Build stage - do everything in one stage to preserve pnpm's symlink structure
FROM base AS builder
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Copy everything
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_URL=https://ui.simplifyingai.com

# Install ALL dependencies (including devDependencies for build) and build
# NODE_ENV=development ensures devDependencies are installed
RUN NODE_ENV=development pnpm install --frozen-lockfile && \
    NODE_ENV=production pnpm --filter=simplify-charts-www run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output (with correct ownership for nextjs user)
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/.next/static ./apps/www/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/public ./apps/www/public

# Copy registry, content, and .source directories (required by outputFileTracingIncludes)
# .source contains fumadocs-mdx compiled MDX content map - required for /docs routes
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/registry ./apps/www/registry
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/content ./apps/www/content
COPY --from=builder --chown=nextjs:nodejs /app/apps/www/.source ./apps/www/.source

# Create cache directory for Next.js ISR/prerender cache
RUN mkdir -p /app/apps/www/.next/cache && chown -R nextjs:nodejs /app/apps/www/.next/cache

USER nextjs

EXPOSE 3000

# Add simple healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "apps/www/server.js"]
