# ── Build stage ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
