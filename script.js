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

// Уведомления
const notifyBtn = document.getElementById('enableNotifications');

async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено');
            if (notifyBtn) notifyBtn.style.display = 'none';
            
            // Тестовое уведомление
            new Notification('Уведомления включены!', {
                body: 'Вы будете получать важные обновления',
                icon: '/icon-192.png'
            });
        }
    }
}

if (notifyBtn) {
    notifyBtn.addEventListener('click', requestNotificationPermission);
}

// Автоматические напоминания (каждые 2 часа)
setInterval(() => {
    if (Notification.permission === 'granted') {
        const lastVisit = localStorage.getItem('lastVisit');
        const now = new Date().getTime();
        
        if (!lastVisit || (now - parseInt(lastVisit)) > 2 * 60 * 60 * 1000) {
            new Notification('Пора повторить материал!', {
                body: 'Загляните в справочник по Turtle, чтобы закрепить знания',
                tag: 'reminder',
                icon: '/icon-192.png'
            });
            localStorage.setItem('lastVisit', now.toString());
        }
    }
}, 2 * 60 * 60 * 1000);

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