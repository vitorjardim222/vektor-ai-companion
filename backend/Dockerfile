# =============================================================
# VEKTOR A.I — Backend (Fastify + Prisma) Dockerfile
# =============================================================

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npx prisma generate

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node src/index.js"]
