/* ============================================================
   NAVIGASI HALAMAN
   ============================================================ */
function showPage(page) {
  const user = AUTH.getCurrentUser();
  if (!user) return;

  if (page === 'admin' && user.role !== 'admin') {
    showToast('⛔ Anda bukan admin!');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  const navBtn = document.getElementById('nav-' + page);
  if (navBtn) navBtn.classList.add('active');

  const hero = document.getElementById('hero-section');
  if (hero) hero.style.display = (page === 'home') ? 'block' : 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') renderThreads();
  if (page === 'admin') renderAdmin();
  if (page === 'create') {
    const authorEl = document.getElementById('inputAuthor');
    if (authorEl) authorEl.value = user.nama;
    const j = document.getElementById('inputJudul');
    const i = document.getElementById('inputIsi');
    if (j) j.value = '';
    if (i) i.value = '';
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function timeAgo(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return 'Tanggal tidak valid';
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg) {
  const ex = document.querySelector('.toast');
  if (ex) ex.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ============================================================
   INIT — CEK SESSION SAAT HALAMAN DIBUKA
   ============================================================ */
(function init() {
  try {
    const user = AUTH.getCurrentUser();
    if (user && user.username) {
      enterApp();
    } else {
      document.getElementById('authScreen').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
    }
  } catch (e) {
    console.error('Init error:', e);
    localStorage.clear();
    location.reload();
  }
})();
/* ============================================================
   TEMA GELAP / TERANG
   ============================================================ */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const b = document.getElementById('themeBtn');
  if (b) b.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
}
applyTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));