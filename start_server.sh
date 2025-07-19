#!/bin/bash

# ─────────────── Выбор языка ───────────────
clear
echo
echo "Choose language / Выберите язык:"
echo "[1] English"
echo "[2] Русский"
echo
read -p "Enter choice (1/2): " LANG

if [[ "$LANG" != "1" && "$LANG" != "2" ]]; then
    echo
    echo "Invalid input. Defaulting to English."
    LANG="1"
fi

if [ "$LANG" == "2" ]; then
    MSG_LANG="Выбран русский язык."
else
    MSG_LANG="English selected."
fi

echo
echo "$MSG_LANG"

# ───── Переход в папку скрипта ─────
cd "$(dirname "$0")"

# ───── Проверка Python ─────
if ! command -v python3 &> /dev/null; then
    echo
    if [ "$LANG" == "2" ]; then
        echo "[ОШИБКА] Python 3 не установлен. Установите: sudo apt install python3"
    else
        echo "[ERROR] Python 3 is not installed. Install it: sudo apt install python3"
    fi
    exit 1
fi

# ───── Проверка ffmpeg ─────
if ! command -v ffmpeg &> /dev/null; then
    echo
    if [ "$LANG" == "2" ]; then
        echo "[ОШИБКА] FFmpeg не установлен. Установите: sudo apt install ffmpeg"
    else
        echo "[ERROR] FFmpeg is not installed. Run: sudo apt install ffmpeg"
    fi
    exit 1
fi

# ───── Создание виртуального окружения ─────
if [ ! -d "venv" ]; then
    if [ "$LANG" == "2" ]; then
        echo "[ИНФО] Создаю виртуальное окружение..."
    else
        echo "[INFO] Creating virtual environment..."
    fi
    python3 -m venv venv
fi

# ───── Активация виртуального окружения ─────
source venv/bin/activate

# ───── Установка зависимостей ─────
if [ "$LANG" == "2" ]; then
    echo "[ИНФО] Установка зависимостей..."
else
    echo "[INFO] Installing dependencies..."
fi

pip install --upgrade pip
pip install flask flask-cors yt-dlp werkzeug

# ───── Запуск сервера ─────
if [ "$LANG" == "2" ]; then
    echo "[ИНФО] Запуск сервера..."
else
    echo "[INFO] Starting server..."
fi

python3 server.py

echo
if [ "$LANG" == "2" ]; then
    echo "[ГОТОВО] Сервер завершил работу или был остановлен."
else
    echo "[DONE] Server has exited or was stopped."
fi

read -n 1 -s -r -p "Press any key to exit..."
echo
