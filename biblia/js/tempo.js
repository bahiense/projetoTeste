/* =========================================================
   LINHA DO TEMPO — onde cada capítulo está na história
   do povo de Deus.

   Diferente do mapa (nem todo capítulo cita uma cidade), TODO
   capítulo da Bíblia foi escrito ou acontece num ponto da
   história da redenção: antes ou depois da unificação dos
   reinos, sob Davi ou sob Ezequias, debaixo do Egito, da
   Assíria, da Babilônia, da Pérsia ou de Roma.

   Este módulo situa qualquer um dos 1.189 capítulos (ou 66
   livros) em duas escalas:
   1. A Grande Linha do Tempo (12 eras, da Criação à Consumação),
      para ver de relance onde estamos no todo;
   2. O recorte exato do capítulo: data aproximada, quem reina
      no povo de Deus, qual império domina o mundo bíblico, a
      situação política dos reinos e o que está acontecendo ali.
   ========================================================= */
window.B = window.B || {};

B.tempo = (function () {
    'use strict';

    /* As 12 grandes eras da história bíblica, em ordem cronológica. */
    var ERAS = [
        {
            id: 'origens',
            ordem: 1,
            nome: 'Origens: Criação, Queda e Dilúvio',
            curto: 'Origens',
            data: 'Antes de ~2000 a.C.',
            imperio: 'Mesopotâmia arcaica (sem império mundial)',
            governante: 'Patriarcas pré-diluvianos (Adão a Noé)',
            situacaoReino: 'Humanidade primordial — antes da formação do povo de Israel',
            resumo: 'Da criação do mundo e queda no Éden até o dilúvio de Noé e a dispersão das nações na Torre de Babel.',
            livros: 'Gênesis 1–11',
            marco: 'Aliança com Noé e dispersão em Babel'
        },
        {
            id: 'patriarcas',
            ordem: 2,
            nome: 'Os Patriarcas (Abraão, Isaque, Jacó e José)',
            curto: 'Patriarcas',
            data: '~2000 a 1650 a.C.',
            imperio: 'Cidades-estado de Canaã e Império Egípcio (Médio Império / Hicsos)',
            governante: 'Patriarcas da Aliança: Abraão, Isaque, Jacó (Israel) e José',
            situacaoReino: 'Família-aliança peregrina em Canaã, que desce ao Egito com 70 pessoas',
            resumo: 'Deus chama Abraão de Ur dos Caldeus, promete uma terra, uma nação e a bênção a todas as famílias da terra, preservando a família no Egito por meio de José.',
            livros: 'Gênesis 12–50 · Jó',
            marco: 'Chamado de Abraão (~2000 a.C.) e descida ao Egito'
        },
        {
            id: 'exodo',
            ordem: 3,
            nome: 'Êxodo, Sinai e Peregrinação no Deserto',
            curto: 'Êxodo e Lei',
            data: '~1446 a 1406 a.C. (ou ~1260 a 1220 a.C.)',
            imperio: 'Império Egípcio (Novo Império — Faraós do Egito)',
            governante: 'Moisés (líder e profeta) e Arão (sumo sacerdote)',
            situacaoReino: 'Povo liberto da escravidão no Egito e constituído como nação santa no Monte Sinai',
            resumo: 'A libertação do Egito pelas dez pragas e Páscoa, a travessia do Mar Vermelho, a entrega da Lei e do Tabernáculo no Sinai e os 40 anos no deserto até as campinas de Moabe.',
            livros: 'Êxodo · Levítico · Números · Deuteronômio',
            marco: 'Saída do Egito e Aliança no Monte Sinai'
        },
        {
            id: 'juizes',
            ordem: 4,
            nome: 'Conquista de Canaã e Época dos Juízes',
            curto: 'Conquista e Juízes',
            data: '~1406 a 1050 a.C.',
            imperio: 'Povos vizinhos (Filisteus, Cananeus, Midianitas, Moabitas, Amonitas)',
            governante: 'Josué e os Juízes (Otoniel, Débora, Gideão, Jefté, Sansão, Eli, Samuel)',
            situacaoReino: 'Confederação das 12 tribos sem rei humano ("Naqueles dias não havia rei em Israel")',
            resumo: 'Entrada na Terra Prometida e partilha entre as doze tribos, seguida por séculos de ciclos de apostasia, opressão estrangeira, clamor e libertação por meio dos juízes.',
            livros: 'Josué · Juízes · Rute · 1 Samuel 1–7',
            marco: 'Partilha de Canaã e transição com o profeta Samuel'
        },
        {
            id: 'reino-unido',
            ordem: 5,
            nome: 'Reino Unido de Israel (Unificação dos Reinos)',
            curto: 'Reino Unido',
            data: '~1050 a 931 a.C.',
            imperio: 'Hegemonia regional de Israel (Egito e Assíria retraídos)',
            governante: 'Reis do Reino Unido: Saul (1050–1010), Davi (1010–970) e Salomão (970–931 a.C.)',
            situacaoReino: 'Unificação dos Reinos — as 12 tribos unidas sob um só trono em Jerusalém',
            resumo: 'Israel pede um rei. Saul inicia a monarquia; Davi unifica todas as tribos, conquista Jerusalém e recebe a promessa do trono eterno; Salomão edifica o Primeiro Templo e leva o reino ao auge.',
            livros: '1 Samuel 8–31 · 2 Samuel · 1 Reis 1–11 · 1 Crônicas · 2 Crônicas 1–9 · Salmos · Provérbios · Eclesiastes · Cânticos',
            marco: 'Aliança Davídica (~1000 a.C.) e 1º Templo (~960 a.C.)'
        },
        {
            id: 'reino-dividido',
            ordem: 6,
            nome: 'Reino Dividido: Israel (Norte) e Judá (Sul)',
            curto: 'Reino Dividido',
            data: '931 a 722 a.C.',
            imperio: 'Arã-Damasco (Síria) e ascensão do Império Assírio (Tiglate-Pileser III a Sargão II)',
            governante: 'No Sul (Judá, casa de Davi): Roboão, Asa, Josafá, Uzias, Acaz · No Norte (Israel): Jeroboão I, Onri, Acabe, Jeú, Jeroboão II, Oséias',
            situacaoReino: 'Cisma de 931 a.C.: 10 tribos formam o Reino do Norte (Israel/Samaria) e 2 permanecem no Sul (Judá/Jerusalém)',
            resumo: 'Após a morte de Salomão, o reino se divide em dois. O Norte mergulha na idolatria apesar de Elias, Eliseu, Amós e Oséias, até Samaria cair diante do Império Assírio em 722 a.C.',
            livros: '1 Reis 12–22 · 2 Reis 1–17 · 2 Crônicas 10–28 · Jonas · Amós · Oséias · Joel · Isaías 1–35 · Miquéias',
            marco: 'Divisão em 931 a.C. e Queda de Samaria (Norte) para a Assíria em 722 a.C.'
        },
        {
            id: 'juda-sozinho',
            ordem: 7,
            nome: 'Reino de Judá Sozinho (Da Assíria à Babilônia)',
            curto: 'Judá Sozinho',
            data: '722 a 586 a.C.',
            imperio: 'Império Assírio (Senaqueribe) → Império Babilônico (Nabucodonosor II)',
            governante: 'Reis de Judá: Ezequias (715–686), Manassés (697–642), Josias (640–609), Jeoiaquim, Joaquim e Zedequias (597–586 a.C.)',
            situacaoReino: 'Apenas o Reino do Sul (Judá) sobrevive após a queda de Israel, até a destruição de Jerusalém em 586 a.C.',
            resumo: 'Judá resiste ao cerco assírio nos dias de Ezequias e vive o reavivamento de Josias, mas recai na idolatria e injustiça. Nabucodonosor, rei da Babilônia, sitia e destrói Jerusalém e o Templo em 586 a.C.',
            livros: '2 Reis 18–25 · 2 Crônicas 29–36 · Isaías 36–66 · Naum · Habacuque · Sofonias · Jeremias · Obadias · Lamentações',
            marco: 'Reforma de Josias (622 a.C.) e Queda de Jerusalém para a Babilônia (586 a.C.)'
        },
        {
            id: 'exilio',
            ordem: 8,
            nome: 'Exílio na Babilônia (O Cativeiro)',
            curto: 'Exílio Babilônico',
            data: '605 / 586 a 539 a.C.',
            imperio: 'Império Babilônico / Neobabilônico (Nabucodonosor II, Evil-Merodaque, Nabonido, Belsazar)',
            governante: 'Sem rei no trono em Jerusalém (Joaquim cativo; Daniel na corte; Ezequiel junto ao rio Quebar)',
            situacaoReino: 'Judá devastada e sem Templo; elite e povo deportados na Mesopotâmia sob domínio da Babilônia',
            resumo: 'Fora da terra e sem o Templo, Deus preserva o remanescente fiel na Babilônia, demonstrando Sua soberania sobre os impérios através de Daniel e prometendo um coração novo por meio de Ezequiel.',
            livros: 'Ezequiel · Daniel 1–5 · Salmo 137',
            marco: 'Deportações (605, 597, 586 a.C.) e queda da Babilônia (539 a.C.)'
        },
        {
            id: 'persia',
            ordem: 9,
            nome: 'Retorno e Restauração (Período Persa)',
            curto: 'Império Persa',
            data: '539 a ~400 a.C.',
            imperio: 'Império Persa / Medo-Persa (Ciro, o Grande; Dario I; Xerxes/Assuero; Artaxerxes I)',
            governante: 'Governadores em Judá: Zorobabel e Neemias · Sacerdote Josué e escriba Esdras · Rainha Ester em Susã',
            situacaoReino: 'Província persa de Judá (Yehud) — Templo e muros reconstruídos, mas sem rei independente no trono',
            resumo: 'Ciro da Pérsia conquista a Babilônia (539 a.C.) e autoriza a volta dos judeus (538 a.C.). Zorobabel reconstrói o Templo (516 a.C.), Ester salva o povo na Pérsia, Esdras restaura a Lei (458 a.C.) e Neemias reergue os muros (445 a.C.).',
            livros: 'Daniel 6–12 · Esdras · Neemias · Ester · Ageu · Zacarias · Malaquias',
            marco: 'Decreto de Ciro (538 a.C.), 2º Templo (516 a.C.) e Muros de Neemias (445 a.C.)'
        },
        {
            id: 'interbiblico',
            ordem: 10,
            nome: 'Período Interbíblico: Grécia, Macabeus e Roma',
            curto: 'Grécia e Roma',
            data: '~400 a 5 a.C.',
            imperio: 'Império Grego (Alexandre, Ptolomeus, Selêucidas) → Macabeus → Império Romano (63 a.C.)',
            governante: 'Alexandre, o Grande (332 a.C.) → Dinastia Hasmoneia → General Pompeu e Rei Herodes, o Grande (sob Roma)',
            situacaoReino: 'Ponte entre o Antigo e o Novo Testamento: difusão da língua grega, sinagogas e domínio militar romano',
            resumo: 'Quatro séculos entre Malaquias e a vinda de Jesus (profetizados em Daniel 8 e 11): o Império Grego espalha o idioma grego (Septuaginta), os Macabeus resistem a Antíoco Epifânio e o Império Romano assume o controle da Judeia em 63 a.C.',
            livros: 'Profetizado em Daniel 8 e 11 (pano de fundo histórico do Novo Testamento)',
            marco: 'Alexandre (332 a.C.), Revolta Macabeia (167 a.C.) e conquista romana (63 a.C.)'
        },
        {
            id: 'evangelhos',
            ordem: 11,
            nome: 'Vida, Morte e Ressurreição de Jesus (Evangelhos)',
            curto: 'Vida de Jesus',
            data: '~5 a.C. a 30/33 d.C.',
            imperio: 'Império Romano (Imperadores César Augusto [27 a.C.–14 d.C.] e Tibério César [14–37 d.C.])',
            governante: 'Rei Herodes, o Grande (até 4 a.C.) · Herodes Antipas (Galileia) · Governador Pôncio Pilatos (Judeia, 26–36 d.C.)',
            situacaoReino: 'Judeia e Galileia sob ocupação do Império Romano; chegada do Rei Messias e inauguração do Reino de Deus',
            resumo: 'Na plenitude dos tempos, sob a Pax Romana, nasce Jesus em Belém. Seu ministério na Galileia e em Jerusalém culmina na cruz e na ressurreição sob o governo de Pôncio Pilatos.',
            livros: 'Mateus · Marcos · Lucas · João',
            marco: 'Encarnação (~5 a.C.) e Cruz e Ressurreição de Cristo (30/33 d.C.)'
        },
        {
            id: 'igreja',
            ordem: 12,
            nome: 'Igreja Primitiva, Epístolas e Consumação',
            curto: 'Igreja e Império Romano',
            data: '30/33 a ~96 d.C.',
            imperio: 'Império Romano (Imperadores Tibério, Calígula, Cláudio [41–54], Nero [54–68] e Domiciano [81–96 d.C.])',
            governante: 'Reis Herodes Agripa I e II; procuradores romanos Félix e Festo · Apóstolos Pedro, Tiago, Paulo e João',
            situacaoReino: 'O povo de Deus reúne judeus e gentios de Jerusalém a Roma, aguardando a volta gloriosa de Cristo',
            resumo: 'Do Pentecostes em Jerusalém às viagens de Paulo pelo mundo greco-romano, as cartas apostólicas edificam as igrejas sob crescente perseguição imperial (Nero e Domiciano), culminando na visão do Apocalipse.',
            livros: 'Atos · Romanos a Filemom · Hebreus a Apocalipse',
            marco: 'Pentecostes (30/33 d.C.), Missões de Paulo (46–64 d.C.) e Apocalipse (~95 d.C.)'
        }
    ];

    var POR_ID = {};
    ERAS.forEach(function (e) { POR_ID[e.id] = e; });

    /* Contexto padrão de cada um dos 66 livros (USFM). */
    var POR_LIVRO = {
        GEN: {
            era: 'patriarcas',
            data: 'Origens até ~1650 a.C.',
            reinado: 'Patriarcas: Adão a Noé (caps. 1–11) · Abraão, Isaque, Jacó e José (caps. 12–50)',
            imperio: 'Mesopotâmia, Canaã e Império Egípcio',
            situacao: 'Da criação das nações à formação da família da aliança e descida ao Egito',
            contexto: 'Começa nas origens do mundo (1–11) e acompanha quatro gerações de patriarcas (12–50) até Israel se estabelecer no Egito.'
        },
        EXO: {
            era: 'exodo',
            data: '~1446 a.C. (ou ~1260 a.C.)',
            reinado: 'Moisés (líder profético) e Arão · Faraó do Egito',
            imperio: 'Império Egípcio (Novo Império)',
            situacao: 'Libertação da escravidão no Egito e pacto nacional no Monte Sinai',
            contexto: 'Israel sai do cativeiro egípcio (caps. 1–18), recebe os Dez Mandamentos e a Aliança no Sinai (19–24) e ergue o Tabernáculo (25–40).'
        },
        LEV: {
            era: 'exodo',
            data: '~1445 a.C. (1º mês do 2º ano após o Êxodo)',
            reinado: 'Moisés e o sumo sacerdote Arão',
            imperio: 'Fora do domínio egípcio — acampados ao pé do Monte Sinai',
            situacao: 'Nação recém-liberta organizada ao redor do Tabernáculo da Presença de Deus',
            contexto: 'Dado no Monte Sinai logo após a construção do Tabernáculo: sacrifícios, sacerdócio, pureza, Dia da Expiação (cap. 16) e santidade.'
        },
        NUM: {
            era: 'exodo',
            data: '~1445 a 1406 a.C. (39 anos de peregrinação)',
            reinado: 'Moisés, Arão e Josué',
            imperio: 'Deserto do Sinai, Edom e campinas de Moabe (Rei Balaque)',
            situacao: 'Travessia pelo deserto: a geração incrédula cai e a nova geração chega à fronteira de Canaã',
            contexto: 'Do censo no Sinai (caps. 1–10) à crise de Cades-Barneia (13–14), os anos no deserto e a chegada às margens do Jordão (22–36).'
        },
        DEU: {
            era: 'exodo',
            data: '~1406 a.C. (último mês da vida de Moisés)',
            reinado: 'Moisés transmitindo a liderança a Josué',
            imperio: 'Campinas de Moabe, às margens do rio Jordão',
            situacao: 'Renovação da Aliança com a segunda geração, pronta para entrar em Canaã',
            contexto: 'Três discursos de despedida de Moisés recapitulando a jornada, renovando a Lei e preparando o povo para viver na Terra Prometida.'
        },
        JOS: {
            era: 'juizes',
            data: '~1406 a 1375 a.C.',
            reinado: 'Josué (sucessor de Moisés) e anciãos das 12 tribos',
            imperio: 'Reis das cidades-estado cananeias (Jericó, Ai, Hazor e coalizões do Sul e Norte)',
            situacao: 'Conquista e divisão da Terra Prometida entre as doze tribos de Israel',
            contexto: 'Travessia do Jordão e tomada da terra (caps. 1–12), partilha das heranças tribais (13–21) e renovação da aliança em Siquém (22–24).'
        },
        JDG: {
            era: 'juizes',
            data: '~1375 a 1050 a.C.',
            reinado: 'Sem rei — Juízes libertadores (Otoniel, Eúde, Débora, Gideão, Jefté, Sansão)',
            imperio: 'Opressores regionais: Mesopotâmia, Moabe, Canaã, Midiã, Amom e Filístia',
            situacao: 'Confederação tribal descentralizada: "Naqueles dias não havia rei em Israel; cada um fazia o que parecia reto aos seus olhos"',
            contexto: 'Ciclos repetidos de idolatria, servidão a povos vizinhos, clamor a Deus e libertação militar pelos juízes levantados pelo Senhor.'
        },
        RUT: {
            era: 'juizes',
            data: '~1150 a 1100 a.C. ("nos dias em que julgavam os juízes")',
            reinado: 'Sem rei em Israel — época dos Juízes (ancestrais do Rei Davi)',
            imperio: 'Paz local entre Belém de Judá e Moabe',
            situacao: 'Vida cotidiana em Belém preparando a genealogia real de Davi (Boaz e Rute → Obede → Jessé → Davi)',
            contexto: 'Enquanto Israel vive a turbulência dos juízes, Deus preserva em Belém a linhagem de onde nascerão o rei Davi e o Messias.'
        },
        '1SA': {
            era: 'reino-unido',
            data: '~1100 a 1010 a.C.',
            reinado: 'Juiz Eli e Profeta Samuel (caps. 1–7) → Rei Saul (caps. 8–31) e unção de Davi',
            imperio: 'Ameaça constante dos Filisteus na costa e planícies',
            situacao: 'Transição histórica das tribos sob os Juízes para a Monarquia Unificada',
            contexto: 'Marca a grande virada política de Israel: o fim dos juízes com Samuel, o reinado trágico de Saul e a preparação de Davi.'
        },
        '2SA': {
            era: 'reino-unido',
            data: '1010 a 970 a.C. (40 anos de reinado)',
            reinado: 'Rei Davi (primeiro em Hebrom sobre Judá, depois em Jerusalém sobre todo o Israel)',
            imperio: 'Hegemonia de Israel sobre Filístia, Moabe, Edom, Amom e Síria (Arã)',
            situacao: 'Unificação dos Reinos: todas as 12 tribos unidas com capital em Jerusalém',
            contexto: 'A consolidação do Reino Unido sob Davi, a aliança do trono eterno (cap. 7) e as crises familiares após o pecado com Bate-Seba (caps. 11–20).'
        },
        '1KI': {
            era: 'reino-dividido',
            data: '970 a 853 a.C.',
            reinado: 'Rei Salomão (caps. 1–11) → Divisão do Reino (cap. 12): Roboão a Josafá (Judá) e Jeroboão I a Acabe (Israel)',
            imperio: 'Auge de Israel sob Salomão → pressão do Egito (Sisaque) e da Síria (Ben-Hadade)',
            situacao: 'Do auge do Reino Unido e construção do Templo (1–11) ao Cisma de 931 a.C. que separa Israel (Norte) e Judá (Sul) (12–22)',
            contexto: 'Mostra a glória do Templo de Salomão, sua queda na idolatria, a ruptura do reino em dois em 931 a.C. e o confronto do profeta Elias contra Acabe.'
        },
        '2KI': {
            era: 'juda-sozinho',
            data: '853 a 586 a.C.',
            reinado: 'Reis de Israel (até Oséias, 722 a.C.) e Reis de Judá (até Zedequias, 586 a.C.)',
            imperio: 'Império Assírio (destrói o Norte em 722 a.C.) → Império Babilônico (destrói o Sul em 586 a.C.)',
            situacao: 'Declínio dos dois reinos: queda de Israel para a Assíria (cap. 17) e queda de Judá para a Babilônia (cap. 25)',
            contexto: 'Do ministério de Eliseu à queda de Samaria diante da Assíria (722 a.C.), as reformas de Ezequias e Josias em Judá e o exílio babilônico (586 a.C.).'
        },
        '1CH': {
            era: 'reino-unido',
            data: 'Reinado de Davi: 1010 a 970 a.C. (escrito no pós-exílio, ~450 a.C.)',
            reinado: 'Rei Davi sobre todo o Israel unido',
            imperio: 'Supremacia do Reino Unido de Israel (perspectiva sacerdotal pós-exílica)',
            situacao: 'Unificação das 12 tribos ao redor da Arca da Aliança e preparação do Templo em Jerusalém',
            contexto: 'Das genealogias desde Adão (caps. 1–9) ao reinado de Davi (10–29), destacando a aliança davídica e a organização do culto e do futuro Templo.'
        },
        '2CH': {
            era: 'juda-sozinho',
            data: '970 a 538 a.C. (de Salomão ao Decreto de Ciro)',
            reinado: 'Salomão (caps. 1–9) e os Reis da linhagem de Davi em Judá: de Roboão a Zedequias (caps. 10–36)',
            imperio: 'Egito → Império Assírio → Império Babilônico → Decreto de Ciro (Império Persa)',
            situacao: 'Foco exclusivo no Reino do Sul (Judá) e no Templo de Jerusalém, da edificação à queda e promessa de retorno',
            contexto: 'Acompanha a casa de Davi em Judá: o Templo de Salomão, os reis reformadores (Asa, Josafá, Ezequias, Josias), a queda para a Babilônia e o edito persa de Ciro.'
        },
        EZR: {
            era: 'persia',
            data: '538 a 458 a.C.',
            reinado: 'Líderes em Judá: Zorobabel e sumo sacerdote Josué (caps. 1–6) · Escriba Esdras (caps. 7–10)',
            imperio: 'Império Persa — Reis Ciro (538 a.C.), Dario I (520–516 a.C.) e Artaxerxes I (458 a.C.)',
            situacao: 'Fim do cativeiro babilônico: Judá como província persa reconstruindo o Templo e restaurando a Lei',
            contexto: 'Primeira leva de exilados reconstrói o altar e o Segundo Templo (caps. 1–6); oitenta anos depois, Esdras chega para ensinar a Lei e reformar a comunidade (7–10).'
        },
        NEH: {
            era: 'persia',
            data: '445 a ~430 a.C.',
            reinado: 'Governador Neemias e escriba Esdras em Jerusalém',
            imperio: 'Império Persa — Rei Artaxerxes I Longímano (465–424 a.C.)',
            situacao: 'Província persa de Judá (Yehud): reconstrução dos muros de Jerusalém e renovação da Aliança',
            contexto: 'Neemias, copeiro do rei persa Artaxerxes, recebe autorização para reerguer em 52 dias os muros de Jerusalém e liderar com Esdras o avivamento do povo.'
        },
        EST: {
            era: 'persia',
            data: '483 a 473 a.C. (entre os capítulos 6 e 7 de Esdras)',
            reinado: 'Rainha Ester e Mordecai na corte persa',
            imperio: 'Império Persa — Rei Assuero (Xerxes I, 486–465 a.C.), na capital Susã',
            situacao: 'Judeus da diáspora espalhados pelas 127 províncias do Império Persa',
            contexto: 'Enquanto um remanescente já havia voltado a Jerusalém com Zorobabel, Deus livra do extermínio os judeus que permaneceram no Império Persa sob Xerxes.'
        },
        JOB: {
            era: 'patriarcas',
            data: 'Época Patriarcal (~2000 a 1800 a.C.)',
            reinado: 'Jó como patriarca e magistrado na terra de Uz (oriente de Canaã / Edom)',
            imperio: 'Fora dos grandes impérios — tribos seminômades (sabeus e caldeus antigos)',
            situacao: 'Sociedade patriarcal antes da Lei mosaica e do sacerdócio levítico (o pai de família oferece sacrifícios)',
            contexto: 'Ambientado na era dos patriarcas: a riqueza é medida em rebanhos, a longevidade lembra a de Abraão e Deus trata diretamente com o patriarca.'
        },
        PSA: {
            era: 'reino-unido',
            data: '~1410 a 450 a.C. (núcleo principal: ~1010–970 a.C.)',
            reinado: 'Maioria do Rei Davi e de Salomão (com salmos de Moisés [Sl 90] ao pós-exílio)',
            imperio: 'Principalmente Reino Unido de Israel (com cânticos do Exílio Babilônico e Retorno Persa)',
            situacao: 'Hinário do Templo de Jerusalém atravessando mil anos da história do povo de Deus',
            contexto: 'Reúne orações desde Moisés no deserto (Sl 90), o auge do Reino Unido sob Davi e Salomão, o clamor no cativeiro babilônico (Sl 137) até a restauração.'
        },
        PRO: {
            era: 'reino-unido',
            data: '~970 a 700 a.C.',
            reinado: 'Rei Salomão (970–931 a.C.), com coleção copiada pelos homens do Rei Ezequias (caps. 25–29)',
            imperio: 'Auge cultural e diplomático do Reino Unido de Israel',
            situacao: 'Monarquia Unificada em paz e prosperidade, formando jovens e governantes no temor do Senhor',
            contexto: 'Sabedoria real de Salomão no esplendor do Reino Unido, completada nos dias da reforma do rei Ezequias em Judá.'
        },
        ECC: {
            era: 'reino-unido',
            data: '~940 a 931 a.C. (tradição salomônica)',
            reinado: 'O Pregador (Qohelet), "filho de Davi, rei em Jerusalém" (Salomão na maturidade)',
            imperio: 'Reino Unido de Israel em paz e abundância material',
            situacao: 'Corte real de Jerusalém no auge da riqueza, refletindo sobre a brevidade da vida "debaixo do sol"',
            contexto: 'Examina o sentido da existência, do trabalho e do poder a partir do trono de Jerusalém, concluindo no temor a Deus.'
        },
        SNG: {
            era: 'reino-unido',
            data: '~965 a 931 a.C.',
            reinado: 'Rei Salomão (970–931 a.C.)',
            imperio: 'Reino Unido de Israel em tempos de paz e florescimento',
            situacao: 'Israel unificado, do Líbano ao Neguebe, celebrando o amor conjugal',
            contexto: 'Poema lírico ambientado nos dias de Salomão, celebrando a beleza e fidelidade do amor na aliança.'
        },
        ISA: {
            era: 'juda-sozinho',
            data: '~740 a 681 a.C. (com visão profética do exílio babilônico e retorno persa)',
            reinado: 'Reis de Judá: Uzias, Jotão, Acaz e Ezequias (Is 1.1)',
            imperio: 'Império Assírio (Tiglate-Pileser III a Senaqueribe) e anúncio profético da Babilônia e de Ciro (Pérsia)',
            situacao: 'Queda do Reino do Norte (722 a.C.) e sobrevivência de Judá sob ameaça assíria, olhando para o Messias',
            contexto: 'Isaías profetiza em Jerusalém durante a crise assíria (caps. 1–39) e consola o povo anunciando a libertação da Babilônia por Ciro e a obra do Servo Sofredor (40–66).'
        },
        JER: {
            era: 'juda-sozinho',
            data: '627 a ~580 a.C. (os últimos 40 anos do Reino de Judá)',
            reinado: 'Últimos cinco reis de Judá: Josias, Jeoacaz, Jeoiaquim, Joaquim e Zedequias',
            imperio: 'Queda da Assíria e domínio do Império Babilônico (Nabucodonosor II)',
            situacao: 'Agonia e queda final de Jerusalém e do Templo (586 a.C.), com deportação para a Babilônia',
            contexto: 'Jeremias anuncia o juízo babilônico sobre Judá impenitente, testemunha o cerco e a destruição de Jerusalém em 586 a.C. e promete a Nova Aliança (cap. 31).'
        },
        LAM: {
            era: 'juda-sozinho',
            data: '586 a.C. (logo após a destruição de Jerusalém)',
            reinado: 'Trono de Judá derrubado (Zedequias levado cativo para a Babilônia)',
            imperio: 'Império Babilônico (Nabucodonosor II)',
            situacao: 'Jerusalém e o Templo incendiados; povo levado ao exílio babilônico',
            contexto: 'Cinco poemas acrósticos de dor diante das ruínas fumegantes de Jerusalém em 586 a.C., afirmando no centro (cap. 3) que as misericórdias do Senhor não têm fim.'
        },
        EZK: {
            era: 'exilio',
            data: '593 a 571 a.C.',
            reinado: 'Sem rei — contado pelos anos do cativeiro do rei Joaquim (levado em 597 a.C.)',
            imperio: 'Império Babilônico (Nabucodonosor II)',
            situacao: 'Comunidade de exilados de Judá junto ao rio Quebar, na Babilônia',
            contexto: 'Levado na 2ª deportação (597 a.C.), Ezequiel anuncia na Babilônia a queda iminente de Jerusalém (caps. 1–24), o juízo das nações (25–32) e a restauração futura do povo e do Templo (33–48).'
        },
        DAN: {
            era: 'exilio',
            data: '605 a ~536 a.C. (do início ao fim do cativeiro)',
            reinado: 'Sem rei em Judá — Daniel como alto oficial nas cortes da Babilônia e da Pérsia',
            imperio: 'Império Babilônico (Nabucodonosor II, Belsazar) → Império Medo-Persa (Dario, Ciro)',
            situacao: 'Exílio na capital babilônica e transição para o domínio persa; visão dos quatro impérios mundiais',
            contexto: 'Levado em 605 a.C., Daniel atravessa todo o exílio babilônico até ver a queda da Babilônia (539 a.C.) e o governo de Ciro da Pérsia, revelando o plano de Deus sobre os impérios (Babilônia, Pérsia, Grécia e Roma).'
        },
        HOS: {
            era: 'reino-dividido',
            data: '~755 a 715 a.C.',
            reinado: 'No Norte (Israel): Jeroboão II até Oséias (último rei) · No Sul (Judá): Uzias, Jotão, Acaz e Ezequias',
            imperio: 'Império Assírio (Tiglate-Pileser III a Sargão II)',
            situacao: 'Últimas décadas do Reino do Norte (Israel/Samaria) antes de ser destruído pela Assíria em 722 a.C.',
            contexto: 'Oséias profetiza ao Reino do Norte em plena decadência moral e política, retratando com seu próprio casamento o amor fiel de Deus por um povo infiel.'
        },
        JOL: {
            era: 'reino-dividido',
            data: '~835 a.C. (ou pós-exílio, ~500 a.C.)',
            reinado: 'Reino de Judá em Jerusalém (frequentemente associado à menoridade do rei Joás e ao sacerdote Joiada)',
            imperio: 'Povos vizinhos (Fenícia, Filístia, Egito e Edom)',
            situacao: 'Reino do Sul (Judá) reunido em redor do Templo em Jerusalém diante de uma devastadora praga de gafanhotos',
            contexto: 'A partir de uma catástrofe agrícola em Judá, Joel convoca o arrependimento nacional e anuncia o "Dia do Senhor" e o derramamento do Espírito (citado em Atos 2).'
        },
        AMO: {
            era: 'reino-dividido',
            data: '~760 a 750 a.C.',
            reinado: 'Jeroboão II no Reino do Norte (Israel) · Uzias no Reino do Sul (Judá)',
            imperio: 'Véspera da grande expansão do Império Assírio',
            situacao: 'Reino Dividido no auge da riqueza econômica e militar, mas corrompido pela injustiça social e idolatria em Betel',
            contexto: 'Pastor de Tecoa (Judá) enviado ao rico Reino do Norte sob Jeroboão II para anunciar que a prosperidade sem justiça terminará no exílio assírio.'
        },
        OBA: {
            era: 'juda-sozinho',
            data: '~586 a.C. (logo após a queda de Jerusalém)',
            reinado: 'Queda do trono de Judá (Zedequias)',
            imperio: 'Império Babilônico (Nabucodonosor II)',
            situacao: 'Jerusalém saqueada pela Babilônia enquanto Edom (descendentes de Esaú) se alegra e entrega os fugitivos',
            contexto: 'Profecia contra Edom por trair seu irmão Judá no dia em que os babilônios destruíram Jerusalém.'
        },
        JON: {
            era: 'reino-dividido',
            data: '~780 a 755 a.C. (citado em 2 Reis 14.25)',
            reinado: 'Rei Jeroboão II no Reino do Norte (Israel)',
            imperio: 'Império Assírio (capital em Nínive, provavelmente sob Adade-Nirari III ou Assur-Dã III)',
            situacao: 'Reino do Norte (Israel) em expansão, enviado a pregar justamente à capital do futuro opressor assírio',
            contexto: 'Deus envia um profeta do Reino do Norte à temida Nínive, capital da Assíria, revelando Sua compaixão até pelos inimigos de Israel.'
        },
        MIC: {
            era: 'reino-dividido',
            data: '~735 a 700 a.C.',
            reinado: 'Reis de Judá: Jotão, Acaz e Ezequias (contemporâneo de Isaías)',
            imperio: 'Império Assírio (queda de Samaria em 722 a.C. e invasão de Judá por Senaqueribe em 701 a.C.)',
            situacao: 'Queda do Reino do Norte (Israel) e ameaça direta sobre Judá e Jerusalém',
            contexto: 'Do interior de Judá (Moresete), Miquéias denuncia a corrupção das capitais Samaria e Jerusalém e anuncia que de Belém sairá o Governante eterno (Mq 5.2).'
        },
        NAM: {
            era: 'juda-sozinho',
            data: '~650 a 612 a.C. (entre a queda de Tebas [663 a.C.] e a queda de Nínive [612 a.C.])',
            reinado: 'Rei Manassés ou Rei Josias em Judá',
            imperio: 'Declínio do Império Assírio e ascensão do Império Babilônico',
            situacao: 'Judá sob jugo assírio recebe a notícia de que Nínive, a capital opressora, será destruída',
            contexto: 'Mais de um século após Jonas, Nínive voltou à crueldade; Naum anuncia o juízo definitivo de Deus sobre a capital do Império Assírio (cumprido em 612 a.C.).'
        },
        HAB: {
            era: 'juda-sozinho',
            data: '~609 a 598 a.C.',
            reinado: 'Rei Jeoiaquim em Judá (após a morte de Josias)',
            imperio: 'Ascensão fulminante do Império Babilônico / Caldeu (Nabucodonosor II vence o Egito em Carquemis, 605 a.C.)',
            situacao: 'Reino de Judá às vésperas da invasão babilônica',
            contexto: 'Habacuque questiona a Deus sobre a injustiça em Judá e se espanta ao ouvir que o Senhor usará os babilônios (caldeus) como instrumento de juízo — aprendendo que "o justo viverá pela sua fé".'
        },
        ZEP: {
            era: 'juda-sozinho',
            data: '~640 a 621 a.C.',
            reinado: 'Rei Josias de Judá (bisneto do rei Ezequias)',
            imperio: 'Enfraquecimento da Assíria e aproximação da ameaça babilônica',
            situacao: 'Reino de Judá preparando a grande reforma religiosa do rei Josias',
            contexto: 'Sofonias, de sangue real, denuncia a idolatria em Jerusalém nos primeiros anos de Josias, anunciando o "Dia do Senhor" e a salvação de um remanescente humilde.'
        },
        HAG: {
            era: 'persia',
            data: '520 a.C. (entre agosto e dezembro do 2º ano do rei Dario)',
            reinado: 'Governador Zorobabel (neto do rei Joaquim) e sumo sacerdote Josué em Jerusalém',
            imperio: 'Império Persa — Rei Dario I, o Grande (522–486 a.C.)',
            situacao: 'Comunidade pós-exílica em Judá: a obra do 2º Templo estava parada havia 16 anos',
            contexto: 'Dezessete anos após o retorno da Babilônia, Ageu desperta Zorobabel e o povo a retomar e concluir a reconstrução do Templo de Jerusalém.'
        },
        ZEC: {
            era: 'persia',
            data: '520 a ~480 a.C.',
            reinado: 'Governador Zorobabel e sumo sacerdote Josué',
            imperio: 'Império Persa — Rei Dario I',
            situacao: 'Reconstrução do Segundo Templo em Jerusalém sob domínio persa',
            contexto: 'Ao lado de Ageu, Zacarias encoraja a reconstrução do Templo com visões noturnas e profecias luminosas sobre a vinda do Rei humilde, traspassado e vitorioso (caps. 9–14).'
        },
        MAL: {
            era: 'persia',
            data: '~450 a 430 a.C. (época de Esdras e Neemias)',
            reinado: 'Governador persa em Judá (provavelmente época de Neemias)',
            imperio: 'Império Persa — Rei Artaxerxes I',
            situacao: 'Templo e muros já reconstruídos, mas o povo caiu na frieza espiritual e no culto formalista',
            contexto: 'Última voz profética do Antigo Testamento: confronta sacerdotes e povo desanimados na província persa de Judá e promete o envio do precursor ("Elias" / João Batista) e o Sol da Justiça.'
        },
        MAT: {
            era: 'evangelhos',
            data: '~5 a.C. a 30/33 d.C. (escrito ~55–65 d.C.)',
            reinado: 'Rei Herodes, o Grande (cap. 2) · Herodes Antipas · Governador Pôncio Pilatos',
            imperio: 'Império Romano — Imperadores César Augusto e Tibério César',
            situacao: 'Judeia e Galileia sob domínio romano; Jesus é apresentado como o Messias prometido, Filho de Davi e de Abraão',
            contexto: 'Conecta o Antigo ao Novo Testamento mostrando em Jesus o cumprimento da linhagem real de Davi e das profecias messiânicas.'
        },
        MRK: {
            era: 'evangelhos',
            data: '~26 a 30/33 d.C. (escrito ~55–65 d.C., provavelmente em Roma)',
            reinado: 'Tetrarca Herodes Antipas (Galileia) · Governador Pôncio Pilatos (Judeia)',
            imperio: 'Império Romano — Imperador Tibério César',
            situacao: 'Terra de Israel ocupada por Roma; Jesus age como o Servo poderoso e sofredor que inaugura o Reino de Deus',
            contexto: 'Narrativa rápida e intensa do ministério público, paixão e ressurreição de Jesus, escrita especialmente para leitores do mundo romano.'
        },
        LUK: {
            era: 'evangelhos',
            data: '~6 a.C. a 30/33 d.C. (escrito ~59–62 d.C.)',
            reinado: 'Rei Herodes, o Grande (cap. 1) · Tetrarca Herodes Antipas · Governador Pôncio Pilatos · Sumos sacerdotes Anás e Caifás (Lc 3.1-2)',
            imperio: 'Império Romano — Imperadores César Augusto (Lc 2.1) e Tibério César (Lc 3.1)',
            situacao: 'Províncias romanas da Síria, Judeia e Galileia; Jesus é apresentado como o Salvador perfeito de toda a humanidade',
            contexto: 'Lucas ancora meticulosamente a vida de Jesus na história universal dos imperadores romanos e governadores da Judeia.'
        },
        JHN: {
            era: 'evangelhos',
            data: '~26 a 30/33 d.C. (escrito ~85–90 d.C. em Éfeso)',
            reinado: 'Governador romano Pôncio Pilatos · Sumos sacerdotes Anás e Caifás',
            imperio: 'Império Romano — Imperador Tibério César (no ministério de Jesus)',
            situacao: 'Judeia e Galileia sob ocupação romana; as festas judaicas no Templo de Jerusalém apontam para Cristo, o Verbo encarnado',
            contexto: 'Organizado em torno de sete sinais e das grandes festas em Jerusalém, revelando Jesus como o Filho eterno de Deus que veio habitar entre nós.'
        },
        ACT: {
            era: 'igreja',
            data: '30/33 a ~62 d.C.',
            reinado: 'Reis Herodes Agripa I (cap. 12) e Agripa II (caps. 25–26) · Procuradores romanos Félix e Festo',
            imperio: 'Império Romano — Imperadores Tibério (14–37), Calígula (37–41), Cláudio (41–54) e Nero (54–68 d.C.)',
            situacao: 'A Igreja nasce em Jerusalém e avança pela Judeia, Samaria, Síria, Ásia Menor e Grécia até chegar à capital do Império Romano',
            contexto: 'Trinta anos de expansão do Evangelho pelo poder do Espírito Santo: de Pedro em Jerusalém (caps. 1–12) a Paulo chegando a Roma (caps. 13–28).'
        },
        ROM: {
            era: 'igreja',
            data: '~57 d.C. (escrita de Corinto, no fim da 3ª viagem missionária)',
            reinado: 'Apóstolo Paulo escrevendo aos cristãos na capital do Império',
            imperio: 'Império Romano — início do reinado do Imperador Nero (54–68 d.C.)',
            situacao: 'Igreja em Roma (judeus que retornaram após o decreto de Cláudio e cristãos gentios) sob o centro do poder imperial',
            contexto: 'Paulo expõe de forma completa o Evangelho da justiça de Deus pela fé, unindo judeus e gentios num só povo de Deus e preparando sua visita a Roma.'
        },
        '1CO': {
            era: 'igreja',
            data: '~55 d.C. (escrita de Éfeso, durante a 3ª viagem missionária)',
            reinado: 'Procônsul romano na Acaia (época de Gálio, At 18.12)',
            imperio: 'Império Romano — transição entre os imperadores Cláudio e Nero',
            situacao: 'Igreja urbana na próspera colônia romana e porto comercial de Corinto, na Grécia',
            contexto: 'Paulo responde às divisões, questões morais, dúvidas sobre casamento, idolatria, Ceia do Senhor, dons espirituais e a ressurreição (cap. 15).'
        },
        '2CO': {
            era: 'igreja',
            data: '~55 a 56 d.C. (escrita da Macedônia)',
            reinado: 'Missão apostólica de Paulo na Grécia (Macedônia e Acaia)',
            imperio: 'Império Romano — Imperador Nero',
            situacao: 'Comunidade cristã em Corinto reconciliada após crise, mas assediada por falsos apóstolos triunfalistas',
            contexto: 'A carta mais pessoal de Paulo: defende o ministério da Nova Aliança, cuja força se aperfeiçoa na fraqueza e no sofrimento por Cristo.'
        },
        GAL: {
            era: 'igreja',
            data: '~48 a 49 d.C. (após a 1ª viagem) ou ~53–55 d.C.',
            reinado: 'Missão apostólica às igrejas da província romana da Galácia (Ásia Menor)',
            imperio: 'Império Romano — Imperador Cláudio (41–54 d.C.)',
            situacao: 'Primeiras igrejas gentílicas ameaçadas por judaizantes que exigiam a circuncisão e a lei cerimonial para a salvação',
            contexto: 'Carta da liberdade cristã: Paulo defende com urgência que somos justificados somente pela fé em Cristo, como filhos da promessa feita a Abraão.'
        },
        EPH: {
            era: 'igreja',
            data: '~60 a 62 d.C. (1ª prisão de Paulo em Roma)',
            reinado: 'Paulo prisioneiro em Roma por causa do Evangelho',
            imperio: 'Império Romano — Imperador Nero (54–68 d.C.)',
            situacao: 'Igrejas da Ásia Menor (capital em Éfeso, centro do culto a Ártemis) chamadas a viver como nova humanidade unida em Cristo',
            contexto: 'Da prisão em Roma, Paulo contempla o plano eterno de Deus de reunir todas as coisas em Cristo, derrubando a parede de separação entre judeus e gentios.'
        },
        PHP: {
            era: 'igreja',
            data: '~61 a 62 d.C. (1ª prisão de Paulo em Roma)',
            reinado: 'Paulo sob guarda pretoriana em Roma',
            imperio: 'Império Romano — Imperador Nero',
            situacao: 'Igreja em Filipos (colônia militar romana na Macedônia, primeira igreja fundada na Europa em ~49 d.C.)',
            contexto: 'Carta da alegria na prisão: Paulo agradece o socorro dos filipenses e os exorta à humildade de Cristo, que se esvaziou até a morte de cruz.'
        },
        COL: {
            era: 'igreja',
            data: '~60 a 62 d.C. (1ª prisão de Paulo em Roma)',
            reinado: 'Paulo prisioneiro em Roma; igreja fundada por Epafras no vale do rio Lico',
            imperio: 'Império Romano — Imperador Nero',
            situacao: 'Igreja em Colossos (Ásia Menor) diante de um sincretismo de filosofia pagã, culto a anjos e ascetismo legalista',
            contexto: 'Paulo proclama a supremacia e suficiência absoluta de Cristo — Criador, Cabeça da Igreja e plenitude da divindade.'
        },
        '1TH': {
            era: 'igreja',
            data: '~50 a 51 d.C. (escrita de Corinto na 2ª viagem missionária)',
            reinado: 'Magistrados locais (politarcas) de Tessalônica e procônsul Gálio na Acaia',
            imperio: 'Império Romano — Imperador Cláudio (41–54 d.C.)',
            situacao: 'Igreja recém-nascida em Tessalônica (capital da província romana da Macedônia), firme sob perseguição',
            contexto: 'Uma das primeiras cartas do Novo Testamento: consola novos convertidos perseguidos e esclarece a esperança da segunda vinda de Cristo.'
        },
        '2TH': {
            era: 'igreja',
            data: '~51 d.C. (poucos meses após 1 Tessalonicenses)',
            reinado: 'Missão de Paulo, Silvano e Timóteo em Corinto',
            imperio: 'Império Romano — Imperador Cláudio',
            situacao: 'Igreja perseguida em Tessalônica abalada por rumores de que o Dia do Senhor já havia chegado',
            contexto: 'Paulo corrige alarmes falsos sobre a volta de Cristo, explica os eventos que a precedem e exorta os irmãos ao trabalho perseverante.'
        },
        '1TI': {
            era: 'igreja',
            data: '~62 a 64 d.C. (após a 1ª prisão de Paulo em Roma)',
            reinado: 'Timóteo liderando a igreja em Éfeso como delegado apostólico de Paulo',
            imperio: 'Império Romano — Imperador Nero (54–68 d.C.)',
            situacao: 'Igrejas estabelecidas na província romana da Ásia precisando de liderança sólida contra falsos mestres',
            contexto: 'Primeira Carta Pastoral: orienta Timóteo sobre a sã doutrina, o culto público, os requisitos de presbíteros e diáconos e o cuidado pastoral da igreja.'
        },
        '2TI': {
            era: 'igreja',
            data: '~66 a 67 d.C. (2ª prisão de Paulo em Roma, pouco antes de seu martírio)',
            reinado: 'Paulo encarcerado no calabouço em Roma, entregando o bastão a Timóteo',
            imperio: 'Império Romano — Perseguição do Imperador Nero (após o incêndio de Roma em 64 d.C.)',
            situacao: 'O cristianismo passa a ser perseguido diretamente pelo Estado romano; despedida dos apóstolos',
            contexto: 'Testamento espiritual de Paulo ("Combati o bom combate"): encoraja Timóteo a não se envergonhar do Evangelho e a pregar a Palavra em todo tempo.'
        },
        TIT: {
            era: 'igreja',
            data: '~62 a 64 d.C. (entre a 1ª e a 2ª prisão de Paulo)',
            reinado: 'Tito organizando as igrejas na ilha de Creta',
            imperio: 'Império Romano — Imperador Nero',
            situacao: 'Jovens comunidades cristãs no Mediterrâneo (Creta) chamadas a testemunhar com boas obras em meio a uma cultura corrompida',
            contexto: 'Paulo instrui Tito a constituir presbíteros de caráter íntegro em cada cidade de Creta e a ensinar a graça salvadora que transforma a vida.'
        },
        PHM: {
            era: 'igreja',
            data: '~60 a 62 d.C. (enviada junto com Colossenses, da 1ª prisão em Roma)',
            reinado: 'Paulo prisioneiro em Roma escrevendo a Filemom, líder cristão em Colossos',
            imperio: 'Império Romano — Imperador Nero (sociedade baseada na escravidão romana)',
            situacao: 'A fraternidade do Evangelho confrontando por dentro as relações sociais do mundo greco-romano',
            contexto: 'Paulo intercede por Onésimo, escravo fugitivo que se converteu na prisão, pedindo que Filemom o receba não mais como escravo, mas como irmão amado.'
        },
        HEB: {
            era: 'igreja',
            data: '~64 a 68 d.C. (antes da destruição do Templo de Jerusalém em 70 d.C.)',
            reinado: 'Liderança da segunda geração cristã',
            imperio: 'Império Romano — época de Nero, às vésperas da Guerra Judaico-Romana (66–70 d.C.)',
            situacao: 'Cristãos de origem judaica tentados a abandonar a fé em Jesus e voltar aos rituais do Templo para escapar da perseguição',
            contexto: 'Demonstra que Cristo é infinitamente superior aos anjos, a Moisés, ao sacerdócio arônico e aos sacrifícios da Antiga Aliança, que eram sombras dEle.'
        },
        JAS: {
            era: 'igreja',
            data: '~45 a 49 d.C. (ou até ~60 d.C.; Tiago foi martirizado em 62 d.C.)',
            reinado: 'Tiago, irmão do Senhor, líder da igreja em Jerusalém',
            imperio: 'Império Romano — Imperador Cláudio (época de grande fome na Judeia, ~46 d.C.)',
            situacao: 'Primeiros cristãos judeus espalhados ("às doze tribos da Dispersão"), enfrentando pobreza e opressão de ricos',
            contexto: 'Uma das cartas mais antigas do Novo Testamento: sabedoria prática que exige coerência entre a fé professada e as obras de amor e justiça.'
        },
        '1PE': {
            era: 'igreja',
            data: '~62 a 64 d.C. (escrita de Roma, chamada figuradamente de "Babilônia")',
            reinado: 'Apóstolo Pedro escrevendo de Roma às igrejas da Ásia Menor',
            imperio: 'Império Romano — Imperador Nero (início das perseguições imperiais)',
            situacao: 'Cristãos tratados como "peregrinos e forasteiros" sob hostilidade social e iminente perseguição nas províncias romanas do Ponto, Galácia, Capadócia, Ásia e Bitínia',
            contexto: 'Pedro fortalece os cristãos sofredores lembrando-lhes sua viva esperança na ressurreição de Cristo e seu chamado como sacerdócio real.'
        },
        '2PE': {
            era: 'igreja',
            data: '~64 a 67 d.C. (pouco antes do martírio de Pedro em Roma)',
            reinado: 'Despedida apostólica de Simão Pedro',
            imperio: 'Império Romano — perseguição de Nero',
            situacao: 'Igrejas ameaçadas por dentro por falsos mestres libertinos que zombavam da promessa da segunda vinda de Cristo',
            contexto: 'Pedro lembra a certeza da Palavra profética e das Escrituras e garante que a aparente demora do Senhor é longanimidade para a salvação.'
        },
        '1JN': {
            era: 'igreja',
            data: '~85 a 95 d.C. (escrita de Éfeso pelo apóstolo João na velhice)',
            reinado: 'João, o último apóstolo vivo, pastoreando as igrejas da Ásia Menor',
            imperio: 'Império Romano — Imperador Domiciano (81–96 d.C.)',
            situacao: 'Igrejas da segunda/terceira geração enfrentando cismáticos pré-gnósticos que negavam a encarnação real de Jesus',
            contexto: 'João reafirma as três marcas da comunhão com Deus: crer que Jesus veio em carne, andar na luz da obediência e amar os irmãos de forma prática.'
        },
        '2JN': {
            era: 'igreja',
            data: '~85 a 95 d.C. (de Éfeso)',
            reinado: 'O Presbítero (apóstolo João)',
            imperio: 'Império Romano — Imperador Domiciano',
            situacao: 'Comunidade local da Ásia Menor ("a senhora eleita") visitada por pregadores itinerantes',
            contexto: 'Exorta a igreja a andar no amor e na verdade, sem dar acolhida a enganadores que negam a encarnação de Jesus Cristo.'
        },
        '3JN': {
            era: 'igreja',
            data: '~85 a 95 d.C. (de Éfeso)',
            reinado: 'O Presbítero (apóstolo João) escrevendo a Gaio',
            imperio: 'Império Romano — Imperador Domiciano',
            situacao: 'Vida cotidiana das igrejas da Ásia Menor no fim do século I',
            contexto: 'Elogia a hospitalidade fiel de Gaio aos missionários itinerantes, em contraste com o autoritarismo de Diótrefes.'
        },
        JUD: {
            era: 'igreja',
            data: '~65 a 80 d.C.',
            reinado: 'Judas, irmão de Tiago e meio-irmão de Jesus',
            imperio: 'Império Romano (final de Nero ou dinastia Flaviana)',
            situacao: 'Igrejas infiltradas por falsos mestres que transformavam a graça de Deus em libertinagem',
            contexto: 'Convocação urgente para "batalhar pela fé que uma vez por todas foi entregue aos santos", lembrando os juízos históricos de Deus e Seu poder de guardar os fiéis.'
        },
        REV: {
            era: 'igreja',
            data: '~95 d.C. (no final do século I)',
            reinado: 'Apóstolo João exilado na ilha de Patmos; Jesus Cristo revelado como Rei dos reis',
            imperio: 'Império Romano — Imperador Domiciano (81–96 d.C.), que exigia ser adorado como "Senhor e Deus"',
            situacao: 'Sete igrejas da província romana da Ásia sob pressão do culto ao imperador; visão da vitória final do Cordeiro e da Nova Jerusalém',
            contexto: 'Fecha o cânon bíblico desmascarando a pretensão dos impérios terrenos e mostrando que o trono do universo pertence a Deus e ao Cordeiro até os Novos Céus e Nova Terra.'
        }
    };

    /* Recortes finos por faixa de capítulos dentro dos livros que atravessam
       vários reinados, impérios ou períodos históricos. */
    var RECORTES = {
        GEN: [
            [1, 2, 'origens', 'Origens do universo', 'Deus, o Criador — Adão e Eva no Jardim do Éden', 'Sem império terreno', 'Criação perfeita em comunhão com Deus', 'A criação dos céus e da terra, a formação do homem e da mulher à imagem de Deus e o descanso sabático.'],
            [3, 5, 'origens', 'Primórdios da história humana', 'Adão, Eva, Sete e Enoque', 'Mundo antediluviano', 'Humanidade após a Queda — primeira promessa do Redentor (Gn 3.15)', 'A entrada do pecado no Éden, a promessa da semente da mulher e a linhagem de Sete até Noé.'],
            [6, 11, 'origens', 'Antes de ~2000 a.C.', 'Noé e Sem (linhagem até Terá e Abrão)', 'Mesopotâmia arcaica (Sinar / Babel)', 'Recomeço pós-dilúvio e dispersão das nações em Babel', 'O juízo do Dilúvio, a aliança do arco-íris com Noé, a tábua das nações e a Torre de Babel.'],
            [12, 25, 'patriarcas', '~2000 a 1900 a.C.', 'Patriarca Abraão (chamado de Ur aos 75 anos)', 'Cidades-estado de Canaã, Mesopotâmia e Egito', 'Início da família da Aliança — peregrino na terra prometida', 'O chamado de Abraão, a aliança de Deus (caps. 12, 15, 17), o nascimento de Isaque e o teste no Monte Moriá (cap. 22).'],
            [26, 27, 'patriarcas', '~1900 a 1800 a.C.', 'Patriarca Isaque (com Rebeca, Esaú e Jacó)', 'Filístia (Gerar, rei Abimeleque) e Berseba em Canaã', 'Segunda geração da promessa patriarcal', 'Deus confirma a aliança de Abraão com Isaque, e a bênção da primogenitura passa para Jacó.'],
            [28, 36, 'patriarcas', '~1800 a 1700 a.C.', 'Patriarca Jacó, que recebe o nome de Israel', 'Harã (Alta Mesopotâmia) e retorno a Canaã (Betel, Siquém, Hebrom)', 'Nascimento dos 12 filhos que dão origem às 12 tribos de Israel', 'Jacó em Padã-Arã, o nascimento das doze tribos, a luta no vau de Jaboque (onde recebe o nome Israel) e a volta a Canaã.'],
            [37, 50, 'patriarcas', '~1700 a 1650 a.C.', 'Patriarca Jacó e José como governador do Egito', 'Império Egípcio (provavelmente período do Médio Império / Hicsos)', 'A família de Israel (70 pessoas) desce ao Egito, onde será preservada da fome', 'José vendido pelos irmãos torna-se governador do Egito, salvando a família da aliança e preparando o cenário do Êxodo.']
        ],
        EXO: [
            [1, 15, 'exodo', '~1446 a.C. (ou ~1260 a.C.)', 'Moisés e Arão confrontando o Faraó do Egito', 'Império Egípcio (Novo Império)', 'De escravos no Egito a povo resgatado pelo sangue do Cordeiro pascal e pelo Mar Vermelho', 'Opressão no Egito, chamado de Moisés na sarça ardente, as dez pragas, a instituição da Páscoa e a travessia do Mar Vermelho.'],
            [16, 18, 'exodo', '~1446 a.C. (primeiros 2 meses após a saída)', 'Moisés liderando Israel rumo ao Sinai', 'Deserto de Sur, Sin e Refidim (conflito com Amaleque)', 'Povo recém-liberto sustentado no deserto por Deus', 'O maná do céu, a água da rocha em Horebe, a vitória sobre Amaleque e o conselho de Jetro.'],
            [19, 40, 'exodo', '~1446 a 1445 a.C. (1 ano ao pé do Sinai)', 'Moisés (mediador da Aliança) e Arão', 'Monte Sinai (fora do alcance do Império Egípcio)', 'Constituição teocrática de Israel: Lei da Aliança e construção do Tabernáculo', 'Deus desce no Sinai, entrega os Dez Mandamentos, perdoa o pecado do bezerro de ouro e enche o Tabernáculo com Sua glória.']
        ],
        '1SA': [
            [1, 7, 'juizes', '~1100 a 1050 a.C.', 'Sumo sacerdote/juiz Eli e profeta Samuel', 'Hegemonia militar dos Filisteus sobre Israel', 'Últimos dias da época dos Juízes — transição para a monarquia', 'Nascimento e chamado de Samuel em Siló, captura e retorno da Arca e vitória em Ebenézer.'],
            [8, 15, 'reino-unido', '~1050 a 1025 a.C.', 'Rei Saul (1º rei de Israel, da tribo de Benjamim) e profeta Samuel', 'Conflitos contra Amonitas, Filisteus e Amalequitas', 'Início da Monarquia Unificada — Israel passa a ter um rei', 'O povo pede um rei; Saul é ungido, vence os amonitas, mas desobedece à palavra do Senhor e é rejeitado como rei.'],
            [16, 31, 'reino-unido', '~1025 a 1010 a.C.', 'Rei Saul no trono · Davi já ungido por Samuel, mas perseguido', 'Guerra contra os Filisteus (Golias no vale de Elá e batalha final no monte Gilboa)', 'Declínio de Saul e preparação de Davi no deserto até a morte de Saul em Gilboa', 'Unção secreta de Davi em Belém, vitória sobre Golias, amizade com Jônatas, perseguição de Saul e queda de Saul em Gilboa.']
        ],
        '2SA': [
            [1, 4, 'reino-unido', '1010 a 1003 a.C.', 'Davi reina em Hebrom sobre Judá (7 anos e meio) · Isbosete (filho de Saul) no Norte', 'Enfraquecimento filisteu', 'Transição para a unificação total das 12 tribos', 'Após a morte de Saul, a tribo de Judá unge Davi em Hebrom enquanto a casa de Saul se enfraquece.'],
            [5, 10, 'reino-unido', '1003 a ~990 a.C.', 'Rei Davi sobre todo o Israel unificado (capital em Jerusalém)', 'Supremacia de Israel sobre Filisteus, Moabitas, Sírios (Arã), Edomitas e Amonitas', 'Unificação plena dos Reinos e Aliança Davídica (cap. 7)', 'Todas as tribos ungem Davi; ele conquista Jerusalém, traz a Arca para Sião e recebe a promessa do trono eterno (2Sm 7).'],
            [11, 24, 'reino-unido', '~990 a 970 a.C.', 'Rei Davi na segunda metade de seu reinado', 'Reino Unido de Israel consolidado externamente, mas abalado por crises internas', 'Monarquia Unificada enfrentando a rebelião de Absalão e a preparação do local do Templo', 'O pecado de Davi com Bate-Seba, o arrependimento, a revolta de Absalão, o cântico de Davi e a compra da eira de Araúna (local do futuro Templo).']
        ],
        '1KI': [
            [1, 11, 'reino-unido', '970 a 931 a.C.', 'Rei Salomão (filho de Davi)', 'Auge do Reino Unido de Israel (alianças com Egito e Tiro)', 'Reinos Unificados em paz e esplendor — construção do 1º Templo em Jerusalém', 'Coroação de Salomão, sabedoria real, edificação do Templo (caps. 5–8), glória internacional e o declínio final por causa da idolatria (cap. 11).'],
            [12, 14, 'reino-dividido', '931 a 910 a.C.', 'No Sul (Judá): Rei Roboão · No Norte (Israel): Rei Jeroboão I', 'Invasão do Faraó Sisaque, do Egito (925 a.C.)', 'FIM DA UNIFICAÇÃO (931 a.C.): o Reino se divide em Israel (10 tribos ao Norte) e Judá (2 tribos ao Sul)', 'A dureza de Roboão provoca o cisma de 931 a.C.; Jeroboão ergue bezerros de ouro em Betel e Dã para impedir o Norte de ir ao Templo de Jerusalém.'],
            [15, 16, 'reino-dividido', '913 a 874 a.C.', 'Em Judá: Reis Abias e Asa · Em Israel: Nadabe, Baasa, Elá, Zinri e Onri (fundador de Samaria)', 'Reino de Arã-Damasco (Síria, rei Ben-Hadade I)', 'Reinos Divididos em guerra entre si; Asa promove reforma em Judá enquanto Onri funda Samaria no Norte', 'Enquanto Judá tem estabilidade sob a reforma de Asa (41 anos), o Reino do Norte sofre golpes militares sucessivos até a dinastia de Onri.'],
            [17, 22, 'reino-dividido', '874 a 853 a.C.', 'Em Israel (Norte): Rei Acabe (e Jezabel) · Em Judá (Sul): Rei Josafá · Profeta Elias', 'Guerras contra o Reino da Síria (Ben-Hadade II) e ascensão inicial da Assíria', 'Reino Dividido: aliança entre Acabe (Norte) e Josafá (Sul); confronto de Elias contra o culto a Baal', 'Ministério poderoso de Elias: a seca, o fogo no Monte Carmelo (cap. 18), a voz mansa em Horebe, a vinha de Nabote e a morte de Acabe em Ramote-Gileade.']
        ],
        '2KI': [
            [1, 8, 'reino-dividido', '853 a 841 a.C.', 'Em Israel: Acazias e Jorão · Em Judá: Josafá, Jeorão e Acazias · Profeta Eliseu', 'Reino de Arã-Damasco (Síria — Ben-Hadade e Hazael) e Moabe', 'Reino Dividido sob forte pressão militar da Síria', 'Arrebatamento de Elias (cap. 2) e milagres do profeta Eliseu (a sunamita, a cura do general sírio Naamã no cap. 5 e o cerco de Samaria).'],
            [9, 10, 'reino-dividido', '841 a.C.', 'Rei Jeú em Israel (Norte) · Usurpadora Atalia em Judá (Sul)', 'Império Assírio (Salmaneser III recebe tributo de Jeú) e Hazael da Síria', 'Expurgo violento da casa de Acabe e do culto a Baal no Reino do Norte', 'Ungido por ordem de Eliseu, Jeú extermina a dinastia de Acabe e Jezabel em Israel, mas mantém os bezerros de ouro de Jeroboão.'],
            [11, 14, 'reino-dividido', '841 a 753 a.C.', 'Em Judá: Atalia, Joás (835–796) e Amazias · Em Israel: Jeoacaz, Jeoás e Jeroboão II (793–753 a.C.)', 'Enfraquecimento da Síria permite recuperação temporária de Israel e Judá', 'Em Judá, o sacerdote Joiada preserva o menino Joás (linhagem de Davi); no Norte, Jeroboão II expande as fronteiras', 'Preservação milagrosa da linhagem davídica com Joás (cap. 11), reforma do Templo e apogeu territorial do Norte sob Jeroboão II (cap. 14).'],
            [15, 16, 'reino-dividido', '790 a 732 a.C.', 'Em Judá: Uzias (Azarias), Jotão e Acaz · Em Israel: Zacarias, Salum, Menaém, Pecaías, Peca e Oséias', 'Império Assírio em plena expansão (Tiglate-Pileser III / Pul)', 'Colapso político do Reino do Norte (5 reis em 20 anos) e submissão do rei Acaz de Judá à Assíria', 'A Assíria invade o Norte e deporta a Galileia e Gileade; em Judá, o rei Acaz pede socorro assírio e copia um altar pagão de Damasco.'],
            [17, 17, 'reino-dividido', '722 a.C. (Queda de Samaria)', 'Último rei de Israel (Norte): Oséias (732–722 a.C.)', 'Império Assírio — Reis Salmaneser V e Sargão II', 'FIM DO REINO DO NORTE (Israel): Samaria cai em 722 a.C. e as 10 tribos são deportadas pela Assíria', 'Capítulo decisivo da história bíblica: explica por que o Reino do Norte caiu diante da Assíria após dois séculos de idolatria persistente.'],
            [18, 20, 'juda-sozinho', '715 a 686 a.C. (cerco em 701 a.C.)', 'Rei Ezequias de Judá · Profeta Isaías', 'Império Assírio no auge — Rei Senaqueribe invade Judá em 701 a.C.', 'Apenas o Reino de Judá (Sul) resta: reforma de Ezequias e livramento sobrenatural de Jerusalém do cerco assírio', 'Ezequias destrói os ídolos, confia no Senhor diante das ameaças de Senaqueribe e vê o anjo do Senhor livrar Jerusalém (cap. 19).'],
            [21, 21, 'juda-sozinho', '697 a 640 a.C.', 'Reis Manassés (55 anos de reinado) e Amom em Judá', 'Hegemonia do Império Assírio (Esar-Hadom e Assurbanípal)', 'Judá mergulha na pior apostasia de sua história sob Manassés, selando o decreto do futuro exílio', 'Manassés reconstrói os altares idolátricos e derrama sangue inocente em Jerusalém.'],
            [22, 23, 'juda-sozinho', '640 a 609 a.C. (Reforma em 622 a.C.)', 'Rei Josias de Judá (começa a reinar aos 8 anos)', 'Queda do Império Assírio (Nínive cai em 612 a.C.), intervenção do Faraó Neco (Egito) e ascensão da Babilônia', 'Último grande avivamento de Judá: achado do Livro da Lei no Templo e celebração da Páscoa', 'Josias encontra o Livro da Lei, renova a aliança e purifica a terra da idolatria, até morrer em Megido contra o Faraó Neco (609 a.C.).'],
            [24, 25, 'juda-sozinho', '609 a 586 a.C.', 'Últimos reis de Judá: Jeoacaz, Jeoiaquim, Joaquim (597) e Zedequias (597–586 a.C.)', 'Império Babilônico — Rei Nabucodonosor II', 'QUEDA DE JERUSALÉM E DO TEMPLO (586 a.C.): fim da monarquia em Judá e deportação para o Exílio Babilônico', 'Nabucodonosor faz três deportações (605, 597 e 586 a.C.), destrói os muros e o Templo de Salomão e leva Judá para o cativeiro na Babilônia.']
        ],
        '2CH': [
            [1, 9, 'reino-unido', '970 a 931 a.C.', 'Rei Salomão', 'Auge do Reino Unido de Israel', 'Reinos Unificados: construção e dedicação gloriosa do 1º Templo em Jerusalém', 'O reinado de Salomão focado na edificação, oração dedicatória e glória do Templo do Senhor.'],
            [10, 28, 'reino-dividido', '931 a 715 a.C.', 'Reis da casa de Davi em Judá: Roboão, Abias, Asa, Josafá, Joás, Amazias, Uzias, Jotão e Acaz', 'Egito, Síria e avanço do Império Assírio', 'Reino Dividido visto a partir do Sul (Judá) e da fidelidade ao Templo de Jerusalém', 'Destaca os reavivamentos em Judá sob Asa e Josafá e as quedas espirituais até os dias de Acaz.'],
            [29, 35, 'juda-sozinho', '715 a 609 a.C.', 'Reis Ezequias (caps. 29–32), Manassés (33) e Josias (34–35) em Judá', 'Império Assírio (Senaqueribe) e transição para a Babilônia', 'Reino de Judá sozinho após a queda do Norte: grandes reformas do Templo e da Páscoa', 'A purificação do Templo e a Páscoa sob Ezequias, o arrependimento de Manassés no cativeiro e a grande reforma de Josias.'],
            [36, 36, 'juda-sozinho', '609 a 538 a.C.', 'Últimos reis de Judá (Jeoacaz a Zedequias) → Decreto de Ciro', 'Império Babilônico (Nabucodonosor II) → Império Persa (Ciro, o Grande)', 'Queda de Jerusalém (586 a.C.), os 70 anos de cativeiro e o decreto persa de retorno (538 a.C.)', 'Resume a queda de Jerusalém para a Babilônia e termina com a proclamação de Ciro, rei da Pérsia, autorizando a reconstrução do Templo.']
        ],
        EZR: [
            [1, 6, 'persia', '538 a 516 a.C.', 'Governador Zorobabel e sumo sacerdote Josué (com os profetas Ageu e Zacarias)', 'Império Persa — Reis Ciro (538 a.C.) e Dario I (520–516 a.C.)', '1ª leva do retorno do exílio (~50 mil pessoas): reconstrução do altar e do 2º Templo (concluído em 516 a.C.)', 'Do decreto de Ciro autorizando a volta dos judeus até a inauguração do Segundo Templo no 6º ano do rei Dario.'],
            [7, 10, 'persia', '458 a.C. (60 anos após a conclusão do Templo)', 'Escriba e sacerdote Esdras', 'Império Persa — 7º ano do Rei Artaxerxes I (465–424 a.C.)', '2ª leva do retorno do exílio: restauração do ensino da Lei de Deus em Jerusalém', 'Esdras sobe da Babilônia a Jerusalém com carta do rei Artaxerxes para ensinar a Lei e conduzir o povo ao arrependimento.']
        ],
        ISA: [
            [1, 35, 'reino-dividido', '~740 a 701 a.C.', 'Reis de Judá: Uzias, Jotão, Acaz e Ezequias', 'Império Assírio (Tiglate-Pileser III, Salmaneser V, Sargão II, Senaqueribe)', 'Queda do Reino do Norte (722 a.C.) e pressão assíria sobre Judá — promessas do Emanuel (caps. 7, 9 e 11)', 'Chamado de Isaías no ano da morte do rei Uzias (cap. 6), profecia do Emanuel a Acaz e juízo e esperança sobre Judá e as nações.'],
            [36, 39, 'juda-sozinho', '701 a ~686 a.C.', 'Rei Ezequias de Judá', 'Império Assírio (invasão de Senaqueribe em 701 a.C.) e embaixada da Babilônia (Merodaque-Baladã)', 'Ponte histórica: Jerusalém é salva da Assíria (caps. 36–37), mas Isaías anuncia o futuro cativeiro na Babilônia (cap. 39)', 'O livramento de Jerusalém diante do exército assírio, a cura de Ezequias e o anúncio profético de que tudo seria levado para a Babilônia.'],
            [40, 66, 'juda-sozinho', 'Horizonte profético: Exílio Babilônico e Retorno Persa (~586 a 538 a.C. → Era Messiânica)', 'Profetizado por Isaías tendo como horizonte o cativeiro e a restauração', 'Queda do Império Babilônico diante de Ciro, rei do Império Persa (Is 44.28; 45.1)', 'Consolação do povo exilado, anúncio do Servo Sofredor (Is 53) e visão dos Novos Céus e Nova Terra', 'Anuncia com antecedência o nome de Ciro como libertador do exílio babilônico e revela a redenção suprema pelo Servo do Senhor (cap. 53).']
        ],
        DAN: [
            [1, 4, 'exilio', '605 a ~562 a.C.', 'Daniel (Beltessazar), Hananias, Misael e Azarias na corte babilônica', 'Império Babilônico no auge — Rei Nabucodonosor II (605–562 a.C.)', 'Jovens de Judá deportados na 1ª leva (605 a.C.); Deus mostra a Nabucodonosor que o Altíssimo tem domínio sobre o reino dos homens', 'A fidelidade de Daniel na corte, o sonho da estátua dos quatro impérios (Babilônia, Pérsia, Grécia e Roma no cap. 2), a fornalha ardente e a humilhação de Nabucodonosor.'],
            [5, 5, 'exilio', 'Outubro de 539 a.C. (noite da queda da Babilônia)', 'Daniel idoso perante Belsazar', 'Fim do Império Babilônico (Belsazar) e tomada da cidade pelo Império Medo-Persa', 'A escrita na parede ("Mene, Mene, Tequel e Parsim") marca o fim do domínio babilônico', 'Na mesma noite em que Belsazar profana os utensílios do Templo de Jerusalém, a Babilônia cai diante dos medos e persas.'],
            [6, 6, 'persia', '~539 a 538 a.C.', 'Daniel como primeiro-ministro na nova administração imperial', 'Império Medo-Persa — Dario, o Medo / Ciro, o Persa', 'Transição do exílio babilônico para o domínio persa; Daniel na cova dos leões', 'Já sob o novo império Medo-Persa, Daniel mantém sua vida de oração voltada para Jerusalém e é livrado da cova dos leões.'],
            [7, 12, 'persia', '553 a ~536 a.C. (visões sob Belsazar, Dario e Ciro)', 'Daniel intercedendo pelo fim dos 70 anos do exílio (cap. 9)', 'Visão profética dos Impérios: Babilônia → Medo-Pérsia → Grécia (Alexandre, cap. 8 e 11) → Roma → Reino do Filho do Homem', 'Do fim do cativeiro babilônico (3º ano de Ciro, cap. 10) até a vinda do Messias e a consumação da história', 'As grandes visões apocalípticas de Daniel: as quatro bestas e o Filho do Homem (cap. 7), o carneiro persa e o bode grego (cap. 8), as 70 semanas (cap. 9) e a história dos reinos até o fim (caps. 10–12).']
        ],
        ACT: [
            [1, 7, 'igreja', '30/33 a ~34 d.C.', 'Apóstolos Pedro e João · Diácono Estêvão · Sinédrio em Jerusalém (Caifás e Gamaliel)', 'Império Romano — Imperador Tibério César · Governador Pôncio Pilatos', 'A Igreja nasce em Jerusalém no Pentecostes, reunindo milhares de judeus crentes no Messias', 'Ascensão de Jesus, descida do Espírito Santo no Pentecostes (cap. 2), primeiros milagres e o martírio de Estêvão (cap. 7).'],
            [8, 12, 'igreja', '~34 a 44 d.C.', 'Filipe, Pedro, Barnabé e conversão de Saulo (Paulo) · Rei Herodes Agripa I (cap. 12)', 'Império Romano — Imperadores Tibério, Calígula (37–41) e Cláudio (41–54 d.C.)', 'O Evangelho ultrapassa Jerusalém: chega a Samaria, à Etiópia, a Cornélio (primeiros gentios) e a Antioquia da Síria', 'A perseguição espalha a semente: conversão de Saulo na estrada de Damasco (cap. 9), abertura da porta aos gentios na casa do centurião romano Cornélio (cap. 10) e morte de Herodes Agripa I (cap. 12).'],
            [13, 20, 'igreja', '~46 a 57 d.C.', 'Apóstolo Paulo, Barnabé, Silas, Timóteo e Lucas · Concílio de Jerusalém (Tiago, cap. 15)', 'Império Romano — Imperadores Cláudio (expulsa os judeus de Roma em ~49 d.C., At 18.2) e Nero (a partir de 54 d.C.)', 'As Três Viagens Missionárias de Paulo plantam igrejas por todo o mundo greco-romano (Chipre, Galácia, Macedônia, Grécia e Ásia)', 'De Antioquia, o Evangelho cruza a Ásia Menor e entra na Europa (Filipos, Tessalônica, Atenas, Corinto e Éfeso), com o Concílio de Jerusalém (cap. 15) confirmando a salvação pela graça.'],
            [21, 28, 'igreja', '~57 a 62 d.C.', 'Paulo prisioneiro sob os procuradores romanos Félix e Festo e perante o Rei Herodes Agripa II', 'Império Romano — Imperador Nero (Paulo apela para César)', 'Prisão em Jerusalém, dois anos em Cesareia, naufrágio em Malta e chegada de Paulo a Roma', 'Paulo testemunha perante governadores e reis, atravessa o Mediterrâneo sob tempestade e prega livremente o Reino de Deus na própria capital do Império Romano (cap. 28).']
        ]
    };

    function acharRecorte(usfm, cap) {
        var lista = RECORTES[usfm];
        if (!lista || !cap) return null;
        for (var i = 0; i < lista.length; i++) {
            var r = lista[i];
            if (cap >= r[0] && cap <= r[1]) {
                return {
                    faixa: r[0] === r[1] ? 'capítulo ' + r[0] : 'capítulos ' + r[0] + '–' + r[1],
                    era: r[2],
                    data: r[3],
                    reinado: r[4],
                    imperio: r[5],
                    situacao: r[6],
                    contexto: r[7]
                };
            }
        }
        return null;
    }

    /**
     * Devolve o retrato histórico completo de um capítulo (ou livro inteiro).
     * Aceita (usfm, cap) ou um objeto livro de B.biblia.
     */
    function doCapitulo(livroOuUsfm, cap) {
        var usfm = typeof livroOuUsfm === 'string'
            ? livroOuUsfm
            : (livroOuUsfm && livroOuUsfm.usfm);
        var base = POR_LIVRO[usfm];
        if (!base) return null;

        var rec = acharRecorte(usfm, cap);
        var eraId = (rec && rec.era) || base.era;
        var era = POR_ID[eraId] || ERAS[0];

        return {
            usfm: usfm,
            capitulo: cap || null,
            era: era,
            faixa: rec ? rec.faixa : null,
            data: (rec && rec.data) || base.data,
            reinado: (rec && rec.reinado) || base.reinado,
            imperio: (rec && rec.imperio) || base.imperio,
            situacao: (rec && rec.situacao) || base.situacao,
            contexto: (rec && rec.contexto) || base.contexto
        };
    }

    return {
        ERAS: ERAS,
        POR_ID: POR_ID,
        POR_LIVRO: POR_LIVRO,
        doCapitulo: doCapitulo
    };
})();
