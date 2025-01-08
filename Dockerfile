FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
COPY openapi.yaml ./


COPY src/config/db/prisma/schema.prisma ./src/config/db/prisma/schema.prisma

RUN npx prisma generate --schema=src/config/db/prisma/schema.prisma
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/openapi.yaml ./
COPY src/config/db/prisma/ ./dist/config/db/prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD [ "npm" ,"start"]

