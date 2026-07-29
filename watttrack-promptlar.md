# WattTrack — Claude Code Prompt Listesi

**Temel:** v19 · **Toplam:** 54 madde, 6 faz

Her madde tek başına Claude Code'a yapıştırılabilir. Çalışma sırası ve test listesi ayrı dosyada.

---

## BÖLÜM 0 — Uygulanmayacak öneriler

Bu maddeler bazı analizlerde geçiyor ama projede zaten var ya da yanlış. Claude Code'a verme:

| İddia | Gerçek |
|---|---|
| "manifest.json ve service worker eklenmeli" | İkisi de var (`sw.js` CACHE v19, tam manifest + shortcuts + share_target) |
| "JSON/CSV dışa aktarma ve içe aktarma butonu eklenmeli" | Üçü de Ayarlar'da mevcut |
| "Çoklu araç desteği eklenmeli" | Tam olarak var: varsayılan araç, arşiv, fotoğraf, araç bazlı filtre |
| "Tablolar mobilde yatay kayıyor, kart görünümüne geçilmeli" | Projede hiç `<table>` yok, zaten kart tabanlı (`.crow`) |
| "Şemaya odometer, charge_type, duration_minutes eklenmeli" | `kmNow`/`kmStart`, `tip`, `dur` zaten var |
| "Harita desteği güçlü yön" | Uygulamada harita yok; OpenChargeMap sadece GPS'e basınca lokasyon adı öneriyor |
| "km başına maliyet otomatik hesaplanmalı" | `d-1km` olarak var |
| "Ort. şarj süresi / SOC / geçen aya göre % eksik" | Üçü de ana sayfada var |
| "Yakıtlı araç karşılaştırması eklenmeli" | Kıyasla sekmesinin tamamı bu |
| "Bakım modülü eklenmeli" | Gider modülü 9 kategoriyle var. Eksik olan hatırlatma (WT-44) |
| "50.000 kayıtta performans" | Gerçek sorun ölçek değil, her render'daki tam tablo taraması (WT-49) |
| "Widget / Material You / Adaptive Icon" | TWA ile paketlenen PWA'de native kod olmadan yapılamaz |
| "6 dilde i18n anahtarları eksik" | 6 dilin 239 anahtarının tamamı dolu |
| "Bottom nav'da en fazla 5 sekme olmalı" | 7 sekme korunacak; tek iş kontrast (WT-26) ve dikey dokunma alanı (WT-25) |
| "Hızlı kayıt modu eklenmeli" | Form zaten hızlı, alanların çoğu seçili geliyor, ekstra isteyen "Gelişmiş"e tıklıyor |
| "PDF / yazdırma raporu" | İstenmiyor |
| "CO₂ tasarrufu hesabı" | İstenmiyor |
| "Çok zamanlı elektrik tarifesi (T1/T2/T3)" | Gereksiz; kullanıcı tek kWh fiyatını biliyor (WT-16) |

---

# FAZ 1 — Kritik

### WT-01 · Saat dilimi hatası (7 ayrı yerde)
```
app.js içinde `new Date().toISOString().slice(0,10)` ve `.slice(0,7)` kullanılan
TÜM yerleri bul ve yerel saat dilimine göre çalışan bir yardımcıyla değiştir:

  const localISO = (d = new Date()) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const localMonth = (d = new Date()) => localISO(d).slice(0, 7);

Değiştirilecek yerler (en az bunlar):
  1. openAdd() → $('in-date').value varsayılanı
  2. openExpense() → $('in-exp-date').value varsayılanı
  3. periodFilter() → 'week' ve 'month' dalları
  4. prevPeriodFilter() → 'week' dalı
  5. renderStats() → S.gran === 'week' bar anahtarları
  6. today() → yedek dosya adı
  7. fetchTable() ve fetchRate() → `day` karşılaştırması

Mevcut hata: Türkiye UTC+3 olduğu için gece 00:00-03:00 arasında form
DÜNÜN tarihini öneriyor, ayın 1'inde "Bu ay" GEÇEN AYI gösteriyor.

Kabul kriteri: Sistem saatini 01:00'e alıp test et — form bugünün tarihini
önermeli, "Bu ay" doğru ayı göstermeli.
```

### WT-02 · Sayı biçimi: tek bir ondalık/binlik kuralı
```
Uygulamanın tamamında geçerli TEK bir sayı kuralı kur. Şu an giriş ayrıştırma
`pf()` içinde dağınık, gösterim ise 12 ayrı yerde `toLocaleString('tr-TR')`
olarak tekrarlanıyor.

--- KURAL ---
ONDALIK AYRACI: virgül (,)   ·   BİNLİK AYRACI: nokta (.)   ·   ONDALIK: 2 basamak
Bu kural DİL AYARINDAN BAĞIMSIZ, tüm dillerde aynı. Ürün kararı.

--- A) GİRİŞ AYRIŞTIRMA (pf fonksiyonunu yeniden yaz) ---
function pf(str) {
  if (str == null) return NaN;
  let s = String(str).trim()
    .replace(/[^\d.,\-]/g, '');          // para simgesi, boşluk, birim at
  if (!s) return NaN;
  const sonNokta = s.lastIndexOf('.');
  const sonVirgul = s.lastIndexOf(',');
  if (sonNokta > -1 && sonVirgul > -1) {
    // İkisi de var → SONUNCUSU ondalık, diğeri binlik
    const ond = Math.max(sonNokta, sonVirgul);
    s = s.slice(0, ond).replace(/[.,]/g, '') + '.' + s.slice(ond + 1).replace(/[.,]/g, '');
  } else if (sonNokta > -1 || sonVirgul > -1) {
    // Tek ayraç var → KULLANICI GİRİŞİNDE HER ZAMAN ONDALIK KABUL ET
    // (kullanıcı nokta yazsa bile virgül gibi davran)
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : Math.round(n * 100) / 100;   // 2 basamağa sabitle
}

Örnekler:
  "43,57"     → 43.57
  "43.57"     → 43.57     (nokta girildi, ondalık kabul edildi)
  "1.234,56"  → 1234.56   (nokta binlik, virgül ondalık)
  "1,234.56"  → 1234.56   (virgül binlik, nokta ondalık)
  "43,5"      → 43.5
  "43,579"    → 43.58     (2 basamağa yuvarlandı)
  " 503,56 ₺" → 503.56

--- B) GÖSTERİM (tek fonksiyon) ---
function fmtNum(v, dec = 0) {
  if (v == null || isNaN(v)) return '—';
  const neg = v < 0;
  const [tam, ond] = Math.abs(v).toFixed(dec).split('.');
  const tamStr = tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + tamStr + (ond ? ',' + ond : '');
}

Mevcut 12 adet `toLocaleString('tr-TR')` çağrısını bununla değiştir:
  app.js satır 375 (money), 376 (money2), 790 (d-kwh), 802/804 (d-odo),
  832 (d-yr-kwh), 1010/1011 (rowHTML), 1200 (c-dist), 1334 (araç km),
  1487 (gider tutarı), 1753 (net satırı)
money  → fmtNum(v, 0)
money2 → fmtNum(v, 2)

--- C) GİRİŞ ALANLARINDA CANLI DÜZELTME ---
Tutar, kWh, kur, indirim, birim fiyat gibi ondalıklı alanlara `blur`
dinleyicisi ekle: alan boşalırken pf() ile ayrıştır ve fmtNum ile
VİRGÜLLÜ olarak geri yaz. Kullanıcı "43.57" yazıp alandan çıkınca
kutuda "43,57" görsün. Böylece kural görünür hale gelir.

Not: Bu tek fonksiyon ileride dile göre biçimlendirmek istenirse
değiştirilecek TEK yer olacak — hepsini oraya topla.

Kabul kriteri: Tutar alanına "1234.5" yaz, alandan çık → "1.234,50" görünmeli,
kayıtta 1234.5 saklanmalı.
```

### WT-03 · kWh girişini tek alana indir
```
index.html'deki çift kutulu kWh girişini (`in-kwh-int` + `in-kwh-dec`) tek bir
alana indir.

Mevcut hata: btn-save handler'ında `kwh = kInt + kDec/100`. Kullanıcı 45,5 kWh
girmek için sağ kutuya "5" yazınca 45,05 kaydediliyor — %1'lik sessiz hata.

Yap:
- Tek `<input type="text" inputmode="decimal" id="in-kwh">` koy, placeholder "45,27".
- WT-02'deki yeni pf() ile ayrıştır, WT-02/C'deki blur biçimlendirmesini uygula.
- openAdd() içindeki iki kutuya değer yazan bloğu ve iki `input` dinleyicisini kaldır.
- `kwhHint` çeviri anahtarının 6 dildeki metnini sadeleştir: "Örn. 45,27".
- Doğrulama WT-04'te yapılacak.

Kabul kriteri: "45,5" yaz → kayıt 45.5 olarak saklanmalı.
```

### WT-04 · Sayısal alan sınırları zorlanmıyor
```
KRİTİK BULGU: `type="number"` alanlarındaki `min`/`max` öznitelikleri bir <form>
doğrulaması olmadan ZORLANMIYOR. Kod doğrudan `parseInt(el.value)` okuyor ve
hiç kırpma yapmıyor. Yani:
  - Şarj süresi: max="48" saat yazıyor ama 999 saat kaydedilebiliyor
  - SoC: max="100" yazıyor ama %800 kaydedilebiliyor
    → "Ort. şarj aralığı" değerinin bozuk görünmesinin muhtemel sebebi bu
  - Mesafe: min="0" var, üst sınır yok

Tamamen sınırsız alanlar:
  in-amount (tutar), in-disc-val (indirim), in-rate (kur),
  in-loc (lokasyon), in-note (not), in-firm-other (özel firma adı)
  → in-note'ta maxlength yokken in-exp-note'ta 120 var; tutarsız.

Yap:
1. Tek bir doğrulama katmanı yaz ve HER İKİ formda (şarj + gider) kullan:

   const KURALLAR = {
     kwh:       {min: 0.01,     max: 300,       ondalik: 2},
     tutar:     {min: 0,        max: 1000000,   ondalik: 2},
     indirim:   {min: 0,        max: 1000000,   ondalik: 2},  // yüzde ise 0-100
     kur:       {min: 0.000001, max: 100000,    ondalik: 6},
     mesafe:    {min: 0,        max: 5000},
     odo:       {min: 0,        max: 2000000},
     surSaat:   {min: 0,        max: 48},
     surDak:    {min: 0,        max: 59},
     soc:       {min: 0,        max: 100},
     birimFiyat:{min: 0,        max: 1000,      ondalik: 2},
   };

2. Sınır dışı değerde SESSİZCE KIRPMA — kullanıcıya söyle:
   "Şarj yüzdesi 0-100 arasında olmalı" (yeni anahtarlar, 6 dilde).
3. Metin alanlarına maxlength: lokasyon 60, not 200, özel firma adı 40.
4. socB ≥ socA ise hata ver. Şu an kod sessizce yer değiştiriyor
   (`if (a > b) [a,b] = [b,a]`) — bu düzeltme değil, veri uydurma.
   socB === socA da reddedilsin.
5. Süre 0 dakika ise `dur: null` yaz (zaten `|| null` ile oluyor).
6. MEVCUT BOZUK VERİYİ TEMİZLE: açılışta bir kez tara, sınır dışı
   socB/socA/dur değerlerini bul ve kullanıcıya bildir:
   "3 kayıtta geçersiz şarj yüzdesi var — [Göster]".
   Otomatik silme, kullanıcı düzeltsin.

Kabul kriteri: SoC alanına 800 yaz → kaydedilmemeli, açık hata çıkmalı.
Mevcut bozuk kayıt varsa açılışta uyarı görünmeli.
```

### WT-05 · Tarih alanı boş bırakılabiliyor
```
app.js btn-save doğrulaması firma/kWh/tutar bakıyor ama tarihe bakmıyor.
Boş tarih `tarih: "T12:00"` üretir; slice(0,4) ile tüm yıl/ay grupları bozulur.

Yap:
- Kaydetmeden önce $('in-date').value boş veya geçersizse hata göster
  (yeni çeviri anahtarı: dateNeeded, 6 dilde).
- Gelecek tarih girilirse uyar ama ENGELLEME — kullanıcı ileri tarihli kayıt
  girebilmeli: "İleri tarihli kayıt giriyorsun" toast'ı yeterli.
- Aynı doğrulamayı gider formuna (in-exp-date) da uygula.

Kabul kriteri: Tarihi elle sil → Kaydet → hata mesajı çıkmalı, kayıt oluşmamalı.
```

### WT-06 · "Verileri Sıfırla" giderleri silmiyor
```
app.js `btn-wipe` click handler'ında `db.expenses.clear()` çağrısı eksik.
Sessions, vehicles, settings temizleniyor ama expenses tablosu duruyor;
sıfırlama sonrası eski vergi/sigorta kayıtları geri geliyor ve TCO'yu bozuyor.

Dört tabloyu tek bir Dexie transaction'ı içinde temizle:
  await db.transaction('rw', db.sessions, db.vehicles, db.expenses, db.settings,
    async () => { ... clear() ... });

Kabul kriteri: Gider ekle → Verileri Sıfırla → Aracım sekmesinde hiç gider görünmemeli.
```

### WT-07 · Yedek geri yüklemede ayarlar okunmuyor
```
app.js importBackupText(): export payload'ı `settings` dizisini yazıyor ama
import bu diziye hiç dokunmuyor. Telefon değiştiren kullanıcı ülke, para birimi,
dil, tema, özel bankalar ve kıyas parametrelerini kaybediyor.

Yap:
- data.settings dizisini `db.settings.bulkPut()` ile geri yükle.
- Kullanıcıya sor: "Yedekteki ayarlar da geri yüklensin mi?" (confirm).
  Hayır derse yalnız kayıtları al.
- Geri yükledikten sonra S nesnesini settings'ten yeniden doldur, applyI18n() ve
  applyTheme() çağır, showScreen('dashboard') yap.
- defaultVehicleId ayarını WT-08'deki id eşlemesine göre çevir.

Kabul kriteri: Dili İngilizce + para birimini EUR yap, yedek al, verileri sıfırla,
yedeği geri yükle → dil ve para birimi geri gelmeli.
```

### WT-08 · Yedekte aracId yeniden eşlenmiyor
```
app.js importBackupText(): sessions'tan `id` düşürülüyor ama `aracId` eski
değerini koruyor. Araçlar sonradan yeni otomatik id'lerle ekleniyor. Cihazda
zaten araç varsa kayıtlar YANLIŞ araca ya da hiçbir araca bağlanıyor.
Boş cihazda tesadüfen çalıştığı için testte fark edilmiyor.

Yap:
1. Önce vehicles'ı ekle/eşleştir ve `const idMap = new Map()` ile
   eskiId → yeniId haritası kur (mevcut ada göre eşleşme dahil).
2. Sonra sessions ve expenses eklerken `aracId`yi idMap üzerinden çevir.
   Haritada karşılığı yoksa null yap (ölü referans bırakma).
3. Tüm import'u tek Dexie transaction'ına al; ortada hata olursa hiçbir şey yazılmasın.
4. defaultVehicleId ayarını da idMap ile çevir.

Kabul kriteri: A cihazında 2 araçlı yedek al → B cihazında zaten 1 araç varken
geri yükle → tüm kayıtlar doğru araçlara bağlanmalı.
```

### WT-09 · Araç silme akışı ve öksüz kayıt onarımı
```
GERÇEK SENARYO: "İlk arabama ait çok veri vardı. İkinci arabayı ekledim,
birincisini sildim. Eski verilerim duruyor ama yeni eklediğim aynı arabayla
eşleşmiyor — tek tek geçmiş kayıtlara gitmem gerekiyor."

NE OLUYOR: renderVehiclePage() `[data-rm]` handler'ı kaydı olan aracı SİLMİYOR,
arşivliyor (`archived: true`). Arşivlenen araç listelerden düşüyor. Kullanıcı
aynı arabayı tekrar ekleyince YENİ bir id alıyor; eski kayıtlar arşivdeki eski
id'ye bağlı kalıyor. Elle düzeltmenin yolu yok.
Ayrıca `db.vehicles.delete(vid)` çağrıldığında o araca bağlı `expenses`
kayıtları hiç temizlenmiyor — araç filtresine takılmadıkları için
"tüm araçlar" toplamında görünmeye devam ediyorlar.

Yap:
--- A) Üç seçenekli silme diyaloğu ---
Kaydı ve/veya gideri olan bir araç silinmek istendiğinde sessizce arşivleme.
Şunu sor: "Bu araca ait 47 şarj kaydı ve 6 gider var. Ne yapmak istersin?"
  1) "Kayıtları da sil"      → araç + kayıtlar + giderler kalıcı silinir
                                (ikinci onay iste, geri alınamaz)
  2) "Kayıtları koru, aracı arşivle"  → mevcut davranış (varsayılan)
  3) "Kayıtları başka araca taşı"     → araç seçtir, tüm aracId'leri devret,
                                        sonra aracı sil
Giderler her üç seçenekte şarj kayıtlarıyla AYNI kararı izlesin.
Kaydı olmayan araç için mevcut basit silme akışı kalsın.

--- B) Toplu kayıt devretme (elle düzeltme yolu) ---
Aracım sayfasında her aracın satırına "⇄ Kayıtları taşı" seçeneği ekle
(arşivdekiler dahil):
  - Kaynak araç ve hedef araç seç
  - İsteğe bağlı tarih aralığı filtresi ("sadece 2024 kayıtları")
  - Önizleme: "47 şarj kaydı ve 6 gider taşınacak"
  - Onayla → tek transaction'da aracId güncelle
  - Toast'ta "Geri al" (işlemi tersine çevir)

--- C) Öksüz kayıt tespiti ve onarımı ---
Açılışta (init içinde) aracId'si var olmayan bir araca işaret eden
kayıtları tara. Varsa Aracım sayfasında uyarı kartı:
  "12 kayıt silinmiş bir araca bağlı. [Bir araca ata] [Kayıtları sil]"

--- D) Arşivlenen araç görünürlüğü ---
Arşivdeki araçların kayıt sayısını göster:
  "BMW i4 — arşivde · 47 kayıt · [Geri al] [Kayıtları taşı]"
Şu an sadece "arşivde — kayıtları korunuyor" yazıyor, kaç kayıt olduğu belli değil.

Kabul kriteri:
- Kayıtlı araç sil → üç seçenek çıkmalı.
- "Kayıtları da sil" seç → kayıtlar ve giderler gitmeli.
- İki araç arasında toplu taşıma yap → tüm kayıtlar hedefte olmalı, geri alınabilmeli.
```

### WT-10 · Çevrilemeyen kur kaydı sessizce 0 sayılıyor
```
app.js convOf() null dönünce amtB() 0 veriyor ve kullanıcıya HİÇBİR uyarı
çıkmıyor. Kod içinde `let fxPendingCount = 0` tanımlı ama hiç kullanılmamış —
bu uyarı planlanıp unutulmuş.

Somut risk: COUNTRIES listesindeki 45 ülkenin 5'inin para birimi ECB/frankfurter
tablosunda YOK — RSD (Sırbistan), BAM (Bosna), MKD (K. Makedonya), ALL (Arnavutluk),
MDL (Moldova). Kullanıcı ana para birimini değiştirdiğinde bu kayıtlar
toplamdan sessizce düşüyor.

Yap:
1. renderDashboard, renderStats ve renderCompare'de çevrilemeyen kayıt sayısını say.
2. >0 ise ilgili sayfanın üstünde uyarı şeridi göster:
   "N kayıt kur bilgisi olmadığı için toplamlara dahil edilmedi" + "Düzelt" butonu.
3. "Düzelt" → o kayıtları listeleyip elle kur girilecek bir görünüm aç.
4. evdata.js'e `NO_AUTO_FX = ['RSD','BAM','MKD','ALL','MDL']` ekle; bu ülkeler
   seçilince form kur alanının altına "Bu para birimi için otomatik kur yok,
   elle gir" notu koy.
5. fxPendingCount ya kullanılsın ya silinsin.

Kabul kriteri: RSD'li kayıt oluştur, ana para birimini EUR yap →
uyarı şeridi görünmeli.
```

### WT-11 · Service worker dış API yanıtlarını kalıcı önbelleğe alıyor
```
sw.js fetch handler'ında origin kontrolü yok. frankfurter, Nominatim ve
OpenChargeMap yanıtları cache-first olarak kalıcı saklanıyor —
`?latest` kur sorgusu bir kez cache'lendikten sonra kur SONSUZA KADAR donuyor.

Yap:
1. Handler'ın başına ekle:
   if (new URL(e.request.url).origin !== location.origin) return;
2. index.html, app.js, evdata.js, manifest.json için network-first
   (ağ 3 sn'de yanıt vermezse cache'e düş) stratejisine geç.
   Görseller, video (WT-37) ve dexie.min.js cache-first kalabilir.
3. CACHE adını bump et.

Kabul kriteri: Uygulamayı aç → ertesi gün tekrar aç → kur güncel gelmeli.
```

### WT-12 · Yazma işlemlerinde hata yakalama ve kota yönetimi yok
```
Dexie yazma çağrılarının (sessions.add/update, expenses.add, vehicles.update,
settings.put) hiçbiri try/catch içinde değil. Depolama kotası dolarsa veya
tarayıcı özel modda IndexedDB'yi kısıtlarsa kullanıcı KAYITSIZ kaldığını
fark etmiyor — toast "Kaydedildi" diyor ama veri yazılmamış oluyor.

Yap:
1. `async function safeWrite(fn, errKey)` sarmalayıcısı yaz; hata olursa
   toast ile açık mesaj göster (yeni anahtar: saveFailed, quotaFull — 6 dilde).
2. QuotaExceededError'u ayrı yakala: "Cihaz depolaması dolu. Ayarlar → Dışa
   Aktar ile yedek al, sonra eski kayıtları temizle."
3. Başarı toast'ını yazma işlemi GERÇEKTEN bittikten sonra göster.
4. navigator.storage.persist() çağır (destekleniyorsa). Ayarlar'da durumunu
   ve navigator.storage.estimate() ile tahmini kullanımı göster.
   WT-39'daki ekran görüntüsü saklama bunu daha da önemli yapıyor.

Kabul kriteri: DevTools'tan kota simüle et → kaydet → açık hata mesajı çıkmalı.
```

---

# FAZ 2 — Anlamsal bütünlük

### WT-13 · kWh başı fiyatın payı ile paydası farklı kümeden geliyor
```
app.js renderDashboard(): `net` kur çevrilemeyen kayıtları dışlıyor (amtB → 0),
ama `kwh` bütün kayıtları topluyor. Yurt dışı kaydı olan kullanıcıda birim fiyat
olduğundan DÜŞÜK çıkıyor.

Yap: Birim fiyat, ortalama ve tüm oran metriklerinde pay ve payda AYNI kümeden
gelsin — `const convertible = cur.filter(isConv)` tanımla ve hem tutarı hem kWh'yi
bu kümeden hesapla. Ham kWh toplamı (d-kwh) tüm kayıtları saymaya devam edebilir
ama başlığında bunu belirt.

Kabul kriteri: Kur bilgisi olmayan bir kayıt ekle → kWh başı fiyat değişmemeli.
```

### WT-14 · Ana sayfa dönem seçicisi ekranın yarısını kapsamıyor
```
Ana sayfadaki Hafta/Ay/Yıl seçicisi altındaki bazı bölümler seçiciye bağlı değil
ama kullanıcı bunu anlayamıyor:

  Hero, kutular, indirim, ücretsiz sayısı   → dönem filtreli ✔
  "Detay istatistikler" (süre, SoC, güç)    → `all`, TÜM ZAMANLAR ✘
  "1 km"                                    → dönemde <20 km varsa sessizce
                                              tüm zamanlar sayaç moduna düşüyor ✘

Yap:
A) "Detay istatistikler" ve "1 km"i dönem filtresine bağla.
B) 1 km sayaç moduna düştüğünde bunu kutunun altında yaz:
   "kilometre sayacından, tüm zamanlar" — `distFromOdo` anahtarı zaten var,
   şu an sadece Kıyasla sayfasında kullanılıyor.

Kabul kriteri: "Hafta"yı seç → ekrandaki her sayı ya değişmeli ya da
neden değişmediğini söyleyen bir rozet taşımalı.
```

### WT-15 · İstatistik sayfasında seçici yalnızca ilk grafiği etkiliyor
```
app.js renderStats(): Hafta/Ay/Yıl segmenti (`d-gran`) sadece "Harcama grafiği"
için çalışıyor. Altındaki gün dağılımı, firma dağılımı, donut, bankalar ve
lokasyonlar HEPSİ tüm zamanlar — ama görsel olarak aynı seçicinin altındalar.

Yap: `d-gran` seçimini sayfanın tamamına uygula. Segmenti sayfa başlığının
hemen altına, tam genişlikte ve "Dönem: Ay" etiketiyle taşı ki kapsamı belli olsun.
Dönemde veri yoksa her blok kendi boş durumunu göstersin.

Kabul kriteri: "Hafta"yı seç → firma dağılımı ve donut da o haftaya daralmalı.
```

### WT-16 · Şarj yeri boyutu: Ev-İş / Firma ayrımı + ev kWh fiyatı
```
İKİ SORUNU BİRLİKTE ÇÖZ.

--- A) Donut iki farklı boyutu karıştırıyor ---
app.js renderStats() donut segmentleri: DC / AC / Ev.
DC-AC bir TEKNOLOJİ boyutu, "Ev" bir FİRMA değeri — ev şarjı da fiziksel olarak AC.
Aynı kayıt ana sayfadaki DC/AC filtresinde "AC", donutta "Ev" sayılıyor.

Yap:
1. sessions şemasına `mekan` alanı ekle: 'evis' | 'firma'
   (SADECE İKİ DEĞER — "kamu"/"public" terimini hiçbir yerde kullanma).
2. index.html'deki "Ev ya da Şarj Firması" etiketini "Ev-İş ya da Şarj Firması"
   yap. 6 dile çevir (en: "Home/Work or Charging Company", de: "Zuhause/Arbeit
   oder Ladeanbieter", fr: "Domicile/Travail ou opérateur", es: "Casa/Trabajo
   o compañía de carga", it: "Casa/Lavoro o operatore").
3. app.js fillFirmSelect() içinde listenin ilk öğesi olan `t('homeChip')`
   değerini "Ev" → "Ev-İş" olarak güncelle (Home/Work, Zuhause/Arbeit,
   Domicile/Travail, Casa/Trabajo, Casa/Lavoro).
4. Migration: firma === eski "Ev" değeri olan kayıtlara mekan='evis' ve
   firma='Ev-İş' yaz; diğerlerine mekan='firma'.
5. İstatistikte İKİ ayrı donut göster:
   - "Şarj tipi" → AC / DC  (mekan'dan bağımsız, `tip` alanından)
   - "Şarj yeri" → Ev-İş / Şarj firması
6. Ana sayfadaki DC/AC filtresi ile donut aynı `tip` alanını kullansın.

--- B) AC seçilince Ev-İş varsayılan gelsin ---
Kayıt formunda `in-tip` segmentinden AC seçilirse `in-firm` otomatik olarak
"Ev-İş" seçili gelsin (kullanıcı isterse değiştirir). DC seçilirse firma listesi
mevcut davranışına dönsün (en çok kullanılan firma).

--- C) Ev-İş şarjında tutarı kWh fiyatından hesapla ---
Gerçek problem: kullanıcı evinde araç şarjı için harcadığı elektriği ev
faturasından ayıramıyor. Ama kWh başına ne ödediğini BİLİYOR.

Yap:
1. Ayarlar'a tek bir alan ekle: "Ev/İş elektrik birim fiyatı (kWh başına)".
   TARİFE DİLİMİ, T1/T2/T3, puant/gece AYRIMI YAPMA — kullanıcı vergiler dahil
   tek bir kWh fiyatı biliyor, o kadarı yeterli. Para birimi ana ayardan gelsin.
2. Kayıt formunda SADECE firma "Ev-İş" seçiliyken görünen bir alan aç:
   "kWh birim fiyatı" (Ayarlar'daki değerle önceden dolu, düzenlenebilir).
3. Bu alan doluyken "Ödenen Tutar" otomatik hesaplansın: kwh × birimFiyat.
   Hesaplanan tutar salt-okunur DEĞİL — kullanıcı isterse ÜZERİNE YAZABİLSİN
   (eski davranış korunsun). Üzerine yazarsa birim fiyat alanı gri gösterilsin.
4. Hangi yöntemin kullanıldığını kayıtta sakla (`tutarKaynak: 'birimFiyat'|'manuel'`)
   ki sonradan birim fiyat değişince eski kayıtlar bozulmasın.
5. Ev-İş kaydında indirim alanını gizle (anlamsız).

Kabul kriteri:
- AC seç → firma otomatik "Ev-İş" gelmeli, kWh fiyatı alanı açılmalı.
- 40 kWh + 2,80 ₺/kWh gir → tutar 112,00 ₺ olarak dolmalı.
- Tutarın üzerine 100 yaz → 100 kaydedilmeli.
- DC seç → kWh fiyatı alanı kaybolmalı.
```

### WT-17 · Sayaç modunda kıyas grafiği yapay veri gösteriyor
```
app.js renderCompare(): `distKm < 20` olunca mesafe harcamaya orantılı dağıtılıyor
(`amtB(r)/net*odoDist`). Bu durumda yakıtlı çizgi, EV çizgisinin sabit katı oluyor —
iki çizgi birbirinin ölçeklenmiş kopyası. Grafik "veri" gibi görünüyor ama
hiçbir bilgi taşımıyor.

Yap: odoMode true iken `c-line` grafiğini gizle ve yerine açıklama koy:
"Kayıtlarda sürüş mesafesi olmadığı için zaman içindeki seyir gösterilemiyor."
Toplam rakamlar görünmeye devam etsin.

Not: WT-43 (yakıt fiyatı geçmişi) uygulandıktan sonra bu grafik gerçekten
anlamlı hale gelecek — grafiği silme, sadece bu modda gizle.
```

### WT-18 · Giderde araç seçimi zorunlu değil
```
DOĞRULANMIŞ BULGU: app.js openExpense() içinde araç seçici şöyle kuruluyor:
  $('in-exp-veh').innerHTML = `<option value="">${t('allVehicles')}</option>` + ...
ve kaydederken:
  aracId: $('in-exp-veh').value ? +$('in-exp-veh').value : null
Üstelik `wrap-exp-veh` yalnızca vs.length > 1 iken görünüyor — yani TEK ARAÇLI
kullanıcıda seçici hiç gösterilmiyor ve aracId her zaman null yazılıyor.

Sonuç: renderCompare()'deki `e.aracId === S.cmpVeh || !e.aracId` koşulu yüzünden
bu giderler HER araca sayılıyor, iki araçlı kullanıcıda kıyasa iki kez giriyor.
Ayrıca arşivlenmiş araçların giderleri hâlâ TCO'ya dahil.

Yap:
1. Gider formunda araç seçimini zorunlu yap. Tek araç varsa seçiciyi yine gizle
   ama o aracın id'sini OTOMATİK ATA (null bırakma).
2. "Tüm araçlar" seçeneğini gider FORMUNDAN kaldır — bu bir filtre değeri,
   geçerli bir kayıt değeri değil. (Listeleme filtresinde kalabilir.)
3. Migration: aracId'si null olan mevcut giderleri varsayılan araca ata.
   Hiç araç yoksa kullanıcıya sor.
4. "Tüm araçlar" görünümünde arşivlenmiş araçların giderlerini dışla
   (ya da "Arşiv dahil" onay kutusu koy).
5. TCO notuna hangi araçların dahil olduğunu yaz.

Kabul kriteri: Tek araçla gider ekle → kayıtta aracId dolu olmalı.
İki araç + bir gider → toplam gider tek sayılmalı.
```

### WT-19 · Mesafe/odometre çift kaynak sorunu
```
SORUN: app.js bumpVehicleKm() kayıttaki mesafeyi otomatik olarak araç sayacına
ekliyor. Kullanıcı ayrıca "km✎" ile gerçek sayacı girerse iki mekanizma çakışıyor
ve hangisinin doğru olduğu belirsizleşiyor (çift sayım).

ÖNEMLİ KISIT: Kullanıcı GEÇMİŞ TARİHLİ kayıt girebiliyor (tarih alanı serbest).
Bu yüzden "bir önceki kayıttan farkı al" mantığı tek başına yetmez — araya
sonradan kayıt eklenebilir.

Yap:
1. bumpVehicleKm()'i KALDIR. Sayaç sadece kullanıcının elle girdiği değerle
   ve kayıtlardaki odometre değerleriyle güncellensin.

2. sessions şemasına opsiyonel `odo` alanı ekle. Kayıt formunda mesafe alanının
   yanına "veya sayaç değeri" alanı koy — kullanıcı İKİSİNDEN BİRİNİ girsin:
     - `mesafeKm` doğrudan girilmişse aynen kullanılır (mevcut davranış korunur)
     - `odo` girilmişse mesafe TÜRETİLİR

3. Türetme, kaydın ekleniş sırasına DEĞİL tarihe göre yapılsın:
   function tureMesafe(kayitlar, aracId) {
     // aracın odo'su dolu kayıtlarını tarihe göre sırala
     // her kayıt için: mesafe = bu.odo - (tarihçe kendinden ÖNCEKİ odo'lu kayıt).odo
     // ilk odo'lu kayıtta mesafe null (kıyas noktası yok)
   }
   Bu fonksiyon her yazma sonrası ilgili aracın TÜM kayıtlarını yeniden hesaplasın
   (kayıt sayısı düşük, maliyeti önemsiz).

4. Doğrulama İKİ KOMŞUYA birden yapılsın (sadece öncekine değil):
   - Yeni kayıt tarihçe A ve B kayıtları arasına giriyorsa:
     A.odo ≤ yeni.odo ≤ B.odo olmalı.
   - Değilse kaydetme, açık hata göster:
     "Sayaç değeri 12.400 ile 13.100 arasında olmalı (14 Mart ve 2 Nisan kayıtları)."
   - Aracın kmStart değerinden küçük odo kabul etme.

5. Araç sayacı (kmNow) = o aracın en son tarihli odo'lu kaydının değeri ile
   elle girilen değerden BÜYÜK olanı. Hangisinin kullanıldığını Aracım
   sayfasında küçük not olarak göster.

6. Geriye dönük uyumluluk: mevcut `mesafeKm` alanı olan kayıtlar aynen çalışsın.
   Hesaplamalarda `mesafeKm ?? tureMesafe(...)` sırası izlensin.

Kabul kriteri:
- Sırasız gir: önce 1 Nisan (odo 13100), sonra 14 Mart (odo 12400) →
  1 Nisan kaydının mesafesi 700 olarak yeniden hesaplanmalı.
- 14 Mart için 13500 gir → hata mesajı çıkmalı, kayıt oluşmamalı.
- Sadece mesafe girilen eski kayıtlar bozulmamalı.
```

### WT-20 · Atlanan şarj kaydı istatistikleri bozuyor
```
WT-19 uygulandıktan sonra: kullanıcı bir şarjı girmeyi unutup sonrakini girerse,
iki kayıt arasındaki sayaç farkı gerçekte iki şarjla kat edilmiş mesafeyi içerir
ama kWh tek şarjınkidir. Tüketim ve km maliyeti anormal görünür.

Yap:
1. sessions şemasına `atlanan: boolean` alanı ekle.
2. Kayıt formunun gelişmiş bölümüne onay kutusu:
   "Bu şarjdan öncekini girmeyi unuttum" (yeni anahtar: missedLog, 6 dilde).
3. İşaretliyse bu kaydın mesafesi tüketim ve km-maliyeti ORTALAMALARINA dahil
   edilmesin. Harcama toplamına ve kWh toplamına dahil olmaya DEVAM ETSİN.
4. Otomatik sezgi — WLTP MENZİL KULLANMA (araçlar o değere ulaşmıyor, yanlış
   alarm üretir). Kullanıcının KENDİ geçmişini kullan:
   - Aracın son 10 kaydının ortalama tüketimini (kWh/100km) hesapla.
   - Yeni kaydın tüketimi bu ortalamanın YARISINDAN düşükse
     (aynı kWh ile anormal çok yol gidilmiş görünüyorsa) kaydederken sor:
     "Bu aralıkta girilmemiş bir şarj var mı?"
   - En az 5 geçmiş kayıt yoksa sorma (yeterli temel yok).
5. Geçmiş listesinde atlanan işaretli kayıtları küçük bir ikonla göster.

Kabul kriteri: Atlanan işaretli kayıt ekle → kWh/100km ortalaması bozulmamalı,
ama toplam harcama artmalı.
```

---

# FAZ 3 — Erişilebilirlik (WCAG 2.1 AA)

**Denetim özeti:** Kritik 4 · Majör 6 · Minör 3
Renk paleti açık temada güçlü (gövde metni 18,1:1, `--muted` 5,97:1, `--accent` 4,57:1 — hepsi AA geçiyor). Sorunlar yapı, etiketleme ve dokunma alanlarında.

### WT-21 · 🔴 Form alanlarının programatik etiketi yok (WCAG 3.3.2, 4.1.2)
```
index.html'de 38 adet `<div class="lbl">` görsel etiket olarak kullanılıyor ama
hiçbiri `<label for="...">` değil. Toplam sadece 3 `<label>` var. Ekran okuyucu
kullanıcısı formdaki hiçbir alanın ne olduğunu duyamıyor. EN KRİTİK bulgu.

Yap:
1. Tüm `<div class="lbl">Metin</div>` → `<label class="lbl" for="input-id">Metin</label>`
2. `applyI18n()` zaten textContent yazıyor, çalışmaya devam eder.
3. Açıklamaları (`.about`, `#kwhHint`, `#rate-note`) ilgili input'a
   `aria-describedby` ile bağla.
4. `.sw` switch'lerinde checkbox'ın erişilebilir adı YOK (label sadece <input>
   ve <i> içeriyor). `aria-labelledby` ile yanındaki `.t` başlığına bağla.
5. `#in-dur-h`/`#in-dur-m` ve `#in-socb`/`#in-soca` çiftlerine ayrı aria-label ver.

Kabul kriteri: VoiceOver/TalkBack ile forma gir → her alan adıyla okunmalı.
```

### WT-22 · 🔴 Sabit Türkçe aria-label ve çevrilmeyen etiket (WCAG 4.1.2)
```
1. index.html'de 18 `aria-label` ve 3 `placeholder` sabit Türkçe:
   "Araç filtresi", "Yıl filtresi", "Ülke ara…", "ör. EV6, Torres…",
   "kWh tam kısım", "Yeni kayıt" vb.
   Yap: `data-i18n-aria="anahtar"` desteği ekle ve applyI18n()'de işle.
   Eksik anahtarları 6 dile ekle.

2. `#c-icefix-lbl` ("Yakıtlı aracın yıllık sabit gideri…") HTML'de sabit ve
   applyI18n() bu id'ye HİÇ dokunmuyor → 6 dilin 5'inde Türkçe kalıyor.
   Yap: `data-i18n="iceFixLabel"` ekle, 6 dile çevir.

Not: Sayı biçimlendirmesi kasıtlı olarak tüm dillerde virgül ondalıklı
kalacak (WT-02) — bu bir hata değil, ürün kararı.

Kabul kriteri: Dili İngilizce yap → sayılar dışında Türkçe metin kalmamalı.
```

### WT-23 · 🔴 Başlık hiyerarşisi yok (WCAG 1.3.1)
```
Projede `<h1>`–`<h6>` HİÇ yok, `<main>` yok, `<header>` yok. Her başlık
`<div class="page-title">` veya `<div class="h2">`. Ekran okuyucu kullanıcısı
başlıkla gezinemiyor.

Yap:
1. `.content` sarmalayıcısını `<main>` yap.
2. Her `.page` içindeki `.page-title` → `<h1 class="page-title">`
3. `.h2` → `<h2 class="h2">`. Görsel stil değişmeyecek.
4. `<nav>`e `aria-label="Ana menü"` ekle (çevrilebilir).
5. Alt menüdeki aktif butona `aria-current="page"` ekle, showScreen()'de güncelle.
```

### WT-24 · 🔴 Overlay'lerde dialog semantiği, odak tuzağı ve Escape yok
```
`#page-add`, `#page-expense`, `#page-country`, `#page-addcar`, `#ob` overlay'leri
düz `<section>`. Sonuçları:
 - Ekran okuyucu arkadaki sayfayı okumaya devam ediyor
 - Klavye/switch kullanıcısı overlay dışına çıkabiliyor
 - Escape kapatmıyor
 - Android donanım geri tuşu overlay'i kapatmak yerine UYGULAMADAN ÇIKIYOR
   ← Play Store'a çıkınca en hızlı şikâyet toplayacak hata

Yap:
1. Her overlay'e `role="dialog" aria-modal="true" aria-labelledby="<başlık-id>"`.
2. Açılışta ilk odaklanabilir öğeye focus(), kapanışta tetikleyen butona geri dön.
3. Tab döngüsünü overlay içinde tut (focus trap).
4. Açıkken arkadaki `.app`e `inert` (veya `aria-hidden="true"`) uygula.
5. Escape ile kapat.
6. history.pushState/popstate ile geri tuşunu bağla: overlay açılınca pushState,
   popstate'te kapat. Aynı mantığı sekme geçişlerine de uygula.
7. Kapatırken form doluysa onay iste ("Girdiklerin kaybolacak").

Kabul kriteri: Android'de Yeni Kayıt açıkken geri tuşuna bas → uygulama
kapanmamalı, sadece form kapanmalı.
```

### WT-25 · 🟡 Dokunma hedefleri 44×44 px altında (WCAG 2.5.5)
```
Ölçtüğüm mevcut boyutlar:

  .crow .del (geçmişte silme)     26×26 px   ✘ en kritik — yanlışlıkla silme riski
  .vlist .cam (fotoğraf, km✎)     30×30 px   ✘
  .chip (indirim/SoC çipleri)     ~30 px     ✘
  .seg.mini button                ~31 px     ✘
  .ov-head .close                 32×32 px   ✘
  .theme-btn                      34×34 px   ✘
  .mini-btn                       ~35 px     ✘
  .sw (anahtar)                   46×27 px   ✘ (dikeyde)
  .details-toggle, .h2row .link   ~21 px     ✘
  .vlist .star / .rm              boyutsuz   ✘
  .save-btn                       ~48 px     ✔
  .gps-btn                        48×~44 px  ✔

Yap: Görsel boyutu büyütmeden dokunma alanını genişlet —
  min-width:44px; min-height:44px;
veya küçük ikon butonlarda görünmez genişletme:
  position:relative; &::after{content:'';position:absolute;inset:-9px}

Alt menüde 7 sekme KORUNACAK. Bu yüzden nav butonlarında yatay 44px
sağlanamayabilir — dikeyde 48px'i garanti et, yatayda mümkün olan en genişi ver.

Kabul kriteri: Lighthouse → "Tap targets are sized appropriately" geçmeli.
```

### WT-26 · 🟡 Alt menü etiketleri kontrast düşürücü filtreyle boyanıyor (WCAG 1.4.3)
```
index.html: `nav button span{filter:grayscale(1);opacity:.55}` ve font-size 10.5px.
Hesapladım: --faint (#666C67) %55 opaklıkta beyaz üzerinde efektif #ABAEAB
→ kontrast 2,24:1. AA için 4,5:1 gerekiyor. Uygulamanın en çok bakılan öğesi
ve açık ara en düşük kontrastlı metni.

Yap:
1. `opacity:.55` ve `filter:grayscale(1)` kaldır.
2. Seçili olmayan durum için doğrudan renk: `color:var(--muted)` (5,97:1 ✔).
   Seçili durum `var(--accent)` (4,57:1 ✔) zaten geçiyor.
3. 7 sekme korunacağı için font 10.5px kalabilir, ama sığmıyorsa etiketleri
   kısalt: "Ana Sayfa"→"Ana", "Aracım"→"Araç".
4. Koyu temada da doğrula.
```

### WT-27 · 🟡 Butonlarda görünür odak göstergesi yok (WCAG 2.4.7)
```
index.html'de sadece `input:focus, select:focus` için outline tanımlı.
Buton, segment, çip, alt menü ve overlay kapatma butonlarında hiçbir odak stili yok.
`*{-webkit-tap-highlight-color:transparent}` dokunma geri bildirimini de kaldırıyor.

Yap:
  :focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:inherit}
  [data-theme="dark"] :focus-visible{outline-color:var(--accent-dark)}
Dokunma için `:active` durumunda hafif transform/opacity geri bildirimi ekle.
```

### WT-28 · 🟡 Segment kontrolleri seçili durumunu bildirmiyor (WCAG 4.1.2)
```
`.seg` grupları (dönem seçici, DC/AC, yakıt tipi, tema, birim) düz `<button>`
listesi; seçili durum yalnızca `class="sel"` ile taşınıyor.

Yap:
- Sarmalayıcıya `role="radiogroup"` + `aria-label`.
- Butonlara `role="radio"` + `aria-checked="true|false"`; sınıfla birlikte güncelle.
- Sol/sağ ok tuşlarıyla gezinme ekle.
```

### WT-29 · 🟡 Toast ve form hatası duyurulmuyor (WCAG 3.3.1, 4.1.3)
```
`#toast` düz div — "Kaydedildi", "Silindi" mesajlarını ekran okuyucu HİÇ duymuyor.
`.form-err` de aynı durumda.

Yap:
1. `<div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true">`
2. `.form-err` → `role="alert"`; hatalı input'a `aria-invalid="true"` ve
   `aria-describedby="form-err"` ata, düzeltilince kaldır.
3. Offline güven için kayıt toast'ı "Cihaza kaydedildi" desin (anahtar: savedLocal).
```

### WT-30 · 🟢 Grafiklerin metin alternatifi yok (WCAG 1.1.1)
```
Donut, bar grafikleri ve drawLineChart çıktısı ekran okuyucuya görünmez.

Yap:
- Her grafik SVG'sine `role="img"` + veriyi özetleyen `aria-label`
  (örn. "Şarj tipi dağılımı: DC %62, AC %38").
- Grafiğin altına görsel gizli özet tablo koy
  (`.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`).
- Bar grafiklerdeki tıklanabilir sütunları (`.mb`) `<button>` yap —
  şu an div'e click listener bağlı, klavyeyle erişilemiyor.
```

### WT-31 · 🟢 11 px metinler ve koyu temada zayıf değer kontrastı
```
1. `.tile .k` (11px), `.tile .yd` (11px), `.crow .sav` (11px), `.about` (11-11.5px)
   mobilde okunabilirlik sınırının altında. Minimum 12px'e çek.
   (WT-32'deki sadeleştirme yer açacak.)

2. Koyu temada değer renkleri AA'yı kaçırıyor (`.tile .v` 16px = normal metin):
     --red   #ef4444 / #1e293b = 3,89:1  ✘
     --blue  #3b82f6 / #1e293b = 3,98:1  ✘
     --accent #16a34a / #1e293b = 4,44:1 ✘
     Beyaz metin / --accent buton = 3,30:1 ✘ ← Kaydet butonu
   Yap: --red #f87171, --blue #60a5fa, --accent #22c55e; Kaydet butonunun
   metnini koyu temada koyu renk yap veya buton rengini açtır.

3. `--border`/`--card` = 1,44:1 ve `--track`/`--card` = 1,22:1 →
   WCAG 1.4.11 (UI sınırı 3:1) başarısız. Input çerçeveleri neredeyse görünmez.
   Yap: --border → #B9BEBA, --track → #CFD8D1 civarı.
```

---

# FAZ 4 — Tasarım ve kullanılabilirlik

### WT-32 · Ana sayfa sadeleştirmesi
```
Ana sayfada mükerrer ve gereksiz blokları temizle. AŞAĞIDAKİLER DIŞINDA
HİÇBİR ŞEY KALDIRMA.

--- KALDIRILACAKLAR ---
1. "100 km · net" ve "100 km · indirimsiz" kutuları → İKİSİNİ DE KALDIR.
   "1 km · net" ve "1 km · indirimsiz" KALSIN.
   (applyI18n içindeki d-100-lbl / d-100-lbl2 satırlarını da temizle;
    cost100 çeviri anahtarı Kıyasla sayfasında kullanılmaya devam ediyor.)

2. "Yıllık karşılaştırma" bölümünün TAMAMI (d-yr-spend, d-yr-kwh, d-yr-price
   ve üç delta) — hepsi üstteki kutularla mükerrer. İlgili yDelta() fonksiyonunu
   ve yearlyCompare / yearlySpendLbl / yearlyKwhLbl / yearlyPriceLbl / vsLastYear
   çeviri anahtarlarını da temizle.
   Özellikle "Enerji (bu yıl)" ile üstteki "Enerji (kWh)" mükerrer —
   üstteki KALSIN.

3. "Son şarjlar" bölümü (d-recent + d-viewall) — Geçmiş sekmesi zaten bunu
   yapıyor. rowHTML() Geçmiş'te kullanılmaya devam ediyor, o fonksiyonu SİLME.

--- KALACAKLAR (dokunma) ---
  Hero (net + indirimsiz + tasarruf rozeti)
  Kilometre sayacı bloğu
  kWh başı net / kWh başı indirimsiz
  1 km net / 1 km indirimsiz
  Enerji (kWh) / Şarj-Firma sayısı
  Alınan indirim / Ücretsiz şarj
  Detay istatistikler (süre, SoC, güç) + DC/AC filtresi

--- "ORT. ŞARJ ARALIĞI" DÜZELTMESİ ---
4. d-soc hesabındaki sorunlar:
   a) `dsAll` dönem filtresi uygulamıyor, tüm zamanları ortalıyor
      (WT-14'te çözülüyor — burada da doğrula).
   b) socB === socA olan kayıtları ortalamadan çıkar (anlamsız veri).
   c) İki uç noktayı ayrı ayrı ortalamanın YANINA "ort. eklenen: +%58"
      değerini de ekle — kullanıcının gerçekte merak ettiği bu.
   d) Sınır dışı SoC değerleri WT-04'te engelleniyor; burada sadece mevcut
      bozuk verinin ortalamaya girmediğinden emin ol.

Bu değişiklik ana sayfayı yaklaşık %35 kısaltır.
```

### WT-33 · Masaüstünde `columns` düzeni okuma sırasını bozuyor
```
index.html @media(min-width:760px): `#page-dashboard{columns:2}` ve 1240px'te
`columns:3`. CSS çok sütun düzeni içeriği yukarıdan aşağı DOLDURDUĞU için
WT-32'de kurduğun önem sırası masaüstünde bozuluyor. Sütun dengesi tarayıcıya
göre değişiyor ve Tab sırası görsel sırayla eşleşmiyor.

Yap: `columns` yerine CSS Grid:
  #page-dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;align-items:start}
Hero ve dönem seçicisine `grid-column:1/-1` ver.
```

### WT-34 · Renk semantiği tutarsız
```
--blue (#007DAA) iki farklı anlamda kullanılıyor:
  - Ana sayfa: "Ücretsiz şarj" sayısı (olumlu/bilgi)
  - Kıyasla: "Yakıtlı araç" değerleri (kıyas karşı tarafı)
--red hem "geçen döneme göre artış" hem "yakıtlı 1 km maliyeti" için kullanılıyor.

Yap: Renk sözlüğünü sabitle ve tüm ekranlarda uygula:
  yeşil (--accent-dark)  → EV / tasarruf / olumlu
  mavi   (--blue)         → yakıtlı araç / karşılaştırma referansı
  kırmızı(--red)          → olumsuz değişim, uyarı, silme
  gri    (--muted)        → nötr bilgi
"Ücretsiz şarj" mavi yerine yeşil olsun. index.html'de yorum satırıyla belgele.
```

### WT-35 · "Yakıt dışı gider kıyaslaması" bloğu aşırı detaylı
```
Kıyasla sayfasının sonundaki blok 7 kutu + 2 bar + 1 pill = 10 sayı gösteriyor,
hepsi kullanıcının TAHMİNEN girdiği tek bir sayıdan türetiliyor. Girdi belirsizken
çıktıyı bu kadar detaylandırmak sahte kesinlik yaratıyor.

Yap: Tek satıra indir: "Yıllık yakıt dışı gider farkı: +X ₺" + iki bar.
Detayı "Detayları göster" ile açılır yap.
```

### WT-36 · Boş durum ekranları + örnek veri
```
İlk açılışta her sayfa yalnızca "Kayıt yok" diyor — ne yapılacağını söylemiyor
ve uygulamayı "bitmemiş" hissettiriyor.

Yap:
1. Her boş duruma ikon + tek cümle açıklama + eylem butonu koy:
   Ana Sayfa → "İlk şarjını ekle, harcaman burada görünsün" [+ Şarj ekle]
   Geçmiş    → "Henüz kayıt yok" [+ Şarj ekle]
   İstatistik→ "En az 3 kayıt sonrası grafikler oluşur"
   Kıyasla   → "Yakıt fiyatı ve tüketim gir, kıyaslayalım"
   Aracım    → "Aracını ekle, maliyet hesapları netleşsin" [+ Araç ekle]

2. Ayarlar'a "Örnek verilerle dene" butonu — 10 sahte kayıt + 1 araç + 3 gider üretsin.

3. ÖRNEK VERİ TEMİZLİĞİ (kritik, atlanmamalı):
   a) Üretilen her kayda `demo: true` işareti koy.
   b) Örnek veri aktifken ekranın en üstünde KALICI bir şerit göster:
      "📋 Örnek verilerle geziniyorsun — [Örnek verileri sil]"
      Bu şerit kapatılamasın, her sayfada görünsün.
   c) "Örnek verileri sil" tek dokunuşla SADECE demo:true kayıtları silsin,
      kullanıcının gerçek verisine dokunmasın.
   d) Kullanıcı ilk gerçek kaydını eklediğinde otomatik sor:
      "Örnek verileri şimdi silelim mi?" (varsayılan: Evet).
   e) Örnek veri üretmeden ÖNCE uyar: "Bu 10 örnek kayıt ekleyecek.
      İstediğin zaman Ayarlar'dan tek dokunuşla silebilirsin."
   f) Yedek dışa aktarmada demo kayıtları HARİÇ TUT — kullanıcı yanlışlıkla
      sahte veriyi yedeklemesin.

Kabul kriteri: Örnek veri ekle → şerit görünmeli → sil → hiç demo kayıt kalmamalı,
gerçek kayıtlar durmalı.
```

### WT-37 · Açılış animasyonunu videoyla değiştir
```
Mevcut CSS/keyframe tabanlı splash (index.html `.splash` + splashLogoIn /
splashWordIn animasyonları) yerine hazırlanmış video animasyonu kullanılacak.

--- VİDEO DOSYASI GEREKSİNİMLERİ ---
Bunları README'ye yaz ki sonraki güncellemelerde bozulmasın:
  - Süre: en fazla 2,0 saniye (ideal 1,2–1,5 sn)
  - Dosya boyutu: MP4 ≤ 1,2 MB (ilk açılış maliyetine doğrudan ekleniyor)
  - Format: `splash.mp4` (H.264, yuv420p, ses kanalı YOK) — ana kaynak
            `splash.webm` (VP9) — opsiyonel, daha küçükse ekle
  - Çözünürlük: 1080×1080 kare (her ekran oranında kırpılmadan sığar)
  - Arka plan: videonun arka planı splash arka planıyla AYNI renk olmalı
    (açık tema #F1F7F2 / koyu tema #0f172a)
  - İlk kare: `splash-poster.png` olarak ayrıca dışa aktar (siyah flaş olmasın)

--- UYGULAMA ---
1. index.html'deki `.splash` içeriğini değiştir:
   <video id="splash-video" class="splash-video"
          src="splash.mp4" poster="splash-poster.png"
          autoplay muted playsinline preload="auto"
          aria-hidden="true"></video>
   `muted` ve `playsinline` ZORUNLU — bunlar olmadan iOS Safari ve
   Android Chrome otomatik oynatmayı engeller.

2. Eski `.splash-logo` / `.splash-word` yapısını ve splashLogoIn/splashWordIn
   keyframe'lerini kaldır, ama statik logo'yu yedek olarak DOM'da tut.

3. app.js hideSplash() mantığını yeniden yaz:
   - Splash'i `video.onended` tetiklesin (SPLASH_MIN_MS sabit beklemesi yerine).
   - Güvenlik ağı: 2500 ms sonra video hâlâ bitmemişse zorla kapat
     (bozuk/eksik video uygulamayı kilitlemesin).
   - Uygulama verisi videodan önce hazır olursa BEKLEME — video bitince kapat;
     video verilerden önce biterse veriyi bekle. İkisinden geç olanı belirlesin.

4. Geri düşüş (fallback) zinciri:
   a) `video.play()` bir Promise döndürür; reject olursa (otomatik oynatma
      engellendi) videoyu gizle, statik logo + 900 ms bekleme göster.
   b) `video.onerror` → aynı statik yol.
   c) `window.matchMedia('(prefers-reduced-motion: reduce)').matches` ise
      videoyu HİÇ oynatma, doğrudan statik logo göster ve 400 ms sonra kapat.

5. Tema uyumu: `[data-theme="dark"] .splash` arka planını videonun arka plan
   rengiyle eşleştir. Tek videoyla iki tema desteklenemiyorsa iki dosya kullan
   (`splash.mp4` / `splash-dark.mp4`) ve applyTheme'den önce localStorage'dan
   tema tercihini oku.

6. sw.js ASSETS listesine `splash.mp4`, `splash-poster.png` (ve varsa webm) ekle.
   Video 1,2 MB'ı aşarsa ASSETS'e KOYMA, normal ağ isteğiyle gelsin ve
   ilk açılışta statik fallback görünsün.

7. Video yalnızca oturumda BİR KEZ oynasın. sessionStorage'a bayrak koy;
   ikinci açılışta splash'i tamamen atla. Mevcut SPLASH_MIN_MS = 2000
   sabitini kaldır.

Kabul kriteri:
- iOS Safari ve Android Chrome'da video otomatik oynamalı.
- Uçak modunda ilk açılışta (SW cache'ten) çalışmalı.
- Video dosyasını sil → uygulama yine açılmalı, statik logo görünmeli.
- prefers-reduced-motion açıkken video oynamamalı.
```

### WT-38 · Araç özet kartını kompaktlaştır
```
SORUN: Araç detay/ekleme ekranındaki araç ikonu çok fazla dikey yer kaplıyor.
Mevcut CSS (index.html):
  .ev-summary svg, .ev-summary img.carphoto {width:100%; height:110px}
  .ev-summary svg {height:84px}
  .ev-summary {padding:16px}
  .spec-grid {grid-template-columns:1fr 1fr}   ← 5 kutu, 3 satır
Toplamda kart ~280px yüksekliğe çıkıyor ve ekranın yarısını yiyor.

ÖNEMLİ: carSVG() içindeki araç silüetlerini ve yol/gövde çizimlerini DEĞİŞTİRME.
Silüetler olduğu gibi kalacak — sadece kartın düzeni ve ölçüsü değişecek.

Yap:
1. `.ev-summary`yi DİKEY yığından YATAY düzene çevir:
   - Sol: araç görseli, küçük ve yuvarlatılmış bir çip içinde
     (svg 88×34 px, fotoğraf 64×48 px, border-radius 10px).
   - Sağ: araç adı (16px, kalın) + donanım/yıl (12,5px, --muted2).
   - `align-items:center; gap:12px`
2. `.spec-grid`i kartın altına tek satır halinde, yatay kaydırılabilir
   küçük çipler olarak yerleştir:
     [84 kWh] [622 km] [250 kW DC] [11 kW AC]
   `display:flex; gap:6px; overflow-x:auto; -webkit-overflow-scrolling:touch`
   Her çip: `font-size:11.5px; padding:5px 9px; border-radius:100px;
   background:var(--bg)` — WT-31'deki 12px kuralına uyacak şekilde 12px yap.
3. `.ev-summary` padding'ini 16px → 12px indir.
4. Toplam kart yüksekliği ~110px'i geçmesin (şu an ~280px).
5. Fotoğraf varsa yine küçük çipte göstersin — 110px'lik tam genişlik
   banner'ı kaldır. Fotoğrafa dokununca tam ekran açılsın.
6. Aynı düzen üç yerde de geçerli olsun: araç ekleme overlay'i (`car-summary`),
   EV arama önizlemesi, onboarding (`ob-ev-summary`).
7. Koyu tema kuralını koru:
   `[data-theme="dark"] .ev-summary svg [fill="#F1F7F2"]{fill:#1e293b}`

Kabul kriteri: Araç ekle ekranını aç → kart tek ekranda, ~110px yükseklikte
görünmeli, araç silüeti eskisiyle aynı çizimde ama küçük olmalı.
```

---

# FAZ 5 — Yeni özellikler

### WT-39 · Ekran görüntüsünden veri girişi (Tesseract OCR)
```
AMAÇ: Kullanıcı şarj firmasının uygulamasındaki "İşlem Detayı" ekranının
görüntüsünü yüklesin, form alanları otomatik dolsun.
Tüm işlem CİHAZDA yapılacak — bulut OCR servisi KULLANMA.

============================================================
BÖLÜM 1 — ÖN KOŞUL: FOTOĞRAF İŞLEME DÜZELTMELERİ
============================================================
app.js resizePhoto() içinde iki hata var, önce bunları düzelt:
1. EXIF yön bilgisi işlenmiyor — iPhone'dan dikey çekilen görüntü yan yatıyor.
   Bu OCR doğruluğunu tamamen bozar.
   Çözüm: `createImageBitmap(file, {imageOrientation: 'from-image'})` kullan;
   desteklenmiyorsa EXIF Orientation etiketini oku ve canvas'ta döndür.
2. `URL.revokeObjectURL()` hiç çağrılmıyor — bellek sızıntısı.
   onload ve onerror içinde revoke et.
3. dataURL yerine Blob sakla (IndexedDB Blob destekliyor, base64'e göre
   ~%33 daha az yer kaplar). Gösterirken URL.createObjectURL, sonra revoke.
4. OCR için AYRI bir kopya tut: ekran görüntüsünü OCR'a vermeden önce
   640px'e küçültme — OCR'da çözünürlük doğruluğu belirler.
   Saklama kopyası 900px genişlik / JPEG 0.8; OCR kopyası aşağıdaki
   ön işlemeden geçen tam çözünürlüklü hali.

============================================================
BÖLÜM 2 — TESSERACT KURULUMU
============================================================
1. tesseract.js'i TEMBEL YÜKLE. Uygulama paketine KOYMA.
   Ayarlar'da anahtar: "Ekran görüntüsünden otomatik oku (beta)".
   Açıldığında indirilecek gerçek boyutu ÖLÇ ve kullanıcıya göster
   ("~X MB indirilecek") — tahmini sayı yazma, gerçek dosya boyutunu ölç.
2. Dil verisi: `tur+eng` ve `tessdata_fast` sürümü (en küçüğü).
   Türkçe şart — "Kullanılan Enerji", "Şarj Süresi", "Ödeme Yöntemi"
   etiketleri Türkçe.
3. İndirilen wasm ve traineddata dosyalarını Cache API'ye yaz ki
   ÇEVRİMDIŞI da çalışsın. `workerPath`, `corePath`, `langPath`
   parametrelerini kendi origin'ine yönlendir.
4. Worker'ı bir kez oluştur, tekrar tekrar kurma. Ayarlardan kapatılınca
   worker'ı terminate et ve cache'i temizleme seçeneği sun.

============================================================
BÖLÜM 3 — ÖN İŞLEME (doğruluğun %70'i burada)
============================================================
OCR'a vermeden önce canvas üzerinde:
1. Genişlik 1000px'in altındaysa 2× büyüt (bicubic).
2. Gri tonlamaya çevir: 0.299R + 0.587G + 0.114B
3. Kontrastı artır: basit lineer germe (histogram min-max)
4. Uyarlamalı eşikleme (adaptive threshold) uygula — sabit eşik kullanma,
   ekran görüntülerinde arka plan gri tonları değişiyor.
   Blok boyutu ~15px, sabit C ~10.
5. Ekran görüntülerinde filigran olabilir (örneklerde "şikayetvar" filigranı
   var) — filigran ince ve açık renk olduğu için eşikleme sonrası zaten
   büyük ölçüde kaybolur, ekstra işlem yapma.
6. Ön işlenmiş görüntüyü kullanıcıya GÖSTERME, sadece OCR'a ver.

Tesseract parametreleri:
  tessedit_pageseg_mode: '6'   (tek tip blok — bu ekranlar için en uygunu)
  preserve_interword_spaces: '1'
  tessedit_char_whitelist BIRAKMA — Türkçe karakterler ve simgeler gerekli.

============================================================
BÖLÜM 4 — ALAN ÇIKARIMI (uzamsal eşleştirme)
============================================================
Tesseract'tan KELİME DÜZEYİNDE sonuç al (`data.words`, her birinde `bbox`).
Sadece düz metin kullanma — bu düzenlerde değer bazen etiketin SAĞINDA,
bazen ALTINDA. Uzamsal eşleştirme doğruluğu belirgin artırır.

Algoritma:
1. Kelimeleri satırlara grupla (y ekseninde %50'den fazla örtüşen kelimeler
   aynı satır).
2. Her hedef alan için etiket sözlüğünde geçen bir ifadeyi ara
   (küçük harfe çevir, Türkçe karakter normalizasyonu yap: ı→i, ş→s ...
   çünkü OCR bazen "Şarj"ı "Sarj" okur).
3. Etiket bulunca değeri şu sırayla ara:
   a) AYNI satırda, etiketin sağında ilk sayısal ifade
   b) BİR ALT satırda, etiketin x aralığıyla örtüşen ilk sayısal ifade
   c) İki alt satıra kadar bak, sonra vazgeç
4. Bulunamayan alanı BOŞ bırak — tahmin üretme.

ETİKET SÖZLÜĞÜ (gerçek ekran görüntülerinden çıkarıldı):
  enerji:   ['Kullanılan Enerji', 'Aktarılan Enerji', 'Tüketilen Enerji',
             'Enerji', 'kWh']
  netTutar: ['Toplam Tutar', 'Toplam Ödeme', 'Kullanım Tutarı', 'Tutar']
  brutTutar:['Şarj Hizmeti Ücreti', 'Hizmet Ücreti']
  indirim:  ['İndirim']
  blokaj:   ['Blokaj Ücreti']
  socBas:   ['Başlangıç']
  socBit:   ['Bitiş', 'Batarya Doluluğu']
  sure:     ['Şarj Süresi', 'Süre']
  tarih:    ['Başlangıç Zamanı', 'Başlangıç Tarihi', 'Tarih']
  istasyon: ['Şarj Noktası', 'Şarj Noktası:']
  istId:    ['İstasyon ID', 'İstasyon Kodu']
  soket:    ['Soket']
  odemeYnt: ['Ödeme Yöntemi']
  plaka:    ['Araç Plaka', 'Plaka']

============================================================
BÖLÜM 5 — SAYI AYRIŞTIRMA (en kritik kısım)
============================================================
Ondalık ayracı firmadan firmaya değişiyor ve YANLIŞ OKUMA VERİYİ BOZAR.
Gerçek örnekler:
  "45.820 kWh"   → 45,82   (NOKTA ondalık, 3 basamak)
  "49.023 kWh"   → 49,02   (NOKTA ondalık, 3 basamak)
  "4,52 kWh"     → 4,52    (VİRGÜL ondalık)
  "22.57 kWh"    → 22,57   (NOKTA ondalık, 2 basamak)
  "503.56 TRY"   → 503,56
  "58,65 ₺"      → 58,65
  "685.83 TRY"   → 685,83

DİKKAT: Türkçe kuralına göre "45.820" KIRK BEŞ BİN SEKİZ YÜZ YİRMİ okunur.
Bu, sessizce 1000× hatalı veri üretir.

KURAL (WT-02'deki kullanıcı girişi kuralından FARKLI, ayrı fonksiyon yaz):
function ocrSayi(metin, alan) {
  const s = metin.replace(/[^\d.,]/g, '');
  const nokta = s.lastIndexOf('.'), virgul = s.lastIndexOf(',');
  let deger;
  if (nokta > -1 && virgul > -1) {
    // İkisi de var → sonuncusu ondalık
    const ond = Math.max(nokta, virgul);
    deger = parseFloat(s.slice(0, ond).replace(/[.,]/g, '') + '.' + s.slice(ond + 1));
  } else if (nokta > -1 || virgul > -1) {
    const poz = Math.max(nokta, virgul);
    const basamak = s.length - poz - 1;
    const ondalikYorum = parseFloat(s.slice(0, poz) + '.' + s.slice(poz + 1));
    const binlikYorum  = parseFloat(s.replace(/[.,]/g, ''));
    if (basamak === 3) {
      // BELİRSİZ: alan üst sınırıyla karar ver
      const max = KURALLAR[alan]?.max ?? Infinity;
      deger = (binlikYorum > max) ? ondalikYorum : binlikYorum;
      // kWh alanında 3 basamaklı ondalık YAYGIN (Astor/Trugo) →
      // eşitlik durumunda ondalığı tercih et
      if (alan === 'kwh') deger = ondalikYorum;
    } else {
      deger = ondalikYorum;   // 1-2 basamak → her zaman ondalık
    }
  } else {
    deger = parseFloat(s);
  }
  return isNaN(deger) ? null : Math.round(deger * 100) / 100;
}

TARİH AYRIŞTIRMA — üç format da desteklensin:
  "30 01 2025 21:05:36"      → GG AA YYYY SS:DD:ss  (boşlukla ayrılmış)
  "15/05/2024 23:35:32"      → GG/AA/YYYY
  "13 Şub 2026 13:54"        → GG AyKısaltması YYYY  (tr ay adları tablosu gerekli:
                                Oca Şub Mar Nis May Haz Tem Ağu Eyl Eki Kas Ara)
Yıl 2000-2100 dışındaysa reddet.

SÜRE AYRIŞTIRMA:
  "1 saat 13 dakika 33 saniye" → 73 dk (saniyeyi yuvarla)
  "48 dakika 39 saniye"        → 49 dk
  "6 dk."                      → 6 dk
  "17 dk."                     → 17 dk
Regex: /(\d+)\s*saat/, /(\d+)\s*(dakika|dk)/, /(\d+)\s*saniye/

SoC:
  "%2  %90"     → aynı satırda iki yüzde → ilki başlangıç, ikincisi bitiş
  "% 12,00"     → 12
  "Batarya Doluluğu % 80" → SADECE bitiş (başlangıç boş kalsın)

============================================================
BÖLÜM 6 — DÜZEN ŞABLONLARI
============================================================
Üç farklı düzen tespit edildi. Şablonu anahtar kelimeyle otomatik seç,
bulunamazsa genel algoritmaya düş.

DÜZEN A — "Kullanılan Enerji" + "Toplam Ödeme" geçiyorsa
  (Astor Şarj ve Trugo aynı beyaz etiket altyapıyı kullanıyor, tek şablon
   ikisini de çözer)
  Başlık satırı = istasyon adı ("Highway Outlet DC-1",
                                "Selçuklu Novaland Outlet AVM DC")
  "Başlangıç Zamanı"  → 30 01 2025 21:05:36
  "Şarj Süresi"       → 1 saat 13 dakika 33 saniye
  "Kullanılan Enerji" → 45.820 kWh        (değer ETİKETİN ALTINDA)
  "Başlangıç  Bitiş"  → %2   %90          (tek satırda iki değer)
  "Ödeme Yöntemi:"    → serbest metin
  "Kullanım Tutarı:"  → 503.56 TRY
  "Toplam Ödeme:"     → 503.56 TRY        ← NET tutar bu

DÜZEN B — "Aktarılan Enerji" veya "Blokaj Ücreti" geçiyorsa (ZES)
  Konum, "13 Şub 2026 13:54 • 13 Şub 2026 14:00", "6 dk."
  "Başlangıç • % 12,00" / "Bitiş • % 18,00"      (değer ETİKETİN SAĞINDA)
  "Aktarılan Enerji • 4,52 kWh"
  "KIA e-Niro - 34KZU097"                        (araç modeli + plaka)
  "Blokaj Ücreti      0,00 ₺"
  "Şarj Hizmeti Ücreti 58,65 ₺"   ← BRÜT
  "İndirim             0,00 ₺"    ← İNDİRİM
  "Toplam Tutar       58,65 ₺"    ← NET
  ÖNEMLİ: Bu üçlü uygulamanın brüt/indirim/net modeliyle BİREBİR örtüşüyor.
  brut, indirim ve net alanlarının üçünü de doldur; indirim > 0 ise
  formdaki indirim tipini "tutar" olarak ayarla.
  Blokaj ücretini nete EKLEME ama not alanına yaz.

DÜZEN C — "Tüketilen Enerji" veya "İstasyon ID" geçiyorsa (Eşarj)
  "Şarj Noktası: Otomol (2), İstanbul"       → istasyon + lokasyon
  "Tüketilen Enerji: 22.57 kWh"
  "Batarya Doluluğu: % 80"     ← SADECE BİTİŞ SoC, başlangıç YOK
  "Toplam Tutar: 203.13 TL"
  "Araç Modeli / Araç Plaka"
  "İstasyon ID: TR-IST-190"
  "Soket: #2, DC (CCS), 120 kW"  → soket tipi CCS, güç 120 kW, tip DC
  "Başlangıç Tarihi 15/05/2024 23:35:32"
  "Şarj Süresi: 17 dk."

Şablon tespiti başarısızsa kullanıcıya sor: "Hangi uygulamadan aldın?"
(Astor/Trugo · ZES · Eşarj · Diğer) — seçim öğrenilsin, sonraki sefer
aynı şablonla başlansın (settings'te `sonOcrSablon`).

============================================================
BÖLÜM 7 — DOĞRULAMA ARAYÜZÜ (asla sessizce kaydetme)
============================================================
1. OCR bitince formu doldur ama KAYDETME.
2. Otomatik doldurulan HER alanı sarı arka planla işaretle
   (`.ocr-filled{background:#FFF8DC}`; koyu temada `#3d3517`).
3. Formun üstünde uyarı şeridi: "Otomatik okundu — lütfen kontrol et"
   + "Tümünü temizle" butonu.
4. Kullanıcı bir alana dokununca o alanın sarı işareti kalksın.
5. Ekran görüntüsünü formun üstünde küçük olarak sabit tut; dokununca
   tam ekran açılsın, yakınlaştırılabilsin — kullanıcı karşılaştırabilsin.
6. Güven skoru: Tesseract kelime bazında `confidence` veriyor.
   Bir alanın kaynak kelimelerinin ortalama güveni %60'ın altındaysa
   alanı doldur ama KIRMIZI işaretle: "Düşük güven — kontrol et".
7. Kaydedince ekran görüntüsü kayda eklensin (`ekranGor` Blob alanı),
   Geçmiş'te ataç ikonuyla açılabilsin.

============================================================
BÖLÜM 8 — YENİ ŞEMA ALANLARI
============================================================
sessions tablosuna ekle (hepsi opsiyonel, formda "Gelişmiş" altında):
  soket      → 'CCS' | 'Type2' | 'CHAdeMO' | 'Tesla'
  istGuc     → istasyonun anma gücü, kW (Eşarj veriyor: 120)
  istasyonId → operatör istasyon kimliği (Eşarj: TR-IST-190)
  ekranGor   → Blob (ekran görüntüsü)
  ocrSablon  → hangi şablonla okunduğu (hata ayıklama ve öğrenme için)

============================================================
BÖLÜM 9 — TEST
============================================================
Dört gerçek ekran görüntüsünü `test/fixtures/` altına koy ve beklenen
çıktıyı JSON olarak yaz. Bir test betiği bu dördünü OCR'dan geçirip
karşılaştırsın:

  astor.jpg  → {enerji: 45.82, net: 503.56, socBas: 2,  socBit: 90,
                sure: 74, tarih: '2025-01-30', istasyon: 'Highway Outlet DC-1'}
  trugo.jpg  → {enerji: 49.02, net: 685.83, socBas: 16, socBit: 93,
                sure: 49, tarih: '2026-07-04'}
  zes.jpg    → {enerji: 4.52,  brut: 58.65, indirim: 0, net: 58.65,
                socBas: 12, socBit: 18, sure: 6, tarih: '2026-02-13'}
  esarj.jpg  → {enerji: 22.57, net: 203.13, socBit: 80, sure: 17,
                tarih: '2024-05-15', soket: 'CCS', istGuc: 120,
                istasyonId: 'TR-IST-190'}

Kabul kriteri: Dört görüntünün her birinde enerji, net tutar ve tarih
DOĞRU okunmalı. "45.820 kWh" değeri 45820 değil 45,82 olarak yorumlanmalı.
En az bir alan okunamazsa test başarısız sayılmasın ama uyarı versin.
```

### WT-40 · EV_DB güncelliği, menzil gösterimi ve manuel düzeltme
```
ÜÇ AYRI İŞ:

--- A) Araç seçim ekranında mimari yerine menzil göster ---
app.js bindEVSearch() sonuç satırı şu an şunu yazıyor:
  `${v.trim} · ${yr} · ${v.batt} kWh · ${v.arch}V`
400V/800V mimarisi son kullanıcı için anlamsız.
Yap: `${v.trim} · ${yr} · ${v.batt} kWh · ${v.range} km menzil`
     (mi kullanıcısında distDisp ile çevir).

evSummaryHTML() içindeki spec çiplerinde de "Mimari (400 V)" kutusunu kaldır,
"WLTP menzil"i öne al. WT-38'deki yeni çip düzeninde sıra:
  [84 kWh] [622 km] [250 kW DC] [11 kW AC]
`arch` alanı veride kalsın (ileride lazım olabilir), sadece gösterme.
`t('arch')` çeviri anahtarını silme, kullanılmadığını yorumla belirt.

--- B) Menzil değerinin ne olduğunu açıkça yaz ---
Gerçek menzil WLTP'nin altında kalır; beklenti doğru yönetilmeli.
Yap: Etiketi "WLTP menzil (üretici beyanı)" yap ve altına küçük not:
"Gerçek menzil hava, hız ve sürüş tarzına göre değişir."
Bu değeri UYGULAMA İÇİNDE HİÇBİR HESAPLAMADA KULLANMA — sadece araç
seçerken doğru sürümü ayırt etmeye yarasın.

--- C) EV_DB verisini güncelle ve düzeltilebilir yap ---
Bildirilen sorun: "Tesla Model Y Premium RWD (2025) 84 kWh yazıyor,
doğruluğundan emin değilim; aynı modelin Long Range sürümü de var."

Yap:
1. evdata.js'teki EV_DB kayıtlarını güncel üretici/EV veri tabanı
   kaynaklarıyla KARŞILAŞTIR ve düzelt. Özellikle son iki yılda yenilenen
   seriler (Tesla Model Y/3, Togg, BYD, Hyundai, Kia) donanım isimleri
   değiştiği için riskli.
   ÖNEMLİ: Değerleri hafızadan yazma — her marka için kaynak doğrula ve
   commit mesajına kaynağı yaz.
2. EV_DB'ye kayıt başına `guncelleme` (YYYY-MM) alanı ekle; dosyanın başına
   toplu `EV_DB_TARIH` sabiti koy. Araç kartında küçük puntoyla göster:
   "Veri: 2026-07".
3. KULLANICI DÜZELTMESİ (asıl çözüm — veri hiçbir zaman %100 doğru olmayacak):
   Araç kartındaki her teknik değeri (batarya, DC maks, AC maks, menzil)
   düzenlenebilir yap. Kullanıcı kendi aracının gerçek değerini girsin,
   `vehicles` kaydında saklansın ve EV_DB'yi EZSİN.
   Bu, WT-42'deki (şarj kaybı) hesabın güvenilirliği için ŞART —
   yanlış batarya kapasitesi o metriği anlamsızlaştırır.
4. Araç kartına "Bu bilgi yanlış mı?" bağlantısı ekle → GitHub issue şablonuna
   yönlendirsin (marka/model/donanım/yıl önceden doldurulmuş).
5. Aynı model-yılda birden fazla batarya sürümü olduğunda arama sonucunda
   HEPSİNİ göster ve donanım adını kalın yaz — kullanıcı yanlış sürümü seçmesin.

Kabul kriteri: Araç ara → sonuçta "84 kWh · 622 km menzil" görünmeli.
Batarya değerini 75 olarak düzelt → kaydedilmeli ve WT-42 hesabı yeni değeri kullanmalı.
```

### WT-41 · Verimlilik metriği: kWh/100km
```
Yap:
1. Ana sayfaya "Ortalama tüketim" kutusu: toplam kWh / toplam km × 100.
2. WLTP İLE KARŞILAŞTIRMA YAPMA (araçlar o değere ulaşmıyor, yanıltıcı olur).
   Kullanıcının KENDİ geçmişiyle karşılaştır:
   "16,4 kWh/100km · geçen aya göre %8 fazla".
3. İstatistik sayfasına aylık tüketim trendi grafiği ekle — kışın artışı görmek
   EV sahipleri için çok değerli.
4. Kayıt satırında (rowHTML) o şarjın kWh/100km değerini göster.
5. Ev-İş şarjlarını tüketim hesabına dahil et ama DC/AC ayrımını koru
   (kullanıcı "sadece DC" tüketimini görmek isteyebilir).
6. WT-20'de `atlanan: true` işaretli kayıtları bu hesaba DAHİL ETME.

Ön koşul: WT-19 ve WT-20 uygulanmadan bu metrik güvenilir olmaz.
```

### WT-42 · Şarj verimi / kayıp analizi
```
SoC aralığı ve batarya kapasitesi zaten kaydediliyor.
Beklenen kWh = batarya × (socA - socB) / 100
Faturalanan kWh - beklenen kWh = şarj kaybı + istasyon sapması

Yap:
1. Kayıt kaydedildiğinde bu farkı hesapla ve sakla (`kayipPct`).
2. Kayıt detayında göster: "Batarya +48 kWh, faturalanan 52,3 kWh → %8,2 kayıp"
3. İstatistiklere "Firma bazında ortalama kayıp" listesi ekle — hangi
   operatörün ölçümü sapıyor, kullanıcı bunu hiçbir yerde göremiyor.
4. %20'yi aşan sapmada kayıt satırında uyarı ikonu göster.
5. Batarya kapasitesi kullanıcı tarafından düzeltilebilir olmalı (WT-40) —
   yanlış kapasite bu metriği anlamsızlaştırır.
6. Yalnızca socB ve socA'nın İKİSİ de dolu olan kayıtlarda hesapla.

Ön koşul: WT-04 (SoC sınırları) ve WT-40/C (batarya düzeltme).
```

### WT-43 · Yakıt fiyatı geçmişi
```
SORUN: Kıyasla sayfası TEK bir güncel yakıt fiyatı alıyor (S.cmp.price) ve
TÜM geçmişe uyguluyor. 2024'te yapılan bir şarj, 2026 yakıt fiyatıyla
kıyaslanıyor. Enflasyonun yüksek olduğu bir ülkede bu kümülatif grafiği
ve "toplam kazanç" rakamını tamamen yanlış yapıyor.

ÖNCELİK: Türkiye'de ZAMAN farkı BÖLGE farkından kat kat büyük. Ankara ile
İstanbul arasında ~%1-2 fark varken, 2024 ile 2026 arasında misliyle fark var.
Önce zaman boyutunu çöz, bölgeyi sona bırak.

--- AŞAMA 1: Fiyat geçmişi (asıl iş) ---
1. Yeni tablo: fuelPrices → {++id, tarih, tur, fiyat, ulke, bolge}
   tur: 'petrol' | 'diesel' | 'lpg' | 'hybrid'
2. Kıyasla sayfasındaki fiyat alanının davranışını değiştir:
   Kullanıcı fiyatı güncellediğinde ESKİSİNİ EZME — bugünün tarihiyle
   yeni bir satır EKLE. Alanın altına "Fiyat geçmişi (3 kayıt) ›" bağlantısı koy.
3. Fiyat geçmişi ekranı: liste + ekle/düzenle/sil. Kullanıcı geçmiş tarihli
   fiyat da girebilsin ("Ocak 2025'te dizel 43,20 idi").
4. Hesaplama: her şarj kaydı için o kaydın TARİHİNDE geçerli fiyatı kullan:
   const fiyatBul = (tarih, tur) =>
     fuelPrices.filter(f => f.tur === tur && f.tarih <= tarih)
               .sort((a,b) => b.tarih.localeCompare(a.tarih))[0]
     ?? enEskiFiyat;   // kayıttan önce fiyat yoksa en eskisini kullan
5. Kümülatif grafikte (c-line) her noktada o dönemin fiyatını kullan.
   Bu, WT-17'deki grafiği gerçekten anlamlı hale getirir.
6. Kıyasla sonuçlarının altına not: "Hesap, her kaydın tarihindeki yakıt
   fiyatı kullanılarak yapıldı (N fiyat kaydı)." Tek fiyat varsa uyar:
   "Tüm geçmiş için tek fiyat kullanıldı — daha doğru sonuç için geçmiş
   fiyatları gir."

--- AŞAMA 2: Hazır fiyat verisi ---
7. `fuelprices.js` adında statik dosya: ülke bazında AYLIK ortalama yakıt
   fiyatları. Başlangıç kapsamı TR (son 36 ay). Dosyanın başına
   `FUEL_DATA_TARIH` koy ve her uygulama sürümünde güncelle.
8. Kıyasla sayfasında "Hazır fiyatları kullan" butonu — fuelPrices tablosunu
   bu veriyle doldursun. Kullanıcının kendi girdiği değer hazır veriyi EZSİN.
9. Dış API KULLANMA — çevrimdışı çalışma vaadi bozulmasın; ayrıca ücretsiz,
   güvenilir ve uzun geçmişli bir yakıt fiyatı API'si pratikte yok.

--- AŞAMA 3: Bölge (yalnızca gerektiği yerde) ---
10. Bölge ayrımı SADECE fiyat farkının anlamlı olduğu ülkelerde açılsın.
    evdata.js'e bayrak koy: `BOLGESEL_YAKIT = ['US','CA']`.
    - TR, DE, FR gibi ülkelerde bölge sorma — fark ihmal edilebilir,
      gereksiz karmaşıklık yaratır.
    - US ve CA'da eyalet/il vergileri fiyatı %30'a varan oranda değiştirir.
      Ayarlar'a eyalet/il seçici ekle ve fuelprices.js'te bu iki ülke için
      bölgesel ortalama tut (en azından: West Coast, Midwest, Gulf Coast,
      East Coast, Rocky Mountain).
11. Bölge seçilmemişse ülke ortalamasını kullan, sessizce çalışsın.

--- BİRİM UYUMU ---
12. Kullanıcının birimi 'mi' ise yakıt da galon/MPG olmalı:
    - "Yakıt fiyatı (lt)" → "Fuel price (gal)"
    - "Tüketim (lt/100km)" → "Consumption (MPG)"
    - Dahili hesabı metrik tut, yalnız gösterimi çevir
      (1 gal = 3,78541 lt; MPG → lt/100km = 235,215 / MPG).
    applyI18n()'de `c-price-lbl` ve `c-cons-lbl` için ayrı anahtarlar gerekir
    (fuelPriceGal, fuelConsMpg — 6 dilde).

Kabul kriteri:
- 2024 ve 2026 tarihli iki kayıt gir, iki farklı yakıt fiyatı tanımla →
  her kayıt kendi dönemindeki fiyatla kıyaslanmalı.
- Birimi mi yap → "Consumption (MPG)" görünmeli ve 30 MPG girince
  dahili olarak 7,84 lt/100km kullanılmalı.
```

### WT-44 · Bakım hatırlatmaları
```
Gider modülünde 9 kategori var ama hiçbiri ileriye dönük çalışmıyor.

Yap:
1. Gider kaydına opsiyonel alanlar ekle:
   - `sonrakiTarih` — tarih seçici, kullanıcı İSTEDİĞİ İLERİ TARİHİ seçebilsin
   - `sonrakiKm` — sayaç değeri
   - `hatirlatmaAraligi` — kullanıcı tarih yerine ARALIK da seçebilsin:
     3 ay / 6 ay / 1 yıl / 2 yıl / özel (gün sayısı)
     ve/veya 5.000 km / 10.000 km / 15.000 km / 20.000 km / özel
   İkisi birden girilirse HANGİSİ ÖNCE GELİRSE o tetiklensin
   ("10.000 km veya 1 yıl — hangisi önce").

2. "Tekrarlayan gider" onay kutusu: yıllık kalemler (MTV, sigorta, muayene)
   için tetiklendiğinde otomatik yeni kayıt taslağı oluştursun (onaylı).

3. Aracım sayfasının en üstünde "Yaklaşanlar" kartı, en yakın 3 kalem:
   "Muayene 23 gün sonra · Sigorta 2 ay sonra · Lastik rotasyonu 800 km sonra"
   Geçmiş olanları kırmızı göster: "Muayene 12 gün gecikti".
   Km bazlı hatırlatmalar için aracın güncel sayacını (WT-19) kullan.

4. Gider türüne göre makul varsayılanlar öner (sadece ÖNERİ, değiştirilebilsin):
   MTV → 1 yıl · Sigorta → 1 yıl · Muayene → 2 yıl · Lastik rotasyonu → 10.000 km
   · Balata → 30.000 km · Servis → 1 yıl veya 15.000 km

5. Notification API ile bildirim (izin isteyerek, opsiyonel).
   PWA bildirimi iOS'ta sınırlı; Android/TWA'da çalışır.
   İzin verilmemişse uygulama açılışında kart yine görünsün.

Kabul kriteri: 15.03.2027 tarihli muayene hatırlatması gir → Aracım sayfasında
"Yaklaşanlar" kartında geri sayımla görünmeli.
```

### WT-45 · Bütçe takibi
```
KURULUM.md'deki veri modelinde `settings: budget` yazıyor ama uygulamada yok.

Yap:
1. Ayarlar'a aylık ve yıllık bütçe alanı ekle (opsiyonel, boş bırakılabilir).
2. Ana sayfada hero'nun altına ilerleme çubuğu:
   "Bu ay: 1.240 ₺ / 2.000 ₺ (%62)"
3. Bütçe aşılınca çubuk kırmızıya dönsün VE metin de değişsin
   ("Bütçe aşıldı: +240 ₺") — sadece renkle anlam aktarma (WCAG 1.4.1).
4. Geçmişe dönük karşılaştırma: "Bu ay geçen ayın aynı gününe göre %14 fazla"
   (bu zaten d-delta olarak var, bütçe çubuğuyla ilişkilendir).

GELECEĞE DÖNÜK TAHMİN YAPMA:
- "Bu gidişle ay sonu ~X ₺ olur" gibi projeksiyon EKLEME.
- "Yıl sonu tahmini" EKLEME.
Yalnızca gerçekleşen harcama ve geçmişle kıyas gösterilecek.
```

### WT-46 · Geçmiş sayfası: arama, filtre özeti ve araç rozeti
```
6 filtre dropdown'ı var ama:
 (a) Filtrelenmiş sonucun TOPLAMI gösterilmiyor — asıl istenen bu
 (b) Metin araması yok
 (c) Çok araçlı kullanıcıda satırda hangi araç olduğu belli değil
 (d) Silme sonrası geri alma yok
 (e) Satıra tıklayınca düzenleme açıldığı belli değil

Yap:
1. Filtrelerin üstüne arama kutusu (firma, lokasyon, not, banka içinde ara).
2. Filtre çubuğunun altına özet şeridi:
   "47 kayıt · 12.480 ₺ · 892 kWh · ort. 13,98 ₺/kWh"
3. Çok araç varsa rowHTML'e araç rozeti ekle.
4. Silme sonrası toast'a "Geri al" butonu (5 sn).
5. Satırın sağına düzenleme çevron'u (›).
6. 6 dropdown yerine tek "Filtrele" butonu + açılır panel.
7. Ekran görüntüsü olan kayıtlara ataç ikonu (WT-39).
```

### WT-47 · Otomatik doldurma ve akıllı varsayılanlar
```
Şu an form açılınca yalnız firma kullanım sıklığına göre sıralanıyor.

Yap: openAdd() yeni kayıt modunda son kaydı okusun ve şunları önceden doldursun:
  - şarj tipi (tip)
  - banka
  - lokasyon (aynı gün içindeyse)
  - araç (zaten varsayılan var ✔)
  - Ev-İş seçiliyse kWh birim fiyatı (WT-16'dan)
Kullanıcı isterse üzerine yazar.
```

### WT-48 · CSV içe aktarma
```
Dışa aktarma var (CSV + JSON), içe aktarma yalnız JSON.
Kullanıcı verisini Excel/Power BI'da düzenleyip geri yükleyemiyor.

Yap:
1. Ayarlar'daki içe aktarma butonunu .json ve .csv kabul edecek şekilde genişlet.
2. CSV ayrıştırıcı — dışa aktarma formatıyla (UTF-8 BOM, `;` ayraç,
   virgüllü ondalık) simetrik olsun. Sayı ayrıştırmada WT-02'deki pf() kullan.
3. İçe aktarmadan önce önizleme: "N satır okundu, M mükerrer, K hatalı"
   + hatalı satırların listesi.
4. Sütun eşleme ekranı (başlıklar farklıysa kullanıcı eşlesin) —
   başka uygulamalardan göç mümkün olsun.
```

---

# FAZ 6 — Mimari ve altyapı

### WT-49 · Performans: her render'da tam tablo taraması
```
Sorunlar:
1. Dexie indeksleri (`tarih`, `firma`, `tip`, `aracId`) tanımlı ama HİÇ kullanılmıyor —
   her yerde `toArray()` + JS `filter`.
2. `openAdd()` tek açılışta `db.sessions.toArray()`i ÜÇ KEZ çağırıyor.
3. Tema değiştirince tüm sayfa yeniden render ediliyor.
4. Her sekme geçişinde tüm tablolar baştan okunuyor.

Yap:
1. Açılışta sessions/vehicles/expenses'i bir kez belleğe al, yazma işlemlerinde
   güncelle (basit in-memory cache).
2. Tarih aralığı sorgularında `db.sessions.where('tarih').between(...)` kullan.
3. openAdd() içindeki üç okumayı tek okumaya indir.
4. Ağır türetilmiş değerleri (aylık toplamlar, firma dağılımı) memoize et.
5. WT-39'daki ekran görüntüleri (Blob) belleğe ALINMASIN — sadece kaydın
   `ekranGor` alanının dolu olup olmadığı tutulsun, görsel istendiğinde okunsun.

Amaç sekme geçişlerindeki takılmayı bitirmek.
```

### WT-50 · Dosya yapısını böl
```
app.js 2375 satır ve içinde 320 satırlık çeviri sözlüğü var. i18n-dictionary.js
app.js'ten KOPYA, yüklenmiyor ve senkron kalmayacağı kesin.

Yap:
1. `i18n.js` — T sözlüğü, MONTHS, DAYS, LANG_NAMES, t(), applyI18n()
2. `db.js` — Dexie şeması, migration'lar, safeWrite()
3. `calc.js` — savingsOf, netFromGross, convOf, amtB, savB, periodFilter,
   pf, fmtNum, tureMesafe, fiyatBul (para ve sayı hesaplayan saf fonksiyonlar)
4. `ui/dashboard.js`, `ui/stats.js`, `ui/history.js`, `ui/compare.js`,
   `ui/vehicle.js`, `ui/settings.js`, `ui/forms.js`
5. `ocr.js` — WT-39'daki ayrıştırıcı (tembel yüklenecek)
6. `app.js` — sadece init ve yönlendirme
7. Kök dizindeki `i18n-dictionary.js` KOPYASINI SİL.
8. index.html script etiketlerini ve sw.js ASSETS listesini güncelle.
Modül sistemi kullanma (TWA/dosya protokolü sorun çıkarabilir).
```

### WT-51 · Kritik fonksiyonlar için birim testi
```
Testi olmayan kritik fonksiyonlar: pf, fmtNum (WT-02), savingsOf, netFromGross,
convOf, amtB, savB, periodFilter, prevPeriodFilter, odoDistOf, expB,
tureMesafe (WT-19), fiyatBul (WT-43), ocrSayi (WT-39).

Yap:
1. Test altyapısı kur (vitest veya node:test — build gerektirmeyen).
2. Sınır durumları:
   - pf: "43,57" / "43.57" / "1.234,56" / "1,234.56" / "43,579" / " 503,56 ₺"
   - ocrSayi: "45.820" (kwh alanı → 45,82) / "45.820" (tutar alanı) / "4,52"
   - %100 indirim, negatif tutar, free=true, kur tablosu yok
   - ay/yıl sınırları, artık yıl, saat dilimi (WT-01 regresyonu)
   - odometre geriye gitmiş, sırasız kayıt girişi (WT-19)
3. CI: GitHub Actions ile push'ta testleri koştur.
```

### WT-52 · Sürüm numarasını tek kaynağa indir
```
Şu an üç ayrı yerde: app.js APP_VERSION='v19', sw.js CACHE='watttrack-v19',
export version: 8.

Yap: `version.js` oluştur, üçü de oradan okusun.
sw.js importScripts('./version.js') ile alsın.
Export şema sürümünü uygulama sürümünden ayrı tut (`schemaVersion`).
```

### WT-53 · manifest.json'u sadeleştir
```
Kullanılmayan alanlarla şişkin: `protocol_handlers`, `note_taking`,
`scope_extensions` (boş dizi), `edge_side_panel`, `display_override`da 4 değer.

Yap: Gerçek kullanım senaryosu olmayanları kaldır.
Kalsın: id, name, short_name, description, start_url, scope, display,
orientation, background_color, theme_color, lang, dir, categories, icons,
screenshots, shortcuts, file_handlers, share_target, related_applications.

Not: `share_target` KALSIN ve WT-39 ile bağlansın — kullanıcı şarj
uygulamasından ekran görüntüsünü doğrudan WattTrack'e paylaşabilsin.
```

### WT-54 · OpenChargeMap çağrısını doğrula
```
app.js nearbyStations() → API ANAHTARI YOK. OCM v3 anonim erişimi kısıtlıyor;
bu istek büyük olasılıkla 403 dönüyor ve kod sessizce boş dizi veriyor —
yani "yakındaki istasyon önerisi" özelliği hiç çalışmıyor olabilir.

Yap:
1. Gerçek cihazda ağ sekmesinden yanıt kodunu doğrula.
2. 403 dönüyorsa: openchargemap.org/site/develop üzerinden ücretsiz anahtar al,
   `&key=...` ekle. Anahtar istemcide görünür olacağı için kısıtlı kotalı olsun.
3. Hata durumunda sessiz kalma — "İstasyon listesi alınamadı" toast'ı göster.
4. Nominatim için aynı koordinata 5 dk cache uygula (kullanım politikası).
```
