@echo off
set "SCRIPT_DIR=%~dp0"
set "SHORTCUT=%SCRIPT_DIR%Local_Share_Windows.lnk"
if not exist "%SHORTCUT%" (
    echo Set oWS = WScript.CreateObject^("WScript.Shell"^) > "%SCRIPT_DIR%CreateShortcut.vbs"
    echo sLinkFile = "%SHORTCUT%" >> "%SCRIPT_DIR%CreateShortcut.vbs"
    echo Set oLink = oWS.CreateShortcut^(sLinkFile^) >> "%SCRIPT_DIR%CreateShortcut.vbs"
    echo oLink.TargetPath = "%SCRIPT_DIR%Local_Share_Windows.bat" >> "%SCRIPT_DIR%CreateShortcut.vbs"
    echo oLink.WorkingDirectory = "%SCRIPT_DIR%Files" >> "%SCRIPT_DIR%CreateShortcut.vbs"
    echo oLink.IconLocation = "%SCRIPT_DIR%Files\logo.ico" >> "%SCRIPT_DIR%CreateShortcut.vbs"
    echo oLink.Save >> "%SCRIPT_DIR%CreateShortcut.vbs"
    cscript //nologo "%SCRIPT_DIR%CreateShortcut.vbs"
    del "%SCRIPT_DIR%CreateShortcut.vbs"
)

title LocalDrop File Share Server
cd /d "%~dp0Files"
echo Starting LocalDrop Server...

:: Schedule the browser to automatically open after 0 seconds
start /b cmd /c "timeout /t 0 >nul & start http://localhost:3000"

:: Start the Node.js server within the current window
node server.js
