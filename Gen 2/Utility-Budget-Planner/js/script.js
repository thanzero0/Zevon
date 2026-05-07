// State Management
let state = {
    transactions: []
};

let categories = JSON.parse(localStorage.getItem('budget_categories')) || {
    income: ['Gaji', 'Bonus', 'Investasi', 'Lainnya'],
    expense: ['Makanan', 'Transportasi', 'Hiburan', 'Tagihan', 'Belanja', 'Lainnya']
};

function saveCategories() {
    localStorage.setItem('budget_categories', JSON.stringify(categories));
    renderCategorySelects();
}

function renderCategorySelects() {
    const incSel = document.getElementById('income-type');
    const expSel = document.getElementById('expense-type');
    if (incSel) incSel.innerHTML = categories.income.map(c => `<option value="${c}">${c}</option>`).join('');
    if (expSel) expSel.innerHTML = categories.expense.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Load from LocalStorage
const loadState = () => {
    const saved = localStorage.getItem('budget_planner_state_v2');
    if (saved) {
        state = JSON.parse(saved);
    }
    updateUI();
};

const saveState = () => {
    localStorage.setItem('budget_planner_state_v2', JSON.stringify(state));
};

// DOM Elements
const incomeName = document.getElementById('income-name');
const incomeDesc = document.getElementById('income-desc');
const incomeType = document.getElementById('income-type');
const incomeAmount = document.getElementById('income-amount');
const addIncomeBtn = document.getElementById('add-income-btn');

const expenseName = document.getElementById('expense-name');
const expenseDesc = document.getElementById('expense-desc');
const expenseType = document.getElementById('expense-type');
const expenseAmount = document.getElementById('expense-amount');
const addExpenseBtn = document.getElementById('add-expense-btn');

const transactionList = document.getElementById('transaction-list');
const remainingBalance = document.getElementById('remaining-balance');
const glow = document.getElementById('cursor-glow');

// Modals
const customModal = document.getElementById('app-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalFooter = document.getElementById('modal-footer');

function showModal(title, content, buttonsHTML) {
    modalTitle.innerText = title;
    modalBody.innerHTML = content;
    modalFooter.innerHTML = buttonsHTML;
    customModal.classList.add('active');
}

window.closeModal = () => {
    customModal.classList.remove('active');
};

function showAlert(message) {
    showModal('Peringatan', `<p>${message}</p>`, `<button class="btn btn-primary" onclick="closeModal()">Tutup</button>`);
}

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if(glow.style.opacity === '0' || !glow.style.opacity) glow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => glow.style.opacity = '0');
document.addEventListener('mouseenter', () => glow.style.opacity = '1');

// Logic
function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
}

function updateUI() {
    let totalIncome = 0;
    let totalExpense = 0;

    state.transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else if (t.type === 'expense') totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    remainingBalance.textContent = formatIDR(balance);
    
    if(balance < 0) {
        remainingBalance.className = 'negative';
    } else if (balance > 0) {
        remainingBalance.className = 'positive';
    } else {
        remainingBalance.className = '';
    }
    
    // Update List
    if (state.transactions.length === 0) {
        transactionList.innerHTML = '<div class="empty-state">Belum ada data transaksi.</div>';
    } else {
        transactionList.innerHTML = '';
        state.transactions.slice().reverse().forEach((t, index) => {
            const originalIndex = state.transactions.length - 1 - index;
            const item = document.createElement('div');
            item.className = 'expense-item';
            
            const isIncome = t.type === 'income';
            const amountClass = isIncome ? 'income' : 'expense';
            const sign = isIncome ? '+' : '-';
            
            item.innerHTML = `
                <div class="ei-info">
                    <span class="ei-name">${t.name}</span>
                    ${t.desc ? `<span class="ei-desc">${t.desc}</span>` : ''}
                    <div class="ei-meta">
                        <span class="ei-type-badge">${t.itemType}</span>
                        <span class="ei-date">${t.date}</span>
                    </div>
                </div>
                <div class="ei-right">
                    <span class="ei-amount ${amountClass}">${sign} ${formatIDR(t.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${originalIndex})" aria-label="Hapus">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            transactionList.appendChild(item);
        });
    }
}

function addTransaction(type) {
    const isIncome = type === 'income';
    const nameInput = isIncome ? incomeName : expenseName;
    const descInput = isIncome ? incomeDesc : expenseDesc;
    const typeInput = isIncome ? incomeType : expenseType;
    const amountInput = isIncome ? incomeAmount : expenseAmount;

    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const itemType = typeInput.value;
    const amount = parseFloat(amountInput.value);

    if (name && !isNaN(amount) && amount > 0) {
        const transaction = {
            id: Date.now(),
            type,
            name,
            desc,
            itemType,
            amount,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })
        };
        state.transactions.push(transaction);
        
        nameInput.value = '';
        descInput.value = '';
        amountInput.value = '';
        
        saveState();
        updateUI();
    } else {
        showAlert('Mohon isi nama dan jumlah dengan benar (angka lebih dari 0).');
    }
}

addIncomeBtn.addEventListener('click', () => addTransaction('income'));
addExpenseBtn.addEventListener('click', () => addTransaction('expense'));

// Keyboard submission
[incomeName, incomeDesc, incomeAmount].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTransaction('income');
    });
});

[expenseName, expenseDesc, expenseAmount].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTransaction('expense');
    });
});

window.deleteTransaction = (index) => {
    state.transactions.splice(index, 1);
    saveState();
    updateUI();
};

window.confirmResetHistory = () => {
    showModal('Reset Riwayat', '<p>Anda yakin ingin menghapus semua riwayat transaksi? Saldo akan direset ke Rp 0.</p>', `
        <button class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button class="btn btn-danger" onclick="doResetHistory()">Reset</button>
    `);
};

window.confirmResetBudget = () => {
    showModal('Reset Budget', '<p>Anda yakin ingin mereset seluruh budget? Semua data transaksi akan hilang.</p>', `
        <button class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button class="btn btn-danger" onclick="doResetBudget()">Reset</button>
    `);
};

window.doResetHistory = () => {
    state.transactions = [];
    saveState();
    updateUI();
    closeModal();
};

window.doResetBudget = () => {
    state.transactions = [];
    saveState();
    updateUI();
    closeModal();
};

window.exportToExcel = () => {
    if(state.transactions.length === 0) {
        showAlert('Tidak ada data untuk diekspor.');
        return;
    }
    
    const data = state.transactions.map(t => ({
        'Tanggal': t.date,
        'Tipe': t.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
        'Kategori': t.itemType,
        'Nama': t.name,
        'Deskripsi': t.desc,
        'Jumlah (Rp)': t.amount
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    
    // Generate excel file and download
    XLSX.writeFile(wb, "Budget_Planner_Export.xlsx");
};

// Category Management UI
function getManageCategoriesContent() {
    return `
        <div class="category-manager">
            <div class="cat-section">
                <h4>Kategori Pendapatan</h4>
                <div class="cat-list">
                    ${categories.income.map((c, i) => `<div class="cat-badge">${c} <button onclick="deleteCat('income', ${i})">&times;</button></div>`).join('')}
                </div>
                <div class="add-cat-form">
                    <input type="text" id="new-inc-cat" placeholder="Tambah kategori..." onkeypress="if(event.key === 'Enter') addCat('income')">
                    <button onclick="addCat('income')">+</button>
                </div>
            </div>
            <div class="cat-section">
                <h4>Kategori Pengeluaran</h4>
                <div class="cat-list">
                    ${categories.expense.map((c, i) => `<div class="cat-badge">${c} <button onclick="deleteCat('expense', ${i})">&times;</button></div>`).join('')}
                </div>
                <div class="add-cat-form">
                    <input type="text" id="new-exp-cat" placeholder="Tambah kategori..." onkeypress="if(event.key === 'Enter') addCat('expense')">
                    <button onclick="addCat('expense')">+</button>
                </div>
            </div>
        </div>
    `;
}

window.openManageCategories = () => {
    showModal('Kelola Kategori', getManageCategoriesContent(), `<button class="btn btn-primary" onclick="closeModal()">Tutup</button>`);
};

window.deleteCat = (type, index) => {
    categories[type].splice(index, 1);
    saveCategories();
    document.getElementById('modal-body').innerHTML = getManageCategoriesContent();
};

window.addCat = (type) => {
    const input = document.getElementById(type === 'income' ? 'new-inc-cat' : 'new-exp-cat');
    const val = input.value.trim();
    if(val && !categories[type].includes(val)) {
        categories[type].push(val);
        saveCategories();
        document.getElementById('modal-body').innerHTML = getManageCategoriesContent();
    } else if (categories[type].includes(val)) {
        alert('Kategori sudah ada.');
    }
};

// ==========================================
// THEME AND SIZE LOGIC
// ==========================================
const fabGroup = document.getElementById("fabGroup");
const themeMenu = document.getElementById("themeMenu");
const sizeMenu = document.getElementById("sizeMenu");

window.toggleMainFab = () => {
    const btn = document.querySelector(".main-fab");
    fabGroup.classList.toggle("active");
    btn.classList.toggle("status-active", fabGroup.classList.contains("active"));
};

window.toggleSizeMenu = () => {
    const customPanel = document.getElementById("customSizePanel");
    sizeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
};

window.setSize = (size, isInitial = false) => {
    const root = document.documentElement;
    const presets = {
        'mini': { width: '800px', scale: '0.8' },
        'medium': { width: '1000px', scale: '1' },
        'large': { width: '1200px', scale: '1.1' },
        'desktop': { width: '100%', scale: '1' }
    };

    if (size === 'custom') {
        loadCustomSize();
    } else if (presets[size]) {
        root.style.setProperty('--app-width', presets[size].width);
        root.style.setProperty('--app-scale', presets[size].scale);
        if (document.getElementById('customSizePanel')) 
            document.getElementById('customSizePanel').classList.remove('active');
    }

    document.querySelectorAll('.size-opt').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === size) btn.classList.add('active');
        if (size === 'custom' && btn.id === 'customSizeOpt') btn.classList.add('active');
    });

    if (!isInitial) sizeMenu.classList.remove("active");
    localStorage.setItem('budget-size', size);
};

window.toggleCustomSize = () => {
    const panel = document.getElementById("customSizePanel");
    panel.classList.toggle("active");
};

window.applyCustomSize = () => {
    const width = document.getElementById('size-width').value;
    const scale = document.getElementById('size-scale').value;
    const root = document.documentElement;
    root.style.setProperty('--app-width', width + 'px');
    root.style.setProperty('--app-scale', scale);
    localStorage.setItem('budget-custom-size', JSON.stringify({ width, scale }));
};

function loadCustomSize() {
    const saved = localStorage.getItem('budget-custom-size');
    if (saved) {
        const { width, scale } = JSON.parse(saved);
        const root = document.documentElement;
        root.style.setProperty('--app-width', width + 'px');
        root.style.setProperty('--app-scale', scale);
        document.getElementById('size-width').value = width;
        document.getElementById('size-scale').value = scale;
    }
}

window.toggleThemeMenu = () => {
    const customPanel = document.getElementById("customThemePanel");
    themeMenu.classList.toggle("active");
    if (customPanel) customPanel.classList.remove("active");
};

window.setTheme = (theme, isInitial = false) => {
    const customPanel = document.getElementById("customThemePanel");

    if (theme === 'custom') {
        document.body.className = '';
        document.body.classList.add('custom-theme');
        loadCustomTheme();
        if (customPanel && !isInitial) customPanel.classList.toggle('active');
    } else {
        document.body.className = '';
        document.body.style = ''; 
        if (theme !== 'dark') {
            document.body.classList.add(theme + '-theme');
        }
        if (customPanel) customPanel.classList.remove('active');
        if (!isInitial) {
            themeMenu.classList.remove("active");
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

    localStorage.setItem('budget-theme', theme);
};

window.toggleCustomEditor = () => {
    const panel = document.getElementById("customThemePanel");
    panel.classList.toggle("active");
};

window.applyCustomTheme = () => {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--surface-color': document.getElementById('color-surface').value,
        '--accent-color': document.getElementById('color-primary').value,
        '--text-primary': document.getElementById('color-text').value,
        '--cursor-color': document.getElementById('color-primary').value
    };

    const root = document.body;
    for (const [prop, val] of Object.entries(colors)) {
        root.style.setProperty(prop, val);
    }
    
    // Also derive border color a bit lighter than surface
    root.style.setProperty('--border-color', adjustColor(colors['--surface-color'], 20));
};

window.saveCustomTheme = () => {
    const colors = {
        '--bg-color': document.getElementById('color-bg').value,
        '--surface-color': document.getElementById('color-surface').value,
        '--accent-color': document.getElementById('color-primary').value,
        '--text-primary': document.getElementById('color-text').value
    };

    localStorage.setItem('budget-custom-colors', JSON.stringify(colors));

    const btn = document.querySelector('.save-theme-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saved! ✓";
    btn.style.background = "#10b981";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
    }, 2000);
};

function loadCustomTheme() {
    const saved = localStorage.getItem('budget-custom-colors');
    if (saved) {
        const colors = JSON.parse(saved);
        const root = document.body;
        for (const [prop, val] of Object.entries(colors)) {
            root.style.setProperty(prop, val);
            
            const map = {
                '--bg-color': 'color-bg',
                '--surface-color': 'color-surface',
                '--accent-color': 'color-primary',
                '--text-primary': 'color-text'
            };
            
            if(map[prop]) {
                const input = document.getElementById(map[prop]);
                if (input) input.value = val;
            }
        }
        root.style.setProperty('--cursor-color', colors['--accent-color']);
        root.style.setProperty('--border-color', adjustColor(colors['--surface-color'], 20));
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
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Init
const savedTheme = localStorage.getItem('budget-theme') || 'dark';
const savedSize = localStorage.getItem('budget-size') || 'medium';
setTheme(savedTheme, true);
setSize(savedSize, true);

renderCategorySelects();
loadState();
