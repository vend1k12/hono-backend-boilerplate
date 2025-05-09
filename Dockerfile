FROM oven/bun:1 as base

WORKDIR /app

# Установка зависимостей
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Сборка
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run db:generate
RUN bun run build

# Production образ
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Это позволяет работать Prisma в docker
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

EXPOSE 3000

CMD ["bun", "start"] 