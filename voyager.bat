@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "V2_EXE=%SCRIPT_DIR%dx-voyager-win-x64.exe"
set "MODE=default_run"
set "V2_ARGS="
set "MISSION_PATH="

if "%~1"=="" (
  set "MODE=default_run"
  set "V2_ARGS=run"
) else if /I "%~1"=="doctor" (
  set "MODE=verify"
  shift
  set "V2_ARGS=verify %*"
) else if /I "%~1"=="verify" (
  set "MODE=verify"
  set "V2_ARGS=%*"
) else if /I "%~1"=="run" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if /I "%~1"=="clean" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if /I "%~1"=="pack" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if /I "%~1"=="unpack" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if /I "%~1"=="summary" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if /I "%~1"=="help" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if "%~1"=="--help" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if "%~1"=="-h" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if "%~1"=="--version" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else if "%~1"=="-V" (
  set "MODE=explicit"
  set "V2_ARGS=%*"
) else (
  set "MODE=default_run"
  set "V2_ARGS=run %*"
)

if exist "%V2_EXE%" (
  "%V2_EXE%" !V2_ARGS!
  set "V2_EXIT=!ERRORLEVEL!"
  if "!V2_EXIT!"=="0" exit /b 0
  echo Voyager2 failed - exit !V2_EXIT!.
) else (
  echo Voyager2 binary not found for this platform.
  set "V2_EXIT=1"
)

if /I "!MODE!"=="verify" (
  echo Falling back to Voyager1 doctor command...
  call :extractVerifyMissionPath %*
  if defined MISSION_PATH (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" doctor "%MISSION_PATH%"
  ) else (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" doctor
  )
  exit /b %ERRORLEVEL%
)

if /I "!MODE!"=="default_run" (
  echo Falling back to Voyager1 mission run...
  call :extractRunMissionPath %*
  if defined MISSION_PATH (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" "%MISSION_PATH%"
  ) else (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar"
  )
  exit /b %ERRORLEVEL%
)

exit /b !V2_EXIT!

:extractVerifyMissionPath
set "MISSION_PATH="
if /I "%~1"=="verify" shift
if /I "%~1"=="doctor" shift
:verifyLoop
if "%~1"=="" goto :eof
if /I "%~1"=="-m" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
if /I "%~1"=="--missionPath" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
if not "%~1:~0,1%"=="-" (
  set "MISSION_PATH=%~1"
  goto :eof
)
shift
goto :verifyLoop

:extractRunMissionPath
set "MISSION_PATH="
:runLoop
if "%~1"=="" goto :eof
if /I "%~1"=="-m" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
if /I "%~1"=="--missionPath" (
  if not "%~2"=="" set "MISSION_PATH=%~2"
  goto :eof
)
if /I "%~1"=="run" (
  shift
  goto :runLoop
)
if not "%~1:~0,1%"=="-" (
  set "MISSION_PATH=%~1"
  goto :eof
)
shift
goto :runLoop
