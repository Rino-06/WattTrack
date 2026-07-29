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
| `boot.mjs` (18) | Açılışta konsol hatası, WT-01 saat dilimi, WT-02 sayı biçimi, WT-03 kWh tek alan, WT-04 sınırlar, WT-05 tarih, tüm sekmelerin çizimi |
| `backup.mjs` (27) | WT-06 sıfırlama, WT-07 ayar geri yükleme, WT-08 aracId eşleme, WT-09 araç silme + toplu taşıma/geri al + öksüz kayıt |
| `overlay.mjs` (20) | WT-24 dialog semantiği, odak, Escape, geri tuşu, sekme geçmişi, kirli form onayı (düzenleme modu dahil) |
| `homework.mjs` (22) | WT-16 Ev-İş/Firma ayrımı, şema v3 migration'ı (v2 verisiyle ayrı açılış), kWh birim fiyatından tutar |
| `odo.mjs` (26) | WT-19 sırasız kayıt, iki komşu doğrulaması, silme, kmStart sınırı, mi birim dönüşümü · WT-20 atlanan kayıt ve sezgi · WT-17 sayaç modunda grafik |

**Not:** Bu, WT-51'in (birim testleri + CI) yerine geçmez — o madde saf
fonksiyonları izole test edecek ve GitHub Actions'a bağlanacak. Buradakiler
Faz 1-2 kabul kriterlerini doğrulamak için yazıldı.

Gerçek cihaz testleri (TalkBack, Lighthouse, iOS Safari) hâlâ elle yapılmalı —
`watttrack-calisma-sirasi.md` içindeki test listesine bakın.
