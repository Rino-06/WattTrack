/* ============================================================
   WattTrack — calc
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Durum (S) ve $ kısayolu ---- */
// ---------- Durum & yardımcılar ----------
const S = {
  country: 'TR', currency: 'TRY', unit: 'km', lang: 'tr',
  advOpen: false, defaultVehicleId: null, onboarded: false,
  period: 'year', cmp: null, dashVeh: '', cmpVeh: '', vehExpVeh: '', vehExpGran: 'month', bankCountries: null, gran: 'month', customBanks: [], theme: 'light', dstatType: '', histBadOnly: null, homeKwhPrice: null
};
const $ = id => document.getElementById(id);

/* ---- WT-02/04: sayı, para, tarih kuralları ---- */
// ---------- WT-02: tek sayı kuralı ----------
// ONDALIK: virgül (,)  ·  BİNLİK: nokta (.)  ·  2 basamak
// Kural dil ayarından BAĞIMSIZ, tüm dillerde aynı — ürün kararı.
// Girişte hem "43,57" hem "43.57" kabul edilir; ikisi de 43.57 olur.
// dec: saklanacak ondalık basamak. Varsayılan 2; kur alanı gibi hassas
// alanlar pf(v, 6) ile çağrılır (2'ye yuvarlamak kuru bozardı).
function pf(str, dec = 2) {
  if (str == null) return NaN;
  let s = String(str).trim().replace(/[^\d.,\-]/g, '');   // para simgesi, boşluk, birim at
  if (!s) return NaN;
  const sonNokta = s.lastIndexOf('.');
  const sonVirgul = s.lastIndexOf(',');
  if (sonNokta > -1 && sonVirgul > -1) {
    // İkisi de var → SONUNCUSU ondalık, diğeri binlik
    const ond = Math.max(sonNokta, sonVirgul);
    s = s.slice(0, ond).replace(/[.,]/g, '') + '.' + s.slice(ond + 1).replace(/[.,]/g, '');
  } else if (sonNokta > -1 || sonVirgul > -1) {
    // Tek ayraç → kullanıcı girişinde HER ZAMAN ondalık kabul et
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  if (isNaN(n)) return NaN;
  const p = Math.pow(10, dec);
  return Math.round(n * p) / p;
}
// Tüm sayı gösteriminin TEK noktası. Dile göre biçimlendirme istenirse
// değiştirilecek tek yer burası.
function fmtNum(v, dec = 0) {
  if (v == null || isNaN(v)) return '—';
  const neg = v < 0;
  const [tam, ond] = Math.abs(v).toFixed(dec).split('.');
  const tamStr = tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + tamStr + (ond ? ',' + ond : '');
}
// Giriş kutusuna yazılacak biçim: fmtNum ile aynı kural, ama eksi işareti
// normal tire (kutuya geri yazılınca pf() okuyabilsin) ve kur gibi çok
// ondalıklı alanlarda gereksiz sıfırlar atılır.
function fmtInput(v, dec = 2) {
  if (v == null || isNaN(v)) return '';
  let s = fmtNum(v, dec).replace('−', '-');
  // Kur gibi çok ondalıklı alanlarda gereksiz sıfırlar atılır. Bu durumda
  // binlik ayracı da KULLANILMAZ: ondalık kısım kırpılınca geriye "1.000"
  // kalır ve pf() tek ayracı her zaman ondalık kabul ettiği için bunu 1,0
  // diye okur. Kurlar küçük sayılar, gruplama zaten bir şey katmıyor.
  if (dec > 2) {
    const [tam, ond = ''] = s.split(',');
    const kirp = ond.replace(/0+$/, '');
    s = tam.split('.').join('') + (kirp ? ',' + kirp : '');
  }
  return s;
}
// WT-02/C: alandan çıkarken değeri kuralın kendisiyle geri yaz —
// kullanıcı "43.57" yazıp çıkınca kutuda "43,57" görür, kural görünür olur.
// ---------- WT-04: sayısal alan sınırları ----------
// type="number" min/max öznitelikleri <form> doğrulaması olmadan ZORLANMIYOR;
// tek doğrulama katmanı her iki formda (şarj + gider) burayı kullanır.
const KURALLAR = {
  kwh:        {min: 0.01,     max: 300,     dec: 2, lbl: 'fldKwh'},
  tutar:      {min: 0,        max: 1000000, dec: 2, lbl: 'fldAmount'},
  indirim:    {min: 0,        max: 1000000, dec: 2, lbl: 'fldDisc'},
  indirimYuz: {min: 0,        max: 100,     dec: 2, lbl: 'fldDisc'},
  kur:        {min: 0.000001, max: 100000,  dec: 6, lbl: 'fldRate'},
  mesafe:     {min: 0,        max: 5000,    dec: 1, lbl: 'fldDist'},
  odo:        {min: 0,        max: 2000000, dec: 0, lbl: 'fldOdo'},
  surSaat:    {min: 0,        max: 48,      dec: 0, lbl: 'fldDurH'},
  surDak:     {min: 0,        max: 59,      dec: 0, lbl: 'fldDurM'},
  soc:        {min: 0,        max: 100,     dec: 0, lbl: 'fldSoc'},
  birimFiyat: {min: 0,        max: 1000,    dec: 2, lbl: 'fldUnitPrice'},
  // WT-40/C3: araç teknik değerlerinin elle düzeltilmesi
  spec_batt:  {min: 1,        max: 300,     dec: 2, lbl: 'battery'},
  spec_range: {min: 1,        max: 2000,    dec: 0, lbl: 'rangeWltp'},
  spec_dc:    {min: 1,        max: 1000,    dec: 0, lbl: 'dcMax'},
  spec_ac:    {min: 1,        max: 100,     dec: 1, lbl: 'acMax'},
  // WT-43: yakıt fiyatı (gösterim biriminde: ₺/lt ya da ₺/gal)
  fuelPrice:  {min: 0.01,     max: 1000,    dec: 2, lbl: 'fldFuelPrice'}
};
// Sınır dışı değerde SESSİZCE KIRPMA — {ok:false, msg} döndür, çağıran gösterir.
// Boş alan: zorunlu değilse {ok:true, value:null}.
function checkNum(kural, raw, {required = false} = {}) {
  const k = KURALLAR[kural];
  const s = String(raw ?? '').trim();
  if (!s) return required
    ? {ok: false, msg: t('numRange', {f: t(k.lbl), min: fmtNum(k.min, k.dec), max: fmtNum(k.max, k.dec)})}
    : {ok: true, value: null};
  const n = pf(s, k.dec);
  if (isNaN(n) || n < k.min || n > k.max)
    return {ok: false, msg: t('numRange', {f: t(k.lbl), min: fmtNum(k.min, k.dec), max: fmtNum(k.max, k.dec)})};
  return {ok: true, value: n};
}

function bindDecimalInput(id, dec = 2) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    if (!el.value.trim()) return;
    const n = pf(el.value, dec);
    el.value = isNaN(n) ? '' : fmtInput(n, dec);
  });
}
const symOf = code => CURRENCY_SYMBOLS[code] || code;
const sym = () => symOf(S.currency);
// Harf içeren semboller (L, kr, Kč, Ft…) sayının SONUNA boşlukla gelir: "1.250 L";
// işaret semboller (₺ € $ £) başa gelir: "₺1.250"
const fm = (s, str) => /^[A-Za-z]/.test(s) ? str + ' ' + s : s + str;
const money = v => (v < 0 ? '−' : '') + fm(sym(), fmtNum(Math.abs(v || 0), 0));
const money2 = v => (v < 0 ? '−' : '') + fm(sym(), fmtNum(Math.abs(v || 0), 2));
// WT-01: toISOString() UTC'ye çevirir; TR (UTC+3) gibi doğu saat dilimlerinde
// gece yarısından sonra DÜNÜN tarihini verir. Tüm tarih anahtarları yerel
// saate göre üretilmeli.
const localISO = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const localMonth = (d = new Date()) => localISO(d).slice(0, 7);
// WT-05: YYYY-MM-DD hem biçim hem takvim olarak geçerli mi?
// (input type=date boş bırakılabiliyor, 2025-02-31 gibi değerler de elenmeli)
function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const d = new Date(s + 'T12:00');
  return !isNaN(d.getTime()) && localISO(d) === s;
}
const monthKey = iso => iso.slice(0, 7);
const distDisp = km => S.unit === 'mi' ? km / MI : km;
const distFactor = () => S.unit === 'mi' ? MI : 1;   // 100 birim = 100*factor km


/* ---- esc/colorFor ve para hesapları (savingsOf, convOf, amtB…) ---- */
function esc(s) {
  return (s || '').toString().replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
// indirim (tasarruf) — kayıt para biriminde
// v6+: kayıtta hazır `indirim` alanı var (brüt − net). Eski kayıtlar için formül.
function savingsOf(r) {
  if (r.free) return 0;
  if (r.indirim != null) return Number(r.indirim) || 0;
  if (r.indirimTip === 'percent') {
    const v = Number(r.indirimDeger) || 0;
    return v >= 100 ? 0 : r.odenen * v / (100 - v);
  }
  if (r.indirimTip === 'amount') return Number(r.indirimDeger) || 0;
  return 0;
}
// brütten neti hesapla (form ve kayıt için tek doğruluk kaynağı)
function netFromGross(gross, type, val) {
  const v = Number(val) || 0;
  if (v <= 0) return gross;
  const net = type === 'percent' ? gross * (1 - Math.min(100, v) / 100) : gross - v;
  return Math.max(0, net);
}
// ---- ÇİFT YÖNLÜ KUR: kayıt kendi para birimini korur ----
// Dönüşüm katsayısı; çevrilemiyorsa null (toplam dışı bırakılır)
function convOf(r) {
  const c = r.cur || S.currency;
  if (c === S.currency) return 1;
  if (r.fxTable && r.fxTable[S.currency]) return r.fxTable[S.currency];
  if (r.rate && (r.rateBase === S.currency || !r.rateBase)) return Number(r.rate);
  return null;
}
const amtB = r => { const k = convOf(r); return k == null ? 0 : (r.odenen || 0) * k; };
const savB = r => { const k = convOf(r); return k == null ? 0 : savingsOf(r) * k; };
const isConv = r => convOf(r) != null;
const expB = e => { const k = convOf(e); return k == null ? 0 : (e.tutar || 0) * k; };
// WT-10: convOf() null dönünce amtB() 0 veriyor ve kayıt toplamlardan sessizce
// düşüyordu. (Kod içinde tanımlı ama hiç kullanılmayan fxPendingCount bu
// uyarının planlanıp unutulduğunu gösteriyordu — kaldırıldı, yerine bu geldi.)
function reportFxGaps(list, host = 'd-warnings', id = 'fx') {
  const bad = list.filter(r => !isConv(r));
  setWarning(id, bad.length ? {
    host,
    msg: t('fxMissing', {n: bad.length}),
    actionLbl: t('fxFix'),
    action: () => { S.histBadOnly = bad.map(r => r.id).filter(x => x != null); showScreen('history'); }
  } : null);
  return bad.length;
}
function shortDate(iso) {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return d + ' ' + MONTHS[S.lang][m - 1].slice(0, 3);
}

/* ---- WT-19: mesafe ve kilometre sayacı ---- */
// ============================================================
// MESAFE VE KİLOMETRE SAYACI (WT-19)
// ============================================================
// ESKİ SORUN: bumpVehicleKm() kayıttaki mesafeyi otomatik olarak araç
// sayacına ekliyordu. Kullanıcı ayrıca "km✎" ile gerçek sayacı girince iki
// mekanizma çakışıyor ve çift sayım oluyordu. bumpVehicleKm KALDIRILDI.
//
// Artık mesafe iki kaynaktan gelebilir ve kullanıcı İKİSİNDEN BİRİNİ girer:
//   - mesafeKm doğrudan girilmişse (odo == null) aynen kullanılır
//   - odo girilmişse mesafe TÜRETİLİR ve yine mesafeKm'ye yazılır
//
// PROVENANS İŞARETİ: `odo != null` ise o kaydın mesafeKm'si TÜRETİLMİŞTİR ve
// yeniden hesaplama onu sahiplenir. `odo == null` ise mesafeKm kullanıcının
// girdiği değerdir ve yeniden hesaplama ona ASLA dokunmaz — böylece eski
// kayıtlar (WT-19/6) bozulmadan çalışmaya devam eder.
//
// aracId'si null olan kayıtlar tek bir örtük grup sayılır; farklı araçların
// sayaç okumalarını birbirine zincirlemek anlamsız olurdu.
const vehEq = (a, b) => (a ?? null) === (b ?? null);

// Aracın odo'lu kayıtlarını TARİHE göre (ekleniş sırasına DEĞİL) sıralayıp
// mesafeleri baştan hesaplar. Araya sonradan geçmiş tarihli kayıt eklenebildiği
// için "bir önceki kayıttan farkı al" mantığı tek başına yetmez.
async function tureMesafe(aracId) {
  const mine = (await allSessions())
    .filter(r => vehEq(r.aracId, aracId) && r.odo != null)
    .sort((a, b) => a.tarih.localeCompare(b.tarih) || a.id - b.id);
  const upd = [];
  let prev = null;
  for (const r of mine) {
    // ilk odo'lu kayıtta kıyas noktası yok → mesafe null
    const yeni = prev == null ? null : Math.round((r.odo - prev) * 10) / 10;
    if ((r.mesafeKm ?? null) !== yeni) upd.push([r.id, yeni]);
    prev = r.odo;
  }
  if (!upd.length) return;
  await safeWrite(() => db.transaction('rw', db.sessions, async () => {
    for (const [id, m] of upd) await db.sessions.update(id, {mesafeKm: m});
  }));
}

// Doğrulama İKİ KOMŞUYA birden yapılır (sadece öncekine değil): kayıt tarihçe
// A ve B arasına giriyorsa A.odo ≤ yeni.odo ≤ B.odo olmalı.
// Mesajlar GÖSTERİM biriminde (mi kullanıcısı formundaki sayıları görsün).
async function odoNeighbourCheck(aracId, tarih, odoKm, excludeId) {
  const d = km => fmtNum(distDisp(km), 0) + ' ' + S.unit;
  const veh = aracId != null ? await db.vehicles.get(aracId) : null;
  if (veh?.kmStart != null && odoKm < veh.kmStart)
    return {ok: false, msg: t('odoBelowStart', {a: d(veh.kmStart)})};

  const mine = (await allSessions())
    .filter(r => vehEq(r.aracId, aracId) && r.odo != null && r.id !== excludeId)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const before = [...mine].reverse().find(r => r.tarih <= tarih);
  const after = mine.find(r => r.tarih > tarih);
  const lo = before ? before.odo : null, hi = after ? after.odo : null;
  const okLo = lo == null || odoKm >= lo;
  const okHi = hi == null || odoKm <= hi;
  if (okLo && okHi) return {ok: true};
  if (lo != null && hi != null) return {ok: false, msg: t('odoRange',
    {a: d(lo), b: d(hi), da: shortDate(before.tarih), db: shortDate(after.tarih)})};
  if (!okLo) return {ok: false, msg: t('odoMin', {a: d(lo), da: shortDate(before.tarih)})};
  return {ok: false, msg: t('odoMax', {b: d(hi), db: shortDate(after.tarih)})};
}

// WT-20/4: atlanan şarj sezgisi. WLTP MENZİL KULLANILMAZ — araçlar o değere
// ulaşmadığı için yanlış alarm üretir. Kullanıcının KENDİ geçmişi ölçüdür:
// aracın son 10 kaydının ortalama tüketimi (kWh/100km) alınır; yeni kaydın
// tüketimi bu ortalamanın YARISINDAN düşükse (aynı enerjiyle anormal çok yol
// gidilmiş görünüyorsa) sorulur. En az 5 geçmiş kayıt yoksa sorulmaz.
async function looksLikeMissedCharge(aracId, mesafeKm, kwh, excludeId) {
  if (!(mesafeKm > 0) || !(kwh > 0)) return false;
  const gecmis = (await allSessions())
    .filter(r => vehEq(r.aracId, aracId) && r.id !== excludeId
      && !r.atlanan && r.mesafeKm > 0 && r.kwh > 0)
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .slice(0, 10);
  if (gecmis.length < 5) return false;                 // yeterli temel yok
  const ortTuketim = gecmis.reduce((s, r) => s + r.kwh / r.mesafeKm * 100, 0) / gecmis.length;
  const buTuketim = kwh / mesafeKm * 100;
  return buTuketim < ortTuketim / 2;
}

// Araç sayacı = ÜÇ kaynaktan en büyüğü. Hangisinin kullanıldığı Aracım
// sayfasında not olarak yazılır.
//   records — kayıtlardaki en son tarihli `odo`
//   manual  — araca elle girilen `kmNow`
//   dist    — WT-58: başlangıç sayacı + girilen sürüş mesafeleri
async function odoNowOf(v) {
  if (!v) return {km: null, src: null};
  const mine = (await allSessions()).filter(r => vehEq(r.aracId, v.id));
  const odolu = mine.filter(r => r.odo != null)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const fromRec = odolu.length ? odolu[odolu.length - 1].odo : null;
  const manual = v.kmNow ?? null;

  // WT-58: sayaç değeri hiç girmeyip yalnız "sürülen mesafe" giren kullanıcının
  // aracı ilk günkü kilometrede donuyordu. Toplama YALNIZ odo'suz kayıtlar
  // girer: odo'lu kayıtların mesafesi zaten odo zincirinden türetiliyor
  // (tureMesafe), ikisini birden saymak sayacı şişirirdi.
  // Taban kmStart — kmNow olsaydı, kullanıcı sayacı elle güncellediğinde
  // aynı sürüş iki kez sayılırdı.
  const surulen = mine.filter(r => r.odo == null && r.mesafeKm > 0)
    .reduce((s, r) => s + r.mesafeKm, 0);
  const taban = v.kmStart ?? manual;
  const fromDist = (taban != null && surulen > 0) ? taban + surulen : null;

  // Sıra eşitlikte kazananı belirler: records > manual > dist
  const aday = [[fromRec, 'records'], [manual, 'manual'], [fromDist, 'dist']]
    .filter(([km]) => km != null);
  if (!aday.length) return {km: null, src: null};
  const [km, src] = aday.reduce((a, b) => b[0] > a[0] ? b : a);
  return {km, src};
}


/* ---- WT-42: şarj verimi / kayıp analizi ---- */
// Beklenen kWh = batarya × (socA - socB) / 100
// Faturalanan - beklenen = şarj kaybı + istasyon ölçüm sapması.
// YALNIZCA socB ve socA'nın İKİSİ de dolu olan kayıtlarda hesaplanır (madde 6).
// Batarya kapasitesi yanlışsa metrik anlamsızlaşır — bu yüzden WT-40/C3
// kullanıcıya kapasiteyi düzeltme imkânı veriyor.
function kayipHesapla(rec, veh) {
  const batt = veh?.batt;
  if (!batt || rec.socB == null || rec.socA == null) return null;
  const fark = rec.socA - rec.socB;
  if (!(fark > 0)) return null;
  const beklenen = batt * fark / 100;
  if (!(beklenen > 0) || !(rec.kwh > 0)) return null;
  return {
    beklenen: Math.round(beklenen * 100) / 100,
    faturalanan: rec.kwh,
    pct: Math.round((rec.kwh - beklenen) / beklenen * 1000) / 10
  };
}
const KAYIP_UYARI = 20;   // %20'yi aşan sapmada satırda uyarı (madde 4)


/* ---- WT-43: yakıt fiyatı geçmişi ---- */
// Tek güncel fiyatın tüm geçmişe uygulanması, enflasyonun yüksek olduğu bir
// ülkede kümülatif grafiği ve "toplam kazanç" rakamını tamamen yanlış yapıyor.
// Her kayıt için o KAYDIN TARİHİNDE geçerli fiyat kullanılır.
function fiyatBul(liste, tarih, tur) {
  const t10 = String(tarih || '').slice(0, 10);
  const ayni = (liste || []).filter(f => f.tur === tur)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  if (!ayni.length) return null;
  let sec = null;
  for (const f of ayni) { if (f.tarih <= t10) sec = f; else break; }
  return sec ?? ayni[0];        // kayıttan önce fiyat yoksa EN ESKİSİ
}

/* ---- WT-43/12: birim uyumu (gal / MPG) ---- */
// Dahili hesap HER ZAMAN metrik (₺/lt ve lt/100km); yalnız gösterim çevriliyor.
const GALON_LT = 3.78541;
const MPG_SABIT = 235.215;                       // lt/100km = 235,215 / MPG
const fiyatGoster = p => S.unit === 'mi' ? p * GALON_LT : p;          // ₺/lt -> ₺/gal
const fiyatMetrik = p => S.unit === 'mi' ? p / GALON_LT : p;
const tuketimGoster = c => S.unit === 'mi' ? (c > 0 ? MPG_SABIT / c : 0) : c;
const tuketimMetrik = c => S.unit === 'mi' ? (c > 0 ? MPG_SABIT / c : 0) : c;
