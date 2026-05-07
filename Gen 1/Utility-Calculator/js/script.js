const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let currentExpression = "";
let history = JSON.parse(localStorage.getItem('calculator-history')) || [];
let lastResult = 0;
let isDeg = true;
let isInv = false;

function handleInput(value, id) {
    // Visual feedback for keyboard
    if (id === null) {
        const btn = Array.from(document.querySelectorAll('button')).find(b => {
            const val = b.dataset.value;
            return val === value ||
                (value === "Enter" && val === "Enter") ||
                (value === "=" && val === "Enter") ||
                (value.toLowerCase() === "c" && val === "c");
        });
        if (btn) {
            btn.classList.add('active-kb');
            setTimeout(() => btn.classList.remove('active-kb'), 100);
        }
    }

    if (id === "clear" || value === "Escape" || value.toLowerCase() === "c") {
        currentExpression = "";
        display.value = "";
        return;
    }

    if (id === "equal" || value === "Enter" || value === "=") {
        if (currentExpression === "") return;
        calculateResult();
        return;
    }

    if (value === "Backspace") {
        currentExpression = currentExpression.toString().slice(0, -1);
        display.value = currentExpression;
        return;
    }

    // Handle Scientific Functions
    const scientificMapping = {
        'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
        'asin': 'asin(', 'acos': 'acos(', 'atan': 'atan(',
        'log': 'log(', 'ln': 'ln(', 'sqrt': 'sqrt(',
        'pow': '^', 'pi': 'π', 'e': 'e'
    };

    if (scientificMapping[value]) {
        currentExpression += scientificMapping[value];
        display.value = currentExpression;
        return;
    }

    // Standard buttons and keyboard
    const operators = ["+", "-", "*", "/", "**", ".", "%"];
    if (!isNaN(value) || value === "(" || value === ")") {
        currentExpression += value;
        display.value = currentExpression;
    } else if (value === "ans") {
        currentExpression += lastResult;
        display.value = currentExpression;
    } else if (value === "exp") {
        currentExpression += "*10^(";
        display.value = currentExpression;
    } else if (value === "!") {
        currentExpression += "!";
        display.value = currentExpression;
    } else if (operators.includes(value)) {
        const lastChar = currentExpression.toString().slice(-1);
        if (operators.includes(lastChar) && currentExpression.length > 0) {
            // Replace last operator with the new one
            currentExpression = currentExpression.toString().slice(0, -1) + value;
        } else if (currentExpression.length > 0 || value === "-") {
            // Allow minus at the beginning for negative numbers, otherwise prevent starting with operator
            currentExpression += value;
        }
        display.value = currentExpression;
    }
}

function calculateResult() {
    try {
        let expressionToEval = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(');

        // Handle Factorial
        expressionToEval = expressionToEval.replace(/(\d+)!/g, (match, n) => factorial(parseInt(n)));

        // Handle Trig Functions with Deg/Rad
        const trigRegex = /(asin|acos|atan|sin|cos|tan)\(/g;
        expressionToEval = expressionToEval.replace(trigRegex, (match, func) => {
            if (isDeg && !func.startsWith('a')) {
                return `Math.${func}((Math.PI/180)*`;
            }
            if (isDeg && func.startsWith('a')) {
                return `(180/Math.PI)*Math.${func}(`;
            }
            return `Math.${func}(`;
        });

        const result = eval(expressionToEval);

        if (result !== undefined && !isNaN(result)) {
            if (!isFinite(result)) {
                throw new Error("Division by zero");
            }
            const historyItem = {
                expr: currentExpression,
                res: result
            };
            addToHistory(historyItem);

            lastResult = result;
            document.getElementById("ans-display").innerText = `Ans = ${result}`;
            currentExpression = result.toString();
            display.value = currentExpression;
        }
    } catch (error) {
        display.value = "Error";
        setTimeout(() => {
            display.value = currentExpression;
        }, 1500);
    }
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function toggleDegRad() {
    isDeg = !isDeg;
    const btn = document.querySelector(".deg-rad");
    btn.innerText = isDeg ? "Deg" : "Rad";
}

function toggleInv() {
    isInv = !isInv;
    const btn = document.querySelector(".inv-btn");
    btn.classList.toggle("status-active", isInv);
    
    const trigs = document.querySelectorAll(".trig");
    trigs.forEach(t => {
        const base = t.dataset.value;
        if (isInv) {
            t.innerText = base === "sin" ? "asin" : (base === "cos" ? "acos" : "atan");
            t.dataset.value = t.innerText;
        } else {
            t.innerText = base.replace('a', '');
            t.dataset.value = t.innerText;
        }
    });
}

function addToHistory(item) {
    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem('calculator-history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="loadHistory(${index})">
            <div class="history-expr">${item.expr}</div>
            <div class="history-res">= ${item.res}</div>
        </div>
    `).join('');
}

function loadHistory(index) {
    currentExpression = history[index].res.toString();
    display.value = currentExpression;
    toggleHistory();
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calculator-history');
    renderHistory();
}

const fabGroup = document.getElementById("fabGroup");
let focusedFabIndex = -1;

function toggleMainFab() {
    const btn = document.querySelector(".main-fab");
    fabGroup.classList.toggle("active");
    btn.classList.toggle("status-active", fabGroup.classList.contains("active"));

    if (fabGroup.classList.contains("active")) {
        focusedFabIndex = -1;
        updateFabFocus();
    }
}

function updateFabFocus() {
    const options = Array.from(document.querySelectorAll('.fab-options .fab-btn'));
    const mainFab = document.querySelector('.main-fab');
    const allBtns = [mainFab, ...options];

    allBtns.forEach((btn, index) => {
        btn.classList.toggle('focus', index === focusedFabIndex);
    });
}

function toggleHistory() {
    const panel = document.getElementById("historyPanel");
    const overlay = document.getElementById("historyOverlay");
    const btn = document.querySelector(".history-fab");
    
    panel.classList.toggle("active");
    overlay.classList.toggle("active");
    btn.classList.toggle("status-active", panel.classList.contains("active"));
}

function toggleScientific() {
    const calc = document.querySelector(".calculator");
    const btn = document.querySelector(".scientific-fab");
    calc.classList.toggle("scientific");
    btn.classList.toggle("status-active", calc.classList.contains("scientific"));
}

const themeMenu = document.getElementById("themeMenu");
const sizeMenu = document.getElementById("sizeMenu");
let focusedThemeIndex = -1;
let focusedSizeIndex = -1;

function toggleSizeMenu() {
    const customPanel = document.getElementById("customSizePanel");
    sizeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");

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

function setSize(size, isInitial = false) {
    const root = document.documentElement;
    const presets = {
        'mini': { width: '280px', scale: '0.9' },
        'medium': { width: '340px', scale: '1' },
        'large': { width: '400px', scale: '1.05' },
        'desktop': { width: '480px', scale: '1.1' }
    };

    if (size === 'custom') {
        loadCustomSize();
    } else if (presets[size]) {
        root.style.setProperty('--calc-width', presets[size].width);
        root.style.setProperty('--calc-scale', presets[size].scale);
        if (document.getElementById('customSizePanel')) 
            document.getElementById('customSizePanel').classList.remove('active');
    }

    document.querySelectorAll('.size-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === size) btn.classList.add('active');
        if (size === 'custom' && btn.id === 'customSizeOpt') btn.classList.add('active');
    });

    if (!isInitial) sizeMenu.classList.remove("active");
    localStorage.setItem('calculator-size', size);
}

function toggleCustomSize() {
    const panel = document.getElementById("customSizePanel");
    panel.classList.toggle("active");
}

function applyCustomSize() {
    const width = document.getElementById('size-width').value;
    const scale = document.getElementById('size-scale').value;
    const root = document.documentElement;
    root.style.setProperty('--calc-width', width + 'px');
    root.style.setProperty('--calc-scale', scale);
    localStorage.setItem('calculator-custom-size', JSON.stringify({ width, scale }));
}

function loadCustomSize() {
    const saved = localStorage.getItem('calculator-custom-size');
    if (saved) {
        const { width, scale } = JSON.parse(saved);
        const root = document.documentElement;
        root.style.setProperty('--calc-width', width + 'px');
        root.style.setProperty('--calc-scale', scale);
        document.getElementById('size-width').value = width;
        document.getElementById('size-scale').value = scale;
    }
}


function toggleThemeMenu() {
    const customPanel = document.getElementById("customThemePanel");
    themeMenu.classList.toggle("active");

    // Always close custom panel when toggling theme menu for a fresh start
    if (customPanel) customPanel.classList.remove("active");

    if (themeMenu.classList.contains("active")) {
        // Start focus from the currently active theme
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

function setTheme(theme, isInitial = false) {
    const customPanel = document.getElementById("customThemePanel");

    if (theme === 'custom') {
        document.body.className = '';
        document.body.classList.add('custom-theme');
        loadCustomTheme();
        // Toggle editor only if it's not the initial load
        if (customPanel && !isInitial) customPanel.classList.toggle('active');
    } else {
        document.body.className = '';
        document.body.style = ''; // Clear custom styles
        if (theme !== 'dark') {
            document.body.classList.add(theme + '-theme');
        }
        if (customPanel) customPanel.classList.remove('active');
        // Close menu for preset themes (unless it's initial load)
        if (!isInitial) {
            themeMenu.classList.remove("active");
            focusedThemeIndex = -1;
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

    localStorage.setItem('calculator-theme', theme);
}

function toggleCustomEditor() {
    const panel = document.getElementById("customThemePanel");
    panel.classList.toggle("active");
}

function applyCustomTheme() {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--calc-bg': document.getElementById('color-calc').value,
        '--display-bg': document.getElementById('color-display').value,
        '--btn-bg': document.getElementById('color-btn').value,
        '--clear-bg': document.getElementById('color-clear').value,
        '--equal-bg': document.getElementById('color-equal').value,
        '--display-text': document.getElementById('color-text').value,
        '--btn-text': document.getElementById('color-text').value
    };

    const root = document.body;
    for (const [prop, val] of Object.entries(colors)) {
        root.style.setProperty(prop, val);
    }

    // Update dependent colors
    root.style.setProperty('--btn-hover', adjustColor(colors['--btn-bg'], 20));
    root.style.setProperty('--equal-hover', adjustColor(colors['--equal-bg'], 20));
    root.style.setProperty('--clear-hover', adjustColor(colors['--clear-bg'], 20));
}

function saveCustomTheme() {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--calc-bg': document.getElementById('color-calc').value,
        '--display-bg': document.getElementById('color-display').value,
        '--btn-bg': document.getElementById('color-btn').value,
        '--clear-bg': document.getElementById('color-clear').value,
        '--equal-bg': document.getElementById('color-equal').value,
        '--display-text': document.getElementById('color-text').value,
        '--btn-text': document.getElementById('color-text').value
    };

    localStorage.setItem('calculator-custom-colors', JSON.stringify(colors));

    const btn = document.querySelector('.save-theme-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saved! ✓";
    btn.style.background = "#10b981";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
    }, 2000);
}

function loadCustomTheme() {
    const saved = localStorage.getItem('calculator-custom-colors');
    if (saved) {
        const colors = JSON.parse(saved);
        const root = document.body;
        for (const [prop, val] of Object.entries(colors)) {
            root.style.setProperty(prop, val);

            // Sync inputs
            const inputId = `color-${prop.split('-')[1]}`;
            const input = document.getElementById(inputId);
            if (input) input.value = val;
        }
    }
}

function adjustColor(hex, amt) {
    let usePound = false;
    if (hex[0] == "#") { hex = hex.slice(1); usePound = true; }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

window.addEventListener("keydown", function (e) {
    const key = e.key;

    if (key === "Escape") {
        const historyPanel = document.getElementById("historyPanel");
        const themeMenu = document.getElementById("themeMenu");
        const sizeMenu = document.getElementById("sizeMenu");
        const customPanel = document.getElementById("customThemePanel");
        const customSizePanel = document.getElementById("customSizePanel");
        
        if (historyPanel.classList.contains("active")) {
            toggleHistory();
            return;
        }
        if (customPanel && customPanel.classList.contains("active")) {
            customPanel.classList.remove("active");
            return;
        }
        if (customSizePanel && customSizePanel.classList.contains("active")) {
            customSizePanel.classList.remove("active");
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
            fabGroup.classList.remove("active");
            document.querySelector(".main-fab").classList.remove("status-active");
            focusedFabIndex = -1;
            updateFabFocus();
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
            return;
        }
        if (key === "ArrowUp") {
            e.preventDefault();
            focusedThemeIndex = (focusedThemeIndex - 1 + options.length) % options.length;
            updateThemeMenuFocus();
            return;
        }
        if (key === "Enter" && focusedThemeIndex !== -1) {
            e.preventDefault();
            options[focusedThemeIndex].click();
            return;
        }
        if (key === "Escape") {
            themeMenu.classList.remove("active");
            return;
        }
    }

    // Size Menu Navigation
    if (sizeMenu.classList.contains("active")) {
        const options = document.querySelectorAll('.size-opt');
        if (key === "ArrowDown") {
            e.preventDefault();
            focusedSizeIndex = (focusedSizeIndex + 1) % options.length;
            updateSizeMenuFocus();
            return;
        }
        if (key === "ArrowUp") {
            e.preventDefault();
            focusedSizeIndex = (focusedSizeIndex - 1 + options.length) % options.length;
            updateSizeMenuFocus();
            return;
        }
        if (key === "Enter" && focusedSizeIndex !== -1) {
            e.preventDefault();
            options[focusedSizeIndex].click();
            return;
        }
    }

    // Global Shortcuts
    if (key.toLowerCase() === "m" && !e.ctrlKey && !e.altKey) {
        toggleMainFab();
        return;
    }

    // Main FAB Menu Navigation
    if (fabGroup.classList.contains("active")) {
        const options = Array.from(document.querySelectorAll('.fab-options .fab-btn'));
        const mainFab = document.querySelector('.main-fab');
        const allBtns = [mainFab, ...options]; // Include M as the first element

        if (key === "ArrowRight") {
            e.preventDefault();
            focusedFabIndex = (focusedFabIndex + 1) % allBtns.length;
            updateFabFocus();
            return;
        }
        if (key === "ArrowLeft") {
            e.preventDefault();
            focusedFabIndex = (focusedFabIndex - 1 + allBtns.length) % allBtns.length;
            updateFabFocus();
            return;
        }
        if (key === "Enter" && focusedFabIndex !== -1) {
            e.preventDefault();
            allBtns[focusedFabIndex].click();
            return;
        }
    }

    const allowedKeys = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".",
        "+", "-", "*", "/", "(", ")", "^",
        "Enter", "=", "Backspace", "Escape", "c", "C"
    ];

    if (allowedKeys.includes(key)) {
        if (key === "/" || key === "(" || key === ")") e.preventDefault();
        // Prevent enter from clicking the last focused button
        if (key === "Enter") e.preventDefault();
        handleInput(key === "^" ? "**" : key, null);
    }
});

buttons.addEventListener("click", function (e) {
    const button = e.target;
    if (button.tagName !== "BUTTON") return;

    // Prevent button focus to fix Enter key double input
    button.blur();

    handleInput(button.dataset.value || button.innerText, button.id);
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-fab-container")) {
        themeMenu.classList.remove("active");
        const customPanel = document.getElementById("customThemePanel");
        if (customPanel) customPanel.classList.remove("active");
    }
    if (!e.target.closest(".size-fab-container")) {
        if (sizeMenu) sizeMenu.classList.remove("active");
        const customSizePanel = document.getElementById("customSizePanel");
        if (customSizePanel) customSizePanel.classList.remove("active");
    }
    if (!e.target.closest("#fabGroup")) {
        document.getElementById("fabGroup").classList.remove("active");
        document.querySelector(".main-fab").classList.remove("status-active");
    }
});

// Load saved theme, size and history
const savedTheme = localStorage.getItem('calculator-theme') || 'dark';
const savedSize = localStorage.getItem('calculator-size') || 'medium';
setTheme(savedTheme, true);
setSize(savedSize, true);
renderHistory();
// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
    if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) cursorGlow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');
document.addEventListener('mouseenter', () => cursorGlow.style.opacity = '1');