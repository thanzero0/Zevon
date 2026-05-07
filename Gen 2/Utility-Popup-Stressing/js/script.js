const wrapGrid = document.getElementById('wrap-grid');
const resetBtn = document.getElementById('reset-btn');
const glow = document.getElementById('cursor-glow');

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

function createWrap() {
    wrapGrid.innerHTML = '';
    const bubbleCount = 48; // Grid size
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        bubble.addEventListener('mousedown', () => {
            if (!bubble.classList.contains('popped')) {
                popBubble(bubble);
            }
        });
        
        wrapGrid.appendChild(bubble);
    }
}

function popBubble(el) {
    el.classList.add('popped');
    
    // Particle effect
    const rect = el.getBoundingClientRect();
    createParticles(rect.left + rect.width/2, rect.top + rect.height/2);
    
    // Haptic
    if (window.navigator.vibrate) {
        window.navigator.vibrate(5);
    }
}

function createParticles(x, y) {
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 30;
        
        const anim = p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ], {
            duration: 400,
            easing: 'ease-out'
        });
        
        anim.onfinish = () => p.remove();
    }
}

resetBtn.addEventListener('click', createWrap);

// Init
createWrap();
