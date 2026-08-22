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
  // WT-84: statik logo yalnız BURADA görünür olur. `video-on` HTML'de duruyor,
  // burada kaldırılıp yerine `static-on` konuyor — ilk boyamada logo yok.
  const staticYol = ms => {
    el.classList.remove('video-on');
    el.classList.add('static-on');
    v?.remove();
    setTimeout(() => { splashVideoDone = true; splashTryClose(); }, ms);
  };

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
// WT-40/C4: "Bu bilgi yanlış mı?" -> marka/model/donanım/yıl önceden dolu
// GitHub issue şablonu.
function evIssueURL(v) {
  const yr = v.y1 ? (v.y1 + (v.y2 ? '–' + v.y2 : '+')) : '';
  const govde = [
    `Marka: ${v.brand || ''}`, `Model: ${v.model || ''}`,
    `Donanım: ${v.trim || ''}`, `Yıl: ${yr}`,
    `Uygulamadaki değerler: ${v.batt || '?'} kWh · ${v.range || '?'} km · `
      + `${v.dc || '?'} kW DC · ${v.ac || '?'} kW AC`,
    '', 'Doğru değerler:', 'Kaynak (üretici sayfası / veri tabanı bağlantısı):'
  ].join('\n');
  return 'https://github.com/Rino-06/WattTrack/issues/new?title='
    + encodeURIComponent(`EV verisi düzeltme: ${v.brand || ''} ${v.model || ''}`)
    + '&body=' + encodeURIComponent(govde);
}
function evSummaryHTML(v) {
  const yr = v.y1 ? (v.y1 + (v.y2 ? '–' + v.y2 : '+')) : '—';
  // Ham alana DEĞİL, photoSrc'nin sonucuna bakılıyor: bozuk bir photo
  // truthy olabilir ama gösterilebilir bir kaynak üretmez.
  const foto = photoSrc(v.photo);
  const visual = foto
    ? `<img class="carphoto" src="${foto}" alt="${esc(t('vehiclePhoto'))}" role="button" tabindex="0">`
    : carSVG(v.body, colorFor(v.brand || v.ad || ''));
  // WT-40/A: "Mimari (400 V)" çipi kaldırıldı — son kullanıcı için anlamsız.
  // `arch` alanı veride DURUYOR (ileride lazım olabilir), yalnız gösterilmiyor;
  // bu yüzden t('arch') anahtarı da silinmedi.
  // WT-40/B: menzil etiketi "WLTP menzil (üretici beyanı)".
  const chips = [
    specChip(t('battery'), v.batt ? v.batt + ' kWh' : ''),
    specChip(t('rangeWltp'), v.range ? Math.round(distDisp(v.range)) + ' ' + S.unit : ''),
    specChip(t('dcMax'), v.dc ? v.dc + ' kW DC' : ''),
    specChip(t('acMax'), v.ac ? v.ac + ' kW AC' : '')
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
    ${v.range ? `<div class="ev-note">${esc(t('rangeNote'))}</div>` : ''}
    ${v.brand ? `<div class="ev-foot">
      <span>${esc(t('evDataDate', {d: v.evVeriTarih || v.guncelleme || EV_DB_TARIH}))}</span>
      <button type="button" class="ev-fix" data-ev-edit="${v.id ?? ''}">${esc(t('evEditSpecs'))}</button>
      <a class="ev-fix" target="_blank" rel="noopener"
         href="${evIssueURL(v)}">${esc(t('evWrongInfo'))}</a>
    </div>` : ''}
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
// WT-39/BÖLÜM 1 — üç kusur düzeltildi:
//  1) EXIF yön bilgisi işlenmiyordu: iPhone'dan dikey çekilen görüntü yan
//     yatıyordu ve bu OCR doğruluğunu tamamen bozuyor.
//  2) URL.revokeObjectURL() hiç çağrılmıyordu (bellek sızıntısı).
//  3) dataURL yerine Blob saklanıyor — IndexedDB Blob destekliyor ve base64'e
//     göre ~%33 daha az yer kaplıyor.
// Ayrıca saklama kopyası 640px değil 900px: OCR'da çözünürlük doğruluğu
// belirliyor, OCR kopyası ise HİÇ küçültülmüyor (ocr.js tam çözünürlüğü alır).
async function decodeOriented(file) {
  // Tercih edilen yol: tarayıcı EXIF yönünü kendisi uygular
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file, {imageOrientation: 'from-image'}); }
    catch { /* desteklenmiyor -> aşağıdaki yedek yol */ }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });
  } finally { URL.revokeObjectURL(url); }   // hem başarıda hem hatada
}
// EXIF Orientation etiketini oku (createImageBitmap yoksa yedek yol)
async function exifOrientation(file) {
  try {
    const buf = new DataView(await file.slice(0, 128 * 1024).arrayBuffer());
    if (buf.getUint16(0) !== 0xFFD8) return 1;          // JPEG değil
    let off = 2;
    while (off + 4 < buf.byteLength) {
      const isaret = buf.getUint16(off);
      const boy = buf.getUint16(off + 2);
      if (isaret === 0xFFE1) {                           // APP1 (Exif)
        const tiff = off + 10;
        const le = buf.getUint16(tiff) === 0x4949;
        const ifd = tiff + buf.getUint32(tiff + 4, le);
        const n = buf.getUint16(ifd, le);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (buf.getUint16(e, le) === 0x0112) return buf.getUint16(e + 8, le);
        }
        return 1;
      }
      if ((isaret & 0xFF00) !== 0xFF00) break;
      off += 2 + boy;
    }
  } catch { /* okunamadı */ }
  return 1;
}
function drawOriented(src, w0, h0, ori, maxW) {
  const donuk = ori >= 5 && ori <= 8;                    // 90° katları
  const gw = donuk ? h0 : w0, gh = donuk ? w0 : h0;
  const w = Math.min(maxW || gw, gw);
  const h = Math.round(gh * w / gw);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  const s = w / gw;
  cx.save();
  switch (ori) {
    case 2: cx.translate(w, 0); cx.scale(-1, 1); break;
    case 3: cx.translate(w, h); cx.rotate(Math.PI); break;
    case 4: cx.translate(0, h); cx.scale(1, -1); break;
    case 5: cx.rotate(Math.PI / 2); cx.scale(1, -1); break;
    case 6: cx.rotate(Math.PI / 2); cx.translate(0, -w); break;
    case 7: cx.rotate(Math.PI / 2); cx.translate(h, -w); cx.scale(-1, 1); break;
    case 8: cx.rotate(-Math.PI / 2); cx.translate(-h, 0); break;
  }
  cx.drawImage(src, 0, 0, w0 * s, h0 * s);
  cx.restore();
  return cv;
}
// Saklama kopyası: 900px genişlik, JPEG 0.8, BLOB döner.
async function resizePhoto(file, {maxW = 900, quality = 0.8} = {}) {
  const src = await decodeOriented(file);
  // createImageBitmap yönü zaten uyguladıysa ori=1 kabul edilir
  const ori = (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap)
    ? 1 : await exifOrientation(file);
  const cv = drawOriented(src, src.width, src.height, ori, maxW);
  src.close?.();
  return await new Promise(res => cv.toBlob(b => res(b), 'image/jpeg', quality));
}
// OCR kopyası: KÜÇÜLTME YOK, yalnız yön düzeltilir. Ön işleme ocr.js'te.
async function fullResCanvas(file) {
  const src = await decodeOriented(file);
  const ori = (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap)
    ? 1 : await exifOrientation(file);
  const cv = drawOriented(src, src.width, src.height, ori, null);
  src.close?.();
  return cv;
}
// Blob da dataURL de gösterilebilsin (eski kayıtlar dataURL taşıyor).
// Nesne URL'leri Blob başına bir kez üretilip saklanıyor: araç sayısı çok
// düşük, erken revoke etmek kırık görsele yol açardı.
const _blobURL = new WeakMap();
// WT-101: `p` GEÇERLİ Mİ diye sorulmuyordu ve bu Aracım sayfasını komple
// çökertiyordu. Nedeni: JSON.stringify bir Blob'u `{}` yapıyor. Yedek alan
// kullanıcının aracında fotoğraf varsa dosyaya `photo:{}` yazılıyor, geri
// yüklenince de öyle saklanıyor. `{}` truthy olduğu için "fotoğraf var"
// sanılıyor, ama Blob olmadığı için URL.createObjectURL TypeError atıyor.
// Hata renderVehiclePage'in ortasında patladığından sayfa hiç çizilmiyor,
// silme düğmeleri bağlanmıyor ve gider listesi boş kalıyor — kullanıcının
// bildirdiği üç belirtinin tamamı bu tek satırdan.
// (WT-49/5 aynı kusuru sessions.ekranGor için düzeltmişti; vehicles.photo
// gözden kaçmış.)
const photoGecerli = p => typeof p === 'string'
  ? p.length > 0
  : (typeof Blob !== 'undefined' && p instanceof Blob);
function photoSrc(p) {
  if (!photoGecerli(p)) return '';        // bozuk/eksik: fotoğraf YOK say
  if (typeof p === 'string') return p;                   // eski dataURL
  if (!_blobURL.has(p)) _blobURL.set(p, URL.createObjectURL(p));
  return _blobURL.get(p);
}

// ---------- döviz kuru (frankfurter — ECB) ----------
// WT-81/7: iki çağrının (tablo / tek kur) yeniden deneme sarmalayıcısı birebir
// kopyaydı — aynı iki kaynak, aynı AbortController kalıbı, aynı sessiz
// yutma. Kopyalar zaman aşımında AYRIŞMIŞTI (4500 ms / 4000 ms) ki bunun bir
// gerekçesi yok. Politika artık tek yerde.
const FX_TIMEOUT = 4500;
// urls sırayla denenir; `al(json)` bir cevabı sonuca çevirir, null derse
// sıradaki kaynağa geçilir. Ağ hatası ve bozuk JSON da "sıradaki" demektir.
async function fxDene(urls, al) {
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), FX_TIMEOUT);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const sonuc = al(await res.json());
      if (sonuc) return sonuc;
    } catch (e) { /* sıradaki kaynak */ }
  }
  return null;
}
const fxGun = date => date && date < localISO() ? date : 'latest';
// Bir para biriminin o günkü TÜM kur tablosunu çek (çift yönlü dönüşüm için)
async function fetchTable(from, date) {
  const day = fxGun(date);
  return fxDene([
    `https://api.frankfurter.dev/v1/${day}?base=${from}`,
    `https://api.frankfurter.app/${day}?from=${from}`
  ], j => {
    if (!j || !j.rates) return null;
    j.rates[from] = 1;              // kaynağın kendisi 1'e eşit
    return {rates: j.rates, date: j.date || day};
  });
}
// Kur tablosu eksik kayıtları sessizce tamamla (oturum başına sınırlı)
async function backfillRates() {
  const all = await allSessions();
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
  const day = fxGun(date);
  return fxDene([
    `https://api.frankfurter.dev/v1/${day}?base=${from}&symbols=${to}`,
    `https://api.frankfurter.app/${day}?from=${from}&to=${to}`
  ], j => {
    const v = j && j.rates && j.rates[to];
    return v ? {rate: v, date: j.date || day} : null;
  });
}


/* ---- WT-30 grafik metin alternatifi · WT-28 segmentler · WT-24 overlay ---- */
// ============================================================
// BAR GRAFİĞİ ÇİZİMİ (WT-81)
// ============================================================
// Üç bar grafiği (#d-months, #s-cons, #v-exp-chart) ayrı ayrı, farklı
// birimlerle çiziliyordu: ikisi piksel (`6 + oran*66px`), biri yüzde
// (`max(4, oran*100)%`).
//
// KUSUR — taşma değil, ORAN BOZULMASI: `.mb` bir sütun flex kutusu ve
// `.bar`ın `flex-shrink`i kısıtlanmamış. Etiketler + boşluklar + çubuk
// kapsayıcıya sığmayınca çubuk KÜÇÜLTÜLÜYOR. 130px'lik kutuda iç yükseklik
// 98px; %100 isteyen çubuk ~68px'e sıkışırken %50 isteyen 49px'te dokunulmadan
// kalıyordu — istenen 2:1 oran ekranda ~1.39:1 çiziliyordu. Yani grafik
// veriyi YANLIŞ gösteriyordu. Piksel tabanlı ikisinde genlik daha düşüktü
// (72px tavan, ~9px sıkışma) ama kusur aynıydı.
//
// ÇÖZÜM: çubuk artık kendi `.track`ı içinde. Track `flex:1` — etiketlerden
// ARTAN yüksekliği alır, çubuk da o track'in yüzdesidir. Etiketler çubuğu
// asla sıkıştıramaz, oran her kapsayıcı yüksekliğinde birebir korunur.
// WT-80'in yatay/alçak ekran kuralı (.monthbars 110px) ancak bununla
// doğru çalışıyor — 78px'lik iç yükseklikte eski hesap ~29px sıkıştırırdı.
//
// bars: [{label, value, text, year}] · value null ise "veri yok" (taban çubuk)
// opt.yearAttr: yalnız #d-months için — sütuna data-y + tıklanabilirlik verir
// opt.tabanli: ORAN gösteren ölçüler için (tüketim gibi). Sıfırdan ölçmek
// 17,4 ile 19,1 arasındaki gerçek farkı görünmez yapar — çubukların hepsi
// birbirinin aynı çıkar. Tabanlı ölçekte en düşük değerin biraz altından
// başlanır; grafiğin altındaki not tabanı yazar ki çubuk boyu "iki katı"
// diye okunmasın.
function barChartHTML(bars, opt = {}) {
  const degerler = bars.map(b => b.value).filter(v => v != null && v > 0);
  const max = Math.max(1, ...bars.map(b => b.value || 0));
  // Taban: en düşük değerin, aralığın %25'i kadar altı. Tek değer varsa
  // aralık sıfır olur; o zaman taban da sıfır kalır (çubuk tam boy).
  const min = degerler.length ? Math.min(...degerler) : 0;
  const taban = (opt.tabanli && degerler.length > 1)
    ? Math.max(0, min - (max - min) * 0.25) : 0;
  return bars.map(b => {
    const oran = b.value && b.value > taban
      ? Math.max(2, Math.round((b.value - taban) / (max - taban) * 100)) : 2;
    const attr = opt.yearAttr && b.year != null
      ? ` data-y="${esc(String(b.year))}" style="cursor:pointer"` : '';
    return `<div class="mb"${attr}>
      <div class="amt">${esc(b.text || '')}</div>
      <div class="track"><div class="bar" style="height:${oran}%"></div></div>
      <div class="m">${esc(b.label)}</div>
    </div>`;
  }).join('');
}

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
  // WT-65: parçalı alanların ondalık kutuları da izlenmeli, yoksa yalnız
  // ondalığı değiştiren kullanıcıya "kaydetmeden çıkıyorsun" sorulmazdı
  'page-add': ['in-date', 'in-kwh', 'in-kwh-dec', 'in-amount', 'in-amount-dec',
               'in-disc-val', 'in-disc-val-dec', 'in-dist', 'in-odo',
               'in-missed', 'in-free', 'in-home', 'in-work', 'in-unitprice',
               'in-loc', 'in-note', 'in-rate', 'in-socb', 'in-soca',
               'in-dur-h', 'in-dur-m'],
  'page-expense': ['in-exp-date', 'in-exp-amount', 'in-exp-note', 'in-exp-altad']
};
// WT-86: onay kutusunun `.value`si HER ZAMAN 'on' — işaretli olsun olmasın
// (WT-81/9'da aynı tuzağa düşülmüştü). Anlık görüntüyü değerden almak
// in-missed'i de sessizce izlenmez yapıyordu; artık `checked` okunuyor.
const formSnapshot = id => (WATCHED[id] || []).map(f => {
  const el = $(f);
  if (!el) return '';
  return el.type === 'checkbox' ? (el.checked ? '1' : '0') : (el.value ?? '');
}).join(' ');
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
  const orphan = (await allExpenses()).filter(e => e.aracId == null);
  if (!orphan.length) return;
  const vs = await allVehicles();
  if (!vs.length) return;
  const target = vs.find(v => v.id === S.defaultVehicleId && !v.archived)
    || vs.find(v => !v.archived) || vs[0];
  const w = await safeWrite(() => db.transaction('rw', db.expenses, async () => {
    for (const e of orphan) await db.expenses.update(e.id, {aracId: target.id});
  }));
  if (w.ok) toast(t('expOrphanFix', {n: orphan.length}));
}

// Şarj kaybı yüzdesi kayda YAZILDIĞI ANDA hesaplanıp saklanıyor. Formülün
// paydası "beklenen kWh"ten "faturalanan kWh"e çevrildiğinde eski kayıtlar
// eski paydayla hesaplanmış değeri taşımaya devam ederdi; aynı grafikte iki
// farklı ölçüt karışırdı. Bu onarım kayıtlı değeri GÜNCEL formülle yeniden
// üretir. Girdi aynıysa çıktı da aynı olduğu için tekrar tekrar koşması
// zararsız; yalnız DEĞİŞEN kayıtlar yazılıyor.
async function kayipYenidenHesapla() {
  const all = await allSessions();
  const aday = all.filter(r => r.socB != null && r.socA != null && r.aracId != null);
  if (!aday.length) return;
  const vs = new Map((await allVehicles()).map(v => [v.id, v]));
  const upd = [];
  for (const r of aday) {
    const k = kayipHesapla(r, vs.get(r.aracId));
    const yeni = k ? k.pct : null;
    if ((r.kayipPct ?? null) !== yeni) upd.push([r.id, yeni]);
  }
  if (!upd.length) return;
  await safeWrite(() => db.transaction('rw', db.sessions, async () => {
    for (const [id, pct] of upd) await db.sessions.update(id, {kayipPct: pct});
  }));
  invalidateCache();
}

// Sınır dışı socB/socA/dur/kwh değerlerini tara. Otomatik silme yok.
async function scanBadData() {
  const all = await allSessions();
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
    s: (await allSessions()).filter(isDemo).length,
    v: (await allVehicles()).filter(isDemo).length,
    e: (await allExpenses()).filter(isDemo).length
  };
}
async function demoActive() {
  const c = await demoCounts();
  return c.s + c.v + c.e > 0;
}

async function syncEmptyStates() {
  const sess = await allSessions();
  const vehs = (await allVehicles()).filter(v => !v.archived);

  $('d-empty').innerHTML = sess.length ? ''
    : emptyStateHTML('⚡', 'emptyDash', 'addCharge');
  document.querySelectorAll('#page-dashboard .d-data').forEach(el => {
    // WT-62: kendi görünürlük mantığı olan kutuyu EZME. Eskiden burada yalnız
    // d-odo-wrap için elle yazılmış bir istisna vardı; bütçe kutusu eklenince
    // (WT-45) o istisnaya girmediği için, bütçe girilmemiş kullanıcıda
    // butceCiz()'in gizlediği kutu burada geri açılıyor ve içinde "—" olan boş
    // bir kutu olarak görünüyordu. İstisna listesi büyütmek yerine kutular
    // kendilerini işaretliyor: data-own-visibility.
    if (el.hasAttribute('data-own-visibility')) {
      if (!sess.length) el.style.display = 'none';
      return;
    }
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

// ============================================================
// WT-100 · ÖRNEK VERİ SETİ
// ============================================================
// WT-36'nın seti 10 şarj + 1 araç + 3 giderdi ve o günden sonra eklenen
// alanların HİÇBİRİNİ yazmıyordu: `mekan` (WT-16/WT-86 Ev-İş boyutu), `odo`
// (WT-19 sayaç zinciri), `free`, `atlanan`, `banka`, `loc`, `not`,
// `indirimTip`/`indirimDeger`, `birimFiyat`, `tutarKaynak`, `ulke`, `kayipPct`
// (WT-42). Giderlerde dokuz türden yalnız üçü vardı, hatırlatma alanları
// (WT-44) hiç yoktu ve ŞEMADA OLMAYAN bir `yillik` alanı yazılıyordu.
// Sonuç: örnek veri yüklenince İstatistik'in banka/lokasyon/kayıp kutuları,
// Aracım'ın yaklaşan hatırlatmalar paneli ve Kıyasla sayfası boş kalıyordu.
//
// PARA BİRİMİ: tutarlar sabit ₺ rakamı DEĞİL, kullanıcının ev elektrik
// fiyatının (WT-78) KATI olarak üretiliyor. Sabit rakamlar €/£ cihazlarda
// saçma görünüyordu (22.000 €'luk duvar ünitesi gibi).
// SINIRI: katsayılar TÜRKİYE oranlarına göre seçildi (DC fiyatı mesken
// tarifesinin ~3-4 katı). Mesken elektriğin görece pahalı olduğu ülkelerde
// (DE, DK) örnek DC fiyatı gerçeğin bir miktar üstünde kalır. Ülke bazlı DC
// tarife tablosu OLMADIĞI için uydurulmadı; sabit ₺ rakamından her hâlükârda
// daha doğru ve örnek verinin sahte olduğu zaten şeritte yazılı.
//
// KURAL: şarj/araç/gider kaydına yeni bir alan eklendiğinde BU SET DE
// güncellenir. Yoksa örnek veri bir kez daha geride kalır.

// İki etkin + bir arşivlenmiş araç. Arşivli olan, araç listesindeki arşiv
// filtresini ve Kıyasla'daki "arşivlileri dahil et" kutusunu görünür kılıyor.
// Marka bilerek 'Demo': kullanıcı bunu gerçek bir araç sanmasın.
const DEMO_VEH = [
  {brand: 'Demo', model: 'EV 60', trim: 'Long Range', y1: 2024, y2: 0,
   batt: 60, arch: 400, dc: 150, ac: 11, range: 450, body: 'suv',
   kmStart: 10000, kmNow: 13500},
  {brand: 'Demo', model: 'e-City 40', trim: 'Comfort', y1: 2022, y2: 0,
   batt: 40, arch: 400, dc: 50, ac: 7.4, range: 300, body: 'hatch',
   kmStart: 52000},
  {brand: 'Demo', model: 'eVan 77', trim: 'Cargo', y1: 2020, y2: 2023,
   batt: 77, arch: 400, dc: 125, ac: 11, range: 330, body: 'van',
   kmStart: 80000, kmNow: 82000, archived: true}
];

// Şarj kayıtları ARACA GÖRE gruplu ve ESKİDEN YENİYE sıralı — `odo` zinciri
// (WT-19) ancak artan sırada kurulabilir.
//   g   bugünden kaç gün önce          h   saat (HH:MM)
//   t   tip ('DC'|'AC')                m   mekan ('firma'|'ev'|'is')
//   f   firma (yalnız m='firma' iken)  b/a SoC önce / sonra
//   kay şarj kaybı oranı (WT-42)       pk  birim fiyat = ev kWh fiyatı × pk
//   km  bu şarja kadar sürülen mesafe  ind indirim yüzdesi · bk indirimi veren banka
//   lo  lokasyon · dur dakika · sayac  bu kayıt odo zincirine girsin mi
// kWh SoC ARALIĞINDAN türetiliyor: elle yazılan kWh ile SoC'nin birbirini
// tutmaması kayıp analizini (WT-42) anlamsız yapardı.
const DEMO_SESS = [
  {v: 0, list: [
    {g: 425, h: '18:20', t: 'DC', m: 'firma', f: 'ZES', b: 18, a: 85, kay: .09, pk: 2.55, km: 225, ind: 10, bk: 'Demo Bank', lo: 'Ankara', dur: 44},
    {g: 398, h: '08:10', t: 'AC', m: 'ev', b: 42, a: 100, kay: .05, pk: 0.78, km: 190, dur: 420},
    {g: 362, h: '19:05', t: 'DC', m: 'firma', f: 'Eşarj', b: 22, a: 80, kay: .10, pk: 2.62, sayac: true, lo: 'Eskişehir', dur: 38},
    {g: 330, h: '12:40', t: 'DC', m: 'firma', f: 'Voltrun', b: 25, a: 80, kay: .08, pk: 2.70, km: 205, ind: 15, bk: 'Demo Bank', lo: 'Bolu', dur: 33, sayac: true},
    {g: 296, h: '09:15', t: 'AC', m: 'is', b: 35, a: 90, kay: .04, pk: 0.68, km: 200, dur: 300, sayac: true},
    {g: 265, h: '21:30', t: 'DC', m: 'firma', f: 'Trugo', b: 15, a: 70, kay: .12, pk: 2.80, km: 210, lo: 'İzmir', dur: 36, sayac: true},
    {g: 238, h: '07:50', t: 'AC', m: 'ev', b: 48, a: 100, kay: .05, pk: 0.83, km: 180, dur: 400, sayac: true},
    {g: 210, h: '14:20', t: 'DC', m: 'firma', f: 'Sharz', b: 20, a: 85, kay: .09, pk: 2.92, km: 230, ind: 20, bk: 'Demo Bank', lo: 'Bursa', dur: 41, sayac: true},
    {g: 182, h: '17:10', t: 'DC', m: 'firma', f: 'ZES', b: 28, a: 78, kay: .26, pk: 3.00, km: 180, ind: 10, bk: 'Demo Bank', lo: 'Ankara', dur: 31, sayac: true, notKey: 'demoNote'},
    {g: 158, h: '08:35', t: 'AC', m: 'is', b: 40, a: 95, kay: .04, pk: 0.74, km: 195, dur: 320, sayac: true},
    {g: 140, h: '20:45', t: 'DC', m: 'firma', f: 'Eşarj', b: 18, a: 80, kay: .11, pk: 3.12, km: 215, lo: 'Konya', dur: 39, sayac: true},
    {g: 122, h: '11:00', t: 'DC', m: 'firma', f: 'Voltrun', b: 30, a: 80, kay: .08, pk: 3.20, km: 175, ind: 15, bk: 'Demo Bank', lo: 'Afyon', dur: 29, sayac: true},
    {g: 104, h: '07:40', t: 'AC', m: 'ev', b: 45, a: 100, kay: .05, pk: 0.90, km: 185, dur: 390, sayac: true},
    {g: 88, h: '16:25', t: 'DC', m: 'firma', f: 'Trugo', b: 22, a: 82, kay: .09, pk: 3.30, km: 220, lo: 'Denizli', dur: 37, sayac: true},
    {g: 72, h: '09:50', t: 'AC', m: 'is', b: 38, a: 92, kay: .04, pk: 0.80, km: 190, dur: 310, sayac: true},
    {g: 58, h: '19:30', t: 'DC', m: 'firma', f: 'ZES', b: 16, a: 76, kay: .10, pk: 3.42, km: 225, ind: 20, bk: 'Demo Bank', lo: 'Ankara', dur: 35, sayac: true},
    {g: 45, h: '13:15', t: 'AC', m: 'firma', f: 'Voltrun', b: 25, a: 70, kay: .07, pk: 2.20, km: 160, lo: 'Kütahya', dur: 26, sayac: true},
    {g: 34, h: '08:05', t: 'AC', m: 'ev', b: 50, a: 100, kay: .05, pk: 0.95, km: 175, dur: 360, sayac: true},
    {g: 26, h: '18:40', t: 'DC', m: 'firma', f: 'Eşarj', b: 20, a: 80, kay: .09, pk: 3.60, km: 205, ind: 10, bk: 'Demo Bank', lo: 'Balıkesir', dur: 34, sayac: true},
    {g: 19, h: '10:20', t: 'DC', m: 'firma', f: 'Voltrun', b: 30, a: 85, kay: .08, pk: 3.70, km: 190, lo: 'Manisa', dur: 30, free: true, sayac: true},
    {g: 12, h: '09:30', t: 'AC', m: 'is', b: 42, a: 95, kay: .04, pk: 0.88, km: 180, dur: 300, sayac: true},
    {g: 8, h: '20:10', t: 'DC', m: 'firma', f: 'Trugo', b: 18, a: 78, kay: .09, pk: 3.80, km: 200, ind: 15, bk: 'Demo Bank', lo: 'İzmir', dur: 33, sayac: true},
    {g: 5, h: '07:55', t: 'AC', m: 'ev', b: 55, a: 100, kay: .05, pk: 1.00, km: 150, dur: 330, sayac: true},
    {g: 2, h: '17:45', t: 'DC', m: 'firma', f: 'ZES', b: 24, a: 80, kay: .08, pk: 3.95, km: 210, ind: 10, bk: 'Demo Bank', lo: 'Ankara', dur: 32, sayac: true}
  ]},
  // İkinci araçta HİÇ sayaç değeri yok: mesafe kullanıcının girdiğidir.
  // WT-58'in "başlangıç sayacı + sürülen mesafe" kolu ancak böyle görünür.
  {v: 1, list: [
    {g: 270, h: '18:00', t: 'DC', m: 'firma', f: 'ZES', b: 25, a: 80, kay: .09, pk: 2.75, km: 140, lo: 'Ankara', dur: 28},
    {g: 225, h: '09:20', t: 'AC', m: 'ev', b: 40, a: 100, kay: .05, pk: 0.85, km: 130, dur: 300},
    {g: 180, h: '19:40', t: 'DC', m: 'firma', f: 'Eşarj', b: 20, a: 75, kay: .10, pk: 2.95, km: 135, ind: 10, bk: 'Demo Bank', lo: 'Kırıkkale', dur: 26},
    {g: 140, h: '12:10', t: 'DC', m: 'firma', f: 'Voltrun', b: 30, a: 85, kay: .08, pk: 3.10, km: 130, lo: 'Çorum', dur: 25},
    {g: 100, h: '08:30', t: 'AC', m: 'is', b: 35, a: 95, kay: .04, pk: 0.78, km: 125, dur: 280},
    // Atlanan kayıt: 300 km'ye karşılık 23 kWh — aradaki bir şarj girilmemiş.
    // İşareti VAR ama sayılar da tutarlı; yoksa örnek veri yanlış şey öğretir.
    {g: 65, h: '21:00', t: 'DC', m: 'firma', f: 'Trugo', b: 18, a: 70, kay: .11, pk: 3.35, km: 300, lo: 'Samsun', dur: 24, atl: true},
    {g: 30, h: '07:45', t: 'AC', m: 'ev', b: 45, a: 100, kay: .05, pk: 0.96, km: 120, dur: 270},
    {g: 6, h: '16:50', t: 'DC', m: 'firma', f: 'Sharz', b: 22, a: 78, kay: .09, pk: 3.75, km: 135, ind: 20, bk: 'Demo Bank', lo: 'Yozgat', dur: 23}
  ]},
  {v: 2, list: [
    {g: 560, h: '10:00', t: 'DC', m: 'firma', f: 'ZES', b: 20, a: 80, kay: .11, pk: 2.30, km: 280, lo: 'Ankara', dur: 48},
    {g: 525, h: '08:20', t: 'AC', m: 'ev', b: 40, a: 100, kay: .05, pk: 0.72, km: 260, dur: 480},
    {g: 495, h: '15:30', t: 'DC', m: 'firma', f: 'Eşarj', b: 25, a: 85, kay: .10, pk: 2.38, km: 270, ind: 10, bk: 'Demo Bank', lo: 'Kayseri', dur: 45},
    {g: 468, h: '19:15', t: 'DC', m: 'firma', f: 'Voltrun', b: 18, a: 75, kay: .09, pk: 2.45, km: 265, lo: 'Sivas', dur: 44}
  ]}
];

// Dokuz gider türünün TAMAMI temsil ediliyor (EXP_TYPES, db.js).
//   v tutar aracın DEMO_VEH'teki sırası · pk tutar = ev kWh fiyatı × pk
//   int hatırlatma aralığı (REM_ARALIK) · km hatırlatma sayaç aralığı (REM_KM)
//   nextKm sonraki bakım sayacı — aracın GÜNCEL sayacının ÜSTÜNDE olmalı,
//   yoksa tekrarOner() açılışta onay kutusu açar.
const DEMO_EXP = [
  {v: 0, tur: 'tax', pk: 1150, g: 340, int: '1yil', tekrar: true},
  {v: 0, tur: 'insurance', pk: 3500, g: 352, int: '1yil', tekrar: true},
  {v: 0, tur: 'maintenance', pk: 870, g: 110, int: '1yil', km: 15000, nextKm: 26000, tekrar: true},
  {v: 0, tur: 'tire', pk: 5000, g: 280, km: 10000, nextKm: 21000},
  {v: 0, tur: 'parking', pk: 320, g: 24},
  {v: 0, tur: 'equipment', pk: 4500, g: 415},
  {v: 1, tur: 'inspection', pk: 410, g: 70, int: '2yil', tekrar: true},
  {v: 1, tur: 'repair', pk: 1530, g: 45},
  {v: 1, tur: 'other', pk: 570, g: 30, altKey: 'demoExpOther'},
  {v: 2, tur: 'insurance', pk: 2600, g: 520}
];

// Ev elektrik fiyatı = tüm tutarların ÖLÇEĞİ.
// ÖLÇEK, S.currency İLE AYNI PARA BİRİMİNDE OLMAK ZORUNDA. `homeKwhPrice`
// tablodan geldiğinde (homeKwhAuto) ÜLKENİN para biriminde saklanıyor —
// Ayarlar onu WT-83'te symOf(d.cur) ile gösteriyor — ve kullanıcının seçtiği
// para biriminden farklı olabiliyor (ülkesi DE, para birimi TRY olan biri).
// Yanlış para birimindeki bir ölçek bütün tutarları katbekat şişirirdi.
// Elle girilen fiyat S.currency'dedir: Ayarlar'daki etiket sym() kullanıyor.
function demoKwhOlcek() {
  const d = defaultKwhPrice(S.country, S.kwhRegion);
  if (S.homeKwhPrice > 0 && (!S.homeKwhAuto || (d && d.cur === S.currency)))
    return S.homeKwhPrice;
  if (d && d.cur === S.currency && d.p > 0) return d.p;
  // Ülkenin para birimi tutmuyor: AYNI para birimini kullanan ilk ülkenin
  // mesken fiyatına düşülüyor. Seçilebilir 20 para biriminin hepsi tabloda
  // var (CAD yalnız alt bölgelerde), yani son çare pratikte erişilmez.
  for (const kod of Object.keys(KWH_PRICES)) {
    const c = KWH_PRICES[kod];
    if (c.cur !== S.currency) continue;
    if (c.p > 0) return c.p;
    for (const bolge of Object.keys(c.sub || {})) {
      const x = defaultKwhPrice(kod, bolge);
      if (x && x.p > 0) return x.p;
    }
  }
  return TR_KWH_2025;
}

// Tek şarj kaydı. kwh = batarya × SoC farkı × (1 + kayıp).
function demoSarjRec(veh, vid, o, P, tarih, odo) {
  const beklenen = veh.batt * (o.a - o.b) / 100;
  const kwh = Math.round(beklenen * (1 + o.kay) * 10) / 10;
  const evis = o.m !== 'firma';
  const birim = Math.round(P * o.pk * 100) / 100;
  const free = o.free === true;
  const brut = free ? 0 : Math.round(kwh * birim * 100) / 100;
  const indYuz = free ? 0 : (o.ind || 0);
  const net = free ? 0 : Math.round(netFromGross(brut, 'percent', indYuz) * 100) / 100;
  const rec = {
    tarih: tarih + 'T' + o.h,
    tip: o.t,
    firma: evis ? homeFirmName(o.m) : o.f,
    mekan: o.m,
    kwh,
    birimFiyat: evis ? birim : null,
    tutarKaynak: evis ? 'birimFiyat' : 'manuel',
    tutar: brut,
    odenen: net,
    indirim: Math.round((brut - net) * 100) / 100,
    free,
    indirimTip: indYuz > 0 ? 'percent' : 'none',
    indirimDeger: indYuz,
    banka: o.bk || '',
    mesafeKm: odo == null ? (o.km ?? null) : null,
    odo,
    atlanan: o.atl === true,
    dur: o.dur ?? null,
    loc: o.lo || '',
    socB: o.b, socA: o.a,
    ulke: S.country, cur: S.currency,
    rate: null, rateBase: null,
    aracId: vid,
    not: o.notKey ? t(o.notKey) : '',
    demo: true
  };
  rec.kayipPct = kayipHesapla(rec, veh)?.pct ?? null;
  return rec;
}

// Kıyasla sayfası S.cmp OLMADAN tamamen gizli (ui/compare.js). Yakıt fiyatı
// UYDURULMUYOR: yalnız gömülü geçmişi olan ülkelerde (WT-77, bugün TR) o
// ülkenin son ayının motorin fiyatı alınıyor. Geçmişi olmayan ülkede Kıyasla
// boş durumda kalır — ₺ ölçeğinde bir sayıyı € diye göstermek boş ekrandan
// daha kötü olurdu. Ayarın örnek veriyle geldiği `demoCmp` ile işaretleniyor;
// clearDemoData() yalnız KENDİ yazdığını geri alıyor.
async function demoCmpSeed(icefix) {
  if (S.cmp) return;
  const g = FUEL_HIST[S.country];
  if (!g) return;
  const i = g.tur.indexOf('diesel');
  if (i < 0) return;
  const aylar = Object.keys(g.m).sort();
  const fiyat = g.m[aylar[aylar.length - 1]][i];
  if (!(fiyat > 0)) return;
  S.cmp = {fuel: 'diesel', price: fiyat, cons: 6.5, icefix, prorate: true};
  await saveSetting('cmp', S.cmp);
  await saveSetting('demoCmp', true);
}

async function seedDemoData() {
  const nSarj = DEMO_SESS.reduce((s, x) => s + x.list.length, 0);
  if (!confirm(t('demoWarn', {n: nSarj + DEMO_EXP.length + DEMO_VEH.length}))) return;
  const bugun = new Date();
  const gun = n => { const d = new Date(bugun); d.setDate(d.getDate() - n); return localISO(d); };
  const P = demoKwhOlcek();
  const para = k => Math.round(P * k / 10) * 10;

  const vid = [];
  for (const v of DEMO_VEH)
    vid.push(await db.vehicles.add({...v, ad: t('demoCarName'),
      evVeriTarih: EV_DB_TARIH, demo: true}));

  const kayitlar = [];
  for (const grup of DEMO_SESS) {
    const veh = DEMO_VEH[grup.v];
    // İlk sayaçlı kayıtta kıyas noktası yok; tureMesafe onun mesafesini null
    // yapar. Zincir bu yüzden kmStart'ın 800 km üstünden başlıyor: araç
    // ilk şarjdan önce de yol yapmıştı.
    let odo = veh.kmStart + 800;
    let ilkSayac = true;
    for (const o of grup.list) {
      let deger = null;
      if (o.sayac) {
        if (!ilkSayac) odo += o.km;
        ilkSayac = false;
        deger = odo;
      }
      kayitlar.push(demoSarjRec(veh, vid[grup.v], o, P, gun(o.g), deger));
    }
  }
  await db.sessions.bulkAdd(kayitlar);

  const giderler = DEMO_EXP.map(e => {
    const tarih = gun(e.g);
    const araGun = REM_ARALIK.find(([k]) => k === e.int)?.[1] || null;
    let sonraki = null;
    if (araGun) {
      const d = new Date(tarih);
      d.setDate(d.getDate() + araGun);
      sonraki = localISO(d);
    }
    return {
      tarih, tur: e.tur,
      altAd: e.altKey ? t(e.altKey) : '',
      tutar: para(e.pk), cur: S.currency,
      aracId: vid[e.v], not: '',
      hatirlatmaAraligi: e.int || null,
      hatirlatmaKm: e.km || null,
      sonrakiTarih: sonraki,
      sonrakiKm: e.nextKm ?? null,
      tekrar: e.tekrar === true,
      demo: true
    };
  });
  await db.expenses.bulkAdd(giderler);

  // ICE'nin yıllık sabit gideri: aracın kendi yıllık kalemlerinin 1,6 katı.
  // Sabit bir rakam yazmak yerine buradan türetiliyor ki para birimi tutsun.
  const yillik = giderler
    .filter(e => ['tax', 'insurance', 'maintenance', 'inspection'].includes(e.tur))
    .reduce((s, e) => s + e.tutar, 0);
  await demoCmpSeed(Math.round(yillik * 1.6 / 10) * 10);

  // Varsayılan araç YOKSA ilk örnek araca ayarlanır; kullanıcının kendi
  // seçimi varsa DOKUNULMAZ.
  if (S.defaultVehicleId == null) {
    S.defaultVehicleId = vid[0];
    await saveSetting('defaultVehicleId', vid[0]);
  }

  toast(t('demoAdded'));
  for (const id of vid) await tureMesafe(id);
  showScreen('dashboard');
  renderDashboard();
  // syncEmptyStates() Kıyasla'nın boş durumunu FORM ALANLARINDAN okuyor; o
  // alanları renderCompare() dolduruyor. Sıra ters olursa örnek veri yüklenmiş
  // Kıyasla sayfasında hem sonuçlar hem "yakıt fiyatı gir" yazısı birlikte
  // görünüyordu.
  await renderCompare();
  await syncEmptyStates();
}

// WT-36/3c: SADECE demo kayıtları siler, gerçek veriye dokunmaz
async function clearDemoData({ask = false} = {}) {
  if (!await demoActive()) return false;
  if (ask && !confirm(t('demoClearAsk'))) return false;
  await db.sessions.filter(isDemo).delete();
  await db.expenses.filter(isDemo).delete();
  await db.vehicles.filter(isDemo).delete();
  if (S.defaultVehicleId && !(await db.vehicles.get(S.defaultVehicleId))) {
    S.defaultVehicleId = null;
    await saveSetting('defaultVehicleId', null);
  }
  // WT-100: Kıyasla ayarı örnek veriyle BİRLİKTE geldiyse onunla gider.
  // İşaret yoksa kullanıcının kendi girdiği değerdir — dokunulmaz.
  if (await db.settings.get('demoCmp')) {
    S.cmp = null;
    await db.settings.delete('cmp');
    await db.settings.delete('demoCmp');
    renderCompare();
  }
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
  const gercek = (await allSessions()).some(r => !isDemo(r));
  if (gercek) await clearDemoData({ask: true});
}
