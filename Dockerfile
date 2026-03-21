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

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Coolify/Traefik uses this to know the container is healthy and ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/ > /dev/null || exit 1

USER appuser

CMD ["node", "dist/server/entry.mjs"]
