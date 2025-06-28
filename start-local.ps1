#!/usr/bin/env pwsh

Write-Host "🚀 Cat Comfort Game - 本地测试模式启动" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "📁 进入客户端目录..." -ForegroundColor Yellow
Set-Location -Path "src\client"

Write-Host "🔧 设置环境变量..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:VITE_TEST_MODE = "true"

Write-Host "🌐 启动本地开发服务器..." -ForegroundColor Yellow
Write-Host "服务器将在 http://localhost:7474 启动" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Cyan
Write-Host ""

# 尝试启动vite开发服务器
try {
    npx vite --port 7474 --host --mode development
}
catch {
    Write-Host "❌ 启动失败: $_" -ForegroundColor Red
    Write-Host "尝试备用启动方式..." -ForegroundColor Yellow
    
    # 备用方案：使用npm script
    Set-Location -Path "..\..\"
    npm run dev:vite
}

Write-Host "按任意键退出..." -ForegroundColor Yellow
Read-Host 