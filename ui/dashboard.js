/* ============================================================
   WattTrack — dashboard
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Ana sayfa ---- */
// ============================================================
// ANA SAYFA
// ============================================================
$('d-period').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.period = b.dataset.v;
  $('d-period').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderDashboard();
});
$('d-vehsel').addEventListener('change', () => { S.dashVeh = $('d-vehsel').value; renderDashboard(); });
$('d-dstat-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.dstatType = b.dataset.v;
  $('d-dstat-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderDashboard();
});
$('d-gran').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.gran = b.dataset.v;
  $('d-gran').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderStats();
});
$('s-vehsel').addEventListener('change', () => { S.dashVeh = $('s-vehsel').value; renderStats(); });

function periodFilter(all) { return inPeriod(all, S.period); }
function prevPeriodFilter(all) {
  const now = new Date();
  if (S.period === 'week') {
    const to = new Date(now); to.setDate(now.getDate() - 7);
    const from = new Date(now); from.setDate(now.getDate() - 13);
    const a = localISO(from), b = localISO(to);
    return all.filter(r => { const d = r.tarih.slice(0, 10); return d >= a && d <= b; });
  }
  if (S.period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear() - 1));
  const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const key = p.getFullYear() + '-' + String(p.getMonth() + 1).padStart(2, '0');
  return all.filter(r => monthKey(r.tarih) === key);
}
// WT-15: periodFilter S.period'a bağlı (ana sayfa). İstatistik sayfası kendi
// seçicisini (S.gran) kullanıyor; aynı anlamları paylaşsınlar diye tek gövde.
function inPeriod(all, period) {
  const now = new Date();
  if (period === 'week') {
    const from = new Date(now); from.setDate(now.getDate() - 6);
    const key = localISO(from);
    return all.filter(r => r.tarih.slice(0, 10) >= key);
  }
  if (period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear()));
  return all.filter(r => monthKey(r.tarih) === localMonth(now));
}
const granFilter = all => inPeriod(all, S.gran);
// Kısa ad (rozet/etiket için: "Hafta"/"Ay"/"Yıl") ve uzun ad ("Bu hafta toplam")
const periodShort = p => t(p === 'week' ? 'week' : p === 'year' ? 'year' : 'month');
const periodName = p => t(p === 'week' ? 'periodWeek' : p === 'year' ? 'periodYear' : 'periodMonth');
const vehFilter = (list, vid) => vid ? list.filter(r => String(r.aracId) === vid) : list;
// odometre için araç: seçili > tek araç > varsayılan araç
function pickOdoVeh(vehicles, sel) {
  if (sel) return vehicles.find(v => String(v.id) === sel) || null;
  if (vehicles.length === 1) return vehicles[0];
  return vehicles.find(v => v.id === S.defaultVehicleId) || null;
}
const odoDistOf = v => (v && v.kmStart != null && v.kmNow > v.kmStart) ? v.kmNow - v.kmStart : 0;
const vehName = v => v ? (v.brand ? v.brand + ' ' + v.model : v.ad) : '';

async function renderDashboard() {
  const vehicles = (await allVehicles()).filter(v => !v.archived);
  // araç filtresi seçeneği (2+ araçta görünür, tek araçta adını gösterir)
  const dsel = $('d-vehsel');
  if (vehicles.length > 1) {
    const cur = S.dashVeh;
    dsel.style.display = '';
    dsel.innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    dsel.value = cur;
  } else {
    dsel.style.display = vehicles.length ? '' : 'none';
    dsel.innerHTML = vehicles.length ? `<option value="">${esc(vehName(vehicles[0]))}</option>` : '';
    S.dashVeh = '';
  }

  const allRaw = await allSessions();
  const all = vehFilter(allRaw, S.dashVeh);
  const cur = periodFilter(all);
  reportFxGaps(cur);   // WT-10

  $('d-period-lbl').textContent =
    t(S.period === 'week' ? 'periodWeek' : S.period === 'year' ? 'periodYear' : 'periodMonth');

  // WT-13: `net` kur çevrilemeyen kayıtları dışlıyordu (amtB → 0) ama `kwh`
  // BÜTÜN kayıtları topluyordu; yurt dışı kaydı olan kullanıcıda birim fiyat
  // olduğundan düşük çıkıyordu. Tüm oran metriklerinde pay ve payda AYNI
  // kümeden gelir.
  const conv = cur.filter(isConv);
  const net = conv.reduce((s, r) => s + amtB(r), 0);
  const sav = conv.reduce((s, r) => s + savB(r), 0);
  const gross = net + sav;
  const kwhConv = conv.reduce((s, r) => s + r.kwh, 0);   // oran metriklerinin paydası
  const kwh = cur.reduce((s, r) => s + r.kwh, 0);        // ham toplam: tüm kayıtlar
  // WT-20: atlanan işaretli kayıt km maliyeti ORTALAMALARINA girmez ama
  // harcama (net) ve enerji (kwh) toplamlarına girmeye DEVAM eder
  const wd = conv.filter(r => r.mesafeKm > 0 && !r.atlanan);
  const distKm = wd.reduce((s, r) => s + r.mesafeKm, 0);
  const netD = wd.reduce((s, r) => s + amtB(r), 0);
  const grossD = netD + wd.reduce((s, r) => s + savB(r), 0);
  const f = distFactor();

  $('d-total').textContent = money(net);
  $('d-gross').textContent = money(gross);
  $('d-savings').textContent = '−' + money(sav) + ' ' + t('savings');
  // önceki döneme göre değişim
  const prev = prevPeriodFilter(all).reduce((s, r) => s + amtB(r), 0);
  const dEl = $('d-delta');
  if (prev > 0) {
    const pct = Math.round((net - prev) / prev * 100);
    dEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct + '% ' + t('prevPeriod');
    dEl.className = 'delta ' + (pct >= 0 ? 'up' : 'down');
  } else { dEl.textContent = ''; dEl.className = 'delta'; }
  $('d-avg').textContent = kwhConv ? fm(sym(), fmtNum(net / kwhConv, 2)) : '—';
  $('d-avg-g').textContent = kwhConv ? fm(sym(), fmtNum(gross / kwhConv, 2)) : '—';
  // WT-32: 100 km kutuları kaldırıldı, yalnız 1 km kutuları dolduruluyor
  const fillPerKm = (npk, gpk) => {   // npk/gpk: birim başına (km) net/brüt
    $('d-1km').textContent = money2(npk * f);
    $('d-1km-g').textContent = money2(gpk * f);
  };
  // WT-14/B: dönemde <20 km varsa kutular SESSİZCE tüm-zamanlar sayaç moduna
  // düşüyordu. Mod artık kutuların altında yazılı.
  const scopeEl = $('d-dist-scope');
  if (distKm >= 20) {
    fillPerKm(netD / distKm, grossD / distKm);
    scopeEl.textContent = t('distFromRecords');
  } else {
    const oV = pickOdoVeh(vehicles, S.dashVeh);
    const oDist = odoDistOf(oV);
    if (oDist >= 20) {
      const allConv = all.filter(isConv);
      const aNet = allConv.reduce((s, r) => s + amtB(r), 0);
      const aGross = aNet + allConv.reduce((s, r) => s + savB(r), 0);
      fillPerKm(aNet / oDist, aGross / oDist);
      scopeEl.textContent = t('distFromOdoAll');
    } else {
      ['d-1km','d-1km-g'].forEach(id => $(id).textContent = '—');
      scopeEl.textContent = '';
    }
  }
  $('d-kwh').textContent = fmtNum(kwh, 0);
  // Ham kWh tüm kayıtları sayar; oran metrikleri saymaz — fark varsa söyle
  $('d-kwh-note').textContent = conv.length !== cur.length ? ' · ' + t('allRecordsNote') : '';
  $('d-sess').textContent = cur.length + ' / ' + new Set(cur.map(r => r.firma)).size;
  $('d-disc').textContent = money(sav);
  $('d-free').textContent = cur.filter(r => r.free).length;

  // odometre kutuları (tek araç ya da seçili araç)
  const odoV = pickOdoVeh(vehicles, S.dashVeh);
  const odoNow = await odoNowOf(odoV);   // WT-19/5
  const odoWrap = $('d-odo-wrap');
  if (odoV && odoNow.km != null) {
    odoWrap.style.display = '';
    $('d-odo').textContent = fmtNum(distDisp(odoNow.km), 0) + ' ' + S.unit;
    $('d-odo-total').textContent = odoV.kmStart != null
      ? fmtNum(distDisp(odoNow.km - odoV.kmStart), 0) + ' ' + S.unit : '—';
  } else odoWrap.style.display = 'none';

  // WT-14/A: detay istatistikler `all` (tüm zamanlar) üzerinden hesaplanıyordu
  // ama dönem seçicisinin ALTINDA duruyordu — kullanıcı bunu anlayamıyordu.
  const dsAll = S.dstatType ? cur.filter(r => r.tip === S.dstatType) : cur;
  const durs = dsAll.filter(r => r.dur > 0);
  $('d-dur').textContent = durs.length
    ? (() => { const m = Math.round(durs.reduce((s, r) => s + r.dur, 0) / durs.length);
        return (m >= 60 ? Math.floor(m / 60) + ' ' + t('hours') + ' ' : '') + (m % 60) + ' ' + t('minutes'); })()
    : '—';
  // WT-32/4: socB === socA olan kayıtlar (şarj yokmuş gibi) ortalamayı
  // anlamsızlaştırıyordu — dışarıda bırak. socA < socB olan bozuk kayıtlar da
  // öyle; WT-04 bunları yeni girişte engelliyor, eski veride hâlâ olabilir.
  const socs = dsAll.filter(r => r.socB != null && r.socA != null && r.socA > r.socB);
  $('d-soc').textContent = socs.length
    ? '%' + Math.round(socs.reduce((s, r) => s + r.socB, 0) / socs.length) +
      ' → %' + Math.round(socs.reduce((s, r) => s + r.socA, 0) / socs.length)
    : '—';
  // WT-32/4c: kullanıcının asıl merak ettiği, iki ucun ayrı ortalaması değil
  // şarj başına eklenen ortalama yüzde
  $('d-soc-add').textContent = socs.length
    ? t('avgSocAdded', {n: Math.round(
        socs.reduce((s, r) => s + (r.socA - r.socB), 0) / socs.length)})
    : '';
  // ort. şarj gücü (kWh/saat) — süre girilmiş kayıtlardan
  const powKwh = durs.reduce((s, r) => s + r.kwh, 0);
  const powMin = durs.reduce((s, r) => s + r.dur, 0);
  $('d-power').textContent = powMin > 0 ? fmtNum(powKwh / (powMin / 60), 1) + ' kWh/h' : '—';
  $('d-dstat-scope').textContent = periodShort(S.period);

  // WT-32/2: "Yıllık karşılaştırma" bloğu kaldırıldı — üstteki kutularla
  // mükerrerdi ve dönem seçicisinden bağımsız olması kafa karıştırıyordu.
  // WT-32/3: "Son şarjlar" bloğu kaldırıldı — Geçmiş sekmesi aynı işi yapıyor.
  // rowHTML() Geçmiş'te kullanılmaya devam ediyor, silinmedi.
}
