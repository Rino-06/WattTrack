/* ============================================================
   WattTrack — app (başlangıç ve yönlendirme)
   WT-50: app.js tek dosyaydı; bu dosya oradan AYRILDI.
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */


/* ---- Ekran geçişleri (yönlendirme) ---- */
// ============================================================
// EKRAN GEÇİŞLERİ
// ============================================================
let screen = 'dashboard';
const RENDER = {dashboard: renderDashboard, stats: renderStats, history: renderHistory,
  compare: renderCompare, vehicle: renderVehiclePage, settings: renderSettings};
document.querySelectorAll('nav button[data-page]').forEach(b =>
  b.addEventListener('click', () => showScreen(b.dataset.page)));
// WT-24/6: "Aynı mantığı sekme geçişlerine de uygula" — sekme değişimi de
// geçmişe yazılır, böylece Geçmiş/İstatistik sekmesindeyken geri tuşu
// uygulamadan çıkmak yerine önceki sekmeye döner. Ana sayfa taban: oradan
// geri basmak uygulamadan çıkar (beklenen Android davranışı).
function showScreen(name, {push = true} = {}) {
  if (push && name !== screen) {
    if (name === 'dashboard') {
      // tabana dönüş: yeni yığın kurmak yerine geçmişi tabana sıfırla
      history.replaceState({page: 'dashboard'}, '');
    } else {
      history.pushState({page: name}, '');
    }
  }
  screen = name;
  document.querySelectorAll('.content .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button[data-page]').forEach(b => {
    const on = b.dataset.page === name;
    b.classList.toggle('sel', on);
    // WT-23/5: ekran okuyucu hangi sekmede olduğumuzu duyursun
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('page-' + name).classList.add('active');
  RENDER[name]?.();
  if (typeof syncEmptyStates === 'function') syncEmptyStates();   // WT-36
  document.querySelector('.content').scrollTop = 0;
}

// WT-29/2: hata düzeltilince aria-invalid ve aria-describedby kaldırılır.
function clearFormErr() {
  const err = $('form-err');
  if (err) { err.textContent = ''; err.classList.remove('show'); }
  document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
    el.removeAttribute('aria-invalid');
    const d = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/).filter(x => x && x !== 'form-err').join(' ');
    if (d) el.setAttribute('aria-describedby', d); else el.removeAttribute('aria-describedby');
  });
}


/* ---- Başlangıç ---- */
// ============================================================
// BAŞLANGIÇ
// ============================================================

// init ve yedek geri yükleme aynı listeyi kullanır (WT-07)
const SETTING_KEYS = ['country','currency','unit','lang','advOpen','defaultVehicleId',
  'onboarded','cmp','bankCountries','customBanks','gran','theme','homeKwhPrice',
  'ocrOn','budgetM','budgetY'];   // WT-39, WT-45

(async function init() {
  for (const key of SETTING_KEYS) {
    const row = await db.settings.get(key);
    if (row) S[key] = row.value;
  }
  history.replaceState({page: 'dashboard'}, '');   // WT-24/6 taban durum
  initOnboarding();
  initSegments();   // WT-28
  applyI18n();
  applyTheme();
  initStorage();   // WT-12/4
  if (!S.onboarded) overlayOpen('ob');
  renderDashboard();
  // PWA kısayolları (?action=add | ?page=history/compare/settings)
  const q = new URLSearchParams(location.search);
  if (S.onboarded && (q.get('share_text') || q.get('share_title'))) {
    await openAdd();
    $('in-note').value = [q.get('share_title'), q.get('share_text'), q.get('share_url')]
      .filter(Boolean).join(' ').slice(0, 200);
    $('adv-fields').classList.add('open');
  }
  else if (S.onboarded && q.get('action') === 'add') openAdd();
  else if (S.onboarded && ['stats','history','compare','vehicle','settings'].includes(q.get('page')))
    showScreen(q.get('page'));   // pushState yapar: geri tuşu ana sayfaya döner
  backfillRates().then(() => { if (screen === 'dashboard') renderDashboard(); });
  syncEmptyStates();   // WT-36
  hideSplash();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
  // güncelleme geldiğinde (yeni SW devraldığında) sayfayı bir kez tazele
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swReloaded) return;
    swReloaded = true;
    location.reload();
  });
}
