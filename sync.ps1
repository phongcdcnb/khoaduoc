# Script tự động đồng bộ code lên GitHub
$env:Path += ";D:\Git\cmd"

Write-Host "=== ĐỒNG BỘ CODE LÊN GITHUB ===" -ForegroundColor Cyan
Write-Host "Đang kiểm tra trạng thái Git..." -ForegroundColor Cyan
$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "Không có thay đổi nào cần đồng bộ. Mọi thứ đã được cập nhật!" -ForegroundColor Green
    Read-Host "Nhấn Enter để thoát"
    exit
}

Write-Host "`nPhát hiện các tệp thay đổi:" -ForegroundColor Yellow
git status -s

$commitMessage = Read-Host "`nNhập ghi chú thay đổi (hoặc nhấn Enter để bỏ qua, mặc định: 'Cập nhật code')"
if ([string]::IsNullOrEmpty($commitMessage)) {
    $commitMessage = "Cập nhật code - " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss")
}

Write-Host "`n[1/3] Đang chuẩn bị tệp tin..." -ForegroundColor Cyan
git add .

Write-Host "[2/3] Đang ghi nhận thay đổi (commit)..." -ForegroundColor Cyan
git commit -m $commitMessage

Write-Host "[3/3] Đang đồng bộ lên GitHub (push)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nĐồng bộ thành công! Mã nguồn đã được cập nhật trên GitHub." -ForegroundColor Green
} else {
    Write-Host "`n[Lỗi] Đồng bộ thất bại. Vui lòng kiểm tra:" -ForegroundColor Red
    Write-Host "1. Bạn đã đăng nhập GitHub trên máy tính này chưa." -ForegroundColor Red
    Write-Host "2. Kết nối Internet của bạn." -ForegroundColor Red
    Write-Host "3. Quyền truy cập vào repository phongcdcnb/khoaduoc." -ForegroundColor Red
}

Read-Host "`nNhấn Enter để kết thúc"
