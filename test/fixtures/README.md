# WT-39 · OCR fixture'ları

Bu klasör **boş bırakıldı**: WT-39/BÖLÜM 9 dört gerçek ekran görüntüsü
istiyor (`astor.jpg`, `trugo.jpg`, `zes.jpg`, `esarj.jpg`). Bunlar
kullanıcının kendi şarj uygulamalarından aldığı görüntüler — uydurulamaz,
üretilemez. Dosyalar buraya konduğunda `test/ocr-fixtures.mjs` beklenen
çıktılarla karşılaştıracak.

Beklenen çıktılar (şartnamedeki tablo):

| dosya | beklenen |
|---|---|
| astor.jpg | enerji 45,82 · net 503,56 · SoC 2→90 · süre 74 dk · 2025-01-30 · "Highway Outlet DC-1" |
| trugo.jpg | enerji 49,02 · net 685,83 · SoC 16→93 · süre 49 dk · 2026-07-04 |
| zes.jpg   | enerji 4,52 · brüt 58,65 · indirim 0 · net 58,65 · SoC 12→18 · süre 6 dk · 2026-02-13 |
| esarj.jpg | enerji 22,57 · net 203,13 · bitiş SoC 80 · süre 17 dk · 2024-05-15 · CCS · 120 kW · TR-IST-190 |

**Görüntüler olmadan da doğrulanan kısım:** `test/unit.mjs` içindeki WT-39
blokları, bu dört düzenin şartnamede birebir yazılı metinlerinden sentetik
kelime kutuları üretip alan çıkarımını koşuyor — "45.820 kWh"in 45820 değil
45,82 okunduğu dahil. Eksik olan yalnız görüntü→metin adımı (Tesseract).
