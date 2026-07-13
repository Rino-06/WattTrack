/* ============================================================
   WattTrack v4 — EV şarj harcama takibi
   Veriler yalnızca cihazda (IndexedDB / Dexie.js) saklanır.
   ============================================================ */

const db = new Dexie('watttrack');
db.version(1).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key'
});

const AVATAR_COLORS = ['#1C8742', '#007DAA', '#C87B00', '#A54C8B', '#C25C5F'];
const BANKS = ['', 'Garanti BBVA', 'İş Bankası', 'Akbank', 'Yapı Kredi', 'Ziraat',
  'QNB', 'DenizBank', 'Enpara', 'VakıfBank', 'Halkbank', 'Papara', 'Visa', 'Mastercard'];
const FIRMS_TR = ['Trugo','Eşarj','ZES','Tesla Supercharger','Voltrun','Beefull',
  'Astor Şarj','Otowatt','Aksa Şarj','e-POint','Opet Ultra Hızlı','Sharz.net','D-Charge','On.Enerji'];
const FIRMS_INT = ['Tesla Supercharger','Ionity','Fastned','EnBW','Allego','Electra',
  'Shell Recharge','TotalEnergies','Electrify America','EVgo','ChargePoint','Circuit électrique'];
const MI = 1.60934;

// ---------- Çeviriler (tr, en, de, fr, es, it) ----------
const T = {
tr:{navHome:'Ana Sayfa',navHistory:'Geçmiş',navCompare:'Kıyasla',navSettings:'Ayarlar',
week:'Hafta',month:'Ay',year:'Yıl',
periodWeek:'Bu hafta toplam',periodMonth:'Bu ay toplam',periodYear:'Bu yıl toplam',
savings:'tasarruf',avgPerKwh:'kWh başı ort.',cost100:'100 {u} maliyet',
totalKwhP:'Enerji (kWh)',sessionsCompanies:'Şarj / Firma',totalDiscP:'Alınan indirim',
freeCount:'Ücretsiz şarj',weeklySpend:'Haftalık harcama',monthlyTotals:'Aylık Harcama',
firmDist:'Firma dağılımı',recentCharges:'Son şarjlar',viewAll:'Tümü',
historyTitle:'Geçmiş',allYears:'Tüm yıllar',allFirms:'Tüm firmalar',allTypes:'Tüm tipler',free:'Ücretsiz',
compareTitle:'Yakıtlı Araçla Kıyasla',fuelType:'Diğer aracın yakıt tipi',
petrol:'Benzin',diesel:'Dizel',hybrid:'Hibrit',
fuelPrice:'Yakıt fiyatı ({s}/lt)',fuelCons:'Tüketim (lt/100km)',calc:'Kıyasla',
evCost:'EV 100 {u}',iceCost:'Yakıtlı 100 {u}',perUnitSaving:'{u} başına kazanç',
per100:'100 {u} başına {v} kazanç',savingByMonth:'Aylara göre kazanç',
compareNote:'Grafik, kayıtlardaki sürüş mesafesine göre aynı yolu yakıtlı araçla gitseydin aradaki farkı gösterir. Mesafe girilmiş kayıtlar hesaba katılır.',
needData:'Hesap için mesafe girilmiş şarj kaydı gerekli',
settingsTitle:'Ayarlar',regionSection:'Ülke ve Bölge',country:'Ülke',currency:'Para Birimi',
unit:'Mesafe Birimi',language:'Dil',vehicles:'Araçlarım',addVehicle:'+ Araç ekle',
defaultHint:'Yıldıza dokunarak varsayılan aracı seç. Formda 2+ araç varsa seçim görünür.',
formSection:'Kayıt Formu',advAlways:'Gelişmiş alanlar hep açık',
advAlwaysD:'Süre, lokasyon ve şarj aralığı formda açık gelsin',
dataSection:'Veri',exportJson:'Dışa Aktar (JSON)',exportCsv:'Dışa Aktar (CSV — Excel/Power BI)',
importJson:'Yedeği Geri Yükle (JSON)',reset:'Verileri Sıfırla',about:'Hakkında',
aboutText:'WattTrack — tüm verileriniz yalnızca bu cihazda saklanır. Herhangi bir sunucuya gönderilmez. Cihazlar arası taşımak için JSON yedeğini kullanın.',
addTitle:'Yeni Şarj Kaydı',editTitle:'Kaydı Düzenle',date:'Tarih',chargeType:'Şarj Tipi',
company:'Ev ya da Şarj Firması',homeChip:'Ev',kwh:'Enerji (kWh)',distance:'Sürülen mesafe ({u})',
freeCharge:'Ücretsiz şarj',freeChargeD:'Kampanya, ev güneş vb. — tutar 0 kaydedilir',
amount:'Ödenen Tutar ({s})',discountType:'İndirim Türü',amountType:'Tutar',percentType:'Yüzde (%)',
bank:'Banka / Kampanya',vehicle:'Araç',advanced:'+ Gelişmiş',advancedHide:'− Gelişmişi gizle',
duration:'Şarj süresi (dk)',location:'Lokasyon',socRange:'Şarj aralığı (%)',note:'Not',
formError:'Firma, kWh ve tutar gerekli',save:'Kaydet',
deleteAsk:'Bu kayıt silinsin mi?',deleted:'Kayıt silindi',saved:'Kayıt eklendi',updated:'Kayıt güncellendi',
demoBanner:'Örnek veriler yüklü — kendi kayıtlarını ekle',clearDemo:'Temizle',demoCleared:'Örnekler temizlendi',
obWelcome:'Hoş geldin!',obCountryQ:'Hangi ülkede şarj oluyorsun? Para ve mesafe birimini buna göre ayarlayalım.',
obCarQ:'Aracını seç',obCarSub:'Marka veya model yaz — yıl ve donanıma göre farklı batarya sürümlerini ayırt et.',
searchCountry:'Ülke ara…',searchCar:'ör. Model Y, Togg, ID.4…',continue:'Devam',skip:'Atla',start:'Başla',
battery:'Batarya',arch:'Mimari',dcMax:'Maks DC',acMax:'AC',range:'Menzil (WLTP)',years:'Yıllar',
customAdd:'"{q}" adıyla özel araç ekle',vehicleAdded:'Araç eklendi',add:'Ekle',
wipeAsk1:'TÜM kayıtlar, araçlar ve ayarlar silinecek. Emin misin?',wipeAsk2:'Geri alınamaz. Silinsin mi?',
wiped:'Tüm veriler silindi',imported:'Yedek geri yüklendi',
importFail:'Dosya geçerli bir WattTrack yedeği değil',importAsk:'kayıt içe aktarılacak. Birleştirilsin mi?',
jsonDone:'JSON yedek indirildi',csvDone:'CSV indirildi',noData:'Henüz kayıt yok',sessions:'şarj'},

en:{navHome:'Home',navHistory:'History',navCompare:'Compare',navSettings:'Settings',
week:'Week',month:'Month',year:'Year',
periodWeek:'This week total',periodMonth:'This month total',periodYear:'This year total',
savings:'saved',avgPerKwh:'Avg per kWh',cost100:'Cost per 100 {u}',
totalKwhP:'Energy (kWh)',sessionsCompanies:'Sessions / Companies',totalDiscP:'Discounts received',
freeCount:'Free charges',weeklySpend:'Weekly spend',monthlyTotals:'Monthly Spend',
firmDist:'By company',recentCharges:'Recent charges',viewAll:'View all',
historyTitle:'History',allYears:'All years',allFirms:'All companies',allTypes:'All types',free:'Free',
compareTitle:'Compare vs Fuel Car',fuelType:'Other car fuel type',
petrol:'Petrol',diesel:'Diesel',hybrid:'Hybrid',
fuelPrice:'Fuel price ({s}/L)',fuelCons:'Consumption (L/100km)',calc:'Compare',
evCost:'EV per 100 {u}',iceCost:'Fuel per 100 {u}',perUnitSaving:'Saving per {u}',
per100:'{v} saved per 100 {u}',savingByMonth:'Savings by month',
compareNote:'The chart shows how much you saved vs driving the same recorded distance in a fuel car. Records with distance are used.',
needData:'Add charges with distance to calculate',
settingsTitle:'Settings',regionSection:'Country & Region',country:'Country',currency:'Currency',
unit:'Distance Unit',language:'Language',vehicles:'My Vehicles',addVehicle:'+ Add vehicle',
defaultHint:'Tap the star to set the default vehicle. Selection appears in the form with 2+ vehicles.',
formSection:'Charge Form',advAlways:'Advanced fields always open',
advAlwaysD:'Duration, location and SoC range shown by default',
dataSection:'Data',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Restore Backup (JSON)',reset:'Reset Data',about:'About',
aboutText:'WattTrack — all your data stays on this device only. Nothing is sent to any server. Use the JSON backup to move data between devices.',
addTitle:'New Charge',editTitle:'Edit Charge',date:'Date',chargeType:'Charge Type',
company:'Home or Charging Company',homeChip:'Home',kwh:'Energy (kWh)',distance:'Distance driven ({u})',
freeCharge:'Free charge',freeChargeD:'Promo, home solar etc. — saved as 0',
amount:'Amount Paid ({s})',discountType:'Discount Type',amountType:'Amount',percentType:'Percent (%)',
bank:'Bank / Campaign',vehicle:'Vehicle',advanced:'+ Advanced',advancedHide:'− Hide advanced',
duration:'Charge time (min)',location:'Location',socRange:'SoC range (%)',note:'Note',
formError:'Company, kWh and amount are required',save:'Save',
deleteAsk:'Delete this record?',deleted:'Record deleted',saved:'Charge saved',updated:'Charge updated',
demoBanner:'Sample data loaded — start adding your own',clearDemo:'Clear',demoCleared:'Samples cleared',
obWelcome:'Welcome!',obCountryQ:'Where do you charge? We will set currency and distance unit accordingly.',
obCarQ:'Pick your car',obCarSub:'Type a brand or model — tell versions apart by year, trim and battery.',
searchCountry:'Search country…',searchCar:'e.g. Model Y, ID.4, EV6…',continue:'Continue',skip:'Skip',start:'Start',
battery:'Battery',arch:'Architecture',dcMax:'Max DC',acMax:'AC',range:'Range (WLTP)',years:'Years',
customAdd:'Add "{q}" as custom vehicle',vehicleAdded:'Vehicle added',add:'Add',
wipeAsk1:'ALL records, vehicles and settings will be deleted. Sure?',wipeAsk2:'Cannot be undone. Delete?',
wiped:'All data deleted',imported:'Backup restored',
importFail:'Not a valid WattTrack backup',importAsk:'records will be imported. Merge?',
jsonDone:'JSON backup downloaded',csvDone:'CSV downloaded',noData:'No records yet',sessions:'sessions'},

de:{navHome:'Start',navHistory:'Verlauf',navCompare:'Vergleich',navSettings:'Einstellungen',
week:'Woche',month:'Monat',year:'Jahr',
periodWeek:'Diese Woche gesamt',periodMonth:'Dieser Monat gesamt',periodYear:'Dieses Jahr gesamt',
savings:'gespart',avgPerKwh:'Ø pro kWh',cost100:'Kosten pro 100 {u}',
totalKwhP:'Energie (kWh)',sessionsCompanies:'Ladungen / Anbieter',totalDiscP:'Erhaltene Rabatte',
freeCount:'Gratis-Ladungen',weeklySpend:'Wochenausgaben',monthlyTotals:'Monatsausgaben',
firmDist:'Nach Anbieter',recentCharges:'Letzte Ladungen',viewAll:'Alle',
historyTitle:'Verlauf',allYears:'Alle Jahre',allFirms:'Alle Anbieter',allTypes:'Alle Typen',free:'Gratis',
compareTitle:'Vergleich mit Verbrenner',fuelType:'Kraftstoff des anderen Autos',
petrol:'Benzin',diesel:'Diesel',hybrid:'Hybrid',
fuelPrice:'Kraftstoffpreis ({s}/L)',fuelCons:'Verbrauch (L/100km)',calc:'Vergleichen',
evCost:'EV pro 100 {u}',iceCost:'Verbrenner 100 {u}',perUnitSaving:'Ersparnis pro {u}',
per100:'{v} pro 100 {u} gespart',savingByMonth:'Ersparnis nach Monat',
compareNote:'Das Diagramm zeigt die Ersparnis gegenüber derselben Strecke mit einem Verbrenner. Einträge mit Distanz werden verwendet.',
needData:'Ladungen mit Distanz erforderlich',
settingsTitle:'Einstellungen',regionSection:'Land & Region',country:'Land',currency:'Währung',
unit:'Entfernungseinheit',language:'Sprache',vehicles:'Meine Fahrzeuge',addVehicle:'+ Fahrzeug',
defaultHint:'Stern antippen für Standardfahrzeug. Auswahl erscheint im Formular ab 2 Fahrzeugen.',
formSection:'Ladeformular',advAlways:'Erweiterte Felder immer offen',
advAlwaysD:'Dauer, Ort und Ladebereich standardmäßig anzeigen',
dataSection:'Daten',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Backup wiederherstellen (JSON)',reset:'Daten zurücksetzen',about:'Info',
aboutText:'WattTrack — alle Daten bleiben nur auf diesem Gerät. Nichts wird an Server gesendet.',
addTitle:'Neue Ladung',editTitle:'Ladung bearbeiten',date:'Datum',chargeType:'Ladetyp',
company:'Zuhause oder Anbieter',homeChip:'Zuhause',kwh:'Energie (kWh)',distance:'Gefahrene Strecke ({u})',
freeCharge:'Gratis-Ladung',freeChargeD:'Aktion, Solar usw. — als 0 gespeichert',
amount:'Bezahlter Betrag ({s})',discountType:'Rabattart',amountType:'Betrag',percentType:'Prozent (%)',
bank:'Bank / Aktion',vehicle:'Fahrzeug',advanced:'+ Erweitert',advancedHide:'− Erweitert ausblenden',
duration:'Ladedauer (Min)',location:'Ort',socRange:'Ladebereich (%)',note:'Notiz',
formError:'Anbieter, kWh und Betrag erforderlich',save:'Speichern',
deleteAsk:'Eintrag löschen?',deleted:'Eintrag gelöscht',saved:'Ladung gespeichert',updated:'Ladung aktualisiert',
demoBanner:'Beispieldaten geladen — eigene Einträge hinzufügen',clearDemo:'Löschen',demoCleared:'Beispiele gelöscht',
obWelcome:'Willkommen!',obCountryQ:'Wo lädst du? Währung und Einheit werden entsprechend gesetzt.',
obCarQ:'Wähle dein Auto',obCarSub:'Marke oder Modell eingeben — Versionen nach Jahr und Akku unterscheiden.',
searchCountry:'Land suchen…',searchCar:'z.B. ID.4, EV6…',continue:'Weiter',skip:'Überspringen',start:'Los',
battery:'Akku',arch:'Architektur',dcMax:'Max DC',acMax:'AC',range:'Reichweite',years:'Jahre',
customAdd:'"{q}" als eigenes Fahrzeug',vehicleAdded:'Fahrzeug hinzugefügt',add:'Hinzufügen',
wipeAsk1:'ALLE Daten werden gelöscht. Sicher?',wipeAsk2:'Nicht rückgängig. Löschen?',
wiped:'Alle Daten gelöscht',imported:'Backup wiederhergestellt',
importFail:'Kein gültiges WattTrack-Backup',importAsk:'Einträge werden importiert. Zusammenführen?',
jsonDone:'JSON-Backup heruntergeladen',csvDone:'CSV heruntergeladen',noData:'Noch keine Einträge',sessions:'Ladungen'},

fr:{navHome:'Accueil',navHistory:'Historique',navCompare:'Comparer',navSettings:'Réglages',
week:'Semaine',month:'Mois',year:'Année',
periodWeek:'Total cette semaine',periodMonth:'Total ce mois',periodYear:'Total cette année',
savings:'économisé',avgPerKwh:'Moy. par kWh',cost100:'Coût par 100 {u}',
totalKwhP:'Énergie (kWh)',sessionsCompanies:'Charges / Réseaux',totalDiscP:'Remises reçues',
freeCount:'Charges gratuites',weeklySpend:'Dépenses hebdo',monthlyTotals:'Dépenses mensuelles',
firmDist:'Par réseau',recentCharges:'Charges récentes',viewAll:'Tout',
historyTitle:'Historique',allYears:'Toutes années',allFirms:'Tous réseaux',allTypes:'Tous types',free:'Gratuit',
compareTitle:'Comparer vs Thermique',fuelType:'Carburant de l’autre voiture',
petrol:'Essence',diesel:'Diesel',hybrid:'Hybride',
fuelPrice:'Prix carburant ({s}/L)',fuelCons:'Conso (L/100km)',calc:'Comparer',
evCost:'VE par 100 {u}',iceCost:'Thermique 100 {u}',perUnitSaving:'Économie par {u}',
per100:'{v} économisés / 100 {u}',savingByMonth:'Économies par mois',
compareNote:'Le graphique montre l’économie vs la même distance en thermique. Les charges avec distance sont utilisées.',
needData:'Ajoutez des charges avec distance',
settingsTitle:'Réglages',regionSection:'Pays et région',country:'Pays',currency:'Devise',
unit:'Unité de distance',language:'Langue',vehicles:'Mes véhicules',addVehicle:'+ Véhicule',
defaultHint:'Touchez l’étoile pour le véhicule par défaut. Le choix apparaît dès 2 véhicules.',
formSection:'Formulaire',advAlways:'Champs avancés toujours ouverts',
advAlwaysD:'Durée, lieu et plage de charge affichés par défaut',
dataSection:'Données',exportJson:'Exporter (JSON)',exportCsv:'Exporter (CSV — Excel/Power BI)',
importJson:'Restaurer (JSON)',reset:'Réinitialiser',about:'À propos',
aboutText:'WattTrack — vos données restent uniquement sur cet appareil. Rien n’est envoyé à un serveur.',
addTitle:'Nouvelle charge',editTitle:'Modifier la charge',date:'Date',chargeType:'Type de charge',
company:'Maison ou réseau',homeChip:'Maison',kwh:'Énergie (kWh)',distance:'Distance parcourue ({u})',
freeCharge:'Charge gratuite',freeChargeD:'Promo, solaire… — enregistré à 0',
amount:'Montant payé ({s})',discountType:'Type de remise',amountType:'Montant',percentType:'Pourcent (%)',
bank:'Banque / Promo',vehicle:'Véhicule',advanced:'+ Avancé',advancedHide:'− Masquer avancé',
duration:'Durée (min)',location:'Lieu',socRange:'Plage de charge (%)',note:'Note',
formError:'Réseau, kWh et montant requis',save:'Enregistrer',
deleteAsk:'Supprimer cette charge ?',deleted:'Charge supprimée',saved:'Charge enregistrée',updated:'Charge modifiée',
demoBanner:'Données d’exemple chargées — ajoutez les vôtres',clearDemo:'Effacer',demoCleared:'Exemples effacés',
obWelcome:'Bienvenue !',obCountryQ:'Où chargez-vous ? Devise et unité seront réglées en conséquence.',
obCarQ:'Choisissez votre voiture',obCarSub:'Tapez une marque ou un modèle — distinguez les versions par année et batterie.',
searchCountry:'Rechercher un pays…',searchCar:'ex. Megane, ID.4…',continue:'Continuer',skip:'Passer',start:'Démarrer',
battery:'Batterie',arch:'Architecture',dcMax:'DC max',acMax:'AC',range:'Autonomie',years:'Années',
customAdd:'Ajouter « {q} » en véhicule perso',vehicleAdded:'Véhicule ajouté',add:'Ajouter',
wipeAsk1:'TOUTES les données seront supprimées. Sûr ?',wipeAsk2:'Irréversible. Supprimer ?',
wiped:'Données supprimées',imported:'Sauvegarde restaurée',
importFail:'Sauvegarde WattTrack invalide',importAsk:'charges à importer. Fusionner ?',
jsonDone:'Sauvegarde JSON téléchargée',csvDone:'CSV téléchargé',noData:'Aucune charge',sessions:'charges'},

es:{navHome:'Inicio',navHistory:'Historial',navCompare:'Comparar',navSettings:'Ajustes',
week:'Semana',month:'Mes',year:'Año',
periodWeek:'Total esta semana',periodMonth:'Total este mes',periodYear:'Total este año',
savings:'ahorrado',avgPerKwh:'Media por kWh',cost100:'Coste por 100 {u}',
totalKwhP:'Energía (kWh)',sessionsCompanies:'Cargas / Redes',totalDiscP:'Descuentos recibidos',
freeCount:'Cargas gratis',weeklySpend:'Gasto semanal',monthlyTotals:'Gasto mensual',
firmDist:'Por red',recentCharges:'Cargas recientes',viewAll:'Todo',
historyTitle:'Historial',allYears:'Todos los años',allFirms:'Todas las redes',allTypes:'Todos los tipos',free:'Gratis',
compareTitle:'Comparar vs Combustión',fuelType:'Combustible del otro coche',
petrol:'Gasolina',diesel:'Diésel',hybrid:'Híbrido',
fuelPrice:'Precio ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Comparar',
evCost:'EV por 100 {u}',iceCost:'Combustión 100 {u}',perUnitSaving:'Ahorro por {u}',
per100:'{v} ahorrados / 100 {u}',savingByMonth:'Ahorro por mes',
compareNote:'El gráfico muestra el ahorro frente a recorrer la misma distancia con combustión. Se usan cargas con distancia.',
needData:'Añade cargas con distancia',
settingsTitle:'Ajustes',regionSection:'País y región',country:'País',currency:'Moneda',
unit:'Unidad de distancia',language:'Idioma',vehicles:'Mis vehículos',addVehicle:'+ Vehículo',
defaultHint:'Toca la estrella para el vehículo por defecto. El selector aparece con 2+ vehículos.',
formSection:'Formulario',advAlways:'Campos avanzados siempre abiertos',
advAlwaysD:'Duración, lugar y rango de carga visibles por defecto',
dataSection:'Datos',exportJson:'Exportar (JSON)',exportCsv:'Exportar (CSV — Excel/Power BI)',
importJson:'Restaurar copia (JSON)',reset:'Restablecer datos',about:'Acerca de',
aboutText:'WattTrack — tus datos permanecen solo en este dispositivo. No se envía nada a servidores.',
addTitle:'Nueva carga',editTitle:'Editar carga',date:'Fecha',chargeType:'Tipo de carga',
company:'Casa o red de carga',homeChip:'Casa',kwh:'Energía (kWh)',distance:'Distancia recorrida ({u})',
freeCharge:'Carga gratis',freeChargeD:'Promo, solar… — se guarda como 0',
amount:'Importe pagado ({s})',discountType:'Tipo de descuento',amountType:'Importe',percentType:'Porcentaje (%)',
bank:'Banco / Promo',vehicle:'Vehículo',advanced:'+ Avanzado',advancedHide:'− Ocultar avanzado',
duration:'Duración (min)',location:'Lugar',socRange:'Rango de carga (%)',note:'Nota',
formError:'Red, kWh e importe requeridos',save:'Guardar',
deleteAsk:'¿Eliminar esta carga?',deleted:'Carga eliminada',saved:'Carga guardada',updated:'Carga actualizada',
demoBanner:'Datos de ejemplo cargados — añade los tuyos',clearDemo:'Borrar',demoCleared:'Ejemplos borrados',
obWelcome:'¡Bienvenido!',obCountryQ:'¿Dónde cargas? Ajustaremos moneda y unidad.',
obCarQ:'Elige tu coche',obCarSub:'Escribe marca o modelo — distingue versiones por año y batería.',
searchCountry:'Buscar país…',searchCar:'ej. Model 3, EV6…',continue:'Continuar',skip:'Omitir',start:'Empezar',
battery:'Batería',arch:'Arquitectura',dcMax:'DC máx',acMax:'AC',range:'Autonomía',years:'Años',
customAdd:'Añadir «{q}» como vehículo propio',vehicleAdded:'Vehículo añadido',add:'Añadir',
wipeAsk1:'Se borrarán TODOS los datos. ¿Seguro?',wipeAsk2:'Irreversible. ¿Borrar?',
wiped:'Datos borrados',imported:'Copia restaurada',
importFail:'Copia WattTrack no válida',importAsk:'cargas se importarán. ¿Combinar?',
jsonDone:'Copia JSON descargada',csvDone:'CSV descargado',noData:'Sin cargas aún',sessions:'cargas'},

it:{navHome:'Home',navHistory:'Cronologia',navCompare:'Confronta',navSettings:'Impostazioni',
week:'Settimana',month:'Mese',year:'Anno',
periodWeek:'Totale settimana',periodMonth:'Totale mese',periodYear:'Totale anno',
savings:'risparmiato',avgPerKwh:'Media per kWh',cost100:'Costo per 100 {u}',
totalKwhP:'Energia (kWh)',sessionsCompanies:'Ricariche / Reti',totalDiscP:'Sconti ricevuti',
freeCount:'Ricariche gratis',weeklySpend:'Spesa settimanale',monthlyTotals:'Spesa mensile',
firmDist:'Per rete',recentCharges:'Ricariche recenti',viewAll:'Tutte',
historyTitle:'Cronologia',allYears:'Tutti gli anni',allFirms:'Tutte le reti',allTypes:'Tutti i tipi',free:'Gratis',
compareTitle:'Confronta vs Termica',fuelType:'Carburante dell’altra auto',
petrol:'Benzina',diesel:'Diesel',hybrid:'Ibrida',
fuelPrice:'Prezzo ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Confronta',
evCost:'EV per 100 {u}',iceCost:'Termica 100 {u}',perUnitSaving:'Risparmio per {u}',
per100:'{v} risparmiati / 100 {u}',savingByMonth:'Risparmio per mese',
compareNote:'Il grafico mostra il risparmio rispetto alla stessa distanza con un’auto termica. Si usano ricariche con distanza.',
needData:'Aggiungi ricariche con distanza',
settingsTitle:'Impostazioni',regionSection:'Paese e regione',country:'Paese',currency:'Valuta',
unit:'Unità di distanza',language:'Lingua',vehicles:'I miei veicoli',addVehicle:'+ Veicolo',
defaultHint:'Tocca la stella per il veicolo predefinito. La scelta appare con 2+ veicoli.',
formSection:'Modulo',advAlways:'Campi avanzati sempre aperti',
advAlwaysD:'Durata, luogo e intervallo di carica visibili di default',
dataSection:'Dati',exportJson:'Esporta (JSON)',exportCsv:'Esporta (CSV — Excel/Power BI)',
importJson:'Ripristina backup (JSON)',reset:'Azzera dati',about:'Info',
aboutText:'WattTrack — i tuoi dati restano solo su questo dispositivo. Nulla viene inviato a server.',
addTitle:'Nuova ricarica',editTitle:'Modifica ricarica',date:'Data',chargeType:'Tipo di ricarica',
company:'Casa o rete di ricarica',homeChip:'Casa',kwh:'Energia (kWh)',distance:'Distanza percorsa ({u})',
freeCharge:'Ricarica gratis',freeChargeD:'Promo, solare… — salvata come 0',
amount:'Importo pagato ({s})',discountType:'Tipo di sconto',amountType:'Importo',percentType:'Percento (%)',
bank:'Banca / Promo',vehicle:'Veicolo',advanced:'+ Avanzate',advancedHide:'− Nascondi avanzate',
duration:'Durata (min)',location:'Luogo',socRange:'Intervallo carica (%)',note:'Nota',
formError:'Rete, kWh e importo obbligatori',save:'Salva',
deleteAsk:'Eliminare questa ricarica?',deleted:'Ricarica eliminata',saved:'Ricarica salvata',updated:'Ricarica aggiornata',
demoBanner:'Dati di esempio caricati — aggiungi i tuoi',clearDemo:'Cancella',demoCleared:'Esempi cancellati',
obWelcome:'Benvenuto!',obCountryQ:'Dove ricarichi? Imposteremo valuta e unità di conseguenza.',
obCarQ:'Scegli la tua auto',obCarSub:'Scrivi marca o modello — distingui le versioni per anno e batteria.',
searchCountry:'Cerca paese…',searchCar:'es. 500e, Model 3…',continue:'Continua',skip:'Salta',start:'Inizia',
battery:'Batteria',arch:'Architettura',dcMax:'DC max',acMax:'AC',range:'Autonomia',years:'Anni',
customAdd:'Aggiungi «{q}» come veicolo personale',vehicleAdded:'Veicolo aggiunto',add:'Aggiungi',
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

// ---------- Durum ----------
const S = {
  country: 'TR', currency: 'TRY', unit: 'km', lang: 'tr',
  advOpen: false, defaultVehicleId: null, onboarded: false,
  period: 'month', cmp: null
};

const $ = id => document.getElementById(id);
const t = (key, vars) => {
  let s = (T[S.lang] && T[S.lang][key]) ?? T.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
};
const symOf = code => CURRENCY_SYMBOLS[code] || code;
const sym = () => symOf(S.currency);
const money = (v, code) => symOf(code || S.currency) + Math.round(v || 0).toLocaleString('tr-TR');
const money2 = (v, code) => symOf(code || S.currency) + (v || 0).toLocaleString('tr-TR', {maximumFractionDigits: 2});
const monthKey = iso => iso.slice(0, 7);
const distDisp = km => S.unit === 'mi' ? km / MI : km;
const per100Disp = perKm => S.unit === 'mi' ? perKm * MI * 100 : perKm * 100;

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2200);
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
function savingsOf(r) {
  if (r.free) return 0;
  if (r.indirimTip === 'percent') {
    const v = Number(r.indirimDeger) || 0;
    return v >= 100 ? 0 : r.odenen * v / (100 - v);
  }
  if (r.indirimTip === 'amount') return Number(r.indirimDeger) || 0;
  return 0;
}
// para birimi: kayıt para birimi ayarla eşleşen (veya eski kayıt) toplamlara girer
const inCur = r => !r.cur || r.cur === S.currency;
function shortDate(iso) {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return d + ' ' + MONTHS[S.lang][m - 1].slice(0, 3);
}
async function saveSetting(key, value) { await db.settings.put({key, value}); }

// ---------- araç silüetleri ----------
function carSVG(body, color) {
  const c = color || '#1C8742';
  const P = {
    sedan: 'M20 62 Q22 50 42 47 L62 34 Q80 26 112 26 Q144 26 158 36 L170 46 Q196 49 202 58 Q206 62 204 68 L188 68 A14 14 0 0 0 160 68 L84 68 A14 14 0 0 0 56 68 L24 68 Q18 66 20 62 Z',
    suv:   'M20 60 Q20 44 40 42 L56 26 Q64 18 100 18 Q140 18 152 28 L166 42 Q198 45 202 56 Q205 62 202 68 L186 68 A14 14 0 0 0 158 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q17 66 20 60 Z',
    hatch: 'M24 60 Q24 46 44 44 L58 28 Q66 20 100 20 Q126 20 138 28 L154 44 Q182 47 188 56 Q192 62 188 68 L174 68 A13 13 0 0 0 148 68 L82 68 A13 13 0 0 0 56 68 L28 68 Q21 66 24 60 Z',
    pickup:'M18 62 Q18 46 38 44 L52 26 Q58 18 92 18 L108 18 L110 42 L196 42 Q204 44 204 56 L204 62 Q204 68 198 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L22 68 Q16 66 18 62 Z'
  };
  const win = {
    sedan: 'M66 36 L112 30 Q136 30 150 38 L118 44 L70 44 Z',
    suv:   'M60 28 L100 24 Q132 24 146 32 L118 42 L64 42 Z',
    hatch: 'M62 30 L100 26 Q120 26 132 32 L116 42 L66 42 Z',
    pickup:'M56 28 L92 24 L104 24 L106 40 L60 40 Z'
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
  return `<div class="ev-summary">
    ${carSVG(v.body, colorFor(v.brand || v.ad || ''))}
    <div class="name">${esc((v.brand ? v.brand + ' ' : '') + (v.model || v.ad || ''))}</div>
    <div class="trim">${esc(v.trim || '')} · ${yr}</div>
    <div class="spec-grid">
      <div class="spec"><div class="k">${t('battery')}</div><div class="v">${v.batt ? v.batt + ' kWh' : '—'}</div></div>
      <div class="spec"><div class="k">${t('arch')}</div><div class="v">${v.arch ? v.arch + ' V' : '—'}</div></div>
      <div class="spec"><div class="k">${t('dcMax')}</div><div class="v">${v.dc ? v.dc + ' kW' : '—'}</div></div>
      <div class="spec"><div class="k">${t('acMax')}</div><div class="v">${v.ac ? v.ac + ' kW' : '—'}</div></div>
      <div class="spec" style="grid-column:1/-1"><div class="k">${t('range')}</div><div class="v">${v.range ? Math.round(distDisp(v.range)) + ' ' + S.unit : '—'}</div></div>
    </div>
  </div>`;
}

// ============================================================
// i18n
// ============================================================
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // dinamik (birim / sembol içeren) etiketler
  $('d-100-lbl').textContent = t('cost100', {u: S.unit});
  $('in-dist-lbl').textContent = t('distance', {u: S.unit});
  $('in-amount-lbl').textContent = t('amount', {s: sym()});
  $('c-price-lbl').textContent = t('fuelPrice', {s: sym()});
  $('c-cons-lbl').textContent = t('fuelCons');
  $('c-ev-lbl').textContent = t('evCost', {u: S.unit});
  $('c-ice-lbl').textContent = t('iceCost', {u: S.unit});
  $('ob-search').placeholder = t('searchCountry');
  $('country-search').placeholder = t('searchCountry');
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
// ANA SAYFA — tüm istatistikler
// ============================================================
$('d-period').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.period = b.dataset.v;
  $('d-period').querySelectorAll('button').forEach(x =>
    x.classList.toggle('sel', x === b));
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

async function renderDashboard() {
  const all = (await db.sessions.toArray()).filter(inCur);
  $('demo-banner').style.display = all.some(r => r.demo) ? '' : 'none';

  // varsayılan araç etiketi
  const vehicles = await db.vehicles.toArray();
  const dv = vehicles.find(v => v.id === S.defaultVehicleId) || vehicles[0];
  $('d-vehicle').textContent = dv ? (dv.brand ? dv.brand + ' ' + dv.model : dv.ad) : '';

  const cur = periodFilter(all);
  $('d-period-lbl').textContent =
    t(S.period === 'week' ? 'periodWeek' : S.period === 'year' ? 'periodYear' : 'periodMonth');

  const total = cur.reduce((s, r) => s + r.odenen, 0);
  const sav = cur.reduce((s, r) => s + savingsOf(r), 0);
  const kwh = cur.reduce((s, r) => s + r.kwh, 0);
  const distKm = cur.reduce((s, r) => s + (r.mesafeKm || 0), 0);
  const paidWithDist = cur.filter(r => r.mesafeKm > 0).reduce((s, r) => s + r.odenen, 0);

  $('d-total').textContent = money(total);
  $('d-savings').textContent = '+' + money(sav) + ' ' + t('savings');
  $('d-avg').textContent = kwh ? sym() + (total / kwh).toFixed(2) : '—';
  $('d-100').textContent = distKm >= 20
    ? money2(S.unit === 'mi' ? paidWithDist / (distKm / MI) * 100 : paidWithDist / distKm * 100) : '—';
  $('d-kwh').textContent = kwh.toLocaleString('tr-TR', {maximumFractionDigits: 0});
  $('d-sess').textContent = cur.length + ' / ' + new Set(cur.map(r => r.firma)).size;
  $('d-disc').textContent = money(sav);
  $('d-free').textContent = cur.filter(r => r.free).length;

  // haftalık barlar (her zaman son 7 gün)
  const now = new Date();
  const days = [], labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(all.filter(r => r.tarih.slice(0, 10) === key)
      .reduce((s, r) => s + r.odenen, 0));
    labels.push(DAYS[S.lang][(d.getDay() + 6) % 7]);
  }
  const maxDay = Math.max(1, ...days);
  $('d-week').innerHTML = days.map(v =>
    `<div style="height:${Math.max(4, Math.round(v / maxDay * 64))}px"></div>`).join('');
  $('d-weekdays').innerHTML = labels.map(l => `<div>${l}</div>`).join('');

  // aylık barlar (son 6 ay)
  const bars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    bars.push({
      label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
      sum: all.filter(r => monthKey(r.tarih) === key).reduce((s, r) => s + r.odenen, 0)
    });
  }
  const maxM = Math.max(1, ...bars.map(b => b.sum));
  $('d-months').innerHTML = bars.map(b =>
    `<div class="mb">
      <div class="amt">${b.sum ? money(b.sum) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(b.sum / maxM * 66)}px"></div>
      <div class="m">${b.label}</div>
    </div>`).join('');

  // firma dağılımı (ilk 5)
  const by = {};
  all.forEach(r => {
    (by[r.firma] ||= {firma: r.firma, total: 0, kwh: 0, count: 0});
    by[r.firma].total += r.odenen; by[r.firma].kwh += r.kwh; by[r.firma].count++;
  });
  const rows = Object.values(by).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxF = Math.max(1, ...rows.map(r => r.total));
  $('d-firms').innerHTML = rows.length ? rows.map(r =>
    `<div class="cmp">
      <div class="cmp-head">
        <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
        <div class="mid">
          <div class="name">${esc(r.firma)}</div>
          <div class="sub">${r.count} ${t('sessions')} · ${r.kwh ? (r.total / r.kwh).toFixed(2) : '0.00'} ${sym()}/kWh</div>
        </div>
        <div class="total">${money(r.total)}</div>
      </div>
      <div class="track"><div class="fill" style="width:${Math.round(r.total / maxF * 100)}%"></div></div>
    </div>`).join('') : `<div class="empty">${t('noData')}</div>`;

  // son şarjlar
  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 3);
  $('d-recent').innerHTML = sorted.length
    ? sorted.map(r => rowHTML(r, false)).join('')
    : `<div class="empty">${t('noData')}</div>`;
  $('d-recent').querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
$('d-viewall').addEventListener('click', () => showScreen('history'));
$('btn-clear-demo').addEventListener('click', async () => {
  const ids = (await db.sessions.toArray()).filter(r => r.demo).map(r => r.id);
  await db.sessions.bulkDelete(ids);
  toast(t('demoCleared'));
  renderDashboard();
});

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
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : cs + Math.round(r.odenen).toLocaleString('tr-TR')}</div>
      <div class="sav">${s > 0 ? '−' + cs + Math.round(s).toLocaleString('tr-TR') : ''}</div>
    </div>
    ${withDelete ? `<button class="del" data-del="${r.id}">×</button>` : ''}
  </div>`;
}

// ============================================================
// GEÇMİŞ — yıl / firma / tip filtreli, düzenlenebilir
// ============================================================
async function renderHistory() {
  const all = await db.sessions.toArray();
  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih));

  // filtre seçenekleri (seçimi koru)
  const years = [...new Set(sorted.map(r => r.tarih.slice(0, 4)))].sort().reverse();
  const firms = [...new Set(sorted.map(r => r.firma))].sort((a, b) => a.localeCompare(b));
  const keep = (sel, opts) => opts.includes(sel.value) ? sel.value : '';
  const fy = $('f-year'), ff = $('f-firm'), ft = $('f-type');
  const vy = keep(fy, years), vf = keep(ff, firms), vt = ['DC','AC','free'].includes(ft.value) ? ft.value : '';
  fy.innerHTML = `<option value="">${t('allYears')}</option>` + years.map(y => `<option>${y}</option>`).join('');
  ff.innerHTML = `<option value="">${t('allFirms')}</option>` + firms.map(f => `<option>${esc(f)}</option>`).join('');
  ft.innerHTML = `<option value="">${t('allTypes')}</option><option value="DC">DC</option><option value="AC">AC</option><option value="free">${t('free')}</option>`;
  fy.value = vy; ff.value = vf; ft.value = vt;

  const rows = sorted.filter(r =>
    (!vy || r.tarih.slice(0, 4) === vy) &&
    (!vf || r.firma === vf) &&
    (!vt || (vt === 'free' ? r.free : r.tip === vt)));

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
['f-year','f-firm','f-type'].forEach(id => $(id).addEventListener('change', renderHistory));

// ============================================================
// KIYASLA — yakıtlı araçla
// ============================================================
$('c-fuel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('c-fuel').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
$('c-calc').addEventListener('click', async () => {
  const price = parseFloat($('c-price').value) || 0;
  const cons = parseFloat($('c-cons').value) || 0;
  if (!price || !cons) return;
  S.cmp = {fuel: $('c-fuel').querySelector('.sel').dataset.v, price, cons};
  await saveSetting('cmp', S.cmp);
  renderCompare();
});

async function renderCompare() {
  if (S.cmp) {
    $('c-price').value = S.cmp.price;
    $('c-cons').value = S.cmp.cons;
    $('c-fuel').querySelectorAll('button').forEach(x =>
      x.classList.toggle('sel', x.dataset.v === S.cmp.fuel));
  }
  const box = $('c-result');
  if (!S.cmp) { box.style.display = 'none'; return; }

  const all = (await db.sessions.toArray()).filter(inCur);
  const withDist = all.filter(r => r.mesafeKm > 0);
  const distKm = withDist.reduce((s, r) => s + r.mesafeKm, 0);
  const paid = withDist.reduce((s, r) => s + r.odenen, 0);
  if (distKm < 20) {
    box.style.display = '';
    $('c-ev').textContent = '—'; $('c-ice').textContent = '—';
    $('c-perkm').textContent = t('needData');
    $('c-perkm').style.fontSize = '15px';
    $('c-per100').textContent = '';
    $('c-months').innerHTML = '';
    return;
  }
  box.style.display = '';
  $('c-perkm').style.fontSize = '28px';

  const evPerKm = paid / distKm;                 // ayarlı para birimi / km
  const icePerKm = S.cmp.price * S.cmp.cons / 100;
  const evP100 = S.unit === 'mi' ? evPerKm * MI * 100 : evPerKm * 100;
  const iceP100 = S.unit === 'mi' ? icePerKm * MI * 100 : icePerKm * 100;
  const savePerUnit = S.unit === 'mi' ? (icePerKm - evPerKm) * MI : icePerKm - evPerKm;

  $('c-ev').textContent = money2(evP100);
  $('c-ice').textContent = money2(iceP100);
  $('c-perkm').textContent = money2(savePerUnit) + ' / ' + S.unit;
  $('c-per100').textContent = t('per100', {v: money(iceP100 - evP100), u: S.unit});

  // son 6 ay kazanç: (yakıtlı maliyet − EV ödenen) mesafeli kayıtlarla
  const now = new Date();
  const bars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const list = withDist.filter(r => monthKey(r.tarih) === key);
    const dist = list.reduce((s, r) => s + r.mesafeKm, 0);
    const evPaid = list.reduce((s, r) => s + r.odenen, 0);
    bars.push({
      label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
      sum: Math.max(0, dist * icePerKm - evPaid)
    });
  }
  const maxB = Math.max(1, ...bars.map(b => b.sum));
  $('c-months').innerHTML = bars.map(b =>
    `<div class="mb">
      <div class="amt">${b.sum ? '+' + money(b.sum) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(b.sum / maxB * 66)}px"></div>
      <div class="m">${b.label}</div>
    </div>`).join('');
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

  const vehicles = await db.vehicles.toArray();
  $('set-vehicles').innerHTML = vehicles.length ? vehicles.map(v => {
    const name = v.brand ? v.brand + ' ' + v.model : v.ad;
    const sub = v.batt ? `${v.trim || ''} · ${v.batt} kWh` : '';
    const isDef = v.id === S.defaultVehicleId || (!S.defaultVehicleId && vehicles[0].id === v.id);
    return `<li>
      <button class="star ${isDef ? 'on' : ''}" data-star="${v.id}">★</button>
      <div class="vn">${esc(name)}<div class="vd">${esc(sub)}</div></div>
      <button class="rm" data-rm="${v.id}">×</button>
    </li>`;
  }).join('') : `<li style="color:var(--faint);font-weight:400">${t('noData')}</li>`;

  $('set-vehicles').querySelectorAll('[data-star]').forEach(b =>
    b.addEventListener('click', async () => {
      S.defaultVehicleId = +b.dataset.star;
      await saveSetting('defaultVehicleId', S.defaultVehicleId);
      renderSettings();
    }));
  $('set-vehicles').querySelectorAll('[data-rm]').forEach(b =>
    b.addEventListener('click', async () => {
      await db.vehicles.delete(+b.dataset.rm);
      renderSettings();
    }));
}
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
$('set-adv').addEventListener('change', async e => {
  S.advOpen = e.target.checked;
  await saveSetting('advOpen', S.advOpen);
});

// ---------- ülke seçici ----------
function countryItemHTML(c, selCode) {
  return `<div class="country-item ${c[0] === selCode ? 'sel' : ''}" data-code="${c[0]}">
    <div class="flag">${c[1]}</div>
    <div class="n">${esc(c[2])}</div>
    <div class="c">${c[3]} · ${c[5]}</div>
  </div>`;
}
function renderCountryList(boxId, query, selCode, onPick) {
  const q = (query || '').toLocaleLowerCase('tr');
  const list = COUNTRIES.filter(c => c[2].toLocaleLowerCase('tr').includes(q) || c[0].toLowerCase().includes(q));
  const box = $(boxId);
  box.innerHTML = list.map(c => countryItemHTML(c, selCode)).join('');
  box.querySelectorAll('.country-item').forEach(el =>
    el.addEventListener('click', () => onPick(el.dataset.code)));
}
$('btn-country').addEventListener('click', () => {
  $('country-search').value = '';
  renderCountryList('country-list', '', S.country, pickCountrySettings);
  $('page-country').classList.add('active');
});
$('btn-close-country').addEventListener('click', () => $('page-country').classList.remove('active'));
$('country-search').addEventListener('input', e =>
  renderCountryList('country-list', e.target.value, S.country, pickCountrySettings));
async function pickCountrySettings(code) {
  const c = COUNTRIES.find(x => x[0] === code);
  S.country = code; S.currency = c[3]; S.unit = c[5];
  if (LANG_NAMES[c[6]]) S.lang = c[6];
  await saveSetting('country', code);
  await saveSetting('currency', S.currency);
  await saveSetting('unit', S.unit);
  await saveSetting('lang', S.lang);
  $('page-country').classList.remove('active');
  applyI18n(); renderSettings();
}

// ---------- araç arama (ortak) ----------
function searchEV(q) {
  q = (q || '').toLocaleLowerCase('tr').trim();
  if (q.length < 2) return [];
  return EV_DB
    .map((e, i) => ({i, brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
      batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]}))
    .filter(v => (v.brand + ' ' + v.model + ' ' + v.trim).toLocaleLowerCase('tr').includes(q))
    .slice(0, 12);
}
function evItemHTML(v, selIdx) {
  const yr = v.y1 + (v.y2 ? '–' + v.y2 : '+');
  return `<div class="ev-item ${v.i === selIdx ? 'sel' : ''}" data-i="${v.i}">
    <div class="n">${esc(v.brand)} ${esc(v.model)}</div>
    <div class="d">${esc(v.trim)} · ${yr} · ${v.batt} kWh · ${v.arch}V</div>
  </div>`;
}
function bindEVSearch(inputId, resultsId, summaryId, onSel) {
  let sel = null;
  $(inputId).addEventListener('input', () => {
    const res = searchEV($(inputId).value);
    sel = null; onSel(null);
    $(summaryId).style.display = 'none';
    const box = $(resultsId);
    if (!res.length && $(inputId).value.trim().length >= 2) {
      box.innerHTML = `<button class="chip" style="align-self:flex-start" id="${resultsId}-custom">${t('customAdd', {q: esc($(inputId).value.trim())})}</button>`;
      $(resultsId + '-custom').addEventListener('click', () => {
        const custom = {ad: $(inputId).value.trim(), body: 'suv'};
        $(summaryId).innerHTML = evSummaryHTML(custom);
        $(summaryId).style.display = '';
        onSel(custom);
        box.innerHTML = '';
      });
      return;
    }
    box.innerHTML = res.map(v => evItemHTML(v, sel)).join('');
    box.querySelectorAll('.ev-item').forEach(el =>
      el.addEventListener('click', () => {
        sel = +el.dataset.i;
        box.querySelectorAll('.ev-item').forEach(x =>
          x.classList.toggle('sel', +x.dataset.i === sel));
        const e = EV_DB[sel];
        const v = {brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
          batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]};
        $(summaryId).innerHTML = evSummaryHTML(v);
        $(summaryId).style.display = '';
        onSel(v);
      }));
  });
}

// ---------- ayarlardan araç ekleme ----------
let carPick = null;
bindEVSearch('car-search', 'car-results', 'car-summary', v => {
  carPick = v;
  $('car-save').disabled = !v;
});
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
  return v.brand
    ? {ad: v.brand + ' ' + v.model, brand: v.brand, model: v.model, trim: v.trim,
       y1: v.y1, y2: v.y2, batt: v.batt, arch: v.arch, dc: v.dc, ac: v.ac,
       range: v.range, body: v.body}
    : {ad: v.ad, body: v.body || 'suv'};
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
  $('wrap-bank').style.display = free ? 'none' :
    ((parseFloat($('in-disc-val').value) || 0) > 0 ? '' : 'none');
});
$('in-tip').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-tip').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
$('in-disc-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-disc-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
$('in-disc-val').addEventListener('input', () => {
  $('wrap-bank').style.display = (parseFloat($('in-disc-val').value) || 0) > 0 ? '' : 'none';
});
function socSync() {
  let a = +$('in-socb').value, b = +$('in-soca').value;
  if (a > b) { [a, b] = [b, a]; }
  $('soc-val').textContent = a + ' → ' + b;
}
['in-socb','in-soca'].forEach(id => $(id).addEventListener('input', socSync));

async function openAdd(id) {
  editingId = id || null;
  const r = id ? await db.sessions.get(id) : null;
  $('add-title').textContent = t(id ? 'editTitle' : 'addTitle');
  $('form-err').classList.remove('show');

  // ülke seçici (varsayılan: ayarlardaki ülke)
  const selCode = r?.ulke || S.country;
  $('in-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}" ${c[0] === selCode ? 'selected' : ''}>${c[1]} ${c[2]} (${c[3]})</option>`).join('');

  $('in-date').value = r ? r.tarih.slice(0, 10) : new Date().toISOString().slice(0, 10);
  $('in-tip').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (r?.tip || 'DC')));
  $('in-firm').value = r?.firma || '';
  $('in-kwh').value = r?.kwh ?? '';
  $('in-dist').value = r?.mesafeKm ? Math.round(distDisp(r.mesafeKm)) : '';
  $('in-free').checked = !!r?.free;
  $('in-amount').value = r && !r.free ? r.odenen : '';
  const dt = r?.indirimTip === 'percent' ? 'percent' : 'amount';
  $('in-disc-type').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === dt));
  $('in-disc-val').value = r?.indirimDeger || '';
  $('in-dur').value = r?.dur ?? '';
  $('in-loc').value = r?.loc || '';
  $('in-socb').value = r?.socB ?? 20;
  $('in-soca').value = r?.socA ?? 80;
  $('in-note').value = r?.not || '';
  socSync();
  $('in-free').dispatchEvent(new Event('change'));

  // firma çipleri: son kullanılan + ülkeye göre popüler
  const all = await db.sessions.toArray();
  const used = [];
  [...all].sort((a, b) => b.tarih.localeCompare(a.tarih))
    .forEach(x => { if (!used.includes(x.firma)) used.push(x.firma); });
  const pop = S.country === 'TR' ? FIRMS_TR : FIRMS_INT;
  const chips = [...new Set([t('homeChip'), ...used, ...pop])].slice(0, 5);
  $('firm-chips').innerHTML = chips.map(f =>
    `<button type="button" class="chip" data-f="${esc(f)}">${esc(f)}</button>`).join('');
  $('firm-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => { $('in-firm').value = b.dataset.f; }));
  $('firm-list').innerHTML = [...new Set([...pop, ...used])].map(f =>
    `<option value="${esc(f)}">`).join('');

  $('disc-chips').innerHTML = [0, 10, 20].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}%</button>`).join('');
  $('disc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      $('in-disc-type').querySelectorAll('button').forEach(x =>
        x.classList.toggle('sel', x.dataset.v === 'percent'));
      $('in-disc-val').value = b.dataset.v;
      $('wrap-bank').style.display = +b.dataset.v > 0 ? '' : 'none';
    }));
  $('soc-chips').innerHTML = ['20-80','10-90','0-100'].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}</button>`).join('');
  $('soc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      const [a, c] = b.dataset.v.split('-');
      $('in-socb').value = a; $('in-soca').value = c; socSync();
    }));

  $('in-bank').innerHTML = BANKS.map(b => `<option value="${esc(b)}">${b || '—'}</option>`).join('');
  $('in-bank').value = r?.banka || '';
  $('wrap-bank').style.display = (r?.indirimDeger > 0 && !r?.free) ? '' : 'none';

  // araç seçimi (2+ araç)
  const vehicles = await db.vehicles.toArray();
  $('wrap-vehicle').style.display = vehicles.length > 1 ? '' : 'none';
  $('in-vehicle').innerHTML = vehicles.map(v =>
    `<option value="${v.id}">${esc(v.brand ? v.brand + ' ' + v.model : v.ad)}</option>`).join('');
  $('in-vehicle').value = r?.aracId ?? S.defaultVehicleId ?? (vehicles[0]?.id || '');

  // gelişmiş: ayara veya kayıttaki dolu alana göre açık
  const advOpen = S.advOpen || !!(r && (r.dur || r.loc || r.not));
  $('adv-fields').classList.toggle('open', advOpen);
  $('btn-adv').textContent = advOpen ? t('advancedHide') : t('advanced');

  $('page-add').classList.add('active');
  $('page-add').querySelector('.ov-body').scrollTop = 0;
}

$('btn-save').addEventListener('click', async () => {
  const firma = $('in-firm').value.trim();
  const kwh = parseFloat($('in-kwh').value);
  const free = $('in-free').checked;
  const amount = free ? 0 : parseFloat($('in-amount').value);
  if (!firma || isNaN(kwh) || kwh <= 0 || (!free && (isNaN(amount) || amount < 0))) {
    $('form-err').classList.add('show');
    return;
  }
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const distIn = parseFloat($('in-dist').value) || 0;
  const discVal = free ? 0 : (parseFloat($('in-disc-val').value) || 0);
  let a = +$('in-socb').value, b = +$('in-soca').value;
  if (a > b) [a, b] = [b, a];
  const rec = {
    tarih: $('in-date').value + 'T12:00',
    tip: $('in-tip').querySelector('.sel').dataset.v,
    firma, kwh,
    odenen: free ? 0 : amount,
    free,
    indirimTip: discVal > 0 ? $('in-disc-type').querySelector('.sel').dataset.v : 'none',
    indirimDeger: discVal,
    banka: discVal > 0 ? $('in-bank').value : '',
    mesafeKm: distIn ? (S.unit === 'mi' ? distIn * MI : distIn) : null,
    dur: parseInt($('in-dur').value) || null,
    loc: $('in-loc').value.trim(),
    socB: a, socA: b,
    ulke: code, cur: c[3],
    aracId: parseInt($('in-vehicle').value) || null,
    not: $('in-note').value.trim()
  };
  if (editingId) {
    await db.sessions.update(editingId, rec);
    toast(t('updated'));
  } else {
    await db.sessions.add(rec);
    toast(t('saved'));
  }
  $('page-add').classList.remove('active');
  showScreen(screen);
});

// ============================================================
// ONBOARDING
// ============================================================
let obCountry = 'TR', obEv = null;
function obRenderCountries(q) {
  renderCountryList('ob-countries', q, obCountry, code => {
    obCountry = code;
    const c = COUNTRIES.find(x => x[0] === code);
    $('ob-currency').value = c[3];
    $('ob-unit').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === c[5]));
    if (LANG_NAMES[c[6]] && !S.onboarded) { S.lang = c[6]; applyI18n(); }
    obRenderCountries($('ob-search').value);
  });
}
function initOnboarding() {
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('ob-currency').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  $('ob-currency').value = 'TRY';
  obRenderCountries('');
  $('ob-search').addEventListener('input', e => obRenderCountries(e.target.value));
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
  });
  $('ob-skip').addEventListener('click', () => finishOnboarding(false));
  $('ob-done').addEventListener('click', () => finishOnboarding(true));
}
async function finishOnboarding(withCar) {
  const c = COUNTRIES.find(x => x[0] === obCountry);
  S.country = obCountry;
  S.currency = $('ob-currency').value;
  S.unit = $('ob-unit').querySelector('.sel').dataset.v;
  if (LANG_NAMES[c[6]]) S.lang = c[6];
  S.onboarded = true;
  await saveSetting('country', S.country);
  await saveSetting('currency', S.currency);
  await saveSetting('unit', S.unit);
  await saveSetting('lang', S.lang);
  await saveSetting('onboarded', true);
  if (withCar && obEv) {
    const id = await db.vehicles.add(vehicleRec(obEv));
    S.defaultVehicleId = id;
    await saveSetting('defaultVehicleId', id);
  }
  await seedDemo();
  $('ob').classList.remove('active');
  applyI18n();
  renderDashboard();
}

// ============================================================
// ÖRNEK VERİLER
// ============================================================
async function seedDemo() {
  if ((await db.settings.get('seeded')) || await db.sessions.count() > 0) return;
  if (S.country !== 'TR') { await saveSetting('seeded', 1); return; }
  const d = off => {
    const x = new Date(); x.setDate(x.getDate() - off);
    return x.toISOString().slice(0, 10) + 'T12:00';
  };
  await db.sessions.bulkAdd([
    {tarih:d(1), tip:'DC', firma:'Trugo', kwh:42, odenen:215, indirimTip:'amount', indirimDeger:15, banka:'Garanti BBVA', mesafeKm:270, socB:15, socA:80, ulke:'TR', cur:'TRY', demo:true},
    {tarih:d(5), tip:'DC', firma:'Eşarj', kwh:38, odenen:198, indirimTip:'none', indirimDeger:0, mesafeKm:240, socB:20, socA:75, ulke:'TR', cur:'TRY', demo:true},
    {tarih:d(9), tip:'DC', firma:'ZES', kwh:45, odenen:230, indirimTip:'percent', indirimDeger:8, banka:'İş Bankası', mesafeKm:300, socB:22, socA:90, ulke:'TR', cur:'TRY', demo:true},
    {tarih:d(22), tip:'AC', firma:'Trugo', kwh:36, odenen:180, indirimTip:'none', indirimDeger:0, mesafeKm:230, socB:25, socA:80, ulke:'TR', cur:'TRY', demo:true},
    {tarih:d(27), tip:'DC', firma:'Sharz.net', kwh:30, odenen:150, indirimTip:'percent', indirimDeger:5, banka:'Akbank', mesafeKm:190, socB:15, socA:70, ulke:'TR', cur:'TRY', demo:true},
    {tarih:d(48), tip:'AC', firma:'Ev', kwh:40, odenen:0, free:true, indirimTip:'none', indirimDeger:0, mesafeKm:260, socB:10, socA:85, ulke:'TR', cur:'TRY', demo:true},
  ]);
  await saveSetting('seeded', 1);
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
    app: 'WattTrack', version: 4, exportedAt: new Date().toISOString(),
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
  const vname = id => { const v = vehicles.find(x => x.id === id); return v ? (v.brand ? v.brand + ' ' + v.model : v.ad) : ''; };
  const num = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
  const safe = s => (s || '').replace(/;/g, ',');
  const head = ['Tarih','Ulke','ParaBirimi','Firma','Tip','Ucretsiz','kWh','Odenen','Indirim','ListeTutar','BirimFiyat','Banka','MesafeKm','SureDk','SoCOnce','SoCSonra','Lokasyon','Arac','Not'];
  const lines = [head.join(';')];
  rows.forEach(r => {
    const sav = savingsOf(r);
    lines.push([
      r.tarih.slice(0, 10), r.ulke || '', r.cur || '', safe(r.firma), r.tip || '',
      r.free ? 1 : 0, num(r.kwh), num(r.odenen), num(sav), num(r.odenen + sav),
      r.kwh ? num(r.odenen / r.kwh) : '', safe(r.banka),
      r.mesafeKm ? num(r.mesafeKm) : '', r.dur ?? '', r.socB ?? '', r.socA ?? '',
      safe(r.loc), safe(vname(r.aracId)), safe(r.not)
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
    if (!confirm(data.sessions.length + ' ' + t('importAsk'))) { e.target.value = ''; return; }
    await db.sessions.bulkAdd(data.sessions.map(({id, ...r}) => r));
    for (const {id, ...v} of (data.vehicles || [])) {
      if (!(await db.vehicles.where('ad').equals(v.ad).count()))
        await db.vehicles.add(v);
    }
    toast(t('imported'));
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
  for (const key of ['country','currency','unit','lang','advOpen','defaultVehicleId','onboarded','cmp']) {
    const row = await db.settings.get(key);
    if (row) S[key] = row.value;
  }
  initOnboarding();
  applyI18n();
  if (!S.onboarded) {
    $('ob').classList.add('active');
  } else {
    await seedDemo();
  }
  renderDashboard();
})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
