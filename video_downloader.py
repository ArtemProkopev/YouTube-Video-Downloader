import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def install_requirements():
    """Автоматическая установка yt-dlp и FFmpeg"""
    print("Установка необходимых компонентов...")
    
    # Установка yt-dlp
    subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "yt-dlp"], check=True)
    
    # Установка FFmpeg для Windows
    if platform.system() == "Windows":
        ffmpeg_url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
        ffmpeg_zip = "ffmpeg.zip"
        
        # Скачивание и распаковка
        subprocess.run(["curl", "-L", ffmpeg_url, "-o", ffmpeg_zip], check=True)
        shutil.unpack_archive(ffmpeg_zip, "ffmpeg")
        os.remove(ffmpeg_zip)
        
        # Добавление в PATH
        ffmpeg_path = str(Path("ffmpeg/ffmpeg-master-latest-win64-gpl/bin").resolve())
        os.environ["PATH"] += os.pathsep + ffmpeg_path

def download_video():
    """Скачивание видео с контролем ресурсов"""
    # Конфигурация
    URL = "https://youtu.be/gxRVVJdX_-4"  # Замените на свою ссылку
    OUTPUT_DIR = "downloads"
    MAX_THREADS = 2  # Ограничение потоков
    
    # Создание папки
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Команда для yt-dlp
    cmd = [
        "yt-dlp",
        "-f", "bestvideo[ext=mp4][vcodec^=avc]+bestaudio[ext=m4a]/best[ext=mp4]",
        "--merge-output-format", "mp4",
        "--convert-videos", "mp4",
        "--postprocessor-args", f"ffmpeg:-threads {MAX_THREADS} -preset superfast",
        "-o", f"{OUTPUT_DIR}/%(title)s.%(ext)s",
        "--no-keep-video",
        "--cache-dir", "tmp_cache",
        "--rm-cache-dir",
        "--throttled-rate", "100K",
        "--limit-rate", "50M",
        URL
    ]
    
    # Запуск процесса с контролем ресурсов
    print("Начало загрузки...")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    # Вывод в реальном времени
    for line in process.stdout:
        print(line.strip())
    
    process.wait()
    
    # Очистка промежуточных файлов
    print("Очистка временных файлов...")
    for file in Path(OUTPUT_DIR).glob("*"):
        if file.suffix in ['.webm', '.part', '.ytdl']:
            try:
                file.unlink()
                print(f"Удален: {file.name}")
            except:
                pass
    
    # Удаление кеша
    if Path("tmp_cache").exists():
        shutil.rmtree("tmp_cache")
    
    print("Операция успешно завершена!")

if __name__ == "__main__":
    # Проверка зависимостей
    try:
        import yt_dlp
    except ImportError:
        install_requirements()
    
    # Запуск скачивания
    download_video()
    
    # Для Windows: предотвращение автоматического закрытия окна
    if platform.system() == "Windows":
        input("Нажмите Enter для выхода...")