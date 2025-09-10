@echo off
echo Auto-syncing to repository...
git add .
git commit -m "Auto-sync: %date% %time%"
git push origin main
echo Sync complete!