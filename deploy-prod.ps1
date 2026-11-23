param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$ownerEmail = "sarawut.oatmeal@gmail.com"
$currentEmail = (git config user.email).Trim()

if ($currentEmail -ne $ownerEmail) {
    Write-Host "🚫 ปฏิเสธสิทธิ์การ Deploy: บัญชีของคุณ ($currentEmail) ไม่มีสิทธิ์ Deploy ขึ้นเว็บจริง!" -ForegroundColor Red
    Write-Host "   เฉพาะเจ้าของระบบ ($ownerEmail / sarawutoatmeal-art) เท่านั้นที่สามารถสั่ง Deploy ได้" -ForegroundColor Yellow
    Write-Host "   กรุณาใช้คำสั่ง .\save-edit.ps1 เพื่อบันทึกงานขึ้นสาขา 'dev' (Test Demo) แทนครับ" -ForegroundColor Cyan
    exit 1
}

if (-not $Force) {
    $confirm = Read-Host "⚠️ ยืนยันการนำโค้ดจากสาขา 'dev' ขึ้น Deploy บนเว็บจริง (https://dbobasketball.vercel.app) หรือไม่? (พิมพ์ y เพื่อยืนยัน)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ ยกเลิกการ Deploy" -ForegroundColor Yellow
        exit 0
    }
}

# Save any pending working tree changes to dev first
$status = git status --porcelain
if ($status) {
    git checkout -B dev
    git add -A
    git commit -m "chore(release): prepare changes for production deployment"
    git push -u dbobasketball dev
    git push -u origin dev
}

Write-Host "🚀 กำลังรวมโค้ดจาก 'dev' เข้าสู่ 'main' เพื่อ Deploy ขึ้น Production..." -ForegroundColor Cyan
git checkout main
git merge dev --no-edit
git push dbobasketball main
git push origin main

# Switch back to dev branch so future edits remain isolated on dev by default
git checkout dev
Write-Host "✅ Deploy ขึ้นระบบจริง (https://dbobasketball.vercel.app) สำเร็จเรียบร้อย! (สลับกลับมาที่สาขา 'dev' สำหรับการแก้ไขรอบถัดไป)" -ForegroundColor Green
