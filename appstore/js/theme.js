// js/theme.js
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.htmlElement = document.documentElement;
        this.init();
    }
    
    init() {
        // Kiểm tra theme đã lưu
        const savedTheme = localStorage.getItem('theme');
        
        // Áp dụng theme đã lưu hoặc mặc định (light)
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Mặc định là light mode
            this.setTheme('light');
        }
        
        // Thêm sự kiện click cho nút chuyển đổi
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Thêm class để animation mượt mà
        setTimeout(() => {
            document.body.classList.add('theme-transition');
        }, 100);
    }
    
    setTheme(theme) {
        const isDark = theme === 'dark';
        this.htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Cập nhật icon
        this.updateThemeIcon(isDark);
        
        // Gửi sự kiện analytics (nếu có)
        this.trackThemeChange(isDark ? 'dark' : 'light');
    }
    
    toggleTheme() {
        const currentTheme = this.htmlElement.getAttribute('data-theme');
        const isDark = currentTheme === 'dark';
        this.setTheme(isDark ? 'light' : 'dark');
        
        // Thêm hiệu ứng ripple cho nút bấm
        this.createRippleEffect(event);
    }
    
    updateThemeIcon(isDark) {
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');
        
        if (isDark) {
            sunIcon.style.opacity = '0';
            sunIcon.style.transform = 'rotate(90deg)';
            moonIcon.style.opacity = '1';
            moonIcon.style.transform = 'rotate(0deg)';
        } else {
            sunIcon.style.opacity = '1';
            sunIcon.style.transform = 'rotate(0deg)';
            moonIcon.style.opacity = '0';
            moonIcon.style.transform = 'rotate(-90deg)';
        }
    }
    
    createRippleEffect(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    trackThemeChange(theme) {
        // Có thể thêm tracking cho analytics ở đây
        console.log(`Theme changed to: ${theme}`);
    }
}

// Khởi tạo Theme Manager khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    
    // Thêm CSS cho ripple effect
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .theme-toggle {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(rippleStyle);
});
