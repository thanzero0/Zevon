const stressBtn = document.getElementById('stress-btn');
const stressCountEl = document.getElementById('stress-count');
const glow = document.getElementById('cursor-glow');
const buttonWrapper = document.querySelector('.button-wrapper');

let count = parseInt(localStorage.getItem('stress_relieved_count')) || 0;
stressCountEl.textContent = count;

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// Particle Effect
function createParticles(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const destinationX = (Math.random() - 0.5) * 200;
        const destinationY = (Math.random() - 0.5) * 200;
        
        particle.style.left = `50%`;
        particle.style.top = `50%`;
        
        buttonWrapper.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// Click Logic
stressBtn.addEventListener('mousedown', () => {
    count++;
    stressCountEl.textContent = count;
    localStorage.setItem('stress_relieved_count', count);
    createParticles();
    
    // Haptic feedback if available
    if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        stressBtn.classList.add('active');
        stressBtn.dispatchEvent(new Event('mousedown'));
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        stressBtn.classList.remove('active');
    }
});
