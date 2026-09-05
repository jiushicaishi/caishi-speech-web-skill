@echo off
REM ============================================================
REM  一键同步入口（双击运行）
REM  内部调用 sync-update.ps1 —— 详见该文件头部注释
REM  若要带提交信息: 拖一个文本文件进来会被忽略, 直接改下面 MSG
REM ============================================================
setlocal
set MSG=%1
if "%MSG%"=="" set MSG=update from desktop shortcut
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-update.ps1" "%MSG%"
echo.
pause
