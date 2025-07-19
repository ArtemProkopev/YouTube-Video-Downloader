@echo off
chcp 65001 >nul
SETLOCAL ENABLEEXTENSIONS
title YouTube Downloader Server

REM ─────────────── ВЫБОР ЯЗЫКА ───────────────
:choose_language
echo.
echo Choose language / Выберите язык:
echo [1] English
echo [2] Русский
echo.

set /p LANG=Enter choice (1/2): 

if "%LANG%"=="1" (
    set "MSG_LANG=English selected."
) else if "%LANG%"=="2" (
    set "MSG_LANG=Выбран русский язык."
) else (
    echo.
    echo Invalid input / Неверный ввод. Please enter 1 or 2.
    goto choose_language
)

echo.
echo %MSG_LANG%

REM ───── ПЕРЕХОД В ПАПКУ СКРИПТА ─────
cd /d "%~dp0"

REM ───── ПРОВЕРКА PYTHON ─────
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo.
    if "%LANG%"=="2" (
        echo [ОШИБКА] Python не установлен или не добавлен в PATH.
        echo.
        echo 1. Скачайте с https://www.python.org/downloads/
        echo 2. При установке включите [✓] Add Python to PATH
        echo 3. Установите и перезапустите этот файл.
    ) else (
        echo [ERROR] Python is not installed or not in PATH.
        echo.
        echo 1. Download: https://www.python.org/downloads/
        echo 2. During install, check [✓] Add Python to PATH
        echo 3. Then run this file again.
    )
    pause
    EXIT /B 1
)

REM ───── ПРОВЕРКА FFMPEG ─────
ffmpeg -version >nul 2>&1
IF ERRORLEVEL 1 (
    echo.
    if "%LANG%"=="2" (
        echo [ОШИБКА] FFmpeg не установлен или не добавлен в PATH.
        echo 1. Скачайте ZIP: https://www.gyan.dev/ffmpeg/builds/
        echo 2. Распакуйте, например, в C:\ffmpeg
        echo 3. Добавьте путь C:\ffmpeg\bin в переменные среды PATH
    ) else (
        echo [ERROR] FFmpeg is not installed or not in PATH.
        echo 1. Download ZIP: https://www.gyan.dev/ffmpeg/builds/
        echo 2. Extract to: C:\ffmpeg
        echo 3. Add C:\ffmpeg\bin to system PATH
    )
    pause
    EXIT /B 1
)

REM ───── СОЗДАНИЕ И АКТИВАЦИЯ ВИРТ. ОКРУЖЕНИЯ ─────
IF NOT EXIST venv (
    if "%LANG%"=="2" (
        echo [ИНФО] Создаю виртуальное окружение...
    ) else (
        echo [INFO] Creating virtual environment...
    )
    python -m venv venv
)

call venv\Scripts\activate.bat

REM ───── УСТАНОВКА ЗАВИСИМОСТЕЙ ─────
if "%LANG%"=="2" (
    echo [ИНФО] Установка зависимостей...
) else (
    echo [INFO] Installing dependencies...
)

pip install --upgrade pip
pip install flask flask-cors yt-dlp werkzeug

REM ───── ЗАПУСК СЕРВЕРА ─────
if "%LANG%"=="2" (
    echo [ИНФО] Запуск сервера...
) else (
    echo [INFO] Starting server...
)

python server.py

echo.
if "%LANG%"=="2" (
    echo [ГОТОВО] Сервер завершил работу или был остановлен.
) else (
    echo [DONE] Server has exited or was stopped.
)

pause
