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
const bundle = ['version.js', 'dexie.min.js', 'evdata.js', ...APP_FILES]
  .map(f => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8'))
  .join('\n;\n')
  // const/let bildirimleri window'a iliştirilmez; teste açmak için köprü kur
  + `\n;window.__app = {db, S, APP_VERSION, openAdd, showScreen, pf, fmtNum,
       fmtInput, checkNum, isValidDate, localISO, renderDashboard, scanBadData,
       isConv, amtB, renderStats, applyI18n, T, LANG_NAMES, CHARGERS,
       COUNTRIES, HOME_NAMES, PAN_EU, BANKS_BY, BANKS_DEFAULT, overlayClose,
       initSegments, evSummaryHTML, carSVG, seedDemoData, clearDemoData,
       syncEmptyStates, renderHistory, renderVehiclePage, backupPayload,
       offerDemoCleanup, allSessions, allVehicles, memo, renderCompare,
       invalidateCache, allExpenses, searchEV, openEvSpecs, EV_DB, EV_DB_TARIH,
       renderVehiclePage: renderVehiclePage};`;
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
  const wdYear = $('d-weekdays').textContent;

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
  check('WT-15: gün dağılımı da daraldı', wdYear !== $('d-weekdays').textContent);
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

  for (const [id, ad] of [['d-months', 'harcama grafiği'], ['d-weekdays', 'gün dağılımı'],
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
  check('WT-30: grafiklerin altında görsel gizli özet tablo var',
    tables.length >= 4, 'tablo=' + tables.length);
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
  check('WT-33: yerine auto-fit grid tanımlı',
    /#page-dashboard,#page-compare\{[^}]*display:grid[^}]*repeat\(auto-fit,minmax\(280px,1fr\)\)/
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

const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? `${failed.length} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ')
  + ` (${results.length} kontrol)`);
if (errors.length) {
  console.log('\nYakalanan hatalar:');
  errors.slice(0, 10).forEach(e => console.log('  - ' + e.slice(0, 300)));
}
process.exit(failed.length || errors.length ? 1 : 0);
