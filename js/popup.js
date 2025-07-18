document.addEventListener('DOMContentLoaded', () => {
	const downloadBtn = document.getElementById('downloadBtn')
	const urlInput = document.getElementById('url')
	const formatSelect = document.getElementById('formatSelect')
	const qualitySelect = document.getElementById('qualitySelect')
	const progressBar = document.getElementById('progressBar')
	const progressText = document.getElementById('progressText')
	const progressPercent = document.getElementById('progressPercent')
	const statusEl = document.getElementById('status')

	// Автофокус на поле ввода
	urlInput.focus()

	// Проверка YouTube URL
	const isValidYouTubeUrl = url => {
		const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
		return regExp.test(url)
	}

	// Показать статус
	const showStatus = (message, type = 'info') => {
		statusEl.textContent = message
		statusEl.className = 'popup__status'

		if (type === 'error') {
			statusEl.classList.add('popup__status--error')
		} else if (type === 'success') {
			statusEl.classList.add('popup__status--success')
		}
	}

	// Обновление прогресса
	const updateProgress = (percent, received, total) => {
		progressBar.style.width = `${percent}%`
		progressPercent.textContent = `${percent}%`

		if (percent > 0) {
			const receivedMB = (received / (1024 * 1024)).toFixed(2)
			const totalMB = (total / (1024 * 1024)).toFixed(2)
			progressText.textContent = `Загружено: ${receivedMB} MB из ${totalMB} MB`
		} else {
			progressText.textContent = 'Ожидание начала загрузки...'
		}
	}

	// Установка состояния загрузки
	const setLoadingState = isLoading => {
		downloadBtn.disabled = isLoading
		urlInput.disabled = isLoading
		formatSelect.disabled = isLoading
		qualitySelect.disabled = isLoading

		if (isLoading) {
			downloadBtn.innerHTML = '<div class="popup__spinner"></div> Загрузка...'
		} else {
			downloadBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Скачать видео
            `
		}
	}

	// Обработчик кнопки скачивания
	downloadBtn.addEventListener('click', async e => {
		e.preventDefault() // Предотвращаем перезагрузку страницы

		const url = urlInput.value.trim()
		const format = formatSelect.value
		const quality = qualitySelect.value

		// Валидация
		if (!url || !format || !quality) {
			showStatus('Заполните все поля', 'error')
			return
		}

		if (!isValidYouTubeUrl(url)) {
			showStatus('Некорректная ссылка YouTube', 'error')
			return
		}

		try {
			setLoadingState(true)
			showStatus('Подготовка к загрузке...')
			updateProgress(0, 0, 0)

			const response = await fetch(
				`http://127.0.0.1:5000/api/download?url=${encodeURIComponent(
					url
				)}&format=${format}&quality=${quality}`
			)

			if (!response.ok) {
				throw new Error(`Ошибка сервера: ${response.status}`)
			}

			// Получаем заголовки
			const contentLength = +response.headers.get('Content-Length')
			const videoTitle = response.headers.get('X-Video-Title') || 'video'

			// Считываем поток
			const reader = response.body.getReader()
			let receivedLength = 0
			const chunks = []
			let lastUpdate = Date.now()

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				chunks.push(value)
				receivedLength += value.length
				const percent = Math.floor((receivedLength / contentLength) * 100)

				// Обновляем прогресс не чаще 15fps
				if (Date.now() - lastUpdate > 66) {
					updateProgress(percent, receivedLength, contentLength)
					lastUpdate = Date.now()
				}
			}

			// Финальное обновление прогресса
			updateProgress(100, contentLength, contentLength)

			// Создаем Blob и скачиваем
			const blob = new Blob(chunks)
			const downloadUrl = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = downloadUrl
			a.download = `${videoTitle}.${format}`
			a.click()
			URL.revokeObjectURL(downloadUrl)

			showStatus('Скачивание завершено!', 'success')
			setTimeout(() => showStatus(''), 3000)
		} catch (error) {
			console.error('Download error:', error)
			showStatus(`Ошибка: ${error.message}`, 'error')
		} finally {
			setLoadingState(false)
			setTimeout(() => updateProgress(0, 0, 0), 5000)
		}
	})

	// Автоматическое заполнение текущего URL YouTube
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		const url = tabs[0]?.url || ''
		if (url.includes('youtube.com/watch')) {
			urlInput.value = url
		}
	})
})
