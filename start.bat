@echo off
chcp 65001 >nul
echo ========================================
echo    LearningOS 本地测试环境
echo ========================================
echo.
echo 正在启动开发服务器...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [提示] 首次使用，正在安装依赖...
    call npm install
    echo.
)

echo [步骤1] 启动Vite服务器...
start "" cmd /k "npm run dev"

echo [步骤2] 等待3秒后打开浏览器...
timeout /t 3 /nobreak >nul

echo [步骤3] 打开看板页面...
start "" "http://localhost:5173/app/index.html"

echo.
echo ========================================
echo ✅ 开发服务器已启动！
echo.
echo 📋 可用页面：
echo    看板页: http://localhost:5173/app/index.html
echo    录音页: http://localhost:5173/app/recorder.html
echo    文件夹: http://localhost:5173/app/folder.html?date=2026-04-20
echo.
echo 💡 提示：
echo    - 按 Ctrl+C 可停止服务器
echo    - 也可以直接双击HTML文件打开
echo ========================================
echo.
pause
