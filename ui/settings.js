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
  const c = COUNTRIES.find(x => x[0] === S.country);
  $('set-country-val').textContent = c ? c[1] + ' ' + c[2] : '—';

  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('set-currency').innerHTML = curs.map(k =>
    `<option value="${k}" ${k === S.currency ? 'selected' : ''}>${k} (${symOf(k)})</option>`).join('');
  $('set-unit').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === S.unit));
  $('set-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}" ${k === S.lang ? 'selected' : ''}>${LANG_NAMES[k]}</option>`).join('');
  $('set-adv').checked = !!S.advOpen;
  $('set-theme').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (S.theme || 'light')));
  renderBankCountries();
}


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
    sessions: (await db.sessions.toArray()).filter(r => !isDemo(r)),
    vehicles: (await db.vehicles.toArray()).filter(r => !isDemo(r)),
    expenses: (await db.expenses.toArray()).filter(r => !isDemo(r)),
    settings: await db.settings.toArray()
  };
}
$('btn-export-json').addEventListener('click', async () => {
  const payload = await backupPayload();
  download(JSON.stringify(payload, null, 2), `watttrack-yedek-${today()}.json`, 'application/json');
  toast(t('jsonDone'));
});
$('btn-export-csv').addEventListener('click', async () => {
  const rows = (await db.sessions.toArray()).filter(r => !isDemo(r))   // WT-36/3f
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const vehicles = await db.vehicles.toArray();
  const vn = id => { const v = vehicles.find(x => x.id === id); return v ? vehName(v) : ''; };
  const num = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
  // CSV formül enjeksiyonuna karşı koruma: =,+,-,@ ile başlayan metinleri etkisizleştir
  const safe = s => {
    let v = (s || '').toString().replace(/;/g, ',').replace(/[\r\n]/g, ' ');
    if (/^[=+\-@]/.test(v)) v = "'" + v;
    return v;
  };
  const head = ['Tarih','Ulke','ParaBirimi','Kur','Firma','Tip','Ucretsiz','kWh','Odenen','OdenenTemel','Indirim','ListeTutar','BirimFiyat','Banka','MesafeKm','SureDk','SoCOnce','SoCSonra','Lokasyon','Arac','Not'];
  const lines = [head.join(';')];
  rows.forEach(r => {
    const sav = savingsOf(r);
    lines.push([
      r.tarih.slice(0, 10), r.ulke || '', r.cur || '', r.rate ? num(r.rate) : '',
      safe(r.firma), r.tip || '', r.free ? 1 : 0, num(r.kwh),
      num(r.odenen), num(amtB(r)), num(sav), num(r.odenen + sav),
      r.kwh ? num(r.odenen / r.kwh) : '', safe(r.banka),
      r.mesafeKm ? num(r.mesafeKm) : '', r.dur ?? '', r.socB ?? '', r.socA ?? '',
      safe(r.loc), safe(vn(r.aracId)), safe(r.not)
    ].join(';'));
  });
  download('\uFEFF' + lines.join('\r\n'), `watttrack-${today()}.csv`, 'text/csv;charset=utf-8');
  toast(t('csvDone'));
});
$('btn-import').addEventListener('click', () => $('file-import').click());
async function importBackupText(text) {
  const data = JSON.parse(text);
  if (data.app !== 'WattTrack' || !Array.isArray(data.sessions)) throw 0;

  // --- Okumalar ve sorular transaction'dan ÖNCE (confirm bir transaction'ı
  //     bloklar ve zaman aşımına düşürür) ---
  // mükerrer tespiti: tarih+firma+kwh+tutar+para birimi imzası
  const sig = r => [r.tarih, r.firma, r.kwh, r.odenen, r.cur || ''].join('|');
  const existing = new Set((await db.sessions.toArray()).map(sig));
  const fresh = [], dupes = [];
  data.sessions.forEach(({id, ...r}) => (existing.has(sig(r)) ? dupes : fresh).push({...r, _oldVeh: r.aracId}));
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
  const haveExp = new Set((await db.expenses.toArray()).map(esig));
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
  for (const vid of new Set((await db.sessions.toArray())
      .filter(r => r.odo != null).map(r => r.aracId ?? null)))
    await tureMesafe(vid);

  if (restoreSettings) {
    // S nesnesini yeniden doldur ve arayüzü tazele
    for (const key of SETTING_KEYS) {
      const row = await db.settings.get(key);
      if (row) S[key] = row.value;
    }
    applyI18n();
    applyTheme();
  }
  toast(dupes.length ? t('importPartial', {n: fresh.length, d: dupes.length}) : t('imported'));
  showScreen('dashboard');
}
$('file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try { await importBackupText(await file.text()); }
  catch { toast(t('importFail')); }
  e.target.value = '';
});
// PWA file_handlers: .json dosyası uygulamayla açılınca yedeği içe aktar
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async params => {
    if (!params.files || !params.files.length) return;
    try {
      const file = await params.files[0].getFile();
      await importBackupText(await file.text());
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
