/* ============================================================
   THREAD: RENDER, CREATE, DETAIL, KOMENTAR
   ============================================================ */

function renderThreads() {
  const threads = DB.get('threads', []);
  const searchEl = document.getElementById('searchInput');
  const filterEl = document.getElementById('filterKategori');
  const search = (searchEl ? searchEl.value : '').toLowerCase().trim();
  const filter = filterEl ? filterEl.value : '';

  let filtered = threads.filter(t => {
    const judul = (t.judul || '').toLowerCase();
    const isi = (t.isi || '').toLowerCase();
    const matchSearch = !search || judul.includes(search) || isi.includes(search);
    const matchFilter = !filter || t.kategori === filter;
    return matchSearch && matchFilter;
  });

  filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const list = document.getElementById('threadList');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty"><div class="icon">📭</div><p>Belum ada thread. Buat yang pertama!</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(t => {
    const komentarCount = Array.isArray(t.komentar) ? t.komentar.length : 0;
    const isi = t.isi || '';
    const excerpt = isi.length > 140 ? isi.substring(0, 140) + '...' : isi;
    const katClass = t.kategori ? `kat-${t.kategori}` : 'kat-default';
    return `
      <div class="thread-card" onclick="openDetail(${t.id})">
        <span class="kategori-badge ${katClass}">${escapeHtml(t.kategori || 'Umum')}</span>
        <h3>${escapeHtml(t.judul)}</h3>
        <div class="meta">
          <span>👤 ${escapeHtml(t.author)}</span>
          <span>🕒 ${timeAgo(t.tanggal)}</span>
          <span>💬 ${komentarCount} komentar</span>
        </div>
        <p class="excerpt">${escapeHtml(excerpt)}</p>
      </div>
    `;
  }).join('');
}

function createThread() {
  const user = AUTH.getCurrentUser();
  if (!user) { showToast('⚠️ Silakan login dulu!'); return; }

  const judulEl = document.getElementById('inputJudul');
  const kategoriEl = document.getElementById('inputKategori');
  const isiEl = document.getElementById('inputIsi');
  if (!judulEl || !kategoriEl || !isiEl) return;

  const judul = judulEl.value.trim();
  const kategori = kategoriEl.value;
  const isi = isiEl.value.trim();

  if (!judul || !isi) {
    showToast('⚠️ Judul dan isi wajib diisi!');
    return;
  }

  const threads = DB.get('threads', []);
  threads.push({
    id: Date.now(),
    judul,
    kategori,
    author: user.nama,
    isi,
    tanggal: new Date().toISOString(),
    komentar: []
  });
  DB.set('threads', threads);

  showToast('✅ Thread berhasil dipublikasikan!');
  showPage('home');
}

function openDetail(id) {
  const user = AUTH.getCurrentUser();
  if (!user) return;

  const threads = DB.get('threads', []);
  const t = threads.find(x => x.id === id);
  if (!t) { showToast('⚠️ Thread tidak ditemukan'); return; }

  const komentar = Array.isArray(t.komentar) ? t.komentar : [];
  const detail = document.getElementById('detailContent');
  if (!detail) return;

  const katClass = t.kategori ? `kat-${t.kategori}` : 'kat-default';

  detail.innerHTML = `
    <div class="detail-header">
      <span class="kategori-badge ${katClass}">${escapeHtml(t.kategori || 'Umum')}</span>
      <h2>${escapeHtml(t.judul)}</h2>
      <div class="detail-meta">
        <span>👤 ${escapeHtml(t.author)}</span>
        <span>🕒 ${timeAgo(t.tanggal)}</span>
      </div>
      <div class="detail-body">${escapeHtml(t.isi).replace(/\n/g, '<br>')}</div>
    </div>

    <div class="comment-section">
      <h3>💬 Komentar (${komentar.length})</h3>
      ${komentar.length === 0 ? '<p style="color:#94a3b8; margin-bottom:16px;">Belum ada komentar.</p>' : ''}
      ${komentar.map(c => `
        <div class="comment">
          <span class="author">${escapeHtml(c.author)}</span>
          <span class="time">${timeAgo(c.tanggal)}</span>
          <div class="text">${escapeHtml(c.text)}</div>
          ${user.role === 'admin' ? `<div class="actions"><button class="btn btn-danger btn-sm" onclick="deleteComment(${t.id}, ${c.id})">🗑️ Hapus</button></div>` : ''}
        </div>
      `).join('')}

      <div class="comment-form">
        <h3>Tambah Komentar</h3>
        <div class="form-group">
          <input type="text" value="${escapeHtml(user.nama)}" readonly>
        </div>
        <div class="form-group">
          <textarea id="commentText" placeholder="Tulis komentar..." style="min-height:80px;"></textarea>
        </div>
        <button class="btn btn-success" onclick="addComment(${t.id})">💬 Kirim</button>
      </div>
    </div>
  `;
  showPage('detail');
}

function addComment(threadId) {
  const user = AUTH.getCurrentUser();
  if (!user) return;

  const textEl = document.getElementById('commentText');
  if (!textEl) return;
  const text = textEl.value.trim();
  if (!text) { showToast('⚠️ Komentar tidak boleh kosong!'); return; }

  const threads = DB.get('threads', []);
  const t = threads.find(x => x.id === threadId);
  if (!t) return;
  if (!Array.isArray(t.komentar)) t.komentar = [];

  t.komentar.push({
    id: Date.now(),
    author: user.nama,
    text,
    tanggal: new Date().toISOString()
  });
  DB.set('threads', threads);
  showToast('✅ Komentar ditambahkan!');
  openDetail(threadId);
}

function deleteComment(threadId, commentId) {
  const user = AUTH.getCurrentUser();
  if (!user || user.role !== 'admin') { showToast('⛔ Hanya admin!'); return; }
  if (!confirm('Hapus komentar ini?')) return;

  const threads = DB.get('threads', []);
  const t = threads.find(x => x.id === threadId);
  if (!t || !Array.isArray(t.komentar)) return;
  t.komentar = t.komentar.filter(c => c.id !== commentId);
  DB.set('threads', threads);
  showToast('🗑️ Komentar dihapus.');
  openDetail(threadId);
}