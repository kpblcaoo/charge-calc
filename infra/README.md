# Infrastructure

Centralized infra assets.

## Files
| File | Purpose |
|------|---------|
| docker-compose.dev.yml | Local HTTPS (self-signed) stack with nginx inside app image + cert generator |
| docker-compose.caddy.yml | Caddy reverse proxy serving built assets (future real cert automation) |
| nginx/charge-calc.conf | Nginx config copied into runtime image |
| caddy/Caddyfile | Caddy config (HTTP; enable auto HTTPS for production) |

## Usage
Dev HTTPS:
```bash
docker compose -f infra/docker-compose.dev.yml up --build
```
Caddy:
```bash
docker compose -f infra/docker-compose.caddy.yml up --build
```

## Production (Future)
1. Build static image once (CI)
2. Serve via Caddy or Nginx with real domain & Let's Encrypt
