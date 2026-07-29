/* WattTrack service worker — çevrimdışı çalışma */
importScripts('./version.js');   // WT-52: sürüm tek kaynaktan
const CACHE = WT_CACHE;
const ASSETS = [
  './',
  './index.html',
  './version.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './dexie.min.js',
  './evdata.js',
  './logo.png',
  './nav-plus.png',
  './privacy.html'
];

// WT-11: uygulamanın kendi kabuğu network-first olmalı. Cache-first olduğu
// sürece yeni sürüm ancak SW değişince geliyordu. Görseller ve dexie.min.js
// değişmediği için cache-first kalabilir.
const NETWORK_FIRST = ['./', './index.html', './app.js', './evdata.js',
                       './version.js', './manifest.json'];
const NET_TIMEOUT = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
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

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // WT-11: origin kontrolü yoktu — frankfurter, Nominatim ve OpenChargeMap
  // yanıtları cache-first olarak kalıcı saklanıyordu. Bir kez cache'lenen
  // "?latest" kur sorgusu kuru SONSUZA KADAR donduruyordu.
  if (url.origin !== self.location.origin) return;   // ağa dokunma, cache'leme
  e.respondWith(isNetworkFirst(url) ? networkFirst(e.request) : cacheFirst(e.request));
});
