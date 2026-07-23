param(
    [string]$OutputDirectory = "backups"
)

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputDirectory))
if (-not $backupRoot.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "El directorio de respaldo debe estar dentro del proyecto."
}

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$databaseFile = Join-Path $backupRoot "database-$stamp.sql"
$mediaFile = Join-Path $backupRoot "media-$stamp.zip"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | Set-Content -LiteralPath $databaseFile -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw "No se pudo respaldar PostgreSQL." }

docker compose cp backend:/app/media (Join-Path $backupRoot "media-$stamp")
Compress-Archive -LiteralPath (Join-Path $backupRoot "media-$stamp") -DestinationPath $mediaFile -Force
Remove-Item -LiteralPath (Join-Path $backupRoot "media-$stamp") -Recurse -Force

Write-Output "Respaldo creado: $databaseFile"
Write-Output "Archivos creados: $mediaFile"
