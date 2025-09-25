## Multi-stage build for Charge Calc web app
## 1. Build stage: compile TypeScript & bundle with Vite
FROM node:22.12.0-alpine AS build
WORKDIR /app

# Install build deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy sources
COPY tsconfig.json index.html vite.config.ts ./
COPY src ./src

# Build (type check + production bundle)
RUN npm run build

## 2. Runtime stage: static file server (nginx)
FROM nginx:1.27-alpine AS runtime

## Security hardening: remove default configs & temp files
RUN rm -rf /etc/nginx/conf.d/* /tmp/* /var/tmp/*

## Copy nginx config from infra directory
COPY infra/nginx/charge-calc.conf /etc/nginx/conf.d/charge-calc.conf

# Copy compiled app
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Certs mount point (optional when using docker compose with HTTPS)
RUN mkdir -p /certs && chown -R nginx:nginx /certs

# Labels (OCI)
LABEL org.opencontainers.image.title="charge-calc-web" \
      org.opencontainers.image.source="https://example.invalid/charge-calc" \
      org.opencontainers.image.description="Charge calculation web UI (EDF/XLSX parser)" \
      org.opencontainers.image.licenses="UNLICENSED"
