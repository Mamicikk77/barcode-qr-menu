/* Barcode Beach · Menü yönetim paneli */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = $('#admin');
  const modal = $('#modal');
  const panel = $('.modal-panel', modal);

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* yok say */ } },
  };

  let token = ls.get('bb-admin-token');
  let M = null;
  let view = ls.get('bb-admin-view') || 'products';
  const filt = { cat: 'all', q: '' };
  let isDefaultPw = false;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (n == null || n === '' ? '—' : new Intl.NumberFormat('tr-TR').format(n) + ' ' + (M?.settings.currency || '₺'));
  const norm = s => String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'x';
  const uid = base => slug(base) + '-' + Math.random().toString(36).slice(2, 6);
  const num = v => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; };

  const TAGS = { chef: 'Şefin Önerisi', veg: 'Vejetaryen', vegan: 'Vegan', spicy: 'Acı', new: 'Yeni' };

  const I = {
    products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 11h16M5 11a7 7 0 0 1 14 0M3 15h18l-1.5 4h-15z"/></svg>',
    cats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V10a7 7 0 0 1 14 0v11z"/><path d="M5 21h14"/></svg>',
    allergens: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M7 7c0 3 5 3 5 3M17 7c0 3-5 3-5 3M7 13c0 3 5 3 5 3M17 13c0 3-5 3-5 3"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-8 9"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
    percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>',
  };

  /* ── API ── */
  async function api(path, opts = {}) {
    const res = await fetch('api/' + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== 'login' && path !== 'password') { logout(); throw new Error(data.error || 'Oturum kapandı'); }
    if (!res.ok) throw new Error(data.error || 'İstek başarısız (' + res.status + ')');
    return data;
  }

  /* ── Arka uç: yerel sunucu (node server.js) veya GitHub (GitHub Pages) ── */
  let mode = 'server';
  let gh = (() => { try { return JSON.parse(ls.get('bb-gh') || 'null'); } catch { return null; } })(); // {owner, repo, token}
  let menuSha = null;
  const MENU_PATH = 'public/data/menu.json';
  const localImg = {}; // yeni yüklenen fotoğrafların önizlemesi (Pages yayını bitene kadar)
  const imgUrl = u => localImg[u] || u;

  async function detectMode() {
    try {
      const r = await fetch('api/menu', { cache: 'no-store' });
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) return 'server';
    } catch { /* sunucu yok */ }
    return 'github';
  }
  async function ghApi(path, opts = {}) {
    const res = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}${path ? '/' + path : ''}`, {
      method: opts.method || 'GET',
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + gh.token, 'X-GitHub-Api-Version': '2022-11-28' },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { logout(); throw new Error('GitHub anahtarı geçersiz veya süresi dolmuş'); }
    if (!res.ok) { const e = new Error(data.message || 'GitHub hatası (' + res.status + ')'); e.status = res.status; throw e; }
    return data;
  }
  const b64enc = str => {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64dec = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));

  async function loadMenu() {
    if (mode === 'server') return api('menu');
    const f = await ghApi('contents/' + MENU_PATH);
    menuSha = f.sha;
    const b64 = f.content || (await ghApi('git/blobs/' + f.sha)).content; // 1 MB üstü dosyalar blob ile gelir
    return JSON.parse(b64dec(b64));
  }
  async function saveMenu() {
    if (mode === 'server') { M.updatedAt = (await api('menu', { method: 'PUT', body: M })).updatedAt; return; }
    M.updatedAt = new Date().toISOString();
    const put = () => ghApi('contents/' + MENU_PATH, { method: 'PUT', body: { message: 'Menü güncellendi (yönetim paneli)', content: b64enc(JSON.stringify(M, null, 2)), sha: menuSha } });
    try { menuSha = (await put()).content.sha; }
    catch (e) {
      if (e.status !== 409 && e.status !== 422) throw e;
      menuSha = (await ghApi('contents/' + MENU_PATH)).sha; // dosya başka yerden değişmiş: güncel sürümün üzerine yaz
      menuSha = (await put()).content.sha;
    }
  }
  async function uploadImage(dataUrl) {
    if (mode === 'server') return (await api('upload', { method: 'POST', body: { dataUrl } })).url;
    const [, type, b64] = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-1', bytes))].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
    const name = hash + '.' + (type === 'jpeg' ? 'jpg' : type);
    try { await ghApi('contents/public/uploads/' + name, { method: 'PUT', body: { message: 'Fotoğraf yüklendi: ' + name, content: b64 } }); }
    catch (e) { if (e.status !== 422) throw e; } // aynı fotoğraf zaten yüklü
    const url = 'uploads/' + name;
    localImg[url] = dataUrl;
    return url;
  }
  async function listUploads() {
    if (mode === 'server') return api('uploads');
    const list = await ghApi('contents/public/uploads');
    return list.filter(f => /\.(webp|jpe?g|png)$/i.test(f.name)).map(f => 'uploads/' + f.name);
  }

  /* ── Kaydetme ── */
  let saveTimer = null, saving = false, pending = false;
  function save() {
    setSaveState('saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, mode === 'github' ? 1200 : 450);
  }
  async function flush() {
    saveTimer = null;
    if (saving) { pending = true; return; }
    saving = true;
    try {
      await saveMenu();
      setSaveState('saved');
    } catch (e) {
      setSaveState('error');
      toast('Kaydedilemedi: ' + e.message, true);
    } finally {
      saving = false;
      if (pending) { pending = false; flush(); }
    }
  }
  function setSaveState(s) {
    const el = $('#save-state');
    if (!el) return;
    el.className = 'save-state ' + s;
    const savedLabel = mode === 'github' ? 'Kaydedildi · menü 1-2 dk içinde güncellenir' : 'Tüm değişiklikler kaydedildi';
    el.innerHTML = '<i></i>' + ({ saving: 'Kaydediliyor…', saved: savedLabel, error: 'Kaydedilemedi — tekrar denenecek' }[s]);
    if (s === 'error') setTimeout(save, 4000);
  }
  window.addEventListener('beforeunload', e => { if (saving || saveTimer && $('#save-state')?.classList.contains('saving')) { e.preventDefault(); e.returnValue = ''; } });

  function toast(msg, err) {
    const el = document.createElement('div');
    el.className = 'toast' + (err ? ' err' : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, err ? 4500 : 2400);
  }

  /* ── Giriş ── */
  function renderLogin(msg) {
    root.innerHTML = `<div class="login"><form class="login-card" id="login">
      <h1>Barcode</h1><p>Menü Yönetim Paneli</p>
      <label class="field"><span>Yönetici Şifresi</span><input class="input" type="password" name="pw" autocomplete="current-password" required autofocus></label>
      ${msg ? `<div class="warn-box">${esc(msg)}</div>` : ''}
      <button class="btn" style="width:100%">Giriş Yap</button>
      <p class="hint" style="margin:14px 0 0;text-align:center"><a href="./" style="color:var(--sea)">← Menüyü görüntüle</a></p>
    </form></div>`;
    $('#login').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('button', e.target); btn.disabled = true; btn.textContent = 'Kontrol ediliyor…';
      try {
        const r = await api('login', { method: 'POST', body: { password: e.target.pw.value } });
        token = r.token; isDefaultPw = r.isDefault; ls.set('bb-admin-token', token); ls.set('bb-admin-default', isDefaultPw ? '1' : null);
        await boot();
      } catch (err) { renderLogin(err.message); }
    });
  }
  function logout() {
    if (mode === 'github') { gh = gh && { owner: gh.owner, repo: gh.repo }; ls.set('bb-gh', null); return renderGhLogin(); }
    token = null; ls.set('bb-admin-token', null); renderLogin();
  }

  // GitHub Pages girişi: depoya yazma izni olan kişisel erişim anahtarı (token)
  function renderGhLogin(msg) {
    const onPages = location.hostname.endsWith('github.io');
    const owner = gh?.owner || (onPages ? location.hostname.split('.')[0] : '');
    const repo = gh?.repo || (onPages ? location.pathname.split('/')[1] || owner + '.github.io' : '');
    root.innerHTML = `<div class="login"><form class="login-card" id="ghlogin" style="max-width:440px">
      <h1>Barcode</h1><p>Menü Yönetim Paneli</p>
      <div class="grid2">
        <label class="field"><span>GitHub kullanıcı adı</span><input class="input" name="owner" value="${esc(owner)}" required></label>
        <label class="field"><span>Depo (repo)</span><input class="input" name="repo" value="${esc(repo)}" required></label>
      </div>
      <label class="field"><span>Erişim anahtarı (token)</span><input class="input" type="password" name="token" autocomplete="off" required placeholder="github_pat_…"></label>
      ${msg ? `<div class="warn-box">${esc(msg)}</div>` : ''}
      <button class="btn" style="width:100%">Giriş Yap</button>
      <p class="hint" style="margin:14px 0 0">Anahtar yalnızca bu tarayıcıda saklanır. Yeni anahtar için:
        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="color:var(--sea)">GitHub › Fine-grained token</a>
        → Repository access: bu depo → Permissions: <b>Contents: Read and write</b>.</p>
      <p class="hint" style="margin:10px 0 0;text-align:center"><a href="./" style="color:var(--sea)">← Menüyü görüntüle</a></p>
    </form></div>`;
    $('#ghlogin').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target, btn = $('button', f);
      btn.disabled = true; btn.textContent = 'Kontrol ediliyor…';
      gh = { owner: f.owner.value.trim(), repo: f.repo.value.trim(), token: f.token.value.trim() };
      try {
        const info = await ghApi('');
        if (!info.permissions?.push) throw new Error('Bu anahtarın depoya yazma izni yok (Contents: Read and write gerekli).');
        ls.set('bb-gh', JSON.stringify(gh));
        await boot();
      } catch (err) { renderGhLogin(err.message); }
    });
  }

  /* ── Kabuk ── */
  const NAV = [
    ['products', 'Ürünler', I.products], ['categories', 'Kategoriler', I.cats], ['allergens', 'Alerjenler', I.allergens],
    ['settings', 'Ayarlar', I.settings], ['qr', 'QR Kod', I.qr],
  ];
  function renderShell() {
    root.innerHTML = `<div class="shell">
      <aside class="side">
        <div class="brand"><b>${esc(M.settings.name)}</b><span>Menü Yönetimi</span></div>
        ${NAV.map(([id, label, ic]) => `<button class="nav-btn" data-nav="${id}" aria-current="${view === id ? 'page' : 'false'}">${ic}<span>${label}</span>${id === 'products' ? `<span class="count">${M.products.length}</span>` : id === 'categories' ? `<span class="count">${M.categories.length}</span>` : ''}</button>`).join('')}
        <div class="side-foot">
          <a href="./" target="_blank" rel="noopener">${I.eye}Menüyü Aç</a>
          <button data-act="logout">${I.out}Çıkış Yap</button>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>`;
    renderView();
  }
  function head(title, extra = '') {
    return `<div class="page-head"><h1>${title}</h1>${extra}<span id="save-state" class="save-state saved"><i></i>Tüm değişiklikler kaydedildi</span>
      <a class="icon-b mobile-only" href="./" target="_blank" title="Menüyü aç">${I.eye}</a></div>
      ${isDefaultPw ? `<div class="warn-box">⚠ Varsayılan şifre kullanılıyor. Güvenlik için <a href="#" data-nav="settings" style="color:inherit">Ayarlar</a> bölümünden şifrenizi değiştirin.</div>` : ''}`;
  }
  function renderView() {
    $$('.nav-btn').forEach(b => b.setAttribute('aria-current', b.dataset.nav === view ? 'page' : 'false'));
    const main = $('#main');
    main.style.animation = 'none'; void main.offsetWidth; main.style.animation = 'fade .35s both';
    ({ products: viewProducts, categories: viewCategories, allergens: viewAllergens, settings: viewSettings, qr: viewQR })[view]();
  }

  /* ── Ortak bileşenler ── */
  const catName = id => M.categories.find(c => c.id === id)?.name.tr || '—';
  const groupName = id => M.groups.find(g => g.id === id)?.name.tr || '—';
  const thumb = (src, label, cls = '') => `<div class="thumb ${cls}">${src ? `<img src="${esc(imgUrl(src))}" alt="" loading="lazy">` : esc((label || '?').charAt(0))}</div>`;
  const sw = (name, checked, label, cls = '') => `<label class="switch ${cls}"><input type="checkbox" data-sw="${name}" ${checked ? 'checked' : ''}><span class="track"></span>${label ? `<span class="switch-label">${label}</span>` : ''}</label>`;
  // Üç dilli alan: TR / EN / RU
  const LANGS = ['tr', 'en', 'ru'];
  const bi = (key, obj, label, opts = {}) => `<div class="grid3">
      ${LANGS.map(l => `<label class="field"><span>${label}<span class="lang-tag">${l.toUpperCase()}</span></span>${opts.area
        ? `<textarea class="input" name="${key}.${l}" rows="3">${esc(obj?.[l])}</textarea>`
        : `<input class="input" name="${key}.${l}" value="${esc(obj?.[l])}" ${opts.req && l === 'tr' ? 'required' : ''}>`}</label>`).join('')}
    </div>`;
  const val = (form, name) => form.elements[name]?.value.trim() ?? '';
  // Formdan üç dilli nesne oku; boş EN/RU, TR ile doldurulur
  const tri = (form, key, fill = true) => {
    const tr = val(form, key + '.tr');
    return { tr, en: val(form, key + '.en') || (fill ? tr : ''), ru: val(form, key + '.ru') || (fill ? val(form, key + '.en') || tr : '') };
  };

  /* ── Modal ── */
  let modalCleanup = null;
  function openModal(html, { size = '', onMount } = {}) {
    panel.className = 'modal-panel ' + size;
    panel.onclick = null;
    panel.innerHTML = html;
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    modalCleanup = onMount ? onMount(panel) : null;
    setTimeout(() => $('input:not([type=file]):not([type=checkbox]), textarea', panel)?.focus({ preventScroll: true }), 60);
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.classList.add('closing');
    setTimeout(() => { modal.hidden = true; modal.classList.remove('closing'); panel.innerHTML = ''; document.documentElement.style.overflow = ''; modalCleanup?.(); modalCleanup = null; }, 200);
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  const mHead = t => `<div class="modal-head"><h2>${t}</h2><button type="button" class="icon-b" data-close aria-label="Kapat">${I.close}</button></div>`;

  // Onay penceresi: açık düzenleyicinin üstünde ayrı bir katman
  function confirmBox(title, text, okLabel = 'Sil', danger = true) {
    return new Promise(resolve => {
      const box = document.createElement('div');
      box.className = 'modal confirm';
      box.style.zIndex = 70;
      box.innerHTML = `<div class="modal-backdrop" data-c="0"></div><div class="modal-panel sm" role="alertdialog" aria-modal="true">
        <div class="modal-head"><h2>${title}</h2></div>
        <div class="modal-body"><p style="margin:0;line-height:1.55">${text}</p></div>
        <div class="modal-foot"><span class="spacer"></span><button class="btn ghost" data-c="0">Vazgeç</button><button class="btn ${danger ? 'terra' : ''}" data-c="1">${okLabel}</button></div></div>`;
      document.body.appendChild(box);
      $('[data-c="1"]', box).focus();
      const done = v => {
        box.classList.add('closing');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => box.remove(), 200);
        resolve(v);
      };
      const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
      document.addEventListener('keydown', onKey, true);
      box.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) done(b.dataset.c === '1'); });
    });
  }

  /* ── Görsel işleme ── */
  async function processImage(file, max = 1200) {
    if (!/^image\//.test(file.type)) throw new Error('Lütfen bir görsel dosyası seçin');
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    let url = c.toDataURL('image/webp', 0.82);
    if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.85);
    return url;
  }
  async function uploadFile(file, max) {
    const dataUrl = await processImage(file, max);
    return uploadImage(dataUrl);
  }

  // Fotoğraf alanı: tıkla/sürükle-bırak/galeri/kaldır
  function photoField(id, src, shape = '') {
    return `<div class="photo-field" data-photo="${id}">
      <div class="photo ${shape}" tabindex="0" role="button" aria-label="Fotoğraf yükle">
        ${src ? `<img src="${esc(imgUrl(src))}" alt="">` : `<div class="ph-empty">${I.photo}Fotoğraf yükle<small>Tıklayın veya sürükleyip bırakın</small></div>`}
      </div>
      <input type="file" accept="image/*" hidden>
      <input type="hidden" name="${id}" value="${esc(src)}">
      <div class="photo-actions">
        <button type="button" class="btn ghost sm" data-ph="gallery">Galeriden Seç</button>
        ${src ? `<button type="button" class="btn danger sm" data-ph="remove">Kaldır</button>` : ''}
      </div>
    </div>`;
  }
  function bindPhotoFields(scope, max) {
    $$('.photo-field', scope).forEach(pf => {
      const box = $('.photo', pf), file = $('input[type=file]', pf), hidden = $('input[type=hidden]', pf);
      const shape = [...box.classList].filter(c => c !== 'photo').join(' ');
      const set = url => {
        hidden.value = url || '';
        const fresh = document.createElement('div');
        fresh.innerHTML = photoField(pf.dataset.photo, url, shape);
        pf.replaceWith(fresh.firstElementChild);
        bindPhotoFields(scope, max);
      };
      const handle = async f => {
        if (!f) return;
        box.insertAdjacentHTML('beforeend', '<div class="busy">Yükleniyor…</div>');
        try { set(await uploadFile(f, max)); toast('Fotoğraf yüklendi'); }
        catch (e) { toast(e.message, true); $('.busy', box)?.remove(); }
      };
      box.onclick = () => file.click();
      box.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } };
      file.onchange = () => handle(file.files[0]);
      box.ondragover = e => { e.preventDefault(); box.classList.add('drag'); };
      box.ondragleave = () => box.classList.remove('drag');
      box.ondrop = e => { e.preventDefault(); box.classList.remove('drag'); handle(e.dataTransfer.files[0]); };
      pf.onclick = async e => {
        const b = e.target.closest('[data-ph]');
        if (!b) return;
        if (b.dataset.ph === 'remove') set('');
        if (b.dataset.ph === 'gallery') {
          const list = await listUploads().catch(e => { toast(e.message, true); return []; });
          const g = document.createElement('div');
          g.className = 'gallery-pop';
          g.style.cssText = 'margin-top:10px;max-height:300px;overflow:auto;padding:10px;border:1px solid var(--line);border-radius:14px;background:var(--card)';
          g.innerHTML = `<div class="gallery">${list.map(u => `<button type="button" data-pick="${esc(u)}"><img src="${esc(u)}" loading="lazy" alt=""></button>`).join('')}</div>`;
          $('.gallery-pop', pf)?.remove();
          pf.appendChild(g);
          g.onclick = ev => { const p = ev.target.closest('[data-pick]'); if (p) set(p.dataset.pick); };
        }
      };
    });
  }

  /* ══════════ ÜRÜNLER ══════════ */
  function viewProducts() {
    const main = $('#main');
    const total = M.products.length;
    const active = M.products.filter(p => p.active !== false).length;
    const out = M.products.filter(p => p.soldOut).length;
    const noPhoto = M.products.filter(p => !p.img).length;
    main.innerHTML = head('Ürünler', `<button class="btn ghost" data-act="bulk">${I.percent}Toplu Fiyat</button><button class="btn" data-act="new-product">${I.plus}Yeni Ürün</button>`) + `
      <div class="stats">
        <div class="stat"><b>${total}</b><span>Toplam ürün</span></div>
        <div class="stat"><b>${active}</b><span>Menüde görünen</span></div>
        <div class="stat"><b>${out}</b><span>Tükendi</span></div>
        <div class="stat"><b>${noPhoto}</b><span>Fotoğrafsız</span></div>
      </div>
      <div class="toolbar">
        <label class="search">${I.search}<input class="input" id="q" placeholder="Ürün ara (TR / EN)…" value="${esc(filt.q)}"></label>
        <select class="select" id="fcat">
          <option value="all">Tüm kategoriler</option>
          <option value="__out" ${filt.cat === '__out' ? 'selected' : ''}>• Sadece tükenenler</option>
          <option value="__nophoto" ${filt.cat === '__nophoto' ? 'selected' : ''}>• Fotoğrafı olmayanlar</option>
          ${M.groups.map(g => `<optgroup label="${esc(g.name.tr)}">${M.categories.filter(c => c.group === g.id).map(c => `<option value="${esc(c.id)}" ${filt.cat === c.id ? 'selected' : ''}>${esc(c.name.tr)}</option>`).join('')}</optgroup>`).join('')}
        </select>
      </div>
      <div class="card" id="plist"></div>
      <p class="hint" style="margin-top:12px">İpucu: Fiyatı doğrudan listede değiştirebilirsiniz. Sıralamayı değiştirmek için ⋮⋮ tutamacından sürükleyin.</p>`;
    $('#q').addEventListener('input', e => { filt.q = e.target.value; renderProductList(); });
    $('#fcat').addEventListener('change', e => { filt.cat = e.target.value; renderProductList(); });
    renderProductList();
  }

  function renderProductList() {
    const box = $('#plist');
    const q = norm(filt.q.trim());
    const match = p => (!q || norm(p.name.tr + ' ' + p.name.en).includes(q)) &&
      (filt.cat === 'all' || (filt.cat === '__out' ? p.soldOut : filt.cat === '__nophoto' ? !p.img : p.cat === filt.cat));
    const canDrag = !q && !filt.cat.startsWith('__');
    let html = '';
    for (const c of M.categories) {
      const ps = M.products.filter(p => p.cat === c.id && match(p));
      if (!ps.length) continue;
      html += `<div class="group-label">${esc(c.name.tr)} <small>· ${esc(groupName(c.group))} · ${ps.length} ürün</small></div>`;
      html += ps.map(p => productRow(p, canDrag)).join('');
    }
    const orphans = M.products.filter(p => !M.categories.some(c => c.id === p.cat) && match(p));
    if (orphans.length) html += `<div class="group-label">Kategorisiz</div>` + orphans.map(p => productRow(p, false)).join('');
    box.innerHTML = html || `<div class="empty">Ürün bulunamadı.</div>`;
  }

  function productRow(p, canDrag) {
    const hasVar = p.variants && p.variants.length;
    const als = (p.allergens || []).map(id => M.allergens.find(a => a.id === id)?.icon).filter(Boolean).join('');
    return `<div class="row ${p.active === false ? 'inactive' : ''}" data-id="${esc(p.id)}" ${canDrag ? 'draggable="true"' : ''}>
      ${canDrag ? `<span class="handle" title="Sürükle">${I.grip}</span>` : ''}
      ${thumb(p.img, p.name.tr)}
      <div class="row-main" data-act="edit-product">
        <div class="row-title">${esc(p.name.tr)}${p.soldOut ? '<span class="badge out">Tükendi</span>' : ''}${p.active === false ? '<span class="badge off">Gizli</span>' : ''}${(p.tags || []).includes('chef') ? '<span class="badge">★ Şef</span>' : ''}</div>
        <div class="row-sub">${esc(p.name.en)}${als ? ` · <span class="al">${als}</span>` : ''}</div>
      </div>
      <div class="row-price">${hasVar
        ? `<button class="btn ghost sm" data-act="edit-product">${p.variants.length} seçenek</button>`
        : `<input inputmode="decimal" data-price value="${p.price ?? ''}" placeholder="—" aria-label="Fiyat">`}</div>
      <div class="row-actions">
        ${sw('active', p.active !== false, 'Menüde')}
        ${sw('soldOut', p.soldOut, 'Tükendi', 'warn')}
        <button class="icon-b" data-act="edit-product" title="Düzenle">${I.edit}</button>
        <button class="icon-b del" data-act="del-product" title="Sil">${I.trash}</button>
      </div>
    </div>`;
  }

  // Liste etkileşimleri (anahtar, hızlı fiyat, sürükle-bırak)
  document.addEventListener('change', e => {
    const row = e.target.closest('#plist .row');
    if (!row) return;
    const p = M.products.find(x => x.id === row.dataset.id);
    if (!p) return;
    if (e.target.dataset.sw) {
      p[e.target.dataset.sw] = e.target.checked;
      if (e.target.dataset.sw === 'active') row.classList.toggle('inactive', !p.active);
      const title = $('.row-title', row);
      title.innerHTML = `${esc(p.name.tr)}${p.soldOut ? '<span class="badge out">Tükendi</span>' : ''}${p.active === false ? '<span class="badge off">Gizli</span>' : ''}${(p.tags || []).includes('chef') ? '<span class="badge">★ Şef</span>' : ''}`;
      save();
    }
    if (e.target.matches('[data-price]')) {
      const n = num(e.target.value);
      if (e.target.value.trim() && n == null) { toast('Geçerli bir fiyat girin', true); e.target.value = p.price ?? ''; return; }
      p.price = n; save(); toast(`${p.name.tr}: ${money(n)}`);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-price]')) e.target.blur(); });

  let dragId = null;
  document.addEventListener('dragstart', e => {
    const row = e.target.closest?.('#plist .row[draggable]');
    if (!row) return;
    dragId = row.dataset.id; row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
  });
  document.addEventListener('dragover', e => {
    const row = e.target.closest?.('#plist .row[draggable]');
    if (!row || !dragId) return;
    const a = M.products.find(p => p.id === dragId), b = M.products.find(p => p.id === row.dataset.id);
    if (!a || !b || a.cat !== b.cat) return;
    e.preventDefault();
    $$('.drop-before').forEach(r => r.classList.remove('drop-before'));
    if (row.dataset.id !== dragId) row.classList.add('drop-before');
  });
  document.addEventListener('drop', e => {
    const row = e.target.closest?.('#plist .row[draggable]');
    if (!row || !dragId) return;
    e.preventDefault();
    const from = M.products.findIndex(p => p.id === dragId);
    const [item] = M.products.splice(from, 1);
    const to = M.products.findIndex(p => p.id === row.dataset.id);
    M.products.splice(to, 0, item);
    save(); renderProductList();
  });
  document.addEventListener('dragend', () => { dragId = null; $$('.dragging,.drop-before').forEach(r => r.classList.remove('dragging', 'drop-before')); });

  /* Ürün düzenleyici */
  function productEditor(p) {
    const isNew = !p;
    const d = p ? JSON.parse(JSON.stringify(p)) : {
      id: '', cat: filt.cat !== 'all' && !filt.cat.startsWith('__') ? filt.cat : M.categories[0]?.id, name: { tr: '', en: '' }, desc: { tr: '', en: '' },
      price: null, variants: [], img: '', allergens: [], tags: [], active: true, soldOut: false,
    };
    let mode = d.variants.length ? 'var' : 'single';

    const variantRows = () => (d.variants.length ? d.variants : [{ label: { tr: '', en: '' }, price: '' }]).map((v, i) => `
      <div class="variant-row" data-vi="${i}">
        <input class="input" placeholder="Seçenek (TR) örn. 70 cl Şişe" data-v="tr" value="${esc(v.label.tr)}">
        <input class="input" placeholder="Option (EN) e.g. 70 cl Bottle" data-v="en" value="${esc(v.label.en)}">
        <input class="input" placeholder="RU напр. Бутылка 0,7 л" data-v="ru" value="${esc(v.label.ru)}">
        <div class="price-input vp"><input class="input" inputmode="decimal" placeholder="Fiyat" data-v="price" value="${v.price ?? ''}"></div>
        <button type="button" class="icon-b del" data-vdel="${i}" title="Seçeneği sil">${I.trash}</button>
      </div>`).join('');

    const html = `<form id="pform" style="display:contents">
      ${mHead(isNew ? 'Yeni Ürün' : 'Ürünü Düzenle')}
      <div class="modal-body">
        <div class="pe-top">
          <div>${photoField('img', d.img)}</div>
          <div>
            ${bi('name', d.name, 'Ürün adı', { req: true })}
            <label class="field"><span>Kategori</span><select class="select" name="cat">
              ${M.groups.map(g => `<optgroup label="${esc(g.name.tr)}">${M.categories.filter(c => c.group === g.id).map(c => `<option value="${esc(c.id)}" ${d.cat === c.id ? 'selected' : ''}>${esc(c.name.tr)}</option>`).join('')}</optgroup>`).join('')}
            </select></label>
            <div class="seg" role="group" aria-label="Fiyat tipi">
              <button type="button" data-mode="single" aria-pressed="${mode === 'single'}">Tek fiyat</button>
              <button type="button" data-mode="var" aria-pressed="${mode === 'var'}">Seçenekli (boy / kadeh / şişe)</button>
            </div>
            <div id="price-single" ${mode === 'var' ? 'hidden' : ''}>
              <label class="field"><span>Fiyat</span><div class="price-input"><input class="input" name="price" inputmode="decimal" value="${d.price ?? ''}" placeholder="Boş bırakılırsa “Garsona sorunuz” yazar"></div></label>
            </div>
            <div id="price-var" ${mode === 'single' ? 'hidden' : ''}>
              <div id="vrows">${variantRows()}</div>
              <button type="button" class="btn ghost sm" data-act-v="add">${I.plus}Seçenek ekle</button>
            </div>
          </div>
        </div>
        <div class="section-h">Açıklama</div>
        ${bi('desc', d.desc, 'Açıklama / içerik', { area: true })}
        <div class="section-h">Alerjenler</div>
        <div class="checks">${M.allergens.map(a => `<label class="check"><input type="checkbox" name="al" value="${esc(a.id)}" ${d.allergens.includes(a.id) ? 'checked' : ''}><i>${a.icon}</i>${esc(a.name.tr)}</label>`).join('')}</div>
        <div class="section-h">Etiketler</div>
        <div class="checks">${Object.entries(TAGS).map(([k, v]) => `<label class="check tagc"><input type="checkbox" name="tag" value="${k}" ${d.tags.includes(k) ? 'checked' : ''}>${v}</label>`).join('')}</div>
        <div class="section-h">Durum</div>
        <div style="display:flex;gap:22px;flex-wrap:wrap">
          <label class="switch"><input type="checkbox" name="active" ${d.active !== false ? 'checked' : ''}><span class="track"></span>Menüde göster</label>
          <label class="switch warn"><input type="checkbox" name="soldOut" ${d.soldOut ? 'checked' : ''}><span class="track"></span>Tükendi olarak işaretle</label>
        </div>
      </div>
      <div class="modal-foot">
        ${isNew ? '' : `<button type="button" class="btn danger" data-act-p="delete">${I.trash}<span>Sil</span></button><button type="button" class="btn ghost" data-act-p="dup">${I.copy}<span>Kopyala</span></button>`}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-close>Vazgeç</button>
        <button class="btn">Kaydet</button>
      </div>
    </form>`;

    const readVariants = () => $$('#vrows .variant-row', panel).map(r => ({
      label: {
        tr: $('[data-v=tr]', r).value.trim(),
        en: $('[data-v=en]', r).value.trim() || $('[data-v=tr]', r).value.trim(),
        ru: $('[data-v=ru]', r).value.trim() || $('[data-v=en]', r).value.trim() || $('[data-v=tr]', r).value.trim(),
      },
      price: num($('[data-v=price]', r).value),
    }));

    const mount = () => {
      bindPhotoFields(panel);
      const form = $('#pform', panel);
      panel.onclick = async e => {
        const m = e.target.closest('[data-mode]');
        if (m) {
          mode = m.dataset.mode;
          $$('[data-mode]', panel).forEach(b => b.setAttribute('aria-pressed', b === m));
          $('#price-single', panel).hidden = mode !== 'single';
          $('#price-var', panel).hidden = mode !== 'var';
          return;
        }
        if (e.target.closest('[data-act-v="add"]')) {
          d.variants = readVariants(); d.variants.push({ label: { tr: '', en: '' }, price: '' });
          $('#vrows', panel).innerHTML = variantRows(); $$('#vrows [data-v=tr]', panel).pop().focus();
          return;
        }
        const vd = e.target.closest('[data-vdel]');
        if (vd) { d.variants = readVariants(); d.variants.splice(+vd.dataset.vdel, 1); $('#vrows', panel).innerHTML = variantRows(); return; }
        const ap = e.target.closest('[data-act-p]');
        if (ap?.dataset.actP === 'delete') {
          if (await confirmBox('Ürünü sil', `<b>${esc(p.name.tr)}</b> menüden kalıcı olarak silinsin mi?`)) {
            M.products = M.products.filter(x => x.id !== p.id); save(); closeModal(); renderView(); toast('Ürün silindi');
          }
        }
        if (ap?.dataset.actP === 'dup') {
          const copy = JSON.parse(JSON.stringify(p));
          copy.id = uid(p.name.tr); copy.name.tr += ' (kopya)'; copy.name.en += ' (copy)';
          M.products.splice(M.products.indexOf(p) + 1, 0, copy); save(); closeModal(); renderView();
          setTimeout(() => productEditor(copy), 260); toast('Ürün kopyalandı');
        }
      };
      form.onsubmit = e => {
        e.preventDefault();
        const nameTr = val(form, 'name.tr');
        if (!nameTr) { toast('Ürün adı zorunludur', true); return; }
        const out = {
          ...d,
          cat: form.cat.value,
          name: tri(form, 'name'),
          desc: tri(form, 'desc', false),
          img: form.img.value,
          allergens: $$('input[name=al]:checked', form).map(i => i.value),
          tags: $$('input[name=tag]:checked', form).map(i => i.value),
          active: form.active.checked,
          soldOut: form.soldOut.checked,
        };
        if (mode === 'var') {
          const vs = readVariants().filter(v => v.label.tr);
          if (!vs.length) { toast('En az bir seçenek girin', true); return; }
          if (vs.some(v => v.price == null)) { toast('Her seçenek için fiyat girin', true); return; }
          out.variants = vs; out.price = null;
        } else {
          const raw = val(form, 'price');
          const n = num(raw);
          if (raw && n == null) { toast('Geçerli bir fiyat girin', true); return; }
          out.price = n; out.variants = [];
        }
        if (isNew) {
          out.id = uid(nameTr);
          const lastIdx = M.products.map(x => x.cat).lastIndexOf(out.cat);
          M.products.splice(lastIdx + 1, 0, out);
        } else {
          Object.assign(M.products.find(x => x.id === p.id), out);
        }
        save(); closeModal(); renderView(); toast(isNew ? 'Ürün eklendi' : 'Ürün güncellendi');
      };
    };
    openModal(html, { onMount: mount });
  }

  /* Toplu fiyat güncelleme */
  function bulkPrice() {
    const html = `<form id="bform" style="display:contents">${mHead('Toplu Fiyat Güncelleme')}
      <div class="modal-body">
        <label class="field"><span>Hangi ürünler?</span><select class="select" name="scope">
          <option value="all">Tüm menü</option>
          ${M.groups.map(g => `<option value="g:${esc(g.id)}">Grup: ${esc(g.name.tr)}</option>`).join('')}
          ${M.categories.map(c => `<option value="c:${esc(c.id)}">Kategori: ${esc(c.name.tr)}</option>`).join('')}
        </select></label>
        <div class="grid3">
          <label class="field"><span>Yöntem</span><select class="select" name="mode"><option value="pct">Yüzde (%)</option><option value="add">Sabit tutar (₺)</option></select></label>
          <label class="field"><span>Değer</span><input class="input" name="value" inputmode="decimal" value="10"><small>İndirim için eksi yazın (örn. -5)</small></label>
          <label class="field"><span>Yuvarla</span><select class="select" name="round"><option value="1">Yok</option><option value="5">5 ₺</option><option value="10" selected>10 ₺</option><option value="50">50 ₺</option></select></label>
        </div>
        <div class="section-h">Önizleme</div>
        <div id="bprev" class="panel" style="padding:8px 16px;margin:0"></div>
      </div>
      <div class="modal-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Vazgeç</button><button class="btn terra">Fiyatları Güncelle</button></div></form>`;
    openModal(html, {
      onMount: () => {
        const form = $('#bform', panel);
        const pick = () => {
          const s = form.scope.value;
          return M.products.filter(p => s === 'all' || (s.startsWith('g:') ? M.categories.find(c => c.id === p.cat)?.group === s.slice(2) : p.cat === s.slice(2)));
        };
        const calc = v => {
          const x = num(form.value.value) || 0, r = +form.round.value;
          if (v == null) return v;
          const raw = form.mode.value === 'pct' ? v * (1 + x / 100) : v + x;
          return Math.max(0, Math.round(raw / r) * r);
        };
        const prev = () => {
          const ps = pick();
          const lines = [];
          ps.forEach(p => {
            if (p.variants?.length) p.variants.forEach(v => lines.push([`${p.name.tr} · ${v.label.tr}`, v.price, calc(v.price)]));
            else if (p.price != null) lines.push([p.name.tr, p.price, calc(p.price)]);
          });
          $('#bprev', panel).innerHTML = lines.length
            ? lines.slice(0, 8).map(([n, a, b]) => `<div class="preview-line"><span>${esc(n)}</span><span><s>${money(a)}</s><b>${money(b)}</b></span></div>`).join('') + (lines.length > 8 ? `<div class="preview-line"><span class="hint">… ve ${lines.length - 8} fiyat daha</span></div>` : '')
            : '<div class="empty" style="padding:16px">Seçili kapsamda fiyatlı ürün yok.</div>';
        };
        form.oninput = prev; prev();
        form.onsubmit = async e => {
          e.preventDefault();
          const ps = pick();
          ps.forEach(p => {
            if (p.variants?.length) p.variants.forEach(v => { v.price = calc(v.price); });
            else if (p.price != null) p.price = calc(p.price);
          });
          save(); closeModal(); renderView(); toast(`${ps.length} ürünün fiyatı güncellendi`);
        };
      },
    });
  }

  /* ══════════ KATEGORİLER ══════════ */
  function viewCategories() {
    const main = $('#main');
    main.innerHTML = head('Kategoriler', `<button class="btn ghost" data-act="new-group">${I.plus}Yeni Grup</button><button class="btn" data-act="new-cat">${I.plus}Yeni Kategori</button>`) +
      M.groups.map((g, gi) => {
        const cs = M.categories.filter(c => c.group === g.id);
        return `<div class="card" style="margin-bottom:16px">
          <div class="group-label" style="font-size:13px">
            <span style="flex:1">${esc(g.name.tr)} <small>· ${esc(g.name.en)} · ${cs.length} kategori</small></span>
            <button class="icon-b" data-act="group-up" data-g="${esc(g.id)}" ${gi === 0 ? 'disabled' : ''} title="Yukarı taşı">${I.up}</button>
            <button class="icon-b" data-act="group-down" data-g="${esc(g.id)}" ${gi === M.groups.length - 1 ? 'disabled' : ''} title="Aşağı taşı">${I.down}</button>
            <button class="icon-b" data-act="edit-group" data-g="${esc(g.id)}" title="Grubu düzenle">${I.edit}</button>
          </div>
          <div class="cat-grid">
            ${cs.map((c, i) => {
              const n = M.products.filter(p => p.cat === c.id).length;
              const img = c.img || M.products.find(p => p.cat === c.id && p.img)?.img;
              return `<div class="cat-card ${c.active === false ? 'inactive' : ''}" data-cat="${esc(c.id)}" tabindex="0">
                <div class="move">
                  <button class="icon-b" data-act="cat-left" ${i === 0 ? 'disabled' : ''} title="Öne al">${I.left}</button>
                  <button class="icon-b" data-act="cat-right" ${i === cs.length - 1 ? 'disabled' : ''} title="Sona al">${I.right}</button>
                </div>
                <div class="arch">${img ? `<img src="${esc(imgUrl(img))}" alt="" loading="lazy">` : esc(c.name.tr.charAt(0))}</div>
                <b>${esc(c.name.tr)}</b><small>${n} ürün${c.active === false ? ' · Gizli' : ''}</small>
              </div>`;
            }).join('') || '<div class="empty">Bu grupta kategori yok.</div>'}
          </div>
        </div>`;
      }).join('');
  }

  function catEditor(c) {
    const isNew = !c;
    const d = c ? { ...c } : { id: '', group: M.groups[0]?.id, name: { tr: '', en: '' }, img: '', active: true };
    const count = c ? M.products.filter(p => p.cat === c.id).length : 0;
    openModal(`<form id="cform" style="display:contents">${mHead(isNew ? 'Yeni Kategori' : 'Kategoriyi Düzenle')}
      <div class="modal-body">
        <div class="pe-top" style="grid-template-columns:180px 1fr">
          <div>${photoField('img', d.img, 'arch')}<p class="hint">Boş bırakılırsa ilk ürünün fotoğrafı kullanılır.</p></div>
          <div>
            ${bi('name', d.name, 'Kategori adı', { req: true })}
            <label class="field"><span>Grup</span><select class="select" name="group">${M.groups.map(g => `<option value="${esc(g.id)}" ${d.group === g.id ? 'selected' : ''}>${esc(g.name.tr)}</option>`).join('')}</select></label>
            <label class="switch"><input type="checkbox" name="active" ${d.active !== false ? 'checked' : ''}><span class="track"></span>Menüde göster</label>
            ${isNew ? '' : `<p class="hint" style="margin-top:14px">Bu kategoride <b>${count}</b> ürün var.</p>`}
          </div>
        </div>
      </div>
      <div class="modal-foot">${isNew ? '' : `<button type="button" class="btn danger" data-act-c="delete">${I.trash}Sil</button>`}<span class="spacer"></span><button type="button" class="btn ghost" data-close>Vazgeç</button><button class="btn">Kaydet</button></div></form>`, {
      size: 'sm',
      onMount: () => {
        panel.classList.remove('sm');
        bindPhotoFields(panel, 1000);
        const form = $('#cform', panel);
        panel.onclick = async e => {
          if (!e.target.closest('[data-act-c="delete"]')) return;
          const msg = count ? `<b>${esc(c.name.tr)}</b> kategorisi ve içindeki <b>${count} ürün</b> silinecek. Emin misiniz?` : `<b>${esc(c.name.tr)}</b> kategorisi silinsin mi?`;
          if (await confirmBox('Kategoriyi sil', msg)) {
            M.categories = M.categories.filter(x => x.id !== c.id);
            M.products = M.products.filter(p => p.cat !== c.id);
            save(); closeModal(); renderShell(); toast('Kategori silindi');
          }
        };
        form.onsubmit = e => {
          e.preventDefault();
          const tr = val(form, 'name.tr');
          if (!tr) return toast('Kategori adı zorunludur', true);
          const out = { ...d, name: tri(form, 'name'), group: form.group.value, img: form.img.value, active: form.active.checked };
          if (isNew) { out.id = uid(tr); M.categories.push(out); }
          else Object.assign(M.categories.find(x => x.id === c.id), out);
          save(); closeModal(); renderShell(); toast(isNew ? 'Kategori eklendi' : 'Kategori güncellendi');
        };
      },
    });
  }

  function groupEditor(g) {
    const isNew = !g;
    const d = g ? { ...g } : { id: '', name: { tr: '', en: '' } };
    const count = g ? M.categories.filter(c => c.group === g.id).length : 0;
    openModal(`<form id="gform" style="display:contents">${mHead(isNew ? 'Yeni Grup' : 'Grubu Düzenle')}
      <div class="modal-body">
        <p class="hint" style="margin-top:0">Gruplar menünün ana sekmeleridir (ör. Yemekler, Alkollü İçecekler).</p>
        ${bi('name', d.name, 'Grup adı', { req: true })}
      </div>
      <div class="modal-foot">${isNew ? '' : `<button type="button" class="btn danger" data-act-g="delete" ${count ? 'disabled title="Önce kategorileri taşıyın"' : ''}>${I.trash}Sil</button>`}<span class="spacer"></span><button type="button" class="btn ghost" data-close>Vazgeç</button><button class="btn">Kaydet</button></div></form>`, {
      size: 'sm',
      onMount: () => {
        const form = $('#gform', panel);
        panel.onclick = async e => {
          if (!e.target.closest('[data-act-g="delete"]')) return;
          if (await confirmBox('Grubu sil', `<b>${esc(g.name.tr)}</b> grubu silinsin mi?`)) {
            M.groups = M.groups.filter(x => x.id !== g.id); save(); closeModal(); renderView(); toast('Grup silindi');
          }
        };
        form.onsubmit = e => {
          e.preventDefault();
          const tr = val(form, 'name.tr');
          if (!tr) return toast('Grup adı zorunludur', true);
          const out = { ...d, name: tri(form, 'name') };
          if (isNew) { out.id = uid(tr); M.groups.push(out); } else Object.assign(M.groups.find(x => x.id === g.id), out);
          save(); closeModal(); renderView(); toast('Grup kaydedildi');
        };
      },
    });
  }

  function moveIn(arr, item, dir, sameAs) {
    const peers = arr.filter(sameAs);
    const i = peers.indexOf(item);
    const other = peers[i + dir];
    if (!other) return;
    const a = arr.indexOf(item), b = arr.indexOf(other);
    [arr[a], arr[b]] = [arr[b], arr[a]];
    save(); renderView();
  }

  /* ══════════ ALERJENLER ══════════ */
  function viewAllergens() {
    const main = $('#main');
    main.innerHTML = head('Alerjenler', `<button class="btn" data-act="new-al">${I.plus}Yeni Alerjen</button>`) + `
      <p class="hint" style="margin:-4px 0 14px">Türk Gıda Kodeksi / AB 14 alerjen listesi hazır yüklüdür. İkon olarak herhangi bir emoji kullanabilirsiniz.</p>
      <div class="card">${M.allergens.map((a, i) => {
        const n = M.products.filter(p => (p.allergens || []).includes(a.id)).length;
        return `<div class="row al-row" data-al="${esc(a.id)}">
          <div class="emoji">${a.icon}</div>
          <div class="row-main" data-act="edit-al"><div class="row-title">${esc(a.name.tr)}</div><div class="row-sub">${esc(a.name.en)} · ${n} üründe</div></div>
          <div class="row-actions">
            <button class="icon-b" data-act="al-up" ${i === 0 ? 'disabled' : ''} title="Yukarı">${I.up}</button>
            <button class="icon-b" data-act="al-down" ${i === M.allergens.length - 1 ? 'disabled' : ''} title="Aşağı">${I.down}</button>
            <button class="icon-b" data-act="al-products" title="Ürünlere ata">${I.products}</button>
            <button class="icon-b" data-act="edit-al" title="Düzenle">${I.edit}</button>
            <button class="icon-b del" data-act="del-al" title="Sil">${I.trash}</button>
          </div>
        </div>`;
      }).join('')}</div>`;
  }

  function alEditor(a) {
    const isNew = !a;
    const d = a ? { ...a } : { id: '', icon: '⚠️', name: { tr: '', en: '' } };
    openModal(`<form id="aform" style="display:contents">${mHead(isNew ? 'Yeni Alerjen' : 'Alerjeni Düzenle')}
      <div class="modal-body">
        <label class="field" style="max-width:140px"><span>İkon (emoji)</span><input class="input" name="icon" value="${esc(d.icon)}" maxlength="8" style="font-size:24px;text-align:center"></label>
        ${bi('name', d.name, 'Alerjen adı', { req: true })}
      </div>
      <div class="modal-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Vazgeç</button><button class="btn">Kaydet</button></div></form>`, {
      size: 'sm',
      onMount: () => {
        const form = $('#aform', panel);
        form.onsubmit = e => {
          e.preventDefault();
          const tr = val(form, 'name.tr');
          if (!tr) return toast('Alerjen adı zorunludur', true);
          const out = { ...d, icon: val(form, 'icon') || '⚠️', name: tri(form, 'name') };
          if (isNew) { out.id = uid(tr); M.allergens.push(out); } else Object.assign(M.allergens.find(x => x.id === a.id), out);
          save(); closeModal(); renderView(); toast('Alerjen kaydedildi');
        };
      },
    });
  }

  // Bir alerjeni hangi ürünlerin içerdiğini toplu seç
  function alAssign(a) {
    openModal(`<form id="asform" style="display:contents">${mHead(`${a.icon} ${esc(a.name.tr)} içeren ürünler`)}
      <div class="modal-body">
        <label class="search" style="position:relative;display:block;margin-bottom:12px"><input class="input" id="asq" placeholder="Ürün ara…"></label>
        ${M.categories.map(c => {
          const ps = M.products.filter(p => p.cat === c.id);
          if (!ps.length) return '';
          return `<div class="section-h">${esc(c.name.tr)}</div><div class="checks">${ps.map(p => `<label class="check" data-n="${esc(norm(p.name.tr + ' ' + p.name.en))}"><input type="checkbox" name="p" value="${esc(p.id)}" ${(p.allergens || []).includes(a.id) ? 'checked' : ''}>${esc(p.name.tr)}</label>`).join('')}</div>`;
        }).join('')}
      </div>
      <div class="modal-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Vazgeç</button><button class="btn">Kaydet</button></div></form>`, {
      onMount: () => {
        const form = $('#asform', panel);
        $('#asq', panel).oninput = e => { const q = norm(e.target.value); $$('.check', panel).forEach(l => { l.style.display = !q || l.dataset.n.includes(q) ? '' : 'none'; }); };
        form.onsubmit = e => {
          e.preventDefault();
          const on = new Set($$('input[name=p]:checked', form).map(i => i.value));
          M.products.forEach(p => {
            const has = (p.allergens || []).includes(a.id);
            if (on.has(p.id) && !has) p.allergens = [...(p.allergens || []), a.id];
            if (!on.has(p.id) && has) p.allergens = p.allergens.filter(x => x !== a.id);
          });
          save(); closeModal(); renderView(); toast(`${on.size} üründe ${a.name.tr} işaretli`);
        };
      },
    });
  }

  /* ══════════ AYARLAR ══════════ */
  function viewSettings() {
    const s = M.settings;
    const main = $('#main');
    const repoUrl = gh ? `https://github.com/${esc(gh.owner)}/${esc(gh.repo)}` : '';
    main.innerHTML = head('Ayarlar') + `
      <form id="sform">
        <div class="panel"><h3>Karşılama Ekranı</h3>
          <p class="hint" style="margin-top:-6px">QR okutulunca ilk açılan ekran. Arka plan fotoğrafı yoksa animasyonlu Akdeniz gün batımı gösterilir.</p>
          <div class="pe-top" style="grid-template-columns:260px 1fr">
            <div>${photoField('welcomeBg', s.welcomeBg, 'wide')}</div>
            <div>
              <label class="field"><span>WhatsApp numarası</span><input class="input" name="whatsapp" value="${esc(s.whatsapp)}" placeholder="905xxxxxxxxx"><small>Ülke koduyla, boşluksuz (ör. 905066092261)</small></label>
              <label class="field"><span>Instagram kullanıcı adı</span><input class="input" name="instagram" value="${esc(s.instagram)}" placeholder="barcodebeachbogazkent"></label>
              <label class="field"><span>Google Maps / değerlendirme linki</span><input class="input" name="mapsUrl" value="${esc(s.mapsUrl)}" placeholder="https://g.page/r/…/review"></label>
              ${s.welcomeFx ? `<label class="switch" style="margin-top:4px"><input type="checkbox" name="fx" ${s.welcomeFx.enabled ? 'checked' : ''}><span class="track"></span>Hareketli efektler (nargile dumanı, kabarcıklar, deniz)</label>
              <p class="hint" style="margin:6px 0 0">Efektler mevcut fotoğrafa göre konumlandı; fotoğrafı değiştirirseniz otomatik kapanır.</p>` : ''}
            </div>
          </div>
          <div class="grid2">
            <label class="field"><span>Wi-Fi adı</span><input class="input" name="wifiName" value="${esc(s.wifiName)}"></label>
            <label class="field"><span>Wi-Fi şifresi</span><input class="input" name="wifiPass" value="${esc(s.wifiPass)}"><small>Boşsa “şifreyi garsona sorun” yazar</small></label>
          </div>
        </div>
        <div class="panel"><h3>İşletme Bilgileri</h3>
          <div class="grid2">
            <label class="field"><span>İşletme adı</span><input class="input" name="name" value="${esc(s.name)}"></label>
            <label class="field"><span>Para birimi simgesi</span><input class="input" name="currency" value="${esc(s.currency)}" maxlength="4"></label>
            <label class="field"><span>Telefon</span><input class="input" name="phone" value="${esc(s.phone)}" placeholder="+90 5xx xxx xx xx"></label>
            <label class="field"><span>Adres</span><input class="input" name="address" value="${esc(s.address)}"></label>
          </div>
          ${bi('subtitle', s.subtitle, 'Alt başlık')}
          ${bi('location', s.location, 'Konum etiketi')}
          ${bi('welcome', s.welcome, 'Karşılama cümlesi')}
        </div>
        <div class="panel"><h3>Menü Kapak Fotoğrafı</h3>
          <p class="hint" style="margin-top:-6px">Menü ana sayfasının üst kısmı. Boş bırakırsanız animasyonlu gün batımı kullanılır.</p>
          <div style="max-width:420px">${photoField('hero', s.hero, 'wide')}</div>
        </div>
        <div class="panel"><h3>Alerjen / Bilgilendirme Notu</h3>${bi('note', s.note, 'Not', { area: true })}</div>
      </form>

      ${mode === 'github' ? `
      <div class="panel"><h3>GitHub Bağlantısı</h3>
        <p class="hint" style="margin-top:-6px">Kaydettiğiniz her değişiklik <a href="${repoUrl}" target="_blank" rel="noopener" style="color:var(--sea)">${esc(gh.owner)}/${esc(gh.repo)}</a> deposuna yazılır ve menü 1-2 dakika içinde yayına girer.
          Eski sürümlere <a href="${repoUrl}/commits/main/public/data/menu.json" target="_blank" rel="noopener" style="color:var(--sea)">değişiklik geçmişinden</a> ulaşabilirsiniz.</p>
        <div class="toolbar" style="margin:0">
          <a class="btn ghost" href="${repoUrl}/actions" target="_blank" rel="noopener">Yayın durumunu gör</a>
          <button class="btn danger" data-act="logout">Bu cihazdan çıkış yap</button>
        </div>
      </div>` : `
      <div class="panel"><h3>Yönetici Şifresi</h3>
        <form id="pwform" class="grid3" style="align-items:end">
          <label class="field" style="margin:0"><span>Mevcut şifre</span><input class="input" type="password" name="current" autocomplete="current-password" required></label>
          <label class="field" style="margin:0"><span>Yeni şifre (en az 6)</span><input class="input" type="password" name="next" autocomplete="new-password" minlength="6" required></label>
          <button class="btn">Şifreyi Değiştir</button>
        </form>
      </div>`}

      <div class="panel"><h3>Yedekler</h3>
        ${mode === 'server' ? `<p class="hint" style="margin-top:-6px">Her kayıttan önce otomatik yedek alınır (son 30 yedek saklanır).</p>
        <div class="toolbar">
          <select class="select" id="bk"><option>Yükleniyor…</option></select>
          <button class="btn ghost" data-act="restore">Yedeği Geri Yükle</button>
        </div>` : ''}
        <div class="toolbar" style="margin:0">
          <button class="btn ghost" data-act="export">Menüyü Dışa Aktar (JSON)</button>
          <label class="btn ghost" style="cursor:pointer">İçe Aktar (JSON)<input type="file" accept="application/json" id="imp" hidden></label>
        </div>
      </div>`;

    bindPhotoFields(main, 1800);
    const form = $('#sform');
    const apply = () => {
      const g = n => val(form, n);
      if (s.welcomeFx) {
        // Fotoğraf değiştiyse efekt konumları artık tutmaz: kapat
        if (form.welcomeBg.value !== (s.welcomeBg || '')) { s.welcomeFx.enabled = false; if (form.fx) form.fx.checked = false; }
        else if (form.fx) s.welcomeFx.enabled = form.fx.checked;
      }
      Object.assign(s, {
        name: g('name') || 'Barcode', currency: g('currency') || '₺',
        subtitle: tri(form, 'subtitle'), location: tri(form, 'location'), welcome: tri(form, 'welcome'),
        hero: form.hero.value, welcomeBg: form.welcomeBg.value,
        phone: g('phone'), instagram: g('instagram'), whatsapp: g('whatsapp').replace(/\D/g, ''), mapsUrl: g('mapsUrl'),
        wifiName: g('wifiName'), wifiPass: g('wifiPass'), address: g('address'),
        note: tri(form, 'note'),
      });
      save();
    };
    form.addEventListener('change', apply);
    // Fotoğraf alanları değişince (gizli input) kaydet
    new MutationObserver(() => {
      if ((form.hero && form.hero.value !== (s.hero || '')) || (form.welcomeBg && form.welcomeBg.value !== (s.welcomeBg || ''))) apply();
    }).observe(form, { childList: true, subtree: true });

    if (mode === 'server') {
      $('#pwform').onsubmit = async e => {
        e.preventDefault();
        try {
          const r = await api('password', { method: 'POST', body: { current: e.target.current.value, next: e.target.next.value } });
          token = r.token; ls.set('bb-admin-token', token); isDefaultPw = false; ls.set('bb-admin-default', null);
          e.target.reset(); toast('Şifre değiştirildi'); renderView();
        } catch (err) { toast(err.message, true); }
      };
      api('backups').then(list => {
        $('#bk').innerHTML = list.length ? list.map(f => {
          const m = f.match(/menu-(\d{4})-(\d\d)-(\d\d)T(\d\d)-(\d\d)-(\d\d)/);
          const label = m ? new Date(Date.UTC(m[1], m[2] - 1, m[3], m[4], m[5], m[6])).toLocaleString('tr-TR') : f;
          return `<option value="${esc(f)}">${esc(label)}</option>`;
        }).join('') : '<option value="">Henüz yedek yok</option>';
      }).catch(() => {});
    }
    $('#imp').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data.products || !data.categories || !data.allergens || !data.groups || !data.settings) throw new Error('Dosya Barcode menü formatında değil');
        if (!(await confirmBox('Menüyü içe aktar', `Mevcut menü, dosyadaki <b>${data.products.length} ürün</b> ile değiştirilecek.`, 'İçe Aktar', false))) return;
        M = data; save(); renderShell(); toast('Menü içe aktarıldı');
      } catch (err) { toast(err.message, true); }
    };
  }

  /* ══════════ QR KOD ══════════ */
  function viewQR() {
    const main = $('#main');
    const base = ls.get('bb-qr-url') || location.origin + location.pathname.replace(/admin(\.html)?\/?$/, '');
    main.innerHTML = head('QR Kod') + `
      <div class="qr-wrap">
        <div class="qr-card" id="qrcard">
          <h3>${esc(M.settings.name)}</h3><p>${esc(M.settings.subtitle?.tr)}</p>
          <div class="qr" id="qrbox"></div>
          <div class="scan">Menü için okutun · Scan for menu</div>
          <div class="table-no" id="tno" hidden></div>
        </div>
        <div>
          <div class="panel"><h3>QR Ayarları</h3>
            <label class="field"><span>Menü adresi (URL)</span><input class="input" id="qurl" value="${esc(base)}"><small>Siteyi yayına aldığınızda kendi alan adınızı yazın (ör. https://menu.barcodebeach.com).</small></label>
            <label class="field" style="max-width:200px"><span>Masa no (isteğe bağlı)</span><input class="input" id="qtable" inputmode="numeric" placeholder="örn. 12"></label>
            <div class="toolbar" style="margin:0"><button class="btn" data-act="qr-png">PNG İndir</button><a class="btn ghost" id="qopen" target="_blank" rel="noopener">Bağlantıyı Aç</a></div>
          </div>
          <div class="panel"><h3>Masa Kartları Yazdır</h3>
            <p class="hint" style="margin-top:-6px">Her masa için numaralı QR kart oluşturur ve yazdırma penceresini açar.</p>
            <div class="toolbar" style="margin:0">
              <input class="input" id="tfrom" inputmode="numeric" value="1" style="max-width:110px" aria-label="İlk masa">
              <span style="font-weight:700">–</span>
              <input class="input" id="tto" inputmode="numeric" value="20" style="max-width:110px" aria-label="Son masa">
              <button class="btn ghost" data-act="qr-print">Yazdır</button>
            </div>
          </div>
        </div>
      </div>`;
    const draw = () => {
      const url = qrUrl();
      ls.set('bb-qr-url', $('#qurl').value.trim());
      $('#qrbox').innerHTML = qrSvg(url);
      $('#qopen').href = url;
      const t = $('#qtable').value.trim();
      $('#tno').hidden = !t; $('#tno').textContent = 'Masa ' + t;
    };
    $('#qurl').oninput = draw; $('#qtable').oninput = draw;
    draw();
  }
  function qrUrl(table) {
    const u = ($('#qurl')?.value || '').trim() || location.origin;
    const t = table ?? $('#qtable')?.value.trim();
    return t ? u + (u.includes('?') ? '&' : '?') + 'masa=' + encodeURIComponent(t) : u;
  }
  function qrSvg(text, size = 210) {
    if (typeof qrcode !== 'function') return '<div class="hint" style="width:210px;color:#333">QR kütüphanesi yüklenemedi (internet bağlantısı gerekli).</div>';
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), cell = size / n;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${(c * cell).toFixed(2)} ${(r * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges"><path d="${d}" fill="#0a3a52"/></svg>`;
  }
  async function qrPng() {
    const W = 900, H = 1200, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a3a52'); g.addColorStop(1, '#0f6172');
    x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, W, H, 60); x.fill();
    await document.fonts.ready;
    x.fillStyle = '#fff'; x.textAlign = 'center';
    x.font = '700 110px Fraunces, Georgia, serif'; x.fillText(M.settings.name, W / 2, 190);
    x.font = '600 30px Manrope, sans-serif'; x.globalAlpha = .8; x.fillText((M.settings.subtitle?.tr || '').toUpperCase().split('').join(' '), W / 2, 250); x.globalAlpha = 1;
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect(170, 310, 560, 560, 40); x.fill();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qrSvg(qrUrl(), 500));
    await img.decode();
    x.drawImage(img, 200, 340, 500, 500);
    x.fillStyle = '#fff'; x.font = '700 38px Manrope, sans-serif'; x.fillText('Menü için okutun · Scan for menu', W / 2, 960);
    const t = $('#qtable').value.trim();
    if (t) { x.fillStyle = '#f0b23f'; x.beginPath(); x.roundRect(W / 2 - 140, 1010, 280, 80, 40); x.fill(); x.fillStyle = '#0a3a52'; x.font = '800 40px Manrope, sans-serif'; x.fillText('Masa ' + t, W / 2, 1064); }
    // dalga
    x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.moveTo(0, H - 90);
    for (let i = 0; i <= W; i += 10) x.lineTo(i, H - 90 + Math.sin(i / 60) * 18);
    x.lineTo(W, H); x.lineTo(0, H); x.fill();
    const a = document.createElement('a');
    a.download = `barcode-qr${t ? '-masa-' + t : ''}.png`;
    a.href = cv.toDataURL('image/png'); a.click();
  }
  function qrPrint() {
    const from = parseInt($('#tfrom').value, 10) || 1, to = Math.min(parseInt($('#tto').value, 10) || from, from + 199);
    const cards = [];
    for (let t = from; t <= to; t++) cards.push(`<div class="c"><h1>${esc(M.settings.name)}</h1><p>${esc(M.settings.subtitle?.tr)}</p><div class="q">${qrSvg(qrUrl(String(t)), 180)}</div><div class="s">Menü için okutun · Scan for menu</div><div class="t">Masa ${t}</div></div>`);
    const w = window.open('', '_blank');
    if (!w) return toast('Açılır pencere engellendi — tarayıcıdan izin verin', true);
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Masa QR Kartları</title>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Manrope:wght@600;800&display=swap" rel="stylesheet">
      <style>@page{size:A4;margin:10mm}body{margin:0;font-family:Manrope,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}.c{break-inside:avoid;background:linear-gradient(170deg,#0a3a52,#0f6172);color:#fff;border-radius:16px;padding:14px 10px;text-align:center}
      h1{margin:0;font:700 26px Fraunces,serif}p{margin:0 0 8px;font-size:9px;letter-spacing:.3em;text-transform:uppercase;opacity:.8}
      .q{background:#fff;border-radius:12px;padding:8px;display:inline-block}.q svg{display:block;width:150px;height:150px}.s{font-size:10px;font-weight:600;margin-top:8px}
      .t{display:inline-block;margin-top:6px;background:#f0b23f;color:#0a3a52;font-weight:800;border-radius:99px;padding:3px 12px;font-size:12px}</style></head>
      <body><div class="g">${cards.join('')}</div><script>document.fonts.ready.then(()=>setTimeout(()=>print(),300))<\/script></body></html>`);
    w.document.close();
  }

  /* ── Genel tıklama yönlendirici ── */
  document.addEventListener('click', async e => {
    if (e.target.closest('.modal')) return;
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); view = nav.dataset.nav; ls.set('bb-admin-view', view); renderView(); window.scrollTo(0, 0); return; }
    const catCard = e.target.closest('.cat-card');
    const a = e.target.closest('[data-act]');
    if (!a && catCard) return catEditor(M.categories.find(c => c.id === catCard.dataset.cat));
    if (!a) return;
    const act = a.dataset.act;
    const row = a.closest('.row');
    const p = row && M.products.find(x => x.id === row.dataset.id);
    const al = row && M.allergens.find(x => x.id === row.dataset.al);
    const cat = catCard && M.categories.find(c => c.id === catCard.dataset.cat);
    const grp = a.dataset.g && M.groups.find(g => g.id === a.dataset.g);
    switch (act) {
      case 'logout': return logout();
      case 'new-product': return productEditor(null);
      case 'edit-product': return p && productEditor(p);
      case 'del-product':
        if (p && await confirmBox('Ürünü sil', `<b>${esc(p.name.tr)}</b> menüden kalıcı olarak silinsin mi?`)) {
          M.products = M.products.filter(x => x !== p); save(); renderView(); toast('Ürün silindi');
        }
        return;
      case 'bulk': return bulkPrice();
      case 'new-cat': return catEditor(null);
      case 'new-group': return groupEditor(null);
      case 'edit-group': return groupEditor(grp);
      case 'group-up': return moveIn(M.groups, grp, -1, () => true);
      case 'group-down': return moveIn(M.groups, grp, 1, () => true);
      case 'cat-left': e.stopPropagation(); return moveIn(M.categories, cat, -1, c => c.group === cat.group);
      case 'cat-right': e.stopPropagation(); return moveIn(M.categories, cat, 1, c => c.group === cat.group);
      case 'new-al': return alEditor(null);
      case 'edit-al': return al && alEditor(al);
      case 'al-up': return moveIn(M.allergens, al, -1, () => true);
      case 'al-down': return moveIn(M.allergens, al, 1, () => true);
      case 'al-products': return al && alAssign(al);
      case 'del-al': {
        const n = M.products.filter(x => (x.allergens || []).includes(al.id)).length;
        if (await confirmBox('Alerjeni sil', `<b>${esc(al.name.tr)}</b> silinsin mi?${n ? ` ${n} üründen de kaldırılacak.` : ''}`)) {
          M.allergens = M.allergens.filter(x => x !== al);
          M.products.forEach(x => { x.allergens = (x.allergens || []).filter(id => id !== al.id); });
          save(); renderView(); toast('Alerjen silindi');
        }
        return;
      }
      case 'restore': {
        const f = $('#bk').value;
        if (!f) return;
        if (await confirmBox('Yedeği geri yükle', `Menü, <b>${esc($('#bk').selectedOptions[0].text)}</b> tarihli yedeğe döndürülecek. Mevcut hali de yedeklenir.`, 'Geri Yükle', false)) {
          try { await api('restore', { method: 'POST', body: { file: f } }); M = await api('menu'); renderShell(); toast('Yedek geri yüklendi'); }
          catch (err) { toast(err.message, true); }
        }
        return;
      }
      case 'export': {
        const blob = new Blob([JSON.stringify(M, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = `barcode-menu-${new Date().toISOString().slice(0, 10)}.json`; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        return;
      }
      case 'qr-png': return qrPng().catch(err => toast('PNG oluşturulamadı: ' + err.message, true));
      case 'qr-print': return qrPrint();
    }
  });
  document.addEventListener('keydown', e => {
    const c = e.target.closest?.('.cat-card');
    if (c && (e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); catEditor(M.categories.find(x => x.id === c.dataset.cat)); }
  });

  /* ── Başlat ── */
  async function boot() {
    isDefaultPw = mode === 'server' && ls.get('bb-admin-default') === '1';
    M = await loadMenu();
    renderShell();
  }
  detectMode().then(m => {
    mode = m;
    if (mode === 'github') {
      if (gh?.token) boot().catch(e => renderGhLogin(e.message)); else renderGhLogin();
    } else if (token) boot().catch(() => renderLogin());
    else renderLogin();
  });
})();
