/* Service worker: o app funciona offline depois da primeira abertura.
   Rede primeiro, cache como reserva — assim uma correção chega assim que
   houver internet, e a falta dela não impede o treino de hoje. */
var CACHE = 'altar-v2';

var ASSETS = [
    './',
    'index.html',
    'css/style.css',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'data/metodo.js', 'data/modulos.js', 'data/cenarios.js', 'data/programa.js',
    'data/dicionario.js', 'data/versiculos.js', 'data/exemplos.js', 'data/lexico.js',
    'data/frases.js',
    'js/ponte-android.js', 'js/store.js', 'js/texto.js', 'js/analise.js', 'js/frases.js',
    'js/voz.js', 'js/ui.js', 'js/lembrete.js', 'js/treino.js', 'js/app.js',
    'js/views/hoje.js', 'js/views/treinar.js', 'js/views/dia.js', 'js/views/programa.js',
    'js/views/curso.js', 'js/views/biblioteca.js', 'js/views/momento.js',
    'js/views/progresso.js', 'js/views/config.js'
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

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(function (res) {
                if (res && res.status === 200 && res.type === 'basic') {
                    var copia = res.clone();
                    caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
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
