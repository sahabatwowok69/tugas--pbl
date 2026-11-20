/* ============================================================
   DATABASE SIMULASI (LOCALSTORAGE)
   ============================================================ */
const DB = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      return parsed;
    } catch (e) {
      console.warn('DB.get error:', e);
      return fallback;
    }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.warn('DB.set error:', e); }
  }
};

/* ============================================================
   AUTH MANAGER
   ============================================================ */
const AUTH = {
  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return 'h_' + Math.abs(h).toString(36);
  },
  getUsers() { return DB.get('users', []); },
  saveUsers(users) { DB.set('users', users); },
  getCurrentUser() { return DB.get('currentUser', null); },
  setCurrentUser(user) { DB.set('currentUser', user); },
  clearCurrentUser() { localStorage.removeItem('currentUser'); }
};

/* ============================================================
   SEED DATA (USER + THREAD CONTOH)
   ============================================================ */
(function seed() {
  const existingUsers = DB.get('users', []);
  if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
    DB.set('users', [
      { id: 1, nama: 'Administrator', username: 'admin', password: AUTH.hash('admin123'), role: 'admin' },
      { id: 2, nama: 'Nizamuddin E.', username: 'user', password: AUTH.hash('user123'), role: 'user' }
    ]);
  }

  const existingThreads = DB.get('threads', []);
  if (!Array.isArray(existingThreads) || existingThreads.length === 0) {
    DB.set('threads', [
      {
        id: 1,
        judul: 'Tips Lolos Beasiswa Unggulan 2026',
        kategori: 'Beasiswa',
        author: 'Nizamuddin E.',
        isi: 'Halo teman-teman! Saya mau sharing pengalaman lolos Beasiswa Unggulan tahun lalu. Kunci utamanya adalah esai yang kuat dan rekomendasi dari dosen.',
        tanggal: new Date(Date.now() - 86400000).toISOString(),
        komentar: [
          { id: 1, author: 'Andi', text: 'Terima kasih sharingnya!', tanggal: new Date(Date.now() - 43200000).toISOString() }
        ]
      },
      {
        id: 2,
        judul: 'Jadwal UAS Semester Genap 2025/2026',
        kategori: 'Pengumuman',
        author: 'Administrator',
        isi: 'UAS akan dilaksanakan pada tanggal 15-25 Juni 2026. Cek jadwal lengkap di portal akademik.',
        tanggal: new Date(Date.now() - 172800000).toISOString(),
        komentar: []
      },
      {
        id: 3,
        judul: 'Rekomendasi Laptop untuk Mahasiswa TI',
        kategori: 'Teknologi',
        author: 'Budi Santoso',
        isi: 'Budget 8-10 juta, butuh laptop untuk coding dan desain ringan. Ada rekomendasi?',
        tanggal: new Date(Date.now() - 259200000).toISOString(),
        komentar: []
      }
    ]);
  }
})();