# Inversiones Cahuana

Ecommerce para catálogo tecnológico, carrito, pedidos, comprobantes, inventario, clientes, promociones, notificaciones y administración comercial.

## Arquitectura

- Backend: Django REST Framework, JWT y PostgreSQL.
- Frontend: React, TypeScript, Vite, Tailwind CSS y TanStack Query.
- Producción: Gunicorn, Nginx y Docker Compose.
- Persistencia: volúmenes para PostgreSQL, multimedia y archivos estáticos.

## Desarrollo local

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

Desde otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

`npm` debe ejecutarse dentro de `frontend`, porque allí está `package.json`.

## Validación

```powershell
cd backend
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py check

cd ..\frontend
npm run lint
npm run test
npm run build
```

## Docker

1. Copia `.env.docker.example` como `.env.docker`.
2. Reemplaza `SECRET_KEY` y `DB_PASSWORD`.
3. Ejecuta:

```powershell
docker compose --env-file .env.docker up --build -d
```

La tienda estará en `http://localhost:8080` y el health check en `/api/health/`.

```powershell
docker compose --env-file .env.docker down
```

No uses `down -v` salvo que quieras borrar definitivamente base de datos y archivos.

## Producción

- Configura dominio en `ALLOWED_HOSTS`, CORS, CSRF y `FRONTEND_URL`.
- Activa redirección SSL, cookies seguras y HSTS después de habilitar HTTPS.
- Configura SMTP para recuperación y correos transaccionales.
- Mantén `.env.docker` fuera del repositorio.
- Coloca un proxy TLS delante del puerto publicado.

### Primer despliegue en Lightsail

El servidor inicial usa Ubuntu 24.04, Docker Engine con Compose y una instancia
de 2 GB de RAM con 2 GB de swap. Antes de desplegar:

1. Asigna una IP estática.
2. Publica únicamente HTTP 80 y HTTPS 443; limita SSH al navegador de Lightsail.
3. Clona el repositorio y entra a su carpeta.
4. Copia `.env.lightsail.example` como `.env.docker`.
5. Genera valores únicos para `SECRET_KEY` y `DB_PASSWORD`.
6. Ejecuta `bash scripts/deploy-lightsail.sh`.

El script valida las variables, construye los contenedores, aplica migraciones,
copia las imágenes iniciales al volumen persistente, importa el inventario sin
duplicados y comprueba `/api/health/`.

Para crear el primer administrador después del despliegue:

```bash
docker compose --env-file .env.docker exec backend python manage.py createsuperuser
```

Mientras no exista dominio, la aplicación puede operar por HTTP usando la IP
estática. Después de configurar DNS y HTTPS se deben activar la redirección SSL,
las cookies seguras y HSTS.

## Respaldos

```powershell
.\scripts\backup.ps1
```

Se generan un volcado PostgreSQL y un ZIP de multimedia dentro de `backups/`. Conserva copias externas y prueba periódicamente su restauración.
