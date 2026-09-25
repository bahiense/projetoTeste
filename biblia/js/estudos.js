/* =========================================================
   Os estudos gerados ficam guardados no aparelho.

   Vão para o IndexedDB, não para o localStorage: um estudo completo
   tem 15 a 30 KB e o localStorage estoura em 5 MB — cem estudos já
   seriam risco. No IndexedDB cabem milhares, e eles continuam
   legíveis sem internet, que é o ponto: gerar uma vez, reler sempre.

   "Para sempre" exige três cuidados que não são óbvios:

   1. O navegador pode despejar dados quando o aparelho fica sem espaço.
      Pedir armazenamento persistente (navigator.storage.persist) tira o
      app dessa fila. É pedido na primeira vez que um estudo é guardado —
      quando já existe algo a proteger — e pode ser pedido de novo em
      Ajustes.
   2. Gravação pode falhar (cota, aba anônima, IndexedDB bloqueado). Por
      isso toda gravação é conferida relendo o que foi escrito: se não
      voltou, o app avisa em vez de dizer "guardado" e perder o texto.
   3. Quem gera um estudo e perde a gravação perdeu dinheiro e tempo. A
      tela de estudo trata esse caso mostrando o texto assim mesmo, com
      a opção de tentar de novo ou salvar como arquivo.
   ========================================================= */
window.B = window.B || {};

B.estudos = (function () {
    'use strict';

    var NOME = 'bib-estudos';
    var LOJA = 'estudos';
    var bd = null;
    var reserva = null;   // localStorage, quando o IndexedDB não existe

    function abrir() {
        if (bd) return Promise.resolve(bd);
        if (reserva) return Promise.resolve(null);
        return new Promise(function (ok) {
            var req;
            try { req = indexedDB.open(NOME, 1); }
            catch (e) { reserva = true; return ok(null); }

            req.onupgradeneeded = function () {
                var b = req.result;
                if (!b.objectStoreNames.contains(LOJA)) {
                    var loja = b.createObjectStore(LOJA, { keyPath: 'id' });
                    loja.createIndex('criado', 'criado');
                }
            };
            req.onsuccess = function () { bd = req.result; ok(bd); };
            req.onerror = function () { reserva = true; ok(null); };
            req.onblocked = function () { reserva = true; ok(null); };
        });
    }

    /* ---------- reserva em localStorage ---------- */
    function lerReserva() {
        try { return JSON.parse(localStorage.getItem('bib:estudos') || '{}'); }
        catch (e) { return {}; }
    }
    function gravarReserva(m) {
        try { localStorage.setItem('bib:estudos', JSON.stringify(m)); return true; }
        catch (e) { return false; }
    }

    function transacao(modo) {
        return abrir().then(function (b) {
            if (!b) return null;
            return b.transaction(LOJA, modo).objectStore(LOJA);
        });
    }

    function pedir(req) {
        return new Promise(function (ok, falhou) {
            req.onsuccess = function () { ok(req.result); };
            req.onerror = function () { falhou(req.error); };
        });
    }

    /* A chave junta título e formato: o estudo simples e o completo do
       mesmo capítulo são dois textos diferentes e convivem sem se
       sobrescrever. O completo fica com a chave limpa ("João 3") porque
       era assim antes de existir o simples — assim o que já estava
       guardado continua abrindo. */
    function id(titulo, formato) {
        var t = String(titulo).trim();
        return formato === 'simples' ? t + ' · simples' : t;
    }

    function salvar(estudo) {
        estudo.formato = estudo.formato === 'simples' ? 'simples' : 'completo';
        estudo.id = id(estudo.titulo, estudo.formato);
        estudo.criado = estudo.criado || new Date().toISOString();
        estudo.atualizado = new Date().toISOString();

        return transacao('readwrite').then(function (loja) {
            if (!loja) {
                var m = lerReserva();
                m[estudo.id] = estudo;
                if (!gravarReserva(m)) {
                    throw new Error('O navegador recusou guardar o estudo (sem espaço ou ' +
                        'em aba anônima). Baixe o texto antes de sair daqui.');
                }
                return estudo;
            }
            return pedir(loja.put(estudo)).then(function () { return estudo; });
        }).then(function () {
            /* Conferir relendo: uma gravação que falha em silêncio é pior
               do que uma que dá erro, porque o app diria "guardado". */
            return obter(estudo.titulo, estudo.formato);
        }).then(function (volta) {
            if (!volta || !volta.texto || volta.texto.length !== estudo.texto.length) {
                throw new Error('O estudo não ficou guardado de verdade — o que foi lido de ' +
                    'volta não bate com o que foi escrito.');
            }
            protegerArmazenamento();
            /* Guardado aqui dentro; agora a cópia lá fora, que é a que
               sobrevive a uma reinstalação. */
            if (B.copia) B.copia.agendar();
            return estudo;
        });
    }

    /* Pede ao navegador para não despejar estes dados quando o aparelho
       apertar. Só faz sentido depois que existe algo guardado, e o
       navegador só costuma conceder a quem já instalou o app ou usa
       bastante — por isso o pedido é feito sem alarde e sem bloquear
       nada quando é negado. */
    var jaPediu = false;
    function protegerArmazenamento() {
        if (jaPediu || !navigator.storage || !navigator.storage.persist) return;
        jaPediu = true;
        try { navigator.storage.persist(); } catch (e) { }
    }

    /* Quanto está guardado e se está protegido — a tela de ajustes mostra. */
    function situacao() {
        return listar().then(function (lista) {
            var texto = lista.reduce(function (t, e) {
                return t + (e.texto || '').length +
                    (e.perguntas || []).reduce(function (x, p) { return x + p.q.length + p.r.length; }, 0);
            }, 0);
            var base = {
                estudos: lista.length,
                caracteres: texto,
                noIndexedDB: !reserva,
                protegido: null,
                usado: null,
                disponivel: null
            };
            if (!navigator.storage) return base;

            var passos = [];
            if (navigator.storage.persisted) {
                passos.push(navigator.storage.persisted().then(function (p) { base.protegido = p; },
                    function () { }));
            }
            if (navigator.storage.estimate) {
                passos.push(navigator.storage.estimate().then(function (e) {
                    base.usado = e.usage;
                    base.disponivel = e.quota;
                }, function () { }));
            }
            return Promise.all(passos).then(function () { return base; });
        });
    }

    /* Pedido explícito, feito pela tela de ajustes: aqui o navegador
       costuma mostrar (ou não) um aviso, e a resposta interessa. */
    function protegerAgora() {
        if (!navigator.storage || !navigator.storage.persist) return Promise.resolve(null);
        return navigator.storage.persist().then(function (ok) { return ok; }, function () { return null; });
    }

    function obter(titulo, formato) {
        return transacao('readonly').then(function (loja) {
            if (!loja) return lerReserva()[id(titulo, formato)] || null;
            return pedir(loja.get(id(titulo, formato)));
        }).then(function (r) { return r || null; });
    }

    function listar() {
        return transacao('readonly').then(function (loja) {
            if (!loja) {
                var m = lerReserva();
                return Object.keys(m).map(function (k) { return m[k]; });
            }
            return pedir(loja.getAll());
        }).then(function (lista) {
            return (lista || []).map(function (e) {
                /* Estudo guardado antes de existir o formato é completo. */
                if (!e.formato) e.formato = 'completo';
                return e;
            }).sort(function (a, b) {
                return String(b.atualizado || b.criado).localeCompare(String(a.atualizado || a.criado));
            });
        });
    }

    function remover(titulo, formato) {
        return transacao('readwrite').then(function (loja) {
            if (!loja) {
                var m = lerReserva();
                delete m[id(titulo, formato)];
                return gravarReserva(m);
            }
            return pedir(loja.delete(id(titulo, formato)));
        });
    }

    function contar() {
        return listar().then(function (l) { return l.length; });
    }

    function importar(lista) {
        var fila = (lista || []).filter(function (e) { return e && e.titulo && e.texto; });
        return fila.reduce(function (p, e) {
            return p.then(function () { return salvar(e); });
        }, Promise.resolve()).then(function () { return fila.length; });
    }

    function limpar() {
        return transacao('readwrite').then(function (loja) {
            if (!loja) return gravarReserva({});
            return pedir(loja.clear());
        });
    }

    return {
        salvar: salvar, obter: obter, listar: listar, remover: remover,
        contar: contar, importar: importar, limpar: limpar,
        situacao: situacao, protegerAgora: protegerAgora
    };
})();
