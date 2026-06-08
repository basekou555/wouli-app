@echo off
REM ============================================================
REM  start-watcher.bat
REM  Lance le watcher Wouli (scraper-watcher.js) et le relance
REM  automatiquement s'il s'arrete.
REM
REM  --- Demarrage automatique a l'ouverture de session ---
REM  1. Clic droit sur ce fichier -> "Creer un raccourci"
REM  2. Win+R, taper :  shell:startup   puis Entree
REM  3. Deplacer le raccourci dans le dossier qui s'ouvre
REM
REM  Le scraper ouvre un vrai navigateur (HEADLESS=false), il a
REM  donc besoin de la session de bureau : c'est pour ca qu'on
REM  passe par le dossier Demarrage et non par le Planificateur
REM  de taches en mode masque.
REM ============================================================

REM Se placer dans le dossier du .bat (= dossier du scraper)
cd /d "%~dp0"

title Wouli Watcher

:loop
echo.
echo [%date% %time%] Demarrage du watcher Wouli...
node scraper-watcher.js
echo [%date% %time%] Watcher arrete (code %errorlevel%). Relance dans 10s... (Ctrl+C pour quitter)
timeout /t 10 /nobreak >nul
goto loop
