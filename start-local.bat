@echo off
echo 🚀 Cat Comfort Game - 本地测试模式启动
echo ================================

echo 📁 进入客户端目录...
cd /d "%~dp0src\client"

echo 🔧 设置环境变量...
set NODE_ENV=development
set VITE_TEST_MODE=true

echo 🌐 启动本地开发服务器...
echo 服务器将在 http://localhost:7474 启动
echo 按 Ctrl+C 停止服务器
echo.

npx vite --port 7474 --host --mode development

pause 