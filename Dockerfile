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

## Provide minimal nginx config tuned for a SPA / static assets
COPY <<'EOF' /etc/nginx/conf.d/charge-calc.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    # Gzip basic text assets
    gzip on;
    gzip_types text/plain text/css application/javascript application/json application/wasm;
    gzip_min_length 1024;

    # Cache immutable build assets aggressively (hashed filenames)
    location ~* \.(?:js|css|woff2?|ttf|eot|png|jpg|jpeg|gif|webp|svg)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # Index (SPA) fallback
    location / {
        try_files $uri /index.html;
    }

    # Basic health check endpoint
    location /healthz { return 200 'ok'; add_header Content-Type text/plain; }
}
EOF

# Copy compiled app
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Labels (OCI)
LABEL org.opencontainers.image.title="charge-calc-web" \
      org.opencontainers.image.source="https://example.invalid/charge-calc" \
      org.opencontainers.image.description="Charge calculation web UI (EDF/XLSX parser)" \
      org.opencontainers.image.licenses="UNLICENSED"
