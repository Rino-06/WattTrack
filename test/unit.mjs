/* WT-51 · Kritik saf fonksiyonlar için birim testi.
   node:test kullanıyor — derleme yok, ek bağımlılık yok.

   Neden ayrı bir koşum: diğer beş dosya jsdom + fake-indexeddb ile uygulamayı
   AÇIYOR (davranış testi). Burada calc.js ve ui/dashboard.js'in saf
   fonksiyonları küçük bir vm bağlamında, tarayıcı olmadan sınanıyor —
   milisaniyeler sürüyor ve sınır durumlarını taramak ucuz.

   Beklentiler koddan DEĞİL şartnameden yazıldı (WT-02'nin sayı kuralı,
   WT-19'un sayaç kuralı). Kod kuralı karşılamıyorsa test kalır, kod düzelir. */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = new URL('..', import.meta.url).pathname;

// --- calc.js ve ui/dashboard.js'i minimum bir bağlamda çalıştır ---
// DOM'a yalnız dinleyici bağlamak için dokunuluyor; saf fonksiyonlar
// kullanmıyor.
const sahteEl = () => ({
  addEventListener() {}, querySelectorAll: () => [], querySelector: () => null,
  classList: {toggle() {}, add() {}, remove() {}, contains: () => false},
  style: {}, dataset: {}, textContent: '', innerHTML: '', value: ''
});
const sandbox = {
  document: {
    getElementById: sahteEl, querySelector: sahteEl, querySelectorAll: () => [],
    addEventListener() {}, createElement: sahteEl
  },
  window: {matchMedia: () => ({matches: false})},
  navigator: {},
  console,
  // calc.js'in ihtiyaç duyduğu dış bağımlılıklar
  t: k => k,
  toast() {},
  db: {},
  CURRENCY_SYMBOLS: {TRY: '₺', EUR: '€', USD: '$'},
  MI: 1.60934,
  setTimeout, clearTimeout
};
vm.createContext(sandbox);
// const/let bildirimleri sandbox nesnesine iliştirilmiyor (tarayıcıdaki
// window ile aynı durum) — köprüyü açıkça kur.
const KOPRU = ['pf', 'fmtNum', 'fmtInput', 'savingsOf', 'netFromGross', 'convOf',
  'amtB', 'savB', 'expB', 'isConv', 'periodFilter', 'prevPeriodFilter', 'inPeriod',
  'odoDistOf', 'S', 'localISO', 'localMonth', 'monthKey', 'esc', 'checkNum'];
const kaynak = ['calc.js', 'ui/dashboard.js']
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + `\n;Object.assign(globalThis, {${KOPRU.join(', ')}});`;
vm.runInContext(kaynak, sandbox, {filename: 'calc+dashboard'});

const {pf, fmtNum, savingsOf, netFromGross, convOf, amtB, savB, expB,
       periodFilter, prevPeriodFilter, odoDistOf, S, localISO, monthKey} = sandbox;

const iso = d => localISO(d);
const gunOnce = n => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
const kayit = (tarih, ek = {}) => ({tarih: tarih + 'T12:00', odenen: 100, kwh: 10,
  firma: 'ZES', cur: 'TRY', ...ek});

// ============================================================
// WT-02 · pf() — şartnamedeki örneklerin TAMAMI
// ============================================================
test('pf: WT-02 şartnamesindeki örnekler', () => {
  assert.equal(pf('43,57'), 43.57);
  assert.equal(pf('43.57'), 43.57, 'nokta girildiğinde de ondalık kabul edilir');
  assert.equal(pf('1.234,56'), 1234.56, 'nokta binlik, virgül ondalık');
  assert.equal(pf('1,234.56'), 1234.56, 'virgül binlik, nokta ondalık');
  assert.equal(pf('43,5'), 43.5);
  assert.equal(pf('43,579'), 43.58, '2 basamağa yuvarlanır');
  assert.equal(pf(' 503,56 ₺'), 503.56, 'boşluk ve para simgesi atılır');
});

test('pf: sınır durumları', () => {
  assert.ok(Number.isNaN(pf(null)));
  assert.ok(Number.isNaN(pf(undefined)));
  assert.ok(Number.isNaN(pf('')));
  assert.ok(Number.isNaN(pf('   ')));
  assert.ok(Number.isNaN(pf('abc')));
  assert.ok(Number.isNaN(pf('₺')), 'yalnız para simgesi sayı değildir');
  assert.equal(pf('-12,5'), -12.5);
  assert.equal(pf('0'), 0);
  assert.equal(pf('1.234.567,89'), 1234567.89, 'iki binlik ayracı');
  assert.equal(pf(42), 42, 'sayı da kabul edilir');
  assert.equal(pf('45,827', 3), 45.827, 'dec parametresi basamağı değiştirir');
});

// ============================================================
// WT-02 · fmtNum() — gösterim kuralı (virgül ondalık, nokta binlik)
// ============================================================
test('fmtNum: WT-02 gösterim kuralı', () => {
  assert.equal(fmtNum(1234.5, 2), '1.234,50', 'WT-02 kabul kriteri');
  assert.equal(fmtNum(1234.56, 0), '1.235');
  assert.equal(fmtNum(0, 0), '0');
  assert.equal(fmtNum(0, 2), '0,00');
  assert.equal(fmtNum(-1234.56, 2), '−1.234,56', 'eksi işareti U+2212');
  assert.equal(fmtNum(1234567, 0), '1.234.567');
  assert.equal(fmtNum(999, 0), '999', 'dört basamaktan azına binlik ayracı yok');
});

test('fmtNum: veri yokken tire döner', () => {
  assert.equal(fmtNum(null), '—');
  assert.equal(fmtNum(undefined), '—');
  assert.equal(fmtNum(NaN), '—');
});

test('pf ile fmtNum gidiş-dönüşü kuralı koruyor', () => {
  for (const g of ['1234.5', '1.234,5', '0,05', '99999,99'])
    assert.equal(pf(fmtNum(pf(g), 2)), pf(g), 'girdi: ' + g);
});

// ============================================================
// İNDİRİM: savingsOf / netFromGross
// ============================================================
test('savingsOf: ücretsiz şarjda indirim sıfırdır', () => {
  assert.equal(savingsOf({free: true, indirim: 50}), 0);
});

test('savingsOf: %100 indirim sonsuza gitmiyor', () => {
  assert.equal(savingsOf({indirimTip: 'percent', indirimDeger: 100, odenen: 80}), 0);
  assert.equal(savingsOf({indirimTip: 'percent', indirimDeger: 150, odenen: 80}), 0);
});

test('savingsOf: yüzde indirim ödenenden brüte doğru çözülür', () => {
  // %20 indirimde ödenen 80 ise liste 100'dü → kazanç 20
  assert.equal(Math.round(savingsOf({indirimTip: 'percent', indirimDeger: 20, odenen: 80})), 20);
});

test('savingsOf: kayıtlı indirim alanı her şeyin önündedir', () => {
  assert.equal(savingsOf({indirim: 12.5, indirimTip: 'percent', indirimDeger: 90, odenen: 10}), 12.5);
  assert.equal(savingsOf({indirim: 'bozuk'}), 0, 'sayı olmayan indirim 0 sayılır');
});

test('netFromGross: sınırlar', () => {
  assert.equal(netFromGross(100, 'percent', 20), 80);
  assert.equal(netFromGross(100, 'amount', 20), 80);
  assert.equal(netFromGross(100, 'percent', 0), 100, 'indirim yoksa brüt döner');
  assert.equal(netFromGross(100, 'amount', 500), 0, 'net negatife düşmez');
  assert.equal(netFromGross(100, 'percent', 150), 0, 'yüzde 100 ile sınırlı');
});

// ============================================================
// KUR: convOf / amtB / savB / expB
// ============================================================
test('convOf: aynı para biriminde katsayı 1', () => {
  S.currency = 'TRY';
  assert.equal(convOf({cur: 'TRY'}), 1);
  assert.equal(convOf({}), 1, 'para birimi yazılmamış kayıt yereldir');
});

test('convOf: çevrilemeyen kayıt null döner (WT-10 — sessizce 0 sayılmaz)', () => {
  S.currency = 'TRY';
  assert.equal(convOf({cur: 'EUR'}), null);
  assert.equal(amtB({cur: 'EUR', odenen: 100}), 0, 'toplamlara katılmaz');
});

test('convOf: fxTable kur alanının önündedir', () => {
  S.currency = 'TRY';
  assert.equal(convOf({cur: 'EUR', fxTable: {TRY: 40}, rate: 35}), 40);
  assert.equal(convOf({cur: 'EUR', rate: 35}), 35);
});

test('amtB / savB / expB temel para biriminde hesaplar', () => {
  S.currency = 'TRY';
  const r = {cur: 'EUR', rate: 40, odenen: 10, indirim: 2};
  assert.equal(amtB(r), 400);
  assert.equal(savB(r), 80);
  assert.equal(expB({cur: 'EUR', rate: 40, tutar: 5}), 200);
  assert.equal(amtB({cur: 'TRY'}), 0, 'ödenen yoksa 0');
});

test('negatif tutar olduğu gibi taşınır (veri bozukluğu gizlenmez)', () => {
  S.currency = 'TRY';
  assert.equal(amtB({cur: 'TRY', odenen: -50}), -50);
});

// ============================================================
// DÖNEM FİLTRELERİ
// ============================================================
test('periodFilter: hafta son 7 günü kapsar', () => {
  S.period = 'week';
  const list = [kayit(gunOnce(0)), kayit(gunOnce(6)), kayit(gunOnce(7)), kayit(gunOnce(40))];
  assert.equal(periodFilter(list).length, 2, 'bugün ve 6 gün öncesi içeride');
});

test('periodFilter: ay ve yıl', () => {
  const bugun = iso(new Date());
  S.period = 'month';
  assert.equal(periodFilter([kayit(bugun)]).length, 1);
  S.period = 'year';
  assert.equal(periodFilter([kayit(bugun), kayit('2001-05-05')]).length, 1);
});

test('prevPeriodFilter: önceki yıl doğru seçiliyor', () => {
  S.period = 'year';
  const gecenYil = String(new Date().getFullYear() - 1) + '-06-15';
  const res = prevPeriodFilter([kayit(gecenYil), kayit(iso(new Date()))]);
  assert.equal(res.length, 1);
  assert.ok(res[0].tarih.startsWith(String(new Date().getFullYear() - 1)));
});

test('WT-01 regresyonu: tarih anahtarları yerel saate göre üretiliyor', () => {
  // Gece yarısından hemen sonraki yerel an, UTC\'de bir önceki güne düşebilir.
  const d = new Date(2026, 0, 1, 0, 30);
  assert.equal(localISO(d), '2026-01-01');
  assert.equal(monthKey(localISO(d)), '2026-01');
  // artık yıl
  assert.equal(localISO(new Date(2024, 1, 29, 23, 59)), '2024-02-29');
});

// ============================================================
// WT-19 · odometre
// ============================================================
test('odoDistOf: eksik ya da geriye gitmiş sayaç 0 döner', () => {
  assert.equal(odoDistOf(null), 0);
  assert.equal(odoDistOf({kmNow: 5000}), 0, 'başlangıç yoksa mesafe bilinmez');
  assert.equal(odoDistOf({kmStart: 10000, kmNow: 9000}), 0, 'sayaç geriye gitmiş');
  assert.equal(odoDistOf({kmStart: 10000, kmNow: 10000}), 0);
  assert.equal(odoDistOf({kmStart: 10000, kmNow: 14200}), 4200);
});

// ============================================================
// HENÜZ YAZILMAMIŞ FONKSİYONLAR
// ============================================================
// WT-51 metni ocrSayi ve fiyatBul'u da sayıyor. İkisi de bu maddeden SONRA
// gelen maddelerde doğuyor (ocrSayi -> WT-39, fiyatBul -> WT-43); çalışma
// sırası dosyası da "WT-39'un OCR testleri buraya oturacak" diyor.
// O maddeler yazıldığında testleri bu dosyaya eklenecek.
test('ocrSayi ve fiyatBul henüz yok (WT-39 / WT-43 ile gelecek)', () => {
  assert.equal(sandbox.ocrSayi, undefined);
  assert.equal(sandbox.fiyatBul, undefined);
});
