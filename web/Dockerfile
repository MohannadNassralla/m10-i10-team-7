# --- Stage 1: builder ---
# node:20-slim (Debian, glibc) rather than node:20-alpine (musl) so that
# the @next/swc-linux-x64-gnu binary locked in package-lock.json loads
# correctly. Alpine would require @next/swc-linux-x64-musl, which is not
# included in lockfiles generated on macOS / Debian hosts.
FROM node:20-slim AS builder
WORKDIR /app

# Configure npm with aggressive retry and timeout settings
RUN npm config set fetch-timeout=180000 && \
    npm config set fetch-retry-mintimeout=30000 && \
    npm config set fetch-retry-maxtimeout=180000 && \
    npm config set fetch-retries=10 && \
    npm config set audit false && \
    npm cache clean --force

COPY package*.json ./
RUN npm ci --verbose

# Optimize layer caching: copy lockfiles first so npm ci is cached
COPY package*.json ./
RUN npm ci

# Copy the remaining client source files
COPY . .

# Set up the required host-facing Next.js API build argument
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Raise Node heap so the Next.js build's parallel worker does not OOM on
# Docker Desktop's default 2GB VM allocation (Jest worker exits with
# `WorkerError: encountered 1 child process exceptions`).
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# --- Stage 2: runner ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Configure npm with aggressive retry and timeout settings
RUN npm config set fetch-timeout=180000 && \
    npm config set fetch-retry-mintimeout=30000 && \
    npm config set fetch-retry-maxtimeout=180000 && \
    npm config set fetch-retries=10 && \
    npm config set audit false && \
    npm cache clean --force

COPY package*.json ./
RUN npm ci --omit=dev --verbose
COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]