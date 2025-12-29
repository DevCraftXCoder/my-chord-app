@echo off
REM Auto-save script for Chord App
REM This script automatically commits and pushes changes to GitHub

cd /d "%~dp0"

echo [Auto-Save] Checking for changes...

REM Check if there are any changes
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo [Auto-Save] No changes to save.
    exit /b 0
)

echo [Auto-Save] Changes detected. Committing...

REM Add all changes
git add .

REM Create commit with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a:%%b)
set timestamp=%mydate% %mytime%

git commit -m "Auto-save: %timestamp%"

if %errorlevel% equ 0 (
    echo [Auto-Save] Pushing to GitHub...
    git push origin main

    if %errorlevel% equ 0 (
        echo [Auto-Save] ✓ Successfully saved to GitHub!
    ) else (
        echo [Auto-Save] ✗ Failed to push to GitHub.
        echo [Auto-Save] Changes are committed locally. Push manually when online.
    )
) else (
    echo [Auto-Save] ✗ Commit failed.
)

exit /b %errorlevel%
