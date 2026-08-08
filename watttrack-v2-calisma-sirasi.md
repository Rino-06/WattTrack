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
> Kutunun satır satır dökümünü **WT-73** sırasında koda bakarak doğrulayıp
> buraya yazacağım; şu an genel mantığı verildi.

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
| **WT-60** | "Teknik değerleri düzenle" (⚙) butonunun hiçbir şey açmaması | Giriş 2 | Fonksiyon var (`ui/vehicle.js:715`), demek ki **bağlanmamış ya da erken hata veriyor**. İstatistik 6'nın (kayıp hesabı) ön koşulu: batarya kapasitesi düzeltilemiyorsa kayıp metriği yanlış kalır. |
| **WT-61** | İkinci/üçüncü aracın eklenememesi | Aracım 4 | Araç listede bulunuyor ama kaydedilmiyor. Çok araçlı akış (araç filtresi, rozet, taşıma) bu maddeye bağlı. |
| **WT-62** | Ana sayfadaki boş "—" kutusu | Anasayfa 1 | **Kök neden bulundu.** `ui/shell.js:724-728`, `#page-dashboard .d-data` sınıfındaki **her** kutuyu görünür yapıyor; `#d-budget` (`index.html:553`) bütçe girilmediği için `butceCiz()` tarafından gizlenmişti, `syncEmptyStates()` onu geri açıyor ve varsayılan "—" görünüyor. `d-odo-wrap` için zaten istisna yazılmış (satır 726). ✅ **BİTTİ.** İkinci istisna da eklenmedi, `showScreen` de async yapılmadı (çağıranların hepsi senkron — nav düğmeleri, `init()`, `?page=` yolu, grafik çubukları; sırayı bozma riski vardı). Bunun yerine kutular kendilerini `data-own-visibility` ile işaretliyor; `syncEmptyStates` işaretli olanların görünürlüğünü ezmiyor. Bir sonraki kendi mantığı olan kutu aynı tuzağa düşmez. |
| **WT-63** | Gelişmiş ayarların "gizli" işaretliyken de açık gelmesi | Veri Girişi 1 | `S.advOpen` ayarı kaydediliyor ama form açılışında uygulanmıyor olabilir; paylaşım akışı (`app.js`) `adv-fields`'a koşulsuz `open` sınıfı ekliyor — orası da bakılacak. |
| **WT-64** | Ekran görüntüsünden otomatik okuma (OCR) çalışmıyor | Ayarlar 2 | **Önce doğrulanacak:** `vendor/ocr/` altındaki beş tesseract dosyası depoda hâlâ yok olabilir — o zaman bu bir kod hatası değil, eksik dosya. Veri giriş ekranında ayrı bir alan zaten var (`ocr-row`), ama OCR kapalıyken gizleniyor; keşfedilebilirlik ayrıca ele alınacak. |

### Faz 3 — Veri girişi ergonomisi

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-65** | Enerji, tutar ve indirim alanlarında ondalık kısmın **ayrı** kutuda girilmesi | Veri Girişi 2 | Boş bırakılırsa 0. Önceki sürümde vardı, geri getirilecek. Virgül/nokta ayrımı olan altı dil ve OCR otomatik doldurma bu alanlara yazdığı için **WT-64'ten sonra** yapılmalı. |
| **WT-66** | Tutarın zorunlu olmaması — tek zorunlu alan enerji | Veri Girişi 3 | Tutarsız kaydın toplamlara ve oran metriklerine nasıl gireceği de tanımlanacak (`isConv` mantığı). |

### Faz 4 — Açılış animasyonu

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-67** | Açılış animasyonu | Açılış 1 | Mekanizma **zaten var** (WT-37), yalnız dosyalar eksikti. Depoya koyduğun `animasyon.mp4` (112 KB) kullanılacak, `animasyon.gif` (392 KB) değil — dört kat küçük ve ilk boyamayı geciktirmez. Poster karesi üretilecek. Dosya **`sw.js` ön-belleğine konmayacak** ki ilk açılışı yavaşlatmasın; video yüklenmezse mevcut statik logo yedeği devreye girer. |

### Faz 5 — Filtre mimarisi (tek gövde, iki sayfa)

> Anasayfa 3 ve İstatistik 7 aynı işi istiyor: **sayfanın tamamını filtreleyen**
> ortak bir filtre durumu. Ayrı ayrı yapılırsa aynı altyapı iki kez yazılır.

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-68** | Ana sayfa: hafta/ay/yıl + Tümü/AC/DC tek şeritte, kutucuklar küçültülmüş | Anasayfa 3 | Şu an AC/DC seçicisi (`S.dstatType`) **yalnız detay istatistik bloğunu** filtreliyor (`ui/dashboard.js:177`); tüm sayfaya yayılacak. |
| **WT-69** | İstatistik: dönem + para birimi/kWh + AC/DC filtreleri, tüm sayfayı etkiler | İstatistik 7 + 1 | İstatistik 1 (harcama grafiğine haftalık/aylık/yıllık) bunun içinde çözülüyor — grafik zaten `S.gran`'a bağlı, eksik olan seçicinin grafiğin üstünde ve **küçük** olması. Uygulama notu: yeni filtre durumu kalıcı olmalı; `app.js` `SETTING_KEYS` listesinde `gran` var ama `period` ve `dstatType` **yok**. Aynı liste yedekten ayar geri yüklemede de kullanılıyor (WT-07) — WT-55 ile aynı alana dokunuyor. |

### Faz 6 — Yerleşim ve metin (görsel, riski düşük)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-70** | "Detay istatistikler" ve "Kilometre sayacı" başlıklarının kaldırılması; "Araç sayacı" → "Araç km sayacı" (mil seçiliyse "Araç mil sayacı") | Anasayfa 4, 5 | Birim etiketi altı dilde dinamik olmalı. |
| **WT-71** | Geçmiş'teki arama kutusunun kaldırılması | Geçmiş 1 | WT-46'da eklenmişti; filtreler kalıyor. |
| **WT-72** | İstatistik: haftanın günleri grafiğinin **silinmesi** + firma dağılımının sayfa sonuna alınması | İstatistik 2, 4 | Kullanıcı 08.08.2026'da onayladı: "haftalık grafiği sil". Grafik `ui/stats.js:96-110` + `#d-weekdays`; `weekdayDist` çeviri anahtarı da altı dilden temizlenecek. |
| **WT-73** | Kıyasla düzeltmeleri | Kıyasla 1, 3, 4, 5 | (1) yakıtlı araç sabit gideri **varsayılan kapalı**; (3) parantezli metinler alt satıra — taşma bitecek; (4) sabit gider girilmemişse "yakıt + sabit gider" kutuları gizlensin; (5) "gider dahil" → "**sabit gider dahil**" (altı dil). Kıyasla 6'nın doğrulaması da burada yapılacak. |
| **WT-74** | Aracım kart yerleşimi: model/içerik metni **üstte tam genişlik**, km–ayar–resim altında | Aracım 2 | |
| **WT-75** | Aracım sabit giderler: listenin üstünde **gider türü + ay/yıl** filtresi; **son girilen en üstte**; gider dağılımı tablosu grafiğin **altına** | Aracım 5, 6, 7 | Üçü aynı bloğa dokunuyor, tek commit. |

### Faz 7 — Doğrulanmış veri (kaynak gerektirir, kod değil)

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-76** | EV veri tabanına **alt versiyonların** eklenmesi (Standard Range / Long Range vb.), menzil farkının açıkça belirtilmesi | Giriş 1 | Senin verdiğin veri noktası: **2025 Model Y Premium RWD Standard Range ≈ 69 kWh** — listede yalnız Long Range var, haklısın. Ama "diğer araçlarda da aynısını yap" 169 kaydın **tek tek kaynak doğrulaması** demek. Kural gereği menzil/batarya değerini hafızadan yazmayacağım. Yöntem: marka basın bülteni / EV-Database benzeri tek bir kaynak seçilir, sürüm–batarya–WLTP menzil üçlüsü oradan alınır, kayda kaynak ve tarih damgası yazılır. **Bu maddeye başlamadan önce hangi kaynağı kabul ettiğini soracağım.** |
| **WT-77** | Türkiye yakıt fiyatı geçmişinin (son 36 ay) gömülmesi | Kıyasla 2 | WT-43'ün yarım kalan ikinci aşaması. Aynı kaynak-doğrulama koşulu. |
| **WT-78** | **Gömülü elektrik tarifesi tablosu** (ülke / eyalet / il, yıllık ortalama, temel kademe) | Ayarlar 1 | Kapsam ve kararlar §3'te. Kaynak adayları: **ABD** → EIA eyalet bazlı perakende mesken fiyatı (ücretsiz, API'li); **Avrupa** → Eurostat mesken elektrik fiyatı (ülke bazlı, yarıyıllık yayınlanıyor → yıllık ortalamaya indirgenecek); **TR** → EPDK mesken tarifesi (ulusal, tarife değişim tarihleriyle). 45 ülke destekleniyor (`evdata.js:12`). Veri her kayda **kaynak + tarih damgasıyla** yazılır; kullanıcı üstüne yazabilir. `homeKwhPrice` ayarı korunur, tablo yalnız varsayılanı doldurur. Ayrı `evprices.js` dosyası → `index.html`, `sw.js`, `test/boot.mjs` birlikte güncellenecek. |

### Faz 8 — Cihaz ve çözünürlük

| # | Madde | Kaynak | Not |
|---|---|---|---|
| **WT-79** | Tablette dikey moda zorlama | Arayüz 3 | **Kök neden bulundu:** `manifest.json:9` → `"orientation": "portrait-primary"`. Tesla'da bu sorunun çıkmaması muhtemelen manifest'in orada uygulanmamasından (**doğrulanmadı, varsayım**). Alan kaldırılacak ya da `"any"` yapılacak — ardından yatay yerleşimin bozulmadığı doğrulanacak (WT-80'in ön koşulu). |
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
