/* ============================================================
   WattTrack v5 — EV şarj harcama takibi
   Veriler yalnızca cihazda (IndexedDB / Dexie.js) saklanır.
   Tek dış bağlantı (opsiyonel): döviz kuru için frankfurter API.
   ============================================================ */

const db = new Dexie('watttrack');
db.version(1).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key'
});
// v2: araç giderleri (vergi, sigorta, bakım…) — sahip olma maliyeti için
db.version(2).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
});
// v3 (WT-16): şarj YERİ boyutu. DC/AC bir TEKNOLOJİ boyutu, "Ev" ise bir FİRMA
// değeriydi — aynı kayıt ana sayfadaki AC filtresine, donutta "Ev"e giriyordu.
// Artık teknoloji `tip`, yer `mekan` alanında: 'evis' | 'firma'.
// ("kamu"/"public" terimi kasıtlı olarak hiçbir yerde kullanılmıyor.)
const OLD_HOME_NAMES = ['Ev', 'Home', 'Zuhause', 'Maison', 'Casa'];
const HOME_LABEL = {tr: 'Ev-İş', en: 'Home/Work', de: 'Zuhause/Arbeit',
  fr: 'Domicile/Travail', es: 'Casa/Trabajo', it: 'Casa/Lavoro'};
// Ev-İş kimliği DİLE BAĞLI OLMAMALI. Kullanıcı kayıtları Türkçe girip sonra
// İngilizce'ye geçerse 'Ev-İş' değeri t('homeChip') ile eşleşmez ve kayıt
// sessizce "Şarj firması"na kayardı. Altı dilin yeni ve eski karşılıkları
// birlikte tanınır.
const HOME_NAMES = new Set([...Object.values(HOME_LABEL), ...OLD_HOME_NAMES]);
const isHomeFirm = f => HOME_NAMES.has(f);
db.version(3).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
}).upgrade(async tx => {
  // Eski "Ev" değeri kullanıcının o günkü diline göre saklanmıştı; altı
  // karşılığın hepsi tanınır. Yeni etiket kullanıcının mevcut dilinde yazılır.
  const langRow = await tx.table('settings').get('lang');
  const evis = HOME_LABEL[langRow?.value] || HOME_LABEL.tr;
  await tx.table('sessions').toCollection().modify(r => {
    if (OLD_HOME_NAMES.includes(r.firma)) { r.mekan = 'evis'; r.firma = evis; }
    else r.mekan = 'firma';
  });
});
// v4 (WT-19): kayıt bazlı kilometre sayacı değeri. Mevcut kayıtlara
// DOKUNULMAZ — odo'su olmayan kayıtların mesafeKm'si kullanıcının girdiğidir.
db.version(4).stores({
  sessions: '++id, tarih, firma, tip, aracId, mekan, odo',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
});
const EXP_TYPES = ['tax', 'insurance', 'maintenance', 'tire', 'inspection',
                   'repair', 'parking', 'equipment', 'other'];
const EXP_ICON = {tax: '🧾', insurance: '🛡️', maintenance: '🔧', tire: '🛞',
  inspection: '✅', repair: '🛠️', parking: '🅿️', equipment: '🔌', other: '📦'};

const AVATAR_COLORS = ['#1C8742', '#007DAA', '#C87B00', '#A54C8B', '#C25C5F'];
const MI = 1.60934;
// Sürüm bilgisi version.js'ten gelir (WT-52) — tek kaynak.
const APP_VERSION = WT_VERSION;
const APP_DATE = WT_DATE;
const SCHEMA_VERSION = WT_SCHEMA;

// ---------- Çeviriler ----------
const T = {
tr:{navStats:'İstatistik',statsTitle:'İstatistikler',ice1:'Yakıtlı 1 {u}',unitCostTitle:'Birim maliyet — EV ve Yakıtlı yan yana',tcoExpEv:'EV sabit giderleri (Aracım)',tcoExpIce:'Yakıtlı sabit gider (döneme oranlı)',tco1kmIce:'Yakıtlı 1 {u} (gider dahil)',tcoExplain:'EV sabit giderleri, Aracım sekmesine girdiğin vergi, sigorta, bakım gibi kalemlerdir. Yakıtlı tarafta, yukarıda girdiğin yıllık sabit gider izlenen döneme oranlanır — iki araç aynı dönemde karşılaştırılır.',totalCostAll:'Toplam gider (şarj + sabit)',fixedExpTotal:'Sabit giderler toplamı',expChart:'Sabit gider grafiği',prorateLbl:'Yıllık giderleri (vergi, sigorta) izlenen döneme oranla',prorateNote:'Yıllık kalemler dönem oranıyla (%{p}) hesaba katıldı; gerçek ödenen toplam {r}.',exp_tax:'Vergi (MTV)',exp_insurance:'Sigorta / Kasko',exp_maintenance:'Bakım / Servis',exp_tire:'Lastik',exp_inspection:'Muayene',exp_repair:'Onarım / Hasar',exp_parking:'Otopark / Otoyol',exp_equipment:'Ekipman (ev şarj cihazı vb.)',exp_other:'Diğer',otherTypePh:'Başlık yaz — örn. Aksesuar, Araç yıkama',addExpense:'Gider ekle',editExpense:'Gideri düzenle',expType:'Gider türü',expenses:'Araç giderleri',expByCat:'Gider dağılımı',expTotal:'Giderler toplamı',expAmount:'Tutar',noteLbl:'Not',amountNeeded:'Tutar gir',noExpenses:'Henüz gider yok. Vergi, sigorta ve bakım tutarlarını ekleyerek gerçek maliyeti gör.',tcoTitle:'Toplam sahip olma maliyeti (şarj + giderler)',tcoEv:'EV toplam (şarj + gider)',tcoIce:'Yakıtlı toplam (gider dahil)',tcoSaved:'Gider dahil toplam kazanç',tco1km:'EV 1 {u} (gider dahil)',tcoNote:'İzlenen dönem {d} gün. Yakıtlı aracın sabit gideri bu döneme oranlandı: {f}.',nonFuelTitle:'Yakıt dışı gider kıyaslaması',nonFuelKm:'{u} başına yakıt dışı gider',nonFuel100:'100 {u} başına yakıt dışı gider',nonFuelYear:'Yıllık yakıt dışı gider',nonFuelKwh:'kWh başına yakıt dışı gider',nonFuelDiffYear:'Yıllık yakıt dışı gider farkı',nonFuelChart:'Yıllık yakıt dışı gider (EV / Yakıtlı)',iceShort:'Yakıtlı',chargePower:'Ort. şarj gücü',yearlyCompare:'Yıllık karşılaştırma',yearlySpendLbl:'Toplam harcama (bu yıl)',yearlyKwhLbl:'Enerji (bu yıl)',yearlyPriceLbl:'kWh fiyatı (bu yıl)',weekdayDist:'Haftanın günlerine göre dağılım',vsLastYear:'geçen yıla göre',iceFixHint:'İsteğe bağlı. Benzer bir yakıtlı aracın yıllık vergi, sigorta ve bakım toplamını yaz — adil kıyas için kendi giderlerinle karşılaştırılır.',ev1:'EV 1 {u} ({x})',supportNote:'Bu uygulama tamamen ücretsiz ve reklamsız olarak geliştirilmiştir. Projeye destek olmak veya bir kahve ısmarlamak isterseniz GitHub sayfamıza göz atabilirsiniz.',version:'Sürüm',contactDev:'Soru ve katkı',privacy:'Gizlilik Politikası',rateApp:'Play Store\u0027da Değerlendir',supportDev:'GitHub Proje Sayfası',kwhHint:'Örn. 45,27',distFromOdo:'Mesafe kaynağı: kilometre sayacı (araç bilgilerinden)',distFromRecords:'Mesafe kaynağı: kayıtlardaki sürüş mesafeleri',back:'← Geri',changeCar:'Aracı değiştir',navVehicle:'Aracım',vehicleTitle:'Aracım',odoAsk:'Aracın güncel kilometresi (sayaç)',odometer:'Kilometre sayacı',odoNow:'Araç sayacı',odoTracked:'Başlangıçtan beri yapılan',odoPrompt:'Güncel sayaç ({u}):',odoStartPrompt:'Başlangıç/alım sayacı ({u}):',odoSaved:'Kilometre güncellendi',theme:'Görünüm',themeLight:'Açık',themeDark:'Koyu',spendChart:'Harcama grafiği',cumTitle:'Bugüne kadar: aynı km yakıtlıyla gidilseydi',totalDist:'Toplam mesafe',evSpent:'EV toplam (net)',iceWould:'Yakıtlıyla olurdu',totalSaved:'Toplam kazanç',evLine:'EV (gerçek)',iceLine:'Yakıtlı (aynı km)',archived:'Arşiv (satılan/kullanılmayan)',archivedTag:'arşivde — kayıtları korunuyor',archivedToast:'Araç arşive taşındı, kayıtları korunuyor',restore:'Geri al',newBank:'+ Yeni banka ekle…',newBankPrompt:'Banka adı:',importAllDup:'Bu yedekteki tüm kayıtlar zaten mevcut — hiçbir şey eklenmedi.',importPartial:'{n} yeni kayıt eklendi, {d} mükerrer atlandı',netPaid:'Ödenen (net)',typeSplit:'Şarj tipi dağılımı (kWh)',detailStats:'Detay istatistikler',avgDuration:'Ort. şarj süresi',avgSocRange:'Ort. şarj aralığı',topBanks:'Bankalar (indirim kazancı)',topLocations:'En çok şarj edilen lokasyonlar',bankCountries:'Banka Ülkelerim',bankCountriesD:'Kartların hangi ülkelerden ise seç — formdaki banka listesi bunlara göre gelir. Şarj ettiğin ülke değişse de bankaların değişmez.',addCountry:'+ Ülke ekle',prevPeriod:'önceki döneme göre',navHome:'Ana Sayfa',navHistory:'Geçmiş',navCompare:'Kıyasla',navSettings:'Ayarlar',
week:'Hafta',month:'Ay',year:'Yıl',
periodWeek:'Bu hafta toplam',periodMonth:'Bu ay toplam',periodYear:'Bu yıl toplam',
savings:'tasarruf',avgPerKwh:'kWh başı',netLbl:'net',grossLbl:'indirimsiz',
grossTotal:'İndirimsiz toplam',cost100:'100 {u}',
totalKwhP:'Enerji (kWh)',sessionsCompanies:'Şarj / Firma',totalDiscP:'Alınan indirim',
freeCount:'Ücretsiz şarj',weeklySpend:'Haftalık harcama',monthlyTotals:'Aylık Harcama',
firmDist:'Firma dağılımı',recentCharges:'Son şarjlar',viewAll:'Tümü',allVehicles:'Tüm araçlar',
historyTitle:'Geçmiş',allYears:'Tüm yıllar',allFirms:'Tüm firmalar',allTypes:'Tüm tipler',free:'Ücretsiz',
compareTitle:'Yakıtlı Araçla Kıyasla',fuelType:'Diğer aracın yakıt tipi',
petrol:'Benzin',diesel:'Dizel',hybrid:'Hibrit',
hybridNote:'Şarj edilmeyen (tam) hibrit de lt/100km ile ölçülür — sadece tüketimi düşüktür (~4-5 lt). Şarjlı hibrit (PHEV) için ortalama karma tüketimi gir.',
fuelPrice:'Yakıt fiyatı ({s}/lt)',fuelCons:'Tüketim (lt/100km)',calc:'Kıyasla',
evCost:'EV 100 {u} (net)',evCostG:'EV 100 {u} (indirimsiz)',iceCost:'Yakıtlı 100 {u}',
discEffect:'İndirim etkisi / 100 {u}',perUnitSaving:'{u} başına kazanç',
per100:'100 {u} başına {v} kazanç',savingByMonth:'Aylara göre kazanç',
compareNote:'Grafik, kayıtlardaki sürüş mesafesine göre aynı yolu yakıtlı araçla gitseydin aradaki farkı gösterir. Mesafe girilmiş kayıtlar hesaba katılır; kazanç net ödenen üzerinden hesaplanır.',
needData:'Hesap için mesafe girilmiş şarj kaydı gerekli',
settingsTitle:'Ayarlar',regionSection:'Ülke ve Bölge',country:'Ülke',currency:'Para Birimi',
unit:'Mesafe Birimi',language:'Dil',vehicles:'Araçlarım',addVehicle:'+ Araç ekle',
defaultHint:'★ varsayılan · km✎ kilometre · 📷 fotoğraf · × arşivle',
formSection:'Kayıt Formu',advAlways:'Gelişmiş alanlar hep açık',
advAlwaysD:'Banka, süre, lokasyon ve şarj aralığı formda açık gelsin',
dataSection:'Veri',exportJson:'Dışa Aktar (JSON)',exportCsv:'Dışa Aktar (CSV — Excel/Power BI)',
importJson:'Yedeği Geri Yükle (JSON)',reset:'Verileri Sıfırla',about:'Hakkında',
aboutText:'WattTrack tamamen ücretsizdir ve reklam içermez. Tüm verileriniz yalnızca bu cihazda saklanır; hiçbir sunucuya gönderilmez, üçüncü kişilerle paylaşılmaz ve satılmaz. Hesap/üyelik yoktur. Tek ağ kullanımı: yurt dışı kayıtlarda döviz kuru (yalnız para birimi kodları) ve 📍 kullanınca konum servisleri. Cihazlar arası taşıma için JSON yedeğini kullanın.',
addTitle:'Yeni Şarj Kaydı',editTitle:'Kaydı Düzenle',date:'Tarih',chargeType:'Şarj Tipi',
company:'Ev-İş ya da Şarj Firması',homeChip:'Ev-İş',other:'Diğer…',kwh:'Enerji (kWh)',
distance:'Sürülen mesafe ({u})',
freeCharge:'Ücretsiz şarj',freeChargeD:'Kampanya, ev güneş vb. — tutar 0 kaydedilir',
amount:'Tutar — indirim öncesi ({s})',discountType:'İndirim Türü',amountType:'Tutar',percentType:'Yüzde (%)',
bank:'Banka',vehicle:'Araç',advanced:'+ Gelişmiş',advancedHide:'− Gelişmişi gizle',
duration:'Şarj süresi',hours:'saat',minutes:'dakika',location:'Lokasyon',
socRange:'Şarj aralığı % (başlangıç → bitiş)',note:'Not',
rateLbl:'Kur (1 {f} = ? {b})',
rateNote:'Yurt dışı harcama, girilen kurla {b} cinsine çevrilerek istatistiklere katılır. Kur bulunamazsa elle gir.',
rateAuto:'Kur otomatik alındı ({d})',rateNeeded:'Yurt dışı kayıt için kur gerekli',
gpsFail:'Konum alınamadı — izin verildiğinden emin ol',
formError:'Firma, kWh ve tutar gerekli',save:'Kaydet',
deleteAsk:'Bu kayıt silinsin mi?',deleted:'Kayıt silindi',saved:'Kayıt eklendi',updated:'Kayıt güncellendi',
obWelcome:'Hoş geldin!',obCountryQ:'Hangi ülkede şarj oluyorsun? Para birimi ve mesafe birimini buna göre ayarlayalım.',
obCarQ:'Aracını seç',obCarSub:'Marka veya model yaz — yıl ve donanıma göre farklı batarya sürümlerini ayırt et.',
searchCar:'ör. Model Y, Togg, Torres…',continue:'Devam',skip:'Atla',start:'Başla',
battery:'Batarya',arch:'Mimari',dcMax:'Maks DC',acMax:'AC',range:'Menzil (WLTP)',
addPhoto:'📷 Fotoğraf ekle',changePhoto:'📷 Fotoğrafı değiştir',
customAdd:'"{q}" adıyla özel araç ekle',vehicleAdded:'Araç eklendi',photoAdded:'Fotoğraf eklendi',add:'Ekle',
wipeAsk1:'TÜM kayıtlar, araçlar ve ayarlar silinecek. Emin misin?',wipeAsk2:'Geri alınamaz. Silinsin mi?',
wiped:'Tüm veriler silindi',imported:'Yedek geri yüklendi',
importFail:'Dosya geçerli bir WattTrack yedeği değil',importAsk:'kayıt içe aktarılacak. Birleştirilsin mi?',
jsonDone:'JSON yedek indirildi',csvDone:'CSV indirildi',noData:'Henüz kayıt yok',numRange:'{f} {min} ile {max} arasında olmalı',socOrder:'Bitiş şarj yüzdesi başlangıçtan büyük olmalı',fldKwh:'Enerji (kWh)',fldAmount:'Ödenen tutar',fldDisc:'İndirim',fldRate:'Kur',fldDist:'Sürülen mesafe',fldOdo:'Kilometre sayacı',fldDurH:'Şarj süresi (saat)',fldDurM:'Şarj süresi (dakika)',fldSoc:'Şarj yüzdesi',fldUnitPrice:'kWh birim fiyatı',badDataFound:'{n} kayıtta geçersiz değer var',showLbl:'Göster',dismissLbl:'Kapat',dateNeeded:'Geçerli bir tarih gir',futureDate:'İleri tarihli kayıt giriyorsun',restoreSettingsAsk:'Yedekteki ayarlar (dil, para birimi, ülke, tema) da geri yüklensin mi?',delVehTitle:'Ne yapmak istersin?',delVehMsg:'Bu araca ait {n} şarj kaydı ve {e} gider var.',delVehAll:'Kayıtları da sil',delVehArchive:'Kayıtları koru, aracı arşivle',delVehMove:'Kayıtları başka araca taşı',delVehAllConfirm:'{n} şarj kaydı ve {e} gider kalıcı olarak silinecek. Bu geri alınamaz. Devam edilsin mi?',moveTitle:'Kayıtları taşı',moveRecords:'⇄ Kayıtları taşı',moveFrom:'Kaynak araç',moveTo:'Hedef araç',moveRange:'Tarih aralığı (isteğe bağlı)',movePreview:'{n} şarj kaydı ve {e} gider taşınacak',moveDone:'{n} kayıt taşındı',moveUndone:'Taşıma geri alındı',noOtherVehicle:'Taşınacak başka araç yok',orphanWarn:'{n} kayıt silinmiş bir araca bağlı',orphanAssign:'Bir araca ata',orphanDelete:'Kayıtları sil',archivedCount:'arşivde · {n} kayıt',cancelLbl:'Vazgeç',fxMissing:'{n} kayıt kur bilgisi olmadığı için toplamlara dahil edilmedi',fxFix:'Düzelt',fxNoAuto:'Bu para birimi için otomatik kur yok, elle gir',saveFailed:'Kaydedilemedi — değişiklik cihaza yazılmadı',quotaFull:'Cihaz depolaması dolu. Ayarlar → Dışa Aktar ile yedek al, sonra eski kayıtları temizle.',savedLocal:'Cihaza kaydedildi',storageLbl:'Depolama',storagePersist:'kalıcı — tarayıcı verilerini kendiliğinden silmez',storageBest:'geçici — yer daralırsa tarayıcı verileri silebilir, düzenli yedek al',discardAsk:'Girdiklerin kaybolacak. Kapatılsın mı?',navMain:'Ana menü',socStart:'Başlangıç şarj yüzdesi',socEnd:'Bitiş şarj yüzdesi',allRecordsNote:'tüm kayıtlar',scopeAllTime:'tüm zamanlar',distFromOdoAll:'Kilometre sayacından, tüm zamanlar — dönemde yeterli sürüş mesafesi yok',periodLbl:'Dönem: {p}',chartTrendNote:'seyir',vehNeeded:'Gider için bir araç seç',noVehYet:'Gider eklemek için önce bir araç ekle',expOrphanFix:'{n} gider hiçbir araca bağlı değildi, varsayılan araca atandı',inclArchived:'Arşivdeki araçların giderlerini de dahil et',tcoVehNote:'Dahil edilen araçlar: {v}',placeSplit:'Şarj yeri dağılımı (kWh)',placeFirm:'Şarj firması',homeKwhPrice:'Ev/İş elektrik birim fiyatı (kWh başına)',homeKwhPriceD:'Vergiler dahil tek bir kWh fiyatı yeter. Ev-İş şarjlarında tutar bundan hesaplanır.',amountFromPrice:'Tutar kWh birim fiyatından hesaplandı',amountManual:'Tutarı elle yazdın — birim fiyat kullanılmıyor',odoOrDist:'veya sayaç değeri',odoBothErr:'Mesafe ya da sayaç değerinden yalnız birini gir',odoRange:'Sayaç değeri {a} ile {b} arasında olmalı ({da} ve {db} kayıtları)',odoMin:'Sayaç değeri {a} değerinden küçük olamaz ({da} kaydı)',odoMax:'Sayaç değeri {b} değerinden büyük olamaz ({db} kaydı)',odoBelowStart:'Sayaç değeri aracın başlangıç sayacından ({a}) küçük olamaz',odoFromRecords:'kayıtlardaki en son sayaç değerinden',odoFromManual:'elle girilen değerden',odoFirstNote:'İlk sayaç kaydı — kıyas noktası olmadığı için mesafe hesaplanmadı',missedLog:'Bu şarjdan öncekini girmeyi unuttum',missedLogD:'İşaretlersen bu kaydın mesafesi tüketim ve km maliyeti ortalamalarına katılmaz; harcama ve enerji toplamlarına katılmaya devam eder.',missedAsk:'Bu aralıkta girilmemiş bir şarj var mı? Aynı enerjiyle alışılmadık kadar çok yol gidilmiş görünüyor.',missedTag:'Öncesi girilmemiş şarj',chartNoDist:'Kayıtlarda sürüş mesafesi olmadığı için zaman içindeki seyir gösterilemiyor. Toplam rakamlar kilometre sayacından hesaplandı.',sessions:'şarj'},

en:{navStats:'Stats',statsTitle:'Statistics',ice1:'Fuel per 1 {u}',unitCostTitle:'Unit cost — EV and fuel side by side',tcoExpEv:'EV fixed expenses (My Vehicle)',tcoExpIce:'Fuel car fixed cost (prorated)',tco1kmIce:'Fuel per 1 {u} (with expenses)',tcoExplain:'EV fixed expenses are the tax, insurance and maintenance items you entered in My Vehicle. On the fuel side, the yearly fixed cost you entered above is prorated to the tracked period — both cars are compared over the same period.',totalCostAll:'Total cost (charging + fixed)',fixedExpTotal:'Fixed expenses total',expChart:'Fixed expense chart',prorateLbl:'Prorate yearly expenses (tax, insurance) to the tracked period',prorateNote:'Yearly items counted at {p}% of the period; actually paid in total {r}.',exp_tax:'Tax',exp_insurance:'Insurance',exp_maintenance:'Maintenance / Service',exp_tire:'Tires',exp_inspection:'Inspection',exp_repair:'Repair / Damage',exp_parking:'Parking / Tolls',exp_equipment:'Equipment (home charger etc.)',exp_other:'Other',otherTypePh:'Type a title — e.g. Accessories, Car wash',addExpense:'Add expense',editExpense:'Edit expense',expType:'Expense type',expenses:'Vehicle expenses',expByCat:'Expenses by category',expTotal:'Total expenses',expAmount:'Amount',noteLbl:'Note',amountNeeded:'Enter an amount',noExpenses:'No expenses yet. Add tax, insurance and maintenance to see your true cost.',tcoTitle:'Total cost of ownership (charging + expenses)',tcoEv:'EV total (charging + expenses)',tcoIce:'Fuel car total (with expenses)',tcoSaved:'Total saved incl. expenses',tco1km:'EV per 1 {u} (with expenses)',tcoNote:'Tracked period {d} days. Fixed cost of the fuel car prorated for this period: {f}.',nonFuelTitle:'Non-fuel expense comparison',nonFuelKm:'Non-fuel cost per {u}',nonFuel100:'Non-fuel cost per 100 {u}',nonFuelYear:'Yearly non-fuel cost',nonFuelKwh:'Non-fuel cost per kWh',nonFuelDiffYear:'Yearly non-fuel cost difference',nonFuelChart:'Yearly non-fuel cost (EV / Fuel)',iceShort:'Fuel',chargePower:'Avg charging power',yearlyCompare:'Yearly comparison',yearlySpendLbl:'Total spend (this year)',yearlyKwhLbl:'Energy (this year)',yearlyPriceLbl:'Price per kWh (this year)',weekdayDist:'By day of week',vsLastYear:'vs last year',iceFixHint:'Optional. Enter the yearly tax, insurance and maintenance total of a comparable fuel car for a fair comparison.',ev1:'EV per 1 {u} ({x})',supportNote:'This app is developed completely free and ad-free. If you would like to support the project or buy a coffee, feel free to visit our GitHub page.',version:'Version',contactDev:'Questions & contributions',privacy:'Privacy Policy',rateApp:'Rate on Play Store',supportDev:'GitHub Project Page',kwhHint:'e.g. 45,27',distFromOdo:'Distance source: odometer (from vehicle info)',distFromRecords:'Distance source: per-record distances',back:'← Back',changeCar:'Change vehicle',navVehicle:'My Vehicle',vehicleTitle:'My Vehicle',odoAsk:'Current odometer reading',odometer:'Odometer',odoNow:'Odometer',odoTracked:'Driven since start',odoPrompt:'Current odometer ({u}):',odoStartPrompt:'Starting/purchase odometer ({u}):',odoSaved:'Odometer updated',theme:'Appearance',themeLight:'Light',themeDark:'Dark',spendChart:'Spending chart',cumTitle:'To date: same km with a fuel car',totalDist:'Total distance',evSpent:'EV total (net)',iceWould:'Would cost (fuel)',totalSaved:'Total saved',evLine:'EV (actual)',iceLine:'Fuel (same km)',archived:'Archive (sold/unused)',archivedTag:'archived — records kept',archivedToast:'Vehicle archived, its records are kept',restore:'Restore',newBank:'+ Add new bank…',newBankPrompt:'Bank name:',importAllDup:'All records in this backup already exist — nothing was added.',importPartial:'{n} new records added, {d} duplicates skipped',netPaid:'Paid (net)',typeSplit:'Charge type split (kWh)',detailStats:'Detail statistics',avgDuration:'Avg charge time',avgSocRange:'Avg SoC range',topBanks:'Banks (discount savings)',topLocations:'Most charged locations',bankCountries:'My Bank Countries',bankCountriesD:'Pick the countries your cards are from — the bank list in the form follows these. Your banks don’t change when the charging country does.',addCountry:'+ Add country',prevPeriod:'vs previous period',navHome:'Home',navHistory:'History',navCompare:'Compare',navSettings:'Settings',
week:'Week',month:'Month',year:'Year',
periodWeek:'This week total',periodMonth:'This month total',periodYear:'This year total',
savings:'saved',avgPerKwh:'Per kWh',netLbl:'net',grossLbl:'w/o discount',
grossTotal:'Total before discounts',cost100:'Per 100 {u}',
totalKwhP:'Energy (kWh)',sessionsCompanies:'Sessions / Companies',totalDiscP:'Discounts received',
freeCount:'Free charges',weeklySpend:'Weekly spend',monthlyTotals:'Monthly Spend',
firmDist:'By company',recentCharges:'Recent charges',viewAll:'View all',allVehicles:'All vehicles',
historyTitle:'History',allYears:'All years',allFirms:'All companies',allTypes:'All types',free:'Free',
compareTitle:'Compare vs Fuel Car',fuelType:'Other car fuel type',
petrol:'Petrol',diesel:'Diesel',hybrid:'Hybrid',
hybridNote:'A full (non-plug-in) hybrid is also measured in L/100km — it simply uses less (~4-5 L). For a PHEV, enter your average combined consumption.',
fuelPrice:'Fuel price ({s}/L)',fuelCons:'Consumption (L/100km)',calc:'Compare',
evCost:'EV per 100 {u} (net)',evCostG:'EV per 100 {u} (gross)',iceCost:'Fuel per 100 {u}',
discEffect:'Discount effect / 100 {u}',perUnitSaving:'Saving per {u}',
per100:'{v} saved per 100 {u}',savingByMonth:'Savings by month',
compareNote:'The chart shows savings vs driving the same recorded distance in a fuel car. Records with distance are used; savings use net paid amounts.',
needData:'Add charges with distance to calculate',
settingsTitle:'Settings',regionSection:'Country & Region',country:'Country',currency:'Currency',
unit:'Distance Unit',language:'Language',vehicles:'My Vehicles',addVehicle:'+ Add vehicle',
defaultHint:'★ default · km✎ odometer · 📷 photo · × archive',
formSection:'Charge Form',advAlways:'Advanced fields always open',
advAlwaysD:'Bank, duration, location and SoC range shown by default',
dataSection:'Data',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Restore Backup (JSON)',reset:'Reset Data',about:'About',
aboutText:'WattTrack is completely free and ad-free. All your data stays on this device only; nothing is sent to any server, shared with third parties, or sold. No account needed. Only network use: exchange rates for foreign records (currency codes only) and location services when you tap 📍. Use the JSON backup to move data between devices.',
addTitle:'New Charge',editTitle:'Edit Charge',date:'Date',chargeType:'Charge Type',
company:'Home/Work or Charging Company',homeChip:'Home/Work',other:'Other…',kwh:'Energy (kWh)',
distance:'Distance driven ({u})',
freeCharge:'Free charge',freeChargeD:'Promo, home solar etc. — saved as 0',
amount:'Amount — before discount ({s})',discountType:'Discount Type',amountType:'Amount',percentType:'Percent (%)',
bank:'Bank',vehicle:'Vehicle',advanced:'+ Advanced',advancedHide:'− Hide advanced',
duration:'Charge time',hours:'hours',minutes:'minutes',location:'Location',
socRange:'SoC range % (start → end)',note:'Note',
rateLbl:'Rate (1 {f} = ? {b})',
rateNote:'Foreign spend is converted to {b} at the entered rate for statistics. Enter manually if not found.',
rateAuto:'Rate fetched automatically ({d})',rateNeeded:'Rate required for a foreign record',
gpsFail:'Could not get location — check permission',
formError:'Company, kWh and amount are required',save:'Save',
deleteAsk:'Delete this record?',deleted:'Record deleted',saved:'Charge saved',updated:'Charge updated',
obWelcome:'Welcome!',obCountryQ:'Where do you charge? We will set currency and distance unit accordingly.',
obCarQ:'Pick your car',obCarSub:'Type a brand or model — tell versions apart by year, trim and battery.',
searchCar:'e.g. Model Y, ID.4, Torres…',continue:'Continue',skip:'Skip',start:'Start',
battery:'Battery',arch:'Architecture',dcMax:'Max DC',acMax:'AC',range:'Range (WLTP)',
addPhoto:'📷 Add photo',changePhoto:'📷 Replace photo',
customAdd:'Add "{q}" as custom vehicle',vehicleAdded:'Vehicle added',photoAdded:'Photo added',add:'Add',
wipeAsk1:'ALL records, vehicles and settings will be deleted. Sure?',wipeAsk2:'Cannot be undone. Delete?',
wiped:'All data deleted',imported:'Backup restored',
importFail:'Not a valid WattTrack backup',importAsk:'records will be imported. Merge?',
jsonDone:'JSON backup downloaded',csvDone:'CSV downloaded',noData:'No records yet',numRange:'{f} must be between {min} and {max}',socOrder:'Ending charge percentage must be higher than the starting one',fldKwh:'Energy (kWh)',fldAmount:'Amount paid',fldDisc:'Discount',fldRate:'Exchange rate',fldDist:'Distance driven',fldOdo:'Odometer',fldDurH:'Charge time (hours)',fldDurM:'Charge time (minutes)',fldSoc:'Charge percentage',fldUnitPrice:'Price per kWh',badDataFound:'{n} records contain invalid values',showLbl:'Show',dismissLbl:'Dismiss',dateNeeded:'Enter a valid date',futureDate:'You are adding a future-dated record',restoreSettingsAsk:'Restore the settings from the backup too (language, currency, country, theme)?',delVehTitle:'What would you like to do?',delVehMsg:'This vehicle has {n} charging records and {e} expenses.',delVehAll:'Delete the records too',delVehArchive:'Keep the records, archive the vehicle',delVehMove:'Move the records to another vehicle',delVehAllConfirm:'{n} charging records and {e} expenses will be permanently deleted. This cannot be undone. Continue?',moveTitle:'Move records',moveRecords:'⇄ Move records',moveFrom:'Source vehicle',moveTo:'Target vehicle',moveRange:'Date range (optional)',movePreview:'{n} charging records and {e} expenses will be moved',moveDone:'{n} records moved',moveUndone:'Move undone',noOtherVehicle:'No other vehicle to move to',orphanWarn:'{n} records belong to a deleted vehicle',orphanAssign:'Assign to a vehicle',orphanDelete:'Delete the records',archivedCount:'archived · {n} records',cancelLbl:'Cancel',fxMissing:'{n} records were left out of the totals because no exchange rate is available',fxFix:'Fix',fxNoAuto:'No automatic rate for this currency — enter it manually',saveFailed:'Could not save — the change was not written to the device',quotaFull:'Device storage is full. Back up via Settings → Export, then remove old records.',savedLocal:'Saved on this device',storageLbl:'Storage',storagePersist:'persistent — the browser will not clear your data on its own',storageBest:'temporary — the browser may clear data if space runs low, back up regularly',discardAsk:'Your entries will be lost. Close anyway?',navMain:'Main menu',socStart:'Starting charge percentage',socEnd:'Ending charge percentage',allRecordsNote:'all records',scopeAllTime:'all time',distFromOdoAll:'From the odometer, all time — not enough distance recorded in this period',periodLbl:'Period: {p}',chartTrendNote:'trend',vehNeeded:'Select a vehicle for this expense',noVehYet:'Add a vehicle before adding expenses',expOrphanFix:'{n} expenses had no vehicle and were assigned to the default vehicle',inclArchived:'Include expenses of archived vehicles',tcoVehNote:'Vehicles included: {v}',placeSplit:'Charge location split (kWh)',placeFirm:'Charging company',homeKwhPrice:'Home/work electricity price (per kWh)',homeKwhPriceD:'A single all-in price per kWh is enough. Home/work charges use it to compute the amount.',amountFromPrice:'Amount computed from the price per kWh',amountManual:'You entered the amount manually — the unit price is not used',odoOrDist:'or odometer reading',odoBothErr:'Enter either the distance or the odometer reading, not both',odoRange:'The odometer reading must be between {a} and {b} (records of {da} and {db})',odoMin:'The odometer reading cannot be lower than {a} (record of {da})',odoMax:'The odometer reading cannot be higher than {b} (record of {db})',odoBelowStart:'The odometer reading cannot be lower than the vehicle\'s starting reading ({a})',odoFromRecords:'from the latest odometer reading in your records',odoFromManual:'from the value you entered manually',odoFirstNote:'First odometer record — no baseline yet, so no distance was derived',missedLog:'I forgot to log the charge before this one',missedLogD:'If checked, this record\'s distance is left out of consumption and cost-per-km averages; it still counts toward spending and energy totals.',missedAsk:'Is there an unlogged charge in this interval? This looks like unusually long distance for the energy used.',missedTag:'Preceding charge not logged',chartNoDist:'No per-record driving distance, so the trend over time cannot be shown. The totals above come from the odometer.',sessions:'sessions'},

de:{navStats:'Statistik',statsTitle:'Statistiken',ice1:'Verbrenner 1 {u}',unitCostTitle:'Kosten pro Einheit — EV und Verbrenner nebeneinander',tcoExpEv:'EV-Fixkosten (Mein Auto)',tcoExpIce:'Fixkosten Verbrenner (anteilig)',tco1kmIce:'Verbrenner 1 {u} (mit Kosten)',tcoExplain:'Die EV-Fixkosten sind die unter „Mein Auto" eingetragenen Posten (Steuer, Versicherung, Wartung). Beim Verbrenner werden die oben eingegebenen jährlichen Fixkosten anteilig auf den Zeitraum umgelegt — beide Autos werden über denselben Zeitraum verglichen.',totalCostAll:'Gesamtkosten (Laden + fix)',fixedExpTotal:'Fixkosten gesamt',expChart:'Fixkosten-Diagramm',prorateLbl:'Jährliche Kosten (Steuer, Versicherung) anteilig rechnen',prorateNote:'Jährliche Posten zu {p}% angerechnet; tatsächlich gezahlt {r}.',exp_tax:'Steuer',exp_insurance:'Versicherung',exp_maintenance:'Wartung / Service',exp_tire:'Reifen',exp_inspection:'Hauptuntersuchung',exp_repair:'Reparatur / Schaden',exp_parking:'Parken / Maut',exp_equipment:'Ausstattung (Wallbox usw.)',exp_other:'Sonstiges',otherTypePh:'Titel eingeben — z.B. Zubehör, Autowäsche',addExpense:'Ausgabe hinzufügen',editExpense:'Ausgabe bearbeiten',expType:'Ausgabenart',expenses:'Fahrzeugkosten',expByCat:'Kosten nach Kategorie',expTotal:'Kosten gesamt',expAmount:'Betrag',noteLbl:'Notiz',amountNeeded:'Betrag eingeben',noExpenses:'Noch keine Kosten. Steuer, Versicherung und Wartung eintragen für die echten Kosten.',tcoTitle:'Gesamtkosten (Laden + Fixkosten)',tcoEv:'EV gesamt (Laden + Kosten)',tcoIce:'Verbrenner gesamt (mit Kosten)',tcoSaved:'Gesamtersparnis inkl. Kosten',tco1km:'EV pro 1 {u} (mit Kosten)',tcoNote:'Zeitraum {d} Tage. Fixkosten des Verbrenners anteilig: {f}.',nonFuelTitle:'Vergleich Nebenkosten (ohne Kraftstoff)',nonFuelKm:'Nebenkosten pro {u}',nonFuel100:'Nebenkosten pro 100 {u}',nonFuelYear:'Jährliche Nebenkosten',nonFuelKwh:'Nebenkosten pro kWh',nonFuelDiffYear:'Jährliche Nebenkosten-Differenz',nonFuelChart:'Jährliche Nebenkosten (EV / Verbrenner)',iceShort:'Verbrenner',chargePower:'Ø Ladeleistung',yearlyCompare:'Jahresvergleich',yearlySpendLbl:'Gesamtausgaben (dieses Jahr)',yearlyKwhLbl:'Energie (dieses Jahr)',yearlyPriceLbl:'Preis pro kWh (dieses Jahr)',weekdayDist:'Nach Wochentag',vsLastYear:'ggü. Vorjahr',iceFixHint:'Optional. Jährliche Steuer, Versicherung und Wartung eines vergleichbaren Verbrenners eintragen.',ev1:'EV pro 1 {u} ({x})',supportNote:'Diese App ist völlig kostenlos und werbefrei. Wenn Sie das Projekt unterstützen möchten, besuchen Sie gern unsere GitHub-Seite.',version:'Version',contactDev:'Fragen & Beiträge',privacy:'Datenschutz',rateApp:'Im Play Store bewerten',supportDev:'GitHub-Projektseite',kwhHint:'z.B. 45,27',distFromOdo:'Distanzquelle: Kilometerstand (Fahrzeugdaten)',distFromRecords:'Distanzquelle: Distanzen der Einträge',back:'← Zurück',changeCar:'Fahrzeug ändern',navVehicle:'Mein Auto',vehicleTitle:'Mein Auto',odoAsk:'Aktueller Kilometerstand',odometer:'Kilometerstand',odoNow:'Tachostand',odoTracked:'Seit Beginn gefahren',odoPrompt:'Aktueller Stand ({u}):',odoStartPrompt:'Anfangs-/Kaufstand ({u}):',odoSaved:'Kilometerstand aktualisiert',theme:'Darstellung',themeLight:'Hell',themeDark:'Dunkel',spendChart:'Ausgabendiagramm',cumTitle:'Bisher: gleiche km mit Verbrenner',totalDist:'Gesamtstrecke',evSpent:'EV gesamt (netto)',iceWould:'Verbrenner-Kosten',totalSaved:'Gesamt gespart',evLine:'EV (real)',iceLine:'Verbrenner (gleiche km)',archived:'Archiv (verkauft/ungenutzt)',archivedTag:'archiviert — Einträge bleiben',archivedToast:'Fahrzeug archiviert, Einträge bleiben erhalten',restore:'Wiederherstellen',newBank:'+ Neue Bank…',newBankPrompt:'Bankname:',importAllDup:'Alle Einträge existieren bereits — nichts hinzugefügt.',importPartial:'{n} neue Einträge, {d} Duplikate übersprungen',netPaid:'Bezahlt (netto)',typeSplit:'Ladetyp-Verteilung (kWh)',detailStats:'Detail-Statistiken',avgDuration:'Ø Ladedauer',avgSocRange:'Ø Ladebereich',topBanks:'Banken (Rabattersparnis)',topLocations:'Häufigste Ladeorte',bankCountries:'Meine Bankländer',bankCountriesD:'Wähle die Länder deiner Karten — die Bankliste im Formular folgt diesen. Deine Banken ändern sich nicht mit dem Ladeland.',addCountry:'+ Land hinzufügen',prevPeriod:'ggü. Vorperiode',navHome:'Start',navHistory:'Verlauf',navCompare:'Vergleich',navSettings:'Einstellungen',
week:'Woche',month:'Monat',year:'Jahr',
periodWeek:'Diese Woche gesamt',periodMonth:'Dieser Monat gesamt',periodYear:'Dieses Jahr gesamt',
savings:'gespart',avgPerKwh:'Pro kWh',netLbl:'netto',grossLbl:'ohne Rabatt',
grossTotal:'Summe ohne Rabatte',cost100:'Pro 100 {u}',
totalKwhP:'Energie (kWh)',sessionsCompanies:'Ladungen / Anbieter',totalDiscP:'Erhaltene Rabatte',
freeCount:'Gratis-Ladungen',weeklySpend:'Wochenausgaben',monthlyTotals:'Monatsausgaben',
firmDist:'Nach Anbieter',recentCharges:'Letzte Ladungen',viewAll:'Alle',allVehicles:'Alle Fahrzeuge',
historyTitle:'Verlauf',allYears:'Alle Jahre',allFirms:'Alle Anbieter',allTypes:'Alle Typen',free:'Gratis',
compareTitle:'Vergleich mit Verbrenner',fuelType:'Kraftstoff des anderen Autos',
petrol:'Benzin',diesel:'Diesel',hybrid:'Hybrid',
hybridNote:'Auch ein Vollhybrid wird in L/100km gemessen — er verbraucht nur weniger (~4-5 L). Für PHEV den kombinierten Durchschnitt eingeben.',
fuelPrice:'Kraftstoffpreis ({s}/L)',fuelCons:'Verbrauch (L/100km)',calc:'Vergleichen',
evCost:'EV pro 100 {u} (netto)',evCostG:'EV pro 100 {u} (brutto)',iceCost:'Verbrenner 100 {u}',
discEffect:'Rabatteffekt / 100 {u}',perUnitSaving:'Ersparnis pro {u}',
per100:'{v} pro 100 {u} gespart',savingByMonth:'Ersparnis nach Monat',
compareNote:'Das Diagramm zeigt die Ersparnis gegenüber derselben Strecke mit einem Verbrenner. Einträge mit Distanz werden verwendet; netto berechnet.',
needData:'Ladungen mit Distanz erforderlich',
settingsTitle:'Einstellungen',regionSection:'Land & Region',country:'Land',currency:'Währung',
unit:'Entfernungseinheit',language:'Sprache',vehicles:'Meine Fahrzeuge',addVehicle:'+ Fahrzeug',
defaultHint:'★ Standard · km✎ Kilometerstand · 📷 Foto · × Archiv',
formSection:'Ladeformular',advAlways:'Erweiterte Felder immer offen',
advAlwaysD:'Bank, Dauer, Ort und Ladebereich standardmäßig anzeigen',
dataSection:'Daten',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Backup wiederherstellen (JSON)',reset:'Daten zurücksetzen',about:'Info',
aboutText:'WattTrack — alle Daten bleiben auf diesem Gerät. Kostenlos, werbefrei; Daten werden nicht mit Dritten geteilt. Einzige Ausnahme: für Auslandseinträge wird der Wechselkurs online abgerufen (nur Währungscodes werden übertragen).',
addTitle:'Neue Ladung',editTitle:'Ladung bearbeiten',date:'Datum',chargeType:'Ladetyp',
company:'Zuhause/Arbeit oder Ladeanbieter',homeChip:'Zuhause/Arbeit',other:'Andere…',kwh:'Energie (kWh)',
distance:'Gefahrene Strecke ({u})',
freeCharge:'Gratis-Ladung',freeChargeD:'Aktion, Solar usw. — als 0 gespeichert',
amount:'Betrag — vor Rabatt ({s})',discountType:'Rabattart',amountType:'Betrag',percentType:'Prozent (%)',
bank:'Bank',vehicle:'Fahrzeug',advanced:'+ Erweitert',advancedHide:'− Erweitert ausblenden',
duration:'Ladedauer',hours:'Std.',minutes:'Min.',location:'Ort',
socRange:'Ladebereich % (Start → Ende)',note:'Notiz',
rateLbl:'Kurs (1 {f} = ? {b})',
rateNote:'Auslandsausgaben werden zum eingegebenen Kurs in {b} umgerechnet. Bei Bedarf manuell eingeben.',
rateAuto:'Kurs automatisch geladen ({d})',rateNeeded:'Kurs für Auslandseintrag erforderlich',
gpsFail:'Standort nicht verfügbar — Berechtigung prüfen',
formError:'Anbieter, kWh und Betrag erforderlich',save:'Speichern',
deleteAsk:'Eintrag löschen?',deleted:'Eintrag gelöscht',saved:'Ladung gespeichert',updated:'Ladung aktualisiert',
obWelcome:'Willkommen!',obCountryQ:'Wo lädst du? Währung und Einheit werden entsprechend gesetzt.',
obCarQ:'Wähle dein Auto',obCarSub:'Marke oder Modell eingeben — Versionen nach Jahr und Akku unterscheiden.',
searchCar:'z.B. ID.4, EV6, Torres…',continue:'Weiter',skip:'Überspringen',start:'Los',
battery:'Akku',arch:'Architektur',dcMax:'Max DC',acMax:'AC',range:'Reichweite',
addPhoto:'📷 Foto hinzufügen',changePhoto:'📷 Foto ersetzen',
customAdd:'"{q}" als eigenes Fahrzeug',vehicleAdded:'Fahrzeug hinzugefügt',photoAdded:'Foto hinzugefügt',add:'Hinzufügen',
wipeAsk1:'ALLE Daten werden gelöscht. Sicher?',wipeAsk2:'Nicht rückgängig. Löschen?',
wiped:'Alle Daten gelöscht',imported:'Backup wiederhergestellt',
importFail:'Kein gültiges WattTrack-Backup',importAsk:'Einträge werden importiert. Zusammenführen?',
jsonDone:'JSON-Backup heruntergeladen',csvDone:'CSV heruntergeladen',noData:'Noch keine Einträge',numRange:'{f} muss zwischen {min} und {max} liegen',socOrder:'Der End-Ladestand muss höher als der Start-Ladestand sein',fldKwh:'Energie (kWh)',fldAmount:'Gezahlter Betrag',fldDisc:'Rabatt',fldRate:'Wechselkurs',fldDist:'Gefahrene Strecke',fldOdo:'Kilometerstand',fldDurH:'Ladedauer (Stunden)',fldDurM:'Ladedauer (Minuten)',fldSoc:'Ladestand',fldUnitPrice:'Preis pro kWh',badDataFound:'{n} Einträge enthalten ungültige Werte',showLbl:'Anzeigen',dismissLbl:'Schließen',dateNeeded:'Gültiges Datum eingeben',futureDate:'Du legst einen Eintrag mit zukünftigem Datum an',restoreSettingsAsk:'Auch die Einstellungen aus dem Backup wiederherstellen (Sprache, Währung, Land, Design)?',delVehTitle:'Was möchtest du tun?',delVehMsg:'Dieses Fahrzeug hat {n} Ladeeinträge und {e} Kosten.',delVehAll:'Einträge ebenfalls löschen',delVehArchive:'Einträge behalten, Fahrzeug archivieren',delVehMove:'Einträge auf ein anderes Fahrzeug verschieben',delVehAllConfirm:'{n} Ladeeinträge und {e} Kosten werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden. Fortfahren?',moveTitle:'Einträge verschieben',moveRecords:'⇄ Einträge verschieben',moveFrom:'Quellfahrzeug',moveTo:'Zielfahrzeug',moveRange:'Zeitraum (optional)',movePreview:'{n} Ladeeinträge und {e} Kosten werden verschoben',moveDone:'{n} Einträge verschoben',moveUndone:'Verschieben rückgängig gemacht',noOtherVehicle:'Kein anderes Fahrzeug vorhanden',orphanWarn:'{n} Einträge gehören zu einem gelöschten Fahrzeug',orphanAssign:'Einem Fahrzeug zuordnen',orphanDelete:'Einträge löschen',archivedCount:'archiviert · {n} Einträge',cancelLbl:'Abbrechen',fxMissing:'{n} Einträge wurden mangels Wechselkurs nicht in die Summen einbezogen',fxFix:'Korrigieren',fxNoAuto:'Für diese Währung gibt es keinen automatischen Kurs — bitte manuell eingeben',saveFailed:'Speichern fehlgeschlagen — die Änderung wurde nicht gespeichert',quotaFull:'Gerätespeicher ist voll. Sichere über Einstellungen → Exportieren und lösche alte Einträge.',savedLocal:'Auf dem Gerät gespeichert',storageLbl:'Speicher',storagePersist:'dauerhaft — der Browser löscht deine Daten nicht von selbst',storageBest:'temporär — bei Platzmangel kann der Browser Daten löschen, regelmäßig sichern',discardAsk:'Deine Eingaben gehen verloren. Trotzdem schließen?',navMain:'Hauptmenü',socStart:'Ladestand am Anfang',socEnd:'Ladestand am Ende',allRecordsNote:'alle Einträge',scopeAllTime:'gesamter Zeitraum',distFromOdoAll:'Aus dem Kilometerstand, gesamter Zeitraum — im Zeitraum zu wenig Strecke erfasst',periodLbl:'Zeitraum: {p}',chartTrendNote:'Verlauf',vehNeeded:'Wähle ein Fahrzeug für diese Kosten',noVehYet:'Füge zuerst ein Fahrzeug hinzu, um Kosten zu erfassen',expOrphanFix:'{n} Kosten hatten kein Fahrzeug und wurden dem Standardfahrzeug zugeordnet',inclArchived:'Kosten archivierter Fahrzeuge einbeziehen',tcoVehNote:'Einbezogene Fahrzeuge: {v}',placeSplit:'Ladeort-Verteilung (kWh)',placeFirm:'Ladeanbieter',homeKwhPrice:'Strompreis Zuhause/Arbeit (pro kWh)',homeKwhPriceD:'Ein einziger Gesamtpreis pro kWh genügt. Ladungen zuhause/bei der Arbeit rechnen damit.',amountFromPrice:'Betrag aus dem kWh-Preis berechnet',amountManual:'Betrag manuell eingegeben — der Einzelpreis wird nicht verwendet',odoOrDist:'oder Kilometerstand',odoBothErr:'Gib entweder die Strecke oder den Kilometerstand ein, nicht beides',odoRange:'Der Kilometerstand muss zwischen {a} und {b} liegen (Einträge {da} und {db})',odoMin:'Der Kilometerstand darf nicht unter {a} liegen (Eintrag {da})',odoMax:'Der Kilometerstand darf nicht über {b} liegen (Eintrag {db})',odoBelowStart:'Der Kilometerstand darf nicht unter dem Anfangsstand des Fahrzeugs ({a}) liegen',odoFromRecords:'aus dem letzten Kilometerstand in den Einträgen',odoFromManual:'aus dem manuell eingegebenen Wert',odoFirstNote:'Erster Kilometerstand-Eintrag — ohne Bezugspunkt keine Strecke berechnet',missedLog:'Ich habe die Ladung davor nicht eingetragen',missedLogD:'Wenn aktiviert, fließt die Strecke dieses Eintrags nicht in Verbrauchs- und Kosten-pro-km-Mittelwerte ein; Ausgaben und Energie zählen weiter.',missedAsk:'Fehlt in diesem Zeitraum eine Ladung? Für die verbrauchte Energie wirkt die Strecke ungewöhnlich lang.',missedTag:'Vorherige Ladung nicht erfasst',chartNoDist:'Ohne Strecke je Eintrag lässt sich der Verlauf nicht darstellen. Die Summen oben stammen vom Kilometerstand.',sessions:'Ladungen'},

fr:{navStats:'Stats',statsTitle:'Statistiques',ice1:'Thermique 1 {u}',unitCostTitle:'Coût unitaire — VE et thermique côte à côte',tcoExpEv:'Frais fixes VE (Mon véhicule)',tcoExpIce:'Frais fixes thermique (au prorata)',tco1kmIce:'Thermique 1 {u} (avec dépenses)',tcoExplain:'Les frais fixes VE sont les postes (taxe, assurance, entretien) saisis dans Mon véhicule. Côté thermique, les frais fixes annuels saisis ci-dessus sont proratisés sur la période suivie — les deux voitures sont comparées sur la même période.',totalCostAll:'Coût total (recharge + fixes)',fixedExpTotal:'Total frais fixes',expChart:'Graphique des frais fixes',prorateLbl:'Proratiser les frais annuels (taxe, assurance) sur la période',prorateNote:'Postes annuels comptés à {p}% ; total réellement payé {r}.',exp_tax:'Taxe',exp_insurance:'Assurance',exp_maintenance:'Entretien / Révision',exp_tire:'Pneus',exp_inspection:'Contrôle technique',exp_repair:'Réparation',exp_parking:'Parking / Péage',exp_equipment:'Équipement (borne, etc.)',exp_other:'Autre',otherTypePh:'Saisir un titre — ex. Accessoires, Lavage',addExpense:'Ajouter une dépense',editExpense:'Modifier la dépense',expType:'Type de dépense',expenses:'Dépenses du véhicule',expByCat:'Dépenses par catégorie',expTotal:'Total des dépenses',expAmount:'Montant',noteLbl:'Note',amountNeeded:'Saisir un montant',noExpenses:'Aucune dépense. Ajoutez taxe, assurance et entretien pour voir le coût réel.',tcoTitle:'Coût total de possession (recharge + dépenses)',tcoEv:'VE total (recharge + dépenses)',tcoIce:'Thermique total (avec dépenses)',tcoSaved:'Économie totale avec dépenses',tco1km:'VE / 1 {u} (avec dépenses)',tcoNote:'Période suivie {d} jours. Coûts fixes du thermique au prorata : {f}.',nonFuelTitle:'Comparaison des frais hors carburant',nonFuelKm:'Frais hors carburant par {u}',nonFuel100:'Frais hors carburant par 100 {u}',nonFuelYear:'Frais hors carburant annuels',nonFuelKwh:'Frais hors carburant par kWh',nonFuelDiffYear:'Différence annuelle des frais hors carburant',nonFuelChart:'Frais hors carburant annuels (VE / Thermique)',iceShort:'Thermique',chargePower:'Puissance moy. de charge',yearlyCompare:'Comparaison annuelle',yearlySpendLbl:'Dépenses totales (cette année)',yearlyKwhLbl:'Énergie (cette année)',yearlyPriceLbl:'Prix au kWh (cette année)',weekdayDist:'Par jour de la semaine',vsLastYear:'vs année précédente',iceFixHint:'Facultatif. Indiquez le total annuel taxe, assurance et entretien d une voiture thermique comparable.',ev1:'VE / 1 {u} ({x})',supportNote:'Cette application est entièrement gratuite et sans publicité. Pour soutenir le projet, visitez notre page GitHub.',version:'Version',contactDev:'Questions et contributions',privacy:'Confidentialité',rateApp:'Noter sur le Play Store',supportDev:'Page GitHub du projet',kwhHint:'ex. 45,27',distFromOdo:'Source distance : compteur (infos véhicule)',distFromRecords:'Source distance : distances des charges',back:'← Retour',changeCar:'Changer de véhicule',navVehicle:'Mon véhicule',vehicleTitle:'Mon véhicule',odoAsk:'Kilométrage actuel',odometer:'Compteur',odoNow:'Compteur',odoTracked:'Parcourus depuis le début',odoPrompt:'Compteur actuel ({u}) :',odoStartPrompt:'Compteur initial ({u}) :',odoSaved:'Compteur mis à jour',theme:'Apparence',themeLight:'Clair',themeDark:'Sombre',spendChart:'Graphique des dépenses',cumTitle:'À ce jour : mêmes km en thermique',totalDist:'Distance totale',evSpent:'VE total (net)',iceWould:'Coût thermique',totalSaved:'Économie totale',evLine:'VE (réel)',iceLine:'Thermique (mêmes km)',archived:'Archive (vendu/inutilisé)',archivedTag:'archivé — charges conservées',archivedToast:'Véhicule archivé, ses charges sont conservées',restore:'Restaurer',newBank:'+ Nouvelle banque…',newBankPrompt:'Nom de la banque :',importAllDup:'Toutes les charges existent déjà — rien ajouté.',importPartial:'{n} nouvelles charges, {d} doublons ignorés',netPaid:'Payé (net)',typeSplit:'Répartition par type (kWh)',detailStats:'Statistiques détaillées',avgDuration:'Durée moy.',avgSocRange:'Plage moy.',topBanks:'Banques (gains remises)',topLocations:'Lieux les plus utilisés',bankCountries:'Mes pays bancaires',bankCountriesD:'Choisissez les pays de vos cartes — la liste des banques suit ces pays. Vos banques ne changent pas avec le pays de charge.',addCountry:'+ Ajouter un pays',prevPeriod:'vs période précédente',navHome:'Accueil',navHistory:'Historique',navCompare:'Comparer',navSettings:'Réglages',
week:'Semaine',month:'Mois',year:'Année',
periodWeek:'Total cette semaine',periodMonth:'Total ce mois',periodYear:'Total cette année',
savings:'économisé',avgPerKwh:'Par kWh',netLbl:'net',grossLbl:'sans remise',
grossTotal:'Total sans remises',cost100:'Par 100 {u}',
totalKwhP:'Énergie (kWh)',sessionsCompanies:'Charges / Réseaux',totalDiscP:'Remises reçues',
freeCount:'Charges gratuites',weeklySpend:'Dépenses hebdo',monthlyTotals:'Dépenses mensuelles',
firmDist:'Par réseau',recentCharges:'Charges récentes',viewAll:'Tout',allVehicles:'Tous véhicules',
historyTitle:'Historique',allYears:'Toutes années',allFirms:'Tous réseaux',allTypes:'Tous types',free:'Gratuit',
compareTitle:'Comparer vs Thermique',fuelType:'Carburant de l’autre voiture',
petrol:'Essence',diesel:'Diesel',hybrid:'Hybride',
hybridNote:'Une hybride non rechargeable se mesure aussi en L/100km — elle consomme simplement moins (~4-5 L). Pour une PHEV, saisissez la conso mixte moyenne.',
fuelPrice:'Prix carburant ({s}/L)',fuelCons:'Conso (L/100km)',calc:'Comparer',
evCost:'VE / 100 {u} (net)',evCostG:'VE / 100 {u} (brut)',iceCost:'Thermique 100 {u}',
discEffect:'Effet remises / 100 {u}',perUnitSaving:'Économie par {u}',
per100:'{v} économisés / 100 {u}',savingByMonth:'Économies par mois',
compareNote:'Le graphique montre l’économie vs la même distance en thermique. Charges avec distance utilisées ; calcul sur montants nets.',
needData:'Ajoutez des charges avec distance',
settingsTitle:'Réglages',regionSection:'Pays et région',country:'Pays',currency:'Devise',
unit:'Unité de distance',language:'Langue',vehicles:'Mes véhicules',addVehicle:'+ Véhicule',
defaultHint:'★ défaut · km✎ compteur · 📷 photo · × archive',
formSection:'Formulaire',advAlways:'Champs avancés toujours ouverts',
advAlwaysD:'Banque, durée, lieu et plage de charge affichés par défaut',
dataSection:'Données',exportJson:'Exporter (JSON)',exportCsv:'Exporter (CSV — Excel/Power BI)',
importJson:'Restaurer (JSON)',reset:'Réinitialiser',about:'À propos',
aboutText:'WattTrack — vos données restent sur cet appareil. Gratuit, sans publicité ; données non partagées avec des tiers. Seule exception : le taux de change est récupéré en ligne pour les charges à l’étranger (seuls les codes devises sont transmis).',
addTitle:'Nouvelle charge',editTitle:'Modifier la charge',date:'Date',chargeType:'Type de charge',
company:'Domicile/Travail ou opérateur',homeChip:'Domicile/Travail',other:'Autre…',kwh:'Énergie (kWh)',
distance:'Distance parcourue ({u})',
freeCharge:'Charge gratuite',freeChargeD:'Promo, solaire… — enregistré à 0',
amount:'Montant — avant remise ({s})',discountType:'Type de remise',amountType:'Montant',percentType:'Pourcent (%)',
bank:'Banque',vehicle:'Véhicule',advanced:'+ Avancé',advancedHide:'− Masquer avancé',
duration:'Durée de charge',hours:'heures',minutes:'minutes',location:'Lieu',
socRange:'Plage de charge % (début → fin)',note:'Note',
rateLbl:'Taux (1 {f} = ? {b})',
rateNote:'Les dépenses à l’étranger sont converties en {b} au taux saisi. Saisir manuellement si introuvable.',
rateAuto:'Taux récupéré automatiquement ({d})',rateNeeded:'Taux requis pour une charge à l’étranger',
gpsFail:'Position indisponible — vérifiez l’autorisation',
formError:'Réseau, kWh et montant requis',save:'Enregistrer',
deleteAsk:'Supprimer cette charge ?',deleted:'Charge supprimée',saved:'Charge enregistrée',updated:'Charge modifiée',
obWelcome:'Bienvenue !',obCountryQ:'Où chargez-vous ? Devise et unité seront réglées en conséquence.',
obCarQ:'Choisissez votre voiture',obCarSub:'Tapez une marque ou un modèle — distinguez les versions par année et batterie.',
searchCar:'ex. Megane, ID.4, Torres…',continue:'Continuer',skip:'Passer',start:'Démarrer',
battery:'Batterie',arch:'Architecture',dcMax:'DC max',acMax:'AC',range:'Autonomie',
addPhoto:'📷 Ajouter une photo',changePhoto:'📷 Remplacer la photo',
customAdd:'Ajouter « {q} » en véhicule perso',vehicleAdded:'Véhicule ajouté',photoAdded:'Photo ajoutée',add:'Ajouter',
wipeAsk1:'TOUTES les données seront supprimées. Sûr ?',wipeAsk2:'Irréversible. Supprimer ?',
wiped:'Données supprimées',imported:'Sauvegarde restaurée',
importFail:'Sauvegarde WattTrack invalide',importAsk:'charges à importer. Fusionner ?',
jsonDone:'Sauvegarde JSON téléchargée',csvDone:'CSV téléchargé',noData:'Aucune charge',numRange:'{f} doit être compris entre {min} et {max}',socOrder:'Le pourcentage final doit être supérieur au pourcentage initial',fldKwh:'Énergie (kWh)',fldAmount:'Montant payé',fldDisc:'Remise',fldRate:'Taux de change',fldDist:'Distance parcourue',fldOdo:'Compteur',fldDurH:'Durée de charge (heures)',fldDurM:'Durée de charge (minutes)',fldSoc:'Pourcentage de charge',fldUnitPrice:'Prix par kWh',badDataFound:'{n} enregistrements contiennent des valeurs invalides',showLbl:'Afficher',dismissLbl:'Fermer',dateNeeded:'Saisir une date valide',futureDate:'Vous ajoutez un enregistrement daté dans le futur',restoreSettingsAsk:'Restaurer aussi les réglages de la sauvegarde (langue, devise, pays, thème) ?',delVehTitle:'Que voulez-vous faire ?',delVehMsg:'Ce véhicule a {n} charges et {e} dépenses.',delVehAll:'Supprimer aussi les enregistrements',delVehArchive:'Conserver les enregistrements, archiver le véhicule',delVehMove:'Déplacer les enregistrements vers un autre véhicule',delVehAllConfirm:'{n} charges et {e} dépenses seront définitivement supprimées. Action irréversible. Continuer ?',moveTitle:'Déplacer les enregistrements',moveRecords:'⇄ Déplacer',moveFrom:'Véhicule source',moveTo:'Véhicule cible',moveRange:'Période (facultatif)',movePreview:'{n} charges et {e} dépenses seront déplacées',moveDone:'{n} enregistrements déplacés',moveUndone:'Déplacement annulé',noOtherVehicle:'Aucun autre véhicule disponible',orphanWarn:'{n} enregistrements sont liés à un véhicule supprimé',orphanAssign:'Affecter à un véhicule',orphanDelete:'Supprimer les enregistrements',archivedCount:'archivé · {n} enregistrements',cancelLbl:'Annuler',fxMissing:'{n} enregistrements sont exclus des totaux faute de taux de change',fxFix:'Corriger',fxNoAuto:'Pas de taux automatique pour cette devise — saisissez-le manuellement',saveFailed:'Échec de l\'enregistrement — la modification n\'a pas été écrite',quotaFull:'Stockage plein. Sauvegardez via Réglages → Exporter, puis supprimez d\'anciens enregistrements.',savedLocal:'Enregistré sur l\'appareil',storageLbl:'Stockage',storagePersist:'persistant — le navigateur n\'effacera pas vos données',storageBest:'temporaire — le navigateur peut effacer les données si l\'espace manque, sauvegardez régulièrement',discardAsk:'Vos saisies seront perdues. Fermer quand même ?',navMain:'Menu principal',socStart:'Pourcentage de charge initial',socEnd:'Pourcentage de charge final',allRecordsNote:'tous les enregistrements',scopeAllTime:'toute la période',distFromOdoAll:'D\'après le compteur, toute la période — distance insuffisante sur la période',periodLbl:'Période : {p}',chartTrendNote:'évolution',vehNeeded:'Sélectionnez un véhicule pour cette dépense',noVehYet:'Ajoutez d\'abord un véhicule pour saisir des dépenses',expOrphanFix:'{n} dépenses sans véhicule ont été affectées au véhicule par défaut',inclArchived:'Inclure les dépenses des véhicules archivés',tcoVehNote:'Véhicules inclus : {v}',placeSplit:'Répartition par lieu (kWh)',placeFirm:'Opérateur',homeKwhPrice:'Prix de l\'électricité domicile/travail (par kWh)',homeKwhPriceD:'Un seul prix tout compris par kWh suffit. Les charges domicile/travail l\'utilisent.',amountFromPrice:'Montant calculé à partir du prix par kWh',amountManual:'Montant saisi manuellement — le prix unitaire n\'est pas utilisé',odoOrDist:'ou relevé du compteur',odoBothErr:'Saisissez soit la distance, soit le relevé du compteur, pas les deux',odoRange:'Le relevé doit être compris entre {a} et {b} (enregistrements du {da} et du {db})',odoMin:'Le relevé ne peut pas être inférieur à {a} (enregistrement du {da})',odoMax:'Le relevé ne peut pas être supérieur à {b} (enregistrement du {db})',odoBelowStart:'Le relevé ne peut pas être inférieur au relevé initial du véhicule ({a})',odoFromRecords:'d\'après le dernier relevé enregistré',odoFromManual:'d\'après la valeur saisie manuellement',odoFirstNote:'Premier relevé — sans point de référence, aucune distance calculée',missedLog:'J\'ai oublié d\'enregistrer la charge précédente',missedLogD:'Si coché, la distance de cet enregistrement est exclue des moyennes de consommation et de coût au km ; les dépenses et l\'énergie restent comptées.',missedAsk:'Une charge manque-t-elle dans cet intervalle ? La distance semble anormalement longue pour l\'énergie utilisée.',missedTag:'Charge précédente non enregistrée',chartNoDist:'Sans distance par enregistrement, l\'évolution ne peut pas être affichée. Les totaux ci-dessus viennent du compteur.',sessions:'charges'},

es:{navStats:'Datos',statsTitle:'Estadísticas',ice1:'Combustión 1 {u}',unitCostTitle:'Coste unitario — EV y combustión lado a lado',tcoExpEv:'Gastos fijos EV (Mi vehículo)',tcoExpIce:'Coste fijo combustión (prorrateado)',tco1kmIce:'Combustión 1 {u} (con gastos)',tcoExplain:'Los gastos fijos del EV son los conceptos (impuesto, seguro, mantenimiento) introducidos en Mi vehículo. En el lado de combustión, el coste fijo anual introducido arriba se prorratea al periodo seguido — ambos coches se comparan en el mismo periodo.',totalCostAll:'Coste total (carga + fijos)',fixedExpTotal:'Total gastos fijos',expChart:'Gráfico de gastos fijos',prorateLbl:'Prorratear gastos anuales (impuesto, seguro) al periodo',prorateNote:'Partidas anuales al {p}% del periodo; total realmente pagado {r}.',exp_tax:'Impuesto',exp_insurance:'Seguro',exp_maintenance:'Mantenimiento / Taller',exp_tire:'Neumáticos',exp_inspection:'ITV',exp_repair:'Reparación',exp_parking:'Aparcamiento / Peaje',exp_equipment:'Equipamiento (cargador, etc.)',exp_other:'Otros',otherTypePh:'Escribe un título — ej. Accesorios, Lavado',addExpense:'Añadir gasto',editExpense:'Editar gasto',expType:'Tipo de gasto',expenses:'Gastos del vehículo',expByCat:'Gastos por categoría',expTotal:'Gastos totales',expAmount:'Importe',noteLbl:'Nota',amountNeeded:'Introduce un importe',noExpenses:'Sin gastos aún. Añade impuesto, seguro y mantenimiento para ver el coste real.',tcoTitle:'Coste total de propiedad (carga + gastos)',tcoEv:'EV total (carga + gastos)',tcoIce:'Combustión total (con gastos)',tcoSaved:'Ahorro total con gastos',tco1km:'EV por 1 {u} (con gastos)',tcoNote:'Periodo seguido {d} días. Costes fijos del coche de combustión prorrateados: {f}.',nonFuelTitle:'Comparación de gastos sin combustible',nonFuelKm:'Gastos sin combustible por {u}',nonFuel100:'Gastos sin combustible por 100 {u}',nonFuelYear:'Gastos anuales sin combustible',nonFuelKwh:'Gastos sin combustible por kWh',nonFuelDiffYear:'Diferencia anual de gastos sin combustible',nonFuelChart:'Gastos anuales sin combustible (EV / Combustión)',iceShort:'Combustión',chargePower:'Potencia media de carga',yearlyCompare:'Comparación anual',yearlySpendLbl:'Gasto total (este año)',yearlyKwhLbl:'Energía (este año)',yearlyPriceLbl:'Precio por kWh (este año)',weekdayDist:'Por día de la semana',vsLastYear:'vs año anterior',iceFixHint:'Opcional. Indica el total anual de impuesto, seguro y mantenimiento de un coche de combustión similar.',ev1:'EV por 1 {u} ({x})',supportNote:'Esta aplicación es totalmente gratuita y sin anuncios. Para apoyar el proyecto, visita nuestra página de GitHub.',version:'Versión',contactDev:'Preguntas y aportes',privacy:'Privacidad',rateApp:'Valorar en Play Store',supportDev:'Página del proyecto en GitHub',kwhHint:'ej. 45,27',distFromOdo:'Fuente de distancia: cuentakilómetros',distFromRecords:'Fuente de distancia: distancias por carga',back:'← Atrás',changeCar:'Cambiar vehículo',navVehicle:'Mi vehículo',vehicleTitle:'Mi vehículo',odoAsk:'Kilometraje actual',odometer:'Cuentakilómetros',odoNow:'Cuentakilómetros',odoTracked:'Recorridos desde el inicio',odoPrompt:'Lectura actual ({u}):',odoStartPrompt:'Lectura inicial ({u}):',odoSaved:'Kilometraje actualizado',theme:'Apariencia',themeLight:'Claro',themeDark:'Oscuro',spendChart:'Gráfico de gasto',cumTitle:'Hasta hoy: mismos km con combustión',totalDist:'Distancia total',evSpent:'EV total (neto)',iceWould:'Costaría (combustión)',totalSaved:'Ahorro total',evLine:'EV (real)',iceLine:'Combustión (mismos km)',archived:'Archivo (vendido/sin uso)',archivedTag:'archivado — cargas conservadas',archivedToast:'Vehículo archivado, sus cargas se conservan',restore:'Restaurar',newBank:'+ Añadir banco…',newBankPrompt:'Nombre del banco:',importAllDup:'Todas las cargas ya existen — no se añadió nada.',importPartial:'{n} cargas nuevas, {d} duplicadas omitidas',netPaid:'Pagado (neto)',typeSplit:'Reparto por tipo (kWh)',detailStats:'Estadísticas detalladas',avgDuration:'Duración media',avgSocRange:'Rango medio',topBanks:'Bancos (ahorro por dtos.)',topLocations:'Lugares más usados',bankCountries:'Mis países bancarios',bankCountriesD:'Elige los países de tus tarjetas — la lista de bancos del formulario los sigue. Tus bancos no cambian con el país de carga.',addCountry:'+ Añadir país',prevPeriod:'vs periodo anterior',navHome:'Inicio',navHistory:'Historial',navCompare:'Comparar',navSettings:'Ajustes',
week:'Semana',month:'Mes',year:'Año',
periodWeek:'Total esta semana',periodMonth:'Total este mes',periodYear:'Total este año',
savings:'ahorrado',avgPerKwh:'Por kWh',netLbl:'neto',grossLbl:'sin dto.',
grossTotal:'Total sin descuentos',cost100:'Por 100 {u}',
totalKwhP:'Energía (kWh)',sessionsCompanies:'Cargas / Redes',totalDiscP:'Descuentos recibidos',
freeCount:'Cargas gratis',weeklySpend:'Gasto semanal',monthlyTotals:'Gasto mensual',
firmDist:'Por red',recentCharges:'Cargas recientes',viewAll:'Todo',allVehicles:'Todos los vehículos',
historyTitle:'Historial',allYears:'Todos los años',allFirms:'Todas las redes',allTypes:'Todos los tipos',free:'Gratis',
compareTitle:'Comparar vs Combustión',fuelType:'Combustible del otro coche',
petrol:'Gasolina',diesel:'Diésel',hybrid:'Híbrido',
hybridNote:'Un híbrido no enchufable también se mide en L/100km — solo consume menos (~4-5 L). Para un PHEV, introduce el consumo combinado medio.',
fuelPrice:'Precio ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Comparar',
evCost:'EV / 100 {u} (neto)',evCostG:'EV / 100 {u} (bruto)',iceCost:'Combustión 100 {u}',
discEffect:'Efecto descuentos / 100 {u}',perUnitSaving:'Ahorro por {u}',
per100:'{v} ahorrados / 100 {u}',savingByMonth:'Ahorro por mes',
compareNote:'El gráfico muestra el ahorro frente a la misma distancia con combustión. Se usan cargas con distancia; cálculo sobre importes netos.',
needData:'Añade cargas con distancia',
settingsTitle:'Ajustes',regionSection:'País y región',country:'País',currency:'Moneda',
unit:'Unidad de distancia',language:'Idioma',vehicles:'Mis vehículos',addVehicle:'+ Vehículo',
defaultHint:'★ predeterminado · km✎ kilometraje · 📷 foto · × archivo',
formSection:'Formulario',advAlways:'Campos avanzados siempre abiertos',
advAlwaysD:'Banco, duración, lugar y rango visibles por defecto',
dataSection:'Datos',exportJson:'Exportar (JSON)',exportCsv:'Exportar (CSV — Excel/Power BI)',
importJson:'Restaurar copia (JSON)',reset:'Restablecer datos',about:'Acerca de',
aboutText:'WattTrack — tus datos permanecen en este dispositivo. Gratis, sin anuncios; datos no compartidos con terceros. Única excepción: el tipo de cambio se obtiene online para cargas en el extranjero (solo se transmiten códigos de moneda).',
addTitle:'Nueva carga',editTitle:'Editar carga',date:'Fecha',chargeType:'Tipo de carga',
company:'Casa/Trabajo o compañía de carga',homeChip:'Casa/Trabajo',other:'Otra…',kwh:'Energía (kWh)',
distance:'Distancia recorrida ({u})',
freeCharge:'Carga gratis',freeChargeD:'Promo, solar… — se guarda como 0',
amount:'Importe — antes de dto. ({s})',discountType:'Tipo de descuento',amountType:'Importe',percentType:'Porcentaje (%)',
bank:'Banco',vehicle:'Vehículo',advanced:'+ Avanzado',advancedHide:'− Ocultar avanzado',
duration:'Duración',hours:'horas',minutes:'minutos',location:'Lugar',
socRange:'Rango de carga % (inicio → fin)',note:'Nota',
rateLbl:'Tipo (1 {f} = ? {b})',
rateNote:'El gasto en el extranjero se convierte a {b} al tipo introducido. Introduce manualmente si no se encuentra.',
rateAuto:'Tipo obtenido automáticamente ({d})',rateNeeded:'Tipo requerido para carga en el extranjero',
gpsFail:'Ubicación no disponible — comprueba el permiso',
formError:'Red, kWh e importe requeridos',save:'Guardar',
deleteAsk:'¿Eliminar esta carga?',deleted:'Carga eliminada',saved:'Carga guardada',updated:'Carga actualizada',
obWelcome:'¡Bienvenido!',obCountryQ:'¿Dónde cargas? Ajustaremos moneda y unidad.',
obCarQ:'Elige tu coche',obCarSub:'Escribe marca o modelo — distingue versiones por año y batería.',
searchCar:'ej. Model 3, EV6, Torres…',continue:'Continuar',skip:'Omitir',start:'Empezar',
battery:'Batería',arch:'Arquitectura',dcMax:'DC máx',acMax:'AC',range:'Autonomía',
addPhoto:'📷 Añadir foto',changePhoto:'📷 Cambiar foto',
customAdd:'Añadir «{q}» como vehículo propio',vehicleAdded:'Vehículo añadido',photoAdded:'Foto añadida',add:'Añadir',
wipeAsk1:'Se borrarán TODOS los datos. ¿Seguro?',wipeAsk2:'Irreversible. ¿Borrar?',
wiped:'Datos borrados',imported:'Copia restaurada',
importFail:'Copia WattTrack no válida',importAsk:'cargas se importarán. ¿Combinar?',
jsonDone:'Copia JSON descargada',csvDone:'CSV descargado',noData:'Sin cargas aún',numRange:'{f} debe estar entre {min} y {max}',socOrder:'El porcentaje final debe ser mayor que el inicial',fldKwh:'Energía (kWh)',fldAmount:'Importe pagado',fldDisc:'Descuento',fldRate:'Tipo de cambio',fldDist:'Distancia recorrida',fldOdo:'Cuentakilómetros',fldDurH:'Tiempo de carga (horas)',fldDurM:'Tiempo de carga (minutos)',fldSoc:'Porcentaje de carga',fldUnitPrice:'Precio por kWh',badDataFound:'{n} registros contienen valores no válidos',showLbl:'Mostrar',dismissLbl:'Cerrar',dateNeeded:'Introduce una fecha válida',futureDate:'Estás añadiendo un registro con fecha futura',restoreSettingsAsk:'¿Restaurar también los ajustes de la copia (idioma, moneda, país, tema)?',delVehTitle:'¿Qué quieres hacer?',delVehMsg:'Este vehículo tiene {n} cargas y {e} gastos.',delVehAll:'Eliminar también los registros',delVehArchive:'Conservar los registros, archivar el vehículo',delVehMove:'Mover los registros a otro vehículo',delVehAllConfirm:'Se eliminarán permanentemente {n} cargas y {e} gastos. No se puede deshacer. ¿Continuar?',moveTitle:'Mover registros',moveRecords:'⇄ Mover registros',moveFrom:'Vehículo origen',moveTo:'Vehículo destino',moveRange:'Intervalo de fechas (opcional)',movePreview:'Se moverán {n} cargas y {e} gastos',moveDone:'{n} registros movidos',moveUndone:'Movimiento deshecho',noOtherVehicle:'No hay otro vehículo disponible',orphanWarn:'{n} registros pertenecen a un vehículo eliminado',orphanAssign:'Asignar a un vehículo',orphanDelete:'Eliminar los registros',archivedCount:'archivado · {n} registros',cancelLbl:'Cancelar',fxMissing:'{n} registros quedaron fuera de los totales por falta de tipo de cambio',fxFix:'Corregir',fxNoAuto:'No hay tipo automático para esta moneda — introdúcelo manualmente',saveFailed:'No se pudo guardar — el cambio no se escribió en el dispositivo',quotaFull:'Almacenamiento lleno. Haz copia en Ajustes → Exportar y borra registros antiguos.',savedLocal:'Guardado en el dispositivo',storageLbl:'Almacenamiento',storagePersist:'persistente — el navegador no borrará tus datos por su cuenta',storageBest:'temporal — el navegador puede borrar datos si falta espacio, haz copias con frecuencia',discardAsk:'Se perderá lo que has introducido. ¿Cerrar igualmente?',navMain:'Menú principal',socStart:'Porcentaje de carga inicial',socEnd:'Porcentaje de carga final',allRecordsNote:'todos los registros',scopeAllTime:'todo el tiempo',distFromOdoAll:'Del cuentakilómetros, todo el tiempo — distancia insuficiente en el periodo',periodLbl:'Periodo: {p}',chartTrendNote:'evolución',vehNeeded:'Selecciona un vehículo para este gasto',noVehYet:'Añade un vehículo antes de registrar gastos',expOrphanFix:'{n} gastos sin vehículo se asignaron al vehículo predeterminado',inclArchived:'Incluir gastos de vehículos archivados',tcoVehNote:'Vehículos incluidos: {v}',placeSplit:'Reparto por lugar (kWh)',placeFirm:'Compañía de carga',homeKwhPrice:'Precio de la electricidad casa/trabajo (por kWh)',homeKwhPriceD:'Basta un único precio total por kWh. Las cargas en casa/trabajo lo usan.',amountFromPrice:'Importe calculado a partir del precio por kWh',amountManual:'Importe introducido manualmente — no se usa el precio unitario',odoOrDist:'o lectura del cuentakilómetros',odoBothErr:'Introduce la distancia o la lectura del cuentakilómetros, no ambas',odoRange:'La lectura debe estar entre {a} y {b} (registros de {da} y {db})',odoMin:'La lectura no puede ser inferior a {a} (registro de {da})',odoMax:'La lectura no puede ser superior a {b} (registro de {db})',odoBelowStart:'La lectura no puede ser inferior a la lectura inicial del vehículo ({a})',odoFromRecords:'de la última lectura registrada',odoFromManual:'del valor introducido manualmente',odoFirstNote:'Primer registro del cuentakilómetros — sin referencia, no se calculó distancia',missedLog:'Olvidé registrar la carga anterior',missedLogD:'Si se marca, la distancia de este registro queda fuera de las medias de consumo y coste por km; el gasto y la energía siguen contando.',missedAsk:'¿Falta alguna carga en este intervalo? La distancia parece inusualmente larga para la energía usada.',missedTag:'Carga anterior no registrada',chartNoDist:'Sin distancia por registro no se puede mostrar la evolución. Los totales de arriba vienen del cuentakilómetros.',sessions:'cargas'},

it:{navStats:'Statistiche',statsTitle:'Statistiche',ice1:'Termica 1 {u}',unitCostTitle:'Costo unitario — EV e termica affiancate',tcoExpEv:'Costi fissi EV (Il mio veicolo)',tcoExpIce:'Costi fissi termica (in proporzione)',tco1kmIce:'Termica 1 {u} (con spese)',tcoExplain:'I costi fissi EV sono le voci (bollo, assicurazione, manutenzione) inserite ne Il mio veicolo. Sul lato termica, il costo fisso annuo inserito sopra è ripartito sul periodo monitorato — le due auto sono confrontate sullo stesso periodo.',totalCostAll:'Costo totale (ricarica + fissi)',fixedExpTotal:'Totale costi fissi',expChart:'Grafico costi fissi',prorateLbl:'Ripartisci le spese annuali (bollo, assicurazione) sul periodo',prorateNote:'Voci annuali al {p}% del periodo; totale realmente pagato {r}.',exp_tax:'Bollo',exp_insurance:'Assicurazione',exp_maintenance:'Manutenzione / Tagliando',exp_tire:'Pneumatici',exp_inspection:'Revisione',exp_repair:'Riparazione',exp_parking:'Parcheggio / Pedaggi',exp_equipment:'Attrezzatura (wallbox ecc.)',exp_other:'Altro',otherTypePh:'Scrivi un titolo — es. Accessori, Lavaggio',addExpense:'Aggiungi spesa',editExpense:'Modifica spesa',expType:'Tipo di spesa',expenses:'Spese del veicolo',expByCat:'Spese per categoria',expTotal:'Spese totali',expAmount:'Importo',noteLbl:'Nota',amountNeeded:'Inserisci un importo',noExpenses:'Nessuna spesa. Aggiungi bollo, assicurazione e manutenzione per il costo reale.',tcoTitle:'Costo totale di possesso (ricarica + spese)',tcoEv:'EV totale (ricarica + spese)',tcoIce:'Termica totale (con spese)',tcoSaved:'Risparmio totale con spese',tco1km:'EV per 1 {u} (con spese)',tcoNote:'Periodo monitorato {d} giorni. Costi fissi della termica in proporzione: {f}.',nonFuelTitle:'Confronto spese non di carburante',nonFuelKm:'Spese non di carburante per {u}',nonFuel100:'Spese non di carburante per 100 {u}',nonFuelYear:'Spese annue non di carburante',nonFuelKwh:'Spese non di carburante per kWh',nonFuelDiffYear:'Differenza annua spese non di carburante',nonFuelChart:'Spese annue non di carburante (EV / Termica)',iceShort:'Termica',chargePower:'Potenza media di ricarica',yearlyCompare:'Confronto annuale',yearlySpendLbl:'Spesa totale (quest’anno)',yearlyKwhLbl:'Energia (quest’anno)',yearlyPriceLbl:'Prezzo per kWh (quest’anno)',weekdayDist:'Per giorno della settimana',vsLastYear:'vs anno precedente',iceFixHint:'Facoltativo. Inserisci il totale annuo di bollo, assicurazione e manutenzione di una termica simile.',ev1:'EV per 1 {u} ({x})',supportNote:'Questa app è completamente gratuita e senza pubblicità. Per sostenere il progetto, visita la nostra pagina GitHub.',version:'Versione',contactDev:'Domande e contributi',privacy:'Privacy',rateApp:'Valuta su Play Store',supportDev:'Pagina GitHub del progetto',kwhHint:'es. 45,27',distFromOdo:'Fonte distanza: contachilometri',distFromRecords:'Fonte distanza: distanze delle ricariche',back:'← Indietro',changeCar:'Cambia veicolo',navVehicle:'Il mio veicolo',vehicleTitle:'Il mio veicolo',odoAsk:'Chilometraggio attuale',odometer:'Contachilometri',odoNow:'Contachilometri',odoTracked:'Percorsi dall’inizio',odoPrompt:'Lettura attuale ({u}):',odoStartPrompt:'Lettura iniziale ({u}):',odoSaved:'Contachilometri aggiornato',theme:'Aspetto',themeLight:'Chiaro',themeDark:'Scuro',spendChart:'Grafico spese',cumTitle:'Finora: stessi km con termica',totalDist:'Distanza totale',evSpent:'EV totale (netto)',iceWould:'Costerebbe (termica)',totalSaved:'Risparmio totale',evLine:'EV (reale)',iceLine:'Termica (stessi km)',archived:'Archivio (venduto/inutilizzato)',archivedTag:'archiviato — ricariche conservate',archivedToast:'Veicolo archiviato, le ricariche restano',restore:'Ripristina',newBank:'+ Nuova banca…',newBankPrompt:'Nome banca:',importAllDup:'Tutte le ricariche esistono già — nulla aggiunto.',importPartial:'{n} nuove ricariche, {d} duplicati saltati',netPaid:'Pagato (netto)',typeSplit:'Ripartizione per tipo (kWh)',detailStats:'Statistiche dettagliate',avgDuration:'Durata media',avgSocRange:'Intervallo medio',topBanks:'Banche (risparmio sconti)',topLocations:'Luoghi più usati',bankCountries:'I miei paesi bancari',bankCountriesD:'Scegli i paesi delle tue carte — l’elenco banche nel modulo li segue. Le tue banche non cambiano col paese di ricarica.',addCountry:'+ Aggiungi paese',prevPeriod:'vs periodo precedente',navHome:'Home',navHistory:'Cronologia',navCompare:'Confronta',navSettings:'Impostazioni',
week:'Settimana',month:'Mese',year:'Anno',
periodWeek:'Totale settimana',periodMonth:'Totale mese',periodYear:'Totale anno',
savings:'risparmiato',avgPerKwh:'Per kWh',netLbl:'netto',grossLbl:'senza sconto',
grossTotal:'Totale senza sconti',cost100:'Per 100 {u}',
totalKwhP:'Energia (kWh)',sessionsCompanies:'Ricariche / Reti',totalDiscP:'Sconti ricevuti',
freeCount:'Ricariche gratis',weeklySpend:'Spesa settimanale',monthlyTotals:'Spesa mensile',
firmDist:'Per rete',recentCharges:'Ricariche recenti',viewAll:'Tutte',allVehicles:'Tutti i veicoli',
historyTitle:'Cronologia',allYears:'Tutti gli anni',allFirms:'Tutte le reti',allTypes:'Tutti i tipi',free:'Gratis',
compareTitle:'Confronta vs Termica',fuelType:'Carburante dell’altra auto',
petrol:'Benzina',diesel:'Diesel',hybrid:'Ibrida',
hybridNote:'Anche un’ibrida non ricaricabile si misura in L/100km — consuma solo meno (~4-5 L). Per una PHEV inserisci il consumo combinato medio.',
fuelPrice:'Prezzo ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Confronta',
evCost:'EV / 100 {u} (netto)',evCostG:'EV / 100 {u} (lordo)',iceCost:'Termica 100 {u}',
discEffect:'Effetto sconti / 100 {u}',perUnitSaving:'Risparmio per {u}',
per100:'{v} risparmiati / 100 {u}',savingByMonth:'Risparmio per mese',
compareNote:'Il grafico mostra il risparmio rispetto alla stessa distanza con un’auto termica. Ricariche con distanza; calcolo su importi netti.',
needData:'Aggiungi ricariche con distanza',
settingsTitle:'Impostazioni',regionSection:'Paese e regione',country:'Paese',currency:'Valuta',
unit:'Unità di distanza',language:'Lingua',vehicles:'I miei veicoli',addVehicle:'+ Veicolo',
defaultHint:'★ predefinito · km✎ contachilometri · 📷 foto · × archivio',
formSection:'Modulo',advAlways:'Campi avanzati sempre aperti',
advAlwaysD:'Banca, durata, luogo e intervallo visibili di default',
dataSection:'Dati',exportJson:'Esporta (JSON)',exportCsv:'Esporta (CSV — Excel/Power BI)',
importJson:'Ripristina backup (JSON)',reset:'Azzera dati',about:'Info',
aboutText:'WattTrack — i tuoi dati restano su questo dispositivo. Gratuita, senza pubblicità; dati non condivisi con terzi. Unica eccezione: il tasso di cambio è recuperato online per ricariche all’estero (si trasmettono solo i codici valuta).',
addTitle:'Nuova ricarica',editTitle:'Modifica ricarica',date:'Data',chargeType:'Tipo di ricarica',
company:'Casa/Lavoro o operatore',homeChip:'Casa/Lavoro',other:'Altra…',kwh:'Energia (kWh)',
distance:'Distanza percorsa ({u})',
freeCharge:'Ricarica gratis',freeChargeD:'Promo, solare… — salvata come 0',
amount:'Importo — prima dello sconto ({s})',discountType:'Tipo di sconto',amountType:'Importo',percentType:'Percento (%)',
bank:'Banca',vehicle:'Veicolo',advanced:'+ Avanzate',advancedHide:'− Nascondi avanzate',
duration:'Durata',hours:'ore',minutes:'minuti',location:'Luogo',
socRange:'Intervallo carica % (inizio → fine)',note:'Nota',
rateLbl:'Tasso (1 {f} = ? {b})',
rateNote:'La spesa all’estero è convertita in {b} al tasso inserito. Inserisci manualmente se non trovato.',
rateAuto:'Tasso recuperato automaticamente ({d})',rateNeeded:'Tasso richiesto per ricarica all’estero',
gpsFail:'Posizione non disponibile — controlla i permessi',
formError:'Rete, kWh e importo obbligatori',save:'Salva',
deleteAsk:'Eliminare questa ricarica?',deleted:'Ricarica eliminata',saved:'Ricarica salvata',updated:'Ricarica aggiornata',
obWelcome:'Benvenuto!',obCountryQ:'Dove ricarichi? Imposteremo valuta e unità di conseguenza.',
obCarQ:'Scegli la tua auto',obCarSub:'Scrivi marca o modello — distingui le versioni per anno e batteria.',
searchCar:'es. 500e, Model 3, Torres…',continue:'Continua',skip:'Salta',start:'Inizia',
battery:'Batteria',arch:'Architettura',dcMax:'DC max',acMax:'AC',range:'Autonomia',
addPhoto:'📷 Aggiungi foto',changePhoto:'📷 Sostituisci foto',
customAdd:'Aggiungi «{q}» come veicolo personale',vehicleAdded:'Veicolo aggiunto',photoAdded:'Foto aggiunta',add:'Aggiungi',
wipeAsk1:'TUTTI i dati saranno eliminati. Sicuro?',wipeAsk2:'Irreversibile. Eliminare?',
wiped:'Dati eliminati',imported:'Backup ripristinato',
importFail:'Backup WattTrack non valido',importAsk:'ricariche da importare. Unire?',
jsonDone:'Backup JSON scaricato',csvDone:'CSV scaricato',noData:'Nessuna ricarica',numRange:'{f} deve essere tra {min} e {max}',socOrder:'La percentuale finale deve essere maggiore di quella iniziale',fldKwh:'Energia (kWh)',fldAmount:'Importo pagato',fldDisc:'Sconto',fldRate:'Tasso di cambio',fldDist:'Distanza percorsa',fldOdo:'Contachilometri',fldDurH:'Durata ricarica (ore)',fldDurM:'Durata ricarica (minuti)',fldSoc:'Percentuale di carica',fldUnitPrice:'Prezzo per kWh',badDataFound:'{n} registrazioni contengono valori non validi',showLbl:'Mostra',dismissLbl:'Chiudi',dateNeeded:'Inserisci una data valida',futureDate:'Stai inserendo una registrazione con data futura',restoreSettingsAsk:'Ripristinare anche le impostazioni dal backup (lingua, valuta, paese, tema)?',delVehTitle:'Cosa vuoi fare?',delVehMsg:'Questo veicolo ha {n} ricariche e {e} spese.',delVehAll:'Elimina anche le registrazioni',delVehArchive:'Conserva le registrazioni, archivia il veicolo',delVehMove:'Sposta le registrazioni su un altro veicolo',delVehAllConfirm:'{n} ricariche e {e} spese verranno eliminate definitivamente. Operazione irreversibile. Continuare?',moveTitle:'Sposta registrazioni',moveRecords:'⇄ Sposta',moveFrom:'Veicolo di origine',moveTo:'Veicolo di destinazione',moveRange:'Intervallo di date (facoltativo)',movePreview:'Verranno spostate {n} ricariche e {e} spese',moveDone:'{n} registrazioni spostate',moveUndone:'Spostamento annullato',noOtherVehicle:'Nessun altro veicolo disponibile',orphanWarn:'{n} registrazioni appartengono a un veicolo eliminato',orphanAssign:'Assegna a un veicolo',orphanDelete:'Elimina le registrazioni',archivedCount:'archiviato · {n} registrazioni',cancelLbl:'Annulla',fxMissing:'{n} registrazioni sono escluse dai totali per mancanza del tasso di cambio',fxFix:'Correggi',fxNoAuto:'Nessun tasso automatico per questa valuta — inseriscilo manualmente',saveFailed:'Salvataggio non riuscito — la modifica non è stata scritta',quotaFull:'Memoria piena. Fai un backup da Impostazioni → Esporta ed elimina vecchie registrazioni.',savedLocal:'Salvato sul dispositivo',storageLbl:'Memoria',storagePersist:'persistente — il browser non cancellerà i tuoi dati da solo',storageBest:'temporanea — il browser può cancellare i dati se lo spazio scarseggia, fai backup regolari',discardAsk:'Quanto inserito andrà perso. Chiudere comunque?',navMain:'Menu principale',socStart:'Percentuale di carica iniziale',socEnd:'Percentuale di carica finale',allRecordsNote:'tutte le registrazioni',scopeAllTime:'sempre',distFromOdoAll:'Dal contachilometri, sempre — distanza insufficiente nel periodo',periodLbl:'Periodo: {p}',chartTrendNote:'andamento',vehNeeded:'Seleziona un veicolo per questa spesa',noVehYet:'Aggiungi prima un veicolo per inserire le spese',expOrphanFix:'{n} spese senza veicolo sono state assegnate al veicolo predefinito',inclArchived:'Includi le spese dei veicoli archiviati',tcoVehNote:'Veicoli inclusi: {v}',placeSplit:'Ripartizione per luogo (kWh)',placeFirm:'Operatore',homeKwhPrice:'Prezzo elettricità casa/lavoro (per kWh)',homeKwhPriceD:'Basta un unico prezzo per kWh comprensivo. Le ricariche casa/lavoro lo usano.',amountFromPrice:'Importo calcolato dal prezzo per kWh',amountManual:'Importo inserito manualmente — il prezzo unitario non viene usato',odoOrDist:'o lettura del contachilometri',odoBothErr:'Inserisci la distanza oppure la lettura del contachilometri, non entrambe',odoRange:'La lettura deve essere tra {a} e {b} (registrazioni del {da} e del {db})',odoMin:'La lettura non può essere inferiore a {a} (registrazione del {da})',odoMax:'La lettura non può essere superiore a {b} (registrazione del {db})',odoBelowStart:'La lettura non può essere inferiore alla lettura iniziale del veicolo ({a})',odoFromRecords:'dall\'ultima lettura registrata',odoFromManual:'dal valore inserito manualmente',odoFirstNote:'Prima lettura del contachilometri — senza riferimento, nessuna distanza calcolata',missedLog:'Ho dimenticato di registrare la ricarica precedente',missedLogD:'Se selezionato, la distanza di questa registrazione è esclusa dalle medie di consumo e costo al km; spesa ed energia restano conteggiate.',missedAsk:'Manca una ricarica in questo intervallo? La distanza sembra insolitamente lunga per l\'energia usata.',missedTag:'Ricarica precedente non registrata',chartNoDist:'Senza distanza per registrazione non è possibile mostrare l\'andamento. I totali sopra vengono dal contachilometri.',sessions:'ricariche'}
};
const LANG_NAMES = {tr:'Türkçe',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'};
const MONTHS = {
tr:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
en:['January','February','March','April','May','June','July','August','September','October','November','December'],
de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
it:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
};
const DAYS = {
tr:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'], en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
de:['Mo','Di','Mi','Do','Fr','Sa','So'], fr:['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
es:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], it:['Lun','Mar','Mer','Gio','Ven','Sab','Dom']
};

// ---------- Durum & yardımcılar ----------
const S = {
  country: 'TR', currency: 'TRY', unit: 'km', lang: 'tr',
  advOpen: false, defaultVehicleId: null, onboarded: false,
  period: 'year', cmp: null, dashVeh: '', cmpVeh: '', vehExpVeh: '', vehExpGran: 'month', bankCountries: null, gran: 'month', customBanks: [], theme: 'light', dstatType: '', histBadOnly: null, homeKwhPrice: null
};
const $ = id => document.getElementById(id);
const t = (key, vars) => {
  let s = (T[S.lang] && T[S.lang][key]) ?? T.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
};
// ---------- WT-02: tek sayı kuralı ----------
// ONDALIK: virgül (,)  ·  BİNLİK: nokta (.)  ·  2 basamak
// Kural dil ayarından BAĞIMSIZ, tüm dillerde aynı — ürün kararı.
// Girişte hem "43,57" hem "43.57" kabul edilir; ikisi de 43.57 olur.
// dec: saklanacak ondalık basamak. Varsayılan 2; kur alanı gibi hassas
// alanlar pf(v, 6) ile çağrılır (2'ye yuvarlamak kuru bozardı).
function pf(str, dec = 2) {
  if (str == null) return NaN;
  let s = String(str).trim().replace(/[^\d.,\-]/g, '');   // para simgesi, boşluk, birim at
  if (!s) return NaN;
  const sonNokta = s.lastIndexOf('.');
  const sonVirgul = s.lastIndexOf(',');
  if (sonNokta > -1 && sonVirgul > -1) {
    // İkisi de var → SONUNCUSU ondalık, diğeri binlik
    const ond = Math.max(sonNokta, sonVirgul);
    s = s.slice(0, ond).replace(/[.,]/g, '') + '.' + s.slice(ond + 1).replace(/[.,]/g, '');
  } else if (sonNokta > -1 || sonVirgul > -1) {
    // Tek ayraç → kullanıcı girişinde HER ZAMAN ondalık kabul et
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  if (isNaN(n)) return NaN;
  const p = Math.pow(10, dec);
  return Math.round(n * p) / p;
}
// Tüm sayı gösteriminin TEK noktası. Dile göre biçimlendirme istenirse
// değiştirilecek tek yer burası.
function fmtNum(v, dec = 0) {
  if (v == null || isNaN(v)) return '—';
  const neg = v < 0;
  const [tam, ond] = Math.abs(v).toFixed(dec).split('.');
  const tamStr = tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + tamStr + (ond ? ',' + ond : '');
}
// Giriş kutusuna yazılacak biçim: fmtNum ile aynı kural, ama eksi işareti
// normal tire (kutuya geri yazılınca pf() okuyabilsin) ve kur gibi çok
// ondalıklı alanlarda gereksiz sıfırlar atılır.
function fmtInput(v, dec = 2) {
  if (v == null || isNaN(v)) return '';
  let s = fmtNum(v, dec).replace('−', '-');
  // Kur gibi çok ondalıklı alanlarda gereksiz sıfırlar atılır. Bu durumda
  // binlik ayracı da KULLANILMAZ: ondalık kısım kırpılınca geriye "1.000"
  // kalır ve pf() tek ayracı her zaman ondalık kabul ettiği için bunu 1,0
  // diye okur. Kurlar küçük sayılar, gruplama zaten bir şey katmıyor.
  if (dec > 2) {
    const [tam, ond = ''] = s.split(',');
    const kirp = ond.replace(/0+$/, '');
    s = tam.split('.').join('') + (kirp ? ',' + kirp : '');
  }
  return s;
}
// WT-02/C: alandan çıkarken değeri kuralın kendisiyle geri yaz —
// kullanıcı "43.57" yazıp çıkınca kutuda "43,57" görür, kural görünür olur.
// ---------- WT-04: sayısal alan sınırları ----------
// type="number" min/max öznitelikleri <form> doğrulaması olmadan ZORLANMIYOR;
// tek doğrulama katmanı her iki formda (şarj + gider) burayı kullanır.
const KURALLAR = {
  kwh:        {min: 0.01,     max: 300,     dec: 2, lbl: 'fldKwh'},
  tutar:      {min: 0,        max: 1000000, dec: 2, lbl: 'fldAmount'},
  indirim:    {min: 0,        max: 1000000, dec: 2, lbl: 'fldDisc'},
  indirimYuz: {min: 0,        max: 100,     dec: 2, lbl: 'fldDisc'},
  kur:        {min: 0.000001, max: 100000,  dec: 6, lbl: 'fldRate'},
  mesafe:     {min: 0,        max: 5000,    dec: 1, lbl: 'fldDist'},
  odo:        {min: 0,        max: 2000000, dec: 0, lbl: 'fldOdo'},
  surSaat:    {min: 0,        max: 48,      dec: 0, lbl: 'fldDurH'},
  surDak:     {min: 0,        max: 59,      dec: 0, lbl: 'fldDurM'},
  soc:        {min: 0,        max: 100,     dec: 0, lbl: 'fldSoc'},
  birimFiyat: {min: 0,        max: 1000,    dec: 2, lbl: 'fldUnitPrice'}
};
// Sınır dışı değerde SESSİZCE KIRPMA — {ok:false, msg} döndür, çağıran gösterir.
// Boş alan: zorunlu değilse {ok:true, value:null}.
function checkNum(kural, raw, {required = false} = {}) {
  const k = KURALLAR[kural];
  const s = String(raw ?? '').trim();
  if (!s) return required
    ? {ok: false, msg: t('numRange', {f: t(k.lbl), min: fmtNum(k.min, k.dec), max: fmtNum(k.max, k.dec)})}
    : {ok: true, value: null};
  const n = pf(s, k.dec);
  if (isNaN(n) || n < k.min || n > k.max)
    return {ok: false, msg: t('numRange', {f: t(k.lbl), min: fmtNum(k.min, k.dec), max: fmtNum(k.max, k.dec)})};
  return {ok: true, value: n};
}

function bindDecimalInput(id, dec = 2) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    if (!el.value.trim()) return;
    const n = pf(el.value, dec);
    el.value = isNaN(n) ? '' : fmtInput(n, dec);
  });
}
const symOf = code => CURRENCY_SYMBOLS[code] || code;
const sym = () => symOf(S.currency);
// Harf içeren semboller (L, kr, Kč, Ft…) sayının SONUNA boşlukla gelir: "1.250 L";
// işaret semboller (₺ € $ £) başa gelir: "₺1.250"
const fm = (s, str) => /^[A-Za-z]/.test(s) ? str + ' ' + s : s + str;
const money = v => (v < 0 ? '−' : '') + fm(sym(), fmtNum(Math.abs(v || 0), 0));
const money2 = v => (v < 0 ? '−' : '') + fm(sym(), fmtNum(Math.abs(v || 0), 2));
// WT-01: toISOString() UTC'ye çevirir; TR (UTC+3) gibi doğu saat dilimlerinde
// gece yarısından sonra DÜNÜN tarihini verir. Tüm tarih anahtarları yerel
// saate göre üretilmeli.
const localISO = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const localMonth = (d = new Date()) => localISO(d).slice(0, 7);
// WT-05: YYYY-MM-DD hem biçim hem takvim olarak geçerli mi?
// (input type=date boş bırakılabiliyor, 2025-02-31 gibi değerler de elenmeli)
function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const d = new Date(s + 'T12:00');
  return !isNaN(d.getTime()) && localISO(d) === s;
}
const monthKey = iso => iso.slice(0, 7);
const distDisp = km => S.unit === 'mi' ? km / MI : km;
const distFactor = () => S.unit === 'mi' ? MI : 1;   // 100 birim = 100*factor km

// Açılış animasyonu: gerçek yükleme paralelde sürer, splash yalnız görsel bir katman —
// en az SPLASH_MIN_MS gösterilir ki animasyon yarıda kesilmiş gibi durmasın.
// (popüler mobil uygulamalardaki ~2 sn marka splash süresi baz alındı)
const SPLASH_MIN_MS = 2000;
const splashStart = Date.now();
function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStart));
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 600);
  }, wait);
}
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2400);
}
// WT-09/B: geri alınabilir işlemler için "Geri al" butonlu toast.
// Tersine çevirme penceresi normal toast'tan uzun (6 sn).
function toastUndo(msg, onUndo) {
  const el = $('toast');
  el.textContent = '';
  const span = document.createElement('span');
  span.textContent = msg;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toast-undo';
  btn.textContent = t('restore');
  btn.addEventListener('click', () => {
    clearTimeout(el._h);
    el.classList.remove('show');
    onUndo();
  });
  el.append(span, btn);
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => { el.classList.remove('show'); el.textContent = ''; }, 6000);
}
function esc(s) {
  return (s || '').toString().replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
// indirim (tasarruf) — kayıt para biriminde
// v6+: kayıtta hazır `indirim` alanı var (brüt − net). Eski kayıtlar için formül.
function savingsOf(r) {
  if (r.free) return 0;
  if (r.indirim != null) return Number(r.indirim) || 0;
  if (r.indirimTip === 'percent') {
    const v = Number(r.indirimDeger) || 0;
    return v >= 100 ? 0 : r.odenen * v / (100 - v);
  }
  if (r.indirimTip === 'amount') return Number(r.indirimDeger) || 0;
  return 0;
}
// brütten neti hesapla (form ve kayıt için tek doğruluk kaynağı)
function netFromGross(gross, type, val) {
  const v = Number(val) || 0;
  if (v <= 0) return gross;
  const net = type === 'percent' ? gross * (1 - Math.min(100, v) / 100) : gross - v;
  return Math.max(0, net);
}
// ---- ÇİFT YÖNLÜ KUR: kayıt kendi para birimini korur ----
// Dönüşüm katsayısı; çevrilemiyorsa null (toplam dışı bırakılır)
function convOf(r) {
  const c = r.cur || S.currency;
  if (c === S.currency) return 1;
  if (r.fxTable && r.fxTable[S.currency]) return r.fxTable[S.currency];
  if (r.rate && (r.rateBase === S.currency || !r.rateBase)) return Number(r.rate);
  return null;
}
const amtB = r => { const k = convOf(r); return k == null ? 0 : (r.odenen || 0) * k; };
const savB = r => { const k = convOf(r); return k == null ? 0 : savingsOf(r) * k; };
const isConv = r => convOf(r) != null;
const expB = e => { const k = convOf(e); return k == null ? 0 : (e.tutar || 0) * k; };
// WT-10: convOf() null dönünce amtB() 0 veriyor ve kayıt toplamlardan sessizce
// düşüyordu. (Kod içinde tanımlı ama hiç kullanılmayan fxPendingCount bu
// uyarının planlanıp unutulduğunu gösteriyordu — kaldırıldı, yerine bu geldi.)
function reportFxGaps(list, host = 'd-warnings', id = 'fx') {
  const bad = list.filter(r => !isConv(r));
  setWarning(id, bad.length ? {
    host,
    msg: t('fxMissing', {n: bad.length}),
    actionLbl: t('fxFix'),
    action: () => { S.histBadOnly = bad.map(r => r.id).filter(x => x != null); showScreen('history'); }
  } : null);
  return bad.length;
}
function shortDate(iso) {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return d + ' ' + MONTHS[S.lang][m - 1].slice(0, 3);
}
// ---------- WT-12: yazma hatası ve kota yönetimi ----------
// Dexie yazma çağrılarının hiçbiri try/catch içinde değildi. Kota dolarsa ya
// da tarayıcı özel modda IndexedDB'yi kısıtlarsa kullanıcı KAYITSIZ kaldığını
// fark etmiyordu — toast "Kaydedildi" diyor ama veri yazılmamış oluyordu.
// Dönüş: {ok:true, value} | {ok:false, err}
async function safeWrite(fn, errKey = 'saveFailed') {
  try {
    return {ok: true, value: await fn()};
  } catch (err) {
    const quota = err && (err.name === 'QuotaExceededError' ||
      err.inner?.name === 'QuotaExceededError' ||
      /quota/i.test(err.message || ''));
    toast(quota ? t('quotaFull') : t(errKey));
    console.error('[WattTrack] yazma hatası:', err);
    return {ok: false, err};
  }
}
async function saveSetting(key, value) {
  return (await safeWrite(() => db.settings.put({key, value}))).ok;
}
// Tarayıcıdan kalıcı depolama iste ve durumu Ayarlar'da göster (WT-12/4).
async function initStorage() {
  const el = $('storage-info');
  if (!navigator.storage) { if (el) el.textContent = '—'; return; }
  let persisted = false;
  try {
    persisted = await navigator.storage.persisted?.() || false;
    if (!persisted) persisted = await navigator.storage.persist?.() || false;
  } catch { /* desteklenmiyor */ }
  if (!el) return;
  let usage = '';
  try {
    const est = await navigator.storage.estimate?.();
    if (est?.usage) usage = ' · ' + fmtNum(est.usage / 1048576, 1) + ' MB';
  } catch { /* yok sayılır */ }
  el.textContent = t(persisted ? 'storagePersist' : 'storageBest') + usage;
}
// ============================================================
// MESAFE VE KİLOMETRE SAYACI (WT-19)
// ============================================================
// ESKİ SORUN: bumpVehicleKm() kayıttaki mesafeyi otomatik olarak araç
// sayacına ekliyordu. Kullanıcı ayrıca "km✎" ile gerçek sayacı girince iki
// mekanizma çakışıyor ve çift sayım oluyordu. bumpVehicleKm KALDIRILDI.
//
// Artık mesafe iki kaynaktan gelebilir ve kullanıcı İKİSİNDEN BİRİNİ girer:
//   - mesafeKm doğrudan girilmişse (odo == null) aynen kullanılır
//   - odo girilmişse mesafe TÜRETİLİR ve yine mesafeKm'ye yazılır
//
// PROVENANS İŞARETİ: `odo != null` ise o kaydın mesafeKm'si TÜRETİLMİŞTİR ve
// yeniden hesaplama onu sahiplenir. `odo == null` ise mesafeKm kullanıcının
// girdiği değerdir ve yeniden hesaplama ona ASLA dokunmaz — böylece eski
// kayıtlar (WT-19/6) bozulmadan çalışmaya devam eder.
//
// aracId'si null olan kayıtlar tek bir örtük grup sayılır; farklı araçların
// sayaç okumalarını birbirine zincirlemek anlamsız olurdu.
const vehEq = (a, b) => (a ?? null) === (b ?? null);

// Aracın odo'lu kayıtlarını TARİHE göre (ekleniş sırasına DEĞİL) sıralayıp
// mesafeleri baştan hesaplar. Araya sonradan geçmiş tarihli kayıt eklenebildiği
// için "bir önceki kayıttan farkı al" mantığı tek başına yetmez.
async function tureMesafe(aracId) {
  const mine = (await db.sessions.toArray())
    .filter(r => vehEq(r.aracId, aracId) && r.odo != null)
    .sort((a, b) => a.tarih.localeCompare(b.tarih) || a.id - b.id);
  const upd = [];
  let prev = null;
  for (const r of mine) {
    // ilk odo'lu kayıtta kıyas noktası yok → mesafe null
    const yeni = prev == null ? null : Math.round((r.odo - prev) * 10) / 10;
    if ((r.mesafeKm ?? null) !== yeni) upd.push([r.id, yeni]);
    prev = r.odo;
  }
  if (!upd.length) return;
  await safeWrite(() => db.transaction('rw', db.sessions, async () => {
    for (const [id, m] of upd) await db.sessions.update(id, {mesafeKm: m});
  }));
}

// Doğrulama İKİ KOMŞUYA birden yapılır (sadece öncekine değil): kayıt tarihçe
// A ve B arasına giriyorsa A.odo ≤ yeni.odo ≤ B.odo olmalı.
// Mesajlar GÖSTERİM biriminde (mi kullanıcısı formundaki sayıları görsün).
async function odoNeighbourCheck(aracId, tarih, odoKm, excludeId) {
  const d = km => fmtNum(distDisp(km), 0) + ' ' + S.unit;
  const veh = aracId != null ? await db.vehicles.get(aracId) : null;
  if (veh?.kmStart != null && odoKm < veh.kmStart)
    return {ok: false, msg: t('odoBelowStart', {a: d(veh.kmStart)})};

  const mine = (await db.sessions.toArray())
    .filter(r => vehEq(r.aracId, aracId) && r.odo != null && r.id !== excludeId)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const before = [...mine].reverse().find(r => r.tarih <= tarih);
  const after = mine.find(r => r.tarih > tarih);
  const lo = before ? before.odo : null, hi = after ? after.odo : null;
  const okLo = lo == null || odoKm >= lo;
  const okHi = hi == null || odoKm <= hi;
  if (okLo && okHi) return {ok: true};
  if (lo != null && hi != null) return {ok: false, msg: t('odoRange',
    {a: d(lo), b: d(hi), da: shortDate(before.tarih), db: shortDate(after.tarih)})};
  if (!okLo) return {ok: false, msg: t('odoMin', {a: d(lo), da: shortDate(before.tarih)})};
  return {ok: false, msg: t('odoMax', {b: d(hi), db: shortDate(after.tarih)})};
}

// WT-20/4: atlanan şarj sezgisi. WLTP MENZİL KULLANILMAZ — araçlar o değere
// ulaşmadığı için yanlış alarm üretir. Kullanıcının KENDİ geçmişi ölçüdür:
// aracın son 10 kaydının ortalama tüketimi (kWh/100km) alınır; yeni kaydın
// tüketimi bu ortalamanın YARISINDAN düşükse (aynı enerjiyle anormal çok yol
// gidilmiş görünüyorsa) sorulur. En az 5 geçmiş kayıt yoksa sorulmaz.
async function looksLikeMissedCharge(aracId, mesafeKm, kwh, excludeId) {
  if (!(mesafeKm > 0) || !(kwh > 0)) return false;
  const gecmis = (await db.sessions.toArray())
    .filter(r => vehEq(r.aracId, aracId) && r.id !== excludeId
      && !r.atlanan && r.mesafeKm > 0 && r.kwh > 0)
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .slice(0, 10);
  if (gecmis.length < 5) return false;                 // yeterli temel yok
  const ortTuketim = gecmis.reduce((s, r) => s + r.kwh / r.mesafeKm * 100, 0) / gecmis.length;
  const buTuketim = kwh / mesafeKm * 100;
  return buTuketim < ortTuketim / 2;
}

// Araç sayacı = kayıtlardaki en son tarihli odo ile elle girilen değerden
// BÜYÜK olanı. Hangisinin kullanıldığı Aracım sayfasında not olarak yazılır.
async function odoNowOf(v) {
  if (!v) return {km: null, src: null};
  const mine = (await db.sessions.toArray())
    .filter(r => vehEq(r.aracId, v.id) && r.odo != null)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  const fromRec = mine.length ? mine[mine.length - 1].odo : null;
  const manual = v.kmNow ?? null;
  if (fromRec == null && manual == null) return {km: null, src: null};
  if (fromRec == null) return {km: manual, src: 'manual'};
  if (manual == null) return {km: fromRec, src: 'records'};
  return fromRec >= manual
    ? {km: fromRec, src: 'records'} : {km: manual, src: 'manual'};
}
function applyTheme() {
  const dark = S.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = dark ? '#0f172a' : '#F1F7F2';
  document.querySelectorAll('[data-themetoggle]').forEach(b => { b.textContent = dark ? '☀️' : '🌙'; });
  const st = document.getElementById('set-theme');
  if (st) st.querySelectorAll('button').forEach(x =>
    x.classList.toggle('sel', x.dataset.v === (dark ? 'dark' : 'light')));
}
document.querySelectorAll('[data-themetoggle]').forEach(b =>
  b.addEventListener('click', async () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    await saveSetting('theme', S.theme);
    applyTheme();
    RENDER[screen]?.();   // grafik/donut renkleri temaya göre yeniden çizilsin
  }));
const chargersFor = code => (CHARGERS[code] || CHARGERS_DEFAULT);
const banksFor = code => (BANKS_BY[code] || BANKS_DEFAULT);
// Banka listesi: kullanıcının banka ülkelerinin birleşimi (şarj ülkesinden bağımsız)
function bankOptions() {
  const codes = (S.bankCountries && S.bankCountries.length) ? S.bankCountries : [S.country];
  const list = [...(S.customBanks || [])];
  codes.forEach(cc => banksFor(cc).forEach(b => { if (!list.includes(b)) list.push(b); }));
  ['Visa', 'Mastercard'].forEach(b => { if (!list.includes(b)) list.push(b); });
  return ['', ...list].map(b => `<option value="${esc(b)}">${b || '—'}</option>`).join('') +
    `<option value="__newbank">${t('newBank')}</option>`;
}

// ---------- araç silüetleri & özet kartı ----------
function carSVG(body, color) {
  const c = color || '#1C8742';
  const P = {
    sedan: 'M20 62 Q22 50 42 47 L62 34 Q80 26 112 26 Q144 26 158 36 L170 46 Q196 49 202 58 Q206 62 204 68 L188 68 A14 14 0 0 0 160 68 L84 68 A14 14 0 0 0 56 68 L24 68 Q18 66 20 62 Z',
    suv:   'M20 60 Q20 44 40 42 L56 26 Q64 18 100 18 Q140 18 152 28 L166 42 Q198 45 202 56 Q205 62 202 68 L186 68 A14 14 0 0 0 158 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q17 66 20 60 Z',
    hatch: 'M24 60 Q24 46 44 44 L58 28 Q66 20 100 20 Q126 20 138 28 L154 44 Q182 47 188 56 Q192 62 188 68 L174 68 A13 13 0 0 0 148 68 L82 68 A13 13 0 0 0 56 68 L28 68 Q21 66 24 60 Z',
    pickup:'M18 62 Q18 46 38 44 L52 26 Q58 18 92 18 L108 18 L110 42 L196 42 Q204 44 204 56 L204 62 Q204 68 198 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L22 68 Q16 66 18 62 Z',
    van:   'M20 62 Q20 30 44 28 L150 24 Q196 24 202 46 L202 60 Q202 68 196 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q18 66 20 62 Z'
  };
  const win = {
    sedan: 'M66 36 L112 30 Q136 30 150 38 L118 44 L70 44 Z',
    suv:   'M60 28 L100 24 Q132 24 146 32 L118 42 L64 42 Z',
    hatch: 'M62 30 L100 26 Q120 26 132 32 L116 42 L66 42 Z',
    pickup:'M56 28 L92 24 L104 24 L106 40 L60 40 Z',
    van:   'M48 32 L140 28 Q170 28 182 40 L150 46 L52 46 Z'
  };
  return `<svg viewBox="0 0 220 84" xmlns="http://www.w3.org/2000/svg">
    <path d="${P[body] || P.suv}" fill="${c}" opacity=".9"/>
    <path d="${win[body] || win.suv}" fill="#F1F7F2" opacity=".85"/>
    <circle cx="70" cy="68" r="11" fill="#131714"/><circle cx="70" cy="68" r="5" fill="#8B918C"/>
    <circle cx="172" cy="68" r="11" fill="#131714"/><circle cx="172" cy="68" r="5" fill="#8B918C"/>
  </svg>`;
}
function evSummaryHTML(v) {
  const yr = v.y1 ? (v.y1 + (v.y2 ? '–' + v.y2 : '+')) : '—';
  const visual = v.photo
    ? `<img class="carphoto" src="${v.photo}" alt="">`
    : carSVG(v.body, colorFor(v.brand || v.ad || ''));
  return `<div class="ev-summary">
    ${visual}
    <div class="name">${esc((v.brand ? v.brand + ' ' : '') + (v.model || v.ad || ''))}</div>
    <div class="trim">${esc(v.trim || '')}${v.trim ? ' · ' : ''}${yr}</div>
    <div class="spec-grid">
      <div class="spec"><div class="k">${t('battery')}</div><div class="v">${v.batt ? v.batt + ' kWh' : '—'}</div></div>
      <div class="spec"><div class="k">${t('arch')}</div><div class="v">${v.arch ? v.arch + ' V' : '—'}</div></div>
      <div class="spec"><div class="k">${t('dcMax')}</div><div class="v">${v.dc ? v.dc + ' kW' : '—'}</div></div>
      <div class="spec"><div class="k">${t('acMax')}</div><div class="v">${v.ac ? v.ac + ' kW' : '—'}</div></div>
      <div class="spec" style="grid-column:1/-1"><div class="k">${t('range')}</div><div class="v">${v.range ? Math.round(distDisp(v.range)) + ' ' + S.unit : '—'}</div></div>
    </div>
  </div>`;
}
// fotoğrafı küçültüp dataURL yap (max 640px genişlik)
function resizePhoto(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(640, img.width);
      const h = Math.round(img.height * w / img.width);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      res(cv.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- döviz kuru (frankfurter — ECB) ----------
// Bir para biriminin o günkü TÜM kur tablosunu çek (çift yönlü dönüşüm için)
async function fetchTable(from, date) {
  const day = date && date < localISO() ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}`,
    `https://api.frankfurter.app/${day}?from=${from}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4500);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      if (j && j.rates) { j.rates[from] = 1; return {rates: j.rates, date: j.date || day}; }
    } catch (e) { /* sıradaki */ }
  }
  return null;
}
// Kur tablosu eksik kayıtları sessizce tamamla (oturum başına sınırlı)
async function backfillRates() {
  const all = await db.sessions.toArray();
  const need = all.filter(r => r.cur && !r.fxTable);
  const groups = {};
  need.forEach(r => { (groups[r.cur + '|' + r.tarih.slice(0, 10)] ||= []).push(r); });
  let calls = 0;
  for (const key of Object.keys(groups)) {
    if (calls >= 8) break;
    const [cur, date] = key.split('|');
    const got = await fetchTable(cur, date);
    calls++;
    if (got) for (const r of groups[key])
      await db.sessions.update(r.id, {fxTable: got.rates, fxDate: got.date});
  }
}
async function fetchRate(from, to, date) {
  const day = date && date < localISO() ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}&symbols=${to}`,
    `https://api.frankfurter.app/${day}?from=${from}&to=${to}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      const v = j && j.rates && j.rates[to];
      if (v) return {rate: v, date: j.date || day};
    } catch (e) { /* sıradaki kaynak */ }
  }
  return null;
}

// ============================================================
// i18n
// ============================================================
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // WT-21/WT-22: aria-label'lar da çevrilsin (sabit Türkçe kalmasın)
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  if (typeof scanBadData === 'function') scanBadData();   // uyarı şeridi dil değişiminde tazelensin
  if (typeof migrateExpenseVehicles === 'function')        // WT-18/3
    migrateExpenseVehicles().then(() => scanOrphans());
  else if (typeof scanOrphans === 'function') scanOrphans();   // WT-09/C
  $('d-100-lbl').textContent = t('cost100', {u: S.unit});
  $('d-1km-lbl').textContent = '1 ' + S.unit;
  $('d-1km-lbl2').textContent = '1 ' + S.unit;
  $('c-1km-lbl').textContent = t('ev1', {u: S.unit, x: t('netLbl')});
  $('c-1km-g-lbl').textContent = t('ev1', {u: S.unit, x: t('grossLbl')});
  $('d-100-lbl2').textContent = t('cost100', {u: S.unit});
  $('in-dist-lbl').textContent = t('distance', {u: S.unit});
  $('in-amount-lbl').textContent = t('amount', {s: sym()});
  $('c-price-lbl').textContent = t('fuelPrice', {s: sym()});
  $('c-cons-lbl').textContent = t('fuelCons');
  $('c-ev-lbl').textContent = t('evCost', {u: S.unit});
  $('c-evg-lbl').textContent = t('evCostG', {u: S.unit});
  $('c-ice-lbl').textContent = t('iceCost', {u: S.unit});
  $('c-ice1km-lbl').textContent = t('ice1', {u: S.unit});
  $('c-tcoice1km-lbl').textContent = t('tco1kmIce', {u: S.unit});
  $('c-discfx-lbl').textContent = t('discEffect', {u: S.unit});
  $('c-perkm-lbl').textContent = t('perUnitSaving', {u: S.unit});
  $('c-nf-ev-km-lbl').textContent = 'EV · ' + t('nonFuelKm', {u: S.unit});
  $('c-nf-ice-km-lbl').textContent = t('iceShort') + ' · ' + t('nonFuelKm', {u: S.unit});
  $('c-nf-ev-100-lbl').textContent = 'EV · ' + t('nonFuel100', {u: S.unit});
  $('c-nf-ice-100-lbl').textContent = t('iceShort') + ' · ' + t('nonFuel100', {u: S.unit});
  $('c-nf-ev-yr-lbl').textContent = 'EV · ' + t('nonFuelYear');
  $('c-nf-ice-yr-lbl').textContent = t('iceShort') + ' · ' + t('nonFuelYear');
  $('c-nf-kwh-lbl').textContent = 'EV · ' + t('nonFuelKwh');
  $('c-nf-bar-ice-name').textContent = t('iceShort');
  $('country-search').placeholder = t('country') + '…';
  $('ob-ev-search').placeholder = t('searchCar');
  $('car-search').placeholder = t('searchCar');
  $('btn-adv').textContent =
    $('adv-fields').classList.contains('open') ? t('advancedHide') : t('advanced');
  document.documentElement.lang = S.lang;
}

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
  document.querySelector('.content').scrollTop = 0;
}

// ============================================================
// OVERLAY YÖNETİMİ (WT-24)
// ============================================================
// Overlay'ler düz <section> idi: ekran okuyucu arkadaki sayfayı okumaya devam
// ediyor, klavye kullanıcısı dışarı çıkabiliyor, Escape kapatmıyor ve Android
// donanım geri tuşu overlay yerine UYGULAMADAN çıkıyordu.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const overlayStack = [];          // en üstteki en sonda
// Kapatmadan önce onay isteyen overlay'ler: dolu formu kazara kaybetmeyelim.
// "Boş mu?" diye bakmak yetmez — düzenleme modunda alanlar zaten doludur ve
// hiçbir şey değiştirmeden × basan kullanıcıya her seferinde onay sorulur.
// Bu yüzden açılıştaki değerler bir anlık görüntüye alınıp onunla kıyaslanır.
const WATCHED = {
  'page-add': ['in-date', 'in-kwh', 'in-amount', 'in-disc-val', 'in-dist', 'in-odo',
               'in-missed', 'in-unitprice',
               'in-loc', 'in-note', 'in-rate', 'in-socb', 'in-soca',
               'in-dur-h', 'in-dur-m'],
  'page-expense': ['in-exp-date', 'in-exp-amount', 'in-exp-note', 'in-exp-altad']
};
const formSnapshot = id => (WATCHED[id] || []).map(f => $(f)?.value ?? '').join(' ');
// openAdd/openExpense sonunda çağrılır — "temiz" durumu buradan sabitlenir
function markFormClean(id) {
  const el = $(id);
  if (el) el._clean = formSnapshot(id);
}
const DIRTY_CHECK = {
  'page-add': () => $('page-add')._clean !== formSnapshot('page-add'),
  'page-expense': () => $('page-expense')._clean !== formSnapshot('page-expense')
};

function overlayOpen(id) {
  const el = $(id);
  if (!el || overlayStack.includes(id)) return;
  el._opener = document.activeElement;
  el.classList.add('active');
  overlayStack.push(id);
  syncOverlayState();
  // açılışta ilk odaklanabilir öğeye git
  const first = el.querySelector(FOCUSABLE);
  if (first) setTimeout(() => first.focus(), 30);
  // geri tuşu: overlay açılınca geçmişe bir adım koy
  history.pushState({overlay: id}, '');
}

// fromPop: popstate'ten geliyorsa geçmişten ayrıca geri gitme
async function overlayClose(id, {fromPop = false, force = false} = {}) {
  const el = $(id);
  if (!el || !overlayStack.includes(id)) return false;
  if (!force && DIRTY_CHECK[id]?.() && !confirm(t('discardAsk'))) {
    // kullanıcı vazgeçti: popstate ile tüketilen geçmiş adımını geri koy
    if (fromPop) history.pushState({overlay: id}, '');
    return false;
  }
  el.classList.remove('active');
  overlayStack.splice(overlayStack.indexOf(id), 1);
  syncOverlayState();
  el._opener?.focus?.();
  el._opener = null;
  // Programatik kapatmada geçmiş adımını da tüket. Bunun tetiklediği popstate
  // altta kalan overlay'i yanlışlıkla kapatmasın diye bir kez bastırılır.
  if (!fromPop && history.state?.overlay === id) { suppressPop++; history.back(); }
  return true;
}
let suppressPop = 0;

function syncOverlayState() {
  const open = overlayStack.length > 0;
  const app = document.querySelector('.app');
  // arkadaki uygulama hem klavyeden hem ekran okuyucudan çıkarılsın
  if ('inert' in HTMLElement.prototype) app.inert = open;
  app.setAttribute('aria-hidden', open ? 'true' : 'false');
}

// Escape kapatır, Tab döngüsü overlay içinde kalır
document.addEventListener('keydown', e => {
  if (!overlayStack.length) return;
  const id = overlayStack[overlayStack.length - 1];
  const el = $(id);
  if (e.key === 'Escape') { e.preventDefault(); overlayClose(id); return; }
  if (e.key !== 'Tab') return;
  const items = [...el.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// Android donanım geri tuşu / tarayıcı geri: en üstteki overlay'i kapat
window.addEventListener('popstate', e => {
  if (suppressPop > 0) { suppressPop--; return; }
  // Overlay açıksa önce o kapanır
  if (overlayStack.length) {
    overlayClose(overlayStack[overlayStack.length - 1], {fromPop: true});
    return;
  }
  // Sekme geçmişi: hedef sekmeye dön (yeniden pushState YAPMA)
  const page = e.state?.page;
  if (page && page !== screen) showScreen(page, {push: false});
});

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
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
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

  const allRaw = await db.sessions.toArray();
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
  const fill100 = (npk, gpk) => {   // npk/gpk: birim başına (km) net/brüt
    $('d-1km').textContent = money2(npk * f);
    $('d-1km-g').textContent = money2(gpk * f);
    $('d-100').textContent = money2(npk * 100 * f);
    $('d-100-g').textContent = money2(gpk * 100 * f);
  };
  // WT-14/B: dönemde <20 km varsa kutular SESSİZCE tüm-zamanlar sayaç moduna
  // düşüyordu. Mod artık kutuların altında yazılı.
  const scopeEl = $('d-dist-scope');
  if (distKm >= 20) {
    fill100(netD / distKm, grossD / distKm);
    scopeEl.textContent = t('distFromRecords');
  } else {
    const oV = pickOdoVeh(vehicles, S.dashVeh);
    const oDist = odoDistOf(oV);
    if (oDist >= 20) {
      const allConv = all.filter(isConv);
      const aNet = allConv.reduce((s, r) => s + amtB(r), 0);
      const aGross = aNet + allConv.reduce((s, r) => s + savB(r), 0);
      fill100(aNet / oDist, aGross / oDist);
      scopeEl.textContent = t('distFromOdoAll');
    } else {
      ['d-1km','d-1km-g','d-100','d-100-g'].forEach(id => $(id).textContent = '—');
      scopeEl.textContent = '';
    }
  }
  $('d-kwh').textContent = fmtNum(kwh, 0);
  // Ham kWh tüm kayıtları sayar; oran metrikleri saymaz — fark varsa söyle
  $('d-kwh-note').textContent = conv.length !== cur.length ? ' · ' + t('allRecordsNote') : '';
  $('d-sess').textContent = cur.length + ' / ' + new Set(cur.map(r => r.firma)).size;
  $('d-disc').textContent = money(sav);
  $('d-free').textContent = cur.filter(r => r.free).length;

  const now = new Date();

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
  const socs = dsAll.filter(r => r.socB != null && r.socA != null);
  $('d-soc').textContent = socs.length
    ? '%' + Math.round(socs.reduce((s, r) => s + r.socB, 0) / socs.length) +
      ' → %' + Math.round(socs.reduce((s, r) => s + r.socA, 0) / socs.length)
    : '—';
  // ort. şarj gücü (kWh/saat) — süre girilmiş kayıtlardan
  const powKwh = durs.reduce((s, r) => s + r.kwh, 0);
  const powMin = durs.reduce((s, r) => s + r.dur, 0);
  $('d-power').textContent = powMin > 0 ? fmtNum(powKwh / (powMin / 60), 1) + ' kWh/h' : '—';
  $('d-dstat-scope').textContent = periodShort(S.period);

  // yıllık karşılaştırma (bu yıl vs geçen yıl — tüm zamanlar, dönem seçiciden bağımsız)
  const thisY = String(now.getFullYear()), lastY = String(now.getFullYear() - 1);
  const yThisArr = all.filter(r => r.tarih.slice(0, 4) === thisY);
  const yLastArr = all.filter(r => r.tarih.slice(0, 4) === lastY);
  const ySumThis = yThisArr.reduce((s, r) => s + amtB(r), 0), ySumLast = yLastArr.reduce((s, r) => s + amtB(r), 0);
  const yKwhThis = yThisArr.reduce((s, r) => s + r.kwh, 0), yKwhLast = yLastArr.reduce((s, r) => s + r.kwh, 0);
  const yPriceThis = yKwhThis ? ySumThis / yKwhThis : 0, yPriceLast = yKwhLast ? ySumLast / yKwhLast : 0;
  // Bu blok kasıtlı olarak dönem seçicisinden bağımsız (bu yıl / geçen yıl).
  // WT-14 kabul kriteri: değişmeyen her sayı nedenini söyleyen bir rozet taşımalı.
  if ($('d-yr-scope')) $('d-yr-scope').textContent = thisY;
  $('d-yr-spend').textContent = money(ySumThis);
  $('d-yr-kwh').textContent = fmtNum(yKwhThis, 0) + ' kWh';
  $('d-yr-price').textContent = yKwhThis ? fm(sym(), fmtNum(yPriceThis, 2)) : '—';
  const yDelta = (curV, prevV, id) => {
    const el = $(id);
    if (prevV > 0) {
      const pct = Math.round((curV - prevV) / prevV * 100);
      el.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct + '% ' + t('vsLastYear');
      el.style.color = pct >= 0 ? 'var(--red)' : 'var(--accent-dark)';
    } else { el.textContent = ''; }
  };
  yDelta(ySumThis, ySumLast, 'd-yr-spend-d');
  yDelta(yKwhThis, yKwhLast, 'd-yr-kwh-d');
  yDelta(yPriceThis, yPriceLast, 'd-yr-price-d');

  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 3);
  $('d-recent').innerHTML = sorted.length
    ? sorted.map(r => rowHTML(r, false)).join('')
    : `<div class="empty">${t('noData')}</div>`;
  $('d-recent').querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
$('d-viewall').addEventListener('click', () => showScreen('history'));

// ============================================================
// İSTATİSTİK (ana sayfadan taşınan grafikler + dağılımlar)
// ============================================================
async function renderStats() {
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
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

  const all = vehFilter(await db.sessions.toArray(), S.dashVeh);
  reportFxGaps(all, 's-warnings', 'fxStats');   // WT-10

  // WT-15: d-gran segmenti YALNIZCA harcama grafiğini etkiliyordu; altındaki
  // gün dağılımı, firma dağılımı, donut, bankalar ve lokasyonlar hepsi tüm
  // zamanlardı — ama görsel olarak aynı seçicinin altındaydılar.
  const cur = granFilter(all);
  $('s-gran-lbl').textContent = t('periodLbl', {p: periodShort(S.gran)});
  $('s-chart-scope').textContent = t('chartTrendNote');

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
        sum: all.filter(r => r.tarih.slice(0, 10) === key).reduce((s, r) => s + amtB(r), 0)
      });
    }
  } else if (S.gran === 'year') {
    for (let i = 4; i >= 0; i--) {
      const y = String(now.getFullYear() - i);
      bars.push({label: y, year: y,
        sum: all.filter(r => r.tarih.slice(0, 4) === y).reduce((s, r) => s + amtB(r), 0)});
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      bars.push({
        label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
        year: String(d.getFullYear()),
        sum: all.filter(r => monthKey(r.tarih) === key).reduce((s, r) => s + amtB(r), 0)
      });
    }
  }
  const maxM = Math.max(1, ...bars.map(b => b.sum));
  $('d-months').innerHTML = bars.map(b =>
    `<div class="mb" data-y="${b.year}" style="cursor:pointer">
      <div class="amt">${b.sum ? money(b.sum) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(b.sum / maxM * 66)}px"></div>
      <div class="m">${b.label}</div>
    </div>`).join('');
  $('d-months').querySelectorAll('.mb').forEach(el =>
    el.addEventListener('click', () => { histYear = el.dataset.y; showScreen('history'); }));

  // haftanın günlerine göre dağılım (dönem filtreli, Pzt→Paz)
  const wdSum = [0, 0, 0, 0, 0, 0, 0];
  cur.forEach(r => {
    const [ry, rm, rd] = r.tarih.slice(0, 10).split('-').map(Number);
    const day = (new Date(ry, rm - 1, rd).getDay() + 6) % 7;
    wdSum[day] += amtB(r);
  });
  const maxW = Math.max(1, ...wdSum);
  $('d-weekdays').innerHTML = wdSum.map((v, i) =>
    `<div class="mb">
      <div class="amt">${v ? money(v) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(v / maxW * 66)}px"></div>
      <div class="m">${DAYS[S.lang][i]}</div>
    </div>`).join('');

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
    </div>`).join('') : `<div class="empty">${t('noData')}</div>`;

  // WT-16/5: İKİ AYRI donut. Eskiden tek donutta DC / AC / Ev vardı; DC-AC bir
  // TEKNOLOJİ boyutu, "Ev" bir FİRMA değeriydi — ev şarjı da fiziksel olarak AC
  // olduğu için aynı kayıt ana sayfada "AC", donutta "Ev" sayılıyordu.
  const trackCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  const drawDonut = (svgId, legendId, segs) => {
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
      `<div class="li" style="color:var(--faint)">${t('noData')}</div>`;
  };
  const sumKwh = list => list.reduce((s, r) => s + r.kwh, 0);
  // Şarj TİPİ: yalnız `tip` alanından — ana sayfadaki DC/AC filtresiyle aynı kaynak
  drawDonut('d-donut', 'd-donut-legend', [
    {name: 'DC', kwh: sumKwh(cur.filter(r => r.tip === 'DC')), col: '#16A34A'},
    {name: 'AC', kwh: sumKwh(cur.filter(r => r.tip !== 'DC')), col: '#1B5FAA'}
  ].filter(x => x.kwh > 0));
  // Şarj YERİ: `mekan` alanından. Eski kayıtlarda mekan yoksa firma adına düş.
  const isHome = r => (r.mekan ? r.mekan === 'evis' : isHomeFirm(r.firma));
  drawDonut('d-donut2', 'd-donut2-legend', [
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
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;

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
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;
}

function rowHTML(r, withDelete) {
  const s = savingsOf(r);
  const cs = symOf(r.cur || S.currency);
  return `<div class="crow" data-id="${r.id}">
    <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
    <div class="mid">
      <div class="name">${esc(r.firma)}</div>
      <div class="sub">${shortDate(r.tarih)} · ${r.kwh} kWh · ${r.tip || 'DC'}${r.mesafeKm ? ' · ' + Math.round(distDisp(r.mesafeKm)) + ' ' + S.unit : ''}${r.atlanan ? ` · <span title="${esc(t('missedTag'))}" aria-label="${esc(t('missedTag'))}">⚠︎</span>` : ''}</div>
    </div>
    <div class="right">
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : fm(cs, fmtNum(r.odenen, 0))}</div>
      <div class="sav">${s > 0 ? '−' + fm(cs, fmtNum(s, 0)) : ''}</div>
    </div>
    ${withDelete ? `<button class="del" data-del="${r.id}">×</button>` : ''}
  </div>`;
}

// ============================================================
// GEÇMİŞ
// ============================================================
async function renderHistory() {
  const all = await db.sessions.toArray();
  const vehicles = await db.vehicles.toArray();
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
  const rows = badOnly
    ? sorted.filter(r => badOnly.includes(r.id))   // diğer filtreleri atla
    : sorted.filter(r =>
        (!vy || r.tarih.slice(0, 4) === vy) &&
        (!vf || r.firma === vf) &&
        (!vt || (vt === 'free' ? r.free : r.tip === vt)) &&
        (!vv || String(r.aracId) === vv) &&
        (!vb || r.banka === vb) &&
        (!vl || r.loc === vl));
  if (badOnly) { fy.value = ''; ff.value = ''; ft.value = ''; fv.value = ''; fb.value = ''; fl.value = ''; }

  const box = $('h-groups');
  if (!rows.length) { box.innerHTML = `<div class="empty">${t('noData')}</div>`; return; }

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
      toast(t('deleted'));
      renderHistory();
    }));
  box.querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
['f-year','f-firm','f-type','f-veh','f-bank','f-loc'].forEach(id => $(id).addEventListener('change', renderHistory));
let histYear = null;

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
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
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
  const allV = await db.vehicles.toArray();
  const inclArch = $('c-inclarch').checked;
  const activeIds = new Set(allV.filter(v => inclArch || !v.archived).map(v => v.id));
  const exAll = await db.expenses.toArray();
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

  const all = vehFilter(await db.sessions.toArray(), S.cmpVeh);
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

// ============================================================
// AYARLAR
// ============================================================
async function renderSettings() {
  $('app-version').textContent = APP_VERSION + ' · ' + APP_DATE;
  $('set-homekwh').value = S.homeKwhPrice != null ? fmtInput(S.homeKwhPrice, 2) : '';
  $('set-homekwh-lbl').textContent = t('homeKwhPrice') + ' — ' + sym();
  const c = COUNTRIES.find(x => x[0] === S.country);
  $('set-country-val').textContent = c ? c[1] + ' ' + c[2] : '—';

  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('set-currency').innerHTML = curs.map(k =>
    `<option value="${k}" ${k === S.currency ? 'selected' : ''}>${k} (${symOf(k)})</option>`).join('');
  $('set-unit').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === S.unit));
  $('set-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}" ${k === S.lang ? 'selected' : ''}>${LANG_NAMES[k]}</option>`).join('');
  $('set-adv').checked = !!S.advOpen;
  $('set-theme').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (S.theme || 'light')));
  renderBankCountries();
}

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
  const others = (await db.vehicles.toArray()).filter(v => v.id !== vid);
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
  const vs = await db.vehicles.toArray();
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
  const ids = new Set((await db.vehicles.toArray()).map(v => v.id));
  const orphS = (await db.sessions.toArray()).filter(r => r.aracId != null && !ids.has(r.aracId));
  const orphE = (await db.expenses.toArray()).filter(r => r.aracId != null && !ids.has(r.aracId));
  const n = orphS.length + orphE.length;
  if (!n) { setWarning('orphan', null); return; }
  setWarning('orphan', {
    msg: t('orphanWarn', {n}),
    actionLbl: t('orphanAssign'),
    action: async () => {
      const vs = await db.vehicles.toArray();
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

async function renderVehiclePage() {
  const allV = await db.vehicles.toArray();
  const vehicles = allV.filter(v => !v.archived);
  const archived = allV.filter(v => v.archived);
  const odoInfo = {};                       // WT-19/5
  for (const v of allV) odoInfo[v.id] = await odoNowOf(v);
  $('set-vehicles').innerHTML = vehicles.length ? vehicles.map(v => {
    // WT-19/5: sayaç = kayıtlardaki en son odo ile elle girilen değerden büyüğü
    const od = odoInfo[v.id] || {km: null, src: null};
    const kmTxt = od.km != null ? fmtNum(distDisp(od.km), 0) + ' ' + S.unit : '';
    const srcTxt = od.src ? t(od.src === 'records' ? 'odoFromRecords' : 'odoFromManual') : '';
    const sub = [v.batt ? `${v.trim || ''} · ${v.batt} kWh` : '', kmTxt, srcTxt]
      .filter(Boolean).join(' · ');
    const isDef = v.id === S.defaultVehicleId || (!S.defaultVehicleId && vehicles[0].id === v.id);
    const thumb = v.photo ? `<img class="vthumb" src="${v.photo}" alt="">` : '';
    return `<li data-vid="${v.id}">
      <button class="star ${isDef ? 'on' : ''}" data-star="${v.id}" title="varsayılan">★</button>
      ${thumb}
      <div class="vn">${esc(vehName(v))}<div class="vd">${esc(sub)}</div></div>
      <button class="cam" data-odo="${v.id}" title="kilometre güncelle" style="font-size:11px;font-weight:800;width:36px">km✎</button>
      <button class="cam" data-cam="${v.id}" title="fotoğraf">📷</button>
      <button class="cam" data-move="${v.id}" title="${esc(t('moveRecords'))}">⇄</button>
      <button class="rm" data-rm="${v.id}" title="arşivle">×</button>
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
        const rest = (await db.vehicles.toArray()).filter(v => !v.archived);
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
  const exAllV = await db.expenses.toArray();
  const ex = S.vehExpVeh
    ? exAllV.filter(e => String(e.aracId) === S.vehExpVeh || !e.aracId)
    : exAllV;

  // ---- toplam gider metrikleri (şarj + sabit) ----
  const sessV = vehFilter(await db.sessions.toArray(), S.vehExpVeh);
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
    const now = new Date();
    const ebars = [];
    if (gran === 'year') {
      for (let i = 4; i >= 0; i--) {
        const y = String(now.getFullYear() - i);
        ebars.push({label: y,
          sum: ex.filter(e => e.tarih.slice(0, 4) === y).reduce((s, e) => s + expB(e), 0)});
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        ebars.push({label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
          sum: ex.filter(e => e.tarih.slice(0, 7) === key).reduce((s, e) => s + expB(e), 0)});
      }
    }
    const maxE = Math.max(1, ...ebars.map(b => b.sum));
    $('v-exp-chart').innerHTML = ebars.map(b =>
      `<div class="mb">
        <div class="amt">${b.sum ? money(b.sum) : ''}</div>
        <div class="bar" style="height:${6 + Math.round(b.sum / maxE * 66)}px"></div>
        <div class="m">${b.label}</div>
      </div>`).join('');
  }

  const expList = $('c-exp-list');
  if (!ex.length) {
    expList.innerHTML = `<div class="about" style="margin:0">${t('noExpenses')}</div>`;
    $('c-exp-cats-wrap').style.display = 'none';
  } else {
    const sortedExp = [...ex].sort((a, b) => b.tarih.localeCompare(a.tarih));
    expList.innerHTML = sortedExp.map(e => `
      <div class="crow" data-exp="${e.id}" style="cursor:pointer">
        <div class="avatar" style="background:var(--chip);color:var(--accent-text)">${EXP_ICON[e.tur] || '📦'}</div>
        <div class="mid">
          <div class="name">${e.altAd ? esc(e.altAd) : t('exp_' + e.tur)}</div>
          <div class="sub">${shortDate(e.tarih + 'T00:00')}${e.not ? ' · ' + esc(e.not) : ''}</div>
        </div>
        <div class="right"><div class="amt">${fm(symOf(e.cur || S.currency), fmtNum(e.tutar, 0))}</div></div>
      </div>`).join('');
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
    const dataUrl = await resizePhoto(file);
    if (photoTargetVid) {
      const w = await safeWrite(() => db.vehicles.update(photoTargetVid, {photo: dataUrl}));   // WT-12
      photoTargetVid = null;
      if (!w.ok) return;
      toast(t('photoAdded'));
      renderVehiclePage();
    } else if (carPick) {
      carPick.photo = dataUrl;
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
      for (const [k, v] of [['country', S.country], ['currency', S.currency], ['unit', S.unit], ['lang', S.lang]])
        await saveSetting(k, v);
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
$('country-search').addEventListener('input', e => renderCountryList(e.target.value));

// ---------- araç arama (ortak) ----------
function searchEV(q) {
  q = (q || '').toLocaleLowerCase('tr').trim();
  if (q.length < 2) return [];
  return EV_DB
    .map((e, i) => ({i, brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
      batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]}))
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
        <div class="d">${esc(v.trim)} · ${yr} · ${v.batt} kWh · ${v.arch}V</div>
      </div>`;
    }).join('');
    box.querySelectorAll('.ev-item').forEach(el =>
      el.addEventListener('click', () => {
        box.querySelectorAll('.ev-item').forEach(x =>
          x.classList.toggle('sel', x === el));
        const e = EV_DB[+el.dataset.i];
        const v = {brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
          batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]};
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
       range: v.range, body: v.body}
    : {ad: v.ad, body: v.body || 'suv'};
  if (v.photo) rec.photo = v.photo;
  return rec;
}

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

async function formCountryChanged(keepRate) {
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const all = await db.sessions.toArray();
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
  $('in-odo-lbl').textContent = t('odoOrDist');
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

  // firma / banka / kur — ülkeye göre (düzenlemede firmayı koru)
  await (async () => {
    const all = await db.sessions.toArray();
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
      if (!r?.rate) formCountryChanged();
    }
  })();

  // lokasyon önerileri (daha önce girilenler)
  const locs = [...new Set((await db.sessions.toArray()).map(x => x.loc).filter(Boolean))];
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
  let vehicles = (await db.vehicles.toArray()).filter(v => !v.archived || v.id === r?.aracId);
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
  const showErr = (msg, id) => {
    $('form-err').textContent = msg;
    $('form-err').classList.add('show');
    if (id) {
      const el = $(id);
      if (el && $('adv-fields').contains(el)) $('adv-fields').classList.add('open');
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
      const onceki = (await db.sessions.toArray())
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
  // kur tablosunu sessizce ekle (çift yönlü dönüşüm için — yerli kayıt dahil)
  fetchTable(c[3], rec.tarih.slice(0, 10)).then(got => {
    if (got) db.sessions.update(recId, {fxTable: got.rates, fxDate: got.date})
      .then(() => { if (screen === 'dashboard') renderDashboard(); });
  });
});

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
  const vs = (await db.vehicles.toArray()).filter(v => !v.archived || v.id === rec?.aracId);
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
    not: $('in-exp-note').value.trim()
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

// ============================================================
// ONBOARDING (kompakt: açılır listeler)
// ============================================================
let obEv = null;
function initOnboarding() {
  $('ob-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join('');
  $('ob-country').value = 'TR';
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('ob-currency').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  $('ob-currency').value = 'TRY';
  $('ob-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}">${LANG_NAMES[k]}</option>`).join('');
  $('ob-lang').value = S.lang;

  $('ob-country').addEventListener('change', () => {
    const c = COUNTRIES.find(x => x[0] === $('ob-country').value);
    $('ob-currency').value = c[3];
    $('ob-unit').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === c[5]));
    if (LANG_NAMES[c[6]]) {
      $('ob-lang').value = c[6];
      S.lang = c[6];
      applyI18n();
    }
  });
  $('ob-lang').addEventListener('change', () => {
    S.lang = $('ob-lang').value;
    applyI18n();
  });
  $('ob-unit').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('ob-unit').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  });
  $('ob-next').addEventListener('click', () => {
    $('ob-step1').style.display = 'none';
    $('ob-step2').style.display = '';
    $('obp2').classList.add('on');
  });
  $('ob-back').addEventListener('click', () => {
    $('ob-step2').style.display = 'none';
    $('ob-step1').style.display = '';
    $('obp2').classList.remove('on');
  });
  bindEVSearch('ob-ev-search', 'ob-ev-results', 'ob-ev-summary', v => {
    obEv = v;
    $('ob-done').disabled = !v;
    $('ob-km-wrap').style.display = v ? '' : 'none';
    // Araç seçilince arama kutusu ve sonuç listesi kapanır — km alanı öne çıkar
    $('ob-ev-search').style.display = v ? 'none' : '';
    $('ob-ev-results').style.display = v ? 'none' : '';
    $('ob-change-car').style.display = v ? '' : 'none';
  }, false);
  $('ob-change-car').addEventListener('click', () => {
    obEv = null;
    $('ob-done').disabled = true;
    $('ob-km-wrap').style.display = 'none';
    $('ob-ev-summary').style.display = 'none';
    $('ob-change-car').style.display = 'none';
    $('ob-ev-search').style.display = '';
    $('ob-ev-results').style.display = '';
    $('ob-ev-results').innerHTML = '';
    $('ob-ev-search').value = '';
    $('ob-km').value = '';
    $('ob-ev-search').focus();
  });
  $('ob-skip').addEventListener('click', () => finishOnboarding(false));
  $('ob-done').addEventListener('click', () => finishOnboarding(true));
}
async function finishOnboarding(withCar) {
  S.country = $('ob-country').value;
  S.currency = $('ob-currency').value;
  S.unit = $('ob-unit').querySelector('.sel').dataset.v;
  S.lang = $('ob-lang').value;
  S.onboarded = true;
  for (const [k, v] of [['country', S.country], ['currency', S.currency],
    ['unit', S.unit], ['lang', S.lang], ['onboarded', true]])
    await saveSetting(k, v);
  if (!S.bankCountries) { S.bankCountries = [S.country]; await saveSetting('bankCountries', S.bankCountries); }
  if (withCar && obEv) {
    const rec = vehicleRec(obEv);
    const kmIn = pf($('ob-km').value);
    if (!isNaN(kmIn) && kmIn > 0) {
      const km = S.unit === 'mi' ? kmIn * MI : kmIn;
      rec.kmStart = Math.round(km); rec.kmNow = Math.round(km);
    }
    const id = await db.vehicles.add(rec);
    S.defaultVehicleId = id;
    await saveSetting('defaultVehicleId', id);
  }
  overlayClose('ob', {force: true});
  applyI18n();
  renderDashboard();
}

// ============================================================
// YEDEKLEME
// ============================================================
function today() { return localISO(); }
function download(content, name, type) {
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$('btn-export-json').addEventListener('click', async () => {
  const payload = {
    app: 'WattTrack', version: SCHEMA_VERSION, appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    vehicles: await db.vehicles.toArray(),
    expenses: await db.expenses.toArray(),
    settings: await db.settings.toArray()
  };
  download(JSON.stringify(payload, null, 2), `watttrack-yedek-${today()}.json`, 'application/json');
  toast(t('jsonDone'));
});
$('btn-export-csv').addEventListener('click', async () => {
  const rows = (await db.sessions.toArray()).sort((a, b) => a.tarih.localeCompare(b.tarih));
  const vehicles = await db.vehicles.toArray();
  const vn = id => { const v = vehicles.find(x => x.id === id); return v ? vehName(v) : ''; };
  const num = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
  // CSV formül enjeksiyonuna karşı koruma: =,+,-,@ ile başlayan metinleri etkisizleştir
  const safe = s => {
    let v = (s || '').toString().replace(/;/g, ',').replace(/[\r\n]/g, ' ');
    if (/^[=+\-@]/.test(v)) v = "'" + v;
    return v;
  };
  const head = ['Tarih','Ulke','ParaBirimi','Kur','Firma','Tip','Ucretsiz','kWh','Odenen','OdenenTemel','Indirim','ListeTutar','BirimFiyat','Banka','MesafeKm','SureDk','SoCOnce','SoCSonra','Lokasyon','Arac','Not'];
  const lines = [head.join(';')];
  rows.forEach(r => {
    const sav = savingsOf(r);
    lines.push([
      r.tarih.slice(0, 10), r.ulke || '', r.cur || '', r.rate ? num(r.rate) : '',
      safe(r.firma), r.tip || '', r.free ? 1 : 0, num(r.kwh),
      num(r.odenen), num(amtB(r)), num(sav), num(r.odenen + sav),
      r.kwh ? num(r.odenen / r.kwh) : '', safe(r.banka),
      r.mesafeKm ? num(r.mesafeKm) : '', r.dur ?? '', r.socB ?? '', r.socA ?? '',
      safe(r.loc), safe(vn(r.aracId)), safe(r.not)
    ].join(';'));
  });
  download('\uFEFF' + lines.join('\r\n'), `watttrack-${today()}.csv`, 'text/csv;charset=utf-8');
  toast(t('csvDone'));
});
$('btn-import').addEventListener('click', () => $('file-import').click());
async function importBackupText(text) {
  const data = JSON.parse(text);
  if (data.app !== 'WattTrack' || !Array.isArray(data.sessions)) throw 0;

  // --- Okumalar ve sorular transaction'dan ÖNCE (confirm bir transaction'ı
  //     bloklar ve zaman aşımına düşürür) ---
  // mükerrer tespiti: tarih+firma+kwh+tutar+para birimi imzası
  const sig = r => [r.tarih, r.firma, r.kwh, r.odenen, r.cur || ''].join('|');
  const existing = new Set((await db.sessions.toArray()).map(sig));
  const fresh = [], dupes = [];
  data.sessions.forEach(({id, ...r}) => (existing.has(sig(r)) ? dupes : fresh).push({...r, _oldVeh: r.aracId}));
  if (!fresh.length && data.sessions.length) { alert(t('importAllDup')); return; }

  const msg = dupes.length
    ? t('importPartial', {n: fresh.length, d: dupes.length})
    : fresh.length + ' ' + t('importAsk');
  if (!confirm(msg)) return;

  // WT-07: export payload settings dizisini yazıyor ama import ona hiç
  // dokunmuyordu — telefon değiştiren kullanıcı dil, para birimi, ülke,
  // tema, özel bankalar ve kıyas parametrelerini kaybediyordu.
  const hasSettings = Array.isArray(data.settings) && data.settings.length;
  const restoreSettings = hasSettings && confirm(t('restoreSettingsAsk'));

  const esig = e => [e.tarih, e.tur, e.tutar, e.cur || ''].join('|');
  const haveExp = new Set((await db.expenses.toArray()).map(esig));
  const freshExp = Array.isArray(data.expenses)
    ? data.expenses.map(({id, ...e}) => ({...e, _oldVeh: e.aracId})).filter(e => !haveExp.has(esig(e)))
    : [];

  // --- Tek transaction: ortada hata olursa hiçbir şey yazılmasın (WT-08/3) ---
  // WT-12: kota dolarsa kullanıcı 'geri yüklendi' sanmasın
  const imported = await safeWrite(() =>
    db.transaction('rw', db.sessions, db.vehicles, db.expenses, db.settings, async () => {
    // WT-08: önce araçlar, sonra eskiId → yeniId haritası.
    // Eskiden sessions'tan sadece `id` düşürülüyor, `aracId` eski değerini
    // koruyordu; cihazda zaten araç varsa kayıtlar YANLIŞ araca bağlanıyordu.
    const idMap = new Map();
    for (const {id: oldId, ...v} of (data.vehicles || [])) {
      if (!v.ad) continue;
      const ex = await db.vehicles.where('ad').equals(v.ad).first();
      if (!ex) {
        const newId = await db.vehicles.add(v);
        if (oldId != null) idMap.set(oldId, newId);
        continue;
      }
      if (oldId != null) idMap.set(oldId, ex.id);
      // aynı isimli araç varsa: yedekteki km/fotoğraf bilgisini birleştir
      const upd = {};
      if (v.kmStart != null) upd.kmStart = v.kmStart;
      if (v.kmNow != null && (ex.kmNow == null || v.kmNow > ex.kmNow || ex.kmStart === ex.kmNow))
        upd.kmNow = Math.max(v.kmNow, ex.kmNow || 0);
      if (v.photo && !ex.photo) upd.photo = v.photo;
      if (Object.keys(upd).length) await db.vehicles.update(ex.id, upd);
    }
    // haritada karşılığı yoksa null — ölü referans bırakma
    const mapVeh = rec => {
      const old = rec._oldVeh;
      delete rec._oldVeh;
      rec.aracId = old == null ? null : (idMap.has(old) ? idMap.get(old) : null);
      return rec;
    };
    if (fresh.length) await db.sessions.bulkAdd(fresh.map(mapVeh));
    if (freshExp.length) await db.expenses.bulkAdd(freshExp.map(mapVeh));

    if (restoreSettings) {
      const rows = data.settings.map(row => {
        // WT-07/WT-08: defaultVehicleId de idMap üzerinden çevrilmeli
        if (row.key === 'defaultVehicleId' && row.value != null)
          return {...row, value: idMap.has(row.value) ? idMap.get(row.value) : null};
        return row;
      });
      await db.settings.bulkPut(rows);
    }
  }));
  if (!imported.ok) return;

  // WT-19: import aracId'leri idMap üzerinden çeviriyor; içeri giren odo
  // kayıtları zaten odo kaydı olan bir araca düşmüş olabilir — zincirler
  // transaction bittikten SONRA baştan kurulur.
  for (const vid of new Set((await db.sessions.toArray())
      .filter(r => r.odo != null).map(r => r.aracId ?? null)))
    await tureMesafe(vid);

  if (restoreSettings) {
    // S nesnesini yeniden doldur ve arayüzü tazele
    for (const key of SETTING_KEYS) {
      const row = await db.settings.get(key);
      if (row) S[key] = row.value;
    }
    applyI18n();
    applyTheme();
  }
  toast(dupes.length ? t('importPartial', {n: fresh.length, d: dupes.length}) : t('imported'));
  showScreen('dashboard');
}
$('file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try { await importBackupText(await file.text()); }
  catch { toast(t('importFail')); }
  e.target.value = '';
});
// PWA file_handlers: .json dosyası uygulamayla açılınca yedeği içe aktar
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async params => {
    if (!params.files || !params.files.length) return;
    try {
      const file = await params.files[0].getFile();
      await importBackupText(await file.text());
    } catch { toast(t('importFail')); }
  });
}
$('btn-rate').addEventListener('click', () => {
  window.open('https://play.google.com/store/apps/details?id=app.watttrack.twa', '_blank', 'noopener');
});
$('btn-support').addEventListener('click', () => {
  window.open('https://github.com/Rino-06/WattTrack', '_blank', 'noopener');
});
$('btn-wipe').addEventListener('click', async () => {
  if (!confirm(t('wipeAsk1')) || !confirm(t('wipeAsk2'))) return;
  // WT-06: expenses.clear() eksikti — sıfırlama sonrası eski vergi/sigorta
  // kayıtları geri gelip TCO'yu bozuyordu. Dördü tek transaction'da.
  await db.transaction('rw', db.sessions, db.vehicles, db.expenses, db.settings, async () => {
    await db.sessions.clear();
    await db.vehicles.clear();
    await db.expenses.clear();
    await db.settings.clear();
  });
  toast(t('wiped'));
  location.reload();
});

// ============================================================
// BAŞLANGIÇ
// ============================================================
// ============================================================
// SEÇİM DİYALOĞU (WT-09)
// ============================================================
// confirm() ikiden fazla seçenek sunamıyor. Araç silme üç yollu bir karar,
// kayıt taşıma ise form gerektiriyor — ikisi de bunu kullanır.
// Dönüş: seçilen değer, iptalde null.
function choiceDialog({title, msg, options, body}) {
  return new Promise(resolve => {
    const back = document.createElement('div');
    back.className = 'dlg-back';
    back.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
      <h3></h3>
      ${msg ? '<p class="dlg-msg"></p>' : ''}
      <div class="dlg-body"></div>
      ${(options || []).map((o, i) =>
        `<button type="button" class="dlg-opt ${o.danger ? 'danger' : ''}"
           data-i="${i}" ${o.disabled ? 'disabled' : ''}></button>`).join('')}
      <button type="button" class="dlg-cancel"></button>
    </div>`;
    back.querySelector('h3').textContent = title;
    if (msg) back.querySelector('.dlg-msg').textContent = msg;
    (options || []).forEach((o, i) => {
      back.querySelector(`[data-i="${i}"]`).textContent = o.label;
    });
    back.querySelector('.dlg-cancel').textContent = t('cancelLbl');
    if (body) back.querySelector('.dlg-body').appendChild(body);

    const close = val => { back.remove(); document.removeEventListener('keydown', onKey); resolve(val); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    back.querySelectorAll('.dlg-opt').forEach(b =>
      b.addEventListener('click', () => close(options[+b.dataset.i].value)));
    back.querySelector('.dlg-cancel').addEventListener('click', () => close(null));
    back.addEventListener('click', e => { if (e.target === back) close(null); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    back.querySelector('.dlg-opt, .dlg-cancel')?.focus();
  });
}

// ============================================================
// VERİ BÜTÜNLÜĞÜ UYARILARI (WT-04/6, WT-10)
// ============================================================
// Ana sayfanın üstündeki şerit. Otomatik DÜZELTME yok — kullanıcıya söyle,
// düzeltmeyi o yapsın.
const warnings = new Map();   // id -> {msg, actionLbl, action, host}
function setWarning(id, w) {
  if (w) warnings.set(id, {host: 'd-warnings', ...w}); else warnings.delete(id);
  renderWarnings();
}
function renderWarnings() {
  document.querySelectorAll('.warn-host').forEach(h => { h.innerHTML = ''; });
  for (const [id, w] of warnings) {
    const host = $(w.host);
    if (!host) continue;
    const el = document.createElement('div');
    el.className = 'warn-strip';
    el.innerHTML = `<span class="msg"></span>
      ${w.actionLbl ? '<button type="button" data-act>' + w.actionLbl + '</button>' : ''}
      <button type="button" data-dismiss>${t('dismissLbl')}</button>`;
    el.querySelector('.msg').textContent = w.msg;
    if (w.action) el.querySelector('[data-act]').addEventListener('click', w.action);
    el.querySelector('[data-dismiss]').addEventListener('click', () => setWarning(id, null));
    host.appendChild(el);
  }
}
// WT-18/3 migration: aracId'si null olan giderler HER araca sayılıyordu.
// Varsayılan (ya da tek) araca atanır; hiç araç yoksa dokunulmaz — kullanıcı
// araç ekleyince bir sonraki açılışta çalışır.
async function migrateExpenseVehicles() {
  const orphan = (await db.expenses.toArray()).filter(e => e.aracId == null);
  if (!orphan.length) return;
  const vs = await db.vehicles.toArray();
  if (!vs.length) return;
  const target = vs.find(v => v.id === S.defaultVehicleId && !v.archived)
    || vs.find(v => !v.archived) || vs[0];
  const w = await safeWrite(() => db.transaction('rw', db.expenses, async () => {
    for (const e of orphan) await db.expenses.update(e.id, {aracId: target.id});
  }));
  if (w.ok) toast(t('expOrphanFix', {n: orphan.length}));
}

// Sınır dışı socB/socA/dur/kwh değerlerini tara. Otomatik silme yok.
async function scanBadData() {
  const all = await db.sessions.toArray();
  const bad = all.filter(r =>
    (r.socB != null && (r.socB < 0 || r.socB > 100)) ||
    (r.socA != null && (r.socA < 0 || r.socA > 100)) ||
    (r.socB != null && r.socA != null && r.socB >= r.socA) ||
    (r.dur != null && (r.dur < 0 || r.dur > 48 * 60)) ||
    (r.kwh != null && (r.kwh < 0 || r.kwh > 300)));
  if (!bad.length) { setWarning('badData', null); return; }
  setWarning('badData', {
    msg: t('badDataFound', {n: bad.length}),
    actionLbl: t('showLbl'),
    action: () => { S.histBadOnly = bad.map(r => r.id); showScreen('history'); }
  });
}

// init ve yedek geri yükleme aynı listeyi kullanır (WT-07)
const SETTING_KEYS = ['country','currency','unit','lang','advOpen','defaultVehicleId',
  'onboarded','cmp','bankCountries','customBanks','gran','theme','homeKwhPrice'];

(async function init() {
  for (const key of SETTING_KEYS) {
    const row = await db.settings.get(key);
    if (row) S[key] = row.value;
  }
  history.replaceState({page: 'dashboard'}, '');   // WT-24/6 taban durum
  initOnboarding();
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
