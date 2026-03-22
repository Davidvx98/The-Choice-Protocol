# ── Build stage ────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Install ALL deps (devDependencies needed for tailwindcss, typescript, astro build)
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Prune devDependencies so only production deps go to the runtime image
RUN npm prune --omit=dev

# ── Production stage ──────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# bash needed for Dokploy exec commands (Alpine only has sh by default)
RUN apk add --no-cache bash

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV HOST=0.0.0.0
# PORT can be overridden at runtime: docker run -e PORT=8080 ...
# @astrojs/node standalone mode reads HOST and PORT automatically
ENV PORT=3000
ENV NODE_ENV=production

# EXPOSE is documentation only; actual port is controlled by PORT env var
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/ > /dev/null || exit 1

USER appuser

CMD ["node", "dist/server/entry.mjs"]
