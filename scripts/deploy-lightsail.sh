#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env.docker"

cd "${PROJECT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Falta ${ENV_FILE}. Copia .env.lightsail.example y reemplaza sus marcadores." >&2
  exit 1
fi

if grep -q "REEMPLAZAR_" "${ENV_FILE}"; then
  echo ".env.docker todavía contiene marcadores sin reemplazar." >&2
  exit 1
fi

APP_DOMAIN="$(sed -n 's/^APP_DOMAIN=//p' "${ENV_FILE}" | tail -n 1 | tr -d '\r')"
if [[ ! "${APP_DOMAIN}" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "APP_DOMAIN no esta definido o no es un dominio valido." >&2
  exit 1
fi

docker compose --env-file "${ENV_FILE}" config --quiet
docker compose --env-file "${ENV_FILE}" up --build -d
docker compose --env-file "${ENV_FILE}" exec -T backend \
  python manage.py import_stand_inventory

echo "Esperando el health check público..."
docker compose --env-file "${ENV_FILE}" exec -T backend \
  python -c "import urllib.request; request = urllib.request.Request('http://localhost:8000/api/health/', headers={'X-Forwarded-Proto': 'https'}); print(urllib.request.urlopen(request, timeout=3).read().decode())"
echo

curl --fail --silent --show-error \
  --retry 24 --retry-delay 5 --retry-connrefused --retry-all-errors \
  "https://${APP_DOMAIN}/api/health/"
echo

docker compose --env-file "${ENV_FILE}" ps
echo "Despliegue completado."
