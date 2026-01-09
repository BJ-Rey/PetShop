@echo off
echo ==========================================
echo       PetShop Code Push Script
echo ==========================================

:: 1. Check if Git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git command not found!
    echo.
    echo Please install Git for Windows:
    echo https://git-scm.com/download/win
    echo.
    echo After installation, restart this script.
    pause
    exit /b
)

echo [INFO] Git found. Starting push process...

:: 2. Initialize repository if needed
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
) else (
    echo [INFO] Git repository already initialized.
)

:: 3. Add all files
echo [INFO] Adding files...
git add .

:: 4. Commit
echo [INFO] Committing changes...
git commit -m "feat: Implement secret key distribution and user setup"

:: 5. Rename branch to main
git branch -M main

:: 6. Configure remote
echo [INFO] Configuring remote...
git remote remove origin 2>nul
git remote add origin https://github.com/BJ-Rey/PetShop.git

:: 7. Push
echo [INFO] Pushing to remote...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. Please check your network or permissions.
    echo You may need to sign in to GitHub in the pop-up window.
) else (
    echo.
    echo [SUCCESS] Code pushed successfully!
)

pause
