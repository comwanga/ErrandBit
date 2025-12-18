# ErrandBit - Cleanup Redundant Files
# Removes backup files and refactored copies after successful Phase 4 & 5 completion

Write-Host "🧹 ErrandBit - Redundant File Cleanup" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Define file lists
$backupFiles = @(
    "frontend\src\services\auth.service.ts.backup",
    "frontend\src\services\currency.service.ts.backup",
    "frontend\src\services\job.service.ts.backup",
    "frontend\src\services\payment.service.ts.backup",
    "frontend\src\services\review.service.ts.backup",
    "frontend\src\services\runner.service.ts.backup",
    "frontend\src\pages\CreateRunnerProfile.tsx.backup",
    "frontend\src\pages\Home.tsx.backup",
    "frontend\src\pages\Login.tsx.backup",
    "frontend\src\components\FediMiniappWrapper.tsx.backup"
)

$refactoredFiles = @(
    "frontend\src\pages\CreateRunnerProfile.refactored.tsx",
    "frontend\src\pages\Home.refactored.tsx",
    "frontend\src\pages\Login.refactored.tsx",
    "frontend\src\components\FediMiniappWrapper.refactored.tsx",
    "backend\src\routes\auth-simple-refactored.routes.ts"
)

# Count files
$totalFiles = $backupFiles.Count + $refactoredFiles.Count
$removedCount = 0
$notFoundCount = 0

Write-Host "📋 Analysis:" -ForegroundColor Yellow
Write-Host "  - Backup files to remove: $($backupFiles.Count)" -ForegroundColor White
Write-Host "  - Refactored copies to remove: $($refactoredFiles.Count)" -ForegroundColor White
Write-Host "  - Total redundant files: $totalFiles" -ForegroundColor White
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Remove all redundant files? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Removing files..." -ForegroundColor Cyan
Write-Host ""

# Remove backup files
Write-Host "Removing backup files:" -ForegroundColor Yellow
foreach ($file in $backupFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

Write-Host ""

# Remove refactored copies
Write-Host "Removing refactored copies:" -ForegroundColor Yellow
foreach ($file in $refactoredFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray

# Summary
Write-Host ""
Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Files removed: $removedCount" -ForegroundColor Green
if ($notFoundCount -gt 0) {
    Write-Host "  - Files not found: $notFoundCount" -ForegroundColor Gray
}
Write-Host ""

# Calculate space saved (approximate)
$spaceSavedKB = $removedCount * 15  # Rough estimate: 15KB per file
Write-Host "💾 Estimated space saved: ~$spaceSavedKB KB" -ForegroundColor Green
Write-Host ""

Write-Host "✨ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "ℹ️  Note: All backup and refactored files have been removed." -ForegroundColor Yellow
Write-Host "   The current codebase contains only the final refactored versions." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Backup files served their purpose during Phases 1-4:" -ForegroundColor Gray
Write-Host "   - auth.service.ts.backup (Phase 2)" -ForegroundColor Gray
Write-Host "   - payment.service.ts.backup (Phase 2)" -ForegroundColor Gray
Write-Host "   - runner.service.ts.backup (Phase 2)" -ForegroundColor Gray
Write-Host "   - job.service.ts.backup (Phase 1)" -ForegroundColor Gray
Write-Host "   - review.service.ts.backup (Phase 3)" -ForegroundColor Gray
Write-Host "   - currency.service.ts.backup (Phase 3)" -ForegroundColor Gray
Write-Host "   - Component backups (Phase 4)" -ForegroundColor Gray
Write-Host ""
Write-Host "   All changes are tracked in git history if rollback is needed." -ForegroundColor Gray
Write-Host ""
