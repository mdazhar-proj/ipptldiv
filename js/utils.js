// Utility Functions Module
// Contains helper functions and utilities

export function simpleMarkdownToHtml(md) {
    return md.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
             .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-1 border-slate-300">$1</h2>')
             .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/\*(.*?)\*/g, '<em>$1</em>')
             .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4">$1</li>')
             .replace(/<\/li>\n<li/g, '</li><li')
             .replace(/(<li.*?>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
             .replace(/<\/ul>\s*<ul>/g, '')
             .replace(/\n/g, '<br>');
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseTime(timeString) {
    if (!timeString || !/^\d{1,2}:\d{2}$/.test(timeString)) {
        return null;
    }
    
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + seconds;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateAge(age) {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum > 0 && ageNum <= 120;
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '').trim();
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}
