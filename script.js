// PWA и Service Worker регистрация
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker зарегистрирован');
            
            // Запрос разрешения на уведомления
            if (Notification.permission === 'default') {
                setTimeout(() => {
                    document.getElementById('enableNotifications').style.display = 'block';
                }, 2000);
            }
        })
        .catch(error => console.log('Ошибка регистрации Service Worker:', error));
}

// Управление страницами
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    localStorage.setItem('currentPage', pageId);
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
        
        // Мобильное меню
        if (window.innerWidth <= 768) {
            document.querySelector('.nav').classList.remove('active');
        }
    });
});

// Восстановление последней открытой страницы
const savedPage = localStorage.getItem('currentPage');
if (savedPage && document.getElementById(savedPage)) {
    showPage(savedPage);
}

// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

// Локальное хранение заметок
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('userNotes') || '{}');
    
    document.querySelectorAll('.saved-note').forEach(element => {
        const page = element.getAttribute('data-page');
        if (notes[page]) {
            element.innerHTML = `<strong>📝 Сохранённая заметка:</strong><br>${notes[page].replace(/\n/g, '<br>')}`;
        } else {
            element.innerHTML = '';
        }
    });
}

function saveNote(page, content) {
    const notes = JSON.parse(localStorage.getItem('userNotes') || '{}');
    notes[page] = content;
    localStorage.setItem('userNotes', JSON.stringify(notes));
    loadNotes();
    
    // Отправка уведомления о сохранении
    if (Notification.permission === 'granted') {
        new Notification('Заметка сохранена!', {
            body: `Заметка на странице "${page}" успешно сохранена`,
            icon: '/icon-192.png'
        });
    }
}

document.querySelectorAll('.save-note').forEach(button => {
    button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        const editor = document.querySelector(`.note-editor[data-page="${page}"]`);
        const content = editor.value.trim();
        
        if (content) {
            saveNote(page, content);
            editor.value = '';
            
            // Визуальная обратная связь
            const originalText = button.textContent;
            button.textContent = '✓ Сохранено!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } else {
            alert('Пожалуйста, введите текст заметки');
        }
    });
});

// Загрузка сохранённых заметок при старте
loadNotes();

// Управление уведомлениями
let notificationInterval = null;
let isNotificationsEnabled = false;

async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено');
            isNotificationsEnabled = true;
            
            // Сохраняем состояние в localStorage
            localStorage.setItem('notificationsEnabled', 'true');
            
            // Запускаем интервал уведомлений
            startNotificationInterval();
            
            // Скрываем кнопку после включения
            const notifyBtn = document.getElementById('enableNotifications');
            if (notifyBtn) {
                notifyBtn.textContent = '✅ Уведомления активны (каждые 20 сек)';
                notifyBtn.style.background = '#4caf50';
                setTimeout(() => {
                    notifyBtn.style.display = 'none';
                }, 3000);
            }
            
            // Тестовое уведомление
            showNotification('Уведомления включены!', 'Вы будете получать напоминания каждые 20 секунд');
        } else {
            alert('Для работы уведомлений необходимо разрешение');
        }
    }
}

function showNotification(title, body) {
    if (Notification.permission === 'granted' && isNotificationsEnabled) {
        // Проверяем, не в фокусе ли сейчас приложение
        if (!document.hasFocus()) {
            new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                tag: 'reminder',
                requireInteraction: false,
                silent: false,
                vibrate: [200, 100, 200]
            });
        } else {
            // Если приложение активно, показываем тихое уведомление только если включены
            if (localStorage.getItem('notifyWhenActive') === 'true') {
                new Notification(title, {
                    body: body,
                    icon: '/icon-192.png',
                    tag: 'reminder',
                    silent: true
                });
            }
        }
    }
}

function startNotificationInterval() {
    // Останавливаем предыдущий интервал, если он есть
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    
    // Запускаем новый интервал на 20 секунд
    notificationInterval = setInterval(() => {
        if (isNotificationsEnabled && Notification.permission === 'granted') {
            const messages = [
                '📚 Не забывайте практиковаться с Turtle!',
                '🐢 Попробуйте нарисовать новую фигуру с помощью черепашки',
                '💡 Вспомните команды: forward, backward, left, right',
                '⭐ Решите ещё один пример из раздела "Примеры решений"',
                '🎯 Цель: набрать максимум баллов на ЕГЭ!',
                '📝 Сохраните свои заметки - они пригодятся при подготовке',
                '🔍 Проверьте, все ли команды Turtle вы уже изучили?',
                '⚡ Практика - ключ к успеху! Попробуйте нарисовать спираль',
                '🎨 Экспериментируйте с цветами и толщиной линии',
                '🏆 Каждый день практики приближает вас к отличному результату!'
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Отправляем уведомление через Service Worker для лучшей совместимости
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title: 'EGE-Prosto - Напоминание',
                    body: randomMessage,
                    icon: '/icon-192.png'
                });
            } else {
                // Fallback для обычных уведомлений
                showNotification('EGE-Prosto - Напоминание', randomMessage);
            }
            
            // Логируем в консоль для отладки
            console.log(`[${new Date().toLocaleTimeString()}] Уведомление отправлено: ${randomMessage}`);
            
            // Обновляем счётчик уведомлений в localStorage
            const notificationCount = parseInt(localStorage.getItem('notificationCount') || '0');
            localStorage.setItem('notificationCount', (notificationCount + 1).toString());
        }
    }, 20000); // 20000 миллисекунд = 20 секунд
}

function stopNotificationInterval() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
    isNotificationsEnabled = false;
    localStorage.setItem('notificationsEnabled', 'false');
    
    const notifyBtn = document.getElementById('enableNotifications');
    if (notifyBtn) {
        notifyBtn.textContent = '🔔 Включить уведомления (каждые 20 сек)';
        notifyBtn.style.background = '';
        notifyBtn.style.display = 'block';
    }
}

// Проверяем сохранённое состояние уведомлений при загрузке
const savedNotificationsState = localStorage.getItem('notificationsEnabled');
if (savedNotificationsState === 'true' && Notification.permission === 'granted') {
    isNotificationsEnabled = true;
    startNotificationInterval();
    
    // Скрываем кнопку, если уведомления уже активны
    const notifyBtn = document.getElementById('enableNotifications');
    if (notifyBtn) {
        notifyBtn.textContent = '✅ Уведомления активны (каждые 20 сек)';
        notifyBtn.style.background = '#4caf50';
        setTimeout(() => {
            notifyBtn.style.display = 'none';
        }, 3000);
    }
}

// Кнопка включения уведомлений
const notifyBtn = document.getElementById('enableNotifications');
if (notifyBtn) {
    notifyBtn.addEventListener('click', requestNotificationPermission);
}

// Добавляем кнопку для отключения уведомлений (можно добавить в настройки)
function addDisableButton() {
    const heroSection = document.querySelector('.hero');
    if (heroSection && !document.getElementById('disableNotifications')) {
        const disableBtn = document.createElement('button');
        disableBtn.id = 'disableNotifications';
        disableBtn.textContent = '🔕 Отключить уведомления';
        disableBtn.style.background = '#ff4757';
        disableBtn.style.marginLeft = '10px';
        disableBtn.style.padding = '0.8rem 1.5rem';
        disableBtn.style.border = 'none';
        disableBtn.style.borderRadius = '5px';
        disableBtn.style.color = 'white';
        disableBtn.style.cursor = 'pointer';
        
        disableBtn.addEventListener('click', () => {
            stopNotificationInterval();
            alert('Уведомления отключены');
            disableBtn.remove();
            
            // Показываем кнопку включения снова
            if (notifyBtn) {
                notifyBtn.style.display = 'block';
            }
        });
        
        heroSection.appendChild(disableBtn);
    }
}

// Добавляем кнопку отключения, если уведомления активны
if (savedNotificationsState === 'true') {
    setTimeout(addDisableButton, 1000);
}

// Сохранение времени последнего визита
localStorage.setItem('lastVisit', new Date().getTime().toString());

// Автосохранение заметок при выходе
window.addEventListener('beforeunload', () => {
    const notes = JSON.parse(localStorage.getItem('userNotes') || '{}');
    document.querySelectorAll('.note-editor').forEach(editor => {
        const page = editor.getAttribute('data-page');
        if (editor.value.trim()) {
            notes[`temp_${page}`] = editor.value;
        }
    });
    localStorage.setItem('userNotes', JSON.stringify(notes));
});

// Отслеживание активности приложения
let activeTime = 0;
setInterval(() => {
    if (document.hasFocus()) {
        activeTime += 1;
        if (activeTime % 60 === 0) { // Каждую минуту активности
            console.log(`Приложение активно: ${activeTime} минут`);
        }
    }
}, 1000);

// Обработка сообщений от Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            console.log('Пользователь кликнул на уведомление');
            // Можно добавить переход на конкретную страницу
            showPage('examples');
        }
    });
}

// Отображение статистики уведомлений (опционально)
function showNotificationStats() {
    const count = localStorage.getItem('notificationCount') || '0';
    console.log(`Всего отправлено уведомлений: ${count}`);
}

// Вызов статистики каждые 10 уведомлений
let lastCount = 0;
setInterval(() => {
    const currentCount = parseInt(localStorage.getItem('notificationCount') || '0');
    if (currentCount > lastCount && currentCount % 10 === 0) {
        showNotificationStats();
        lastCount = currentCount;
    }
}, 1000);