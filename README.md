
# 🇬🇧 FULL INSTALLATION GUIDE (Windows & Linux)

## ✅ For Windows

1. **Install Python 3**
   Download from: https://www.python.org/downloads/
   During installation, make sure to check:
   ✅ "Add Python to PATH"

2. **Install FFmpeg**
   - Go to: https://www.gyan.dev/ffmpeg/builds/
   - Download the *release full* ZIP
   - Extract to a folder, e.g., `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to your system PATH:
     - Search *"environment variables"* in Start Menu
     - Click "Edit system environment variables"
     - Click **[Environment Variables...]**
     - Under **System Variables**, find `Path` → **Edit** → **New** → Paste `C:\ffmpeg\bin`

3. **Run the server**
   - Double-click `start_server.bat`
   - Select language (English or Russian)
   - The script will:
     - Check Python and FFmpeg
     - Create a virtual environment
     - Install Python dependencies
     - Start the Flask server at `http://localhost:5000`

4. **Install the Chrome Extension**
   - Open Chrome
   - Go to: `chrome://extensions`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Select the folder that contains `manifest.json`


## ✅ For Linux

1. **Install Python 3 and pip**
   Open terminal and run:

   ```bash
   sudo apt update
   sudo apt install python3 python3-pip
   ```

2. **Install FFmpeg**

   ```bash
   sudo apt install ffmpeg
   ```

3. **Run the server**

   ```bash
   chmod +x start_server.sh
   ./start_server.sh
   ```

   - Select language (English or Russian)
   - The script will:
     - Check Python and FFmpeg
     - Create a virtual environment
     - Install dependencies
     - Launch the server at `http://localhost:5000`

4. **Install the Chrome Extension**
   - Open Chrome or Chromium
   - Go to: `chrome://extensions`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Choose the folder that contains `manifest.json`


# 🇷🇺 ПОЛНОЕ РУКОВОДСТВО ПО УСТАНОВКЕ (Windows и Linux)

## ✅ Для Windows

1. **Установите Python 3**
   Скачать: https://www.python.org/downloads/
   При установке обязательно отметьте галочку:
   ✅ "Add Python to PATH"

2. **Установите FFmpeg**
   - Перейдите на: https://www.gyan.dev/ffmpeg/builds/
   - Скачайте архив ZIP (*release full*)
   - Распакуйте в папку, например: `C:\ffmpeg`
   - Добавьте `C:\ffmpeg\bin` в системную переменную PATH:
     - Откройте Пуск → Найдите "Переменные среды"
     - Нажмите **[Изменить переменные среды]**
     - В разделе **Системные переменные** найдите `Path` → **Изменить** → **Создать** → Вставьте `C:\ffmpeg\bin`

3. **Запуск сервера**
   - Дважды щёлкните по `start_server.bat`
   - Выберите язык (английский или русский)
   - Скрипт:
     - Проверит наличие Python и FFmpeg
     - Создаст виртуальное окружение
     - Установит зависимости Python
     - Запустит сервер на `http://localhost:5000`

4. **Установка расширения Chrome**
   - Откройте Chrome
   - Перейдите на: `chrome://extensions`
   - Включите **Режим разработчика**
   - Нажмите **Загрузить распакованное расширение**
   - Укажите папку, содержащую `manifest.json`


## ✅ Для Linux

1. **Установите Python 3 и pip**
   Откройте терминал и выполните:

   ```bash
   sudo apt update
   sudo apt install python3 python3-pip
   ```

2. **Установите FFmpeg**

   ```bash
   sudo apt install ffmpeg
   ```

3. **Запуск сервера**

   ```bash
   chmod +x start_server.sh
   ./start_server.sh
   ```

   - Выберите язык (английский или русский)
   - Скрипт:
     - Проверит наличие Python и FFmpeg
     - Создаст виртуальное окружение
     - Установит зависимости
     - Запустит сервер по адресу `http://localhost:5000`

4. **Установка расширения Chrome**
   - Откройте Chrome или Chromium
   - Перейдите на: `chrome://extensions`
   - Включите **Режим разработчика**
   - Нажмите **Загрузить распакованное расширение**
   - Укажите папку, в которой находится `manifest.json`
