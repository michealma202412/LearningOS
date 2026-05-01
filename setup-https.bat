@echo off
chcp 65001 >nul
echo ========================================
echo LearningOS - Safari 麦克风权限配置工具
echo ========================================
echo.

REM 检查 mkcert 是否安装
where mkcert >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 mkcert
    echo.
    echo 请先安装 mkcert:
    echo.
    echo Windows (使用 Chocolatey):
    echo   choco install mkcert
    echo.
    echo Windows (使用 Scoop):
    echo   scoop install mkcert
    echo.
    echo macOS:
    echo   brew install mkcert
    echo.
    echo 或者从官网下载: https://github.com/FiloSottile/mkcert
    echo.
    pause
    exit /b 1
)

echo ✅ 检测到 mkcert
echo.

REM 创建 ssl 目录
if not exist "ssl" (
    echo 📁 创建 ssl 目录...
    mkdir ssl
)

echo 🔐 生成 SSL 证书...
echo.

REM 获取本机 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :got_ip
    )
)
:got_ip

echo 检测到的 IP 地址: %LOCAL_IP%
echo.

REM 生成证书
mkcert localhost 127.0.0.1 %LOCAL_IP% 192.168.0.104 10.0.85.2 172.30.48.1

echo.
echo ✅ 证书生成成功！
echo.
echo 📂 证书文件位置:
echo   ssl\localhost+*.pem
echo   ssl\localhost+*-key.pem
echo.

echo 🎉 配置完成！
echo.
echo 下一步:
echo 1. 运行 npm run dev 启动服务器
echo 2. 在手机 Safari 中访问:
echo    https://%LOCAL_IP%:5173/LearningOS/app/index.html
echo.
echo ⚠️  首次访问时需要在 iPhone 设置中信任证书:
echo    设置 → 通用 → 关于本机 → 证书信任设置
echo.

pause
