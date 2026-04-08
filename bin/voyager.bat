@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "V2_EXE=%SCRIPT_DIR%dx-voyager-win-x64.exe"
set "MISSION_PATH="

if exist "%V2_EXE%" (
  if "%~1"=="" (
    "%V2_EXE%" run
  ) else if /I "%~1"=="run" (
    "%V2_EXE%" %*
  ) else (
    "%V2_EXE%" run %*
  )
  set "V2_EXIT=!ERRORLEVEL!"
  if "!V2_EXIT!"=="0" exit /b 0
  echo Voyager2 failed - exit !V2_EXIT!. Falling back to Voyager1...
) else (
  echo Voyager2 binary not found for this platform. Falling back to Voyager1...
)

call :extractMissionPath %*
if defined MISSION_PATH (
  java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" "%MISSION_PATH%"
) else (
  java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar"
)
exit /b %ERRORLEVEL%

:extractMissionPath
if "%~1"=="" goto :eof
if /I "%~1"=="-m" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
if /I "%~1"=="--missionPath" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
shift
goto :extractMissionPath
