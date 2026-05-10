@echo off
echo.
echo ========================================
echo   WOULI SCRAPER - Mise a jour
echo ========================================
echo.

REM --- scraper-v5-wouli.js ---
echo Telechargement scraper...
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/scraper-v5-wouli.js" -o scraper-v5-wouli.js
if errorlevel 1 (
  echo   [ERREUR] Echec telechargement scraper-v5-wouli.js
) else (
  echo   [OK] scraper-v5-wouli.js
  for /f "tokens=*" %%i in ('findstr /C:"// VERSION" scraper-v5-wouli.js') do echo         %%i
  for /f "tokens=*" %%i in ('findstr /C:"CORRECTIONS" scraper-v5-wouli.js') do echo         %%i
)
echo.

REM --- accounts-v5.json ---
echo Telechargement comptes...
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/accounts-v5.json" -o accounts-v5.json
if errorlevel 1 (
  echo   [ERREUR] Echec telechargement accounts-v5.json
) else (
  echo   [OK] accounts-v5.json
  for /f "tokens=*" %%i in ('findstr /C:"last_updated" accounts-v5.json') do echo         Mis a jour : %%i
  for /f %%c in ('findstr /C:"enabled": true accounts-v5.json ^| find /c /v ""') do echo         Comptes actifs : %%c
)
echo.

REM --- notion-import.js ---
echo Telechargement outil Notion...
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/notion-import.js" -o notion-import.js
if errorlevel 1 (
  echo   [ERREUR] Echec telechargement notion-import.js
) else (
  echo   [OK] notion-import.js
)

REM --- fix-categories.js ---
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/fix-categories.js" -o fix-categories.js
if errorlevel 1 (
  echo   [ERREUR] Echec telechargement fix-categories.js
) else (
  echo   [OK] fix-categories.js
)
echo.

echo ========================================
echo   Mise a jour terminee.
echo   Pour lancer : node scraper-v5-wouli.js
echo   Pour importer Notion : node notion-import.js
echo ========================================
echo.
pause
