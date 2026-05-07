let goals = JSON.parse(localStorage.getItem('goal_tracker_goals')) || [];

const goalsGrid = document.getElementById('goals-grid');
const addGoalBtn = document.getElementById('add-goal-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const glow = document.getElementById('cursor-glow');

// Inputs
const nameInput = document.getElementById('goal-name');
const targetInput = document.getElementById('goal-target');

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// Modal
addGoalBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
modalCancel.addEventListener('click', () => modalOverlay.classList.remove('active'));

modalSave.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const target = parseFloat(targetInput.value);

    if (name && !isNaN(target)) {
        const goal = {
            id: Date.now(),
            name,
            target,
            current: 0
        };
        goals.push(goal);
        saveAndRender();
        
        // Reset
        nameInput.value = '';
        targetInput.value = '';
        modalOverlay.classList.remove('active');
    }
});

function saveAndRender() {
    localStorage.setItem('goal_tracker_goals', JSON.stringify(goals));
    renderGoals();
}

function renderGoals() {
    goalsGrid.innerHTML = '';
    
    if (goals.length === 0) {
        goalsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.3; padding: 100px;">Belum ada goal. Mulai sekarang!</div>';
        return;
    }

    goals.forEach(goal => {
        const percent = Math.min((goal.current / goal.target) * 100, 100).toFixed(0);
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-header">
                <span class="goal-title">${goal.name}</span>
                <div class="goal-stats">
                    <span class="goal-percent">${percent}%</span>
                    <span class="goal-values">${goal.current} / ${goal.target}</span>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <div class="goal-actions">
                <button class="increment-btn" onclick="updateGoal(${goal.id}, 1)">+ Tambah Progres</button>
                <button class="delete-btn" onclick="deleteGoal(${goal.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        goalsGrid.appendChild(card);
    });
}

window.updateGoal = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        // Simple prompt for amount
        const val = prompt(`Tambahkan berapa ke ${goal.name}?`, "1");
        const num = parseFloat(val);
        if (!isNaN(num)) {
            goal.current += num;
            saveAndRender();
        }
    }
};

window.deleteGoal = (id) => {
    if (confirm('Hapus goal ini?')) {
        goals = goals.filter(g => g.id !== id);
        saveAndRender();
    }
};

// Init
renderGoals();
