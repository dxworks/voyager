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
  call :verifyArgs %*
) else if /I "%~1"=="verify" (
  set "MODE=verify"
  set "V2_ARGS=%*"
) else if /I "%~1"=="run" (
  set "MODE=default_run"
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
  set "FIRST_ARG=%~1"
  rem A bare mission path (V1's form): V2 takes a mission only with -m
  if "!FIRST_ARG:~0,1!"=="-" (
    set "V2_ARGS=run %*"
  ) else (
    set "V2_ARGS=run -m %*"
  )
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
  rem V1's doctor takes a check list, not a mission: it uses its own .doctor.yml
  java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" doctor
  exit /b !ERRORLEVEL!
)

if /I "!MODE!"=="default_run" (
  echo Falling back to Voyager1 mission run...
  call :extractRunMissionPath %*
  call :adaptMission
  if defined MISSION_PATH (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar" "!MISSION_PATH!"
  ) else (
    java -Xmx8g -jar "%SCRIPT_DIR%dx-voyager.jar"
  )
  set "V1_EXIT=!ERRORLEVEL!"
  if defined ADAPTED_PATH if not "!ADAPTED_PATH:voyager-v1-mission=!"=="!ADAPTED_PATH!" for %%D in ("!ADAPTED_PATH!") do rmdir /s /q "%%~dpD" 2>nul
  exit /b !V1_EXIT!
)

exit /b !V2_EXIT!

rem "verify" plus the words after "doctor" (%* ignores shift)
:verifyArgs
set "V2_ARGS=verify"
shift
:verifyArgsLoop
if "%~1"=="" goto :eof
set "V2_ARGS=!V2_ARGS! %1"
shift
goto :verifyArgsLoop

:extractRunMissionPath
set "MISSION_PATH="
set "IN_ACTIONS="
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
rem -a, --actions <actions...>: the words after it are action names, not the mission
if /I "%~1"=="-a" (
  set "IN_ACTIONS=1"
  shift
  goto :runLoop
)
if /I "%~1"=="--actions" (
  set "IN_ACTIONS=1"
  shift
  goto :runLoop
)
if /I "%~1"=="run" (
  shift
  goto :runLoop
)
set "RUN_ARG=%~1"
if not "!RUN_ARG:~0,1!"=="-" (
  if not defined IN_ACTIONS (
    set "MISSION_PATH=%~1"
    goto :eof
  )
) else (
  set "IN_ACTIONS="
)
shift
goto :runLoop

rem V1 stops on fields only V2 reads: give it an adapted copy of the mission (V1's default is mission.yml)
:adaptMission
set "ADAPTED_PATH="
set "ADAPTER_INPUT=!MISSION_PATH!"
if not defined ADAPTER_INPUT set "ADAPTER_INPUT=mission.yml"
if not exist "!ADAPTER_INPUT!" goto :eof
for /f "delims=" %%P in ('java -cp "%SCRIPT_DIR%dx-voyager.jar" "%SCRIPT_DIR%MissionAdapter.java" "!ADAPTER_INPUT!"') do set "ADAPTED_PATH=%%P"
if not defined ADAPTED_PATH goto :eof
if "!ADAPTED_PATH!"=="!ADAPTER_INPUT!" (
  set "ADAPTED_PATH="
  goto :eof
)
set "MISSION_PATH=!ADAPTED_PATH!"
goto :eof
