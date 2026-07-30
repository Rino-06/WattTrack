/* WT-19 doğrulaması: mesafe/odometre çift kaynak sorunu.

   Üç kabul kriteri + spec'in ima ettiği ama saymadığı durumlar:
   silme, birim dönüşümü, eski mesafeKm kayıtlarının korunması.
*/
import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [], results = [];
const check = (n, p, d) => { results.push(p); console.log(`${p ? '✓' : '✗'} ${n}${d ? '  — ' + d : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  if (/Not implemented: navigation/.test(e.message || '')) return;
  errors.push('jsdomError: ' + (e.stack || e.message));
});
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), {
  url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
});
const { window: w } = dom;
w.indexedDB = new FDBFactory();
w.IDBKeyRange = FDBKeyRange;
w.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
w.fetch = () => Promise.reject(new Error('offline'));
Object.defineProperty(w.navigator, 'serviceWorker', {
  configurable: true, value: { register: () => Promise.reject(new Error('x')), addEventListener() {} }
});
w.scrollTo = () => {};
w.HTMLElement.prototype.scrollIntoView = () => {};
w.URL.createObjectURL = () => 'blob:test';
w.URL.revokeObjectURL = () => {};
// WT-37: jsdom'da HTMLMediaElement.play() yok; splash yedek yolu koşsun
w.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('autoplay blocked (test)'));
w.confirm = () => true;
w.alert = () => {};

w.eval(['version.js', 'dexie.min.js', 'evdata.js', 'db.js', 'calc.js', 'i18n.js', 'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js', 'ui/history.js', 'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js', 'app.js']
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + `\n;window.__app = {db, S, t, openAdd, tureMesafe, odoNowOf, odoNeighbourCheck,
       saveSetting, renderVehiclePage, renderDashboard, looksLikeMissedCharge,
       renderCompare};`);
await sleep(1300);

const A = w.__app;
const $ = id => w.document.getElementById(id);
await A.saveSetting('onboarded', true);
A.S.onboarded = true;
A.S.currency = 'TRY';
A.S.country = 'TR';
A.S.unit = 'km';

const vid = await A.db.vehicles.add({ ad: 'Odo Test', batt: 77, kmStart: 12000, kmNow: 12000 });
A.S.defaultVehicleId = vid;

// Formu doldurup kaydeden yardımcı
async function addViaForm({ date, kwh = 30, amount = 300, dist = '', odo = '' }) {
  await A.openAdd();
  await sleep(180);
  $('in-date').value = date;
  $('in-kwh').value = String(kwh);
  $('in-amount').value = String(amount);
  $('in-dist').value = String(dist);
  $('in-odo').value = String(odo);
  if ($('in-vehicle')) $('in-vehicle').value = String(vid);
  $('btn-save').click();
  await sleep(420);
  return !$('page-add').classList.contains('active');
}
const rowsByDate = async () => (await A.db.sessions.toArray())
  .sort((a, b) => a.tarih.localeCompare(b.tarih));

// ---------- KABUL 1: sırasız giriş ----------
// Önce 1 Nisan (odo 13100), sonra 14 Mart (odo 12400) -> 1 Nisan mesafesi 700
await addViaForm({ date: '2026-04-01', odo: 13100 });
let rs = await rowsByDate();
check('WT-19: ilk odo kaydında mesafe null (kıyas noktası yok)',
  rs.length === 1 && rs[0].mesafeKm == null, 'mesafeKm=' + (rs[0] && rs[0].mesafeKm));

await addViaForm({ date: '2026-03-14', odo: 12400 });
rs = await rowsByDate();
check('WT-19 KABUL-1: sonradan girilen geçmiş kayıt zinciri yeniden kurdu',
  rs.length === 2 && rs[0].tarih.startsWith('2026-03-14') && rs[0].mesafeKm == null
    && rs[1].mesafeKm === 700,
  `14 Mart=${rs[0].mesafeKm} · 1 Nisan=${rs[1].mesafeKm} (beklenen 700)`);

// ---------- KABUL 2: aralık dışı odo reddedilmeli ----------
// 14 Mart için 13500 gir -> 1 Nisan'ın 13100'ünü aşıyor
const ok2 = await addViaForm({ date: '2026-03-20', odo: 13500 });
check('WT-19 KABUL-2: iki komşu arasına sığmayan odo reddedildi',
  !ok2 && (await A.db.sessions.count()) === 2,
  'form-err: ' + $('form-err').textContent);
check('WT-19: hata mesajı iki komşu kaydın tarihini söylüyor',
  /Mar/.test($('form-err').textContent) && /Nis/.test($('form-err').textContent),
  $('form-err').textContent);
$('btn-close-add').click();
await sleep(200);

// aracın kmStart'ından küçük odo
const ok3 = await addViaForm({ date: '2026-02-01', odo: 11000 });
check('WT-19/4: kmStart altındaki odo reddedildi',
  !ok3 && (await A.db.sessions.count()) === 2,
  'form-err: ' + $('form-err').textContent);
$('btn-close-add').click();
await sleep(200);

// ---------- KABUL 3: yalnız mesafe girilmiş eski kayıtlar bozulmamalı ----------
const legacyId = await A.db.sessions.add({
  tarih: '2026-03-20T12:00', firma: 'ZES', tip: 'DC', kwh: 25, tutar: 250,
  odenen: 250, cur: 'TRY', aracId: vid, mesafeKm: 180   // odo YOK
});
await A.tureMesafe(vid);
await sleep(200);
const legacy = await A.db.sessions.get(legacyId);
check('WT-19 KABUL-3: yalnız mesafe girilmiş kayıt yeniden hesaplamadan etkilenmedi',
  legacy.mesafeKm === 180 && legacy.odo == null, 'mesafeKm=' + legacy.mesafeKm);
rs = await rowsByDate();
check('WT-19: odo zinciri aradaki mesafe-kaydını atlıyor (hâlâ 700)',
  rs.find(r => r.odo === 13100).mesafeKm === 700,
  '1 Nisan=' + rs.find(r => r.odo === 13100).mesafeKm);

// ---------- mesafe + odo birlikte girilemez ----------
const ok4 = await addViaForm({ date: '2026-04-10', dist: 100, odo: 13500 });
check('WT-19/2: mesafe ve sayaç birlikte girilemiyor',
  !ok4, 'form-err: ' + $('form-err').textContent);
$('btn-close-add').click();
await sleep(200);

// ---------- silme: ortadaki odo kaydı silinince halefi yeniden hesaplanmalı ----------
await addViaForm({ date: '2026-05-01', odo: 13800 });
rs = await rowsByDate();
const mid = rs.find(r => r.odo === 13100);
check('silme öncesi: 1 Mayıs mesafesi 700 (13800-13100)',
  rs.find(r => r.odo === 13800).mesafeKm === 700,
  '1 Mayıs=' + rs.find(r => r.odo === 13800).mesafeKm);
await A.db.sessions.delete(mid.id);
await A.tureMesafe(vid);
await sleep(200);
rs = await rowsByDate();
check('WT-19: ortadaki odo kaydı silinince halefi yeniden hesaplandı (1400)',
  rs.find(r => r.odo === 13800).mesafeKm === 1400,
  '1 Mayıs=' + rs.find(r => r.odo === 13800).mesafeKm + ' (13800-12400 = 1400)');

// ---------- kmNow: kayıtlardaki en son odo ile elle girilenin büyüğü ----------
let info = await A.odoNowOf(await A.db.vehicles.get(vid));
check('WT-19/5: sayaç kayıtlardaki en son odo değerini aldı',
  info.km === 13800 && info.src === 'records', `km=${info.km} src=${info.src}`);
await A.db.vehicles.update(vid, { kmNow: 20000 });
info = await A.odoNowOf(await A.db.vehicles.get(vid));
check('WT-19/5: elle girilen daha büyükse o kullanılıyor',
  info.km === 20000 && info.src === 'manual', `km=${info.km} src=${info.src}`);
await A.renderVehiclePage();
await sleep(250);
check('WT-19/5: Aracım sayfasında sayaç kaynağı not olarak yazılı',
  /elle/i.test(w.document.getElementById('set-vehicles').textContent),
  w.document.getElementById('set-vehicles').textContent.replace(/\s+/g, ' ').trim().slice(0, 110));

// ---------- birim dönüşümü: mi kullanıcısı ----------
await A.db.sessions.clear();
await A.db.vehicles.update(vid, { kmStart: 0, kmNow: 0 });
A.S.unit = 'mi';
await addViaForm({ date: '2026-06-01', odo: 10000 });   // 10000 mi
await addViaForm({ date: '2026-06-10', odo: 10100 });   // +100 mi
rs = await rowsByDate();
const MI = 1.60934;
check('WT-19: mi girişi km olarak saklandı',
  Math.abs(rs[0].odo - 10000 * MI) < 2, 'odo(km)=' + rs[0].odo);
check('WT-19: türetilen mesafe de km cinsinden (100 mi ≈ 161 km)',
  Math.abs(rs[1].mesafeKm - 100 * MI) < 2, 'mesafeKm=' + rs[1].mesafeKm);

// mi kullanıcısına hata mesajı da mi cinsinden gelmeli
const nb = await A.odoNeighbourCheck(vid, '2026-06-05T12:00', 20000 * MI, null);
check('WT-19: hata mesajı GÖSTERİM biriminde (mi) yazılıyor',
  !nb.ok && /mi/.test(nb.msg) && /10\.100/.test(nb.msg),
  'mesaj: ' + nb.msg);
A.S.unit = 'km';

// ---------- WT-20: atlanan şarj kaydı ----------
{
  await A.db.sessions.clear();
  await A.db.vehicles.update(vid, { kmStart: 0, kmNow: 0 });
  A.S.unit = 'km';
  A.S.period = 'year';

  // Normal geçmiş: 6 kayıt, her biri 20 kWh / 100 km -> 20 kWh/100km
  for (let i = 1; i <= 6; i++) {
    await A.db.sessions.add({
      tarih: `2026-01-0${i}T12:00`, firma: 'ZES', tip: 'DC', kwh: 20, tutar: 200,
      odenen: 200, cur: 'TRY', aracId: vid, mesafeKm: 100
    });
  }
  check('WT-20/4: normal tüketimde sezgi tetiklenmiyor',
    (await A.looksLikeMissedCharge(vid, 100, 20, null)) === false);
  // aynı 20 kWh ile 300 km -> 6,7 kWh/100km, ortalamanın yarısının altında
  check('WT-20/4 KABUL: aynı enerjiyle anormal çok yol -> sezgi tetikleniyor',
    (await A.looksLikeMissedCharge(vid, 300, 20, null)) === true);

  // 5'ten az geçmişte sormamalı
  await A.db.sessions.clear();
  for (let i = 1; i <= 3; i++) {
    await A.db.sessions.add({
      tarih: `2026-02-0${i}T12:00`, firma: 'ZES', tip: 'DC', kwh: 20, tutar: 200,
      odenen: 200, cur: 'TRY', aracId: vid, mesafeKm: 100
    });
  }
  check('WT-20/4: 5 geçmiş kayıt yoksa sorulmuyor',
    (await A.looksLikeMissedCharge(vid, 300, 20, null)) === false);

  // --- KABUL: atlanan kayıt ortalamayı bozmasın, harcamaya girsin ---
  await A.db.sessions.clear();
  for (let i = 1; i <= 4; i++) {
    await A.db.sessions.add({
      tarih: `2026-03-0${i}T12:00`, firma: 'ZES', tip: 'DC', kwh: 20, tutar: 200,
      odenen: 200, cur: 'TRY', aracId: vid, mesafeKm: 100
    });
  }
  A.S.dashVeh = '';
  await A.renderDashboard();
  await sleep(350);
  const kmCostBefore = $('d-1km').textContent;
  const spendBefore = $('d-total').textContent;
  const kwhBefore = $('d-kwh').textContent;

  // atlanan işaretli kayıt: 20 kWh, 300 km, 200 TL
  await A.db.sessions.add({
    tarih: '2026-03-10T12:00', firma: 'ZES', tip: 'DC', kwh: 20, tutar: 200,
    odenen: 200, cur: 'TRY', aracId: vid, mesafeKm: 300, atlanan: true
  });
  await A.renderDashboard();
  await sleep(350);
  check('WT-20 KABUL: atlanan kayıt km maliyeti ortalamasını BOZMADI',
    $('d-1km').textContent === kmCostBefore,
    `önce=${kmCostBefore} sonra=${$('d-1km').textContent}`);
  check('WT-20 KABUL: harcama toplamı yine de arttı',
    $('d-total').textContent !== spendBefore,
    `önce=${spendBefore} sonra=${$('d-total').textContent}`);
  check('WT-20: enerji toplamı da arttı',
    $('d-kwh').textContent !== kwhBefore,
    `önce=${kwhBefore} sonra=${$('d-kwh').textContent}`);
}

// ---------- WT-17: sayaç modunda kıyas grafiği ----------
{
  await A.db.sessions.clear();
  A.S.cmpVeh = '';
  A.S.cmp = { price: 45, cons: 7, fuel: 'petrol', icefix: 0, prorate: true };
  await A.saveSetting('cmp', A.S.cmp);
  // mesafesi OLMAYAN kayıtlar + sayaçlı araç -> odoMode
  await A.db.vehicles.update(vid, { kmStart: 10000, kmNow: 15000 });
  for (let i = 1; i <= 3; i++) {
    await A.db.sessions.add({
      tarih: `2026-04-0${i}T12:00`, firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', aracId: vid
    });
  }
  await A.renderCompare();
  await sleep(400);
  check('WT-17: sayaç modunda kıyas grafiği gizlendi',
    $('c-line-card').style.display === 'none',
    'display=' + $('c-line-card').style.display);
  check('WT-17: yerine açıklama gösteriliyor',
    $('c-line-note').style.display !== 'none' && $('c-line-note').textContent.trim() !== '',
    'not=' + $('c-line-note').textContent.slice(0, 70));
  check('WT-17: toplam rakamlar görünmeye devam ediyor',
    $('c-dist').textContent !== '—' && $('c-savetot').textContent !== '—',
    `mesafe=${$('c-dist').textContent} kazanç=${$('c-savetot').textContent}`);

  // kayıtlara gerçek mesafe ver -> grafik geri gelmeli
  for (const r of await A.db.sessions.toArray())
    await A.db.sessions.update(r.id, { mesafeKm: 200 });
  await A.renderCompare();
  await sleep(400);
  check('WT-17: gerçek mesafe varken grafik geri geliyor (silinmedi)',
    $('c-line-card').style.display !== 'none' && $('c-line-note').style.display === 'none',
    'display=' + $('c-line-card').style.display);
}

const failed = results.filter(r => !r).length;
console.log('\n' + (failed ? `${failed} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ') + ` (${results.length} kontrol)`);
if (errors.length) { console.log('\nHatalar:'); errors.slice(0, 6).forEach(e => console.log('  - ' + e.slice(0, 250))); }
process.exit(failed || errors.length ? 1 : 0);
