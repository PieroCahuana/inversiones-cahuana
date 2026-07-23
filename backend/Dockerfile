FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN addgroup --system django && adduser --system --ingroup django django
COPY requirements.txt requirements-prod.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt
COPY . .
RUN mkdir -p /app/staticfiles /app/media && chown -R django:django /app
USER django
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${WEB_CONCURRENCY:-2} --timeout 60 --max-requests 1000 --max-requests-jitter 100 --access-logfile - --error-logfile -"]
