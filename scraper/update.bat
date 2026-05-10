@echo off
echo.
echo === WOULI SCRAPER - Mise a jour ===
echo.
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/scraper-v5-wouli.js" -o scraper-v5-wouli.js && echo [OK] scraper-v5-wouli.js || echo [ERREUR] scraper-v5-wouli.js
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/accounts-v5.json" -o accounts-v5.json && echo [OK] accounts-v5.json || echo [ERREUR] accounts-v5.json
curl -s -L "https://raw.githubusercontent.com/basekou555/wouli-app/claude/transfer-project-9mUNw/scraper/notion-import.js" -o notion-import.js && echo [OK] notion-import.js || echo [ERREUR] notion-import.js
echo.
echo Mise a jour terminee.
echo.
pause
