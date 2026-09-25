/* Service worker: o app inteiro funciona sem internet depois da primeira
   abertura. Rede primeiro, cache como reserva — assim uma correção no
   código chega assim que houver conexão, em vez de ficar presa no cache.

   A chamada da API nunca passa por aqui: é POST (o fetch abaixo só trata
   GET) e não faria sentido guardar em cache um estudo que já é gravado
   no IndexedDB. */
var CACHE = 'biblia-v1';

var ARQUIVOS = [
    './',
    'index.html',
    'css/style.css',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'data/biblia.js',
    'js/markdown.js', 'js/texto.js', 'js/store.js', 'js/plano.js', 'js/estudos.js', 'js/copia.js',
    'js/prompts.js', 'js/ia.js', 'js/ui.js', 'js/ponte-android.js', 'js/app.js',
    'js/views/hoje.js', 'js/views/ler.js', 'js/views/estudo.js', 'js/views/biblia.js',
    'js/views/progresso.js', 'js/views/config.js'
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
    if (e.request.url.indexOf('api.anthropic.com') >= 0) return;

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
