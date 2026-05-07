let planState = JSON.parse(localStorage.getItem('weekly_planner_data')) || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
};

const glow = document.getElementById('cursor-glow');

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

function saveState() {
    localStorage.setItem('weekly_planner_data', JSON.stringify(planState));
}

function renderDay(day) {
    const list = document.getElementById(`list-${day}`);
    list.innerHTML = '';
    
    planState[day].forEach((task, index) => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.textContent = task.text;
        item.onclick = () => toggleTask(day, index);
        
        // Right click to delete
        item.oncontextmenu = (e) => {
            e.preventDefault();
            deleteTask(day, index);
        };
        
        list.appendChild(item);
    });
}

window.addTask = (day, input) => {
    const text = input.value.trim();
    if (text) {
        planState[day].push({ text, completed: false });
        input.value = '';
        saveState();
        renderDay(day);
    }
};

function toggleTask(day, index) {
    planState[day][index].completed = !planState[day][index].completed;
    saveState();
    renderDay(day);
}

function deleteTask(day, index) {
    planState[day].splice(index, 1);
    saveState();
    renderDay(day);
}

function init() {
    Object.keys(planState).forEach(day => renderDay(day));
}

init();
