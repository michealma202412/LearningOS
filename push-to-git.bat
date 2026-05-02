@echo off
REM ========================================
REM LearningOS iOS Migration - Git Push Script
REM ========================================

echo.
echo ========================================
echo LearningOS iOS Migration Preparation
echo ========================================
echo.

REM Check if git is available
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Checking Git status...
git status

echo.
echo [2/5] Adding all changes...
git add .

echo.
echo [3/5] Committing changes...
git commit -m "Complete Expo Go prototype validation, ready for iOS native migration

- Expo Go prototype fully tested and validated
- All core features working (record, files, review, scanner)
- AsyncStorage data persistence implemented
- Ebbinghaus review system completed
- QR code generation added
- Inline expand/collapse interaction verified
- Ready to migrate to Capacitor iOS native app

Next steps:
1. Sync code to macOS
2. Install dependencies
3. Build web resources
4. Sync to iOS platform
5. Configure Xcode signing
6. Run on device/simulator"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] No changes to commit or commit failed
    echo This is normal if there are no new changes
)

echo.
echo [4/5] Checking remote repository...
git remote -v

echo.
echo [5/5] Pushing to remote repository...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Code pushed to remote repository
    echo ========================================
    echo.
    echo Next steps on macOS:
    echo 1. git clone ^<your-repo-url^>
    echo 2. cd 02_EduWeb
    echo 3. npm install
    echo 4. npm run build
    echo 5. npx cap sync ios
    echo 6. npx cap open ios
    echo.
    echo See IOS_NATIVE_MIGRATION_EXECUTION_GUIDE.md for details
    echo.
) else (
    echo.
    echo ========================================
    echo ⚠️  Push failed or no remote configured
    echo ========================================
    echo.
    echo Options:
    echo 1. Set up remote: git remote add origin ^<url^>
    echo 2. Or use alternative transfer method:
    echo    - AirDrop
    echo    - USB drive
    echo    - Network share
    echo    - iCloud Drive
    echo.
)

pause
