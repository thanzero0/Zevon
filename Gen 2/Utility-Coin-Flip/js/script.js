const coin = document.getElementById('coin');
const flipBtn = document.getElementById('flip-btn');
const optionA = document.getElementById('option-a');
const optionB = document.getElementById('option-b');
const sideAText = document.getElementById('side-a-text');
const sideBText = document.getElementById('side-b-text');
const resultText = document.getElementById('result-text');
const glow = document.getElementById('cursor-glow');

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

let isFlipping = false;

flipBtn.addEventListener('click', () => {
    if (isFlipping) return;

    const valA = optionA.value.trim() || 'YES';
    const valB = optionB.value.trim() || 'NO';

    sideAText.textContent = valA;
    sideBText.textContent = valB;

    isFlipping = true;
    resultText.textContent = 'Memutar...';

    // Randomize rotation
    const spins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const outcome = Math.random() < 0.5 ? 0 : 180; // 0 for heads, 180 for tails
    const totalRotation = spins * 360 + outcome;

    coin.style.transform = `rotateY(${totalRotation}deg)`;

    setTimeout(() => {
        isFlipping = false;
        const result = outcome === 0 ? valA : valB;
        resultText.innerHTML = `Hasil: <strong>${result}</strong>`;
        
        // Reset rotation after a delay to allow next flip to feel fresh
        // but keep it subtle so it doesn't snap
    }, 3000);
});

// Sync side texts on input
optionA.addEventListener('input', (e) => {
    sideAText.textContent = e.target.value.trim() || 'YES';
});

optionB.addEventListener('input', (e) => {
    sideBText.textContent = e.target.value.trim() || 'NO';
});
