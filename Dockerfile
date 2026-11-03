FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Build does not need a database connection.
RUN npm run build
# Compile the seed to plain JS so the runtime image does not need tsx.
RUN npx esbuild prisma/seed.ts --bundle --platform=node --external:@prisma/client --outfile=prisma/seed.js

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Prisma CLI in its own folder, only used for `migrate deploy` at container start.
ARG PRISMA_VERSION=6.19.3
RUN mkdir /prisma-cli && cd /prisma-cli && npm init -y >/dev/null && npm i prisma@${PRISMA_VERSION} --omit=dev && chown -R nextjs:nodejs /prisma-cli

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "node /prisma-cli/node_modules/prisma/build/index.js migrate deploy && node prisma/seed.js && node server.js"]
