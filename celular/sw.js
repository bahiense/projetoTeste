/* Service worker: é o que faz o app abrir sem internet.

   Guarda os arquivos do app numa caixa versionada. A cada publicação nova,
   troque o número da VERSAO: o navegador baixa tudo de novo e joga fora a
   caixa antiga. Os SEUS DADOS não passam por aqui — eles ficam no
   armazenamento do navegador e nunca são apagados por uma atualização. */

const VERSAO = "ciclo-v2";
const ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icone-192.png", "./icone-512.png", "./icone-180.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then((caixa) => caixa.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  // Responde na hora com o que está guardado e, em paralelo, busca a versão
  // nova para a próxima abertura. Abre rápido e continua se atualizando.
  evento.respondWith(
    caches.match(pedido).then((guardado) => {
      const rede = fetch(pedido).then((resposta) => {
        if (resposta && resposta.ok && new URL(pedido.url).origin === location.origin){
          const copia = resposta.clone();
          caches.open(VERSAO).then((caixa) => caixa.put(pedido, copia));
        }
        return resposta;
      }).catch(() => guardado);
      return guardado || rede;
    })
  );
});
