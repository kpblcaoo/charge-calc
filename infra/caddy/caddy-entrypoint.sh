#!/bin/sh
set -e

TARGET=/etc/caddy/Caddyfile
mkdir -p /etc/caddy

if [ -n "${DOMAIN}" ]; then
  echo "[caddy-entrypoint] DOMAIN detected: ${DOMAIN} -> enabling automatic HTTPS reverse proxy" >&2
  {
    if [ -n "${EMAIL}" ]; then
      echo "{"
      echo "  email ${EMAIL}"
      echo "}"
      echo
    fi
    echo "${DOMAIN} {"
    echo "  encode gzip"
    echo "  @health path /healthz"
    echo "  reverse_proxy app:80"
    echo "}"
  } > "$TARGET"
else
  echo "[caddy-entrypoint] No DOMAIN -> using local HTTP reverse proxy config" >&2
  cp /caddy/Caddyfile.local "$TARGET"
fi

exec caddy run --config "$TARGET" --adapter caddyfile
