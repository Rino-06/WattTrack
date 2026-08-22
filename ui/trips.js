/* ============================================================
   WattTrack — trips (WT-88)
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Yolculuk ---- */
// ============================================================
// YOLCULUK
// ============================================================
// Geçmiş sayfası iki görünüm sunuyor: kayıtlar ve yolculuklar. İkisi AYNI
// veriyi gösteriyor, farklı çerçeveden — o yüzden yedinci bir sekme değil.
let editingTripId = null;

// Yolculuk adı iki kutudan kuruluyor: nereden ve nereye. Listede ve detayda
// TEK isim gösteriliyor, o yüzden birleşiği `ad` alanında da tutuluyor —
// eski kayıtlar (tek kutulu dönem) hiç dokunulmadan çalışmaya devam ediyor.
const TRIP_AYRAC = ' – ';
const tripAdKur = (a, b) => (a && b) ? a + TRIP_AYRAC + b : (a || b || '');
function tripAdParcala(tr) {
  if (tr && (tr.nereden != null || tr.nereye != null))
    return [tr.nereden || '', tr.nereye || ''];
  const ad = (tr && tr.ad) || '';
  const i = ad.indexOf(TRIP_AYRAC);
  return i < 0 ? [ad, ''] : [ad.slice(0, i), ad.slice(i + TRIP_AYRAC.length)];
}

// Aracın GENEL ₺/km ortalaması. Yolculuğun "adil maliyeti" bununla çıkıyor:
// evde ucuz doldurup yolda pahalı şarj etmenin çarpıtmasını bu düzeltiyor.
// Mesafesi bilinen kayıt yoksa null — sayı UYDURULMUYOR, kutu gizleniyor.
function ortTlKm(aracId, sessions) {
  const wd = sessions.filter(r => vehEq(r.aracId, aracId ?? null)
    && r.mesafeKm > 0 && !r.atlanan && isConv(r));
  const km = wd.reduce((s, r) => s + r.mesafeKm, 0);
  if (km < 20) return null;                 // ana sayfayla aynı alt sınır
  return wd.reduce((s, r) => s + amtB(r), 0) / km;
}

const tripDateLbl = tr => tr.bitis
  ? shortDate(tr.baslangic + 'T00:00') + ' – ' + shortDate(tr.bitis + 'T00:00')
  : shortDate(tr.baslangic + 'T00:00') + ' · ' + t('tripOngoing');

async function renderTrips() {
  const [trips, sessions, expenses] = await Promise.all(
    [allTrips(), allSessions(), allExpenses()]);
  const box = $('trip-list');
  if (!trips.length) {
    box.innerHTML = `<div class="about" style="margin-top:14px">${t('tripsEmpty')}</div>`;
    return;
  }
  const sorted = [...trips].sort((a, b) => b.baslangic.localeCompare(a.baslangic));
  box.innerHTML = sorted.map(tr => {
    const o = tripOzet(tr, sessions, expenses, ortTlKm(tr.aracId, sessions));
    const olcu = [
      o.km > 0 ? `<span><b>${fmtNum(Math.round(distDisp(o.km)), 0)}</b> ${S.unit}</span>` : null,
      `<span><b>${o.sarjSayi}</b> ${t('tripChargeCount')}</span>`,
      o.giderSayi ? `<span><b>${o.giderSayi}</b> ${t('tripExpCount')}</span>` : null,
      o.tlKm ? `<span><b>${fmtNum(o.tlKm * distFactor(), 2)}</b> ${sym()}/${S.unit}</span>` : null
    ].filter(Boolean).join('');
    return `<div class="tcard" data-trip="${tr.id}">
      <div class="thead">
        <div style="min-width:0">
          <div class="tname">${esc(tr.ad)}</div>
          <div class="tdate">${tripDateLbl(tr)}</div>
        </div>
        <div class="tamt">${money(o.odenen)}</div>
      </div>
      <div class="tmeta">${olcu}</div>
      <div><span class="tchip">${t(tr.gidisDonus === false ? 'oneWay' : 'roundTrip')}</span></div>
    </div>`;
  }).join('');
  box.querySelectorAll('[data-trip]').forEach(el =>
    el.addEventListener('click', () => openTrip(+el.dataset.trip)));
}

// ---- detay ----
async function openTrip(id) {
  const tr = await db.trips.get(id);
  if (!tr) return;
  editingTripId = id;
  const [sessions, expenses, trips] = await Promise.all(
    [allSessions(), allExpenses(), allTrips()]);
  const ort = ortTlKm(tr.aracId, sessions);
  const o = tripOzet(tr, sessions, expenses, ort);
  $('trip-title').textContent = tr.ad;

  const kutu = (k, v, alt) =>
    `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div>` +
    (alt ? `<div class="yd" style="color:var(--muted)">${alt}</div>` : '') + '</div>';

  const parcalar = [];
  // 1) Cüzdandan çıkan
  parcalar.push(`<div class="dstat" style="grid-template-columns:1fr">${
    kutu(t('tripPaid'), money(o.odenen),
      [o.sarjSayi + ' ' + t('tripChargeCount'), fmtNum(o.kwh, 0) + ' kWh',
       o.giderSayi ? money(o.gider) + ' ' + t('tripExpenses').toLowerCase() : null]
        .filter(Boolean).join(' · '))}</div>`);

  // 2) Adil maliyet — YALNIZ mesafe biliniyorsa. Bilinmiyorsa uydurmak
  // yerine ne yapılması gerektiği yazılıyor.
  if (o.adil != null) {
    const dist = fmtNum(Math.round(distDisp(o.km)), 0) + ' ' + S.unit;
    parcalar.push(`<div class="dstat" style="grid-template-columns:1fr">${
      kutu(t('tripFair'), money(o.adil),
        t('tripFairNote', {d: dist,
          v: fm(sym(), fmtNum(ort * distFactor(), 2)) + '/' + S.unit}))}</div>`);
    const fark = o.odenen - o.adil;
    if (Math.abs(fark) >= 1)
      parcalar.push(`<div class="about" style="background:var(--pill);color:var(--accent-text);padding:10px 12px;border-radius:10px;margin-bottom:10px">${
        t(fark > 0 ? 'tripDiffHigh' : 'tripDiffLow', {v: money(Math.abs(fark))})}</div>`);
  } else {
    parcalar.push(`<div class="about">${t('tripNoDist')}</div>`);
  }

  // 3) Yakıtlı kıyası — mesafe VE yayımlanmış yakıt fiyatı varsa
  if (o.km > 0 && S.cmp && S.cmp.cons > 0) {
    const fiyatlar = fuelHistMerge([], S.country);
    const f = fiyatBul(fiyatlar, tripBitis(tr), S.cmp.fuel || 'diesel');
    const birim = f ? f.fiyat : (S.cmp.price || 0);
    if (birim > 0) {
      const lt = o.km * S.cmp.cons / 100;
      const ice = lt * birim;
      parcalar.push(`<div class="dstat">${
        kutu(t('tripIceWould'), money(ice), fmtNum(lt, 1) + ' lt × ' + fm(sym(), fmtNum(birim, 2)))
      }${
        kutu(t('tripSaved'), money(ice - o.odenen),
          ice > 0 ? '%' + fmtNum((1 - o.odenen / ice) * 100, 0) + ' ' + t('tripLess') : '')
      }</div>`);
    }
  }

  // 4) Çakışma uyarısı — aynı şarj iki yolculuğa birden sayılıyor
  const cak = tripOverlaps(tr, trips);
  if (cak.length)
    parcalar.push(`<div class="about" style="color:var(--red)">${
      t('tripOverlap', {v: cak.map(x => esc(x.ad)).join(', ')})}</div>`);

  // 5) Bağlı kayıtlar
  parcalar.push(`<div class="section-lbl" style="margin-top:6px">${t('tripCharges')}</div>`);
  parcalar.push(o.sess.length
    ? `<div class="rows">${[...o.sess]
        .sort((a, b) => b.tarih.localeCompare(a.tarih))
        .map(r => rowHTML(r, false)).join('')}</div>`
    : `<div class="about">${t('tripNoCharge')}</div>`);

  if (o.exp.length) {
    parcalar.push(`<div class="section-lbl" style="margin-top:14px">${t('tripExpenses')}</div>`);
    parcalar.push(`<div class="rows">${o.exp.map(e => `
      <div class="crow" data-exp="${e.id}">
        <div class="avatar" style="background:var(--chip);color:var(--accent-text)">${EXP_ICON[e.tur] || '📦'}</div>
        <div class="mid">
          <div class="name">${e.altAd ? esc(e.altAd) : t('exp_' + e.tur)}</div>
          <div class="sub">${shortDate(e.tarih + 'T00:00')}</div>
        </div>
        <div class="right"><div class="amt">${fm(symOf(e.cur || S.currency), fmtNum(e.tutar, 0))}</div></div>
      </div>`).join('')}</div>`);
  }

  $('trip-body').innerHTML = parcalar.join('');
  $('trip-body').querySelectorAll('.crow[data-id]').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
  $('trip-body').querySelectorAll('[data-exp]').forEach(el =>
    el.addEventListener('click', async () =>
      openExpense(await db.expenses.get(+el.dataset.exp))));
  overlayOpen('page-trip');
}

// ---- oluştur / düzenle ----
async function openTripEdit(rec) {
  editingTripId = rec?.id || null;
  $('tripedit-title').textContent = rec ? t('editTrip') : t('addTrip');
  $('btn-del-trip').style.display = rec ? '' : 'none';
  const vs = (await allVehicles()).filter(v => !v.archived || v.id === rec?.aracId);
  $('wrap-trip-veh').style.display = vs.length > 1 ? '' : 'none';
  $('in-trip-veh').innerHTML =
    vs.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  const defVeh = rec?.aracId ?? (vs.find(v => v.id === S.defaultVehicleId)?.id ?? vs[0]?.id);
  $('in-trip-veh').value = defVeh != null ? String(defVeh) : '';
  const [nereden, nereye] = tripAdParcala(rec);
  $('in-trip-from').value = nereden;
  $('in-trip-to').value = nereye;
  // Yer tutucu kullanıcının ülkesinden geliyor. Ülke listede yoksa kutu boş
  // kalıyor — tanımadığı bir şehir adı örnek diye gösterilmiyor.
  const ornek = typeof tripOrnek === 'function' ? tripOrnek(S.country) : null;
  $('in-trip-from').placeholder = ornek ? ornek[0] : '';
  $('in-trip-to').placeholder = ornek ? ornek[1] : '';
  $('in-trip-start').value = rec?.baslangic || localISO();
  $('in-trip-end').value = rec?.bitis || '';
  $('lbl-trip-odo1').textContent = t('tripStartOdo', {u: S.unit});
  $('lbl-trip-odo2').textContent = t('tripEndOdo', {u: S.unit});
  $('in-trip-odo1').value = rec?.odoBas != null ? fmtNum(Math.round(distDisp(rec.odoBas)), 0) : '';
  $('in-trip-odo2').value = rec?.odoBit != null ? fmtNum(Math.round(distDisp(rec.odoBit)), 0) : '';
  $('lbl-trip-km').textContent = t('tripTotalDist', {u: S.unit});
  $('in-trip-km').value = rec?.elleKm > 0 ? fmtNum(Math.round(distDisp(rec.elleKm)), 0) : '';
  const round = rec ? rec.gidisDonus !== false : true;
  $('trip-kind').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', (b.dataset.kind === 'round') === round));
  $('trip-warn').style.display = 'none';
  overlayOpen('page-tripedit');
  markFormClean('page-tripedit');
}

// Çakışma denetimi ANLIK: kullanıcı tarihi değiştirdikçe uyarı beliriyor,
// kaydettikten sonra değil.
async function tripCakismaGoster() {
  const bas = $('in-trip-start').value;
  if (!isValidDate(bas)) { $('trip-warn').style.display = 'none'; return; }
  const aday = {
    id: editingTripId, baslangic: bas,
    bitis: isValidDate($('in-trip-end').value) ? $('in-trip-end').value : null,
    aracId: +$('in-trip-veh').value || null
  };
  const cak = tripOverlaps(aday, await allTrips());
  const w = $('trip-warn');
  if (!cak.length) { w.style.display = 'none'; return; }
  w.style.display = '';
  w.style.color = 'var(--red)';
  w.textContent = t('tripOverlap', {v: cak.map(x => x.ad).join(', ')});
}

$('btn-new-trip').addEventListener('click', async () => {
  if (!(await db.vehicles.count())) { toast(t('noVehYet')); return; }
  openTripEdit(null);
});
$('btn-close-trip').addEventListener('click', () => overlayClose('page-trip'));
$('btn-edit-trip').addEventListener('click', async () => {
  const tr = await db.trips.get(editingTripId);
  if (tr) { await overlayClose('page-trip', {force: true}); openTripEdit(tr); }
});
$('btn-close-tripedit').addEventListener('click', () => overlayClose('page-tripedit'));
$('trip-kind').addEventListener('click', e => {
  const b = e.target.closest('button[data-kind]');
  if (!b) return;
  $('trip-kind').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
['in-trip-start', 'in-trip-end', 'in-trip-veh'].forEach(id =>
  $(id).addEventListener('change', tripCakismaGoster));

$('btn-del-trip').addEventListener('click', async () => {
  if (!editingTripId || !confirm(t('tripDeleteAsk'))) return;
  const silinen = await db.trips.get(editingTripId);
  // Yolculuğa bağlı giderlerin bağı çözülüyor; giderin KENDİSİ silinmiyor.
  const bagli = (await allExpenses()).filter(e => e.seyahatId === editingTripId);
  for (const e of bagli) await db.expenses.update(e.id, {seyahatId: null});
  await db.trips.delete(editingTripId);
  await overlayClose('page-tripedit', {force: true});
  editingTripId = null;
  toastUndo(t('deleted'), async () => {
    if (!silinen) return;
    await db.trips.add(silinen);
    for (const e of bagli) await db.expenses.update(e.id, {seyahatId: silinen.id});
    renderTrips();
  });
  renderTrips();
});

$('btn-save-trip').addEventListener('click', async () => {
  const nereden = $('in-trip-from').value.trim();
  const nereye = $('in-trip-to').value.trim();
  const ad = tripAdKur(nereden, nereye);
  if (!ad) { toast(t('tripNameNeeded')); $('in-trip-from').focus(); return; }
  const bas = $('in-trip-start').value;
  if (!isValidDate(bas)) { toast(t('dateNeeded')); $('in-trip-start').focus(); return; }
  const bit = isValidDate($('in-trip-end').value) ? $('in-trip-end').value : null;
  if (bit && bit < bas) { toast(t('tripDateOrder')); $('in-trip-end').focus(); return; }
  const odoNum = id => {
    const v = pf($(id).value, 0);
    return isNaN(v) || v <= 0 ? null : Math.round(S.unit === 'mi' ? v * MI : v);
  };
  const odoBas = odoNum('in-trip-odo1'), odoBit = odoNum('in-trip-odo2');
  if (odoBas != null && odoBit != null && odoBit <= odoBas) {
    toast(t('tripOdoOrder')); $('in-trip-odo2').focus(); return;
  }
  const elleKm = odoNum('in-trip-km');
  const rec = {
    ad, nereden, nereye, baslangic: bas, bitis: bit,
    aracId: +$('in-trip-veh').value || null,
    odoBas, odoBit, elleKm,
    gidisDonus: $('trip-kind').querySelector('button.sel')?.dataset.kind !== 'one'
  };
  const wasEditing = editingTripId;
  const w = await safeWrite(async () => wasEditing
    ? (await db.trips.update(wasEditing, rec), wasEditing)
    : await db.trips.add(rec));
  if (!w.ok) return;
  await overlayClose('page-tripedit', {force: true});
  toast(wasEditing ? t('updated') : t('savedLocal'));
  editingTripId = null;
  renderTrips();
});
