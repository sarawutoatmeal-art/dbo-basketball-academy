param(
    [string]$Message = "chore(dev): update code on dev branch (Test Demo)"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($currentBranch -ne "dev") {
    Write-Host "🔄 Switching to 'dev' branch for safe editing..." -ForegroundColor Cyan
    git checkout -B dev
}

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "ℹ️ No new changes to save." -ForegroundColor Yellow
    exit 0
}

git commit -m $Message
Write-Host "☁️ Pushing changes to 'dev' branch (Test Demo / Preview only — Production is NOT affected)..." -ForegroundColor Cyan
git push -u dbobasketball dev
git push -u origin dev

Write-Host "✅ บันทึกการแก้ไขขึ้นสาขา 'dev' (Test Demo) เรียบร้อยแล้ว! (ยังไม่ Deploy ขึ้นเว็บจริง)" -ForegroundColor Green
