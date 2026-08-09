/* ============================================================
   WattTrack — stats
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- İstatistik ---- */
// ============================================================
// İSTATİSTİK (ana sayfadan taşınan grafikler + dağılımlar)
// ============================================================
async function renderStats() {
  const vehicles = (await allVehicles()).filter(v => !v.archived);
  const ssel = $('s-vehsel');
  if (vehicles.length > 1) {
    ssel.style.display = '';
    ssel.innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    ssel.value = S.dashVeh;
  } else {
    ssel.style.display = vehicles.length ? '' : 'none';
    ssel.innerHTML = vehicles.length ? `<option value="">${esc(vehName(vehicles[0]))}</option>` : '';
  }

  const all = vehFilter(await allSessions(), S.dashVeh);
  reportFxGaps(all, 's-warnings', 'fxStats');   // WT-10

  // WT-15: d-gran segmenti YALNIZCA harcama grafiğini etkiliyordu; altındaki
  // gün dağılımı, firma dağılımı, donut, bankalar ve lokasyonlar hepsi tüm
  // zamanlardı — ama görsel olarak aynı seçicinin altındaydılar.
  const cur = granFilter(all);
  $('s-gran-lbl').textContent = t('periodLbl', {p: periodShort(S.gran)});
  $('s-chart-scope').textContent = t('chartTrendNote');

  // WT-56: aşağıdaki dağılımların HEPSİ `cur`, yani seçili döneme bağlı
  // (WT-15 bilerek böyle yaptı). Yedeğini geri yükleyen kullanıcının kayıtları
  // bu ay içinde olmadığı için bloklar "Henüz kayıt yok" yazıyordu ve bu
  // VERİ KAYBI gibi okunuyordu. Artık farkı söyleyen bir şerit ve tek
  // dokunuşla "Tümü"ne geçiş var.
  const pEmpty = $('s-period-empty');
  if (!cur.length && all.length) {
    pEmpty.style.display = '';
    pEmpty.innerHTML = `<div class="warn-strip"><span class="msg"></span>
      <button type="button" data-act></button></div>`;
    pEmpty.querySelector('.msg').textContent = t('periodEmpty', {n: all.length});
    const btn = pEmpty.querySelector('[data-act]');
    btn.textContent = t('periodEmptyBtn');
    // Seçicinin kendi düğmesine tıkla: durum, seçili sınıf ve yeniden çizim
    // tek yerde kalsın (ui/dashboard.js'deki d-gran dinleyicisi).
    btn.addEventListener('click', () => $('d-gran').querySelector('[data-v="all"]').click());
  } else pEmpty.style.display = 'none';
  // Blokların boş metni de ayrışsın: "hiç kaydın yok" ile "bu dönemde yok"
  // aynı cümle olmamalı.
  const bosMetin = (!cur.length && all.length) ? 'noDataPeriod' : 'noData';

  // WT-49/4: her çubuk için diziyi baştan taramak (all.filter(...) × 7) yerine
  // gün/ay/yıl toplamları TEK geçişte çıkarılıyor ve önbellek kuşağına bağlı
  // memoize ediliyor. Anahtar araç filtresini ve para birimini içeriyor —
  // amtB() para birimine bağlı, ayarlar tablosu önbelleğe dahil değil.
  const T_ = memo('statsSums:' + S.dashVeh + ':' + S.currency, () => {
    const g = {gun: {}, ay: {}, yil: {}};
    all.forEach(r => {
      const v = amtB(r);
      const d = r.tarih.slice(0, 10), a = r.tarih.slice(0, 7), y = r.tarih.slice(0, 4);
      g.gun[d] = (g.gun[d] || 0) + v;
      g.ay[a] = (g.ay[a] || 0) + v;
      g.yil[y] = (g.yil[y] || 0) + v;
    });
    return g;
  });

  // harcama grafiği: kasıtlı olarak birden çok dönemi yan yana gösterir (seyir)
  const now = new Date();
  const bars = [];
  if (S.gran === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = localISO(d);
      bars.push({
        label: DAYS[S.lang][(d.getDay() + 6) % 7],
        year: String(d.getFullYear()),
        sum: T_.gun[key] || 0
      });
    }
  } else if (S.gran === 'year') {
    for (const y of sonYillar(5))
      bars.push({label: y.label, year: y.year, sum: T_.yil[y.key] || 0});
  } else if (S.gran === 'all') {
    // WT-56: son 5 takvim yılı DEĞİL, verinin kendi yılları — eski bir yedeği
    // geri yükleyen kullanıcının çubukları boş çıkmasın.
    const yls = Object.keys(T_.yil).sort().slice(-6);
    (yls.length ? yls : [String(now.getFullYear())]).forEach(y =>
      bars.push({label: y, year: y, sum: T_.yil[y] || 0}));
  } else {
    for (const m of sonAylar(6))
      bars.push({label: m.label, year: m.year, sum: T_.ay[m.key] || 0});
  }
  // WT-81: çizim barChartHTML()'e taşındı (oran bozulması düzeltmesi)
  $('d-months').innerHTML = barChartHTML(bars.map(b => ({
    label: b.label, year: b.year, value: b.sum, text: b.sum ? money(b.sum) : ''
  })), {yearAttr: true});
  $('d-months').querySelectorAll('.mb').forEach(el =>
    el.addEventListener('click', () => { histYear = el.dataset.y; showScreen('history'); }));
  labelBarChart('d-months', t('spendChart'),
    bars.map(b => ({label: b.label, text: money(b.sum)})));
  makeBarsFocusable('d-months', el => el.dataset.y + ' — ' + t('viewAll'));

  // WT-72: haftanın günlerine göre dağılım grafiği kaldırıldı (kullanıcı isteği)

  // firma dağılımı (dönem filtreli)
  const by = {};
  cur.forEach(r => {
    (by[r.firma] ||= {firma: r.firma, total: 0, kwh: 0, count: 0});
    by[r.firma].total += amtB(r); by[r.firma].kwh += r.kwh; by[r.firma].count++;
  });
  const rows = Object.values(by).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxF = Math.max(1, ...rows.map(r => r.total));
  $('d-firms').innerHTML = rows.length ? rows.map(r =>
    `<div class="cmp">
      <div class="cmp-head">
        <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
        <div class="mid">
          <div class="name">${esc(r.firma)}</div>
          <div class="sub">${r.count} ${t('sessions')} · ${r.kwh ? fmtNum(r.total / r.kwh, 2) : fmtNum(0, 2)} ${esc(sym())}/kWh</div>
        </div>
        <div class="total">${money(r.total)}</div>
      </div>
      <div class="track"><div class="fill" style="width:${Math.round(r.total / maxF * 100)}%"></div></div>
    </div>`).join('') : `<div class="empty">${t(bosMetin)}</div>`;

  // WT-16/5: İKİ AYRI donut. Eskiden tek donutta DC / AC / Ev vardı; DC-AC bir
  // TEKNOLOJİ boyutu, "Ev" bir FİRMA değeriydi — ev şarjı da fiziksel olarak AC
  // olduğu için aynı kayıt ana sayfada "AC", donutta "Ev" sayılıyordu.
  const trackCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  const drawDonut = (svgId, legendId, title, segs) => {
    const tot = segs.reduce((s, x) => s + x.kwh, 0) || 1;
    let off = 25;
    $(svgId).innerHTML =
      `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${trackCol}" stroke-width="5"></circle>` +
      segs.map(x => {
        const p = x.kwh / tot * 100;
        const el = `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${x.col}" stroke-width="5"
          stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${off}" stroke-linecap="butt"></circle>`;
        off -= p;
        return el;
      }).join('');
    $(legendId).innerHTML = segs.map(x =>
      `<div class="li"><span class="dot" style="background:${x.col}"></span>${esc(x.name)}
       <span class="lv">${Math.round(x.kwh)} kWh · %${Math.round(x.kwh / tot * 100)}</span></div>`).join('') ||
      `<div class="li" style="color:var(--faint)">${t(bosMetin)}</div>`;
    // WT-30: donut ekran okuyucuya görünmezdi
    labelBarChart(svgId, title, segs.map(x => ({
      label: x.name,
      text: `${Math.round(x.kwh)} kWh · %${Math.round(x.kwh / tot * 100)}`
    })));
  };
  const sumKwh = list => list.reduce((s, r) => s + r.kwh, 0);
  // Şarj TİPİ: yalnız `tip` alanından — ana sayfadaki DC/AC filtresiyle aynı kaynak
  drawDonut('d-donut', 'd-donut-legend', t('typeSplit'), [
    {name: 'DC', kwh: sumKwh(cur.filter(r => r.tip === 'DC')), col: '#16A34A'},
    {name: 'AC', kwh: sumKwh(cur.filter(r => r.tip !== 'DC')), col: '#1B5FAA'}
  ].filter(x => x.kwh > 0));
  // Şarj YERİ: `mekan` alanından. Eski kayıtlarda mekan yoksa firma adına düş.
  const isHome = r => (r.mekan ? r.mekan === 'evis' : isHomeFirm(r.firma));
  drawDonut('d-donut2', 'd-donut2-legend', t('placeSplit'), [
    {name: t('homeChip'), kwh: sumKwh(cur.filter(isHome)), col: '#7DC855'},
    {name: t('placeFirm'), kwh: sumKwh(cur.filter(r => !isHome(r))), col: '#1B5FAA'}
  ].filter(x => x.kwh > 0));

  // en çok kazandıran bankalar
  const bB = {};
  cur.forEach(r => { if (r.banka) {
    (bB[r.banka] ||= {sav: 0, n: 0});
    bB[r.banka].sav += savB(r); bB[r.banka].n++;
  }});
  const banksTop = Object.entries(bB).sort((a, b) => b[1].sav - a[1].sav).slice(0, 5);
  $('d-banks').innerHTML = banksTop.length ? banksTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${x.n} ${t('sessions')}</div></span>
      <span class="tv" style="color:var(--accent-dark)">−${money(x.sav)}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t(bosMetin)}</div>`;

  // en çok lokasyonlar
  const bL = {};
  cur.forEach(r => { if (r.loc) {
    (bL[r.loc] ||= {n: 0, tl: 0});
    bL[r.loc].n++; bL[r.loc].tl += amtB(r);
  }});
  const locsTop = Object.entries(bL).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  $('d-locs').innerHTML = locsTop.length ? locsTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${money(x.tl)}</div></span>
      <span class="tv">${x.n} ${t('sessions')}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t(bosMetin)}</div>`;

  // WT-42/3: firma bazında ortalama kayıp. Yalnız kayipPct'i hesaplanmış
  // (yani socB+socA+batarya üçü de olan) kayıtlar sayılıyor.
  const kayipG = {};
  all.filter(r => r.kayipPct != null).forEach(r => {
    (kayipG[r.firma] ||= []).push(r.kayipPct);
  });
  const kayipTop = Object.entries(kayipG)
    .map(([ad, xs]) => [ad, xs.reduce((s, x) => s + x, 0) / xs.length, xs.length])
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6);
  $('s-loss').innerHTML = kayipTop.length ? kayipTop.map(([ad, ort, n], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(ad)}<div class="ts">${n} ${t('sessions')}</div></span>
      <span class="tv" style="color:${Math.abs(ort) > KAYIP_UYARI ? 'var(--red)' : 'var(--muted)'}">${ort >= 0 ? '+' : '−'}%${fmtNum(Math.abs(ort), 1)}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t('lossNeed')}</div>`;

  // WT-41/3: aylık tüketim trendi. Son 6 ay; atlanan kayıtlar hariç.
  // Kışın artışı görmek EV sahipleri için en değerli sinyallerden biri.
  const consAy = sonAylar(6).map(m => ({
    label: m.label,
    v: tuketimOrt(all.filter(r => monthKey(r.tarih) === m.key))
  }));
  // WT-81/6: başlık birimi taşıyor, o yüzden data-i18n ile DEĞİL burada
  // yazılıyor (para/birim içeren etiketlerin yerleşik kalıbı — applyI18n
  // yalnız statik metni çevirir).
  $('s-cons-lbl').textContent = t('consTrend', {u: S.unit});
  $('s-cons').innerHTML = barChartHTML(consAy.map(x => ({
    label: x.label, value: x.v, text: x.v != null ? fmtNum(x.v, 1) : ''
  })));
  // WT-81/hata avı: bu grafiğin metin alternatifi HİÇ YOKTU. WT-30 üç
  // grafiği kapsamıştı, tüketim trendi ondan sonra (WT-41/3) eklendi ve
  // ekran okuyucuya görünmez kaldı.
  labelBarChart('s-cons', t('consTrend', {u: S.unit}), consAy.map(x => ({
    label: x.label,
    text: x.v != null ? fmtNum(x.v, 1) + ' ' + consUnit() : t('noData')
  })));
  // WLTP ile karşılaştırma KASITLI olarak yok (WT-41/2): araçlar o değere
  // ulaşmıyor, yanıltıcı olurdu. Ölçek kullanıcının kendi geçmişi.
  const dolu = consAy.filter(x => x.v != null);
  $('s-cons-note').textContent = dolu.length >= 2
    ? t('consTrendNote', {
        u: S.unit,
        min: fmtNum(Math.min(...dolu.map(x => x.v)), 1),
        max: fmtNum(Math.max(...dolu.map(x => x.v)), 1)})
    : t('consTrendNeed');
}

// WT-41/4: kaydın kendi tüketimi. Atlanan kayıtta gösterilmez — o kaydın
// mesafesi kendisine ait değil. WT-81/6: değer artık kullanıcının birimine
// çevriliyor (cons100), etiketle uyumsuzluğu buydu.
function rowCons(r) {
  if (r.atlanan || !(r.mesafeKm > 0) || !(r.kwh > 0)) return '';
  return ' · ' + fmtNum(cons100(r.kwh, r.mesafeKm), 1) + ' ' + consUnit();
}
// WT-46/3: çok araçlı kullanıcıda satır hangi araca ait olduğunu söylemeli.
// VEH_ADI'yi ui/history.js dolduruyor; tek araçlı kullanıcıda null kalır ve
// rozet hiç çizilmez (tek araçta zaten bilgi taşımıyor, yer kaplıyor).
function vehChip(r) {
  const ad = VEH_ADI && r.aracId != null ? VEH_ADI[r.aracId] : null;
  return ad ? ` <span class="chip veh-chip">${esc(ad)}</span>` : '';
}
function rowHTML(r, withDelete) {
  const s = savingsOf(r);
  const cs = symOf(r.cur || S.currency);
  return `<div class="crow" data-id="${r.id}">
    <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
    <div class="mid">
      <div class="name">${esc(r.firma)}${vehChip(r)}</div>
      <div class="sub">${shortDate(r.tarih)} · ${r.kwh} kWh · ${r.tip || 'DC'}${r.mesafeKm ? ' · ' + Math.round(distDisp(r.mesafeKm)) + ' ' + S.unit : ''}${rowCons(r)}${r.atlanan ? ` · <span title="${esc(t('missedTag'))}" aria-label="${esc(t('missedTag'))}">⚠︎</span>` : ''}${r.kayipPct != null && Math.abs(r.kayipPct) > KAYIP_UYARI ? ` · <span title="${esc(t('lossWarn', {p: fmtNum(Math.abs(r.kayipPct), 1)}))}" aria-label="${esc(t('lossWarn', {p: fmtNum(Math.abs(r.kayipPct), 1)}))}">⚡</span>` : ''}</div>
    </div>
    <div class="right">
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : fm(cs, fmtNum(r.odenen, 0))}</div>
      <div class="sav">${s > 0 ? '−' + fm(cs, fmtNum(s, 0)) : ''}</div>
    </div>
    ${r.ekranGorVar || r.ekranGor instanceof Blob ? `<button class="del" data-shot="${r.id}" title="${esc(t('ocrAttach'))}"
      aria-label="${esc(t('ocrAttach'))}">📎</button>` : ''}
    ${withDelete ? `<button class="del" data-del="${r.id}">×</button>` : ''}
    <!-- WT-46/5: satıra dokununca düzenleme açıldığını göster -->
    <span class="crow-chev" aria-hidden="true">›</span>
  </div>`;
}
