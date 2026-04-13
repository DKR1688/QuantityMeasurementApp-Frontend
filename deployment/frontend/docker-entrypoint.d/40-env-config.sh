#!/bin/sh
set -eu

API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
SANITIZED_API_BASE_URL="${API_BASE_URL%/}"

cat <<EOF >/usr/share/nginx/html/env.js
window.__env = window.__env || {};
window.__env.API_BASE_URL = '${SANITIZED_API_BASE_URL}';
EOF
