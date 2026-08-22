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
  // WT-16/B: AC seçilirse ev kutucuğu otomatik işaretlensin (değiştirilebilir).
  // DC seçilirse kutucuklar boşalır, firma listesi geri gelir.
  // WT-86: eskiden bu iş drop-down'daki "Ev-İş" satırını seçiyordu.
  if (b.dataset.v === 'AC' && !homeSelected()) setHomeMode('ev');
  else if (b.dataset.v === 'DC' && homeSelected()) setHomeMode('');
  syncHomePricing();
});

// ---------- WT-16/C: Ev-İş şarjında tutarı kWh fiyatından hesapla ----------
// ---------- WT-86: ev/iş seçimi drop-down DIŞINDA, iki AYRI kutucukta ----------
// '' = firma listesi geçerli · 'ev' · 'is'
const homeMode = () => $('in-home').checked ? 'ev' : ($('in-work').checked ? 'is' : '');
const homeSelected = () => homeMode() !== '';
// Tek giriş noktası: iki kutucuk BİRBİRİNİ dışlar ve firma listesi kapanır.
function setHomeMode(m) {
  $('in-home').checked = m === 'ev';
  $('in-work').checked = m === 'is';
  $('lbl-home').classList.toggle('on', m === 'ev');
  $('lbl-work').classList.toggle('on', m === 'is');
  const kapali = m !== '';
  // Kapatmak SİLMEK değil: liste seçili değerini koruyor, kutucuk boşalınca
  // kullanıcı kaldığı yerden devam ediyor.
  $('in-firm').disabled = kapali;
  $('in-firm').style.opacity = kapali ? '.5' : '';
  $('in-firm-other').style.display =
    !kapali && $('in-firm').value === '__other' ? '' : 'none';
  // Ev/iş şarjında banka-kampanya indirimi geçerli değil; kutucuk
  // işaretlendiğinde alan boşaltılır ki bir önceki firma şarjından kalan
  // seçim sessizce kayda geçmesin.
  if (kapali && $('in-bank')) $('in-bank').value = '';
}
// Kayda yazılacak firma DİZGİSİ. i18n değil db.js'teki tablodan geliyor —
// depolanan değerin kaynağı tek olsun (bkz. EV_LABEL / IS_LABEL).
const homeFirmName = m => (m === 'is' ? IS_LABEL : EV_LABEL)[S.lang] ||
  (m === 'is' ? IS_LABEL : EV_LABEL).tr;
// Ev/iş şarjı pratikte AC'dir (kullanıcı isterse DC'ye çevirebilir).
const setTip = v => $('in-tip').querySelectorAll('button')
  .forEach(b => b.classList.toggle('sel', b.dataset.v === v));
[['in-home', 'ev'], ['in-work', 'is']].forEach(([id, m]) => {
  $(id).addEventListener('change', () => {
    const acik = $(id).checked;
    setHomeMode(acik ? m : '');
    if (acik) setTip('AC');
    syncHomePricing();
  });
});
// Tutar birim fiyattan mı geldi, kullanıcı elle mi yazdı?
let amountSrc = 'manuel';
// WT-87: kullanıcı birim fiyata dokunduysa kutucuk değişse bile o değer
// KORUNUR — ayarlardaki varsayılan artık üstüne yazmaz.
let unitPriceElle = false;
// WT-87: ev şarjı MESKEN, iş şarjı TİCARETHANE tarifesiyle hesaplanır —
// TR'de aradaki fark yaklaşık iki kat. Ayarlar'daki iki alandan hangisinin
// geleceğini kutucuk (WT-86) belirliyor.
const unitPriceDefault = () =>
  (homeMode() === 'is' ? S.workKwhPrice : S.homeKwhPrice) ?? S.homeKwhPrice;
function syncHomePricing() {
  const home = homeSelected() && !$('in-free').checked;
  $('wrap-unitprice').style.display = home ? '' : 'none';
  // Kutucuk değişince varsayılan fiyat da değişmeli — ama YALNIZ değer hâlâ
  // varsayılandan geliyorsa. Kullanıcı tutarı elle yazdıysa (amountSrc
  // 'manuel') ya da birim fiyata kendi dokunduysa üstüne yazmak veri ezmektir.
  if (home && amountSrc === 'birimFiyat' && !unitPriceElle) {
    const d = unitPriceDefault();
    if (d != null) $('in-unitprice').value = fmtInput(d, 2);
  }
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
  const kwh = pf(parcaliOku('in-kwh'));
  const up = pf($('in-unitprice').value);
  if (isNaN(kwh) || isNaN(up)) return;
  parcaliYaz('in-amount', Math.round(kwh * up * 100) / 100);
  updateNetLine();
}
$('in-firm').addEventListener('change', () => syncHomePricing());
$('in-unitprice').addEventListener('input', () => {
  amountSrc = 'birimFiyat';        // birim fiyata dokunmak hesabı yeniden açar
  unitPriceElle = true;
  recalcFromUnitPrice();
  syncHomePricing();
});
['in-kwh', 'in-kwh-dec'].forEach(id => $(id).addEventListener('input', () => {
  if (amountSrc === 'birimFiyat' && homeSelected()) recalcFromUnitPrice();
}));
// Tutara ELLE dokunmak birim fiyat hesabını devre dışı bırakır.
// WT-81/10 KUSURU: tutar da kWh gibi İKİ kutu (tam + kuruş) ama yalnız tam
// kısım dinleniyordu — hemen üstteki kWh satırı ikisini de listeliyor, bu
// çift ayrışmıştı. Kullanıcı ev/iş şarjında yalnız kuruş kutusunu
// düzeltirse (12,00 → 12,35) kaynak 'birimFiyat' kalıyor; sonraki kWh
// dokunuşu recalcFromUnitPrice()'ı tetikleyip parcaliYaz ile İKİ kutuyu da
// yeniden yazıyor ve düzeltme sessizce siliniyordu. Kayıt da hâlâ
// tutarKaynak:'birimFiyat' ile kaydediliyordu.
['in-amount', 'in-amount-dec'].forEach(id => $(id).addEventListener('input', () => {
  if (homeSelected() && amountSrc === 'birimFiyat') { amountSrc = 'manuel'; syncHomePricing(); }
}));
$('in-disc-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-disc-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  updateNetLine();
});
function updateNetLine() {
  const g = pf(parcaliOku('in-amount'));
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  if (isNaN(g) || g < 0) { $('calc-net').textContent = '—'; return; }
  const type = $('in-disc-type').querySelector('.sel').dataset.v;
  const net = netFromGross(g, type, pf(parcaliOku('in-disc-val')) || 0);
  $('calc-net').textContent = fm(symOf(c ? c[3] : S.currency),
    fmtNum(net, 2));
}
['in-amount', 'in-disc-val', 'in-amount-dec', 'in-disc-val-dec']
  .forEach(id => $(id).addEventListener('input', updateNetLine));
// WT-02/C: ondalıklı alanlarda blur'da virgüllü geri yazma
[['in-rate', 6], ['in-exp-amount', 2],
 ['c-price', 2], ['c-cons', 2], ['c-icefix', 2]].forEach(([id, d]) => bindDecimalInput(id, d));
// WT-65: enerji, tutar ve indirim TAM + ONDALIK iki kutuya ayrıldı —
// kullanıcı virgülü elle yazmasın (Veri Girişi 2).
//
// DİKKAT — WT-03 bu çift kutuyu bilerek KALDIRMIŞTI: eski uygulama ondalık
// kutusunu "yüzde bir" (kuruş) gibi okuyordu, kullanıcı 45,5 demek için "5"
// yazınca 45,05 kaydediliyordu — %1'lik SESSİZ hata. Geri getirirken o tuzak
// kapatıldı: ondalık kutusu virgülden SONRAKİ BASAMAKLAR olarak okunuyor
// ("5" → ,5) ve odak çıkınca iki basamağa tamamlanıp EKRANDA gösteriliyor
// ("5" → "50"). Yani değer artık sessizce değişmiyor, kullanıcı ne
// kaydedileceğini kutuda görüyor.
const PARCALI = ['in-kwh', 'in-amount', 'in-disc-val'];
function parcaliOku(id) {
  const tam = ($(id).value || '').trim();
  const ond = ($(id + '-dec')?.value || '').trim();
  if (!tam && !ond) return '';
  // Tam kutuya AYRAÇLI değer girilmiş olabilir: yapıştırma ya da eski
  // alışkanlık ("45,5"). pf'in kuralı gereği tek ayraç her zaman ondalıktır,
  // o yüzden böyle bir değer TAM sayılır ve ondalık kutusu yok sayılır.
  // Blur bunu iki kutuya bölüp kullanıcıya gösteriyor.
  if (/[.,]/.test(tam)) return tam;
  return (tam || '0') + ',' + (ond || '0');
}
function parcaliYaz(id, n) {
  const dEl = $(id + '-dec');
  if (n == null || n === '' || isNaN(n)) { $(id).value = ''; if (dEl) dEl.value = ''; return; }
  const yuvarlak = Math.round(Math.abs(n) * 100) / 100;
  const tam = Math.floor(yuvarlak);
  const ond = Math.round((yuvarlak - tam) * 100);
  // Binlik ayracı YOK: bu kutu tekrar pf'e girdiğinde "1.234" tek ayraçlı
  // sayılıp 1,234 olarak okunurdu (pf'in kuralı). Sade rakam tek doğru biçim.
  $(id).value = (n < 0 ? '-' : '') + String(tam);
  if (dEl) dEl.value = ond ? String(ond).padStart(2, '0') : '';
}
PARCALI.forEach(id => {
  // Tam kutuda blur: değeri her zaman iki kutuya böl. Ayraçlı girilen değer
  // YUVARLANMAZ (WT-03'ün sessiz %1 hatası buradan doğuyordu).
  $(id).addEventListener('blur', () => {
    if (!($(id).value || '').trim()) return;
    const n = pf(parcaliOku(id), 2);
    if (!isNaN(n)) parcaliYaz(id, n);
  });
  const dEl = $(id + '-dec');
  if (!dEl) return;
  dEl.addEventListener('input', () => {
    dEl.value = dEl.value.replace(/\D/g, '').slice(0, 2);
  });
  // Odak çıkınca sağa tamamla: "5" -> "50". Ne kaydedileceği kutuda görünür.
  dEl.addEventListener('blur', () => {
    if (dEl.value) dEl.value = dEl.value.padEnd(2, '0');
  });
});
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
    // WT-54/3: null = istek başarısız. Eskiden boş dizi dönüp SESSİZ kalıyordu;
    // kullanıcı "yakında istasyon yok" sanıyordu. Artık bilgilendiriliyor.
    const st = await nearbyStations(lat, lon);
    $('btn-gps').textContent = '📍';
    if (st === null) { $('loc-chips').innerHTML = ''; return toast(t('stationsFail')); }
    $('loc-chips').innerHTML = st.map(s =>
      `<button type="button" class="chip" data-n="${esc(s)}">${esc(s)}</button>`).join('');
    $('loc-chips').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => { $('in-loc').value = b.dataset.n; }));
  }, () => { toast(t('gpsFail')); $('btn-gps').textContent = '📍'; },
  {timeout: 8000, maximumAge: 60000});
});
// WT-54/4: Nominatim kullanım politikası aynı koordinatın tekrar tekrar
// sorulmasını yasaklıyor. Konum düğmesine arka arkaya basmak (geolocation
// maximumAge'i 60 sn, yani aynı koordinat dönüyor) her seferinde istek
// üretiyordu. 5 dakikalık bellek içi önbellek: anahtar ~11 m'ye yuvarlı
// koordinat, çünkü GPS gürültüsü tam eşleşmeyi neredeyse imkânsız kılar.
const GEO_TTL = 5 * 60 * 1000;
const geoCache = new Map();
const geoKey = (lat, lon) => lat.toFixed(4) + ',' + lon.toFixed(4);
async function reverseGeo(lat, lon) {
  const k = geoKey(lat, lon);
  const hit = geoCache.get(k);
  if (hit && Date.now() - hit.t < GEO_TTL) return hit.v;
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
    const ad = narrow ? (narrow + (town ? ', ' + town : '')) : (town || null);
    // Ağ/HTTP hatası buraya GELMEZ (yukarıda erken dönülüyor), yani geçici
    // hata önbelleğe yazılmıyor. Nominatim'in geçerli ama isimsiz yanıtı
    // (kırsal koordinat) ise BİLİNÇLİ olarak önbellekleniyor: gerçek bir
    // cevap, 5 dk içinde tekrar sorulması politikaya aykırı olurdu.
    geoCache.set(k, {t: Date.now(), v: ad});
    return ad;
  } catch { return null; }
}

/* WT-54/2 — OpenChargeMap API ANAHTARI.
   OCM v3 anonim erişimi kısıtlıyor; anahtarsız istek 403 dönebiliyor ve
   "yakındaki istasyon" özelliği sessizce çalışmıyor olabilir.
   Anahtar https://openchargemap.org/site/develop adresinden ÜCRETSİZ alınır
   ve BURAYA yazılır — kod değişikliği gerekmez, tek satır.
   Anahtar istemcide görünür olacağı için KISITLI KOTALI bir anahtar seç.
   Boş bırakılırsa istek anahtarsız gider (eski davranış).                */
const OCM_KEY = '';

// Dönüş: istasyon adları dizisi, ya da İSTEK BAŞARISIZSA null.
// Ayrım şart — eskiden hem "istasyon yok" hem "istek patladı" boş dizi
// dönüyordu, bu yüzden 403 sessizce yutuluyordu (WT-54'ün tespiti).
async function nearbyStations(lat, lon) {
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch('https://api.openchargemap.io/v3/poi/?output=json'
      + `&latitude=${lat}&longitude=${lon}&distance=1&distanceunit=km`
      + '&maxresults=4&compact=true&verbose=false'
      + (OCM_KEY ? '&key=' + encodeURIComponent(OCM_KEY) : ''),
      {signal: ctrl.signal});
    clearTimeout(tm);
    if (!res.ok) {
      // Durum kodu konsola YAZILIYOR: WT-54/1 gerçek cihaz doğrulaması
      // (403 mü, kota mı) ağ sekmesi açmadan da görülebilsin.
      console.error('[WattTrack] OpenChargeMap ' + res.status
        + (res.status === 403 || res.status === 401
          ? ' — API anahtarı gerekiyor (ui/forms.js → OCM_KEY)' : ''));
      return null;
    }
    const j = await res.json();
    return (j || []).map(p => {
      const op = p.OperatorInfo && p.OperatorInfo.Title ? p.OperatorInfo.Title + ' — ' : '';
      return (op + (p.AddressInfo?.Title || '')).slice(0, 60);
    }).filter(Boolean);
  } catch (err) {
    console.error('[WattTrack] OpenChargeMap:', err);
    return null;
  }
}

// WT-86: ev/iş etiketleri artık BU LİSTEDE YOK — seçimleri yanındaki
// kutucuklarda. Hangi dilde kaydedilmiş olursa olsun eleniyorlar, yoksa eski
// kayıtlardan gelen "Ev-İş"/"Home/Work" satırları listede kutucukların
// kopyası olarak görünürdü.
function fillFirmSelect(code, current, usedCounts) {
  const used = Object.entries(usedCounts)
    .sort((a, b) => b[1] - a[1]).map(e => e[0]).filter(f => !isHomeFirm(f));
  const list = [...new Set([...used, ...chargersFor(code).filter(f => !isHomeFirm(f))])];
  const opts = list.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('') +
    `<option value="__other">${t('other')}</option>`;
  $('in-firm').innerHTML = opts;
  // Ev/iş kaydı düzenleniyorsa firma listesine hiç dokunulmaz: seçim
  // kutucuklarda, liste de zaten kapalı (setHomeMode).
  if (current && isHomeFirm(current)) {
    $('in-firm').value = list[0] || '__other';
    $('in-firm-other').style.display = 'none';
  } else if (current && list.includes(current)) {
    $('in-firm').value = current;
    $('in-firm-other').style.display = 'none';
  } else if (current) {
    $('in-firm').value = '__other';
    $('in-firm-other').value = current;
    $('in-firm-other').style.display = '';
  } else {
    $('in-firm').value = used[0] || list[0] || '__other';
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

  // döviz kuru alanı
  if (syncRateFields(c[3]) && !keepRate) {
    $('in-rate').value = '';
    if (!fxNoAuto(c[3])) {
      const got = await fetchRate(c[3], S.currency, $('in-date').value);
      if (got && $('in-country').value === code) {
        $('in-rate').value = fmtInput(got.rate, 6);
        $('rate-note').textContent = t('rateAuto', {d: got.date}) + ' — ' + t('rateNote', {b: S.currency});
      }
    }
  }
}

// WT-10/4: bu para birimleri ECB tablosunda yok — kur otomatik gelmez.
const fxNoAuto = cur => NO_AUTO_FX.includes(cur) || NO_AUTO_FX.includes(S.currency);

// WT-81/3: tutar etiketi + kur alanının görünürlüğü ve metinleri iki yerde
// (formCountryChanged ve openAdd) ayrı ayrı yazılmıştı ve openAdd'deki kopya
// NO_AUTO_FX uyarısını ATLIYORDU — ECB tablosunda olmayan bir para biriminde
// kayıt düzenlerken "kur otomatik gelmez" notu görünmüyordu. Tek yer.
// Kuru ÇEKMEZ; ağa yalnız formCountryChanged() çıkar.
// Döner: alan yabancı para birimi olduğu için görünür mü?
function syncRateFields(cur) {
  $('in-amount-lbl').textContent = t('amount', {s: symOf(cur)});
  const foreign = cur !== S.currency;
  $('wrap-rate').style.display = foreign ? '' : 'none';
  if (foreign) {
    $('rate-lbl').textContent = t('rateLbl', {f: cur, b: S.currency});
    $('rate-note').textContent = fxNoAuto(cur)
      ? t('fxNoAuto') + ' — ' + t('rateNote', {b: S.currency})
      : t('rateNote', {b: S.currency});
  }
  return foreign;
}

async function openAdd(id) {
  editingId = id || null;
  const r = id ? await db.sessions.get(id) : null;
  $('add-title').textContent = t(id ? 'editTitle' : 'addTitle');
  // WT-105: para iadesi kapısının altyazısı bu ayki iadeyi söylüyor; form
  // her açıldığında tazeleniyor (uygulama açılışında henüz veri okunmamış
  // olabiliyor, tek seferlik yazmak eski değeri dondururdu).
  cbOzetYaz();
  $('form-err').classList.remove('show');
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

  // WT-86: ev/iş kutucukları drop-down'ın DIŞINDA, iki ayrı kutucukta.
  // WT-89: YENİ kayıt artık HİÇBİR kutucuk işaretli DEĞİL açılıyor — şarjların
  // çoğu firmada yapılıyor, "Ev" varsayılanı her seferinde bir dokunuşla
  // boşaltılmak zorundaydı. Kutucuklar boşken firma listesi etkin ve
  // listenin İLK sırası (en çok kullanılan firma) seçili geliyor
  // (bkz. fillFirmSelect: `used[0] || list[0]`).
  // Düzenlemede eski 'evis' kayıtları "Ev"e düşüyor: o etiket ev mi iş mi
  // olduğunu HİÇ söylemiyordu, kullanıcı kaydı zaten açmışken düzeltebilir.
  // TİP ayrı bir boyut (WT-16): burada tipe DOKUNULMUYOR, WT-47'nin önerisi
  // geçerli kalıyor. Tip yalnız kullanıcı kutucuğa BASINCA AC'ye çekiliyor —
  // ve AC'ye basmak hâlâ ev kutucuğunu işaretliyor (WT-16/B).
  setHomeMode(r
    ? (r.mekan === 'is' ? 'is'
      : (r.mekan === 'ev' || r.mekan === 'evis' || (!r.mekan && isHomeFirm(r.firma)))
        ? 'ev' : '')
    : '');

  // kWh: tek alan (WT-03)
  parcaliYaz('in-kwh', r?.kwh ?? null);
  // WT-19: odo'su olan kayıtta mesafe TÜRETİLMİŞTİR — mesafe kutusu boş kalır
  $('in-dist').value = (r && r.odo == null && r.mesafeKm) ? Math.round(distDisp(r.mesafeKm)) : '';
  $('in-odo').value = r?.odo != null ? Math.round(distDisp(r.odo)) : '';
  $('odo-note').textContent = '';
  $('in-free').checked = !!r?.free;
  const grossVal = r && !r.free
    ? (r.tutar != null ? r.tutar : (r.odenen || 0) + savingsOf(r)) : null;
  parcaliYaz('in-amount', grossVal != null && !isNaN(grossVal) ? grossVal : null);
  const dt = r?.indirimTip === 'percent' ? 'percent' : 'amount';
  $('in-disc-type').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === dt));
  parcaliYaz('in-disc-val', r?.indirimDeger ?? null);
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
  // WT-87: kaydın kendi birim fiyatı varsa o; yoksa kutucuğa göre Ayarlar'daki
  // mesken / ticarethane fiyatı. Her açılışta "elle dokunuldu" işareti sıfırlanır.
  unitPriceElle = !!r?.birimFiyat;
  $('in-unitprice').value = fmtInput(r?.birimFiyat ?? unitPriceDefault(), 2);
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
    // WT-81/3: aynı iş burada elle tekrarlanıyordu ve NO_AUTO_FX uyarısını
    // atlıyordu; artık formCountryChanged ile aynı yerden geçiyor.
    if (syncRateFields(c[3]) && !r?.rate) formCountryChanged(undefined, allSess);
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
      parcaliYaz('in-disc-val', pf(b.dataset.v));
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

  // WT-47: yeni kayıt modunda son kaydın alışkanlıkları önerilir. Düzenlemede
  // ASLA çalışmaz — kaydın kendi değerleri yukarıda yazıldı, üzerine yazmak
  // kullanıcının verisini bozar. Araç/birim fiyat zaten hazır geliyordu
  // (varsayılan araç, WT-16'nın homeKwhPrice'ı); bu blok tip, banka ve
  // lokasyonu ekliyor.
  const oneri = (() => {
    if (r) return null;
    const secilen = $('in-vehicle').value ? +$('in-vehicle').value : null;
    // Örnek veri (WT-36) öneri üretmez: kullanıcının alışkanlığı değil.
    const aday = allSess.filter(x => !isDemo(x));
    // Çok araçlı kullanıcıda BAŞKA bir aracın bankası/lokasyonu öneri değil
    // gürültüdür; seçili aracın kaydı yoksa genele düşülüyor.
    const kendi = secilen != null ? aday.filter(x => x.aracId === secilen) : [];
    const havuz = kendi.length ? kendi : aday;
    return havuz.reduce((a, b) =>
      !a || b.tarih > a.tarih || (b.tarih === a.tarih && b.id > a.id) ? b : a, null);
  })();
  if (oneri) {
    if (oneri.tip) $('in-tip').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === tipOf(oneri)));
    // KUSUR (kullanıcı bildirimi): banka önerisi kaydın TÜRÜNE bakmıyordu.
    // Firma şarjında banka/kampanya seçip kaydeden kullanıcı, ardından Ev ya
    // da İş şarjı girmeye başladığında o bankayı SEÇİLİ buluyordu — ev
    // şarjında banka indirimi diye bir şey yok, üstelik alan gelişmiş panelin
    // içinde olduğu için fark edilmeden kaydediliyordu.
    // Öneri artık yalnız AYNI TÜRDEN bir kayıttan geliyor; ev-iş şarjında
    // banka alanı boş açılır.
    if (oneri.banka && !homeSelected() && !isHomeRec(oneri))
      $('in-bank').value = oneri.banka;
    // Lokasyon YALNIZ aynı gün önerilir: dünkü istasyon bugünkü şarjın yeri
    // değil, ama aynı gün ikinci kez şarj eden kullanıcı büyük olasılıkla
    // aynı yerdedir. (Madde de "aynı gün içindeyse" diyor.)
    if (oneri.loc && oneri.tarih.slice(0, 10) === $('in-date').value)
      $('in-loc').value = oneri.loc;
  }

  // WT-63: eskiden WT-47'nin otomatik doldurması ($('in-bank')/$('in-loc'))
  // paneli AÇIYORDU. Otomatik doldurma neredeyse her kayıtta çalıştığı için
  // "Gelişmiş alanlar hep açık" ayarı kapalıyken bile panel sürekli açık
  // geliyordu — ayar pratikte ölüydü. Artık ayar kesin: kapalıysa panel açılmaz.
  // WT-47'nin asıl derdi (kapalı panelde sessizce doldurulan alan) kaybolmasın
  // diye düğme kaç alanın dolu olduğunu söylüyor.
  // WT-81/9 KUSURU: onay kutusu değer alanıyla sayılamaz. Nitelik yazılmamış
  // bir <input type="checkbox"> işaretli OLMASA da `value === "on"` döner —
  // panelde #in-missed var, dolayısıyla sayaç hiç 0 olmuyordu. Bomboş bir
  // formda bile "Gelişmiş alanlar (1 dolu)" yazıyordu; banka+konum otomatik
  // dolduğunda 2 yerine 3 diyordu. WT-63'ün ipucu böylece güvenilmezdi.
  const advDolu = [...$('adv-fields').querySelectorAll('input, select, textarea')]
    .filter(el => el.type === 'checkbox' ? el.checked : (el.value || '').trim() !== '')
    .length;
  const advOpen = !!S.advOpen;
  $('adv-fields').classList.toggle('open', advOpen);
  $('btn-adv').textContent = advOpen ? t('advancedHide')
    : (advDolu ? t('advancedFilled', {n: advDolu}) : t('advanced'));

  // WT-16/C: firma seçimi yukarıdaki await bloklarında yapılıyor; birim fiyat
  // alanının görünürlüğü ancak ondan SONRA doğru hesaplanabilir.
  syncHomePricing();
  overlayOpen('page-add');
  markFormClean('page-add');   // WT-24/7: 'temiz' referansı
  $('page-add').querySelector('.ov-body').scrollTop = 0;
}

$('btn-save').addEventListener('click', async () => {
  // WT-86: kutucuk işaretliyse firma listesine HİÇ bakılmaz — liste kapalı,
  // içindeki değer kullanıcının seçimi değil, sadece son duruma bakıyor.
  const mekan = homeMode() || 'firma';
  const firmSel = $('in-firm').value;
  const firma = mekan !== 'firma' ? homeFirmName(mekan)
    : (firmSel === '__other' ? $('in-firm-other').value.trim() : firmSel);
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
    const deger = PARCALI.includes(id) ? parcaliOku(id) : $(id).value;
    const r = checkNum(kural, free && id === 'in-amount' ? '' : deger, {required});
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
    mekan,                                    // WT-16/1 + WT-86 (dilden bağımsız)
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
