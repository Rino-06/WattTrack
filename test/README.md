# Doğrulama koşumları

Uygulamayı jsdom + fake-indexeddb içinde gerçekten **açar**, form doldurur,
kaydeder ve IndexedDB'ye yazılan değerleri kontrol eder. `node --check`
yalnızca sözdizimi bakar; buradaki koşumlar davranışa bakar.

```bash
cd test
npm install
npm test
```

| Dosya | Kapsam |
|---|---|
| `unit.mjs` (59) | Saf fonksiyonlar, jsdom'suz: WT-02 sayı kuralı, indirim/kur hesapları, WT-39 OCR ayrıştırma, WT-81/2 ay-yıl listesi, WT-81/6 tüketim birimi |
| `boot.mjs` (498) | Açılışta konsol hatası, WT-01 saat dilimi, WT-02 sayı biçimi, WT-04 sınırlar, tüm sekmelerin çizimi, WT-80 geniş ekran, WT-81/4-5-11 sözlük ve CSS taramaları, WT-81/7 kur çekmede yedek kaynak, WT-81/9 gelişmiş alan sayacı |
| `backup.mjs` (41) | WT-06 sıfırlama, WT-07 ayar geri yükleme, WT-08 aracId eşleme, WT-09 araç silme + toplu taşıma/geri al + öksüz kayıt |
| `overlay.mjs` (21) | WT-24 dialog semantiği, odak, Escape, geri tuşu, sekme geçmişi, kirli form onayı (düzenleme modu dahil) |
| `homework.mjs` (33) | WT-16 Ev-İş/Firma ayrımı, şema v3 migration'ı (v2 verisiyle ayrı açılış), kWh birim fiyatından tutar, dil değişimi regresyonu · WT-81/10 tutarın kuruş kutusu |
| `odo.mjs` (29) | WT-19 sırasız kayıt, iki komşu doğrulaması, silme, kmStart sınırı, mi birim dönüşümü · WT-20 atlanan kayıt ve sezgi · WT-17 sayaç modunda grafik |
| `stats.mjs` (13) | WT-55/56 dönem filtresi ve "bu dönemde kayıt yok" ayrımı · WT-81/6 tüketimin km/mi gösterimi |
| `kwh.mjs` (23) | WT-81/8 taze kurulumda ev elektrik fiyatı + `homeKwhAuto` köken işaretinin yedek turu · WT-83 tek seferlik onarımın DOKUNMAMASI gereken dört durumu. **Onboarding'i ATLAMAYAN tek koşum** — kusur yalnız orada görünüyordu |

**Not:** Bu, WT-51'in (birim testleri + CI) yerine geçmez — o madde saf
fonksiyonları izole test edecek ve GitHub Actions'a bağlanacak. Buradakiler
Faz 1-2 kabul kriterlerini doğrulamak için yazıldı.

Gerçek cihaz testleri (TalkBack, Lighthouse, iOS Safari) hâlâ elle yapılmalı —
`watttrack-calisma-sirasi.md` içindeki test listesine bakın.
