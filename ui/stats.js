/* ============================================================
   WattTrack — stats
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- İstatistik ---- */
// WT-104: ölçü -> açıklama anahtarı. Anahtarlar DÜZ YAZI duruyor; sözlük
// bütünlüğü sınaması kodu metin olarak tarıyor, 'metricNote_' + degisken
// yazılsaydı hem "eksik anahtar" hem "ölü anahtar" diye iki kez yanılırdı.
const METRIC_NOTE = {
  spend: 'metricNote_spend', kwh: 'metricNote_kwh', dist: 'metricNote_dist'
};
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
  //
  // WT-104: kova artık tek sayı değil, dört ölçüyü birden taşıyan bir demet.
  // `ckwh`/`ckm` tüketime UYGUN kayıtların toplamı — tuketimOrt()'un elediği
  // kayıtlar (atlanan, mesafesiz) buraya girmiyor; yoksa oran bozulurdu.
  const T_ = memo('statsSums:' + S.dashVeh + ':' + S.currency, () => {
    const g = {gun: {}, ay: {}, yil: {}};
    const kova = o => (o.tutar = o.tutar || 0, o.kwh = o.kwh || 0, o.km = o.km || 0,
      o.ckwh = o.ckwh || 0, o.ckm = o.ckm || 0, o);
    all.forEach(r => {
      const v = amtB(r);
      const d = r.tarih.slice(0, 10), a = r.tarih.slice(0, 7), y = r.tarih.slice(0, 4);
      const uygun = !r.atlanan && r.mesafeKm > 0 && r.kwh > 0;
      [g.gun[d] = kova(g.gun[d] || {}), g.ay[a] = kova(g.ay[a] || {}),
       g.yil[y] = kova(g.yil[y] || {})].forEach(o => {
        o.tutar += v;
        o.kwh += r.kwh || 0;
        // Mesafede de atlanan kayıt sayılmıyor: o mesafe bir sonraki kayda ait.
        if (!r.atlanan) o.km += r.mesafeKm || 0;
        if (uygun) { o.ckwh += r.kwh; o.ckm += r.mesafeKm; }
      });
    });
    return g;
  });

  // Seçili ölçünün bir kovadan çıkardığı sayı. Tüketim ORAN olduğu için
  // toplanamaz — kovanın kendi kWh/km toplamından yeniden hesaplanıyor.
  // 20 km altında oran anlamsız (tuketimOrt ile aynı eşik) → null, yani
  // "veri yok"; sıfır çubuk çizip yanıltmıyor.
  const olcuDeger = o => {
    if (!o) return S.sMetric === 'cons' ? null : 0;
    if (S.sMetric === 'kwh') return o.kwh;
    if (S.sMetric === 'dist') return distDisp(o.km);
    if (S.sMetric === 'cons') return o.ckm >= 20 ? cons100(o.ckwh, o.ckm) : null;
    return o.tutar;
  };
  const olcuMetin = v => {
    if (v == null) return '';
    if (S.sMetric === 'kwh') return v > 0 ? fmtNum(v, 0) : '';
    if (S.sMetric === 'dist') return v > 0 ? fmtNum(Math.round(v), 0) : '';
    if (S.sMetric === 'cons') return fmtNum(v, 1);
    return v ? money(v) : '';
  };

  // Tek grafik: kasıtlı olarak birden çok dönemi yan yana gösterir (seyir)
  const now = new Date();
  const bars = [];
  if (S.gran === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = localISO(d);
      bars.push({
        label: DAYS[S.lang][(d.getDay() + 6) % 7],
        year: String(d.getFullYear()),
        sum: olcuDeger(T_.gun[key])
      });
    }
  } else if (S.gran === 'year') {
    for (const y of sonYillar(5))
      bars.push({label: y.label, year: y.year, sum: olcuDeger(T_.yil[y.key])});
  } else if (S.gran === 'all') {
    // WT-56: son 5 takvim yılı DEĞİL, verinin kendi yılları — eski bir yedeği
    // geri yükleyen kullanıcının çubukları boş çıkmasın.
    const yls = Object.keys(T_.yil).sort().slice(-6);
    (yls.length ? yls : [String(now.getFullYear())]).forEach(y =>
      bars.push({label: y, year: y, sum: olcuDeger(T_.yil[y])}));
  } else {
    for (const m of sonAylar(6))
      bars.push({label: m.label, year: m.year, sum: olcuDeger(T_.ay[m.key])});
  }
  // Ölçü anahtarı: seçili düğme, başlık ve mesafe düğmesinin birimi.
  $('s-metric-dist').textContent = S.unit;
  $('s-metric').querySelectorAll('button').forEach(b => {
    const sec = b.dataset.m === S.sMetric;
    b.classList.toggle('sel', sec);
    b.setAttribute('aria-checked', sec ? 'true' : 'false');
  });
  const baslik = {
    kwh: 'kWh', dist: S.unit,
    cons: t('mCons') + ' (' + consUnit() + ')'
  }[S.sMetric] || t('mSpend');
  $('s-chart-lbl').textContent = baslik;

  // WT-81: çizim barChartHTML()'e taşındı (oran bozulması düzeltmesi)
  // WT-104: tüketimde tabanı sıfırdan başlatmak grafiği DÜZ gösteriyor —
  // 17 ile 19 arasındaki fark sıfırdan ölçülünce göze çarpmıyor. Oranlı
  // ölçüde taban en düşük değerin altı; altındaki not tabanı yazıyor ki
  // çubuk boyu "yarısı kadar" diye okunmasın.
  $('d-months').innerHTML = barChartHTML(bars.map(b => ({
    label: b.label, year: b.year, value: b.sum, text: olcuMetin(b.sum)
  })), {yearAttr: true, tabanli: S.sMetric === 'cons'});
  $('d-months').querySelectorAll('.mb').forEach(el =>
    el.addEventListener('click', () => { histYear = el.dataset.y; showScreen('history'); }));
  labelBarChart('d-months', baslik, bars.map(b => ({
    label: b.label, text: b.sum == null ? t('noData') : (olcuMetin(b.sum) || '0')
  })));
  makeBarsFocusable('d-months', el => el.dataset.y + ' — ' + t('viewAll'));

  // Grafiğin altındaki tek cümle: ne okunduğunu ve ölçeğin nereden
  // başladığını söylüyor.
  const dolu = bars.filter(b => b.sum != null && b.sum > 0);
  $('s-chart-note').textContent = S.sMetric === 'cons'
    ? (dolu.length >= 2
        ? t('consTrendNote', {
            u: S.unit,
            min: fmtNum(Math.min(...dolu.map(b => b.sum)), 1),
            max: fmtNum(Math.max(...dolu.map(b => b.sum)), 1)})
        : t('consTrendNeed'))
    : t(METRIC_NOTE[S.sMetric] || METRIC_NOTE.spend, {u: S.unit});

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
    {name: 'DC', kwh: sumKwh(cur.filter(r => tipOf(r) === 'DC')), col: '#16A34A'},
    {name: 'AC', kwh: sumKwh(cur.filter(r => tipOf(r) === 'AC')), col: '#1B5FAA'}
  ].filter(x => x.kwh > 0));
  // WT-102: bu donut "Ev-İş / Şarj firması" ikiliğini gösteriyordu. Hiç ev
  // şarjı yapmayan kullanıcıda — ki azınlık değiller — HER ZAMAN tek dilim
  // çiziyor ve hiçbir şey anlatmıyordu.
  //
  // Artık `firma` alanına göre kırılıyor. Ev/iş kayıtlarının firma alanı
  // zaten "Ev"/"İş" etiketini taşıdığı için o kullanıcılar dilimlerini
  // KAYBETMİYOR; firmada şarj edenler ise ZES/Trugo gibi gerçek bir dağılım
  // görüyor. Ölçüt kWh — komşu DC/AC donutuyla aynı; sayfanın sonundaki
  // firma listesi PARA gösteriyor, yani ikisi farklı soruya cevap veriyor.
  const kwhByFirma = {};
  cur.forEach(r => { kwhByFirma[r.firma] = (kwhByFirma[r.firma] || 0) + (r.kwh || 0); });
  const firmaSirali = Object.entries(kwhByFirma)
    .filter(([, k]) => k > 0).sort((a, b) => b[1] - a[1]);
  // Çok firmada donut okunmaz hale gelir: ilk beş ayrı dilim, kalanı "Diğer".
  const ILK = 5;
  const dilimler = firmaSirali.slice(0, ILK)
    .map(([ad, k]) => ({name: ad, kwh: k, col: colorFor(ad)}));
  const kalan = firmaSirali.slice(ILK).reduce((s, [, k]) => s + k, 0);
  if (kalan > 0) dilimler.push({name: t('otherFirms'), kwh: kalan, col: '#94A3B8'});
  drawDonut('d-donut2', 'd-donut2-legend', t('firmSplit'), dilimler);

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
      <div class="sub">${shortDate(r.tarih)} · ${r.kwh} kWh · ${tipOf(r)}${r.mesafeKm ? ' · ' + Math.round(distDisp(r.mesafeKm)) + ' ' + S.unit : ''}${rowCons(r)}${r.atlanan ? ` · <span title="${esc(t('missedTag'))}" aria-label="${esc(t('missedTag'))}">⚠︎</span>` : ''}${r.kayipPct != null && Math.abs(r.kayipPct) > KAYIP_UYARI ? ` · <span title="${esc(t('lossWarn', {p: fmtNum(Math.abs(r.kayipPct), 1)}))}" aria-label="${esc(t('lossWarn', {p: fmtNum(Math.abs(r.kayipPct), 1)}))}">⚡</span>` : ''}</div>
    </div>
    <div class="right">
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : fm(cs, fmtNum(r.odenen, 0))}</div>
      <div class="sav">${s > 0 ? '−' + fm(cs, fmtNum(s, 0)) : ''}</div>
    </div>
    ${withDelete ? `<button class="del" data-del="${r.id}">×</button>` : ''}
    <!-- WT-46/5: satıra dokununca düzenleme açıldığını göster -->
    <span class="crow-chev" aria-hidden="true">›</span>
  </div>`;
}
