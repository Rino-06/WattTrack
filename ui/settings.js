/* ============================================================
   WattTrack — settings
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Ayarlar ---- */
// ============================================================
// AYARLAR
// ============================================================
async function renderSettings() {
  $('app-version').textContent = APP_VERSION + ' · ' + APP_DATE;
  $('set-homekwh').value = S.homeKwhPrice != null ? fmtInput(S.homeKwhPrice, 2) : '';
  $('set-homekwh-lbl').textContent = t('homeKwhPrice') + ' — ' + sym();
  // WT-45/1: bütçe isteğe bağlı (boş = kapalı)
  $('set-budget-m').value = S.budgetM > 0 ? fmtInput(S.budgetM, 0) : '';
  $('set-budget-y').value = S.budgetY > 0 ? fmtInput(S.budgetY, 0) : '';
  $('set-budget-m-lbl').textContent = t('budgetMonthly') + ' — ' + sym();
  $('set-budget-y-lbl').textContent = t('budgetYearly') + ' — ' + sym();
  const c = COUNTRIES.find(x => x[0] === S.country);
  $('set-country-val').textContent = c ? c[1] + ' ' + c[2] : '—';

  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('set-currency').innerHTML = curs.map(k =>
    `<option value="${k}" ${k === S.currency ? 'selected' : ''}>${k} (${symOf(k)})</option>`).join('');
  $('set-unit').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === S.unit));
  $('set-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}" ${k === S.lang ? 'selected' : ''}>${LANG_NAMES[k]}</option>`).join('');
  renderKwhDefault();
  $('set-adv').checked = !!S.advOpen;
  $('set-theme').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (S.theme || 'light')));
  renderBankCountries();
}


/* ---- WT-78: gömülü elektrik fiyatı tablosundan varsayılan ----
   Kural: KULLANICININ GİRDİĞİ DEĞER ASLA EZİLMEZ. Tablo yalnız iki
   durumda devreye girer: alan hiç doldurulmamışsa (homeKwhPrice == null)
   kendiliğinden, ya da kullanıcı "önerilen fiyatı kullan" düğmesine
   basarsa. Kaynak ve yıl her zaman alanın altında yazılı. */
function renderKwhDefault() {
  const bolgeler = typeof kwhRegions === 'function' ? kwhRegions(S.country) : null;
  $('wrap-kwh-region').style.display = bolgeler ? '' : 'none';
  if (bolgeler) {
    $('set-kwhregion').innerHTML = `<option value="">${esc(t('kwhRegionPick'))}</option>`
      + bolgeler.map(([k, ad]) => `<option value="${k}">${esc(ad)}</option>`).join('');
    $('set-kwhregion').value = S.kwhRegion || '';
  }
  const d = defaultKwhPrice(S.country, S.kwhRegion);
  const src = $('set-kwh-src'), btn = $('btn-kwh-default');
  if (!d) { src.style.display = 'none'; btn.style.display = 'none'; return; }
  const k = KWH_SRC[d.s];
  src.style.display = '';
  src.textContent = t('kwhSrcNote',
    {v: fm(symOf(d.cur), fmtNum(d.p, 2)), y: d.y, s: k ? k.ad : d.s});
  // Alan zaten bu değerdeyse düğmeyi gösterme
  const ayni = S.homeKwhPrice != null && Math.abs(S.homeKwhPrice - d.p) < 1e-9;
  btn.style.display = ayni ? 'none' : '';
  btn.textContent = t('kwhUseDefault', {v: fm(symOf(d.cur), fmtNum(d.p, 2))});
}

// Alan boşken tabloyu uygula. Dolu bir değerin üstüne YAZMAZ.
async function kwhPriceAutofill() {
  if (S.homeKwhPrice != null) return false;
  const d = defaultKwhPrice(S.country, S.kwhRegion);
  if (!d) return false;
  S.homeKwhPrice = d.p;
  await saveSetting('homeKwhPrice', d.p);
  return true;
}

$('set-kwhregion').addEventListener('change', async () => {
  S.kwhRegion = $('set-kwhregion').value;
  await saveSetting('kwhRegion', S.kwhRegion);
  await kwhPriceAutofill();
  renderSettings();
});
$('btn-kwh-default').addEventListener('click', async () => {
  const d = defaultKwhPrice(S.country, S.kwhRegion);
  if (!d) return;
  S.homeKwhPrice = d.p;
  await saveSetting('homeKwhPrice', d.p);
  toast(t('savedLocal'));
  renderSettings();
});


/* ---- Onboarding ---- */
// ============================================================
// ONBOARDING (kompakt: açılır listeler)
// ============================================================
let obEv = null;
function initOnboarding() {
  $('ob-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join('');
  $('ob-country').value = 'TR';
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('ob-currency').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  $('ob-currency').value = 'TRY';
  $('ob-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}">${LANG_NAMES[k]}</option>`).join('');
  $('ob-lang').value = S.lang;

  $('ob-country').addEventListener('change', () => {
    const c = COUNTRIES.find(x => x[0] === $('ob-country').value);
    $('ob-currency').value = c[3];
    $('ob-unit').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === c[5]));
    if (LANG_NAMES[c[6]]) {
      $('ob-lang').value = c[6];
      S.lang = c[6];
      applyI18n();
    }
  });
  $('ob-lang').addEventListener('change', () => {
    S.lang = $('ob-lang').value;
    applyI18n();
  });
  $('ob-unit').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('ob-unit').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  });
  $('ob-next').addEventListener('click', () => {
    $('ob-step1').style.display = 'none';
    $('ob-step2').style.display = '';
    $('obp2').classList.add('on');
  });
  $('ob-back').addEventListener('click', () => {
    $('ob-step2').style.display = 'none';
    $('ob-step1').style.display = '';
    $('obp2').classList.remove('on');
  });
  bindEVSearch('ob-ev-search', 'ob-ev-results', 'ob-ev-summary', v => {
    obEv = v;
    $('ob-done').disabled = !v;
    $('ob-km-wrap').style.display = v ? '' : 'none';
    // Araç seçilince arama kutusu ve sonuç listesi kapanır — km alanı öne çıkar
    $('ob-ev-search').style.display = v ? 'none' : '';
    $('ob-ev-results').style.display = v ? 'none' : '';
    $('ob-change-car').style.display = v ? '' : 'none';
  }, false);
  $('ob-change-car').addEventListener('click', () => {
    obEv = null;
    $('ob-done').disabled = true;
    $('ob-km-wrap').style.display = 'none';
    $('ob-ev-summary').style.display = 'none';
    $('ob-change-car').style.display = 'none';
    $('ob-ev-search').style.display = '';
    $('ob-ev-results').style.display = '';
    $('ob-ev-results').innerHTML = '';
    $('ob-ev-search').value = '';
    $('ob-km').value = '';
    $('ob-ev-search').focus();
  });
  $('ob-skip').addEventListener('click', () => finishOnboarding(false));
  $('ob-done').addEventListener('click', () => finishOnboarding(true));
}
async function finishOnboarding(withCar) {
  S.country = $('ob-country').value;
  S.currency = $('ob-currency').value;
  S.unit = $('ob-unit').querySelector('.sel').dataset.v;
  S.lang = $('ob-lang').value;
  S.onboarded = true;
  for (const [k, v] of [['country', S.country], ['currency', S.currency],
    ['unit', S.unit], ['lang', S.lang], ['onboarded', true]])
    await saveSetting(k, v);
  if (!S.bankCountries) { S.bankCountries = [S.country]; await saveSetting('bankCountries', S.bankCountries); }
  if (withCar && obEv) {
    const rec = vehicleRec(obEv);
    const kmIn = pf($('ob-km').value);
    if (!isNaN(kmIn) && kmIn > 0) {
      const km = S.unit === 'mi' ? kmIn * MI : kmIn;
      rec.kmStart = Math.round(km); rec.kmNow = Math.round(km);
    }
    const id = await db.vehicles.add(rec);
    S.defaultVehicleId = id;
    await saveSetting('defaultVehicleId', id);
  }
  overlayClose('ob', {force: true});
  applyI18n();
  renderDashboard();
}


/* ---- Yedekleme ---- */
// ============================================================
// YEDEKLEME
// ============================================================
function today() { return localISO(); }
function download(content, name, type) {
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// WT-36/3f: örnek veri yedeğe GİRMEZ — kullanıcı yanlışlıkla sahte veriyi
// yedekleyip sonra gerçek sanmasın. Ayrı fonksiyon: testten doğrulanabilsin.
async function backupPayload() {
  return {
    app: 'WattTrack', version: SCHEMA_VERSION, appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    // WT-49/5: `ekranGorVar` bir ÖNBELLEK artefaktı, veri değil — yedeğe
    // girerse geri yüklemede görselsiz bir ataç ikonu çıkar. Ekran
    // görüntüleri yedeğe HİÇ girmiyor: JSON.stringify bir Blob'u `{}` yapar,
    // yani zaten aktarılamıyorlardı; artık sessizce bozuk çıkmıyorlar.
    sessions: (await allSessions()).filter(r => !isDemo(r))
      .map(({ekranGorVar, ...r}) => r),
    vehicles: (await allVehicles()).filter(r => !isDemo(r)),
    expenses: (await allExpenses()).filter(r => !isDemo(r)),
    settings: await db.settings.toArray()
  };
}
$('btn-export-json').addEventListener('click', async () => {
  const payload = await backupPayload();
  download(JSON.stringify(payload, null, 2), `watttrack-yedek-${today()}.json`, 'application/json');
  toast(t('jsonDone'));
});
// WT-48: dışa aktarma gövdesi ayrı fonksiyona alındı — JSON tarafındaki
// backupPayload() ile aynı gerekçe: gidiş-dönüş testten doğrulanabilsin.
// İçe aktarmanın kayıpsız olabilmesi için başlığa dört sütun EKLENDİ:
// Saat (eskiden gün kırpılıyordu, mükerrer tespiti ve sıralama bozuluyordu),
// Mekan (WT-16'nın evis/firma boyutu), Odometre (WT-19) ve Atlanan (WT-20).
const CSV_HEAD = ['Tarih','Saat','Ulke','ParaBirimi','Kur','Firma','Mekan','Tip',
  'Ucretsiz','kWh','Odenen','OdenenTemel','Indirim','ListeTutar','BirimFiyat',
  'Banka','MesafeKm','Odometre','SureDk','SoCOnce','SoCSonra','Atlanan',
  'Lokasyon','Arac','Not'];
async function csvPayload() {
  const rows = (await allSessions()).filter(r => !isDemo(r))   // WT-36/3f
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const vehicles = await allVehicles();
  const vn = id => { const v = vehicles.find(x => x.id === id); return v ? vehName(v) : ''; };
  const num = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
  // CSV formül enjeksiyonuna karşı koruma: =,+,-,@ ile başlayan metinleri etkisizleştir
  const safe = s => {
    let v = (s || '').toString().replace(/;/g, ',').replace(/[\r\n]/g, ' ');
    if (/^[=+\-@]/.test(v)) v = "'" + v;
    return v;
  };
  const lines = [CSV_HEAD.join(';')];
  rows.forEach(r => {
    const sav = savingsOf(r);
    lines.push([
      r.tarih.slice(0, 10), r.tarih.slice(11, 16), r.ulke || '', r.cur || '',
      r.rate ? num(r.rate) : '',
      safe(r.firma), r.mekan || '', r.tip || '', r.free ? 1 : 0, num(r.kwh),
      num(r.odenen), num(amtB(r)), num(sav), num(r.odenen + sav),
      r.kwh ? num(r.odenen / r.kwh) : '', safe(r.banka),
      r.mesafeKm ? num(r.mesafeKm) : '', r.odo ?? '',
      r.dur ?? '', r.socB ?? '', r.socA ?? '', r.atlanan ? 1 : 0,
      safe(r.loc), safe(vn(r.aracId)), safe(r.not)
    ].join(';'));
  });
  return '\uFEFF' + lines.join('\r\n');
}
$('btn-export-csv').addEventListener('click', async () => {
  download(await csvPayload(), `watttrack-${today()}.csv`, 'text/csv;charset=utf-8');
  toast(t('csvDone'));
});
$('btn-import').addEventListener('click', () => $('file-import').click());

/* ---- WT-48: CSV içe aktarma ---- */
// Dışa aktarma CSV + JSON'du, içe aktarma yalnız JSON. Kullanıcı verisini
// Excel/Power BI'da düzenleyip geri koyamıyordu.
//
// Ayrıştırıcı KENDİ dışa aktarmamızdan fazlasını okumak zorunda: madde
// "başka uygulamalardan göç mümkün olsun" diyor. Bizim çıktımız hiç tırnak
// kullanmıyor (safe() `;` yerine `,` yazıyor), ama yabancı bir dosya `,`
// ayraçlı ve RFC4180 tırnaklı gelir.
function csvSplitLines(text) {
  // Tırnak İÇİNDEKİ satır sonu alan verisidir, satır sonu değil.
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { q = !q; cur += c; continue; }
    if (!q && (c === '\n' || c === '\r')) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      out.push(cur); cur = '';
      continue;
    }
    cur += c;
  }
  if (cur) out.push(cur);
  return out.filter(l => l.trim() !== '');
}
function csvSplitFields(line, delim) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  // Excel'in metin kaçışı ('=1+1) geri alınıyor — dışa aktarmada biz koyduk
  return out.map(v => v.trim().replace(/^'(?=[=+\-@])/, ''));
}
function parseCSV(text) {
  const lines = csvSplitLines(String(text).replace(/^﻿/, ''));
  if (!lines.length) return {head: [], rows: [], delim: ';'};
  // Ayraç sezgisi: başlık satırında TIRNAK DIŞINDA en çok geçen aday kazanır
  const sayim = d => csvSplitFields(lines[0], d).length;
  const delim = [';', ',', '\t', '|'].reduce((a, b) => sayim(b) > sayim(a) ? b : a, ';');
  const head = csvSplitFields(lines[0], delim);
  const rows = lines.slice(1).map(l => csvSplitFields(l, delim));
  return {head, rows, delim};
}

// Eşlenebilir alanlar. `alias` yalnız OTOMATİK eşleme içindir; kullanıcı
// eşleme ekranından her zaman elle değiştirebilir (maddenin 4. şıkkı).
const CSV_FIELDS = [
  {key: 'tarih',  lbl: 'date',        zorunlu: true,
   alias: ['tarih', 'date', 'datum', 'fecha', 'data', 'gun']},
  {key: 'saat',   lbl: 'time',        alias: ['saat', 'time', 'zeit', 'heure', 'hora', 'ora']},
  {key: 'firma',  lbl: 'firm',        zorunlu: true,
   alias: ['firma', 'operator', 'sarjfirmasi', 'anbieter', 'operateur', 'operador', 'network', 'provider']},
  {key: 'kwh',    lbl: 'fldKwh',      zorunlu: true, alias: ['kwh', 'energy', 'enerji', 'energie', 'energia']},
  {key: 'odenen', lbl: 'fldAmount',   zorunlu: true,
   alias: ['odenen', 'tutar', 'amount', 'paid', 'cost', 'betrag', 'montant', 'importe', 'importo', 'ucret']},
  {key: 'tutar',  lbl: 'listAmount',  alias: ['listetutar', 'listprice', 'gross', 'brut', 'brutto']},
  {key: 'indirim', lbl: 'fldDisc',    alias: ['indirim', 'discount', 'rabatt', 'remise', 'descuento', 'sconto', 'saving']},
  {key: 'tip',    lbl: 'chargeType',  alias: ['tip', 'type', 'typ', 'tipo']},
  {key: 'mekan',  lbl: 'place',       alias: ['mekan', 'place', 'ort', 'lieu', 'lugar', 'luogo']},
  {key: 'free',   lbl: 'free',        alias: ['ucretsiz', 'free', 'gratis', 'gratuit', 'gratuito']},
  {key: 'cur',    lbl: 'currency',    alias: ['parabirimi', 'currency', 'wahrung', 'devise', 'moneda', 'valuta']},
  {key: 'ulke',   lbl: 'country',     alias: ['ulke', 'country', 'land', 'pays', 'pais', 'paese']},
  {key: 'rate',   lbl: 'fldRate',     alias: ['kur', 'rate', 'kurs', 'taux', 'tasa', 'tasso']},
  {key: 'banka',  lbl: 'bank',        alias: ['banka', 'bank', 'banque', 'banco', 'banca', 'card', 'kart']},
  {key: 'mesafeKm', lbl: 'fldDist',   alias: ['mesafekm', 'mesafe', 'distance', 'distanz', 'km', 'strecke']},
  {key: 'odo',    lbl: 'fldOdo',      alias: ['odometre', 'odometer', 'odo', 'kilometerstand', 'sayac']},
  {key: 'dur',    lbl: 'duration',    alias: ['suredk', 'sure', 'duration', 'dauer', 'duree', 'duracion', 'durata']},
  {key: 'socB',   lbl: 'socStart',    alias: ['soconce', 'socbefore', 'socstart', 'baslangicsoc']},
  {key: 'socA',   lbl: 'socEnd',      alias: ['socsonra', 'socafter', 'socend', 'bitissoc']},
  {key: 'atlanan', lbl: 'missedTag',  alias: ['atlanan', 'missed', 'skipped']},
  {key: 'loc',    lbl: 'location',    alias: ['lokasyon', 'location', 'ort', 'lieu', 'ubicacion', 'posizione', 'yer']},
  {key: 'arac',   lbl: 'vehicle',     alias: ['arac', 'vehicle', 'fahrzeug', 'vehicule', 'vehiculo', 'veicolo', 'car']},
  {key: 'not',    lbl: 'note',        alias: ['not', 'note', 'notiz', 'nota', 'comment', 'aciklama']}
];
// Başlıkları eşlerken aksan, boşluk ve noktalama atılıyor: "Şarj Firması",
// "sarj_firmasi" ve "SARJFIRMASI" aynı anahtara düşsün.
const csvNorm = s => String(s || '').toLocaleLowerCase('tr')
  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
  .replace(/ö/g, 'o').replace(/ç/g, 'c')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]/g, '');
function csvAutoMap(head) {
  const norm = head.map(csvNorm);
  const map = {};
  for (const f of CSV_FIELDS) {
    const i = norm.findIndex((h, ix) => h && f.alias.includes(h) &&
      !Object.values(map).includes(ix));
    if (i > -1) map[f.key] = i;
  }
  return map;
}

// Bir CSV satırını kayda çevirir. Doğrulama form ile AYNI yardımcıları
// kullanıyor (pf / checkNum / isValidDate) — "hatalı" sayılan satır formun
// da reddedeceği satır olsun.
function csvRowToRec(cols, map, vehId) {
  const al = k => map[k] == null ? '' : (cols[map[k]] ?? '').trim();
  const bool = v => /^(1|true|evet|yes|ja|oui|si|sì|x)$/i.test(v.trim());
  const hata = [];

  let tarih = al('tarih');
  // gg.aa.yyyy ve aa/gg/yyyy gibi yerel biçimler ISO'ya çevrilir
  const m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(tarih);
  if (m) tarih = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  tarih = tarih.slice(0, 10);
  if (!isValidDate(tarih)) hata.push(t('csvBadDate'));

  // Saat: sütun yoksa 12:00. WT-19'un mesafe türetmesi ve mükerrer tespiti
  // tarih DİZGİSİNİ sıralıyor, bu yüzden boş bırakılamaz.
  const sa = /^(\d{1,2}):(\d{2})/.exec(al('saat'));
  const saat = sa ? `${sa[1].padStart(2, '0')}:${sa[2]}` : '12:00';

  const firma = al('firma');
  if (!firma) hata.push(t('csvNoFirm'));

  const free = bool(al('free'));
  const k = checkNum('kwh', al('kwh'), {required: true});
  if (!k.ok) hata.push(k.msg);
  const o = checkNum('tutar', al('odenen'), {required: !free});
  if (!o.ok) hata.push(o.msg);

  if (hata.length) return {hata};

  const rec = {
    tarih: `${tarih}T${saat}`,
    firma,
    // WT-16: mekan boyutu CSV'de yoksa firmadan TÜRETİLİR. Atlanırsa
    // ev şarjları donutta ve Ev-İş hesabında yanlış sınıflanır.
    mekan: al('mekan') === 'evis' || al('mekan') === 'firma'
      ? al('mekan') : (isHomeFirm(firma) ? 'evis' : 'firma'),
    kwh: k.value,
    odenen: free ? 0 : (o.value ?? 0),
    free,
    cur: al('cur').toUpperCase() || S.currency,
    aracId: vehId ?? null
  };
  const tip = al('tip').toUpperCase();
  rec.tip = tip === 'AC' ? 'AC' : 'DC';
  const ulke = al('ulke').toUpperCase();
  if (ulke && COUNTRIES.some(c => c[0] === ulke)) rec.ulke = ulke;
  // İndirim: savingsOf() ÖNCE `indirim` alanına bakıyor (calc.js). Bu sütun
  // atlanırsa içe aktarılan her satırın kazancı sıfırlanır — form yolunda
  // indirim `indirimTip`/`indirimDeger` ile saklanıyor ama CSV'de tek bir
  // tutar var, `indirim` alanı tam olarak bunun için duruyor.
  const ind = checkNum('indirim', al('indirim'));
  if (ind.ok && ind.value) rec.indirim = ind.value;
  // ListeTutar brüt tutar; tutarlı olsun diye indirimle birlikte yazılıyor.
  const lt = checkNum('tutar', al('tutar'));
  if (lt.ok && lt.value != null && lt.value >= rec.odenen) rec.tutar = lt.value;
  else if (rec.indirim) rec.tutar = rec.odenen + rec.indirim;
  const opt = [['rate', 'kur'], ['mesafeKm', 'mesafe'], ['odo', 'odo'],
    ['socB', 'soc'], ['socA', 'soc']];
  for (const [key, kural] of opt) {
    const c = checkNum(kural, al(key));
    if (c.ok && c.value != null) rec[key] = c.value;
  }
  const dur = pf(al('dur'), 0);
  if (!isNaN(dur) && dur > 0 && dur <= 48 * 60) rec.dur = Math.round(dur);
  if (bool(al('atlanan'))) rec.atlanan = true;     // WT-20
  ['loc', 'banka', 'not'].forEach(key => { if (al(key)) rec[key] = al(key); });
  return {rec};
}
// WT-48/3: mükerrer tespiti. JSON tarafındaki imza TAM `tarih` dizgisini
// kullanıyor; CSV'de saat sütunu olmayabildiği için burada GÜN'e iniliyor,
// yoksa kendi dışa aktarmamızı geri okumak her satırı mükerrer değil sayardı.
const csvSig = r => [r.tarih.slice(0, 10), r.firma,
  Math.round(r.kwh * 100), Math.round((r.odenen || 0) * 100), r.cur || ''].join('|');

// WT-48/3+4: önizleme ve sütun eşleme ekranı. İkisi de KULLANICI ETKİLEŞİMİ
// olduğu için transaction'dan ÖNCE bitiyor — bir onay beklemesi Dexie
// transaction'ını bloklar ve zaman aşımına düşürür (aynı gerekçe JSON
// yolunda da yazılı).
let _csvDurum = null;
async function openCsvImport(text) {
  const {head, rows} = parseCSV(text);
  if (!rows.length) { toast(t('importFail')); return; }
  _csvDurum = {head, rows, map: csvAutoMap(head)};
  const box = $('csv-map');
  // Eşleme ekranı: her uygulama alanı için CSV sütunu seçilebiliyor. Bizim
  // kendi çıktımızda hepsi otomatik dolu gelir, yabancı dosyada kullanıcı seçer.
  box.innerHTML = CSV_FIELDS.map(f => `
    <div class="switchrow">
      <div><div class="k">${esc(t(f.lbl))}${f.zorunlu ? ' *' : ''}</div></div>
      <select data-f="${f.key}" aria-label="${esc(t(f.lbl))}">
        <option value="">—</option>
        ${head.map((h, i) => `<option value="${i}">${esc(h || '#' + (i + 1))}</option>`).join('')}
      </select>
    </div>`).join('');
  box.querySelectorAll('select').forEach(s => {
    s.value = _csvDurum.map[s.dataset.f] ?? '';
    s.addEventListener('change', () => {
      const v = s.value;
      if (v === '') delete _csvDurum.map[s.dataset.f];
      else _csvDurum.map[s.dataset.f] = +v;
      csvOnizle();
    });
  });
  await csvOnizle();
  overlayOpen('page-csv');
}
async function csvOnizle() {
  const {rows, map} = _csvDurum;
  const mevcut = new Set((await allSessions()).map(csvSig));
  const gorulen = new Set();
  const iyi = [], hatali = [];
  let mukerrer = 0;
  rows.forEach((cols, i) => {
    const {rec, hata} = csvRowToRec(cols, map, null);
    if (hata) { hatali.push({no: i + 2, msg: hata.join(', ')}); return; }
    const s = csvSig(rec);
    // Dosyanın KENDİ içindeki tekrarlar da mükerrer sayılıyor
    if (mevcut.has(s) || gorulen.has(s)) { mukerrer++; return; }
    gorulen.add(s);
    // Kaynak sütunlar kayıtla birlikte taşınıyor: araç adı → id eşlemesi
    // onaydan SONRA yapılıyor ve o zaman satırı yeniden bulmak gerekiyor.
    iyi.push({rec, cols});
  });
  _csvDurum.iyi = iyi;
  $('csv-summary').textContent =
    t('csvSummary', {n: rows.length, m: mukerrer, k: hatali.length});
  // Hatalı satırlar LİSTELENİYOR (madde şart koşuyor): kullanıcı dosyayı
  // düzeltip yeniden denesin diye satır numarası da veriliyor.
  $('csv-errors').innerHTML = hatali.length
    ? `<div class="section-lbl">${esc(t('csvBadRows'))}</div>` +
      hatali.slice(0, 20).map(h =>
        `<li class="vd">${t('csvLine', {n: h.no})}: ${esc(h.msg)}</li>`).join('') +
      (hatali.length > 20 ? `<li class="vd">…</li>` : '')
    : '';
  $('csv-confirm').disabled = !iyi.length;
  $('csv-confirm').textContent = iyi.length
    ? t('csvImportN', {n: iyi.length}) : t('csvNothing');
}
$('csv-confirm').addEventListener('click', async () => {
  const iyi = _csvDurum?.iyi || [];
  if (!iyi.length) return;
  // Araç adı → id. WT-08'in JSON tarafında kurduğu eşlemeyle aynı mantık:
  // ad tutuyorsa mevcut araca bağla, tutmuyorsa varsayılana düşür.
  const vehicles = await allVehicles();
  const adMap = new Map(vehicles.map(v => [csvNorm(vehName(v)), v.id]));
  const varsayilan = S.defaultVehicleId ?? vehicles[0]?.id ?? null;
  const adSut = _csvDurum.map.arac;
  const kayitlar = iyi.map(({rec, cols}) => {
    const ad = adSut == null ? '' : csvNorm(cols[adSut] || '');
    return {...rec, aracId: (ad && adMap.get(ad)) || varsayilan};
  });
  const res = await safeWrite(() =>
    db.transaction('rw', db.sessions, async () => { await db.sessions.bulkAdd(kayitlar); }));
  if (!res.ok) return;
  // WT-19: içe aktarılan odometre kayıtları mesafe zincirini değiştiriyor
  for (const vid of new Set(kayitlar.map(r => r.aracId))) await tureMesafe(vid ?? null);
  await overlayClose('page-csv', {force: true});
  toast(t('csvImported', {n: kayitlar.length}));
  await renderDashboard(); await renderHistory();
});
$('btn-close-csv').addEventListener('click', () => overlayClose('page-csv'));

async function importBackupText(text) {
  const data = JSON.parse(text);
  if (data.app !== 'WattTrack' || !Array.isArray(data.sessions)) throw 0;

  // --- Okumalar ve sorular transaction'dan ÖNCE (confirm bir transaction'ı
  //     bloklar ve zaman aşımına düşürür) ---
  // mükerrer tespiti: tarih+firma+kwh+tutar+para birimi imzası
  const sig = r => [r.tarih, r.firma, r.kwh, r.odenen, r.cur || ''].join('|');
  const existing = new Set((await allSessions()).map(sig));
  const fresh = [], dupes = [];
  // WT-49/5: eski yedeklerde `ekranGor` bir Blob değil, JSON.stringify'ın
  // ürettiği boş nesne (`{}`) — truthy olduğu için geri yüklemede kırık bir
  // ataç ikonu doğuruyordu. Blob olmayan görsel alanı ve önbellek artefaktı
  // `ekranGorVar` içeri alınmıyor.
  const temizle = ({id, ekranGorVar, ekranGor, ...r}) =>
    ekranGor instanceof Blob ? {...r, ekranGor} : r;
  data.sessions.forEach(s => {
    const r = temizle(s);
    (existing.has(sig(r)) ? dupes : fresh).push({...r, _oldVeh: r.aracId});
  });
  if (!fresh.length && data.sessions.length) { alert(t('importAllDup')); return; }

  const msg = dupes.length
    ? t('importPartial', {n: fresh.length, d: dupes.length})
    : fresh.length + ' ' + t('importAsk');
  if (!confirm(msg)) return;

  // WT-07: export payload settings dizisini yazıyor ama import ona hiç
  // dokunmuyordu — telefon değiştiren kullanıcı dil, para birimi, ülke,
  // tema, özel bankalar ve kıyas parametrelerini kaybediyordu.
  const hasSettings = Array.isArray(data.settings) && data.settings.length;
  const restoreSettings = hasSettings && confirm(t('restoreSettingsAsk'));

  const esig = e => [e.tarih, e.tur, e.tutar, e.cur || ''].join('|');
  const haveExp = new Set((await allExpenses()).map(esig));
  const freshExp = Array.isArray(data.expenses)
    ? data.expenses.map(({id, ...e}) => ({...e, _oldVeh: e.aracId})).filter(e => !haveExp.has(esig(e)))
    : [];

  // --- Tek transaction: ortada hata olursa hiçbir şey yazılmasın (WT-08/3) ---
  // WT-12: kota dolarsa kullanıcı 'geri yüklendi' sanmasın
  const imported = await safeWrite(() =>
    db.transaction('rw', db.sessions, db.vehicles, db.expenses, db.settings, async () => {
    // WT-08: önce araçlar, sonra eskiId → yeniId haritası.
    // Eskiden sessions'tan sadece `id` düşürülüyor, `aracId` eski değerini
    // koruyordu; cihazda zaten araç varsa kayıtlar YANLIŞ araca bağlanıyordu.
    const idMap = new Map();
    for (const {id: oldId, ...v} of (data.vehicles || [])) {
      if (!v.ad) continue;
      const ex = await db.vehicles.where('ad').equals(v.ad).first();
      if (!ex) {
        const newId = await db.vehicles.add(v);
        if (oldId != null) idMap.set(oldId, newId);
        continue;
      }
      if (oldId != null) idMap.set(oldId, ex.id);
      // aynı isimli araç varsa: yedekteki km/fotoğraf bilgisini birleştir
      const upd = {};
      if (v.kmStart != null) upd.kmStart = v.kmStart;
      if (v.kmNow != null && (ex.kmNow == null || v.kmNow > ex.kmNow || ex.kmStart === ex.kmNow))
        upd.kmNow = Math.max(v.kmNow, ex.kmNow || 0);
      if (v.photo && !ex.photo) upd.photo = v.photo;
      if (Object.keys(upd).length) await db.vehicles.update(ex.id, upd);
    }
    // haritada karşılığı yoksa null — ölü referans bırakma
    const mapVeh = rec => {
      const old = rec._oldVeh;
      delete rec._oldVeh;
      rec.aracId = old == null ? null : (idMap.has(old) ? idMap.get(old) : null);
      return rec;
    };
    if (fresh.length) await db.sessions.bulkAdd(fresh.map(mapVeh));
    if (freshExp.length) await db.expenses.bulkAdd(freshExp.map(mapVeh));

    if (restoreSettings) {
      const rows = data.settings.map(row => {
        // WT-07/WT-08: defaultVehicleId de idMap üzerinden çevrilmeli
        if (row.key === 'defaultVehicleId' && row.value != null)
          return {...row, value: idMap.has(row.value) ? idMap.get(row.value) : null};
        return row;
      });
      await db.settings.bulkPut(rows);
    }
  }));
  if (!imported.ok) return;

  // WT-19: import aracId'leri idMap üzerinden çeviriyor; içeri giren odo
  // kayıtları zaten odo kaydı olan bir araca düşmüş olabilir — zincirler
  // transaction bittikten SONRA baştan kurulur.
  for (const vid of new Set((await allSessions())
      .filter(r => r.odo != null).map(r => r.aracId ?? null)))
    await tureMesafe(vid);

  if (restoreSettings) {
    // S nesnesini yeniden doldur ve arayüzü tazele (WT-81/3: init() ile
    // aynı fonksiyon — liste tek yerden okunuyor)
    await loadSettings();
    applyI18n();
    applyTheme();
  }
  toast(dupes.length ? t('importPartial', {n: fresh.length, d: dupes.length}) : t('imported'));
  showScreen('dashboard');
}
// WT-48/1: aynı düğme .json ve .csv kabul ediyor. Uzantı yerine İÇERİĞE
// bakılıyor — bazı sistemler CSV'yi .txt olarak, JSON'u uzantısız veriyor.
async function importFileText(text) {
  if (/^\s*[{[]/.test(text)) return importBackupText(text);
  return openCsvImport(text);
}
$('file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try { await importFileText(await file.text()); }
  catch { toast(t('importFail')); }
  e.target.value = '';
});
// PWA file_handlers: .json dosyası uygulamayla açılınca yedeği içe aktar
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async params => {
    if (!params.files || !params.files.length) return;
    try {
      const file = await params.files[0].getFile();
      await importFileText(await file.text());
    } catch { toast(t('importFail')); }
  });
}
$('btn-rate').addEventListener('click', () => {
  window.open('https://play.google.com/store/apps/details?id=app.watttrack.twa', '_blank', 'noopener');
});
$('btn-support').addEventListener('click', () => {
  window.open('https://github.com/Rino-06/WattTrack', '_blank', 'noopener');
});
$('btn-wipe').addEventListener('click', async () => {
  if (!confirm(t('wipeAsk1')) || !confirm(t('wipeAsk2'))) return;
  // WT-06: expenses.clear() eksikti — sıfırlama sonrası eski vergi/sigorta
  // kayıtları geri gelip TCO'yu bozuyordu. Dördü tek transaction'da.
  await db.transaction('rw', db.sessions, db.vehicles, db.expenses, db.settings, async () => {
    await db.sessions.clear();
    await db.vehicles.clear();
    await db.expenses.clear();
    await db.settings.clear();
  });
  toast(t('wiped'));
  location.reload();
});


/* ---- WT-39/BÖLÜM 2: OCR anahtarı ---- */
// Kütüphane uygulama paketinde değil; anahtar açılınca indirilir ve Cache
// API'ye yazılır (çevrimdışı çalışsın). Kapatılınca worker terminate edilir
// ve önbelleği silme seçeneği sunulur.
async function ocrAyarSync() {
  const varMi = await ocrVarMi();
  $('set-ocr').checked = S.ocrOn === true && varMi;
  $('set-ocr').disabled = !varMi;
  if (!varMi) { $('ocr-size-note').textContent = t('ocrMissing'); return; }
  const b = await ocrIndirmeBoyutu();
  $('ocr-size-note').textContent = b
    ? t('ocrSize', {mb: fmtNum(b / 1048576, 1)}) : t('ocrSizeUnknown');
}
$('set-ocr').addEventListener('change', async e => {
  if (e.target.checked) {
    const b = await ocrIndirmeBoyutu();
    if (b && !confirm(t('ocrDownloadAsk', {mb: fmtNum(b / 1048576, 1)}))) {
      e.target.checked = false;
      return;
    }
    S.ocrOn = true;
    await saveSetting('ocrOn', true);
    await ocrOnbellekle();
    toast(t('savedLocal'));
  } else {
    S.ocrOn = false;
    await saveSetting('ocrOn', false);
    await ocrKapat();
    if (confirm(t('ocrClearCacheAsk'))) await ocrOnbellekSil();
  }
});


/* ---- WT-45: bütçe alanları ---- */
for (const [id, key] of [['set-budget-m', 'budgetM'], ['set-budget-y', 'budgetY']]) {
  bindDecimalInput(id, 0);
  $(id).addEventListener('change', async () => {
    const v = pf($(id).value, 0);
    S[key] = isNaN(v) || v <= 0 ? null : v;
    await saveSetting(key, S[key]);
    renderDashboard();
  });
}
