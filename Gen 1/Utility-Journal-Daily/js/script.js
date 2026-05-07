
const STORAGE_KEY = 'dj_entries_v1';
let entries = [];
let currentId = null;
let currentMood = '';

function loadEntries() {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { entries = []; }
}
function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDateShort(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function countWords(str) {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
}

function renderSidebar() {
    const list = document.getElementById('entries-list');
    if (!entries.length) {
        list.innerHTML = '<li class="empty-sidebar">Belum ada entri.</li>';
        return;
    }
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    list.innerHTML = sorted.map(e => `
    <li class="entry-item ${e.id === currentId ? 'active' : ''}" onclick="openEntry('${e.id}')">
      <div class="ei-date">${formatDateShort(e.createdAt)}</div>
      <div class="ei-title">${e.title || 'Tanpa judul'}</div>
      <div class="ei-preview">${e.body ? e.body.slice(0, 60) + (e.body.length > 60 ? '…' : '') : ''}</div>
    </li>
  `).join('');
}

function showWelcome() {
    document.getElementById('welcome').classList.remove('hidden');
    document.getElementById('entry-view').classList.add('hidden');
    document.getElementById('read-view').classList.add('hidden');
}

function newEntry() {
    currentId = genId();
    currentMood = '';
    const now = new Date().toISOString();
    entries.push({ id: currentId, title: '', body: '', mood: '', createdAt: now, updatedAt: now });
    saveEntries();
    renderSidebar();
    openEditor();
}

function openEditor() {
    const e = entries.find(x => x.id === currentId);
    if (!e) return;
    document.getElementById('welcome').classList.add('hidden');
    document.getElementById('read-view').classList.add('hidden');
    document.getElementById('entry-view').classList.remove('hidden');

    const titleEl = document.getElementById('entry-title');
    titleEl.value = e.title;
    autoResize(titleEl);
    document.getElementById('entry-body').value = e.body;
    currentMood = e.mood;

    document.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.mood === currentMood);
    });

    updateMeta();
    document.getElementById('entry-body').focus();
}

function openEntry(id) {
    currentId = id;
    const e = entries.find(x => x.id === id);
    if (!e) return;

    document.getElementById('welcome').classList.add('hidden');
    document.getElementById('entry-view').classList.add('hidden');

    const rv = document.getElementById('read-view');
    rv.classList.remove('hidden');
    document.getElementById('rv-title').textContent = e.title || 'Tanpa judul';
    document.getElementById('rv-date').textContent = formatDate(e.createdAt);
    document.getElementById('rv-words').textContent = countWords(e.body) + ' kata';
    document.getElementById('rv-mood').textContent = e.mood || '';
    document.getElementById('rv-body').innerHTML = e.body.replace(/\n/g, '<br>');

    renderSidebar();
}

function editCurrent() {
    openEditor();
    renderSidebar();
}

function saveEntry() {
    const e = entries.find(x => x.id === currentId);
    if (!e) return;
    e.title = document.getElementById('entry-title').value.trim();
    e.body = document.getElementById('entry-body').value;
    e.mood = currentMood;
    e.updatedAt = new Date().toISOString();
    saveEntries();
    renderSidebar();
    showToast('Tersimpan');
    openEntry(currentId);
}

function deleteEntry() {
    if (!currentId) return;
    if (!confirm('Hapus entri ini?')) return;
    entries = entries.filter(x => x.id !== currentId);
    saveEntries();
    currentId = null;
    renderSidebar();
    showWelcome();
    showToast('Entri dihapus');
}

function setMood(btn) {
    currentMood = btn.classList.contains('selected') ? '' : btn.dataset.mood;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    if (currentMood) btn.classList.add('selected');
    updateMeta();
}

function updateMeta() {
    const body = document.getElementById('entry-body').value;
    const e = entries.find(x => x.id === currentId);
    document.getElementById('meta-date').textContent = e ? formatDate(e.createdAt) : '—';
    document.getElementById('meta-words').textContent = countWords(body) + ' kata';
    document.getElementById('meta-mood-line').textContent = currentMood || '';
}

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

function updateDateDisplay() {
    document.getElementById('date-display').textContent =
        new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// Keyboard shortcut Ctrl/Cmd+S
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const ev = document.getElementById('entry-view');
        if (!ev.classList.contains('hidden')) saveEntry();
    }
});

// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

// Init
loadEntries();
updateDateDisplay();
renderSidebar();
if (!entries.length) showWelcome();
else showWelcome();

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