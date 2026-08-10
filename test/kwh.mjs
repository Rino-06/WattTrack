/* WT-81/8 — "yeni kurulumda ev elektrik fiyatı Türkiye fiyatı kalıyor"

   KUSUR: app.js init() `kwhPriceAutofill()`i onboarding'den ÖNCE çağırıyor.
   Yeni kurulumda ayarlar tablosu boş, dolayısıyla S.country hâlâ calc.js'teki
   varsayılan 'TR'. Kullanıcı daha ülkesini SEÇMEDEN Türkiye fiyatı
   (2,8076 TRY) `homeKwhPrice`a yazılıyordu. finishOnboarding() ülkeyi sonra
   kaydediyor ama autofill'i tekrar çağırmıyordu; ayarlardaki ülke seçicisinin
   çağrısı da alan artık dolu olduğu için ölüydü (`homeKwhPrice != null`).

   Sonuç: Almanya'da kurulan uygulamada €/kWh fiyatı 2,8076 kalıyordu —
   gerçeğin (~0,395 €) yedi katı — ve ev/iş şarjlarının tutarını bu hesaplıyor.

   Bu dosya uygulamayı BOŞ veritabanıyla, onboarding'i ATLAMADAN açıyor;
   diğer koşumlar (boot.mjs) onboarded=true yazarak başlıyor, bu yüzden
   kusur oralarda görünmüyordu.
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
  window.confirm = () => true;
  window.alert = () => {};

  const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'evprices.js', 'db.js',
    'calc.js', 'i18n.js', 'ocr.js', 'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js',
    'ui/history.js', 'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js',
    'app.js']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
    + `\n;window.__app = {db, S, t, finishOnboarding, kwhPriceAutofill,
         defaultKwhPrice, renderSettings, saveSetting, backupPayload,
         importBackupText, loadSettings, kwhFiyatOnar, kwhRegions,
         TR_KWH_2025, renderDashboard};`;
  window.eval(bundle);
  await new Promise(r => setTimeout(r, 1200));
  return window;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = (w, id) => w.document.getElementById(id);

const w = await boot();
const A = w.__app;

// ---- Taban: onboarding gerçekten AÇIK, yani bu taze bir kurulum ----
check('WT-81/8: taze kurulumda onboarding açılıyor (senaryo doğru kuruldu)',
  A.S.onboarded === false, 'onboarded=' + A.S.onboarded);

// init() çalıştı; kusur buradaydı: ülke seçilmeden TR fiyatı yazılıyordu.
const trFiyat = A.defaultKwhPrice('TR');
const deFiyat = A.defaultKwhPrice('DE');
check('WT-81/8: gömülü tabloda TR ve DE fiyatları ayrı (test anlamlı)',
  trFiyat && deFiyat && Math.abs(trFiyat.p - deFiyat.p) > 1,
  `TR=${trFiyat?.p} ${trFiyat?.cur} · DE=${deFiyat?.p} ${deFiyat?.cur}`);

// ---- Kullanıcı onboarding'de ALMANYA'yı seçiyor ----
$(w, 'ob-country').value = 'DE';
$(w, 'ob-currency').value = 'EUR';
$(w, 'ob-lang').value = 'de';
await A.finishOnboarding(false);
await sleep(300);

check('WT-81/8: onboarding ülkeyi kaydetti',
  A.S.country === 'DE' && A.S.currency === 'EUR', `country=${A.S.country} cur=${A.S.currency}`);

check('WT-81/8 KABUL: onboarding sonrası fiyat SEÇİLEN ülkenin fiyatı',
  Math.abs(A.S.homeKwhPrice - deFiyat.p) < 1e-9,
  `homeKwhPrice=${A.S.homeKwhPrice} · beklenen ${deFiyat.p} · TR fiyatı ${trFiyat.p}`);

check('WT-81/8 KABUL: Türkiye fiyatı Almanya kurulumunda KALMIYOR',
  Math.abs(A.S.homeKwhPrice - trFiyat.p) > 1e-9, `homeKwhPrice=${A.S.homeKwhPrice}`);

// Değer veritabanına da yazılmış olmalı (yalnız bellekte kalmasın)
const kayit = await A.db.settings.get('homeKwhPrice');
check('WT-81/8: doğru fiyat veritabanına yazıldı',
  kayit && Math.abs(kayit.value - deFiyat.p) < 1e-9, 'kayıtlı=' + kayit?.value);

// ---- Köken işareti: tablodan gelen değer ülke değişince tazelenir ----
check('WT-81/8: tablodan gelen değer homeKwhAuto ile işaretli',
  A.S.homeKwhAuto === true, 'homeKwhAuto=' + A.S.homeKwhAuto);

A.S.country = 'FR';
await A.saveSetting('country', 'FR');
await A.kwhPriceAutofill();
const frFiyat = A.defaultKwhPrice('FR');
check('WT-81/8 KABUL: ülke değişince OTOMATİK fiyat tazeleniyor',
  Math.abs(A.S.homeKwhPrice - frFiyat.p) < 1e-9,
  `homeKwhPrice=${A.S.homeKwhPrice} · FR=${frFiyat.p}`);

// ---- WT-78'in asıl değişmezi: ELLE girilen değer ASLA ezilmez ----
A.S.homeKwhPrice = 0.1234;
A.S.homeKwhAuto = false;                       // kullanıcı elle yazdı
await A.saveSetting('homeKwhPrice', 0.1234);
await A.saveSetting('homeKwhAuto', false);
A.S.country = 'ES';
await A.saveSetting('country', 'ES');
const degistiMi = await A.kwhPriceAutofill();
// WT-87: dönüş değeri artık ev + iş fiyatını birlikte kapsıyor; iş fiyatı
// hâlâ tablodan geldiği için ülke değişince tazelenir. Sınanan değişmez
// ELLE girilen ev fiyatının korunması.
check('WT-81/8 KABUL: elle girilen fiyat ülke değişse de EZİLMİYOR (WT-78)',
  A.S.homeKwhPrice === 0.1234 && A.S.homeKwhAuto === false,
  `homeKwhPrice=${A.S.homeKwhPrice} auto=${A.S.homeKwhAuto} dönüş=${degistiMi}`);

// ---- Mevcut kurulumlar: işaretsiz değer elle girilmiş sayılır (tedbirli) ----
A.S.homeKwhPrice = 2.8076;
delete A.S.homeKwhAuto;                        // v35'ten yükselen kurulum
await A.saveSetting('homeKwhPrice', 2.8076);
const degistiMi2 = await A.kwhPriceAutofill();
check('WT-81/8: yükseltmede işaretsiz değere dokunulmuyor (sürpriz yazma yok)',
  degistiMi2 === false && A.S.homeKwhPrice === 2.8076, 'homeKwhPrice=' + A.S.homeKwhPrice);

// ---- Köken işareti YEDEK turundan sağ çıkmalı ----
// WT-78'in değişmezi artık homeKwhAuto'ya DAYANIYOR; işaret yedekte
// kaybolursa değişmez de kaybolur.
A.S.homeKwhPrice = 0.28;
A.S.homeKwhAuto = false;                       // kullanıcı elle yazdı
await A.saveSetting('homeKwhPrice', 0.28);
await A.saveSetting('homeKwhAuto', false);
const yedek = await A.backupPayload();
const isaretSatiri = yedek.settings.find(r => r.key === 'homeKwhAuto');
check('WT-81/8: köken işareti yedeğe giriyor',
  isaretSatiri && isaretSatiri.value === false,
  'satır=' + JSON.stringify(isaretSatiri));

// ESKİ (v35) yedek senaryosu: dosyada homeKwhAuto satırı YOK, ama canlı
// oturumda taze kurulumun autofill'inden kalan true var. Geri yükleme
// yalnız gelen anahtarları yazdığı için işaret true kalır ve kullanıcının
// yedekteki elle girdiği fiyat sonraki ülke değişikliğinde ezilirdi.
const eskiYedek = {...yedek, settings: yedek.settings.filter(r => r.key !== 'homeKwhAuto')};
A.S.homeKwhAuto = true;
await A.saveSetting('homeKwhAuto', true);
await A.importBackupText(JSON.stringify(eskiYedek));
await sleep(500);
await A.loadSettings();
check('WT-81/8 KABUL: eski yedekte işaret yoksa fiyat "elle girilmiş" sayılıyor',
  A.S.homeKwhAuto === false && Math.abs(A.S.homeKwhPrice - 0.28) < 1e-9,
  `auto=${A.S.homeKwhAuto} fiyat=${A.S.homeKwhPrice}`);

A.S.country = 'DE';
await A.saveSetting('country', 'DE');
await A.kwhPriceAutofill();
check('WT-81/8 KABUL: eski yedekten gelen fiyat ülke değişince EZİLMİYOR',
  Math.abs(A.S.homeKwhPrice - 0.28) < 1e-9, 'fiyat=' + A.S.homeKwhPrice);

// ============================================================
// WT-83 — WT-81/8'den ÖNCE kurulmuş cihazlar için tek seferlik onarım
// ============================================================
// Asıl sınav POZİTİF durum değil, DOKUNMAMASI gereken durumlar: bu geri
// alınamaz bir yazma, yanlış tetiklenirse kullanıcının kendi verisini bozar.
// WT-87: onarımın aradığı imza TABLODAKİ güncel TR fiyatı DEĞİL, kusurun o
// gün yazdığı dondurulmuş değer. Tablo 2,8076 → 3,24 olarak güncellendi;
// imza tabloya bağlı kalsaydı onarım bu sürümde sessizce ölürdü.
const TR = A.TR_KWH_2025;
check('WT-87: onarım imzası tablodan AYRIŞTI (dondurulmuş değer kullanılıyor)',
  TR === 2.8076 && A.defaultKwhPrice('TR', '').p !== TR,
  `imza=${TR} tablo=${A.defaultKwhPrice('TR', '').p}`);
check('WT-87 KABUL: TR mesken 3,24 · ticarethane 5,46',
  A.defaultKwhPrice('TR', '').p === 3.24
    && A.defaultKwhPrice('TR', '', 'is').p === 5.46
    && A.defaultKwhPrice('TR', '', 'is').is === true,
  `mesken=${A.defaultKwhPrice('TR', '').p} iş=${A.defaultKwhPrice('TR', '', 'is').p}`);
check('WT-87: tabloda pw olmayan ülkede iş fiyatı meskene düşüyor (uydurma çarpan yok)',
  A.defaultKwhPrice('DE', '', 'is').p === A.defaultKwhPrice('DE', '').p
    && A.defaultKwhPrice('DE', '', 'is').is === false);

// Onarımı çağırmadan önce cihazı "kusurlu kurulum" hâline getiren yardımcı
const kur = async (country, currency, fiyat) => {
  A.S.country = country; A.S.currency = currency; A.S.homeKwhPrice = fiyat;
  A.S.kwhRegion = '';
  delete A.S.homeKwhAuto;                 // v35'ten yükselen kurulum: işaret yok
  await A.saveSetting('country', country);
  await A.saveSetting('currency', currency);
  await A.saveSetting('homeKwhPrice', fiyat);
  await A.saveSetting('kwhRegion', '');
};

// --- POZİTİF: tam olarak kusurun ürettiği imza ---
await kur('DE', 'EUR', TR);
const onarildi = await A.kwhFiyatOnar();
check('WT-83 KABUL: TR dışı kurulumdaki TR fiyatı onarılıyor',
  onarildi === true && Math.abs(A.S.homeKwhPrice - A.defaultKwhPrice('DE').p) < 1e-9,
  `onarıldı=${onarildi} fiyat=${A.S.homeKwhPrice} (DE=${A.defaultKwhPrice('DE').p})`);
check('WT-83: onarılan değer tablo değeri olarak işaretleniyor',
  A.S.homeKwhAuto === true, 'homeKwhAuto=' + A.S.homeKwhAuto);
check('WT-83 KABUL: kullanıcıya ESKİ ve YENİ değer birlikte gösteriliyor',
  (() => { const el = $(w, 'd-warnings');
    const m = el && el.textContent || '';
    return /2,81/.test(m) && new RegExp(A.defaultKwhPrice('DE').p.toFixed(2).replace('.', ',')).test(m);
  })(), ($(w, 'd-warnings').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 110));

// Şerit, ana sayfa ÇİZİLDİKTEN sonra da durmalı. Üretimdeki sıra
// init(): kwhFiyatOnar() → … → renderDashboard(). renderWarnings() bütün
// `.warn-host` kutularını boşaltıp yeniden yazdığı için sıra önemli; şerit
// bir kez gösteriliyor (kapatılabilir, `warnings` bellekte, onarım sonraki
// açılışlarda false dönüyor), yani o tek boyamada kaybolursa kullanıcı
// verisinin değiştiğini HİÇ öğrenemez.
await A.renderDashboard();
await sleep(300);
check('WT-83 KABUL: uyarı şeridi ana sayfa çizildikten sonra da duruyor',
  /2,81/.test($(w, 'd-warnings').textContent || ''),
  ($(w, 'd-warnings').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) || 'BOŞ');

// Tekrar koşarsa bir daha yazmamalı (init her açılışta çağırıyor)
const ikinci = await A.kwhFiyatOnar();
check('WT-83: ikinci açılışta yeniden yazmıyor (tekrar koruması)',
  ikinci === false, 'dönüş=' + ikinci);

// --- NEGATİF 1: ülke TR ise dokunma (fiyat zaten doğru) ---
await kur('TR', 'TRY', TR);
check('WT-83: TR kurulumuna DOKUNMUYOR',
  (await A.kwhFiyatOnar()) === false && A.S.homeKwhPrice === TR,
  'fiyat=' + A.S.homeKwhPrice);

// --- NEGATİF 2: TR dışı ama para birimi TRY (kullanıcı bilerek seçmiş) ---
await kur('DE', 'TRY', TR);
check('WT-83: para birimi TRY ise DOKUNMUYOR',
  (await A.kwhFiyatOnar()) === false && A.S.homeKwhPrice === TR,
  'fiyat=' + A.S.homeKwhPrice);

// --- NEGATİF 3: TR dışı, fiyat TR varsayılanı DEĞİL (kullanıcının kendi değeri) ---
await kur('DE', 'EUR', 0.42);
check('WT-83 KABUL: kullanıcının kendi fiyatına DOKUNMUYOR',
  (await A.kwhFiyatOnar()) === false && A.S.homeKwhPrice === 0.42,
  'fiyat=' + A.S.homeKwhPrice);

// Kıl payı fark bile eşleşme sayılmamalı — imza BİT BİT aynı olmalı
await kur('DE', 'EUR', TR + 0.0001);
check('WT-83: TR fiyatına çok yakın ama eşit olmayan değere DOKUNMUYOR',
  (await A.kwhFiyatOnar()) === false,
  'fiyat=' + A.S.homeKwhPrice + ' (TR=' + TR + ')');

// --- NEGATİF 4: tabloda karşılığı olmayan ülke (MC/AD/SM) — temiz çıkmalı ---
const tablosuz = ['MC', 'AD', 'SM'].find(c => !A.defaultKwhPrice(c, ''));
await kur(tablosuz, 'EUR', TR);
const cikis = await A.kwhFiyatOnar();
check('WT-83 KABUL: tablosu olmayan ülkede fiyatı NULL yapmıyor, temiz çıkıyor',
  cikis === false && A.S.homeKwhPrice === TR,
  `ülke=${tablosuz} dönüş=${cikis} fiyat=${A.S.homeKwhPrice}`);

// ============================================================
// WT-87 — Ayarlar'daki fiyat alanları GERÇEKTEN kaydediyor mu
// ============================================================
// SESSİZ KUSUR (WT-87'de bulundu): `set-homekwh` alanının HİÇBİR dinleyicisi
// yoktu. Kullanıcı Ayarlar'da fiyatı yazıyor, alan bir sonraki
// renderSettings()'te S.homeKwhPrice'tan yeniden çiziliyor ve yazdığı değer
// sessizce kayboluyordu — WT-78'in "kullanıcının girdiği değer asla ezilmez"
// sözü pratikte hiç sınanamıyordu, çünkü değer zaten hiç GİRİLEMİYORDU.
{
  A.S.country = 'TR'; A.S.currency = 'TRY'; A.S.kwhRegion = '';
  await A.saveSetting('country', 'TR');
  await A.saveSetting('currency', 'TRY');
  await A.renderSettings();
  for (const [id, pKey, aKey, yazi, beklenen] of [
    ['set-homekwh', 'homeKwhPrice', 'homeKwhAuto', '3,5', 3.5],
    ['set-workkwh', 'workKwhPrice', 'workKwhAuto', '7,25', 7.25]]) {
    const el = $(w, id);
    el.value = yazi;
    el.dispatchEvent(new w.Event('change', { bubbles: true }));
    await sleep(200);
    const satir = await A.db.settings.get(pKey);
    check(`WT-87 KABUL: ${id} elle yazılan değeri veritabanına YAZIYOR`,
      A.S[pKey] === beklenen && satir && satir.value === beklenen,
      `S=${A.S[pKey]} db=${satir && satir.value}`);
    check(`WT-87: ${id} elle yazılan değer "elle" işaretleniyor (ülke değişince ezilmez)`,
      A.S[aKey] === false, `${aKey}=${A.S[aKey]}`);
  }
  // Köken işareti gerçekten koruyor mu — ülkeyi değiştir, iki değer de dursun
  A.S.country = 'DE';
  await A.kwhPriceAutofill();
  check('WT-87 KABUL: elle girilen iki fiyat da ülke değişince KORUNUYOR',
    A.S.homeKwhPrice === 3.5 && A.S.workKwhPrice === 7.25,
    `ev=${A.S.homeKwhPrice} iş=${A.S.workKwhPrice}`);
}

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
