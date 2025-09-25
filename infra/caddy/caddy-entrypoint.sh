#!/bin/sh
set -e

TARGET=/etc/caddy/Caddyfile
mkdir -p /etc/caddy

if [ -n "${DOMAIN}" ]; then
  echo "[caddy-entrypoint] DOMAIN detected: ${DOMAIN} -> enabling automatic HTTPS" >&2
  {
    if [ -n "${EMAIL}" ]; then
      echo "{"
      echo "  email ${EMAIL}"
      echo "}"
      echo
    fi
    echo "${DOMAIN} {"
    echo "  root * /srv/app"
    echo "  try_files {path} /index.html"
    echo "  file_server"
    echo "  @health path /healthz"
    echo "  respond @health 200 {"
    echo "    body \"ok\""
    echo "    close"
    echo "  }"
    echo "  header /* Cache-Control \"public, max-age=31536000, immutable\""
    echo "}"
  } > "$TARGET"
else
  echo "[caddy-entrypoint] No DOMAIN -> using local HTTP config" >&2
  cp /caddy/Caddyfile.local "$TARGET"
fi

exec caddy run --config "$TARGET" --adapter caddyfile
