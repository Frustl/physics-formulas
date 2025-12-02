console.log('script.js loaded successfully!');

// Инициализация с задержкой для file:// протокола
setTimeout(function() {
    console.log('Delayed initialization starting...');
    initAll();
}, 1000);

function initAll() {
    console.log('DOM loaded, initializing...'); // Отладка
    initNavigation();
    initSearch();
    initBackToTop();
    initSmoothScrolling();
    initFormulaHighlighting();
    initImportantFormulas();
    initMobileMenu();
    console.log('All functions initialized'); // Отладка
    
    // Глобальный обработчик для отладки кликов
    document.addEventListener('click', function(e) {
        if (e.target.closest('.formula-card')) {
            const card = e.target.closest('.formula-card');
            console.log('Clicked on formula card:', card.className);
            console.log('Is important?', card.classList.contains('important-formula'));
            console.log('Dataset:', card.dataset);
        }
    });
}

// Навигация по разделам
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Плавная прокрутка к разделу
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Отслеживание текущего раздела при скролле
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && 
                window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Поиск формул
function initSearch() {
    // Создаем контейнер поиска
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" class="search-input" placeholder="Поиск формул..." id="searchInput">
    `;
    
    // Вставляем поиск перед основным контентом
    const main = document.querySelector('main');
    main.insertBefore(searchContainer, main.firstChild);
    
    const searchInput = document.getElementById('searchInput');
    const formulaCards = document.querySelectorAll('.formula-card');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        formulaCards.forEach(card => {
            const formula = card.querySelector('.formula').textContent.toLowerCase();
            const description = card.querySelector('.description').textContent.toLowerCase();
            
            if (formula.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем/скрываем подразделы в зависимости от результатов
        document.querySelectorAll('.subsection').forEach(subsection => {
            const visibleCards = subsection.querySelectorAll('.formula-card[style="display: block;"], .formula-card:not([style])');
            const hasVisibleCards = Array.from(visibleCards).some(card => 
                card.style.display !== 'none'
            );
            
            if (searchTerm && !hasVisibleCards) {
                subsection.style.opacity = '0.3';
            } else {
                subsection.style.opacity = '1';
            }
        });
    });
}

// Кнопка "Наверх"
function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.setAttribute('aria-label', 'Наверх');
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Плавная прокрутка
function initSmoothScrolling() {
    // Обработка якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Подсветка формул при наведении
function initFormulaHighlighting() {
    const formulaCards = document.querySelectorAll('.formula-card:not(.important-formula)');
    
    formulaCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Клик для копирования формулы (только для обычных формул)
        card.addEventListener('click', function() {
            const formula = this.querySelector('.formula').textContent.trim();
            copyToClipboard(formula);
            
            // Визуальная обратная связь
            const originalBg = this.style.backgroundColor;
            this.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            
            setTimeout(() => {
                this.style.backgroundColor = originalBg;
            }, 300);
            
            // Показываем уведомление о копировании
            showNotification('Формула скопирована в буфер обмена');
        });
    });
}

// Инициализация push-уведомлений для важных формул
function initImportantFormulas() {
    const importantFormulas = document.querySelectorAll('.important-formula');
    console.log('Found important formulas:', importantFormulas.length); // Отладка
    
    // Если важных формул не найдено, проверим все карточки
    if (importantFormulas.length === 0) {
        console.log('No important formulas found, checking all formula cards...');
        const allCards = document.querySelectorAll('.formula-card');
        console.log('All formula cards:', allCards.length);
        allCards.forEach((card, index) => {
            console.log(`Card ${index}:`, card.className, card.dataset.formula);
        });
    }
    
    importantFormulas.forEach((formula, index) => {
        console.log(`Setting up formula ${index}:`, formula.dataset.formula); // Отладка
        
        // Добавляем наведение
        formula.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        formula.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Клик для показа push-уведомления
        formula.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Clicked important formula!'); // Отладка
            
            const formulaId = this.dataset.formula;
            const scientist = this.dataset.scientist;
            const year = this.dataset.year;
            const applications = this.dataset.applications;
            const formulaText = this.querySelector('.formula').textContent.trim();
            const description = this.querySelector('.description').textContent.trim();
            
            console.log('Formula data:', { formulaId, scientist, year, applications }); // Отладка
            
            // Показываем уведомление
            showPushNotification({
                title: description,
                formula: formulaText,
                scientist: scientist,
                year: year,
                applications: applications,
                formulaId: formulaId
            });
        });
        
        // Добавляем индикатор кликабельности
        formula.style.cursor = 'pointer';
    });
}

// Показ push-уведомления
function showPushNotification(data) {
    console.log('showPushNotification called with:', data); // Отладка
    
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.push-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'push-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #6366f1;
        max-width: 350px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
        overflow: hidden;
    `;
    
    notification.innerHTML = `
        <div style="background: linear-gradient(135deg, #6366f1, #818cf8); color: white; padding: 12px 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; position: relative;">
            <span>📐</span>
            <span>Важная формула</span>
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.8;">✕</button>
        </div>
        <div style="padding: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${data.title}</div>
            <div style="font-family: 'Courier New', monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 0.9rem;">${data.formula}</div>
            <div style="font-size: 0.9rem; color: #6b7280; margin-bottom: 4px;">👨‍🔬 Открыл: ${data.scientist}</div>
            <div style="font-size: 0.9rem; color: #6b7280; margin-bottom: 4px;">📅 Год: ${data.year}</div>
            <div style="font-size: 0.85rem; color: #9ca3af; font-style: italic; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">🔬 Применение: ${data.applications}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое закрытие через 8 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 8000);
    
    // Сохранение статистики просмотров
    if (data.formulaId) {
        saveFormulaView(data.formulaId);
    }
}

// Сохранение статистики просмотров формул
function saveFormulaView(formulaId) {
    const views = JSON.parse(localStorage.getItem('formulaViews') || '{}');
    views[formulaId] = (views[formulaId] || 0) + 1;
    localStorage.setItem('formulaViews', JSON.stringify(views));
    
    // Обновляем счетчик просмотров
    updateViewCounter();
}

// Обновление счетчика просмотров
function updateViewCounter() {
    const views = JSON.parse(localStorage.getItem('formulaViews') || '{}');
    const totalViews = Object.values(views).reduce((sum, count) => sum + count, 0);
    
    // Можно добавить отображение общей статистики где-нибудь на странице
    console.log(`Всего просмотров формул: ${totalViews}`);
}

// Получение статистики по формуле
function getFormulaStats(formulaId) {
    const views = JSON.parse(localStorage.getItem('formulaViews') || '{}');
    return views[formulaId] || 0;
}

// Копирование в буфер обмена
function copyToClipboard(text) {
    // Создаем временный элемент
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
    tempElement.style.position = 'fixed';
    tempElement.style.opacity = '0';
    
    document.body.appendChild(tempElement);
    tempElement.select();
    
    try {
        document.execCommand('copy');
        showNotification('Формула скопирована в буфер обмена');
    } catch (err) {
        console.error('Не удалось скопировать текст:', err);
        showNotification('Не удалось скопировать формулу', 'error');
    }
    
    document.body.removeChild(tempElement);
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'error') {
        notification.style.background = '#ef4444';
    } else {
        notification.style.background = '#10b981';
    }
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentElement) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Мобильное меню
function initMobileMenu() {
    const nav = document.querySelector('.navigation');
    const navList = document.querySelector('.nav-list');
    
    // Создаем кнопку мобильного меню
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '☰';
    mobileMenuButton.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-primary);
        padding: 0.5rem;
    `;
    
    nav.querySelector('.container').appendChild(mobileMenuButton);
    
    // Обработка клика по кнопке меню
    mobileMenuButton.addEventListener('click', function() {
        navList.classList.toggle('mobile-open');
        this.innerHTML = navList.classList.contains('mobile-open') ? '✕' : '☰';
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && navList.classList.contains('mobile-open')) {
            navList.classList.remove('mobile-open');
            mobileMenuButton.innerHTML = '☰';
        }
    });
    
    // Адаптивность для мобильных устройств
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileMenuButton.style.display = 'block';
            navList.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--surface-color);
                flex-direction: column;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 100;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .nav-list.mobile-open {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }
                
                @keyframes slideUp {
                    from {
                        transform: translate(-50%, 100%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideDown {
                    from {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                    to {
                        transform: translate(-50%, 100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        } else {
            mobileMenuButton.style.display = 'none';
            navList.style.cssText = '';
        }
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
}

// Горячие клавиши
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K для поиска
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape для очистки поиска
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
    
    // Стрелки для навигации по разделам
    if (e.altKey) {
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        const activeLink = document.querySelector('.nav-link.active');
        const currentIndex = activeLink ? navLinks.indexOf(activeLink) : -1;
        
        if (e.key === 'ArrowDown' && currentIndex < navLinks.length - 1) {
            navLinks[currentIndex + 1].click();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            navLinks[currentIndex - 1].click();
        }
    }
});

// Перерисовка формул после изменений
function rerenderMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([document.body]).catch(function(err) {
            console.log('MathJax error:', err);
        });
    }
}

// Наблюдатель за динамическим контентом
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            setTimeout(rerenderMathJax, 100);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Дополнительная перерисовка после полной загрузки страницы
window.addEventListener('load', function() {
    setTimeout(rerenderMathJax, 500);
});
