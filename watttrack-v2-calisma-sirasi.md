# WattTrack — ikinci tur çalışma sırası (WT-55 →)

Kaynak: kullanıcının 08.08.2026 tarihli 10 başlıklı geri bildirim listesi
(Açılış, Giriş, Anasayfa, İstatistik, Geçmiş, Veri Girişi, Kıyasla, Aracım,
Ayarlar, Kod, Arayüz).

İlk tur (54 madde, WT-01…WT-54) 01.08.2026'da bitti, sürüm v31.
Bu dosya o turun devamıdır ve **aynı çalışma kurallarını miras alır.**

---

## 0. Çalışma kuralları (ilk turdan devralındı, değişmedi)

1. **Madde başına ayrı commit:** `WT-XX: kısa açıklama`.
2. Her maddeye başlamadan önce **tespitin hâlâ geçerli olduğunu doğrula** —
   bu listedeki bazı maddeler zaten düzeltilmiş olabilir.
3. Yeni çeviri anahtarında **altı dili de doldur** (tr/en/de/fr/es/it).
4. Şema değişikliğinde **Dexie sürümünü artır + `upgrade` yaz.**
5. Sürüm numarası **faz başına** bump edilir, madde başına değil.
6. Yeni dosya eklenirse `index.html`, `sw.js` (ASSETS + NETWORK_FIRST) ve
   `test/boot.mjs` içindeki `APP_FILES` **birlikte** güncellenir.
7. **Modül yok** — 12 klasik script, yükleme sırası `index.html`'de.
8. Uydurma veri yazma. Kaynağı doğrulanmamış teknik değer, eksik veriden kötüdür.

---

## 1. Sınıflandırma

Listedeki **41** maddenin hepsi kod işi değil. Üçe ayrıldı:

| Tür | Adet | Ne yapılacak |
|---|---|---|
| **A — Soru** | 8 | Aşağıda cevaplandı; ikisi (Kıyasla 2, Kod 2) ayrıca iş kalemi doğurdu (WT-77, WT-82) |
| **B — Karar bekleyen** | 0 | Ayarlar 1 08.08.2026'da karara bağlandı → **WT-78** |
| **C — İş kalemi** | 34 | **WT-55…WT-83** — aynı bloğa dokunanlar birleştirildi; WT-83 sonradan (WT-81/8'in kuyruğu olarak) açıldı |

Bölüm bölüm kapsama (hiçbir madde düşmesin diye):
Açılış 1/1 · Giriş 3/3 · Anasayfa 5/5 · İstatistik 7/7 · Geçmiş 1/1 ·
Veri Girişi 4/4 · Kıyasla 6/6 · Aracım 7/7 · Ayarlar 2/2 · Kod 2/2 · Arayüz 3/3

---

## 2. Tür A — Sorular (kod işi yok, cevap aşağıda)

### Anasayfa 2 — "Ortalama şarj gücü" nedir?
`ui/dashboard.js:197-200`. **Aldığın şarj gücü değil, ölçülen ortalama hız.**
Formül: süresi girilmiş kayıtların `toplam kWh ÷ toplam saat`. Yani istasyonun
etiketindeki 180 kW değil, senin kayıtlarından çıkan gerçekleşen ortalama.
**Yalnız `dur > 0` olan kayıtlar sayılır** — şarj süresini girmediğin kayıtlar
hesaba hiç girmez, o yüzden "—" görüyorsan süre alanı boş demektir.
Ana sayfadaki DC/AC seçicisi bu değeri de filtreler (`dsAll`).

### İstatistik 6 — "Firma bazında ortalama şarj kaybı" nasıl hesaplanıyor?
`calc.js:304-309` (hesap) + `ui/stats.js:198-211` (liste). Ana mantık:

```
Bataryaya giren  ≈ batarya kapasitesi × (bitiş % − başlangıç %) / 100
Kayıp %          = (faturalanan kWh − bataryaya giren) / bataryaya giren × 100
Firma satırı     = o firmanın kayıtlarındaki kayıp %'lerin ARİTMETİK ORTALAMASI
```

Üç şey birden dolu olmayan kayıt **hiç sayılmaz**: başlangıç %, bitiş % ve
aracın batarya kapasitesi. Sayı iki şeyi birlikte içerir — fiziksel şarj kaybı
(ısı, kablo) ve istasyonun sayaç sapması; ikisi ayrıştırılamaz. Batarya
kapasitesi yanlışsa metrik tamamen anlamsızlaşır (bkz. WT-60 — kapasiteyi elle
düzeltme butonu şu an çalışmıyor, bu yüzden o madde bunun ön koşulu sayılır).

### Giriş 3 — "Bu bilgi yanlış mı" mesajı kime gidiyor?
`ui/shell.js:164` → `https://github.com/rino-06/WattTrack/issues/new`.
**Sana gidiyor, başka kimseye değil.** Kendi GitHub deponun issue sekmesinde
açılıyor. İki not: (1) issue **herkese açık**, kullanıcının yazdığı her şeyi
internet görebilir; (2) kullanıcının GitHub hesabı yoksa gönderemez.
Depo bir gün özelleştirilirse (bkz. Kod 2) bu bağlantı çalışmaz hale gelir.

### Veri Girişi 4 — "Bu şarjdan öncekini girmeyi unuttum" ne yapıyor?
Tahminin doğru. `ui/dashboard.js:112` ve `205-210`, `ui/stats.js:219`:
işaretli kayıt **harcama ve enerji toplamlarına girmeye devam eder**, ama
**mesafesi** tüketim (kWh/100 km) ve km maliyeti ortalamalarından çıkarılır.
Gerekçe: o mesafenin bir kısmı kaydedilmemiş şarjla gidilmiştir, aksi halde
"çok az enerjiyle çok yol" gibi görünüp ortalamayı bozar. Eski tarihli kayıt
girmek ayrı bir şey — o mesafeyi doğru sayar; bu kutucuk "arada kayıt eksik"
demek için. Zaten uygulama bunu kendi de sezip soruyor (`missedAsk`).

### Aracım 3 — "Kayıtları taşı" butonu ne işe yarıyor?
Şarj kayıtlarını ve giderleri **bir araçtan diğerine taşır** (isteğe bağlı
tarih aralığıyla). İki kullanım: yanlış araca girilmiş kayıtları düzeltmek ve
araç sattığında/değiştirdiğinde geçmişi doğru araca bağlamak. Tek araç varsa
"Taşınacak başka araç yok" der. Taşıma geri alınabilir.

### Kıyasla 6 — "Yakıt dışı gider kıyaslaması" kutusu
Elektrikli aracın **şarj dışı** giderleriyle (Aracım → sabit giderler: sigorta,
vergi, bakım, lastik…) yakıtlı araç için girdiğin **yıllık sabit gider**
tahminini karşılaştırır. Yani üstteki kutu "yakıt vs. şarj", bu kutu
"geri kalan her şey". Bu yüzden Kıyasla 4 (sabit gider girilmemişse gizle)
mantıklı — girdi yoksa kutu 0'a karşı kıyas gösteriyor.
**Satır satır dökümü (WT-73 sırasında `ui/compare.js`'e bakılarak doğrulandı,
09.08.2026):**

| Satır | Nereden geliyor |
|---|---|
| **Yıllık yakıt dışı gider farkı** (büyük sayı) | `icefix − (expTot / gün × 365)` — senin yazdığın yıllık yakıtlı gider eksi EV giderlerinin yıllığa çevrilmişi |
| Yanındaki rozet | Aynı farkın 100 km başına düşen kısmı |
| **İki bar** | Üstteki: EV'nin yıllığa çevrilmiş gideri · alttaki: senin yazdığın yıllık yakıtlı gider. Barlar büyük olana göre ölçekleniyor |
| Detay: 1 km başına (EV / Yakıtlı) | `expTot / toplam km` ve `oranlı icefix / toplam km` |
| Detay: 100 km başına (EV / Yakıtlı) | Aynı ikisinin 100 katı |
| Detay: yıllık (EV / Yakıtlı) | `expTot / gün × 365` ve `icefix` (ham, oranlanmamış) |
| Detay: kWh başına | `expTot / toplam kWh` — yalnız EV tarafı, karşılığı yok |

Dikkat: "yıllık" satırında yakıtlı taraf **ham** `icefix`, km başına satırlarda
ise **döneme oranlanmış** hâli kullanılıyor. İkisi de doğru (biri yıllık, biri
dönemsel) ama aynı kutuda yan yana durdukları için karıştırılabilir.

### Kıyasla 2 — Yakıt fiyatını lokasyona göre aylık çekiyor mu?
**Hayır.** Türkiye ortalama dizel fiyatını aylara göre çeken bir şey yok.
Uygulama **senin girdiğin tek fiyatı** tüm geçmişe uygular (`fuelHistSingle`
uyarısı bunu söylüyor). Elle geçmiş fiyat girersen (Kıyasla → fiyat geçmişi)
her kayıt kendi tarihindeki fiyatla kıyaslanır (`fuelHistUsed`). WT-43'ün
ikinci aşaması — son 36 ayın doğrulanmış Türkiye yakıt fiyatlarının depoya
gömülmesi — **hiç yapılmadı**, çünkü hafızadan fiyat yazmayı kural yasaklıyor.
Bunu bir iş kalemi olarak planladım: **WT-77**.

### Kod 2 — GitHub'dan kodun kopyalanmasını engellemek
Dürüst cevap: **tarayıcıda çalışan bir PWA'da kaynak kodu gizlemek mümkün
değil.** Uygulamayı açan herkes `index.html`, `app.js`, `i18n.js` dosyalarını
zaten indirmiş oluyor; GitHub deposu kapansa bile tarayıcının ağ sekmesinden
tamamı alınır. Ayrıca lisansın şu an **MIT** — yani kopyalamaya, değiştirmeye
ve **ticari olarak satmaya** açıkça izin veriyorsun. Gerçekçi seçenekler:

| Seçenek | Etkisi | Maliyeti |
|---|---|---|
| **Lisansı değiştir** (MIT → AGPL-3.0 veya "tüm hakları saklı") | Kopyalamayı hukuken yasaklar, tek uygulanabilir korumadır | Bedava. En yüksek getirili adım. |
| **Kaynağı özel depoya al, yalnız derlenmiş çıktıyı yayınla** | Yorumlar ve geliştirme geçmişi gizlenir | GitHub **Pages** kullanıyorsan özel depo ücretli plan ister; Netlify/Vercel'de özel depo ücretsiz. Ayrıca derleme adımı eklemek gerekir (şu an yok, bu bir avantaj). Nerede yayınladığını söylersen netleştiririm. |
| **Küçültme/karartma (minify/obfuscate)** | Kopyalamayı zorlaştırır, **engellemez** | Hata ayıklamayı zorlaştırır, test kurulumunu bozabilir |
| Hiçbir şey yapma | — | — |

Asıl değerin kodda değil: küratörlüğünü yaptığın **EV veri tabanı**, altı dil
çevirisi, marka ve kullanıcı verisi. Önerim: **lisansı değiştir** (5 dakika),
kodu açık bırak. **Karar verildi (09.08.2026): "tüm hakları saklı" — WT-82'de uygulandı.**

---

## 3. Ayarlar 1 — karara bağlandı (08.08.2026)

Mevcut durum: **Aylık/yıllık bütçe** = para birimi cinsinden harcama hedefi,
ana sayfada ilerleme çubuğu çizer (`ui/dashboard.js:236`) — tarifeyle ilgisiz,
ayrı bir işlev, **dokunulmayacak**. **Ev/İş elektrik birim fiyatı** = evde/işte
şarj ederken tutarı hesaplayan tek kWh fiyatı.

**Karar: gömülü elektrik tarifesi tablosu yapılacak → WT-78 (Faz 7).**
Kullanıcının verdiği dört karar:

1. **Coğrafi kırılım:** eyalet sistemi olan yerlerde eyalet ortalaması,
   diğerlerinde il; ülke genelinde fark yoksa tek ülke fiyatı. Firma ve tarife
   bazında ayrım YOK — temel tarife alınır.
2. **Zaman kırılımı: yıllık ortalama**, uygulamada bunun yıllık ortalama
   olduğu açıkça yazılacak. **İstisna: enflasyonu yüksek ülkeler (TR)** —
   orada yıl ortalaması gerçek fiyattan çok sapar, o yüzden yıl içinde
   tarife değiştiyse **kaydın tarihinde geçerli olan tarife** kullanılır.
   > Bu, "o sene içindeki güncel ortalamayı al" cümlesinin benim okumam.
   > Yanlışsa WT-78'e başlamadan söyle.
3. **Kademe: düşük/temel kademe.** ⚠️ Not: TR'de mesken tarifesinde günlük
   5 kWh eşiği var ve evde araç şarj eden bu eşiği pratikte hep aşar; temel
   kademe bu kullanıcı için maliyeti **düşük** gösterir. Karar kullanıcınındır,
   uygulanacak — ama alanın yanına "evde şarj ediyorsan faturandaki fiyatı
   yazman daha doğru olur" uyarısı konacak (madde 4 bunu zaten mümkün kılıyor).
4. **Rol: varsayılan öneri.** Alan otomatik dolar, yanında **kaynak + veri
   tarihi damgası** durur, kullanıcı üstüne kendi fiyatını yazabilir. Böylece
   tablo bayatladığında uygulama sessizce yanlış hesap yapmaz.

---

## 4. Tür C — İş sırası

Sıra üç ilkeye göre kuruldu: **(a)** veri kaybı ve yanlış veri önce, **(b)**
bozuk/ölü işlev sonra, **(c)** yerleşim ve metin en sonra. Bir maddenin
diğerinin ön koşulu olduğu yerlerde bağımlılık yazıldı.

### Faz 1 — Veri bütünlüğü (önce bu; sessiz veri kaybı var)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| ~~**WT-55**~~ | ~~Yedekten geri yüklemede firma / şarj tipi / şarj yeri alanlarının boş gelmesi~~ | İstatistik 3 | ✅ **ÇÜRÜTÜLDÜ — veri kaybı yok.** `test/stats.mjs` yedek al → sil → geri yükle turunu koşuyor: `firma`, `tip`, `mekan` üçü de sağ çıkıyor. JSON geri yükleme yolu (`ui/settings.js:494`) yalnız `id`/`ekranGor`/`ekranGorVar` düşürüp gerisini olduğu gibi geçiriyor. Gerçek neden WT-56'da. |
| **WT-56** | Dağılımların boş çıkması ve bunun **veri kaybı gibi okunması** | İstatistik 3 + 5 | ✅ **BİTTİ.** Kök neden: İstatistik sayfasının dönem seçicisi `gran: 'month'` ile açılıyor (`calc.js:14`) ve WT-15 gereği firma dağılımı, iki donut, bankalar ve lokasyonlar **hepsi** seçili döneme bağlı. Yedeğini geri yükleyen kullanıcının kayıtları bu ayın dışında olduğu için hepsi boş çiziliyor, üstelik "Henüz kayıt yok" yazıyordu — bu yüzden veri kaybı sanıldı; elle girilen yeni kayıt bu ayda olduğu için görünüyordu. Yapılanlar: dönem seçicisine **"Tümü"**, dönem boşken **açıklayıcı şerit + tek dokunuşla Tümü'ne geçiş**, blokların boş metni `noData` → `noDataPeriod`, "Tümü"de harcama grafiği verinin **kendi yıllarını** çiziyor. |
| **WT-57** | Tüm grafiklerin gerçek yedek verisiyle uçtan uca testi | İstatistik 3 (son cümle) | ✅ **BİTTİ** — `test/stats.mjs` (8 kontrol), `npm test` koşumuna eklendi. |
| **WT-58** | Veri girişinden girilen km'nin Aracım'daki toplam km'ye yansımaması | Aracım 1 | ✅ **BİTTİ.** Tahmin ettiğim asimetri değilmiş: `odoNowOf()` (`calc.js:289`) yalnız İKİ kaynağa bakıyordu — kayıtlardaki `odo` ve elle girilen `kmNow`. Veri giriş ekranında **"Sürülen mesafe"** girip sayaç değeri hiç girmeyen kullanıcının aracı ilk günkü kilometrede donuyordu. Üçüncü kaynak eklendi: `kmStart + Σ mesafeKm` (yalnız `odo`'suz kayıtlar — odo'lu kayıtların mesafesi zaten odo zincirinden türetiliyor, iki kez sayılmamalı). Taban olarak `kmNow` değil `kmStart` alınıyor; yoksa kullanıcı sayacı elle güncellediğinde aynı sürüş iki kez sayılırdı. Aracım listesi kaynağı yazıyor ("girilen sürüş mesafelerinden"). |

### Faz 2 — Bozuk / ölü işlevler

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-59** | Tesla'da bütün sekmelerin aynı sayfada alt alta görünmesi | Arayüz 1 | **Regresyon** — "önceki sürümde gayet güzeldi". Pasif ekranlar gizlenmiyor. `showScreen()` `.page.active` sınıfıyla çalışıyor (`app.js:32-40`); Tesla'nın tarayıcısında ilgili CSS kuralı tutmuyor olabilir. Yeniden tasarım değil, **eski sürümle karşılaştırma** yapılacak. Senin birincil cihazın olduğu için fazın başında. |
| **WT-60** | "Teknik değerleri düzenle" butonunun hiçbir şey açmaması | Giriş 2 | ✅ **BİTTİ.** Düğme (`ui/shell.js:195`) çiziliyordu ama **dinleyicisi hiç bağlanmamıştı**. Belge düzeyinde dinleyici eklendi (kart üç yerde çiziliyor). Ayrıca araç HENÜZ KAYDEDİLMEMİŞKEN de düzenlenebiliyor: seçim ekranındaki taslak güncellenip kart yeniden çiziliyor, araç düzeltilmiş değerlerle kaydediliyor. Bu, Giriş 1'i de kısmen karşılıyor — EV_DB'de alt versiyon yoksa bataryayı kaydetmeden önce düzeltebiliyorsun. |
| **WT-61** | İkinci/üçüncü aracın eklenememesi | Aracım 4 | ✅ **BİTTİ — tek karakterlik HTML hatası.** `index.html:1444`'te `<div id="car-summary">` `</main>` ile kapatılmıştı. Div kapanmadığı için tarayıcı `#car-photo` ve `#car-save`'i bu kutunun İÇİNE koyuyordu; araç seçilince kart `innerHTML` ile yazılıyor ve **"Ekle" düğmesi DOM'dan siliniyordu**. Bu yüzden araç bulunuyor ama eklenemiyordu. Aynı hata fotoğraf seçiciyi de bozuyordu. |
| **WT-62** | Ana sayfadaki boş "—" kutusu | Anasayfa 1 | **Kök neden bulundu.** `ui/shell.js:724-728`, `#page-dashboard .d-data` sınıfındaki **her** kutuyu görünür yapıyor; `#d-budget` (`index.html:553`) bütçe girilmediği için `butceCiz()` tarafından gizlenmişti, `syncEmptyStates()` onu geri açıyor ve varsayılan "—" görünüyor. `d-odo-wrap` için zaten istisna yazılmış (satır 726). ✅ **BİTTİ.** İkinci istisna da eklenmedi, `showScreen` de async yapılmadı (çağıranların hepsi senkron — nav düğmeleri, `init()`, `?page=` yolu, grafik çubukları; sırayı bozma riski vardı). Bunun yerine kutular kendilerini `data-own-visibility` ile işaretliyor; `syncEmptyStates` işaretli olanların görünürlüğünü ezmiyor. Bir sonraki kendi mantığı olan kutu aynı tuzağa düşmez. |
| **WT-63** | Gelişmiş ayarların "gizli" işaretliyken de açık gelmesi | Veri Girişi 1 | ✅ **BİTTİ.** Ayar kaydediliyordu, uygulanıyordu da — ama `ui/forms.js:433` açma koşuluna WT-47'nin otomatik doldurduğu banka/lokasyon alanlarını da katıyordu. Otomatik doldurma neredeyse her kayıtta çalıştığı için ayar pratikte ölüydü. Artık ayar kesin. WT-47'nin asıl derdi (kapalı panelde sessizce doldurulan alan) kaybolmasın diye düğme dolu alan sayısını yazıyor: "+ Gelişmiş (2 dolu)". **WT-47'nin bir kabul kriteri bilinçli olarak değiştirildi**, testi de yeni kuralla güncellendi. |
| **WT-64** | Ekran görüntüsünden otomatik okuma (OCR) çalışmıyor | Ayarlar 2 | **Önce doğrulanacak:** `vendor/ocr/` altındaki beş tesseract dosyası depoda hâlâ yok olabilir — o zaman bu bir kod hatası değil, eksik dosya. Veri giriş ekranında ayrı bir alan zaten var (`ocr-row`), ama OCR kapalıyken gizleniyor; keşfedilebilirlik ayrıca ele alınacak. |

### Faz 3 — Veri girişi ergonomisi

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-65** | Enerji, tutar ve indirim alanlarında ondalık kısmın **ayrı** kutuda girilmesi | Veri Girişi 2 | ✅ **BİTTİ.** ⚠️ Bu, ilk turda **WT-03'ün bilerek KALDIRDIĞI** çift kutu: eski uygulama ondalık kutusunu kuruş gibi okuyordu, kullanıcı 45,5 demek için "5" yazınca 45,05 kaydediliyordu — %1'lik sessiz hata. Geri getirirken tuzak kapatıldı: ondalık kutusu virgülden sonraki basamaklar olarak okunuyor ("5" → ,5) ve odak çıkınca iki basamağa tamamlanıp **ekranda gösteriliyor** ("5" → "50"), yani değer sessizce değişmiyor. Tam kutuya ayraçlı değer yapıştırılırsa yuvarlanmıyor, iki kutuya bölünüyor. Tam kutuda binlik ayracı kullanılmıyor — "1.234" pf kuralınca 1,234 okunurdu. OCR doldurma yolu da parçalı yazıyor. |
| ~~**WT-66**~~ | ~~Tutarın zorunlu olmaması~~ | Veri Girişi 3 | ❌ **İPTAL — kod değişmedi.** Cümleyi "tutar zorunlu OLMASIN" diye okumuştum; kullanıcı 08.08.2026'da "tutar zorunlu kalsın" dedi. Bugünkü davranış zaten bu: enerji ve tutar zorunlu, yalnız "ücretsiz şarj" işaretliyken tutar istenmiyor. |

### Faz 4 — Açılış animasyonu

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-67** | Açılış animasyonu | Açılış 1 | ✅ **BİTTİ.** Mekanizma zaten vardı (WT-37), yalnız dosya eksikti. `animasyon.mp4` → `splash.mp4` (112 KB, 1,8 sn, H.264 640×360); `animasyon.gif` KULLANILMADI (392 KB, dört kat büyük). İlk kareden `splash-poster.png` üretildi. **CSS düzeltmesi gerekti:** animasyon 16:9 yatay ve zemini beyaz; `object-fit:cover` dik telefon ekranında kenarlardan ağır kırpıp logoyu kesiyordu → `contain` yapıldı ve video oynarken splash zemini videonun beyazına eşitlendi (letterbox bandı görünmesin). Video oturumda yalnız bir kez oynuyor, 2500 ms güvenlik ağı zaten vardı. |

### Faz 5 — Filtre mimarisi (tek gövde, iki sayfa)

> Anasayfa 3 ve İstatistik 7 aynı işi istiyor: **sayfanın tamamını filtreleyen**
> ortak bir filtre durumu. Ayrı ayrı yapılırsa aynı altyapı iki kez yazılır.

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-68** | Ana sayfa: hafta/ay/yıl + Tümü/AC/DC tek şeritte, kutucuklar küçültülmüş | Anasayfa 3 | Şu an AC/DC seçicisi (`S.dstatType`) **yalnız detay istatistik bloğunu** filtreliyor (`ui/dashboard.js:177`); tüm sayfaya yayılacak. |
| **WT-69** | İstatistik: dönem + para birimi/kWh + AC/DC filtreleri, tüm sayfayı etkiler | İstatistik 7 + 1 | İstatistik 1 (harcama grafiğine haftalık/aylık/yıllık) bunun içinde çözülüyor — grafik zaten `S.gran`'a bağlı, eksik olan seçicinin grafiğin üstünde ve **küçük** olması. Uygulama notu: yeni filtre durumu kalıcı olmalı; `app.js` `SETTING_KEYS` listesinde `gran` var ama `period` ve `dstatType` **yok**. Aynı liste yedekten ayar geri yüklemede de kullanılıyor (WT-07) — WT-55 ile aynı alana dokunuyor. |

### Faz 6 — Yerleşim ve metin (görsel, riski düşük) — ✅ BİTTİ (09.08.2026, v34)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-70** | "Detay istatistikler" ve "Kilometre sayacı" başlıklarının kaldırılması; "Araç sayacı" → "Araç km sayacı" | Anasayfa 4, 5 | ✅ **BİTTİ.** Detay istatistiklerdeki dönem rozeti KALDI (kutuların hangi dönemi gösterdiğini söyleyen tek şey oydu). Sayaç etiketi `odoNowUnit` ile birime bağlandı, altı dilde dolu; `applyI18n` içinde `1 km` etiketleriyle aynı yerde güncelleniyor. |
| **WT-71** | Geçmiş'teki arama kutusunun kaldırılması | Geçmiş 1 | ✅ **BİTTİ.** WT-46/1'de eklenmişti; kutu, ayrıştırma fonksiyonu ve dinleyicisi kaldırıldı. Filtre paneli (yıl, firma, tip, araç, banka, lokasyon), özet şeridi ve geri alma yerinde. WT-46/1'in iki testi silinmedi — arama kontrolleri, kutunun gerçekten gittiğini ve filtre panelinin sağlam kaldığını doğrulayan kontrollerle değiştirildi. |
| **WT-72** | İstatistik: haftanın günleri grafiğinin **silinmesi** + firma dağılımının sayfa sonuna alınması | İstatistik 2, 4 | ✅ **BİTTİ.** Grafik (`ui/stats.js`), `#d-weekdays` bloğu ve `weekdayDist` anahtarı altı dilden silindi; firma dağılımı "En çok şarj edilen lokasyonlar"ın altına, detay bölümünün sonuna taşındı. WT-15'in "seçici tüm sayfayı daraltıyor" kontrolü gün dağılımı yerine kalan bloklarla doğrulanıyor; WT-30'un görsel gizli özet tablo eşiği 4 → 3 indi (grafik sayısı azaldı). `DAYS` sözlüğü duruyor — haftalık dönem etiketleri hâlâ kullanıyor. |
| **WT-73** | Kıyasla düzeltmeleri | Kıyasla 1, 3, 4, 5 | ✅ **BİTTİ.** (1) Yıllık sabit gider alanı `#c-icefix-toggle` arkasına alındı, varsayılan kapalı; kayıtlı değer varsa açık geliyor. (3) `splitParenLabels()` parantezli kısmı `<span class="paren">` içine alıp alt satıra indiriyor; `#page-compare .tile .k` nowrap+ellipsis kesmesi kalktı. Parantez satırı 12px'te bırakıldı (WT-31/1 sınırı). (4) TCO ve yakıt dışı bloklar artık **iki tarafta da** sabit gider varsa görünüyor — eskiden yalnız yakıtlı taraf kontrol ediliyordu, EV tarafı boşken kazanç şişiyordu; gizlendiğinde `tcoNeedFix` satırı ne yapılacağını söylüyor. Karar mesafe hesabından ÖNCE veriliyor, yani "veri yok" yolunda da geçerli. (5) `tcoIce/tco1km/tco1kmIce/tcoSaved` + tutarlılık için `tcoEv/tcoTitle` altı dilde "sabit gider" diyor. Kıyasla 6'nın satır satır dökümü §2'ye yazıldı. |
| **WT-74** | Aracım kart yerleşimi: model/içerik metni **üstte tam genişlik**, km–ayar–resim altında | Aracım 2 | ✅ **BİTTİ.** Etkin araç `<li>`si iki satıra bölündü (`.vrow2`): üstte yalnız ad + alt bilgi (batarya, sayaç, sayacın kaynağı) tam genişlik, altta yıldız, küçük resim, km✎, ⚙, 📷, ⇄ ve sağa yaslı ×. Arşiv listesi eski tek satır düzeninde bırakıldı — orada yalnız ad ve iki düğme var. |
| **WT-75** | Aracım sabit giderler: listenin üstünde **gider türü + ay/yıl** filtresi; **son girilen en üstte**; gider dağılımı tablosu grafiğin **altına** | Aracım 5, 6, 7 | ✅ **BİTTİ** (tek commit). Blok sırası artık: kutular → grafik → gider dağılımı → filtre → liste. Filtre iki açılır kutu (`exp-flt-type`, `exp-flt-period`); seçenekler mevcut veriden üretiliyor, yıllar `optgroup` başlığı, altlarında "Tümü" + dolu aylar. **Filtre YALNIZ listeyi daraltır** — kutular, grafik ve dağılım tüm giderleri gösterir; daraldığında listenin üstünde "n / m" yazıyor. Filtre durumu ayarlara/yedeğe YAZILMIYOR (SETTING_KEYS'e girmedi), oturumda kalıyor. Aracım 6 tespiti kısmen ÇÜRÜTÜLDÜ: liste zaten tarihe göre tersten sıralıydı; eksik olan aynı güne girilen kalemlerdi, id kırılma ölçütü eklendi. |

### Faz 7 — Doğrulanmış veri (kaynak gerektirir, kod değil) — ✅ BİTTİ (09.08.2026)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-76** | EV veri tabanına **alt versiyonların** eklenmesi (Standard Range / Long Range vb.), menzil farkının açıkça belirtilmesi | Giriş 1 | ⚠️ **TESPİT ÇÜRÜTÜLDÜ (09.08.2026)** — WT-55 gibi. Koda bakıldığında istenen şey zaten yapılmış: **169 kaydın 169'unda** hem batarya (kWh) hem WLTP menzili (km) DOLU, hepsinin donanım adı var, 132 model grubunun **27'si çok donanımlı**. Senin verdiğin örnek de artık geçerli değil: Tesla Model Y listede **altı donanımla** duruyor — `RWD 60 kWh (LFP)`, `Long Range AWD`, `Standard RWD (69 kWh)`, `Premium RWD (84)`, `Premium AWD (84)`, `Performance (84)` — yani söylediğin **69 kWh Standard Range kayıtta var**. Bulgu `test/boot.mjs` içindeki yedi kontrolle kilitlendi, sessizce geri gidemez. **Geriye kalan gerçek soru:** tek donanımla listelenen 105 modelden hangisinin eksik donanımı olduğunu biliyorsan söyle — model başına 5 dakikalık iş. 105 modelin toptan yeniden doğrulanması ayrı bir proje: (1) kaynak seçimi sende, (2) **EV-Database ticari ve telifli bir veri tabanı** — MIT lisanslı bir depoya 169 kaydını gömmek teknik değil hukuki bir sorun; üretici basın bültenleri temiz ama 105 ayrı kaynak demek. |
| **WT-77** | Türkiye yakıt fiyatı geçmişinin (son 36 ay) gömülmesi | Kıyasla 2 | ✅ **BİTTİ (09.08.2026).** Kaynak: **EPDK Petrol ve LPG Piyasası Aylık Fiyatlandırma Raporu** — her ayın raporundan Tablo-1 (benzin nihai satış fiyatı), Tablo-2 (motorin) ve Tablo-5 (otogaz toplam fiyatı) okundu; 48 rapor PDF'i çekildi, **2023-08 … 2026-07 arası 36 ay boşluksuz** çıktı (3 yakıt × 36 ay = 108 fiyat). Doğrulama: 2026-01 raporundaki değerler (benzin 53,809 · motorin 55,395 · LPG 29,969) elle okunup çekilenle karşılaştırıldı, birebir tuttu. Veri `evprices.js` içinde `FUEL_HIST`. **Sapma (EPDK'nın kendi kaydı):** rakamlar "gösterge niteliğinde" ve **İstanbul Avrupa Yakası** ortalamaları — Türkiye geneli değil; dosya başlığında ve bu satırda yazılı. **Veri tabanına HİÇBİR ŞEY yazılmıyor**: `fuelHistMerge()` okuma anında birleştiriyor, aynı tarih+türde kullanıcının kendi kaydı kazanıyor, gömülü satırların id'si yok ve silme düğmesi çizilmiyor. Fiyat geçmişi ekranı satırları "gömülü" diye işaretliyor ve kaynağı yazıyor. WT-43'ün uçtan uca testi gömülü verisi olmayan bir ülkeye (DE) taşındı — kendi kriterini yalıtılmış sınıyor. |
| **WT-78** | **Gömülü elektrik tarifesi tablosu** (ülke / eyalet / il, yıllık ortalama, temel kademe) | Ayarlar 1 | ✅ **BİTTİ (09.08.2026).** Yeni dosya `evprices.js` (`index.html`, `sw.js` ASSETS+NETWORK_FIRST ve altı test koşucusunun paketine birlikte eklendi). 45 ülkenin **42'si** kapsandı; MC, AD, SM için yayımlanmış kaynak bulunamadı — uydurulmadı, boş bırakıldı. Kaynaklar: **Eurostat nrg_pc_204** (38 Avrupa ülkesi, 2025 S1+S2 ortalaması, ulusal para, tüm vergiler dahil), **DESNZ QEP 2.2.4** (GB 2025), **ElCom H4 medyanı** (CH 2026), **EIA 861/Tablo 4** (ABD 2024, ulusal + 51 eyalet), **Hydro-Québec 2024** (Kanada, 10 il — **ülke geneli ortalama YOK**, il seçilmeden varsayılan dolmuyor). Her kaydın `s` (kaynak) ve `y` (yıl) alanı var, her kaynağın adı/url'i/güncellenme tarihi künyede. Para birimleri `COUNTRIES` ile birebir doğrulandı (test bunu kontrol ediyor). **Kullanıcının girdiği fiyat ASLA ezilmiyor**: tablo yalnız alan boşken kendiliğinden dolduruyor, dolu değeri değiştirmek için "önerilen fiyatı kullan" düğmesine basmak gerekiyor. Kaynak + yıl alanın altında yazılı. Yeni ayar `kwhRegion` SETTING_KEYS'e girdi (yedekten geri yükleniyor). **Sapma:** kaynaklar aynı şeyi ölçmüyor (DESNZ sabit ücret hariç değişken birim fiyat, Hydro-Québec vergiler hariç); dosya başlığında satır satır yazılı. "Temel kademe" ayrımı YAPILMADI — Eurostat/EIA kademe değil ortalama yayımlıyor. |

### Faz 8 — Cihaz ve çözünürlük — ✅ BİTTİ (09.08.2026, v35)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-79** | Tablette dikey moda zorlama | Arayüz 3 | **Kök neden doğrulandı ve düzeltildi (09.08.2026).** `manifest.json` `orientation` alanı `portrait-primary` → **`any`**. Alan SİLİNMEDİ: WT-53'ün "19 alan duruyor" kontrolü varlığını şart koşuyor. Yatay yerleşim tarafında `@media(min-width:760px)` (WT-33 grid düzeni) ve `(orientation:landscape)` kuralları yerinde. **Gerçek cihazda (tablet/Tesla) doğrulama elle test borcunda** — jsdom yönelim değiştiremiyor. |
| **WT-80** | Geniş ekranda (Tesla / PC / tablet) yerleşimin ölçeklenmesi | Arayüz 2 | ✅ **BİTTİ (09.08.2026, v35).** Ön koşul: WT-59'un KODU bitmişti, WT-79'un kodu da bitti (kalan yalnız gerçek cihaz doğrulaması) — kapı atlanmadı. **Tespit kısmen karşılanmıştı:** kırılma noktaları WT-33'te eklenmişti, ama yalnız Ana sayfa ve Kıyasla ızgaraya geçiyordu; kalan dört sayfa geniş ekranda telefon sütunu olarak ortada duruyordu. Yapılanlar: (1) **WT-59'un ikinci, hâlâ canlı sebebi bulundu** — `#page-dashboard,#page-compare{display:grid}` kuralı id özgüllüğüyle (1-0-0) `.page{display:none}`'ı (0-1-0) eziyordu, yani **760px üstü her ekranda Ana sayfa ve Kıyasla hangi sekme açık olursa olsun çiziliyordu.** Seçicilere `.active` eklendi; bir test artık id'li HİÇBİR kuralın `.active` olmadan öğeyi GÖRÜNÜR kılmadığını tarıyor (`#page-*` ile sınırlı değil). İki gerekçeli istisna: `display:none` veren id kuralları (ör. `#adv-fields`) ters yönde, güvenli; `#s-data` ise `ui/shell.js` içinde satır içi `style.display` ile açılıp kapanıyor — satır içi stil her kuralı yener. (2) İstatistik detayları (`#s-data`) auto-fit ızgaraya geçti; sekiz blok `.gcell` sarmalayıcıya alındı — her hücrede kendi başlığı + bloğu var (WT-33 kuralı). Dönem seçici ve boş-dönem uyarısı hücre dışında, tam genişlikte (WT-15). (3) Aracım ≥1000px'te iki sütun: araç listesi (`#v-top`) solda, gider kartı sağda; 760–999px'te tek sütun, çünkü gider kartı 300px'e sığmıyor. (4) **`.dstat`'a bilerek DOKUNULMADI** — ilk gerekçem yanlıştı: iki örneği de `#page-dashboard` içinde, yani auto-fit ızgaranın 280–400px'lik hücrelerinde; "820px'lik sütunda iki dev kutu" diye bir durum yok. `minmax(150px,…)` orada iki kutuyu tek sütuna düşürürdü. İki test bu gerekçeyi (kuralın `1fr 1fr` kaldığını ve `.dstat`'ın yalnız Ana sayfada bulunduğunu) kilitliyor. (5) Panel 780px'e çıkarken form alanları esnetilmesin diye `.ov-body` 640px'te ortalanıyor (fotoğraf görüntüleyici hariç). (6) **Dikey eksen:** `(orientation:landscape) and (max-height:820px)` — Tesla ~1088×780 ve tablet yatayda telefon dikeyi için seçilmiş boşluklar ekranın yarısını yiyordu; yalnız boşluk/başlık ölçüleri küçüldü, **dokunma hedefleri (WT-25) ellenmedi**, bunu ayrı bir test kilitliyor. **Bilerek yapılmadı:** Geçmiş ve Ayarlar dar (820/900px) kaldı — biri liste, öbürü form; genişletmek satır uzunluğunu okunmaz yapardı. **jsdom'da yerleşim motoru yok:** 20 kontrol kuralın ve DOM yapısının doğruluğunu gösterir, gerçek ekranda öyle çizildiğini DEĞİL — elle test borcunda. |

### Faz 9 — Kod sağlığı — ✅ BİTTİ (09.08.2026, v36)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-81** | Kodun sadeleştirilmesi, hata avı | Kod 1 | ✅ **BİTTİ (09.08.2026, v36 — Faz 9 kapandı).** Bilerek en sona konulmuştu. **Beş alt commit:** **/1** üç bar grafiği tek `barChartHTML()`'e alındı ve bir KUSUR düzeldi — `.mb` sütun flex kutusu, `.bar`ın `flex-shrink`i kısıtlı değildi, etiketler sığmayınca çubuk küçültülüyordu: 130px'lik kutuda %100 isteyen çubuk ~%68'e sıkışırken %50 isteyen dokunulmadan kalıyordu, yani **grafik veriyi 2:1 yerine ~1.39:1 gösteriyordu**. Çubuk artık `flex:1` bir `.track` içinde, oran her yükseklikte birebir. Bu aynı zamanda WT-80'in alçak yatay ekran kuralını doğru kılıyor. Yan bulgu: `#s-cons` grafiğinin metin alternatifi HİÇ YOKTU (WT-30 üç grafiği kapsamıştı, tüketim trendi sonra WT-41/3 ile eklenmişti). **/2** "son N ay / son N yıl" Date aritmetiği üç yerden `sonAylar()`/`sonYillar()`'a alındı; 5 birim testi (yıl sınırı, sıralama, 31 Mart gün taşması). **/3** kur alanları ve ayar okuma tek yere alındı — kopyalar AYNI DEĞİLDİ: `openAdd()` `NO_AUTO_FX` denetimini atlıyordu, yani ECB tablosunda olmayan bir para biriminde (RSD/BAM/MKD/ALL/MDL) **kendi kuru kayıtlı bir şarjı düzenlerken "otomatik kur yok" uyarısı görünmüyordu**. **/4** 14 ölü çeviri anahtarı silindi (altı dilde 84 satır; çoğu WT-70/71/72'de kaldırılan ekranlardan artmış) + sözlük bütünlüğü testleri — **çalışma kuralı 3 ("altı dili de doldur") bugüne kadar hiç sınanmıyordu.** **/5** beş ölü CSS sınıfı (22 kural) silindi + kalıcı tarama testi. **Ara durum: testler 388 → 482 jsdom + 46 → 51 birim.** **HATA AVI YARISI (altı alt commit daha, `/code-review high` + "yinelenen mantığın kopyalarını diff'le" yöntemi):** **/6** `mesafeKm` hep KM saklanıyor ve uygulamanın geri kalanı gösterimde `distDisp()`/`distFactor()` ile çeviriyor; TÜKETİM beş yerde ayrı hesaplanıyordu ve İKİSİ (ana sayfa `d-cons`, Geçmiş satırları) çeviriyi atlayıp km tabanlı sayıya `S.unit` etiketi basıyordu — **'mi' seçen kullanıcı tüketimini %38 DÜŞÜK görüyordu** (18 kWh/100 km aslında 29 kWh/100 mi). `cons100()`/`consUnit()`/`tuketimOrt()` tek yere alındı, `consTrend`/`consTrendNote` `{u}` aldı. **/7** `fetchTable()`/`fetchRate()` yeniden deneme sarmalayıcısı tek gövdeye (`fxDene`); kopyalar zaman aşımında ayrışmıştı (4500/4000) ve bu yolun HİÇ testi yoktu — sekiz kontrol eklendi. **/8 (EN AĞIR):** `init()` `kwhPriceAutofill()`i onboarding'den ÖNCE çağırıyor; taze kurulumda `S.country` hâlâ varsayılan 'TR' olduğu için **kullanıcı ülkesini seçmeden Türkiye fiyatı (2,8076) yazılıyordu** ve bir daha düzelmiyordu (ülke seçicisinin çağrısı `homeKwhPrice != null` ile ölüydü). Almanya kurulumunda €/kWh gerçeğin ~7 katı kalıyor ve her ev/iş şarjının tutarını hesaplıyordu. Köken işareti `homeKwhAuto` eklendi (uygulamanın `specElle`/`tutarKaynak` kalıbı); yeni koşum `test/kwh.mjs` — **onboarding'i atlamayan tek dosya**, kusur diğerlerinde bu yüzden görünmüyordu. **/9** gelişmiş alan sayacı onay kutusunu `value` ile sayıyordu; `<input type=checkbox>` işaretsizken de `value==='on'` döner, bu yüzden **bomboş formda bile '1 dolu'** yazıyordu (testteki kopya da aynı hatalı ifadeyi kullandığı için kusuru görmüyordu). **/10** tutar iki kutu (tam+kuruş) ama yalnız tam kısım dinleniyordu — kuruşu düzelten kullanıcının değeri sonraki kWh dokunuşunda **sessizce eziliyordu** (112,35 → 114,80, üstelik `tutarKaynak:'birimFiyat'` ile). **/11** `t('delete')` hiçbir sözlükte yoktu (tooltip her dilde ham 'delete'); WT-81/4'ün değişmezi TEK YÖNLÜYDÜ, ters tarama eklendi; ve **koşumun kendisinde kusur:** `boot.mjs`'te `failed` sayımı dosyanın ORTASINDA yapılıyordu, ondan sonraki blokların (WT-81/1, /4, /5, /7) düşüşleri çıkış koduna girmiyordu — 'kalıcı değişmezler' kırmızıyken bile `npm test` yeşil kalırdı. **Toplam testler: 482 → 496 jsdom + 51 → 59 birim + yeni kwh.mjs (10) ve stats.mjs 8 → 13, homework.mjs 28 → 33.** **SAPMA:** plan `/simplify` de diyordu ama o araç DEĞİŞEN kodu inceliyor; çalışma ağacı temizken üzerinde çalışacağı bir fark yok — yerine `/code-review high` geniş kapsamla (ui/ + calc.js, db.js, app.js, index.html, sw.js) koşuldu. |
| **WT-82** | Lisans değişikliği | Kod 2 | ✅ **BİTTİ (09.08.2026, v37).** Kullanıcı §2'deki üç seçenekten **"tüm hakları saklı"yı** seçti. MIT kopyalamaya, değiştirmeye ve TİCARİ OLARAK SATMAYA açıkça izin veriyordu; yeni bildirim hiçbir kullanım izni vermiyor. Üç ayrıntı bilerek yazıldı: **(1) geriye yürümüyor** — bildirimden önce MIT ile yayımlanmış sürümler MIT kalır, verilmiş hak geri alınamaz, metin bunu açıkça söylüyor. **(2) Dexie ayrı tutuldu** — `dexie.min.js` (3.2.4) Apache-2.0 ve depoya gömülü; her şeyi "tüm hakları saklı" ilan etmek onun lisansını YANLIŞ BEYAN ederdi. Küçültülmüş dosyanın kendi başlığı yok, dolayısıyla Apache-2.0'ın 4(a)/4(b) atıf yükümlülüğü ancak LICENSE dosyasından karşılanabiliyor; `vendor/ocr/` (Tesseract) için de satır ayrıldı ki dosyalar sonradan konduğunda atıf unutulmasın. **(3) Gömülü fiyat tabloları** — kaynak veriler kamu istatistikleri, her kaydın kaynağı/yılı zaten kodda (KWH_SRC, FUEL_HIST_SRC); tabloların seçimi ve doğrulanması telif sahibinin eseri. Metin İngilizce (bağlayıcı) + Türkçe özet. Depoda MIT'e başka atıf yok, README/KURULUM.md tamamen teknik ve "açık kaynak/fork/katkı çağrısı" gibi çelişecek ifade taşımıyor (tarandı). **Kapsam dışı kalan:** kod açık depoda kaldığı sürece herkes GÖREBİLİR, yalnız kullanamaz — gizlemek ayrı bir karar (§2'deki özel depo satırı). |

### Faz 10 — Kararların uygulanması — ✅ BİTTİ (09.08.2026, v37)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-83** | WT-81/8 öncesi kurulumlardaki yanlış elektrik fiyatının onarılması | WT-81/8 kuyruğu | ✅ **BİTTİ (09.08.2026, v37).** WT-81/8 kusuru düzeldi ama ONDAN ÖNCE kurulmuş TR dışı cihazlarda yanlış fiyat duruyordu (yükseltmede işaretsiz değer tedbiren "elle girilmiş" sayıldığı için autofill dokunmuyordu). Kullanıcı tek seferlik onarımı onayladı. Onarım YALNIZ kusurun üretebileceği imzayı hedefliyor, **üç koşul BİRDEN**: ülke TR değil + para birimi TRY değil + fiyat TR varsayılanına **BİT BİT** eşit (epsilon YOK; aranan şey kusurun yazdığı değerin ta kendisi). Tablosu olmayan ülkede (MC/AD/SM) temiz çıkıyor, fiyatı null YAPMIYOR. Geri alınamaz bir yazma olduğu için uyarı şeridi ESKİ ve YENİ değeri birlikte gösteriyor. `init()` sırası: loadSettings → kwhFiyatOnar → kwhPriceAutofill; onarım değeri kendi yazıp `homeKwhAuto`'yu işaretlediği için autofill'in kısa devresi onu no-op yapıyor — tekrar koşma koruması da bu. **Testin ağırlığı pozitif durumda değil, DOKUNMAMASI gereken dört durumda**; iki koruma tek tek zayıflatılıp ilgili kontrolün düştüğü doğrulandı. Kabul edilen sınır: evprices.js'te TR fiyatı güncellenirse eski kurulumlar artık eşleşmez, onlar için "önerilen fiyatı kullan" düğmesi duruyor. Şema değişikliği YOK. Testler: kwh.mjs 13 → 22. |

### Kapatılan soru — GB'de galon/MPG belirsizliği (09.08.2026)

WT-81'in hata avında çıktı, **kusur DEĞİL** diye kapatıldı; bir daha hata
sanılıp açılmasın diye aritmetiğiyle birlikte buraya yazıldı.

`calc.js` `GALON_LT = 3.78541` ve `MPG_SABIT = 235.215` ikisi de **ABD**
ölçüsü, ama `S.unit === 'mi'` olan tek ülke ABD değil — **GB de mil
kullanıyor** ve İngiliz galonu 4,546 lt (%20 büyük). İlk bakışta kusur
görünüyor, **ama sapmalar birbirini tam götürüyor**:

| | Gerçek (GB) | Uygulamanın sakladığı | Sapma |
|---|---|---|---|
| Yakıt fiyatı | 1,50 £/lt | 1,80 £/lt | +%20 |
| Tüketim | 5,65 lt/100km | 4,70 lt/100km | −%17 |
| **km başına maliyet** | **0,084744 £** | **0,084744 £** | **%0** |

Sebep aritmetik: `4,54609 / 3,78541 = 235,215 / 282,481 = 1,20095`. Maliyet
bu ikisinin ÇARPIMI (`iceKmAt = fiyat × cons / 100`) olduğu için oran
sadeleşiyor; ölçülen kalıntı %0,0002. Ekrana geri yazarken de aynı sabitler
kullanılıyor (`fiyatGoster`/`tuketimGoster`), yani kullanıcı hep kendi girdiği
sayıyı görüyor ve saklanan "metrik" değer hiçbir yerde tek başına
gösterilmiyor (tek tüketici satır `ui/compare.js:190`).

**Geriye kalan gerçek risk belirsizlik:** etiket yalnız "gal"/"MPG" diyor,
hangi galon olduğunu söylemiyor. Kullanıcı fiyatı ABD galonuyla ama tüketimi
İngiliz MPG'siyle girerse sadeleşme bozulur ve **~%17 sapma** çıkar. Ayrıca
GB'de yakıt zaten litreyle satılıyor, sürücü elle çevirmek zorunda.

**Kullanıcı kararı: DOKUNMA.** Etkilenen kitle dar (GB + yakıtlı araç
kıyaslaması yapanlar), kendi içinde tutarlı giren doğru sonuç alıyor.
İleride açılırsa iki seçenek vardı: (a) etiketi netleştir (ucuz, altı dile
iki anahtar), (b) GB'de litre + L/100km kipine geç (doğrusu, ama birim
mantığını ülke bazında ikiye ayırır).

---

## 5. Senden gereken (paralel ilerleyebilir, beni bloke etmesin diye erken listelendi)

| Ne | Hangi madde için | Neden kodla çözülemez |
|---|---|---|
| ~~Yedek dosyandan kırpılmış örnek~~ | ~~WT-55~~ | ✅ **GEREKMİYOR** — WT-55 çürütüldü, yedek yolu alan kaybetmiyor (`test/stats.mjs`) |
| ~~Ayarlar 1 kararı~~ | ~~—~~ | ✅ 08.08.2026'da verildi → WT-78 |
| **EV veri kaynağı onayı** | WT-76 | Hangi kaynağı "doğru" saydığın kural gereği sana ait |
| **Elektrik tarifesi kaynak onayı** (EIA / Eurostat / EPDK) | WT-78 | Aynı gerekçe |
| **`vendor/ocr/` altındaki beş tesseract dosyası** | WT-64 | İlk turdan devreden eksik; depoda yoksa OCR hiç çalışmaz |
| **Tesla ekran görüntüsü** (sekmelerin üst üste bindiği hâli) | WT-59 | Cihazda yeniden üretemiyorum |
| **OpenChargeMap anahtarı** (gerekliyse) | WT-54 borcu | İlk turdan devreden eksik |
| ~~Lisans kararı~~ | WT-82 | ✅ verildi: "tüm hakları saklı" (09.08.2026) |

---

## 6. Elle test borcu (ilk turdan devam)

Bu turda eklenecekler: yedekten geri yükleme sonrası grafiklerin dolduğunun
gerçek cihazda doğrulanması (WT-55/57), Tesla ekranında sekme geçişleri
(WT-59), tablette yatay açılış (WT-79), açılış animasyonunun ilk açılışı
geciktirmediği (WT-67), gömülü tarifenin kendi faturandaki fiyatla
karşılaştırılması (WT-78).

**WT-80 (geniş ekran) — jsdom'da ölçülemeyenler, gerçek cihazda bakılacak:**
Tesla'da sekme değiştirince YALNIZ o sekmenin göründüğü (`.active` düzeltmesi
tuttu mu), İstatistik ve Aracım sayfalarının kaç sütuna açıldığı, yatay
modda alt menünün içeriği kesmediği, formların panel içinde ortalanmış
durduğu. Bir ekran görüntüsü yeterli — sütun sayısı yanlışsa `minmax()`
eşikleri (300px / 380px) tek satırda ayarlanır.

---

# ÜÇÜNCÜ TUR — Faz 11 (10.08.2026, v38)

Kullanıcı beş maddelik yeni bir liste verdi. Dördü iş kalemi oldu, biri
soruydu (cevaplandı, iş kalemi açılmadı).

| # | Madde | Durum |
|---|---|---|
| WT-84 | Açılış animasyonundan ÖNCE logo görünüyor | ✅ |
| WT-85 | Animasyon masaüstünde bulanık | ✅ (hafifletme — kaynak sınırı) |
| WT-86 | Ev/İş seçimi drop-down'ın içinde kayboluyor, ayrılmalı | ✅ |
| WT-87 | Ev/iş kWh fiyatı TR için yanlış (2,84); iş fiyatı ayrı olmalı | ✅ |
| WT-88 | "Ücretsiz şarj" açıklaması dar | ✅ |
| soru | "Bu şarjdan öncekini girmeyi unuttum" nedir, gerekli mi? | cevaplandı |

**WT-84 —** `.splash-static` varsayılan olarak GÖRÜNÜRDÜ; `video-on` sınıfını
ancak `initSplash()` ekliyordu, aradaki ilk boyamada logo çiziliyordu. Splash
artık HTML'de `video-on` ile açılıyor, statik blok `display:none` ve yalnız
yedek yol (`static-on`) devreye girince gösteriliyor.

**WT-85 — HAFİFLETME, tam çözüm DEĞİL.** `splash.mp4` 640x360 (asıl kaynak
`animasyon.gif` 426x240). Video görüntü alanına yayılıyordu: telefonda
küçülme olduğu için keskin, 1920 px'lik masaüstünde 3 kat büyütme.
Artık doğal boyutunu aşmıyor, `margin:auto` ile ortalanıyor.
**KULLANICIDAN GEREKEN:** gerçek keskinlik için 1920x1080 yeni bir render.

**WT-86 —** ev/iş seçimi firma listesinin YANINDA iki ayrı kutucuk.
`mekan` boyutunun değer kümesi genişledi: `'ev' | 'is' | 'firma'` (+ eski
`'evis'`). **Migration YAZILMADI** — eski `evis` kayıtları ev mi iş mi
olduğunu söylemiyor, geriye dönük tahmin veri uydurmak olurdu. Yeni ALAN
eklenmediği ve `mekan` zaten indeksli olduğu için Dexie sürümü artmadı.
Kayda yazılan firma dizgisi i18n'den değil `db.js`'teki `EV_LABEL`/
`IS_LABEL` tablosundan geliyor; ikisinin ayrışmaması `boot.mjs`'te altı
dilde kilitli. Yeni kayıt **"Ev" işaretli** açılıyor (kullanıcının asıl
şikayeti listenin Trugo ile açılmasıydı).

**WT-87 —** EPDK 2026, vergiler dahil: mesken (tek terimli/tek zamanlı AG,
≤240 kWh/ay dilimi) **3,24 TL**, ticarethane (≤900 kWh dilimi) **5,46 TL**.
Eski değer Eurostat'ın ORTALAMA birim fiyatıydı (2,8076) — EPDK dilimli
tarife yayımlıyor ve ticarethane meskenden ayrı. Ayarlar'a ikinci alan
(`workKwhPrice` + `workKwhAuto`) eklendi; hangisinin geleceğini WT-86'nın
kutucuğu belirliyor. **WT-83'ün "kabul edilen sınır"ı kapandı:** onarım
imzası artık tabloya değil `TR_KWH_2025 = 2.8076` sabitine bakıyor.

**SESSİZ KUSUR (WT-87'de bulundu, düzeltildi):** Ayarlar'daki
`set-homekwh` alanının HİÇBİR dinleyicisi yoktu — ne `change` ne `input`.
Kullanıcı ev elektrik fiyatını oraya yazıyor, alan bir sonraki
`renderSettings()`te `S.homeKwhPrice`tan yeniden çiziliyor ve yazdığı değer
sessizce kayboluyordu. WT-78 "kullanıcının girdiği değer ASLA ezilmez"
diyordu ama değer zaten hiç GİRİLEMİYORDU; tek yazma yolu "önerilen fiyatı
kullan" düğmesiydi. `test/kwh.mjs` sonundaki blok ikisini de kilitliyor.

**Yan bulgu (WT-86 içinde düzeltildi):** `formSnapshot()` onay kutusunu
`.value` ile okuyordu — checkbox'ın değeri işaretli olsun olmasın HER ZAMAN
`'on'`. WT-81/9'daki tuzağın aynısı: `in-missed`/`in-free` "kaydetmeden
çıkıyorsun" korumasının dışında kalıyordu. Artık `checked` okunuyor.

**Soru — "Bu şarjdan öncekini girmeyi unuttum" (WT-20):** GEREKLİ, kalıyor.
Sayaç farkı İKİ şarjın mesafesini içerirken kWh tek şarjınki olduğunda
tüketim ve km maliyeti şişer. İşaretli kayıt `calc.js:188` ve `calc.js:329`
ile ORTALAMALARDAN çıkarılır, harcama/enerji TOPLAMLARINA girmeye devam
eder (`ui/dashboard.js:118`). `looksLikeMissedCharge()` tüketim geçmiş
ortalamanın yarısından düşükse zaten kendisi soruyor.

## Elle test borcu (bu tura eklenenler)

- **WT-84/85:** gerçek cihazda açılış — animasyondan önce logo çakması
  kalmadı mı, masaüstünde video ortalanmış ve zemin beyaz mı.
- **WT-86:** dar telefon ekranında kutucukların firma listesinin altına
  sarması, `.cbx` dokunma hedefi, altı dilde etiket taşması.
- **WT-87:** Ayarlar'da iki fiyat alanı, TR'de 3,24 / 5,46 varsayılanları
  ve kendi faturanla karşılaştırma.

---

# DÖRDÜNCÜ TUR — Faz 12 (10.08.2026, v39)

Kullanıcının yedi maddelik geri bildirimi. İkisi soru, biri çalışma kuralı,
biri depo temizliği; iş kalemi olarak **WT-89** ve **WT-90** açıldı.

| No | Başlık | Durum |
|---|---|---|
| WT-89 | Veri girişinde "Ev" varsayılan işaretli gelmesin | ✅ |
| WT-90 | Ana sayfa: AC/DC filtresi her alanı süzsün, filtre üste, hafta kalksın | ✅ |

**WT-89 —** `openAdd()` yeni kayıtta `setHomeMode('ev')` çağırıyordu (WT-86'nın
kararı). Şarjların çoğu firmada yapıldığı için bu her kayıtta fazladan bir
dokunuş demekti. Artık `setHomeMode('')`: kutucuklar boş, firma listesi etkin
ve `fillFirmSelect`'in kuralı gereği **listenin ilk sırası** (en çok kullanılan
firma) seçili geliyor. **WT-16/B DEĞİŞMEDİ** — AC'ye basmak hâlâ ev kutucuğunu
işaretliyor; o kullanıcının kendi hareketi, açılış varsayılanı değil.

**WT-90 —** üç iş bir arada:
1. Tip filtresi `renderDashboard()` içinde `all` kurulurken uygulanıyor
   (`typeFilter`), dolayısıyla hero, kWh başı, 1 km, enerji, şarj/firma,
   indirim, ücretsiz, bütçe ve detay kutularının hepsi süzülüyor. **Araç km
   sayacı kutuları dışarıda** — kaynakları şarj kaydı değil aracın sayacı
   (`odoNowOf` kendi okumasını yapıyor, filtreden etkilenmiyor).
2. Filtre `d-dstat-wrap`'ın içinden çıkıp dönem seçicisinin hemen altına,
   `#page-dashboard`'ın doğrudan çocuğu olarak taşındı. `d-data` sınıfı
   ŞART: yoksa WT-36/1'in boş durumunda öksüz kalıp görünürdü.
3. Ana sayfadan "Hafta" kaldırıldı (İstatistik'in `d-gran` seçicisinde
   duruyor). `S.period` kaydedilmiyor (SETTING_KEYS'te yok), varsayılanı
   `'year'` — migration gerekmedi.

**WT-90'ın kasten kapattığı tuzak:** filtre açıkken 1 km maliyetinin kilometre
sayacı yedeği (WT-14/B) KULLANILMIYOR. Sayaç bütün sürüşü sayıyor; payı süzüp
paydayı süzmemek WT-13'ün "pay ve payda AYNI kümeden gelir" kuralını çiğner ve
maliyeti sessizce düşük gösterirdi. O durumda kutular `—`, altında yeni
`distTypeFilter` notu (altı dilde) gerekçeyi yazıyor.

**Ölen kod:** `periodWeek` anahtarı altı sözlükten, `prevPeriodFilter`'ın week
kolu, detay bloğundaki ikinci tip süzmesi (`dsAll = cur`).

**Soru — "Ort. eklenen +%N" (WT-32/4c):** "Ort. şarj aralığı" iki UCUN ayrı
ortalaması (%30 → %80), altındaki satır ise **şarj başına eklenen yüzdenin
ortalaması** (`socA − socB`). İkisi aynı sayıyı vermez: farklı aralıklarda
şarj eden kullanıcıda uçların ortalaması yanıltıcı olur. Sayıya yalnız
`socA > socB` olan kayıtlar giriyor.

**Soru — "Bu şarjdan öncekini girmeyi unuttum" (WT-20):** üçüncü turda
cevaplandı, yukarıdaki bölümde duruyor. Özet: gerekli, kalıyor.

## Depo temizliği (kullanıcının 7. maddesi)

Silindi: `animasyon.mp4` (`splash.mp4` ile md5 olarak AYNI dosya),
`animasyon.gif` (426×240, hiç kullanılmadı — WT-85'in istediği 1080p'yi zaten
veremez), `watttrack-promptlar.md` ve `watttrack-calisma-sirasi.md` (birinci
turun 54 maddesi 54/54 kapandı). Hepsi git geçmişinde duruyor.

**BU DOSYA SİLİNMEDİ:** her turun kararları buraya yazılıyor, canlı belge.

## Çalışma kuralı (kullanıcının 6. maddesi)

Kullanıcı onay verdikten ve kod değişikliği bittikten sonra **push için
ayrıca sorulmayacak** — doğrudan push edilecek. Soru sormak yalnız gerçek
belirsizlikte.

## Elle test borcu (bu tura eklenenler)

- **WT-89:** gerçek cihazda yeni kayıt formu — firma listesi ilk sırayla mı
  açılıyor, AC'ye basınca ev kutucuğu hâlâ işaretleniyor mu.
- **WT-90:** ≥760px masaüstü ızgarasında iki seg üst üste düzgün duruyor mu;
  boş durumda (hiç kayıt yokken) tip filtresi gizleniyor mu.

---

# Faz 13 (10.08.2026, v40) — ana sayfa ikinci tur

Faz 12'nin ardından kullanıcının altı maddelik ana sayfa geri bildirimi.
Üçü iş kalemi, biri soru, biri onay.

| No | Başlık | Durum |
|---|---|---|
| WT-91 | "Ort. eklenen +%N" satırı kaldırılsın | ✅ |
| WT-92 | Ay/Yıl'ın yanına "Tümü", varsayılan olsun | ✅ |
| WT-93 | Filtre şeritleri eşit yükseklikte + sayfa kompaktlaşsın | ✅ |

**WT-91 —** WT-32/4c'nin eklediği satır. Gerekçesi ("kullanıcının asıl merak
ettiği şarj başına eklenen yüzde") kullanıcı tarafından ÇÜRÜTÜLDÜ: aralığın
iki ucu zaten okunuyor. `avgSocAdded` altı sözlükten silindi. Yan kazanç:
`.dstat` ızgarasında komşu kutu (Ort. şarj süresi) artık bu satır kadar
uzamıyor — kullanıcının şikayet ettiği boşluğun asıl kaynağı buydu.

**WT-92 —** WT-56 "Tümü"yü ana sayfadan bilerek çıkarmıştı: dönem kutuları
anlamsızlaşır diye. Asıl risk kutuların anlamsızlaşması değil, **sessizce
yanlış kıyas yapılması**ydı — `prevPeriodFilter` 'all' bilmeseydi ay koluna
düşüp tüm zamanları geçen ayla kıyaslardı. Çözüm: `if (S.period === 'all')
return []`. Kıyas satırı ve tüketim kıyası kendiliğinden boş, bütçe çubuğu
zaten `hedef == null` ile gizli. `S.period` varsayılanı `calc.js`'te
`'all'`. Yeni anahtar `periodAllTotal` ("Tüm zamanlar toplam"), altı dil.

**WT-93 — SINIR: 44px dokunma tabanı.** Kullanıcı filtre kutucuklarının
yüksekliğini küçültmek istedi. İkisi de `.seg.mini` olduğu için yükseklikleri
ZATEN eşitti ve `min-height:44px` WT-25'in (WCAG 2.5.5) tabanı —
`test/boot.mjs`'teki statik denetim altına inilmesini engelliyor. Yapılan:
yazı 12→13,5px büyütüldü (kutu dolu görünsün), dolgu 7→6px, aralar kısıldı.
**Bu tabanı düşürmek bir erişilebilirlik kararıdır, kullanıcıya sorulmadan
yapılmaz.**

Kompaktlaştırma kalemleri (`.tile` dolgusu 13→9px, `.tiles`/`.dstat` aralığı
10→8px, `.hero` dolgusu 20→15px, `.mb-lg` 20→14px, rozet satırı 12→6px) ana
sayfaya özel DEĞİL, aynı sınıflar Kıyasla ve Aracım sayfalarında da
kullanılıyor — oralarda da kompaktlaştı, bilinçli.
**Boşken yer kaplayan iki `min-height` sıfırlandı** (`.hero .delta` 16px,
`.tile .yd` 15px): "Tümü" seçiliyken kıyas satırı zaten hep boş.
Karşılığı küçük bir yerleşim kayması — kıyas belirdiğinde satır uzuyor.

**Soru — bütçe çubuğu neydi:** Ayarlar'da aylık/yıllık bütçe girilirse ana
sayfada beliren ilerleme çubuğu (WT-45). Bütçe girilmemişse zaten görünmüyor;
"Tümü" seçiliyken de görünmüyor.

## Elle test borcu (bu faza eklenenler)

- **WT-93:** gerçek telefonda filtre şeritlerinin yazısı taşıyor mu (altı
  dilde "Tümü/Alle/Tout" + "DC/AC"), kutular hâlâ rahat basılabiliyor mu.
- **WT-92:** çok kayıtlı cihazda "Tümü" ile ana sayfanın açılış hızı.

---

# Faz 14 (10.08.2026, v41) — acil düzeltme + kullanıcı verisi teşhisi

| No | Başlık | Durum |
|---|---|---|
| WT-94 | v40'ta S varsayılanlarının 15'i yok olmuştu | ✅ ACİL |
| WT-95 | İstatistik de "Tümü" ile açılsın | ✅ |
| WT-96 | Filtre şeritleri 44 → 40px | ✅ |
| WT-97 | Bütçe girilmişken "Tümü"de sessizce kaybolmasın | ✅ |

**WT-94 — BU DEPODA ÇIKAN EN SESSİZ KUSUR.** WT-92'de `calc.js`'in `S`
tanımına satır SONUNA `// WT-92: …` yorumu yazıldı. O satır ~300 karakter
uzunluğunda ve `//` arkasındaki HER ŞEYİ yorum yapıyor: 15 varsayılan
(dashVeh, cmpVeh, vehExpVeh, vehExpGran, vehExpFltTur, vehExpFltDon,
bankCountries, **gran**, customBanks, theme, dstatType, histBadOnly,
homeKwhPrice, kwhRegion, homeKwhAuto) bir anda kayboldu ve v40 olarak
YAYINLANDI.

Görünür sonucu: `S.gran` undefined → `inPeriod(all, undefined)` son dala
düşüyor → İstatistik sayfası dönem seçicisinden bağımsız olarak HER ZAMAN
içinde bulunulan ayı gösteriyordu.

**745 kontrolün hiçbiri kızarmadı.** Sebebi yapısal: her test bloğu
dokunduğu `S` alanını kendisi atıyor (`A.S.period = …`), dolayısıyla
varsayılanın var olup olmadığını hiçbiri sınamıyordu. Yeni `WT-94` bloğu
iki değişmez kilitliyor: (1) bildirilen varsayılanların hepsi `S`'te var,
(2) `SETTING_KEYS`'teki her anahtarın bir varsayılanı var. İkincisi
`ocrOn`, `budgetM`, `budgetY`, `workKwhPrice`, `workKwhAuto`'nun zaten
eksik olduğunu ortaya çıkardı — eklendi.

**KURAL:** `calc.js`'teki `S` tanımı gibi UZUN tek satırlara satır sonu
yorumu YAZMA. Yorum ayrı satırda durur. (`watttrack-grep-app-js-tuzagi`
hatırlatması aynı kökten: bu depoda uzun satırlar araçları yanıltıyor.)

**WT-95 —** `S.gran` varsayılanı `'month'` → `'all'`, `d-gran`'da `sel`
"Tümü"ye taşındı. WT-56 "Tümü"yü İstatistik'e zaten eklemişti ama
varsayılan Ay kalmıştı; kullanıcının şikayetinin ikinci yarısı buydu.

**WT-96 — WT-25'in TEK istisnası.** `.seg.mini button` `min-height`
44 → 40px, kullanıcının açık kararı. WCAG 2.5.5 (AAA, 44px) artık
karşılanmıyor; WCAG 2.2 AA ölçütü 2.5.8 (24px) karşılanıyor.
`test/boot.mjs`'te `ISTISNA` haritası olarak yazılı ve 40'ın altına
düşmesi ayrıca kilitli. **Listeye yeni satır eklemek yeni bir ödün demek.**

**WT-97 —** "Tümü" varsayılan olunca bütçe çubuğu (WT-45) hep gizli
kalıyordu; bütçesini girmiş kullanıcı "çalışmıyor" sanardı. Artık kutu
duruyor, yüzdesi boş ve "üstten Ay ya da Yıl seç" diyor. Yeni anahtar
`budgetPickPeriod` (altı dil).

## Kullanıcının yedeğinin teşhisi (kod kusuru DEĞİL)

`watttrack-yedek-2026-08-10.json` jsdom koşumuna gerçekten yüklendi.
28 şarj, 1 araç, 2 gider, 13 ayar — **hepsi eksiksiz içeri girdi**
(ana sayfa ₺10.555 / 1.172 kWh / 28 şarj, Geçmiş 28 satır, Aracım
₺14.055, Kıyasla 6.717 km). Görünmeyen tek yer İstatistik'ti; sebebi
WT-94 + WT-95, veri değil.

**Yedekte kalıcı bir veri özelliği:** 28 kaydın 23'ünde `aracId: null`
(27 Haziran 2026'dan önce girilenler — araç sonradan eklenmiş). Şu an
zararsız: tek araç olduğu için ana sayfa/istatistik araç filtresi devre
dışı. **İkinci araç eklendiği gün** o 23 kayıt araç seçilince kaybolur.
Toplu bağlama aracı YOK — gerekirse ayrı bir iş kalemi.

## Elle test borcu

- **WT-96:** 40px'e inen filtre şeritleri gerçek telefonda rahat
  basılabiliyor mu (asıl gerekçe buydu, jsdom ölçemez).
- **WT-97:** Ayarlar'a bütçe girip ana sayfada "Tümü" → "Ay" geçişi.
