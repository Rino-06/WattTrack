/* ============================================================
   WattTrack — ocr.js (WT-39)
   Ekran görüntüsünden veri girişi. TÜM İŞLEM CİHAZDA — bulut OCR yok.

   Bu dosya iki parçadan oluşuyor:
     1) SAF AYRIŞTIRICILAR (sayı, tarih, süre, SoC, satır gruplama, alan
        çıkarımı, şablon tespiti) — tesseract'a ihtiyaç duymaz, birim
        testleri bunları koşar.
     2) TESSERACT SARMALAYICISI — kütüphane TEMBEL yüklenir, uygulama
        paketine girmez. vendor/ocr/ altındaki dosyalar yoksa özellik
        kendini kapatır (bkz. README).
   Modül DEĞİL, klasik script (WT-50).
   ============================================================ */

/* ---------- BÖLÜM 5: sayı ayrıştırma ---------- */
// DİKKAT: Bu kural WT-02'deki KULLANICI GİRİŞİ kuralından FARKLI ve ayrı
// tutulmalı. Şarj firmaları noktayı ondalık ayracı olarak kullanıyor:
// "45.820 kWh" = 45,82 kWh. Türkçe okuma alışkanlığıyla 45.820 sayılırsa
// veri sessizce 1000× bozulur.
function ocrSayi(metin, alan) {
  const s = String(metin ?? '').replace(/[^\d.,]/g, '');
  if (!s) return null;
  const nokta = s.lastIndexOf('.'), virgul = s.lastIndexOf(',');
  let deger;
  if (nokta > -1 && virgul > -1) {
    const ond = Math.max(nokta, virgul);                 // sonuncusu ondalık
    deger = parseFloat(s.slice(0, ond).replace(/[.,]/g, '') + '.' + s.slice(ond + 1));
  } else if (nokta > -1 || virgul > -1) {
    const poz = Math.max(nokta, virgul);
    const basamak = s.length - poz - 1;
    const ondalikYorum = parseFloat(s.slice(0, poz) + '.' + s.slice(poz + 1));
    const binlikYorum = parseFloat(s.replace(/[.,]/g, ''));
    if (basamak === 3) {
      // BELİRSİZ (üç basamak): alanın üst sınırı karar versin
      const max = (typeof KURALLAR !== 'undefined' && KURALLAR[alan]?.max) ?? Infinity;
      deger = binlikYorum > max ? ondalikYorum : binlikYorum;
      // kWh alanında üç basamaklı ondalık YAYGIN (Astor/Trugo) — ondalığı seç
      if (alan === 'kwh') deger = ondalikYorum;
    } else {
      deger = ondalikYorum;                              // 1-2 basamak: ondalık
    }
  } else {
    deger = parseFloat(s);
  }
  return isNaN(deger) ? null : Math.round(deger * 100) / 100;
}

/* ---------- BÖLÜM 5: tarih ---------- */
const OCR_AYLAR = ['oca', 'sub', 'mar', 'nis', 'may', 'haz',
                   'tem', 'agu', 'eyl', 'eki', 'kas', 'ara'];
// Türkçe karakterleri sadeleştir: OCR "Şarj"ı "Sarj", "Ağu"yu "Agu" okuyabiliyor
function ocrNorm(s) {
  // DİKKAT: değiştirme toLowerCase'den ÖNCE yapılmalı. JS'te 'İ'.toLowerCase()
  // iki karakter üretiyor (i + birleşen nokta, U+0307) ve sonradan yapılan
  // /İ/ değiştirmesi hiç eşleşmiyor; "İndirim" -> "i̇ndirim" olup 'indirim'
  // etiketini KAÇIRIYORDU.
  return String(s ?? '')
    .replace(/[İIı]/g, 'i').replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .toLowerCase()
    .replace(/\u0307/g, '')          // kalmış birleşen nokta varsa at
    .replace(/\s+/g, ' ').trim();
}
function ocrTarih(metin) {
  const m = ocrNorm(metin);
  const kabul = (y, ay, g, sa, dk) => {
    if (!(y >= 2000 && y <= 2100)) return null;          // yıl aralığı dışı: reddet
    if (!(ay >= 1 && ay <= 12) || !(g >= 1 && g <= 31)) return null;
    const p = n => String(n).padStart(2, '0');
    return `${y}-${p(ay)}-${p(g)}` + (sa != null ? `T${p(sa)}:${p(dk || 0)}` : '');
  };
  // "13 Şub 2026 13:54" — ay adı kısaltmasıyla
  let r = /(\d{1,2})\s+([a-z]{3,})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(m);
  if (r) {
    const ai = OCR_AYLAR.indexOf(r[2].slice(0, 3));
    if (ai > -1) return kabul(+r[3], ai + 1, +r[1], r[4] != null ? +r[4] : null, +r[5]);
  }
  // "15/05/2024 23:35:32" · "30 01 2025 21:05:36" · "30.01.2025"
  r = /(\d{1,2})[\s./-](\d{1,2})[\s./-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(m);
  if (r) return kabul(+r[3], +r[2], +r[1], r[4] != null ? +r[4] : null, +r[5]);
  // "2025-01-30 21:05"
  r = /(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT](\d{1,2}):(\d{2}))?/.exec(m);
  if (r) return kabul(+r[1], +r[2], +r[3], r[4] != null ? +r[4] : null, +r[5]);
  return null;
}

/* ---------- BÖLÜM 5: süre (dakika) ---------- */
function ocrSure(metin) {
  const m = ocrNorm(metin);
  const say = re => { const r = re.exec(m); return r ? +r[1] : 0; };
  const saat = say(/(\d+)\s*saat/);
  const dk = say(/(\d+)\s*(?:dakika|dk)/);
  const sn = say(/(\d+)\s*saniye/);
  if (!saat && !dk && !sn) return null;
  return saat * 60 + dk + Math.round(sn / 60);            // saniye yuvarlanır
}

/* ---------- BÖLÜM 5: SoC ---------- */
// "%2  %90" -> {bas:2, bit:90} · "% 12,00" -> tek değer
function ocrSoc(metin) {
  const hepsi = [...String(metin ?? '').matchAll(/%\s*(\d{1,3}(?:[.,]\d+)?)/g)]
    .map(x => Math.round(parseFloat(x[1].replace(',', '.'))))
    .filter(n => n >= 0 && n <= 100);
  if (!hepsi.length) return {bas: null, bit: null};
  if (hepsi.length === 1) return {bas: hepsi[0], bit: null};
  return {bas: hepsi[0], bit: hepsi[1]};
}

/* ---------- BÖLÜM 4: kelimeleri satırlara grupla ---------- */
// Tesseract kelime düzeyinde bbox veriyor: {text, bbox:{x0,y0,x1,y1}, confidence}
// y ekseninde %50'den fazla örtüşen kelimeler aynı satır sayılır.
function ocrSatirlar(kelimeler) {
  const ks = [...(kelimeler || [])].filter(k => (k.text || '').trim())
    .sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
  const satirlar = [];
  for (const k of ks) {
    const h = k.bbox.y1 - k.bbox.y0;
    const s = satirlar.find(x => {
      const ortak = Math.min(x.y1, k.bbox.y1) - Math.max(x.y0, k.bbox.y0);
      return ortak > 0.5 * Math.min(h, x.y1 - x.y0);
    });
    if (s) {
      s.words.push(k);
      s.y0 = Math.min(s.y0, k.bbox.y0); s.y1 = Math.max(s.y1, k.bbox.y1);
    } else {
      satirlar.push({y0: k.bbox.y0, y1: k.bbox.y1, words: [k]});
    }
  }
  satirlar.sort((a, b) => a.y0 - b.y0);
  for (const s of satirlar) {
    s.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
    s.text = s.words.map(w => w.text).join(' ');
    s.norm = ocrNorm(s.text);
  }
  return satirlar;
}

/* ---------- BÖLÜM 4: etiket sözlüğü ---------- */
const OCR_ETIKET = {
  enerji:    ['kullanilan enerji', 'aktarilan enerji', 'tuketilen enerji', 'enerji', 'kwh'],
  netTutar:  ['toplam tutar', 'toplam odeme', 'kullanim tutari', 'tutar'],
  brutTutar: ['sarj hizmeti ucreti', 'hizmet ucreti'],
  indirim:   ['indirim'],
  blokaj:    ['blokaj ucreti'],
  socBas:    ['baslangic'],
  socBit:    ['bitis', 'batarya doluluqu', 'batarya dolulugu'],
  sure:      ['sarj suresi', 'sure'],
  tarih:     ['baslangic zamani', 'baslangic tarihi', 'tarih'],
  istasyon:  ['sarj noktasi'],
  istId:     ['istasyon id', 'istasyon kodu'],
  soket:     ['soket'],
  odemeYnt:  ['odeme yontemi'],
  plaka:     ['arac plaka', 'plaka']
};
const SAYI_RE = /\d[\d.,]*/;

// Etiketi taşıyan satırı ve etiketin bittiği x konumunu bul
function etiketBul(satirlar, ifadeler) {
  for (const ifade of ifadeler) {
    for (let i = 0; i < satirlar.length; i++) {
      const s = satirlar[i];
      const p = s.norm.indexOf(ifade);
      if (p < 0) continue;
      // etiketin son kelimesinin sağ kenarı
      let kalan = ifade;
      let sonX = s.words[0]?.bbox.x1 ?? 0, ilkX = s.words[0]?.bbox.x0 ?? 0;
      for (const w of s.words) {
        const n = ocrNorm(w.text);
        if (kalan.startsWith(n) || n.startsWith(kalan.split(' ')[0])) {
          sonX = w.bbox.x1;
          kalan = kalan.slice(n.length).trim();
          if (!kalan) break;
        }
      }
      return {i, satir: s, sonX, ilkX};
    }
  }
  return null;
}

// BÖLÜM 4/3: değer ya AYNI satırda etiketin sağında, ya BİR-İKİ ALT satırda
// etiketin x aralığıyla örtüşen yerde. Bulunamazsa BOŞ bırakılır (tahmin yok).
function degerBul(satirlar, ifadeler, {sayi = true} = {}) {
  const e = etiketBul(satirlar, ifadeler);
  if (!e) return null;
  const uygun = w => sayi ? SAYI_RE.test(w.text) : (w.text || '').trim().length > 0;

  const sagdaki = e.satir.words.filter(w => w.bbox.x0 >= e.sonX - 2 && uygun(w));
  if (sagdaki.length) return {words: sagdaki, text: sagdaki.map(w => w.text).join(' '), satirNo: e.i};

  for (let d = 1; d <= 2; d++) {
    const alt = satirlar[e.i + d];
    if (!alt) break;
    const ortusen = alt.words.filter(w => w.bbox.x1 >= e.ilkX && w.bbox.x0 <= e.sonX + 120 && uygun(w));
    if (ortusen.length) return {words: ortusen, text: ortusen.map(w => w.text).join(' '), satirNo: e.i + d};
  }
  return null;
}

/* ---------- BÖLÜM 6: düzen şablonları ---------- */
// Şablon anahtar kelimeyle seçilir; bulunamazsa genel algoritmaya düşülür.
function ocrSablonSec(satirlar) {
  const hepsi = satirlar.map(s => s.norm).join(' | ');
  if (/kullanilan enerji|toplam odeme/.test(hepsi)) return 'A';   // Astor / Trugo
  if (/aktarilan enerji|blokaj ucreti/.test(hepsi)) return 'B';   // ZES
  if (/tuketilen enerji|istasyon id/.test(hepsi)) return 'C';     // Eşarj
  return null;
}

/* ---------- BÖLÜM 4+6: alan çıkarımı ---------- */
// Dönüş: {alanlar:{...}, guven:{alan: 0-100}, sablon}
// Okunamayan alan hiç yazılmaz — boş bırakılır, tahmin üretilmez.
function ocrAlanlar(kelimeler) {
  const satirlar = ocrSatirlar(kelimeler);
  const sablon = ocrSablonSec(satirlar);
  const out = {}, guven = {};
  const ort = ws => ws?.length
    ? Math.round(ws.reduce((s, w) => s + (w.confidence ?? 100), 0) / ws.length) : null;
  const koy = (alan, bulgu, deger) => {
    if (deger == null || deger === '' || bulgu == null) return;
    out[alan] = deger;
    guven[alan] = ort(bulgu.words);
  };

  const enerji = degerBul(satirlar, OCR_ETIKET.enerji);
  koy('kwh', enerji, enerji && ocrSayi(enerji.text, 'kwh'));

  const net = degerBul(satirlar, OCR_ETIKET.netTutar);
  koy('odenen', net, net && ocrSayi(net.text, 'tutar'));

  const brut = degerBul(satirlar, OCR_ETIKET.brutTutar);
  const ind = degerBul(satirlar, OCR_ETIKET.indirim);
  if (brut) koy('brut', brut, ocrSayi(brut.text, 'tutar'));
  if (ind) koy('indirim', ind, ocrSayi(ind.text, 'indirim'));

  // Blokaj ücreti NETE EKLENMEZ, yalnız nota yazılır (Düzen B)
  const blokaj = degerBul(satirlar, OCR_ETIKET.blokaj);
  if (blokaj) {
    const b = ocrSayi(blokaj.text, 'tutar');
    if (b) koy('blokaj', blokaj, b);
  }

  const sure = degerBul(satirlar, OCR_ETIKET.sure, {sayi: false});
  koy('dur', sure, sure && ocrSure(sure.text));

  const tarih = degerBul(satirlar, OCR_ETIKET.tarih, {sayi: false});
  koy('tarih', tarih, tarih && ocrTarih(tarih.text));
  if (out.tarih == null) {
    // Etiket yoksa (Düzen B başlığı gibi) ilk geçerli tarihi satırlarda ara
    for (const s of satirlar) {
      const d = ocrTarih(s.text);
      if (d) { koy('tarih', {words: s.words}, d); break; }
    }
  }

  // SoC üç düzende üç ayrı biçimde geliyor; etiket araması tek başına yetmiyor
  // ("Başlangıç" kelimesi "Başlangıç Zamanı"nda da geçiyor ve tarihi yakalıyor).
  // Bu yüzden önce YÜZDE İŞARETİ olan satırlara bakılıyor.
  const yuzdeli = satirlar.filter(s => /%/.test(s.text));
  const ikili = yuzdeli.find(s => (s.text.match(/%/g) || []).length >= 2);
  if (ikili) {
    // Düzen A: "Başlangıç Bitiş" başlığının altında "%2  %90"
    const v = ocrSoc(ikili.text);
    koy('socB', {words: ikili.words}, v.bas);
    koy('socA', {words: ikili.words}, v.bit);
  } else {
    // Düzen B: her biri kendi satırında · Düzen C: yalnız bitiş
    const bas = yuzdeli.find(s => OCR_ETIKET.socBas.some(e => s.norm.includes(e)));
    const bit = yuzdeli.find(s => OCR_ETIKET.socBit.some(e => s.norm.includes(e)));
    if (bas) koy('socB', {words: bas.words}, ocrSoc(bas.text).bas);
    if (bit) koy('socA', {words: bit.words}, ocrSoc(bit.text).bas);
  }

  const ist = degerBul(satirlar, OCR_ETIKET.istasyon, {sayi: false});
  koy('loc', ist, ist && ist.text.replace(/^[:\s]+/, ''));
  if (out.loc == null && sablon === 'A' && satirlar[0])
    koy('loc', {words: satirlar[0].words}, satirlar[0].text);   // başlık = istasyon adı

  const istId = degerBul(satirlar, OCR_ETIKET.istId, {sayi: false});
  koy('istasyonId', istId, istId && istId.text.replace(/^[:\s]+/, ''));

  const soket = degerBul(satirlar, OCR_ETIKET.soket, {sayi: false});
  if (soket) {
    const n = ocrNorm(soket.text);
    const tip = /ccs/.test(n) ? 'CCS' : /chademo/.test(n) ? 'CHAdeMO'
      : /type\s*2|type2/.test(n) ? 'Type2' : /tesla/.test(n) ? 'Tesla' : null;
    if (tip) koy('soket', soket, tip);
    const guc = /(\d+)\s*kw/.exec(n);
    if (guc) koy('istGuc', soket, +guc[1]);
    if (/\bdc\b/.test(n)) koy('tip', soket, 'DC');
    else if (/\bac\b/.test(n)) koy('tip', soket, 'AC');
  }

  const plaka = degerBul(satirlar, OCR_ETIKET.plaka, {sayi: false});
  koy('plaka', plaka, plaka && plaka.text.replace(/^[:\s]+/, ''));

  return {alanlar: out, guven, sablon, satirlar};
}

/* ---------- BÖLÜM 3: ön işleme ---------- */
// Doğruluğun büyük kısmı burada. Ön işlenmiş görüntü kullanıcıya
// GÖSTERİLMEZ, yalnız OCR'a verilir.
function ocrOnisle(cv) {
  const olcek = cv.width < 1000 ? 2 : 1;                  // 1) 2× büyüt
  const w = cv.width * olcek, h = cv.height * olcek;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const cx = out.getContext('2d');
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(cv, 0, 0, w, h);

  const im = cx.getImageData(0, 0, w, h);
  const p = im.data;
  const gri = new Uint8ClampedArray(w * h);
  let min = 255, max = 0;
  for (let i = 0, j = 0; i < p.length; i += 4, j++) {     // 2) gri tonlama
    const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    gri[j] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const genislik = Math.max(1, max - min);
  for (let j = 0; j < gri.length; j++)                    // 3) lineer germe
    gri[j] = ((gri[j] - min) * 255) / genislik;

  // 4) uyarlamalı eşikleme (blok ~15px, C ~10). Sabit eşik kullanılmıyor:
  // ekran görüntülerinde arka plan gri tonları satırdan satıra değişiyor.
  const R = 7, C = 10;
  const topl = new Float64Array((w + 1) * (h + 1));       // integral görüntü
  for (let y = 0; y < h; y++) {
    let sat = 0;
    for (let x = 0; x < w; x++) {
      sat += gri[y * w + x];
      topl[(y + 1) * (w + 1) + (x + 1)] = topl[y * (w + 1) + (x + 1)] + sat;
    }
  }
  const alan = (x0, y0, x1, y1) =>
    topl[(y1 + 1) * (w + 1) + (x1 + 1)] - topl[y0 * (w + 1) + (x1 + 1)]
    - topl[(y1 + 1) * (w + 1) + x0] + topl[y0 * (w + 1) + x0];
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - R), y1 = Math.min(h - 1, y + R);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - R), x1 = Math.min(w - 1, x + R);
      const n = (x1 - x0 + 1) * (y1 - y0 + 1);
      const ortalama = alan(x0, y0, x1, y1) / n;
      const v = gri[y * w + x] < ortalama - C ? 0 : 255;
      const i = (y * w + x) * 4;
      p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = 255;
    }
  }
  cx.putImageData(im, 0, 0);
  return out;
}

/* ---------- BÖLÜM 2: tesseract sarmalayıcısı ---------- */
// Kütüphane uygulama paketinde DEĞİL. vendor/ocr/ altındaki dosyalar
// yoksa özellik kapalı kalır ve Ayarlar'daki anahtar bunu söyler.
const OCR_VENDOR = {
  lib:  'vendor/ocr/tesseract.min.js',
  worker: 'vendor/ocr/worker.min.js',
  core: 'vendor/ocr/tesseract-core-simd.wasm.js',
  lang: 'vendor/ocr/'          // tur.traineddata.gz + eng.traineddata.gz
};
const OCR_CACHE = 'watttrack-ocr';
let _ocrWorker = null;

async function ocrVarMi() {
  try {
    const r = await fetch(OCR_VENDOR.lib, {method: 'HEAD'});
    return r.ok;
  } catch { return false; }
}
// İndirilecek GERÇEK boyutu ölç — tahmini sayı yazma (madde 2/1).
async function ocrIndirmeBoyutu() {
  let toplam = 0;
  for (const u of [OCR_VENDOR.lib, OCR_VENDOR.worker, OCR_VENDOR.core,
                   OCR_VENDOR.lang + 'tur.traineddata.gz',
                   OCR_VENDOR.lang + 'eng.traineddata.gz']) {
    try {
      const r = await fetch(u, {method: 'HEAD'});
      const n = +(r.headers.get('content-length') || 0);
      toplam += n;
    } catch { /* ölçülemedi */ }
  }
  return toplam;
}
// wasm ve traineddata Cache API'ye yazılır ki ÇEVRİMDIŞI da çalışsın.
async function ocrOnbellekle() {
  const c = await caches.open(OCR_CACHE);
  await Promise.all([OCR_VENDOR.lib, OCR_VENDOR.worker, OCR_VENDOR.core,
    OCR_VENDOR.lang + 'tur.traineddata.gz', OCR_VENDOR.lang + 'eng.traineddata.gz']
    .map(u => c.add(u).catch(() => {})));
}
// Worker BİR KEZ kurulur, tekrar tekrar oluşturulmaz.
async function ocrWorker() {
  if (_ocrWorker) return _ocrWorker;
  if (!window.Tesseract) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = OCR_VENDOR.lib; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  await ocrOnbellekle();
  _ocrWorker = await window.Tesseract.createWorker('tur+eng', 1, {
    workerPath: OCR_VENDOR.worker,      // hepsi KENDİ origin'imiz
    corePath: OCR_VENDOR.core,
    langPath: OCR_VENDOR.lang,
    cacheMethod: 'none'                 // önbelleği biz yönetiyoruz
  });
  await _ocrWorker.setParameters({
    tessedit_pageseg_mode: '6',         // tek tip blok
    preserve_interword_spaces: '1'
    // tessedit_char_whitelist BİLEREK yok: Türkçe karakterler ve ₺/% gerekli
  });
  return _ocrWorker;
}
async function ocrKapat() {
  try { await _ocrWorker?.terminate(); } catch { /* zaten kapalı */ }
  _ocrWorker = null;
}
async function ocrOnbellekSil() {
  try { await caches.delete(OCR_CACHE); } catch { /* yok */ }
}

// Ana giriş: dosya -> {alanlar, guven, sablon}
async function ocrOku(file) {
  const cv = await fullResCanvas(file);        // WT-39/1: tam çözünürlük
  const hazir = ocrOnisle(cv);
  const w = await ocrWorker();
  const {data} = await w.recognize(hazir);
  return ocrAlanlar(data.words || []);
}
