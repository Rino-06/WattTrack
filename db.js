/* ============================================================
   WattTrack — db
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Dexie şeması, migration'lar ve şema sabitleri ---- */
/* ============================================================
   WattTrack v5 — EV şarj harcama takibi
   Veriler yalnızca cihazda (IndexedDB / Dexie.js) saklanır.
   Tek dış bağlantı (opsiyonel): döviz kuru için frankfurter API.
   ============================================================ */

const db = new Dexie('watttrack');
db.version(1).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key'
});
// v2: araç giderleri (vergi, sigorta, bakım…) — sahip olma maliyeti için
db.version(2).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
});
// v3 (WT-16): şarj YERİ boyutu. DC/AC bir TEKNOLOJİ boyutu, "Ev" ise bir FİRMA
// değeriydi — aynı kayıt ana sayfadaki AC filtresine, donutta "Ev"e giriyordu.
// Artık teknoloji `tip`, yer `mekan` alanında: 'evis' | 'firma'.
// ("kamu"/"public" terimi kasıtlı olarak hiçbir yerde kullanılmıyor.)
const OLD_HOME_NAMES = ['Ev', 'Home', 'Zuhause', 'Maison', 'Casa'];
const HOME_LABEL = {tr: 'Ev-İş', en: 'Home/Work', de: 'Zuhause/Arbeit',
  fr: 'Domicile/Travail', es: 'Casa/Trabajo', it: 'Casa/Lavoro'};
// Ev-İş kimliği DİLE BAĞLI OLMAMALI. Kullanıcı kayıtları Türkçe girip sonra
// İngilizce'ye geçerse 'Ev-İş' değeri t('homeChip') ile eşleşmez ve kayıt
// sessizce "Şarj firması"na kayardı. Altı dilin yeni ve eski karşılıkları
// birlikte tanınır.
const HOME_NAMES = new Set([...Object.values(HOME_LABEL), ...OLD_HOME_NAMES]);
const isHomeFirm = f => HOME_NAMES.has(f);
db.version(3).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
}).upgrade(async tx => {
  // Eski "Ev" değeri kullanıcının o günkü diline göre saklanmıştı; altı
  // karşılığın hepsi tanınır. Yeni etiket kullanıcının mevcut dilinde yazılır.
  const langRow = await tx.table('settings').get('lang');
  const evis = HOME_LABEL[langRow?.value] || HOME_LABEL.tr;
  await tx.table('sessions').toCollection().modify(r => {
    if (OLD_HOME_NAMES.includes(r.firma)) { r.mekan = 'evis'; r.firma = evis; }
    else r.mekan = 'firma';
  });
});
// v4 (WT-19): kayıt bazlı kilometre sayacı değeri. Mevcut kayıtlara
// DOKUNULMAZ — odo'su olmayan kayıtların mesafeKm'si kullanıcının girdiğidir.
db.version(4).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan, odo',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
});
// WT-39/BÖLÜM 8: OCR'dan gelen isteğe bağlı alanlar. İNDEKS EKLENMEDİ —
// hiçbiri sorgulanmıyor, yalnız kayıtla birlikte saklanıyor:
//   soket ('CCS'|'Type2'|'CHAdeMO'|'Tesla') · istGuc (kW) · istasyonId
//   ekranGor (Blob) · ocrSablon (hangi düzenle okundu)
// upgrade GÖVDESİ BOŞ ve öyle kalmalı: mevcut kayıtların hiçbiri yeniden
// yazılmıyor, bu yüzden bu sürüm geçişi geri alınabilir (v3/v4'ün aksine).
db.version(5).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan, odo',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
}).upgrade(() => { /* yalnız isteğe bağlı alanlar eklendi, veri dokunulmadı */ });

// WT-43/1: yakıt fiyatı geçmişi. Tek güncel fiyatın tüm geçmişe uygulanması
// enflasyonun yüksek olduğu yerde kümülatif grafiği ve "toplam kazanç"
// rakamını tamamen yanlış yapıyordu.
// upgrade GÖVDESİ BOŞ: yalnız yeni tablo eklendi, mevcut veri dokunulmadı.
db.version(6).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan, odo',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId',
  fuelPrices: '++id, tarih, tur, ulke'
}).upgrade(() => { /* yeni tablo, mevcut kayıtlara dokunulmadı */ });


const EXP_TYPES = ['tax', 'insurance', 'maintenance', 'tire', 'inspection',
                   'repair', 'parking', 'equipment', 'other'];
const EXP_ICON = {tax: '🧾', insurance: '🛡️', maintenance: '🔧', tire: '🛞',
  inspection: '✅', repair: '🛠️', parking: '🅿️', equipment: '🔌', other: '📦'};

const AVATAR_COLORS = ['#1C8742', '#007DAA', '#C87B00', '#A54C8B', '#C25C5F'];
const MI = 1.60934;
// Sürüm bilgisi version.js'ten gelir (WT-52) — tek kaynak.
const APP_VERSION = WT_VERSION;
const APP_DATE = WT_DATE;
const SCHEMA_VERSION = WT_SCHEMA;

/* ---- WT-12: yazma hatası ve kota yönetimi ---- */
// ---------- WT-12: yazma hatası ve kota yönetimi ----------
// Dexie yazma çağrılarının hiçbiri try/catch içinde değildi. Kota dolarsa ya
// da tarayıcı özel modda IndexedDB'yi kısıtlarsa kullanıcı KAYITSIZ kaldığını
// fark etmiyordu — toast "Kaydedildi" diyor ama veri yazılmamış oluyordu.
// Dönüş: {ok:true, value} | {ok:false, err}
async function safeWrite(fn, errKey = 'saveFailed') {
  try {
    return {ok: true, value: await fn()};
  } catch (err) {
    const quota = err && (err.name === 'QuotaExceededError' ||
      err.inner?.name === 'QuotaExceededError' ||
      /quota/i.test(err.message || ''));
    toast(quota ? t('quotaFull') : t(errKey));
    console.error('[WattTrack] yazma hatası:', err);
    return {ok: false, err};
  }
}
async function saveSetting(key, value) {
  return (await safeWrite(() => db.settings.put({key, value}))).ok;
}
// Tarayıcıdan kalıcı depolama iste ve durumu Ayarlar'da göster (WT-12/4).
async function initStorage() {
  const el = $('storage-info');
  if (!navigator.storage) { if (el) el.textContent = '—'; return; }
  let persisted = false;
  try {
    persisted = await navigator.storage.persisted?.() || false;
    if (!persisted) persisted = await navigator.storage.persist?.() || false;
  } catch { /* desteklenmiyor */ }
  if (!el) return;
  let usage = '';
  try {
    const est = await navigator.storage.estimate?.();
    if (est?.usage) usage = ' · ' + fmtNum(est.usage / 1048576, 1) + ' MB';
  } catch { /* yok sayılır */ }
  el.textContent = t(persisted ? 'storagePersist' : 'storageBest') + usage;
}

/* ---- WT-49: bellek içi önbellek ---- */
// Sorun: her render, her sekme geçişi ve tema değişimi tabloların TAMAMINI
// IndexedDB'den yeniden okuyordu (openAdd() tek açılışta sessions'ı üç kez).
// Çözüm: tablo başına tek bir dizi tut, YAZMA olunca geçersiz kıl.
//
// Geçersiz kılma çağrı yerlerine bırakılmadı — bir yeri unutmak bayat ekran
// demek. Hem Table metotları sarmalanıyor (add/put/update/delete/bulk*/clear)
// hem de Dexie hook'ları bağlanıyor (Collection.delete()/modify() Table
// metodundan geçmiyor). İkisi birden her yazma yolunu kapatıyor.
const CACHED_TABLES = ['sessions', 'vehicles', 'expenses', 'fuelPrices'];
const _cache = {sessions: null, vehicles: null, expenses: null, fuelPrices: null};
let _cacheGen = 0;   // memoize edilen türetilmiş değerler bunu izler

function invalidateCache(tablo) {
  if (tablo) _cache[tablo] = null;
  else CACHED_TABLES.forEach(n => { _cache[n] = null; });
  _cacheGen++;
}
CACHED_TABLES.forEach(n => {
  ['add', 'put', 'update', 'delete', 'bulkAdd', 'bulkPut', 'bulkDelete', 'clear']
    .forEach(m => {
      const orj = db[n][m].bind(db[n]);
      db[n][m] = (...a) => { invalidateCache(n); return orj(...a); };
    });
  ['creating', 'updating', 'deleting'].forEach(ev =>
    db[n].hook(ev, () => { invalidateCache(n); }));
});

// Çağıranlar diziyi yerinde sıralayabiliyor (sort), bu yüzden sığ kopya
// dönüyor: IndexedDB gidiş-dönüşü kalkıyor ama önbellek bozulmuyor.
async function _all(n) {
  if (!_cache[n]) _cache[n] = await db[n].toArray();
  return [..._cache[n]];
}
const allSessions = () => _all('sessions');
const allVehicles = () => _all('vehicles');
const allExpenses = () => _all('expenses');
const allFuelPrices = () => _all('fuelPrices');   // WT-43

// WT-49/4: ağır türetilmiş değerler için memoize. Önbellek geçersiz kılınınca
// (yani herhangi bir yazmada) otomatik olarak düşer.
const _memo = new Map();
function memo(key, fn) {
  const cur = _memo.get(key);
  if (cur && cur.gen === _cacheGen) return cur.val;
  const val = fn();
  _memo.set(key, {gen: _cacheGen, val});
  return val;
}
