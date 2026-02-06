# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache openssl \
  && corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client generation (no-op if prisma isn't used at runtime)
RUN pnpm prisma generate
RUN pnpm build
# Keep only production deps for the runtime image
RUN pnpm prune --prod

FROM base AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:/data/dev.db
WORKDIR /app

# Install Prisma CLI for runtime migrations without changing lockfile
RUN npm i -g prisma@6.1.0

# Copy production node_modules and build output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

RUN mkdir -p /data \
  && chown -R node:node /data

USER node
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "build"]
