// --- FAB & Theme/Size Logic ---
const fabGroup = document.getElementById("fabGroup");
const themeMenu = document.getElementById("themeMenu");
const sizeMenu = document.getElementById("sizeMenu");
let focusedFabIndex = -1;
let focusedThemeIndex = -1;
let focusedSizeIndex = -1;

function toggleMainFab() {
    fabGroup.classList.toggle("active");
    const mainFab = document.querySelector(".main-fab");
    mainFab.classList.toggle("status-active");
    
    if (!fabGroup.classList.contains("active")) {
        themeMenu.classList.remove("active");
        sizeMenu.classList.remove("active");
        document.getElementById("customThemePanel").classList.remove("active");
        document.getElementById("customSizePanel").classList.remove("active");
        focusedFabIndex = -1;
        updateFabFocus();
    }
}

function toggleThemeMenu() {
    const customPanel = document.getElementById("customThemePanel");
    themeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
    sizeMenu.classList.remove("active");
    document.getElementById("customSizePanel").classList.remove("active");

    if (themeMenu.classList.contains("active")) {
        const options = document.querySelectorAll('.theme-opt');
        focusedThemeIndex = Array.from(options).findIndex(opt => opt.classList.contains('active'));
        updateThemeMenuFocus();
    }
}

function updateThemeMenuFocus() {
    const options = document.querySelectorAll('.theme-opt');
    options.forEach((opt, index) => {
        opt.classList.toggle('focus', index === focusedThemeIndex);
    });
}

function toggleSizeMenu() {
    const customPanel = document.getElementById("customSizePanel");
    sizeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
    themeMenu.classList.remove("active");
    document.getElementById("customThemePanel").classList.remove("active");

    if (sizeMenu.classList.contains("active")) {
        const options = document.querySelectorAll('.size-opt');
        focusedSizeIndex = Array.from(options).findIndex(opt => opt.classList.contains('active'));
        updateSizeMenuFocus();
    }
}

function updateSizeMenuFocus() {
    const options = document.querySelectorAll('.size-opt');
    options.forEach((opt, index) => {
        opt.classList.toggle('focus', index === focusedSizeIndex);
    });
}

function setTheme(theme, isInitial = false) {
    const body = document.body;
    body.className = ''; // Reset all themes
    if (theme !== 'custom') {
        body.classList.add(`${theme}-theme`);
        if (document.getElementById('customThemePanel')) 
            document.getElementById('customThemePanel').classList.remove('active');
    } else {
        loadCustomTheme();
    }

    // Update active state in menu
    document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === theme) btn.classList.add('active');
        if (theme === 'custom' && btn.id === 'customThemeOpt') btn.classList.add('active');
    });

    if (!isInitial) themeMenu.classList.remove("active");
    localStorage.setItem('calendar-theme', theme);
}

function setSize(size, isInitial = false) {
    const root = document.documentElement;
    const presets = {
        'small': { width: '380px', scale: '0.9' },
        'medium': { width: '450px', scale: '1' },
        'large': { width: '650px', scale: '1.1' }
    };

    if (size === 'custom') {
        loadCustomSize();
    } else if (presets[size]) {
        root.style.setProperty('--cal-width', presets[size].width);
        root.style.setProperty('--cal-scale', presets[size].scale);
        if (document.getElementById('customSizePanel')) 
            document.getElementById('customSizePanel').classList.remove('active');
    }

    document.querySelectorAll('.size-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === size) btn.classList.add('active');
        if (size === 'custom' && btn.id === 'customSizeOpt') btn.classList.add('active');
    });

    if (!isInitial) sizeMenu.classList.remove("active");
    localStorage.setItem('calendar-size', size);
}

function toggleCustomEditor() {
    const panel = document.getElementById("customThemePanel");
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
        const styles = getComputedStyle(document.body);
        document.getElementById('color-bg').value = rgbToHex(styles.getPropertyValue('--bg-color').trim());
        document.getElementById('color-surface').value = rgbToHex(styles.getPropertyValue('--surface-color').trim());
        document.getElementById('color-text').value = rgbToHex(styles.getPropertyValue('--text-primary').trim());
        document.getElementById('color-accent').value = rgbToHex(styles.getPropertyValue('--accent-color').trim());
    }
}

function applyCustomTheme() {
    const bg = document.getElementById('color-bg').value;
    const surface = document.getElementById('color-surface').value;
    const text = document.getElementById('color-text').value;
    const accent = document.getElementById('color-accent').value;

    const root = document.documentElement;
    root.style.setProperty('--bg-color', bg);
    root.style.setProperty('--surface-color', surface);
    root.style.setProperty('--text-primary', text);
    root.style.setProperty('--accent-color', accent);
}

function saveCustomTheme() {
    const themeData = {
        bg: document.getElementById('color-bg').value,
        surface: document.getElementById('color-surface').value,
        text: document.getElementById('color-text').value,
        accent: document.getElementById('color-accent').value
    };
    localStorage.setItem('calendar-custom-theme', JSON.stringify(themeData));
    setTheme('custom');
}

function loadCustomTheme() {
    const saved = localStorage.getItem('calendar-custom-theme');
    if (saved) {
        const themeData = JSON.parse(saved);
        const root = document.documentElement;
        root.style.setProperty('--bg-color', themeData.bg);
        root.style.setProperty('--surface-color', themeData.surface);
        root.style.setProperty('--text-primary', themeData.text);
        root.style.setProperty('--accent-color', themeData.accent);
    }
}

function toggleCustomSize() {
    const panel = document.getElementById("customSizePanel");
    panel.classList.toggle("active");
}

function applyCustomSize() {
    const width = document.getElementById('size-width').value;
    const scale = document.getElementById('size-scale').value;
    const root = document.documentElement;
    root.style.setProperty('--cal-width', width + 'px');
    root.style.setProperty('--cal-scale', scale);
    localStorage.setItem('calendar-custom-size', JSON.stringify({ width, scale }));
}

function loadCustomSize() {
    const saved = localStorage.getItem('calendar-custom-size');
    if (saved) {
        const { width, scale } = JSON.parse(saved);
        const root = document.documentElement;
        root.style.setProperty('--cal-width', width + 'px');
        root.style.setProperty('--cal-scale', scale);
        document.getElementById('size-width').value = width;
        document.getElementById('size-scale').value = scale;
    }
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#000000';
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function toggleJumpOverlay() {
    if (jumpOverlay.classList.contains('active')) {
        closeJumpOverlay();
    } else {
        openJumpOverlay();
    }
}

function updateFabFocus() {
    const options = document.querySelectorAll('.fab-options .fab-btn, .fab-options .size-fab, .fab-options .theme-fab');
    // Simplified for this version
}

// Keydown Global Listener
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === "Escape") {
        if (jumpOverlay.classList.contains("active")) {
            closeJumpOverlay();
            return;
        }
        if (document.getElementById("customThemePanel").classList.contains("active")) {
            document.getElementById("customThemePanel").classList.remove("active");
            return;
        }
        if (document.getElementById("customSizePanel").classList.contains("active")) {
            document.getElementById("customSizePanel").classList.remove("active");
            return;
        }
        if (themeMenu.classList.contains("active")) {
            themeMenu.classList.remove("active");
            return;
        }
        if (sizeMenu.classList.contains("active")) {
            sizeMenu.classList.remove("active");
            return;
        }
        if (fabGroup.classList.contains("active")) {
            toggleMainFab();
            return;
        }
    }
    
    // Theme Menu Navigation
    if (themeMenu.classList.contains("active")) {
        const options = document.querySelectorAll('.theme-opt');
        if (key === "ArrowDown") {
            e.preventDefault();
            focusedThemeIndex = (focusedThemeIndex + 1) % options.length;
            updateThemeMenuFocus();
        } else if (key === "ArrowUp") {
            e.preventDefault();
            focusedThemeIndex = (focusedThemeIndex - 1 + options.length) % options.length;
            updateThemeMenuFocus();
        } else if (key === "Enter" && focusedThemeIndex !== -1) {
            e.preventDefault();
            options[focusedThemeIndex].click();
        }
    }
    
    // Size Menu Navigation
    if (sizeMenu.classList.contains("active")) {
        const options = document.querySelectorAll('.size-opt');
        if (key === "ArrowDown") {
            e.preventDefault();
            focusedSizeIndex = (focusedSizeIndex + 1) % options.length;
            updateSizeMenuFocus();
        } else if (key === "ArrowUp") {
            e.preventDefault();
            focusedSizeIndex = (focusedSizeIndex - 1 + options.length) % options.length;
            updateSizeMenuFocus();
        } else if (key === "Enter" && focusedSizeIndex !== -1) {
            e.preventDefault();
            options[focusedSizeIndex].click();
        }
    }
});

// Click Outside to Close
document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-fab-container")) {
        themeMenu.classList.remove("active");
        const customPanel = document.getElementById("customThemePanel");
        if (customPanel) customPanel.classList.remove("active");
    }
    if (!e.target.closest(".size-fab-container")) {
        sizeMenu.classList.remove("active");
        const customSizePanel = document.getElementById("customSizePanel");
        if (customSizePanel) customSizePanel.classList.remove("active");
    }
    if (!e.target.closest("#fabGroup")) {
        if (fabGroup.classList.contains("active")) toggleMainFab();
    }
});

// Original Calendar Logic
const monthYearDisplay = document.getElementById('current-month');
const calendarGrid = document.getElementById('calendar-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const jumpOverlay = document.getElementById('jump-overlay');
const monthPicker = document.getElementById('month-picker');
const yearPicker = document.getElementById('year-picker');
const closeJump = document.getElementById('close-jump');
const applyJump = document.getElementById('apply-jump');
const todayJump = document.getElementById('today-jump');
const monthYearWrapper = document.querySelector('.month-year-wrapper');

let currentDate = new Date();
let tempSelectedMonth = currentDate.getMonth();
let tempSelectedYear = currentDate.getFullYear();

// Load Saved State
const savedTheme = localStorage.getItem('calendar-theme') || 'dark';
const savedSize = localStorage.getItem('calendar-size') || 'medium';
setTheme(savedTheme, true);
setSize(savedSize, true);

// Events state persistence
let calendarEvents = JSON.parse(localStorage.getItem('calendar-events')) || {};

function saveEvents() {
    localStorage.setItem('calendar-events', JSON.stringify(calendarEvents));
}

const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    const dayNameHTML = dayNames.map(day => `<div class="day-name">${day}</div>`).join('');
    calendarGrid.innerHTML = dayNameHTML;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let x = adjustedFirstDay; x > 0; x--) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day', 'other-month');
        const prevMonthDate = new Date(year, month - 1, daysInPrevMonth - x + 1);
        const dayKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}-${prevMonthDate.getDate()}`;
        dayDiv.textContent = daysInPrevMonth - x + 1;
        if (calendarEvents[dayKey]) dayDiv.classList.add('has-event');
        dayDiv.addEventListener('click', () => toggleEvent(dayKey, dayDiv));
        calendarGrid.appendChild(dayDiv);
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = i;
        const dayKey = `${year}-${month}-${i}`;
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');
        if (calendarEvents[dayKey]) dayDiv.classList.add('has-event');
        dayDiv.addEventListener('click', () => toggleEvent(dayKey, dayDiv));
        calendarGrid.appendChild(dayDiv);
    }
    const totalSlots = 42; 
    const totalRendered = adjustedFirstDay + daysInCurrentMonth;
    const remainingSlots = totalSlots - totalRendered;
    for (let i = 1; i <= remainingSlots; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day', 'other-month');
        const nextMonthDate = new Date(year, month + 1, i);
        const dayKey = `${nextMonthDate.getFullYear()}-${nextMonthDate.getMonth()}-${nextMonthDate.getDate()}`;
        dayDiv.textContent = i;
        if (calendarEvents[dayKey]) dayDiv.classList.add('has-event');
        dayDiv.addEventListener('click', () => toggleEvent(dayKey, dayDiv));
        calendarGrid.appendChild(dayDiv);
    }
}

function toggleEvent(dateKey, element) {
    if (calendarEvents[dateKey]) {
        delete calendarEvents[dateKey];
        element.classList.remove('has-event');
    } else {
        calendarEvents[dateKey] = true;
        element.classList.add('has-event');
    }
    saveEvents();
}

function populateSelectors() {
    monthPicker.innerHTML = monthNames.map((month, index) => `<div class="month-item ${index === tempSelectedMonth ? 'selected' : ''}" data-month="${index}">${month.substring(0, 3)}</div>`).join('');
    const currentYear = new Date().getFullYear();
    let yearHTML = '';
    for (let i = currentYear - 20; i <= currentYear + 20; i++) yearHTML += `<div class="year-item ${i === tempSelectedYear ? 'selected' : ''}" data-year="${i}">${i}</div>`;
    yearPicker.innerHTML = yearHTML;
    document.querySelectorAll('.month-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.month-item').forEach(m => m.classList.remove('selected'));
            item.classList.add('selected');
            tempSelectedMonth = parseInt(item.dataset.month);
        });
    });
    document.querySelectorAll('.year-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.year-item').forEach(y => y.classList.remove('selected'));
            item.classList.add('selected');
            tempSelectedYear = parseInt(item.dataset.year);
        });
    });
}

function openJumpOverlay() {
    tempSelectedMonth = currentDate.getMonth();
    tempSelectedYear = currentDate.getFullYear();
    populateSelectors();
    jumpOverlay.classList.add('active');
    setTimeout(() => {
        const selectedYearEl = yearPicker.querySelector('.year-item.selected');
        if (selectedYearEl) selectedYearEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 100);
}

function closeJumpOverlay() {
    jumpOverlay.classList.remove('active');
}

const animateCalendar = (direction) => {
    if (direction === 'fade') {
        calendarGrid.style.opacity = '0';
        monthYearDisplay.style.opacity = '0';
        setTimeout(() => {
            renderCalendar();
            calendarGrid.style.opacity = '1';
            monthYearDisplay.style.opacity = '1';
        }, 200);
        return;
    }
    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
    calendarGrid.classList.add(outClass);
    monthYearDisplay.classList.add(outClass);
    setTimeout(() => {
        if (direction === 'next') currentDate.setMonth(currentDate.getMonth() + 1);
        else currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        calendarGrid.classList.remove(outClass);
        monthYearDisplay.classList.remove(outClass);
        calendarGrid.classList.add(inClass);
        monthYearDisplay.classList.add(inClass);
        void calendarGrid.offsetWidth;
        calendarGrid.classList.remove(inClass);
        monthYearDisplay.classList.remove(inClass);
    }, 250);
};

prevBtn.addEventListener('click', () => animateCalendar('prev'));
nextBtn.addEventListener('click', () => animateCalendar('next'));
monthYearWrapper.addEventListener('click', openJumpOverlay);
closeJump.addEventListener('click', closeJumpOverlay);
applyJump.addEventListener('click', () => {
    currentDate.setDate(1);
    currentDate.setMonth(tempSelectedMonth);
    currentDate.setFullYear(tempSelectedYear);
    animateCalendar('fade');
    closeJumpOverlay();
});
todayJump.addEventListener('click', () => {
    currentDate = new Date();
    animateCalendar('fade');
    closeJumpOverlay();
});

populateSelectors();
renderCalendar();

// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
    if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) cursorGlow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');
document.addEventListener('mouseenter', () => cursorGlow.style.opacity = '1');
