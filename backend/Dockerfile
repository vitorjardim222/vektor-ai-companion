# =============================================================
# VEKTOR A.I — Backend (Fastify) Dockerfile — Phase 2 scaffold
# This image will run the API: Fastify + Prisma + BullMQ workers.
# Implementation is added in the next phase. The Dockerfile is
# ready so docker-compose works end-to-end from day one.
# =============================================================

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev || true

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["node", "src/index.js"]
