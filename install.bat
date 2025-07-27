@echo off
echo ========================================
echo VoiceVox Copilot Notifier Installer
echo ========================================
echo.

REM Check if VS Code is installed
where code >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: VS Code not found in PATH
    echo Please make sure VS Code is installed and added to PATH
    pause
    exit /b 1
)

REM Check if VSIX file exists
if not exist "voicevox-copilot-notifier-0.1.0.vsix" (
    echo ERROR: voicevox-copilot-notifier-0.1.0.vsix not found
    echo Please make sure the VSIX file is in the same directory as this script
    pause
    exit /b 1
)

echo Installing VoiceVox Copilot Notifier...
code --install-extension voicevox-copilot-notifier-0.1.0.vsix

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installation completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart VS Code
    echo 2. Look for VoiceVox icon in status bar
    echo 3. Test with Ctrl+Alt+V
    echo.
) else (
    echo.
    echo ERROR: Installation failed
    echo Please check the error messages above
    echo.
)

pause
