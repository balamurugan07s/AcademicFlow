# Multi-stage production Dockerfile for EngineeringHub Backend API & Worker

# Stage 1: Dependency & Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client and compile TypeScript to dist/
RUN npx prisma generate
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Production Runtime Stage (Minimal Attack Surface, Non-Root)
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma engine and curl for container health check
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=4000

# Run container as unprivileged non-root node user
USER node

# Copy compiled artifacts from builder stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 4000

# Automated container health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
