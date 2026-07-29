# WattTrack — Çalışma Sırası ve Test Listesi

Prompt metinleri `watttrack-promptlar.md` dosyasında. Bu dosya sadece sıra ve doğrulama içindir.

---

## Claude Code'a verilecek başlangıç promptu

```
watttrack-promptlar.md dosyasını oku. Bu, projenin iyileştirme listesi.
Şu kurallara uy:

1. Maddeleri BEN söylediğim sırayla uygula, kendi sıranı kurma.
2. Her madde için AYRI commit at. Commit mesajı formatı:
   "WT-XX: kısa açıklama"
3. Bir maddeye başlamadan önce ilgili kodu oku ve maddedeki tespitin
   hâlâ geçerli olduğunu doğrula. Geçerli değilse bana söyle, körü körüne uygulama.
4. Her maddenin sonundaki "Kabul kriteri" satırını karşıla.
   Karşılayamıyorsan neden karşılayamadığını yaz.
5. Bir madde başka bir maddenin ön koşuluysa ve o henüz yapılmadıysa
   dur ve bana bildir.
6. Türkçe çeviri anahtarı eklerken 6 dilin (tr, en, de, fr, es, it)
   HEPSİNİ doldur. Boş bırakma.
7. Şema değişikliklerinde Dexie version numarasını artır ve upgrade
   fonksiyonu yaz. Mevcut kullanıcı verisi bozulmasın.
8. Değişiklik yaptığın her yerde APP_VERSION ve sw.js CACHE adını bump et
   (WT-52 yapıldıktan sonra tek yerden).

İlk olarak WT-01'i uygula.
```

---

## Faz 1A — Temel (önce bunlar, sırayla)

| # | Madde | Neden burada |
|---|---|---|
| 1 | **WT-52** Sürüm tek kaynak | En başta yapılırsa sonraki 53 maddede sürüm bump'ı otomatikleşir |
| 2 | **WT-01** Saat dilimi | Her tarih hesabının altında; sonraki maddeler bunun üstüne kurulacak |
| 3 | **WT-02** Sayı biçimi kuralı | WT-03, WT-04, WT-39, WT-48 hepsi bu fonksiyonları kullanacak |
| 4 | **WT-03** kWh tek alan | WT-02 bitmeden yapılamaz |
| 5 | **WT-04** Sayısal sınırlar | WT-02'nin üstüne kurulur; bozuk veri temizliği burada başlıyor |
| 6 | **WT-05** Tarih zorunlu | Küçük ama WT-19'un ön koşulu |

> **Commit kontrolü:** Bu altı madde bitince mevcut verinle uygulamayı aç ve tüm sayıların doğru göründüğünü doğrula. WT-02 tüm gösterimi değiştirdiği için burada bir regresyon riski var.

## Faz 1B — Veri bütünlüğü

| # | Madde | Neden burada |
|---|---|---|
| 7 | **WT-06** Sıfırlama giderleri silmiyor | Tek satırlık düzeltme, hemen çık |
| 8 | **WT-08** Yedek aracId eşleme | WT-07'den önce — id haritası WT-07'de kullanılacak |
| 9 | **WT-07** Yedek ayarlar | WT-08'in idMap'ini kullanıyor |
| 10 | **WT-09** Araç silme + öksüz kayıt | WT-08 ile aynı id mantığını paylaşıyor, birlikte düşün |
| 11 | **WT-10** Kur uyarısı | |
| 12 | **WT-11** SW cross-origin cache | |
| 13 | **WT-12** Hata yakalama + kota | |

> **Commit kontrolü:** Yedek al → verileri sıfırla → geri yükle döngüsünü baştan sona test et. Bu dördü (WT-06/07/08/09) birbirine bağlı, tek tek değil topluca doğrula.

## Faz 2 — Play Store engelleyicileri (araya sıkıştır)

| # | Madde | Neden burada |
|---|---|---|
| 14 | **WT-24** Overlay + geri tuşu | Mağazaya çıkmadan önce çözülmesi şart olan tek şey |
| 15 | **WT-21** Form etiketleri | En kritik a11y bulgusu |
| 16 | **WT-26** Alt menü kontrastı | 2,24:1 — Lighthouse'un ilk yakalayacağı şey |

> Bu üçü FAZ 3'ün geri kalanından ayrıldı çünkü mağaza incelemesi ve ilk kullanıcı yorumları bu üçüne takılır.

## Faz 3 — Anlamsal bütünlük

| # | Madde | Not |
|---|---|---|
| 17 | **WT-13** kWh başı pay/payda | |
| 18 | **WT-14** Ana sayfa dönem kapsamı | |
| 19 | **WT-15** İstatistik dönem kapsamı | |
| 20 | **WT-18** Gider araç zorunluluğu | WT-09'un migration mantığını kullanır |
| 21 | **WT-16** Ev-İş + kWh fiyatı | Şema değişikliği + migration, dikkatli ol |
| 22 | **WT-19** Mesafe/odometre | **En zor madde.** Tek başına bir güne ayır |
| 23 | **WT-20** Atlanan kayıt | WT-19 bitmeden başlama |
| 24 | **WT-17** Kıyas grafiği | WT-19'dan sonra anlamlı |

## Faz 4 — Erişilebilirlik (kalan)

| # | Madde |
|---|---|
| 25 | **WT-22** aria i18n + c-icefix-lbl |
| 26 | **WT-23** Başlık hiyerarşisi |
| 27 | **WT-25** Dokunma hedefleri |
| 28 | **WT-27** Odak göstergesi |
| 29 | **WT-28** Segment aria |
| 30 | **WT-29** Toast/hata duyurma |
| 31 | **WT-30** Grafik alternatif metni |
| 32 | **WT-31** Font + koyu tema kontrast |

> **Commit kontrolü:** Lighthouse Accessibility skorunu ölç, TalkBack ile bir kayıt gir.

## Faz 5 — Tasarım

| # | Madde | Not |
|---|---|---|
| 33 | **WT-32** Ana sayfa sadeleştirme | Ekranı %35 kısaltıyor; WT-31'e yer açıyor |
| 34 | **WT-38** Araç kartı kompaktlaştırma | |
| 35 | **WT-33** Masaüstü grid | WT-32'den sonra, düzen değişti |
| 36 | **WT-34** Renk semantiği | |
| 37 | **WT-35** Yakıt dışı gider bloğu | |
| 38 | **WT-36** Boş durum + örnek veri | |
| 39 | **WT-37** Video splash | Video dosyası hazır olduğunda |

## Faz 6 — Refactor (özelliklerden ÖNCE)

| # | Madde | Neden burada |
|---|---|---|
| 40 | **WT-50** Dosya bölme | 10 yeni özelliği 2400 satırlık tek dosyaya eklemek çok daha pahalı |
| 41 | **WT-49** Performans | |
| 42 | **WT-51** Birim testleri | WT-39'un OCR testleri buraya oturacak |

## Faz 7 — Özellikler (değer sırasına göre)

| # | Madde | Not |
|---|---|---|
| 43 | **WT-40** EV_DB + menzil + düzeltme | WT-41 ve WT-42'nin ön koşulu |
| 44 | **WT-39** OCR | **Tek başına 2-3 gün.** İzole bir dal (branch) aç, ayrı test et |
| 45 | **WT-41** kWh/100km | WT-19, WT-20, WT-40 bitmiş olmalı |
| 46 | **WT-42** Şarj kaybı | WT-04, WT-40 bitmiş olmalı |
| 47 | **WT-43** Yakıt fiyatı geçmişi | |
| 48 | **WT-44** Bakım hatırlatmaları | WT-19'un sayaç mantığını kullanıyor |
| 49 | **WT-45** Bütçe | |
| 50 | **WT-46** Geçmiş arama/özet | WT-39 bitmişse ataç ikonu da eklenir |
| 51 | **WT-47** Otomatik doldurma | |
| 52 | **WT-48** CSV içe aktarma | |

## Faz 8 — Temizlik

| # | Madde |
|---|---|
| 53 | **WT-53** manifest sadeleştirme |
| 54 | **WT-54** OpenChargeMap doğrulama |

---

## Bağımlılık haritası

Bir maddeye başlamadan önce ön koşulunun bittiğinden emin ol:

```
WT-02 (sayı)      →  WT-03, WT-04, WT-39, WT-48
WT-04 (sınırlar)  →  WT-42
WT-05 (tarih)     →  WT-19
WT-08 (idMap)     →  WT-07, WT-09
WT-09 (araç sil)  →  WT-18
WT-19 (odometre)  →  WT-17, WT-20, WT-41, WT-44
WT-20 (atlanan)   →  WT-41
WT-40 (EV_DB)     →  WT-41, WT-42
WT-39 (OCR)       →  WT-46 (ataç ikonu), WT-53 (share_target)
WT-52 (sürüm)     →  hepsi (sürüm bump'ı)
WT-50 (bölme)     →  FAZ 7'nin tamamı (önce yapılmazsa çok pahalı)
```

---

# TEST LİSTESİ

## Her commit sonrası (30 saniye)
- [ ] Uygulama açılıyor mu, konsolda hata var mı?
- [ ] Mevcut kayıtlar hâlâ görünüyor mu?
- [ ] Yeni kayıt eklenip silinebiliyor mu?

## Faz 1A sonu — sayı ve tarih
- [ ] Sistem saatini 01:00 yap → form BUGÜNÜN tarihini öneriyor mu?
- [ ] Ayın 1'inde saat 02:00 → "Bu ay" doğru ayı gösteriyor mu?
- [ ] Tutar alanına `1234.5` yaz, alandan çık → `1.234,50` görünüyor mu?
- [ ] `43,57` ve `43.57` aynı değeri mi üretiyor?
- [ ] `1.234,56` → 1234,56 mı, `1,234.56` → 1234,56 mı?
- [ ] kWh alanına `45,5` yaz → kayıtta 45,5 mi (45,05 değil)?
- [ ] SoC alanına `800` yaz → reddediliyor mu?
- [ ] Süre alanına `999` saat yaz → reddediliyor mu?
- [ ] Tarihi elle sil → Kaydet → hata çıkıyor mu?
- [ ] Açılışta bozuk SoC uyarısı çıkıyor mu (varsa)?

## Faz 1B sonu — veri bütünlüğü
- [ ] Gider ekle → Verileri Sıfırla → gider gitmiş mi?
- [ ] Dili İngilizce + para birimi EUR yap → yedek al → sıfırla → geri yükle → dil ve para birimi geri geldi mi?
- [ ] İki araçlı yedek al → cihazda bir araç varken geri yükle → kayıtlar doğru araçlara mı bağlandı?
- [ ] Kayıtlı araç sil → üç seçenek çıkıyor mu?
- [ ] "Kayıtları da sil" → kayıtlar VE giderler gitti mi?
- [ ] İki araç arasında toplu kayıt taşıma çalışıyor mu? "Geri al" işe yarıyor mu?
- [ ] Öksüz kayıt oluştur (elle DB'de aracId boz) → açılışta uyarı kartı çıkıyor mu?
- [ ] RSD'li kayıt oluştur → para birimini EUR yap → uyarı şeridi görünüyor mu?
- [ ] Uygulamayı aç, kapat, ertesi gün aç → kur güncel mi (donmuş değil)?
- [ ] Uçak modunda kayıt → "Cihaza kaydedildi" mesajı çıkıyor mu?

## Faz 2 sonu — mağaza engelleyicileri
- [ ] Android'de "Yeni Kayıt" açıkken geri tuşu → uygulama kapanmıyor, form kapanıyor mu?
- [ ] Gider, ülke seçimi ve araç ekleme overlay'lerinde de aynı davranış var mı?
- [ ] Escape tuşu overlay'i kapatıyor mu?
- [ ] Form doluyken kapatmaya çalış → onay soruyor mu?
- [ ] TalkBack/VoiceOver aç → kayıt formundaki her alan adıyla okunuyor mu?
- [ ] Alt menü etiketleri okunabilir mi (gri-üstü-gri değil)?

## Faz 3 sonu — anlamsal bütünlük
- [ ] Kur bilgisi olmayan kayıt ekle → kWh başı fiyat değişmedi mi?
- [ ] Ana sayfada "Hafta" seç → detay istatistikler ve 1 km de değişiyor mu?
- [ ] Değişmeyenler "tüm zamanlar" rozeti taşıyor mu?
- [ ] İstatistikte "Hafta" seç → firma dağılımı ve donut da daraldı mı?
- [ ] Tek araçla gider ekle → kayıtta aracId dolu mu?
- [ ] AC seç → firma otomatik "Ev-İş" geliyor mu?
- [ ] Ev-İş + 40 kWh + 2,80 birim fiyat → tutar 112,00 doldu mu?
- [ ] Tutarın üzerine 100 yaz → 100 kaydedildi mi?
- [ ] DC seç → kWh fiyatı alanı kayboldu mu?
- [ ] İki donut da doğru mu (AC/DC ayrı, Ev-İş/Firma ayrı)?
- [ ] Sırasız kayıt gir: önce 1 Nisan odo 13100, sonra 14 Mart odo 12400 → 1 Nisan mesafesi 700 mü?
- [ ] 14 Mart için odo 13500 gir → hata çıkıyor mu?
- [ ] Sadece mesafe girilmiş eski kayıtlar bozulmadı mı?
- [ ] "Atlanan" işaretli kayıt → kWh/100km ortalamasına girmiyor ama harcamaya giriyor mu?

## Faz 4 sonu — erişilebilirlik
- [ ] Lighthouse → Accessibility skoru kaç? (hedef ≥ 95)
- [ ] Lighthouse → "Tap targets are sized appropriately" geçiyor mu?
- [ ] Dili İngilizce yap → sayılar dışında Türkçe metin kaldı mı?
- [ ] Kıyasla sayfasındaki "yakıtlı aracın yıllık sabit gideri" etiketi çevrildi mi?
- [ ] Klavye ile Tab'la gez → her odaklanan öğede görünür çerçeve var mı?
- [ ] Koyu temada Kaydet butonu okunuyor mu? Kırmızı/mavi değerler okunuyor mu?
- [ ] Input çerçeveleri görünüyor mu?
- [ ] Ekran okuyucu "Kaydedildi" toast'ını duyuruyor mu?
- [ ] Segment kontrollerinde hangi seçeneğin seçili olduğu okunuyor mu?

## Faz 5 sonu — tasarım
- [ ] Ana sayfada 100 km kutuları gitti mi? 1 km kutuları duruyor mu?
- [ ] "Yıllık karşılaştırma" bölümü tamamen kalktı mı?
- [ ] "Son şarjlar" kalktı mı ama Geçmiş sekmesi hâlâ çalışıyor mu?
- [ ] "Ort. şarj aralığı" yanında "ort. eklenen +%X" görünüyor mu?
- [ ] Araç kartı ~110px yüksekliğinde mi (eskiden ~280px)?
- [ ] Araç silüeti eski çizimle aynı mı (sadece küçük)?
- [ ] Masaüstünde (1280px) kart sırası mantıklı mı?
- [ ] "Ücretsiz şarj" yeşil oldu mu?
- [ ] Örnek veri ekle → kalıcı şerit çıkıyor mu?
- [ ] "Örnek verileri sil" → sadece demo kayıtlar mı gitti?
- [ ] Örnek veri varken yedek al → demo kayıtlar yedeğe girmedi mi?
- [ ] Video splash: iOS Safari'de otomatik oynuyor mu?
- [ ] Video splash: Android Chrome'da otomatik oynuyor mu?
- [ ] `splash.mp4` dosyasını sil → uygulama yine açılıyor mu (statik logo)?
- [ ] Uçak modunda ilk açılışta video oynuyor mu (SW cache)?
- [ ] prefers-reduced-motion aç → video oynamıyor mu?
- [ ] İkinci açılışta splash atlanıyor mu?

## Faz 6 sonu — refactor
- [ ] Tüm sekmeler hâlâ çalışıyor mu (dosya bölme regresyonu)?
- [ ] `i18n-dictionary.js` silindi mi? sw.js ASSETS listesi güncel mi?
- [ ] Sekme geçişleri hızlandı mı?
- [ ] Birim testleri geçiyor mu? CI yeşil mi?

## WT-39 (OCR) — ayrı ve detaylı test

**Dört fixture görüntüsü:**

| Dosya | Beklenen enerji | Beklenen net | Beklenen SoC | Beklenen tarih |
|---|---|---|---|---|
| astor.jpg | **45,82** kWh | 503,56 | %2 → %90 | 30.01.2025 |
| trugo.jpg | **49,02** kWh | 685,83 | %16 → %93 | 04.07.2026 |
| zes.jpg | **4,52** kWh | 58,65 (brüt 58,65, indirim 0) | %12 → %18 | 13.02.2026 |
| esarj.jpg | **22,57** kWh | 203,13 | — → %80 | 15.05.2024 |

- [ ] Dört görüntünün her birinde **enerji** doğru mu?
- [ ] `45.820` → **45,82** mi (45820 değil)? ← en kritik kontrol
- [ ] `49.023` → **49,02** mi?
- [ ] Dört görüntünün her birinde **net tutar** doğru mu?
- [ ] Dört görüntünün her birinde **tarih** doğru mu (üç farklı format)?
- [ ] Süre doğru mu? (`1 saat 13 dakika 33 saniye` → 74 dk)
- [ ] ZES'te brüt/indirim/net üçlüsü ayrı ayrı doldu mu?
- [ ] Eşarj'da başlangıç SoC BOŞ kaldı mı (uydurulmadı mı)?
- [ ] Eşarj'da soket CCS ve güç 120 kW okundu mu?
- [ ] Otomatik doldurulan alanlar sarı işaretli mi?
- [ ] "Otomatik okundu — kontrol et" şeridi görünüyor mu?
- [ ] Bir alana dokununca sarı işaret kalkıyor mu?
- [ ] Düşük güvenli alan kırmızı işaretleniyor mu?
- [ ] Kullanıcı onaylamadan kayıt OLUŞMUYOR mu?
- [ ] Ekran görüntüsü kayda eklendi mi? Geçmiş'te açılıyor mu?
- [ ] iPhone'dan dikey çekilmiş görüntü doğru yönde mi (EXIF)?
- [ ] **Çevrimdışı test:** OCR verisi indirildikten sonra uçak moduna al → hâlâ çalışıyor mu?
- [ ] Ayarlar'dan OCR'ı kapat → indirilen veri temizlenebiliyor mu?
- [ ] Bulanık/eğri bir görüntü ver → uygulama çökmüyor, "okunamadı" diyor mu?
- [ ] Şarj uygulamasından "Paylaş → WattTrack" çalışıyor mu (share_target)?

**Not:** OCR maddesi ayrı bir dalda geliştirilmeli. Kabul kriteri karşılanmazsa ana dala birleştirmeden değerlendirilebilir.

## Faz 7 sonu — özellikler
- [ ] Araç ara → "84 kWh · 622 km menzil" görünüyor mu (400V değil)?
- [ ] Batarya değerini elle 75 yap → kaydedildi mi? Şarj kaybı hesabı yeni değeri mi kullanıyor?
- [ ] Ortalama tüketim kutusu doğru mu (elle hesapla, karşılaştır)?
- [ ] Şarj kaybı: SoC dolu bir kayıtta beklenen/faturalanan farkı mantıklı mı?
- [ ] SoC'si boş kayıtta kayıp hesabı gösterilmiyor mu?
- [ ] 2024 ve 2026 tarihli iki kayıt + iki farklı yakıt fiyatı → her kayıt kendi dönemindeki fiyatla mı kıyaslanıyor?
- [ ] Birimi `mi` yap → "Consumption (MPG)" görünüyor mu?
- [ ] 30 MPG gir → dahili 7,84 lt/100km mi kullanılıyor?
- [ ] İleri tarihli muayene hatırlatması gir → "Yaklaşanlar" kartında geri sayım var mı?
- [ ] Km bazlı hatırlatma (10.000 km sonra) doğru sayıyor mu?
- [ ] Geçmiş: arama kutusu not ve lokasyonda arıyor mu?
- [ ] Geçmiş: filtre özeti şeridi doğru toplam gösteriyor mu?
- [ ] Silme sonrası "Geri al" çalışıyor mu?
- [ ] CSV dışa aktar → düzenle → geri yükle → veri doğru mu?

## Yayın öncesi son kontrol
- [ ] Gerçek cihazda (Android + iOS) tam bir kullanım turu
- [ ] Uçak modunda: aç, kayıt gir, sekme gez, kapat, tekrar aç
- [ ] Yedek al → yeni cihaza kur → geri yükle → her şey yerinde mi?
- [ ] Lighthouse: Performance / Accessibility / Best Practices / SEO / PWA
- [ ] 6 dilin her birinde ana sayfa, kayıt formu ve ayarlar ekranını gözden geçir
- [ ] Açık ve koyu temada tüm sayfaları gözden geçir
- [ ] Küçük ekranda (360px) ve tablette (768px) yerleşim bozulmuyor mu?
- [ ] APP_VERSION, sw.js CACHE ve manifest sürümü tutarlı mı?
