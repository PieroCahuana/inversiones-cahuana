#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env.docker"
DOMAIN="${1:-inversionescahuana.com}"

cd "${PROJECT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Falta ${ENV_FILE}. Ejecuta primero el despliegue inicial." >&2
  exit 1
fi

if [[ ! "${DOMAIN}" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "El dominio indicado no es valido." >&2
  exit 1
fi

BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d%H%M%S)"
cp "${ENV_FILE}" "${BACKUP_FILE}"

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "${ENV_FILE}"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

upsert_env APP_DOMAIN "${DOMAIN}"
upsert_env ALLOWED_HOSTS "${DOMAIN},www.${DOMAIN},54.159.214.66,localhost,127.0.0.1"
upsert_env FRONTEND_URL "https://${DOMAIN}"
upsert_env CORS_ALLOWED_ORIGINS "https://${DOMAIN},https://www.${DOMAIN}"
upsert_env CSRF_TRUSTED_ORIGINS "https://${DOMAIN},https://www.${DOMAIN}"
upsert_env SECURE_SSL_REDIRECT "True"
upsert_env SESSION_COOKIE_SECURE "True"
upsert_env CSRF_COOKIE_SECURE "True"
upsert_env SECURE_HSTS_SECONDS "3600"
upsert_env SECURE_HSTS_INCLUDE_SUBDOMAINS "True"
upsert_env SECURE_HSTS_PRELOAD "False"
upsert_env APP_PORT "8080"

chmod 600 "${ENV_FILE}" "${BACKUP_FILE}"

echo "Dominio configurado: ${DOMAIN}"
echo "Copia de seguridad: ${BACKUP_FILE}"
