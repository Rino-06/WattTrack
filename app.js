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

const AVATAR_COLORS = ['#1C8742', '#007DAA', '#C87B00', '#A54C8B', '#C25C5F'];
const MI = 1.60934;

// ---------- Çeviriler ----------
const T = {
tr:{theme:'Görünüm',themeLight:'Açık',themeDark:'Koyu',spendChart:'Harcama grafiği',cumTitle:'Bugüne kadar: aynı km yakıtlıyla gidilseydi',totalDist:'Toplam mesafe',evSpent:'EV toplam (net)',iceWould:'Yakıtlıyla olurdu',totalSaved:'Toplam kazanç',evLine:'EV (gerçek)',iceLine:'Yakıtlı (aynı km)',archived:'Arşiv (satılan/kullanılmayan)',archivedTag:'arşivde — kayıtları korunuyor',archivedToast:'Araç arşive taşındı, kayıtları korunuyor',restore:'Geri al',newBank:'+ Yeni banka ekle…',newBankPrompt:'Banka adı:',importAllDup:'Bu yedekteki tüm kayıtlar zaten mevcut — hiçbir şey eklenmedi.',importPartial:'{n} yeni kayıt eklendi, {d} mükerrer atlandı',netPaid:'Ödenen (net)',typeSplit:'Şarj tipi dağılımı (kWh)',detailStats:'Detay istatistikler',avgDuration:'Ort. şarj süresi',avgSocRange:'Ort. şarj aralığı',topBanks:'Bankalar (indirim kazancı)',topLocations:'En çok şarj edilen lokasyonlar',bankCountries:'Banka Ülkelerim',bankCountriesD:'Kartların hangi ülkelerden ise seç — formdaki banka listesi bunlara göre gelir. Şarj ettiğin ülke değişse de bankaların değişmez.',addCountry:'+ Ülke ekle',prevPeriod:'önceki döneme göre',navHome:'Ana Sayfa',navHistory:'Geçmiş',navCompare:'Kıyasla',navSettings:'Ayarlar',
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
defaultHint:'Yıldız: varsayılan araç. Araca dokun: fotoğraf ekle/değiştir.',
formSection:'Kayıt Formu',advAlways:'Gelişmiş alanlar hep açık',
advAlwaysD:'Banka, süre, lokasyon ve şarj aralığı formda açık gelsin',
dataSection:'Veri',exportJson:'Dışa Aktar (JSON)',exportCsv:'Dışa Aktar (CSV — Excel/Power BI)',
importJson:'Yedeği Geri Yükle (JSON)',reset:'Verileri Sıfırla',about:'Hakkında',
aboutText:'WattTrack — tüm verileriniz yalnızca bu cihazda saklanır. Hiçbir sunucuya gönderilmez. Tek istisna: yurt dışı kayıtlarda döviz kuru internetten çekilir (yalnızca para birimi kodları iletilir). Cihazlar arası taşıma için JSON yedeğini kullanın.',
addTitle:'Yeni Şarj Kaydı',editTitle:'Kaydı Düzenle',date:'Tarih',chargeType:'Şarj Tipi',
company:'Ev ya da Şarj Firması',homeChip:'Ev',other:'Diğer…',kwh:'Enerji (kWh)',
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
jsonDone:'JSON yedek indirildi',csvDone:'CSV indirildi',noData:'Henüz kayıt yok',sessions:'şarj'},

en:{theme:'Appearance',themeLight:'Light',themeDark:'Dark',spendChart:'Spending chart',cumTitle:'To date: same km with a fuel car',totalDist:'Total distance',evSpent:'EV total (net)',iceWould:'Would cost (fuel)',totalSaved:'Total saved',evLine:'EV (actual)',iceLine:'Fuel (same km)',archived:'Archive (sold/unused)',archivedTag:'archived — records kept',archivedToast:'Vehicle archived, its records are kept',restore:'Restore',newBank:'+ Add new bank…',newBankPrompt:'Bank name:',importAllDup:'All records in this backup already exist — nothing was added.',importPartial:'{n} new records added, {d} duplicates skipped',netPaid:'Paid (net)',typeSplit:'Charge type split (kWh)',detailStats:'Detail statistics',avgDuration:'Avg charge time',avgSocRange:'Avg SoC range',topBanks:'Banks (discount savings)',topLocations:'Most charged locations',bankCountries:'My Bank Countries',bankCountriesD:'Pick the countries your cards are from — the bank list in the form follows these. Your banks don’t change when the charging country does.',addCountry:'+ Add country',prevPeriod:'vs previous period',navHome:'Home',navHistory:'History',navCompare:'Compare',navSettings:'Settings',
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
defaultHint:'Star: default vehicle. Tap a vehicle: add/replace photo.',
formSection:'Charge Form',advAlways:'Advanced fields always open',
advAlwaysD:'Bank, duration, location and SoC range shown by default',
dataSection:'Data',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Restore Backup (JSON)',reset:'Reset Data',about:'About',
aboutText:'WattTrack — all your data stays on this device. Nothing is sent to any server. One exception: for foreign records the exchange rate is fetched online (only currency codes are transmitted). Use the JSON backup to move data between devices.',
addTitle:'New Charge',editTitle:'Edit Charge',date:'Date',chargeType:'Charge Type',
company:'Home or Charging Company',homeChip:'Home',other:'Other…',kwh:'Energy (kWh)',
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
jsonDone:'JSON backup downloaded',csvDone:'CSV downloaded',noData:'No records yet',sessions:'sessions'},

de:{theme:'Darstellung',themeLight:'Hell',themeDark:'Dunkel',spendChart:'Ausgabendiagramm',cumTitle:'Bisher: gleiche km mit Verbrenner',totalDist:'Gesamtstrecke',evSpent:'EV gesamt (netto)',iceWould:'Verbrenner-Kosten',totalSaved:'Gesamt gespart',evLine:'EV (real)',iceLine:'Verbrenner (gleiche km)',archived:'Archiv (verkauft/ungenutzt)',archivedTag:'archiviert — Einträge bleiben',archivedToast:'Fahrzeug archiviert, Einträge bleiben erhalten',restore:'Wiederherstellen',newBank:'+ Neue Bank…',newBankPrompt:'Bankname:',importAllDup:'Alle Einträge existieren bereits — nichts hinzugefügt.',importPartial:'{n} neue Einträge, {d} Duplikate übersprungen',netPaid:'Bezahlt (netto)',typeSplit:'Ladetyp-Verteilung (kWh)',detailStats:'Detail-Statistiken',avgDuration:'Ø Ladedauer',avgSocRange:'Ø Ladebereich',topBanks:'Banken (Rabattersparnis)',topLocations:'Häufigste Ladeorte',bankCountries:'Meine Bankländer',bankCountriesD:'Wähle die Länder deiner Karten — die Bankliste im Formular folgt diesen. Deine Banken ändern sich nicht mit dem Ladeland.',addCountry:'+ Land hinzufügen',prevPeriod:'ggü. Vorperiode',navHome:'Start',navHistory:'Verlauf',navCompare:'Vergleich',navSettings:'Einstellungen',
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
defaultHint:'Stern: Standardfahrzeug. Fahrzeug antippen: Foto hinzufügen.',
formSection:'Ladeformular',advAlways:'Erweiterte Felder immer offen',
advAlwaysD:'Bank, Dauer, Ort und Ladebereich standardmäßig anzeigen',
dataSection:'Daten',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Backup wiederherstellen (JSON)',reset:'Daten zurücksetzen',about:'Info',
aboutText:'WattTrack — alle Daten bleiben auf diesem Gerät. Einzige Ausnahme: für Auslandseinträge wird der Wechselkurs online abgerufen (nur Währungscodes werden übertragen).',
addTitle:'Neue Ladung',editTitle:'Ladung bearbeiten',date:'Datum',chargeType:'Ladetyp',
company:'Zuhause oder Anbieter',homeChip:'Zuhause',other:'Andere…',kwh:'Energie (kWh)',
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
jsonDone:'JSON-Backup heruntergeladen',csvDone:'CSV heruntergeladen',noData:'Noch keine Einträge',sessions:'Ladungen'},

fr:{theme:'Apparence',themeLight:'Clair',themeDark:'Sombre',spendChart:'Graphique des dépenses',cumTitle:'À ce jour : mêmes km en thermique',totalDist:'Distance totale',evSpent:'VE total (net)',iceWould:'Coût thermique',totalSaved:'Économie totale',evLine:'VE (réel)',iceLine:'Thermique (mêmes km)',archived:'Archive (vendu/inutilisé)',archivedTag:'archivé — charges conservées',archivedToast:'Véhicule archivé, ses charges sont conservées',restore:'Restaurer',newBank:'+ Nouvelle banque…',newBankPrompt:'Nom de la banque :',importAllDup:'Toutes les charges existent déjà — rien ajouté.',importPartial:'{n} nouvelles charges, {d} doublons ignorés',netPaid:'Payé (net)',typeSplit:'Répartition par type (kWh)',detailStats:'Statistiques détaillées',avgDuration:'Durée moy.',avgSocRange:'Plage moy.',topBanks:'Banques (gains remises)',topLocations:'Lieux les plus utilisés',bankCountries:'Mes pays bancaires',bankCountriesD:'Choisissez les pays de vos cartes — la liste des banques suit ces pays. Vos banques ne changent pas avec le pays de charge.',addCountry:'+ Ajouter un pays',prevPeriod:'vs période précédente',navHome:'Accueil',navHistory:'Historique',navCompare:'Comparer',navSettings:'Réglages',
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
defaultHint:'Étoile : véhicule par défaut. Touchez un véhicule : ajouter une photo.',
formSection:'Formulaire',advAlways:'Champs avancés toujours ouverts',
advAlwaysD:'Banque, durée, lieu et plage de charge affichés par défaut',
dataSection:'Données',exportJson:'Exporter (JSON)',exportCsv:'Exporter (CSV — Excel/Power BI)',
importJson:'Restaurer (JSON)',reset:'Réinitialiser',about:'À propos',
aboutText:'WattTrack — vos données restent sur cet appareil. Seule exception : le taux de change est récupéré en ligne pour les charges à l’étranger (seuls les codes devises sont transmis).',
addTitle:'Nouvelle charge',editTitle:'Modifier la charge',date:'Date',chargeType:'Type de charge',
company:'Maison ou réseau',homeChip:'Maison',other:'Autre…',kwh:'Énergie (kWh)',
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
jsonDone:'Sauvegarde JSON téléchargée',csvDone:'CSV téléchargé',noData:'Aucune charge',sessions:'charges'},

es:{theme:'Apariencia',themeLight:'Claro',themeDark:'Oscuro',spendChart:'Gráfico de gasto',cumTitle:'Hasta hoy: mismos km con combustión',totalDist:'Distancia total',evSpent:'EV total (neto)',iceWould:'Costaría (combustión)',totalSaved:'Ahorro total',evLine:'EV (real)',iceLine:'Combustión (mismos km)',archived:'Archivo (vendido/sin uso)',archivedTag:'archivado — cargas conservadas',archivedToast:'Vehículo archivado, sus cargas se conservan',restore:'Restaurar',newBank:'+ Añadir banco…',newBankPrompt:'Nombre del banco:',importAllDup:'Todas las cargas ya existen — no se añadió nada.',importPartial:'{n} cargas nuevas, {d} duplicadas omitidas',netPaid:'Pagado (neto)',typeSplit:'Reparto por tipo (kWh)',detailStats:'Estadísticas detalladas',avgDuration:'Duración media',avgSocRange:'Rango medio',topBanks:'Bancos (ahorro por dtos.)',topLocations:'Lugares más usados',bankCountries:'Mis países bancarios',bankCountriesD:'Elige los países de tus tarjetas — la lista de bancos del formulario los sigue. Tus bancos no cambian con el país de carga.',addCountry:'+ Añadir país',prevPeriod:'vs periodo anterior',navHome:'Inicio',navHistory:'Historial',navCompare:'Comparar',navSettings:'Ajustes',
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
defaultHint:'Estrella: vehículo por defecto. Toca un vehículo: añadir foto.',
formSection:'Formulario',advAlways:'Campos avanzados siempre abiertos',
advAlwaysD:'Banco, duración, lugar y rango visibles por defecto',
dataSection:'Datos',exportJson:'Exportar (JSON)',exportCsv:'Exportar (CSV — Excel/Power BI)',
importJson:'Restaurar copia (JSON)',reset:'Restablecer datos',about:'Acerca de',
aboutText:'WattTrack — tus datos permanecen en este dispositivo. Única excepción: el tipo de cambio se obtiene online para cargas en el extranjero (solo se transmiten códigos de moneda).',
addTitle:'Nueva carga',editTitle:'Editar carga',date:'Fecha',chargeType:'Tipo de carga',
company:'Casa o red de carga',homeChip:'Casa',other:'Otra…',kwh:'Energía (kWh)',
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
jsonDone:'Copia JSON descargada',csvDone:'CSV descargado',noData:'Sin cargas aún',sessions:'cargas'},

it:{theme:'Aspetto',themeLight:'Chiaro',themeDark:'Scuro',spendChart:'Grafico spese',cumTitle:'Finora: stessi km con termica',totalDist:'Distanza totale',evSpent:'EV totale (netto)',iceWould:'Costerebbe (termica)',totalSaved:'Risparmio totale',evLine:'EV (reale)',iceLine:'Termica (stessi km)',archived:'Archivio (venduto/inutilizzato)',archivedTag:'archiviato — ricariche conservate',archivedToast:'Veicolo archiviato, le ricariche restano',restore:'Ripristina',newBank:'+ Nuova banca…',newBankPrompt:'Nome banca:',importAllDup:'Tutte le ricariche esistono già — nulla aggiunto.',importPartial:'{n} nuove ricariche, {d} duplicati saltati',netPaid:'Pagato (netto)',typeSplit:'Ripartizione per tipo (kWh)',detailStats:'Statistiche dettagliate',avgDuration:'Durata media',avgSocRange:'Intervallo medio',topBanks:'Banche (risparmio sconti)',topLocations:'Luoghi più usati',bankCountries:'I miei paesi bancari',bankCountriesD:'Scegli i paesi delle tue carte — l’elenco banche nel modulo li segue. Le tue banche non cambiano col paese di ricarica.',addCountry:'+ Aggiungi paese',prevPeriod:'vs periodo precedente',navHome:'Home',navHistory:'Cronologia',navCompare:'Confronta',navSettings:'Impostazioni',
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
defaultHint:'Stella: veicolo predefinito. Tocca un veicolo: aggiungi foto.',
formSection:'Modulo',advAlways:'Campi avanzati sempre aperti',
advAlwaysD:'Banca, durata, luogo e intervallo visibili di default',
dataSection:'Dati',exportJson:'Esporta (JSON)',exportCsv:'Esporta (CSV — Excel/Power BI)',
importJson:'Ripristina backup (JSON)',reset:'Azzera dati',about:'Info',
aboutText:'WattTrack — i tuoi dati restano su questo dispositivo. Unica eccezione: il tasso di cambio è recuperato online per ricariche all’estero (si trasmettono solo i codici valuta).',
addTitle:'Nuova ricarica',editTitle:'Modifica ricarica',date:'Data',chargeType:'Tipo di ricarica',
company:'Casa o rete di ricarica',homeChip:'Casa',other:'Altra…',kwh:'Energia (kWh)',
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
jsonDone:'Backup JSON scaricato',csvDone:'CSV scaricato',noData:'Nessuna ricarica',sessions:'ricariche'}
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
  period: 'month', cmp: null, dashVeh: '', cmpVeh: '', bankCountries: null, gran: 'month', customBanks: [], theme: 'light'
};
const $ = id => document.getElementById(id);
const t = (key, vars) => {
  let s = (T[S.lang] && T[S.lang][key]) ?? T.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
};
// virgül toleranslı sayı okuma ("45,5" → 45.5)
const pf = v => {
  const n = parseFloat(String(v ?? '').trim().replace(',', '.'));
  return isNaN(n) ? NaN : n;
};
const symOf = code => CURRENCY_SYMBOLS[code] || code;
const sym = () => symOf(S.currency);
// Harf içeren semboller (L, kr, Kč, Ft…) sayının SONUNA boşlukla gelir: "1.250 L";
// işaret semboller (₺ € $ £) başa gelir: "₺1.250"
const fm = (s, str) => /^[A-Za-z]/.test(s) ? str + ' ' + s : s + str;
const money = v => fm(sym(), Math.round(v || 0).toLocaleString('tr-TR'));
const money2 = v => fm(sym(), (v || 0).toLocaleString('tr-TR', {maximumFractionDigits: 2}));
const monthKey = iso => iso.slice(0, 7);
const distDisp = km => S.unit === 'mi' ? km / MI : km;
const distFactor = () => S.unit === 'mi' ? MI : 1;   // 100 birim = 100*factor km

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2400);
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
let fxPendingCount = 0;
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
function shortDate(iso) {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return d + ' ' + MONTHS[S.lang][m - 1].slice(0, 3);
}
async function saveSetting(key, value) { await db.settings.put({key, value}); }
function applyTheme() {
  document.documentElement.dataset.theme = S.theme === 'dark' ? 'dark' : 'light';
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = S.theme === 'dark' ? '#0f172a' : '#F1F7F2';
}
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
  const day = date && date < new Date().toISOString().slice(0, 10) ? date : 'latest';
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
  const day = date && date < new Date().toISOString().slice(0, 10) ? date : 'latest';
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
  $('d-100-lbl').textContent = t('cost100', {u: S.unit});
  $('d-100-lbl2').textContent = t('cost100', {u: S.unit});
  $('in-dist-lbl').textContent = t('distance', {u: S.unit});
  $('in-amount-lbl').textContent = t('amount', {s: sym()});
  $('c-price-lbl').textContent = t('fuelPrice', {s: sym()});
  $('c-cons-lbl').textContent = t('fuelCons');
  $('c-ev-lbl').textContent = t('evCost', {u: S.unit});
  $('c-evg-lbl').textContent = t('evCostG', {u: S.unit});
  $('c-ice-lbl').textContent = t('iceCost', {u: S.unit});
  $('c-discfx-lbl').textContent = t('discEffect', {u: S.unit});
  $('c-perkm-lbl').textContent = t('perUnitSaving', {u: S.unit});
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
document.querySelectorAll('nav button[data-page]').forEach(b =>
  b.addEventListener('click', () => showScreen(b.dataset.page)));
function showScreen(name) {
  screen = name;
  document.querySelectorAll('.content .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button[data-page]').forEach(b =>
    b.classList.toggle('sel', b.dataset.page === name));
  $('page-' + name).classList.add('active');
  ({dashboard: renderDashboard, history: renderHistory,
    compare: renderCompare, settings: renderSettings})[name]?.();
  document.querySelector('.content').scrollTop = 0;
}

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
$('d-gran').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.gran = b.dataset.v;
  $('d-gran').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderDashboard();
});

function periodFilter(all) {
  const now = new Date();
  if (S.period === 'week') {
    const from = new Date(now); from.setDate(now.getDate() - 6);
    const key = from.toISOString().slice(0, 10);
    return all.filter(r => r.tarih.slice(0, 10) >= key);
  }
  if (S.period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear()));
  return all.filter(r => monthKey(r.tarih) === now.toISOString().slice(0, 7));
}
function prevPeriodFilter(all) {
  const now = new Date();
  if (S.period === 'week') {
    const to = new Date(now); to.setDate(now.getDate() - 7);
    const from = new Date(now); from.setDate(now.getDate() - 13);
    const a = from.toISOString().slice(0, 10), b = to.toISOString().slice(0, 10);
    return all.filter(r => { const d = r.tarih.slice(0, 10); return d >= a && d <= b; });
  }
  if (S.period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear() - 1));
  const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const key = p.getFullYear() + '-' + String(p.getMonth() + 1).padStart(2, '0');
  return all.filter(r => monthKey(r.tarih) === key);
}
const vehFilter = (list, vid) => vid ? list.filter(r => String(r.aracId) === vid) : list;
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

  $('d-period-lbl').textContent =
    t(S.period === 'week' ? 'periodWeek' : S.period === 'year' ? 'periodYear' : 'periodMonth');

  const net = cur.reduce((s, r) => s + amtB(r), 0);
  const sav = cur.reduce((s, r) => s + savB(r), 0);
  const gross = net + sav;
  const kwh = cur.reduce((s, r) => s + r.kwh, 0);
  const wd = cur.filter(r => r.mesafeKm > 0);
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
  $('d-avg').textContent = kwh ? fm(sym(), (net / kwh).toFixed(2)) : '—';
  $('d-avg-g').textContent = kwh ? fm(sym(), (gross / kwh).toFixed(2)) : '—';
  $('d-100').textContent = distKm >= 20 ? money2(netD / distKm * 100 * f) : '—';
  $('d-100-g').textContent = distKm >= 20 ? money2(grossD / distKm * 100 * f) : '—';
  $('d-kwh').textContent = kwh.toLocaleString('tr-TR', {maximumFractionDigits: 0});
  $('d-sess').textContent = cur.length + ' / ' + new Set(cur.map(r => r.firma)).size;
  $('d-disc').textContent = money(sav);
  $('d-free').textContent = cur.filter(r => r.free).length;

  // harcama grafiği — kendi Hafta/Ay/Yıl seçicisiyle
  const now = new Date();
  const bars = [];
  if (S.gran === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
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

  // firma dağılımı
  const by = {};
  all.forEach(r => {
    (by[r.firma] ||= {firma: r.firma, total: 0, kwh: 0, count: 0});
    by[r.firma].total += amtB(r); by[r.firma].kwh += r.kwh; by[r.firma].count++;
  });
  const rows = Object.values(by).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxF = Math.max(1, ...rows.map(r => r.total));
  $('d-firms').innerHTML = rows.length ? rows.map(r =>
    `<div class="cmp">
      <div class="cmp-head">
        <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
        <div class="mid">
          <div class="name">${esc(r.firma)}</div>
          <div class="sub">${r.count} ${t('sessions')} · ${r.kwh ? (r.total / r.kwh).toFixed(2) : '0.00'} ${esc(sym())}/kWh</div>
        </div>
        <div class="total">${money(r.total)}</div>
      </div>
      <div class="track"><div class="fill" style="width:${Math.round(r.total / maxF * 100)}%"></div></div>
    </div>`).join('') : `<div class="empty">${t('noData')}</div>`;

  // şarj tipi donut (kWh bazında: DC / AC / Ev)
  const home = t('homeChip');
  const segs = [
    {name: 'DC', kwh: all.filter(r => r.tip === 'DC' && r.firma !== home).reduce((s, r) => s + r.kwh, 0), col: '#16A34A'},
    {name: 'AC', kwh: all.filter(r => r.tip !== 'DC' && r.firma !== home).reduce((s, r) => s + r.kwh, 0), col: '#1B5FAA'},
    {name: home, kwh: all.filter(r => r.firma === home).reduce((s, r) => s + r.kwh, 0), col: '#7DC855'}
  ].filter(x => x.kwh > 0);
  const tot = segs.reduce((s, x) => s + x.kwh, 0) || 1;
  let off = 25;
  const trackCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  $('d-donut').innerHTML =
    `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${trackCol}" stroke-width="5"></circle>` +
    segs.map(x => {
      const p = x.kwh / tot * 100;
      const el = `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${x.col}" stroke-width="5"
        stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${off}" stroke-linecap="butt"></circle>`;
      off -= p;
      return el;
    }).join('');
  $('d-donut-legend').innerHTML = segs.map(x =>
    `<div class="li"><span class="dot" style="background:${x.col}"></span>${esc(x.name)}
     <span class="lv">${Math.round(x.kwh)} kWh · %${Math.round(x.kwh / tot * 100)}</span></div>`).join('') ||
    `<div class="li" style="color:var(--faint)">${t('noData')}</div>`;

  // detay: ortalama süre & SoC aralığı
  const durs = all.filter(r => r.dur > 0);
  $('d-dur').textContent = durs.length
    ? (() => { const m = Math.round(durs.reduce((s, r) => s + r.dur, 0) / durs.length);
        return (m >= 60 ? Math.floor(m / 60) + ' ' + t('hours') + ' ' : '') + (m % 60) + ' ' + t('minutes'); })()
    : '—';
  const socs = all.filter(r => r.socB != null && r.socA != null);
  $('d-soc').textContent = socs.length
    ? '%' + Math.round(socs.reduce((s, r) => s + r.socB, 0) / socs.length) +
      ' → %' + Math.round(socs.reduce((s, r) => s + r.socA, 0) / socs.length)
    : '—';

  // en çok kazandıran bankalar
  const bB = {};
  all.forEach(r => { if (r.banka) {
    (bB[r.banka] ||= {sav: 0, n: 0});
    bB[r.banka].sav += savB(r); bB[r.banka].n++;
  }});
  const banksTop = Object.entries(bB).sort((a, b) => b[1].sav - a[1].sav).slice(0, 3);
  $('d-banks').innerHTML = banksTop.length ? banksTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${x.n} ${t('sessions')}</div></span>
      <span class="tv" style="color:var(--accent-dark)">−${money(x.sav)}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;

  // en çok lokasyonlar
  const bL = {};
  all.forEach(r => { if (r.loc) {
    (bL[r.loc] ||= {n: 0, tl: 0});
    bL[r.loc].n++; bL[r.loc].tl += amtB(r);
  }});
  const locsTop = Object.entries(bL).sort((a, b) => b[1].n - a[1].n).slice(0, 3);
  $('d-locs').innerHTML = locsTop.length ? locsTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${money(x.tl)}</div></span>
      <span class="tv">${x.n} ${t('sessions')}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;

  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 3);
  $('d-recent').innerHTML = sorted.length
    ? sorted.map(r => rowHTML(r, false)).join('')
    : `<div class="empty">${t('noData')}</div>`;
  $('d-recent').querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
$('d-viewall').addEventListener('click', () => showScreen('history'));

function rowHTML(r, withDelete) {
  const s = savingsOf(r);
  const cs = symOf(r.cur || S.currency);
  return `<div class="crow" data-id="${r.id}">
    <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
    <div class="mid">
      <div class="name">${esc(r.firma)}</div>
      <div class="sub">${shortDate(r.tarih)} · ${r.kwh} kWh · ${r.tip || 'DC'}${r.mesafeKm ? ' · ' + Math.round(distDisp(r.mesafeKm)) + ' ' + S.unit : ''}</div>
    </div>
    <div class="right">
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : fm(cs, Math.round(r.odenen).toLocaleString('tr-TR'))}</div>
      <div class="sav">${s > 0 ? '−' + fm(cs, Math.round(s).toLocaleString('tr-TR')) : ''}</div>
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

  const rows = sorted.filter(r =>
    (!vy || r.tarih.slice(0, 4) === vy) &&
    (!vf || r.firma === vf) &&
    (!vt || (vt === 'free' ? r.free : r.tip === vt)) &&
    (!vv || String(r.aracId) === vv) &&
    (!vb || r.banka === vb) &&
    (!vl || r.loc === vl));

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
      await db.sessions.delete(+b.dataset.del);
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
$('c-calc').addEventListener('click', async () => {
  const price = pf($('c-price').value);
  const cons = pf($('c-cons').value);
  if (!price || !cons || price <= 0 || cons <= 0) return;
  S.cmp = {fuel: $('c-fuel').querySelector('.sel').dataset.v, price, cons};
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
    $('c-price').value = String(S.cmp.price).replace('.', ',');
    $('c-cons').value = String(S.cmp.cons).replace('.', ',');
    $('c-fuel').querySelectorAll('button').forEach(x =>
      x.classList.toggle('sel', x.dataset.v === S.cmp.fuel));
    $('c-hybrid-note').style.display = S.cmp.fuel === 'hybrid' ? '' : 'none';
  }
  const box = $('c-result');
  if (!S.cmp) { box.style.display = 'none'; return; }

  const all = vehFilter(await db.sessions.toArray(), S.cmpVeh);
  const wd = all.filter(r => r.mesafeKm > 0);
  const distKm = wd.reduce((s, r) => s + r.mesafeKm, 0);
  const net = wd.reduce((s, r) => s + amtB(r), 0);
  const gross = net + wd.reduce((s, r) => s + savB(r), 0);
  box.style.display = '';
  if (distKm < 20) {
    $('c-ev').textContent = '—'; $('c-ice').textContent = '—';
    $('c-ev-g').textContent = '—'; $('c-disc-fx').textContent = '—';
    $('c-perkm').textContent = t('needData');
    $('c-perkm').style.fontSize = '15px';
    $('c-per100').textContent = '';
    $('c-months').innerHTML = '';
    return;
  }
  $('c-perkm').style.fontSize = '28px';

  const f = distFactor();                       // 100 birim = 100*f km
  const evNetPerKm = net / distKm;
  const evGrossPerKm = gross / distKm;
  const icePerKm = S.cmp.price * S.cmp.cons / 100;

  $('c-ev').textContent = money2(evNetPerKm * 100 * f);
  $('c-ev-g').textContent = money2(evGrossPerKm * 100 * f);
  $('c-ice').textContent = money2(icePerKm * 100 * f);
  $('c-disc-fx').textContent = '−' + money2((evGrossPerKm - evNetPerKm) * 100 * f);
  $('c-perkm').textContent = money2((icePerKm - evNetPerKm) * f) + ' / ' + S.unit;
  $('c-per100').textContent = t('per100', {v: money((icePerKm - evNetPerKm) * 100 * f), u: S.unit});

  const now = new Date();
  const bars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const list = wd.filter(r => monthKey(r.tarih) === key);
    const dist = list.reduce((s, r) => s + r.mesafeKm, 0);
    const paid = list.reduce((s, r) => s + amtB(r), 0);
    bars.push({label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
      sum: Math.max(0, dist * icePerKm - paid)});
  }
  const maxB = Math.max(1, ...bars.map(b => b.sum));
  $('c-months').innerHTML = bars.map(b =>
    `<div class="mb">
      <div class="amt">${b.sum ? '+' + money(b.sum) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(b.sum / maxB * 66)}px"></div>
      <div class="m">${b.label}</div>
    </div>`).join('');

  // --- bugüne kadar kümülatif: EV gerçek vs yakıtlı (aynı km) ---
  const iceTot = distKm * icePerKm;
  $('c-dist-lbl').textContent = t('totalDist');
  $('c-dist').textContent = Math.round(distDisp(distKm)).toLocaleString('tr-TR') + ' ' + S.unit;
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
  const cut = Math.max(0, ptsEvAll.length - 14);
  drawLineChart('c-line', labelsAll.slice(cut), [
    {pts: ptsEvAll.slice(cut), color: '#1C8742'},
    {pts: ptsIceAll.slice(cut), color: '#1B5FAA'}
  ]);
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
    out += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5"
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

  const allV = await db.vehicles.toArray();
  const vehicles = allV.filter(v => !v.archived);
  const archived = allV.filter(v => v.archived);
  $('set-vehicles').innerHTML = vehicles.length ? vehicles.map(v => {
    const sub = v.batt ? `${v.trim || ''} · ${v.batt} kWh` : '';
    const isDef = v.id === S.defaultVehicleId || (!S.defaultVehicleId && vehicles[0].id === v.id);
    const thumb = v.photo ? `<img class="vthumb" src="${v.photo}" alt="">` : '';
    return `<li data-vid="${v.id}">
      <button class="star ${isDef ? 'on' : ''}" data-star="${v.id}" title="varsayılan">★</button>
      ${thumb}
      <div class="vn">${esc(vehName(v))}<div class="vd">${esc(sub)}</div></div>
      <button class="cam" data-cam="${v.id}" title="fotoğraf">📷</button>
      <button class="rm" data-rm="${v.id}" title="arşivle">×</button>
    </li>`;
  }).join('') : `<li style="color:var(--faint);font-weight:400">${t('noData')}</li>`;

  $('arch-lbl').style.display = archived.length ? '' : 'none';
  $('set-archived').innerHTML = archived.map(v =>
    `<li><div class="vn">${esc(vehName(v))}<div class="vd">${t('archivedTag')}</div></div>
     <button class="undo" data-undo="${v.id}">${t('restore')}</button></li>`).join('');
  $('set-archived').querySelectorAll('[data-undo]').forEach(b =>
    b.addEventListener('click', async () => {
      await db.vehicles.update(+b.dataset.undo, {archived: false});
      renderSettings();
    }));

  $('set-vehicles').querySelectorAll('[data-star]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      S.defaultVehicleId = +b.dataset.star;
      await saveSetting('defaultVehicleId', S.defaultVehicleId);
      renderSettings();
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
      const hasRecords = await db.sessions.where('aracId').equals(vid).count();
      if (hasRecords) {
        // kayıtlar korunur: silmek yerine arşivle
        await db.vehicles.update(vid, {archived: true});
        toast(t('archivedToast'));
      } else if (confirm(t('deleteAsk'))) {
        await db.vehicles.delete(vid);
      }
      if (S.defaultVehicleId === vid) {
        const rest = (await db.vehicles.toArray()).filter(v => !v.archived);
        S.defaultVehicleId = rest[0]?.id || null;
        await saveSetting('defaultVehicleId', S.defaultVehicleId);
      }
      renderSettings();
    }));
}
let photoTargetVid = null;
$('car-photo').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const dataUrl = await resizePhoto(file);
    if (photoTargetVid) {
      await db.vehicles.update(photoTargetVid, {photo: dataUrl});
      photoTargetVid = null;
      toast(t('photoAdded'));
      renderSettings();
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
        $('page-country').classList.remove('active');
        renderBankCountries();
        return;
      }
      S.country = c[0]; S.currency = c[3]; S.unit = c[5];
      if (LANG_NAMES[c[6]]) S.lang = c[6];
      for (const [k, v] of [['country', S.country], ['currency', S.currency], ['unit', S.unit], ['lang', S.lang]])
        await saveSetting(k, v);
      $('page-country').classList.remove('active');
      applyI18n(); renderSettings();
    }));
}
let countryPickMode = 'region';   // 'region' | 'bank'
$('btn-country').addEventListener('click', () => {
  countryPickMode = 'region';
  $('country-search').value = '';
  renderCountryList('');
  $('page-country').classList.add('active');
});
$('btn-add-bankc').addEventListener('click', () => {
  countryPickMode = 'bank';
  $('country-search').value = '';
  renderCountryList('');
  $('page-country').classList.add('active');
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
$('btn-close-country').addEventListener('click', () => $('page-country').classList.remove('active'));
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
  $('page-addcar').classList.add('active');
});
$('btn-close-addcar').addEventListener('click', () => $('page-addcar').classList.remove('active'));
$('car-save').addEventListener('click', async () => {
  if (!carPick) return;
  const id = await db.vehicles.add(vehicleRec(carPick));
  if (!S.defaultVehicleId) { S.defaultVehicleId = id; await saveSetting('defaultVehicleId', id); }
  toast(t('vehicleAdded'));
  $('page-addcar').classList.remove('active');
  renderSettings();
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
$('btn-close-add').addEventListener('click', () => $('page-add').classList.remove('active'));
$('btn-adv').addEventListener('click', () => {
  $('adv-fields').classList.toggle('open');
  $('btn-adv').textContent =
    $('adv-fields').classList.contains('open') ? t('advancedHide') : t('advanced');
});
$('in-free').addEventListener('change', () => {
  const free = $('in-free').checked;
  $('wrap-paid').style.display = free ? 'none' : '';
  $('wrap-disc').style.display = free ? 'none' : '';
});
$('in-tip').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-tip').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
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
    net.toLocaleString('tr-TR', {maximumFractionDigits: 2}));
}
['in-amount', 'in-disc-val'].forEach(id => $(id).addEventListener('input', updateNetLine));
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
  const list = [...new Set([home, ...used, ...chargersFor(code)])];
  const opts = list.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('') +
    `<option value="__other">${t('other')}</option>`;
  $('in-firm').innerHTML = opts;
  if (current && list.includes(current)) {
    $('in-firm').value = current;
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
    $('rate-note').textContent = t('rateNote', {b: S.currency});
    if (!keepRate) {
      $('in-rate').value = '';
      const got = await fetchRate(c[3], S.currency, $('in-date').value);
      if (got && $('in-country').value === code) {
        $('in-rate').value = String(Math.round(got.rate * 10000) / 10000).replace('.', ',');
        $('rate-note').textContent = t('rateAuto', {d: got.date}) + ' — ' + t('rateNote', {b: S.currency});
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

  $('in-date').value = r ? r.tarih.slice(0, 10) : new Date().toISOString().slice(0, 10);
  $('in-tip').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (r?.tip || 'DC')));

  // kWh: tam + ondalık kutuları
  const kwh = r?.kwh ?? '';
  $('in-kwh-int').value = kwh === '' ? '' : Math.floor(kwh);
  $('in-kwh-dec').value = kwh === '' ? '' : Math.round((kwh - Math.floor(kwh)) * 100);
  $('in-dist').value = r?.mesafeKm ? Math.round(distDisp(r.mesafeKm)) : '';
  $('in-free').checked = !!r?.free;
  const grossVal = r && !r.free
    ? (r.tutar != null ? r.tutar : (r.odenen || 0) + savingsOf(r)) : null;
  $('in-amount').value = grossVal != null && !isNaN(grossVal)
    ? String(Math.round(grossVal * 100) / 100).replace('.', ',') : '';
  const dt = r?.indirimTip === 'percent' ? 'percent' : 'amount';
  $('in-disc-type').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === dt));
  $('in-disc-val').value = r?.indirimDeger ? String(r.indirimDeger).replace('.', ',') : '';
  const durMin = r?.dur || 0;
  $('in-dur-h').value = durMin ? Math.floor(durMin / 60) : '';
  $('in-dur-m').value = durMin ? durMin % 60 : '';
  $('in-loc').value = r?.loc || '';
  $('in-socb').value = r?.socB ?? '';
  $('in-soca').value = r?.socA ?? '';
  $('in-note').value = r?.not || '';
  $('in-rate').value = r?.rate ? String(r.rate).replace('.', ',') : '';
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
  $('disc-chips').innerHTML = [0, 10, 20].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}%</button>`).join('');
  $('disc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      $('in-disc-type').querySelectorAll('button').forEach(x =>
        x.classList.toggle('sel', x.dataset.v === 'percent'));
      $('in-disc-val').value = b.dataset.v;
    }));
  $('soc-chips').innerHTML = ['20-80','10-90','0-100'].map(v =>
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

  $('page-add').classList.add('active');
  $('page-add').querySelector('.ov-body').scrollTop = 0;
}

$('btn-save').addEventListener('click', async () => {
  const firmSel = $('in-firm').value;
  const firma = firmSel === '__other' ? $('in-firm-other').value.trim() : firmSel;
  const kInt = parseInt($('in-kwh-int').value) || 0;
  const kDec = Math.min(99, parseInt($('in-kwh-dec').value) || 0);
  const kwh = kInt + kDec / 100;
  const free = $('in-free').checked;
  const amount = free ? 0 : pf($('in-amount').value);
  if (!firma || kwh <= 0 || (!free && (isNaN(amount) || amount < 0))) {
    $('form-err').textContent = t('formError');
    $('form-err').classList.add('show');
    return;
  }
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const foreign = c[3] !== S.currency;
  const rate = pf($('in-rate').value);
  if (foreign && (isNaN(rate) || rate <= 0)) {
    $('form-err').textContent = t('rateNeeded');
    $('form-err').classList.add('show');
    return;
  }
  const distIn = pf($('in-dist').value) || 0;
  const discVal = free ? 0 : (pf($('in-disc-val').value) || 0);
  const discType = $('in-disc-type').querySelector('.sel').dataset.v;
  const gross = free ? 0 : Math.round(amount * 100) / 100;
  const net = free ? 0 : Math.round(netFromGross(gross, discType, discVal) * 100) / 100;
  let a = parseInt($('in-socb').value), b = parseInt($('in-soca').value);
  if (!isNaN(a) && !isNaN(b) && a > b) [a, b] = [b, a];
  const durH = parseInt($('in-dur-h').value) || 0;
  const durM = parseInt($('in-dur-m').value) || 0;
  const rec = {
    tarih: $('in-date').value + 'T12:00',
    tip: $('in-tip').querySelector('.sel').dataset.v,
    firma, kwh: Math.round(kwh * 100) / 100,
    tutar: gross,
    odenen: net,
    indirim: Math.round((gross - net) * 100) / 100,
    free,
    indirimTip: discVal > 0 ? discType : 'none',
    indirimDeger: discVal,
    banka: discVal > 0 || $('in-bank').value ? $('in-bank').value : '',
    mesafeKm: distIn ? Math.round((S.unit === 'mi' ? distIn * MI : distIn) * 10) / 10 : null,
    dur: (durH * 60 + durM) || null,
    loc: $('in-loc').value.trim(),
    socB: isNaN(a) ? null : a, socA: isNaN(b) ? null : b,
    ulke: code, cur: c[3],
    rate: foreign ? rate : null,
    rateBase: foreign ? S.currency : null,
    aracId: parseInt($('in-vehicle').value) || null,
    not: $('in-note').value.trim()
  };
  let recId;
  if (editingId) {
    await db.sessions.update(editingId, rec);
    recId = editingId;
    toast(t('updated'));
  } else {
    recId = await db.sessions.add(rec);
    toast(t('saved'));
  }
  $('page-add').classList.remove('active');
  showScreen(screen);
  // kur tablosunu sessizce ekle (çift yönlü dönüşüm için — yerli kayıt dahil)
  fetchTable(c[3], rec.tarih.slice(0, 10)).then(got => {
    if (got) db.sessions.update(recId, {fxTable: got.rates, fxDate: got.date})
      .then(() => { if (screen === 'dashboard') renderDashboard(); });
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
  bindEVSearch('ob-ev-search', 'ob-ev-results', 'ob-ev-summary', v => {
    obEv = v;
    $('ob-done').disabled = !v;
  }, false);
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
    const id = await db.vehicles.add(vehicleRec(obEv));
    S.defaultVehicleId = id;
    await saveSetting('defaultVehicleId', id);
  }
  $('ob').classList.remove('active');
  applyI18n();
  renderDashboard();
}

// ============================================================
// YEDEKLEME
// ============================================================
function today() { return new Date().toISOString().slice(0, 10); }
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
    app: 'WattTrack', version: 5, exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    vehicles: await db.vehicles.toArray(),
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
$('file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'WattTrack' || !Array.isArray(data.sessions)) throw 0;
    // mükerrer tespiti: tarih+firma+kwh+tutar+para birimi imzası
    const sig = r => [r.tarih, r.firma, r.kwh, r.odenen, r.cur || ''].join('|');
    const existing = new Set((await db.sessions.toArray()).map(sig));
    const fresh = [], dupes = [];
    data.sessions.forEach(({id, ...r}) => (existing.has(sig(r)) ? dupes : fresh).push(r));
    if (!fresh.length && data.sessions.length) {
      alert(t('importAllDup'));
      e.target.value = '';
      return;
    }
    const msg = dupes.length
      ? t('importPartial', {n: fresh.length, d: dupes.length})
      : fresh.length + ' ' + t('importAsk');
    if (!confirm(msg)) { e.target.value = ''; return; }
    if (fresh.length) await db.sessions.bulkAdd(fresh);
    for (const {id, ...v} of (data.vehicles || [])) {
      if (!v.ad) continue;
      if (!(await db.vehicles.where('ad').equals(v.ad).count()))
        await db.vehicles.add(v);
    }
    toast(dupes.length ? t('importPartial', {n: fresh.length, d: dupes.length}) : t('imported'));
    showScreen('dashboard');
  } catch { toast(t('importFail')); }
  e.target.value = '';
});
$('btn-wipe').addEventListener('click', async () => {
  if (!confirm(t('wipeAsk1')) || !confirm(t('wipeAsk2'))) return;
  await db.sessions.clear(); await db.vehicles.clear(); await db.settings.clear();
  toast(t('wiped'));
  location.reload();
});

// ============================================================
// BAŞLANGIÇ
// ============================================================
(async function init() {
  for (const key of ['country','currency','unit','lang','advOpen','defaultVehicleId','onboarded','cmp','bankCountries','customBanks','gran','theme']) {
    const row = await db.settings.get(key);
    if (row) S[key] = row.value;
  }
  initOnboarding();
  applyI18n();
  applyTheme();
  if (!S.onboarded) $('ob').classList.add('active');
  renderDashboard();
  // PWA kısayolları (?action=add | ?page=history/compare/settings)
  const q = new URLSearchParams(location.search);
  if (S.onboarded && q.get('action') === 'add') openAdd();
  else if (S.onboarded && ['history','compare','settings'].includes(q.get('page')))
    showScreen(q.get('page'));
  backfillRates().then(() => { if (screen === 'dashboard') renderDashboard(); });
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
