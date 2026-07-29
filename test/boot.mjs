/* WattTrack açılış + kayıt turu testi (jsdom + fake-indexeddb).
   Gerçek tarayıcı yerine geçmez ama şunları yakalar:
   - açılışta konsol hatası / tanımsız referans
   - form doldurup Kaydet'e basınca DB'ye YAZILAN değerler
   - alanların blur'da nasıl geri yazıldığı (WT-02/C)
*/
import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const logs = [];

const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', (...a) => logs.push('warn: ' + a.join(' ')));

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc
});
const { window } = dom;
const app = () => window.__app;

// tarayıcı ortamı eksikleri
window.indexedDB = new FDBFactory();
window.IDBKeyRange = FDBKeyRange;
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
window.fetch = () => Promise.reject(new Error('offline test'));   // ağ yok: çevrimdışı davranış
Object.defineProperty(window.navigator, 'serviceWorker', {
  configurable: true,
  value: { register: () => Promise.reject(new Error('no sw in test')), addEventListener() {} }
});
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.URL.createObjectURL = () => 'blob:test';
window.URL.revokeObjectURL = () => {};

// Dört dosya tarayıcıda AYNI global kapsamı paylaşıyor; ayrı ayrı eval
// edilirse const/let bildirimleri birbirini görmez. Tek eval'de birleştir.
const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'app.js']
  .map(f => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8'))
  .join('\n;\n')
  // const/let bildirimleri window'a iliştirilmez; teste açmak için köprü kur
  + `\n;window.__app = {db, S, APP_VERSION, openAdd, showScreen, pf, fmtNum,
       fmtInput, checkNum, isValidDate, localISO, renderDashboard, scanBadData};`;
try {
  window.eval(bundle);
} catch (e) {
  errors.push('yükleme: ' + (e.stack || e.message));
  console.error(e);
  process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(1500);   // init() + splash

const $ = id => window.document.getElementById(id);
const fire = (el, type) => el.dispatchEvent(new window.Event(type, { bubbles: true }));

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? '  — ' + detail : ''}`);
};

check('açılışta konsol hatası yok', errors.length === 0, errors.slice(0, 3).join(' | '));
// sürümü version.js'ten oku — test sabit bir sürüme bağlanmasın
const expectedVer = /WT_VERSION\s*=\s*'([^']+)'/.exec(
  fs.readFileSync(path.join(ROOT, 'version.js'), 'utf8'))[1];
check('WT-52: sürüm version.js\'ten okundu',
  $('app-version') !== null && app().APP_VERSION === expectedVer,
  `APP_VERSION=${app().APP_VERSION} version.js=${expectedVer}`);

// --- onboarding'i atla, doğrudan kayıt formunu aç ---
await app().db.settings.put({ key: 'onboarded', value: true });
app().S.onboarded = true;
$('ob')?.classList.remove('active');

await app().openAdd();
await sleep(200);

// --- WT-02/C: blur biçimlendirmesi ---
$('in-amount').value = '1234.5';
fire($('in-amount'), 'blur');
check('WT-02/C: tutar "1234.5" → "1.234,50"', $('in-amount').value === '1.234,50',
  'görünen: ' + $('in-amount').value);

$('in-kwh').value = '45,5';
fire($('in-kwh'), 'blur');
check('WT-03/02: kWh "45,5" → "45,50"', $('in-kwh').value === '45,50',
  'görünen: ' + $('in-kwh').value);

// --- WT-04: SoC 800 reddediliyor mu? ---
$('in-socb').value = '10';
$('in-soca').value = '800';
$('in-date').value = '2026-07-20';
const before = await app().db.sessions.count();
$('btn-save').click();
await sleep(300);
check('WT-04: SoC 800 reddedildi (kayıt oluşmadı)',
  (await app().db.sessions.count()) === before,
  'form-err: ' + $('form-err').textContent);
check('WT-04: hata mesajı görünür', $('form-err').classList.contains('show'));
check('WT-04: gizli alan için Gelişmiş bloğu açıldı', $('adv-fields').classList.contains('open'));

// --- WT-04: socB >= socA reddediliyor mu? ---
$('in-soca').value = '10';
$('btn-save').click();
await sleep(300);
check('WT-04: socB >= socA reddedildi',
  (await app().db.sessions.count()) === before,
  'form-err: ' + $('form-err').textContent);

// --- WT-05: tarih boş reddediliyor mu? ---
$('in-soca').value = '80';
$('in-date').value = '';
$('btn-save').click();
await sleep(300);
check('WT-05: boş tarih reddedildi',
  (await app().db.sessions.count()) === before,
  'form-err: ' + $('form-err').textContent);

// --- geçerli kayıt ---
$('in-date').value = '2026-07-20';
$('btn-save').click();
await sleep(600);
const rows = await app().db.sessions.toArray();
check('geçerli kayıt yazıldı', rows.length === before + 1, 'kayıt sayısı: ' + rows.length);
if (rows.length) {
  const r = rows[rows.length - 1];
  check('WT-03: kWh 45,5 olarak saklandı (45,05 değil)', r.kwh === 45.5, 'kwh=' + r.kwh);
  check('WT-02: tutar 1234.5 olarak saklandı', r.tutar === 1234.5, 'tutar=' + r.tutar);
  check('WT-05: tarih doğru', r.tarih.startsWith('2026-07-20'), 'tarih=' + r.tarih);
  check('WT-04: socB/socA doğru', r.socB === 10 && r.socA === 80, `socB=${r.socB} socA=${r.socA}`);
}

// --- WT-01: saat dilimi — form bugünün tarihini öneriyor mu? ---
await app().openAdd();
await sleep(200);
const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString().slice(0, 10);
check('WT-01: form yerel bugünün tarihini öneriyor', $('in-date').value === localToday,
  `form=${$('in-date').value} yerel=${localToday}`);

// --- render turu: her sekme hatasız çiziliyor mu? ---
const errBefore = errors.length;
for (const p of ['dashboard', 'stats', 'history', 'compare', 'vehicle', 'settings']) {
  try { app().showScreen(p); await sleep(250); }
  catch (e) { errors.push(`showScreen(${p}): ${e.message}`); }
}
await sleep(400);
check('tüm sekmeler hatasız çiziliyor', errors.length === errBefore,
  errors.slice(errBefore, errBefore + 3).join(' | '));

// --- WT-02: gösterimde binlik/ondalık kuralı ---
app().showScreen('dashboard');
await sleep(400);
// 1234,50 tutarlı tek kayıt var: binlik NOKTA, ondalık VİRGÜL bekleniyor
const tot = $('d-total').textContent, kwhTxt = $('d-kwh').textContent;
check('WT-02: ana sayfa toplamı binlik nokta ile', /1\.23[45]/.test(tot), 'd-total = ' + tot);
check('WT-02: hiçbir yerde İngiliz biçimi (1,234.5) yok',
  !/,\d{3}\./.test(tot) && !/,\d{3}\./.test(kwhTxt), `d-total=${tot} d-kwh=${kwhTxt}`);

const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? `${failed.length} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ')
  + ` (${results.length} kontrol)`);
if (errors.length) {
  console.log('\nYakalanan hatalar:');
  errors.slice(0, 10).forEach(e => console.log('  - ' + e.slice(0, 300)));
}
process.exit(failed.length || errors.length ? 1 : 0);
