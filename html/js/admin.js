/* ============================================================
   ADMIN PANEL
   ============================================================ */

function renderAdmin() {
  const user = AUTH.getCurrentUser();
  if (!user || user.role !== 'admin') return;

  const threads = DB.get('threads', []);
  const users = AUTH.getUsers();
  const totalComment = threads.reduce((s, t) => s + (Array.isArray(t.komentar) ? t.komentar.length : 0), 0);
  const today = new Date().toDateString();
  const todayThread = threads.filter(t => {
    try { return new Date(t.tanggal).toDateString() === today; } catch { return false; }
  }).length;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('statThread', threads.length);
  setText('statComment', totalComment);
  setText('statUser', users.length);
  setText('statToday', todayThread);

  const katCount = {};
  threads.forEach(t => { katCount[t.kategori] = (katCount[t.kategori] || 0) + 1; });

  const katList = document.getElementById('kategoriList');
  if (katList) {
    katList.innerHTML = Object.keys(katCount).length
      ? Object.entries(katCount).map(([k, v]) =>
          `<div class="stat"><span class="label">${escapeHtml(k)}</span><span class="value">${v}</span></div>`
        ).join('')
      : '<p style="color:#94a3b8;">Belum ada data.</p>';
  }

  const adminList = document.getElementById('adminThreadList');
  if (adminList) {
    adminList.innerHTML = threads.length === 0
      ? '<p style="color:#94a3b8;">Belum ada thread.</p>'
      : threads.map(t => {
          const katClass = t.kategori ? `kat-${t.kategori}` : 'kat-default';
          return `
            <div class="stat">
              <span class="label">
                <span class="kategori-badge ${katClass}" style="font-size:0.65rem;">${escapeHtml(t.kategori || 'Umum')}</span>
                ${escapeHtml(t.judul)} — <em style="color:#94a3b8;">${escapeHtml(t.author)}</em>
              </span>
              <button class="btn btn-danger btn-sm" onclick="deleteThread(${t.id})">🗑️ Hapus</button>
            </div>
          `;
        }).join('');
  }
}

function deleteThread(id) {
  const user = AUTH.getCurrentUser();
  if (!user || user.role !== 'admin') { showToast('⛔ Hanya admin!'); return; }
  if (!confirm('Hapus thread ini beserta komentarnya?')) return;

  let threads = DB.get('threads', []);
  threads = threads.filter(t => t.id !== id);
  DB.set('threads', threads);
  showToast('🗑️ Thread dihapus.');
  renderAdmin();
}