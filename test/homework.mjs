/* WT-16 doğrulaması: Ev-İş / Firma ayrımı, şema v3 migration'ı ve
   Ev-İş şarjında kWh birim fiyatından tutar hesabı.

   Migration ayrı bir cihaz gibi test edilir: ÖNCE v2 şemasıyla eski biçimde
   veri yazılır (firma: 'Ev'), sonra uygulama açılıp v3 upgrade'inin veriyi
   bozmadan dönüştürdüğü kontrol edilir.
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

// Aynı IndexedDB'yi iki ayrı "açılış" arasında paylaşmak için tek fabrika
const idb = new FDBFactory();

function makeWindow() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    if (/Not implemented: navigation/.test(e.message || '')) return;
    errors.push('jsdomError: ' + (e.stack || e.message));
  });
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), {
    url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
  });
  const { window } = dom;
  window.indexedDB = idb;
  window.IDBKeyRange = FDBKeyRange;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  window.fetch = () => Promise.reject(new Error('offline'));
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true, value: { register: () => Promise.reject(new Error('x')), addEventListener() {} }
  });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  // WT-37: jsdom'da HTMLMediaElement.play() yok; splash yedek yolu koşsun
  window.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('autoplay blocked (test)'));
  window.confirm = () => true;
  window.alert = () => {};
  return window;
}

// ---------- 1. AŞAMA: eski (v2) şemayla veri yaz ----------
{
  const w = makeWindow();
  w.eval(fs.readFileSync(path.join(ROOT, 'dexie.min.js'), 'utf8')
    + `\n;window.__mk = () => {
        const old = new Dexie('watttrack');
        old.version(2).stores({
          sessions: '++id, tarih, firma, tip, aracId',
          vehicles: '++id, ad',
          settings: 'key',
          expenses: '++id, tarih, tur, aracId'
        });
        return old;
      };`);
  const old = w.__mk();
  await old.open();
  await old.settings.put({ key: 'lang', value: 'tr' });
  await old.settings.put({ key: 'onboarded', value: true });
  await old.sessions.bulkAdd([
    // eski EV kaydı: firma 'Ev', tip AC olarak saklanmış
    { tarih: '2026-07-02T12:00', firma: 'Ev', tip: 'AC', kwh: 30, tutar: 90, odenen: 90, cur: 'TRY', aracId: null },
    // eski firma kaydı
    { tarih: '2026-07-03T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 600, odenen: 600, cur: 'TRY', aracId: null },
    // eski AC firma kaydı (ev DEĞİL)
    { tarih: '2026-07-04T12:00', firma: 'Trugo', tip: 'AC', kwh: 20, tutar: 200, odenen: 200, cur: 'TRY', aracId: null }
  ]);
  const before = await old.sessions.toArray();
  check('hazırlık: v2 şemasıyla 3 kayıt yazıldı', before.length === 3);
  check('hazırlık: eski kayıtlarda mekan alanı YOK',
    before.every(r => r.mekan === undefined));
  old.close();
}

// ---------- 2. AŞAMA: uygulamayı aç, v3 upgrade çalışsın ----------
const w = makeWindow();
w.eval(['version.js', 'dexie.min.js', 'evdata.js', 'evprices.js', 'db.js', 'calc.js', 'i18n.js', 'ocr.js', 'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js', 'ui/history.js', 'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js', 'app.js']
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + `\n;window.__app = {db, S, t, openAdd, renderStats, saveSetting,
       syncHomePricing, HOME_LABEL, OLD_HOME_NAMES, isHomeFirm, applyI18n};`);
await sleep(1400);
const A = w.__app;
const $ = id => w.document.getElementById(id);

// --- migration ---
const rows = (await A.db.sessions.toArray()).sort((a, b) => a.tarih.localeCompare(b.tarih));
check('WT-16/4 migration: hiçbir kayıt kaybolmadı', rows.length === 3, 'kayıt=' + rows.length);
check('WT-16/4 migration: eski "Ev" kaydı mekan=evis oldu',
  rows[0].mekan === 'evis', 'mekan=' + rows[0].mekan);
check('WT-16/4 migration: eski "Ev" kaydının firması "Ev-İş" oldu',
  rows[0].firma === 'Ev-İş', 'firma=' + rows[0].firma);
check('WT-16/4 migration: firma kayıtları mekan=firma oldu',
  rows[1].mekan === 'firma' && rows[2].mekan === 'firma',
  `${rows[1].mekan} / ${rows[2].mekan}`);
check('WT-16/4 migration: tutar ve kWh değerleri bozulmadı',
  rows[0].kwh === 30 && rows[0].odenen === 90 && rows[1].odenen === 600);
check('WT-16/4 migration: AC olan firma kaydı Ev-İş sayılmadı',
  rows[2].firma === 'Trugo' && rows[2].mekan === 'firma');

// --- iki donut ---
A.S.gran = 'year';
A.S.dashVeh = '';
await A.renderStats();
await sleep(400);
const tipLeg = $('d-donut-legend').textContent;
const placeLeg = $('d-donut2-legend').textContent;
check('WT-16/5: şarj TİPİ donutu yalnız DC/AC gösteriyor',
  /DC/.test(tipLeg) && /AC/.test(tipLeg) && !/Ev-İş/.test(tipLeg),
  'tip = ' + tipLeg.replace(/\s+/g, ' ').trim());
check('WT-16/5: şarj YERİ donutu Ev-İş / Şarj firması gösteriyor',
  /Ev-İş/.test(placeLeg) && /firma/i.test(placeLeg),
  'yer = ' + placeLeg.replace(/\s+/g, ' ').trim());
check('WT-16/6: tip donutu ana sayfayla aynı `tip` alanını kullanıyor (AC=50 kWh)',
  /AC\s*50 kWh/.test(placeLeg) === false && /50 kWh/.test(tipLeg),
  'tip = ' + tipLeg.replace(/\s+/g, ' ').trim());

// --- WT-16/B + C: form davranışı ---
A.S.homeKwhPrice = 2.80;
await A.saveSetting('homeKwhPrice', 2.80);
A.S.currency = 'TRY';
A.S.country = 'TR';

await A.openAdd();
await sleep(250);
// DC varsayılan geliyor; AC'ye bas
const acBtn = [...$('in-tip').querySelectorAll('button')].find(b => b.dataset.v === 'AC');
acBtn.click();
await sleep(200);
check('WT-16/B KABUL: AC seçilince firma otomatik "Ev-İş" geldi',
  $('in-firm').value === 'Ev-İş', 'firma=' + $('in-firm').value);
check('WT-16/C KABUL: kWh fiyatı alanı açıldı',
  $('wrap-unitprice').style.display !== 'none');
check('WT-16/C: birim fiyat Ayarlar\'daki değerle önceden dolu',
  $('in-unitprice').value === '2,80', 'değer=' + $('in-unitprice').value);
check('WT-16/C5: Ev-İş kaydında indirim bloğu gizli',
  $('wrap-disc').style.display === 'none');

// 40 kWh + 2,80 -> 112,00
$('in-kwh').value = '40';
$('in-kwh').dispatchEvent(new w.Event('input', { bubbles: true }));
await sleep(150);
// WT-65: tutar artık TAM + ONDALIK iki kutuda
check('WT-16/C KABUL: 40 kWh × 2,80 → tutar 112,00 doldu',
  $('in-amount').value === '112' && $('in-amount-dec').value === '',
  `tutar=${$('in-amount').value} | ${$('in-amount-dec').value}`);

// tutarın üzerine elle 100 yaz
$('in-amount').value = '100';
$('in-amount').dispatchEvent(new w.Event('input', { bubbles: true }));
await sleep(150);
check('WT-16/C3: elle yazınca birim fiyat alanı gri gösteriliyor',
  $('in-unitprice').style.opacity === '0.5' || $('in-unitprice').style.opacity === '.5',
  'opacity=' + $('in-unitprice').style.opacity);

$('in-date').value = '2026-07-20';
$('btn-save').click();
await sleep(500);
const saved = (await A.db.sessions.toArray()).find(r => r.tarih.startsWith('2026-07-20'));
check('WT-16/C KABUL: tutarın üzerine yazılan 100 kaydedildi',
  saved && saved.tutar === 100, 'tutar=' + (saved && saved.tutar));
check('WT-16/C4: hangi yöntem kullanıldığı kayıtta saklandı',
  saved && saved.tutarKaynak === 'manuel', 'tutarKaynak=' + (saved && saved.tutarKaynak));
check('WT-16/1: yeni kayıtta mekan=evis',
  saved && saved.mekan === 'evis', 'mekan=' + (saved && saved.mekan));

// DC seç -> alan kaybolmalı
await A.openAdd();
await sleep(250);
const dcBtn = [...$('in-tip').querySelectorAll('button')].find(b => b.dataset.v === 'DC');
[...$('in-tip').querySelectorAll('button')].find(b => b.dataset.v === 'AC').click();
await sleep(150);
dcBtn.click();
await sleep(200);
check('WT-16/C KABUL: DC seçilince kWh fiyatı alanı kayboldu',
  $('wrap-unitprice').style.display === 'none',
  'display=' + $('wrap-unitprice').style.display);
check('WT-16/B: DC seçilince firma listesi Ev-İş\'ten çıktı',
  $('in-firm').value !== 'Ev-İş', 'firma=' + $('in-firm').value);

// ---------- Ev-İş kimliği DİLE BAĞLI OLMAMALI ----------
// Kullanıcı kayıtları Türkçe girip sonra İngilizce'ye geçerse 'Ev-İş' değeri
// t('homeChip') ile eşleşmez; birim fiyat alanı açılmaz, indirim geri gelir
// ve yeniden kaydedince mekan sessizce 'firma'ya kayardı.
{
  check('tanıma kümesi altı dilin yeni ve eski etiketlerini biliyor',
    A.isHomeFirm('Ev-İş') && A.isHomeFirm('Home/Work') && A.isHomeFirm('Casa/Lavoro')
      && A.isHomeFirm('Ev') && A.isHomeFirm('Zuhause') && !A.isHomeFirm('ZES'));

  // Türkçe'de bir Ev-İş kaydı oluştur
  A.S.lang = 'tr';
  const hid = await A.db.sessions.add({
    tarih: '2026-08-01T12:00', firma: 'Ev-İş', mekan: 'evis', tip: 'AC',
    kwh: 40, tutar: 112, odenen: 112, cur: 'TRY', aracId: null,
    tutarKaynak: 'birimFiyat', birimFiyat: 2.80
  });

  // Dili İngilizce yap ve kaydı düzenlemeye aç
  A.S.lang = 'en';
  A.applyI18n();
  await A.openAdd(hid);
  await sleep(300);

  check('dil değişince eski Ev-İş kaydı yine ev olarak tanınıyor',
    A.isHomeFirm($('in-firm').value), 'firma seçili=' + $('in-firm').value);
  check('KUSUR DÜZELDİ: kWh birim fiyatı alanı hâlâ açık',
    $('wrap-unitprice').style.display !== 'none',
    'display=' + $('wrap-unitprice').style.display);
  check('KUSUR DÜZELDİ: indirim bloğu hâlâ gizli',
    $('wrap-disc').style.display === 'none',
    'display=' + $('wrap-disc').style.display);
  check('firma listesinde iki ayrı "ev" satırı yok',
    [...$('in-firm').options].filter(o => A.isHomeFirm(o.value)).length === 1,
    'ev satırları: ' + [...$('in-firm').options].filter(o => A.isHomeFirm(o.value)).map(o => o.value).join(', '));

  // hiçbir şey değiştirmeden yeniden kaydet
  $('btn-save').click();
  await sleep(450);
  const after = await A.db.sessions.get(hid);
  check('KUSUR DÜZELDİ: yeniden kaydedince mekan evis kaldı (firmaya kaymadı)',
    after.mekan === 'evis', 'mekan=' + after.mekan);
  A.S.lang = 'tr';
  A.applyI18n();
}

const failed = results.filter(r => !r).length;
console.log('\n' + (failed ? `${failed} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ') + ` (${results.length} kontrol)`);
if (errors.length) { console.log('\nHatalar:'); errors.slice(0, 6).forEach(e => console.log('  - ' + e.slice(0, 250))); }
process.exit(failed || errors.length ? 1 : 0);
