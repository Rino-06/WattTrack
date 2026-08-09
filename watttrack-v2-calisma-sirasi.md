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
| **C — İş kalemi** | 33 | **WT-55…WT-82** (28 commit) — aynı bloğa dokunanlar birleştirildi |

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
kodu açık bırak. Karar verirsen WT-82 olarak açılacak.

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

### Faz 7 — Doğrulanmış veri (kaynak gerektirir, kod değil)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-76** | EV veri tabanına **alt versiyonların** eklenmesi (Standard Range / Long Range vb.), menzil farkının açıkça belirtilmesi | Giriş 1 | Senin verdiğin veri noktası: **2025 Model Y Premium RWD Standard Range ≈ 69 kWh** — listede yalnız Long Range var, haklısın. Ama "diğer araçlarda da aynısını yap" 169 kaydın **tek tek kaynak doğrulaması** demek. Kural gereği menzil/batarya değerini hafızadan yazmayacağım. Yöntem: marka basın bülteni / EV-Database benzeri tek bir kaynak seçilir, sürüm–batarya–WLTP menzil üçlüsü oradan alınır, kayda kaynak ve tarih damgası yazılır. **Bu maddeye başlamadan önce hangi kaynağı kabul ettiğini soracağım.** |
| **WT-77** | Türkiye yakıt fiyatı geçmişinin (son 36 ay) gömülmesi | Kıyasla 2 | WT-43'ün yarım kalan ikinci aşaması. Aynı kaynak-doğrulama koşulu. |
| **WT-78** | **Gömülü elektrik tarifesi tablosu** (ülke / eyalet / il, yıllık ortalama, temel kademe) | Ayarlar 1 | ✅ **BİTTİ (09.08.2026).** Yeni dosya `evprices.js` (`index.html`, `sw.js` ASSETS+NETWORK_FIRST ve altı test koşucusunun paketine birlikte eklendi). 45 ülkenin **42'si** kapsandı; MC, AD, SM için yayımlanmış kaynak bulunamadı — uydurulmadı, boş bırakıldı. Kaynaklar: **Eurostat nrg_pc_204** (38 Avrupa ülkesi, 2025 S1+S2 ortalaması, ulusal para, tüm vergiler dahil), **DESNZ QEP 2.2.4** (GB 2025), **ElCom H4 medyanı** (CH 2026), **EIA 861/Tablo 4** (ABD 2024, ulusal + 51 eyalet), **Hydro-Québec 2024** (Kanada, 10 il — **ülke geneli ortalama YOK**, il seçilmeden varsayılan dolmuyor). Her kaydın `s` (kaynak) ve `y` (yıl) alanı var, her kaynağın adı/url'i/güncellenme tarihi künyede. Para birimleri `COUNTRIES` ile birebir doğrulandı (test bunu kontrol ediyor). **Kullanıcının girdiği fiyat ASLA ezilmiyor**: tablo yalnız alan boşken kendiliğinden dolduruyor, dolu değeri değiştirmek için "önerilen fiyatı kullan" düğmesine basmak gerekiyor. Kaynak + yıl alanın altında yazılı. Yeni ayar `kwhRegion` SETTING_KEYS'e girdi (yedekten geri yükleniyor). **Sapma:** kaynaklar aynı şeyi ölçmüyor (DESNZ sabit ücret hariç değişken birim fiyat, Hydro-Québec vergiler hariç); dosya başlığında satır satır yazılı. "Temel kademe" ayrımı YAPILMADI — Eurostat/EIA kademe değil ortalama yayımlıyor. |

### Faz 8 — Cihaz ve çözünürlük

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-79** | Tablette dikey moda zorlama | Arayüz 3 | **Kök neden doğrulandı ve düzeltildi (09.08.2026).** `manifest.json` `orientation` alanı `portrait-primary` → **`any`**. Alan SİLİNMEDİ: WT-53'ün "19 alan duruyor" kontrolü varlığını şart koşuyor. Yatay yerleşim tarafında `@media(min-width:760px)` (WT-33 grid düzeni) ve `(orientation:landscape)` kuralları yerinde. **Gerçek cihazda (tablet/Tesla) doğrulama elle test borcunda** — jsdom yönelim değiştiremiyor. |
| **WT-80** | Geniş ekranda (Tesla / PC / tablet) yerleşimin ölçeklenmesi | Arayüz 2 | Uygulama telefon genişliğine göre kurulmuş. Kırılma noktaları eklenecek; **WT-59 ve WT-79 bitmeden başlanmaz** — ikisi de yerleşimi etkiliyor. |

### Faz 9 — Kod sağlığı

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-81** | Kodun sadeleştirilmesi, hata avı | Kod 1 | **Bilerek en sona konuldu:** yukarıdaki 26 madde kodun yarısına dokunuyor, önce sadeleştirmek boşa iş olur. `/code-review` ve `/simplify` ile ölü kod, tekrar eden filtre mantığı ve `ui/*.js` arasındaki kopyalar taranacak. |
| **WT-82** | (isteğe bağlı) Lisans değişikliği | Kod 2 | §2'deki tabloya göre karar verirsen açılacak. |

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
| **Lisans kararı** | WT-82 | Hukuki tercih |

---

## 6. Elle test borcu (ilk turdan devam)

Bu turda eklenecekler: yedekten geri yükleme sonrası grafiklerin dolduğunun
gerçek cihazda doğrulanması (WT-55/57), Tesla ekranında sekme geçişleri
(WT-59), tablette yatay açılış (WT-79), açılış animasyonunun ilk açılışı
geciktirmediği (WT-67), gömülü tarifenin kendi faturandaki fiyatla
karşılaştırılması (WT-78).
