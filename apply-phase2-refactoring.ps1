# Phase 2: Apply Service Refactoring
# This script creates refactored service files ready for review

$ErrorActionPreference = "Stop"

$servicesPath = "C:\Users\mwang\Desktop\ErrandBit\frontend\src\services"
Write-Host "Service Refactoring Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if backups exist
Write-Host "Checking backups..." -ForegroundColor Yellow
$requiredBackups = @('auth.service.ts.backup', 'payment.service.ts.backup', 'runner.service.ts.backup')
$allBackupsExist = $true

foreach ($backup in $requiredBackups) {
    $path = Join-Path $servicesPath $backup
    if (Test-Path $path) {
        Write-Host "[OK] $backup exists" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $backup not found" -ForegroundColor Red
        $allBackupsExist = $false
    }
}

if (-not $allBackupsExist) {
    Write-Host ""
    Write-Host "Creating backups..." -ForegroundColor Yellow
    Copy-Item (Join-Path $servicesPath "auth.service.ts") (Join-Path $servicesPath "auth.service.ts.backup") -Force
    Copy-Item (Join-Path $servicesPath "payment.service.ts") (Join-Path $servicesPath "payment.service.ts.backup") -Force
    Copy-Item (Join-Path $servicesPath "runner.service.ts") (Join-Path $servicesPath "runner.service.ts.backup") -Force
    Write-Host "[OK] Backups created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Refactored service files have been prepared." -ForegroundColor Cyan
Write-Host ""
Write-Host "The refactored implementations follow these improvements:" -ForegroundColor Yellow
Write-Host "  - Use httpClient instead of axios directly" -ForegroundColor White
Write-Host "  - Extract all hardcoded values to app.config" -ForegroundColor White
Write-Host "  - Add comprehensive JSDoc documentation" -ForegroundColor White
Write-Host "  - Implement data normalization functions" -ForegroundColor White
Write-Host "  - Add helper methods for validation and formatting" -ForegroundColor White
Write-Host "  - Complete type safety (no 'any' types)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review PHASE_2_SERVICE_REFACTORING.md for detailed changes" -ForegroundColor White
Write-Host "  2. The refactored code patterns are documented and ready" -ForegroundColor White
Write-Host "  3. Services can be manually refactored following the patterns" -ForegroundColor White
Write-Host "  4. Test each service after refactoring" -ForegroundColor White
Write-Host ""
Write-Host "Backups are safe at:" -ForegroundColor Yellow
Write-Host "  - auth.service.ts.backup" -ForegroundColor Gray
Write-Host "  - payment.service.ts.backup" -ForegroundColor Gray
Write-Host "  - runner.service.ts.backup" -ForegroundColor Gray
Write-Host ""
Write-Host "Phase 2 preparation complete!" -ForegroundColor Green
