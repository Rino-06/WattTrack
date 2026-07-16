# WattTrack — Kurulum ve Yayınlama Rehberi

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Uygulamanın arayüzü (HTML + CSS) |
| `app.js` | Uygulama mantığı: Dexie.js veritabanı, form, istatistik, yedekleme |
| `manifest.json` | PWA kimliği ("Ana ekrana ekle" için gerekli) |
| `sw.js` | Service worker — çevrimdışı çalışmayı sağlar |
| `icon-*.png` | Uygulama ikonları |

## 1) Yerelde deneme

Dosyaları bir klasöre koy ve `index.html`'i tarayıcıda aç.
Not: Service worker yalnızca HTTPS veya localhost'ta çalışır; dosyadan açınca
uygulama yine tam çalışır ama "çevrimdışı önbellek" devreye girmez. Kurum
ağında localhost kısıtın olduğundan asıl testi GitHub Pages üzerinden yap.

## 2) GitHub Pages'e yayınlama (ücretsiz)

1. GitHub'da yeni bir repo aç: örn. `watttrack`
2. Bu klasördeki tüm dosyaları repoya yükle (Add file → Upload files)
3. Repo → Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, klasör: `/ (root)` → Save
4. 1-2 dakika sonra adresin hazır: `https://KULLANICIADIN.github.io/watttrack/`

Bu adres Tesla tarayıcısında, telefonda ve bilgisayarda aynı şekilde çalışır.

## 3) Telefona kurulum (PWA)

- **Android (Chrome):** Adresi aç → menü (⋮) → "Ana ekrana ekle" / "Uygulamayı yükle"
- **iPhone (Safari):** Adresi aç → Paylaş → "Ana Ekrana Ekle"
- **Tesla:** Tarayıcıdan adresi aç, yer imlerine ekle

## 4) Google Play'e paketleme (TWA)

1. Uygulama GitHub Pages'te yayında olmalı (adım 2)
2. https://www.pwabuilder.com adresine git, site adresini yapıştır
3. "Package for Stores" → Android → `.aab` dosyasını indir
4. PWABuilder'ın verdiği `assetlinks.json` dosyasını repoda
   `.well-known/assetlinks.json` yoluna koy (adres doğrulaması için şart)
5. Google Play Console'da geliştirici hesabı aç (tek seferlik 25$)
6. Yeni uygulama oluştur, `.aab` dosyasını yükle
7. Yeni bireysel hesaplar için kapalı test şartını unutma
   (12+ testçi, 14 gün) — testçileri EV forumlarından/çevrenden toplayabilirsin

## 5) Veri modeli (ileride .NET + PostgreSQL sürümü için referans)

```
sessions: id, tarih (ISO), tip (DC|AC|Ev), firma, kwh,
          listeTutar, indirimTip (none|pct|amt), indirimDeger,
          indirim (hesaplanmış ₺), odenen, banka, km, sehir, aracId, not
vehicles: id, ad
settings: key, value   (şimdilik: budget)
```

CSV çıktısı Türkçe Excel uyumludur (UTF-8 BOM, `;` ayraç, ondalık virgül) —
doğrudan Power BI'a da bağlanabilir.

## Sürüm notu (v10)

1. Ortadaki şimşek+artı ikonu büyütüldü (32→42 px)
2. Onboarding'de güncel km alanı araç özet kartının ÜSTÜNE alındı —
   araç seçilir seçilmez göz önünde
3. Ayarlar: araç satırına belirgin 🛣️ butonu (kilometre güncelleme) —
   araç bilgisinin sağında, 📷'nin yanında; ipucu metni güncellendi
4. Onboarding 2. adıma "← Geri" butonu (ülke adımına dönüş)

## Sürüm notu (v9)

1. PWABuilder önerileri: manifest'e file_handlers (JSON yedeği uygulamayla
   açılınca otomatik içe aktarılır), protocol_handlers, share_target
   (paylaşılan metin yeni kayıt notuna gelir), edge_side_panel, note_taking,
   related_applications, display_override genişletmesi eklendi.
   Not: IARC derecelendirmesi mağaza başvurusunda alınır (uydurulamaz);
   scope_extensions tek alan adı kullanıldığından boş.
2. Her sayfanın üstünde 🌙/☀️ hızlı tema düğmesi (senkron çalışır)
3. Ortadaki + butonu: beyaz/koyu çember + yeşil şimşek-artı logosu
   (nav-plus.png — repoya yüklemeyi unutma)
4. KİLOMETRE SAYACI: onboarding'de araç seçince güncel km sorulur;
   Ayarlar'da araca dokununca güncellenir (ilk seferde başlangıç km de
   sorulur); ana sayfada "Araç sayacı" ve "Başlangıçtan beri yapılan"
   kutuları (araç bazlı, mil destekli)
5. Uygulama ikonları büyütüldü: beyaz boşluk %14→%5 (maskable güvenli
   bölgesi korunarak %16) — ana ekranda logo artık dolgun görünür

## Sürüm notu (v8)

1. Service worker kaydı window load sarmalayıcısına alındı (en iyi pratik)
2. Erişilebilirlik: tüm select alanlarına aria-label; soluk metin renkleri
   WCAG AA kontrastına koyulaştırıldı (Lighthouse accessibility artışı)
3. "L0" ve "{u}" hataları giderildi: harf sembollü para birimleri
   (ALL=Arnavutluk Leki, kr, Ft…) artık "1.250 L" biçiminde; kıyas
   etiketlerindeki {u} yer tutucusu birimle dolduruluyor
4. PWABuilder için manifest zenginleştirildi: id, scope, display_override,
   categories, screenshots (dar+geniş), shortcuts (Yeni Kayıt / Geçmiş),
   launch_handler — kısayol URL'leri uygulama içinde işleniyor
5. KOYU MOD: Ayarlar → Görünüm (Açık/Koyu); sarj_app paletiyle
   (#0f172a zemin, #1e293b kart, #16a34a yeşil, #3b82f6 mavi)
6. Alt menü ikonları emoji oldu (📊 📋 🆚 ⚙️), seçili sekme renklenir
7. screenshot-narrow.png ve screenshot-wide.png dosyaları eklendi
   (manifest ekran görüntüleri — repoya yüklemeyi unutma)

## Sürüm notu (v7)

1. Araç ARŞİVİ: kayıtları olan araç silinince artık kayıtlar kaybolmuyor —
   araç arşive taşınır (satılan/kazalı araçlar için), geçmişi ve
   istatistikleri korunur, "Geri al" ile döner; kaydı olmayan araç
   gerçekten silinir
2. Kıyasla: "Bugüne kadar" kümülatif özet (toplam mesafe, EV toplam,
   yakıtlıyla olurdu, toplam kazanç) + EV vs yakıtlı KÜMÜLATİF ÇİZGİ GRAFİK
3. Ana sayfa: haftalık harcama bölümü kaldırıldı; tek harcama grafiği
   kendi Hafta(günlük)/Ay/Yıl filtresiyle
4. JSON geri yükleme akıllandı: tümü mükerrerse uyarır ve eklemez;
   kısmen mükerrerse yalnız yenileri ekler ve sayıları bildirir
5. Özel banka ekleme: formdaki banka listesine "+ Yeni banka" ile kendi
   bankanı ekleyebilirsin, listede kalıcı olur
6. Geçmiş filtreleri kısaldı: kapalıyken "Banka"/"Lokasyon" yazar,
   açınca "Tümü" en üsttedir
7. Araç satırında belirgin 📷 butonu (fotoğraf ekle/değiştir)
8. Görsel tazeleme: hero'da yeşil gradyan, bar grafiklerde gradyan +
   animasyon, DC (#16A34A yeşil) / AC (#1B5FAA mavi) / Ev (açık yeşil)
   ayrışık tonlar — palet yeşil/mavi kaldı

## Sürüm notu (v6 — yayın sürümü)

1. Örnek veri sistemi tamamen kaldırıldı — uygulama yayına hazır, temiz açılır
2. İNDİRİM MATEMATİĞİ DÜZELTİLDİ: girilen tutar indirim ÖNCESİ tutardır;
   yüzde/tutar indirim bundan düşülür, formda "Ödenen (net)" canlı hesaplanır
3. KUR HATASI DÜZELTİLDİ (çift yönlü dönüşüm): her kayıt kendi para birimini
   korur ve kaydedildiği günün ECB kur TABLOSUNU saklar; temel para birimi
   değişince kayıtlar kendi günün kuruyla doğru çevrilir. Tablo yoksa
   (çevrimdışı kayıt) kayıt yanlış 1:1 çevrilmek yerine toplam dışında
   tutulur ve çevrimiçi olununca arka planda otomatik tamamlanır
4. Ana sayfa: logo + iki sütunlu özet (net | indirimsiz, ikisi de büyük),
   önceki döneme göre ▲/▼ % değişim
5. Banka Ülkelerim: bankaların şarj edilen ülkeden bağımsız; ayarlardan bir
   veya birden çok banka ülkesi seçilir, formdaki liste bunların birleşimi
6. GPS artık isim getiriyor: mahalle/semt adı (OpenStreetMap) + 1 km
   içindeki şarj istasyonları çip olarak önerilir (Open Charge Map)
7. Yeni ana sayfa bölümleri: DC/AC/Ev kWh donut grafiği, ort. şarj süresi,
   ort. şarj aralığı, en çok kazandıran bankalar, en çok şarj edilen
   lokasyonlar; aylık bara dokununca o yılın geçmişi açılır
8. Geçmiş'e banka ve lokasyon filtreleri eklendi
9. Uygulama ikonları ve ana sayfa logosu senin WattTrack logondan üretildi

## Sürüm notu (v5)

1. Kompakt onboarding: ülke/para/birim/dil tek ekranda açılır listelerle
2. EV veritabanı ~140 sürüme çıktı (KGM Torres EVX 73.4 & 80.6, Korando
   e-Motion, Musso EV; 2025+ Tesla Standard/Premium/Performance serisi;
   Inster, EV4/EV5, Elroq, ID.Buzz, Grande Panda, Xpeng, Leapmotor vb.)
   — teknik değerler Oca 2026 üretici verilerinden derlendi (yaklaşıktır)
3. Araca kendi fotoğrafını ekleme (galeri/kamera → cihazda saklanır);
   ayarlarda araca dokunarak da eklenir/değiştirilir
4. Net (ödenen) ve indirimsiz (liste) istatistikler ayrı ayrı: toplamlar,
   kWh başı, 100 km — ana sayfada ve Kıyasla'da
5. Ana sayfa / Geçmiş / Kıyasla ekranlarına araç filtresi (2+ araçta)
6. Form: ülke bazlı firma listesi (16 TR + 20+ ülke; en çok kullandıkların
   üstte), bölünmüş kWh girişi (tam,ondalık), virgüllü tutar, banka
   Gelişmiş'e taşındı ve ülkeye göre listeleniyor, saat+dakika süre,
   rakamla SoC aralığı, lokasyon önerileri + GPS (📍) butonu
7. Yurt dışı kayıt: ülke seçilince o günün ECB kuru otomatik çekilir
   (frankfurter API — yalnız para birimi kodları gider), bulunamazsa elle
   girilir; istatistikler temel para birimine çevrilerek hesaplanır
8. Güvenlik: CSP başlığı, CSV formül-enjeksiyon koruması, tüm kullanıcı
   girdilerinde HTML kaçışı (XSS koruması)

## Sürüm notu (v4 — büyük özellik sürümü)

1. İlk açılış sihirbazı: ülke (Avrupa + ABD + Kanada, aranabilir bayraklı liste),
   para birimi ve km/mil seçimi — dil otomatik önerilir
2. Araç seçimi: ~100 EV sürümü içeren gömülü veritabanı; yıl, donanım ve
   batarya kapasitesine göre ayırt etme; seçimde silüet + batarya / mimari
   (400V-800V) / maks DC-AC / menzil özet kartı
3. Tüm istatistikler ana sayfada (İstatistik sekmesi kaldırıldı):
   Hafta/Ay/Yıl dönem seçici, kWh başı ort., 100 km/mi maliyet, enerji,
   şarj/firma, alınan indirim, ücretsiz şarj sayısı, haftalık + aylık
   grafikler, firma dağılımı, son şarjlar
4. Alt menüde ortada büyük + butonu; yeni form: bugünün tarihi hazır,
   ülke kaydı başına değiştirilebilir (seyahat), AC/DC, ev/firma, kWh,
   sürülen mesafe, tutar, %/tutar indirim, ÜCRETSİZ ŞARJ anahtarı;
   Gelişmiş bölümü: süre, lokasyon, %20→80 şarj aralığı kaydırıcısı
   (Ayarlar'dan "hep açık" yapılabilir)
5. Geçmiş: yıl + firma + tip (DC/AC/Ücretsiz) filtreleri; kayıtlara
   dokununca DÜZENLEME açılır (sadece silme değil)
6. Kıyasla: Benzin/Dizel/Hibrit/LPG aracıyla karşılaştırma — yakıt fiyatı
   ve lt/100km tüketim girilir; km başına ve 100 birimde kazanç + aylara
   göre kazanç grafiği
7. Ayarlar: ülke/para birimi/birim/dil (TR, EN, DE, FR, ES, IT tam çeviri;
   diğer ülkeler İngilizce'ye düşer), çoklu araç + yıldızla varsayılan seçimi

## Sürüm notu (v3)

- Dexie.js artık uygulamayla birlikte geliyor (dexie.min.js) — internet ve
  CDN erişimi olmadan, kısıtlı kurum ağlarında bile çalışır
- İlk açılışta prototipteki gibi örnek veriler yüklenir; ana sayfadaki
  "Temizle" ile tek dokunuşta silinir
- Tüm metinler HTML'de gömülü — JS yüklenemese bile arayüz boş kalmaz
- Masaüstü/geniş ekranda prototipteki gibi bej zemin üzerinde telefon
  çerçevesi görünümü; telefonda tam ekran
- Playwright ile ekran görüntüsü testinden geçirildi

## Sürüm notu (v2 — Claude Design prototipine göre yeniden tasarım)

- Arayüz: açık yeşil tema, beyaz kartlar, firma baş harfli renkli avatarlar,
  5 sekme (Ana Sayfa / Geçmiş / İstatistik / Kıyasla / Ayarlar) + yüzen "+" butonu
- Ana sayfa: "Bu ay toplam" hero kartı + tasarruf rozeti, kWh başı ort.,
  haftalık harcama barları, son şarjlar
- Kayıt formu: ödenen tutar + indirim (tutar/yüzde) → tasarruf otomatik,
  hızlı firma ve %0/10/20 çipleri, SoC öncesi/sonrası, DC/AC/Ev,
  "Detay ekle" altında km / şehir / araç / not
- Geçmiş: ay bazlı gruplama, tek dokunuşla silme
- Kıyasla: firma bazlı toplam, şarj sayısı, ₺/kWh ve oran çubuğu
- Ayarlar: Türkçe/İngilizce dil, ₺/$/€ para birimi, araç yönetimi,
  JSON + CSV dışa aktarma, JSON geri yükleme, sıfırlama
- Chart.js kaldırıldı (grafikler saf CSS/div) → daha hafif, araç
  tarayıcılarında daha hızlı; tek harici bağımlılık Dexie.js
- Tam çevrimdışı çalışma (service worker, cache v2)
