/* WT-55/56 — "yedekten gelen veride firma / şarj tipi / şarj yeri boş"
   Kullanıcı bildirimi: yedeği geri yükleyince istatistik sayfasındaki
   dağılımlar boş geliyor, ama elle yeni kayıt girince çalışıyor.

   Test iki hipotezi AYIRIYOR:
   H1 — yedek yolu alanları düşürüyor (veri kaybı)
   H2 — alanlar duruyor ama dağılım blokları DÖNEM filtresine bağlı
        (S.gran varsayılanı 'month'); eski tarihli kayıtlar dönem dışında
        kaldığı için bloklar boş çiziliyor ve "Henüz kayıt yok" diyor —
        kullanıcı bunu veri kaybı sanıyor.
*/
import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? '  — ' + detail : ''}`);
};

async function boot() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    if (/Not implemented: navigation/.test(e.message || '')) return;
    errors.push('jsdomError: ' + (e.stack || e.message));
  });
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), {
    url: 'http://localhost/', runScripts: 'outside-only',
    pretendToBeVisual: true, virtualConsole: vc
  });
  const { window } = dom;
  window.indexedDB = new FDBFactory();
  window.IDBKeyRange = FDBKeyRange;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  window.fetch = () => Promise.reject(new Error('offline'));
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: { register: () => Promise.reject(new Error('no sw')), addEventListener() {} }
  });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  window.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('autoplay blocked (test)'));
  window.confirm = () => true;      // geri yükleme onayları
  window.alert = () => {};

  const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'db.js', 'calc.js', 'i18n.js', 'ocr.js',
    'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js', 'ui/history.js', 'ui/compare.js',
    'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js', 'app.js']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
    + `\n;window.__app = {db, S, t, allSessions, backupPayload, importBackupText,
         renderStats, showScreen};`;
  window.eval(bundle);
  await new Promise(r => setTimeout(r, 1200));
  return window;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = (w, id) => w.document.getElementById(id);

// Bugünden AY GERİ tarih — "eski yedek" senaryosu
function ayOnce(n) {
  const d = new Date();
  d.setDate(1);                       // ay sonu taşmasını önle
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15T12:00`;
}

const w = await boot();
const A = w.__app;

// ---- A: kullanıcının yedeğindeki gibi, alanları DOLU eski kayıtlar ----
const vid = await A.db.vehicles.add({ ad: 'Model Y', batt: 75 });
await A.db.sessions.bulkAdd([
  {tarih: ayOnce(4), firma: 'ZES',   tip: 'DC', mekan: 'firma', kwh: 40, tutar: 400, odenen: 400, cur: 'TRY', aracId: vid, banka: 'Garanti', loc: 'Ankara'},
  {tarih: ayOnce(4), firma: 'Trugo', tip: 'AC', mekan: 'firma', kwh: 22, tutar: 210, odenen: 210, cur: 'TRY', aracId: vid, banka: 'Garanti', loc: 'Ankara'},
  {tarih: ayOnce(3), firma: 'Ev',    tip: 'AC', mekan: 'evis',  kwh: 30, tutar: 120, odenen: 120, cur: 'TRY', aracId: vid, loc: 'İstanbul'},
  {tarih: ayOnce(3), firma: 'Eşarj', tip: 'DC', mekan: 'firma', kwh: 51, tutar: 560, odenen: 560, cur: 'TRY', aracId: vid, banka: 'Akbank', loc: 'İstanbul'}
]);

// ---- H1 sınaması: yedek al → sil → geri yükle, alanlar hayatta mı? ----
const payload = await A.backupPayload();
await A.db.sessions.clear();
await A.importBackupText(JSON.stringify(payload));
await sleep(400);

const geri = await A.allSessions();
const alanVar = r => r.firma && r.tip && r.mekan;
check('WT-55/H1: yedek turu firma/tip/mekan alanlarını KORUYOR',
  geri.length === 4 && geri.every(alanVar),
  `${geri.length} kayıt · örnek: firma=${geri[0]?.firma} tip=${geri[0]?.tip} mekan=${geri[0]?.mekan}`);

// ---- H2 sınaması: alanlar duruyorken dağılımlar ne çiziyor? ----
A.S.gran = 'month';                 // varsayılan (calc.js:14)
await A.renderStats();
await sleep(200);

const GENEL = /Henüz kayıt yok|No records yet/;      // "hiç veri yok" — yanıltıcı
const DONEM = /Bu dönemde kayıt yok|No records in this period/;
const bosMu = id => {
  const el = $(w, id);
  return !el || !el.textContent.trim() || GENEL.test(el.textContent) || DONEM.test(el.textContent);
};
// Bloklar hâlâ boş (dönem filtresi WT-15 gereği kasıtlı) — ama artık
// "hiç kaydın yok" DEMİYORLAR. Kullanıcının veri kaybı sanmasının sebebi buydu.
const metinler = ['d-firms', 'd-donut-legend', 'd-donut2-legend']
  .map(id => ($(w, id).textContent || '').trim());
check('WT-56: dönem dışı veride bloklar "veri yok" değil "bu dönemde yok" diyor',
  metinler.every(x => DONEM.test(x)) && !metinler.some(x => GENEL.test(x)),
  metinler.map(x => `"${x.slice(0, 25)}"`).join(' · '));

// ---- Kabul kriteri 1: boş durum "veri yok" değil, "bu dönemde yok" demeli ----
const uyari = $(w, 's-period-empty');
check('WT-56 KABUL-1: dönemde kayıt yokken açıklayıcı uyarı gösteriliyor',
  !!uyari && uyari.style.display !== 'none' && /dönem|period/i.test(uyari.textContent),
  uyari ? `"${uyari.textContent.trim().slice(0, 70)}"` : 's-period-empty yok');

// ---- Kabul kriteri 2: "Tümü" dönemi seçilince dağılımlar DOLU ----
A.S.gran = 'all';
await A.renderStats();
await sleep(200);

check('WT-56 KABUL-2: Tümü seçilince firma dağılımı doluyor',
  !bosMu('d-firms') && /ZES|Eşarj/.test($(w, 'd-firms').textContent),
  ($(w, 'd-firms').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60));

check('WT-56 KABUL-3: şarj tipi dağılımı (DC/AC) doluyor',
  /DC/.test($(w, 'd-donut-legend').textContent) && /AC/.test($(w, 'd-donut-legend').textContent),
  ($(w, 'd-donut-legend').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60));

check('WT-56 KABUL-4: şarj yeri dağılımı (Ev-İş / firma) doluyor',
  ($(w, 'd-donut2-legend').textContent || '').replace(/\s+/g, '').length > 4 &&
    !bosMu('d-donut2-legend'),
  ($(w, 'd-donut2-legend').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60));

check('WT-56 KABUL-5: Tümü seçiliyken uyarı kayboluyor',
  !!uyari && uyari.style.display === 'none',
  uyari ? `display="${uyari.style.display}"` : 's-period-empty yok');

// ---- Kabul kriteri 3: dönemde veri VARSA uyarı çıkmamalı (yanlış alarm yok) ----
await A.db.sessions.add({tarih: new Date().toISOString().slice(0, 16), firma: 'ZES',
  tip: 'DC', mekan: 'firma', kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', aracId: vid});
A.S.gran = 'month';
await A.renderStats();
await sleep(200);
check('WT-56 KABUL-6: dönemde kayıt varken uyarı çıkmıyor',
  !!uyari && uyari.style.display === 'none',
  uyari ? `display="${uyari.style.display}"` : 's-period-empty yok');

console.log('');
if (errors.length) {
  console.log('KONSOL HATALARI:');
  errors.forEach(e => console.log('  ' + e));
}
const fail = results.filter(r => !r.pass).length;
if (fail || errors.length) {
  console.log(`${fail} KONTROL BAŞARISIZ (${results.length} kontrol)`);
  process.exit(1);
}
console.log(`TÜM KONTROLLER GEÇTİ (${results.length} kontrol)`);
