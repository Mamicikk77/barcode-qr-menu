// Barcode Beach QR Menü sunucusu — bağımlılık yok, sadece Node.js (v18+).
// Çalıştır:  node server.js        → http://localhost:3000  (menü)  /admin (yönetim)
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const UPLOADS = path.join(PUBLIC, 'uploads');
const DATA = path.join(ROOT, 'data');
const MENU_FILE = path.join(PUBLIC, 'data', 'menu.json');
const AUTH_FILE = path.join(DATA, 'auth.json');
const BACKUPS = path.join(DATA, 'backups');
const DEFAULT_PASSWORD = 'barcode2026';
const TOKEN_TTL = 1000 * 60 * 60 * 12; // 12 saat

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

for (const d of [DATA, UPLOADS, BACKUPS]) fs.mkdirSync(d, { recursive: true });

/* ── Şifre / oturum ─────────────────────────────── */
function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
function loadAuth() {
  if (!fs.existsSync(AUTH_FILE)) {
    const a = { ...hashPassword(DEFAULT_PASSWORD), secret: crypto.randomBytes(32).toString('hex'), isDefault: true };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(a, null, 2));
  }
  return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
}
let auth = loadAuth();

function checkPassword(pw) {
  const { hash } = hashPassword(String(pw || ''), auth.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(auth.hash, 'hex'));
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', auth.secret).update(body).digest('base64url');
  return body + '.' + sig;
}
function verify(token) {
  if (!token || !token.includes('.')) return false;
  const [body, sig] = token.split('.');
  const good = crypto.createHmac('sha256', auth.secret).update(body).digest('base64url');
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
const authed = req => verify((req.headers.authorization || '').replace(/^Bearer /, ''));

// Basit kaba kuvvet koruması: IP başına 15 dakikada 10 hatalı deneme
const fails = new Map();
function tooMany(ip) {
  const f = fails.get(ip);
  return f && f.count >= 10 && Date.now() - f.first < 15 * 60 * 1000;
}
function noteFail(ip) {
  const f = fails.get(ip);
  if (!f || Date.now() - f.first > 15 * 60 * 1000) fails.set(ip, { count: 1, first: Date.now() });
  else f.count++;
}

/* ── Yardımcılar ─────────────────────────────── */
function send(res, code, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}
function readBody(req, limit = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}
async function writeAtomic(file, text) {
  const tmp = file + '.tmp';
  await fsp.writeFile(tmp, text);
  await fsp.rename(tmp, file);
}
async function backupMenu() {
  if (!fs.existsSync(MENU_FILE)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await fsp.copyFile(MENU_FILE, path.join(BACKUPS, `menu-${stamp}.json`));
  const list = (await fsp.readdir(BACKUPS)).filter(f => f.endsWith('.json')).sort();
  for (const old of list.slice(0, Math.max(0, list.length - 30))) await fsp.unlink(path.join(BACKUPS, old)).catch(() => {});
}
function validMenu(m) {
  return m && typeof m === 'object' && m.settings && Array.isArray(m.categories) && Array.isArray(m.products)
    && Array.isArray(m.allergens) && Array.isArray(m.groups);
}

/* ── API ─────────────────────────────── */
async function api(req, res, url) {
  const ip = req.socket.remoteAddress;
  const route = req.method + ' ' + url.pathname;

  if (route === 'GET /api/menu') {
    return send(res, 200, await fsp.readFile(MENU_FILE, 'utf8'));
  }
  if (route === 'POST /api/login') {
    if (tooMany(ip)) return send(res, 429, { error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' });
    const { password } = await readBody(req, 10_000);
    if (!checkPassword(password)) { noteFail(ip); return send(res, 401, { error: 'Şifre hatalı' }); }
    fails.delete(ip);
    return send(res, 200, { token: sign({ exp: Date.now() + TOKEN_TTL }), isDefault: !!auth.isDefault });
  }

  if (!authed(req)) return send(res, 401, { error: 'Oturum süresi doldu, tekrar giriş yapın.' });

  if (route === 'PUT /api/menu') {
    const menu = await readBody(req, 5 * 1024 * 1024);
    if (!validMenu(menu)) return send(res, 400, { error: 'Geçersiz menü verisi' });
    menu.updatedAt = new Date().toISOString();
    await backupMenu();
    await writeAtomic(MENU_FILE, JSON.stringify(menu, null, 2));
    return send(res, 200, { ok: true, updatedAt: menu.updatedAt });
  }
  if (route === 'POST /api/upload') {
    const { dataUrl } = await readBody(req);
    const m = /^data:image\/(webp|jpeg|png);base64,(.+)$/.exec(dataUrl || '');
    if (!m) return send(res, 400, { error: 'Desteklenmeyen görsel' });
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const buf = Buffer.from(m[2], 'base64');
    const name = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 24) + '.' + ext;
    await fsp.writeFile(path.join(UPLOADS, name), buf);
    return send(res, 200, { url: 'uploads/' + name });
  }
  if (route === 'GET /api/uploads') {
    const files = (await fsp.readdir(UPLOADS)).filter(f => /\.(webp|jpe?g|png)$/i.test(f));
    const withTime = await Promise.all(files.map(async f => ({ f, t: (await fsp.stat(path.join(UPLOADS, f))).mtimeMs })));
    return send(res, 200, withTime.sort((a, b) => b.t - a.t).map(x => 'uploads/' + x.f));
  }
  if (route === 'POST /api/password') {
    const { current, next } = await readBody(req, 10_000);
    if (!checkPassword(current)) return send(res, 401, { error: 'Mevcut şifre hatalı' });
    if (!next || String(next).length < 6) return send(res, 400, { error: 'Yeni şifre en az 6 karakter olmalı' });
    auth = { ...hashPassword(String(next)), secret: crypto.randomBytes(32).toString('hex'), isDefault: false };
    await writeAtomic(AUTH_FILE, JSON.stringify(auth, null, 2));
    return send(res, 200, { ok: true, token: sign({ exp: Date.now() + TOKEN_TTL }) });
  }
  if (route === 'GET /api/backups') {
    const list = (await fsp.readdir(BACKUPS)).filter(f => f.endsWith('.json')).sort().reverse();
    return send(res, 200, list);
  }
  if (route === 'POST /api/restore') {
    const { file } = await readBody(req, 10_000);
    const safe = path.basename(String(file || ''));
    const src = path.join(BACKUPS, safe);
    if (!safe.endsWith('.json') || !fs.existsSync(src)) return send(res, 404, { error: 'Yedek bulunamadı' });
    await backupMenu();
    await fsp.copyFile(src, MENU_FILE);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Bulunamadı' });
}

/* ── Statik dosyalar ─────────────────────────────── */
async function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === '/' ) p = '/index.html';
  if (p === '/admin/') { res.writeHead(301, { Location: '/admin' }); return res.end(); }
  if (p === '/admin') p = '/admin.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });
  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) throw new Error();
    const ext = path.extname(file).toLowerCase();
    const cache = p.startsWith('/uploads/') ? 'public, max-age=2592000, immutable' : 'no-cache';
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  } catch {
    send(res, 404, 'Sayfa bulunamadı', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Sunucu hatası: ' + e.message });
  }
}).listen(PORT, () => {
  console.log(`\n  🌊 Barcode Beach QR Menü hazır`);
  console.log(`  Menü   → http://localhost:${PORT}`);
  console.log(`  Yönetim→ http://localhost:${PORT}/admin`);
  if (auth.isDefault) console.log(`  ⚠  Varsayılan yönetici şifresi: ${DEFAULT_PASSWORD}  (giriş yapıp Ayarlar'dan değiştirin)\n`);
});
