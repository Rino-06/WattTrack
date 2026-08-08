/* ============================================================
   WattTrack — history
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Geçmiş ---- */
// ============================================================
// GEÇMİŞ
// ============================================================
// WT-46/3: çok araç varsa satırda hangi araç olduğu belli olmalı. Satırı
// çizen rowHTML() ui/stats.js'te ve SENKRON; ad tablosunu buradaki (async)
// renderHistory dolduruyor, bu yüzden dosya düzeyinde duruyor.
// Tek araçlı kullanıcıda null bırakılıyor — rozet o zaman bilgi taşımıyor.
let VEH_ADI = null;
async function renderHistory() {
  const all = await allSessions();
  const vehicles = await allVehicles();
  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih));

  const years = [...new Set(sorted.map(r => r.tarih.slice(0, 4)))].sort().reverse();
  const firms = [...new Set(sorted.map(r => r.firma))].sort((a, b) => a.localeCompare(b));
  const banks = [...new Set(sorted.map(r => r.banka).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const locs2 = [...new Set(sorted.map(r => r.loc).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const keep = (sel, opts) => opts.includes(sel.value) ? sel.value : '';
  const fy = $('f-year'), ff = $('f-firm'), ft = $('f-type'), fv = $('f-veh'),
        fb = $('f-bank'), fl = $('f-loc');
  let vy = keep(fy, years); const vf = keep(ff, firms);
  const vb = keep(fb, banks), vl = keep(fl, locs2);
  if (histYear) { if (years.includes(histYear)) vy = histYear; histYear = null; }
  const vt = ['DC','AC','free'].includes(ft.value) ? ft.value : '';
  const vv = vehicles.some(v => String(v.id) === fv.value) ? fv.value : '';
  fy.innerHTML = `<option value="">${t('allYears')}</option>` + years.map(y => `<option>${y}</option>`).join('');
  ff.innerHTML = `<option value="">${t('allFirms')}</option>` + firms.map(f => `<option>${esc(f)}</option>`).join('');
  ft.innerHTML = `<option value="">${t('allTypes')}</option><option value="DC">DC</option><option value="AC">AC</option><option value="free">${t('free')}</option>`;
  fv.style.display = vehicles.length > 1 ? '' : 'none';
  fv.innerHTML = `<option value="">${t('allVehicles')}</option>` +
    vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  fb.style.display = banks.length ? '' : 'none';
  fb.innerHTML = `<option value="" hidden>${t('bank')}</option><option value="">${t('viewAll')}</option>` +
    banks.map(x => `<option>${esc(x)}</option>`).join('');
  fl.style.display = locs2.length ? '' : 'none';
  fl.innerHTML = `<option value="" hidden>${t('location')}</option><option value="">${t('viewAll')}</option>` +
    locs2.map(x => `<option>${esc(x)}</option>`).join('');
  fy.value = vy; ff.value = vf; ft.value = vt; fv.value = vv; fb.value = vb; fl.value = vl;

  // WT-04/6: uyarı şeridindeki "Göster" yalnız bozuk kayıtları listeler
  const badOnly = S.histBadOnly;
  S.histBadOnly = null;
  // WT-46/1: serbest metin araması — firma, lokasyon, not, banka
  const q = ($('h-search').value || '').toLocaleLowerCase('tr').trim();
  const arar = r => !q || [r.firma, r.loc, r.not, r.banka]
    .some(x => (x || '').toLocaleLowerCase('tr').includes(q));
  const rows = badOnly
    ? sorted.filter(r => badOnly.includes(r.id))   // diğer filtreleri atla
    : sorted.filter(r =>
        (!vy || r.tarih.slice(0, 4) === vy) &&
        (!vf || r.firma === vf) &&
        (!vt || (vt === 'free' ? r.free : r.tip === vt)) &&
        (!vv || String(r.aracId) === vv) &&
        (!vb || r.banka === vb) &&
        (!vl || r.loc === vl) && arar(r));

  // WT-46/2: filtrelenmiş sonucun TOPLAMI — maddeye göre asıl istenen bu
  const cv = rows.filter(isConv);
  const tut = cv.reduce((s, r) => s + amtB(r), 0);
  const kwhT = cv.reduce((s, r) => s + r.kwh, 0);
  $('h-summary').textContent = rows.length
    ? [rows.length + ' ' + t('sessions'), money(tut), fmtNum(kwhT, 0) + ' kWh',
       kwhT > 0 ? t('avgPerKwhShort', {v: fm(sym(), fmtNum(tut / kwhT, 2))}) : null]
      .filter(Boolean).join(' · ')
    : '';
  // Çok araçlı kullanıcıda satırdaki rozet için ad tablosu (WT-46/3)
  VEH_ADI = vehicles.length > 1
    ? Object.fromEntries(vehicles.map(v => [v.id, vehName(v)])) : null;
  if (badOnly) { fy.value = ''; ff.value = ''; ft.value = ''; fv.value = ''; fb.value = ''; fl.value = ''; }

  const box = $('h-groups');
  if (!rows.length) {
    // WT-36/1: hiç kayıt yoksa yönlendir; filtre sonucu boşsa eski sade metin
    box.innerHTML = all.length
      ? `<div class="empty">${t('noData')}</div>`
      : emptyStateHTML('🔌', 'emptyHistory', 'addCharge');
    return;
  }

  const groups = [];
  let last = null;
  rows.forEach(r => {
    const key = monthKey(r.tarih);
    if (key !== last) {
      const [y, m] = key.split('-');
      groups.push({label: MONTHS[S.lang][+m - 1] + ' ' + y, items: []});
      last = key;
    }
    groups[groups.length - 1].items.push(r);
  });
  box.innerHTML = groups.map(g =>
    `<div class="month-group">
      <div class="section-lbl">${g.label}</div>
      <div class="rows">${g.items.map(r => rowHTML(r, true)).join('')}</div>
    </div>`).join('');

  box.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm(t('deleteAsk'))) return;
      const delRec = await db.sessions.get(+b.dataset.del);
      await db.sessions.delete(+b.dataset.del);
      // WT-19: silme de bir yazmadır — ortadaki bir odo kaydı silinince
  // haleflerinin mesafesi yeniden hesaplanmalı
  if (delRec) await tureMesafe(delRec.aracId ?? null);
      // WT-46/4: silme geri alınabilir (5 sn). Kayıt aynı id ile geri konuyor
      // ki türetilmiş mesafe zinciri de eski hâline dönsün.
      toastUndo(t('deleted'), async () => {
        if (!delRec) return;
        await db.sessions.add(delRec);
        await tureMesafe(delRec.aracId ?? null);
        renderHistory(); renderDashboard();
      });
      renderHistory();
    }));
  box.querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
['f-year','f-firm','f-type','f-veh','f-bank','f-loc'].forEach(id => $(id).addEventListener('change', renderHistory));
let histYear = null;


/* ---- WT-46: arama ve filtre paneli ---- */
let _araTimer = null;
$('h-search').addEventListener('input', () => {
  clearTimeout(_araTimer);
  _araTimer = setTimeout(() => renderHistory(), 200);
});
$('h-filter-btn').addEventListener('click', () => {
  const box = $('h-filters'), acik = box.style.display === 'none';
  box.style.display = acik ? '' : 'none';
  $('h-filter-btn').setAttribute('aria-expanded', String(acik));
});
