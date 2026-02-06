FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i -g pnpm && pnpm i
RUN pnpm run build
RUN pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json package.json
RUN apk add yt-dlp
CMD ["node", "build"]