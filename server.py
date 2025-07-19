import os
import re
import logging
import subprocess
import time
import shutil
import threading
import glob
import urllib.parse
from flask import Flask, request, Response, jsonify, send_file
from flask_cors import CORS
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
DOWNLOAD_DIR = "./downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Настройка логирования
app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
app.logger.addHandler(handler)

class DownloadProgress:
    def __init__(self):
        self.progress = {}
        self.temp_files = {}
    
    def hook(self, d):
        if d['status'] == 'downloading':
            video_id = d['info_dict']['id']
            downloaded = d.get('downloaded_bytes', 0)
            total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
            percent = downloaded / total * 100 if total > 0 else 0
            
            # Сохраняем временные файлы для последующей очистки
            if d.get('tmpfilename'):
                self.temp_files[video_id] = d['tmpfilename']
            
            self.progress[video_id] = {
                "percent": round(percent, 1),
                "downloaded_mb": round(downloaded / 1024 / 1024, 2),
                "total_mb": round(total / 1024 / 1024, 2),
                "speed": d.get('speed', 0),
                "eta": d.get('eta', 0)
            }

progress_hook = DownloadProgress()

def clean_filename(filename):
    """Очистка имени файла от недопустимых символов"""
    cleaned = re.sub(r'[\\/*?:"<>|]', "", filename)
    return cleaned[:100]

def check_ffmpeg():
    """Проверка наличия FFmpeg в системе"""
    try:
        result = subprocess.run(["ffmpeg", "-version"], 
                               capture_output=True, 
                               text=True,
                               check=True)
        app.logger.info(f"FFmpeg version: {result.stdout.splitlines()[0]}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        app.logger.error(f"FFmpeg check failed: {str(e)}")
        return False

def limit_ffmpeg_resources():
    """Возвращает аргументы для ограничения ресурсов FFmpeg"""
    # Ограничиваем потоки и используем быстрые пресеты
    return [
        '-threads', '2',  # Максимум 2 потока
        '-preset', 'superfast',  # Самый быстрый пресет кодирования
        '-c:v', 'libx264',
        '-crf', '23',
        '-movflags', 'faststart'
    ]

def get_final_filename(video_id, output_format):
    """Находит финальный файл по ID видео"""
    pattern = os.path.join(DOWNLOAD_DIR, f"*{video_id}*.{output_format}")
    files = glob.glob(pattern)
    if files:
        return files[0]
    
    # Если не нашли по формату, ищем любой файл с ID
    pattern = os.path.join(DOWNLOAD_DIR, f"*{video_id}*")
    files = glob.glob(pattern)
    return files[0] if files else None

@app.route("/api/download")
def download():
    video_id = None
    final_filename = None
    
    try:
        # Проверка FFmpeg
        if not check_ffmpeg():
            return jsonify({"error": "FFmpeg not installed or not in PATH"}), 500
        
        # Параметры
        url = request.args.get("url")
        quality = request.args.get("quality", "best")
        output_format = request.args.get("format", "mp4").lower()
        
        # Преобразование URL Shorts
        if url and '/shorts/' in url:
            url = url.replace('/shorts/', '/watch?v=')
            app.logger.info(f"Converted Shorts URL: {url}")
        
        # Валидация URL
        if not url or not re.match(r"^https?://(www\.)?(youtube\.com|youtu\.be)", url):
            return jsonify({"error": "Invalid YouTube URL"}), 400
        
        # Настройки формата
        if output_format == "mp3":
            video_format = "bestaudio"
        else:
            # Для видео: выбираем лучший поток с ограничением по качеству
            video_format = f"bestvideo[height<={quality}]+bestaudio/best"
        
        # Оптимизированные опции загрузки
        ydl_opts = {
            "format": video_format,
            "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s.%(id)s.%(ext)s"),
            "progress_hooks": [progress_hook.hook],
            "quiet": False,
            "noplaylist": True,
            "concurrent_fragment_downloads": 2,
            # Автоматическое удаление временных файлов
            "keepvideo": False,
            "nopart": True,
            "updatetime": False,
            "cachedir": False,
            "noresizebuffer": True,
            "postprocessor_args": {
                "video": limit_ffmpeg_resources(),
                "audio": ['-b:a', '192k']
            },
        }
        
        # Для форматов, поддерживающих перепаковку
        if output_format in ['mp4', 'mkv', 'webm']:
            ydl_opts["merge_output_format"] = output_format
            app.logger.info(f"Using merge_output_format for {output_format} format")
        elif output_format != "mp3":
            # Для форматов, требующих конвертации
            ydl_opts["postprocessors"] = [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': output_format,
            }]
            app.logger.info(f"Using conversion for {output_format} format")
        else:
            # Для MP3
            ydl_opts["postprocessors"] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }]
        
        app.logger.info(f"Starting download: {url}, format: {output_format}, quality: {quality}")
        
        try:
            # Скачивание
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                video_id = info.get('id', '')
                title = clean_filename(info.get('title', 'video'))
                
                # Получаем фактическое имя файла
                final_filename = get_final_filename(video_id, output_format)
                
                if not final_filename:
                    # Попробуем найти любой файл с этим ID
                    final_filename = get_final_filename(video_id, "*")
                
                if not final_filename:
                    raise FileNotFoundError(f"Final file not found for video ID: {video_id}")
            
            app.logger.info(f"Processing completed: {final_filename}")
            
            # Проверка существования файла
            if not os.path.exists(final_filename):
                app.logger.error(f"File not found: {final_filename}")
                return jsonify({"error": "File not found after download"}), 500

            # Определяем безопасное имя файла для скачивания
            file_ext = os.path.splitext(final_filename)[1][1:]
            safe_filename = secure_filename(f"{title}.{file_ext}")
            
            # Отправляем файл без немедленного удаления
            response = send_file(
                final_filename,
                as_attachment=True,
                download_name=safe_filename,
                mimetype=f"video/{file_ext}" if file_ext != "mp3" else "audio/mpeg"
            )
            
            # Устанавливаем заголовки
            response.headers["X-Video-Title"] = urllib.parse.quote(title)
            response.headers["X-Video-Id"] = video_id
            
            return response
        
        except DownloadError as e:
            app.logger.error(f"yt-dlp DownloadError: {str(e)}")
            return jsonify({"error": f"Ошибка загрузки видео: {str(e)}"}), 500
            
    except Exception as e:
        app.logger.exception("Critical error in download endpoint")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

@app.route("/api/progress/<video_id>")
def get_progress(video_id):
    return jsonify(progress_hook.progress.get(video_id, {}))

def cleanup_downloaded_files():
    """Фоновая задача для очистки скачанных файлов"""
    while True:
        try:
            now = time.time()
            for file in os.listdir(DOWNLOAD_DIR):
                file_path = os.path.join(DOWNLOAD_DIR, file)
                
                # Удаляем файлы старше 1 часа
                if os.path.isfile(file_path) and (now - os.path.getmtime(file_path)) > 3600:
                    try:
                        os.remove(file_path)
                        app.logger.info(f"Cleaned up old file: {file}")
                    except Exception as e:
                        app.logger.error(f"Error cleaning file {file}: {str(e)}")
        except Exception as e:
            app.logger.error(f"Cleanup error: {str(e)}")
        
        time.sleep(3600)  # Проверка каждый час
@app.route("/api/cleanup", methods=["DELETE"])
def cleanup_downloads():
    try:
        for file in os.listdir(DOWNLOAD_DIR):
            path = os.path.join(DOWNLOAD_DIR, file)
            if os.path.isfile(path):
                os.remove(path)
        app.logger.info("Downloads folder cleaned after save.")
        return jsonify({"status": "ok", "message": "Downloads folder cleaned."})
    except Exception as e:
        app.logger.error(f"Cleanup failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Запускаем фоновую очистку
    cleanup_thread = threading.Thread(target=cleanup_downloaded_files, daemon=True)
    cleanup_thread.start()
    
    app.run(debug=True, threaded=True, port=5000)
    
    