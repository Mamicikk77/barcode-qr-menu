/* Barcode Beach · Müşteri QR menüsü */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const sheet = $('#sheet');
  const sheetBody = $('.sheet-body', sheet);

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* gizli sekme */ } },
  };

  let M = null; // menü verisi
  const LANGS = ['tr', 'en', 'ru'];
  const navLang = (navigator.language || 'tr').toLowerCase().slice(0, 2);
  let lang = store.get('bb-lang', LANGS.includes(navLang) ? navLang : 'en');
  if (!LANGS.includes(lang)) lang = 'tr';
  let excluded = new Set(store.get('bb-exclude', []));
  let lastRoute = '';

  const UI = {
    tr: {
      search: 'Menüde ara…', categories: 'Kategoriler', featured: 'Şefin Önerileri', items: 'ürün', from: 'başlayan',
      info: 'Bilgiler', wifi: 'Wi-Fi', password: 'Şifre', copy: 'Kopyala', copied: 'Kopyalandı', phone: 'Telefon', address: 'Adres',
      allergens: 'Alerjenler', noAllergen: 'Bilinen alerjen içermez', options: 'Seçenekler', filter: 'Alerjen Filtresi',
      filterSub: 'Seçtiğiniz alerjenleri içeren ürünleri gizleriz.', apply: 'Uygula', clear: 'Temizle', hidden: n => `${n} ürün alerjen filtresiyle gizlendi`,
      show: 'Göster', noResult: 'Sonuç bulunamadı', typeToSearch: 'Ürün, içerik veya kategori yazın', soldOut: 'Tükendi', askWaiter: 'Garsona sorunuz',
      back: 'Geri', close: 'Kapat', top: 'Yukarı', tags: { chef: 'Şefin Önerisi', veg: 'Vejetaryen', vegan: 'Vegan', spicy: 'Acı', new: 'Yeni' },
      viewMenu: 'Menüyü Görüntüle', whatsapp: 'WhatsApp', instagram: 'Instagram', review: 'Değerlendir', network: 'Ağ adı',
      wifiAsk: 'Wi-Fi şifresi için lütfen garsonumuza danışın.', welcomeHint: 'Hoş geldiniz',
    },
    en: {
      search: 'Search the menu…', categories: 'Categories', featured: "Chef's Picks", items: 'items', from: 'from',
      info: 'Information', wifi: 'Wi-Fi', password: 'Password', copy: 'Copy', copied: 'Copied', phone: 'Phone', address: 'Address',
      allergens: 'Allergens', noAllergen: 'No known allergens', options: 'Options', filter: 'Allergen Filter',
      filterSub: 'We’ll hide dishes that contain the allergens you select.', apply: 'Apply', clear: 'Clear', hidden: n => `${n} items hidden by allergen filter`,
      show: 'Show', noResult: 'No results found', typeToSearch: 'Type a dish, ingredient or category', soldOut: 'Sold out', askWaiter: 'Ask your waiter',
      back: 'Back', close: 'Close', top: 'Top', tags: { chef: "Chef's Pick", veg: 'Vegetarian', vegan: 'Vegan', spicy: 'Spicy', new: 'New' },
      viewMenu: 'View Menu', whatsapp: 'WhatsApp', instagram: 'Instagram', review: 'Rate Us', network: 'Network',
      wifiAsk: 'Please ask your waiter for the Wi-Fi password.', welcomeHint: 'Welcome',
    },
    ru: {
      search: 'Поиск по меню…', categories: 'Категории', featured: 'Рекомендации шефа', items: 'поз.', from: 'от',
      info: 'Информация', wifi: 'Wi-Fi', password: 'Пароль', copy: 'Копировать', copied: 'Скопировано', phone: 'Телефон', address: 'Адрес',
      allergens: 'Аллергены', noAllergen: 'Известных аллергенов нет', options: 'Варианты', filter: 'Фильтр аллергенов',
      filterSub: 'Мы скроем блюда, содержащие выбранные аллергены.', apply: 'Применить', clear: 'Сбросить', hidden: n => `Скрыто фильтром аллергенов: ${n}`,
      show: 'Показать', noResult: 'Ничего не найдено', typeToSearch: 'Введите блюдо, ингредиент или категорию', soldOut: 'Нет в наличии', askWaiter: 'Уточните у официанта',
      back: 'Назад', close: 'Закрыть', top: 'Наверх', tags: { chef: 'Выбор шефа', veg: 'Вегетарианское', vegan: 'Веганское', spicy: 'Острое', new: 'Новинка' },
      viewMenu: 'Открыть меню', whatsapp: 'WhatsApp', instagram: 'Instagram', review: 'Оценить', network: 'Сеть',
      wifiAsk: 'Пароль от Wi-Fi можно узнать у официанта.', welcomeHint: 'Добро пожаловать',
    },
  };
  const u = () => UI[lang];
  const tx = o => (o ? o[lang] || (lang === 'ru' ? o.en : '') || o.tr || o.en || '' : '');
  const alt = o => { const other = lang === 'tr' ? 'en' : 'tr'; const a = o && o[other]; return a && a !== tx(o) ? a : ''; };
  // CSS değişkenindeki göreli adres stil dosyasına göre çözülür; tam adrese çevir
  const absUrl = p => new URL(p, location.href).href;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => new Intl.NumberFormat('tr-TR').format(n) + ' ' + (M.settings.currency || '₺');
  const norm = s => String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');

  const icon = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  };
  const waveRow = d => `<svg viewBox="0 0 1440 90" preserveAspectRatio="none" class="${d.cls}"><path d="M0 ${d.y} C 180 ${d.y - d.a}, 360 ${d.y + d.a}, 720 ${d.y} S 1260 ${d.y - d.a}, 1440 ${d.y} V90 H0Z"/></svg>`;
  const WAVES = `<div class="waves" aria-hidden="true">${waveRow({ cls: 'w1', y: 40, a: 22 })}${waveRow({ cls: 'w2', y: 52, a: 16 })}${waveRow({ cls: 'w3', y: 64, a: 12 })}</div>`;

  /* ── Veri yardımcıları ── */
  const cats = () => M.categories.filter(c => c.active !== false);
  const prods = catId => M.products.filter(p => p.cat === catId && p.active !== false);
  const catById = id => M.categories.find(c => c.id === id);
  const prodById = id => M.products.find(p => p.id === id);
  const allergen = id => M.allergens.find(a => a.id === id);
  const hiddenByFilter = p => p.allergens && p.allergens.some(a => excluded.has(a));
  const minPrice = p => (p.variants && p.variants.length ? Math.min(...p.variants.map(v => +v.price || 0)) : p.price);
  function priceHtml(p) {
    if (p.variants && p.variants.length > 1) return `<span class="price"><small>${u().from}</small>${money(minPrice(p))}</span>`;
    if (p.variants && p.variants.length === 1) return `<span class="price">${money(p.variants[0].price)}</span>`;
    if (p.price == null || p.price === '') return `<span class="price"><small>${u().askWaiter}</small></span>`;
    return `<span class="price">${money(p.price)}</span>`;
  }
  const media = (src, label, cls = '') => src
    ? `<img src="${esc(src)}" alt="${esc(label)}" loading="lazy" decoding="async" class="${cls}">`
    : `<div class="pattern" aria-hidden="true"><b>${esc((label || '?').trim().charAt(0))}</b></div>`;
  const tagsHtml = p => {
    const t = (p.tags || []).map(k => `<span class="tag ${k}">${esc(u().tags[k] || k)}</span>`);
    if (p.soldOut) t.unshift(`<span class="tag out">${u().soldOut}</span>`);
    return t.length ? `<div class="tags">${t.join('')}</div>` : '';
  };
  const alIcons = p => (p.allergens || []).length
    ? `<div class="al-icons" aria-label="${u().allergens}">${p.allergens.map(allergen).filter(Boolean).map(a => `<span title="${esc(tx(a.name))}">${a.icon}</span>`).join('')}</div>`
    : '<span></span>';

  function itemHtml(p, opts = {}) {
    const name = opts.hl ? opts.hl(tx(p.name)) : esc(tx(p.name));
    if (!p.img && !opts.cat) return `<button class="item noimg ripple ${p.soldOut ? 'soldout' : ''} ${hiddenByFilter(p) ? 'filtered' : ''} ${opts.reveal ? 'reveal' : ''}" data-pid="${esc(p.id)}">
      <div class="item-main">
        <div class="item-name">${name}</div>
        ${alt(p.name) ? `<div class="item-alt">${esc(alt(p.name))}</div>` : ''}
        ${tx(p.desc) ? `<div class="item-desc">${esc(tx(p.desc))}</div>` : ''}
        ${tagsHtml(p)}
        <div class="item-foot">${alIcons(p)}${priceHtml(p)}</div>
      </div>
    </button>`;
    return `<button class="item ripple ${p.soldOut ? 'soldout' : ''} ${hiddenByFilter(p) ? 'filtered' : ''} ${opts.reveal ? 'reveal' : ''}" data-pid="${esc(p.id)}">
      <div class="item-img">${media(p.img, tx(p.name))}</div>
      <div class="item-main">
        ${opts.cat ? `<div class="item-cat">${esc(tx(catById(p.cat)?.name))}</div>` : ''}
        <div class="item-name">${name}</div>
        ${alt(p.name) ? `<div class="item-alt">${esc(alt(p.name))}</div>` : ''}
        ${!opts.cat && tx(p.desc) ? `<div class="item-desc">${esc(tx(p.desc))}</div>` : ''}
        ${tagsHtml(p)}
        <div class="item-foot">${alIcons(p)}${priceHtml(p)}</div>
      </div>
    </button>`;
  }

  /* ── Dil seçici ── */
  const langHtml = () => `<div class="lang" data-lang="${lang}" role="group" aria-label="Language">
      <span class="pill"></span>
      ${LANGS.map(l => `<button data-lang-set="${l}" aria-pressed="${lang === l}">${l.toUpperCase()}</button>`).join('')}
    </div>`;

  /* ── KARŞILAMA EKRANI ── */
  function renderWelcome(dir) {
    const s = M.settings;
    const ig = (s.instagram || '').replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
    const wa = (s.whatsapp || '').replace(/\D/g, '');
    const links = [
      wa && `<a class="w-btn ripple" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener"><span class="w-ic wa">${icon.wa}</span>${u().whatsapp}</a>`,
      ig && `<a class="w-btn ripple" href="https://instagram.com/${esc(ig)}" target="_blank" rel="noopener"><span class="w-ic ig">${icon.insta}</span>${u().instagram}</a>`,
      `<button class="w-btn ripple" data-action="wifi"><span class="w-ic wf">${icon.wifi}</span>${u().wifi}</button>`,
      s.mapsUrl && `<a class="w-btn ripple" href="${esc(s.mapsUrl)}" target="_blank" rel="noopener"><span class="w-ic gm">${icon.star}</span>${u().review}</a>`,
    ].filter(Boolean);
    app.innerHTML = `<div class="view welcome ${dir === 'back' ? 'back' : ''} ${s.welcomeBg ? 'has-photo' : ''}" ${s.welcomeBg ? `style="--wbg:url('${esc(absUrl(s.welcomeBg))}')"` : ''}>
      <div class="w-bg" aria-hidden="true"><div class="hero-sun"></div><div class="hero-glint"></div></div>
      <div class="w-top"><span class="hero-badge">${icon.sun}${esc(tx(s.location))}</span>${langHtml()}</div>
      <div class="w-center">
        <p class="w-hello">${u().welcomeHint}</p>
        <h1>${esc(s.name)}</h1>
        <div class="sub">${esc(tx(s.subtitle))}</div>
        ${tx(s.welcome) ? `<p class="welcome-line">${esc(tx(s.welcome))}</p>` : ''}
      </div>
      <div class="w-bottom">
        <a class="w-cta ripple" href="#/menu">${u().viewMenu}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <div class="w-links">${links.join('')}</div>
      </div>
    </div>`;
  }

  function openWifi() {
    const s = M.settings;
    openSheet(`<div class="sheet-pad wifi-sheet">
      <div class="wifi-ic">${icon.wifi}</div>
      <h2 class="sheet-title">${u().wifi}</h2>
      ${s.wifiName ? `<div class="wifi-row"><small>${u().network}</small><b>${esc(s.wifiName)}</b></div>` : ''}
      ${s.wifiPass ? `<div class="wifi-row"><small>${u().password}</small><b>${esc(s.wifiPass)}</b><button class="btn" data-copy="${esc(s.wifiPass)}">${u().copy}</button></div>`
        : `<p class="sheet-sub">${u().wifiAsk}</p>`}
    </div>`, 'plain');
  }

  /* ── ANA SAYFA ── */
  let activeGroup = store.get('bb-group', null);
  function renderHome(dir) {
    const s = M.settings;
    const groups = M.groups.filter(g => cats().some(c => c.group === g.id));
    if (!groups.some(g => g.id === activeGroup)) activeGroup = groups[0]?.id;
    const featured = M.products.filter(p => p.active !== false && (p.tags || []).includes('chef') && p.img && catById(p.cat)?.active !== false);
    const info = [];
    if (s.wifiName) info.push(`<div class="info-row">${icon.wifi}<div><small>${u().wifi}</small>${esc(s.wifiName)}${s.wifiPass ? ` · <small style="display:inline">${u().password}:</small> ${esc(s.wifiPass)}` : ''}</div>${s.wifiPass ? `<button class="copy" data-copy="${esc(s.wifiPass)}">${u().copy}</button>` : ''}</div>`);
    if (s.phone) info.push(`<div class="info-row">${icon.phone}<div><small>${u().phone}</small><a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${esc(s.phone)}</a></div></div>`);
    if (s.instagram) info.push(`<div class="info-row">${icon.insta}<div><small>Instagram</small><a href="https://instagram.com/${esc(s.instagram.replace(/^@/, ''))}" target="_blank" rel="noopener">@${esc(s.instagram.replace(/^@/, ''))}</a></div></div>`);
    if (s.address) info.push(`<div class="info-row">${icon.pin}<div><small>${u().address}</small><a href="https://maps.google.com/?q=${encodeURIComponent(s.address)}" target="_blank" rel="noopener">${esc(s.address)}</a></div></div>`);

    app.innerHTML = `<div class="view ${dir === 'back' ? 'back' : ''}">
      <header class="menu-top">
        <div class="mt-row">
          <button class="icon-btn ripple" data-action="welcome" aria-label="${u().back}">${icon.back}</button>
          <div class="mt-brand"><b>${esc(s.name)}</b><small>${esc(tx(s.subtitle))}</small></div>
          ${langHtml()}
        </div>
        <button class="search-fake ripple" data-action="search">${icon.search}<span>${u().search}</span></button>
      </header>
      <main class="home-body">
        <div class="groups" role="tablist">
          ${groups.map(g => `<button class="group-tab" role="tab" data-group="${esc(g.id)}" aria-selected="${g.id === activeGroup}">${esc(tx(g.name))}</button>`).join('')}
          <span class="group-ind" aria-hidden="true"><svg viewBox="0 0 40 8" preserveAspectRatio="none"><path d="M1 4 Q5.5 0 10 4 T19 4 T28 4 T39 4"/></svg></span>
        </div>
        <div class="cats" id="cats"></div>
        ${featured.length ? `<div class="section-title"><h2>${u().featured}</h2><span>${featured.length}</span></div>
          <div class="featured">${featured.map(p => `<button class="feat" data-pid="${esc(p.id)}"><div class="feat-img">${media(p.img, tx(p.name))}</div><div class="feat-body"><div class="feat-name">${esc(tx(p.name))}</div><div class="feat-price">${priceHtml(p)}</div></div></button>`).join('')}</div>` : ''}
        ${info.length ? `<section class="info"><h3>${u().info}</h3>${info.join('')}</section>` : ''}
        ${tx(s.note) ? `<p class="note">${esc(tx(s.note))}</p>` : ''}
        <div class="foot"><svg viewBox="0 0 120 20"><path d="M0 10 Q15 0 30 10 T60 10 T90 10 T120 10"/></svg>${esc(s.name)} ${esc(tx(s.subtitle))} · ${new Date().getFullYear()}</div>
      </main>
    </div>`;
    renderCats(false);
    requestAnimationFrame(moveGroupInd);
  }

  function renderCats(animate = true) {
    const box = $('#cats');
    if (!box) return;
    const list = cats().filter(c => c.group === activeGroup);
    box.innerHTML = list.map((c, i) => {
      const n = prods(c.id).length;
      const img = c.img || prods(c.id).find(p => p.img)?.img || '';
      return `<button class="cat" data-cat="${esc(c.id)}" style="${animate ? `animation: rise .6s var(--ease-out) ${i * 45}ms both` : ''}">
        <div class="cat-arch">${media(img, tx(c.name))}</div>
        <div class="cat-name">${esc(tx(c.name))}</div>
        <div class="cat-count">${n} ${u().items}</div>
      </button>`;
    }).join('');
  }

  function moveGroupInd() {
    const tab = $('.group-tab[aria-selected="true"]');
    const ind = $('.group-ind');
    if (!tab || !ind) return;
    ind.style.width = tab.offsetWidth - 24 + 'px';
    ind.style.transform = `translateX(${tab.offsetLeft + 12}px)`;
  }

  /* ── GRUP / KATEGORİ GÖRÜNÜMÜ ── */
  let spyObs = null, revealObs = null;
  function renderGroup(groupId, catId, dir) {
    const group = M.groups.find(g => g.id === groupId);
    const list = cats().filter(c => c.group === groupId);
    if (!group || !list.length) return go('#/menu');
    const hiddenCount = list.reduce((n, c) => n + prods(c.id).filter(hiddenByFilter).length, 0);

    app.innerHTML = `<div class="view ${dir === 'back' ? 'back' : ''}">
      <div class="topbar">
        <div class="topbar-row">
          <button class="icon-btn ripple" data-action="home" aria-label="${u().back}">${icon.back}</button>
          <h1>${esc(tx(group.name))}</h1>
          <button class="icon-btn ripple" data-action="filter" aria-label="${u().filter}">${icon.filter}${excluded.size ? '<span class="dot"></span>' : ''}</button>
          <button class="icon-btn ripple" data-action="search" aria-label="${u().search}">${icon.search}</button>
        </div>
        <nav class="chips" aria-label="${u().categories}">
          ${list.map(c => `<button class="chip" data-jump="${esc(c.id)}">${esc(tx(c.name))}</button>`).join('')}
        </nav>
      </div>
      ${hiddenCount ? `<div class="filter-banner"><span>${u().hidden(hiddenCount)}</span><button data-action="filter">${u().filter}</button></div>` : ''}
      ${list.map(c => {
        const ps = prods(c.id);
        const img = c.img || ps.find(p => p.img)?.img || '';
        return `<section class="cat-section" id="sec-${esc(c.id)}" data-sec="${esc(c.id)}">
          <div class="cat-head"><div class="cat-head-img">${media(img, tx(c.name))}</div>
            <div><h2>${esc(tx(c.name))}</h2>${alt(c.name) ? `<small>${esc(alt(c.name))}</small>` : `<small>${ps.length} ${u().items}</small>`}</div></div>
          <div class="wave-rule"></div>
          ${ps.length ? ps.map(p => itemHtml(p, { reveal: true })).join('') : `<div class="empty">—</div>`}
        </section>`;
      }).join('')}
      <div style="height:40vh"></div>
      <button class="to-top" data-action="top" aria-label="${u().top}">${icon.up}</button>
    </div>`;

    setupReveal();
    setupSpy();
    const target = catId && $('#sec-' + CSS.escape(catId));
    if (target && catId !== list[0].id) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
    setChip(catId || list[0].id, false);
  }

  function setupReveal() {
    revealObs?.disconnect();
    revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.item.reveal').forEach(el => revealObs.observe(el));
  }

  function setupSpy() {
    spyObs?.disconnect();
    spyObs = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis && !jumping) setChip(vis.target.dataset.sec, true);
    }, { rootMargin: '-130px 0px -65% 0px' });
    $$('.cat-section').forEach(s => spyObs.observe(s));
  }

  let jumping = false;
  function setChip(id, smooth) {
    $$('.chip').forEach(c => {
      const on = c.dataset.jump === id;
      c.setAttribute('aria-current', on);
      if (on) {
        const nav = c.parentElement;
        nav.scrollTo({ left: c.offsetLeft - nav.clientWidth / 2 + c.offsetWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
      }
    });
    const m = location.hash.match(/^#\/g\/([^/]+)/);
    if (m && smooth) history.replaceState(history.state, '', `#/g/${m[1]}/${id}`);
  }

  /* ── ÜRÜN DETAYI ── */
  function openProduct(p) {
    const vs = p.variants || [];
    const als = (p.allergens || []).map(allergen).filter(Boolean);
    openSheet(`
      <div class="pd-img">${p.img ? `<img src="${esc(p.img)}" alt="${esc(tx(p.name))}">` : `<div class="pattern"><b>${esc(tx(p.name).charAt(0))}</b></div>`}</div>
      <button class="icon-btn pd-close ripple" data-close aria-label="${u().close}">${icon.close}</button>
      <div class="pd-body">
        <h2 class="pd-name">${esc(tx(p.name))}</h2>
        ${alt(p.name) ? `<div class="pd-alt">${esc(alt(p.name))}</div>` : ''}
        ${tagsHtml(p)}
        ${vs.length ? '' : `<div class="pd-price">${p.price == null || p.price === '' ? esc(u().askWaiter) : money(p.price)}</div>`}
        ${tx(p.desc) ? `<p class="pd-desc">${esc(tx(p.desc))}</p>` : ''}
        ${vs.length ? `<div class="pd-h">${u().options}</div><div class="variants">${vs.map(v => `<div class="variant"><span>${esc(tx(v.label))}</span><b>${money(v.price)}</b></div>`).join('')}</div>` : ''}
        <div class="pd-h">${u().allergens}</div>
        ${als.length ? `<div class="al-list">${als.map(a => `<span class="al-pill"><i>${a.icon}</i>${esc(tx(a.name))}</span>`).join('')}</div>` : `<div class="al-none">✓ ${u().noAllergen}</div>`}
        ${tx(M.settings.note) ? `<div class="pd-note">${esc(tx(M.settings.note))}</div>` : ''}
      </div>`, 'product');
  }

  /* ── ARAMA ── */
  function openSearch() {
    openSheet(`
      <div class="search-head"><label class="search-box">${icon.search}<input type="search" placeholder="${u().search}" autocomplete="off" enterkeyhint="search" id="q"></label></div>
      <div class="search-results" id="results"><div class="empty">${u().typeToSearch}</div></div>`, 'plain');
    const q = $('#q');
    setTimeout(() => q.focus(), 350);
    q.addEventListener('input', () => {
      const term = norm(q.value.trim());
      const box = $('#results');
      if (term.length < 2) { box.innerHTML = `<div class="empty">${u().typeToSearch}</div>`; return; }
      const activeCats = new Set(cats().map(c => c.id));
      const hits = M.products.filter(p => p.active !== false && activeCats.has(p.cat) &&
        norm([p.name.tr, p.name.en, p.name.ru, p.desc?.tr, p.desc?.en, p.desc?.ru, catById(p.cat)?.name.tr, catById(p.cat)?.name.en, catById(p.cat)?.name.ru].join(' ')).includes(term));
      const hl = s => {
        const n = norm(s); const i = n.indexOf(term);
        return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + term.length)) + '</mark>' + esc(s.slice(i + term.length));
      };
      box.innerHTML = hits.length ? hits.slice(0, 60).map(p => itemHtml(p, { cat: true, hl })).join('') : `<div class="empty">${u().noResult}</div>`;
      box.querySelectorAll('.filtered').forEach(el => el.classList.remove('filtered'));
    });
  }

  /* ── ALERJEN FİLTRESİ ── */
  function openFilter() {
    const draft = new Set(excluded);
    openSheet(`<div class="sheet-pad">
      <h2 class="sheet-title">${u().filter}</h2>
      <p class="sheet-sub">${u().filterSub}</p>
      <div class="al-grid">${M.allergens.map(a => `<button class="al-toggle ripple" data-al="${esc(a.id)}" aria-pressed="${draft.has(a.id)}"><i>${a.icon}</i>${esc(tx(a.name))}</button>`).join('')}</div>
      <div class="sheet-actions"><button class="btn ghost ripple" data-filter="clear">${u().clear}</button><button class="btn ripple" data-filter="apply">${u().apply}</button></div>
    </div>`, 'plain');
    sheetBody.onclick = e => {
      const t = e.target.closest('[data-al]');
      if (t) { const id = t.dataset.al; draft.has(id) ? draft.delete(id) : draft.add(id); t.setAttribute('aria-pressed', draft.has(id)); return; }
      const f = e.target.closest('[data-filter]');
      if (!f) return;
      if (f.dataset.filter === 'clear') draft.clear();
      excluded = draft; store.set('bb-exclude', [...excluded]);
      closeSheet();
      setTimeout(() => route(true), 320);
    };
  }

  /* ── Alt sayfa (sheet) yönetimi ── */
  let sheetOpen = false;
  function openSheet(html, kind) {
    sheet.className = 'sheet ' + (kind || '');
    sheetBody.innerHTML = html;
    sheetBody.onclick = null;
    sheetBody.scrollTop = 0;
    sheet.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (!sheetOpen) history.pushState({ sheet: true }, '', location.hash);
    sheetOpen = true;
  }
  function closeSheet(fromPop) {
    if (!sheetOpen) return;
    sheetOpen = false;
    sheet.classList.add('closing');
    setTimeout(() => { sheet.hidden = true; sheet.classList.remove('closing'); sheetBody.innerHTML = ''; document.documentElement.style.overflow = ''; }, 280);
    if (!fromPop && history.state?.sheet) history.back();
  }
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });

  // Aşağı kaydırarak kapatma
  (() => {
    const panel = $('.sheet-panel', sheet);
    let y0 = null, dy = 0;
    const start = e => {
      const onGrip = e.target.closest('[data-grip]');
      if (!onGrip && sheetBody.scrollTop > 0) return;
      y0 = (e.touches ? e.touches[0] : e).clientY; dy = 0; panel.style.transition = 'none';
    };
    const move = e => {
      if (y0 == null) return;
      dy = Math.max(0, (e.touches ? e.touches[0] : e).clientY - y0);
      if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
      if (y0 == null) return;
      y0 = null; panel.style.transition = 'transform .35s var(--ease-out)';
      if (dy > 110) { panel.style.transform = 'translateY(100%)'; setTimeout(() => { panel.style.transform = ''; panel.style.transition = ''; closeSheet(); }, 200); }
      else panel.style.transform = '';
    };
    panel.addEventListener('touchstart', start, { passive: true });
    panel.addEventListener('touchmove', move, { passive: true });
    panel.addEventListener('touchend', end);
  })();

  /* ── Yönlendirme ── */
  function go(hash) { if (location.hash !== hash) location.hash = hash; else route(true); }
  function route(force) {
    if (sheetOpen) closeSheet(true);
    const h = location.hash || '#/';
    const level = x => (x.startsWith('#/g/') ? 2 : x.startsWith('#/menu') ? 1 : 0);
    const depth = level(h);
    const prevDepth = level(lastRoute);
    const sameGroup = lastRoute.split('/')[2] === h.split('/')[2] && depth === 2 && prevDepth === 2;
    if (sameGroup && !force) { lastRoute = h; return; }
    const dir = depth < prevDepth ? 'back' : 'fwd';
    lastRoute = h;
    const render = () => {
      const m = h.match(/^#\/g\/([^/]+)(?:\/([^/]+))?/);
      if (m) renderGroup(decodeURIComponent(m[1]), m[2] && decodeURIComponent(m[2]), dir);
      else if (depth === 1) { renderHome(dir); window.scrollTo(0, homeScroll); }
      else { renderWelcome(dir); window.scrollTo(0, 0); }
    };
    render();
  }
  let homeScroll = 0;
  window.addEventListener('hashchange', () => route(false));
  window.addEventListener('popstate', e => { if (sheetOpen && !e.state?.sheet) closeSheet(true); });

  /* ── Etkileşimler ── */
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('.ripple');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.appendChild(ink);
    setTimeout(() => ink.remove(), 650);
  });

  document.addEventListener('click', e => {
    const t = e.target;
    const langBtn = t.closest('[data-lang-set]');
    if (langBtn) {
      lang = langBtn.dataset.langSet; store.set('bb-lang', lang); document.documentElement.lang = lang;
      const sy = window.scrollY;
      route(true); window.scrollTo(0, sy);
      return;
    }
    const g = t.closest('[data-group]');
    if (g) {
      activeGroup = g.dataset.group; store.set('bb-group', activeGroup);
      $$('.group-tab').forEach(b => b.setAttribute('aria-selected', b === g));
      moveGroupInd(); renderCats(true);
      return;
    }
    const c = t.closest('[data-cat]');
    if (c) { homeScroll = window.scrollY; const cat = catById(c.dataset.cat); return go(`#/g/${cat.group}/${cat.id}`); }
    const pid = t.closest('[data-pid]');
    if (pid) { const p = prodById(pid.dataset.pid); if (p) openProduct(p); return; }
    const j = t.closest('[data-jump]');
    if (j) {
      const sec = $('#sec-' + CSS.escape(j.dataset.jump));
      jumping = true; setChip(j.dataset.jump, true);
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { jumping = false; }, 800);
      return;
    }
    const cp = t.closest('[data-copy]');
    if (cp) { navigator.clipboard?.writeText(cp.dataset.copy).then(() => toast(u().copied)).catch(() => {}); return; }
    const a = t.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'home') go('#/menu');
    if (act === 'welcome') go('#/');
    if (act === 'wifi') openWifi();
    if (act === 'search') openSearch();
    if (act === 'filter') openFilter();
    if (act === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => { $('.to-top')?.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  window.addEventListener('resize', moveGroupInd);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2300);
  }

  /* ── Başlat ── */
  // GitHub Pages'te statik dosya, yerelde sunucu API'si
  fetch('data/menu.json?t=' + Date.now(), { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => fetch('api/menu').then(r => r.json()))
    .then(data => {
      M = data;
      document.documentElement.lang = lang;
      document.title = `${M.settings.name} ${tx(M.settings.subtitle)} · Menü`;
      route(true);
    })
    .catch(() => { app.innerHTML = '<div class="empty" style="padding-top:40vh">Menü yüklenemedi. Lütfen sayfayı yenileyin.</div>'; });
})();
