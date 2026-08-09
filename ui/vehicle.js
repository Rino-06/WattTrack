/* ============================================================
   WattTrack — vehicle
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Aracım (araç listesi) ---- */
// ============================================================
// ARACIM (araç listesi + araç giderleri)
// ============================================================
// ---------- WT-09: araç silme, kayıt taşıma, öksüz kayıt onarımı ----------

// WT-09/A. Kaydı olan araç sessizce arşivleniyordu; kullanıcı aynı arabayı
// tekrar ekleyince yeni id alıyor ve eski kayıtlar arşivdeki id'ye bağlı
// kalıyordu. Elle düzeltmenin yolu yoktu. Ayrıca vehicles.delete() çağrıldığında
// o araca bağlı expenses hiç temizlenmiyordu.
// Dönüş: işlem yapıldıysa true, iptal edildiyse false.
async function deleteVehicleFlow(vid) {
  const nSess = await db.sessions.where('aracId').equals(vid).count();
  const nExp = await db.expenses.where('aracId').equals(vid).count();
  if (!nSess && !nExp) {                       // kaydı yoksa eski basit akış
    if (!confirm(t('deleteAsk'))) return false;
    await db.vehicles.delete(vid);
    return true;
  }
  const others = (await allVehicles()).filter(v => v.id !== vid);
  const choice = await choiceDialog({
    title: t('delVehTitle'),
    msg: t('delVehMsg', {n: nSess, e: nExp}),
    options: [
      {label: t('delVehArchive'), value: 'archive'},
      {label: t('delVehMove'), value: 'move', disabled: !others.length},
      {label: t('delVehAll'), value: 'all', danger: true}
    ]
  });
  if (!choice) return false;

  if (choice === 'archive') {
    await db.vehicles.update(vid, {archived: true});
    toast(t('archivedToast'));
    return true;
  }
  if (choice === 'move') {
    if (!others.length) { toast(t('noOtherVehicle')); return false; }
    const moved = await moveRecordsFlow(vid);
    if (!moved) return false;
    await db.vehicles.delete(vid);
    return true;
  }
  // 'all' — geri alınamaz, ikinci onay
  if (!confirm(t('delVehAllConfirm', {n: nSess, e: nExp}))) return false;
  // Giderler şarj kayıtlarıyla AYNI kararı izler
  await db.transaction('rw', db.sessions, db.expenses, db.vehicles, async () => {
    await db.sessions.where('aracId').equals(vid).delete();
    await db.expenses.where('aracId').equals(vid).delete();
    await db.vehicles.delete(vid);
  });
  toast(t('wiped'));
  return true;
}

// WT-09/B. Toplu kayıt devretme — elle düzeltme yolu. Arşivdeki araçlar dahil.
// Dönüş: taşıma yapıldıysa true.
async function moveRecordsFlow(fromId = null) {
  const vs = await allVehicles();
  if (vs.length < 2) { toast(t('noOtherVehicle')); return false; }

  const body = document.createElement('div');
  const opts = (sel, exclude) => vs.filter(v => v.id !== exclude).map(v =>
    `<option value="${v.id}" ${v.id === sel ? 'selected' : ''}>${esc(vehName(v))}${v.archived ? ' (' + t('archived') + ')' : ''}</option>`).join('');
  body.innerHTML = `
    <div class="dlg-field"><div class="lbl">${t('moveFrom')}</div>
      <select id="mv-from">${opts(fromId ?? vs[0].id, null)}</select></div>
    <div class="dlg-field"><div class="lbl">${t('moveTo')}</div>
      <select id="mv-to"></select></div>
    <div class="dlg-field"><div class="lbl">${t('moveRange')}</div>
      <div class="dlg-row"><input type="date" id="mv-a"><input type="date" id="mv-b"></div></div>
    <p class="dlg-msg" id="mv-prev" style="margin:0 0 14px"></p>`;

  const sel = id => body.querySelector('#' + id);
  const matching = async () => {
    const from = +sel('mv-from').value, a = sel('mv-a').value, b = sel('mv-b').value;
    const inRange = r => (!a || r.tarih.slice(0, 10) >= a) && (!b || r.tarih.slice(0, 10) <= b);
    return {
      from, to: +sel('mv-to').value,
      sess: (await db.sessions.where('aracId').equals(from).toArray()).filter(inRange),
      exp: (await db.expenses.where('aracId').equals(from).toArray()).filter(inRange)
    };
  };
  const refresh = async () => {
    const from = +sel('mv-from').value;
    const keep = sel('mv-to').value;
    sel('mv-to').innerHTML = opts(+keep, from);
    const m = await matching();
    sel('mv-prev').textContent = t('movePreview', {n: m.sess.length, e: m.exp.length});
  };
  ['mv-from', 'mv-to', 'mv-a', 'mv-b'].forEach(id =>
    body.addEventListener('change', e => { if (e.target.id === id) refresh(); }));
  await refresh();

  const go = await choiceDialog({
    title: t('moveTitle'), body,
    options: [{label: t('moveTitle'), value: 'go'}]
  });
  if (go !== 'go') return false;

  const m = await matching();
  if (!m.sess.length && !m.exp.length) { toast(t('noData')); return false; }
  // geri alma için eski bağları sakla
  const undoS = m.sess.map(r => r.id), undoE = m.exp.map(r => r.id);
  await db.transaction('rw', db.sessions, db.expenses, async () => {
    for (const id of undoS) await db.sessions.update(id, {aracId: m.to});
    for (const id of undoE) await db.expenses.update(id, {aracId: m.to});
  });
  await tureMesafe(m.from); await tureMesafe(m.to);   // WT-19: zincirler değişti
  toastUndo(t('moveDone', {n: undoS.length + undoE.length}), async () => {
    await db.transaction('rw', db.sessions, db.expenses, async () => {
      for (const id of undoS) await db.sessions.update(id, {aracId: m.from});
      for (const id of undoE) await db.expenses.update(id, {aracId: m.from});
    });
    await tureMesafe(m.from); await tureMesafe(m.to);
    toast(t('moveUndone'));
    renderVehiclePage(); renderDashboard();
  });
  return true;
}

// WT-09/C. Öksüz kayıt tespiti — aracId'si var olmayan bir araca işaret ediyor.
async function scanOrphans() {
  const ids = new Set((await allVehicles()).map(v => v.id));
  const orphS = (await allSessions()).filter(r => r.aracId != null && !ids.has(r.aracId));
  const orphE = (await allExpenses()).filter(r => r.aracId != null && !ids.has(r.aracId));
  const n = orphS.length + orphE.length;
  if (!n) { setWarning('orphan', null); return; }
  setWarning('orphan', {
    msg: t('orphanWarn', {n}),
    actionLbl: t('orphanAssign'),
    action: async () => {
      const vs = await allVehicles();
      if (!vs.length) { toast(t('noOtherVehicle')); return; }
      const pick = await choiceDialog({
        title: t('orphanAssign'),
        msg: t('orphanWarn', {n}),
        options: vs.map(v => ({label: vehName(v), value: v.id}))
          .concat([{label: t('orphanDelete'), value: '__del', danger: true}])
      });
      if (pick == null) return;
      await db.transaction('rw', db.sessions, db.expenses, async () => {
        for (const r of orphS)
          pick === '__del' ? await db.sessions.delete(r.id) : await db.sessions.update(r.id, {aracId: pick});
        for (const r of orphE)
          pick === '__del' ? await db.expenses.delete(r.id) : await db.expenses.update(r.id, {aracId: pick});
      });
      setWarning('orphan', null);
      renderVehiclePage(); renderDashboard();
    }
  });
}

/* ---- WT-75/Aracım 5: gider listesi filtresi ----
   Durum S üzerinde (S.vehExpGran ile aynı yerde) ama SETTING_KEYS DIŞINDA —
   diske ve yedeğe yazılmıyor, oturum boyunca duruyor. Filtre YALNIZ listeyi
   daraltır. Seçenekler mevcut veriden üretiliyor:
   boşalan bir tür ya da ay listede hiç görünmüyor. */
function expFltFill(ex) {
  $('exp-flt-wrap').style.display = ex.length > 1 ? '' : 'none';
  // gider türü
  const turler = [...new Set(ex.map(e => e.tur))]
    .sort((a, b) => t('exp_' + a).localeCompare(t('exp_' + b), S.lang));
  if (!turler.includes(S.vehExpFltTur)) S.vehExpFltTur = '';
  $('exp-flt-type').innerHTML = `<option value="">${esc(t('viewAll'))}</option>`
    + turler.map(x => `<option value="${esc(x)}">${esc(t('exp_' + x))}</option>`).join('');
  $('exp-flt-type').value = S.vehExpFltTur;
  // dönem: yıl başlığı altında "Tümü" + o yılın dolu ayları
  const aylar = [...new Set(ex.map(e => e.tarih.slice(0, 7)))].sort().reverse();
  const yillar = [...new Set(aylar.map(a => a.slice(0, 4)))];
  if (S.vehExpFltDon && !yillar.includes(S.vehExpFltDon) && !aylar.includes(S.vehExpFltDon)) S.vehExpFltDon = '';
  $('exp-flt-period').innerHTML = `<option value="">${esc(t('viewAll'))}</option>`
    + yillar.map(y => `<optgroup label="${y}">`
      + `<option value="${y}">${y} · ${esc(t('viewAll'))}</option>`
      + aylar.filter(a => a.slice(0, 4) === y).map(a =>
        `<option value="${a}">${esc(MONTHS[S.lang][+a.slice(5, 7) - 1])} ${y}</option>`).join('')
      + '</optgroup>').join('');
  $('exp-flt-period').value = S.vehExpFltDon;
}

function expFltApply(ex) {
  return ex.filter(e => (!S.vehExpFltTur || e.tur === S.vehExpFltTur)
    && (!S.vehExpFltDon || e.tarih.startsWith(S.vehExpFltDon)));
}

$('exp-flt-type').addEventListener('change', () => {
  S.vehExpFltTur = $('exp-flt-type').value; renderVehiclePage();
});
$('exp-flt-period').addEventListener('change', () => {
  S.vehExpFltDon = $('exp-flt-period').value; renderVehiclePage();
});

async function renderVehiclePage() {
  const allV = await allVehicles();
  const vehicles = allV.filter(v => !v.archived);
  const archived = allV.filter(v => v.archived);
  const odoInfo = {};                       // WT-19/5
  for (const v of allV) odoInfo[v.id] = await odoNowOf(v);
  $('set-vehicles').innerHTML = vehicles.length ? vehicles.map(v => {
    // WT-19/5: sayaç = kayıtlardaki en son odo ile elle girilen değerden büyüğü
    const od = odoInfo[v.id] || {km: null, src: null};
    const kmTxt = od.km != null ? fmtNum(distDisp(od.km), 0) + ' ' + S.unit : '';
    // WT-58: üçüncü kaynak (girilen sürüş mesafeleri) eklendi
    const srcTxt = od.src ? t({records: 'odoFromRecords', manual: 'odoFromManual',
      dist: 'odoFromDist'}[od.src]) : '';
    const sub = [v.batt ? `${v.trim || ''} · ${v.batt} kWh` : '', kmTxt, srcTxt]
      .filter(Boolean).join(' · ');
    const isDef = v.id === S.defaultVehicleId || (!S.defaultVehicleId && vehicles[0].id === v.id);
    const thumb = v.photo ? `<img class="vthumb" src="${photoSrc(v.photo)}" alt="">` : '';
    // WT-74: tek satırda ad + 5 düğme sıkışıyordu, model adı kırpılıyordu.
    // Ad ve alt bilgi ÜSTTE tam genişlik; yıldız, resim ve düğmeler ALTTA.
    return `<li data-vid="${v.id}" class="vrow2">
      <div class="vn">${esc(vehName(v))}<div class="vd">${esc(sub)}</div></div>
      <div class="vact">
        <button class="star ${isDef ? 'on' : ''}" data-star="${v.id}" title="varsayılan">★</button>
        ${thumb}
        <button class="cam" data-odo="${v.id}" title="kilometre güncelle" style="font-size:12px;font-weight:800;width:36px">km✎</button>
        <button class="cam" data-spec="${v.id}" title="${esc(t('evEditSpecs'))}">⚙</button>
        <button class="cam" data-cam="${v.id}" title="fotoğraf">📷</button>
        <button class="cam" data-move="${v.id}" title="${esc(t('moveRecords'))}">⇄</button>
        <button class="rm" data-rm="${v.id}" title="arşivle">×</button>
      </div>
    </li>`;
  }).join('') : `<li style="color:var(--faint);font-weight:400">${t('noData')}</li>`;

  // WT-09/D: arşivdeki aracın kaç kaydı olduğu görünsün, taşınabilsin
  const cnt = {};
  for (const v of archived)
    cnt[v.id] = await db.sessions.where('aracId').equals(v.id).count();
  $('arch-lbl').style.display = archived.length ? '' : 'none';
  $('set-archived').innerHTML = archived.map(v =>
    `<li><div class="vn">${esc(vehName(v))}<div class="vd">${t('archivedCount', {n: cnt[v.id]})}</div></div>
     <button class="cam" data-move="${v.id}" title="${esc(t('moveRecords'))}">⇄</button>
     <button class="undo" data-undo="${v.id}">${t('restore')}</button></li>`).join('');
  $('set-archived').querySelectorAll('[data-undo]').forEach(b =>
    b.addEventListener('click', async () => {
      await db.vehicles.update(+b.dataset.undo, {archived: false});
      renderVehiclePage();
    }));
  // ⇄ Kayıtları taşı — hem etkin hem arşivdeki araçlarda (WT-09/B)
  document.querySelectorAll('#set-vehicles [data-move], #set-archived [data-move]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      if (await moveRecordsFlow(+b.dataset.move)) { renderVehiclePage(); renderDashboard(); }
    }));

  $('set-vehicles').querySelectorAll('[data-star]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      S.defaultVehicleId = +b.dataset.star;
      await saveSetting('defaultVehicleId', S.defaultVehicleId);
      renderVehiclePage();
    }));
  $('set-vehicles').querySelectorAll('[data-cam]').forEach(b =>
    b.addEventListener('click', e => {
      e.stopPropagation();
      photoTargetVid = +b.dataset.cam;
      $('car-photo').click();
    }));
  $('set-vehicles').querySelectorAll('[data-rm]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      const vid = +b.dataset.rm;
      if (!await deleteVehicleFlow(vid)) return;   // WT-09/A
      if (S.defaultVehicleId === vid) {
        const rest = (await allVehicles()).filter(v => !v.archived);
        S.defaultVehicleId = rest[0]?.id || null;
        await saveSetting('defaultVehicleId', S.defaultVehicleId);
      }
      renderVehiclePage();
    }));
  // 🛣️ butonu → kilometre güncelle
  $('set-vehicles').querySelectorAll('[data-odo]').forEach(li =>
    li.addEventListener('click', async e => {
      e.stopPropagation();
      const v = allV.find(x => x.id === +li.dataset.odo);
      if (!v) return;
      const cur = v.kmNow ? Math.round(distDisp(v.kmNow)) : '';
      const inp = prompt(t('odoPrompt', {u: S.unit}), cur);
      if (inp == null) return;
      const val = pf(inp);
      if (isNaN(val) || val < 0) return;
      const km = Math.round(S.unit === 'mi' ? val * MI : val);
      const upd = {kmNow: km};
      const sDef = v.kmStart != null ? Math.round(distDisp(v.kmStart)) : Math.round(distDisp(km));
      const sIn = prompt(t('odoStartPrompt', {u: S.unit}), sDef);
      if (sIn != null) {
        const sVal = pf(sIn);
        if (!isNaN(sVal) && sVal >= 0)
          upd.kmStart = Math.round(S.unit === 'mi' ? sVal * MI : sVal);
      }
      if (upd.kmStart == null) upd.kmStart = v.kmStart ?? km;
      // ters girilmişse (başlangıç > güncel) yer değiştir
      if (upd.kmStart > upd.kmNow) [upd.kmStart, upd.kmNow] = [upd.kmNow, upd.kmStart];
      await db.vehicles.update(v.id, upd);
      toast(t('odoSaved'));
      renderVehiclePage();
    }));

  renderYaklasanlar();   // WT-44/3

  // WT-40/C3: ⚙ → teknik değerleri elle düzelt (EV_DB'yi ezer)
  $('set-vehicles').querySelectorAll('[data-spec]').forEach(li =>
    li.addEventListener('click', e => {
      e.stopPropagation();
      openEvSpecs(+li.dataset.spec);
    }));

  // ---- Araç giderleri (araç filtreli) ----
  const wrapVehExp = $('wrap-veh-exp');
  wrapVehExp.style.display = vehicles.length > 1 ? '' : 'none';
  if (vehicles.length > 1) {
    const cur = S.vehExpVeh;
    $('veh-exp-sel').innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    $('veh-exp-sel').value = cur;
  }
  const expVehName = S.vehExpVeh
    ? vehName(vehicles.find(v => String(v.id) === S.vehExpVeh))
    : (vehicles.length === 1 ? vehName(vehicles[0]) : '');
  $('c-exp-title').textContent = t('expenses') + (expVehName ? ' — ' + expVehName : '');
  const exAllV = await allExpenses();
  const ex = S.vehExpVeh
    ? exAllV.filter(e => String(e.aracId) === S.vehExpVeh || !e.aracId)
    : exAllV;

  // ---- toplam gider metrikleri (şarj + sabit) ----
  const sessV = vehFilter(await allSessions(), S.vehExpVeh);
  const chargeTot = sessV.reduce((s, r) => s + amtB(r), 0);
  const fixedTot = ex.reduce((s, e) => s + expB(e), 0);
  $('v-total-cost').textContent = money(chargeTot + fixedTot);
  $('v-exp-total').textContent = money(fixedTot);

  // ---- sabit gider grafiği (Ay/Yıl) ----
  const gran = S.vehExpGran || 'month';
  $('v-exp-gran').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === gran));
  $('v-exp-chart-wrap').style.display = ex.length ? '' : 'none';
  if (ex.length) {
    // WT-81/2: dönem listesi calc.js'teki ortak yardımcılardan geliyor.
    // `key` uzunluğu kadar kırpıp eşleştir: yılda '2026', ayda '2026-08'.
    const donem = gran === 'year' ? sonYillar(5) : sonAylar(6);
    const ebars = donem.map(p => ({label: p.label,
      sum: ex.filter(e => e.tarih.slice(0, p.key.length) === p.key)
        .reduce((s, e) => s + expB(e), 0)}));
    // WT-81: çizim barChartHTML()'e taşındı (oran bozulması düzeltmesi)
    $('v-exp-chart').innerHTML = barChartHTML(ebars.map(b => ({
      label: b.label, value: b.sum, text: b.sum ? money(b.sum) : ''
    })));
    labelBarChart('v-exp-chart', t('expChart'),
      ebars.map(b => ({label: b.label, text: money(b.sum)})));
  }

  const expList = $('c-exp-list');
  if (!ex.length) {
    expList.innerHTML = `<div class="about" style="margin:0">${t('noExpenses')}</div>`;
    $('c-exp-cats-wrap').style.display = 'none';
    $('exp-flt-wrap').style.display = 'none';
    $('exp-flt-count').style.display = 'none';
  } else {
    // WT-75/Aracım 5: gider türü + ay/yıl filtresi. Filtre YALNIZ listeyi
    // daraltır (kutular, grafik ve dağılım tüm giderleri gösterir); durum
    // ayarlara YAZILMIYOR, sayfa filtresi olarak oturumda kalıyor.
    expFltFill(ex);
    const flt = expFltApply(ex);
    // WT-75/Aracım 6: tespit doğrulandı — liste zaten tarihe göre tersten
    // sıralıydı. Aynı güne iki kalem girilirse SON GİRİLEN üste gelsin diye
    // id kırılma ölçütü eklendi (Dexie id'si artan).
    const sortedExp = [...flt].sort((a, b) =>
      b.tarih.localeCompare(a.tarih) || (b.id || 0) - (a.id || 0));
    $('exp-flt-count').style.display = flt.length === ex.length ? 'none' : '';
    $('exp-flt-count').textContent = flt.length + ' / ' + ex.length;
    expList.innerHTML = sortedExp.length
      ? sortedExp.map(e => `
      <div class="crow" data-exp="${e.id}" style="cursor:pointer">
        <div class="avatar" style="background:var(--chip);color:var(--accent-text)">${EXP_ICON[e.tur] || '📦'}</div>
        <div class="mid">
          <div class="name">${e.altAd ? esc(e.altAd) : t('exp_' + e.tur)}</div>
          <div class="sub">${shortDate(e.tarih + 'T00:00')}${e.not ? ' · ' + esc(e.not) : ''}</div>
        </div>
        <div class="right"><div class="amt">${fm(symOf(e.cur || S.currency), fmtNum(e.tutar, 0))}</div></div>
      </div>`).join('')
      : `<div class="about" style="margin:0">${t('expFltNone')}</div>`;
    expList.querySelectorAll('[data-exp]').forEach(el =>
      el.addEventListener('click', async () =>
        openExpense(await db.expenses.get(+el.dataset.exp))));
    // "Diğer" türünde özel başlık (altAd) girilmişse kendi kategorisi gibi ayrı gösterilir
    const byCat = {};
    ex.forEach(e => {
      const key = (e.tur === 'other' && e.altAd) ? 'other:' + e.altAd.toLowerCase() : e.tur;
      (byCat[key] ||= {label: (e.tur === 'other' && e.altAd) ? e.altAd : t('exp_' + e.tur), icon: EXP_ICON[e.tur] || '📦', sum: 0});
      byCat[key].sum += expB(e);
    });
    const cats = Object.values(byCat).sort((a, b) => b.sum - a.sum);
    const maxC = Math.max(1, ...cats.map(c => c.sum));
    $('c-exp-cats-wrap').style.display = '';
    $('c-exp-cats').innerHTML = cats.map(c => `
      <div class="tl">
        <div class="tn">${c.icon} ${esc(c.label)}</div>
        <div class="tbar"><div style="width:${Math.round(c.sum / maxC * 100)}%"></div></div>
        <div class="tv">${money(c.sum)}</div>
      </div>`).join('');
  }
}
$('veh-exp-sel').addEventListener('change', () => {
  S.vehExpVeh = $('veh-exp-sel').value;
  renderVehiclePage();
});
$('v-exp-gran').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.vehExpGran = b.dataset.v;
  renderVehiclePage();
});
let photoTargetVid = null;
$('car-photo').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const foto = await resizePhoto(file);   // WT-39/1: artık Blob
    if (photoTargetVid) {
      const w = await safeWrite(() => db.vehicles.update(photoTargetVid, {photo: foto}));   // WT-12
      photoTargetVid = null;
      if (!w.ok) return;
      toast(t('photoAdded'));
      renderVehiclePage();
    } else if (carPick) {
      carPick.photo = foto;
      $('car-summary').innerHTML = evSummaryHTML(carPick) + photoBtnHTML(true);
      bindPhotoBtn();
    }
  } catch { /* okunamadı */ }
});

$('set-currency').addEventListener('change', async e => {
  S.currency = e.target.value;
  await saveSetting('currency', S.currency);
  applyI18n(); renderSettings();
});
$('set-unit').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  S.unit = b.dataset.v;
  await saveSetting('unit', S.unit);
  applyI18n(); renderSettings();
});
$('set-lang').addEventListener('change', async e => {
  S.lang = e.target.value;
  await saveSetting('lang', S.lang);
  applyI18n(); renderSettings();
});
$('set-theme').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  S.theme = b.dataset.v;
  await saveSetting('theme', S.theme);
  applyTheme();
  $('set-theme').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderSettings();
});
$('set-adv').addEventListener('change', async e => {
  S.advOpen = e.target.checked;
  await saveSetting('advOpen', S.advOpen);
});
// WT-16/C1: Ev/İş elektrik birim fiyatı
bindDecimalInput('set-homekwh', 2);
$('set-homekwh').addEventListener('change', async () => {
  const r = checkNum('birimFiyat', $('set-homekwh').value);
  if (!r.ok) { toast(r.msg); $('set-homekwh').value = fmtInput(S.homeKwhPrice, 2); return; }
  S.homeKwhPrice = r.value;
  await saveSetting('homeKwhPrice', S.homeKwhPrice);
});

// ---------- ülke seçici (ayarlar) ----------
function renderCountryList(query) {
  const q = (query || '').toLocaleLowerCase('tr');
  const list = COUNTRIES.filter(c =>
    c[2].toLocaleLowerCase('tr').includes(q) || c[0].toLowerCase().includes(q));
  const box = $('country-list');
  box.innerHTML = list.map(c =>
    `<div class="country-item ${c[0] === S.country ? 'sel' : ''}" data-code="${c[0]}">
      <div class="flag">${c[1]}</div>
      <div class="n">${esc(c[2])}</div>
      <div class="c">${c[3]} · ${c[5]}</div>
    </div>`).join('');
  box.querySelectorAll('.country-item').forEach(el =>
    el.addEventListener('click', async () => {
      const c = COUNTRIES.find(x => x[0] === el.dataset.code);
      if (countryPickMode === 'bank') {
        const codes = S.bankCountries && S.bankCountries.length ? [...S.bankCountries] : [S.country];
        if (!codes.includes(c[0])) codes.push(c[0]);
        S.bankCountries = codes;
        await saveSetting('bankCountries', codes);
        overlayClose('page-country', {force: true});
        renderBankCountries();
        return;
      }
      S.country = c[0]; S.currency = c[3]; S.unit = c[5];
      if (LANG_NAMES[c[6]]) S.lang = c[6];
      // WT-78: eyalet/il seçimi ülkeye bağlı, ülke değişince geçersiz kalıyor
      S.kwhRegion = '';
      for (const [k, v] of [['country', S.country], ['currency', S.currency],
        ['unit', S.unit], ['lang', S.lang], ['kwhRegion', '']])
        await saveSetting(k, v);
      await kwhPriceAutofill();   // WT-78: yalnız alan boşsa doldurur
      overlayClose('page-country', {force: true});
      applyI18n(); renderSettings();
    }));
}
let countryPickMode = 'region';   // 'region' | 'bank'
$('btn-country').addEventListener('click', () => {
  countryPickMode = 'region';
  $('country-search').value = '';
  renderCountryList('');
  overlayOpen('page-country');
});
$('btn-add-bankc').addEventListener('click', () => {
  countryPickMode = 'bank';
  $('country-search').value = '';
  renderCountryList('');
  overlayOpen('page-country');
});
function renderBankCountries() {
  const codes = (S.bankCountries && S.bankCountries.length) ? S.bankCountries : [S.country];
  $('set-bankc').innerHTML = codes.map(cc => {
    const c = COUNTRIES.find(x => x[0] === cc);
    return `<button type="button" class="chip" data-cc="${cc}">${c ? c[1] + ' ' + c[2] : cc} ×</button>`;
  }).join('');
  $('set-bankc').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', async () => {
      let codes2 = (S.bankCountries || [S.country]).filter(x => x !== b.dataset.cc);
      if (!codes2.length) codes2 = [S.country];
      S.bankCountries = codes2;
      await saveSetting('bankCountries', codes2);
      renderBankCountries();
    }));
}
$('btn-close-country').addEventListener('click', () => overlayClose('page-country'));
$('btn-close-photo').addEventListener('click', () => overlayClose('photo-view'));
$('country-search').addEventListener('input', e => renderCountryList(e.target.value));

// ---------- araç arama (ortak) ----------
// WT-40/A: 400V/800V mimarisi son kullanıcı için anlamsız; menzil gösteriliyor.
// Menzil ÜRETİCİ BEYANI (WLTP) — uygulamada hiçbir hesapta kullanılmıyor,
// yalnız doğru sürümü ayırt etmeye yarıyor.
const rangeTxt = km => km ? Math.round(distDisp(km)) + ' ' + S.unit + ' ' + t('rangeShort') : '—';

function evRec(e, i) {
  return {i, brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
    batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10],
    guncelleme: e[11] || EV_DB_TARIH};
}
function searchEV(q) {
  q = (q || '').toLocaleLowerCase('tr').trim();
  if (q.length < 2) return [];
  // WT-40/C5: aynı model-yılda birden çok batarya sürümü olabiliyor; sonuç
  // KIRPILMADAN önce eleniyor ki kullanıcı doğru sürümü görebilsin.
  return EV_DB.map(evRec)
    .filter(v => (v.brand + ' ' + v.model + ' ' + v.trim).toLocaleLowerCase('tr').includes(q))
    .slice(0, 14);
}
function photoBtnHTML(has) {
  return `<button class="photo-btn" id="btn-carphoto" type="button">${t(has ? 'changePhoto' : 'addPhoto')}</button>`;
}
function bindPhotoBtn() {
  const b = $('btn-carphoto');
  if (b) b.addEventListener('click', () => { photoTargetVid = null; $('car-photo').click(); });
}
function bindEVSearch(inputId, resultsId, summaryId, onSel, withPhoto) {
  $(inputId).addEventListener('input', () => {
    const res = searchEV($(inputId).value);
    onSel(null);
    $(summaryId).style.display = 'none';
    const box = $(resultsId);
    const qv = $(inputId).value.trim();
    if (!res.length && qv.length >= 2) {
      box.innerHTML = `<button class="chip" style="align-self:flex-start" id="${resultsId}-custom">${t('customAdd', {q: esc(qv)})}</button>`;
      $(resultsId + '-custom').addEventListener('click', () => {
        const custom = {ad: qv, body: 'suv'};
        $(summaryId).innerHTML = evSummaryHTML(custom) + (withPhoto ? photoBtnHTML(false) : '');
        $(summaryId).style.display = '';
        if (withPhoto) bindPhotoBtn();
        onSel(custom);
        box.innerHTML = '';
      });
      return;
    }
    box.innerHTML = res.map(v => {
      const yr = v.y1 + (v.y2 ? '–' + v.y2 : '+');
      return `<div class="ev-item" data-i="${v.i}">
        <div class="n">${esc(v.brand)} ${esc(v.model)}</div>
        <div class="d"><b>${esc(v.trim)}</b> · ${yr} · ${v.batt} kWh · ${rangeTxt(v.range)}</div>
      </div>`;
    }).join('');
    box.querySelectorAll('.ev-item').forEach(el =>
      el.addEventListener('click', () => {
        box.querySelectorAll('.ev-item').forEach(x =>
          x.classList.toggle('sel', x === el));
        const v = evRec(EV_DB[+el.dataset.i], +el.dataset.i);
        $(summaryId).innerHTML = evSummaryHTML(v) + (withPhoto ? photoBtnHTML(false) : '');
        $(summaryId).style.display = '';
        if (withPhoto) bindPhotoBtn();
        onSel(v);
      }));
  });
}

// ---------- ayarlardan araç ekleme ----------
let carPick = null;
bindEVSearch('car-search', 'car-results', 'car-summary', v => {
  carPick = v;
  $('car-save').disabled = !v;
}, true);
$('btn-add-vehicle').addEventListener('click', () => {
  $('car-search').value = ''; $('car-results').innerHTML = '';
  $('car-summary').style.display = 'none'; carPick = null;
  $('car-save').disabled = true;
  overlayOpen('page-addcar');
});
$('btn-close-addcar').addEventListener('click', () => overlayClose('page-addcar'));
$('car-save').addEventListener('click', async () => {
  if (!carPick) return;
  const w = await safeWrite(() => db.vehicles.add(vehicleRec(carPick)));   // WT-12
  if (!w.ok) return;
  const id = w.value;
  if (!S.defaultVehicleId) { S.defaultVehicleId = id; await saveSetting('defaultVehicleId', id); }
  toast(t('vehicleAdded'));
  overlayClose('page-addcar', {force: true});
  renderVehiclePage();
});
function vehicleRec(v) {
  const rec = v.brand
    ? {ad: v.brand + ' ' + v.model, brand: v.brand, model: v.model, trim: v.trim,
       y1: v.y1, y2: v.y2, batt: v.batt, arch: v.arch, dc: v.dc, ac: v.ac,
       range: v.range, body: v.body, evVeriTarih: v.guncelleme || EV_DB_TARIH}
    : {ad: v.ad, body: v.body || 'suv'};
  if (v.photo) rec.photo = v.photo;
  return rec;
}


/* ---- Araç giderleri ---- */
// ============================================================
// ARAÇ GİDERLERİ (vergi / sigorta / bakım …)
// ============================================================
let editingExpId = null;
async function openExpense(rec) {
  // WT-18: araç zorunlu olduğu için hiç araç yokken gider girilemez
  if (!(await db.vehicles.count())) { toast(t('noVehYet')); return; }
  editingExpId = rec?.id || null;
  $('exp-title').textContent = rec ? t('editExpense') : t('addExpense');
  $('btn-del-exp').style.display = rec ? '' : 'none';
  $('in-exp-type').innerHTML = EXP_TYPES.map(k =>
    `<option value="${k}">${EXP_ICON[k]} ${t('exp_' + k)}</option>`).join('');
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('in-exp-cur').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  // WT-18: "Tüm araçlar" bir FİLTRE değeri, geçerli bir kayıt değeri değil —
  // formdan kaldırıldı. Tek araçta seçici gizli kalır ama id OTOMATİK atanır
  // (eskiden aracId her zaman null yazılıyordu).
  const vs = (await allVehicles()).filter(v => !v.archived || v.id === rec?.aracId);
  $('wrap-exp-veh').style.display = vs.length > 1 ? '' : 'none';
  $('in-exp-veh').innerHTML =
    vs.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  $('in-exp-type').value = rec?.tur || 'tax';
  $('in-exp-altad').placeholder = t('otherTypePh');
  $('in-exp-altad').value = rec?.altAd || '';
  $('in-exp-altad').style.display = $('in-exp-type').value === 'other' ? '' : 'none';
  $('in-exp-date').value = (rec?.tarih || '').slice(0, 10) || localISO();
  $('in-exp-cur').value = rec?.cur || S.currency;
  $('in-exp-amount').value = rec ? fmtInput(rec.tutar, 2) : '';
  const defVeh = rec?.aracId
    ?? (vs.find(v => v.id === S.defaultVehicleId)?.id ?? vs[0]?.id);
  $('in-exp-veh').value = defVeh != null ? String(defVeh) : '';
  $('in-exp-note').value = rec?.not || '';
  $('in-exp-amt-lbl').textContent = t('expAmount') + ' (' + symOf($('in-exp-cur').value) + ')';
  // WT-44/1: hatırlatma alanları
  remDoldurSecicileri();
  $('in-exp-int').value = rec?.hatirlatmaAraligi || '';
  $('in-exp-intkm').value = rec?.hatirlatmaKm != null ? String(rec.hatirlatmaKm) : '';
  $('in-exp-next').value = rec?.sonrakiTarih || '';
  $('in-exp-nextkm').value = rec?.sonrakiKm != null
    ? fmtNum(Math.round(distDisp(rec.sonrakiKm)), 0) : '';
  $('in-exp-repeat').checked = rec?.tekrar === true;
  const acik = !!(rec?.sonrakiTarih || rec?.sonrakiKm);
  $('exp-rem').style.display = acik ? '' : 'none';
  $('exp-rem-toggle').setAttribute('aria-expanded', String(acik));
  $('exp-rem-toggle').textContent = acik ? t('remindHide') : t('remindAdd');
  $('in-exp-type').dispatchEvent(new Event('change'));
  overlayOpen('page-expense');
  markFormClean('page-expense');   // WT-24/7: 'temiz' referansı
}
$('btn-add-exp').addEventListener('click', () => openExpense(null));
$('in-exp-type').addEventListener('change', () => {
  $('in-exp-altad').style.display = $('in-exp-type').value === 'other' ? '' : 'none';
});
$('in-exp-cur').addEventListener('change', () => {
  $('in-exp-amt-lbl').textContent = t('expAmount') + ' (' + symOf($('in-exp-cur').value) + ')';
});
$('btn-close-exp').addEventListener('click', () => overlayClose('page-expense'));
$('btn-del-exp').addEventListener('click', async () => {
  if (!editingExpId || !confirm(t('deleteAsk'))) return;
  await db.expenses.delete(editingExpId);
  overlayClose('page-expense', {force: true});
  editingExpId = null;
  toast(t('deleted'));
  renderVehiclePage();
  renderCompare();
});
$('btn-save-exp').addEventListener('click', async () => {
  // WT-05: tarih zorunlu, gider formunda da
  const expDate = $('in-exp-date').value;
  if (!isValidDate(expDate)) { toast(t('dateNeeded')); $('in-exp-date').focus(); return; }
  if (expDate > localISO()) toast(t('futureDate'));
  // WT-18: araç zorunlu — aracId null kalırsa gider HER araca sayılıyor ve
  // iki araçlı kullanıcıda kıyasa iki kez giriyor
  const expVeh = +$('in-exp-veh').value || null;
  if (!expVeh) { toast(t('vehNeeded')); $('in-exp-veh').focus(); return; }
  const amtChk = checkNum('tutar', $('in-exp-amount').value, {required: true});   // WT-04
  if (!amtChk.ok) { toast(amtChk.msg); $('in-exp-amount').focus(); return; }
  const tutar = amtChk.value;
  if (tutar <= 0) { toast(t('amountNeeded')); return; }
  const cur = $('in-exp-cur').value;
  const tur = $('in-exp-type').value;
  const rec = {
    tarih: expDate,
    tur,
    altAd: tur === 'other' ? $('in-exp-altad').value.trim() : '',
    tutar, cur,
    aracId: expVeh,
    not: $('in-exp-note').value.trim(),
    // WT-44/1: hatırlatma. Sayaç değeri km olarak saklanıyor (gösterim mi olabilir).
    hatirlatmaAraligi: $('in-exp-int').value || null,
    hatirlatmaKm: $('in-exp-intkm').value ? +$('in-exp-intkm').value : null,
    sonrakiTarih: isValidDate($('in-exp-next').value) ? $('in-exp-next').value : null,
    sonrakiKm: (() => {
      const v = pf($('in-exp-nextkm').value, 0);
      return isNaN(v) || v <= 0 ? null : Math.round(S.unit === 'mi' ? v * MI : v);
    })(),
    tekrar: $('in-exp-repeat').checked
  };
  const wasEditing = editingExpId;
  const w = await safeWrite(async () => wasEditing            // WT-12
    ? (await db.expenses.update(wasEditing, rec), wasEditing)
    : await db.expenses.add(rec));
  if (!w.ok) return;
  const id = w.value;
  overlayClose('page-expense', {force: true});
  toast(wasEditing ? t('updated') : t('savedLocal'));
  editingExpId = null;
  renderVehiclePage();
  renderCompare();
  fetchTable(cur, rec.tarih).then(got => {
    if (got) db.expenses.update(id, {fxTable: got.rates, fxDate: got.date})
      .then(() => { renderVehiclePage(); renderCompare(); });
  });
});


/* ---- WT-40/C3: teknik değerlerin elle düzeltilmesi ---- */
// EV_DB hiçbir zaman %100 doğru olmayacak; asıl çözüm kullanıcının kendi
// aracının gerçek değerini girebilmesi. Girilen değer vehicles kaydına
// yazılıyor ve EV_DB'den gelen değerin YERİNE geçiyor.
let specVid = null;
// WT-60: kart araç HENÜZ KAYDEDİLMEDEN de çiziliyor (onboarding ve "araç ekle"
// seçim ekranı). O durumda düzenlenecek bir DB kaydı yok; taslağın kendisi
// düzenleniyor ve kart yeniden çiziliyor. Kullanıcı böylece aracını
// kaydetmeden önce, EV_DB'de alt versiyonu yoksa bataryayı düzeltebiliyor.
let specTaslak = null;
const EV_TASLAK = {
  'car-summary':   {al: () => carPick, foto: true},
  'ob-ev-summary': {al: () => obEv,    foto: false}
};
async function openEvSpecs(vid, taslak, kutuId) {
  const v = taslak || await db.vehicles.get(vid);
  if (!v) return;
  specVid = taslak ? null : vid;
  specTaslak = taslak ? {rec: v, kutu: kutuId} : null;
  $('ev-range-lbl').textContent = t('rangeWltp') + ' (' + S.unit + ')';
  $('ev-batt').value = v.batt != null ? fmtInput(v.batt, 2) : '';
  $('ev-range').value = v.range != null ? fmtNum(Math.round(distDisp(v.range)), 0) : '';
  $('ev-dc').value = v.dc != null ? fmtNum(v.dc, 0) : '';
  $('ev-ac').value = v.ac != null ? fmtInput(v.ac, 1) : '';
  // Kaynağı söyle: değer üretici listesinden mi geldi, kullanıcı mı düzeltti?
  $('ev-spec-note').textContent = v.specElle
    ? t('evSpecManual')
    : t('evDataDate', {d: v.evVeriTarih || EV_DB_TARIH});
  $('evspec-reset').style.display = (v.specElle && v.brand && !taslak) ? '' : 'none';
  $('evspec-err').classList.remove('show');
  overlayOpen('page-evspecs');
}
// WT-60: bu düğme (ui/shell.js:195) çiziliyordu ama dinleyicisi HİÇ
// bağlanmamıştı — basınca gerçekten hiçbir şey olmuyordu. Kart üç ayrı yerde
// yeniden üretildiği için dinleyici, fotoğraf görüntüleyicide olduğu gibi,
// belgede duruyor.
document.addEventListener('click', e => {
  const b = e.target.closest?.('[data-ev-edit]');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  const vid = b.dataset.evEdit;
  if (vid) { openEvSpecs(+vid); return; }
  // Kaydedilmemiş seçim: taslağı düzenle
  const kutu = b.closest('.ev-summary')?.parentElement?.id;
  const kaynak = EV_TASLAK[kutu];
  const rec = kaynak?.al();
  if (rec) openEvSpecs(null, rec, kutu);
});
$('btn-close-evspecs').addEventListener('click', () => {
  specTaslak = null;   // WT-60: vazgeçilen taslak sonraki açılışa sızmasın
  overlayClose('page-evspecs');
});
['ev-batt', 'ev-ac'].forEach(id => bindDecimalInput(id, 2));
['ev-range', 'ev-dc'].forEach(id => bindDecimalInput(id, 0));

$('evspec-save').addEventListener('click', async () => {
  if (specVid == null && !specTaslak) return;
  const err = $('evspec-err');
  const alanlar = [['ev-batt', 'batt'], ['ev-range', 'range'], ['ev-dc', 'dc'], ['ev-ac', 'ac']];
  const upd = {};
  for (const [id, alan] of alanlar) {
    const r = checkNum('spec_' + alan, $(id).value);
    if (!r.ok) {   // WT-04: sessizce kırpma yok, hata söylenir
      err.textContent = r.msg; err.classList.add('show');
      $(id).focus();
      return;
    }
    if (r.value != null)
      upd[alan] = alan === 'range' && S.unit === 'mi' ? Math.round(r.value * MI) : r.value;
  }
  err.classList.remove('show');
  upd.specElle = true;   // artık üretici listesi değil kullanıcı değeri geçerli
  // WT-60: taslak yolu — henüz DB'de kayıt yok, nesnenin kendisi güncellenip
  // kart yeniden çiziliyor. Araç kaydedilince düzeltilmiş değerlerle yazılır.
  if (specTaslak) {
    Object.assign(specTaslak.rec, upd);
    const kaynak = EV_TASLAK[specTaslak.kutu];
    if (kaynak) {
      $(specTaslak.kutu).innerHTML =
        evSummaryHTML(specTaslak.rec) + (kaynak.foto ? photoBtnHTML(false) : '');
      if (kaynak.foto) bindPhotoBtn();
    }
    specTaslak = null;
    await overlayClose('page-evspecs', {force: true});
    return;
  }
  const w = await safeWrite(() => db.vehicles.update(specVid, upd));
  if (!w.ok) return;
  toast(t('savedLocal'));
  await overlayClose('page-evspecs', {force: true});
  renderVehiclePage();
  renderDashboard();
});

// Üretici değerlerine dönüş: EV_DB'de aynı marka/model/donanım/yıl kaydını bul
$('evspec-reset').addEventListener('click', async () => {
  const v = await db.vehicles.get(specVid);
  if (!v?.brand) return;
  const e = EV_DB.find(x => x[0] === v.brand && x[1] === v.model && x[2] === v.trim
    && x[3] === v.y1);
  if (!e) { toast(t('noData')); return; }
  const r = evRec(e, 0);
  await safeWrite(() => db.vehicles.update(specVid, {
    batt: r.batt, range: r.range, dc: r.dc, ac: r.ac,
    specElle: false, evVeriTarih: r.guncelleme
  }));
  toast(t('savedLocal'));
  await overlayClose('page-evspecs', {force: true});
  renderVehiclePage();
  renderDashboard();
});


/* ---- WT-44: bakım hatırlatmaları ---- */
// Gider kategorileri ileriye dönük çalışmıyordu. Artık her gider kaydı
// isteğe bağlı bir hatırlatma taşıyabiliyor: tarih ve/veya sayaç değeri.
// İKİSİ birden girilirse HANGİSİ ÖNCE GELİRSE o tetiklenir.
const REM_ARALIK = [        // [anahtar, gün]
  ['', null], ['3ay', 90], ['6ay', 180], ['1yil', 365], ['2yil', 730]
];
const REM_KM = [['', null], ['5000', 5000], ['10000', 10000],
                ['15000', 15000], ['20000', 20000], ['30000', 30000]];
// WT-44/4: yalnız ÖNERİ — kullanıcı değiştirebiliyor
const REM_VARSAYILAN = {
  tax: {gun: 365}, insurance: {gun: 365}, inspection: {gun: 730},
  tire: {km: 10000}, maintenance: {gun: 365, km: 15000}, repair: {},
  parking: {}, equipment: {}, other: {}
};

function remDoldurSecicileri() {
  $('in-exp-int').innerHTML = REM_ARALIK.map(([k]) =>
    `<option value="${k}">${k ? t('rem_' + k) : t('remindNone')}</option>`).join('');
  $('in-exp-intkm').innerHTML = REM_KM.map(([k]) =>
    `<option value="${k}">${k ? fmtNum(distDisp(+k), 0) + ' ' + S.unit : t('remindNone')}</option>`).join('');
  $('in-exp-nextkm-lbl').textContent = t('remindNextKm', {u: S.unit});
}
// Aralık seçilince sonraki tarih/sayaç ÖNERİLİR (kullanıcı yine değiştirebilir)
function remOner() {
  const gun = REM_ARALIK.find(([k]) => k === $('in-exp-int').value)?.[1];
  if (gun) {
    const d = new Date($('in-exp-date').value || localISO());
    d.setDate(d.getDate() + gun);
    $('in-exp-next').value = localISO(d);
  }
  const km = REM_KM.find(([k]) => k === $('in-exp-intkm').value)?.[1];
  if (km) remOnerKm(km);
}
async function remOnerKm(km) {
  const v = (await allVehicles()).find(x => x.id === +$('in-exp-veh').value);
  const now = v ? (await odoNowOf(v)).km : null;
  if (now != null) $('in-exp-nextkm').value = fmtNum(Math.round(distDisp(now + km)), 0);
}
$('in-exp-int').addEventListener('change', remOner);
$('in-exp-intkm').addEventListener('change', remOner);
$('exp-rem-toggle').addEventListener('click', () => {
  const box = $('exp-rem'), acik = box.style.display === 'none';
  box.style.display = acik ? '' : 'none';
  $('exp-rem-toggle').setAttribute('aria-expanded', String(acik));
  $('exp-rem-toggle').textContent = acik ? t('remindHide') : t('remindAdd');
});

// Gider türü değişince varsayılan ARALIK önerisi (WT-44/4)
$('in-exp-type').addEventListener('change', () => {
  const d = REM_VARSAYILAN[$('in-exp-type').value] || {};
  $('exp-rem-hint').textContent = (d.gun || d.km)
    ? t('remindSuggest', {
        v: [d.gun ? t('rem_' + REM_ARALIK.find(([, g]) => g === d.gun)[0]) : null,
            d.km ? fmtNum(distDisp(d.km), 0) + ' ' + S.unit : null]
          .filter(Boolean).join(' · ')})
    : '';
});

// WT-44/3: yaklaşan hatırlatmalar. Km bazlılar için aracın güncel sayacı
// (WT-19) kullanılıyor.
async function yaklasanlar() {
  const exps = (await allExpenses()).filter(e => e.sonrakiTarih || e.sonrakiKm);
  if (!exps.length) return [];
  const vs = await allVehicles();
  const odo = {};
  for (const v of vs) odo[v.id] = (await odoNowOf(v)).km;
  const bugun = localISO();
  return exps.map(e => {
    const ad = e.tur === 'other' && e.altAd ? e.altAd : t('exp_' + e.tur);
    let gun = null, km = null;
    if (e.sonrakiTarih)
      gun = Math.round((new Date(e.sonrakiTarih) - new Date(bugun)) / 86400000);
    if (e.sonrakiKm != null && odo[e.aracId] != null)
      km = e.sonrakiKm - odo[e.aracId];
    // "10.000 km veya 1 yıl — hangisi önce": ikisi de varsa yakın olan
    const gunSira = gun != null ? gun : Infinity;
    const kmSira = km != null ? km / 50 : Infinity;   // kaba: ~50 km/gün
    return {e, ad, gun, km, sira: Math.min(gunSira, kmSira),
      gecti: (gun != null && gun < 0) || (km != null && km < 0)};
  }).sort((a, b) => a.sira - b.sira).slice(0, 3);
}

async function renderYaklasanlar() {
  const liste = await yaklasanlar();
  const box = $('v-upcoming');
  if (!liste.length) { box.style.display = 'none'; return; }
  box.style.display = '';
  $('v-upcoming-list').innerHTML = liste.map(x => {
    const parca = [];
    if (x.gun != null) parca.push(x.gun < 0
      ? t('remLate', {n: Math.abs(x.gun)}) : t('remInDays', {n: x.gun}));
    if (x.km != null) parca.push(x.km < 0
      ? t('remLateKm', {n: fmtNum(Math.abs(distDisp(x.km)), 0), u: S.unit})
      : t('remInKm', {n: fmtNum(distDisp(x.km), 0), u: S.unit}));
    return `<div class="crow" data-expid="${x.e.id}">
      <div class="avatar" style="background:var(--chip);color:var(--accent-text)">${EXP_ICON[x.e.tur] || '📦'}</div>
      <div class="mid">
        <div class="name">${esc(x.ad)}</div>
        <div class="sub"${x.gecti ? ' style="color:var(--red);font-weight:600"' : ''}>${esc(parca.join(' · '))}</div>
      </div>
    </div>`;
  }).join('');
  $('v-upcoming-list').querySelectorAll('[data-expid]').forEach(el =>
    el.addEventListener('click', async () =>
      openExpense(await db.expenses.get(+el.dataset.expid))));
  // WT-44/5: bildirim isteğe bağlı. İzin yoksa kart yine görünüyor.
  const nOK = typeof Notification !== 'undefined';
  $('btn-notify').style.display = nOK && Notification.permission === 'default' ? '' : 'none';
  if (nOK && Notification.permission === 'granted') bildirimGonder(liste);
}
$('btn-notify').addEventListener('click', async () => {
  try {
    const izin = await Notification.requestPermission();
    if (izin === 'granted') { toast(t('savedLocal')); renderVehiclePage(); }
  } catch { /* desteklenmiyor */ }
});
let _bildirilen = new Set();
function bildirimGonder(liste) {
  for (const x of liste) {
    if (!x.gecti && !(x.gun != null && x.gun <= 7)) continue;
    const anahtar = x.e.id + ':' + (x.e.sonrakiTarih || x.e.sonrakiKm);
    if (_bildirilen.has(anahtar)) continue;
    _bildirilen.add(anahtar);
    try {
      new Notification('WattTrack', {body: x.ad + ' — '
        + (x.gecti ? t('remLate', {n: Math.abs(x.gun ?? 0)})
                   : t('remInDays', {n: x.gun}))});
    } catch { /* bildirim gönderilemedi */ }
  }
}

// WT-44/2: tekrarlayan kalem tetiklendiğinde yeni taslak ÖNERİLİR (onaylı)
async function tekrarOner() {
  const liste = await yaklasanlar();
  for (const x of liste) {
    if (!x.e.tekrar || !x.gecti) continue;
    if (!confirm(t('remRepeatAsk', {v: x.ad}))) continue;
    const yeni = {...x.e};
    delete yeni.id;
    yeni.tarih = localISO();
    yeni.sonrakiTarih = x.e.hatirlatmaAraligi
      ? (() => { const d = new Date();
          d.setDate(d.getDate() + (REM_ARALIK.find(([k]) => k === x.e.hatirlatmaAraligi)?.[1] || 365));
          return localISO(d); })()
      : null;
    await openExpense(yeni);
    return;   // aynı anda tek taslak
  }
}
