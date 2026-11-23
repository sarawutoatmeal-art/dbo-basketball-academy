param(
    [string]$Message = "chore(dev): update code on dev branch (Test Demo)"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 2 Authorized Editors allowed to edit and save to 'dev' (Test Demo)
$authorizedEditors = @(
    "sarawut.oatmeal@gmail.com",
    "wissava.ard@gmail.com"
)

$currentEmail = (git config user.email).Trim().ToLower()
if ($authorizedEditors -notcontains $currentEmail) {
    Write-Host "🚫 ปฏิเสธสิทธิ์การแก้ไข: บัญชี Git ของคุณ ($currentEmail) ไม่ได้รับอนุญาตให้แก้ไขโปรเจกต์นี้!" -ForegroundColor Red
    Write-Host "   อนุญาตเฉพาะ 2 บัญชีนี้เท่านั้น: $($authorizedEditors -join ', ')" -ForegroundColor Yellow
    Write-Host "   (หากคุณใช้เมล wissava.ard@gmail.com กรุณาตั้งค่าด้วยคำสั่ง: git config user.email `"wissava.ard@gmail.com`")" -ForegroundColor Cyan
    exit 1
}

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
Write-Host "☁️ Pushing changes by [$currentEmail] to 'dev' branch (Test Demo / Preview only — Production is NOT affected)..." -ForegroundColor Cyan
git push -u dbobasketball dev
git push -u origin dev

Write-Host "✅ บันทึกการแก้ไขโดย [$currentEmail] ขึ้นสาขา 'dev' (Test Demo) เรียบร้อยแล้ว! (ยังไม่ Deploy ขึ้นเว็บจริง)" -ForegroundColor Green
