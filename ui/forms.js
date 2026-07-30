/* ============================================================
   WattTrack — forms
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Kayıt formu ---- */
// ============================================================
// KAYIT FORMU
// ============================================================
let editingId = null;
$('nav-plus').addEventListener('click', () => openAdd());
$('btn-close-add').addEventListener('click', () => overlayClose('page-add'));
// WT-35: yakıt dışı gider detayları varsayılan olarak kapalı
$('c-nf-more').addEventListener('click', () => {
  const d = $('c-nf-details'), acik = d.style.display === 'none';
  d.style.display = acik ? '' : 'none';
  $('c-nf-more').setAttribute('aria-expanded', String(acik));
  $('c-nf-more').textContent = acik ? t('hideDetails') : t('showDetails');
});
$('btn-adv').addEventListener('click', () => {
  $('adv-fields').classList.toggle('open');
  $('btn-adv').textContent =
    $('adv-fields').classList.contains('open') ? t('advancedHide') : t('advanced');
});
$('in-free').addEventListener('change', () => {
  const free = $('in-free').checked;
  $('wrap-paid').style.display = free ? 'none' : '';
  $('wrap-disc').style.display = free ? 'none' : '';
  syncHomePricing();
});
$('in-tip').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-tip').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  // WT-16/B: AC seçilirse firma otomatik "Ev-İş" gelsin (kullanıcı değiştirebilir).
  // DC seçilirse liste mevcut davranışına döner (en çok kullanılan firma).
  if (b.dataset.v === 'AC' && !homeSelected()) selectHomeFirm(true);
  else if (b.dataset.v === 'DC' && homeSelected()) selectHomeFirm(false);
  syncHomePricing();
});

// ---------- WT-16/C: Ev-İş şarjında tutarı kWh fiyatından hesapla ----------
const homeSelected = () => isHomeFirm($('in-firm').value);
function selectHomeFirm(on) {
  const sel = $('in-firm');
  if (on) {
    const opt = [...sel.options].find(o => isHomeFirm(o.value));
    if (opt) sel.value = opt.value;
  } else {
    const first = [...sel.options].find(o => !isHomeFirm(o.value) && o.value !== '__other');
    if (first) sel.value = first.value;
  }
  $('in-firm-other').style.display = sel.value === '__other' ? '' : 'none';
}
// Tutar birim fiyattan mı geldi, kullanıcı elle mi yazdı?
let amountSrc = 'manuel';
function syncHomePricing() {
  const home = homeSelected() && !$('in-free').checked;
  $('wrap-unitprice').style.display = home ? '' : 'none';
  // Ev-İş kaydında indirim anlamsız (WT-16/C5)
  if (!$('in-free').checked) $('wrap-disc').style.display = home ? 'none' : '';
  $('in-unitprice-lbl').textContent = t('fldUnitPrice') + ' — ' + symOf(curOfForm());
  if (!home) { $('amount-src-note').textContent = ''; return; }
  // Hesaplanan tutar salt-okunur DEĞİL: kullanıcı üzerine yazabilir; yazarsa
  // birim fiyat alanı gri gösterilir ve tutar bir daha ezilmez.
  if (amountSrc === 'birimFiyat') recalcFromUnitPrice();
  $('in-unitprice').style.opacity = amountSrc === 'manuel' ? '.5' : '1';
  $('amount-src-note').textContent =
    t(amountSrc === 'birimFiyat' ? 'amountFromPrice' : 'amountManual');
}
const curOfForm = () => {
  const c = COUNTRIES.find(x => x[0] === $('in-country').value);
  return c ? c[3] : S.currency;
};
function recalcFromUnitPrice() {
  const kwh = pf($('in-kwh').value);
  const up = pf($('in-unitprice').value);
  if (isNaN(kwh) || isNaN(up)) return;
  $('in-amount').value = fmtInput(Math.round(kwh * up * 100) / 100, 2);
  updateNetLine();
}
$('in-firm').addEventListener('change', () => syncHomePricing());
$('in-unitprice').addEventListener('input', () => {
  amountSrc = 'birimFiyat';        // birim fiyata dokunmak hesabı yeniden açar
  recalcFromUnitPrice();
  syncHomePricing();
});
$('in-kwh').addEventListener('input', () => {
  if (amountSrc === 'birimFiyat' && homeSelected()) recalcFromUnitPrice();
});
// Tutara ELLE dokunmak birim fiyat hesabını devre dışı bırakır
$('in-amount').addEventListener('input', () => {
  if (homeSelected() && amountSrc === 'birimFiyat') { amountSrc = 'manuel'; syncHomePricing(); }
});
$('in-disc-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-disc-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  updateNetLine();
});
function updateNetLine() {
  const g = pf($('in-amount').value);
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  if (isNaN(g) || g < 0) { $('calc-net').textContent = '—'; return; }
  const type = $('in-disc-type').querySelector('.sel').dataset.v;
  const net = netFromGross(g, type, pf($('in-disc-val').value) || 0);
  $('calc-net').textContent = fm(symOf(c ? c[3] : S.currency),
    fmtNum(net, 2));
}
['in-amount', 'in-disc-val'].forEach(id => $(id).addEventListener('input', updateNetLine));
// WT-02/C: ondalıklı alanlarda blur'da virgüllü geri yazma
[['in-amount', 2], ['in-disc-val', 2], ['in-rate', 6], ['in-exp-amount', 2],
 ['c-price', 2], ['c-cons', 2], ['c-icefix', 2]].forEach(([id, d]) => bindDecimalInput(id, d));
// WT-03: kWh tek alan — çift kutu %1'lik sessiz hata üretiyordu (45,5 -> 45,05)
bindDecimalInput('in-kwh', 2);
$('in-firm').addEventListener('change', () => {
  $('in-firm-other').style.display = $('in-firm').value === '__other' ? '' : 'none';
});
$('in-country').addEventListener('change', () => formCountryChanged());
$('in-bank').addEventListener('change', async () => {
  if ($('in-bank').value !== '__newbank') return;
  const name = (prompt(t('newBankPrompt')) || '').trim();
  if (name) {
    S.customBanks = [...new Set([name, ...(S.customBanks || [])])].slice(0, 20);
    await saveSetting('customBanks', S.customBanks);
    $('in-bank').innerHTML = bankOptions();
    $('in-bank').value = name;
  } else {
    $('in-bank').value = '';
  }
});
$('btn-gps').addEventListener('click', () => {
  if (!navigator.geolocation) return toast(t('gpsFail'));
  $('btn-gps').textContent = '…';
  navigator.geolocation.getCurrentPosition(async p => {
    const {latitude: lat, longitude: lon} = p.coords;
    // 1) semt/mahalle adı (OpenStreetMap Nominatim)
    const place = await reverseGeo(lat, lon);
    $('in-loc').value = place || (lat.toFixed(5) + ', ' + lon.toFixed(5));
    // 2) yakındaki şarj istasyonları (Open Charge Map) — çip olarak öner
    const st = await nearbyStations(lat, lon);
    $('loc-chips').innerHTML = st.map(s =>
      `<button type="button" class="chip" data-n="${esc(s)}">${esc(s)}</button>`).join('');
    $('loc-chips').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => { $('in-loc').value = b.dataset.n; }));
    $('btn-gps').textContent = '📍';
  }, () => { toast(t('gpsFail')); $('btn-gps').textContent = '📍'; },
  {timeout: 8000, maximumAge: 60000});
});
async function reverseGeo(lat, lon) {
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&accept-language=${S.lang}`,
      {signal: ctrl.signal, headers: {'Accept': 'application/json'}});
    clearTimeout(tm);
    if (!res.ok) return null;
    const a = (await res.json()).address || {};
    const narrow = a.neighbourhood || a.suburb || a.quarter || a.village || a.hamlet;
    const town = a.town || a.city || a.county || '';
    return narrow ? (narrow + (town ? ', ' + town : '')) : (town || null);
  } catch { return null; }
}
async function nearbyStations(lat, lon) {
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=1&distanceunit=km&maxresults=4&compact=true&verbose=false`,
      {signal: ctrl.signal});
    clearTimeout(tm);
    if (!res.ok) return [];
    const j = await res.json();
    return (j || []).map(p => {
      const op = p.OperatorInfo && p.OperatorInfo.Title ? p.OperatorInfo.Title + ' — ' : '';
      return (op + (p.AddressInfo?.Title || '')).slice(0, 60);
    }).filter(Boolean);
  } catch { return []; }
}

function fillFirmSelect(code, current, usedCounts) {
  const used = Object.entries(usedCounts)
    .sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const home = t('homeChip');
  // Başka bir dilde kaydedilmiş ev etiketleri mevcut dile indirgenir; aksi
  // halde listede iki ayrı "ev" satırı görünürdü.
  const norm = f => isHomeFirm(f) ? home : f;
  const list = [...new Set([home, ...used.map(norm), ...chargersFor(code).map(norm)])];
  const opts = list.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('') +
    `<option value="__other">${t('other')}</option>`;
  $('in-firm').innerHTML = opts;
  const cur2 = current ? norm(current) : current;
  if (cur2 && list.includes(cur2)) {
    $('in-firm').value = cur2;
    $('in-firm-other').style.display = 'none';
  } else if (current) {
    $('in-firm').value = '__other';
    $('in-firm-other').value = current;
    $('in-firm-other').style.display = '';
  } else {
    $('in-firm').value = used[0] || list[1] || home;
    $('in-firm-other').style.display = 'none';
  }
}

// WT-49/3: openAdd() aynı açılışta sessions'ı ÜÇ KEZ okuyordu. Liste artık
// bir kez okunup buraya geçiriliyor; dışarıdan tek başına çağrıldığında
// (ülke değişimi) kendisi okuyor.
async function formCountryChanged(keepRate, onceden) {
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const all = onceden || await allSessions();
  const counts = {};
  all.forEach(r => { if ((r.ulke || S.country) === code) counts[r.firma] = (counts[r.firma] || 0) + 1; });
  const curFirm = $('in-firm').value === '__other'
    ? $('in-firm-other').value.trim()
    : $('in-firm').value;
  fillFirmSelect(code, curFirm && curFirm !== t('other') ? curFirm : '', counts);
  $('in-bank').innerHTML = bankOptions();
  $('in-amount-lbl').textContent = t('amount', {s: symOf(c[3])});

  // döviz kuru alanı
  const foreign = c[3] !== S.currency;
  $('wrap-rate').style.display = foreign ? '' : 'none';
  if (foreign) {
    $('rate-lbl').textContent = t('rateLbl', {f: c[3], b: S.currency});
    // WT-10/4: bu para birimleri ECB tablosunda yok — kur otomatik gelmez
    const noAuto = NO_AUTO_FX.includes(c[3]) || NO_AUTO_FX.includes(S.currency);
    $('rate-note').textContent = noAuto
      ? t('fxNoAuto') + ' — ' + t('rateNote', {b: S.currency})
      : t('rateNote', {b: S.currency});
    if (!keepRate) {
      $('in-rate').value = '';
      if (!noAuto) {
        const got = await fetchRate(c[3], S.currency, $('in-date').value);
        if (got && $('in-country').value === code) {
          $('in-rate').value = fmtInput(got.rate, 6);
          $('rate-note').textContent = t('rateAuto', {d: got.date}) + ' — ' + t('rateNote', {b: S.currency});
        }
      }
    }
  }
}

async function openAdd(id) {
  editingId = id || null;
  const r = id ? await db.sessions.get(id) : null;
  $('add-title').textContent = t(id ? 'editTitle' : 'addTitle');
  $('form-err').classList.remove('show');
  // WT-39: her açılışta OCR işaretleri sıfırlanır; düğme yalnız özellik
  // açıksa ve vendor dosyaları varsa görünür.
  if (typeof ocrTemizle === 'function') { ocrTemizle(); ocrRowSync(); }
  // WT-42/2: kaydın şarj kaybı (varsa) formun üstünde
  const lossEl = $('in-loss');
  lossEl.style.display = 'none';
  if (r) {
    const veh = r.aracId != null ? (await allVehicles()).find(v => v.id === r.aracId) : null;
    const k = kayipHesapla(r, veh);
    if (k) {
      lossEl.textContent = t('lossLine', {
        b: fmtNum(k.beklenen, 1), f: fmtNum(k.faturalanan, 1),
        p: fmtNum(Math.abs(k.pct), 1), y: k.pct >= 0 ? t('lossHigh') : t('lossLow')});
      lossEl.style.display = '';
    }
  }

  const selCode = r?.ulke || S.country;
  $('in-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}" ${c[0] === selCode ? 'selected' : ''}>${c[1]} ${c[2]} (${c[3]})</option>`).join('');

  $('in-date').value = r ? r.tarih.slice(0, 10) : localISO();
  $('in-tip').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (r?.tip || 'DC')));

  // kWh: tek alan (WT-03)
  $('in-kwh').value = r?.kwh ? fmtInput(r.kwh, 2) : '';
  // WT-19: odo'su olan kayıtta mesafe TÜRETİLMİŞTİR — mesafe kutusu boş kalır
  $('in-dist').value = (r && r.odo == null && r.mesafeKm) ? Math.round(distDisp(r.mesafeKm)) : '';
  $('in-odo').value = r?.odo != null ? Math.round(distDisp(r.odo)) : '';
  $('odo-note').textContent = '';
  $('in-free').checked = !!r?.free;
  const grossVal = r && !r.free
    ? (r.tutar != null ? r.tutar : (r.odenen || 0) + savingsOf(r)) : null;
  $('in-amount').value = grossVal != null && !isNaN(grossVal)
    ? fmtInput(grossVal, 2) : '';
  const dt = r?.indirimTip === 'percent' ? 'percent' : 'amount';
  $('in-disc-type').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === dt));
  $('in-disc-val').value = r?.indirimDeger ? fmtInput(r.indirimDeger, 2) : '';
  const durMin = r?.dur || 0;
  $('in-dur-h').value = durMin ? Math.floor(durMin / 60) : '';
  $('in-dur-m').value = durMin ? durMin % 60 : '';
  $('in-loc').value = r?.loc || '';
  $('in-socb').value = r?.socB ?? '';
  $('in-soca').value = r?.socA ?? '';
  $('in-note').value = r?.not || '';
  $('in-missed').checked = !!r?.atlanan;   // WT-20
  $('in-rate').value = r?.rate ? fmtInput(r.rate, 6) : '';
  // WT-16/C: birim fiyat — kayıtta varsa ondan, yoksa Ayarlar'daki değerden
  amountSrc = r ? (r.tutarKaynak || 'manuel') : 'birimFiyat';
  $('in-unitprice').value = fmtInput(r?.birimFiyat ?? S.homeKwhPrice, 2);
  $('in-free').dispatchEvent(new Event('change'));

  // WT-49/3: bu açılıştaki TEK sessions okuması — hem firma sayımı, hem
  // lokasyon önerileri, hem de gerekirse formCountryChanged bunu kullanıyor.
  const allSess = await allSessions();

  // firma / banka / kur — ülkeye göre (düzenlemede firmayı koru)
  await (async () => {
    const all = allSess;
    const counts = {};
    all.forEach(x => { if ((x.ulke || S.country) === selCode) counts[x.firma] = (counts[x.firma] || 0) + 1; });
    fillFirmSelect(selCode, r?.firma || '', counts);
    $('in-bank').innerHTML = bankOptions();
    $('in-bank').value = r?.banka || '';
    const c = COUNTRIES.find(x => x[0] === selCode);
    $('in-amount-lbl').textContent = t('amount', {s: symOf(c[3])});
    const foreign = c[3] !== S.currency;
    $('wrap-rate').style.display = foreign ? '' : 'none';
    if (foreign) {
      $('rate-lbl').textContent = t('rateLbl', {f: c[3], b: S.currency});
      $('rate-note').textContent = t('rateNote', {b: S.currency});
      if (!r?.rate) formCountryChanged(undefined, allSess);
    }
  })();

  // lokasyon önerileri (daha önce girilenler)
  const locs = [...new Set(allSess.map(x => x.loc).filter(Boolean))];
  $('loc-list').innerHTML = locs.map(l => `<option value="${esc(l)}">`).join('');

  // indirim ve SoC hızlı çipleri
  $('disc-chips').innerHTML = [0, 10, 15, 20, 30].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}%</button>`).join('');
  $('disc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      $('in-disc-type').querySelectorAll('button').forEach(x =>
        x.classList.toggle('sel', x.dataset.v === 'percent'));
      $('in-disc-val').value = b.dataset.v;
    }));
  $('soc-chips').innerHTML = ['20-80','10-80','10-90','20-100','10-100','0-100'].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}</button>`).join('');
  $('soc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      const [a, c2] = b.dataset.v.split('-');
      $('in-socb').value = a; $('in-soca').value = c2;
    }));

  // araç seçimi (arşivdekiler hariç; düzenlenen kayıt arşivli araca aitse o da listelenir)
  let vehicles = (await allVehicles()).filter(v => !v.archived || v.id === r?.aracId);
  $('wrap-vehicle').style.display = vehicles.length > 1 ? '' : 'none';
  $('in-vehicle').innerHTML = vehicles.map(v =>
    `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  $('in-vehicle').value = r?.aracId ?? S.defaultVehicleId ?? (vehicles[0]?.id || '');

  const advOpen = S.advOpen || !!(r && (r.dur || r.loc || r.not || r.banka));
  $('adv-fields').classList.toggle('open', advOpen);
  $('btn-adv').textContent = advOpen ? t('advancedHide') : t('advanced');

  // WT-16/C: firma seçimi yukarıdaki await bloklarında yapılıyor; birim fiyat
  // alanının görünürlüğü ancak ondan SONRA doğru hesaplanabilir.
  syncHomePricing();
  overlayOpen('page-add');
  markFormClean('page-add');   // WT-24/7: 'temiz' referansı
  $('page-add').querySelector('.ov-body').scrollTop = 0;
}

$('btn-save').addEventListener('click', async () => {
  const firmSel = $('in-firm').value;
  const firma = firmSel === '__other' ? $('in-firm-other').value.trim() : firmSel;
  const free = $('in-free').checked;
  // Hatalı alan "Gelişmiş" bloğunun içindeyse blok kapalıyken focus() hiçbir
  // şey yapmaz ve kullanıcı neyi düzelteceğini göremez — önce bloğu aç.
  // WT-29/2: hatalı input aria-invalid + aria-describedby ile işaretlenir.
  const showErr = (msg, id) => {
    clearFormErr();
    $('form-err').textContent = msg;
    $('form-err').classList.add('show');
    if (id) {
      const el = $(id);
      if (el && $('adv-fields').contains(el)) $('adv-fields').classList.add('open');
      if (el) {
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby',
          [el.getAttribute('aria-describedby'), 'form-err'].filter(Boolean).join(' '));
        el.addEventListener('input', clearFormErr, {once: true});
      }
      el?.focus();
    }
  };
  if (!firma) { showErr(t('formError')); return; }

  // WT-05: boş tarih "T12:00" üretir ve slice(0,4) ile tüm yıl/ay grupları bozulur
  const dateStr = $('in-date').value;
  if (!isValidDate(dateStr)) { showErr(t('dateNeeded'), 'in-date'); return; }
  if (dateStr > localISO()) toast(t('futureDate'));   // uyar ama ENGELLEME

  // WT-04: her sayısal alan tek doğrulama katmanından geçer
  const discType = $('in-disc-type').querySelector('.sel').dataset.v;
  const alanlar = [
    ['kwh',    'in-kwh',      true],
    ['tutar',  'in-amount',   !free],
    [discType === 'percent' ? 'indirimYuz' : 'indirim', 'in-disc-val', false],
    ['mesafe', 'in-dist',     false],
    ['odo',    'in-odo',      false],
    ['surSaat', 'in-dur-h',   false],
    ['surDak', 'in-dur-m',    false],
    ['soc',    'in-socb',     false],
    ['soc',    'in-soca',     false]
  ];
  const v = {};
  for (const [kural, id, required] of alanlar) {
    const r = checkNum(kural, free && id === 'in-amount' ? '' : $(id).value, {required});
    if (!r.ok) { showErr(r.msg, id); return; }
    v[id] = r.value;
  }
  const kwh = v['in-kwh'];
  const amount = free ? 0 : v['in-amount'];

  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const foreign = c[3] !== S.currency;
  let rate = null;
  if (foreign) {
    const rr = checkNum('kur', $('in-rate').value, {required: true});
    if (!rr.ok || rr.value <= 0) { showErr(t('rateNeeded'), 'in-rate'); return; }
    rate = rr.value;
  }
  // WT-19: mesafe ya da sayaç — ikisi birden değil
  const distIn = v['in-dist'] || 0;
  const odoIn = v['in-odo'];
  if (distIn && odoIn != null) { showErr(t('odoBothErr'), 'in-odo'); return; }
  const odoKm = odoIn != null ? Math.round(S.unit === 'mi' ? odoIn * MI : odoIn) : null;
  const discVal = free ? 0 : (v['in-disc-val'] || 0);
  const gross = free ? 0 : Math.round(amount * 100) / 100;
  const net = free ? 0 : Math.round(netFromGross(gross, discType, discVal) * 100) / 100;
  // socB >= socA sessizce yer değiştirmek veri uydurmaktır — reddet (WT-04/4)
  const a = v['in-socb'], b = v['in-soca'];
  if (a != null && b != null && a >= b) { showErr(t('socOrder'), 'in-soca'); return; }
  const durH = v['in-dur-h'] || 0;
  const durM = v['in-dur-m'] || 0;
  const rec = {
    tarih: $('in-date').value + 'T12:00',
    tip: $('in-tip').querySelector('.sel').dataset.v,
    firma, kwh: Math.round(kwh * 100) / 100,
    mekan: isHomeFirm(firma) ? 'evis' : 'firma',            // WT-16/1 (dilden bağımsız)
    birimFiyat: homeSelected() && amountSrc === 'birimFiyat'
      ? (pf($('in-unitprice').value) || null) : null,
    tutarKaynak: homeSelected() ? amountSrc : 'manuel',      // WT-16/C4
    tutar: gross,
    odenen: net,
    indirim: Math.round((gross - net) * 100) / 100,
    free,
    indirimTip: discVal > 0 ? discType : 'none',
    indirimDeger: discVal,
    banka: discVal > 0 || $('in-bank').value ? $('in-bank').value : '',
    mesafeKm: distIn ? Math.round((S.unit === 'mi' ? distIn * MI : distIn) * 10) / 10 : null,
    odo: odoKm,   // WT-19: doluysa mesafeKm bu kaydın türetilmiş değeridir
    atlanan: $('in-missed').checked,   // WT-20
    dur: (durH * 60 + durM) || null,
    loc: $('in-loc').value.trim(),
    socB: a, socA: b,
    ulke: code, cur: c[3],
    rate: foreign ? rate : null,
    rateBase: foreign ? S.currency : null,
    aracId: parseInt($('in-vehicle').value) || null,
    not: $('in-note').value.trim()
  };
  // WT-42: şarj kaybı kaydedilirken hesaplanıp saklanır (kayipPct).
  {
    const veh = rec.aracId != null ? (await allVehicles()).find(v => v.id === rec.aracId) : null;
    const k = kayipHesapla(rec, veh);
    rec.kayipPct = k ? k.pct : null;
  }
  // WT-39/BÖLÜM 7-8: ekran görüntüsü kayda eklenir, Geçmiş'te ataç ikonuyla
  // açılır. Blob olarak saklanıyor (WT-39/1).
  if (ocrShotBlob) { rec.ekranGor = ocrShotBlob; rec.ocrSablon = ocrSablonSon || 'genel'; }
  // WT-19: iki komşuya birden doğrulama — yazmadan ÖNCE
  if (odoKm != null) {
    const nb = await odoNeighbourCheck(rec.aracId, rec.tarih, odoKm, editingId);
    if (!nb.ok) { showErr(nb.msg, 'in-odo'); return; }
  }

  // WT-20/4: kullanıcı işaretlemediyse ve tüketim anormal düşükse sor
  if (!rec.atlanan) {
    // odo'lu kayıtta mesafe henüz türetilmedi; komşusundan tahmin et
    let mes = rec.mesafeKm;
    if (mes == null && odoKm != null) {
      const onceki = (await allSessions())
        .filter(r => vehEq(r.aracId, rec.aracId) && r.odo != null
          && r.id !== editingId && r.tarih <= rec.tarih)
        .sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
      if (onceki) mes = odoKm - onceki.odo;
    }
    if (await looksLikeMissedCharge(rec.aracId, mes, rec.kwh, editingId)
        && confirm(t('missedAsk'))) rec.atlanan = true;
  }

  // WT-12: başarı toast'ı yazma GERÇEKTEN bittikten sonra; hata olursa
  // form açık kalsın ki kullanıcı verisini kaybetmesin.
  let recId;
  let oldVeh = null;
  const wrote = await safeWrite(async () => {
    if (editingId) {
      const oldRec = await db.sessions.get(editingId);
      oldVeh = oldRec ? (oldRec.aracId ?? null) : null;
      await db.sessions.update(editingId, rec);
      recId = editingId;
    } else {
      recId = await db.sessions.add(rec);
    }
  });
  if (!wrote.ok) return;
  // WT-19: her yazma sonrası ilgili aracın TÜM kayıtları yeniden hesaplanır
  // (kayıt sayısı düşük, maliyeti önemsiz). Araç değiştiyse eskisi de.
  await tureMesafe(rec.aracId ?? null);
  if (oldVeh !== null && !vehEq(oldVeh, rec.aracId)) await tureMesafe(oldVeh);
  // Çevrimdışı güven: verinin cihaza yazıldığı açıkça söylensin (WT-29/3)
  toast(editingId ? t('updated') : t('savedLocal'));
  overlayClose('page-add', {force: true});
  showScreen(screen);
  offerDemoCleanup();   // WT-36/3d: ilk gerçek kayıttan sonra örnek veriyi sor
  // kur tablosunu sessizce ekle (çift yönlü dönüşüm için — yerli kayıt dahil)
  fetchTable(c[3], rec.tarih.slice(0, 10)).then(got => {
    if (got) db.sessions.update(recId, {fxTable: got.rates, fxDate: got.date})
      .then(() => { if (screen === 'dashboard') renderDashboard(); });
  });
});


/* ---- WT-39/BÖLÜM 7: OCR doğrulama arayüzü ---- */
// Kural: OCR formu DOLDURUR ama KAYDETMEZ. Doldurulan her alan sarı,
// güveni %60 altındaki alan kırmızı işaretlenir; kullanıcı alana dokununca
// işaret kalkar. Ekran görüntüsü formun üstünde küçük durur, dokununca
// tam ekran açılır (WT-38'in photo-view overlay'i).
const OCR_GUVEN_ESIK = 60;
let ocrShotBlob = null;      // kaydedilecek ekran görüntüsü (Blob)
let ocrSablonSon = null;

function ocrIsaretle(id, dusuk) {
  const el = $(id);
  if (!el) return;
  el.classList.add(dusuk ? 'ocr-low' : 'ocr-filled');
  if (dusuk) el.setAttribute('title', t('ocrLowConf'));
  const temizle = () => {
    el.classList.remove('ocr-filled', 'ocr-low');
    el.removeAttribute('title');
  };
  el.addEventListener('input', temizle, {once: true});
  el.addEventListener('focus', temizle, {once: true});
}
function ocrTemizle() {
  document.querySelectorAll('.ocr-filled, .ocr-low').forEach(el => {
    el.classList.remove('ocr-filled', 'ocr-low');
    el.removeAttribute('title');
  });
  $('ocr-bar').style.display = 'none';
  $('ocr-shot-wrap').style.display = 'none';
  ocrShotBlob = null;
  ocrSablonSon = null;
}
// "Tümünü temizle": işaretleri ve otomatik doldurulan değerleri kaldır
$('ocr-clear').addEventListener('click', () => {
  document.querySelectorAll('.ocr-filled, .ocr-low').forEach(el => { el.value = ''; });
  ocrTemizle();
});

// Alan -> form girdisi eşlemesi
const OCR_ALAN_ID = {
  kwh: 'in-kwh', odenen: 'in-amount', indirim: 'in-disc-val', dur: null,
  socB: 'in-socb', socA: 'in-soca', tarih: 'in-date', loc: 'in-loc'
};

async function ocrFormaUygula(sonuc) {
  const {alanlar: a, guven: g} = sonuc;
  ocrSablonSon = sonuc.sablon;
  const koy = (id, deger, alan) => {
    if (deger == null || !$(id)) return;
    $(id).value = deger;
    ocrIsaretle(id, (g[alan] ?? 100) < OCR_GUVEN_ESIK);
  };
  if (a.tarih) koy('in-date', a.tarih.slice(0, 10), 'tarih');
  if (a.kwh != null) koy('in-kwh', fmtInput(a.kwh, 2), 'kwh');
  if (a.odenen != null) koy('in-amount', fmtInput(a.odenen, 2), 'odenen');
  // Düzen B brüt/indirim/net üçlüsünü birebir veriyor
  if (a.indirim != null && a.indirim > 0) {
    // indirim tipi "tutar" (segment kontrolü)
    $('in-disc-type').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === 'amount'));
    koy('in-disc-val', fmtInput(a.indirim, 2), 'indirim');
  }
  if (a.socB != null) koy('in-socb', String(a.socB), 'socB');
  if (a.socA != null) koy('in-soca', String(a.socA), 'socA');
  if (a.dur != null) {
    if ($('in-dur-h')) { $('in-dur-h').value = Math.floor(a.dur / 60); ocrIsaretle('in-dur-h', false); }
    if ($('in-dur-m')) { $('in-dur-m').value = a.dur % 60; ocrIsaretle('in-dur-m', false); }
  }
  if (a.loc) koy('in-loc', a.loc, 'loc');
  if (a.tip && $('in-tip')) {
    $('in-tip').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === a.tip));
  }
  // Blokaj ücreti NETE EKLENMEZ; nota yazılır
  if (a.blokaj) {
    const not = $('in-note');
    if (not) { not.value = (not.value ? not.value + ' · ' : '') + t('ocrBlokaj', {v: fmtNum(a.blokaj, 2)}); }
  }
  // Gelişmiş alanlar doluysa bloğu aç ki kullanıcı görebilsin
  if (a.socB != null || a.socA != null || a.dur != null)
    $('adv-fields').classList.add('open');
  $('ocr-bar').style.display = 'flex';
}

// Ayarlar'daki anahtar açıksa ve vendor dosyaları varsa görünür
async function ocrRowSync() {
  const acik = S.ocrOn === true && await ocrVarMi();
  $('ocr-row').style.display = acik ? '' : 'none';
}
$('btn-ocr').addEventListener('click', () => $('ocr-file').click());
$('ocr-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  $('ocr-status').textContent = t('ocrWorking');
  try {
    const sonuc = await ocrOku(file);
    ocrShotBlob = await resizePhoto(file);       // kayda eklenecek kopya
    $('ocr-shot').src = photoSrc(ocrShotBlob);
    $('ocr-shot-wrap').style.display = '';
    await ocrFormaUygula(sonuc);
    $('ocr-status').textContent = sonuc.sablon
      ? t('ocrTemplate', {s: sonuc.sablon}) : t('ocrNoTemplate');
  } catch (err) {
    console.error('[WattTrack] OCR:', err);
    $('ocr-status').textContent = t('ocrFailed');
  }
});
// Küçük görüntüye dokununca tam ekran (WT-38'in overlay'i)
$('ocr-shot').addEventListener('click', () => openPhotoView($('ocr-shot')));
$('ocr-shot').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhotoView($('ocr-shot')); }
});
