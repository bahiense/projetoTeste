/* =========================================================
   Os prompts do estudo.

   São a parte mais importante do app: o que o modelo devolve é
   exatamente o que foi pedido, e um pedido vago devolve devocional
   genérico. Por isso o pedido é longo de propósito — estrutura fixa,
   ordem fixa e, principalmente, regras de honestidade: o modelo é
   obrigado a separar o que é consenso do que é disputa, e a não
   inventar citação, página nem etimologia.

   Há dois formatos, e a diferença entre eles não é só de tamanho:

   - SIMPLES: três seções, para ler junto com o capítulo, em cinco
     minutos. Contexto, quem é quem, e o que fazer com isso.
   - COMPLETO: o estudo inteiro, com original, teólogos, disputas,
     referências cruzadas e a ligação com Cristo.

   O simples não é o completo cortado pela metade: é outro pedido, com
   outra ordem, escrito para quem tem cinco minutos e a Bíblia aberta.
   ========================================================= */
window.B = window.B || {};

B.prompts = (function () {
    'use strict';

    var TRADICOES = {
        equilibrada: 'Não escreva de dentro de uma única tradição. Quando as tradições ' +
            'divergem (reformada, arminiana/wesleyana, luterana, católica, ortodoxa, ' +
            'pentecostal, anabatista), apresente as principais leituras com o melhor ' +
            'argumento de cada uma antes de dizer qual tem mais apoio no texto.',
        reformada: 'Escreva a partir da tradição reformada/calvinista (confissões de ' +
            'Westminster e Belga, teologia da aliança), mas apresente com justiça as ' +
            'leituras que divergem, sem caricatura.',
        arminiana: 'Escreva a partir da tradição arminiana/wesleyana, mas apresente com ' +
            'justiça as leituras que divergem, sem caricatura.',
        catolica: 'Escreva a partir da tradição católica romana (Magistério, Catecismo, ' +
            'exegese patrística e Dei Verbum), mas apresente com justiça as leituras ' +
            'protestantes e ortodoxas, sem caricatura.',
        historica: 'Priorize a exegese histórico-gramatical e o método histórico-crítico ' +
            'contemporâneo: autoria, fontes, redação, gênero e Sitz im Leben, com o estado ' +
            'atual do debate acadêmico. Não esconda quando a leitura crítica e a leitura ' +
            'confessional discordam.'
    };

    var TAMANHOS = {
        essencial: 'Seja denso e direto: o estudo inteiro em torno de 900 a 1.300 palavras. ' +
            'Mantenha todas as seções, mas com menos exemplos.',
        completo: 'Escreva um estudo completo, em torno de 2.200 a 3.200 palavras. ' +
            'É o tamanho de quem senta para estudar de verdade, não de quem passa o olho.',
        profundo: 'Escreva o estudo mais completo que você conseguir sustentar com ' +
            'informação real: 4.000 palavras ou mais, com todas as seções desenvolvidas, ' +
            'mais vozes de teólogos e mais palavras do original. Não encha linguiça: ' +
            'se não houver material honesto para uma seção, ela pode ficar curta.'
    };

    /* Regras que valem para os dois tipos de estudo. */
    function sistema(cfg) {
        var t = TRADICOES[cfg.tradicao] || TRADICOES.equilibrada;
        return '' +
            'Você é um professor de Bíblia que une três coisas que raramente andam juntas: ' +
            'exegese técnica (hebraico, aramaico, grego, crítica textual), conhecimento ' +
            'histórico do Antigo Oriente Próximo e do mundo greco-romano, e capacidade de ' +
            'escrever em português do Brasil de forma clara para um leitor leigo e sério.\n\n' +

            'ESCRITA\n' +
            '- Português do Brasil, tom de professor respeitado: caloroso, direto, sem ' +
            'jargão desnecessário e sem linguagem de púlpito inflada.\n' +
            '- Explique todo termo técnico na primeira vez que usar.\n' +
            '- Markdown com títulos ## e ###, listas e negrito. Nada de tabelas largas ' +
            '(o app é lido no celular). Nada de emojis nos títulos.\n' +
            '- Não abra com saudação nem feche com "espero ter ajudado". Comece pelo estudo.\n\n' +

            'HONESTIDADE (a regra que manda em todas as outras)\n' +
            '- Distinga sempre: (a) o que o texto diz, (b) o que é consenso entre ' +
            'estudiosos, (c) o que é disputado, (d) o que é sua leitura. Use expressões ' +
            'como "o texto diz", "há amplo consenso", "há debate", "a meu ver".\n' +
            '- NUNCA invente citação. Só use aspas quando tiver certeza das palavras exatas ' +
            'do autor. Quando souber a posição de um teólogo mas não a formulação literal, ' +
            'escreva sem aspas: "Calvino argumenta que...". Não invente número de página, ' +
            'edição, ano nem título de obra.\n' +
            '- Etimologia é ferramenta, não mágica: dê o campo semântico real da palavra e ' +
            'como ela é usada em outros lugares, e evite a "falácia da raiz" (concluir o ' +
            'sentido de uma palavra a partir das partes que a compõem).\n' +
            '- Ao citar o texto bíblico, dê sempre a referência. Se não tiver certeza da ' +
            'forma exata na tradução pedida, parafraseie e diga que é paráfrase, em vez de ' +
            'arriscar as palavras.\n' +
            '- Quando um dado for incerto (data, autoria, localização de um lugar), diga ' +
            'que é incerto e dê o intervalo ou as opções.\n\n' +

            'TRADIÇÃO\n- ' + t + '\n\n' +

            'TRADUÇÃO\n- Quando citar o texto em português, use a ' + cfg.versao + ' como ' +
            'referência principal e mencione outra tradução quando a diferença mudar o sentido.';
    }

    /* Nenhum caminho gratuito tem busca na web, então o pedido diz isso
       com todas as letras em vez de deixar o modelo achar que pode
       conferir o que não vai conferir. */
    function semBusca() {
        return 'SEM BUSCA NA WEB: você não tem como conferir nada agora. Portanto: nada de ' +
            'aspas em citações que você não tenha certeza absoluta, nada de números de ' +
            'página, nada de estatística específica. Trabalhe com o que é sólido na sua ' +
            'memória e diga quando algo precisa ser conferido.';
    }

    /* ---------- estudo de um capítulo ---------- */

    function capitulo(livro, cap, cfg) {
        var ref = livro.nome + ' ' + cap;
        var corpo = '' +
            'Explique **' + ref + '** da forma mais completa possível, para alguém que vai ' +
            'ler esse capítulo hoje e quer entendê-lo de verdade.\n\n' +
            TAMANHOS[cfg.tamanho] + '\n\n' +
            semBusca() + '\n\n' +
            'Siga exatamente esta estrutura, nesta ordem, com estes títulos:\n\n' +

            '## ' + ref + '\n' +
            'Uma frase que resuma o capítulo inteiro, do jeito que você diria a um amigo.\n\n' +

            '### Onde estamos\n' +
            'O que aconteceu imediatamente antes, por que este capítulo vem aqui e para ' +
            'onde ele empurra a narrativa ou o argumento. Situe o capítulo dentro do livro ' +
            'e dentro da história bíblica como um todo (criação, queda, aliança com Abraão, ' +
            'êxodo, monarquia, exílio, volta, Cristo, igreja, consumação).\n\n' +

            '### O mundo por trás do texto\n' +
            'Contexto histórico, geográfico e cultural do que está acontecendo: quem manda ' +
            'na região, como as pessoas viviam, o que era óbvio para o leitor original e ' +
            'não é óbvio para nós (costumes, leis, honra e vergonha, economia, religiões ' +
            'vizinhas, unidades de medida e dinheiro quando aparecerem). Datas prováveis, ' +
            'com a incerteza declarada.\n\n' +

            '### Quem é quem\n' +
            'Cada personagem que aparece: quem é, de onde vem, o que quer, o que está em ' +
            'jogo para ele e o que o leitor já sabe a respeito dele. Dê o significado do ' +
            'nome quando ele for relevante para a narrativa. Se um personagem reaparece ' +
            'depois na Bíblia, diga onde.\n\n' +

            '### Os lugares\n' +
            'Cada lugar citado: onde fica (em relação a algo conhecido), como era, distância ' +
            'e tempo de viagem quando isso importar, e o peso simbólico ou histórico que o ' +
            'lugar carregava. Se a localização é disputada pelos arqueólogos, diga.\n\n' +

            '### O capítulo, parte por parte\n' +
            'Divida o capítulo em blocos de versículos (use "**vv. 1-8**" como subtítulo de ' +
            'cada bloco) e explique cada bloco: o que acontece, o que a construção do texto ' +
            'está fazendo (repetição, quiasmo, ironia, paralelismo, mudança de quem fala), ' +
            'e o que um leitor apressado perde ali. Esta é a seção mais longa do estudo.\n\n' +

            '### Versículos-chave\n' +
            'De três a cinco versículos. Para cada um: a referência, o texto (ou paráfrase ' +
            'identificada como tal) e por que ele sustenta o capítulo.\n\n' +

            '### As palavras no original\n' +
            'De cinco a oito palavras decisivas do capítulo. Para cada uma: a palavra no ' +
            'original (' + (livro.testamento === 'AT' ? 'hebraico ou aramaico' : 'grego') +
            '), a transliteração, a tradução usual, o campo de sentido que ela cobre, o que ' +
            'a tradução em português deixa escapar e por que isso muda a leitura deste ' +
            'capítulo. Inclua o número de Strong quando tiver certeza dele.\n\n' +

            '### O que dizem os teólogos\n' +
            'De quatro a seis vozes, de épocas e tradições diferentes — algo como um pai da ' +
            'igreja (Agostinho, Crisóstomo, Orígenes, Irineu), um reformador (Calvino, ' +
            'Lutero), um puritano ou pregador clássico (Matthew Henry, John Owen, Spurgeon), ' +
            'um comentarista contemporâneo da área (por exemplo Gordon Wenham, Walter ' +
            'Brueggemann, N. T. Wright, F. F. Bruce, D. A. Carson, John Stott, Craig ' +
            'Keener, Richard Bauckham, Bruce Waltke, Tremper Longman) e, quando houver, uma ' +
            'voz brasileira (Augustus Nicodemus, Hernandes Dias Lopes, Ricardo Quadros ' +
            'Gouvêa, Paulo Anglada). Para cada um: quem é e de quando, o que ele vê neste ' +
            'texto e por quê. Aspas só com a formulação exata; caso contrário, resuma a ' +
            'posição sem aspas.\n\n' +

            '### Onde os intérpretes discordam\n' +
            'Os pontos realmente disputados deste capítulo (tradução, sentido, historicidade, ' +
            'aplicação). Para cada um: as duas ou três posições, o argumento mais forte de ' +
            'cada lado e o que está em jogo na escolha. Se o capítulo não tiver disputa ' +
            'relevante, diga isso em uma linha em vez de inventar polêmica.\n\n' +

            '### Ligações com o resto da Bíblia\n' +
            'De seis a dez referências cruzadas. Para cada uma: a referência e, em uma ' +
            'frase, por que ela ilumina este capítulo (citação, alusão, cumprimento, ' +
            'contraste, mesmo tema, mesma palavra).\n\n' +

            '### Como este capítulo aponta para Cristo\n' +
            'A parte que exige mais cuidado. Mostre a ligação com Cristo pelo caminho que o ' +
            'próprio texto abre: promessa e cumprimento, tipo e antítipo, tema que atravessa ' +
            'o cânon, citação do capítulo no Novo Testamento, ou o lugar do texto na história ' +
            'da redenção. Diga expressamente qual desses caminhos você está usando. Se a ' +
            'ligação for temática e não tipológica, diga que é temática. Não force alegoria: ' +
            'é melhor uma ligação sólida do que cinco forçadas.\n\n' +

            '### Da mesa de estudo para a vida\n' +
            'O que muda em quem leu isto hoje. Sóbrio, concreto, sem moralismo e sem ' +
            'transformar o texto em manual de autoajuda. Diga também o que este capítulo ' +
            '*não* está prometendo, quando houver risco de má aplicação.\n\n' +

            '### Para meditar\n' +
            'Três perguntas que obrigam a voltar ao texto.\n\n' +

            '### Oração\n' +
            'Uma oração curta, tecida com as palavras e as imagens deste capítulo.\n\n' +

            '### Para ir mais fundo\n' +
            'De três a cinco obras reais para quem quiser seguir (comentário, dicionário ' +
            'bíblico, obra de teologia), com autor e título, dizendo o que cada uma serve. ' +
            'Nada de inventar título nem página.' +
            '';

        return { sistema: sistema(cfg), usuario: corpo, titulo: ref, tipo: 'capitulo' };
    }

    /* ---------- o estudo simples ---------- */

    /* Três seções, na ordem em que servem a quem tem a Bíblia aberta:
       onde isso se passa, quem está ali, e o que fazer com isso hoje.
       Nada de original, teólogos ou disputa — quem quiser tem o completo
       a um toque de distância. */

    var TAMANHO_SIMPLES =
        'Escreva curto: de 500 a 800 palavras no total, as três seções somadas. ' +
        'É para ser lido em cinco minutos, ao lado do capítulo. Frases diretas, ' +
        'sem enrolação e sem repetir na aplicação o que já foi dito no contexto. ' +
        'Não acrescente seção nenhuma além das três pedidas.';

    function capituloSimples(livro, cap, cfg) {
        var ref = livro.nome + ' ' + cap;
        var corpo = '' +
            'Explique **' + ref + '** de forma simples e curta, para alguém que vai ler esse ' +
            'capítulo agora e tem cinco minutos.\n\n' +
            TAMANHO_SIMPLES + '\n\n' +
            semBusca() + '\n\n' +
            'Siga exatamente esta estrutura, nesta ordem, com estes títulos — e só estes:\n\n' +

            '## ' + ref + '\n' +
            'Uma frase que resuma o capítulo inteiro, do jeito que você diria a um amigo.\n\n' +

            '### O contexto\n' +
            'Três coisas, nesta ordem, sem subtítulos entre elas. **Histórico**: em que ponto ' +
            'da história bíblica isto acontece, o que veio logo antes e quem mandava na ' +
            'região, com data provável e a incerteza declarada quando houver. **Cultural**: ' +
            'como as pessoas viviam ali e o que era óbvio para o leitor original e não é ' +
            'óbvio para nós (costumes, honra e vergonha, dinheiro, religião dos vizinhos). ' +
            '**Geográfico**: onde fica o lugar, em relação a algo conhecido, como era, e o ' +
            'que ele significava para quem estava ali.\n\n' +

            '### Quem é quem\n' +
            'Cada pessoa que aparece no capítulo, em lista: quem é, de onde vem e — o mais ' +
            'importante — **o que está em jogo para ela** nesta cena: o que ela quer, o que ' +
            'ela teme, o que ela ganha ou perde aqui. Se o significado do nome ajudar a ' +
            'entender a cena, diga em meia linha.\n\n' +

            '### Para a sua vida\n' +
            'Três coisas, nesta ordem e sem subtítulos entre elas:\n' +
            '1. **A aplicação**: o que muda para quem leu isto hoje — concreto, sóbrio, sem ' +
            'moralismo e sem transformar o texto em autoajuda. Diga também o que o texto ' +
            '*não* está prometendo, se houver risco de má aplicação.\n' +
            '2. **Três perguntas para meditar**, numeradas, que obriguem a voltar ao texto.\n' +
            '3. **Uma oração curta**, de três a cinco linhas, tecida com as palavras e as ' +
            'imagens deste capítulo.';

        return { sistema: sistema(cfg), usuario: corpo, titulo: ref, tipo: 'capitulo', simples: true };
    }

    function livroSimples(livro, cfg) {
        var corpo = '' +
            'Apresente o livro de **' + livro.nome + '** (' + livro.caps + ' capítulos) de ' +
            'forma simples e curta, para alguém que vai começar a lê-lo agora.\n\n' +
            TAMANHO_SIMPLES + '\n\n' +
            semBusca() + '\n\n' +
            'Siga exatamente esta estrutura, nesta ordem, com estes títulos — e só estes:\n\n' +

            '## ' + livro.nome + '\n' +
            'Uma frase que diga do que trata o livro inteiro.\n\n' +

            '### O contexto\n' +
            'Três coisas, nesta ordem, sem subtítulos entre elas. **Histórico**: quem ' +
            'escreveu (com o debate sobre autoria em uma linha, se houver), quando, para quem ' +
            'e por quê — que situação concreta fez alguém escrever isto, e quem estava no ' +
            'poder então. **Cultural**: como se vivia ali, o que os vizinhos criam, o que o ' +
            'primeiro leitor entendia sem precisar de explicação. **Geográfico**: onde o ' +
            'livro se passa e como esses lugares se ligam entre si.\n\n' +

            '### Quem é quem\n' +
            'Os personagens principais, em lista: quem são, o que fazem no livro e o que está ' +
            'em jogo para cada um. Como eles mudam do começo ao fim.\n\n' +

            '### Para a sua vida\n' +
            'Três coisas, nesta ordem e sem subtítulos entre elas:\n' +
            '1. **A aplicação**: o que este livro faz com quem o lê inteiro — concreto e ' +
            'sóbrio. Diga também que armadilha de leitura evitar nele.\n' +
            '2. **Três perguntas para meditar** durante a leitura, numeradas.\n' +
            '3. **Uma oração curta**, de três a cinco linhas, com as imagens do próprio livro.';

        return { sistema: sistema(cfg), usuario: corpo, titulo: livro.nome, tipo: 'livro', simples: true };
    }

    /* ---------- panorama de um livro ---------- */

    function livroInteiro(livro, cfg) {
        var corpo = '' +
            'Faça o panorama completo do livro de **' + livro.nome + '** (' + livro.caps +
            ' capítulos, ' + (livro.testamento === 'AT' ? 'Antigo' : 'Novo') + ' Testamento) ' +
            '— não de um capítulo, mas do livro inteiro, para alguém que vai começar a ' +
            'lê-lo e quer saber onde está entrando.\n\n' +
            TAMANHOS[cfg.tamanho] + '\n\n' +
            semBusca() + '\n\n' +
            'Siga exatamente esta estrutura, nesta ordem, com estes títulos:\n\n' +

            '## ' + livro.nome + '\n' +
            'Uma frase que diga do que trata o livro inteiro.\n\n' +

            '### O cartão do livro\n' +
            'Em lista curta: autor (com o estado do debate sobre autoria), data provável de ' +
            'composição e dos eventos, lugar de escrita, destinatário original, gênero ' +
            'literário, extensão, palavra ou expressão que mais se repete, e um versículo ' +
            'que funcione como tema.\n\n' +

            '### Por que este livro existe\n' +
            'A ocasião concreta: que problema, crise ou pergunta fez alguém escrever isto. ' +
            'O que aconteceria com os primeiros leitores se o livro não existisse.\n\n' +

            '### O mundo do livro\n' +
            'Contexto histórico, político, geográfico e religioso: quem estava no poder, ' +
            'como era viver ali, o que os vizinhos criam, o que estava mudando. Onde este ' +
            'livro se encaixa na linha do tempo bíblica e o que estava sendo escrito por ' +
            'perto.\n\n' +

            '### O mapa do livro\n' +
            'A estrutura, em seções com os capítulos de cada uma (por exemplo "**1-11** — ' +
            'origens"). Para cada seção: o que acontece e qual é a função dela no todo. ' +
            'Mostre o desenho do livro, se houver (quiasmo, dois blocos, sete sinais, ' +
            'cartas e visões).\n\n' +

            '### O fio da meada\n' +
            'O enredo ou o argumento do começo ao fim, corrido, como quem conta a história ' +
            'para alguém que nunca ouviu. Deve ser possível ler só esta seção e saber o que ' +
            'acontece no livro.\n\n' +

            '### Quem é quem\n' +
            'Os personagens principais: quem são, o que fazem, como mudam ao longo do livro ' +
            'e o que a Bíblia diz deles em outros lugares. Significado dos nomes quando ' +
            'importar.\n\n' +

            '### Os lugares\n' +
            'A geografia do livro: os lugares que mais aparecem, onde ficam, como se ligam ' +
            'entre si e o peso de cada um na história.\n\n' +

            '### Os grandes temas\n' +
            'De quatro a sete temas que atravessam o livro. Para cada um: o que é, onde ' +
            'aparece (com referências) e como se desenvolve do primeiro ao último capítulo.\n\n' +

            '### As palavras no original\n' +
            'De seis a dez palavras-chave do livro em ' +
            (livro.testamento === 'AT' ? 'hebraico ou aramaico' : 'grego') + ': palavra, ' +
            'transliteração, campo de sentido, quantas vezes aparece (se você tiver certeza), ' +
            'e por que ela é uma chave deste livro em particular.\n\n' +

            '### As passagens que todo mundo cita\n' +
            'Os textos mais conhecidos do livro, o que eles realmente dizem no contexto e, ' +
            'quando for o caso, como costumam ser mal usados.\n\n' +

            '### Dificuldades e disputas\n' +
            'Os problemas honestos: autoria, data, unidade do texto, historicidade, ' +
            'passagens moralmente difíceis, contradições aparentes com outros livros. Para ' +
            'cada um: as principais respostas e o peso de cada uma. Não varra nada para ' +
            'baixo do tapete.\n\n' +

            '### O que dizem os teólogos\n' +
            'De quatro a seis vozes de épocas e tradições diferentes sobre este livro: quem ' +
            'é cada um, o que ele enxerga aqui e por quê. Inclua, quando houver, uma voz ' +
            'brasileira. Aspas só com formulação exata.\n\n' +

            '### Cristo neste livro\n' +
            'Como o livro inteiro aponta para Cristo: promessas, tipos, temas, citações no ' +
            'Novo Testamento (liste as principais com referência dos dois lados). Diga qual ' +
            'caminho está usando em cada ligação e não force alegoria.\n\n' +

            '### Como ler este livro\n' +
            'Um roteiro prático: em quantos dias ler, em que blocos, o que observar em cada ' +
            'bloco, que armadilhas evitar e que pergunta levar na cabeça durante a leitura.\n\n' +

            '### O que este livro faz com quem o lê\n' +
            'Aplicação do livro como um todo, sóbria e concreta.\n\n' +

            '### Para ir mais fundo\n' +
            'De três a cinco obras reais (comentário, introdução, dicionário), com autor e ' +
            'título, dizendo para que serve cada uma e o nível de dificuldade.' +
            '';

        return { sistema: sistema(cfg), usuario: corpo, titulo: livro.nome, tipo: 'livro' };
    }

    /* Pergunta livre sobre um texto já estudado — o "e se eu quiser saber
       mais sobre isso?" que sempre aparece depois de ler o estudo. */
    function pergunta(titulo, textoEstudo, duvida, cfg) {
        return {
            sistema: sistema(cfg),
            usuario: 'Você escreveu o estudo abaixo sobre **' + titulo + '**.\n\n' +
                '---\n' + textoEstudo.slice(0, 60000) + '\n---\n\n' +
                'Pergunta de quem leu: ' + duvida + '\n\n' +
                'Responda em português do Brasil, com a mesma honestidade do estudo ' +
                '(consenso × disputa, sem citação inventada). Vá direto ao ponto: ' +
                'de 200 a 600 palavras, markdown simples, sem repetir o que já está no ' +
                'estudo a não ser que seja necessário para a resposta.',
            titulo: titulo, tipo: 'pergunta'
        };
    }

    function montar(alvo, cfg, formato) {
        var simples = formato === 'simples';
        if (alvo.capitulo) {
            return simples
                ? capituloSimples(alvo.livro, alvo.capitulo, cfg)
                : capitulo(alvo.livro, alvo.capitulo, cfg);
        }
        return simples ? livroSimples(alvo.livro, cfg) : livroInteiro(alvo.livro, cfg);
    }

    return {
        montar: montar, capitulo: capitulo, livroInteiro: livroInteiro,
        capituloSimples: capituloSimples, livroSimples: livroSimples,
        pergunta: pergunta, TRADICOES: TRADICOES, TAMANHOS: TAMANHOS
    };
})();
