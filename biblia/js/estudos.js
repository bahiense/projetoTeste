/* =========================================================
   Os estudos gerados ficam guardados no aparelho.

   Vão para o IndexedDB, não para o localStorage: um estudo completo
   tem 15 a 30 KB e o localStorage estoura em 5 MB — cem estudos já
   seriam risco. No IndexedDB cabem milhares, e eles continuam
   legíveis sem internet, que é o ponto: gerar uma vez, reler sempre.
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
                gravarReserva(m);
                return estudo;
            }
            return pedir(loja.put(estudo)).then(function () { return estudo; });
        });
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
        contar: contar, importar: importar, limpar: limpar
    };
})();
