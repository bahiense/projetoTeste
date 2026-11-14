/* Pedaços que várias suítes usam.

   O app traz 2.121 estudos embutidos no pacote (data/estudos). Para o
   app isso é o normal; para quase toda suíte é ruído: elas importam
   dois ou três estudos e conferem contas. Daí "semEmbutidos", que
   responde vazio só a esses arquivos — o resto do app continua
   inteiro. */

export const semEmbutidos = `(() => {
  const real = window.fetch;
  window.fetch = function (u, o) {
    const alvo = String(u || '');
    if (alvo.indexOf('data/estudos/') >= 0) {
      const corpo = alvo.indexOf('indice.json') >= 0 ? '[]' : '{}';
      return Promise.resolve(new Response(corpo, {
        status: 200, headers: { 'Content-Type': 'application/json' }
      }));
    }
    return real.call(this, u, o);
  };
})();`;

/* Junta vários init scripts num só, para o addInitScript continuar
   recebendo uma coisa só. */
export const juntar = (...partes) => partes.map(p =>
  typeof p === 'function' ? '(' + p.toString() + ')();' : String(p)).join('\n');
