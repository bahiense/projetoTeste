/* Service worker: deixa o app funcionar offline depois da primeira abertura. */
var CACHE = 'teleprompter-v2';

var ASSETS = [
    './',
    'index.html',
    'css/style.css',
    'js/app.js',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE)
            .then(function (c) { return c.addAll(ASSETS); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.map(function (k) {
                    return k === CACHE ? null : caches.delete(k);
                }));
            })
            .then(function () { return self.clients.claim(); })
    );
});

/**
 * Rede primeiro, cache como reserva.
 *
 * O contrário (cache primeiro) congelava o app na primeira versão baixada:
 * quem já tinha aberto uma vez nunca mais recebia correção. Assim a atualização
 * chega sempre que houver internet, e o app continua funcionando sem ela.
 */
self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(function (res) {
                if (res && res.status === 200 && res.type === 'basic') {
                    var copy = res.clone();
                    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
                }
                return res;
            })
            .catch(function () {
                return caches.match(e.request).then(function (hit) {
                    return hit || caches.match('index.html');
                });
            })
    );
});
