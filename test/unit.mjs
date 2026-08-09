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
  // WT-81/2: sonAylar() ay adını i18n.js'ten okuyor; burada yalnız kırpma
  // davranışı sınandığı için üç harften uzun sahte adlar yeterli.
  MONTHS: {tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']},
  setTimeout, clearTimeout
};
vm.createContext(sandbox);
// const/let bildirimleri sandbox nesnesine iliştirilmiyor (tarayıcıdaki
// window ile aynı durum) — köprüyü açıkça kur.
const KOPRU = ['pf', 'fmtNum', 'fmtInput', 'savingsOf', 'netFromGross', 'convOf',
  'amtB', 'savB', 'expB', 'isConv', 'periodFilter', 'prevPeriodFilter', 'inPeriod',
  'odoDistOf', 'S', 'localISO', 'localMonth', 'monthKey', 'esc', 'checkNum',
  'kayipHesapla', 'KAYIP_UYARI', 'fiyatBul', 'fiyatGoster', 'fiyatMetrik',
  'tuketimGoster', 'tuketimMetrik', 'sonAylar', 'sonYillar',
  'cons100', 'consUnit', 'tuketimOrt', 'distDisp', 'distFactor'];
const kaynak = ['calc.js', 'ui/dashboard.js']
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + `\n;Object.assign(globalThis, {${KOPRU.join(', ')}});`;
vm.runInContext(kaynak, sandbox, {filename: 'calc+dashboard'});

const {pf, fmtNum, savingsOf, netFromGross, convOf, amtB, savB, expB,
       periodFilter, prevPeriodFilter, odoDistOf, S, localISO, monthKey,
       sonAylar, sonYillar, cons100, consUnit, tuketimOrt} = sandbox;

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
// ============================================================
// WT-42 · şarj kaybı
// ============================================================
const {kayipHesapla, KAYIP_UYARI} = sandbox;

test('WT-42: beklenen kWh = batarya × SoC farkı / 100', () => {
  // 60 kWh batarya, %20 -> %90 = %70 -> beklenen 42 kWh
  const k = kayipHesapla({socB: 20, socA: 90, kwh: 45.5}, {batt: 60});
  assert.equal(k.beklenen, 42);
  assert.equal(k.faturalanan, 45.5);
  assert.equal(k.pct, 8.3, '(45,5-42)/42 = %8,3 kayıp');
});

test('WT-42/6: SoC eksikse ya da batarya yoksa hesap YAPILMAZ', () => {
  assert.equal(kayipHesapla({socB: 20, kwh: 40}, {batt: 60}), null);
  assert.equal(kayipHesapla({socA: 90, kwh: 40}, {batt: 60}), null);
  assert.equal(kayipHesapla({socB: 20, socA: 90, kwh: 40}, {}), null);
  assert.equal(kayipHesapla({socB: 20, socA: 90, kwh: 40}, null), null);
});

test('WT-42: bozuk SoC (bitiş <= başlangıç) hesaba girmez', () => {
  assert.equal(kayipHesapla({socB: 90, socA: 20, kwh: 40}, {batt: 60}), null);
  assert.equal(kayipHesapla({socB: 50, socA: 50, kwh: 40}, {batt: 60}), null);
});

test('WT-42/5: batarya kapasitesi metriği doğrudan değiştiriyor', () => {
  // WT-40/C3 ile 84 -> 75 düzeltilirse kayıp oranı da değişmeli
  const a = kayipHesapla({socB: 10, socA: 60, kwh: 45}, {batt: 84});
  const b = kayipHesapla({socB: 10, socA: 60, kwh: 45}, {batt: 75});
  assert.ok(a.pct !== b.pct, `84->${a.pct} 75->${b.pct}`);
  assert.equal(b.beklenen, 37.5);
});

test('WT-42/4: uyarı eşiği %20', () => {
  assert.equal(KAYIP_UYARI, 20);
  const k = kayipHesapla({socB: 0, socA: 50, kwh: 45}, {batt: 60});
  assert.ok(Math.abs(k.pct) > KAYIP_UYARI, 'pct=' + k.pct);
});

// ============================================================
// WT-43 · yakıt fiyatı geçmişi ve birim uyumu
// ============================================================
const {fiyatBul, fiyatGoster, fiyatMetrik, tuketimGoster, tuketimMetrik} = sandbox;
const FP = [
  {tarih: '2024-01-01', tur: 'diesel', fiyat: 43.20},
  {tarih: '2025-06-01', tur: 'diesel', fiyat: 52.00},
  {tarih: '2026-02-01', tur: 'diesel', fiyat: 61.50},
  {tarih: '2025-01-01', tur: 'petrol', fiyat: 44.00}
];

test('WT-43/4 KABUL: her kayıt KENDİ dönemindeki fiyatla kıyaslanır', () => {
  assert.equal(fiyatBul(FP, '2024-05-10T12:00', 'diesel').fiyat, 43.20);
  assert.equal(fiyatBul(FP, '2025-07-20T12:00', 'diesel').fiyat, 52.00);
  assert.equal(fiyatBul(FP, '2026-07-30T12:00', 'diesel').fiyat, 61.50);
});

test('WT-43/4: kayıttan önce fiyat yoksa EN ESKİSİ kullanılır', () => {
  assert.equal(fiyatBul(FP, '2020-01-01', 'diesel').fiyat, 43.20);
});

test('WT-43/4: yakıt tipi karışmıyor, kayıt yoksa null', () => {
  assert.equal(fiyatBul(FP, '2026-01-01', 'petrol').fiyat, 44.00);
  assert.equal(fiyatBul(FP, '2026-01-01', 'lpg'), null);
  assert.equal(fiyatBul([], '2026-01-01', 'diesel'), null);
});

test('WT-43/4: sınır günü — fiyatın kendi tarihi dahil', () => {
  assert.equal(fiyatBul(FP, '2025-06-01', 'diesel').fiyat, 52.00);
  assert.equal(fiyatBul(FP, '2025-05-31', 'diesel').fiyat, 43.20);
});

test('WT-43/12 KABUL: mi modunda 30 MPG dahili olarak 7,84 lt/100km', () => {
  S.unit = 'mi';
  assert.equal(Math.round(tuketimMetrik(30) * 100) / 100, 7.84);
  assert.equal(Math.round(tuketimGoster(7.84) * 10) / 10, 30);
  // fiyat: ₺/lt <-> ₺/gal
  assert.equal(Math.round(fiyatMetrik(100) * 100) / 100, 26.42);
  assert.equal(Math.round(fiyatGoster(26.42) * 10) / 10, 100);
  S.unit = 'km';
  assert.equal(tuketimMetrik(6.5), 6.5, 'km modunda çevrim yok');
  assert.equal(fiyatMetrik(47.5), 47.5);
});

// ============================================================
// WT-39 · OCR ayrıştırıcıları (ocr.js — tesseract GEREKMEZ)
// ============================================================
const ocrSb = {
  KURALLAR: sandbox.KURALLAR ?? {kwh: {max: 300}, tutar: {max: 1000000},
    indirim: {max: 1000000}},
  console, document: {createElement: () => ({getContext: () => ({})})},
  window: {}, caches: {}, fetch: () => Promise.reject(new Error('offline'))
};
vm.createContext(ocrSb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'ocr.js'), 'utf8')
  + ';Object.assign(globalThis, {ocrSayi, ocrTarih, ocrSure, ocrSoc, ocrNorm,'
  + ' ocrSatirlar, ocrAlanlar, ocrSablonSec});', ocrSb, {filename: 'ocr.js'});
const {ocrSayi, ocrTarih, ocrSure, ocrSoc, ocrSatirlar, ocrAlanlar, ocrSablonSec} = ocrSb;

test('WT-39/5 KABUL: "45.820 kWh" 45820 DEĞİL 45,82 okunur', () => {
  // Türkçe kuralıyla okunsa 1000x hatalı veri üretirdi — maddenin asıl uyarısı
  assert.equal(ocrSayi('45.820 kWh', 'kwh'), 45.82);
  assert.equal(ocrSayi('49.023 kWh', 'kwh'), 49.02);
});

test('WT-39/5: şartnamedeki yedi sayı örneği', () => {
  assert.equal(ocrSayi('4,52 kWh', 'kwh'), 4.52);
  assert.equal(ocrSayi('22.57 kWh', 'kwh'), 22.57);
  assert.equal(ocrSayi('503.56 TRY', 'tutar'), 503.56);
  assert.equal(ocrSayi('58,65 ₺', 'tutar'), 58.65);
  assert.equal(ocrSayi('685.83 TRY', 'tutar'), 685.83);
});

test('WT-39/5: üç basamaklı belirsizlik alan sınırıyla çözülür', () => {
  // tutar alanında 1.234 -> binlik yorumu sınırın altında kaldığı için 1234
  assert.equal(ocrSayi('1.234 TRY', 'tutar'), 1234);
  // kWh alanında üç basamaklı ondalık yaygın -> her zaman ondalık
  assert.equal(ocrSayi('12.500 kWh', 'kwh'), 12.5);
});

test('WT-39/5: okunamayan metin null döner (tahmin üretilmez)', () => {
  assert.equal(ocrSayi('', 'kwh'), null);
  assert.equal(ocrSayi('kWh', 'kwh'), null);
  assert.equal(ocrSayi(null, 'kwh'), null);
});

test('WT-39/5: üç tarih formatı da destekleniyor', () => {
  assert.equal(ocrTarih('30 01 2025 21:05:36'), '2025-01-30T21:05');
  assert.equal(ocrTarih('15/05/2024 23:35:32'), '2024-05-15T23:35');
  assert.equal(ocrTarih('13 Şub 2026 13:54'), '2026-02-13T13:54');
});

test('WT-39/5: 2000-2100 dışındaki yıl reddedilir', () => {
  assert.equal(ocrTarih('01 01 1900 10:00'), null);
  assert.equal(ocrTarih('01 01 2200 10:00'), null);
  assert.equal(ocrTarih('bir şey yok'), null);
});

test('WT-39/5: süre örnekleri', () => {
  assert.equal(ocrSure('1 saat 13 dakika 33 saniye'), 74);   // 33 sn yukarı yuvarlanır
  assert.equal(ocrSure('48 dakika 39 saniye'), 49);
  assert.equal(ocrSure('6 dk.'), 6);
  assert.equal(ocrSure('17 dk.'), 17);
  assert.equal(ocrSure('süre yok'), null);
});

// NOT: vm bağlamında üretilen nesnelerin prototipi farklı olduğu için
// deepStrictEqual "same structure but not reference-equal" diyor; alanlar
// tek tek karşılaştırılıyor.
const soc = (m, bas, bit) => {
  const v = ocrSoc(m);
  assert.equal(v.bas, bas, m + ' bas');
  assert.equal(v.bit, bit, m + ' bit');
};
test('WT-39/5: SoC — iki yüzde başlangıç/bitiş, tek yüzde yalnız biri', () => {
  soc('%2  %90', 2, 90);
  soc('% 12,00', 12, null);
  soc('yok', null, null);
});

test('WT-39: Türkçe karakter normalizasyonu (OCR "Şarj"ı "Sarj" okuyor)', () => {
  assert.equal(ocrSb.ocrNorm('Şarj Süresi'), 'sarj suresi');
  assert.equal(ocrSb.ocrNorm('İstasyon ID'), 'istasyon id');
});

// --- Uzamsal alan çıkarımı: gerçek görüntü yerine sentetik kelime kutuları ---
// Tesseract'ın verdiği biçimde {text, bbox, confidence} üretiliyor.
let _y = 0;
const satir = (metin, {conf = 95, x0 = 10, dy = 40} = {}) => {
  _y += dy;
  let x = x0;
  return metin.split(' ').map(w => {
    const kutu = {x0: x, y0: _y, x1: x + w.length * 12, y1: _y + 24};
    x = kutu.x1 + 8;
    return {text: w, bbox: kutu, confidence: conf};
  });
};
const duzenA = () => { _y = 0; return [
  ...satir('Highway Outlet DC-1'),
  ...satir('Başlangıç Zamanı'), ...satir('30 01 2025 21:05:36'),
  ...satir('Şarj Süresi'), ...satir('1 saat 13 dakika 33 saniye'),
  ...satir('Kullanılan Enerji'), ...satir('45.820 kWh'),
  ...satir('Başlangıç Bitiş'), ...satir('%2 %90'),
  ...satir('Toplam Ödeme: 503.56 TRY')
]; };
const duzenB = () => { _y = 0; return [
  ...satir('13 Şub 2026 13:54'),
  ...satir('Başlangıç • % 12,00'),
  ...satir('Bitiş • % 18,00'),
  ...satir('Aktarılan Enerji • 4,52 kWh'),
  ...satir('Şarj Süresi 6 dk.'),
  ...satir('Blokaj Ücreti 0,00 ₺'),
  ...satir('Şarj Hizmeti Ücreti 58,65 ₺'),
  ...satir('İndirim 0,00 ₺'),
  ...satir('Toplam Tutar 58,65 ₺')
]; };
const duzenC = () => { _y = 0; return [
  ...satir('Şarj Noktası: Otomol (2), İstanbul'),
  ...satir('Başlangıç Tarihi 15/05/2024 23:35:32'),
  ...satir('Tüketilen Enerji: 22.57 kWh'),
  ...satir('Batarya Doluluğu: % 80'),
  ...satir('Toplam Tutar: 203.13 TL'),
  ...satir('İstasyon ID: TR-IST-190'),
  ...satir('Soket: #2, DC (CCS), 120 kW'),
  ...satir('Şarj Süresi: 17 dk.')
]; };

test('WT-39/4: kelimeler satırlara doğru gruplanıyor', () => {
  const s = ocrSatirlar(duzenA());
  assert.ok(s.length >= 9, 'satır sayısı=' + s.length);
  assert.equal(s[0].text, 'Highway Outlet DC-1');
});

test('WT-39/6: üç düzen de anahtar kelimeden tanınıyor', () => {
  assert.equal(ocrSablonSec(ocrSatirlar(duzenA())), 'A');
  assert.equal(ocrSablonSec(ocrSatirlar(duzenB())), 'B');
  assert.equal(ocrSablonSec(ocrSatirlar(duzenC())), 'C');
  assert.equal(ocrSablonSec(ocrSatirlar([])), null, 'tanınmazsa genel algoritma');
});

test('WT-39 KABUL — Düzen A (Astor/Trugo): enerji, net tutar, tarih doğru', () => {
  const {alanlar: a} = ocrAlanlar(duzenA());
  assert.equal(a.kwh, 45.82, 'değer etiketin ALTINDA');
  assert.equal(a.odenen, 503.56);
  assert.equal(a.tarih?.slice(0, 10), '2025-01-30');
  assert.equal(a.dur, 74);
  assert.equal(a.socB, 2);
  assert.equal(a.socA, 90, 'tek satırda iki yüzde');
});

test('WT-39 KABUL — Düzen B (ZES): brüt/indirim/net üçlüsü', () => {
  const {alanlar: a} = ocrAlanlar(duzenB());
  assert.equal(a.kwh, 4.52, 'değer etiketin SAĞINDA');
  assert.equal(a.odenen, 58.65);
  assert.equal(a.brut, 58.65);
  assert.equal(a.indirim, 0);
  assert.equal(a.tarih?.slice(0, 10), '2026-02-13');
  assert.equal(a.dur, 6);
  assert.equal(a.socB, 12);
  assert.equal(a.socA, 18);
});

test('WT-39 KABUL — Düzen C (Eşarj): yalnız bitiş SoC, soket ve istasyon', () => {
  const {alanlar: a} = ocrAlanlar(duzenC());
  assert.equal(a.kwh, 22.57);
  assert.equal(a.odenen, 203.13);
  assert.equal(a.tarih?.slice(0, 10), '2024-05-15');
  assert.equal(a.dur, 17);
  assert.equal(a.socA, 80, 'Batarya Doluluğu yalnız bitişi verir');
  assert.equal(a.socB, undefined, 'başlangıç YOK — tahmin üretilmemeli');
  assert.equal(a.soket, 'CCS');
  assert.equal(a.istGuc, 120);
  assert.equal(a.istasyonId, 'TR-IST-190');
});

test('WT-39/7: güven skoru alan bazında taşınıyor', () => {
  _y = 0;
  const k = [...satir('Kullanılan Enerji'), ...satir('45.820 kWh', {conf: 42})];
  const {guven} = ocrAlanlar(k);
  assert.ok(guven.kwh < 60, 'düşük güven kırmızı işaret için taşınmalı: ' + guven.kwh);
});

test('WT-39/4: bulunamayan alan BOŞ bırakılır (tahmin yok)', () => {
  const {alanlar, sablon} = ocrAlanlar([]);
  assert.equal(Object.keys(alanlar).length, 0, JSON.stringify(alanlar));
  assert.equal(sablon, null);
});

// ============================================================
// WT-81/2 · sonAylar / sonYillar — üç yerdeki elle Date aritmetiğinin yerine
// ============================================================
test('sonAylar: yıl sınırını doğru atlıyor', () => {
  S.lang = 'tr';
  const a = sonAylar(6, new Date(2026, 1, 15));   // Şubat 2026
  assert.equal(a.map(x => x.key).join(),
    '2025-09,2025-10,2025-11,2025-12,2026-01,2026-02');
  assert.equal(a.map(x => x.year).join(), '2025,2025,2025,2025,2026,2026');
  assert.equal(a[a.length - 1].label, 'Şub', 'etiket üç harfe kırpılıyor');
});

test('sonAylar: en yeni ay SONDA (grafik soldan sağa eskiden yeniye)', () => {
  S.lang = 'tr';
  const a = sonAylar(3, new Date(2026, 7, 9));
  assert.equal(a.map(x => x.key).join(), '2026-06,2026-07,2026-08');
});

test('sonAylar: 31 Mart\'ta bir önceki ay Şubat kalır (gün taşması yok)', () => {
  S.lang = 'tr';
  // new Date(y, m-1, 31) kurulsaydı 3 Mart'a taşardı; yardımcı ayın 1'ini alıyor
  const a = sonAylar(2, new Date(2026, 2, 31));
  assert.equal(a.map(x => x.key).join(), '2026-02,2026-03');
});

test('sonYillar: ardışık ve en yeni sonda', () => {
  const y = sonYillar(5, new Date(2026, 0, 1));
  assert.equal(y.map(x => x.key).join(), '2022,2023,2024,2025,2026');
  assert.ok(y.every(x => x.key === x.label && x.key === x.year),
    'yılda key, label ve year aynı');
});

test('sonAylar/sonYillar: n kadar kayıt döner', () => {
  S.lang = 'tr';
  assert.equal(sonAylar(1, new Date(2026, 0, 1)).length, 1);
  assert.equal(sonAylar(12, new Date(2026, 0, 1)).length, 12);
  assert.equal(sonYillar(1, new Date(2026, 0, 1)).length, 1);
});

// WT-81/6 · Tüketim birimi. Kusur: `mesafeKm` her zaman KM tutuluyor ama iki
// gösterim yeri (ana sayfa d-cons, Geçmiş satırları) km tabanlı sayının yanına
// kullanıcının birimini yazıyordu — 'mi' seçende tüketim %38 düşük okunuyordu.
// Beklenti şartnameden: gösterilen sayı ile etiket AYNI birimde olmalı.
test('WT-81/6: km modunda tüketim km tabanlı (çeviri yok)', () => {
  S.unit = 'km';
  // 200 km'de 36 kWh = 18 kWh/100 km
  assert.equal(cons100(36, 200), 18);
  assert.equal(consUnit(), 'kWh/100 km');
});

test('WT-81/6 KABUL: mi modunda değer 100 MİL başına çevriliyor', () => {
  S.unit = 'mi';
  // 18 kWh/100 km = 18 × 1.60934 = 28.97 kWh/100 mi
  assert.ok(Math.abs(cons100(36, 200) - 28.968) < 0.01,
    'beklenen ~28.97, gelen ' + cons100(36, 200));
  assert.equal(consUnit(), 'kWh/100 mi');
  S.unit = 'km';
});

test('WT-81/6: mi değeri km değerinden BÜYÜK (yön kontrolü)', () => {
  // Kusurun kendisi buydu: ikisi eşit çıkıyordu.
  S.unit = 'km'; const k = cons100(36, 200);
  S.unit = 'mi'; const m = cons100(36, 200);
  assert.ok(m > k, 'mil başına tüketim km başınadan büyük olmalı');
  S.unit = 'km';
});

test('WT-81/6: mesafe yoksa null döner (sıfıra bölme yok)', () => {
  S.unit = 'km';
  assert.equal(cons100(10, 0), null);
  assert.equal(cons100(10, undefined), null);
});

test('WT-81/6: tuketimOrt atlanan kayıtları saymıyor (WT-20)', () => {
  S.unit = 'km';
  const l = [{kwh: 20, mesafeKm: 100}, {kwh: 99, mesafeKm: 100, atlanan: true}];
  assert.equal(tuketimOrt(l), 20);   // atlanan girseydi ~59.5 çıkardı
});

test('WT-81/6: tuketimOrt 20 km altında null (anlamsız oran)', () => {
  S.unit = 'km';
  assert.equal(tuketimOrt([{kwh: 5, mesafeKm: 19}]), null);
  assert.equal(tuketimOrt([{kwh: 5, mesafeKm: 20}]), 25);
});

test('WT-81/6: tuketimOrt mesafesiz/kWh\'siz kayıtları eliyor', () => {
  S.unit = 'km';
  const l = [{kwh: 20, mesafeKm: 100}, {kwh: 0, mesafeKm: 50}, {kwh: 8, mesafeKm: 0}];
  assert.equal(tuketimOrt(l), 20);
});

test('WT-81/6: tuketimOrt ile cons100 aynı sonucu veriyor (tek kaynak)', () => {
  for (const u of ['km', 'mi']) {
    S.unit = u;
    assert.equal(tuketimOrt([{kwh: 15, mesafeKm: 60}, {kwh: 21, mesafeKm: 140}]),
      cons100(36, 200), u + ' modunda liste ve tekil hesap ayrışmamalı');
  }
  S.unit = 'km';
});
