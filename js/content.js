;(function () {
	// Стили для меню
	const menuStyles = `
        .yt-download-menu {
            display: none;
            position: absolute;
            z-index: 10000;
            background: rgba(24, 24, 24, 0.95);
            backdrop-filter: blur(12px);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.4);
            border: 1px solid #333;
            min-width: 280px;
            animation: fadeIn 0.3s ease-out;
        }
        
        .yt-download-menu__label {
            display: block;
            margin-bottom: 12px;
            font-size: 14px;
            color: #ccc;
        }
        
        .yt-download-menu__select {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            background: #1e1e1e;
            color: white;
            border: 1px solid #333;
            margin-top: 6px;
        }
        
        .yt-download-menu__button {
            background: linear-gradient(135deg, #ff4b6e, #ff1e56);
            color: white;
            border: none;
            padding: 12px 16px;
            width: 100%;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: transform 0.2s ease;
        }
        
        .yt-download-menu__button:hover {
            transform: translateY(-2px);
        }
        
        .yt-download-menu__progress {
            margin-top: 12px;
            background: #1e1e1e;
            border-radius: 4px;
            height: 6px;
            overflow: hidden;
        }
        
        .yt-download-menu__progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff4b6e, #ff1e56);
            transition: width 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `

	// Вставка стилей
	const styleSheet = document.createElement('style')
	styleSheet.textContent = menuStyles
	document.head.appendChild(styleSheet)

	function createDownloadButton() {
		// Проверка существования кнопки
		if (document.querySelector('#yt-download-btn')) return

		// Целевой контейнер (кнопки под видео)
		const target = document.querySelector(
			'#top-level-buttons-computed, ytd-menu-renderer'
		)
		if (!target) return

		// Создание кнопки
		const button = document.createElement('button')
		button.id = 'yt-download-btn'
		button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Скачать
        `

		// Стили кнопки
		button.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: linear-gradient(145deg, #ff4b6e, #ff1e56);
            color: white;
            border: none;
            padding: 8px 16px;
            margin-left: 8px;
            border-radius: 24px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 0, 76, 0.3);
            transition: all 0.2s ease;
        `

		// Создание меню
		const menu = document.createElement('div')
		menu.className = 'yt-download-menu'
		menu.innerHTML = `
            <label class="yt-download-menu__label">
                Формат:
                <select class="yt-download-menu__select" id="yt-format">
                    <option value="mp4">MP4 (Видео)</option>
                    <option value="mkv">MKV (Видео)</option>
                    <option value="mp3">MP3 (Аудио)</option>
                </select>
            </label>
            
            <label class="yt-download-menu__label">
                Качество:
                <select class="yt-download-menu__select" id="yt-quality">
                    <option value="1080">1080p</option>
                    <option value="720">720p</option>
                    <option value="480">480p</option>
                    <option value="360">360p</option>
                </select>
            </label>
            
            <div class="yt-download-menu__progress">
                <div class="yt-download-menu__progress-bar" id="yt-progress-bar"></div>
            </div>
            <div id="yt-status" style="margin-top:8px;font-size:13px;color:#aaa;"></div>
            
            <button class="yt-download-menu__button" id="yt-start-download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Начать загрузку
            </button>
        `

		// Обработчики событий
		button.addEventListener('click', e => {
			e.stopPropagation()
			const isVisible = menu.style.display === 'block'

			if (isVisible) {
				menu.style.display = 'none'
			} else {
				const rect = button.getBoundingClientRect()
				menu.style.top = `${rect.bottom + window.scrollY + 8}px`
				menu.style.left = `${rect.left}px`
				menu.style.display = 'block'
			}
		})

		document.addEventListener('click', e => {
			if (!menu.contains(e.target) && e.target !== button) {
				menu.style.display = 'none'
			}
		})

		document
			.getElementById('yt-start-download')
			.addEventListener('click', e => {
				e.preventDefault()
				const format = document.getElementById('yt-format').value
				const quality = document.getElementById('yt-quality').value
				const url = window.location.href

				menu.style.display = 'none'
				startDownload(url, format, quality)
			})

		// Добавление элементов в DOM
		document.body.appendChild(menu)
		target.appendChild(button)
	}

	function startDownload(url, format, quality) {
		const videoId = new URL(url).searchParams.get('v')
		const statusEl = document.getElementById('yt-status')
		const progressBar = document.getElementById('yt-progress-bar')
		const button = document.getElementById('yt-start-download')

		// Отключаем кнопку на время загрузки
		button.disabled = true
		statusEl.textContent = 'Подготовка...'
		progressBar.style.width = '0%'

		// Переменная для очистки интервала
		let progressInterval

		// Функция очистки
		const cleanup = () => {
			clearInterval(progressInterval)
			button.disabled = false
		}

		// Запрос на сервер
		fetch(
			`http://127.0.0.1:5000/api/download?url=${encodeURIComponent(
				url
			)}&format=${format}&quality=${quality}`
		)
			.then(response => {
				if (!response.ok) throw new Error('Ошибка сервера')
				return response.blob()
			})
			.then(blob => {
				// Создание ссылки для скачивания
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `${document.title}.${format}`
				a.click()
				URL.revokeObjectURL(url)

				statusEl.textContent = 'Скачивание завершено!'
				statusEl.style.color = '#76c7c0'
			})
			.catch(error => {
				statusEl.textContent = `Ошибка: ${error.message}`
				statusEl.style.color = '#ff4b6e'
			})
			.finally(cleanup)

		// Мониторинг прогресса
		progressInterval = setInterval(() => {
			fetch(`http://127.0.0.1:5000/api/progress/${videoId}`)
				.then(res => res.json())
				.then(data => {
					if (data.percent) {
						progressBar.style.width = `${data.percent}%`
						statusEl.textContent = `Загружено: ${data.percent}% (${data.downloaded_mb} MB)`
					}
				})
				.catch(() => clearInterval(progressInterval))
		}, 1000)
	}

	// Инициализация
	if (location.href.includes('youtube.com/watch')) {
		createDownloadButton()
	}

	// Observer для динамического контента
	new MutationObserver(createDownloadButton).observe(document.body, {
		childList: true,
		subtree: true,
	})
})()
