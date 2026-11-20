/* ============================================================
   AUTH: SWITCH, LOGIN, REGISTER, LOGOUT
   ============================================================ */
function switchAuth(page) {
  document.getElementById('loginCard').style.display = page === 'login' ? 'block' : 'none';
  document.getElementById('registerCard').style.display = page === 'register' ? 'block' : 'none';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('registerError').classList.remove('show');
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showAuthError('loginError', '⚠️ Username dan password wajib diisi!');
    return;
  }

  const users = AUTH.getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    showAuthError('loginError', '❌ Username tidak ditemukan!');
    return;
  }

  if (user.password !== AUTH.hash(password)) {
    showAuthError('loginError', '❌ Password salah!');
    return;
  }

  AUTH.setCurrentUser({ id: user.id, nama: user.nama, username: user.username, role: user.role });
  showToast(`✅ Selamat datang, ${user.nama}!`);
  enterApp();
}

function handleRegister() {
  const nama = document.getElementById('regNama').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  if (!nama || !username || !password || !confirm) {
    showAuthError('registerError', '⚠️ Semua field wajib diisi!');
    return;
  }
  if (nama.length < 2) {
    showAuthError('registerError', '⚠️ Nama minimal 2 karakter!');
    return;
  }
  if (username.length < 3) {
    showAuthError('registerError', '⚠️ Username minimal 3 karakter!');
    return;
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    showAuthError('registerError', '⚠️ Username hanya boleh huruf kecil, angka, dan underscore!');
    return;
  }
  if (password.length < 6) {
    showAuthError('registerError', '⚠️ Password minimal 6 karakter!');
    return;
  }
  if (password !== confirm) {
    showAuthError('registerError', '⚠️ Konfirmasi password tidak cocok!');
    return;
  }

  const users = AUTH.getUsers();
  if (users.some(u => u.username === username)) {
    showAuthError('registerError', '❌ Username sudah dipakai!');
    return;
  }

  users.push({
    id: Date.now(),
    nama,
    username,
    password: AUTH.hash(password),
    role: 'user'
  });
  AUTH.saveUsers(users);

  showToast('✅ Registrasi berhasil! Silakan login.');
  document.getElementById('loginUsername').value = username;
  document.getElementById('loginPassword').value = '';
  switchAuth('login');
}

function enterApp() {
  const user = AUTH.getCurrentUser();
  if (!user) return;

  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  const navAdminEl = document.getElementById('nav-admin');

  if (userNameEl) userNameEl.textContent = user.nama;
  if (userAvatarEl) userAvatarEl.textContent = (user.nama || '?').charAt(0).toUpperCase();
  if (navAdminEl) navAdminEl.style.display = user.role === 'admin' ? 'inline-block' : 'none';

  showPage('home');
}

function handleLogout() {
  if (!confirm('Yakin ingin logout?')) return;
  AUTH.clearCurrentUser();
  document.getElementById('app').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  switchAuth('login');
  showToast('👋 Anda telah logout.');
}