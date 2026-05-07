// --- FAB & Theme/Size Logic ---
const fabGroup = document.getElementById("fabGroup");
const themeMenu = document.getElementById("themeMenu");
const sizeMenu = document.getElementById("sizeMenu");
const settingsPanel = document.getElementById('settings-panel');
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
        settingsPanel.classList.add("hidden");
        document.getElementById("customThemePanel").classList.remove("active");
        document.getElementById("customSizePanel").classList.remove("active");
        focusedFabIndex = -1;
    }
}

function toggleThemeMenu() {
    const customPanel = document.getElementById("customThemePanel");
    themeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
    sizeMenu.classList.remove("active");
    settingsPanel.classList.add("hidden");
    document.getElementById("customSizePanel").classList.remove("active");
}

function toggleSizeMenu() {
    const customPanel = document.getElementById("customSizePanel");
    sizeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
    themeMenu.classList.remove("active");
    settingsPanel.classList.add("hidden");
    document.getElementById("customThemePanel").classList.remove("active");
}

function toggleSettings() {
    settingsPanel.classList.toggle("hidden");
    themeMenu.classList.remove("active");
    sizeMenu.classList.remove("active");
}

function setTheme(theme, isInitial = false) {
    const body = document.body;
    body.className = ''; // Reset
    if (theme !== 'custom') {
        body.classList.add(`${theme}-theme`);
        if (document.getElementById('customThemePanel')) 
            document.getElementById('customThemePanel').classList.remove('active');
    } else {
        loadCustomTheme();
    }

    document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === theme) btn.classList.add('active');
        if (theme === 'custom' && btn.id === 'customThemeOpt') btn.classList.add('active');
    });

    if (!isInitial) themeMenu.classList.remove("active");
    localStorage.setItem('clock-theme', theme);
}

function setSize(size, isInitial = false) {
    const root = document.documentElement;
    const presets = {
        'small': { width: '300px', scale: '0.8' },
        'medium': { width: '450px', scale: '1' },
        'large': { width: '600px', scale: '1.5' }
    };

    if (size === 'custom') {
        loadCustomSize();
    } else if (presets[size]) {
        root.style.setProperty('--clock-scale', presets[size].scale);
        if (document.getElementById('customSizePanel')) 
            document.getElementById('customSizePanel').classList.remove('active');
    }

    document.querySelectorAll('.size-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === size) btn.classList.add('active');
        if (size === 'custom' && btn.id === 'customSizeOpt') btn.classList.add('active');
    });

    if (!isInitial) sizeMenu.classList.remove("active");
    localStorage.setItem('clock-size', size);
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
    localStorage.setItem('clock-custom-theme', JSON.stringify(themeData));
    setTheme('custom');
}

function loadCustomTheme() {
    const saved = localStorage.getItem('clock-custom-theme');
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
    document.getElementById("customSizePanel").classList.toggle("active");
}

function applyCustomSize() {
    const scale = document.getElementById('size-scale').value;
    document.documentElement.style.setProperty('--clock-scale', scale);
    localStorage.setItem('clock-custom-size', JSON.stringify({ scale }));
}

function loadCustomSize() {
    const saved = localStorage.getItem('clock-custom-size');
    if (saved) {
        const { scale } = JSON.parse(saved);
        document.documentElement.style.setProperty('--clock-scale', scale);
        document.getElementById('size-scale').value = scale;
    }
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#000000';
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Global Keydown
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        settingsPanel.classList.add("hidden");
        document.getElementById("customThemePanel").classList.remove("active");
        document.getElementById("customSizePanel").classList.remove("active");
        themeMenu.classList.remove("active");
        sizeMenu.classList.remove("active");
        if (fabGroup.classList.contains("active")) toggleMainFab();
    }
});

// Click Outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-fab-container")) themeMenu.classList.remove("active");
    if (!e.target.closest(".size-fab-container")) sizeMenu.classList.remove("active");
    if (!e.target.closest("#fabGroup") && !e.target.closest("#settings-panel")) {
        if (fabGroup.classList.contains("active")) toggleMainFab();
    }
});

// --- Clock Logic ---
let showDate = true;
let use24h = true;
let precision = 'hms';

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    if (!use24h) { hours = hours % 12; hours = hours ? hours : 12; }
    const h = String(hours).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    let timeString = h;
    if (precision === 'hm' || precision === 'hms') timeString += `:${m}`;
    if (precision === 'hms') timeString += `:${s}`;
    if (!use24h) timeString += ` <span style="font-size: 0.4em; opacity: 0.5; font-family: 'Inter'">${ampm}</span>`;
    document.getElementById('time').innerHTML = timeString;
    document.title = `${h}:${m}${precision === 'hms' ? `:${s}` : ''}${!use24h ? ` ${ampm}` : ''} - Clock`;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options).toUpperCase();
}

// Settings Logic
const dateSwitch = document.getElementById('toggle-date-btn');
const formatSwitch = document.getElementById('toggle-24h-btn');
const precisionBtns = document.querySelectorAll('#precision-group .segment');

dateSwitch.addEventListener('click', () => {
    showDate = !showDate;
    dateSwitch.classList.toggle('active', showDate);
    document.getElementById('date').classList.toggle('hidden', !showDate);
});

formatSwitch.addEventListener('click', () => {
    use24h = !use24h;
    formatSwitch.classList.toggle('active', use24h);
    updateClock();
});

precisionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        precision = btn.dataset.value;
        precisionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateClock();
    });
});

// Initialization
const savedTheme = localStorage.getItem('clock-theme') || 'dark';
const savedSize = localStorage.getItem('clock-size') || 'medium';
setTheme(savedTheme, true);
setSize(savedSize, true);
setInterval(updateClock, 100);
updateClock();

// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
        if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) cursorGlow.style.opacity = '1';
    }
});
document.addEventListener('mouseleave', () => { if(cursorGlow) cursorGlow.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { if(cursorGlow) cursorGlow.style.opacity = '1'; });
