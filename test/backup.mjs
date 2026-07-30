/* Faz 1B doğrulaması — WT-06/07/08/09 birbirine bağlı, topluca test edilir.
   Senaryo: yedek al → verileri sıfırla → geri yükle, ve araç silme akışları.
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
    // location.reload() jsdom'da yok; gerçek bir uygulama hatası değil
    if (/Not implemented: navigation/.test(e.message || '')) return;   // location.reload()
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
  // WT-37: jsdom'da HTMLMediaElement.play() yok; splash yedek yolu koşsun
  window.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('autoplay blocked (test)'));

  const bundle = ['version.js', 'dexie.min.js', 'evdata.js', 'db.js', 'calc.js', 'i18n.js', 'ocr.js', 'ui/shell.js', 'ui/dashboard.js', 'ui/stats.js', 'ui/history.js', 'ui/compare.js', 'ui/vehicle.js', 'ui/forms.js', 'ui/settings.js', 'app.js']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
    + `\n;window.__app = {db, S, applyI18n, applyTheme, importBackupText,
         deleteVehicleFlow, moveRecordsFlow, scanOrphans, warnings,
         SETTING_KEYS, saveSetting, renderVehiclePage, openExpense,
         migrateExpenseVehicles, renderCompare};`;
  window.eval(bundle);
  await new Promise(r => setTimeout(r, 1200));
  return window;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------- A cihazı: iki araçlı veri kur, yedek al ----------------
let w = await boot();
let A = w.__app;

const v1 = await A.db.vehicles.add({ ad: 'Kia EV6', batt: 77 });
const v2 = await A.db.vehicles.add({ ad: 'BMW i4', batt: 84 });
await A.db.sessions.bulkAdd([
  { tarih: '2026-03-01T12:00', firma: 'ZES', tip: 'DC', kwh: 40, tutar: 400, odenen: 400, aracId: v1, cur: 'TRY' },
  { tarih: '2026-03-05T12:00', firma: 'Eşarj', tip: 'AC', kwh: 20, tutar: 180, odenen: 180, aracId: v1, cur: 'TRY' },
  { tarih: '2026-03-09T12:00', firma: 'Trugo', tip: 'DC', kwh: 55, tutar: 610, odenen: 610, aracId: v2, cur: 'TRY' }
]);
await A.db.expenses.bulkAdd([
  { tarih: '2026-01-10', tur: 'tax', tutar: 3000, cur: 'TRY', aracId: v1 },
  { tarih: '2026-02-10', tur: 'insurance', tutar: 12000, cur: 'TRY', aracId: v2 }
]);
// ayarları değiştir: dil EN, para birimi EUR
A.S.lang = 'en'; A.S.currency = 'EUR'; A.S.defaultVehicleId = v2;
await A.saveSetting('lang', 'en');
await A.saveSetting('currency', 'EUR');
await A.saveSetting('defaultVehicleId', v2);
await A.saveSetting('onboarded', true);

const backup = JSON.stringify({
  app: 'WattTrack', version: 8, exportedAt: new Date().toISOString(),
  sessions: await A.db.sessions.toArray(),
  vehicles: await A.db.vehicles.toArray(),
  expenses: await A.db.expenses.toArray(),
  settings: await A.db.settings.toArray()
});
check('yedek alındı (2 araç, 3 kayıt, 2 gider, ayarlar)',
  JSON.parse(backup).vehicles.length === 2 && JSON.parse(backup).settings.length >= 4);

// ---------------- WT-06: Verileri Sıfırla giderleri de silsin ----------------
w.confirm = () => true;
w.document.getElementById('btn-wipe').click();
await sleep(400);
check('WT-06: sıfırlama sonrası gider kalmadı',
  (await A.db.expenses.count()) === 0, 'kalan gider: ' + (await A.db.expenses.count()));
check('WT-06: sıfırlama sonrası kayıt kalmadı', (await A.db.sessions.count()) === 0);

// ---------------- B cihazı: zaten 1 araç var, yedeği geri yükle ----------------
w = await boot();
const B = w.__app;
// Cihazda ZATEN bir araç var — aynı isimli, ama farklı id alacak
await B.db.vehicles.add({ ad: 'Zoe', batt: 52 });
const existing = await B.db.vehicles.add({ ad: 'BMW i4', batt: 84 });

w.confirm = () => true;    // hem import onayı hem "ayarlar da geri yüklensin mi"
w.alert = () => {};
await B.importBackupText(backup);
await sleep(500);

const bVeh = await B.db.vehicles.toArray();
const bSess = await B.db.sessions.toArray();
const bExp = await B.db.expenses.toArray();
const byName = n => bVeh.find(v => v.ad === n);

check('WT-08: araçlar ada göre eşleşti, mükerrer eklenmedi',
  bVeh.length === 3, 'araç sayısı: ' + bVeh.length + ' (' + bVeh.map(v => v.ad).join(', ') + ')');
check('WT-08: mevcut BMW i4 yeniden kullanıldı (yeni id alınmadı)',
  byName('BMW i4').id === existing, `id=${byName('BMW i4').id} beklenen=${existing}`);
check('WT-08: EV6 kayıtları doğru araca bağlandı',
  bSess.filter(r => r.aracId === byName('Kia EV6').id).length === 2,
  'EV6 kayıt sayısı: ' + bSess.filter(r => r.aracId === byName('Kia EV6').id).length);
check('WT-08: i4 kaydı MEVCUT i4 aracına bağlandı',
  bSess.filter(r => r.aracId === existing).length === 1);
check('WT-08: hiçbir kayıt ölü referans taşımıyor',
  bSess.every(r => r.aracId == null || bVeh.some(v => v.id === r.aracId)));
check('WT-08: giderler de doğru araçlara bağlandı',
  bExp.length === 2 &&
  bExp.some(e => e.aracId === byName('Kia EV6').id) &&
  bExp.some(e => e.aracId === existing),
  'gider aracId: ' + bExp.map(e => e.aracId).join(','));
check('WT-07: dil ayarı geri geldi (en)', B.S.lang === 'en', 'lang=' + B.S.lang);
check('WT-07: para birimi geri geldi (EUR)', B.S.currency === 'EUR', 'currency=' + B.S.currency);
check('WT-07: defaultVehicleId idMap ile çevrildi',
  B.S.defaultVehicleId === existing, `default=${B.S.defaultVehicleId} beklenen=${existing}`);

// ---------------- WT-09/A: üç seçenekli silme ----------------
const ev6 = byName('Kia EV6').id;

// (1) "Kayıtları da sil"
w.confirm = () => true;
const dlgPick = val => {
  // choiceDialog DOM'a basılıyor; ilgili butona programatik tıkla
  setTimeout(() => {
    const back = w.document.querySelector('.dlg-back');
    if (!back) return;
    const btns = [...back.querySelectorAll('.dlg-opt')];
    const b = btns.find(x => x.textContent === val);
    (b || back.querySelector('.dlg-cancel')).click();
  }, 30);
};
dlgPick('Delete the records too');
const ok1 = await B.deleteVehicleFlow(ev6);
await sleep(200);
check('WT-09: "Kayıtları da sil" seçildi ve uygulandı', ok1 === true);
check('WT-09: aracın şarj kayıtları silindi',
  (await B.db.sessions.where('aracId').equals(ev6).count()) === 0);
check('WT-09: aracın GİDERLERİ de silindi',
  (await B.db.expenses.where('aracId').equals(ev6).count()) === 0);
check('WT-09: araç silindi', (await B.db.vehicles.get(ev6)) === undefined);

// (2) "Kayıtları koru, arşivle"
dlgPick('Keep the records, archive the vehicle');
await B.deleteVehicleFlow(existing);
await sleep(200);
check('WT-09: "arşivle" seçeneği aracı arşivledi',
  (await B.db.vehicles.get(existing))?.archived === true);
check('WT-09: arşivlenen aracın kayıtları duruyor',
  (await B.db.sessions.where('aracId').equals(existing).count()) === 1);

// ---------------- WT-09/B: toplu kayıt taşıma + geri al ----------------
// Kabul kriteri: "İki araç arasında toplu taşıma yap → tüm kayıtlar hedefte
// olmalı, geri alınabilmeli."
{
  await B.db.vehicles.update(existing, { archived: false });
  const src = await B.db.vehicles.add({ ad: 'Taşıma Kaynak', batt: 60 });
  const dst = await B.db.vehicles.add({ ad: 'Taşıma Hedef', batt: 70 });
  await B.db.sessions.bulkAdd([
    { tarih: '2026-05-01T12:00', firma: 'ZES', tip: 'DC', kwh: 30, tutar: 300, odenen: 300, aracId: src, cur: 'TRY' },
    { tarih: '2026-05-08T12:00', firma: 'ZES', tip: 'DC', kwh: 35, tutar: 350, odenen: 350, aracId: src, cur: 'TRY' }
  ]);
  await B.db.expenses.add({ tarih: '2026-05-03', tur: 'tire', tutar: 8000, cur: 'TRY', aracId: src });

  // diyalog açılınca hedefi seç ve onay butonuna bas
  setTimeout(() => {
    const back = w.document.querySelector('.dlg-back');
    if (!back) return;
    const to = back.querySelector('#mv-to');
    to.value = String(dst);
    to.dispatchEvent(new w.Event('change', { bubbles: true }));
    setTimeout(() => back.querySelector('.dlg-opt').click(), 40);
  }, 40);

  const moved = await B.moveRecordsFlow(src);
  await sleep(300);
  check('WT-09/B: taşıma tamamlandı', moved === true);
  check('WT-09/B KABUL: tüm şarj kayıtları hedefte',
    (await B.db.sessions.where('aracId').equals(dst).count()) === 2 &&
    (await B.db.sessions.where('aracId').equals(src).count()) === 0,
    `hedef=${await B.db.sessions.where('aracId').equals(dst).count()} kaynak=${await B.db.sessions.where('aracId').equals(src).count()}`);
  check('WT-09/B: gider de taşındı',
    (await B.db.expenses.where('aracId').equals(dst).count()) === 1);

  // "Geri al" butonu toast'ta duruyor mu, çalışıyor mu?
  const undoBtn = w.document.querySelector('#toast .toast-undo');
  check('WT-09/B: toast\'ta "Geri al" butonu var', !!undoBtn,
    'toast: ' + w.document.getElementById('toast').textContent);
  if (undoBtn) {
    undoBtn.click();
    await sleep(350);
    check('WT-09/B KABUL: geri alma kayıtları kaynağa döndürdü',
      (await B.db.sessions.where('aracId').equals(src).count()) === 2 &&
      (await B.db.sessions.where('aracId').equals(dst).count()) === 0,
      `kaynak=${await B.db.sessions.where('aracId').equals(src).count()} hedef=${await B.db.sessions.where('aracId').equals(dst).count()}`);
    check('WT-09/B: geri alma gideri de döndürdü',
      (await B.db.expenses.where('aracId').equals(src).count()) === 1);
  }
}

// ---------------- WT-09/C: öksüz kayıt tespiti ----------------
await B.db.sessions.add({ tarih: '2026-04-01T12:00', firma: 'ZES', tip: 'DC',
  kwh: 10, tutar: 100, odenen: 100, aracId: 9999, cur: 'TRY' });
await B.scanOrphans();
await sleep(150);
check('WT-09/C: öksüz kayıt uyarısı oluştu', B.warnings.has('orphan'),
  'uyarı: ' + (B.warnings.get('orphan')?.msg || 'yok'));
const strip = w.document.querySelector('#d-warnings .warn-strip');
check('WT-09/C: uyarı şeridi ekrana basıldı', !!strip,
  strip ? strip.querySelector('.msg').textContent : '');

// ---------------- iptal yolu ----------------
// Vazgeç yolu: KAYDI OLAN bir araçta diyalog çıkar (kaydı olmayanda
// diyalog yerine düz confirm() gelir, o ayrı bir yol).
dlgPick('__yok__');   // hiçbir seçenekle eşleşmez → Vazgeç butonuna basılır
{
  const beforeV = await B.db.vehicles.count();
  const beforeS = await B.db.sessions.count();
  const res = await B.deleteVehicleFlow(existing);   // arşivde ama 1 kaydı var
  await sleep(150);
  check('WT-09: Vazgeç hiçbir şeyi değiştirmiyor',
    res === false && (await B.db.vehicles.count()) === beforeV
      && (await B.db.sessions.count()) === beforeS,
    `res=${res} araç=${await B.db.vehicles.count()}/${beforeV}`);
}

// ---------------- WT-18: gider araç zorunluluğu ----------------
{
  await B.db.expenses.clear();
  await B.db.vehicles.clear();
  await B.db.sessions.clear();
  const only = await B.db.vehicles.add({ ad: 'Tek Araç', batt: 60 });
  B.S.defaultVehicleId = only;

  // TEK araçlı kullanıcı: seçici gizli kalır ama aracId OTOMATİK atanmalı
  await B.openExpense();
  await sleep(200);
  const sel = w.document.getElementById('in-exp-veh');
  check('WT-18/2: "Tüm araçlar" seçeneği FORMDAN kaldırıldı',
    ![...sel.options].some(o => o.value === ''),
    'seçenekler: ' + [...sel.options].map(o => `${o.value}:${o.textContent}`).join(' | '));
  check('WT-18/1: tek araçta seçici gizli', w.document.getElementById('wrap-exp-veh').style.display === 'none');
  check('WT-18/1: tek araçta id otomatik seçili', sel.value === String(only), 'value=' + sel.value);

  w.document.getElementById('in-exp-date').value = '2026-06-01';
  w.document.getElementById('in-exp-amount').value = '3000';
  w.document.getElementById('btn-save-exp').click();
  await sleep(400);
  const saved = await B.db.expenses.toArray();
  check('WT-18 KABUL: tek araçla gider eklendi ve aracId DOLU',
    saved.length === 1 && saved[0].aracId === only,
    'aracId=' + (saved[0] && saved[0].aracId));

  // migration: elle null aracId'li gider bırak, açılış taramasını çalıştır
  await B.db.expenses.add({ tarih: '2026-01-01', tur: 'tax', tutar: 500, cur: 'TRY', aracId: null });
  await B.migrateExpenseVehicles();
  await sleep(250);
  check('WT-18/3: aracId null olan eski gider varsayılan araca atandı',
    (await B.db.expenses.toArray()).every(e => e.aracId != null),
    'null kalan: ' + (await B.db.expenses.toArray()).filter(e => e.aracId == null).length);

  // iki araç + bir gider -> gider TEK sayılmalı (eskiden her araca sayılıyordu)
  const second = await B.db.vehicles.add({ ad: 'İkinci Araç', batt: 70 });
  const exps = await B.db.expenses.toArray();
  const forOnly = exps.filter(e => e.aracId === only).length;
  const forSecond = exps.filter(e => e.aracId === second).length;
  check('WT-18 KABUL: iki araç + giderler -> her gider tek araca ait',
    forOnly === exps.length && forSecond === 0,
    `tek=${forOnly} ikinci=${forSecond} toplam=${exps.length}`);

  // hiç araç yokken gider formu açılmamalı
  await B.db.vehicles.clear();
  let toasted = '';
  const toastEl = w.document.getElementById('toast');
  await B.openExpense();
  await sleep(200);
  toasted = toastEl.textContent;
  check('WT-18: hiç araç yokken gider formu açılmıyor',
    !w.document.getElementById('page-expense').classList.contains('active') && toasted !== '',
    'toast=' + toasted);
}

const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? `${failed.length} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ')
  + ` (${results.length} kontrol)`);
if (errors.length) {
  console.log('\nKonsol hataları:');
  errors.slice(0, 8).forEach(e => console.log('  - ' + e.slice(0, 250)));
}
process.exit(failed.length || errors.length ? 1 : 0);
