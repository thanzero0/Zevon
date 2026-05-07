const quotes = [
    { text: "Satu langkah kecil hari ini adalah awal dari perjalanan besar hari esok.", author: "Anonim" },
    { text: "Jangan pernah berhenti ketika lelah, berhentilah ketika selesai.", author: "David Goggins" },
    { text: "Fokus pada apa yang bisa kamu kendalikan, lepaskan sisanya.", author: "Marcus Aurelius" },
    { text: "Disiplin adalah memilih antara apa yang kamu inginkan sekarang dan apa yang paling kamu inginkan.", author: "Abraham Lincoln" },
    { text: "Kesuksesan bukan tentang seberapa banyak uang yang kamu hasilkan, tapi tentang dampak yang kamu berikan.", author: "Michelle Obama" },
    { text: "Waktumu terbatas, jangan sia-siakan untuk menjalani hidup orang lain.", author: "Steve Jobs" },
    { text: "Kesulitan seringkali mempersiapkan orang biasa untuk nasib yang luar biasa.", author: "C.S. Lewis" }
];

const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote-btn');
const copyBtn = document.getElementById('copy-btn');
const glow = document.getElementById('cursor-glow');

// Cursor Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

function generateQuote() {
    quoteText.style.opacity = 0;
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = `— ${quote.author}`;
        quoteText.style.opacity = 1;
    }, 300);
}

newQuoteBtn.addEventListener('click', generateQuote);

copyBtn.addEventListener('click', () => {
    const textToCopy = `${quoteText.textContent} ${quoteAuthor.textContent}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    });
});

// Init
generateQuote();
