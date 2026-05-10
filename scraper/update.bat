@echo off
setlocal
set BASE=https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper

echo.
echo ========================================
echo   WOULI SCRAPER - Mise a jour
echo ========================================
echo.

curl -s -L "%BASE%/scraper-v5-wouli.js" -o scraper-v5-wouli.js
if errorlevel 1 (echo   [ERREUR] scraper-v5-wouli.js) else (echo   [OK] scraper-v5-wouli.js)

if not exist accounts-v5.json (
  curl -s -L "%BASE%/accounts-v5.json" -o accounts-v5.json
  if errorlevel 1 (echo   [ERREUR] accounts-v5.json) else (echo   [OK] accounts-v5.json - installation initiale)
) else (
  echo   [SKIP] accounts-v5.json - votre fichier local est conserve
)

curl -s -L "%BASE%/notion-import.js" -o notion-import.js
if errorlevel 1 (echo   [ERREUR] notion-import.js) else (echo   [OK] notion-import.js)

curl -s -L "%BASE%/fix-categories.js" -o fix-categories.js
if errorlevel 1 (echo   [ERREUR] fix-categories.js) else (echo   [OK] fix-categories.js)

echo.
echo --- Details scraper ---
findstr /C:"// VERSION" scraper-v5-wouli.js
findstr /C:"// - FIX" scraper-v5-wouli.js

echo.
echo --- Correction categories ---
node fix-categories.js

echo.
echo ========================================
echo   Termine. Pour lancer : node scraper-v5-wouli.js
echo ========================================
echo.
pause
