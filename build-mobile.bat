@echo off
chcp 65001 >nul
echo ========================================
echo LearningOS 移动端构建和部署脚本
echo ========================================
echo.

REM 检查是否已安装依赖
if not exist "node_modules\@capacitor\android" (
    echo ⚠️  检测到未安装 Capacitor 平台依赖
    echo.
    echo 正在安装必要的依赖...
    echo.
    
    npm install @capacitor/android @capacitor/ios ^
      @capacitor/filesystem ^
      @capacitor-community/sqlite ^
      capacitor-voice-recorder ^
      uuid
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ 依赖安装完成
    echo.
)

echo 📦 第1步: 构建 Web 资源...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo.
echo ✅ 构建完成
echo.

echo 🔄 第2步: 同步到原生平台...
call npx cap sync

if %errorlevel% neq 0 (
    echo.
    echo ❌ 同步失败
    pause
    exit /b 1
)

echo.
echo ✅ 同步完成
echo.

echo 🎯 选择要打开的平台:
echo   1. Android
echo   2. iOS
echo   3. 两者都打开
echo.
set /p choice="请输入选项 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 📱 正在打开 Android Studio...
    call npx cap open android
) else if "%choice%"=="2" (
    echo.
    echo 📱 正在打开 Xcode...
    call npx cap open ios
) else if "%choice%"=="3" (
    echo.
    echo 📱 正在打开 Android Studio...
    start cmd /k "npx cap open android"
    
    timeout /t 3 /nobreak >nul
    
    echo 📱 正在打开 Xcode...
    call npx cap open ios
) else (
    echo.
    echo ❌ 无效选项
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 完成！
echo.
echo 下一步:
echo 1. 在 IDE 中连接真机或模拟器
echo 2. 点击运行按钮
echo 3. 测试录音、保存等功能
echo.
echo 📖 详细说明请查看: MOBILE_IMPLEMENTATION_REPORT.md
echo ========================================
echo.

pause
