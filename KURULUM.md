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
