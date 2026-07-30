/* ============================================================
   WattTrack — compare
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Kıyasla ---- */
// ============================================================
// KIYASLA
// ============================================================
$('c-fuel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('c-fuel').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  $('c-hybrid-note').style.display = b.dataset.v === 'hybrid' ? '' : 'none';
});
$('c-vehsel').addEventListener('change', () => { S.cmpVeh = $('c-vehsel').value; renderCompare(); });
$('c-inclarch').addEventListener('change', () => renderCompare());   // WT-18/4
$('c-calc').addEventListener('click', async () => {
  const price = pf($('c-price').value);
  const cons = pf($('c-cons').value);
  if (!price || !cons || price <= 0 || cons <= 0) return;
  S.cmp = {fuel: $('c-fuel').querySelector('.sel').dataset.v, price, cons,
    icefix: Math.max(0, pf($('c-icefix').value) || 0),
    prorate: $('c-prorate').checked};
  await saveSetting('cmp', S.cmp);
  renderCompare();
});

async function renderCompare() {
  const vehicles = (await allVehicles()).filter(v => !v.archived);
  const wrap = $('wrap-c-veh');
  wrap.style.display = vehicles.length > 1 ? '' : 'none';
  if (vehicles.length > 1) {
    const cur = S.cmpVeh;
    $('c-vehsel').innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    $('c-vehsel').value = cur;
  }
  if (S.cmp) {
    $('c-price').value = fmtInput(S.cmp.price, 2);
    $('c-cons').value = fmtInput(S.cmp.cons, 2);
    $('c-icefix').value = S.cmp.icefix ? fmtInput(S.cmp.icefix, 2) : '';
    $('c-prorate').checked = S.cmp.prorate !== false;
    $('c-fuel').querySelectorAll('button').forEach(x =>
      x.classList.toggle('sel', x.dataset.v === S.cmp.fuel));
    $('c-hybrid-note').style.display = S.cmp.fuel === 'hybrid' ? '' : 'none';
  }

  // ---- Araç giderleri: hesaplamaya dahil edilir (liste/kategori UI'ı Aracım sekmesinde) ----
  // WT-18: `|| !e.aracId` koşulu aracId'si null olan giderleri HER araca
  // sayıyordu; artık aracId zorunlu ve migration eskiyi düzeltiyor, o yüzden
  // koşul kalktı. "Tüm araçlar" görünümünde arşiv giderleri varsayılan HARİÇ.
  const allV = await allVehicles();
  const inclArch = $('c-inclarch').checked;
  const activeIds = new Set(allV.filter(v => inclArch || !v.archived).map(v => v.id));
  const exAll = await allExpenses();
  const ex = S.cmpVeh
    ? exAll.filter(e => String(e.aracId) === S.cmpVeh)
    : exAll.filter(e => activeIds.has(e.aracId));
  // WT-18/5: TCO'ya hangi araçların dahil olduğunu söyle
  $('wrap-c-arch').style.display = allV.some(v => v.archived) ? 'flex' : 'none';
  const inclNames = S.cmpVeh
    ? [vehName(allV.find(v => String(v.id) === S.cmpVeh))].filter(Boolean)
    : allV.filter(v => activeIds.has(v.id)).map(vehName);
  $('c-veh-note').textContent = inclNames.length
    ? t('tcoVehNote', {v: inclNames.join(', ')}) : '';

  const box = $('c-result');
  if (!S.cmp) { box.style.display = 'none'; return; }

  const all = vehFilter(await allSessions(), S.cmpVeh);
  reportFxGaps(all, 'c-warnings', 'fxCompare');   // WT-10
  let wd = all.filter(r => r.mesafeKm > 0);
  let distKm = wd.reduce((s, r) => s + r.mesafeKm, 0);
  let net = wd.reduce((s, r) => s + amtB(r), 0);
  let gross = net + wd.reduce((s, r) => s + savB(r), 0);
  // kayıt bazlı mesafe yoksa: kilometre sayacı (seçili araç ya da tek araç)
  const odoV2 = pickOdoVeh(vehicles, S.cmpVeh);
  const odoDist = odoDistOf(odoV2);
  let odoMode = false;
  if (distKm < 20 && odoDist >= 20) {
    odoMode = true;
    distKm = odoDist;
    net = all.filter(isConv).reduce((s, r) => s + amtB(r), 0);
    gross = net + all.filter(isConv).reduce((s, r) => s + savB(r), 0);
    // grafik/aylık dağıtım için: mesafeyi harcamayla orantılı paylaştır
    wd = all.filter(isConv).map(r =>
      ({...r, mesafeKm: net > 0 ? amtB(r) / net * odoDist : 0}));
  }
  $('c-dist-src').textContent = odoMode ? t('distFromOdo') : (distKm >= 20 ? t('distFromRecords') : '');
  box.style.display = '';
  if (distKm < 20) {
    $('c-ev').textContent = '—'; $('c-ice').textContent = '—';
    $('c-ev-g').textContent = '—'; $('c-disc-fx').textContent = '—';
    $('c-1km').textContent = '—'; $('c-1km-g').textContent = '—';
    $('c-ice1km').textContent = '—';
    ['c-exptot','c-icefixtot','c-tcoev','c-tcoice','c-tco1km','c-tcoice1km'].forEach(id => $(id).textContent = '—');
    $('c-perkm').textContent = t('needData');
    $('c-perkm').style.fontSize = '15px';
    $('c-per100').textContent = '';
    ['c-nf-ev-km','c-nf-ice-km','c-nf-ev-100','c-nf-ice-100','c-nf-ev-yr','c-nf-ice-yr','c-nf-kwh','c-nf-diff']
      .forEach(id => $(id).textContent = '—');
    $('c-nf-diff-pill').textContent = '';
    $('c-nf-bar-ev').style.width = '0%'; $('c-nf-bar-ice').style.width = '0%';
    $('c-nf-bar-ev-lbl').textContent = ''; $('c-nf-bar-ice-lbl').textContent = '';
    return;
  }
  $('c-perkm').style.fontSize = '28px';

  const f = distFactor();                       // 100 birim = 100*f km
  // WT-20 kararı: `atlanan` işaretli kayıtlar km BAŞI ortalamalardan çıkarılır
  // (ana sayfayla aynı kural), ama toplam mesafeden ÇIKARILMAZ — o km'ler
  // gerçekten sürüldü ve "aynı km yakıtlıyla" kıyası onlara dayanıyor.
  const wdAvg = odoMode ? wd : wd.filter(r => !r.atlanan);
  const distAvg = wdAvg.reduce((s, r) => s + r.mesafeKm, 0) || distKm;
  const netAvg = odoMode ? net : wdAvg.reduce((s, r) => s + amtB(r), 0);
  const grossAvg = odoMode ? gross
    : netAvg + wdAvg.reduce((s, r) => s + savB(r), 0);
  const evNetPerKm = netAvg / distAvg;
  const evGrossPerKm = grossAvg / distAvg;
  const icePerKm = S.cmp.price * S.cmp.cons / 100;

  $('c-1km').textContent = money2(evNetPerKm * f);
  $('c-ice1km').textContent = money2(icePerKm * f);
  $('c-1km-g').textContent = money2(evGrossPerKm * f);
  $('c-ev').textContent = money2(evNetPerKm * 100 * f);
  $('c-ev-g').textContent = money2(evGrossPerKm * 100 * f);
  $('c-ice').textContent = money2(icePerKm * 100 * f);
  $('c-disc-fx').textContent = '−' + money2((evGrossPerKm - evNetPerKm) * 100 * f);
  $('c-perkm').textContent = money2((icePerKm - evNetPerKm) * f) + ' / ' + S.unit;
  $('c-per100').textContent = t('per100', {v: money((icePerKm - evNetPerKm) * 100 * f), u: S.unit});

  // --- bugüne kadar kümülatif: EV gerçek vs yakıtlı (aynı km) ---
  const iceTot = distKm * icePerKm;
  $('c-dist-lbl').textContent = t('totalDist');
  $('c-dist').textContent = fmtNum(distDisp(distKm), 0) + ' ' + S.unit;
  $('c-evtot').textContent = money(net);
  $('c-icetot').textContent = money(iceTot);
  $('c-savetot').textContent = '+' + money(Math.max(0, iceTot - net));

  // kayıt bazlı kümülatif çizgiler (ilk kayıttan itibaren, son 14 nokta)
  const seq = [...wd].sort((a, b) => a.tarih.localeCompare(b.tarih));
  let cumEv = 0, cumIce = 0;
  const ptsEvAll = [], ptsIceAll = [], labelsAll = [];
  seq.forEach(r => {
    cumEv += amtB(r);
    cumIce += r.mesafeKm * icePerKm;
    ptsEvAll.push(cumEv); ptsIceAll.push(cumIce);
    labelsAll.push(shortDate(r.tarih));
  });
  // WT-17: odoMode'da mesafe harcamaya ORANTILI dağıtılıyor (amtB(r)/net*odoDist).
  // Bu durumda yakıtlı çizgi EV çizgisinin sabit katı olur — iki çizgi
  // birbirinin ölçeklenmiş kopyası. Grafik "veri" gibi görünür ama hiçbir
  // bilgi taşımaz. Bu modda gizlenir, toplam rakamlar görünmeye devam eder.
  $('c-line-card').style.display = odoMode ? 'none' : '';
  $('c-line-note').style.display = odoMode ? '' : 'none';
  if (odoMode) {
    $('c-line-note').textContent = t('chartNoDist');
  } else {
    const cut = Math.max(0, ptsEvAll.length - 14);
    drawLineChart('c-line', labelsAll.slice(cut), [
      {pts: ptsEvAll.slice(cut), color: '#1C8742'},
      {pts: ptsIceAll.slice(cut), color: '#1B5FAA'}
    ]);
    // WT-30: çizgi grafiğinin metin alternatifi — son değerler özetlenir
    const lastEv = ptsEvAll[ptsEvAll.length - 1] || 0;
    const lastIce = ptsIceAll[ptsIceAll.length - 1] || 0;
    labelBarChart('c-line', t('cumTitle'), [
      {label: t('evLine'), text: money(lastEv)},
      {label: t('iceLine'), text: money(lastIce)},
      {label: t('totalSaved'), text: money(lastIce - lastEv)}
    ]);
  }

  // ---- TOPLAM SAHİP OLMA MALİYETİ (şarj + giderler) ----
  const expReal = ex.reduce((s, e) => s + expB(e), 0);
  const dates = [...all.map(r => r.tarih.slice(0, 10)), ...ex.map(e => e.tarih)].sort();
  const days = dates.length > 1
    ? Math.max(30, (new Date(dates[dates.length - 1]) - new Date(dates[0])) / 864e5) : 365;
  const yearly = ['tax', 'insurance'];          // doğası gereği yıllık kalemler
  const pr = S.cmp.prorate !== false && days < 365 ? days / 365 : 1;
  const expTot = ex.reduce((s, e) =>
    s + expB(e) * (yearly.includes(e.tur) ? pr : 1), 0);
  const tcoEv = net + expTot;
  const iceFix = (S.cmp.icefix || 0) * days / 365;
  const tcoIce = iceTot + iceFix;
  $('c-exptot').textContent = money(expTot);
  $('c-icefixtot').textContent = money(iceFix);
  $('c-tcoev').textContent = money(tcoEv);
  $('c-tco1km-lbl').textContent = t('tco1km', {u: S.unit});
  $('c-tco1km').textContent = money2(tcoEv / distKm * f);
  $('c-tcoice1km-lbl').textContent = t('tco1kmIce', {u: S.unit});
  $('c-tcoice1km').textContent = money2(tcoIce / distKm * f);
  $('c-tcoice').textContent = money(tcoIce);
  const tcoSave = tcoIce - tcoEv;
  $('c-tcosave').textContent = (tcoSave >= 0 ? '+' : '') + money(tcoSave);
  $('c-tcosave').style.color = tcoSave >= 0 ? 'var(--accent-dark)' : 'var(--red)';
  $('c-tcopill').textContent = t('per100', {v: money(tcoSave / distKm * 100 * f), u: S.unit});
  $('c-tco-note').textContent = t('tcoNote', {d: Math.round(days), f: money(iceFix)}) +
    (pr < 1 ? ' ' + t('prorateNote', {p: Math.round(pr * 100), r: money(expReal)}) : '');

  // ---- Yakıt dışı gider kıyaslaması (EV vs Yakıtlı) ----
  // Yakıtlı aracın yıllık sabit gideri girilmemişse (opsiyonel alan) kıyas anlamsız olur — gizle.
  if (!S.cmp.icefix) { $('c-nf-wrap').style.display = 'none'; return; }
  $('c-nf-wrap').style.display = '';
  const kwhSum = all.reduce((s, r) => s + (r.kwh || 0), 0);
  const nfEvPerKm = expTot / distKm;
  const nfIcePerKm = iceFix / distKm;
  $('c-nf-ev-km').textContent = money2(nfEvPerKm * f);
  $('c-nf-ice-km').textContent = money2(nfIcePerKm * f);
  $('c-nf-ev-100').textContent = money2(nfEvPerKm * 100 * f);
  $('c-nf-ice-100').textContent = money2(nfIcePerKm * 100 * f);
  const nfEvYear = expTot / days * 365;
  const nfIceYear = S.cmp.icefix || 0;
  $('c-nf-ev-yr').textContent = money(nfEvYear);
  $('c-nf-ice-yr').textContent = money(nfIceYear);
  $('c-nf-kwh').textContent = kwhSum ? money2(expTot / kwhSum) + '/kWh' : '—';
  const nfDiff = nfIceYear - nfEvYear;
  $('c-nf-diff').textContent = (nfDiff >= 0 ? '+' : '') + money(nfDiff);
  $('c-nf-diff').style.color = nfDiff >= 0 ? 'var(--accent-dark)' : 'var(--red)';
  $('c-nf-diff-pill').textContent = t('per100', {v: money((nfIcePerKm - nfEvPerKm) * 100 * f), u: S.unit});
  $('c-nf-bar-ev-lbl').textContent = money(nfEvYear);
  $('c-nf-bar-ice-lbl').textContent = money(nfIceYear);
  const nfMax = Math.max(1, nfEvYear, nfIceYear);
  $('c-nf-bar-ev').style.width = Math.round(nfEvYear / nfMax * 100) + '%';
  $('c-nf-bar-ice').style.width = Math.round(nfIceYear / nfMax * 100) + '%';
}

// ---------- basit SVG çizgi grafik ----------
function drawLineChart(id, labels, series) {
  const W = 340, H = 170, padL = 8, padR = 8, padT = 12, padB = 22;
  const n = labels.length;
  const svg = $(id);
  if (n < 2) { svg.innerHTML = ''; return; }
  const maxV = Math.max(1, ...series.flatMap(s => s.pts));
  const x = i => padL + i * (W - padL - padR) / (n - 1);
  const y = v => padT + (1 - v / maxV) * (H - padT - padB);
  // yatay kılavuz çizgileri
  const gCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  let out = [0.25, 0.5, 0.75, 1].map(f =>
    `<line x1="${padL}" y1="${y(maxV * f)}" x2="${W - padR}" y2="${y(maxV * f)}"
      stroke="${gCol}" stroke-width="1"/>`).join('');
  series.forEach(s => {
    const d = s.pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    // dolgu (yalnızca ilk seri — EV)
    out += `<path d="${d}" pathLength="1" fill="none" stroke="${s.color}" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"/>`;
    out += s.pts.map((v, i) =>
      `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="${s.color}"/>`).join('');
  });
  // etiketler (en fazla 6 tanesini göster)
  const step = Math.ceil(n / 6);
  out += labels.map((l, i) => i % step ? '' :
    `<text x="${x(i).toFixed(1)}" y="${H - 6}" font-size="9" fill="#8B918C"
      text-anchor="middle" font-family="inherit">${l}</text>`).join('');
  svg.innerHTML = out;
}
