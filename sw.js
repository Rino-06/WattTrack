/* WattTrack service worker — çevrimdışı çalışma */
importScripts('./version.js');   // WT-52: sürüm tek kaynaktan
const CACHE = WT_CACHE;
// WT-53: paylaşılan ekran görüntüsünün bırakıldığı kutu. Sürüm adından
// BAĞIMSIZ — activate temizliği bunu silmemeli (aşağıda muaf tutuluyor).
const SHARE_CACHE = 'watttrack-share';
const SHARE_URL = './__paylasilan__';
const ASSETS = [
  './',
  './index.html',
  './version.js',
  './db.js',
  './calc.js',
  './i18n.js',
  './ocr.js',
  './ui/shell.js',
  './ui/dashboard.js',
  './ui/stats.js',
  './ui/history.js',
  './ui/compare.js',
  './ui/vehicle.js',
  './ui/forms.js',
  './ui/settings.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './dexie.min.js',
  './evdata.js',
  './evprices.js',
  './logo.png',
  './nav-plus.png',
  './privacy.html'
];
// WT-37/6: açılış videosu ve poster'ı. AYRI listede çünkü addAll() tek dosya
// eksikse TÜM kurulumu reddediyor — video repoya konmadan önce bu, service
// worker'ın hiç kurulmaması ve çevrimdışı çalışmanın tamamen bozulması
// demek olurdu. Bunlar tek tek, hata yutularak önbelleğe alınıyor.
// Video 1,2 MB'ı aşarsa bu listeden ÇIKAR: ilk açılış maliyetine doğrudan
// ekleniyor, statik logo yedeği zaten var.
const OPTIONAL_ASSETS = ['./splash.mp4', './splash.webm', './splash-poster.png'];

// WT-11: uygulamanın kendi kabuğu network-first olmalı. Cache-first olduğu
// sürece yeni sürüm ancak SW değişince geliyordu. Görseller ve dexie.min.js
// değişmediği için cache-first kalabilir.
// WT-50: uygulama kodu artık 12 dosya; hepsi network-first olmalı ki
// yeni sürüm service worker değişmeden de gelsin.
const NETWORK_FIRST = ['./', './index.html', './evdata.js', './evprices.js', './version.js',
                       './manifest.json', './db.js', './calc.js', './i18n.js', './ocr.js', './ui/shell.js', './ui/dashboard.js', './ui/stats.js', './ui/history.js', './ui/compare.js', './ui/vehicle.js', './ui/forms.js', './ui/settings.js', './app.js'];
const NET_TIMEOUT = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS)
      .then(() => Promise.all(OPTIONAL_ASSETS.map(u => c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      // WT-53: paylaşım kutusu sürümden bağımsız — silinirse güncelleme
      // sırasında paylaşılan ekran görüntüsü kaybolur.
      Promise.all(keys.filter(k => k !== CACHE && k !== SHARE_CACHE)
        .map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const isNetworkFirst = url =>
  NETWORK_FIRST.some(p => {
    const abs = new URL(p, self.registration.scope).href;
    return url.href === abs;
  });

// Ağ yanıt vermezse NET_TIMEOUT sonunda cache'e düş
function networkFirst(req) {
  return new Promise(resolve => {
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      caches.match(req).then(hit => resolve(hit || caches.match('./index.html')));
    };
    const timer = setTimeout(fallback, NET_TIMEOUT);
    fetch(req).then(res => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      caches.open(CACHE).then(c => c.put(req, res.clone()));
      resolve(res);
    }).catch(() => { clearTimeout(timer); fallback(); });
  });
}

function cacheFirst(req) {
  return caches.match(req).then(hit =>
    hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match('./index.html'))
  );
}

// WT-53: share_target artık POST + multipart — kullanıcı şarj uygulamasından
// ekran görüntüsünü doğrudan WattTrack'e paylaşabiliyor (WT-39 ile bağlanıyor).
// Paylaşım POST'u sayfaya ULAŞMADAN burada yakalanmak zorunda: navigasyon
// POST'unun gövdesini sayfa okuyamaz. Dosya Cache API'ye bırakılıp sayfa
// GET ile açılıyor, açılışta oradan alınıyor.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.searchParams.has('share-target')) {
    e.respondWith((async () => {
      try {
        const form = await e.request.formData();
        const file = form.get('screenshot');
        const c = await caches.open(SHARE_CACHE);
        if (file && file.size) {
          await c.put(SHARE_URL, new Response(file, {
            headers: {'Content-Type': file.type || 'image/jpeg'}
          }));
        } else {
          await c.delete(SHARE_URL);
        }
        const metin = ['title', 'text', 'url']
          .map(k => form.get('share_' + k)).filter(Boolean).join(' ');
        const hedef = new URL('./', self.registration.scope);
        hedef.searchParams.set('share', file && file.size ? 'shot' : 'text');
        if (metin) hedef.searchParams.set('share_text', metin.slice(0, 200));
        return Response.redirect(hedef.href, 303);
      } catch {
        return Response.redirect(new URL('./', self.registration.scope).href, 303);
      }
    })());
    return;
  }
  if (e.request.method !== 'GET') return;
  // WT-11: origin kontrolü yoktu — frankfurter, Nominatim ve OpenChargeMap
  // yanıtları cache-first olarak kalıcı saklanıyordu. Bir kez cache'lenen
  // "?latest" kur sorgusu kuru SONSUZA KADAR donduruyordu.
  if (url.origin !== self.location.origin) return;   // ağa dokunma, cache'leme
  e.respondWith(isNetworkFirst(url) ? networkFirst(e.request) : cacheFirst(e.request));
});
