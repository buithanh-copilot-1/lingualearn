# Update Railway production DB from Windows (PowerShell)
# Usage: .\scripts\update-prod-db.ps1
#        .\scripts\update-prod-db.ps1 -SeedOnly
#        .\scripts\update-prod-db.ps1 -Yes

param(
    [switch]$PushOnly,
    [switch]$SeedOnly,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$args = @()
if ($PushOnly) { $args += "--push-only" }
if ($SeedOnly) { $args += "--seed-only" }
if ($Yes) { $args += "--yes" }

if (-not (Test-Path ".env.production")) {
    Write-Host "Missing backend/.env.production" -ForegroundColor Red
    Write-Host "Copy .env.production.example to .env.production and set DATABASE_PUBLIC_URL from Railway."
    exit 1
}

npx tsx scripts/update-prod-db.ts @args
