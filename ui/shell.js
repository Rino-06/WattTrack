/* ============================================================
   WattTrack — shell
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- WT-37: açılış animasyonu ---- */
// ---- WT-37: açılış animasyonu (video) ----
// Sabit SPLASH_MIN_MS beklemesi kaldırıldı. Splash iki koşul da sağlanınca
// kapanır: video bitti VE uygulama verisi hazır (ikisinden GEÇ olanı belirler).
// Bozuk/eksik video uygulamayı kilitlemesin diye 2500 ms'lik güvenlik ağı var.
const SPLASH_FAILSAFE_MS = 2500;   // her hâlükârda kapat
const SPLASH_STATIC_MS   = 900;    // otomatik oynatma engellendi -> statik logo
const SPLASH_REDUCED_MS  = 400;    // prefers-reduced-motion -> kısa statik
const SPLASH_SEEN_KEY    = 'wt-splash-seen';
let splashVideoDone = false, splashDataDone = false, splashClosed = false;

function closeSplash() {
  if (splashClosed) return;
  splashClosed = true;
  const el = document.getElementById('splash');
  if (!el) return;
  el.classList.add('hide');
  setTimeout(() => el.remove(), 600);
}
function splashTryClose() {
  if (splashVideoDone && splashDataDone) closeSplash();
}
// init() bunu çağırıyor: "veri hazır" tarafı
function hideSplash() { splashDataDone = true; splashTryClose(); }

function initSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  const v = document.getElementById('splash-video');
  const staticYol = ms => { el.classList.remove('video-on'); v?.remove();
    setTimeout(() => { splashVideoDone = true; splashTryClose(); }, ms); };

  // 7) video oturumda YALNIZ BİR KEZ oynasın
  let gorulmus = false;
  try { gorulmus = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1'; } catch (e) {}
  if (gorulmus) { splashVideoDone = true; closeSplash(); return; }
  try { sessionStorage.setItem(SPLASH_SEEN_KEY, '1'); } catch (e) {}

  // 4c) hareket azaltma tercihi: videoyu hiç oynatma
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !v) {
    staticYol(SPLASH_REDUCED_MS);
  } else {
    v.addEventListener('ended', () => { splashVideoDone = true; splashTryClose(); });
    v.addEventListener('error', () => staticYol(SPLASH_STATIC_MS));   // 4b
    el.classList.add('video-on');
    const p = v.play?.();
    // 4a) otomatik oynatma engellendiyse Promise reject olur
    if (p?.catch) p.catch(() => staticYol(SPLASH_STATIC_MS));
  }
  // 3) güvenlik ağı — video bitmezse de uygulama açılsın
  setTimeout(closeSplash, SPLASH_FAILSAFE_MS);
}
initSplash();

/* ---- toast ve geri alınabilir toast ---- */
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2400);
}
// WT-09/B: geri alınabilir işlemler için "Geri al" butonlu toast.
// Tersine çevirme penceresi normal toast'tan uzun (6 sn).
function toastUndo(msg, onUndo) {
  const el = $('toast');
  el.textContent = '';
  const span = document.createElement('span');
  span.textContent = msg;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toast-undo';
  btn.textContent = t('restore');
  btn.addEventListener('click', () => {
    clearTimeout(el._h);
    el.classList.remove('show');
    onUndo();
  });
  el.append(span, btn);
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => { el.classList.remove('show'); el.textContent = ''; }, 6000);
}

/* ---- tema, şarj ağı/banka listeleri, araç silüeti ve fotoğrafı ---- */
function applyTheme() {
  const dark = S.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = dark ? '#0f172a' : '#F1F7F2';
  document.querySelectorAll('[data-themetoggle]').forEach(b => { b.textContent = dark ? '☀️' : '🌙'; });
  const st = document.getElementById('set-theme');
  if (st) st.querySelectorAll('button').forEach(x =>
    x.classList.toggle('sel', x.dataset.v === (dark ? 'dark' : 'light')));
}
document.querySelectorAll('[data-themetoggle]').forEach(b =>
  b.addEventListener('click', async () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    await saveSetting('theme', S.theme);
    applyTheme();
    RENDER[screen]?.();   // grafik/donut renkleri temaya göre yeniden çizilsin
  }));
const chargersFor = code => (CHARGERS[code] || CHARGERS_DEFAULT);
const banksFor = code => (BANKS_BY[code] || BANKS_DEFAULT);
// Banka listesi: kullanıcının banka ülkelerinin birleşimi (şarj ülkesinden bağımsız)
function bankOptions() {
  const codes = (S.bankCountries && S.bankCountries.length) ? S.bankCountries : [S.country];
  const list = [...(S.customBanks || [])];
  codes.forEach(cc => banksFor(cc).forEach(b => { if (!list.includes(b)) list.push(b); }));
  ['Visa', 'Mastercard'].forEach(b => { if (!list.includes(b)) list.push(b); });
  return ['', ...list].map(b => `<option value="${esc(b)}">${b || '—'}</option>`).join('') +
    `<option value="__newbank">${t('newBank')}</option>`;
}

// ---------- araç silüetleri & özet kartı ----------
function carSVG(body, color) {
  const c = color || '#1C8742';
  const P = {
    sedan: 'M20 62 Q22 50 42 47 L62 34 Q80 26 112 26 Q144 26 158 36 L170 46 Q196 49 202 58 Q206 62 204 68 L188 68 A14 14 0 0 0 160 68 L84 68 A14 14 0 0 0 56 68 L24 68 Q18 66 20 62 Z',
    suv:   'M20 60 Q20 44 40 42 L56 26 Q64 18 100 18 Q140 18 152 28 L166 42 Q198 45 202 56 Q205 62 202 68 L186 68 A14 14 0 0 0 158 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q17 66 20 60 Z',
    hatch: 'M24 60 Q24 46 44 44 L58 28 Q66 20 100 20 Q126 20 138 28 L154 44 Q182 47 188 56 Q192 62 188 68 L174 68 A13 13 0 0 0 148 68 L82 68 A13 13 0 0 0 56 68 L28 68 Q21 66 24 60 Z',
    pickup:'M18 62 Q18 46 38 44 L52 26 Q58 18 92 18 L108 18 L110 42 L196 42 Q204 44 204 56 L204 62 Q204 68 198 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L22 68 Q16 66 18 62 Z',
    van:   'M20 62 Q20 30 44 28 L150 24 Q196 24 202 46 L202 60 Q202 68 196 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q18 66 20 62 Z'
  };
  const win = {
    sedan: 'M66 36 L112 30 Q136 30 150 38 L118 44 L70 44 Z',
    suv:   'M60 28 L100 24 Q132 24 146 32 L118 42 L64 42 Z',
    hatch: 'M62 30 L100 26 Q120 26 132 32 L116 42 L66 42 Z',
    pickup:'M56 28 L92 24 L104 24 L106 40 L60 40 Z',
    van:   'M48 32 L140 28 Q170 28 182 40 L150 46 L52 46 Z'
  };
  return `<svg viewBox="0 0 220 84" xmlns="http://www.w3.org/2000/svg">
    <path d="${P[body] || P.suv}" fill="${c}" opacity=".9"/>
    <path d="${win[body] || win.suv}" fill="#F1F7F2" opacity=".85"/>
    <circle cx="70" cy="68" r="11" fill="#131714"/><circle cx="70" cy="68" r="5" fill="#8B918C"/>
    <circle cx="172" cy="68" r="11" fill="#131714"/><circle cx="172" cy="68" r="5" fill="#8B918C"/>
  </svg>`;
}
// WT-38: kart yatay düzende ve ~110px'i geçmiyor. Teknik değerler ayrı
// etiket satırı yerine tek satırlık çiplerde; etiket ekran okuyucuya
// .sr-only ile veriliyor, yoksa "84 kWh" neyin değeri olduğu kaybolurdu.
function specChip(label, value) {
  return value ? `<div class="spec"><span class="sr-only">${esc(label)}: </span>${esc(value)}</div>` : '';
}
function evSummaryHTML(v) {
  const yr = v.y1 ? (v.y1 + (v.y2 ? '–' + v.y2 : '+')) : '—';
  const visual = v.photo
    ? `<img class="carphoto" src="${v.photo}" alt="${esc(t('vehiclePhoto'))}" role="button" tabindex="0">`
    : carSVG(v.body, colorFor(v.brand || v.ad || ''));
  const chips = [
    specChip(t('battery'), v.batt ? v.batt + ' kWh' : ''),
    specChip(t('range'), v.range ? Math.round(distDisp(v.range)) + ' ' + S.unit : ''),
    specChip(t('dcMax'), v.dc ? v.dc + ' kW DC' : ''),
    specChip(t('acMax'), v.ac ? v.ac + ' kW AC' : ''),
    specChip(t('arch'), v.arch ? v.arch + ' V' : '')
  ].join('');
  return `<div class="ev-summary">
    <div class="ev-top">
      ${visual}
      <div class="ev-id">
        <div class="name">${esc((v.brand ? v.brand + ' ' : '') + (v.model || v.ad || ''))}</div>
        <div class="trim">${esc(v.trim || '')}${v.trim ? ' · ' : ''}${yr}</div>
      </div>
    </div>
    ${chips ? `<div class="spec-grid">${chips}</div>` : ''}
  </div>`;
}
// fotoğrafa dokununca tam ekran (WT-38/5) — overlay altyapısı WT-24'ten.
// Kart üç ayrı yerde yeniden üretildiği için dinleyici belgede duruyor.
function openPhotoView(img) {
  $('photo-view-img').src = img.src;
  $('photo-view-img').alt = img.alt || '';
  overlayOpen('photo-view');
}
document.addEventListener('click', e => {
  const img = e.target.closest?.('.ev-summary img.carphoto');
  if (img) openPhotoView(img);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const img = e.target.closest?.('.ev-summary img.carphoto');
  if (img) { e.preventDefault(); openPhotoView(img); }
});
// fotoğrafı küçültüp dataURL yap (max 640px genişlik)
function resizePhoto(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(640, img.width);
      const h = Math.round(img.height * w / img.width);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      res(cv.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- döviz kuru (frankfurter — ECB) ----------
// Bir para biriminin o günkü TÜM kur tablosunu çek (çift yönlü dönüşüm için)
async function fetchTable(from, date) {
  const day = date && date < localISO() ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}`,
    `https://api.frankfurter.app/${day}?from=${from}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4500);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      if (j && j.rates) { j.rates[from] = 1; return {rates: j.rates, date: j.date || day}; }
    } catch (e) { /* sıradaki */ }
  }
  return null;
}
// Kur tablosu eksik kayıtları sessizce tamamla (oturum başına sınırlı)
async function backfillRates() {
  const all = await db.sessions.toArray();
  const need = all.filter(r => r.cur && !r.fxTable);
  const groups = {};
  need.forEach(r => { (groups[r.cur + '|' + r.tarih.slice(0, 10)] ||= []).push(r); });
  let calls = 0;
  for (const key of Object.keys(groups)) {
    if (calls >= 8) break;
    const [cur, date] = key.split('|');
    const got = await fetchTable(cur, date);
    calls++;
    if (got) for (const r of groups[key])
      await db.sessions.update(r.id, {fxTable: got.rates, fxDate: got.date});
  }
}
async function fetchRate(from, to, date) {
  const day = date && date < localISO() ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}&symbols=${to}`,
    `https://api.frankfurter.app/${day}?from=${from}&to=${to}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      const v = j && j.rates && j.rates[to];
      if (v) return {rate: v, date: j.date || day};
    } catch (e) { /* sıradaki kaynak */ }
  }
  return null;
}


/* ---- WT-30 grafik metin alternatifi · WT-28 segmentler · WT-24 overlay ---- */
// ============================================================
// GRAFİKLERİN METİN ALTERNATİFİ (WT-30)
// ============================================================
// Donut, bar grafikleri ve drawLineChart çıktısı ekran okuyucuya görünmezdi.
// Ayrıca bar sütunları <div>'di ve click dinleyicisi vardı — klavyeyle
// erişilemiyordu.
//
// bars: [{label, value, text}] · text verilmezse label + biçimli değer
function labelBarChart(hostId, title, bars) {
  const host = $(hostId);
  if (!host) return;
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', title + ': ' +
    (bars.length ? bars.map(b => `${b.label} ${b.text}`).join(', ') : t('noData')));
  // Görsel gizli özet tablo — sütun sütun okunabilsin
  const sum = document.createElement('table');
  sum.className = 'sr-only';
  sum.innerHTML = `<caption>${esc(title)}</caption><tbody>` +
    bars.map(b => `<tr><th scope="row">${esc(b.label)}</th><td>${esc(b.text)}</td></tr>`).join('') +
    '</tbody>';
  host.after(sum);
  host._srSummary?.remove();
  host._srSummary = sum;
}
// Tıklanabilir sütunları gerçek butona çevir (klavye erişimi)
function makeBarsFocusable(hostId, labelOf) {
  $(hostId)?.querySelectorAll('.mb[data-y]').forEach(el => {
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.setAttribute('aria-label', labelOf(el));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

// ============================================================
// SEGMENT KONTROLLERİ (WT-28)
// ============================================================
// .seg grupları düz <button> listesiydi; seçili durum yalnızca class="sel"
// ile taşınıyordu — ekran okuyucu hangi seçeneğin seçili olduğunu bilmiyordu.
// Tek yerden radiogroup semantiği verilir ve `sel` sınıfı ile senkron tutulur.
// Sınıfı 10 ayrı yerde toggle eden kodu değiştirmek yerine sınıf değişimi
// izlenir; böylece ileride eklenecek segmentler de kendiliğinden uyar.
function initSegments() {
  document.querySelectorAll('.seg').forEach(seg => {
    if (!seg.hasAttribute('role')) seg.setAttribute('role', 'radiogroup');
    const btns = [...seg.querySelectorAll('button')];
    btns.forEach(b => b.setAttribute('role', 'radio'));
    syncSeg(seg);

    // Sol/sağ (ve yukarı/aşağı) ok tuşlarıyla gezinme
    seg.addEventListener('keydown', e => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % btns.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + btns.length) % btns.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = btns.length - 1;
      if (j == null) return;
      e.preventDefault();
      btns[j].focus();
      btns[j].click();          // radiogroup'ta ok tuşu seçimi de değiştirir
    });
  });
  // `sel` sınıfı nerede değişirse değişsin aria-checked onunla gitsin
  new MutationObserver(muts => {
    const segs = new Set();
    for (const m of muts) {
      const seg = m.target.closest?.('.seg');
      if (seg) segs.add(seg);
    }
    segs.forEach(syncSeg);
  }).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class']});
}
function syncSeg(seg) {
  const btns = [...seg.querySelectorAll('button')];
  const selIdx = btns.findIndex(b => b.classList.contains('sel'));
  btns.forEach((b, i) => {
    b.setAttribute('aria-checked', i === selIdx ? 'true' : 'false');
    // dolaşan tabindex: gruba tek Tab ile girilir, içinde oklarla gezilir
    b.tabIndex = (selIdx < 0 ? i === 0 : i === selIdx) ? 0 : -1;
  });
}

// ============================================================
// OVERLAY YÖNETİMİ (WT-24)
// ============================================================
// Overlay'ler düz <section> idi: ekran okuyucu arkadaki sayfayı okumaya devam
// ediyor, klavye kullanıcısı dışarı çıkabiliyor, Escape kapatmıyor ve Android
// donanım geri tuşu overlay yerine UYGULAMADAN çıkıyordu.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const overlayStack = [];          // en üstteki en sonda
// Kapatmadan önce onay isteyen overlay'ler: dolu formu kazara kaybetmeyelim.
// "Boş mu?" diye bakmak yetmez — düzenleme modunda alanlar zaten doludur ve
// hiçbir şey değiştirmeden × basan kullanıcıya her seferinde onay sorulur.
// Bu yüzden açılıştaki değerler bir anlık görüntüye alınıp onunla kıyaslanır.
const WATCHED = {
  'page-add': ['in-date', 'in-kwh', 'in-amount', 'in-disc-val', 'in-dist', 'in-odo',
               'in-missed', 'in-unitprice',
               'in-loc', 'in-note', 'in-rate', 'in-socb', 'in-soca',
               'in-dur-h', 'in-dur-m'],
  'page-expense': ['in-exp-date', 'in-exp-amount', 'in-exp-note', 'in-exp-altad']
};
const formSnapshot = id => (WATCHED[id] || []).map(f => $(f)?.value ?? '').join(' ');
// openAdd/openExpense sonunda çağrılır — "temiz" durumu buradan sabitlenir
function markFormClean(id) {
  const el = $(id);
  if (el) el._clean = formSnapshot(id);
}
const DIRTY_CHECK = {
  'page-add': () => $('page-add')._clean !== formSnapshot('page-add'),
  'page-expense': () => $('page-expense')._clean !== formSnapshot('page-expense')
};

function overlayOpen(id) {
  const el = $(id);
  if (!el || overlayStack.includes(id)) return;
  el._opener = document.activeElement;
  el.classList.add('active');
  overlayStack.push(id);
  syncOverlayState();
  // açılışta ilk odaklanabilir öğeye git
  const first = el.querySelector(FOCUSABLE);
  if (first) setTimeout(() => first.focus(), 30);
  // geri tuşu: overlay açılınca geçmişe bir adım koy
  history.pushState({overlay: id}, '');
}

// fromPop: popstate'ten geliyorsa geçmişten ayrıca geri gitme
async function overlayClose(id, {fromPop = false, force = false} = {}) {
  const el = $(id);
  if (!el || !overlayStack.includes(id)) return false;
  if (!force && DIRTY_CHECK[id]?.() && !confirm(t('discardAsk'))) {
    // kullanıcı vazgeçti: popstate ile tüketilen geçmiş adımını geri koy
    if (fromPop) history.pushState({overlay: id}, '');
    return false;
  }
  el.classList.remove('active');
  overlayStack.splice(overlayStack.indexOf(id), 1);
  syncOverlayState();
  el._opener?.focus?.();
  el._opener = null;
  // Programatik kapatmada geçmiş adımını da tüket. Bunun tetiklediği popstate
  // altta kalan overlay'i yanlışlıkla kapatmasın diye bir kez bastırılır.
  if (!fromPop && history.state?.overlay === id) { suppressPop++; history.back(); }
  return true;
}
let suppressPop = 0;

function syncOverlayState() {
  const open = overlayStack.length > 0;
  const app = document.querySelector('.app');
  // arkadaki uygulama hem klavyeden hem ekran okuyucudan çıkarılsın
  if ('inert' in HTMLElement.prototype) app.inert = open;
  app.setAttribute('aria-hidden', open ? 'true' : 'false');
}

// Escape kapatır, Tab döngüsü overlay içinde kalır
document.addEventListener('keydown', e => {
  if (!overlayStack.length) return;
  const id = overlayStack[overlayStack.length - 1];
  const el = $(id);
  if (e.key === 'Escape') { e.preventDefault(); overlayClose(id); return; }
  if (e.key !== 'Tab') return;
  const items = [...el.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// Android donanım geri tuşu / tarayıcı geri: en üstteki overlay'i kapat
window.addEventListener('popstate', e => {
  if (suppressPop > 0) { suppressPop--; return; }
  // Overlay açıksa önce o kapanır
  if (overlayStack.length) {
    overlayClose(overlayStack[overlayStack.length - 1], {fromPop: true});
    return;
  }
  // Sekme geçmişi: hedef sekmeye dön (yeniden pushState YAPMA)
  const page = e.state?.page;
  if (page && page !== screen) showScreen(page, {push: false});
});


/* ---- WT-09 seçim diyaloğu · veri bütünlüğü uyarıları ---- */
// ============================================================
// SEÇİM DİYALOĞU (WT-09)
// ============================================================
// confirm() ikiden fazla seçenek sunamıyor. Araç silme üç yollu bir karar,
// kayıt taşıma ise form gerektiriyor — ikisi de bunu kullanır.
// Dönüş: seçilen değer, iptalde null.
function choiceDialog({title, msg, options, body}) {
  return new Promise(resolve => {
    const back = document.createElement('div');
    back.className = 'dlg-back';
    back.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
      <h3></h3>
      ${msg ? '<p class="dlg-msg"></p>' : ''}
      <div class="dlg-body"></div>
      ${(options || []).map((o, i) =>
        `<button type="button" class="dlg-opt ${o.danger ? 'danger' : ''}"
           data-i="${i}" ${o.disabled ? 'disabled' : ''}></button>`).join('')}
      <button type="button" class="dlg-cancel"></button>
    </div>`;
    back.querySelector('h3').textContent = title;
    if (msg) back.querySelector('.dlg-msg').textContent = msg;
    (options || []).forEach((o, i) => {
      back.querySelector(`[data-i="${i}"]`).textContent = o.label;
    });
    back.querySelector('.dlg-cancel').textContent = t('cancelLbl');
    if (body) back.querySelector('.dlg-body').appendChild(body);

    const close = val => { back.remove(); document.removeEventListener('keydown', onKey); resolve(val); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    back.querySelectorAll('.dlg-opt').forEach(b =>
      b.addEventListener('click', () => close(options[+b.dataset.i].value)));
    back.querySelector('.dlg-cancel').addEventListener('click', () => close(null));
    back.addEventListener('click', e => { if (e.target === back) close(null); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    back.querySelector('.dlg-opt, .dlg-cancel')?.focus();
  });
}

// ============================================================
// VERİ BÜTÜNLÜĞÜ UYARILARI (WT-04/6, WT-10)
// ============================================================
// Ana sayfanın üstündeki şerit. Otomatik DÜZELTME yok — kullanıcıya söyle,
// düzeltmeyi o yapsın.
const warnings = new Map();   // id -> {msg, actionLbl, action, host}
function setWarning(id, w) {
  if (w) warnings.set(id, {host: 'd-warnings', ...w}); else warnings.delete(id);
  renderWarnings();
}
function renderWarnings() {
  document.querySelectorAll('.warn-host').forEach(h => { h.innerHTML = ''; });
  for (const [id, w] of warnings) {
    const host = $(w.host);
    if (!host) continue;
    const el = document.createElement('div');
    el.className = 'warn-strip';
    el.innerHTML = `<span class="msg"></span>
      ${w.actionLbl ? '<button type="button" data-act>' + w.actionLbl + '</button>' : ''}
      <button type="button" data-dismiss>${t('dismissLbl')}</button>`;
    el.querySelector('.msg').textContent = w.msg;
    if (w.action) el.querySelector('[data-act]').addEventListener('click', w.action);
    el.querySelector('[data-dismiss]').addEventListener('click', () => setWarning(id, null));
    host.appendChild(el);
  }
}
// WT-18/3 migration: aracId'si null olan giderler HER araca sayılıyordu.
// Varsayılan (ya da tek) araca atanır; hiç araç yoksa dokunulmaz — kullanıcı
// araç ekleyince bir sonraki açılışta çalışır.
async function migrateExpenseVehicles() {
  const orphan = (await db.expenses.toArray()).filter(e => e.aracId == null);
  if (!orphan.length) return;
  const vs = await db.vehicles.toArray();
  if (!vs.length) return;
  const target = vs.find(v => v.id === S.defaultVehicleId && !v.archived)
    || vs.find(v => !v.archived) || vs[0];
  const w = await safeWrite(() => db.transaction('rw', db.expenses, async () => {
    for (const e of orphan) await db.expenses.update(e.id, {aracId: target.id});
  }));
  if (w.ok) toast(t('expOrphanFix', {n: orphan.length}));
}

// Sınır dışı socB/socA/dur/kwh değerlerini tara. Otomatik silme yok.
async function scanBadData() {
  const all = await db.sessions.toArray();
  const bad = all.filter(r =>
    (r.socB != null && (r.socB < 0 || r.socB > 100)) ||
    (r.socA != null && (r.socA < 0 || r.socA > 100)) ||
    (r.socB != null && r.socA != null && r.socB >= r.socA) ||
    (r.dur != null && (r.dur < 0 || r.dur > 48 * 60)) ||
    (r.kwh != null && (r.kwh < 0 || r.kwh > 300)));
  if (!bad.length) { setWarning('badData', null); return; }
  setWarning('badData', {
    msg: t('badDataFound', {n: bad.length}),
    actionLbl: t('showLbl'),
    action: () => { S.histBadOnly = bad.map(r => r.id); showScreen('history'); }
  });
}


/* ---- WT-36: boş durumlar ve örnek veri ---- */
// ============================================================
// WT-36 · BOŞ DURUM EKRANLARI + ÖRNEK VERİ
// ============================================================
// Boş durum: ikon + tek cümle + (varsa) eylem butonu. Eski hâli her sayfada
// yalnız "Henüz kayıt yok" diyordu; ne yapılacağını söylemiyordu.
function emptyStateHTML(ico, msgKey, act) {
  const BTN = {addCharge: 'addChargeBtn', addCar: 'addVehicle'};
  return `<div class="empty">
    <div class="empty-ico" aria-hidden="true">${ico}</div>
    <div class="empty-msg">${esc(t(msgKey))}</div>
    ${act ? `<button type="button" class="empty-btn" data-empty-act="${act}">${esc(t(BTN[act]))}</button>` : ''}
  </div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest?.('[data-empty-act]');
  if (!b) return;
  if (b.dataset.emptyAct === 'addCharge') openAdd();
  else if (b.dataset.emptyAct === 'addCar') $('btn-add-vehicle')?.click();
});

// Örnek veri: demo:true ile işaretli kayıtlar. İNDEKS EKLENMEDİ, bu yüzden
// Dexie sürümü artmadı — kayıt sayısı düşük olduğu için JS tarafında
// filtrelemek yeterli ve geri alınamaz bir migration doğurmuyor.
const isDemo = r => r.demo === true;
async function demoCounts() {
  return {
    s: (await db.sessions.toArray()).filter(isDemo).length,
    v: (await db.vehicles.toArray()).filter(isDemo).length,
    e: (await db.expenses.toArray()).filter(isDemo).length
  };
}
async function demoActive() {
  const c = await demoCounts();
  return c.s + c.v + c.e > 0;
}

async function syncEmptyStates() {
  const sess = await db.sessions.toArray();
  const vehs = (await db.vehicles.toArray()).filter(v => !v.archived);

  $('d-empty').innerHTML = sess.length ? ''
    : emptyStateHTML('⚡', 'emptyDash', 'addCharge');
  document.querySelectorAll('#page-dashboard .d-data').forEach(el => {
    // d-odo-wrap'ın kendi görünürlük mantığı var, onu ezme
    if (el.id === 'd-odo-wrap') { if (!sess.length) el.style.display = 'none'; return; }
    el.style.display = sess.length ? '' : 'none';
  });

  $('s-empty').innerHTML = sess.length >= 3 ? '' : emptyStateHTML('📊', 'emptyStats');
  $('s-data').style.display = sess.length >= 3 ? '' : 'none';

  const kiyasHazir = pf($('c-price').value) > 0 && pf($('c-cons').value) > 0;
  $('c-empty').innerHTML = kiyasHazir ? '' : emptyStateHTML('⛽', 'emptyCompare');

  $('v-empty').innerHTML = vehs.length ? '' : emptyStateHTML('🚗', 'emptyVehicle', 'addCar');

  // WT-36/3b: şerit kapatılamaz ve her sayfada görünür
  $('demo-bar').classList.toggle('on', await demoActive());
}

// WT-36/2: 10 şarj kaydı + 1 araç + 3 gider
async function seedDemoData() {
  if (!confirm(t('demoWarn'))) return;
  const bugun = new Date();
  const gun = n => { const d = new Date(bugun); d.setDate(d.getDate() - n); return localISO(d); };
  const vid = await db.vehicles.add({
    ad: t('demoCarName'), brand: 'Demo', model: 'EV 60', body: 'suv',
    batt: 60, dc: 150, ac: 11, arch: 400, range: 450,
    kmStart: 10000, kmNow: 14200, demo: true
  });
  const FIRMA = ['ZES', 'Eşarj', 'Voltrun', 'Trugo', 'Sharz'];
  const kayitlar = [];
  for (let i = 0; i < 10; i++) {
    const kwh = 18 + (i % 5) * 6;                 // 18–42 kWh
    const birim = 8 + (i % 3);                    // 8–10 birim fiyat
    const ind = i % 4 === 0 ? Math.round(kwh * birim * 0.1) : 0;
    kayitlar.push({
      tarih: gun(3 * i) + 'T' + (9 + (i % 8)) + ':30', firma: FIRMA[i % FIRMA.length],
      tip: i % 3 === 0 ? 'AC' : 'DC', kwh, tutar: kwh * birim + ind,
      odenen: kwh * birim, indirim: ind, cur: S.currency || 'TRY', rate: 1,
      dur: 25 + (i % 4) * 15, socB: 20 + (i % 3) * 10, socA: 75 + (i % 3) * 5,
      mesafeKm: 180 + (i % 5) * 40, aracId: vid, demo: true
    });
  }
  await db.sessions.bulkAdd(kayitlar);
  await db.expenses.bulkAdd([
    {aracId: vid, tur: 'tax', tutar: 2400, tarih: gun(120), yillik: true, demo: true},
    {aracId: vid, tur: 'insurance', tutar: 8600, tarih: gun(200), yillik: true, demo: true},
    {aracId: vid, tur: 'maintenance', tutar: 1900, tarih: gun(45), demo: true}
  ]);
  toast(t('demoAdded'));
  await tureMesafe(vid);
  showScreen('dashboard');
  renderDashboard();
  await syncEmptyStates();
}

// WT-36/3c: SADECE demo kayıtları siler, gerçek veriye dokunmaz
async function clearDemoData({ask = false} = {}) {
  if (!await demoActive()) return false;
  if (ask && !confirm(t('demoClearAsk'))) return false;
  await db.sessions.filter(isDemo).delete();
  await db.expenses.filter(isDemo).delete();
  await db.vehicles.filter(isDemo).delete();
  if (S.defaultVehicleId && !(await db.vehicles.get(S.defaultVehicleId)))
    await saveSetting('defaultVehicleId', null);
  toast(t('demoCleared'));
  renderDashboard();
  renderVehiclePage();
  await syncEmptyStates();
  return true;
}
$('btn-demo').addEventListener('click', seedDemoData);
$('btn-demo-clear').addEventListener('click', () => clearDemoData());

// WT-36/3d: kullanıcı ilk GERÇEK kaydını girdiğinde örnek veriyi silmeyi öner
async function offerDemoCleanup() {
  if (!await demoActive()) return;
  const gercek = (await db.sessions.toArray()).some(r => !isDemo(r));
  if (gercek) await clearDemoData({ask: true});
}
