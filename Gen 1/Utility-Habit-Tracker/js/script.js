document.addEventListener('DOMContentLoaded', () => {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const daysLabels = document.getElementById('days-labels');
    const resetAllBtn = document.getElementById('reset-all-btn');
    const dateDisplay = document.getElementById('date-display');
    const cursorGlow = document.getElementById('cursor-glow');

    // Get short day names
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    let habits = JSON.parse(localStorage.getItem('minimalistHabits')) || [];

    function saveHabits() {
        localStorage.setItem('minimalistHabits', JSON.stringify(habits));
    }

    function renderHeader() {
        if (daysLabels) {
            daysLabels.innerHTML = '';
            days.forEach(day => {
                const span = document.createElement('span');
                span.className = 'day-label';
                span.textContent = day;
                daysLabels.appendChild(span);
            });
        }
    }

    function renderHabits() {
        habitList.innerHTML = '';
        habits.forEach((habit, habitIndex) => {
            const li = document.createElement('li');
            li.className = 'habit-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'habit-name';
            nameSpan.textContent = habit.name;
            nameSpan.title = habit.name;
            li.appendChild(nameSpan);

            const daysContainer = document.createElement('div');
            daysContainer.className = 'days-container';

            habit.days.forEach((isChecked, dayIndex) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'day-checkbox-wrapper';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'day-checkbox';
                checkbox.checked = isChecked;
                checkbox.addEventListener('change', () => {
                    habits[habitIndex].days[dayIndex] = checkbox.checked;
                    saveHabits();
                });

                wrapper.appendChild(checkbox);
                daysContainer.appendChild(wrapper);
            });

            li.appendChild(daysContainer);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            deleteBtn.title = 'Hapus habit';
            deleteBtn.addEventListener('click', () => {
                habits.splice(habitIndex, 1);
                saveHabits();
                renderHabits();
            });
            li.appendChild(deleteBtn);

            habitList.appendChild(li);
        });
    }

    function addHabit() {
        const name = habitInput.value.trim();
        if (name) {
            habits.push({
                name: name,
                days: [false, false, false, false, false, false, false]
            });
            saveHabits();
            renderHabits();
            habitInput.value = '';
        }
    }

    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    resetAllBtn.addEventListener('click', () => {
        if (habits.length === 0) return;
        if (confirm('Reset semua progres minggu ini untuk semua habit?')) {
            habits.forEach(h => {
                h.days = [false, false, false, false, false, false, false];
            });
            saveHabits();
            renderHabits();
        }
    });

    // Update Date
    if (dateDisplay) {
        const now = new Date();
        dateDisplay.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Cursor Glow
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    // Initial render
    renderHeader();
    renderHabits();
});

function toggleMainFab() {
    const fabGroup = document.getElementById("fabGroup");
    const btn = document.querySelector(".main-fab");
    if(fabGroup && btn) {
        fabGroup.classList.toggle("active");
        btn.classList.toggle("status-active", fabGroup.classList.contains("active"));
    }
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#fabGroup")) {
        const fabGroup = document.getElementById("fabGroup");
        const btn = document.querySelector(".main-fab");
        if(fabGroup && btn && fabGroup.classList.contains("active")) {
            fabGroup.classList.remove("active");
            btn.classList.remove("status-active");
        }
    }
});
