let timeLeft = 1500; // 25 minutes default
let timerId = null;
let isPaused = true;
let currentModeTime = 1500;

const display = document.getElementById('display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

function updateDisplay(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.title = `${display.textContent} - Pomodoro`;
}

function startTimer() {
    if (isPaused) {
        // Start/Resume
        isPaused = false;
        startBtn.textContent = 'Pause';
        startBtn.classList.add('primary');
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                isPaused = true;
                startBtn.textContent = 'Start';
                alert('Time is up!');
                reset();
            }
        }, 1000);
    } else {
        // Pause
        isPaused = true;
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = 'Resume';
    }
}

function reset() {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    timeLeft = currentModeTime;
    updateDisplay(timeLeft);
    startBtn.textContent = 'Start';
    startBtn.classList.add('primary');
}

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Switch modes
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentModeTime = parseInt(btn.dataset.time);
        reset();
    });
});

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', reset);

// Initial display
updateDisplay(timeLeft);

// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
    if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) cursorGlow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');
document.addEventListener('mouseenter', () => cursorGlow.style.opacity = '1');

// FAB and Menus Logic
const fabGroup = document.getElementById("fabGroup");
const themeMenu = document.getElementById("themeMenu");
const sizeMenu = document.getElementById("sizeMenu");

function toggleMainFab() {
    const btn = document.querySelector(".main-fab");
    fabGroup.classList.toggle("active");
    btn.classList.toggle("status-active", fabGroup.classList.contains("active"));
}

function toggleSizeMenu() {
    const customPanel = document.getElementById("customSizePanel");
    sizeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
}

function setSize(size, isInitial = false) {
    const root = document.documentElement;
    const presets = {
        'small': '0.8',
        'medium': '1',
        'large': '1.2'
    };

    if (size === 'custom') {
        loadCustomSize();
    } else if (presets[size]) {
        root.style.setProperty('--pomodoro-scale', presets[size]);
        if (document.getElementById('customSizePanel')) 
            document.getElementById('customSizePanel').classList.remove('active');
    }

    document.querySelectorAll('.size-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === size) btn.classList.add('active');
        if (size === 'custom' && btn.id === 'customSizeOpt') btn.classList.add('active');
    });

    if (!isInitial) sizeMenu.classList.remove("active");
    localStorage.setItem('pomodoro-size', size);
}

function toggleCustomSize() {
    const panel = document.getElementById("customSizePanel");
    panel.classList.toggle("active");
}

function applyCustomSize() {
    const scale = document.getElementById('size-scale').value;
    const root = document.documentElement;
    root.style.setProperty('--pomodoro-scale', scale);
    localStorage.setItem('pomodoro-custom-size', JSON.stringify({ scale }));
}

function loadCustomSize() {
    const saved = localStorage.getItem('pomodoro-custom-size');
    if (saved) {
        const { scale } = JSON.parse(saved);
        const root = document.documentElement;
        root.style.setProperty('--pomodoro-scale', scale);
        const scaleInput = document.getElementById('size-scale');
        if(scaleInput) scaleInput.value = scale;
    }
}

function toggleThemeMenu() {
    const customPanel = document.getElementById("customThemePanel");
    themeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
}

function setTheme(theme, isInitial = false) {
    const customPanel = document.getElementById("customThemePanel");

    if (theme === 'custom') {
        document.body.className = '';
        document.body.classList.add('custom-theme');
        loadCustomTheme();
        if (customPanel && !isInitial) customPanel.classList.toggle('active');
    } else {
        document.body.className = '';
        document.body.style = ''; // Clear custom styles
        if (theme !== 'dark') {
            document.body.classList.add(theme + '-theme');
        }
        if (customPanel) customPanel.classList.remove('active');
        if (!isInitial) {
            themeMenu.classList.remove("active");
        }
    }

    document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.classList.remove('active');
        const text = btn.innerText.toLowerCase();
        if (text === theme || (theme === 'cyberpunk' && text === 'cyber')) {
            btn.classList.add('active');
        } else if (theme === 'custom' && btn.id === 'customThemeOpt') {
            btn.classList.add('active');
        }
    });

    localStorage.setItem('pomodoro-theme', theme);
}

function toggleCustomEditor() {
    const panel = document.getElementById("customThemePanel");
    panel.classList.toggle("active");
}

function applyCustomTheme() {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--surface-color': document.getElementById('color-surface').value,
        '--text-color': document.getElementById('color-text').value,
        '--accent-color': document.getElementById('color-accent').value,
        '--cursor-color': document.getElementById('color-accent').value
    };

    const root = document.body;
    for (const [prop, val] of Object.entries(colors)) {
        root.style.setProperty(prop, val);
    }
}

function saveCustomTheme() {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--surface-color': document.getElementById('color-surface').value,
        '--text-color': document.getElementById('color-text').value,
        '--accent-color': document.getElementById('color-accent').value,
        '--cursor-color': document.getElementById('color-accent').value
    };

    localStorage.setItem('pomodoro-custom-colors', JSON.stringify(colors));

    const btn = document.querySelector('.save-theme-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saved! ✓";
    setTimeout(() => {
        btn.innerText = originalText;
    }, 2000);
}

function loadCustomTheme() {
    const saved = localStorage.getItem('pomodoro-custom-colors');
    if (saved) {
        const colors = JSON.parse(saved);
        const root = document.body;
        for (const [prop, val] of Object.entries(colors)) {
            root.style.setProperty(prop, val);

            const inputId = `color-${prop.split('-')[1]}`;
            const input = document.getElementById(inputId);
            if (input) input.value = val;
        }
    }
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-fab-container")) {
        if(themeMenu) themeMenu.classList.remove("active");
        const customPanel = document.getElementById("customThemePanel");
        if (customPanel) customPanel.classList.remove("active");
    }
    if (!e.target.closest(".size-fab-container")) {
        if (sizeMenu) sizeMenu.classList.remove("active");
        const customSizePanel = document.getElementById("customSizePanel");
        if (customSizePanel) customSizePanel.classList.remove("active");
    }
    if (!e.target.closest("#fabGroup")) {
        const group = document.getElementById("fabGroup");
        const main = document.querySelector(".main-fab");
        if(group) group.classList.remove("active");
        if(main) main.classList.remove("status-active");
    }
});

// Load saved theme and size
const savedTheme = localStorage.getItem('pomodoro-theme') || 'dark';
const savedSize = localStorage.getItem('pomodoro-size') || 'medium';
setTheme(savedTheme, true);
setSize(savedSize, true);
