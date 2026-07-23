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

docker compose --env-file "${ENV_FILE}" config --quiet
docker compose --env-file "${ENV_FILE}" up --build -d
docker compose --env-file "${ENV_FILE}" exec -T backend \
  python manage.py import_stand_inventory

echo "Esperando el health check público..."
curl --fail --silent --show-error \
  --retry 12 --retry-delay 5 --retry-connrefused \
  "http://127.0.0.1/api/health/"
echo

docker compose --env-file "${ENV_FILE}" ps
echo "Despliegue completado."
