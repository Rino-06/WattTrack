/* ============================================================
   WattTrack — banka para iadesi (WT-105)
   Modül DEĞİL, klasik script — TWA ve file:// protokolünde
   import/export sorun çıkarıyor. Yükleme sırası index.html'de.
   ============================================================ */

// ============================================================
// BANKA PARA İADESİ
// ============================================================
// Banka, kartla yapılan şarjların bir kısmını ay sonunda geri yatırıyor.
// Bu para tek bir şarja ait DEĞİL: toplu geliyor, tarihi şarjların
// tarihinden başka ve çoğu zaman birden fazla şarjı kapsıyor. Bu yüzden
// şarj kaydının bir alanı değil, kendi tablosu var.
//
// Kural (kullanıcı isteği): iade, GİRİLEN TARİHİN düştüğü haftadan, aydan
// ve yıldan düşülür. Uygulamada dönem seçicisi zaten bunu yapıyor, o yüzden
// ayrı bir "hangi döneme yazılsın" sorusu YOK — tarih yeter.
let editingCbId = null;

async function openCashback() {
  editingCbId = null;
  cbFormDoldur(null);
  await renderCbList();
  overlayOpen('page-cashback');
}

function cbFormDoldur(rec) {
  $('in-cb-bank').innerHTML = bankOptions();
  $('in-cb-bank').value = rec?.banka || '';
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('in-cb-cur').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  $('in-cb-cur').value = rec?.cur || S.currency;
  $('in-cb-date').value = rec?.tarih || localISO();
  $('in-cb-amt').value = rec ? fmtInput(rec.tutar, 2) : '';
  $('in-cb-note').value = rec?.not || '';
  $('lbl-cb-amt').textContent = t('expAmount') + ' (' + symOf($('in-cb-cur').value) + ')';
}

async function renderCbList() {
  const liste = (await allCashbacks())
    .sort((a, b) => (b.tarih || '').localeCompare(a.tarih || ''));
  const box = $('cb-list');
  if (!liste.length) {
    box.innerHTML = `<div class="about">${t('cashbackEmpty')}</div>`;
    return;
  }
  box.innerHTML = `<div class="rows">${liste.map(c => `
    <div class="crow" data-cb="${c.id}">
      <div class="avatar" style="background:var(--chip);color:var(--accent-text)">💳</div>
      <div class="mid">
        <div class="name">${esc(c.banka || t('cashback'))}</div>
        <div class="sub">${shortDate(c.tarih + 'T00:00')}${c.not ? ' · ' + esc(c.not) : ''}</div>
      </div>
      <div class="right"><div class="amt" style="color:var(--accent-dark)">−${
        fm(symOf(c.cur || S.currency), fmtNum(c.tutar, 0))}</div></div>
      <button class="del" data-cbdel="${c.id}">×</button>
    </div>`).join('')}</div>`;
  box.querySelectorAll('[data-cb]').forEach(el =>
    el.addEventListener('click', async e => {
      if (e.target.closest('[data-cbdel]')) return;
      const rec = await db.cashbacks.get(+el.dataset.cb);
      if (!rec) return;
      editingCbId = rec.id;
      cbFormDoldur(rec);
      $('in-cb-amt').focus();
    }));
  box.querySelectorAll('[data-cbdel]').forEach(el =>
    el.addEventListener('click', async e => {
      e.stopPropagation();
      const id = +el.dataset.cbdel;
      const silinen = await db.cashbacks.get(id);
      await db.cashbacks.delete(id);
      if (editingCbId === id) { editingCbId = null; cbFormDoldur(null); }
      await renderCbList();
      cashbackYenile();
      toastUndo(t('deleted'), async () => {
        if (!silinen) return;
        await db.cashbacks.add(silinen);
        await renderCbList();
        cashbackYenile();
      });
    }));
}

// Yeni Şarj Kaydı'ndaki kapının altyazısı: iade girildiyse bu ayki toplamı
// söylüyor, girilmediyse ne işe yaradığını anlatıyor.
async function cbOzetYaz() {
  const bu = inPeriod(await allCashbacks(), 'month');
  $('cb-summary').textContent = bu.length
    ? t('cashbackThisMonth', {v: money(iadeToplam(bu)), n: bu.length})
    : t('cashbackD');
}

// İade değişince onu gösteren HER ekran tazelenir. Ana sayfa ve İstatistik
// toplamları iadeyi düşüyor; biri tazelenmezse iki ekran farklı sayı
// gösterirdi.
function cashbackYenile() {
  renderDashboard();
  renderStats();
  cbOzetYaz();
}

$('btn-cashback').addEventListener('click', openCashback);
$('btn-close-cb').addEventListener('click', () => overlayClose('page-cashback'));
$('in-cb-cur').addEventListener('change', () => {
  $('lbl-cb-amt').textContent = t('expAmount') + ' (' + symOf($('in-cb-cur').value) + ')';
});
$('in-cb-bank').addEventListener('change', async () => {
  if ($('in-cb-bank').value !== '__newbank') return;
  const name = (prompt(t('newBankPrompt')) || '').trim();
  if (name) {
    S.customBanks = [...new Set([name, ...(S.customBanks || [])])].slice(0, 20);
    await saveSetting('customBanks', S.customBanks);
    $('in-cb-bank').innerHTML = bankOptions();
    $('in-cb-bank').value = name;
  } else {
    $('in-cb-bank').value = '';
  }
});

$('btn-save-cb').addEventListener('click', async () => {
  const tarih = $('in-cb-date').value;
  if (!isValidDate(tarih)) { toast(t('dateNeeded')); $('in-cb-date').focus(); return; }
  const chk = checkNum('tutar', $('in-cb-amt').value, {required: true});   // WT-04
  if (!chk.ok) { toast(chk.msg); $('in-cb-amt').focus(); return; }
  if (chk.value <= 0) { toast(t('amountNeeded')); $('in-cb-amt').focus(); return; }
  const cur = $('in-cb-cur').value;
  const rec = {
    tarih, banka: $('in-cb-bank').value, tutar: chk.value, cur,
    not: $('in-cb-note').value.trim()
  };
  const wasEditing = editingCbId;
  const w = await safeWrite(async () => wasEditing                  // WT-12
    ? (await db.cashbacks.update(wasEditing, rec), wasEditing)
    : await db.cashbacks.add(rec));
  if (!w.ok) return;
  toast(wasEditing ? t('updated') : t('savedLocal'));
  editingCbId = null;
  cbFormDoldur(null);
  await renderCbList();
  cashbackYenile();
  // Kuru sonradan gelen tablo: yabancı para iadesi de dönem toplamına girsin.
  fetchTable(cur, tarih).then(got => {
    if (got) db.cashbacks.update(w.value, {fxTable: got.rates, fxDate: got.date})
      .then(cashbackYenile);
  });
});
