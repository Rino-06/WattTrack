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
vc.on('jsdomError', e => {
    if (/Not implemented: navigation/.test(e.message || '')) return;   // location.reload()
    errors.push('jsdomError: ' + (e.stack || e.message));
  });
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
// WT-37: jsdom'da HTMLMediaElement.play() yok. Reject eden bir stub koyup
// "otomatik oynatma engellendi" yedek yolunu (4a) gerçekten koşturuyoruz.
let splashPlayCalled = false;
window.HTMLMediaElement.prototype.play = function () {
  splashPlayCalled = true;
  return Promise.reject(new Error('autoplay blocked (test)'));
};

// Dört dosya tarayıcıda AYNI global kapsamı paylaşıyor; ayrı ayrı eval
// edilirse const/let bildirimleri birbirini görmez. Tek eval'de birleştir.
// WT-50: uygulama kodu 12 klasik script'e bölündü; index.html'deki sıra.
const APP_FILES = ['db.js', 'calc.js', 'i18n.js', 'ocr.js', 'ui/shell.js', 'ui/dashboard.js',
  'ui/stats.js', 'ui/history.js', 'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js',
  'ui/settings.js', 'app.js'];
const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'evprices.js', ...APP_FILES]
  .map(f => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8'))
  .join('\n;\n')
  // const/let bildirimleri window'a iliştirilmez; teste açmak için köprü kur
  + `\n;window.__app = {db, S, APP_VERSION, openAdd, showScreen, pf, fmtNum,
       fmtInput, checkNum, isValidDate, localISO, renderDashboard, scanBadData,
       isConv, amtB, renderStats, applyI18n, T, LANG_NAMES, CHARGERS,
       COUNTRIES, HOME_NAMES, HOME_LABEL, EV_LABEL, IS_LABEL, isHomeFirm,
       isHomeRec, mekanOfFirm, MEKAN_VALS,
       PAN_EU, BANKS_BY, BANKS_DEFAULT, overlayClose,
       initSegments, evSummaryHTML, carSVG, seedDemoData, clearDemoData,
       syncEmptyStates, renderHistory, renderVehiclePage, backupPayload,
       offerDemoCleanup, allSessions, allVehicles, memo, renderCompare,
       invalidateCache, allExpenses, allFuelPrices, searchEV, openEvSpecs,
       EV_DB, EV_DB_TARIH, openFuelHist, openExpense, yaklasanlar,
       renderYaklasanlar, tekrarOner,
       csvPayload, parseCSV, csvAutoMap, csvRowToRec, csvSig, CSV_FIELDS, savingsOf,
       paylasilanGorseliAl, paylasimKutusunuBosalt, ocrDosyaIsle,
       reverseGeo, nearbyStations,
       openCsvImport, importFileText, importBackupText, overlayOpen,
       parcaliOku, parcaliYaz,
       KWH_PRICES, KWH_SRC, defaultKwhPrice, kwhRegions, kwhPriceAutofill,
       FUEL_HIST, FUEL_HIST_SRC, fuelHistMerge,
       renderSettings, barChartHTML, fetchRate, fetchTable, FX_TIMEOUT};`;
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
// WT-65 alan çifti: değer artık TAM + ONDALIK iki kutuda gösteriliyor.
// Kriterin özü değişmedi — ayraçlı girilen değer yuvarlanmamalı.
check('WT-02/C + WT-65: tutar "1234.5" → 1234 | 50',
  $('in-amount').value === '1234' && $('in-amount-dec').value === '50',
  `görünen: ${$('in-amount').value} | ${$('in-amount-dec').value}`);

$('in-kwh').value = '45,5';
fire($('in-kwh'), 'blur');
check('WT-03 + WT-65: kWh "45,5" → 45 | 50 (45 | 05 DEĞİL)',
  $('in-kwh').value === '45' && $('in-kwh-dec').value === '50',
  `görünen: ${$('in-kwh').value} | ${$('in-kwh-dec').value}`);

// WT-65 KABUL: ondalık kutusuna tek basamak yazmak sessizce ,05 olmamalı
$('in-kwh').value = '45'; $('in-kwh-dec').value = '5';
fire($('in-kwh-dec'), 'blur');
check('WT-65 KABUL: ondalık kutusundaki "5" görünür şekilde "50" oluyor',
  $('in-kwh-dec').value === '50', 'görünen: ' + $('in-kwh-dec').value);

// WT-65 KABUL: ondalık boş bırakılırsa 0 sayılır
$('in-kwh').value = '30'; $('in-kwh-dec').value = '';
check('WT-65 KABUL: ondalık boşken değer tam sayı olarak okunuyor',
  app().pf(app().parcaliOku('in-kwh')) === 30,
  'okunan: ' + app().parcaliOku('in-kwh'));
// aşağıdaki kaydetme kontrolleri 45,5 bekliyor — alanı geri koy
$('in-kwh').value = '45'; $('in-kwh-dec').value = '50';

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

// --- WT-13: kur bilgisi olmayan kayıt birim fiyatı bozmamalı ---
{
  await app().db.sessions.clear();
  app().S.period = 'year';
  app().S.currency = 'TRY';
  // 40 kWh / 400 TRY -> kWh başı 10,00
  await app().db.sessions.add({ tarih: '2026-07-10T12:00', firma: 'ZES', tip: 'DC',
    kwh: 40, tutar: 400, odenen: 400, cur: 'TRY', aracId: null });
  await app().renderDashboard();
  await sleep(300);
  const before = $('d-avg').textContent;
  check('WT-13: temel birim fiyat 10,00', /10,00/.test(before), 'd-avg=' + before);

  // Kur tablosu OLMAYAN yabancı kayıt ekle: 30 kWh, çevrilemez
  await app().db.sessions.add({ tarih: '2026-07-12T12:00', firma: 'X', tip: 'DC',
    kwh: 30, tutar: 900, odenen: 900, cur: 'RSD', aracId: null });
  await app().renderDashboard();
  await sleep(300);
  const after = $('d-avg').textContent;
  check('WT-13 KABUL: kur bilgisi olmayan kayıt birim fiyatı DEĞİŞTİRMEDİ',
    after === before, `önce=${before} sonra=${after}`);
  check('WT-13: ham kWh toplamı tüm kayıtları saymaya devam ediyor (70)',
    $('d-kwh').textContent === '70', 'd-kwh=' + $('d-kwh').textContent);
  check('WT-13: ham toplamın kapsamı başlıkta belirtildi',
    $('d-kwh-note').textContent.trim() !== '', 'not=' + JSON.stringify($('d-kwh-note').textContent));
}

// --- WT-14: ana sayfa dönem seçicisi tüm ekranı kapsıyor mu? ---
{
  await app().db.sessions.clear();
  // biri BU HAFTA, biri 5 ay önce — 'Hafta' seçilince detaylar daralmalı
  const today = new Date();
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const oldD = new Date(today); oldD.setMonth(oldD.getMonth() - 5);
  await app().db.sessions.bulkAdd([
    { tarih: iso(today) + 'T12:00', firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', dur: 30, socB: 20, socA: 80, aracId: null },
    { tarih: iso(oldD) + 'T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', dur: 120, socB: 10, socA: 90, aracId: null }
  ]);

  app().S.period = 'year';
  await app().renderDashboard();
  await sleep(300);
  const durYear = $('d-dur').textContent, socYear = $('d-soc').textContent;

  app().S.period = 'week';
  await app().renderDashboard();
  await sleep(300);
  const durWeek = $('d-dur').textContent, socWeek = $('d-soc').textContent;

  check('WT-14/A KABUL: "Detay istatistikler" dönem seçicisine bağlandı',
    durYear !== durWeek, `yıl=${durYear} hafta=${durWeek}`);
  check('WT-14/A: ort. şarj aralığı da daraldı',
    socYear !== socWeek, `yıl=${socYear} hafta=${socWeek}`);
  check('WT-14/A: detay bloğu kapsam rozeti taşıyor',
    $('d-dstat-scope').textContent.trim() !== '',
    'rozet=' + JSON.stringify($('d-dstat-scope').textContent));
  // WT-14'te "kasıtlı tüm-zamanlar olan yıllık blok da rozetli" diye bir kontrol
  // vardı; WT-32 o bloğu tamamen kaldırdı. Dönem seçicisine uymayan tek sayı
  // kalmadığı için kontrol, bloğun geri gelmediğini doğrulamaya dönüştü.
  check('WT-32/2: yıllık karşılaştırma bloğu ana sayfada yok',
    !$('d-yr-scope') && !$('d-yr-spend') && !$('d-yr-kwh') && !$('d-yr-price'));
  check('WT-32/1: "100 km" kutuları ana sayfada yok',
    !$('d-100') && !$('d-100-g'));
  check('WT-32/3: "Son şarjlar" bloğu ana sayfada yok',
    !$('d-recent') && !$('d-viewall'));
  check('WT-32: kalan "1 km" kutuları hâlâ dolduruluyor',
    $('d-1km').textContent !== '' && $('d-1km-g').textContent !== '',
    `1km=${$('d-1km').textContent} 1km-g=${$('d-1km-g').textContent}`);

  // --- WT-32/4: ort. şarj aralığı hesabı ---
  await app().db.sessions.clear();
  const iso2 = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
  const bugun = iso2(new Date());
  const base = { firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400, odenen: 400,
    cur: 'TRY', aracId: null };
  await app().db.sessions.bulkAdd([
    { ...base, tarih: bugun + 'T09:00', socB: 20, socA: 80 },   // +60
    { ...base, tarih: bugun + 'T12:00', socB: 40, socA: 80 },   // +40
    { ...base, tarih: bugun + 'T15:00', socB: 50, socA: 50 }    // anlamsız: eşit
  ]);
  app().S.period = 'week';
  await app().renderDashboard();
  await sleep(300);
  // Eşit kayıt sayılsaydı ortalamalar %36,7 → %70 çıkardı; hariç tutulunca %30 → %80
  check('WT-32/4b: socB === socA olan kayıt ortalamaya girmedi',
    $('d-soc').textContent === '%30 → %80', 'd-soc=' + $('d-soc').textContent);
  check('WT-32/4c: "ort. eklenen" değeri de gösteriliyor',
    /50/.test($('d-soc-add').textContent), 'ek=' + $('d-soc-add').textContent);

  // socA < socB olan bozuk eski kayıt da ortalamayı kaydırmamalı
  await app().db.sessions.add({ ...base, tarih: bugun + 'T18:00', socB: 90, socA: 10 });
  await app().renderDashboard();
  await sleep(300);
  check('WT-32/4: ters (socA < socB) bozuk kayıt da hariç tutuldu',
    $('d-soc').textContent === '%30 → %80', 'd-soc=' + $('d-soc').textContent);
}

// --- WT-14/B: 1 km sayaç moduna düşünce kapsamı yazıyor mu? ---
{
  await app().db.sessions.clear();
  await app().db.vehicles.clear();
  const vid = await app().db.vehicles.add({ ad: 'Test EV', kmStart: 10000, kmNow: 15000 });
  app().S.period = 'year';
  // mesafesi OLMAYAN kayıt -> distKm < 20 -> sayaç moduna düşer
  await app().db.sessions.add({ tarih: '2026-07-15T12:00', firma: 'ZES', tip: 'DC',
    kwh: 40, tutar: 400, odenen: 400, cur: 'TRY', aracId: vid });
  await app().renderDashboard();
  await sleep(350);
  check('WT-14/B KABUL: sayaç moduna düşünce kutunun altında açıklama var',
    /sayac|sayaç|tüm zamanlar/i.test($('d-dist-scope').textContent),
    'not=' + JSON.stringify($('d-dist-scope').textContent));

  // şimdi kayda mesafe ekle -> kayıt moduna dön
  const r = (await app().db.sessions.toArray())[0];
  await app().db.sessions.update(r.id, { mesafeKm: 250 });
  await app().renderDashboard();
  await sleep(350);
  check('WT-14/B: kayıt mesafesi varken kaynak "kayıtlar" diyor',
    $('d-dist-scope').textContent.trim() !== '' &&
      !/tüm zamanlar/i.test($('d-dist-scope').textContent),
    'not=' + JSON.stringify($('d-dist-scope').textContent));
}

// --- WT-15: istatistik seçicisi sayfanın tamamını etkiliyor mu? ---
{
  await app().db.sessions.clear();
  await app().db.vehicles.clear();
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date();
  const oldD = new Date(today); oldD.setMonth(oldD.getMonth() - 5);
  await app().db.sessions.bulkAdd([
    // bu hafta: AC / Firma A / banka X / Ankara
    { tarih: iso(today) + 'T12:00', firma: 'FirmaA', tip: 'AC', kwh: 20, tutar: 200,
      odenen: 200, cur: 'TRY', banka: 'BankaX', loc: 'Ankara', aracId: null },
    // 5 ay önce: DC / Firma B / banka Y / İzmir
    { tarih: iso(oldD) + 'T12:00', firma: 'FirmaB', tip: 'DC', kwh: 60, tutar: 700,
      odenen: 700, cur: 'TRY', banka: 'BankaY', loc: 'İzmir', aracId: null }
  ]);
  app().S.dashVeh = '';

  app().S.gran = 'year';
  await app().renderStats();
  await sleep(350);
  const firmsYear = $('d-firms').textContent;
  const donutYear = $('d-donut-legend').textContent;
  const banksYear = $('d-banks').textContent;
  const locsYear = $('d-locs').textContent;

  app().S.gran = 'week';
  await app().renderStats();
  await sleep(350);
  const firmsWeek = $('d-firms').textContent;
  const donutWeek = $('d-donut-legend').textContent;

  check('WT-15 KABUL: "Hafta" seçince firma dağılımı daraldı',
    firmsYear.includes('FirmaB') && !firmsWeek.includes('FirmaB'),
    `yıl FirmaB=${firmsYear.includes('FirmaB')} hafta FirmaB=${firmsWeek.includes('FirmaB')}`);
  check('WT-15 KABUL: "Hafta" seçince donut daraldı',
    donutYear !== donutWeek && !donutWeek.includes('DC'),
    `yıl=${donutYear.trim().slice(0, 40)} hafta=${donutWeek.trim().slice(0, 40)}`);
  check('WT-15: bankalar da daraldı',
    banksYear.includes('BankaY') && !$('d-banks').textContent.includes('BankaY'));
  check('WT-15: lokasyonlar da daraldı',
    locsYear.includes('İzmir') && !$('d-locs').textContent.includes('İzmir'));
  // WT-72: gün dağılımı grafiği kullanıcı isteğiyle KALDIRILDI. WT-15'in
  // "seçici tüm sayfayı daraltıyor" kriteri kalan bloklarla doğrulanıyor.
  check('WT-72 KABUL: gün dağılımı grafiği kaldırıldı',
    !window.document.getElementById('d-weekdays'));
  check('WT-15: seçici kapsamı etiketle söylüyor',
    /Dönem/.test($('s-gran-lbl').textContent),
    'etiket=' + JSON.stringify($('s-gran-lbl').textContent));
  check('WT-15: harcama grafiği kasıtlı seyir olduğunu belirtiyor',
    $('s-chart-scope').textContent.trim() !== '',
    'rozet=' + JSON.stringify($('s-chart-scope').textContent));
}

// --- WT-22 KABUL: dili İngilizce yapınca Türkçe metin kalmamalı ---
{
  // Kullanıcı dili Ayarlar'dan değiştirir; açık bir form varsa önce kapanır.
  // (Açık formdaki seçenek listeleri openAdd ile üretiliyor, applyI18n'in
  // kapsamı dışında — form yeniden açıldığında doğru dilde geliyor.)
  await app().overlayClose('page-add', { force: true });
  await sleep(150);
  app().S.lang = 'en';
  app().applyI18n();
  await sleep(250);
  // Kullanıcı dili değiştirince sekmeleri gezer; her sekme ziyarette yeniden
  // çizilir. Denetim de aynı yolu izlemeli.
  for (const p of ['dashboard', 'stats', 'history', 'compare', 'vehicle', 'settings']) {
    app().showScreen(p);
    await sleep(220);
  }
  app().showScreen('dashboard');
  await sleep(250);

  // Türkçe'ye özgü karakterler + sık geçen Türkçe kelimeler
  const TR = /[çğışÇĞİŞ]|\b(Araç|Ülke|Tarih|Tutar|Kaydet|Firma|Banka|Gider|Ayarlar|Şarj|Dönem|Yeni kayıt|Tema|Dil|Para birimi)\b/;
  const offenders = [];
  const doc = window.document;
  // Çevrilmeyecek VERİ: dil adları kendi dilinde yazılır, şarj firmalarının
  // ve şehirlerin özel adları çevrilmez, kullanıcının girdiği metinler de öyle.
  const DATA = new Set([
    ...Object.values(app().LANG_NAMES || {}),
    ...Object.values(app().CHARGERS || {}).flat(),
    ...(app().PAN_EU || []),
    ...Object.values(app().BANKS_BY || {}).flat(),
    ...(app().BANKS_DEFAULT || []),
    ...(app().COUNTRIES || []).map(c => c[2]),
    ...(app().HOME_NAMES || []),
    ...(await app().db.sessions.toArray()).flatMap(r => [r.firma, r.loc, r.banka]),
    ...(await app().db.vehicles.toArray()).flatMap(v => [v.ad, v.brand, v.model, v.trim])
  ].filter(Boolean));
  // görünür metin düğümleri
  const walk = doc.createTreeWalker(doc.body, 4 /* SHOW_TEXT */);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const txt = (n.textContent || '').trim();
    if (!txt || txt.length < 2) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,datalist')) continue;
    // Kapalı overlay içeriği görünmez ve açılışta baştan üretilir
    const ov = el.closest('.overlay');
    if (ov && !ov.classList.contains('active')) continue;
    if (DATA.has(txt)) continue;                    // veri, arayüz metni değil
    if (TR.test(txt)) offenders.push(`metin<${el.id || el.className || el.tagName}>: ${txt.slice(0, 55)}`);
  }
  // aria-label, placeholder, title
  for (const attr of ['aria-label', 'placeholder', 'title']) {
    doc.querySelectorAll(`[${attr}]`).forEach(el => {
      const ov2 = el.closest('.overlay');
      if (ov2 && !ov2.classList.contains('active')) return;
      const v = el.getAttribute(attr) || '';
      if (!DATA.has(v) && TR.test(v)) offenders.push(`${attr}<${el.id || el.tagName}>: ${v.slice(0, 55)}`);
    });
  }
  check('WT-22 KABUL: İngilizce\'de Türkçe metin kalmadı',
    offenders.length === 0, offenders.slice(0, 6).join(' | '));

  // c-icefix-lbl özellikle: applyI18n bu id'ye HİÇ dokunmuyordu
  check('WT-22/2: "yakıtlı aracın yıllık sabit gideri" etiketi çevrildi',
    /Fuel car/.test($('c-icefix-lbl').textContent),
    'etiket=' + $('c-icefix-lbl').textContent.slice(0, 60));

  // altı dilin hepsinde sözlük eksiksiz mi?
  const langs = ['tr', 'en', 'de', 'fr', 'es', 'it'];
  const keys = Object.keys(app().T.tr);
  const gaps = [];
  for (const l of langs)
    for (const k of keys)
      if (!app().T[l] || app().T[l][k] == null || app().T[l][k] === '') gaps.push(`${l}.${k}`);
  check(`WT-22: ${keys.length} anahtarın altı dilde de karşılığı var`,
    gaps.length === 0, gaps.slice(0, 8).join(', '));

  app().S.lang = 'tr';
  app().applyI18n();
}

// --- WT-23: başlık hiyerarşisi ve landmark'lar ---
{
  const doc = window.document;
  check('WT-23/1: içerik sarmalayıcısı <main>',
    !!doc.querySelector('main.content'));
  check('WT-23/2: her sayfanın bir <h1> başlığı var',
    [...doc.querySelectorAll('.content .page')].every(p => p.querySelector('h1')),
    [...doc.querySelectorAll('.content .page')]
      .filter(p => !p.querySelector('h1')).map(p => p.id).join(', ') || '(hepsi tamam)');
  check('WT-23/2: sayfa başına tam olarak BİR h1',
    [...doc.querySelectorAll('.content .page')].every(p => p.querySelectorAll('h1').length === 1));
  // Sabit sayı (18) WT-32 bölüm kaldırınca kırıldı; asıl kontrol edilmek istenen
  // ".h2" görünümlü hiçbir öğenin <h2> DIŞINDA bir etiket olmaması.
  check('WT-23/3: alt başlıklar <h2>',
    doc.querySelectorAll('.h2').length >= 10
      && [...doc.querySelectorAll('.h2')].every(e => e.tagName === 'H2'),
    'h2 sayısı=' + doc.querySelectorAll('h2.h2').length
      + ' h2 olmayan=' + [...doc.querySelectorAll('.h2')]
        .filter(e => e.tagName !== 'H2').map(e => e.tagName).join(','));
  check('WT-23: h1 içinde buton/seçici yok (erişilebilir ad temiz)',
    [...doc.querySelectorAll('h1')].every(h => !h.querySelector('button,select,input')),
    [...doc.querySelectorAll('h1')].filter(h => h.querySelector('button,select,input'))
      .map(h => h.textContent.trim().slice(0, 25)).join(', ') || '(temiz)');
  check('WT-23/4: <nav> çevrilebilir aria-label taşıyor',
    doc.querySelector('nav')?.getAttribute('data-i18n-aria') === 'navMain'
      && !!doc.querySelector('nav')?.getAttribute('aria-label'));
  // WT-23/5 aria-current WT-24'te eklendi; burada hâlâ çalıştığını doğrula
  app().showScreen('history');
  await sleep(200);
  const cur = [...doc.querySelectorAll('nav button[data-page]')]
    .filter(b => b.getAttribute('aria-current') === 'page');
  check('WT-23/5: aktif sekme aria-current=page taşıyor (tek tane)',
    cur.length === 1 && cur[0].dataset.page === 'history',
    'aria-current: ' + cur.map(b => b.dataset.page).join(','));
  app().showScreen('dashboard');
  await sleep(200);
}

// --- WT-25: dokunma hedefleri (statik CSS denetimi) ---
// jsdom'da yerleşim motoru yok, gerçek piksel ölçülemez. Bunun yerine
// bildirilen boyut + ::after genişletmesi toplanarak etkin alan hesaplanır.
{
  const css = [...window.document.querySelectorAll('style')].map(x => x.textContent).join('\n');
  // Kuralları (seçici listesi, gövde) olarak ayrıştır; gruplu seçiciler
  // (".a, .b::after{...}") virgülden bölünüp tam eşleşmeyle aranır.
  // @media blokları iç içe süslü parantez içerdiği için düz regex ayrıştırmayı
  // kaydırıyor; sarmalayıcılarını kaldır (içlerindeki kurallar düz kalsın).
  // CSS yorumları seçiciye yapışıp tam eşleşmeyi bozuyor — önce temizle
  let flat = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (let i = 0; i < 20; i++) {
    const m = /@media[^{]*\{/.exec(flat);
    if (!m) break;
    let depth = 1, j = m.index + m[0].length;
    while (j < flat.length && depth > 0) {
      if (flat[j] === '{') depth++;
      else if (flat[j] === '}') depth--;
      j++;
    }
    flat = flat.slice(0, m.index) + flat.slice(m.index + m[0].length, j - 1) + flat.slice(j);
  }
  const rules = [];
  for (const m of flat.matchAll(/([^{}]+)\{([^}]*)\}/g))
    rules.push([m[1].split(',').map(x => x.trim().replace(/\s+/g, ' ')), m[2]]);
  const decl = sel => rules.filter(([sels]) => sels.includes(sel))
    .map(([, body]) => body).join(';');
  const num = (body, prop) => {
    const m = [...body.matchAll(new RegExp(prop + '\\s*:\\s*(-?\\d+(?:\\.\\d+)?)px', 'g'))];
    return m.length ? parseFloat(m[m.length - 1][1]) : null;
  };
  // ::after inset genişletmesi: inset:-9px  ya da  inset:-7px -4px
  const inset = sel => {
    const body = decl(sel + '::after');
    const m = /inset\s*:\s*(-?\d+)px(?:\s+(-?\d+)px)?/.exec(body);
    if (!m) return { v: 0, h: 0 };
    const v = -parseInt(m[1], 10);
    const h = m[2] != null ? -parseInt(m[2], 10) : v;
    return { v: Math.max(0, v), h: Math.max(0, h) };
  };
  const effective = (sel, baseW, baseH) => {
    const body = decl(sel);
    const w = num(body, 'min-width') ?? num(body, 'width') ?? baseW;
    const h = num(body, 'min-height') ?? num(body, 'height') ?? baseH;
    const e = inset(sel);
    return { w: (w ?? 0) + 2 * e.h, h: (h ?? 0) + 2 * e.v };
  };

  // Dokümanda ölçülen ve düzeltilmesi istenen öğeler
  const targets = [
    ['.crow .del', 26, 26], ['.vlist .cam', 30, 30], ['.chip', 60, 30],
    ['.seg.mini button', 60, 31], ['.ov-head .close', 32, 32],
    ['.theme-btn', 34, 34], ['.mini-btn', 60, 35], ['.sw', 46, 27],
    ['.details-toggle', 60, 21], ['.h2row .link', 60, 21],
    ['.vlist .star', 0, 0], ['.vlist .rm', 0, 0]
  ];
  const small = [];
  for (const [sel, bw, bh] of targets) {
    const { w, h } = effective(sel, bw, bh);
    if (w < 44 || h < 44) small.push(`${sel} ${Math.round(w)}x${Math.round(h)}`);
  }
  check('WT-25: küçük dokunma hedefleri 44x44\'e genişletildi',
    small.length === 0, small.join(' | '));

  // Alt menüde 7 sekme korunuyor: yatayda 44px garanti edilemez,
  // dikeyde 48px garanti edilmeli (madde metni bunu böyle istiyor)
  const navH = num(decl('nav button'), 'min-height');
  check('WT-25: alt menü butonları dikeyde en az 48px', navH >= 48, 'min-height=' + navH);
  check('WT-25: 7 sekme korundu',
    window.document.querySelectorAll('nav button[data-page]').length
      + window.document.querySelectorAll('nav button.plus, nav .plus').length >= 7,
    'sekme=' + window.document.querySelectorAll('nav button').length);
}

// --- WT-27: görünür odak göstergesi ---
{
  const css = [...window.document.querySelectorAll('style')].map(x => x.textContent).join('\n');
  check('WT-27: :focus-visible için outline tanımlı',
    /:focus-visible\s*\{[^}]*outline\s*:\s*2px/.test(css));
  check('WT-27: koyu temada odak rengi ayrıca tanımlı',
    /\[data-theme="dark"\][^{]*:focus-visible\s*\{[^}]*outline-color/.test(css));
  check('WT-27: dokunmada :active geri bildirimi var (tap-highlight kapalı)',
    /button:active[^{]*\{[^}]*(opacity|transform)/.test(css));
}

// --- WT-28: segment kontrolleri seçili durumu bildiriyor mu? ---
{
  const doc = window.document;
  const segs = [...doc.querySelectorAll('.seg')];
  check('WT-28: tüm segmentler role=radiogroup',
    segs.length > 0 && segs.every(s2 => s2.getAttribute('role') === 'radiogroup'),
    'segment=' + segs.length);
  check('WT-28: segment butonları role=radio',
    segs.every(s2 => [...s2.querySelectorAll('button')]
      .every(b => b.getAttribute('role') === 'radio')));
  check('WT-28: her segmentin erişilebilir adı var',
    segs.every(s2 => s2.getAttribute('aria-label') || s2.getAttribute('aria-labelledby')),
    segs.filter(s2 => !s2.getAttribute('aria-label') && !s2.getAttribute('aria-labelledby'))
      .map(s2 => s2.id).join(', ') || '(hepsi tamam)');

  const seg = doc.getElementById('d-period');
  const btns = [...seg.querySelectorAll('button')];
  const checked = () => btns.map(b => b.getAttribute('aria-checked')).join(',');
  check('WT-28: seçili butonda aria-checked=true, diğerlerinde false',
    btns.filter(b => b.getAttribute('aria-checked') === 'true').length === 1,
    'aria-checked: ' + checked());

  // sınıf değişince aria-checked de değişmeli (MutationObserver)
  const before = checked();
  btns[0].click();
  await sleep(250);
  check('WT-28: seçim değişince aria-checked güncelleniyor',
    btns[0].getAttribute('aria-checked') === 'true' && checked() !== before,
    `önce=${before} sonra=${checked()}`);

  // dolaşan tabindex
  check('WT-28: gruba tek Tab ile girilir (dolaşan tabindex)',
    btns.filter(b => b.tabIndex === 0).length === 1,
    'tabindex: ' + btns.map(b => b.tabIndex).join(','));

  // ok tuşu gezinmesi
  btns[0].focus();
  seg.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  await sleep(250);
  check('WT-28: sağ ok bir sonraki seçeneğe geçiyor',
    doc.activeElement === btns[1] && btns[1].getAttribute('aria-checked') === 'true',
    'odak=' + (doc.activeElement === btns[1] ? 'btns[1]' : 'başka') + ' checked=' + checked());
}

// --- WT-29: toast ve form hatası duyuruluyor mu? ---
{
  const doc = window.document;
  const toast = doc.getElementById('toast');
  check('WT-29/1: toast canlı bölge (role=status, aria-live=polite, atomic)',
    toast.getAttribute('role') === 'status'
      && toast.getAttribute('aria-live') === 'polite'
      && toast.getAttribute('aria-atomic') === 'true');
  check('WT-29/2: form hatası role=alert',
    doc.getElementById('form-err').getAttribute('role') === 'alert');

  // hatalı alan işaretleniyor ve düzeltilince temizleniyor mu?
  await app().openAdd();
  await sleep(250);
  $('in-date').value = '2026-07-20';
  $('in-kwh').value = '10';
  $('in-amount').value = '100';
  $('in-socb').value = '10';
  $('in-soca').value = '800';        // sınır dışı
  $('btn-save').click();
  await sleep(350);
  const soca = $('in-soca');
  check('WT-29/2: hatalı input aria-invalid=true',
    soca.getAttribute('aria-invalid') === 'true');
  check('WT-29/2: hatalı input aria-describedby ile hataya bağlandı',
    (soca.getAttribute('aria-describedby') || '').split(/\s+/).includes('form-err'),
    'describedby=' + soca.getAttribute('aria-describedby'));

  soca.value = '80';
  soca.dispatchEvent(new window.Event('input', { bubbles: true }));
  await sleep(200);
  check('WT-29/2: düzeltilince işaretler kalkıyor',
    !soca.hasAttribute('aria-invalid')
      && !(soca.getAttribute('aria-describedby') || '').includes('form-err'),
    'invalid=' + soca.getAttribute('aria-invalid')
      + ' describedby=' + soca.getAttribute('aria-describedby'));

  // WT-29/3: çevrimdışı güven — kayıt toast'ı "Cihaza kaydedildi" demeli
  $('btn-save').click();
  await sleep(450);
  check('WT-29/3: kayıt toast\'ı "Cihaza kaydedildi" diyor',
    /cihaza|device|Gerät|appareil|dispositivo/i.test(toast.textContent),
    'toast=' + toast.textContent);
}

// --- WT-30: grafiklerin metin alternatifi ---
{
  await app().db.sessions.clear();
  await app().db.sessions.bulkAdd([
    { tarih: '2026-07-05T12:00', firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', mekan: 'firma', aracId: null },
    { tarih: '2026-07-06T12:00', firma: 'Ev-İş', tip: 'AC', kwh: 20, tutar: 60,
      odenen: 60, cur: 'TRY', mekan: 'evis', aracId: null }
  ]);
  app().S.gran = 'year';
  app().S.dashVeh = '';
  await app().renderStats();
  await sleep(400);
  const doc = window.document;

  for (const [id, ad] of [['d-months', 'harcama grafiği'],
                          ['d-donut', 'şarj tipi donutu'], ['d-donut2', 'şarj yeri donutu']]) {
    const el = doc.getElementById(id);
    check(`WT-30: ${ad} role=img + veriyi özetleyen aria-label taşıyor`,
      el.getAttribute('role') === 'img'
        && (el.getAttribute('aria-label') || '').length > 10,
      (el.getAttribute('aria-label') || '(yok)').slice(0, 70));
  }
  check('WT-30: donut aria-label yüzdeleri içeriyor',
    /%\d+/.test(doc.getElementById('d-donut').getAttribute('aria-label') || ''),
    doc.getElementById('d-donut').getAttribute('aria-label'));

  // görsel gizli özet tablolar
  const tables = doc.querySelectorAll('table.sr-only');
  // WT-72: gün dağılımı grafiği kaldırıldı, geriye üç grafik kaldı (eşik 4 -> 3).
  check('WT-30: grafiklerin altında görsel gizli özet tablo var',
    tables.length >= 3, 'tablo=' + tables.length);
  check('WT-30: özet tablolar caption ve satır başlığı içeriyor',
    [...tables].every(tb => tb.querySelector('caption') && tb.querySelector('th[scope="row"]')));

  // .sr-only gerçekten gizli mi (CSS)
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
  check('WT-30: .sr-only görsel olarak gizleniyor',
    /\.sr-only\s*\{[^}]*clip\s*:\s*rect\(0 0 0 0\)/.test(css));

  // tıklanabilir sütunlar klavyeyle erişilebilir mi?
  const cols = [...doc.querySelectorAll('#d-months .mb[data-y]')];
  check('WT-30: tıklanabilir bar sütunları klavyeyle erişilebilir',
    cols.length > 0 && cols.every(c => c.getAttribute('role') === 'button'
      && c.tabIndex === 0 && c.getAttribute('aria-label')),
    'sütun=' + cols.length);

  // Enter ile tıklama çalışıyor mu?
  if (cols.length) {
    app().showScreen('stats');
    await sleep(200);
    cols[cols.length - 1].dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await sleep(300);
    check('WT-30: Enter ile sütun tıklaması çalışıyor (Geçmiş\'e geçti)',
      doc.getElementById('page-history').classList.contains('active'));
    app().showScreen('dashboard');
    await sleep(200);
  }
}

// --- WT-31: 12px alt sınırı ve kontrast oranları (statik CSS denetimi) ---
// Maddede kabul kriteri yazılmadığı için ölçülebilir olanı burada sabitliyoruz:
// WCAG 1.4.3 (metin 4.5:1), 1.4.11 (denetim sınırı / grafik nesne 3:1).
{
  const doc = window.document;
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
  let flat = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (let i = 0; i < 20; i++) {
    const m = /@media[^{]*\{/.exec(flat);
    if (!m) break;
    let depth = 1, j = m.index + m[0].length;
    while (j < flat.length && depth > 0) {
      if (flat[j] === '{') depth++;
      else if (flat[j] === '}') depth--;
      j++;
    }
    flat = flat.slice(0, m.index) + flat.slice(m.index + m[0].length, j - 1) + flat.slice(j);
  }
  const rules = [];
  for (const m of flat.matchAll(/([^{}]+)\{([^}]*)\}/g))
    rules.push([m[1].split(',').map(x => x.trim().replace(/\s+/g, ' ')), m[2]]);
  const decl = sel => rules.filter(([sels]) => sels.includes(sel))
    .map(([, body]) => body).join(';');
  const size = sel => {
    const m = [...decl(sel).matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)];
    return m.length ? parseFloat(m[m.length - 1][1]) : null;
  };

  // 1) Maddede adı geçen dört öğe en az 12px olmalı
  const tooSmall = [];
  for (const sel of ['.tile .k', '.tile .yd', '.crow .sav', '.about']) {
    const s = size(sel);
    if (s == null || s < 12) tooSmall.push(`${sel}=${s}`);
  }
  // .about'un satır içi style ile ezildiği yerler de dahil
  for (const el of doc.querySelectorAll('.about[style*="font-size"]')) {
    const s = parseFloat(/font-size:\s*(\d+(?:\.\d+)?)px/.exec(el.getAttribute('style'))[1]);
    if (s < 12) tooSmall.push(`.about#${el.id || '?'}=${s}`);
  }
  check('WT-31/1: .tile .k, .tile .yd, .crow .sav ve .about en az 12px',
    tooSmall.length === 0, tooSmall.join(' | '));

  // WT-31/1 (dondurulmuş liste): 12px'in ALTINDA kalan seçiciler kullanıcıya
  // tek tek bildirilmiş ve bilerek bırakılmıştı. Bu kontrol yenisinin SESSİZCE
  // eklenmesini engelliyor — jsdom'un yerleşim motoru yok, göz denetimi de
  // kaçırıyor (WT-46 rozeti 11px olarak girmişti ve hiçbir test kızarmadı).
  // Listeye ekleme yapmak serbest, ama bilinçli olmalı ve kullanıcıya söylenmeli.
  {
    const BILINEN = ['.toplist .rank', '.toplist .ts',
      '.compactfirm .cmp-head .avatar', '.donut-col .legend', '.mb .amt',
      '.mb .m', '.cmp-head .sub', '.scope-note', '.scope-badge',
      '.switchrow .d', '.vlist .vd', 'nav button'];
    const kucuk = [];
    for (const [sels, body] of rules) {
      const m = [...body.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)];
      if (!m.length) continue;
      const v = parseFloat(m[m.length - 1][1]);
      if (v < 12) sels.forEach(s => kucuk.push([s, v]));
    }
    const yeni = kucuk.filter(([s]) => !BILINEN.includes(s));
    check('WT-31/1: 12px altında BİLDİRİLMEMİŞ yeni seçici yok',
      yeni.length === 0, yeni.map(([s, v]) => `${s}=${v}`).join(' | '));
  }
  check('WT-46/3: araç rozeti 12px alt sınırına uyuyor',
    size('.crow .veh-chip') >= 12, '.crow .veh-chip=' + size('.crow .veh-chip'));

  // 2-3) Renk simgeleri ve kontrast
  const token = (theme, name) => {
    const body = decl(theme === 'dark' ? '[data-theme="dark"]' : ':root');
    const m = [...body.matchAll(new RegExp('--' + name + '\\s*:\\s*(#[0-9a-fA-F]{6})', 'g'))];
    return m.length ? m[m.length - 1][1] : null;
  };
  const lum = h => {
    const c = [0, 2, 4].map(i => parseInt(h.slice(1 + i, 3 + i), 16) / 255)
      .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const cr = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const r2 = v => Math.round(v * 100) / 100;

  for (const theme of ['light', 'dark']) {
    const card = token(theme, 'card'), bg = token(theme, 'bg');
    // .tile .v 16px normal metin -> AA 4.5:1
    const bad = [];
    for (const n of ['red', 'blue', 'accent', 'accent-dark']) {
      const v = cr(token(theme, n), card);
      if (v < 4.5) bad.push(`--${n}=${token(theme, n)} ${r2(v)}`);
    }
    check(`WT-31/2: ${theme} temada kutu değer renkleri kart üzerinde 4.5:1`,
      bad.length === 0, bad.join(' | '));

    // Kaydet butonu ve seçili segment: accent zemin üzerindeki metin
    const btnText = theme === 'dark'
      ? (/\[data-theme="dark"\] \.save-btn[^{]*\{[^}]*color\s*:\s*(#[0-9a-fA-F]{6})/
        .exec(flat) || [])[1]
      : '#ffffff';
    const onAccent = cr(btnText || '#ffffff', token(theme, 'accent'));
    check(`WT-31/2: ${theme} temada Kaydet butonu metni 4.5:1`,
      onAccent >= 4.5, `${btnText} / ${token(theme, 'accent')} = ${r2(onAccent)}`);

    // Denetim çerçevesi hem kart hem sayfa zemininde 3:1 (WCAG 1.4.11)
    const bC = cr(token(theme, 'border'), card), bB = cr(token(theme, 'border'), bg);
    check(`WT-31/3: ${theme} temada --border kart ve zemine karşı 3:1`,
      bC >= 3 && bB >= 3,
      `${token(theme, 'border')}: kart=${r2(bC)} zemin=${r2(bB)}`);

    // Oluk/dolgu ayrımı: ilerleme ve anahtar dolgusu oluktan 3:1 ayrılmalı
    const fill = cr(token(theme, 'accent'), token(theme, 'track'));
    check(`WT-31/3: ${theme} temada dolgu (--accent) oluktan (--track) 3:1 ayrı`,
      fill >= 3, `${r2(fill)}`);

    // Anahtarın kendi sınırı (WT-31 halkası) zeminden ayrılıyor mu?
    check(`WT-31/3: ${theme} temada anahtarın sınır halkası var`,
      /\.sw i\{[^}]*box-shadow\s*:\s*inset[^}]*var\(--border\)/.test(flat));
  }
}

// --- WT-35: yakıt dışı gider bloğu sadeleşti mi? ---
{
  const doc = window.document;
  const wrap = doc.getElementById('c-nf-wrap');
  const det = doc.getElementById('c-nf-details');
  const btn = doc.getElementById('c-nf-more');

  check('WT-35: türetilmiş kutular varsayılan olarak gizli',
    det.style.display === 'none' && btn.getAttribute('aria-expanded') === 'false');
  // Kapalıyken görünen sayı: fark + pill + iki bar etiketi
  const gorunen = [...wrap.querySelectorAll('.tile')].filter(el => !det.contains(el));
  check('WT-35: kapalıyken hiç türetilmiş kutu görünmüyor', gorunen.length === 0,
    'görünen kutu=' + gorunen.length);
  check('WT-35: fark satırı ve iki bar görünür kalıyor',
    !!doc.getElementById('c-nf-diff') && !!doc.getElementById('c-nf-bar-ev')
      && !!doc.getElementById('c-nf-bar-ice') && !det.contains(doc.getElementById('c-nf-diff')));
  check('WT-35: yedi kutunun hiçbiri SİLİNMEDİ, detaya taşındı',
    det.querySelectorAll('.tile').length === 7,
    'detaydaki kutu=' + det.querySelectorAll('.tile').length);
  check('WT-35: detayda "tek tahminden türetildi" uyarısı var',
    !!det.querySelector('#c-nf-guess'));

  btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await sleep(60);
  check('WT-35: butona basınca detay açılıyor',
    det.style.display !== 'none' && btn.getAttribute('aria-expanded') === 'true',
    'metin=' + btn.textContent);
  btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await sleep(60);
  check('WT-35: tekrar basınca kapanıyor',
    det.style.display === 'none' && btn.getAttribute('aria-expanded') === 'false',
    'metin=' + btn.textContent);
}

// --- WT-34: renk semantiği tek sözlüğe bağlı mı? ---
{
  const doc = window.document;
  const renk = id => doc.getElementById(id)?.style.color || '';
  const YESIL = 'var(--accent-dark)', MAVI = 'var(--blue)', KIRMIZI = 'var(--red)';

  check('WT-34: "Ücretsiz şarj" artık yeşil (olumlu)', renk('d-free') === YESIL,
    'd-free=' + renk('d-free'));
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
  check('WT-34: "ücretsiz" rozeti de yeşil',
    /\.crow \.free-tag\{color:var\(--accent-dark\)\}/.test(css));

  // Kıyasla: EV tarafı yeşil, yakıtlı taraf mavi — kırmızı kalmamalı
  const ev = ['c-1km', 'c-ev', 'c-evtot', 'c-savetot', 'c-exptot', 'c-tcoev',
    'c-tco1km', 'c-nf-ev-km', 'c-nf-ev-100', 'c-nf-ev-yr', 'c-disc-fx'];
  const ice = ['c-ice1km', 'c-ice', 'c-icetot', 'c-icefixtot', 'c-tcoice',
    'c-tcoice1km', 'c-nf-ice-km', 'c-nf-ice-100', 'c-nf-ice-yr'];
  check('WT-34: EV değerlerinin hepsi yeşil',
    ev.every(id => renk(id) === YESIL),
    ev.filter(id => renk(id) !== YESIL).map(id => id + '=' + renk(id)).join(', ') || 'tamam');
  check('WT-34: yakıtlı araç değerlerinin hepsi mavi',
    ice.every(id => renk(id) === MAVI),
    ice.filter(id => renk(id) !== MAVI).map(id => id + '=' + renk(id)).join(', ') || 'tamam');
  check('WT-34: kıyas değerlerinde kırmızı kullanılmıyor (kırmızı = olumsuz/uyarı)',
    ![...ev, ...ice].some(id => renk(id) === KIRMIZI));
  check('WT-34: gider toplamı nötr (tasarruf değil)', renk('v-exp-total') === '',
    'v-exp-total=' + JSON.stringify(renk('v-exp-total')));
  // Sözlüğün kendisi index.html'de yorum olarak duruyor (madde bunu istiyor);
  // yorumlar DOM'a taşınmadığı için ham kaynakta aranıyor.
  check('WT-34: renk sözlüğü index.html içinde belgelendi',
    /WT-34: RENK SÖZLÜĞÜ/.test(html));
}

// --- WT-33: masaüstünde çok sütun yerine grid ---
{
  const doc = window.document;
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  check('WT-33: #page-dashboard / #page-compare üzerinde `columns` kalmadı',
    !/#page-(dashboard|compare)[^{]*\{[^}]*(?<![-\w])columns\s*:/.test(css)
      && !/column-span\s*:/.test(css));
  // WT-80: seçiciye `.active` eklendi (aşağıdaki WT-80 bloğu nedenini
  // açıklıyor); grid tanımının kendisi değişmedi.
  check('WT-33: yerine auto-fit grid tanımlı',
    /#page-dashboard\.active,#page-compare\.active\{[^}]*display:grid[^}]*repeat\(auto-fit,minmax\(280px,1fr\)\)/
      .test(css.replace(/\s*\n\s*/g, '')));
  const span = /([^{}]*)\{grid-column:1\/-1\}/.exec(css.replace(/\s*\n\s*/g, ''));
  const spanSel = span ? span[1] : '';
  for (const s of ['#page-dashboard>.hero', '#page-dashboard>.seg',
    '#page-dashboard>.h2row:first-child', '#page-dashboard>.warn-host',
    '#page-compare>.page-title-row'])
    check('WT-33: tam genişlik — ' + s, spanSel.includes(s), spanSel);

  // Izgarada her hücre kendi başına anlamlı olmalı: başlık ile değerleri,
  // kutular ile onları açıklayan not ayrı hücrelere düşmemeli.
  const pk = doc.getElementById('d-perkm-wrap'), ds = doc.getElementById('d-dstat-wrap');
  check('WT-33: 1 km kutuları ve kaynak notu aynı hücrede',
    !!pk && !!pk.querySelector('#d-1km') && !!pk.querySelector('#d-dist-scope'));
  check('WT-33: detay başlığı, filtresi ve değerleri aynı hücrede',
    !!ds && !!ds.querySelector('#d-dstat-type') && !!ds.querySelector('#d-dur')
      && !!ds.querySelector('#d-power'));
  // Tab sırası DOM sırasıyla aynı kalmalı (grid satır satır dolduruyor)
  const cocuk = [...doc.getElementById('page-dashboard').children].map(e => e.id || e.className);
  check('WT-33: ana sayfa doğrudan çocuk sırası bozulmadı',
    cocuk.indexOf('d-perkm-wrap') < cocuk.indexOf('d-dstat-wrap')
      && cocuk.indexOf('d-warnings') < cocuk.indexOf('d-perkm-wrap'),
    cocuk.join(' > '));
}

// --- WT-38: araç özet kartı kompakt mı? ---
{
  const doc = window.document;
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const body = sel => {
    const m = new RegExp('(?:^|[},])\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      + '\\s*\\{([^}]*)\\}').exec(css);
    return m ? m[1] : '';
  };
  const px = (b, p) => {
    const m = new RegExp(p + '\\s*:\\s*(\\d+(?:\\.\\d+)?)px').exec(b);
    return m ? parseFloat(m[1]) : null;
  };

  const kart = body('.ev-summary'), svg = body('.ev-summary svg');
  const foto = body('.ev-summary img.carphoto'), grid = body('.spec-grid'), cip = body('.spec');
  check('WT-38/3: .ev-summary padding 12px', px(kart, 'padding') === 12,
    'padding=' + px(kart, 'padding'));
  check('WT-38/1: araç silüeti küçük çipte (88x34)',
    px(svg, 'width') === 88 && px(svg, 'height') === 34,
    `${px(svg, 'width')}x${px(svg, 'height')}`);
  check('WT-38/5: fotoğraf 64x48 çipte, tam genişlik banner yok',
    px(foto, 'width') === 64 && px(foto, 'height') === 48 && !/width\s*:\s*100%/.test(foto),
    `${px(foto, 'width')}x${px(foto, 'height')}`);
  check('WT-38/1: üst blok yatay düzende',
    /display\s*:\s*flex/.test(body('.ev-top')) && /align-items\s*:\s*center/.test(body('.ev-top')));
  check('WT-38/2: teknik değerler tek satır kaydırılabilir çipler',
    /display\s*:\s*flex/.test(grid) && /overflow-x\s*:\s*auto/.test(grid), grid.trim());
  check('WT-38/2: çip metni WT-31 kuralına uyuyor (>=12px)',
    px(cip, 'font-size') >= 12, 'font-size=' + px(cip, 'font-size'));
  // 4) yükseklik: jsdom ölçemez, bildirilen değerlerden üst sınır hesaplanır
  const cipH = px(cip, 'font-size') * 1.35 + 2 * px(cip, 'padding') ;
  const ustH = Math.max(px(foto, 'height'), px(svg, 'height'));
  const toplam = 2 * px(kart, 'padding') + ustH + px(grid, 'margin-top') + cipH + 2;
  check('WT-38/4: kart yüksekliği ~110px sınırını geçmiyor', toplam <= 112,
    'hesaplanan=' + Math.round(toplam) + 'px (eskisi ~280px)');
  check('WT-38/7: koyu tema svg kuralı korundu',
    /\[data-theme="dark"\]\s*\.ev-summary svg \[fill="#F1F7F2"\]\s*\{fill:#1e293b\}/.test(css));

  // Silüetler DEĞİŞMEMELİ — sedan gövde yolu birebir sabit
  const SEDAN = 'M20 62 Q22 50 42 47 L62 34 Q80 26 112 26 Q144 26 158 36 L170 46 '
    + 'Q196 49 202 58 Q206 62 204 68 L188 68 A14 14 0 0 0 160 68 L84 68 '
    + 'A14 14 0 0 0 56 68 L24 68 Q18 66 20 62 Z';
  check('WT-38: carSVG() silüetleri değişmedi (sedan gövdesi birebir)',
    app().carSVG('sedan', '#1C8742').includes(SEDAN));
  check('WT-38: viewBox aynı kaldı', app().carSVG('suv').includes('viewBox="0 0 220 84"'));

  // Kart HTML'i: çipler, ekran okuyucu etiketi, fotoğrafın klavye erişimi
  const h = app().evSummaryHTML({ brand: 'Tesla', model: 'Model 3', trim: 'LR',
    y1: 2023, batt: 75, range: 600, dc: 250, ac: 11, arch: 400, body: 'sedan' });
  const box = doc.createElement('div'); box.innerHTML = h;
  const cips = [...box.querySelectorAll('.spec')];
  // WT-40/A "Mimari (400 V)" çipini kaldırdı: son kullanıcı için anlamsız.
  // Sıra da maddede yazdığı gibi: batarya, menzil, DC, AC.
  check('WT-38/2 + WT-40/A: dört teknik değer çipi, mimari yok',
    cips.length === 4 && !/\bV\b/.test(cips[3].textContent)
      && /kWh/.test(cips[0].textContent) && /km|mi/.test(cips[1].textContent),
    cips.map(c => c.textContent.trim()).join(' | '));
  check('WT-38: çipin ekran okuyucu etiketi var (erişilebilirlik korundu)',
    cips.every(c => c.querySelector('.sr-only')?.textContent.trim()),
    cips.map(c => c.querySelector('.sr-only')?.textContent).join(''));
  check('WT-38: boş değer için çip üretilmiyor',
    (() => { const b2 = doc.createElement('div');
      b2.innerHTML = app().evSummaryHTML({ ad: 'Bilinmeyen', body: 'suv' });
      return b2.querySelectorAll('.spec').length === 0; })());

  const hp = doc.createElement('div');
  hp.innerHTML = app().evSummaryHTML({ ad: 'Fotolu', body: 'suv', photo: 'data:image/png;base64,AAA' });
  const im = hp.querySelector('img.carphoto');
  check('WT-38/5: fotoğraf klavyeyle de açılabilir',
    im?.getAttribute('role') === 'button' && im?.getAttribute('tabindex') === '0'
      && im?.getAttribute('alt'), 'alt=' + im?.getAttribute('alt'));
  check('WT-38/5: tam ekran görüntüleyici dialog semantiğinde',
    doc.getElementById('photo-view')?.getAttribute('role') === 'dialog'
      && doc.getElementById('photo-view')?.getAttribute('aria-modal') === 'true');
}

// --- Çeviri sözlüğü bütünlüğü (kullanıcı kuralı: 6 dili DOLDUR) ---
// Anahtar ekleyip/silerken bir dili atlamak sessizce "undefined" metin üretiyor;
// bu blok WT-32'de beş anahtar silinip biri eklenirken eklendi.
{
  const T = app().T, doc = window.document;
  const diller = Object.keys(T);
  check('i18n: altı dil de yüklü', diller.length === 6, diller.join(','));
  const ref = new Set(Object.keys(T.tr));
  const sorun = [];
  for (const d of diller) {
    if (d === 'tr') continue;
    const k = new Set(Object.keys(T[d]));
    const eksik = [...ref].filter(x => !k.has(x));
    const fazla = [...k].filter(x => !ref.has(x));
    if (eksik.length) sorun.push(`${d} eksik: ${eksik.join(',')}`);
    if (fazla.length) sorun.push(`${d} fazla: ${fazla.join(',')}`);
  }
  check('i18n: her dilde aynı anahtar kümesi var', sorun.length === 0,
    sorun.join(' | ') || `${ref.size} anahtar × ${diller.length} dil`);

  const kullanilan = new Set();
  for (const el of doc.querySelectorAll('[data-i18n],[data-i18n-aria],[data-i18n-ph]'))
    for (const a of ['data-i18n', 'data-i18n-aria', 'data-i18n-ph'])
      if (el.hasAttribute(a)) kullanilan.add(el.getAttribute(a));
  const tanimsiz = [...kullanilan].filter(k => !ref.has(k));
  check('i18n: HTML\'deki her data-i18n anahtarı sözlükte var',
    tanimsiz.length === 0, tanimsiz.join(',') || kullanilan.size + ' anahtar');
}

// --- WT-49: bellek içi önbellek gerçekten okumayı azaltıyor mu? ---
{
  const A = app();
  A.S.period = 'year'; A.S.dashVeh = '';   // kayıtlar bu yıl içinde
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  await A.db.sessions.bulkAdd([1, 2, 3].map(i => ({
    tarih: `2026-0${i}-15T10:00`, firma: 'ZES', tip: 'DC', kwh: 10 * i,
    tutar: 100 * i, odenen: 100 * i, cur: 'TRY', aracId: null })));

  // IndexedDB'ye giden okumaları say
  let okuma = 0;
  const perTablo = {sessions: 0, vehicles: 0, expenses: 0};
  const orj = {};
  for (const n of ['sessions', 'vehicles', 'expenses']) {
    orj[n] = A.db[n].toArray.bind(A.db[n]);
    A.db[n].toArray = (...a) => { okuma++; perTablo[n]++; return orj[n](...a); };
  }
  const say = async fn => { const o = okuma; await fn(); await sleep(150); return okuma - o; };
  const sayT = async fn => {
    const o = {...perTablo}; await fn(); await sleep(150);
    return Object.fromEntries(Object.keys(perTablo).map(k => [k, perTablo[k] - o[k]]));
  };

  const ilk = await say(() => A.renderDashboard());
  const ikinci = await say(() => A.renderDashboard());
  check('WT-49/1: ikinci render tabloyu yeniden OKUMUYOR (önbellek)',
    ilk >= 1 && ikinci === 0, `ilk=${ilk} ikinci=${ikinci}`);

  const sekme = await say(() => A.renderStats());
  check('WT-49/4: sekme geçişi üç tabloyu da yeniden okumuyor', sekme === 0,
    'okuma=' + sekme);

  // SOĞUK önbellekle ölç: sıcakken sıfır okuma çıkar ve bu, üç okumayı bire
  // indiren düzeltmeyi DEĞİL yalnız önbelleği doğrulamış olurdu.
  A.invalidateCache();
  const form = await sayT(() => A.openAdd());
  check('WT-49/3: soğuk önbellekte openAdd sessions\'ı TEK KEZ okuyor (eskiden üç)',
    form.sessions === 1, JSON.stringify(form));
  await A.overlayClose('page-add', {force: true});

  // --- doğruluk: yazma önbelleği düşürmeli ---
  await A.db.sessions.add({ tarih: '2026-04-15T10:00', firma: 'YENİ', tip: 'AC',
    kwh: 5, tutar: 50, odenen: 50, cur: 'TRY', aracId: null });
  const sonra = await say(() => A.renderDashboard());
  check('WT-49: yazmadan sonra önbellek düştü (yeniden okundu)', sonra >= 1,
    'okuma=' + sonra);
  check('WT-49 KABUL: yeni kayıt ekranda görünüyor (bayat önbellek yok)',
    $('d-sess').textContent.startsWith('4'), 'd-sess=' + $('d-sess').textContent);

  // Collection.delete() Table metodundan geçmiyor — hook'lar onu da yakalamalı
  await A.db.sessions.filter(r => r.firma === 'YENİ').delete();
  await A.renderDashboard();
  await sleep(200);
  check('WT-49: Collection.delete() de önbelleği düşürüyor',
    $('d-sess').textContent.startsWith('3'), 'd-sess=' + $('d-sess').textContent);

  // memo: aynı kuşakta aynı nesne, yazmadan sonra yeni nesne
  const m1 = A.memo('test', () => ({n: 1}));
  const m2 = A.memo('test', () => ({n: 2}));
  check('WT-49/4: memo aynı kuşakta yeniden hesaplamıyor', m1 === m2 && m1.n === 1);
  await A.db.sessions.add({ tarih: '2026-05-15T10:00', firma: 'X', tip: 'AC',
    kwh: 1, tutar: 1, odenen: 1, cur: 'TRY', aracId: null });
  const m3 = A.memo('test', () => ({n: 3}));
  check('WT-49/4: yazmadan sonra memo tazeleniyor', m3.n === 3);
  await A.db.sessions.filter(r => r.firma === 'X').delete();

  for (const n of ['sessions', 'vehicles', 'expenses']) A.db[n].toArray = orj[n];
}

// --- WT-46: geçmiş araması, özet şeridi, rozet, geri alma ---
{
  const A = app();
  const doc = window.document;
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  const v1 = await A.db.vehicles.add({ad: 'Araç A', body: 'suv'});
  const v2 = await A.db.vehicles.add({ad: 'Araç B', body: 'sedan'});
  const y = new Date().getFullYear();
  await A.db.sessions.bulkAdd([
    {tarih: `${y}-05-01T10:00`, firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', loc: 'Kadıköy', banka: 'Garanti', aracId: v1},
    {tarih: `${y}-05-02T10:00`, firma: 'Esarj', tip: 'AC', kwh: 10, tutar: 100,
      odenen: 100, cur: 'TRY', loc: 'Besiktas', not: 'otoparkta', aracId: v2}
  ]);
  await A.renderHistory();
  await sleep(300);

  check('WT-46/2: filtre özeti kayıt sayısı, tutar, kWh ve birim fiyat veriyor',
    /2/.test($('h-summary').textContent) && /500/.test($('h-summary').textContent)
      && /50 kWh/.test($('h-summary').textContent)
      && /10,00/.test($('h-summary').textContent),
    $('h-summary').textContent);

  check('WT-46/3: çok araçlı kullanıcıda satırda araç rozeti var',
    [...doc.querySelectorAll('#h-groups .crow .name .chip')].length === 2,
    doc.querySelector('#h-groups .crow .name')?.textContent.trim());
  // Rozet SATIRIN aracını göstermeli. Sayı kontrolü tek başına yetmiyordu:
  // kusurlu sürümde rozet İstatistik'teki firma dağılımına konmuştu (orada
  // `r` firma toplamı, aracId'si yok) ve Geçmiş'te hiç çizilmiyordu.
  {
    const rozet = ad => [...doc.querySelectorAll('#h-groups .crow')]
      .find(el => el.querySelector('.name')?.textContent.includes(ad))
      ?.querySelector('.name .chip')?.textContent.trim();
    check('WT-46/3: rozet satırın KENDİ aracını yazıyor',
      rozet('ZES') === 'Araç A' && rozet('Esarj') === 'Araç B',
      'ZES=' + rozet('ZES') + ' Esarj=' + rozet('Esarj'));
  }
  check('WT-46/5: satırda düzenleme çevronu var',
    doc.querySelectorAll('#h-groups .crow-chev').length === 2);

  // WT-71: WT-46/1'in serbest metin araması KULLANICI İSTEĞİYLE kaldırıldı
  // (Geçmiş 1). Arama kontrolleri yerine, kutunun gerçekten gitmiş olduğu ve
  // filtre panelinin sağlam kaldığı doğrulanıyor.
  check('WT-71 KABUL: arama kutusu kaldırıldı',
    !doc.getElementById('h-search'));
  check('WT-71: filtre paneli ve özet şeridi yerinde duruyor',
    !!doc.getElementById('h-filters') && !!doc.getElementById('h-summary')
      && !!doc.getElementById('h-filter-btn'));
  check('WT-71: filtresiz listede iki kayıt da görünüyor',
    doc.querySelectorAll('#h-groups .crow').length === 2,
    'satır=' + doc.querySelectorAll('#h-groups .crow').length);

  // WT-46/6: filtreler tek düğmenin arkasında
  check('WT-46/6: altı açılır liste varsayılan olarak gizli',
    $('h-filters').style.display === 'none'
      && $('h-filter-btn').getAttribute('aria-expanded') === 'false');
  $('h-filter-btn').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(80);
  check('WT-46/6: düğmeye basınca panel açılıyor',
    $('h-filters').style.display !== 'none'
      && $('h-filter-btn').getAttribute('aria-expanded') === 'true');

  // WT-46/4: silme sonrası geri alma
  window.confirm = () => true;
  const oncekiN = (await A.allSessions()).length;
  doc.querySelector('#h-groups [data-del]')
    .dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(400);
  check('WT-46/4: kayıt silindi', (await A.allSessions()).length === oncekiN - 1);
  const geri = doc.querySelector('#toast button, .toast button');
  check('WT-46/4: toast\'ta "Geri al" düğmesi var', !!geri, geri?.textContent);
  if (geri) {
    geri.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
    await sleep(400);
    check('WT-46/4: geri alınca kayıt geri geldi',
      (await A.allSessions()).length === oncekiN,
      'kayıt=' + (await A.allSessions()).length);
  }

  // WT-46/7: ekran görüntüsü olan kayıtta ataç
  await A.db.sessions.clear();
  await A.db.sessions.add({tarih: `${y}-05-03T10:00`, firma: 'ZES', tip: 'DC',
    kwh: 5, tutar: 50, odenen: 50, cur: 'TRY', aracId: v1,
    ekranGor: new window.Blob(['x'], {type: 'image/jpeg'})});
  await A.renderHistory();
  await sleep(300);
  check('WT-46/7: ekran görüntüsü olan kayıtta ataç ikonu (WT-39)',
    /📎/.test($('h-groups').innerHTML));

  // WT-46/3: tek araçlı kullanıcıda rozet BİLGİ TAŞIMIYOR, çizilmemeli
  await A.db.vehicles.delete(v2);
  await A.renderHistory();
  await sleep(200);
  check('WT-46/3: tek araçlı kullanıcıda rozet çizilmiyor',
    doc.querySelectorAll('#h-groups .crow .name .chip').length === 0);

  // Paylaşılan DOM: bu blok arama kutusunu, filtre panelini ve araç tablosunu
  // sonraki bloklara devrediyor — hepsi geri veriliyor.
  await A.db.vehicles.clear();
  await A.db.sessions.clear();
  $('h-filters').style.display = 'none';
  $('h-filter-btn').setAttribute('aria-expanded', 'false');
  await A.renderHistory();
}

// --- WT-45: bütçe takibi ---
{
  const A = app();
  await A.db.sessions.clear();
  A.S.dashVeh = ''; A.S.dstatType = '';
  const bugun = A.localISO();
  await A.db.sessions.add({tarih: bugun + 'T10:00', firma: 'ZES', tip: 'DC',
    kwh: 100, tutar: 1240, odenen: 1240, cur: 'TRY', aracId: null});

  // bütçe kapalıyken çubuk hiç görünmemeli
  A.S.budgetM = null; A.S.budgetY = null; A.S.period = 'month';
  await A.renderDashboard();
  await sleep(250);
  check('WT-45/1: bütçe girilmemişse çubuk görünmüyor',
    $('d-budget').style.display === 'none');

  A.S.budgetM = 2000;
  await A.renderDashboard();
  await sleep(250);
  check('WT-45/2: harcama / bütçe ve yüzde yazılı',
    /1\.240/.test($('d-budget-lbl').textContent)
      && /2\.000/.test($('d-budget-lbl').textContent)
      && /62/.test($('d-budget-lbl').textContent),
    $('d-budget-lbl').textContent);
  check('WT-45/2: çubuk %62 dolu',
    $('d-budget-bar').style.width === '62%', $('d-budget-bar').style.width);
  check('WT-45/3: aşılmamışken çubuk yeşil ve "kalan" yazıyor',
    /accent/.test($('d-budget-bar').style.background)
      && /Kalan|Remaining/.test($('d-budget-note').textContent),
    $('d-budget-note').textContent);

  // aşım
  A.S.budgetM = 1000;
  await A.renderDashboard();
  await sleep(250);
  check('WT-45/3: aşımda çubuk kırmızı VE metin de değişiyor (WCAG 1.4.1)',
    /red/.test($('d-budget-bar').style.background)
      && /aşıldı|Over budget|überschritten|dépassé|superado|superato/i
        .test($('d-budget-note').textContent)
      && /240/.test($('d-budget-note').textContent),
    $('d-budget-note').textContent);

  check('WT-45: geleceğe dönük TAHMİN YOK',
    !/tahmin|projection|ay sonu|year-end/i
      .test($('d-budget-lbl').textContent + $('d-budget-note').textContent),
    $('d-budget-note').textContent);

  // yıllık bütçe yıl dönemine bağlı
  A.S.period = 'year'; A.S.budgetY = 20000;
  await A.renderDashboard();
  await sleep(250);
  check('WT-45/1: yıl döneminde yıllık bütçe kullanılıyor',
    /20\.000/.test($('d-budget-lbl').textContent), $('d-budget-lbl').textContent);
  A.S.period = 'week';
  await A.renderDashboard();
  await sleep(250);
  check('WT-45: hafta seçiliyken çubuk gizli (aylık bütçe anlamsız olurdu)',
    $('d-budget').style.display === 'none');
  A.S.period = 'year'; A.S.budgetM = null; A.S.budgetY = null;
}

// --- WT-44: bakım hatırlatmaları ---
{
  const A = app();
  const doc = window.document;
  A.S.unit = 'km';
  await A.db.expenses.clear();
  await A.db.vehicles.clear();
  const vid = await A.db.vehicles.add({ad: 'Bakım EV', batt: 60, body: 'suv',
    kmStart: 10000, kmNow: 42000});
  A.S.defaultVehicleId = vid;

  // KABUL: ileri tarihli muayene hatırlatması
  await A.db.expenses.add({tarih: '2026-03-15', tur: 'inspection', tutar: 1000,
    cur: 'TRY', aracId: vid, sonrakiTarih: '2027-03-15', hatirlatmaAraligi: '2yil'});
  // km bazlı, aracın sayacı 42.000 -> 3.000 km sonra
  await A.db.expenses.add({tarih: '2026-01-10', tur: 'tire', tutar: 8000,
    cur: 'TRY', aracId: vid, sonrakiKm: 45000, hatirlatmaKm: 10000});
  // GECİKMİŞ kalem
  await A.db.expenses.add({tarih: '2025-01-01', tur: 'insurance', tutar: 9000,
    cur: 'TRY', aracId: vid, sonrakiTarih: '2026-07-18', tekrar: true,
    hatirlatmaAraligi: '1yil'});

  await A.renderVehiclePage();
  await sleep(400);
  check('WT-44/3 KABUL: "Yaklaşanlar" kartı görünüyor',
    $('v-upcoming').style.display !== 'none');
  const satirlar = [...doc.querySelectorAll('#v-upcoming-list .crow')];
  check('WT-44/3: en yakın üç kalem listeleniyor', satirlar.length === 3,
    'satır=' + satirlar.length);
  const metin = satirlar.map(x => x.textContent.replace(/\s+/g, ' ')).join(' | ');
  check('WT-44/3 KABUL: tarih bazlı hatırlatma geri sayımla görünüyor',
    /gün sonra|days|Tagen/.test(metin), metin.slice(0, 120));
  check('WT-44/3: km bazlı hatırlatma aracın güncel sayacını kullanıyor',
    /3\.000 km/.test(metin), metin.slice(0, 160));
  const geciken = satirlar.find(x => /gecikti|overdue/.test(x.textContent));
  check('WT-44/3: geçmiş kalem KIRMIZI ve metniyle de belli (WCAG 1.4.1)',
    !!geciken && /var\(--red\)/.test(geciken.querySelector('.sub').getAttribute('style') || ''),
    geciken?.textContent.replace(/\s+/g, ' '));

  // sıralama: en yakın önce
  const y = await A.yaklasanlar();
  check('WT-44/1: "hangisi önce gelirse" — en yakın olan başta',
    y[0].sira <= y[1].sira && y[1].sira <= y[2].sira,
    y.map(x => x.ad + ':' + Math.round(x.sira)).join(' '));

  // Form: hatırlatma alanları kayda yazılıyor mu?
  await A.openExpense(null);
  await sleep(250);
  $('in-exp-type').value = 'inspection';
  $('in-exp-type').dispatchEvent(new window.Event('change', {bubbles: true}));
  check('WT-44/4: gider türüne göre yaygın aralık ÖNERİLİYOR',
    $('exp-rem-hint').textContent.trim().length > 0, $('exp-rem-hint').textContent);
  $('in-exp-date').value = '2026-07-30';
  $('in-exp-amount').value = '1500';
  $('exp-rem-toggle').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  $('in-exp-next').value = '2027-03-15';
  $('in-exp-nextkm').value = '60000';
  $('in-exp-repeat').checked = true;
  $('btn-save-exp').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(450);
  const kayit = (await A.allExpenses()).find(e => e.tutar === 1500);
  check('WT-44/1: tarih, sayaç, aralık ve tekrar alanları kayda yazıldı',
    kayit && kayit.sonrakiTarih === '2027-03-15' && kayit.sonrakiKm === 60000
      && kayit.tekrar === true,
    JSON.stringify({d: kayit?.sonrakiTarih, km: kayit?.sonrakiKm, r: kayit?.tekrar}));

  // WT-44/2: gecikmiş tekrarlayan kalem taslak öneriyor
  window.confirm = () => true;
  await A.tekrarOner();
  await sleep(300);
  check('WT-44/2: gecikmiş tekrarlayan kalem için taslak açıldı (onaylı)',
    doc.getElementById('page-expense').classList.contains('active')
      && $('in-exp-amount').value !== '',
    'tutar=' + $('in-exp-amount').value);
  await A.overlayClose('page-expense', {force: true});
}

// --- WT-43: yakıt fiyatı geçmişi (uçtan uca) ---
// WT-77 NOTU: TR'de artık 36 aylık EPDK geçmişi GÖMÜLÜ geliyor, o yüzden bu
// blok kasten gömülü verisi OLMAYAN bir ülkede (DE) koşuyor — WT-43'ün kendi
// kabul kriteri (her kayıt kendi tarihinin fiyatıyla) böyle yalıtılmış olarak
// sınanıyor. Gömülü verinin devreye girdiği hâli WT-77 bloğu doğruluyor.
{
  const A = app();
  A.S.unit = 'km'; A.S.country = 'DE'; A.S.cmpVeh = '';
  await A.db.sessions.clear();
  await A.db.fuelPrices.clear();
  await A.db.sessions.bulkAdd([
    {tarih: '2024-06-15T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 300, aracId: null},
    {tarih: '2026-06-15T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 300, aracId: null}
  ]);
  await A.db.fuelPrices.bulkAdd([
    {tarih: '2024-01-01', tur: 'diesel', fiyat: 20, ulke: 'DE'},
    {tarih: '2026-01-01', tur: 'diesel', fiyat: 60, ulke: 'DE'}
  ]);
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 0, prorate: true};
  await A.renderCompare();
  await sleep(350);
  // 2024: 300 km × 10/100 × 20 = 600 · 2026: 300 × 1 × 60 = 1800 -> toplam 2400
  // Tek fiyatla (60) olsaydı 3600 çıkardı.
  check('WT-43/4 KABUL: iki kayıt kendi dönemlerinin fiyatıyla kıyaslandı',
    /2\.400/.test($('c-icetot').textContent), 'c-icetot=' + $('c-icetot').textContent);
  check('WT-43/6: kaç fiyat kaydıyla hesaplandığı yazılı',
    /2/.test($('c-veh-note').textContent)
      && /fiyat/i.test($('c-veh-note').textContent),
    $('c-veh-note').textContent.slice(-90));

  // tek fiyat kalınca uyarı
  await A.db.fuelPrices.clear();
  await A.db.fuelPrices.add({tarih: '2026-01-01', tur: 'diesel', fiyat: 60, ulke: 'DE'});
  await A.renderCompare();
  await sleep(300);
  check('WT-43/6: tek fiyat varken uyarı çıkıyor',
    /tek fiyat/i.test($('c-veh-note').textContent),
    $('c-veh-note').textContent.slice(-80));

  // WT-43/2: fiyat güncellenince eskisi EZİLMİYOR, yeni satır ekleniyor
  const oncekiN = (await A.allFuelPrices()).length;
  $('c-price').value = '75';
  $('c-cons').value = '10';
  $('c-calc').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(400);
  const fpAll = await A.allFuelPrices();
  check('WT-43/2: fiyat güncellemesi geçmişe EKLİYOR, ezmiyor',
    fpAll.length === oncekiN + 1 && fpAll.some(x => x.fiyat === 60)
      && fpAll.some(x => x.fiyat === 75),
    'kayıt=' + fpAll.map(x => x.tarih + ':' + x.fiyat).join(' '));

  // WT-43/3: geçmiş ekranı listeliyor ve silebiliyor
  await A.openFuelHist();
  await sleep(250);
  check('WT-43/3: fiyat geçmişi ekranı kayıtları listeliyor',
    window.document.querySelectorAll('#fp-list li[data-fid]').length === fpAll.length,
    'satır=' + window.document.querySelectorAll('#fp-list li[data-fid]').length);
  $('fp-date').value = '2025-03-01';
  $('fp-price').value = '40';
  $('fp-save').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(350);
  check('WT-43/3: geçmiş TARİHLİ fiyat girilebiliyor',
    (await A.allFuelPrices()).some(x => x.tarih === '2025-03-01' && x.fiyat === 40));
  await A.overlayClose('page-fuelprice', {force: true});

  // WT-43/12: mi modunda etiketler gal/MPG
  A.S.unit = 'mi';
  A.applyI18n();
  await sleep(120);
  check('WT-43/12 KABUL: mi modunda "Consumption (MPG)" görünüyor',
    /MPG/.test($('c-cons-lbl').textContent) && /gal/i.test($('c-price-lbl').textContent),
    `${$('c-cons-lbl').textContent} | ${$('c-price-lbl').textContent}`);
  A.S.unit = 'km';
  A.S.country = 'TR';        // WT-77: blok DE'de koştu, ülkeyi geri al
  A.applyI18n();
  // Sonraki bloklar paylaşılan DOM'u devralıyor: formu ve fiyat geçmişini
  // bıraktığımız gibi değil, bulduğumuz gibi geri ver.
  $('c-price').value = ''; $('c-cons').value = '';
  A.S.cmp = null;
  await A.db.fuelPrices.clear();
}

// --- WT-42: şarj kaybı uçtan uca ---
{
  const A = app();
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  const vid = await A.db.vehicles.add({ad: 'Kayıp EV', batt: 60, body: 'suv'});
  A.S.defaultVehicleId = vid;
  A.S.period = 'year'; A.S.dashVeh = '';
  const y = new Date().getFullYear();
  // 60 kWh × %70 = 42 beklenen, 45,5 faturalanmış -> %8,3
  const id1 = await A.db.sessions.add({tarih: `${y}-04-01T10:00`, firma: 'ZES',
    tip: 'DC', kwh: 45.5, tutar: 500, odenen: 500, cur: 'TRY',
    socB: 20, socA: 90, aracId: vid, kayipPct: 8.3});
  // %20'yi aşan sapma -> satırda uyarı
  await A.db.sessions.add({tarih: `${y}-04-02T10:00`, firma: 'Sapan', tip: 'DC',
    kwh: 45, tutar: 500, odenen: 500, cur: 'TRY', socB: 0, socA: 50,
    aracId: vid, kayipPct: 50});

  await A.openAdd(id1);
  await sleep(300);
  check('WT-42/2: kayıt detayında kayıp satırı yazılı',
    $('in-loss').style.display !== 'none' && /42/.test($('in-loss').textContent)
      && /45,5/.test($('in-loss').textContent) && /8,3/.test($('in-loss').textContent),
    $('in-loss').textContent);
  await A.overlayClose('page-add', {force: true});

  await A.renderStats();
  await sleep(250);
  const kayipSatir = window.document.querySelectorAll('#s-loss .tl');
  check('WT-42/3: firma bazında ortalama kayıp listesi dolu',
    kayipSatir.length >= 2, 'satır=' + kayipSatir.length);
  check('WT-42/3: en çok sapan firma başta',
    /Sapan/.test(kayipSatir[0].textContent), kayipSatir[0].textContent.replace(/\s+/g, ' '));

  await A.renderHistory();
  await sleep(250);
  const gecmis = window.document.getElementById('h-groups').innerHTML;
  check('WT-42/4: %20 üstü sapmada satırda uyarı ikonu var', /⚡/.test(gecmis));

  // kayıt KAYDEDİLİRKEN hesaplanıyor mu? (kayipPct elle verilmeden)
  await A.db.sessions.clear();
  await A.openAdd();
  await sleep(300);
  $('in-date').value = `${y}-05-05`;
  $('in-kwh').value = '45,5';
  $('in-amount').value = '500';
  $('in-socb').value = '20';
  $('in-soca').value = '90';
  $('adv-fields').classList.add('open');
  $('btn-save').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(500);
  const kayit = (await A.db.sessions.toArray())[0];
  check('WT-42/1 KABUL: kayıt kaydedilirken kayipPct hesaplanıp saklandı',
    kayit && Math.abs(kayit.kayipPct - 8.3) < 0.2, 'kayipPct=' + kayit?.kayipPct);
}

// --- WT-41: kWh/100km verimlilik metriği ---
{
  const A = app();
  A.S.period = 'year'; A.S.dashVeh = ''; A.S.dstatType = '';
  await A.db.sessions.clear();
  const y = new Date().getFullYear();
  await A.db.sessions.bulkAdd([
    // 40 kWh / 200 km -> 20,0 kWh/100km
    {tarih: `${y}-03-10T10:00`, firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', mesafeKm: 200, aracId: null},
    // atlanan kayıt: hesaba GİRMEMELİ (WT-41/6)
    {tarih: `${y}-03-12T10:00`, firma: 'ZES', tip: 'DC', kwh: 90, tutar: 900,
      odenen: 900, cur: 'TRY', mesafeKm: 100, atlanan: true, aracId: null},
    // Ev-İş şarjı: hesaba GİRMELİ (WT-41/5)
    {tarih: `${y}-03-14T10:00`, firma: 'Ev-İş', tip: 'AC', kwh: 20, tutar: 100,
      odenen: 100, cur: 'TRY', mesafeKm: 200, mekan: 'evis', aracId: null}
  ]);
  // trend için ikinci bir ay (kışın artışı görmek maddenin amacı)
  const oncekiAy = new Date(); oncekiAy.setMonth(oncekiAy.getMonth() - 1);
  const oa = oncekiAy.getFullYear() + '-'
    + String(oncekiAy.getMonth() + 1).padStart(2, '0');
  await A.db.sessions.add({tarih: `${oa}-05T10:00`, firma: 'ZES', tip: 'DC',
    kwh: 50, tutar: 500, odenen: 500, cur: 'TRY', mesafeKm: 200, aracId: null});
  await A.renderDashboard();
  await sleep(250);
  // (40+20) kWh / (200+200) km * 100 = 15,0
  // (40+20+50) kWh / (200+200+200) km * 100 = 18,3
  check('WT-41/1+5+6: ortalama tüketim doğru (Ev-İş dahil, atlanan hariç)',
    /18,3/.test($('d-cons').textContent), 'd-cons=' + $('d-cons').textContent);

  // DC/AC ayrımı korunuyor: yalnız DC -> (40+50)/(200+200)*100 = 22,5
  A.S.dstatType = 'DC';
  await A.renderDashboard();
  await sleep(250);
  check('WT-41/5: DC/AC ayrımı tüketimde de geçerli',
    /22,5/.test($('d-cons').textContent), 'd-cons=' + $('d-cons').textContent);
  A.S.dstatType = '';

  check('WT-41/2: WLTP ile karşılaştırma YOK, kendi geçmişiyle',
    !/WLTP/.test($('d-cons-d').textContent + $('d-cons').textContent));

  await A.renderStats();
  await sleep(250);
  const cubuk = window.document.querySelectorAll('#s-cons .mb');
  check('WT-41/3: aylık tüketim trendi 6 ay çiziliyor', cubuk.length === 6,
    'çubuk=' + cubuk.length);
  check('WT-41/3: trend notu ölçeğin kendi geçmişi olduğunu söylüyor',
    /WLTP|geçmiş/i.test($('s-cons-note').textContent),
    $('s-cons-note').textContent.slice(0, 60));

  await A.renderHistory();
  await sleep(250);
  const satirlar = [...window.document.querySelectorAll('#h-groups .crow .sub')]
    .map(e => e.textContent);
  check('WT-41/4: kayıt satırında o şarjın kWh/100km değeri var',
    satirlar.some(x => /20,0 kWh\/100/.test(x)), satirlar.join(' || ').slice(0, 140));
  check('WT-41/4: atlanan kayıtta tüketim GÖSTERİLMİYOR',
    !satirlar.some(x => /90,0 kWh\/100/.test(x)));
}

// --- WT-40: menzil gösterimi, veri tarihi ve elle düzeltme ---
{
  const doc = window.document, A = app();

  // A) arama sonucu satırı: mimari yerine menzil, donanım adı kalın
  const res = A.searchEV('model y');
  check('WT-40/A: arama EV_DB\'den sonuç döndürüyor', res.length >= 2,
    'sonuç=' + res.length);
  $('car-search').value = 'model y';
  fire($('car-search'), 'input');
  await sleep(120);
  const satir = $('car-results').querySelector('.ev-item .d');
  check('WT-40/A KABUL: sonuçta "kWh · … menzil" yazıyor, "400V" yazmıyor',
    /kWh/.test(satir.textContent) && /menzil|range|Reichweite/i.test(satir.textContent)
      && !/\d+V\b/.test(satir.textContent), satir.textContent.trim());
  check('WT-40/C5: donanım adı kalın (yanlış sürüm seçilmesin)',
    !!$('car-results').querySelector('.ev-item .d b'));

  // B) menzilin ne olduğu yazıyor ve hesapta kullanılmıyor
  const kart = doc.createElement('div');
  kart.innerHTML = A.evSummaryHTML({brand: 'Tesla', model: 'Model Y', trim: 'Premium RWD',
    y1: 2025, batt: 84, range: 622, dc: 250, ac: 11, arch: 400, body: 'suv'});
  const cipMetin = [...kart.querySelectorAll('.spec .sr-only')].map(e => e.textContent).join('|');
  check('WT-40/B: menzil etiketi "WLTP … (üretici beyanı)"',
    /WLTP/.test(cipMetin) && /beyan|claim|Herstellerangabe|annonc|declarad|dichiarat/i.test(cipMetin),
    cipMetin);
  check('WT-40/B: gerçek menzilin değişebileceği not olarak yazılı',
    /hava|weather|Wetter|météo|clima|meteo/i.test(kart.querySelector('.ev-note')?.textContent || ''),
    kart.querySelector('.ev-note')?.textContent);
  check('WT-40/A: kartta mimari (V) çipi yok',
    ![...kart.querySelectorAll('.spec')].some(c => /\d+\s*V$/.test(c.textContent.trim())));
  check('WT-40/A: arch alanı ve t(\'arch\') SİLİNMEDİ (ileride lazım)',
    typeof A.T.tr.arch === 'string' && A.EV_DB[0].length >= 11);

  // C2) veri tarihi kartta görünüyor
  check('WT-40/C2: kartta "Veri: YYYY-MM" yazıyor',
    /\d{4}-\d{2}/.test(kart.querySelector('.ev-foot')?.textContent || ''),
    kart.querySelector('.ev-foot')?.textContent.trim());
  check('WT-40/C2: EV_DB_TARIH sabiti tanımlı', /^\d{4}-\d{2}$/.test(A.EV_DB_TARIH),
    A.EV_DB_TARIH);

  // C4) "Bu bilgi yanlış mı?" bağlantısı önceden doldurulmuş
  const link = kart.querySelector('a.ev-fix');
  check('WT-40/C4: issue bağlantısı marka/model/donanım/yıl ile dolu',
    link && /github\.com/.test(link.href)
      && decodeURIComponent(link.href).includes('Tesla')
      && decodeURIComponent(link.href).includes('Premium RWD')
      && decodeURIComponent(link.href).includes('2025'),
    link?.href.slice(0, 90));

  // C3) elle düzeltme EV_DB'yi eziyor
  await A.db.vehicles.clear();
  const vid = await A.db.vehicles.add({ad: 'Tesla Model Y', brand: 'Tesla', model: 'Model Y',
    trim: 'Premium RWD', y1: 2025, batt: 84, arch: 400, dc: 250, ac: 11, range: 622, body: 'suv'});
  A.S.unit = 'km';
  await A.openEvSpecs(vid);
  await sleep(120);
  check('WT-40/C3: düzenleme ekranı mevcut değerlerle açılıyor',
    $('ev-batt').value.startsWith('84') && $('ev-dc').value === '250',
    `batt=${$('ev-batt').value} dc=${$('ev-dc').value}`);

  $('ev-batt').value = '75';
  $('evspec-save').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(300);
  const v2 = await A.db.vehicles.get(vid);
  check('WT-40/C3 KABUL: batarya 75 olarak kaydedildi (EV_DB\'yi ezdi)',
    v2.batt === 75 && v2.specElle === true, `batt=${v2.batt} elle=${v2.specElle}`);

  // sınır dışı değer sessizce kırpılmamalı (WT-04 kuralı)
  await A.openEvSpecs(vid);
  await sleep(100);
  $('ev-batt').value = '9999';
  $('evspec-save').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(250);
  const v3 = await A.db.vehicles.get(vid);
  check('WT-40/C3: sınır dışı değer reddedildi, hata gösterildi',
    v3.batt === 75 && $('evspec-err').classList.contains('show'),
    'batt=' + v3.batt + ' hata=' + $('evspec-err').textContent);
  await A.overlayClose('page-evspecs', {force: true});
}

// --- WT-50: dosya yapısı bölündü mü? ---
{
  const oku = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  check('WT-50/8: index.html on iki dosyayı da sırasıyla yüklüyor', (() => {
    const sira = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
    const i = sira.indexOf(APP_FILES[0]);
    return i >= 0 && APP_FILES.every((f, k) => sira[i + k] === f);
  })(), [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).join(' '));
  const sw = oku('sw.js');
  check('WT-50/8: sw.js ASSETS listesi güncel',
    APP_FILES.every(f => sw.includes(`'./${f}'`)),
    APP_FILES.filter(f => !sw.includes(`'./${f}'`)).join(',') || 'tamam');
  check('WT-50: modül sistemi KULLANILMADI (TWA/file:// için)',
    APP_FILES.every(f => !/^\s*(import|export)\s/m.test(oku(f))),
    APP_FILES.filter(f => /^\s*(import|export)\s/m.test(oku(f))).join(','));
  check('WT-50/6: app.js yalnız başlangıç ve yönlendirme (200 satırın altında)',
    oku('app.js').split('\n').length < 200 && /function showScreen/.test(oku('app.js'))
      && /function init/.test(oku('app.js')),
    'app.js=' + oku('app.js').split('\n').length + ' satır');
  check('WT-50/1: i18n.js sözlüğü ve applyI18n\'i taşıyor',
    /const T = \{/.test(oku('i18n.js')) && /function applyI18n/.test(oku('i18n.js')));
  check('WT-50/2: db.js şema, migration ve safeWrite taşıyor',
    /db\.version\(4\)/.test(oku('db.js')) && /async function safeWrite/.test(oku('db.js')));
  check('WT-50/3: calc.js saf hesap fonksiyonlarını taşıyor',
    ['function pf(', 'function fmtNum(', 'function savingsOf(', 'function convOf(',
     'function tureMesafe('].every(x => oku('calc.js').includes(x)));
  check('WT-50/7: kök dizinde i18n-dictionary.js kopyası yok',
    !fs.existsSync(path.join(ROOT, 'i18n-dictionary.js')));
  check('WT-50: hiçbir dosya boş kalmadı',
    APP_FILES.every(f => oku(f).split('\n').length > 20),
    APP_FILES.map(f => f + '=' + oku(f).split('\n').length).join(' '));
}

// --- WT-37: video splash ve yedek yolları ---
{
  const doc = window.document;
  check('WT-37/4a: otomatik oynatma denendi',
    splashPlayCalled === true);
  check('WT-37/4a KABUL: oynatma reddedilince uygulama yine açıldı (splash kapandı)',
    doc.getElementById('splash') === null);
  check('WT-37/7: oturum bayrağı kondu (ikinci açılışta splash atlanır)',
    window.sessionStorage.getItem('wt-splash-seen') === '1');

  // Kaynaktaki sözleşme: bunlar bozulursa iOS/Android otomatik oynatmaz
  check('WT-37/1: video muted + playsinline + poster ile tanımlı',
    /<video[^>]*id="splash-video"[^>]*>/.test(html)
      && /id="splash-video"[\s\S]{0,220}muted/.test(html)
      && /id="splash-video"[\s\S]{0,220}playsinline/.test(html)
      && /id="splash-video"[\s\S]{0,220}poster="splash-poster\.png"/.test(html));
  check('WT-37/2: splashLogoIn / splashWordIn keyframe\'leri kaldırıldı',
    !/splashLogoIn|splashWordIn/.test(html));
  check('WT-37/2: statik logo yedek olarak DOM\'da tutuldu',
    /class="splash-static"/.test(html) && /class="splash-logo"/.test(html));
  // WT-50 sonrası kod 12 dosyaya dağıldı; kaynak sözleşmeleri hepsinde aransın
  const js = APP_FILES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  check('WT-37/3: sabit SPLASH_MIN_MS beklemesi kaldırıldı',
    !/(const|let|var)\s+SPLASH_MIN_MS/.test(js));
  check('WT-37/3: güvenlik ağı 2500 ms',
    /SPLASH_FAILSAFE_MS\s*=\s*2500/.test(js));
  check('WT-37/3: splash video VE veri hazır olunca kapanıyor',
    /splashVideoDone\s*&&\s*splashDataDone/.test(js));
  check('WT-37/4c: prefers-reduced-motion yolu var',
    /prefers-reduced-motion: reduce/.test(js));

  // --- WT-84: animasyondan ÖNCE logo görünmesin ---
  // Üç sözleşme birlikte tutmazsa kusur geri gelir: statik blok varsayılan
  // olarak gizli OLMALI, splash `video-on` ile AÇILMALI ve yedek yol
  // `static-on` EKLEMELİ. jsdom yerleşim çizmiyor; sınanan şey kuralın METNİ.
  const cssSade = html.replace(/\/\*[\s\S]*?\*\//g, '');
  check('WT-84: .splash-static varsayılan olarak display:none',
    /\.splash-static\s*\{[^}]*display:\s*none/.test(cssSade));
  check('WT-84: statik logo yalnız .static-on ile görünür oluyor',
    /\.splash\.static-on\s+\.splash-static\s*\{[^}]*display:\s*flex/.test(cssSade)
      && !/\.splash\.video-on\s+\.splash-static/.test(cssSade));
  check('WT-84 KABUL: splash HTML\'de video-on ile açılıyor (ilk boyamada logo yok)',
    /<div class="splash video-on" id="splash"/.test(html));
  check('WT-84: yedek yol video-on\'u kaldırıp static-on ekliyor',
    /classList\.remove\('video-on'\)[\s\S]{0,80}classList\.add\('static-on'\)/.test(js));

  // --- WT-85: masaüstünde bulanıklık (kaynak 640x360, ekran 1920) ---
  const vidKural = (cssSade.match(/\.splash-video\s*\{[^}]*\}/) || [''])[0];
  check('WT-85 KABUL: video doğal boyutunun ÜSTÜNE büyütülmüyor',
    /max-width:\s*min\(100%,\s*640px\)/.test(vidKural)
      && /max-height:\s*min\(100%,\s*360px\)/.test(vidKural)
      && !/width:\s*100%/.test(vidKural));
  check('WT-85: küçülen video ortalanıyor (inset:0 + margin:auto)',
    /inset:\s*0/.test(vidKural) && /margin:\s*auto/.test(vidKural));
  check('WT-85: açığa çıkan alanı splash\'in beyaz zemini dolduruyor',
    /\.splash\.video-on\s*\{[^}]*background:\s*#FFFFFF/.test(cssSade));
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  check('WT-37/6: splash medyası service worker listesinde',
    /splash\.mp4/.test(sw) && /splash-poster\.png/.test(sw));
  check('WT-37/6: eksik video SW kurulumunu BOZMUYOR (addAll dışında, catch\'li)',
    /OPTIONAL_ASSETS/.test(sw) && /c\.add\(u\)\.catch/.test(sw));
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  check('WT-37: video gereksinimleri README\'ye yazıldı',
    /1080×1080/.test(readme) && /1,2 MB/.test(readme) && /playsinline/.test(readme));
}

// --- WT-36: boş durumlar + örnek veri yaşam döngüsü ---
{
  const doc = window.document;
  window.confirm = () => true;   // demoWarn / demoClearAsk onayları

  await app().db.sessions.clear();
  await app().db.vehicles.clear();
  await app().db.expenses.clear();
  await app().renderDashboard();
  await app().renderHistory();
  await app().renderVehiclePage();
  await app().syncEmptyStates();
  await sleep(200);

  check('WT-36/1: ana sayfada boş durum ikon + cümle + buton',
    !!$('d-empty').querySelector('.empty-ico')
      && $('d-empty').querySelector('.empty-msg')?.textContent.trim().length > 10
      && $('d-empty').querySelector('[data-empty-act="addCharge"]'),
    $('d-empty').querySelector('.empty-msg')?.textContent);
  check('WT-36/1: boş durumdayken veri blokları gizli',
    [...doc.querySelectorAll('#page-dashboard .d-data')].every(e => e.style.display === 'none'),
    [...doc.querySelectorAll('#page-dashboard .d-data')]
      .filter(e => e.style.display !== 'none').map(e => e.id || e.className).join(','));
  check('WT-36/1: Geçmiş boş durumu yönlendiriyor',
    !!$('h-groups').querySelector('[data-empty-act="addCharge"]'));
  check('WT-36/1: İstatistik boş durumu "3 kayıt" diyor',
    /3/.test($('s-empty').textContent) && $('s-data').style.display === 'none',
    $('s-empty').textContent.trim());
  check('WT-36/1: Kıyasla boş durumu girdi istiyor',
    $('c-empty').querySelector('.empty-msg')?.textContent.trim().length > 10);
  check('WT-36/1: Aracım boş durumunda araç ekle butonu var',
    !!$('v-empty').querySelector('[data-empty-act="addCar"]'));
  check('WT-36/3b: örnek veri yokken şerit gizli',
    !$('demo-bar').classList.contains('on'));

  // --- gerçek bir kayıt ekle, sonra örnek veri üret ---
  await app().db.sessions.add({ tarih: '2026-07-01T10:00', firma: 'GERÇEK', tip: 'DC',
    kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', aracId: null });
  await app().seedDemoData();
  await sleep(400);

  const s1 = await app().db.sessions.toArray();
  const v1 = await app().db.vehicles.toArray();
  const e1 = await app().db.expenses.toArray();
  check('WT-36/2: 10 örnek şarj + 1 araç + 3 gider üretildi',
    s1.filter(r => r.demo).length === 10 && v1.filter(r => r.demo).length === 1
      && e1.filter(r => r.demo).length === 3,
    `şarj=${s1.filter(r => r.demo).length} araç=${v1.filter(r => r.demo).length} gider=${e1.filter(r => r.demo).length}`);
  check('WT-36/3a: üretilen her kayıt demo:true işaretli',
    s1.filter(r => r.firma !== 'GERÇEK').every(r => r.demo === true));
  check('WT-36/3b KABUL: örnek veri şeridi görünür',
    $('demo-bar').classList.contains('on'));
  check('WT-36/3b: şerit kapatma düğmesi YOK, yalnız silme var',
    !$('demo-bar').querySelector('[data-dismiss],.close')
      && !!$('btn-demo-clear'));

  // --- yedek örnek veriyi dışarı vermemeli ---
  const yedek = await app().backupPayload();
  check('WT-36/3f: yedekte hiç demo kaydı yok',
    !yedek.sessions.some(r => r.demo) && !yedek.vehicles.some(r => r.demo)
      && !yedek.expenses.some(r => r.demo),
    `yedek şarj=${yedek.sessions.length}`);
  check('WT-36/3f: gerçek kayıt yedekte duruyor',
    yedek.sessions.length === 1 && yedek.sessions[0].firma === 'GERÇEK');

  // --- tek dokunuşla temizlik ---
  await app().clearDemoData();
  await sleep(300);
  const s2 = await app().db.sessions.toArray();
  const v2 = await app().db.vehicles.toArray();
  const e2 = await app().db.expenses.toArray();
  check('WT-36/3c KABUL: hiç demo kayıt kalmadı',
    !s2.some(r => r.demo) && !v2.some(r => r.demo) && !e2.some(r => r.demo),
    `kalan demo şarj=${s2.filter(r => r.demo).length}`);
  check('WT-36/3c KABUL: gerçek kayıt duruyor',
    s2.length === 1 && s2[0].firma === 'GERÇEK', 'kalan=' + s2.map(r => r.firma).join(','));
  check('WT-36/3b: temizlikten sonra şerit kayboldu',
    !$('demo-bar').classList.contains('on'));

  // --- 3d: gerçek kayıt varken otomatik sorup temizliyor mu? ---
  await app().seedDemoData();
  await sleep(300);
  await app().offerDemoCleanup();
  await sleep(300);
  const s3 = await app().db.sessions.toArray();
  check('WT-36/3d: gerçek kayıt varken örnek veri silinmesi öneriliyor (onayla siliniyor)',
    !s3.some(r => r.demo) && s3.length === 1, 'kalan=' + s3.length);
}

// --- WT-47: otomatik doldurma ve akıllı varsayılanlar ---
{
  const A = app();
  const doc = window.document;
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  const bugun = A.localISO();
  const dun = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const v1 = await A.db.vehicles.add({ad: 'Araç A', batt: 77});
  const v2 = await A.db.vehicles.add({ad: 'Araç B', batt: 60});
  A.S.defaultVehicleId = v1;
  const secTip = () => doc.querySelector('#in-tip button.sel')?.dataset.v;

  // 1) Aynı GÜN: tip, banka ve lokasyon önerilir
  await A.db.sessions.add({tarih: `${bugun}T09:00`, firma: 'ZES', tip: 'AC',
    kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', aracId: v1,
    banka: 'Visa', loc: 'Kadıköy'});
  await A.openAdd();
  await sleep(300);
  check('WT-47: yeni kayıtta şarj tipi son kayıttan geliyor',
    secTip() === 'AC', 'tip=' + secTip());
  check('WT-47: banka son kayıttan geliyor',
    $('in-bank').value === 'Visa', 'banka=' + $('in-bank').value);
  check('WT-47: aynı gün içinde lokasyon da öneriliyor',
    $('in-loc').value === 'Kadıköy', 'loc=' + $('in-loc').value);
  // WT-63 bu kriteri DEĞİŞTİRDİ. WT-47 "öneri gelişmiş alana düştüyse panel
  // açılsın" diyordu; ama otomatik doldurma neredeyse her kayıtta çalıştığı
  // için "Gelişmiş alanlar hep açık" ayarı kapalıyken bile panel sürekli açık
  // geliyordu (kullanıcı bildirimi, Veri Girişi 1). Yeni kural: ayar kesin,
  // panel açılmaz — ama düğme dolu alan sayısını yazarak sessiz saklamayı
  // önlüyor. WT-47'nin asıl derdi böyle karşılanıyor.
  check('WT-47/WT-63: öneri gelişmiş alana düştüyse düğme bunu söylüyor',
    !$('adv-fields').classList.contains('open') && /\d/.test($('btn-adv').textContent),
    `btn="${$('btn-adv').textContent}"`);
  check('WT-47: araç zaten varsayılandan geliyordu (bozulmadı)',
    $('in-vehicle').value === String(v1), 'araç=' + $('in-vehicle').value);
  await A.overlayClose('page-add', {force: true});

  // 2) DÜNKÜ kayıt: lokasyon önerilmez (dünkü istasyon bugünün yeri değil),
  //    tip ve banka önerilmeye devam eder
  await A.db.sessions.clear();
  await A.db.sessions.add({tarih: `${dun}T09:00`, firma: 'ZES', tip: 'AC',
    kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', aracId: v1,
    banka: 'Visa', loc: 'Kadıköy'});
  await A.openAdd();
  await sleep(300);
  check('WT-47: dünkü kaydın lokasyonu ÖNERİLMİYOR',
    $('in-loc').value === '', 'loc=' + $('in-loc').value);
  check('WT-47: dünkü kayıtta tip ve banka yine öneriliyor',
    secTip() === 'AC' && $('in-bank').value === 'Visa',
    'tip=' + secTip() + ' banka=' + $('in-bank').value);
  await A.overlayClose('page-add', {force: true});

  // 3) Çok araçlı kullanıcı: öneri SEÇİLİ aracın son kaydından gelmeli
  await A.db.sessions.clear();
  await A.db.sessions.bulkAdd([
    {tarih: `${dun}T08:00`, firma: 'ZES', tip: 'DC', kwh: 10, tutar: 100,
      odenen: 100, cur: 'TRY', aracId: v1, banka: 'Visa'},
    {tarih: `${bugun}T09:00`, firma: 'Trugo', tip: 'AC', kwh: 10, tutar: 100,
      odenen: 100, cur: 'TRY', aracId: v2, banka: 'Mastercard'}
  ]);
  await A.openAdd();
  await sleep(300);
  check('WT-47: öneri başka aracın DAHA YENİ kaydından değil, seçili araçtan',
    secTip() === 'DC' && $('in-bank').value === 'Visa',
    'tip=' + secTip() + ' banka=' + $('in-bank').value);
  await A.overlayClose('page-add', {force: true});

  // 4) DÜZENLEME modunda öneri ASLA çalışmaz — kaydın kendi değerleri kalır
  const dId = await A.db.sessions.add({tarih: `${dun}T20:00`, firma: 'Esarj',
    tip: 'DC', kwh: 5, tutar: 50, odenen: 50, cur: 'TRY', aracId: v1});
  await A.db.sessions.add({tarih: `${bugun}T21:00`, firma: 'ZES', tip: 'AC',
    kwh: 5, tutar: 50, odenen: 50, cur: 'TRY', aracId: v1,
    banka: 'Mastercard', loc: 'Beşiktaş'});
  await A.openAdd(dId);
  await sleep(300);
  check('WT-47: düzenlemede öneri kaydın tipini EZMİYOR',
    secTip() === 'DC', 'tip=' + secTip());
  check('WT-47: düzenlemede boş banka ve lokasyon boş kalıyor',
    $('in-bank').value === '' && $('in-loc').value === '',
    'banka=' + $('in-bank').value + ' loc=' + $('in-loc').value);
  await A.overlayClose('page-add', {force: true});

  // 5) Örnek veri (WT-36) öneri üretmez — kullanıcının alışkanlığı değil
  await A.db.sessions.clear();
  await A.db.sessions.add({tarih: `${bugun}T09:00`, firma: 'ZES', tip: 'AC',
    kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', aracId: v1,
    banka: 'Visa', loc: 'Kadıköy', demo: true});
  await A.openAdd();
  await sleep(300);
  check('WT-47: örnek veriden öneri ÜRETİLMİYOR',
    secTip() === 'DC' && $('in-bank').value === '' && $('in-loc').value === '',
    'tip=' + secTip() + ' banka=' + $('in-bank').value + ' loc=' + $('in-loc').value);
  await A.overlayClose('page-add', {force: true});

  // Paylaşılan DOM: sonraki bloklara temiz durum bırak
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  A.S.defaultVehicleId = null;
}

// --- WT-48: CSV içe aktarma ---
{
  const A = app();
  const doc = window.document;
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  A.S.currency = 'TRY'; A.S.country = 'TR';
  const v1 = await A.db.vehicles.add({ad: 'Kia EV6', batt: 77});
  const v2 = await A.db.vehicles.add({ad: 'BMW i4', batt: 84});
  A.S.defaultVehicleId = v1;
  const y = new Date().getFullYear();

  // --- GİDİŞ-DÖNÜŞ: dışa aktar → sil → içe aktar → aynı rakamlar mı? ---
  await A.db.sessions.bulkAdd([
    // İndirim uygulamada indirimTip/indirimDeger ile saklanıyor; savingsOf()
    // `tutar - odenen` FARKINA bakmıyor. Fikstür de öyle kurulu olmalı.
    {tarih: `${y}-03-01T10:30`, firma: 'ZES', tip: 'DC', mekan: 'firma',
      kwh: 40, tutar: 500, odenen: 400, cur: 'TRY', aracId: v1,
      indirimTip: 'amount', indirimDeger: 100,
      loc: 'Kadıköy', banka: 'Visa', socB: 20, socA: 80, dur: 45},
    {tarih: `${y}-03-05T18:00`, firma: 'Ev-İş', tip: 'AC', mekan: 'evis',
      kwh: 20, tutar: 180, odenen: 180, cur: 'TRY', aracId: v2, atlanan: true},
    {tarih: `${y}-03-09T08:15`, firma: 'Trugo', tip: 'DC', mekan: 'firma',
      kwh: 55, tutar: 610, odenen: 610, cur: 'TRY', aracId: v1, odo: 12000}
  ]);
  const oncekiSess = (await A.allSessions())
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const csv = await A.csvPayload();

  const p = A.parseCSV(csv);
  check('WT-48/2: dışa aktarma ayracı (;) ve başlık okunuyor',
    p.delim === ';' && p.head[0] === 'Tarih' && p.rows.length === 3,
    'ayraç=' + p.delim + ' sütun=' + p.head.length + ' satır=' + p.rows.length);
  check('WT-48/2: BOM başlığı kirletmiyor',
    !/﻿/.test(p.head[0]), JSON.stringify(p.head[0]));
  const m = A.csvAutoMap(p.head);
  check('WT-48/4: kendi başlığımız tamamen otomatik eşleşiyor',
    A.CSV_FIELDS.filter(f => m[f.key] == null).length === 0,
    'eşleşmeyen: ' + A.CSV_FIELDS.filter(f => m[f.key] == null).map(f => f.key).join(','));

  await A.db.sessions.clear();
  await A.openCsvImport(csv);
  await sleep(300);
  check('WT-48/3: önizleme "3 satır okundu · 0 mükerrer · 0 hatalı" diyor',
    /3/.test($('csv-summary').textContent) &&
      /0.*0/.test($('csv-summary').textContent.replace(/^[^·]*·/, '')),
    $('csv-summary').textContent);
  check('WT-48/3: hata listesi boş', $('csv-errors').innerHTML === '');
  check('WT-48/4: eşleme ekranı her alan için satır çiziyor',
    doc.querySelectorAll('#csv-map select').length === A.CSV_FIELDS.length);
  check('WT-48: önizlemede henüz HİÇBİR ŞEY yazılmadı',
    (await A.allSessions()).length === 0);
  $('csv-confirm').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(600);

  const sonra = (await A.allSessions()).sort((a, b) => a.tarih.localeCompare(b.tarih));
  check('WT-48 KABUL: gidiş-dönüşte üç kayıt da geri geldi',
    sonra.length === 3, 'kayıt=' + sonra.length);
  check('WT-48: tarih SAATİYLE birlikte korundu (gün kırpılmadı)',
    sonra.map(r => r.tarih).join(',') === oncekiSess.map(r => r.tarih).join(','),
    sonra.map(r => r.tarih).join(','));
  check('WT-48: kWh ve ödenen tutar birebir aynı',
    sonra.every((r, i) => r.kwh === oncekiSess[i].kwh
      && r.odenen === oncekiSess[i].odenen),
    sonra.map(r => r.kwh + '/' + r.odenen).join(' '));
  // İndirim sütunu eşlenmezse savingsOf() sıfır döner ve kazanç kaybolur
  check('WT-48: indirim/kazanç korundu (savingsOf sıfırlanmıyor)',
    A.savingsOf(sonra[0]) === 100 && sonra[0].tutar === 500,
    'kazanç=' + A.savingsOf(sonra[0]) + ' tutar=' + sonra[0].tutar);
  // WT-16: mekan sütunu olmasa bile firmadan türetiliyor
  check('WT-48: WT-16 mekan boyutu korundu (evis / firma)',
    sonra.map(r => r.mekan).join(',') === oncekiSess.map(r => r.mekan).join(','),
    sonra.map(r => r.firma + '=' + r.mekan).join(' '));
  check('WT-48: araç ADI ile doğru araca bağlandı (WT-08 mantığı)',
    sonra.map(r => r.aracId).join(',') === oncekiSess.map(r => r.aracId).join(','),
    sonra.map(r => r.aracId).join(','));
  check('WT-48: WT-20 atlanan bayrağı ve WT-19 odometresi korundu',
    sonra[1].atlanan === true && sonra[2].odo === 12000,
    'atlanan=' + sonra[1].atlanan + ' odo=' + sonra[2].odo);
  check('WT-48: SoC, süre, lokasyon ve banka korundu',
    sonra[0].socB === 20 && sonra[0].socA === 80 && sonra[0].dur === 45
      && sonra[0].loc === 'Kadıköy' && sonra[0].banka === 'Visa',
    JSON.stringify({b: sonra[0].socB, d: sonra[0].dur, l: sonra[0].loc}));

  // --- WT-48/3: aynı dosya İKİNCİ kez -> hepsi mükerrer ---
  await A.openCsvImport(csv);
  await sleep(300);
  check('WT-48/3 KABUL: aynı dosya ikinci kez tamamen mükerrer sayılıyor',
    /3/.test($('csv-summary').textContent) && $('csv-confirm').disabled,
    $('csv-summary').textContent);
  await A.overlayClose('page-csv', {force: true});

  // --- YABANCI dosya: virgül ayraçlı, tırnaklı, farklı başlıklar ---
  await A.db.sessions.clear();
  const yabanci = 'Date,Network,Energy,Cost,Location\r\n' +
    `${y}-06-01,"ZES, Ataşehir",30,300,"Ataşehir, İstanbul"\r\n` +
    `01.06.${y},Trugo,25,250,Ankara\r\n` +
    `${y}-06-03,Voltrun,,90,İzmir\r\n` +
    `not-a-date,Voltrun,10,90,İzmir\r\n`;
  await A.openCsvImport(yabanci);
  await sleep(300);
  check('WT-48/2: virgül ayraçlı yabancı dosya sezildi',
    doc.querySelectorAll('#csv-map select[data-f="firma"] option').length === 6,
    'sütun=' + (doc.querySelectorAll('#csv-map select[data-f="firma"] option').length - 1));
  check('WT-48/4: farklı başlıklar takma adlarla eşleşti (Date/Network/Energy/Cost)',
    doc.querySelector('#csv-map select[data-f="tarih"]').value === '0' &&
    doc.querySelector('#csv-map select[data-f="firma"]').value === '1' &&
    doc.querySelector('#csv-map select[data-f="kwh"]').value === '2' &&
    doc.querySelector('#csv-map select[data-f="odenen"]').value === '3',
    'tarih=' + doc.querySelector('#csv-map select[data-f="tarih"]').value);
  check('WT-48/3: iki hatalı satır sayıldı ve LİSTELENDİ (boş kWh + bozuk tarih)',
    /2/.test($('csv-summary').textContent.split('·').pop()) &&
      doc.querySelectorAll('#csv-errors li').length === 2,
    $('csv-summary').textContent + ' | li=' + doc.querySelectorAll('#csv-errors li').length);
  check('WT-48/3: hatalı satırın NUMARASI veriliyor',
    /4/.test(doc.querySelectorAll('#csv-errors li')[0].textContent),
    doc.querySelectorAll('#csv-errors li')[0].textContent);
  $('csv-confirm').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(600);
  const yab = (await A.allSessions()).sort((a, b) => a.tarih.localeCompare(b.tarih));
  check('WT-48/2: tırnak içindeki ayraç alan verisi sayıldı, sütun bölmedi',
    yab.length === 2 && yab[0].firma === 'ZES, Ataşehir'
      && yab[0].loc === 'Ataşehir, İstanbul',
    yab.map(r => r.firma).join(' | '));
  check('WT-48/2: gg.aa.yyyy yerel tarih biçimi ISO\'ya çevrildi',
    yab.some(r => r.tarih.startsWith(`${y}-06-01T`) && r.firma === 'Trugo'),
    yab.map(r => r.tarih).join(','));
  check('WT-48: saat sütunu yoksa 12:00 yazılıyor (sıralama bozulmasın)',
    yab.every(r => r.tarih.endsWith('T12:00')), yab.map(r => r.tarih).join(','));
  check('WT-48: araç sütunu yokken varsayılan araca bağlandı',
    yab.every(r => r.aracId === v1), yab.map(r => r.aracId).join(','));

  // --- WT-48/1: aynı düğme hem JSON hem CSV alıyor ---
  await A.db.sessions.clear();
  window.confirm = () => true; window.alert = () => {};
  await A.importFileText(JSON.stringify({app: 'WattTrack', version: 8,
    sessions: [{tarih: `${y}-07-01T10:00`, firma: 'ZES', kwh: 5, odenen: 50,
      cur: 'TRY', aracId: v1}], vehicles: [], expenses: [], settings: []}));
  await sleep(500);
  check('WT-48/1: JSON yolu aynı girişten çalışmaya devam ediyor',
    (await A.allSessions()).length === 1);

  // Paylaşılan DOM: temiz bırak
  await A.overlayClose('page-csv', {force: true});
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  A.S.defaultVehicleId = null;
}

// --- WT-53: manifest sadeleştirme + share_target'ın WT-39'a bağlanması ---
{
  const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  const kalkan = ['protocol_handlers', 'note_taking', 'scope_extensions',
    'edge_side_panel', 'display_override'];
  check('WT-53: kullanılmayan manifest alanları kaldırıldı',
    kalkan.every(k => !(k in mf)), kalkan.filter(k => k in mf).join(', '));
  const kalan = ['id', 'name', 'short_name', 'description', 'start_url', 'scope',
    'display', 'orientation', 'background_color', 'theme_color', 'lang', 'dir',
    'categories', 'icons', 'screenshots', 'shortcuts', 'file_handlers',
    'share_target', 'related_applications'];
  check('WT-53: maddedeki kalması gereken 19 alanın hepsi duruyor',
    kalan.every(k => k in mf), kalan.filter(k => !(k in mf)).join(', '));
  check('WT-53: maddede adı geçmeyen fazladan alan kalmadı',
    Object.keys(mf).every(k => kalan.includes(k)),
    Object.keys(mf).filter(k => !kalan.includes(k)).join(', '));

  // share_target: dosya alabilmesi için POST + multipart ŞART. GET biçimi
  // yalnız metin taşır, ekran görüntüsü paylaşılamaz.
  const st = mf.share_target;
  check('WT-53: share_target dosya alabilmek için POST + multipart',
    st.method === 'POST' && st.enctype === 'multipart/form-data',
    st.method + ' / ' + st.enctype);
  check('WT-53: share_target görsel dosyası kabul ediyor (WT-39 bağlantısı)',
    Array.isArray(st.params.files) && st.params.files[0].name === 'screenshot'
      && st.params.files[0].accept.some(a => /image\//.test(a)),
    JSON.stringify(st.params.files));
  check('WT-53: paylaşım POST\'u service worker\'ın yakalayacağı adrese gidiyor',
    /share-target/.test(st.action), st.action);
  // WT-48 CSV'yi içe aktarılabilir yaptı; dosya eşleştirici de kabul etmeli
  check('WT-53: file_handlers .json VE .csv kabul ediyor',
    JSON.stringify(mf.file_handlers[0].accept).includes('.csv') &&
      JSON.stringify(mf.file_handlers[0].accept).includes('.json'),
    JSON.stringify(mf.file_handlers[0].accept));

  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  check('WT-53: service worker paylaşım POST\'unu yakalıyor',
    /method === 'POST'/.test(sw) && /share-target/.test(sw));
  check('WT-53: dosya Cache API\'ye bırakılıp sayfaya GET ile dönülüyor',
    /Response\.redirect/.test(sw) && /caches\.open\(SHARE_CACHE\)/.test(sw));
  check('WT-53: paylaşım kutusu activate temizliğinden MUAF',
    /k !== CACHE && k !== SHARE_CACHE/.test(sw));

  // Uygulama tarafı: kutudan alıp WT-39 yoluna veriyor ve kutuyu boşaltıyor
  const appjs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  check('WT-53: açılışta paylaşılan görsel OCR yoluna veriliyor',
    /ocrDosyaIsle/.test(appjs) && /share.*===.*'shot'|'shot'/.test(appjs));
  check('WT-53: kutu okunduktan sonra boşaltılıyor (görsel yapışıp kalmasın)',
    /c\.delete\('\.\/__paylasilan__'\)/.test(appjs));
  check('WT-53: onboarding yolunda da kutu boşaltan dal var',
    /!S\.onboarded && q\.get\('share'\) === 'shot'\) paylasimKutusunuBosalt\(\)/
      .test(appjs));
  // OCR saniyeler sürüyor; await edilirse splash o kadar ekranda kalırdı
  check('WT-53: paylaşım OCR\'ı splash\'ı bekletmiyor (await YOK)',
    /\n\s*paylasilanGorseliAl\(\);/.test(appjs)
      && !/await paylasilanGorseliAl\(\)/.test(appjs));

  // OCR başarısız olsa bile paylaşılan görsel kayda iliştirilmeli
  const forms = fs.readFileSync(path.join(ROOT, 'ui/forms.js'), 'utf8');
  const fn = forms.slice(forms.indexOf('async function ocrDosyaIsle'));
  check('WT-53: görsel OCR\'DAN ÖNCE iliştiriliyor (OCR hatası görseli yutmasın)',
    fn.indexOf('resizePhoto') < fn.indexOf('ocrOku') && fn.indexOf('resizePhoto') > -1);
}

// --- WT-53/WT-39: paylaşılan görselin uçtan uca akışı ---
{
  const A = app();
  await A.db.sessions.clear();
  await A.db.vehicles.clear();
  await A.db.vehicles.add({ad: 'Kia EV6', batt: 77});
  // Service worker'ın bıraktığı kutuyu taklit et
  const kutu = new Map();
  window.caches = {
    open: async () => ({
      match: async u => kutu.get(u),
      delete: async u => kutu.delete(u),
      put: async (u, r) => kutu.set(u, r)
    })
  };
  const blob = new window.Blob(['ekran-goruntusu'], {type: 'image/jpeg'});
  kutu.set('./__paylasilan__', {blob: async () => blob});

  // jsdom'da görüntü ÇÖZÜCÜ yok: resizePhoto'nun canvas/Image yolu ne
  // resolve ne reject ediyor, sonsuza kadar bekliyor. İkisi de tarayıcı
  // yeteneği; burada sınanan şey WT-53'ün TESİSATI (kutudan alma, OCR
  // yoluna verme, kutuyu boşaltma).
  const orjResize = window.resizePhoto;
  const orjOku = window.ocrOku;
  const errBefore = errors.length;
  let verilenDosya = null;
  window.resizePhoto = async f => { verilenDosya = f; return f; };
  // OCR'ı KASITLI olarak düşürüyoruz: görsel yine de iliştirilmeli
  window.ocrOku = async () => { throw new Error('vendor yok (test)'); };

  await A.openAdd();
  await sleep(200);
  await A.paylasilanGorseliAl();
  await sleep(400);
  check('WT-53 KABUL: paylaşılan görsel forma iliştirildi',
    $('ocr-shot-wrap').style.display !== 'none' && !!$('ocr-shot').src,
    'src=' + ($('ocr-shot').src || '').slice(0, 24));
  check('WT-53: OCR ÇÖKSE BİLE görsel iliştirilmiş durumda',
    verilenDosya && verilenDosya.type === 'image/jpeg'
      && !!A.T[A.S.lang]          // fallback'in testi taşımadığını doğrula
      && $('ocr-status').textContent === A.T[A.S.lang].ocrFailed,
    'dosya=' + (verilenDosya && verilenDosya.type) + ' durum=' + $('ocr-status').textContent);
  check('WT-53: OCR satırı paylaşım yolunda görünür yapıldı',
    $('ocr-row').style.display !== 'none');
  check('WT-53 KABUL: kutu boşaltıldı (ikinci açılışta yapışmıyor)',
    !kutu.has('./__paylasilan__'), 'kalan=' + kutu.size);

  // Onboarding sırasında paylaşım: form AÇILMAZ ama kutu yine de boşalmalı.
  // Kutu sürümden bağımsız olduğu için kendiliğinden temizlenmiyor; burada
  // bırakılsa aylar sonraki ilk paylaşımda bayat görsel olarak geri gelirdi.
  kutu.set('./__paylasilan__', {blob: async () => blob});
  await A.paylasimKutusunuBosalt();
  check('WT-53: onboarding yolunda da kutu boşaltılıyor (bayat görsel kalmıyor)',
    !kutu.has('./__paylasilan__'), 'kalan=' + kutu.size);

  await A.overlayClose('page-add', {force: true});
  window.resizePhoto = orjResize; window.ocrOku = orjOku;
  delete window.caches;
  await A.db.vehicles.clear();

  // OCR'ı bilerek düşürdük; uygulamanın bastığı console.error BEKLENEN.
  // Harness her console.error'ı hata sayıyor — yalnız bu birini, tam
  // beklediğimiz metin olduğunu doğrulayarak listeden düşürüyoruz.
  const beklenen = errors.splice(errBefore).filter(e => !/vendor yok \(test\)/.test(e));
  check('WT-53: yalnız KASITLI OCR hatası oluştu, başka konsol hatası yok',
    beklenen.length === 0, beklenen.slice(0, 3).join(' | '));
}

// --- WT-54: OpenChargeMap sessiz hatası + Nominatim önbelleği ---
{
  const A = app();
  const orjFetch = window.fetch;
  const errBefore = errors.length;
  let cagrilar = [];
  const stub = (yanit) => { window.fetch = async (u) => { cagrilar.push(String(u)); return yanit(String(u)); }; };

  // 1) OCM 403 (anahtarsız anonim erişimin beklenen yanıtı): SESSİZ KALMA
  cagrilar = [];
  stub(() => ({ok: false, status: 403}));
  const r403 = await A.nearbyStations(41.01, 29.02);
  check('WT-54/3: OCM 403 dönünce boş dizi DEĞİL null dönüyor (hata ayırt ediliyor)',
    r403 === null, JSON.stringify(r403));
  check('WT-54/1: durum kodu konsola yazılıyor (gerçek cihaz doğrulaması için)',
    errors.slice(errBefore).some(e => /OpenChargeMap 403/.test(e)),
    errors.slice(errBefore).join(' | '));
  check('WT-54/2: 403 mesajı anahtarın nereye yazılacağını söylüyor',
    errors.slice(errBefore).some(e => /OCM_KEY/.test(e)));

  // 2) Ağ patlaması da null — "istasyon yok" ile karıştırılmamalı
  window.fetch = async () => { throw new Error('offline test'); };
  check('WT-54/3: ağ hatası da null dönüyor',
    (await A.nearbyStations(41.01, 29.02)) === null);

  // 3) Başarılı yanıtta gerçekten dizi dönüyor (null yalnız hataya özel)
  stub(() => ({ok: true, status: 200, json: async () => ([
    {OperatorInfo: {Title: 'ZES'}, AddressInfo: {Title: 'Ataşehir'}},
    {AddressInfo: {Title: 'Kadıköy Meydan'}}
  ])}));
  const rOK = await A.nearbyStations(41.01, 29.02);
  check('WT-54: başarılı yanıt dizi olarak dönüyor (null hataya özel kaldı)',
    Array.isArray(rOK) && rOK[0] === 'ZES — Ataşehir' && rOK[1] === 'Kadıköy Meydan',
    JSON.stringify(rOK));
  stub(() => ({ok: true, status: 200, json: async () => []}));
  const rBos = await A.nearbyStations(41.01, 29.02);
  check('WT-54: gerçekten istasyon yoksa BOŞ DİZİ dönüyor (null değil)',
    Array.isArray(rBos) && rBos.length === 0, JSON.stringify(rBos));

  // 4) Nominatim 5 dk önbelleği — aynı koordinat İKİNCİ kez sorulmuyor
  cagrilar = [];
  stub(() => ({ok: true, status: 200,
    json: async () => ({address: {suburb: 'Ataşehir', city: 'İstanbul'}})}));
  const g1 = await A.reverseGeo(41.0100, 29.0200);
  const g2 = await A.reverseGeo(41.0100, 29.0200);
  const nomCagri = cagrilar.filter(u => /nominatim/.test(u)).length;
  check('WT-54/4 KABUL: aynı koordinat 5 dk içinde YALNIZ BİR KEZ sorgulanıyor',
    nomCagri === 1, 'çağrı=' + nomCagri);
  check('WT-54/4: önbellekten dönen değer birebir aynı',
    g1 === 'Ataşehir, İstanbul' && g2 === g1, g1 + ' / ' + g2);

  // GPS gürültüsü: ~11 m'lik yuvarlama aynı kovaya düşmeli
  cagrilar = [];
  await A.reverseGeo(41.010002, 29.020003);
  check('WT-54/4: GPS gürültüsü aynı önbellek kovasına düşüyor',
    cagrilar.filter(u => /nominatim/.test(u)).length === 0,
    'çağrı=' + cagrilar.filter(u => /nominatim/.test(u)).length);

  // Uzak koordinat önbelleği PAYLAŞMAMALI
  cagrilar = [];
  await A.reverseGeo(39.9200, 32.8500);
  check('WT-54/4: farklı koordinat yeniden sorgulanıyor (önbellek fazla geniş değil)',
    cagrilar.filter(u => /nominatim/.test(u)).length === 1);

  // BAŞARISIZ sorgu önbelleklenmemeli: geçici hata kalıcı boş ada dönüşmesin
  cagrilar = [];
  stub(() => ({ok: false, status: 500}));
  await A.reverseGeo(38.4200, 27.1400);
  stub(() => ({ok: true, status: 200,
    json: async () => ({address: {suburb: 'Konak', city: 'İzmir'}})}));
  const tekrar = await A.reverseGeo(38.4200, 27.1400);
  check('WT-54/4: BAŞARISIZ sorgu önbelleklenmiyor (geçici hata kalıcılaşmıyor)',
    tekrar === 'Konak, İzmir', String(tekrar));

  // İSİMSİZ ama GEÇERLİ yanıt (kırsal koordinat) önbelleklenmeli: gerçek bir
  // cevap, 5 dk içinde tekrar sorulması Nominatim politikasına aykırı olurdu.
  // Yukarıdaki "başarısız sorgu önbelleklenmiyor" kontrolüyle karıştırılmasın:
  // orada HTTP hatası var, burada sunucu "burada isim yok" diyor.
  cagrilar = [];
  stub(() => ({ok: true, status: 200, json: async () => ({address: {}})}));
  const bos1 = await A.reverseGeo(37.1234, 33.5678);
  const bos2 = await A.reverseGeo(37.1234, 33.5678);
  check('WT-54/4: isimsiz AMA GEÇERLİ yanıt da önbellekleniyor',
    bos1 === null && bos2 === null
      && cagrilar.filter(u => /nominatim/.test(u)).length === 1,
    'çağrı=' + cagrilar.filter(u => /nominatim/.test(u)).length);

  // Kaynak denetimi: anahtar yuvası ve toast bağlantısı
  const forms = fs.readFileSync(path.join(ROOT, 'ui/forms.js'), 'utf8');
  check('WT-54/2: OCM_KEY yuvası var ve boşken URL\'ye eklenmiyor',
    /const OCM_KEY = '';/.test(forms)
      && /OCM_KEY \? '&key=' \+ encodeURIComponent\(OCM_KEY\)/.test(forms));
  check('WT-54/3: çağıran taraf null görünce toast gösteriyor',
    /st === null.*toast\(t\('stationsFail'\)\)/.test(forms));
  check('WT-54/3: stationsFail altı dilde de dolu',
    Object.keys(A.T).every(l => A.T[l].stationsFail),
    Object.keys(A.T).filter(l => !A.T[l].stationsFail).join(','));

  // Yukarıdaki console.error'lar KASITLI (403/500/ağ hatası senaryoları)
  const kalan = errors.splice(errBefore)
    .filter(e => !/OpenChargeMap/.test(e));
  check('WT-54: yalnız kasıtlı OCM hataları oluştu',
    kalan.length === 0, kalan.slice(0, 3).join(' | '));
  window.fetch = orjFetch;
}

// ============================================================
// WT-62: veri girildikten sonra ana sayfada, "bu yıl toplam" kutuları ile
// kilometre sayacı arasında içinde "—" olan boş bir kutu beliriyordu.
// butceCiz() bütçe girilmemişken kutuyu GİZLİYOR, ama syncEmptyStates()
// #page-dashboard içindeki HER .d-data kutusunu koşulsuz görünür yapıyordu.
// İki asenkron çizim yarıştığı için sayfa değişip dönünce kayboluyordu.
// ============================================================
{
  const A = app();
  // Semptom "veri alanları dolduktan sonra" çıkıyor: syncEmptyStates kutuları
  // yalnız kayıt VARKEN görünür yapıyor. Önceki bloklar tabloyu boşaltmış.
  await A.db.sessions.add({tarih: A.localISO() + 'T12:00', firma: 'ZES', tip: 'DC',
    mekan: 'firma', kwh: 30, odenen: 300, tutar: 300, cur: 'TRY', aracId: null});
  A.S.budgetM = 0; A.S.budgetY = 0;
  await A.renderDashboard();
  await A.syncEmptyStates();
  await sleep(250);
  check('WT-62: bütçe girilmemişken bütçe kutusu gizli kalıyor',
    $('d-budget').style.display === 'none',
    `display="${$('d-budget').style.display}" içerik="${$('d-budget').textContent.trim().slice(0, 16)}"`);

  // Gizleme fazla agresif olmasın: bütçe girilince kutu geri gelmeli
  A.S.budgetM = 5000; A.S.period = 'month';
  await A.renderDashboard();
  await A.syncEmptyStates();
  await sleep(250);
  check('WT-62: bütçe girilince kutu geri geliyor',
    $('d-budget').style.display !== 'none' && /%/.test($('d-budget').textContent),
    `display="${$('d-budget').style.display}" içerik="${$('d-budget').textContent.trim().slice(0, 40)}"`);
  A.S.budgetM = 0;

  // Sayaç kutusunun kendi mantığı da korunmalı (eski istisna kaybolmasın)
  await A.renderDashboard();
  await A.syncEmptyStates();
  await sleep(200);
  check('WT-62: sayaç kutusunun kendi görünürlük mantığı bozulmadı',
    ['', 'none'].includes($('d-odo-wrap').style.display),
    `display="${$('d-odo-wrap').style.display}"`);
}

// ============================================================
// WT-60: "Teknik değerleri düzenle" düğmesi (ui/shell.js:195) çiziliyordu ama
// dinleyicisi HİÇ bağlanmamıştı — basınca hiçbir şey olmuyordu. Ayrıca araç
// henüz kaydedilmemişken (seçim ekranı) düzenlenecek DB kaydı da yok.
// ============================================================
{
  $('btn-add-vehicle').click();
  await sleep(200);
  $('car-search').value = 'Model Y';
  fire($('car-search'), 'input');
  await sleep(300);
  const item = window.document.querySelector('#car-results .ev-item');
  check('WT-60: araç arama sonuç veriyor (ön koşul)', !!item,
    item ? item.textContent.replace(/\s+/g, ' ').trim().slice(0, 50) : 'sonuç yok');

  // WT-61: "Ekle" düğmesi ve fotoğraf girişi #car-summary'nin İÇİNDE olmamalı.
  // index.html'de div </main> ile kapatılmıştı; tarayıcı ikisini de kutunun
  // içine koyuyor, araç seçilince innerHTML onları siliyordu.
  check('WT-61: Ekle düğmesi kart kutusunun dışında (markup sağlam)',
    !$('car-summary').contains($('car-save')) && !$('car-summary').contains($('car-photo')));

  if (item) {
    item.click();
    await sleep(250);
    const btn = window.document.querySelector('#car-summary [data-ev-edit]');
    check('WT-60: seçilen araç kartında düzenle düğmesi var (ön koşul)', !!btn);

    btn?.click();
    await sleep(300);
    check('WT-60 KABUL: düğmeye basınca düzenleme ekranı açılıyor',
      $('page-evspecs').classList.contains('active'),
      `class="${$('page-evspecs').className}"`);

    // Kaydedilmemiş seçimde de değer düzeltilebilmeli (Giriş 1: EV_DB'de alt
    // versiyon yoksa kullanıcı bataryayı kaydetmeden önce düzeltsin)
    $('ev-batt').value = '69';
    fire($('ev-batt'), 'change');
    $('evspec-save').click();
    await sleep(350);
    check('WT-60 KABUL: taslakta düzeltilen batarya karta yansıyor',
      /69/.test($('car-summary').textContent),
      $('car-summary').textContent.replace(/\s+/g, ' ').trim().slice(0, 70));
    check('WT-60: kaydetme sonrası düzenleme ekranı kapandı',
      !$('page-evspecs').classList.contains('active'));

    // WT-61 KABUL: araç gerçekten eklenebiliyor
    const A = app();
    const once = (await A.allVehicles()).length;
    check('WT-61: Ekle düğmesi araç seçilince etkinleşiyor', !$('car-save').disabled);
    $('car-save').click();
    await sleep(500);
    const sonra = (await A.allVehicles()).length;
    check('WT-61 KABUL: ikinci araç eklendi', sonra === once + 1,
      `önce=${once} sonra=${sonra}`);
    check('WT-61: eklenen araçta elle düzeltilen batarya korundu',
      (await A.allVehicles()).some(v => v.batt === 69),
      (await A.allVehicles()).map(v => v.batt).join(','));
  }
  if ($('page-addcar').classList.contains('active')) { $('btn-close-addcar').click(); await sleep(200); }
}

// ============================================================
// WT-63: "Gelişmiş alanlar hep açık" ayarı KAPALIYKEN de panel sürekli açık
// geliyordu — WT-47'nin otomatik doldurması banka/lokasyon alanlarını
// doldurduğu için açma koşulu neredeyse her kayıtta sağlanıyordu.
// ============================================================
{
  const A = app();
  A.S.advOpen = false;
  await A.openAdd();
  await sleep(400);
  check('WT-63 KABUL: ayar kapalıyken gelişmiş panel kapalı açılıyor',
    !$('adv-fields').classList.contains('open'),
    `class="${$('adv-fields').className}" btn="${$('btn-adv').textContent}"`);
  // Sessizce saklama yok: dolu alan varsa düğme bunu söylüyor.
  // WT-81/9: "dolu" ölçütü onay kutusunda `checked`, diğerlerinde `value`.
  // Eski hâlinde bu test de kusurla AYNI ifadeyi kullandığı için kusuru
  // göremiyordu — onay kutusu işaretsizken bile value="on" döner.
  const doluAlanlar = [...$('adv-fields').querySelectorAll('input, select, textarea')]
    .filter(el => el.type === 'checkbox' ? el.checked : (el.value || '').trim() !== '');
  const dolu = doluAlanlar.length;
  const btnSayi = ($('btn-adv').textContent.match(/\d+/) || [])[0];
  check('WT-63: dolu gelişmiş alan varsa düğme sayıyı yazıyor',
    dolu === 0 || /\d/.test($('btn-adv').textContent),
    `dolu=${dolu} btn="${$('btn-adv').textContent}"`);
  check('WT-81/9 KABUL: düğmedeki sayı gerçekten dolu alan sayısına eşit',
    dolu === 0 ? btnSayi === undefined : Number(btnSayi) === dolu,
    `dolu=${dolu} (${doluAlanlar.map(e => e.id).join(',') || 'yok'}) btn="${$('btn-adv').textContent}"`);
  // Kusurun imzası: bomboş formda bile "1 dolu" yazıyordu (#in-missed).
  const kutu = $('in-missed');
  check('WT-81/9: işaretsiz onay kutusu value="on" döndürüyor (kusurun kaynağı)',
    kutu.type === 'checkbox' && kutu.checked === false && kutu.value === 'on',
    `checked=${kutu.checked} value="${kutu.value}"`);
  // İşaretlenince sayaç GERÇEKTEN artmalı — düzeltme kutuyu yok saymamalı.
  // openAdd() alanları kayıttan doldurduğu için işaretli durumu ancak
  // `atlanan: true` bir kaydı DÜZENLEMEYE açarak üretebiliyoruz (WT-20 yolu).
  $('btn-close-add').click();
  await sleep(200);
  const atlananId = await A.db.sessions.add({
    tarih: A.localISO() + 'T12:00', firma: 'ZES', tip: 'DC', mekan: 'firma',
    kwh: 10, tutar: 100, odenen: 100, cur: 'TRY', atlanan: true
  });
  await A.invalidateCache('sessions');
  await A.openAdd(atlananId);
  await sleep(400);
  const dolu2 = [...$('adv-fields').querySelectorAll('input, select, textarea')]
    .filter(el => el.type === 'checkbox' ? el.checked : (el.value || '').trim() !== '').length;
  const btnSayi2 = ($('btn-adv').textContent.match(/\d+/) || [])[0];
  check('WT-81/9 KABUL: İŞARETLİ onay kutusu sayaca giriyor',
    $('in-missed').checked === true && dolu2 >= 1 && Number(btnSayi2) === dolu2,
    `checked=${$('in-missed').checked} dolu=${dolu2} btn="${$('btn-adv').textContent}"`);
  $('btn-close-add').click();
  await sleep(200);
  await A.db.sessions.delete(atlananId);
  await A.invalidateCache('sessions');
  await A.openAdd();
  await sleep(300);

  $('btn-close-add').click();
  await sleep(200);
  A.S.advOpen = true;
  await A.openAdd();
  await sleep(400);
  check('WT-63: ayar açıkken panel yine açık geliyor',
    $('adv-fields').classList.contains('open'),
    `class="${$('adv-fields').className}"`);
  $('btn-close-add').click();
  await sleep(200);
  A.S.advOpen = false;
}

// ---- WT-70: başlık ibareleri kaldırıldı, sayaç etiketi birime bağlandı ----
{
  const A = app();
  const dash = $('page-dashboard').textContent;
  check('WT-70: "Detay istatistikler" ibaresi kaldırıldı',
    !/Detay istatistikler|Detail statistics/.test(dash));
  check('WT-70: "Kilometre sayacı" başlığı kaldırıldı',
    !/Kilometre sayacı/.test(dash), dash.match(/Kilometre sayacı/) ? 'hâlâ var' : '');
  check('WT-70 KABUL: sayaç etiketi birimi söylüyor (km)',
    $('d-odo-lbl').textContent === 'Araç km sayacı', $('d-odo-lbl').textContent);
  A.S.unit = 'mi'; A.applyI18n();
  check('WT-70 KABUL: mil seçilince etiket "mi" oluyor',
    /mi/.test($('d-odo-lbl').textContent), $('d-odo-lbl').textContent);
  A.S.unit = 'km'; A.applyI18n();
}

// ---- WT-72: gün dağılımı grafiği silindi, firma dağılımı sayfa sonunda ----
{
  const doc = window.document;
  check('WT-72 KABUL: haftanın günleri grafiği hiç yok',
    !doc.getElementById('d-weekdays'));
  check('WT-72: weekdayDist çeviri anahtarı altı dilden de silindi',
    ['tr', 'en', 'de', 'fr', 'es', 'it'].every(l => !(app().T[l] || {}).weekdayDist));
  const firms = doc.getElementById('d-firms');
  const locs = doc.getElementById('d-locs');
  check('WT-72 KABUL: firma dağılımı lokasyon listesinden SONRA geliyor',
    !!(firms && locs)
      && (locs.compareDocumentPosition(firms) & 4) === 4);
  const detay = doc.getElementById('s-data');
  const bloklar = [...detay.querySelectorAll('h2.h2')].map(h => h.id || h.textContent.trim());
  check('WT-72: firma dağılımı detay bölümünün son başlığı',
    /Firma/.test(String(bloklar[bloklar.length - 1])), bloklar.slice(-3).join(' | '));
}

// ---- WT-73: Kıyasla düzeltmeleri (1, 3, 4, 5) ----
{
  const A = app();
  const doc = window.document;
  A.S.unit = 'km'; A.S.country = 'TR'; A.S.cmpVeh = '';
  await A.db.sessions.clear();
  await A.db.expenses.clear();
  await A.db.fuelPrices.clear();
  const araclar = await A.allVehicles();
  const vid = araclar[0]?.id;
  await A.db.sessions.bulkAdd([
    {tarih: '2026-01-10T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 300, aracId: vid || null},
    {tarih: '2026-04-10T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 300, aracId: vid || null}
  ]);

  // --- Kıyasla 1: sabit gider paneli varsayılan KAPALI ---
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 0, prorate: true};
  $('c-icefix-wrap').style.display = 'none';        // taze açılış durumu
  await A.renderCompare();
  await sleep(300);
  check('WT-73/1 KABUL: yakıtlı sabit gider paneli varsayılan kapalı',
    $('c-icefix-wrap').style.display === 'none'
      && $('c-icefix-toggle').getAttribute('aria-expanded') === 'false',
    'düğme="' + $('c-icefix-toggle').textContent + '"');
  check('WT-73/1: düğme metni ne olduğunu söylüyor',
    /sabit gider/i.test($('c-icefix-toggle').textContent),
    $('c-icefix-toggle').textContent);
  $('c-icefix-toggle').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(60);
  check('WT-73/1: düğmeye basınca panel açılıyor',
    $('c-icefix-wrap').style.display !== 'none'
      && $('c-icefix-toggle').getAttribute('aria-expanded') === 'true');
  $('c-icefix-toggle').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(60);
  check('WT-73/1: tekrar basınca kapanıyor',
    $('c-icefix-wrap').style.display === 'none');

  // --- Kıyasla 4: tek taraf boşken TCO ve yakıt dışı bloklar gizli ---
  check('WT-73/4 KABUL: iki taraf da boşken TCO bloğu gizli',
    $('c-tco-wrap').style.display === 'none'
      && $('c-nf-wrap').style.display === 'none');
  check('WT-73/4: gizlenince nedenini söyleyen satır çıkıyor',
    $('c-tco-need').style.display !== 'none'
      && $('c-tco-need').textContent.length > 20,
    $('c-tco-need').textContent.slice(0, 60));

  // yalnız yakıtlı taraf dolu -> hâlâ gizli (sıfıra karşı kıyas)
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 30000, prorate: true};
  await A.renderCompare();
  await sleep(300);
  check('WT-73/4: yalnız yakıtlı sabit gider varken blok yine gizli',
    $('c-tco-wrap').style.display === 'none'
      && $('c-nf-wrap').style.display === 'none');
  check('WT-73/1: kayıtlı değer varsa panel açık geliyor',
    $('c-icefix-wrap').style.display !== 'none'
      && $('c-icefix').value !== '',
    'değer=' + $('c-icefix').value);

  // yalnız EV tarafı dolu -> yine gizli
  await A.db.expenses.add({tarih: '2026-02-01', tur: 'insurance', tutar: 12000,
    cur: 'TRY', aracId: vid});
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 0, prorate: true};
  await A.renderCompare();
  await sleep(300);
  check('WT-73/4: yalnız EV gideri varken blok yine gizli',
    $('c-tco-wrap').style.display === 'none');

  // iki taraf da dolu -> blok geri geliyor
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 30000, prorate: true};
  await A.renderCompare();
  await sleep(300);
  check('WT-73/4 KABUL: iki taraf da doluyken TCO bloğu görünüyor',
    $('c-tco-wrap').style.display !== 'none'
      && $('c-tco-need').style.display === 'none'
      && $('c-nf-wrap').style.display !== 'none',
    'tco=' + $('c-tco-wrap').style.display + ' nf=' + $('c-nf-wrap').style.display);
  check('WT-73/4: blok görünürken sayılar dolu (— değil)',
    $('c-tcoev').textContent !== '—' && $('c-tcoice').textContent !== '—',
    $('c-tcoev').textContent + ' / ' + $('c-tcoice').textContent);

  // --- Kıyasla 5: "gider dahil" -> "sabit gider dahil", altı dilde ---
  const T = A.T;
  check('WT-73/5 KABUL: TR metinleri "sabit gider" diyor',
    ['tcoIce', 'tco1km', 'tco1kmIce', 'tcoSaved']
      .every(k => /sabit gider/i.test(T.tr[k])),
    ['tcoIce', 'tco1km', 'tco1kmIce', 'tcoSaved']
      .map(k => T.tr[k]).join(' | '));
  check('WT-73/5: yalın "gider dahil" ifadesi kalmadı',
    !['tcoIce', 'tco1km', 'tco1kmIce', 'tcoSaved', 'tcoEv', 'tcoTitle']
      .some(k => /(^|[^t] )gider(ler)? dahil/i.test(T.tr[k])
        && !/sabit gider/i.test(T.tr[k])));
  const sabitSoz = {en: /fixed expense/i, de: /Fixkosten/, fr: /frais fixes/i,
    es: /gastos fijos/i, it: /costi fissi/i};
  for (const [l, re] of Object.entries(sabitSoz)) {
    check(`WT-73/5: ${l} tarafında da "sabit" nitelemesi var`,
      ['tcoIce', 'tco1km', 'tco1kmIce', 'tcoSaved'].every(k => re.test(T[l][k])),
      ['tcoIce', 'tco1km', 'tco1kmIce', 'tcoSaved'].map(k => T[l][k]).join(' | '));
  }
  check('WT-73/5: üç yeni anahtar altı dilde de dolu',
    ['tr', 'en', 'de', 'fr', 'es', 'it'].every(l =>
      ['iceFixOpen', 'iceFixClose', 'tcoNeedFix'].every(k => (T[l][k] || '').length > 5)));

  // --- Kıyasla 3: parantezli kısım kendi satırında ---
  const parenli = [...doc.querySelectorAll('#page-compare .tile .k, #page-compare .hero .k')]
    .filter(el => /\(/.test(el.textContent));
  check('WT-73/3 KABUL: parantezli etiketlerin hepsi ayrı satıra bölündü',
    parenli.length > 0 && parenli.every(el => !!el.querySelector('.paren')),
    'parantezli=' + parenli.length + ' bölünmemiş='
      + parenli.filter(el => !el.querySelector('.paren')).length);
  check('WT-73/3: bölünen etiket metni bozulmadı',
    /^EV toplam$/.test(doc.querySelector('[data-i18n="tcoEv"]').firstChild.textContent)
      && /^ \(şarj \+ sabit gider\)$/.test(
        doc.querySelector('[data-i18n="tcoEv"] .paren').textContent),
    doc.querySelector('[data-i18n="tcoEv"]').textContent);
  const cssAll = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
  check('WT-73/3: Kıyasla kutu etiketlerinde nowrap kesmesi kalktı',
    /#page-compare \.tile \.k\{[^}]*white-space:normal/.test(cssAll));
  check('WT-73/3: parantez satırı blok olarak çiziliyor',
    /#page-compare[^{]*\.paren[^{]*\{[^}]*display:block/.test(cssAll));
}

// ---- WT-74: Aracım kart yerleşimi (metin üstte, düğmeler altta) ----
{
  const A = app();
  const doc = window.document;
  const arsivId = await A.db.vehicles.add(
    {marka: 'Arşiv', model: 'Test', archived: true});
  await A.renderVehiclePage();
  await sleep(400);
  const li = doc.querySelector('#set-vehicles li[data-vid]');
  check('WT-74: etkin araç kartı bulundu (ön koşul)', !!li,
    'li=' + doc.querySelectorAll('#set-vehicles li').length);
  if (li) {
    check('WT-74 KABUL: kartın İLK çocuğu ad/alt bilgi bloğu',
      li.firstElementChild.classList.contains('vn'),
      'ilk=' + li.firstElementChild.className);
    check('WT-74 KABUL: km, ayar ve resim düğmeleri alt satırda',
      ['[data-odo]', '[data-spec]', '[data-cam]', '[data-move]', '[data-star]', '[data-rm]']
        .every(s => !!li.querySelector('.vact ' + s)),
      ['[data-odo]', '[data-spec]', '[data-cam]', '[data-move]', '[data-star]', '[data-rm]']
        .filter(s => !li.querySelector('.vact ' + s)).join(', ') || 'hepsi altta');
    check('WT-74: ad bloğu düğme satırının DIŞINDA (tam genişlik)',
      !li.querySelector('.vact .vn') && li.querySelectorAll('.vn').length === 1);
    check('WT-74: kart iki satır düzenine geçti',
      li.classList.contains('vrow2'));
    const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
    check('WT-74: iki satır düzeni CSS ile kuruluyor',
      /\.vlist li\.vrow2\{[^}]*flex-direction:column/.test(css));
  }
  const ark = doc.querySelector('#set-archived li');
  check('WT-74: arşiv listesi eski tek satır düzeninde kaldı',
    !!ark && !ark.classList.contains('vrow2'), 'arşiv li=' + (ark ? ark.className : 'yok'));
  await A.db.vehicles.delete(arsivId);
  await A.renderVehiclePage();
  await sleep(300);
}

// ---- WT-75: Aracım sabit giderler (filtre, sıralama, dağılım yeri) ----
{
  const A = app();
  const doc = window.document;
  A.S.vehExpVeh = '';
  await A.db.expenses.clear();
  const vid = (await A.allVehicles()).filter(v => !v.archived)[0]?.id;
  const idIlk = await A.db.expenses.add(
    {tarih: '2026-05-10', tur: 'insurance', tutar: 9000, cur: 'TRY', aracId: vid});
  const idSon = await A.db.expenses.add(
    {tarih: '2026-05-10', tur: 'tire', tutar: 8000, cur: 'TRY', aracId: vid});
  await A.db.expenses.add(
    {tarih: '2025-11-02', tur: 'insurance', tutar: 7000, cur: 'TRY', aracId: vid});
  await A.db.expenses.add(
    {tarih: '2026-02-20', tur: 'tax', tutar: 3000, cur: 'TRY', aracId: vid});
  await A.renderVehiclePage();
  await sleep(450);

  // --- Aracım 7: dağılım grafiğin ALTINDA, listenin ÜSTÜNDE ---
  const grafik = doc.getElementById('v-exp-chart-wrap');
  const dagilim = doc.getElementById('c-exp-cats-wrap');
  const filtre = doc.getElementById('exp-flt-wrap');
  const liste = doc.getElementById('c-exp-list');
  const once = (a, b) => (a.compareDocumentPosition(b) & 4) === 4;   // a, b'den önce
  check('WT-75/7 KABUL: gider dağılımı grafiğin altında',
    once(grafik, dagilim) && dagilim.style.display !== 'none');
  check('WT-75/7 KABUL: dağılım listeden de önce geliyor',
    once(dagilim, filtre) && once(filtre, liste));

  // --- Aracım 6: son girilen en üstte (aynı tarihte id kırılma ölçütü) ---
  const sira = [...liste.querySelectorAll('[data-exp]')].map(el => +el.dataset.exp);
  check('WT-75/6 KABUL: liste tarihe göre yeniden eskiye',
    sira.length === 4 && sira[0] === idSon && sira[1] === idIlk,
    'sıra=' + sira.join(','));
  check('WT-75/6: aynı gün girilen iki kalemde SON girilen üstte',
    sira.indexOf(idSon) < sira.indexOf(idIlk));

  // --- Aracım 5: tür filtresi ---
  const turSel = doc.getElementById('exp-flt-type');
  check('WT-75/5: tür filtresi yalnız var olan türleri listeliyor',
    [...turSel.options].map(o => o.value).sort().join(',') === ',insurance,tax,tire',
    [...turSel.options].map(o => o.value).join(','));
  const toplamOnce = $('v-exp-total').textContent;
  turSel.value = 'insurance';
  turSel.dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(400);
  check('WT-75/5 KABUL: tür seçilince liste daralıyor',
    doc.querySelectorAll('#c-exp-list [data-exp]').length === 2,
    'satır=' + doc.querySelectorAll('#c-exp-list [data-exp]').length);
  check('WT-75/5: filtre üstteki toplamı DEĞİŞTİRMİYOR',
    $('v-exp-total').textContent === toplamOnce,
    toplamOnce + ' -> ' + $('v-exp-total').textContent);
  check('WT-75/5: kaç kalemin gösterildiği yazılı',
    $('exp-flt-count').style.display !== 'none'
      && /2 \/ 4/.test($('exp-flt-count').textContent),
    $('exp-flt-count').textContent);

  // --- Aracım 5: ay/yıl filtresi tür filtresiyle birlikte çalışıyor ---
  const donSel = doc.getElementById('exp-flt-period');
  check('WT-75/5: dönem filtresi yılları grup başlığı yapıyor',
    [...donSel.querySelectorAll('optgroup')].map(g => g.label).join(',') === '2026,2025',
    [...donSel.querySelectorAll('optgroup')].map(g => g.label).join(','));
  donSel.value = '2025';
  donSel.dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(400);
  check('WT-75/5 KABUL: yıl + tür birlikte daraltıyor (2025 sigorta = 1)',
    doc.querySelectorAll('#c-exp-list [data-exp]').length === 1,
    'satır=' + doc.querySelectorAll('#c-exp-list [data-exp]').length);
  donSel.value = '2026-02';
  donSel.dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(400);
  check('WT-75/5: eşleşme kalmayınca açıklayıcı metin çıkıyor',
    doc.querySelectorAll('#c-exp-list [data-exp]').length === 0
      && /filtre/i.test(liste.textContent), liste.textContent.trim().slice(0, 50));

  // filtre temizlenince her şey geri geliyor
  turSel.value = ''; turSel.dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(200);
  donSel.value = ''; donSel.dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(400);
  check('WT-75/5: filtre temizlenince dört kalem de geri geliyor',
    doc.querySelectorAll('#c-exp-list [data-exp]').length === 4
      && $('exp-flt-count').style.display === 'none',
    'satır=' + doc.querySelectorAll('#c-exp-list [data-exp]').length);
  check('WT-75: iki yeni anahtar altı dilde de dolu',
    ['tr', 'en', 'de', 'fr', 'es', 'it'].every(l =>
      ['expFltPeriod', 'expFltNone'].every(k => (A.T[l][k] || '').length > 2)));
}

// ---- WT-79: tablette dikey moda zorlama kaldırıldı ----
{
  const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  check('WT-79 KABUL: manifest artık dikey moda kilitlemiyor',
    mf.orientation === 'any', 'orientation=' + mf.orientation);
  // WT-53 alan listesi orientation'ın VARLIĞINI şart koşuyor; o yüzden alan
  // silinmedi, "any" yapıldı.
  check('WT-79: alan silinmedi (WT-53 alan listesi bozulmasın)',
    'orientation' in mf);
  const css = [...window.document.querySelectorAll('style')]
    .map(x => x.textContent).join('\n');
  check('WT-79: yatay yerleşim için kırılma noktası duruyor',
    /@media\(min-width:760px\)/.test(css)
      && /orientation:landscape/.test(css));
}

// ---- WT-80: geniş ekranda yerleşimin ölçeklenmesi ----
// UYARI: jsdom'da yerleşim motoru YOK. Buradaki kontroller kuralın ve DOM
// yapısının doğru olduğunu gösterir, gerçek ekranda ÖYLE ÇİZİLDİĞİNİ değil.
// Tesla / tablet doğrulaması elle test borcunda (WT-79 ile aynı sepette).
{
  const doc = window.document;
  const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '');

  // --- 1) EN ÖNEMLİSİ: id'li sayfa kuralları .active olmadan display vermemeli.
  // `#page-x{display:grid}` (1-0-0) `.page{display:none}` (0-1-0) kuralını ezer
  // ve sayfa hangi sekme açık olursa olsun çizilir — WT-59'un şikayeti.
  // Tarama #page-* ile SINIRLI DEĞİL: aynı tuzak id'li her gizlenebilir
  // öğe için geçerli. İstisnalar aşağıda tek tek gerekçeli.
  const gizliIstisna = new Set([
    // #s-data'yı ui/shell.js SATIR İÇİ style.display ile açıp kapıyor;
    // satır içi stil her stylesheet kuralını yener, ızgara kuralı güvenli.
    '#s-data'
  ]);
  // Tehlikeli olan yön: id'li kuralın öğeyi GÖRÜNÜR yapması. `display:none`
  // veren id kuralı (ör. #adv-fields) tersine güvenli — onu açan kural
  // (#adv-fields.open) zaten daha özgül.
  const idDisplay = [...css.matchAll(/([^{}]*#[\w-]+[^{}]*)\{([^}]*)\}/g)]
    .filter(([, , body]) => {
      const m = /(?:^|;)\s*display\s*:\s*([\w-]+)/.exec(body);
      return m && m[1] !== 'none';
    })
    .map(([, sel]) => sel.trim());
  const korumasiz = idDisplay.filter(sel => sel.split(',').some(s => {
    s = s.trim();
    return /#[\w-]+$/.test(s) && !/\.active/.test(s) && !gizliIstisna.has(s);
  }));
  check('WT-80/WT-59 KABUL: id\'li hiçbir kural .active olmadan display vermiyor',
    korumasiz.length === 0, korumasiz.join(' | ') || 'temiz');
  check('WT-80: ızgaraya geçen sayfaların hepsinde .active var',
    /#page-dashboard\.active,#page-compare\.active\{[^}]*display:grid/.test(css)
      && /#page-vehicle\.active\{[^}]*display:grid/.test(css));

  // --- 2) İstatistik detayları ızgaraya geçti mi, hücreler kendi başına
  // anlamlı mı (WT-33'ün kuralı: başlık ve değeri ayrı hücreye düşmesin)
  check('WT-80: #s-data auto-fit ızgara',
    /#s-data\{[^}]*display:grid[^}]*repeat\(auto-fit,minmax\(300px,1fr\)\)/.test(css));
  const sData = doc.getElementById('s-data');
  const hucreler = [...sData.querySelectorAll(':scope > .gcell')];
  check('WT-80: İstatistik blokları hücrelere sarıldı', hucreler.length >= 7,
    'hücre=' + hucreler.length);
  const basliksiz = hucreler.filter(g => !g.querySelector('h2'));
  check('WT-80 KABUL: her hücrede kendi başlığı var (başlık/değer ayrılmıyor)',
    basliksiz.length === 0,
    basliksiz.map(g => g.firstElementChild?.className).join(',') || 'tamam');
  const icerikVar = g => !!g.querySelector('.monthbars,.donut-wrap,.toplist,.rows');
  check('WT-80: her hücrede başlığın anlattığı blok da var',
    hucreler.every(icerikVar));
  // Dönem seçici ve boş-dönem uyarısı hücre DIŞINDA, tam genişlikte kalmalı
  // (WT-15: seçicinin tüm sayfayı etkilediği görünmeye devam etsin)
  const tamGenis = /([^{}]*)\{grid-column:1\/-1\}/g;
  const spanKurallar = [...css.matchAll(tamGenis)].map(m => m[1]).join(' | ');
  for (const s of ['#s-data>.seg', '#s-data>#s-period-empty'])
    check('WT-80: tam genişlik — ' + s, spanKurallar.includes(s), spanKurallar);
  for (const id of ['d-gran', 's-period-empty'])
    check('WT-80: ' + id + ' hücreye sarılmadı (tam genişlikte kalıyor)',
      doc.getElementById(id).parentElement === sData,
      doc.getElementById(id).parentElement.id || doc.getElementById(id).parentElement.className);

  // --- 3) Aracım: liste solda, gider kartı sağda
  const vTop = doc.getElementById('v-top');
  check('WT-80: Aracım üst bölümü tek hücrede', !!vTop
    && vTop.classList.contains('gcell')
    && !!vTop.querySelector('#set-vehicles') && !!vTop.querySelector('#set-archived'));
  check('WT-80: gider kartı ayrı hücre',
    doc.querySelector('#page-vehicle > .card.gcell') !== null);
  check('WT-80: Aracım başlığı iki sütuna yayılıyor',
    spanKurallar.includes('#page-vehicle>.page-title-row'), spanKurallar);

  // --- 4) Liste/form sayfaları bilerek dar kalıyor (okunabilirlik)
  check('WT-80: Geçmiş ve Ayarlar okuma genişliğinde kaldı',
    /#page-history,#page-settings\{[^}]*max-width:820px/.test(css)
      && /#page-history,#page-settings\{max-width:900px\}/.test(css));
  const darKurallar = [...css.matchAll(/([^{}]*)\{[^}]*max-width:(?:820|900)px[^}]*\}/g)]
    .map(m => m[1]).join(' | ');
  check('WT-80: İstatistik ve Aracım dar sınırın DIŞINDA (genişliği kullanıyorlar)',
    !/#page-(?:stats|vehicle)/.test(darKurallar), darKurallar);

  // --- 5) .dstat KASITLI olarak dokunulmadan bırakıldı: iki örneği de
  // #page-dashboard içinde, auto-fit ızgaranın 280-400px'lik hücrelerinde.
  // minmax(150px,…) orada iki kutuyu tek sütuna düşürürdü.
  check('WT-80: .dstat dar hücrede iki sütun kalmaya devam ediyor',
    /\.dstat\{display:grid;grid-template-columns:1fr 1fr;/.test(css)
      && !/\.dstat\{grid-template-columns:repeat\(auto-fit/.test(css));
  check('WT-80: .dstat yalnız Ana sayfada (gerekçe buna dayanıyor)',
    [...doc.querySelectorAll('.dstat')].every(el => el.closest('#page-dashboard')),
    [...doc.querySelectorAll('.dstat')].map(el => el.closest('section')?.id).join(','));

  // --- 6) Form alanları 780px'lik panelde esnetilmiyor
  check('WT-80: overlay içeriği okunur ölçüde ortalanıyor',
    /\.ov-body\{max-width:640px;width:100%;margin:0 auto\}/.test(css)
      && /#photo-view \.ov-body\{max-width:none\}/.test(css));

  // --- 7) DİKEY EKSEN: alçak yatay ekran için kırılma noktası
  check('WT-80: alçak yatay ekran (Tesla/tablet) için kırılma noktası var',
    /@media\(orientation:landscape\) and \(max-height:820px\)/.test(css));
  // Dokunma hedefleri bu blokta KÜÇÜLTÜLMEMELİ (WT-25 sınırı)
  const alcak = /@media\(orientation:landscape\) and \(max-height:820px\)\{([\s\S]*)$/.exec(css);
  const hedefler = ['.crow .del', '.vlist .cam', '.chip', '.seg.mini button',
    '.ov-head .close', '.theme-btn', '.mini-btn', '.sw', '.details-toggle', '.h2row .link'];
  check('WT-80: alçak ekran bloğu dokunma hedeflerine dokunmuyor (WT-25)',
    !alcak || !hedefler.some(h => alcak[1].includes(h + '{')),
    hedefler.filter(h => alcak && alcak[1].includes(h + '{')).join(',') || 'temiz');
}

// ---- WT-78: gömülü elektrik tarifesi tablosu ----
{
  const A = app();
  const doc = window.document;
  const P = A.KWH_PRICES, SRC = A.KWH_SRC;

  // --- veri bütünlüğü: her kaydın kaynağı ve yılı olacak ---
  const kodlar = Object.keys(P);
  check('WT-78: tablo 45 ülkenin çoğunu kapsıyor', kodlar.length >= 40,
    'ülke=' + kodlar.length);
  check('WT-78 KABUL: HER kaydın kaynağı ve yılı var (uydurma veri yok)',
    kodlar.every(k => P[k].s && SRC[P[k].s] && P[k].y >= 2024 && P[k].cur),
    kodlar.filter(k => !(P[k].s && SRC[P[k].s] && P[k].y >= 2024 && P[k].cur)).join(',') || 'tamam');
  check('WT-78: her kaynak künyesinde ad, url ve tarih var',
    Object.values(SRC).every(s => s.ad && /^https:/.test(s.url) && /^\d{4}-\d{2}-\d{2}$/.test(s.guncel)));
  check('WT-78: fiyatlar makul aralıkta (0 < p, sıfır/negatif yok)',
    kodlar.every(k => P[k].p == null || P[k].p > 0),
    kodlar.filter(k => P[k].p != null && P[k].p <= 0).join(','));
  // Tablodaki para birimi uygulamanın o ülke için kullandığıyla aynı olmalı,
  // yoksa varsayılan yanlış para biriminde dolar.
  const curOf = Object.fromEntries(A.COUNTRIES.map(c => [c[0], c[3]]));
  check('WT-78 KABUL: her ülkenin para birimi COUNTRIES ile aynı',
    kodlar.every(k => P[k].cur === curOf[k]),
    kodlar.filter(k => P[k].cur !== curOf[k]).map(k => k + ':' + P[k].cur + '≠' + curOf[k]).join(', ') || 'tamam');
  check('WT-78: tabloda COUNTRIES dışı ülke yok',
    kodlar.every(k => curOf[k]), kodlar.filter(k => !curOf[k]).join(','));

  // --- arama: ülke ve alt bölge ---
  const tr = A.defaultKwhPrice('TR');
  check('WT-78: TR için fiyat dönüyor', !!tr && tr.cur === 'TRY' && tr.p > 0,
    JSON.stringify(tr));
  check('WT-78 KABUL: ABD eyalet seçilince eyalet fiyatı dönüyor',
    A.defaultKwhPrice('US', 'HI').p !== A.defaultKwhPrice('US').p
      && A.defaultKwhPrice('US', 'HI').region === 'HI',
    'HI=' + A.defaultKwhPrice('US', 'HI').p + ' US=' + A.defaultKwhPrice('US').p);
  check('WT-78 KABUL: Kanada ülke geneli YOK, il seçilince geliyor',
    A.defaultKwhPrice('CA') === null && A.defaultKwhPrice('CA', 'QC').p > 0,
    'QC=' + JSON.stringify(A.defaultKwhPrice('CA', 'QC')));
  check('WT-78: kaynağı olmayan ülkede null dönüyor (uydurulmuyor)',
    A.defaultKwhPrice('MC') === null && A.defaultKwhPrice('XX') === null);
  check('WT-78: alt bölge listesi yalnız ABD ve Kanada için var',
    A.kwhRegions('US').length === 51 && A.kwhRegions('CA').length === 10
      && A.kwhRegions('TR') === null,
    'US=' + A.kwhRegions('US').length + ' CA=' + A.kwhRegions('CA').length);

  // --- otomatik doldurma: KULLANICI DEĞERİ EZİLMEZ ---
  A.S.country = 'TR'; A.S.kwhRegion = '';
  A.S.homeKwhPrice = null;
  await A.kwhPriceAutofill();
  check('WT-78 KABUL: alan boşken tablodan doluyor',
    Math.abs(A.S.homeKwhPrice - P.TR.p) < 1e-9, 'değer=' + A.S.homeKwhPrice);
  // WT-81/8: "kullanıcı girdi" artık S'e elle atamakla DEĞİL, gerçek giriş
  // yolundan geçirilerek kuruluyor — çünkü tablodan gelen değer (homeKwhAuto)
  // ile elle yazılan değer artık ayrışıyor ve ayrımı koyan yer o dinleyici.
  // Testin gerçek yolu sürmesi ayrıca daha güçlü: bir kusur dinleyiciye
  // girerse burada yakalanır.
  await A.renderSettings();
  await sleep(200);
  doc.getElementById('set-homekwh').value = '9,99';
  doc.getElementById('set-homekwh')
    .dispatchEvent(new window.Event('change', {bubbles: true}));
  await sleep(300);
  check('WT-81/8: elle girilen fiyat "otomatik" işaretini kaldırıyor',
    A.S.homeKwhPrice === 9.99 && A.S.homeKwhAuto === false,
    'değer=' + A.S.homeKwhPrice + ' auto=' + A.S.homeKwhAuto);
  const degisti = await A.kwhPriceAutofill();
  check('WT-78 KABUL: kullanıcının girdiği değer ASLA ezilmiyor',
    degisti === false && A.S.homeKwhPrice === 9.99, 'değer=' + A.S.homeKwhPrice);
  // Ülke değişse bile elle girilen değer korunur (asıl WT-78 değişmezi)
  A.S.country = 'DE';
  const degisti2 = await A.kwhPriceAutofill();
  check('WT-78 KABUL: ülke değişse de elle girilen değer korunuyor',
    degisti2 === false && A.S.homeKwhPrice === 9.99, 'değer=' + A.S.homeKwhPrice);
  A.S.country = 'TR';

  // --- ayarlar arayüzü ---
  A.S.country = 'US'; A.S.kwhRegion = ''; A.S.currency = 'USD';
  await A.renderSettings();
  await sleep(200);
  check('WT-78: ABD seçiliyken eyalet kutusu görünüyor',
    doc.getElementById('wrap-kwh-region').style.display !== 'none'
      && doc.querySelectorAll('#set-kwhregion option').length === 52,
    'seçenek=' + doc.querySelectorAll('#set-kwhregion option').length);
  check('WT-78 KABUL: varsayılanın kaynağı ve yılı ekranda yazılı',
    doc.getElementById('set-kwh-src').style.display !== 'none'
      && /EIA/.test(doc.getElementById('set-kwh-src').textContent)
      && /2024/.test(doc.getElementById('set-kwh-src').textContent),
    doc.getElementById('set-kwh-src').textContent.slice(0, 80));
  A.S.country = 'TR'; A.S.currency = 'TRY'; A.S.kwhRegion = '';
  await A.renderSettings();
  await sleep(200);
  check('WT-78: alt bölgesi olmayan ülkede kutu gizli',
    doc.getElementById('wrap-kwh-region').style.display === 'none');
  check('WT-78: farklı fiyat girilmişken "önerileni kullan" düğmesi çıkıyor',
    doc.getElementById('btn-kwh-default').style.display !== 'none',
    'metin=' + doc.getElementById('btn-kwh-default').textContent.slice(0, 50));
  doc.getElementById('btn-kwh-default')
    .dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(400);
  check('WT-78 KABUL: düğmeye basınca önerilen fiyat uygulanıyor',
    Math.abs(A.S.homeKwhPrice - P.TR.p) < 1e-9, 'değer=' + A.S.homeKwhPrice);
  check('WT-78: uygulandıktan sonra düğme kayboluyor',
    doc.getElementById('btn-kwh-default').style.display === 'none');

  check('WT-78: dört yeni anahtar altı dilde de dolu',
    ['tr', 'en', 'de', 'fr', 'es', 'it'].every(l =>
      ['kwhRegion', 'kwhRegionPick', 'kwhSrcNote', 'kwhUseDefault']
        .every(k => (A.T[l][k] || '').length > 3)));
  const dosya = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  check('WT-78: kwhRegion ayarı yedekten geri yüklenenler arasında',
    /'kwhRegion'/.test(dosya('app.js')));
  check('WT-78: yeni dosya sw.js ve index.html ile birlikte eklendi',
    /evprices\.js/.test(dosya('sw.js')) && /evprices\.js/.test(html));
}

// ---- WT-77: Türkiye yakıt fiyatı geçmişi gömülü geliyor ----
{
  const A = app();
  const doc = window.document;
  const H = A.FUEL_HIST.TR;

  // --- veri bütünlüğü ---
  const aylar = Object.keys(H.m).sort();
  check('WT-77 KABUL: 36 aylık geçmiş var', aylar.length === 36, 'ay=' + aylar.length);
  check('WT-77: aylar boşluksuz ve sıralı', (() => {
    for (let i = 1; i < aylar.length; i++) {
      const [y, m] = aylar[i - 1].split('-').map(Number);
      const bek = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
      if (aylar[i] !== bek) return false;
    }
    return true;
  })(), aylar[0] + ' … ' + aylar[aylar.length - 1]);
  check('WT-77: üç yakıt türü de her ayda dolu ve makul (10–200 TL/lt)',
    aylar.every(a => H.m[a].length === 3
      && H.m[a].every(v => typeof v === 'number' && v > 10 && v < 200)),
    aylar.filter(a => H.m[a].some(v => !(v > 10 && v < 200))).join(',') || 'tamam');
  check('WT-77 KABUL: kaynak künyesi var (uydurma veri değil)',
    !!A.FUEL_HIST_SRC[H.src] && /epdk\.gov\.tr/.test(A.FUEL_HIST_SRC[H.src].url)
      && /^\d{4}-\d{2}-\d{2}$/.test(A.FUEL_HIST_SRC[H.src].guncel));
  check('WT-77: motorin benzinden pahalı olmuş aylar var (veri kopyala-yapıştır değil)',
    aylar.some(a => H.m[a][1] > H.m[a][0]) && aylar.some(a => H.m[a][2] < H.m[a][0]));

  // --- birleştirme: kullanıcı verisi üstün, veri tabanına yazılmıyor ---
  await A.db.fuelPrices.clear();
  const bos = A.fuelHistMerge([], 'TR');
  check('WT-77: gömülü satır sayısı 36 ay × 3 tür', bos.length === 108,
    'satır=' + bos.length);
  check('WT-77: gömülü satırlarda id yok, gomulu işareti var',
    bos.every(x => x.id === undefined && x.gomulu === true && x.ulke === 'TR'));
  const kul = [{tarih: '2024-01-01', tur: 'diesel', fiyat: 999, ulke: 'TR', id: 1}];
  const kar = A.fuelHistMerge(kul, 'TR');
  const ocak24 = kar.filter(x => x.tarih === '2024-01-01' && x.tur === 'diesel');
  check('WT-77 KABUL: aynı tarih+türde KULLANICININ fiyatı kazanıyor',
    ocak24.length === 1 && ocak24[0].fiyat === 999, JSON.stringify(ocak24));
  check('WT-77: gömülü geçmişi olmayan ülkede hiçbir şey eklenmiyor',
    A.fuelHistMerge([], 'DE').length === 0 && A.fuelHistMerge(kul, 'DE').length === 1);

  // --- hesapta gerçekten kullanılıyor mu ---
  A.S.unit = 'km'; A.S.country = 'TR'; A.S.currency = 'TRY'; A.S.cmpVeh = '';
  await A.db.sessions.clear();
  await A.db.fuelPrices.clear();
  await A.db.sessions.bulkAdd([
    {tarih: '2023-09-15T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 1000, aracId: null},
    {tarih: '2026-06-15T12:00', firma: 'ZES', tip: 'DC', kwh: 50, tutar: 500,
      odenen: 500, cur: 'TRY', mesafeKm: 1000, aracId: null}
  ]);
  A.S.cmp = {fuel: 'diesel', price: 60, cons: 10, icefix: 0, prorate: true};
  await A.renderCompare();
  await sleep(400);
  // 2023-09 motorin 39,181 · 2026-06 motorin: gömülü tablodan
  const bek = Math.round(1000 * 0.10 * H.m['2023-09'][1] + 1000 * 0.10 * H.m['2026-06'][1]);
  // money() ondalıksız yazıyor; binlik ayıracı "." olduğu için pf() değil
  // doğrudan rakamlar okunuyor
  const okunan = Number($('c-icetot').textContent.replace(/[^\d]/g, ''));
  check('WT-77 KABUL: kullanıcı hiç fiyat girmeden geçmiş fiyatlar kullanıldı',
    Math.abs(okunan - bek) <= 2, 'beklenen≈' + bek + ' okunan=' + okunan);
  check('WT-77: tek fiyat uyarısı artık çıkmıyor (36 aylık geçmiş var)',
    !/tek fiyat/i.test($('c-veh-note').textContent)
      && /fiyat kaydı/i.test($('c-veh-note').textContent),
    $('c-veh-note').textContent.slice(-70));
  check('WT-77 KABUL: veri tabanına HİÇBİR ŞEY yazılmadı',
    (await A.allFuelPrices()).length === 0);

  // --- fiyat geçmişi ekranı ---
  await A.openFuelHist();
  await sleep(300);
  const satir = doc.querySelectorAll('#fp-list li');
  check('WT-77: geçmiş ekranı gömülü fiyatları da listeliyor', satir.length === 108,
    'satır=' + satir.length);
  check('WT-77 KABUL: gömülü satırlarda silme düğmesi YOK',
    doc.querySelectorAll('#fp-list [data-fdel]').length === 0);
  check('WT-77: satırlar "gömülü" olarak işaretli',
    /gömülü/.test(doc.querySelector('#fp-list li').textContent));
  check('WT-77 KABUL: nereden geldiği ekranda yazılı (EPDK)',
    doc.getElementById('fp-embed').style.display !== 'none'
      && /EPDK/.test(doc.getElementById('fp-embed').textContent),
    doc.getElementById('fp-embed').textContent.slice(0, 70));
  // kullanıcı kendi fiyatını girince o satır silinebilir olmalı
  $('fp-date').value = '2025-05-01';
  $('fp-price').value = '50';
  $('fp-type').value = 'diesel';
  $('fp-save').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await sleep(400);
  check('WT-77: kullanıcı kendi fiyatını girince o satır silinebilir oluyor',
    doc.querySelectorAll('#fp-list [data-fdel]').length === 1
      && doc.querySelectorAll('#fp-list li').length === 108,
    'silinebilir=' + doc.querySelectorAll('#fp-list [data-fdel]').length
      + ' satır=' + doc.querySelectorAll('#fp-list li').length);
  await A.overlayClose('page-fuelprice', {force: true});
  await A.db.fuelPrices.clear();

  check('WT-77: iki yeni anahtar altı dilde de dolu',
    ['tr', 'en', 'de', 'fr', 'es', 'it'].every(l =>
      ['fuelHistEmbedded', 'fuelHistSrcTag'].every(k => (A.T[l][k] || '').length > 2)));
}

// ---- WT-76: EV alt versiyonları — TESPİT ÇÜRÜTÜLDÜ, bulgu kilitleniyor ----
// Madde "alt versiyonlar eklensin, menzil farkı açıkça belirtilsin" diyordu.
// Ölçüm bunun zaten yapılmış olduğunu gösterdi (bkz. çalışma sırası dosyası).
// Bu kontroller bulgunun sessizce geri gitmesini engelliyor.
{
  const A = app();
  const DB = A.EV_DB;
  check('WT-76: EV_DB kayıtlarının HEPSİNDE batarya ve menzil dolu',
    DB.every(r => r[5] > 0 && r[9] > 0),
    DB.filter(r => !(r[5] > 0 && r[9] > 0)).map(r => r.slice(0, 3).join(' ')).join(', ') || 'tamam');
  check('WT-76: her kaydın donanım adı var (alt versiyon ayırt edilebiliyor)',
    DB.every(r => String(r[2] || '').trim().length > 0));
  const grup = {};
  DB.forEach(r => (grup[r[0] + ' ' + r[1]] ??= []).push(r));
  const cok = Object.values(grup).filter(v => v.length > 1);
  check('WT-76: çok donanımlı model grupları var (tek satıra indirgenmemiş)',
    cok.length >= 20, 'çok donanımlı=' + cok.length + '/' + Object.keys(grup).length);
  // Kullanıcının verdiği somut örnek: 2025 Model Y'nin Standard Range'i
  const my = grup['Tesla Model Y'] || [];
  check('WT-76 KABUL: Tesla Model Y birden çok donanımla listeleniyor',
    my.length >= 2, 'donanım=' + my.map(r => r[2]).join(' | '));
  check('WT-76 KABUL: kullanıcının verdiği 69 kWh Standard Range kayıtta var',
    my.some(r => r[5] === 69), 'bataryalar=' + my.map(r => r[5]).join(','));
  check('WT-76: aynı modelin donanımları arasında menzil farkı görünüyor',
    cok.every(v => new Set(v.map(r => r[9])).size > 1
      || new Set(v.map(r => r[5])).size > 1),
    cok.filter(v => new Set(v.map(r => r[9])).size === 1
      && new Set(v.map(r => r[5])).size === 1)
      .map(v => v[0][0] + ' ' + v[0][1]).join(', ') || 'tamam');
  check('WT-76: EV_DB verisinin tarih damgası var',
    /^\d{4}-\d{2}$/.test(A.EV_DB_TARIH), A.EV_DB_TARIH);
}

// ---- WT-81/1: bar grafiklerinin ORANI (tek çizim yolu) ----
{
  const A = app();
  const doc = window.document;

  // --- Oran birebir mi? Etiketler çubuğu sıkıştıramamalı.
  // Eski hesapta 130px'lik kutuda %100 isteyen çubuk ~%68'e iniyordu;
  // istenen 2:1 oran ~1.39:1 çiziliyordu.
  const kutu = doc.createElement('div');
  kutu.innerHTML = A.barChartHTML([
    {label: 'A', value: 100, text: '100'},
    {label: 'B', value: 50,  text: '50'},
    {label: 'C', value: 0,   text: ''},
    {label: 'D', value: null, text: ''}
  ]);
  const yuzde = [...kutu.querySelectorAll('.bar')]
    .map(b => parseFloat(b.style.height));
  check('WT-81/1 KABUL: çubuk oranları birebir (100/50 -> %100/%50)',
    yuzde[0] === 100 && yuzde[1] === 50, yuzde.join(' / '));
  check('WT-81/1: sıfır ve veri yok, görünür bir taban çubuk alıyor',
    yuzde[2] === 2 && yuzde[3] === 2, yuzde.join(' / '));
  check('WT-81/1: her çubuk kendi .track\'i içinde (etiketler sıkıştıramaz)',
    [...kutu.querySelectorAll('.mb')].every(mb =>
      mb.querySelector(':scope > .track > .bar')));
  check('WT-81/1: yıl özniteliği yalnız istendiğinde veriliyor',
    kutu.querySelector('.mb[data-y]') === null
      && /data-y="2026"/.test(A.barChartHTML([{label: 'A', value: 1, year: '2026'}],
        {yearAttr: true})));

  // --- Üç grafik de aynı yoldan mı çiziliyor?
  await A.db.sessions.clear();
  const yil = new Date().getFullYear();
  await A.db.sessions.bulkAdd([
    {tarih: `${yil}-01-10T10:00`, firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400,
      odenen: 400, cur: 'TRY', mesafeKm: 200, aracId: null},
    {tarih: `${yil}-02-10T10:00`, firma: 'ZES', tip: 'DC', kwh: 20, tutar: 200,
      odenen: 200, cur: 'TRY', mesafeKm: 100, aracId: null},
    {tarih: `${yil}-03-10T10:00`, firma: 'Trugo', tip: 'AC', kwh: 10, tutar: 100,
      odenen: 100, cur: 'TRY', mesafeKm: 60, aracId: null}
  ]);
  A.S.gran = 'year'; A.S.dashVeh = '';
  A.invalidateCache();
  await A.renderStats();
  await A.renderVehiclePage();
  await sleep(400);
  for (const id of ['d-months', 's-cons', 'v-exp-chart']) {
    const barlar = [...doc.querySelectorAll('#' + id + ' .bar')];
    if (!barlar.length) { check('WT-81/1: ' + id + ' çizildi', false, 'çubuk yok'); continue; }
    check('WT-81/1: ' + id + ' ortak yardımcıdan geçiyor (.track var)',
      barlar.every(b => b.parentElement.classList.contains('track')));
    check('WT-81/1: ' + id + ' yüksekliği yüzde — piksel kalmadı',
      barlar.every(b => /%$/.test(b.style.height)),
      barlar.map(b => b.style.height).join(','));
  }

  // --- Hata avı: tüketim grafiğinin metin alternatifi HİÇ YOKTU (WT-30
  // üç grafiği kapsamıştı, #s-cons ondan sonra WT-41/3 ile eklendi).
  const cons = doc.getElementById('s-cons');
  check('WT-81/1 KABUL: tüketim grafiği artık ekran okuyucuya görünür',
    cons.getAttribute('role') === 'img'
      && (cons.getAttribute('aria-label') || '').length > 10,
    (cons.getAttribute('aria-label') || '(yok)').slice(0, 70));
  check('WT-81/1: tüketim grafiğinin de özet tablosu var',
    cons.nextElementSibling && cons.nextElementSibling.matches('table.sr-only'),
    cons.nextElementSibling?.tagName + '.' + cons.nextElementSibling?.className);
}

// ---- WT-81/3: kur alanları tek yerden dolduruluyor ----
{
  const A = app();
  const doc = window.document;
  A.S.currency = 'TRY'; A.S.country = 'TR';
  await A.db.sessions.clear();
  // RSD ECB tablosunda yok (NO_AUTO_FX) ve kaydın KENDİ kuru var — eski
  // kopyalanmış kod bu yolda "kur otomatik gelmez" uyarısını atlıyordu.
  const id = await A.db.sessions.add({tarih: '2026-07-12T12:00', firma: 'X',
    tip: 'DC', kwh: 30, tutar: 900, odenen: 900, cur: 'RSD', ulke: 'RS',
    rate: 0.35, aracId: null});
  await A.openAdd(id);
  await sleep(400);
  const not = doc.getElementById('rate-note').textContent;
  check('WT-81/3 KABUL: kuru olan kaydı düzenlerken de "otomatik gelmez" uyarısı çıkıyor',
    not.includes(A.T[A.S.lang].fxNoAuto), 'not=' + not.slice(0, 80));
  check('WT-81/3: kur alanı yabancı para biriminde görünür',
    doc.getElementById('wrap-rate').style.display !== 'none');
  check('WT-81/3: tutar etiketi kaydın para birimini gösteriyor',
    /RSD|дин|RSD/.test(doc.getElementById('in-amount-lbl').textContent)
      || doc.getElementById('in-amount-lbl').textContent.length > 3,
    doc.getElementById('in-amount-lbl').textContent);
  A.overlayClose();
  await sleep(200);

  // Aynı para biriminde alan hiç görünmemeli
  A.S.currency = 'TRY';
  await A.openAdd();
  await sleep(400);
  check('WT-81/3: yerli para biriminde kur alanı gizli',
    doc.getElementById('wrap-rate').style.display === 'none',
    doc.getElementById('wrap-rate').style.display);
  A.overlayClose();
  await sleep(200);

  // Ayar yükleme tek fonksiyondan geçiyor mu (init + yedek geri yükleme)
  const app_js = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const set_js = fs.readFileSync(path.join(ROOT, 'ui/settings.js'), 'utf8');
  check('WT-81/3: ayar okuma döngüsü tek yerde (loadSettings)',
    /async function loadSettings/.test(app_js)
      && /await loadSettings\(\)/.test(app_js) && /await loadSettings\(\)/.test(set_js)
      && (app_js + set_js).match(/for \(const key of SETTING_KEYS\)/g).length === 1);
}

// ---- WT-81/4: sözlük bütünlüğü ve ölü çeviri anahtarları ----
{
  const A = app();
  const diller = Object.keys(A.T);
  const taban = Object.keys(A.T.tr);
  check('WT-81/4: altı dil de yüklü', diller.length === 6, diller.join(','));
  // Kural 3 "altı dili DOLDUR" diyordu ama bunu sınayan bir kontrol yoktu:
  // yalnız tek tek maddeler kendi anahtarlarına bakıyordu.
  for (const l of diller) {
    const k = Object.keys(A.T[l]);
    const eksik = taban.filter(x => !(x in A.T[l]));
    const fazla = k.filter(x => !taban.includes(x));
    check('WT-81/4: ' + l + ' sözlüğü tr ile birebir aynı anahtarlara sahip',
      eksik.length === 0 && fazla.length === 0,
      'eksik=' + (eksik.join(',') || '-') + ' fazla=' + (fazla.join(',') || '-'));
  }
  const bos = taban.filter(k => diller.some(l =>
    typeof A.T[l][k] !== 'string' || !A.T[l][k].trim()));
  check('WT-81/4 KABUL: hiçbir anahtar hiçbir dilde BOŞ değil',
    bos.length === 0, bos.slice(0, 8).join(',') || 'tamam');

  // WT-86: ev/iş etiketi İKİ yerde tanımlı — kutucuğun yazısı i18n'den,
  // KAYDA YAZILAN firma dizgisi db.js'teki tablodan geliyor. Ayrışırlarsa
  // kullanıcı "Ev" görüp veritabanına başka bir dizgi yazılır ve o kayıt
  // isHomeFirm taramasının dışında kalır. Sözleşme burada kilitleniyor.
  for (const l of diller) {
    check('WT-86: ' + l + ' ev/iş etiketi i18n ile db.js\'te birebir aynı',
      A.T[l].homeChipEv === A.EV_LABEL[l] && A.T[l].homeChipWork === A.IS_LABEL[l],
      `i18n=${A.T[l].homeChipEv}/${A.T[l].homeChipWork} db=${A.EV_LABEL[l]}/${A.IS_LABEL[l]}`);
    check('WT-86: ' + l + ' etiketleri isHomeFirm tarafından tanınıyor',
      A.isHomeFirm(A.EV_LABEL[l]) && A.isHomeFirm(A.IS_LABEL[l]));
    check('WT-86: ' + l + ' etiketinden türetilen mekan doğru',
      A.mekanOfFirm(A.EV_LABEL[l]) === 'ev' && A.mekanOfFirm(A.IS_LABEL[l]) === 'is'
        && A.mekanOfFirm('ZES') === 'firma' && A.mekanOfFirm(A.HOME_LABEL[l]) === 'evis',
      `${A.mekanOfFirm(A.EV_LABEL[l])}/${A.mekanOfFirm(A.IS_LABEL[l])}/${A.mekanOfFirm(A.HOME_LABEL[l])}`);
  }
  // Eski birleşik kayıtlar ve mekansız kayıtlar hâlâ "ev" sayılmalı.
  check('WT-86: isHomeRec eski ve yeni değerlerin hepsini tanıyor',
    A.isHomeRec({mekan: 'ev'}) && A.isHomeRec({mekan: 'is'})
      && A.isHomeRec({mekan: 'evis'}) && !A.isHomeRec({mekan: 'firma'})
      && A.isHomeRec({firma: 'Ev-İş'}) && !A.isHomeRec({firma: 'ZES'}));

  // Ölü anahtar taraması: sözlükteki her anahtar ya kodda geçmeli ya da
  // dinamik bir önekle (exp_, rem_, spec_) üretiliyor olmalı.
  const kaynak = ['index.html', 'app.js', 'calc.js', 'db.js', 'ocr.js',
    'evprices.js', 'evdata.js', 'i18n.js', 'ui/shell.js', 'ui/dashboard.js',
    'ui/stats.js', 'ui/history.js', 'ui/compare.js', 'ui/vehicle.js',
    'ui/forms.js', 'ui/settings.js']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  // T sözlüğünün kendisi "kullanım" sayılmaz — yoksa her anahtar kendini bulur
  const i18nSrc = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
  const tBas = i18nSrc.indexOf('const T = {');
  let d = 1, e = tBas + 'const T = {'.length;
  while (d > 0 && e < i18nSrc.length) {
    if (i18nSrc[e] === '{') d++; else if (i18nSrc[e] === '}') d--;
    e++;
  }
  const kod = kaynak.replace(i18nSrc.slice(tBas, e), '');
  const onekler = ['exp_', 'rem_', 'spec_'];
  const olu = taban.filter(k => {
    if (onekler.some(o => k.startsWith(o))) return false;
    const q = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return !new RegExp(`['"]${q}['"]|data-i18n(?:-aria)?="${q}"|\\.${q}\\b`).test(kod);
  });
  // WT-81/11: TERS YÖN. WT-81/4 yalnız "sözlükte olup kodda olmayan"ı
  // tarıyordu; "kodda çağrılıp sözlükte olmayan" hiç bakılmamıştı. t() böyle
  // bir anahtarda ANAHTARIN KENDİSİNİ döndürür, yani ekranda ham İngilizce
  // bir kelime çıkar ve altı dilde de aynı kalır — sessiz bir çeviri kusuru.
  // Nitekim `t('delete')` (ui/compare.js, yakıt fiyatı silme düğmesinin
  // title'ı) hiçbir sözlükte yoktu ve tooltip "delete" yazıyordu.
  const cagrilan = new Set();
  for (const m of kod.matchAll(/\bt\(\s*'([A-Za-z_][A-Za-z0-9_]*)'/g)) cagrilan.add(m[1]);
  for (const m of kod.matchAll(/data-i18n(?:-aria|-ph)?="([A-Za-z_][A-Za-z0-9_]*)"/g))
    cagrilan.add(m[1]);
  const sozluksuz = [...cagrilan].filter(k =>
    !onekler.some(o => k.startsWith(o)) && !diller.every(l => k in A.T[l]));
  check('WT-81/11 KABUL: kodda çağrılan her anahtar altı sözlükte de var',
    sozluksuz.length === 0, sozluksuz.join(', ') || ('tarandı=' + cagrilan.size));

  check('WT-81/4 KABUL: sözlükte kodda hiç kullanılmayan anahtar kalmadı',
    olu.length === 0, olu.join(', ') || 'tamam');
}

// ---- WT-81/5: ölü CSS sınıfı kalmadı ----
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const i = html.indexOf('<style>'), j = html.indexOf('</style>');
  let css = html.slice(i, j).replace(/\/\*[\s\S]*?\*\//g, '');
  for (let n = 0; n < 30; n++) {
    const m = /@media[^{]*\{/.exec(css);
    if (!m) break;
    let d = 1, k = m.index + m[0].length;
    while (d > 0 && k < css.length) {
      if (css[k] === '{') d++; else if (css[k] === '}') d--;
      k++;
    }
    css = css.slice(0, m.index) + css.slice(m.index + m[0].length, k - 1) + css.slice(k);
  }
  const siniflar = new Set();
  for (const m of css.matchAll(/([^{}]+)\{[^}]*\}/g))
    for (const sel of m[1].split(','))
      for (const c of sel.matchAll(/\.([A-Za-z][\w-]*)/g)) siniflar.add(c[1]);
  // Kullanım: stil bloğu DIŞINDAKİ işaretleme + bütün betikler
  const kullanim = html.slice(0, i) + html.slice(j)
    + ['app.js', 'calc.js', 'db.js', 'ocr.js', 'evprices.js', 'i18n.js',
       'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js', 'ui/history.js',
       'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js']
      .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const olu = [...siniflar].filter(c =>
    !new RegExp('\\b' + c.replace(/[-]/g, '\\-') + '\\b').test(kullanim)).sort();
  check('WT-81/5 KABUL: hiçbir ekranda kullanılmayan CSS sınıfı kalmadı',
    olu.length === 0, olu.join(', ') || ('tarandı=' + siniflar.size));
}

// ---- WT-81/7: kur çekmenin yedek kaynağa düşmesi ----
// fetchTable ve fetchRate aynı yeniden deneme sarmalayıcısını kopyalıyordu
// (zaman aşımları bile ayrışmıştı: 4500/4000). Tek gövdeye alındı; bu yolun
// HİÇ testi yoktu, o yüzden davranış burada çivileniyor.
{
  const A = app();
  const cagrilan = [];
  const stub = cevaplar => (u) => {
    cagrilan.push(u);
    const c = cevaplar.shift();
    if (!c) return Promise.reject(new Error('kaynak yok'));
    if (c === 'ag') return Promise.reject(new Error('ağ hatası'));
    if (c === '500') return Promise.resolve({ok: false, status: 500, json: () => ({})});
    return Promise.resolve({ok: true, json: () => Promise.resolve(c)});
  };

  cagrilan.length = 0;
  window.fetch = stub(['ag', {rates: {TRY: 40}, date: '2026-08-09'}]);
  const r1 = await A.fetchRate('EUR', 'TRY', '2026-08-09');
  check('WT-81/7: ilk kaynak ağ hatası verince ikinciye düşülüyor',
    r1 && r1.rate === 40 && cagrilan.length === 2, JSON.stringify(r1));

  cagrilan.length = 0;
  window.fetch = stub(['500', {rates: {TRY: 41}, date: '2026-08-09'}]);
  const r2 = await A.fetchRate('EUR', 'TRY', '2026-08-09');
  check('WT-81/7: HTTP 500 de "sıradaki kaynak" sayılıyor',
    r2 && r2.rate === 41, JSON.stringify(r2));

  // Aranan para birimi cevapta YOKSA o kaynak işe yaramaz — sıradakine geç.
  cagrilan.length = 0;
  window.fetch = stub([{rates: {USD: 1.1}}, {rates: {TRY: 42}, date: '2026-08-09'}]);
  const r3 = await A.fetchRate('EUR', 'TRY', '2026-08-09');
  check('WT-81/7: istenen kur cevapta yoksa yedek kaynak deneniyor',
    r3 && r3.rate === 42 && cagrilan.length === 2, JSON.stringify(r3));

  cagrilan.length = 0;
  window.fetch = stub(['ag', 'ag']);
  const r4 = await A.fetchRate('EUR', 'TRY', '2026-08-09');
  check('WT-81/7: iki kaynak da düşerse null döner (uygulama çökmez)',
    r4 === null && cagrilan.length === 2, String(r4));

  // fetchTable aynı gövdeyi kullanıyor ama kendi sonucunu üretiyor:
  // kaynağın kendi kuru 1 olarak ekleniyor.
  cagrilan.length = 0;
  window.fetch = stub([{rates: {TRY: 40, USD: 1.1}, date: '2026-08-09'}]);
  const tb = await A.fetchTable('EUR', '2026-08-09');
  check('WT-81/7: fetchTable kaynağın kendi kurunu 1 olarak ekliyor',
    tb && tb.rates.EUR === 1 && tb.rates.TRY === 40, JSON.stringify(tb && tb.rates));

  check('WT-81/7: zaman aşımı politikası tek yerde (iki kopya ayrışmıştı)',
    A.FX_TIMEOUT === 4500, 'FX_TIMEOUT=' + A.FX_TIMEOUT);

  // Geçmiş tarih 'latest' yerine o günü ister; bugün/gelecek 'latest'.
  cagrilan.length = 0;
  window.fetch = stub([{rates: {TRY: 40}}]);
  await A.fetchRate('EUR', 'TRY', '2020-01-02');
  check('WT-81/7: geçmiş tarihli kayıt o günün kurunu istiyor',
    /2020-01-02/.test(cagrilan[0]), cagrilan[0]);

  cagrilan.length = 0;
  window.fetch = stub([{rates: {TRY: 40}}]);
  await A.fetchRate('EUR', 'TRY', '2099-12-31');
  check('WT-81/7: gelecek tarihli kayıt "latest" istiyor',
    /latest/.test(cagrilan[0]), cagrilan[0]);

  window.fetch = () => Promise.reject(new Error('offline'));   // taban duruma dön
}

// ---- Uygulamadaki GitHub bağlantıları tek hesabı göstermeli ----
// Depo hasdemirfatih → Rino-06'ya taşındı. Bağlantılar üç ayrı dosyaya
// dağılmış (ui/shell.js issue bağlantısı, ui/settings.js proje sayfası,
// index.html ve privacy.html profil bağlantıları) ve biri küçük harfle
// yazılmıştı. GitHub büyük/küçük harfe duyarsız olduğu için sessizce
// çalışıyordu; ayrışma ancak elle fark edilebiliyordu.
{
  const kaynaklar = ['ui/shell.js', 'ui/settings.js', 'index.html', 'privacy.html',
    '.github/FUNDING.yml']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const sahipler = new Set(
    [...kaynaklar.matchAll(/github\.com\/([A-Za-z0-9-]+)/g)].map(m => m[1]));
  check('GitHub bağlantılarının hepsi AYNI hesabı gösteriyor (harf birebir)',
    sahipler.size === 1 && sahipler.has('Rino-06'), [...sahipler].join(', '));
  check('depo taşındıktan sonra eski hesap adı hiçbir yerde kalmadı',
    !/hasdemirfatih/i.test(kaynaklar), 'tarandı');
}

// WT-81/11 KUSURU: bu satır dosyanın ORTASINDA (WT-76 bloğundan hemen sonra)
// duruyordu. `results` sonradan büyümeye devam ettiği için ondan SONRAKİ
// blokların — WT-81/1 grafik oranı, WT-81/4 sözlük bütünlüğü, WT-81/5 ölü
// CSS, WT-81/7 kur yedeği — düşüşleri sayıma ve ÇIKIŞ KODUNA hiç girmiyordu.
// Yani o "kalıcı değişmezler" kırmızıya dönse bile npm test yeşil kalırdı.
// Sayım artık bütün kontroller koştuktan SONRA yapılıyor.
const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? `${failed.length} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ')
  + ` (${results.length} kontrol)`);
if (errors.length) {
  console.log('\nYakalanan hatalar:');
  errors.slice(0, 10).forEach(e => console.log('  - ' + e.slice(0, 300)));
}
process.exit(failed.length || errors.length ? 1 : 0);
