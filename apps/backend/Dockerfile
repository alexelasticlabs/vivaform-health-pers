# Backend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
RUN npm i -g pnpm@9 && pnpm fetch
ARG NODE_ENV=production
COPY ../../packages ./packages
COPY ../../apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile --filter @vivaform/backend... && pnpm --filter @vivaform/backend build && pnpm --filter @vivaform/backend prisma generate

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN npm i -g pnpm@9
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
CMD ["node","apps/backend/dist/main.js"]
