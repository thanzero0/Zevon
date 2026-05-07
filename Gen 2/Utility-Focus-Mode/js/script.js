const appContainer = document.getElementById('app-container');
const startBtn = document.getElementById('start-focus');
const exitBtn = document.getElementById('exit-btn');
const timerDisplay = document.getElementById('timer-display');
const exitProgress = document.getElementById('exit-progress');
const timeOpts = document.querySelectorAll('.time-opt');
const glow = document.getElementById('cursor-glow');

let focusTime = 25; // Default minutes
let timeLeft = 0;
let timerInterval = null;
let exitTimer = null;
let exitStart = 0;
const EXIT_HOLD_TIME = 2000; // 2 seconds to exit

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// Select Time
timeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
        timeOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        focusTime = parseInt(opt.dataset.mins);
    });
});

// Start Focus
startBtn.addEventListener('click', () => {
    appContainer.classList.add('focusing');
    timeLeft = focusTime * 60;
    updateDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishFocus();
        }
    }, 1000);

    // Request fullscreen if possible
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
});

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function finishFocus() {
    alert('Sesi Fokus Selesai!');
    exitFocus();
}

function exitFocus() {
    appContainer.classList.remove('focusing');
    clearInterval(timerInterval);
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    exitProgress.style.width = '0%';
}

// Exit Hold Logic
function startExitHold() {
    exitStart = Date.now();
    exitTimer = setInterval(() => {
        const elapsed = Date.now() - exitStart;
        const progress = Math.min((elapsed / EXIT_HOLD_TIME) * 100, 100);
        exitProgress.style.width = `${progress}%`;
        
        if (elapsed >= EXIT_HOLD_TIME) {
            clearInterval(exitTimer);
            exitFocus();
        }
    }, 50);
}

function stopExitHold() {
    clearInterval(exitTimer);
    exitProgress.style.width = '0%';
}

exitBtn.addEventListener('mousedown', startExitHold);
exitBtn.addEventListener('mouseup', stopExitHold);
exitBtn.addEventListener('mouseleave', stopExitHold);

// Touch support
exitBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startExitHold();
});
exitBtn.addEventListener('touchend', stopExitHold);
