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

// Dört dosya tarayıcıda AYNI global kapsamı paylaşıyor; ayrı ayrı eval
// edilirse const/let bildirimleri birbirini görmez. Tek eval'de birleştir.
const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'app.js']
  .map(f => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8'))
  .join('\n;\n')
  // const/let bildirimleri window'a iliştirilmez; teste açmak için köprü kur
  + `\n;window.__app = {db, S, APP_VERSION, openAdd, showScreen, pf, fmtNum,
       fmtInput, checkNum, isValidDate, localISO, renderDashboard, scanBadData,
       isConv, amtB, renderStats, applyI18n, T, LANG_NAMES, CHARGERS,
       COUNTRIES, HOME_NAMES, PAN_EU, BANKS_BY, BANKS_DEFAULT, overlayClose,
       initSegments};`;
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
  check('WT-14: kasıtlı tüm-zamanlar olan yıllık blok da rozetli',
    $('d-yr-scope').textContent.trim() !== '',
    'rozet=' + JSON.stringify($('d-yr-scope').textContent));
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
  check('WT-23/3: alt başlıklar <h2>', doc.querySelectorAll('h2.h2').length === 18,
    'h2 sayısı=' + doc.querySelectorAll('h2.h2').length);
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

const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? `${failed.length} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ')
  + ` (${results.length} kontrol)`);
if (errors.length) {
  console.log('\nYakalanan hatalar:');
  errors.slice(0, 10).forEach(e => console.log('  - ' + e.slice(0, 300)));
}
process.exit(failed.length || errors.length ? 1 : 0);
