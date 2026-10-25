/* Service worker: o app abre sem internet depois da primeira visita.
   Rede primeiro, cache como reserva, para correções chegarem logo.
   As chamadas ao Gemini são POST e passam direto. */
var CACHE = 'oratoria-v1';

var ARQUIVOS = [
    './',
    'index.html',
    'css/style.css',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'js/temas.js', 'js/roteiro.js', 'js/analise.js', 'js/store.js', 'js/ia.js',
    'js/gravador.js', 'js/voz.js', 'js/app.js'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE)
            .then(function (c) { return c.addAll(ARQUIVOS); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (chaves) {
            return Promise.all(chaves.map(function (k) {
                return k === CACHE ? null : caches.delete(k);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).then(function (res) {
            if (res && res.status === 200 && res.type === 'basic') {
                var copia = res.clone();
                caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
            }
            return res;
        }).catch(function () {
            return caches.match(e.request).then(function (achado) {
                return achado || caches.match('index.html');
            });
        })
    );
});
