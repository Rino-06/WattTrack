/* ============================================================
   WattTrack — sürüm bilgisinin TEK kaynağı (WT-52)
   Hem sayfa (index.html <script>) hem de service worker
   (importScripts) tarafından yüklenir; bu yüzden klasik script,
   modül DEĞİL. Sürüm değişikliğinde SADECE bu dosya düzenlenir.
   ============================================================ */
var WT_VERSION = 'v32';          // uygulama sürümü (Ayarlar'da görünür)
var WT_DATE    = '08.08.2026';   // sürüm tarihi
var WT_SCHEMA  = 8;              // yedek dosyası şema sürümü (uygulamadan bağımsız)
var WT_CACHE   = 'watttrack-' + WT_VERSION;  // service worker önbellek adı
