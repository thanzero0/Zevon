const editor = document.getElementById('editor');
const lnDisplay = document.getElementById('ln');
const colDisplay = document.getElementById('col');
const wordCountDisplay = document.getElementById('word-count');
const tabsContainer = document.getElementById('tabs');
const btnNew = document.getElementById('btn-new');
const btnTheme = document.getElementById('btn-theme');
const btnSave = document.getElementById('btn-save');

// Modals
const modalBackdrop = document.getElementById('modal-backdrop');
const modalRename = document.getElementById('modal-rename');
const renameInput = document.getElementById('rename-input');
const btnRenameCancel = document.getElementById('btn-rename-cancel');
const btnRenameSave = document.getElementById('btn-rename-save');

const modalDownload = document.getElementById('modal-download');
const downloadFilename = document.getElementById('download-filename');
const btnDownloadCancel = document.getElementById('btn-download-cancel');
const btnDownloadConfirm = document.getElementById('btn-download-confirm');

const STORAGE_KEY = 'minimal_notepad_data';
let state = {
  theme: 'dark',
  activeTabId: null,
  tabs: []
};
let renamingTabId = null;

// Generate random ID
const genId = () => Math.random().toString(36).substr(2, 9);

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { state = JSON.parse(saved); } catch(e) {}
  }
  
  if (state.tabs.length === 0) {
    const id = genId();
    state.tabs.push({ id, title: 'untitled.txt', content: '' });
    state.activeTabId = id;
  }
  if (!state.tabs.find(t => t.id === state.activeTabId)) {
    state.activeTabId = state.tabs[0].id;
  }
  
  applyTheme();
  renderTabs();
  loadActiveTab();
}

function saveState() {
  const activeTab = state.tabs.find(t => t.id === state.activeTabId);
  if (activeTab) {
    activeTab.content = editor.value;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme() {
  document.body.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveState();
}

function renderTabs() {
  tabsContainer.innerHTML = '';
  state.tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${tab.id === state.activeTabId ? 'active' : ''}`;
    
    const nameEl = document.createElement('span');
    nameEl.className = 'tab-name';
    nameEl.textContent = tab.title;
    nameEl.title = "Klik ganda untuk mengubah nama";
    nameEl.ondblclick = (e) => {
      e.stopPropagation();
      openRenameModal(tab);
    };
    
    const closeEl = document.createElement('span');
    closeEl.className = 'tab-close';
    closeEl.innerHTML = '✕';
    closeEl.title = "Tutup";
    closeEl.onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };
    
    tabEl.onclick = () => switchTab(tab.id);
    
    tabEl.appendChild(nameEl);
    tabEl.appendChild(closeEl);
    tabsContainer.appendChild(tabEl);
  });
}

function loadActiveTab() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (tab) {
    editor.value = tab.content;
    updateCursorPos();
  }
}

function switchTab(id) {
  saveState();
  state.activeTabId = id;
  renderTabs();
  loadActiveTab();
  editor.focus();
}

function newTab() {
  saveState();
  const id = genId();
  state.tabs.push({ id, title: 'untitled.txt', content: '' });
  state.activeTabId = id;
  saveState();
  renderTabs();
  loadActiveTab();
  editor.focus();
}

function closeTab(id) {
  if (state.tabs.length === 1) {
    state.tabs[0].title = 'untitled.txt';
    state.tabs[0].content = '';
    editor.value = '';
    saveState();
    renderTabs();
    return;
  }
  
  const idx = state.tabs.findIndex(t => t.id === id);
  state.tabs.splice(idx, 1);
  
  if (state.activeTabId === id) {
    state.activeTabId = state.tabs[Math.max(0, idx - 1)].id;
  }
  
  saveState();
  renderTabs();
  loadActiveTab();
}

// Status Bar
function updateCursorPos() {
  const text = editor.value;
  const cursorPos = editor.selectionStart;
  const textBeforeCursor = text.substring(0, cursorPos);
  const lines = textBeforeCursor.split('\n');
  
  lnDisplay.textContent = lines.length;
  colDisplay.textContent = lines[lines.length - 1].length + 1;
  
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCountDisplay.textContent = words;
}

// Editor Listeners
editor.addEventListener('input', () => {
  updateCursorPos();
  saveState();
});
editor.addEventListener('keyup', updateCursorPos);
editor.addEventListener('click', updateCursorPos);
editor.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 1;
    updateCursorPos();
    saveState();
  }
});

btnNew.addEventListener('click', newTab);
btnTheme.addEventListener('click', toggleTheme);

// ---- MODAL LOGIC ----
function closeModal() {
  modalBackdrop.classList.remove('active');
  modalRename.classList.remove('active');
  modalDownload.classList.remove('active');
  editor.focus();
}

// Rename Modal
function openRenameModal(tab) {
  renamingTabId = tab.id;
  renameInput.value = tab.title;
  modalBackdrop.classList.add('active');
  modalRename.classList.add('active');
  renameInput.focus();
  renameInput.select();
}

btnRenameCancel.addEventListener('click', closeModal);
btnRenameSave.addEventListener('click', () => {
  if (!renameInput.value.trim()) return;
  const tab = state.tabs.find(t => t.id === renamingTabId);
  if (tab) {
    tab.title = renameInput.value.trim();
    saveState();
    renderTabs();
  }
  closeModal();
});
renameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnRenameSave.click();
  if (e.key === 'Escape') closeModal();
});

// Download Modal
btnSave.addEventListener('click', () => {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  downloadFilename.textContent = tab.title;
  modalBackdrop.classList.add('active');
  modalDownload.classList.add('active');
  btnDownloadConfirm.focus();
});

btnDownloadCancel.addEventListener('click', closeModal);
btnDownloadConfirm.addEventListener('click', () => {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  const blob = new Blob([editor.value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = tab.title;
  a.click();
  URL.revokeObjectURL(a.href);
  closeModal();
});

modalBackdrop.addEventListener('click', closeModal);

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
loadState();

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