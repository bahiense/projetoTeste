/* =========================================================
   Orações modelo, com o método por trás.

   São as do próprio material. O app mostra primeiro a oração —
   como qualquer pessoa a ouviria — e só depois revela o que estava
   acontecendo nos bastidores. Ver a etiqueta antes da oração
   ensinaria a exibir o método, que é exatamente o contrário do
   que o Módulo 10 pede.
   ========================================================= */
window.A = window.A || {};

A.EXEMPLOS = [
    {
        id: 'familia-noite',
        titulo: 'Intercessão por uma família',
        contexto: 'Uma mulher é chamada para orar por uma família durante uma reunião de igreja.',
        oracao: 'Senhor, estamos diante de Ti pensando em uma família específica esta noite. ' +
            'Sabemos que eles têm carregado um peso que não é fácil. Nós Te pedimos pelo pai — que ele ' +
            'encontre força e sabedoria. Pelos filhos — que eles sintam que há segurança mesmo no meio da ' +
            'tempestade. Por esse casamento — que Tu o sustentes onde as forças humanas já não alcançam. ' +
            'E enquanto oramos por eles, lembramos que muitas famílias aqui nesta sala também carregam ' +
            'histórias parecidas. Nós confiamos em Ti, Senhor. Entregamos o que não conseguimos resolver. ' +
            'E cremos que Tu estás dentro dessa história. Amém.',
        bastidores: [
            { t: 'A — Propósito', d: 'Interceder pela família. Esse é o ponto central.' },
            { t: 'L — Momento', d: 'A família está em dificuldade. É esse o contexto que alimenta a abertura.' },
            { t: 'T — Caminho', d: 'Pai → filhos → casamento → outras famílias presentes.' },
            { t: 'A — Congregação', d: 'Linguagem simples, que todos podem acompanhar e sentir como sua.' },
            { t: 'R — Confiança', d: 'Entrega da família, com fé de que Deus está dentro da situação.' },
            { t: 'Ponte', d: 'Parte → Todo: dos filhos daquela família para as famílias da sala.' }
        ]
    },
    {
        id: 'decisao-familia',
        titulo: 'Família diante de uma decisão',
        contexto: 'Uma família está passando por uma decisão importante. Você foi chamado para orar.',
        oracao: 'Senhor, nós Te trazemos esta família hoje. Eles estão diante de uma decisão que pesa — ' +
            'que toca o futuro, os sonhos, e também os medos que naturalmente aparecem nesses momentos. ' +
            'Tu conheces cada detalhe que eles não conseguem enxergar daqui. E é exatamente por isso que ' +
            'estamos aqui — não porque temos todas as respostas, mas porque sabemos a quem perguntar. ' +
            'Concede a eles sabedoria que vai além do que os olhos alcançam. Que cada membro desta família ' +
            'se sinta acompanhado por Ti neste processo. Que a paz que excede o entendimento guarde o ' +
            'coração de cada um. Entregamos esta decisão em Tuas mãos. E confiamos no Teu cuidado. ' +
            'Em nome de Jesus, amém.',
        bastidores: [
            { t: 'Propósito', d: 'Colocar a decisão da família diante de Deus.' },
            { t: 'Momento', d: 'Reconhecer o peso real da situação, sem dramatizar.' },
            { t: 'Ângulo', d: 'Necessidade: sabedoria — nomeada com clareza.' },
            { t: 'Profundidade', d: 'Lembrar quem Deus é em relação a esta situação específica.' },
            { t: 'Pontes', d: 'Situação → Necessidade → Fé → Entrega.' },
            { t: 'Adaptação', d: 'Linguagem familiar e acolhedora, apropriada ao contexto.' }
        ]
    },
    {
        id: 'familias-igreja',
        titulo: 'Pelas famílias da igreja',
        contexto: 'Alguém foi chamado para orar pelas famílias, num momento coletivo.',
        oracao: 'Senhor, nós Te trazemos as nossas famílias. Cada lar representado aqui carrega histórias ' +
            'que só Tu conheces inteiramente. E dentro de cada família, há filhos — filhos que estão ' +
            'crescendo, tomando decisões, enfrentando pressões que nem sempre conseguem nomear. Dá ' +
            'sabedoria a esses jovens, Senhor. E dá sabedoria também aos pais, para que saibam como estar ' +
            'presentes de um jeito que realmente alcança. Nós cremos que Tu és o Deus que habita no lar — ' +
            'que quando Tu entras, algo muda. Por isso, entregamos cada família em Tuas mãos. O que não ' +
            'conseguimos resolver, deixamos com o Senhor. O que não conseguimos ver, confiamos ao Teu ' +
            'cuidado. Em nome de Jesus.',
        bastidores: [
            { t: 'Caminho', d: 'Famílias → filhos → pressões e decisões → sabedoria → fé → entrega.' },
            { t: 'Ponte 1', d: 'Parte → Todo, logo na abertura: uma família, todas as famílias.' },
            { t: 'Ponte 2', d: 'Situação → Necessidade: as pressões pedem sabedoria.' },
            { t: 'Ponte 4', d: 'Fé → Entrega: "por isso" é a articulação inteira da ponte.' }
        ]
    },
    {
        id: 'profundidade-familias',
        titulo: 'Quando a oração enxerga o que não foi dito',
        contexto: 'Oração pelas famílias da igreja, com os 5 Níveis de profundidade em ação.',
        oracao: 'Senhor, nós nos aproximamos de Ti sabendo que Tu conheces cada família que está aqui hoje. ' +
            'Não apenas os nomes e os rostos — mas o que está dentro, o que está guardado, o que ainda não ' +
            'encontrou palavras para ser dito. Tu conheces as decisões que estão sendo adiadas por medo. Os ' +
            'desgastes que continuam em silêncio porque não há espaço para falar. Os filhos que estão ' +
            'percebendo coisas que os pais gostariam que eles não percebessem. As preocupações financeiras ' +
            'que chegam antes do amanhecer. O cansaço de quem continua mesmo sem saber como. Senhor, nós ' +
            'não precisamos de palavras difíceis para chegar até Ti. Precisamos de Ti. Dá sabedoria para as ' +
            'decisões que estão por vir. Sustenta os corações que estão fraturados por dentro. Lembra cada ' +
            'família presente de que Tu estás no meio delas — não como observador distante, mas como Deus ' +
            'que cuida. Nós entregamos o que não conseguimos resolver, o que não sabemos carregar e o que ' +
            'não temos palavras para nomear. Em Tuas mãos, Senhor.',
        bastidores: [
            { t: 'Nível 1', d: 'O que está acontecendo: decisões adiadas, desgastes, preocupações.' },
            { t: 'Nível 2', d: 'O que isso está causando: medo, silêncio, cansaço.' },
            { t: 'Nível 3', d: 'Do que precisam de verdade: sabedoria e sustento, não bênção genérica.' },
            { t: 'Nível 4', d: 'Quem Deus é diante disso: não observador distante, mas Deus que cuida.' },
            { t: 'Nível 5', d: 'O que se entrega: o que não se resolve, não se carrega e não se nomeia.' }
        ]
    },
    {
        id: 'sob-pressao',
        titulo: 'Chamado de surpresa',
        contexto: 'Uma pessoa é chamada sem aviso para orar pelas famílias da igreja. Antes de falar, organiza o estado mental: "não preciso impressionar; preciso servir e dar o próximo passo".',
        oracao: 'Senhor, nós nos colocamos diante de Ti representando as famílias desta igreja. Famílias ' +
            'reais, com dias difíceis, com decisões que pesam, com coisas que ficam sem resposta. Tu ' +
            'conheces cada uma delas pelo nome. Conheces o que não foi dito em voz alta, o que está ' +
            'guardado dentro de quem está aqui hoje. Por isso não viemos com palavras elaboradas. Viemos ' +
            'com o que temos. Senhor, sustenta as uniões que estão cansadas. Traz sabedoria para os pais e ' +
            'as mães que não sabem o que fazer pelos seus filhos. Reacende a esperança nos lares onde o ' +
            'medo tentou ocupar o lugar da fé. E que cada família que sair daqui hoje saia sabendo que não ' +
            'está sozinha. Em nome de Jesus, amém.',
        bastidores: [
            { t: 'Estado mental', d: 'Serviço no lugar de performance — é isso que permite executar sob pressão.' },
            { t: 'ALTAR', d: 'Propósito, momento, caminho, congregação e confiança, todos presentes e nenhum anunciado.' },
            { t: '5 Ângulos', d: 'Pessoas, situações, necessidades, fé e entrega, na ordem que a oração pediu.' },
            { t: '5 Níveis', d: 'Foi além do pedido: "o que não foi dito em voz alta".' }
        ]
    }
];

/* Antes e depois — a mesma intenção, com e sem percepção (Módulo 6). */
A.ANTES_DEPOIS = [
    {
        tema: 'Pelos jovens da igreja',
        antes: 'Senhor, abençoa os jovens dessa igreja. Dá sabedoria para eles. Guarda suas vidas.',
        depois: 'Senhor, Tu conheces as escolhas que nossos jovens precisam fazer todos os dias. Muitos estão ' +
            'tentando descobrir quem são, que caminho seguir e como permanecer firmes em meio a tantas vozes. ' +
            'Dá sabedoria para escolherem aquilo que honra a Ti. Quando estiverem inseguros, lembra-os de que ' +
            'não precisam caminhar sozinhos. Guarda o coração deles e conduz seus passos.',
        oque: [
            'Percebe a realidade: escolhas difíceis, busca de identidade, tantas vozes.',
            'Reconhece a experiência: insegurança e peso de caminhar sem certeza.',
            'Identifica a necessidade: sabedoria específica, companhia real, direção concreta.',
            'Conecta à fé e conduz à entrega, em vez de terminar em lista de pedidos.'
        ]
    },
    {
        tema: 'Oração em lista × oração com conexões',
        antes: 'Senhor, cuida da nossa família. Abençoa nosso trabalho. Abençoa nossa igreja. Cuida da nossa ' +
            'saúde. Abençoa nossos amigos. Guarda o nosso governo. Provê as nossas finanças.',
        depois: 'Senhor, cuida da nossa família. Especialmente dos nossos filhos, que estão em uma fase de ' +
            'tantas decisões. Dá sabedoria para que saibam escolher o caminho certo. E nós confiamos que Tu ' +
            'podes guiá-los. Por isso, entregamos o futuro deles em Tuas mãos.',
        oque: [
            'Cada pedido da primeira é legítimo — o que falta é conexão entre eles.',
            'A segunda talvez use menos palavras, e mesmo assim leva quem ouve por um caminho.',
            'Nenhuma ideia foi colocada ali por acaso: cada uma nasceu da anterior.'
        ]
    },
    {
        tema: 'Listar × desenvolver',
        antes: 'Senhor, abençoa minha família, meu trabalho, minha igreja, meus amigos, minha saúde, meu ' +
            'pastor, meu país...',
        depois: 'Senhor, abençoa minha família. Cuida especialmente dos meus filhos, que estão enfrentando uma ' +
            'fase difícil. Dá sabedoria ao meu marido nas decisões que ele precisa tomar. Traz paz para dentro ' +
            'da nossa casa...',
        oque: [
            'A primeira passa por tudo sem entrar em nada. Existe movimento, não profundidade.',
            'A segunda permanece: pessoas concretas, situações reais, necessidades verdadeiras.',
            'A diferença não é tamanho. É permanência.'
        ]
    },
    {
        tema: 'Abertura genérica × abertura contextual',
        antes: 'Senhor, nós Te louvamos, Te bendizemos e Te glorificamos...',
        depois: 'Senhor, chegamos aqui depois de uma semana difícil, mas com o coração disposto a Te buscar.',
        oque: [
            'Não há nada de errado com palavras de louvor.',
            'Mas quando essa é a abertura automática de qualquer situação — culto, célula, hospital, velório — ' +
            'ela desconecta a oração do momento real.',
            'A abertura contextual cria conexão porque toca algo que as pessoas estão sentindo agora.'
        ]
    },
    {
        tema: 'Palavras bonitas × detalhes verdadeiros',
        antes: 'Ó Eterno e Soberano Senhor dos exércitos celestes, em Tua magnânima e inesgotável misericórdia...',
        depois: 'Senhor, essa família está cansada. Eles têm tentado, mas estão no limite. Nós confiamos que Tu ' +
            'estás dentro dessa história.',
        oque: [
            'A primeira pode ser genuína — mas também pode ser um escudo.',
            'A segunda é simples, verdadeira e específica.',
            'Quem está ouvindo sente que essa oração pertence a eles.'
        ]
    }
];
