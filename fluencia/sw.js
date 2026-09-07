/* Service worker: deixa o app funcionar offline depois da primeira abertura.
   Mesma estratégia do teleprompter — rede primeiro, cache como reserva —
   para que a correção chegue sempre que houver internet. */
var CACHE = 'fluencia180-v3';

var ASSETS = [
    './',
    'index.html',
    'css/style.css',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'data/sons.js', 'data/chunks.js', 'data/chunks-2.js',
    'data/shadowing.js', 'data/shadowing-2.js',
    'data/dialogos.js', 'data/dialogos-2.js',
    'data/ditado.js', 'data/ditado-2.js',
    'data/prompts.js', 'data/prompts-2.js',
    'data/escada.js', 'data/erros.js', 'data/erros-2.js',
    'data/drills.js', 'data/drills-2.js',
    'data/curriculo.js', 'data/curriculo-2.js', 'data/correcao.js',
    'js/ponte-android.js', 'js/store.js', 'js/texto.js', 'js/correcao.js', 'js/srs.js', 'js/voz.js', 'js/ui.js',
    'js/curso.js', 'js/pratica.js', 'js/app.js',
    'js/views/hoje.js', 'js/views/exercicios.js', 'js/views/pronuncia.js',
    'js/views/shadowing.js', 'js/views/escuta.js', 'js/views/chunks.js',
    'js/views/drills.js', 'js/views/conversa.js', 'js/views/arena.js',
    'js/views/coragem.js', 'js/views/erros.js', 'js/views/plano.js',
    'js/views/diario.js', 'js/views/progresso.js'
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
