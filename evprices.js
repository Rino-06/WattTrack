/* ============================================================
   WattTrack — gömülü fiyat tabloları
   WT-78: mesken elektrik fiyatı · WT-77: TR yakıt fiyatı geçmişi
   Modül DEĞİL, klasik script. Yükleme sırası index.html'de.

   AMAÇ: kullanıcı ülkesini seçtiğinde "ev/iş elektrik birim fiyatı"
   alanına makul bir VARSAYILAN düşsün. Kullanıcının girdiği değer
   ASLA ezilmez (bkz. ui/settings.js -> kwhPriceAutofill).

   HER KAYIT KAYNAĞINI VE TARİHİNİ TAŞIR. Kural 8 gereği hiçbir sayı
   hafızadan yazılmadı; hepsi aşağıdaki kaynaklardan çekildi
   (2026-08-09).

   BİRİM: ülkenin kendi parası cinsinden kWh başına fiyat.
   DİKKAT — kaynaklar aynı şeyi ölçmüyor, kutu bunu söylüyor:
     eurostat / eia : vergiler DAHİL ortalama birim fiyat
     desnz          : değişken birim fiyat (sabit günlük ücret HARİÇ)
     elcom          : toplam tarif (şebeke + vergi dahil), H4 medyanı
     hydroquebec    : vergiler HARİÇ, 1.000 kWh/ay tüketimli kent tarifesi

   KAPSANMAYAN ÜLKELER (kaynak bulunamadı, elle girilecek):
     MC, AD, SM
   ============================================================ */

const KWH_SRC = {
  // ad: EKRANDA GÖRÜNÜR — dilden bağımsız olsun diye yalnız kurum + tablo adı.
  // Ne ölçtükleri yukarıdaki başlık yorumunda yazılı.
  eurostat: {ad: 'Eurostat nrg_pc_204',
    url: 'https://ec.europa.eu/eurostat/databrowser/view/nrg_pc_204', guncel: '2026-08-06'},
  desnz: {ad: 'DESNZ QEP 2.2.4',
    url: 'https://www.gov.uk/government/statistical-data-sets/annual-domestic-energy-price-statistics', guncel: '2026-06-30'},
  elcom: {ad: 'ElCom (H4)',
    url: 'https://www.elcom.admin.ch/', guncel: '2025-09-09'},
  eia: {ad: 'EIA 861 / Table 4',
    url: 'https://www.eia.gov/electricity/sales_revenue_price/', guncel: '2025-10-07'},
  hydroquebec: {ad: 'Hydro-Québec 2024',
    url: 'https://www.hydroquebec.com/data/documents-donnees/pdf/comparison-electricity-prices-2024.pdf', guncel: '2024-04-01'}
};

/* p: kWh başına fiyat (cur cinsinden) · y: verinin ait olduğu yıl
   s: KWH_SRC anahtarı · half: yılın yalnız bir yarısı yayınlanmış
   sub: alt bölge (ABD eyaleti / Kanada ili). Kanada'da ülke geneli
   ortalaması YOK — yayınlanmış bir ulusal sayı bulunamadı, o yüzden
   p:null; kullanıcı il seçmeden varsayılan doldurulmuyor. */
const KWH_PRICES = {
  AL: {p:11.4, cur:'ALL', y:2025, s:'eurostat'},
  AT: {p:0.3088, cur:'EUR', y:2025, s:'eurostat'},
  BA: {p:0.1859, cur:'BAM', y:2025, s:'eurostat'},
  BE: {p:0.3535, cur:'EUR', y:2025, s:'eurostat'},
  BG: {p:0.2597, cur:'BGN', y:2025, s:'eurostat'},
  CA: {p:null, cur:'CAD', y:2024, s:'hydroquebec', sub:{QC:{p:0.0805,ad:'Québec (Montréal)'},
    MB:{p:0.1053,ad:'Manitoba (Winnipeg)'},
    BC:{p:0.1206,ad:'British Columbia (Vancouver)'},
    NL:{p:0.1462,ad:'Newfoundland and Labrador (St. John’s)'},
    ON:{p:0.1506,ad:'Ontario (Toronto)'},
    NB:{p:0.163,ad:'New Brunswick (Moncton)'},
    SK:{p:0.1789,ad:'Saskatchewan (Regina)'},
    PE:{p:0.1913,ad:'Prince Edward Island (Charlottetown)'},
    NS:{p:0.1946,ad:'Nova Scotia (Halifax)'},
    AB:{p:0.2317,ad:'Alberta (Calgary)'}}},
  CH: {p:0.277, cur:'CHF', y:2026, s:'elcom'},
  CY: {p:0.2853, cur:'EUR', y:2025, s:'eurostat'},
  CZ: {p:7.8965, cur:'CZK', y:2025, s:'eurostat'},
  DE: {p:0.3852, cur:'EUR', y:2025, s:'eurostat'},
  DK: {p:2.5366, cur:'DKK', y:2025, s:'eurostat'},
  EE: {p:0.2301, cur:'EUR', y:2025, s:'eurostat'},
  ES: {p:0.2641, cur:'EUR', y:2025, s:'eurostat'},
  FI: {p:0.2265, cur:'EUR', y:2025, s:'eurostat'},
  FR: {p:0.2616, cur:'EUR', y:2025, s:'eurostat'},
  GB: {p:0.2551, cur:'GBP', y:2025, s:'desnz'},
  GR: {p:0.2336, cur:'EUR', y:2025, s:'eurostat'},
  HR: {p:0.1638, cur:'EUR', y:2025, s:'eurostat'},
  HU: {p:42.1859, cur:'HUF', y:2025, s:'eurostat'},
  IE: {p:0.3637, cur:'EUR', y:2025, s:'eurostat'},
  IS: {p:29.31, cur:'ISK', y:2025, s:'eurostat', half:1},
  IT: {p:0.3128, cur:'EUR', y:2025, s:'eurostat'},
  LI: {p:0.2855, cur:'CHF', y:2025, s:'eurostat'},
  LT: {p:0.2032, cur:'EUR', y:2025, s:'eurostat'},
  LU: {p:0.2665, cur:'EUR', y:2025, s:'eurostat'},
  LV: {p:0.2446, cur:'EUR', y:2025, s:'eurostat'},
  MD: {p:4.0378, cur:'MDL', y:2025, s:'eurostat'},
  ME: {p:0.0985, cur:'EUR', y:2025, s:'eurostat'},
  MK: {p:7.0963, cur:'MKD', y:2025, s:'eurostat'},
  MT: {p:0.1271, cur:'EUR', y:2025, s:'eurostat'},
  NL: {p:0.2476, cur:'EUR', y:2025, s:'eurostat'},
  NO: {p:2.2891, cur:'NOK', y:2025, s:'eurostat'},
  PL: {p:1.1166, cur:'PLN', y:2025, s:'eurostat'},
  PT: {p:0.2412, cur:'EUR', y:2025, s:'eurostat'},
  RO: {p:1.2148, cur:'RON', y:2025, s:'eurostat'},
  RS: {p:13.4295, cur:'RSD', y:2025, s:'eurostat'},
  SE: {p:2.9683, cur:'SEK', y:2025, s:'eurostat'},
  SI: {p:0.1966, cur:'EUR', y:2025, s:'eurostat'},
  SK: {p:0.187, cur:'EUR', y:2025, s:'eurostat'},
  TR: {p:2.8076, cur:'TRY', y:2025, s:'eurostat'},
  US: {p:0.1648, cur:'USD', y:2024, s:'eia', sub:{AK:0.2482,AL:0.1518,AR:0.1232,AZ:0.1491,CA:0.3197,CO:0.1492,CT:0.2875,DC:0.1771,DE:0.1657,FL:0.1414,GA:0.1408,HI:0.4286,IA:0.134,ID:0.1152,IL:0.1587,IN:0.1477,KS:0.1415,KY:0.1279,LA:0.1173,MA:0.2935,MD:0.1786,ME:0.2429,MI:0.193,MN:0.1545,MO:0.1291,MS:0.1339,MT:0.1266,NC:0.1413,ND:0.1151,NE:0.1153,NH:0.234,NJ:0.1934,NM:0.142,NV:0.15,NY:0.2443,OH:0.1599,OK:0.1224,OR:0.147,PA:0.1777,RI:0.2865,SC:0.1423,SD:0.1286,TN:0.1242,TX:0.1494,UT:0.1222,VA:0.1441,VT:0.219,WA:0.119,WI:0.1718,WV:0.1507,WY:0.1247}},
  XK: {p:0.0822, cur:'EUR', y:2025, s:'eurostat'}
};

// Ülke (ve varsa alt bölge) için varsayılan fiyat. Bulunamazsa null.
function defaultKwhPrice(country, region) {
  const c = KWH_PRICES[country];
  if (!c) return null;
  if (region && c.sub && c.sub[region] != null) {
    const v = c.sub[region];
    const p = typeof v === 'object' ? v.p : v;
    return {p, cur: c.cur, y: c.y, s: c.s, region};
  }
  if (c.p == null) return null;
  return {p: c.p, cur: c.cur, y: c.y, s: c.s, region: null};
}

// Ülkenin alt bölgeleri: [[kod, ad], …] ya da null.
function kwhRegions(country) {
  const c = KWH_PRICES[country];
  if (!c || !c.sub) return null;
  return Object.keys(c.sub).sort().map(k => {
    const v = c.sub[k];
    return [k, typeof v === 'object' ? v.ad : k];
  });
}

/* ============================================================
   WT-77 — Türkiye yakıt fiyatı geçmişi (son 36 ay)
   Kaynak: EPDK Petrol ve LPG Piyasası AYLIK FİYATLANDIRMA RAPORU
   (her ayın raporundaki Tablo-1 benzin, Tablo-2 motorin "Nihai Satış
   Fiyatı" ve Tablo-5 otogaz "Toplam Fiyat" satırları).
   https://www.epdk.gov.tr/Detay/Icerik/3-0-143/fiyatlandirma-raporu
   Çekim tarihi: 2026-08-09 · Kapsam: 2023-08 … 2026-07 (36 ay, boşluksuz)

   DİKKAT (EPDK'nın kendi kaydı): bu rakamlar "gösterge niteliğinde"dir ve
   İSTANBUL AVRUPA YAKASI vergiler dahil ortalamalarıdır — Türkiye geneli
   ortalaması değildir. Bölgeler arasında birkaç kuruş fark olur.

   Değerler TL/lt, vergiler dahil. Ay anahtarı o ayın ORTALAMASIDIR;
   ayın 1'ine yazılıyor, yani o ay boyunca geçerli sayılıyor.
   Sıra: [benzin (petrol), motorin (diesel), otogaz (lpg)]
   ============================================================ */
const FUEL_HIST = {
  TR: {src: 'epdk', tur: ['petrol', 'diesel', 'lpg'], m: {
    '2023-08': [36.934, 37.37, 16.453],
    '2023-09': [37.533, 39.181, 17.738],
    '2023-10': [34.541, 38.906, 18.664],
    '2023-11': [34.517, 37.679, 18.746],
    '2023-12': [33.977, 36.423, 18.782],
    '2024-01': [37.083, 39.455, 20.055],
    '2024-02': [40.108, 42.53, 20.675],
    '2024-03': [41.831, 41.421, 22.091],
    '2024-04': [43.543, 41.854, 22.69],
    '2024-05': [42.649, 40.429, 21.351],
    '2024-06': [40.903, 40.67, 20.649],
    '2024-07': [44.752, 44.352, 23.292],
    '2024-08': [43.992, 43.599, 23.642],
    '2024-09': [42.109, 42.356, 25.415],
    '2024-10': [43.481, 42.957, 25.672],
    '2024-11': [42.719, 43.2, 26.514],
    '2024-12': [42.827, 43.687, 26.578],
    '2025-01': [45.492, 46.294, 26.785],
    '2025-02': [46.381, 46.774, 27.733],
    '2025-03': [45.271, 45.921, 28.003],
    '2025-04': [45.376, 45.261, 27.96],
    '2025-05': [46.149, 45.456, 26.912],
    '2025-06': [48.495, 48.809, 25.799],
    '2025-07': [51.093, 53.141, 26.654],
    '2025-08': [51.711, 52.397, 27.15],
    '2025-09': [53.001, 54.133, 27.175],
    '2025-10': [52.464, 53.904, 28.395],
    '2025-11': [54.221, 57.072, 28.496],
    '2025-12': [53.021, 53.875, 29.213],
    '2026-01': [53.809, 55.395, 29.969],
    '2026-02': [56.458, 58.17, 30.818],
    '2026-03': [61.044, 67.597, 31.098],
    '2026-04': [62.79, 74.172, 35.644],
    '2026-05': [64.424, 68.336, 34.897],
    '2026-06': [62.769, 65.417, 32.777],
    '2026-07': [64.706, 71.408, 32.139]
  }}
};

const FUEL_HIST_SRC = {
  epdk: {ad: 'EPDK Fiyatlandırma Raporu',
    url: 'https://www.epdk.gov.tr/Detay/Icerik/3-0-143/fiyatlandirma-raporu',
    guncel: '2026-08-09'}
};

/* Gömülü geçmişi allFuelPrices() biçiminde döndürür. Kullanıcının kendi
   girdiği fiyatlar HER ZAMAN üstün: aynı tarih + tür varsa gömülü satır
   elenir. Gömülü satırlarda id YOKTUR ve gomulu:true taşırlar — silme
   düğmesi bu yüzden çizilmiyor. Veri tabanına HİÇBİR ŞEY yazılmaz. */
function fuelHistMerge(kullanici, country) {
  const g = FUEL_HIST[country];
  if (!g) return kullanici || [];
  const varOlan = new Set((kullanici || [])
    .filter(x => !x.ulke || x.ulke === country)
    .map(x => x.tarih.slice(0, 10) + '|' + x.tur));
  const gomulu = [];
  for (const [ay, degerler] of Object.entries(g.m)) {
    const tarih = ay + '-01';
    g.tur.forEach((tur, i) => {
      if (degerler[i] == null) return;
      if (varOlan.has(tarih + '|' + tur)) return;
      gomulu.push({tarih, tur, fiyat: degerler[i], ulke: country,
        gomulu: true, src: g.src});
    });
  }
  return (kullanici || []).concat(gomulu);
}

