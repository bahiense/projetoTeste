/* =========================================================
   CONTEXTO BÍBLICO E EXEGÉTICO — B.contexto
   100% offline. Entrega para cada livro e capítulo:
   1. Aliança da Redenção (Teologia do Pacto);
   2. Gênero Literário e Chave Hermenêutica;
   3. Raio-X e Estrutura do Livro (em qual movimento do livro
      o capítulo atual está);
   4. Sincronismo Histórico e Harmonia Canônica (Reis × Crônicas
      × Profetas × Salmos, Evangelhos, Atos × Epístolas, AT ↔ NT);
   5. Abertura instantânea de referências bíblicas em modal
      ("A Escritura interpreta a Escritura").
   ========================================================= */
window.B = window.B || {};

B.contexto = (function () {
    'use strict';

    /* ---------- 1. As Alianças na História da Redenção ---------- */
    var ALIANCAS = {
        criacao: {
            id: 'criacao',
            nome: 'Aliança da Criação e Queda (Adâmica)',
            mediador: 'Adão (cabeça federal da humanidade)',
            sinal: 'Árvore da Vida e o Descanso Sabático',
            promessa: 'Vida em comunhão com Deus no templo-jardim e a primeira promessa do Redentor: o descendente da mulher que esmagará a cabeça da serpente (Gn 3:15 — Protoevangelho).',
            cristo: 'Cristo é o Último Adão (Rm 5:14; 1Co 15:45), que obedeceu onde o primeiro Adão caiu e venceu a serpente na cruz.'
        },
        noetica: {
            id: 'noetica',
            nome: 'Aliança Noética (Graça Comum e Preservação)',
            mediador: 'Noé',
            sinal: 'O Arco-Íris nas nuvens (Gn 9:13)',
            promessa: 'Deus preserva a ordem criada e as estações da terra para que a história da redenção avance até a vinda do Messias.',
            cristo: 'Assim como a arca salvou a família de Noé através das águas do juízo, Cristo é o refúgio que nos atravessa em segurança pelo juízo final de Deus (1Pe 3:20-21).'
        },
        abraamica: {
            id: 'abraamica',
            nome: 'Aliança Abraâmica (A Promessa da Graça)',
            mediador: 'Abraão, Isaque e Jacó',
            sinal: 'Circuncisão (Gn 17)',
            promessa: 'Um povo numeroso, uma terra de herança, a presença de Deus ("Serei o teu Deus") e a bênção para todas as famílias da terra (Gn 12:1-3; 15; 17).',
            cristo: 'Cristo é a verdadeira "Semente de Abraão" (Gl 3:16). Nele, judeus e gentios que creem tornam-se filhos de Abraão e herdeiros da promessa pela fé.'
        },
        mosaica: {
            id: 'mosaica',
            nome: 'Aliança Mosaica / Sináitica (A Lei e o Tabernáculo)',
            mediador: 'Moisés (profeta) e Arão (sacerdote)',
            sinal: 'O Sábado (Êx 31:13) e o sangue da aliança',
            promessa: 'Israel é constituído "reino de sacerdotes e nação santa" (Êx 19:6), com a Lei moral, civil e cerimonial revelando a santidade de Deus e a necessidade de expiação por sangue.',
            cristo: 'A Lei é o nosso aio para nos conduzir a Cristo (Gl 3:24). Jesus cumpriu toda a justiça da Lei, é o verdadeiro Tabernáculo (Jo 1:14) e o Cordeiro Pascal definitivo.'
        },
        davidica: {
            id: 'davidica',
            nome: 'Aliança Davídica (O Trono Eterno)',
            mediador: 'O rei Davi',
            sinal: 'O trono e a lâmpada de Davi em Jerusalém',
            promessa: 'Deus promete a Davi um Filho cujo reino, casa e trono serão estabelecidos para sempre (2Sm 7:12-16; Sl 89; Sl 132).',
            cristo: 'Jesus é o Filho de Davi (Mt 1:1; Lc 1:32-33), o Rei justo cujo reino jamais terá fim, em contraste com a falha dos reis terrenos de Judá e Israel.'
        },
        nova_prometida: {
            id: 'nova_prometida',
            nome: 'Aliança Davídica e Promessa da Nova Aliança nos Profetas',
            mediador: 'Os Profetas apontando para o Servo Sofredor e Rei Messias',
            sinal: 'O remanescente fiel preservado pelo Senhor',
            promessa: 'Diante da quebra da aliança pelo povo e do exílio, Deus promete uma Nova Aliança escrita no coração, um coração novo e o perdão completo dos pecados (Jr 31:31-34; Ez 36:25-27; Is 53).',
            cristo: 'Cristo é o Servo Sofredor de Isaías que leva as nossas iniquidades e o Pastor-Rei prometido por Ezequiel, inaugurando a Nova Aliança no Seu sangue.'
        },
        nova: {
            id: 'nova',
            nome: 'Nova Aliança em Cristo (Consumação da Graça)',
            mediador: 'Jesus Cristo, o único Mediador entre Deus e os homens (1Tm 2:5; Hb 8:6)',
            sinal: 'Batismo e Santa Ceia ("Este cálice é a nova aliança no meu sangue" — Lc 22:20)',
            promessa: 'Perdão pleno dos pecados, justificação pela fé somente, habitação do Espírito Santo escrevendo a lei de Deus no coração e herança eterna na nova criação.',
            cristo: 'Cristo é ao mesmo tempo o Mediador, o Sumo Sacerdote eterno segundo a ordem de Melquisedeque, o Sacrifício perfeito e o Rei da Nova Aliança.'
        }
    };

    /* ---------- 2. Gêneros Literários e Chaves Hermenêuticas ---------- */
    var GENEROS = {
        narrativa_at: {
            nome: 'Narrativa Histórica do Antigo Testamento',
            comoLer: 'Narrativas bíblicas contam o que Deus fez na história real. Atenção: nem tudo o que um personagem faz é aprovado por Deus (descrição não é prescrição). Observe como Deus conduz Sua promessa apesar da fraqueza humana.',
            evitar: 'Evite "moralismo exemplarista" (reduzir o texto a "seja corajoso como Davi") sem ver que o verdadeiro herói da história é sempre o Senhor cumprindo Sua aliança.'
        },
        lei: {
            nome: 'Lei e Aliança (Torá)',
            comoLer: 'A Lei foi dada a um povo já resgatado pela graça no Êxodo. Distinga na tradição reformada as três dimensões da Lei: Moral (caráter eterno de Deus, resumido nos Dez Mandamentos), Cerimonial (sacrifícios e pureza cumpridos em Cristo) e Civil (aplicação teocrática a Israel).',
            evitar: 'Evite ler a Lei como caminho de salvação por obras, ou descartar o ensino moral que revela o que agrada ao Senhor.'
        },
        poesia: {
            nome: 'Poesia Hebraica e Louvor',
            comoLer: 'A poesia hebraica rima ideias, não sons — por meio do paralelismo (o segundo verso repete, aprofunda ou contrasta o primeiro). Usa metáforas intensas para dar voz à alma diante de Deus em lamento, confiança, gratidão e adoração.',
            evitar: 'Não leia linguagem poética e hiperbólica como se fosse tratado científico literal; ouça os Salmos primeiro na voz de Cristo (o verdadeiro Justo) e depois na voz da Igreja.'
        },
        sabedoria: {
            nome: 'Literatura de Sabedoria',
            comoLer: 'Ensina o temor do Senhor na vida prática. Provérbios traz princípios gerais da ordem criada por Deus; Jó trata do sofrimento do justo; Eclesiastes expõe o vazio da vida "debaixo do sol" longe de Deus.',
            evitar: 'Não trate provérbios como promessas mecânicas absolutas sem exceção, nem tome os discursos dos amigos de Jó como se fossem a palavra final de Deus.'
        },
        profecia: {
            nome: 'Profecia Clássica (Oráculos de Juízo e Esperança)',
            comoLer: 'Os profetas eram "promotores da aliança": acusavam Israel e Judá de quebrar a Lei de Moisés (idolatria e injustiça), anunciavam o juízo iminente (Assíria/Babilônia) e prometiam a restauração futura no Messias.',
            evitar: 'Evite saltar direto para o fim dos tempos sem entender primeiro o que aquela mensagem significava para os ouvintes originais em Jerusalém, Samaria ou na Babilônia.'
        },
        apocaliptico: {
            nome: 'Literatura Apocalíptica e Profética',
            comoLer: 'Escrita em tempos de perseguição e impérios opressores. Usa visões, números simbólicos (7, 10, 12, 1000) e imagens cósmicas para abrir a cortina do céu e mostrar que Cristo e o Trono de Deus já governam a história.',
            evitar: 'Evite especulações sensacionalistas de jornal; o propósito apocalíptico é consolar a Igreja sofredora com a certeza da vitória final do Cordeiro.'
        },
        evangelho: {
            nome: 'Evangelho (Biografia Teológica de Cristo)',
            comoLer: 'Os quatro Evangelhos proclamam a pessoa, o Reino, os sinais, a morte expiatória e a ressurreição de Jesus. Cada evangelista organiza os fatos reais para destacar uma faceta de Cristo (Rei Davídico em Mateus, Servo de ação em Marcos, Salvador compassivo em Lucas, Verbo eterno em João).',
            evitar: 'Ao ler as parábolas, busque o ponto central do Reino que Jesus está ensinando, sem alegorizar cada detalhe secundário.'
        },
        historia_nt: {
            nome: 'História da Igreja Primitiva',
            comoLer: 'Mostra a ascensão de Cristo e a expansão da Palavra pelo Espírito Santo, de Jerusalém à Judeia, Samaria e até Roma, cumprindo as promessas do AT de que as nações seriam alcançadas.',
            evitar: 'Diferencie o que é um evento único da história da redenção (como o Pentecostes) do que é padrão normativo contínuo para a Igreja em todas as épocas.'
        },
        epistola: {
            nome: 'Epístola Apostólica',
            comoLer: 'Cartas escritas a igrejas ou pastores reais enfrentando problemas concretos. Observe sempre o movimento típico das cartas apostólicas: primeiro o Indicativo da Graça (o que Deus fez em Cristo) e depois o Imperativo (como devemos viver em resposta).',
            evitar: 'Nunca isole um versículo do fluxo do argumento do capítulo ou separe os deveres práticos da base da justificação pela graça.'
        }
    };

    /* ---------- 3. Raio-X e Esboço dos 66 Livros ---------- */
    var LIVROS_INFO = {
        'Gênesis': {
            genero: 'narrativa_at',
            tema: 'O Deus Criador forma o mundo, julga o pecado humano e inicia a história da redenção chamando Abraão e sua descendência.',
            blocos: [
                { de: 1, ate: 11, titulo: 'História Primordial: Criação, Queda, Dilúvio e Babel' },
                { de: 12, ate: 25, titulo: 'A Aliança com Abraão e o filho da promessa (Isaque)' },
                { de: 26, ate: 36, titulo: 'Isaque e Jacó: o Deus que transforma o enganador em Israel' },
                { de: 37, ate: 50, titulo: 'José no Egito: a providência de Deus preservando a família da aliança' }
            ]
        },
        'Êxodo': {
            genero: 'narrativa_at',
            tema: 'O Senhor resgata Israel da escravidão no Egito pelo sangue do Cordeiro, firma aliança no Sinai e habita no meio do Seu povo no Tabernáculo.',
            blocos: [
                { de: 1, ate: 18, titulo: 'Libertação do Egito: Moisés, as 10 pragas, a Páscoa e o Mar Vermelho' },
                { de: 19, ate: 24, titulo: 'A Aliança no Monte Sinai e os Dez Mandamentos' },
                { de: 25, ate: 31, titulo: 'O projeto do Tabernáculo: Deus quer habitar com o Seu povo' },
                { de: 32, ate: 34, titulo: 'O bezerro de ouro, a intercessão de Moisés e a renovação da aliança' },
                { de: 35, ate: 40, titulo: 'Construção do Tabernáculo e a glória do Senhor enchendo a tenda' }
            ]
        },
        'Levítico': {
            genero: 'lei',
            tema: 'Como um povo pecador pode se aproximar de um Deus santo: expiação pelo sangue e santidade em toda a vida ("Sede santos, porque Eu sou santo").',
            blocos: [
                { de: 1, ate: 7, titulo: 'Os cinco sacrifícios e ofertas de acesso a Deus' },
                { de: 8, ate: 10, titulo: 'Consagração do sacerdócio de Arão e o juízo sobre Nadabe e Abiú' },
                { de: 11, ate: 15, titulo: 'Leis de pureza e impureza ritual' },
                { de: 16, ate: 16, titulo: 'O coração do Pentateuco: o Dia da Expiação (Yom Kippur)' },
                { de: 17, ate: 27, titulo: 'Código de Santidade, festas do Senhor e votos' }
            ]
        },
        'Números': {
            genero: 'narrativa_at',
            tema: 'A caminhada de Israel pelo deserto rumo a Canaã: a incredulidade da primeira geração contrastada com a fidelidade inabalável de Deus.',
            blocos: [
                { de: 1, ate: 10, titulo: 'Preparação e organização do acampamento no Sinai para partir' },
                { de: 11, ate: 25, titulo: 'Rebelião em Cades-Barneia e os 38 anos de peregrinação no deserto' },
                { de: 26, ate: 36, titulo: 'O novo censo nas campinas de Moabe: a nova geração pronta para entrar' }
            ]
        },
        'Deuteronômio': {
            genero: 'lei',
            tema: 'Os três discursos de despedida de Moisés renovando a aliança com a nova geração às portas da Terra Prometida: amar ao Senhor de todo o coração.',
            blocos: [
                { de: 1, ate: 4, titulo: '1º Discurso: Memória da fidelidade de Deus do Horebe até Moabe' },
                { de: 5, ate: 26, titulo: '2º Discurso: O coração da Aliança (Shemá, Dez Mandamentos e leis da terra)' },
                { de: 27, ate: 30, titulo: '3º Discurso: Bênçãos, maldições e a promessa de circuncisão do coração' },
                { de: 31, ate: 34, titulo: 'Transição para Josué, cântico e morte de Moisés no Monte Nebo' }
            ]
        },
        'Josué': {
            genero: 'narrativa_at',
            tema: 'A fidelidade de Deus em cumprir a promessa feita a Abraão, entregando a terra de Canaã como herança e descanso ao Seu povo.',
            blocos: [
                { de: 1, ate: 5, titulo: 'Travessia do Jordão e preparação espiritual em Gilgal' },
                { de: 6, ate: 12, titulo: 'Campanhas de conquista da terra (centro, sul e norte)' },
                { de: 13, ate: 21, titulo: 'Partilha da terra entre as tribos e cidades de refúgio' },
                { de: 22, ate: 24, titulo: 'Discursos finais de Josué e renovação da aliança em Siquém' }
            ]
        },
        'Juízes': {
            genero: 'narrativa_at',
            tema: 'A espiral de decadência espiritual de Israel quando cada um faz o que acha reto aos seus próprios olhos — demonstrando a necessidade de um Rei justo.',
            blocos: [
                { de: 1, ate: 3, titulo: 'Prólogo: conquista incompleta e o ciclo de apostasia de Israel' },
                { de: 4, ate: 16, titulo: 'Os ciclos dos juízes: Débora, Gideão, Jefté e Sansão' },
                { de: 17, ate: 21, titulo: 'Epílogo do caos: idolatria em Dã e guerra civil contra Benjamim' }
            ]
        },
        'Rute': {
            genero: 'narrativa_at',
            tema: 'Em meio à escuridão dos Juízes, a graça de Deus alcança uma estrangeira moabita por meio do parente remidor (Goel), preparando a linhagem do rei Davi e de Cristo.',
            blocos: [
                { de: 1, ate: 1, titulo: 'Da perda em Moabe ao retorno a Belém com Noemi' },
                { de: 2, ate: 2, titulo: 'A providência nos campos de Boaz' },
                { de: 3, ate: 3, titulo: 'Aos pés do resgatador na eira' },
                { de: 4, ate: 4, titulo: 'Redenção na porta da cidade e a genealogia até Davi' }
            ]
        },
        '1 Samuel': {
            genero: 'narrativa_at',
            tema: 'A transição dos juízes para a monarquia: o contraste entre Saul (o rei segundo o coração humano) e Davi (o rei escolhido segundo o coração de Deus).',
            blocos: [
                { de: 1, ate: 7, titulo: 'Samuel, o último juiz e profeta da transição' },
                { de: 8, ate: 15, titulo: 'Ascensão e rejeição do rei Saul por sua desobediência' },
                { de: 16, ate: 31, titulo: 'Unção de Davi, perseguição no deserto e queda de Saul no Gilboa' }
            ]
        },
        '2 Samuel': {
            genero: 'narrativa_at',
            tema: 'O reinado de Davi: a unificação de Israel, a Aliança Eterna de 2 Samuel 7 e as graves consequências do pecado na família real.',
            blocos: [
                { de: 1, ate: 10, titulo: 'Triunfo de Davi: unificação das tribos, Jerusalém e a Aliança Davídica (cap. 7)' },
                { de: 11, ate: 20, titulo: 'O pecado com Bate-Seba e a espada na casa de Davi (Absalão)' },
                { de: 21, ate: 24, titulo: 'Epílogo do reinado: cânticos, valentes e o altar na eira de Araúna' }
            ]
        },
        '1 Reis': {
            genero: 'narrativa_at',
            tema: 'Do esplendor do Templo de Salomão à tragédia da divisão do reino e ao confronto do profeta Elias contra a idolatria de Baal.',
            blocos: [
                { de: 1, ate: 11, titulo: 'Salomão: sabedoria, edificação do Templo e queda na idolatria' },
                { de: 12, ate: 16, titulo: 'O Cisma de 931 a.C.: divisão entre Israel (Norte) e Judá (Sul)' },
                { de: 17, ate: 22, titulo: 'O ministério de Elias diante do rei Acabe e Jezabel' }
            ]
        },
        '2 Reis': {
            genero: 'narrativa_at',
            tema: 'O ministério de Eliseu e o declínio espiritual dos dois reinos até a queda de Samaria diante da Assíria (722 a.C.) e de Jerusalém diante da Babilônia (586 a.C.).',
            blocos: [
                { de: 1, ate: 8, titulo: 'O ministério profético e os milagres de Eliseu' },
                { de: 9, ate: 17, titulo: 'Reis de Israel e Judá até a queda do Reino do Norte pela Assíria (cap. 17)' },
                { de: 18, ate: 25, titulo: 'O Reino de Judá sozinho: reformas de Ezequias e Josias até o exílio na Babilônia' }
            ]
        },
        '1 Crônicas': {
            genero: 'narrativa_at',
            tema: 'Escrito para os judeus que voltaram do exílio, lembra que eles ainda são o povo da aliança, destacando a linhagem de Davi e o preparo da adoração no Templo.',
            blocos: [
                { de: 1, ate: 9, titulo: 'Genealogias de Adão até o pós-exílio: a continuidade do povo de Deus' },
                { de: 10, ate: 29, titulo: 'O reinado de Davi focado na Arca, na Aliança e nos preparativos do Templo' }
            ]
        },
        '2 Crônicas': {
            genero: 'narrativa_at',
            tema: 'A história dos reis da casa de Davi em Judá avaliada pela fidelidade ao Templo e à Palavra de Deus, encerrando com o decreto de Ciro.',
            blocos: [
                { de: 1, ate: 9, titulo: 'Salomão e a construção e consagração do Templo em Jerusalém' },
                { de: 10, ate: 36, titulo: 'Os reis de Judá: avivamentos (Asa, Josafá, Ezequias, Josias), queda e edito de retorno' }
            ]
        },
        'Esdras': {
            genero: 'narrativa_at',
            tema: 'O cumprimento da promessa de Deus trazendo o remanescente de volta da Babilônia para reconstruir o Templo (Zorobabel) e restaurar o povo pela Lei (Esdras).',
            blocos: [
                { de: 1, ate: 6, titulo: 'Primeira leva com Zorobabel: reconstrução do altar e do Segundo Templo' },
                { de: 7, ate: 10, titulo: 'Segunda leva com Esdras: reforma espiritual e ensino da Lei' }
            ]
        },
        'Neemias': {
            genero: 'narrativa_at',
            tema: 'A reconstrução dos muros de Jerusalém em 52 dias sob oposição e a renovação da aliança do povo ao redor da leitura pública da Escritura.',
            blocos: [
                { de: 1, ate: 7, titulo: 'Reconstrução dos muros de Jerusalém sob a liderança e oração de Neemias' },
                { de: 8, ate: 13, titulo: 'Leitura da Lei com Esdras, confissão nacional e reformas da aliança' }
            ]
        },
        'Ester': {
            genero: 'narrativa_at',
            tema: 'A providência invisível de Deus preservando o povo judeu do extermínio em Susã, no coração do Império Persa.',
            blocos: [
                { de: 1, ate: 5, titulo: 'Ester torna-se rainha e a conspiração de Hamã contra os judeus' },
                { de: 6, ate: 10, titulo: 'A grande reviravolta providencial e a instituição de Purim' }
            ]
        },
        'Jó': {
            genero: 'sabedoria',
            tema: 'A soberania insondável de Deus no sofrimento do justo, desmontando a teologia da retribuição mecânica e levando Jó a contemplar a majestade do Criador.',
            blocos: [
                { de: 1, ate: 2, titulo: 'Prólogo na terra e no céu: a provação de Jó' },
                { de: 3, ate: 31, titulo: 'Três ciclos de debates entre Jó e seus amigos (Elifaz, Bildade e Zofar)' },
                { de: 32, ate: 37, titulo: 'Os discursos de Eliú preparando a chegada do Senhor' },
                { de: 38, ate: 42, titulo: 'O Senhor responde do redemoinho, Jó se rende e é restaurado' }
            ]
        },
        'Salmos': {
            genero: 'poesia',
            tema: 'O hinário e livro de orações inspirado da Aliança: lamentos, louvores, cânticos reais e profecias messiânicas que apontam para Cristo, o Rei ungido.',
            blocos: [
                { de: 1, ate: 41, titulo: 'Livro I (Salmos 1–41): Cânticos de Davi — confiança em meio à perseguição' },
                { de: 42, ate: 72, titulo: 'Livro II (Salmos 42–72): Sede de Deus e o Reino do Filho de Davi' },
                { de: 73, ate: 89, titulo: 'Livro III (Salmos 73–89): Crise do santuário e da coroa davídica (Asafe e Corá)' },
                { de: 90, ate: 106, titulo: 'Livro IV (Salmos 90–106): "O Senhor Reina!" — resposta à crise do exílio' },
                { de: 107, ate: 150, titulo: 'Livro V (Salmos 107–150): Palavra, romagem a Sião e o grande Aleluia final' }
            ]
        },
        'Provérbios': {
            genero: 'sabedoria',
            tema: 'O temor do Senhor como princípio da sabedoria: caminhar em retidão na família, no trabalho, na língua e no coração.',
            blocos: [
                { de: 1, ate: 9, titulo: 'Discursos paternos: o convite da Senhora Sabedoria contra a insensatez' },
                { de: 10, ate: 29, titulo: 'As coleções de provérbios práticos de Salomão' },
                { de: 30, ate: 31, titulo: 'Palavras de Agur, de Lemuel e o poema da mulher virtuosa' }
            ]
        },
        'Eclesiastes': {
            genero: 'sabedoria',
            tema: 'Tudo "debaixo do sol" sem Deus é sopro passageiro (vaidade/hevel); o sentido da vida está em temer a Deus e receber cada dia da Sua mão.',
            blocos: [
                { de: 1, ate: 6, titulo: 'A busca de sentido no prazer, sabedoria, trabalho e riquezas debaixo do sol' },
                { de: 7, ate: 12, titulo: 'Sabedoria diante dos limites da vida e da morte: teme a Deus e guarda os Seus mandamentos' }
            ]
        },
        'Cânticos': {
            genero: 'poesia',
            tema: 'A beleza, pureza e força do amor conjugal como dádiva da criação de Deus, apontando tipologicamente para o amor da aliança entre Cristo e Sua Igreja.',
            blocos: [
                { de: 1, ate: 4, titulo: 'O encontro, o cortejo e a celebração das bodas' },
                { de: 5, ate: 8, titulo: 'A maturidade e a força invencível do amor fiel' }
            ]
        },
        'Isaías': {
            genero: 'profecia',
            tema: 'O Santo de Israel julga a rebeldia do Seu povo e das nações, mas promete a redenção pelo Rei Emanuel e pelo Servo Sofredor que leva os nossos pecados.',
            blocos: [
                { de: 1, ate: 39, titulo: 'O Livro do Juízo e da Confiança: oráculos sobre Judá, as nações, Emanuel e o cerco assírio' },
                { de: 40, ate: 55, titulo: 'O Livro da Consolação: a grandeza de Deus e os Cânticos do Servo Sofredor (cap. 53)' },
                { de: 56, ate: 66, titulo: 'O Livro da Glória Futura: o Ungido do Senhor e os novos céus e nova terra' }
            ]
        },
        'Jeremias': {
            genero: 'profecia',
            tema: 'As últimas décadas de Judá antes da queda de Jerusalém (586 a.C.): o chamado ao arrependimento, a dor pela dureza do povo e a promessa da Nova Aliança no coração.',
            blocos: [
                { de: 1, ate: 29, titulo: 'Chamado de Jeremias e advertências contra a falsa religião e idolatria de Judá' },
                { de: 30, ate: 33, titulo: 'O Livro da Consolação: a promessa da Nova Aliança escrita no coração (cap. 31)' },
                { de: 34, ate: 45, titulo: 'Os últimos reis, o cerco babilônico e a queda de Jerusalém' },
                { de: 46, ate: 52, titulo: 'Oráculos contra as nações e o relato histórico da destruição do Templo' }
            ]
        },
        'Lamentações': {
            genero: 'poesia',
            tema: 'Cinco poemas de dor diante das ruínas de Jerusalém em 586 a.C., confessando a justiça do juízo divino e ancorando a esperança nas misericórdias do Senhor que se renovam.',
            blocos: [
                { de: 1, ate: 2, titulo: 'A desolação de Sião e o dia da ira do Senhor' },
                { de: 3, ate: 3, titulo: 'O centro do livro: "Grande é a Tua fidelidade" em meio às lágrimas' },
                { de: 4, ate: 5, titulo: 'O cerco de Jerusalém e a oração comunitária por restauração' }
            ]
        },
        'Ezequiel': {
            genero: 'profecia',
            tema: 'Profetizando aos exilados na Babilônia, Ezequiel mostra a glória de Deus deixando o Templo profanado e promete o Bom Pastor, um coração novo e o novo Templo.',
            blocos: [
                { de: 1, ate: 24, titulo: 'Visão do trono-carruagem e juízo sobre Jerusalém antes da queda (a glória se retira)' },
                { de: 25, ate: 32, titulo: 'Oráculos de juízo contra as sete nações vizinhas' },
                { de: 33, ate: 39, titulo: 'Restauração pós-queda: o Bom Pastor (34), o coração novo (36) e o vale de ossos secos (37)' },
                { de: 40, ate: 48, titulo: 'Visão do novo Templo e o retorno da glória do Senhor ("O Senhor Está Ali")' }
            ]
        },
        'Daniel': {
            genero: 'apocaliptico',
            tema: 'O Deus Altíssimo tem domínio sobre todos os impérios humanos (Babilônia, Pérsia, Grécia e Roma) e entregará o Reino eterno ao Filho do Homem.',
            blocos: [
                { de: 1, ate: 6, titulo: 'Narrativas da corte: fidelidade de Daniel e seus amigos na Babilônia e Pérsia' },
                { de: 7, ate: 12, titulo: 'Visões apocalípticas: as quatro bestas, o Filho do Homem e as 70 semanas' }
            ]
        },
        'Oséias': { name: 'Oséias', genero: 'profecia', tema: 'O amor fiel e redentor de Deus (hesed) por um povo infiel, retratado no casamento de Oséias com Gômer no Reino do Norte.' },
        'Joel': { genero: 'profecia', tema: 'Da praga de gafanhotos ao Dia do Senhor: o chamado a rasgar o coração e a promessa do derramamento do Espírito sobre toda a carne (Jl 2:28-32).' },
        'Amós': { genero: 'profecia', tema: 'O rugido do Leão de Sião contra a hipocrisia religiosa e a opressão dos pobres na próspera Samaria de Jeroboão II.' },
        'Obadias': { genero: 'profecia', tema: 'O juízo de Deus sobre Edom por sua arrogância e traição contra seu irmão Judá no dia da calamidade.' },
        'Jonas': { genero: 'narrativa_at', tema: 'A compaixão soberana de Deus pelos gentios arrependidos de Nínive contrastada com o nacionalismo estreito do profeta Jonas.' },
        'Miqueias': { genero: 'profecia', tema: 'Quem é semelhante ao Senhor que perdoa a iniquidade? Juízo sobre líderes corruptos e a promessa do Governante que nascerá em Belém (Mq 5:2).' },
        'Naum': { genero: 'profecia', tema: 'O consolo de Judá diante da queda de Nínive: o Senhor é tardio em irar-se, mas jamais inocenta o império sanguinário assírio.' },
        'Habacuque': { genero: 'profecia', tema: 'Do questionamento angustiado diante da invasão babilônica à confiança inabalável: "O justo viverá pela sua fé" (Hc 2:4).' },
        'Sofonias': { genero: 'profecia', tema: 'O grande Dia do Senhor que purifica Judá no fogo do juízo e preserva um remanescente humilde sobre o qual Deus se alegra com cânticos.' },
        'Ageu': { genero: 'profecia', tema: 'Chamado aos judeus que voltaram do exílio (520 a.C.) para colocarem a reconstrução da Casa do Senhor acima de suas próprias casas.' },
        'Zacarias': { genero: 'profecia', tema: 'Visões noturnas de encorajamento na reconstrução do Templo e ricas profecias sobre o Rei humilde, o Pastor ferido e o triunfo final do Senhor.' },
        'Malaquias': { genero: 'profecia', tema: 'A última voz profética do AT despertando o povo da frieza espiritual e anunciando o mensageiro que preparará o caminho do Senhor.' },
        'Mateus': {
            genero: 'evangelho',
            tema: 'Jesus é o Cristo, o Filho de Davi e Filho de Abraão que cumpre a Lei e os Profetas e inaugura o Reino dos Céus para judeus e todas as nações.',
            blocos: [
                { de: 1, ate: 4, titulo: 'Nascimento, batismo e início do ministério do Rei Messias' },
                { de: 5, ate: 7, titulo: '1º Grande Discurso: O Sermão do Monte (a justiça do Reino)' },
                { de: 8, ate: 12, titulo: 'A autoridade de Jesus em milagres, envio dos Doze (cap. 10) e crescente rejeição' },
                { de: 13, ate: 18, titulo: 'Parábolas do Reino (13), confissão de Pedro (16) e vida na Igreja (18)' },
                { de: 19, ate: 25, titulo: 'Caminho para Jerusalém, confronto no Templo e Discurso Profético (24–25)' },
                { de: 26, ate: 28, titulo: 'Paixão, Cruz, Ressurreição e a Grande Comissão às nações' }
            ]
        },
        'Marcos': {
            genero: 'evangelho',
            tema: 'O Evangelho da ação: Jesus, o Filho de Deus poderoso em obras, veio para servir e dar a Sua vida em resgate por muitos (Mc 10:45).',
            blocos: [
                { de: 1, ate: 8, titulo: 'Quem é este? O ministério poderoso do Servo na Galileia até a confissão de Cesareia' },
                { de: 9, ate: 10, titulo: 'O caminho da Cruz: Jesus ensina aos discípulos o que significa segui-Lo' },
                { de: 11, ate: 16, titulo: 'A semana da Paixão em Jerusalém, crucificação e ressurreição' }
            ]
        },
        'Lucas': {
            genero: 'evangelho',
            tema: 'Relato histórico ordenado mostrando Jesus como o Filho do Homem que veio buscar e salvar o que se havia perdido, trazendo graça aos quebrantados e às nações.',
            blocos: [
                { de: 1, ate: 4, titulo: 'Infância do Salvador, cânticos de esperança e início na Galileia' },
                { de: 5, ate: 9, titulo: 'Ministério na Galileia: poder para perdoar, curar e ensinar' },
                { de: 9, ate: 19, titulo: 'A grande viagem a Jerusalém: parábolas da graça (Bom Samaritano, Filho Pródigo, Zaqueu)' },
                { de: 19, ate: 24, titulo: 'Jerusalém, Cruz, Ressurreição e os olhos abertos no caminho de Emaús' }
            ]
        },
        'João': {
            genero: 'evangelho',
            tema: 'O Verbo eterno se fez carne: sete sinais e sete declarações "Eu Sou" escritos para que creiais que Jesus é o Cristo, o Filho de Deus, e tenhais vida em Seu nome.',
            blocos: [
                { de: 1, ate: 12, titulo: 'O Livro dos Sinais: a Luz brilha no mundo em 7 sinais e discursos públicos' },
                { de: 13, ate: 17, titulo: 'O Livro da Glória (Cenáculo): lava-pés, promessa do Consolador e Oração Sacerdotal' },
                { de: 18, ate: 21, titulo: 'A Hora da Cruz, a Ressurreição gloriosa e a restauração de Pedro' }
            ]
        },
        'Atos': {
            genero: 'historia_nt',
            tema: 'A obra contínua do Cristo exaltado por meio do Espírito Santo, espalhando a testemunha do Evangelho de Jerusalém à Judeia, Samaria e até Roma (At 1:8).',
            blocos: [
                { de: 1, ate: 7, titulo: 'A Igreja em Jerusalém: Ascensão, Pentecostes e o martírio de Estêvão' },
                { de: 8, ate: 12, titulo: 'Transição para a Judeia e Samaria, conversão de Saulo e abertura aos gentios (Cornélio)' },
                { de: 13, ate: 21, titulo: 'As três viagens missionárias de Paulo e o Concílio de Jerusalém (cap. 15)' },
                { de: 21, ate: 28, titulo: 'Prisão de Paulo em Jerusalém e Cesareia até a pregação livre em Roma' }
            ]
        },
        'Romanos': {
            genero: 'epistola',
            tema: 'A exposição mais completa do Evangelho: a justiça de Deus revelada pela fé de princípio a fim, justificando pecadores, santificando pelo Espírito e unindo judeus e gentios.',
            blocos: [
                { de: 1, ate: 3, titulo: 'A Ira de Deus e a universalidade do pecado: judeus e gentios estão sem desculpa' },
                { de: 3, ate: 5, titulo: 'Justificação somente pela fé: propiciação em Cristo, fé de Abraão e paz com Deus' },
                { de: 6, ate: 8, titulo: 'Santificação e segurança: unidos a Cristo na morte e vida, guiados pelo Espírito' },
                { de: 9, ate: 11, titulo: 'A Soberania da Eleição de Deus e o propósito redentor para Israel e as nações' },
                { de: 12, ate: 16, titulo: 'O culto racional: amor prático, submissão civil, consciência e unidade na Igreja' }
            ]
        },
        '1 Coríntios': {
            genero: 'epistola',
            tema: 'A sabedoria da Cruz confrontando divisões, imoralidade, orgulho espiritual e desordem no culto de uma igreja urbana ricamente dotada.',
            blocos: [
                { de: 1, ate: 4, titulo: 'A palavra da Cruz contra o espírito de facção e orgulho humano' },
                { de: 5, ate: 10, titulo: 'Pureza moral, casamento, liberdade cristã e fuga da idolatria' },
                { de: 11, ate: 14, titulo: 'Ordem no culto público: Santa Ceia, dons espirituais e a supremacia do amor (cap. 13)' },
                { de: 15, ate: 16, titulo: 'A Ressurreição de Cristo e dos mortos: a vitória final sobre a morte' }
            ]
        },
        '2 Coríntios': {
            genero: 'epistola',
            tema: 'O poder de Deus aperfeiçoado na fraqueza: defesa do ministério da Nova Aliança, consolo nas tribulações e generosidade da graça.',
            blocos: [
                { de: 1, ate: 7, titulo: 'O ministério da Nova Aliança e da reconciliação: tesouro em vasos de barro' },
                { de: 8, ate: 9, titulo: 'A graça da generosidade cristã na coleta para os santos' },
                { de: 10, ate: 13, titulo: 'Defesa apostólica de Paulo: "Quando sou fraco, então é que sou forte"' }
            ]
        },
        'Gálatas': { genero: 'epistola', tema: 'A carta magna da liberdade cristã: justificação somente pela fé em Cristo, sem as obras da lei, e a vida guiada pelo fruto do Espírito.' },
        'Efésios': { genero: 'epistola', tema: 'O plano eterno de Deus de reunir todas as coisas em Cristo, formando pela graça uma nova humanidade — a Igreja, Corpo e Noiva de Cristo.' },
        'Filipenses': { genero: 'epistola', tema: 'A alegria inabalável no Evangelho mesmo nas cadeias, tendo o mesmo sentimento de humildade e exaltação de Cristo Jesus (Fp 2:5-11).' },
        'Colossenses': { genero: 'epistola', tema: 'A supremacia e suficiência absoluta de Cristo — imagem do Deus invisível e Cabeça de tudo — contra toda filosofia vã e legalismo religioso.' },
        '1 Tessalonicenses': { genero: 'epistola', tema: 'Fé operosa, amor abnegado e firme esperança na volta gloriosa do Senhor Jesus Cristo.' },
        '2 Tessalonicenses': { genero: 'epistola', tema: 'Firmeza na verdade e perseverança no trabalho diário diante das tribulações e dos eventos que antecedem a vinda do Senhor.' },
        '1 Timóteo': { genero: 'epistola', tema: 'Como se deve proceder na Casa de Deus, a Igreja do Deus vivo, coluna e baluarte da verdade: sã doutrina, liderança piedosa e culto ordenado.' },
        '2 Timóteo': { genero: 'epistola', tema: 'O testamento final de Paulo: guarda o bom depósito, sofre pelo Evangelho e prega a Palavra inspirada por Deus a tempo e fora de tempo.' },
        'Tito': { genero: 'epistola', tema: 'A graça salvadora de Deus que nos educa para uma vida ornada de boas obras, sob presbíteros fiéis à sã doutrina.' },
        'Filemom': { genero: 'epistola', tema: 'O poder reconciliador do Evangelho transformando um escravo fugitivo (Onésimo) em irmão amado em Cristo.' },
        'Hebreus': {
            genero: 'epistola',
            tema: 'Cristo é infinitamente superior aos anjos, a Moisés, a Arão e aos sacrifícios antigos: Ele é o nosso Sumo Sacerdote eterno e Mediador de uma aliança superior.',
            blocos: [
                { de: 1, ate: 4, titulo: 'A superioridade do Filho sobre os anjos e sobre Moisés: não endureçais o coração' },
                { de: 5, ate: 10, titulo: 'O sacerdócio eterno segundo Melquisedeque e o sacrifício único e perfeito de Cristo' },
                { de: 11, ate: 13, titulo: 'A galeria da fé e a corrida com os olhos fitos em Jesus, Autor e Consumador da fé' }
            ]
        },
        'Tiago': { genero: 'epistola', tema: 'A fé verdadeira que se mostra viva nas obras de amor, no domínio da língua, na humildade e na sabedoria que vem do alto.' },
        '1 Pedro': { genero: 'epistola', tema: 'Esperança viva para peregrinos e forasteiros: sofrer como cristão seguindo as pisadas de Cristo rumo à glória.' },
        '2 Pedro': { genero: 'epistola', tema: 'Crescer na graça e no conhecimento de Cristo, firmados na Palavra profética contra os falsos mestres e escarnecedores.' },
        '1 João': { genero: 'epistola', tema: 'Certeza da vida eterna em comunhão com o Deus que é Luz e Amor: crer no Filho encarnado, andar em santidade e amar os irmãos.' },
        '2 João': { genero: 'epistola', tema: 'Andar no amor e na verdade de Cristo Encarnado, recusando cumplicidade com enganadores que negam a vinda de Jesus em carne.' },
        '3 João': { genero: 'epistola', tema: 'Acolher com hospitalidade os obreiros fiéis da verdade (Gaio e Demétrio) em contraste com a ambição de Diótrefes.' },
        'Judas': { genero: 'epistola', tema: 'Batalhar diligentemente pela fé que uma vez por todas foi entregue aos santos diante de infiltrados ímpios.' },
        'Apocalipse': {
            genero: 'apocaliptico',
            tema: 'O Cordeiro que foi morto venceu e reina: Cristo sustenta a Sua Igreja na tribulação, julga a Babilônia e os poderes do mal e traz a Nova Jerusalém.',
            blocos: [
                { de: 1, ate: 3, titulo: 'Cristo glorificado no meio dos candeeiros e as cartas às sete igrejas da Ásia' },
                { de: 4, ate: 11, titulo: 'O Trono no céu, o Cordeiro digno de abrir os sete selos e as sete trombetas' },
                { de: 12, ate: 20, titulo: 'O conflito cósmico: a Mulher e o Dragão, as sete taças, queda da Babilônia e vitória de Cristo' },
                { de: 21, ate: 22, titulo: 'Novos céus e nova terra: a Nova Jerusalém e o rio da água da vida ("Vem, Senhor Jesus!")' }
            ]
        }
    };

    /* ---------- 4. Sincronismo Histórico, Harmonia dos Evangelhos e Conexões Canônicas ---------- */
    var HARMONIA_EVANGELHOS = {
        'Mateus 1': { titulo: 'Genealogia e Nascimento virginal de Jesus', refs: ['Lucas 1', 'Lucas 2', 'Lucas 3', 'João 1'] },
        'Mateus 2': { titulo: 'Os Magos, Herodes e a fuga para o Egito', refs: ['Lucas 2', 'Oséias 11', 'Miqueias 5'] },
        'Mateus 3': { titulo: 'Ministério de João Batista e Batismo de Jesus', refs: ['Marcos 1', 'Lucas 3', 'João 1'] },
        'Mateus 4': { titulo: 'Tentação no deserto e início do ministério na Galileia', refs: ['Marcos 1', 'Lucas 4', 'Isaías 9'] },
        'Mateus 5': { titulo: 'Sermão do Monte: Bem-aventuranças e cumprimento da Lei', refs: ['Lucas 6', 'Êxodo 20'] },
        'Mateus 6': { titulo: 'Sermão do Monte: Pai Nosso, jejum e provisão do Pai', refs: ['Lucas 11', 'Lucas 12'] },
        'Mateus 7': { titulo: 'Sermão do Monte: As duas portas e os dois fundamentos', refs: ['Lucas 6', 'Tiago 1'] },
        'Mateus 8': { titulo: 'Cura do leproso, centurião e tempestade acalmada', refs: ['Marcos 1', 'Marcos 4', 'Marcos 5', 'Lucas 7', 'Lucas 8'] },
        'Mateus 9': { titulo: 'Paralítico perdoado, chamado de Mateus e filha de Jairo', refs: ['Marcos 2', 'Marcos 5', 'Lucas 5', 'Lucas 8'] },
        'Mateus 10': { titulo: 'Comissão e envio dos Doze Apóstolos', refs: ['Marcos 3', 'Marcos 6', 'Lucas 6', 'Lucas 9'] },
        'Mateus 11': { titulo: 'A dúvida de João Batista e o jugo suave de Cristo', refs: ['Lucas 7', 'Lucas 10'] },
        'Mateus 12': { titulo: 'Senhor do Sábado, Servo do Senhor e sinal de Jonas', refs: ['Marcos 2', 'Marcos 3', 'Lucas 6', 'Lucas 11', 'Isaías 42'] },
        'Mateus 13': { titulo: 'As Parábolas do Reino (Semeador, Joio, Tesouro, Pérola)', refs: ['Marcos 4', 'Lucas 8', 'Lucas 13'] },
        'Mateus 14': { titulo: 'Martírio de João Batista, multiplicação dos pães e Jesus sobre as águas', refs: ['Marcos 6', 'Lucas 9', 'João 6'] },
        'Mateus 15': { titulo: 'Tradição dos anciãos, mulher cananeia e segunda multiplicação', refs: ['Marcos 7', 'Marcos 8'] },
        'Mateus 16': { titulo: 'A Confissão de Pedro em Cesareia de Filipe e o anúncio da Cruz', refs: ['Marcos 8', 'Lucas 9', 'João 6'] },
        'Mateus 17': { titulo: 'A Transfiguração de Jesus no monte', refs: ['Marcos 9', 'Lucas 9', '2 Pedro 1'] },
        'Mateus 18': { titulo: 'Humildade, ovelha perdida, disciplina e perdão na Igreja', refs: ['Marcos 9', 'Lucas 15', 'Lucas 17'] },
        'Mateus 19': { titulo: 'Casamento, as crianças e o jovem rico', refs: ['Marcos 10', 'Lucas 18', 'Gênesis 2'] },
        'Mateus 20': { titulo: 'Trabalhadores da vinha, pedido dos filhos de Zebedeu e cegos de Jericó', refs: ['Marcos 10', 'Lucas 18'] },
        'Mateus 21': { titulo: 'Entrada Triunfal em Jerusalém e purificação do Templo', refs: ['Marcos 11', 'Lucas 19', 'João 12', 'Zacarias 9'] },
        'Mateus 22': { titulo: 'Bodas do Filho do Rei, tributo a César e o grande mandamento', refs: ['Marcos 12', 'Lucas 14', 'Lucas 20'] },
        'Mateus 23': { titulo: 'Os sete ais contra a hipocrisia e o lamento sobre Jerusalém', refs: ['Marcos 12', 'Lucas 11', 'Lucas 13'] },
        'Mateus 24': { titulo: 'Sermão Profético no Monte das Oliveiras', refs: ['Marcos 13', 'Lucas 21', 'Daniel 7'] },
        'Mateus 25': { titulo: 'As Dez Virgens, os Talentos e o Juízo das Nações', refs: ['Lucas 12', 'Lucas 19', 'Apocalipse 20'] },
        'Mateus 26': { titulo: 'Última Ceia, Getsêmani, prisão de Jesus e julgamento no Sinédrio', refs: ['Marcos 14', 'Lucas 22', 'João 13', 'João 18'] },
        'Mateus 27': { titulo: 'Julgamento perante Pilatos, Crucificação no Gólgota e Sepultamento', refs: ['Marcos 15', 'Lucas 23', 'João 19', 'Salmos 22', 'Isaías 53'] },
        'Mateus 28': { titulo: 'A Ressurreição de Cristo e a Grande Comissão', refs: ['Marcos 16', 'Lucas 24', 'João 20'] },
        'Marcos 1': { titulo: 'João Batista, batismo, tentação e curas em Cafarnaum', refs: ['Mateus 3', 'Mateus 4', 'Lucas 3', 'Lucas 4'] },
        'Marcos 2': { titulo: 'Paralítico descido pelo telhado, chamado de Levi e Senhor do Sábado', refs: ['Mateus 9', 'Mateus 12', 'Lucas 5', 'Lucas 6'] },
        'Marcos 3': { titulo: 'Mão ressequida, escolha dos Doze e controvérsia sobre Belzebu', refs: ['Mateus 10', 'Mateus 12', 'Lucas 6', 'Lucas 11'] },
        'Marcos 4': { titulo: 'Parábola do Semeador, grão de mostarda e tempestade acalmada', refs: ['Mateus 13', 'Mateus 8', 'Lucas 8'] },
        'Marcos 5': { titulo: 'Endemoninhado geraseno, mulher com fluxo de sangue e filha de Jairo', refs: ['Mateus 8', 'Mateus 9', 'Lucas 8'] },
        'Marcos 6': { titulo: 'Envio dos Doze, morte de João Batista, 5 mil pães e Jesus sobre o mar', refs: ['Mateus 10', 'Mateus 14', 'Lucas 9', 'João 6'] },
        'Marcos 7': { titulo: 'Pureza do coração, mulher siro-fenícia e cura do surdo-gago', refs: ['Mateus 15'] },
        'Marcos 8': { titulo: 'Multiplicação para 4 mil, cego de Betsaida e Confissão de Pedro', refs: ['Mateus 15', 'Mateus 16', 'Lucas 9'] },
        'Marcos 9': { titulo: 'Transfiguração, jovem possesso e ensino sobre a humildade', refs: ['Mateus 17', 'Mateus 18', 'Lucas 9'] },
        'Marcos 10': { titulo: 'Casamento, o jovem rico, o servo de todos e o cego Bartimeu', refs: ['Mateus 19', 'Mateus 20', 'Lucas 18'] },
        'Marcos 11': { titulo: 'Entrada Triunfal, figueira seca e purificação do Templo', refs: ['Mateus 21', 'Lucas 19', 'João 12'] },
        'Marcos 12': { titulo: 'Lavradores maus, tributo a César, o maior mandamento e a oferta da viúva', refs: ['Mateus 22', 'Lucas 20', 'Lucas 21'] },
        'Marcos 13': { titulo: 'Discurso Profético no Monte das Oliveiras', refs: ['Mateus 24', 'Lucas 21'] },
        'Marcos 14': { titulo: 'Unção em Betânia, Santa Ceia, Getsêmani e negação de Pedro', refs: ['Mateus 26', 'Lucas 22', 'João 12', 'João 18'] },
        'Marcos 15': { titulo: 'Pilatos, Crucificação, morte do Filho de Deus e José de Arimateia', refs: ['Mateus 27', 'Lucas 23', 'João 19'] },
        'Marcos 16': { titulo: 'O túmulo vazio e a Ressurreição de Jesus', refs: ['Mateus 28', 'Lucas 24', 'João 20'] },
        'Lucas 1': { titulo: 'Anúncio a Zacarias e a Maria, Magnificat e nascimento de João Batista', refs: ['Mateus 1', '1 Samuel 2', 'Malaquias 4'] },
        'Lucas 2': { titulo: 'Nascimento de Jesus em Belém, os pastores, Simeão e Jesus aos 12 anos', refs: ['Mateus 1', 'Mateus 2', 'Miqueias 5'] },
        'Lucas 3': { titulo: 'Pregação de João Batista, batismo e genealogia de Jesus até Adão', refs: ['Mateus 3', 'Marcos 1', 'Mateus 1'] },
        'Lucas 4': { titulo: 'Tentação no deserto, sinagoga de Nazaré e curas em Cafarnaum', refs: ['Mateus 4', 'Marcos 1', 'Isaías 61'] },
        'Lucas 5': { titulo: 'Pesca maravilhosa, leproso, paralítico e chamado de Levi', refs: ['Mateus 4', 'Mateus 8', 'Mateus 9', 'Marcos 1', 'Marcos 2'] },
        'Lucas 6': { titulo: 'Senhor do Sábado, escolha dos Doze e Sermão da Planície', refs: ['Mateus 5', 'Mateus 7', 'Mateus 12', 'Marcos 2', 'Marcos 3'] },
        'Lucas 7': { titulo: 'Centurião, viúva de Naim, João Batista e a pecadora perdoada', refs: ['Mateus 8', 'Mateus 11'] },
        'Lucas 8': { titulo: 'Parábola do Semeador, tempestade, geraseno e filha de Jairo', refs: ['Mateus 8', 'Mateus 9', 'Mateus 13', 'Marcos 4', 'Marcos 5'] },
        'Lucas 9': { titulo: 'Envio dos Doze, 5 mil pães, Confissão de Pedro e Transfiguração', refs: ['Mateus 10', 'Mateus 14', 'Mateus 16', 'Mateus 17', 'Marcos 6', 'Marcos 8', 'Marcos 9', 'João 6'] },
        'Lucas 10': { titulo: 'Envio dos Setenta, o Bom Samaritano e Marta e Maria', refs: ['Mateus 11', 'João 11'] },
        'Lucas 11': { titulo: 'O Pai Nosso, perseverança na oração e ais aos fariseus', refs: ['Mateus 6', 'Mateus 12', 'Mateus 23'] },
        'Lucas 12': { titulo: 'O rico insensato, não andeis ansiosos e servos vigilantes', refs: ['Mateus 6', 'Mateus 24'] },
        'Lucas 13': { titulo: 'Arrependimento, figueira estéril, porta estreita e lamento por Jerusalém', refs: ['Mateus 7', 'Mateus 13', 'Mateus 23'] },
        'Lucas 14': { titulo: 'A Grande Ceia e o custo do discipulado', refs: ['Mateus 10', 'Mateus 22'] },
        'Lucas 15': { titulo: 'As três parábolas da graça: Ovelha Perdida, Dracma e Filho Pródigo', refs: ['Mateus 18', 'Ezequiel 34'] },
        'Lucas 16': { titulo: 'Mordomo infiel e o Rico e Lázaro', refs: ['Mateus 6'] },
        'Lucas 17': { titulo: 'Perdão, os dez leprosos e a vinda do Reino de Deus', refs: ['Mateus 18', 'Mateus 24'] },
        'Lucas 18': { titulo: 'Viúva persistente, Fariseu e Publicano, o jovem rico e o cego de Jericó', refs: ['Mateus 19', 'Mateus 20', 'Marcos 10'] },
        'Lucas 19': { titulo: 'Zaqueu em Jericó, parábola das Minas e Entrada Triunfal', refs: ['Mateus 21', 'Mateus 25', 'Marcos 11', 'João 12'] },
        'Lucas 20': { titulo: 'Lavradores maus, tributo a César e a ressurreição dos mortos', refs: ['Mateus 21', 'Mateus 22', 'Marcos 12'] },
        'Lucas 21': { titulo: 'Oferta da viúva pobre e o Sermão Profético', refs: ['Mateus 24', 'Marcos 12', 'Marcos 13'] },
        'Lucas 22': { titulo: 'A Santa Ceia da Nova Aliança, Getsêmani, prisão e negação de Pedro', refs: ['Mateus 26', 'Marcos 14', 'João 13', 'João 18'] },
        'Lucas 23': { titulo: 'Pilatos e Herodes, Crucificação, o ladrão arrependido e o sepultamento', refs: ['Mateus 27', 'Marcos 15', 'João 19'] },
        'Lucas 24': { titulo: 'Ressurreição, o Caminho de Emaús (Cristo em toda a Escritura) e Ascensão', refs: ['Mateus 28', 'Marcos 16', 'João 20', 'Atos 1'] },
        'João 1': { titulo: 'O Verbo Eterno que se fez carne, João Batista e os primeiros discípulos', refs: ['Gênesis 1', 'Mateus 3', 'Marcos 1', 'Lucas 3'] },
        'João 2': { titulo: 'Bodas de Caná e a purificação do Templo', refs: ['Mateus 21', 'Marcos 11', 'Lucas 19'] },
        'João 3': { titulo: 'Nicodemos e o Novo Nascimento; a serpente levantada no deserto', refs: ['Números 21', 'Ezequiel 36'] },
        'João 4': { titulo: 'A mulher samaritana junto ao poço de Jacó e o filho do oficial', refs: ['Gênesis 33', '2 Reis 17'] },
        'João 6': { titulo: 'Multiplicação dos 5 mil pães, Jesus sobre o mar e o Pão da Vida', refs: ['Mateus 14', 'Marcos 6', 'Lucas 9', 'Êxodo 16'] },
        'João 10': { titulo: 'Jesus, o Bom Pastor que dá a vida pelas ovelhas', refs: ['Salmos 23', 'Ezequiel 34'] },
        'João 12': { titulo: 'Unção em Betânia, Entrada Triunfal e a glória vista por Isaías', refs: ['Mateus 21', 'Mateus 26', 'Marcos 11', 'Marcos 14', 'Isaías 6', 'Isaías 53'] },
        'João 13': { titulo: 'O lava-pés no Cenáculo, o novo mandamento e o anúncio da traição', refs: ['Mateus 26', 'Marcos 14', 'Lucas 22'] },
        'João 14': { titulo: 'Eu sou o Caminho, a Verdade e a Vida; a promessa do Consolador', refs: ['João 15', 'João 16', 'Atos 2'] },
        'João 17': { titulo: 'A Oração Sacerdotal de Jesus pelos Seus', refs: ['Hebreus 7', 'Levítico 16'] },
        'João 18': { titulo: 'Prisão no Getsêmani, interrogatório perante Anás e Pilatos', refs: ['Mateus 26', 'Mateus 27', 'Marcos 14', 'Marcos 15', 'Lucas 22', 'Lucas 23'] },
        'João 19': { titulo: 'Crucificação ("Está consumado!"), o lado traspassado e o sepultamento', refs: ['Mateus 27', 'Marcos 15', 'Lucas 23', 'Salmos 22', 'Zacarias 12'] },
        'João 20': { titulo: 'Ressurreição, Maria Madalena, o sopro do Espírito e a confissão de Tomé', refs: ['Mateus 28', 'Marcos 16', 'Lucas 24'] },
        'João 21': { titulo: 'Aparição no mar de Tiberíades e a restauração tríplice de Pedro', refs: ['Lucas 5', 'João 18'] }
    };

    /* Devolve paralelos históricos, profetas contemporâneos, Salmos ligados
       ou conexões AT <-> NT para o capítulo consultado. */
    function sincronismo(nomeLivro, cap) {
        var c = cap || 1;
        var itens = [];
        var chaveCap = nomeLivro + ' ' + c;

        if (HARMONIA_EVANGELHOS[chaveCap]) {
            var hEv = HARMONIA_EVANGELHOS[chaveCap];
            itens.push({
                rotulo: 'Harmonia dos Evangelhos & Paralelos',
                texto: hEv.titulo + ' — compare com os relatos paralelos:',
                refs: hEv.refs
            });
        }

        if (nomeLivro === 'Gênesis') {
            if (c <= 3) itens.push({ rotulo: 'Novo Testamento', texto: 'Cristo como o Verbo Criador e o Último Adão que vence a serpente.', refs: ['João 1', 'Romanos 5', 'Apocalipse 22'] });
            else if (c >= 6 && c <= 9) itens.push({ rotulo: 'Cumprimento tipológico', texto: 'O juízo das águas do Dilúvio e a salvação na arca apontam para Cristo.', refs: ['Mateus 24', '1 Pedro 3'] });
            else if (c >= 12 && c <= 22) itens.push({ rotulo: 'Aliança e Fé', texto: 'O chamado de Abraão, a justificação pela fé (Gn 15:6) e o sacrifício no Moriá (Gn 22).', refs: ['Romanos 4', 'Gálatas 3', 'Hebreus 11'] });
            else itens.push({ rotulo: 'Época Patriarcal', texto: 'Jó vive no mesmo horizonte patriarcal; a descida ao Egito prepara o Êxodo.', refs: ['Jó 1', 'Êxodo 1', 'Atos 7'] });
        } else if (nomeLivro === 'Êxodo') {
            if (c === 12) itens.push({ rotulo: 'Cristo, nossa Páscoa', texto: 'O cordeiro pascal sem defeito cujo sangue livra da morte cumpre-se na cruz de Cristo.', refs: ['João 1', '1 Coríntios 5', '1 Pedro 1'] });
            else if (c >= 19 && c <= 24) itens.push({ rotulo: 'Sinai vs. Sião', texto: 'A Lei dada no Sinai encontra seu verdadeiro sentido no Sermão do Monte e na Nova Aliança.', refs: ['Mateus 5', 'Hebreus 12'] });
            else if (c >= 25) itens.push({ rotulo: 'O Verdadeiro Tabernáculo', texto: 'Cada peça do Tabernáculo aponta para Cristo, o Verbo que tabernaculou entre nós.', refs: ['João 1', 'Hebreus 9'] });
            else itens.push({ rotulo: 'Memória da Redenção', texto: 'O resgate do Egito é celebrado nos Salmos e na pregação apostólica.', refs: ['Salmos 105', '1 Coríntios 10'] });
        } else if (nomeLivro === 'Levítico') {
            /* Nada. Aqui havia a faixa "Chave no NT", apontando Hebreus em
               todos os 27 capítulos; saiu a pedido. O ramo continua
               existindo, vazio, para que Levítico também não caia na faixa
               genérica do fim — tirar uma e ganhar outra não é tirar. */
        } else if (nomeLivro === '1 Samuel') {
            if (c === 16 || c === 17) itens.push({ rotulo: 'Salmos da época', texto: 'Davi ungido em Belém; o Espírito do Senhor o capacita como pastor e guerreiro.', refs: ['Salmos 23', 'Salmos 78'] });
            else if (c >= 19 && c <= 26) itens.push({ rotulo: 'Salmos nas cavernas', texto: 'Enquanto fugia de Saul (Gate, caverna de Adulão, deserto de Zife e En-Gedi), Davi compôs estes Salmos:', refs: ['Salmos 34', 'Salmos 56', 'Salmos 57', 'Salmos 142'] });
            else itens.push({ rotulo: 'Paralelo histórico', texto: 'A transição de Saul para Davi também é registrada na abertura das Crônicas.', refs: ['1 Crônicas 10', 'Atos 13'] });
        } else if (nomeLivro === '2 Samuel') {
            if (c === 7) itens.push({ rotulo: 'Eixo da Aliança Davídica', texto: 'Promessa do trono eterno ao Filho de Davi — texto-chave para toda a esperança messiânica.', refs: ['1 Crônicas 17', 'Salmos 89', 'Lucas 1', 'Hebreus 1'] });
            else if (c === 11 || c === 12) itens.push({ rotulo: 'Salmos de Arrependimento', texto: 'Após ser confrontado pelo profeta Natã sobre Bate-Seba e Urias, Davi derramou o coração nestes Salmos:', refs: ['Salmos 51', 'Salmos 32'] });
            else if (c >= 15 && c <= 18) itens.push({ rotulo: 'Fuga de Absalão', texto: 'Salmos compostos por Davi quando fugia de seu filho Absalão no deserto de Judá:', refs: ['Salmos 3', 'Salmos 63'] });
            else itens.push({ rotulo: 'Paralelo em Crônicas', texto: 'Compare este relato do reinado de Davi com a perspectiva sacerdotal de Crônicas.', refs: ['1 Crônicas 11', '1 Crônicas 21'] });
        } else if (nomeLivro === '1 Reis') {
            if (c <= 11) itens.push({ rotulo: 'Era de Salomão', texto: 'Época em que floresceu a literatura de sabedoria de Israel e o 1º Templo.', refs: ['2 Crônicas 6', 'Provérbios 1', 'Eclesiastes 1', 'Salmos 72'] });
            else itens.push({ rotulo: 'Reino Dividido', texto: 'Paralelo dos reis de Judá em 2 Crônicas; o confronto de Elias no Carmelo ecoa em Tiago e no NT.', refs: ['2 Crônicas 10', 'Tiago 5', 'Romanos 11'] });
        } else if (nomeLivro === '2 Reis') {
            if (c <= 17) itens.push({ rotulo: 'Profetas da mesma época', texto: 'Nos dias de Jeroboão II até a queda de Samaria (722 a.C.), profetizaram no Norte e no Sul:', refs: ['Amós 1', 'Oséias 1', 'Jonas 1', 'Isaías 6'] });
            else itens.push({ rotulo: 'Reis de Judá e Profetas', texto: 'De Ezequias a Josias e até a queda de Jerusalém (586 a.C.), atuaram Isaías, Miqueias, Habacuque, Sofonias e Jeremias.', refs: ['2 Crônicas 29', 'Isaías 36', 'Jeremias 1', 'Habacuque 1'] });
        } else if (nomeLivro === '1 Crônicas' || nomeLivro === '2 Crônicas') {
            itens.push({ rotulo: 'Paralelo em Samuel e Reis', texto: 'Crônicas relê a história de Davi e dos reis de Judá para encorajar a comunidade pós-exílio.', refs: ['2 Samuel 7', '1 Reis 8', 'Esdras 1'] });
        } else if (nomeLivro === 'Esdras' || nomeLivro === 'Neemias') {
            itens.push({ rotulo: 'Profetas do Pós-Exílio', texto: 'Ageu, Zacarias e Malaquias profetizaram exatamente durante esta reconstrução de Jerusalém sob o Império Persa.', refs: ['Ageu 1', 'Zacarias 1', 'Malaquias 1', 'Salmos 126'] });
        } else if (nomeLivro === 'Salmos') {
            if (c === 2 || c === 110) itens.push({ rotulo: 'Salmo Messiânico Real', texto: 'Os Salmos mais citados no Novo Testamento sobre a filiação divina, o reinado e o sacerdócio eterno de Cristo.', refs: ['Atos 4', 'Hebreus 1', 'Hebreus 7'] });
            else if (c === 22) itens.push({ rotulo: 'A Cruz no Salmo', texto: 'Jesus orou este Salmo na cruz ("Deus meu, Deus meu, por que me desamparaste?"); descreve a paixão e o triunfo mundial do Evangelho.', refs: ['Mateus 27', 'João 19', 'Hebreus 2'] });
            else if (c === 23) itens.push({ rotulo: 'O Bom Pastor', texto: 'O Senhor como Pastor de Davi aponta para a promessa de Ezequiel 34 e para Jesus, o Bom Pastor que dá a vida pelas ovelhas.', refs: ['Ezequiel 34', 'João 10', '1 Pedro 5'] });
            else if (c === 51) itens.push({ rotulo: 'Contexto Histórico', texto: 'Composto por Davi quando o profeta Natã o confrontou após o pecado com Bate-Seba.', refs: ['2 Samuel 12', 'Romanos 3'] });
            else itens.push({ rotulo: 'Cristo nos Salmos', texto: 'Jesus ensinou que os Salmos testificam a respeito dEle (Lc 24:44).', refs: ['Lucas 24', '2 Samuel 22', 'Colossenses 3'] });
        } else if (nomeLivro === 'Isaías') {
            if (c === 6) itens.push({ rotulo: 'Sincronismo Histórico', texto: 'Ano da morte do rei Uzias (740 a.C.). João 12:41 afirma que Isaías viu aqui a glória do próprio Cristo.', refs: ['2 Crônicas 26', 'João 12', 'Apocalipse 4'] });
            else if (c === 7 || c === 9 || c === 11) itens.push({ rotulo: 'Profecias de Emanuel', texto: 'Proferidas durante a crise siro-efraimita no reinado de Acaz; cumpridas no nascimento e Reino de Jesus.', refs: ['2 Reis 16', 'Mateus 1', 'Mateus 4'] });
            else if (c >= 52 && c <= 53) itens.push({ rotulo: 'Quarto Cântico do Servo', texto: 'O ápice da profecia do AT sobre a expiação substitutiva de Cristo na cruz.', refs: ['Atos 8', 'Romanos 5', '1 Pedro 2'] });
            else itens.push({ rotulo: 'Contexto de Reis', texto: 'Isaías profetizou em Jerusalém sob Uzias, Jotão, Acaz e Ezequias.', refs: ['2 Reis 19', 'Miqueias 1', 'Romanos 10'] });
        } else if (nomeLivro === 'Jeremias' || nomeLivro === 'Lamentações') {
            itens.push({ rotulo: 'Sincronismo Histórico', texto: 'Últimos anos de Judá (Josias a Zedequias) e queda de Jerusalém para Nabucodonosor; cumpre-se a Nova Aliança em Cristo.', refs: ['2 Reis 24', '2 Reis 25', 'Hebreus 8'] });
        } else if (nomeLivro === 'Ezequiel' || nomeLivro === 'Daniel') {
            itens.push({ rotulo: 'Sincronismo no Exílio', texto: 'Enquanto Jeremias profetizava em Jerusalém, Ezequiel estava junto aos cativos no rio Quebar e Daniel na corte da Babilônia.', refs: ['2 Reis 24', 'Jeremias 29', 'Apocalipse 1'] });
        } else if (nomeLivro === 'Mateus' || nomeLivro === 'Marcos' || nomeLivro === 'Lucas' || nomeLivro === 'João') {
            itens.push({ rotulo: 'Harmonia dos 4 Evangelhos', texto: 'Compare a perspectiva complementar dos evangelistas sobre a vida, morte e ressurreição de Jesus:', refs: ['Mateus 1', 'Marcos 1', 'Lucas 1', 'João 1'] });
        } else if (nomeLivro === 'Atos') {
            if (c <= 2) itens.push({ rotulo: 'Cumprimento Profético', texto: 'O derramamento do Espírito Santo no Pentecostes cumpre a profecia de Joel e exalta o Filho de Davi.', refs: ['Joel 2', 'Salmos 110', 'Lucas 24'] });
            else if (c >= 13 && c <= 15) itens.push({ rotulo: '1ª Viagem e Concílio', texto: 'Contexto histórico da missão na Galácia e da defesa da justificação pela fé sem obras da lei.', refs: ['Gálatas 1', 'Gálatas 2'] });
            else if (c >= 16 && c <= 18) itens.push({ rotulo: '2ª Viagem Missionária', texto: 'Fundação das igrejas de Filipos, Tessalônica e Corinto; época em que Paulo escreveu 1 e 2 Tessalonicenses.', refs: ['1 Tessalonicenses 1', '2 Tessalonicenses 1', 'Filipenses 1'] });
            else if (c >= 19 && c <= 20) itens.push({ rotulo: '3ª Viagem Missionária', texto: 'Ministério em Éfeso e Macedônia/Acaia; período em que Paulo escreveu 1 e 2 Coríntios e Romanos.', refs: ['1 Coríntios 1', '2 Coríntios 1', 'Romanos 1'] });
            else itens.push({ rotulo: 'Prisão em Roma', texto: 'Durante a prisão domiciliar de Atos 28, Paulo escreveu as Epístolas da Prisão:', refs: ['Efésios 1', 'Filipenses 1', 'Colossenses 1', 'Filemom 1'] });
        } else if (nomeLivro === 'Romanos' || nomeLivro === '1 Coríntios' || nomeLivro === '2 Coríntios') {
            itens.push({ rotulo: 'Sincronismo em Atos', texto: 'Escrita durante a 3ª viagem missionária de Paulo (Atos 19–20), entre Éfeso, Macedônia e Corinto.', refs: ['Atos 18', 'Atos 19', 'Atos 20'] });
        } else if (nomeLivro === 'Gálatas') {
            itens.push({ rotulo: 'Sincronismo em Atos', texto: 'Ligada às igrejas plantadas na 1ª viagem missionária (Atos 13–14) e ao debate do Concílio de Jerusalém (Atos 15).', refs: ['Atos 13', 'Atos 15', 'Gênesis 15'] });
        } else if (nomeLivro === 'Efésios' || nomeLivro === 'Filipenses' || nomeLivro === 'Colossenses' || nomeLivro === 'Filemom') {
            itens.push({ rotulo: 'Epístolas da Prisão', texto: 'Escritas por Paulo acorrentado em Roma (~60–62 d.C.), conforme o desfecho de Atos.', refs: ['Atos 28', 'Atos 16', 'Atos 19'] });
        } else if (nomeLivro === '1 Tessalonicenses' || nomeLivro === '2 Tessalonicenses') {
            itens.push({ rotulo: 'Sincronismo em Atos', texto: 'Escritas a partir de Corinto (~50–51 d.C.) logo após a pregação em Tessalônica na 2ª viagem.', refs: ['Atos 17', 'Atos 18'] });
        } else if (nomeLivro === '1 Timóteo' || nomeLivro === '2 Timóteo' || nomeLivro === 'Tito') {
            itens.push({ rotulo: 'Epístolas Pastorais', texto: 'Escritas no final da vida de Paulo aos seus cooperadores para consolidar a liderança das igrejas.', refs: ['Atos 16', 'Atos 20'] });
        } else if (nomeLivro === 'Hebreus') {
            itens.push({ rotulo: 'Raízes no Antigo Testamento', texto: 'Conecta diretamente o sacerdócio, o Tabernáculo e as promessas do AT ao sacerdócio eterno de Cristo.', refs: ['Gênesis 14', 'Levítico 16', 'Salmos 110', 'Jeremias 31'] });
        } else if (nomeLivro === 'Apocalipse') {
            itens.push({ rotulo: 'Fecho do Cânon', texto: 'Reúne as profecias de Daniel, Ezequiel e Isaías e restaura o paraíso perdido em Gênesis 1–3.', refs: ['Gênesis 2', 'Daniel 7', 'Ezequiel 47', 'Isaías 65'] });
        } else {
            /* Profetas menores ou epístolas gerais */
            var infoT = B.tempo && B.biblia.livro(nomeLivro) ? B.tempo.doCapitulo(B.biblia.livro(nomeLivro), c) : null;
            if (infoT && infoT.era && infoT.era.livros) {
                itens.push({ rotulo: 'Mesma Era Bíblica (' + infoT.era.curto + ')', texto: 'Textos bíblicos situados neste mesmo horizonte histórico (' + infoT.data + '): ' + infoT.era.livros, refs: ['2 Reis 17', 'Atos 2'] });
            }
        }
        return itens;
    }

    /* Determina qual Aliança governa o capítulo */
    function aliancaDoCapitulo(livro, cap) {
        var c = cap || 1;
        var n = livro.nome;
        if (n === 'Gênesis') {
            if (c <= 5) return ALIANCAS.criacao;
            if (c <= 11) return ALIANCAS.noetica;
            return ALIANCAS.abraamica;
        }
        if (n === 'Jó') return ALIANCAS.abraamica;
        if (n === 'Êxodo' || n === 'Levítico' || n === 'Números' || n === 'Deuteronômio' || n === 'Josué' || n === 'Juízes' || n === 'Rute') {
            return ALIANCAS.mosaica;
        }
        if (n === '1 Samuel') {
            return c <= 15 ? ALIANCAS.mosaica : ALIANCAS.davidica;
        }
        if (n === '2 Samuel' || n === '1 Reis' || n === '2 Reis' || n === '1 Crônicas' || n === '2 Crônicas' ||
            n === 'Salmos' || n === 'Provérbios' || n === 'Eclesiastes' || n === 'Cânticos') {
            return ALIANCAS.davidica;
        }
        if (livro.testamento === 'AT') {
            return ALIANCAS.nova_prometida;
        }
        return ALIANCAS.nova;
    }

    function analisar(livroOuNome, cap) {
        var livro = typeof livroOuNome === 'string' ? B.biblia.livro(livroOuNome) : livroOuNome;
        if (!livro) return null;
        var c = cap || 1;
        var info = LIVROS_INFO[livro.nome] || {
            genero: livro.testamento === 'AT' ? 'narrativa_at' : 'epistola',
            tema: 'Parte integrante do cânon sagrado, revelando o caráter de Deus e a história da redenção em Cristo.'
        };
        var genero = GENEROS[info.genero] || GENEROS.narrativa_at;
        var alianca = aliancaDoCapitulo(livro, c);

        var blocos = info.blocos || [
            { de: 1, ate: livro.caps, titulo: 'Corpo integral de ' + livro.nome + ' (capítulos 1 a ' + livro.caps + ')' }
        ];
        var blocoAtual = blocos[0];
        for (var i = 0; i < blocos.length; i++) {
            if (c >= blocos[i].de && c <= blocos[i].ate) {
                blocoAtual = blocos[i];
                break;
            }
        }

        return {
            livro: livro,
            capitulo: c,
            temaLivro: info.tema,
            genero: genero,
            alianca: alianca,
            blocos: blocos,
            blocoAtual: blocoAtual,
            sincronismo: sincronismo(livro.nome, c)
        };
    }

    /* Substituído pelo Fio da Narrativa */
    function renderPainel() {
        return '';
    }

    /* Localiza o capítulo imediatamente anterior (-1) ou seguinte (+1) na Bíblia */
    function vizinhoCapitulo(livro, cap, delta) {
        if (!livro || !cap) return null;
        var novoCap = cap + delta;
        if (novoCap >= 1 && novoCap <= livro.caps) {
            return { livro: livro, cap: novoCap, ref: livro.nome + ' ' + novoCap };
        }
        var lista = B.biblia && B.biblia.LIVROS ? B.biblia.LIVROS : [];
        var idx = -1;
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].usfm === livro.usfm || lista[i].nome === livro.nome) {
                idx = i;
                break;
            }
        }
        if (idx < 0) return null;
        if (delta < 0 && idx > 0) {
            var antLivro = lista[idx - 1];
            return { livro: antLivro, cap: antLivro.caps, ref: antLivro.nome + ' ' + antLivro.caps };
        }
        if (delta > 0 && idx < lista.length - 1) {
            var proxLivro = lista[idx + 1];
            return { livro: proxLivro, cap: 1, ref: proxLivro.nome + ' 1' };
        }
        return null;
    }

    /* Extrai o primeiro parágrafo (a frase-resumo logo após "## Livro Cap") de um estudo em Markdown */
    function extrairResumoDeMarkdown(textoMd) {
        if (!textoMd) return '';
        var linhas = String(textoMd).split(/\r?\n/);
        var passouTitulo = false;
        for (var i = 0; i < linhas.length; i++) {
            var l = linhas[i].trim();
            if (!l) continue;
            if (/^##\s+/.test(l) && !/^###/.test(l)) {
                passouTitulo = true;
                continue;
            }
            if (/^###/.test(l)) break;
            if (passouTitulo || i > 0) {
                return l.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').trim();
            }
        }
        return '';
    }

    /* Busca a frase-resumo de qualquer capítulo (usando o estudo guardado ou o texto bíblico como reserva) */
    function obterResumoCapitulo(livro, cap, estudoJaCarregado) {
        if (!livro || !cap) return Promise.resolve('');
        if (estudoJaCarregado && estudoJaCarregado.texto) {
            var rDir = extrairResumoDeMarkdown(estudoJaCarregado.texto);
            if (rDir) return Promise.resolve(rDir);
        }
        var ref = livro.nome + ' ' + cap;
        var pEstudo = B.estudos && B.estudos.obter
            ? B.estudos.obter(ref, 'completo').then(function (comp) {
                if (comp && comp.texto) {
                    var rc = extrairResumoDeMarkdown(comp.texto);
                    if (rc) return rc;
                }
                return '';
            }, function () { return ''; })
            : Promise.resolve('');

        return pEstudo.then(function (resumo) {
            if (resumo) return resumo;
            if (B.texto && B.texto.capituloOuReserva) {
                return B.texto.capituloOuReserva(livro.nome, cap).then(function (r) {
                    var versos = r.versiculos;
                    var v1 = versos && versos[0] ? versos[0].trim() : '';
                    var v2 = versos && versos[1] ? ' ' + versos[1].trim() : '';
                    var trecho = primeiraFrase(v1 + v2, 180);
                    return trecho ? 'Abertura do capítulo (v. 1): "' + trecho + '"' : '';
                }, function () { return ''; });
            }
            return '';
        });
    }

    /**
     * O texto cru de uma seção do estudo, achada pelo título.
     *
     * Quebra em #, ## e ### — nunca em ####. Os estudos que escrevem
     * os trechos como subtítulo ("#### vv. 1-3: a palavra que cria um
     * futuro") tinham a seção cortada na primeira linha, e o resumo do
     * capítulo anterior saía vazio.
     */
    function secaoCrua(texto, regexTitulo) {
        var partes = String(texto || '').split(/\n(?=#{1,3}\s)/);
        for (var i = 0; i < partes.length; i++) {
            var linha = partes[i].split('\n')[0] || '';
            if (!/^#{2,4}\s/.test(linha)) continue;
            if (!regexTitulo.test(linha.replace(/^#+\s*/, ''))) continue;
            return partes[i].split('\n').slice(1).join('\n');
        }
        return '';
    }

    /**
     * O que aconteceu no capítulo, parte por parte.
     *
     * A frase de abertura do estudo diz do que o capítulo TRATA; quem
     * vai ler o seguinte quer saber o que ACONTECEU — e isso o estudo
     * já conta, na seção "O capítulo, parte por parte", trecho a
     * trecho. Aqui ela é lida e condensada: de cada trecho fica a
     * referência e a primeira frase. Nada é reescrito; o que não cabe
     * é cortado, e o estudo inteiro está a um toque de distância.
     */
    var NO_RESUMO = 6;

    /* Abreviações que terminam em ponto e não terminam frase: cortar
       em "(v. 9)" deixava o resumo em "…uma ordem de ouvir: 'Ouçam!' (v." */
    var ABREV = /(?:^|[\s(])(?:vv?|cf|ex|pp?|caps?|s[ée]c|hb|gr|lit|a|d|n|ed|séc)\.$/i;

    /** Corta o corpo do trecho em frases, respeitando as abreviações. */
    function frasesDoCorpo(txt) {
        var limpo = String(txt || '').replace(/\s+/g, ' ').trim();
        var fora = [];
        var inicio = 0;
        for (var i = 0; i < limpo.length; i++) {
            var c = limpo.charAt(i);
            if (c !== '.' && c !== '!' && c !== '?') continue;
            var ate = limpo.slice(inicio, i + 1);
            if (ABREV.test(ate)) continue;
            var depois = limpo.slice(i + 1, i + 3);
            /* Fim de frase é ponto seguido de espaço e letra grande —
               ou o fim do texto. */
            if (depois && !/^\s["'“(]?[A-ZÀ-ÝÀ-Ÿ0-9]/.test(depois)) continue;
            fora.push(ate.trim());
            inicio = i + 1;
        }
        var resto = limpo.slice(inicio).trim();
        if (resto) fora.push(resto);
        return fora;
    }

    /**
     * O que aconteceu naquele trecho, em uma ou duas frases.
     *
     * Uma só costuma ser curta demais ("Abraão não diz nada.") ou ser
     * observação literária em vez de enredo; duas quase sempre trazem
     * o fato. Parêntese aberto e não fechado no corte é removido, que
     * é lixo de recorte, não texto.
     */
    function cenaTexto(corpo) {
        var fs = frasesDoCorpo(corpo);
        if (!fs.length) return '';
        var texto = fs[0];
        if (fs[1] && texto.length < 110) texto += ' ' + fs[1];
        if (texto.length > 210) texto = texto.slice(0, 207).replace(/\s+\S*$/, '') + '…';
        var abre = texto.lastIndexOf('(');
        if (abre >= 0 && texto.indexOf(')', abre) < 0) {
            texto = texto.slice(0, abre).replace(/[\s,;:]+$/, '');
        }
        return texto.trim();
    }

    /* Quanto texto o "ver mais" abre de uma vez. */
    var TETO_MAIS = 2600;

    /* O começo do trecho: "vv. 4-7", "v. 17", "Versículos 1 a 3". */
    var MARCA = /^(?:v+\.?|vers[íi]culos?)\s*\d[\d\s.,:;–\-eà]*/i;

    /**
     * Os trechos do capítulo, do jeito que o estudo os marcou.
     *
     * Há dois jeitos no acervo, e os dois aparecem em centenas de
     * estudos: o negrito no meio do texto ("**vv. 1-3**" ou
     * "**vv. 1-3: A ordem para escrever o livro**") e o subtítulo de
     * quarto nível ("#### **vv. 1-3**: a palavra que cria um futuro").
     * Entender só um deixava um quarto dos capítulos sem resumo — e
     * sem jeito de a pessoa saber por quê.
     */
    function cenasDe(textoMd, inteiras) {
        var achados = [];
        function juntar(cabeca, corpo) {
            var cab = String(cabeca).replace(/^#+\s*/, '').replace(/\*\*/g, '')
                .replace(/\*/g, '').replace(/\s+/g, ' ').trim();
            var m = cab.match(MARCA);
            if (!m) return;
            var limpo = String(corpo).replace(/^#+\s*/gm, '')
                .replace(/\*\*/g, '').replace(/\*/g, '')
                .replace(/\s+/g, ' ').trim();
            if (!limpo) return;
            /* O que vem depois da marca no próprio título é o nome que
               o estudo deu ao trecho — o melhor roteiro possível, porque
               foi escrito para ser isso. */
            var titulo = cab.slice(m[0].length).replace(/^[\s:.\-–—]+/, '').trim();
            achados.push({
                onde: m[0].replace(/[\s.:;,-]+$/, ''),
                titulo: titulo,
                texto: limpo
            });
        }

        /* A seção, no meio do estudo. */
        var blocos = String(textoMd || '').split(/\n(?=#{2,4}\s)/);
        var onde = -1;
        for (var b = 0; b < blocos.length; b++) {
            var cab = blocos[b].split('\n')[0] || '';
            if (/^#{2,4}\s/.test(cab) &&
                /parte por parte|o cap[íi]tulo, parte|o que acontece/i.test(cab)) {
                onde = b;
                break;
            }
        }
        if (onde < 0) return [];
        var secao = blocos[onde].split('\n').slice(1).join('\n');

        /* Três jeitos no acervo, e os três aparecem em centenas de
           estudos: subtítulo de quarto nível dentro da seção, negrito
           no meio do texto, e — o que faltava — trechos como títulos
           irmãos da própria seção ("### vv. 1-15"). */
        var sub = secao.split(/\n(?=####\s)/);
        if (sub.length > 1) {
            for (var i = 1; i < sub.length; i++) {
                var linhas = sub[i].split('\n');
                juntar(linhas[0], linhas.slice(1).join(' '));
            }
        }
        if (!achados.length) {
            var pedacos = secao.split(/\*\*\s*([^*]{1,120}?)\s*\*\*/);
            for (var k = 1; k + 1 < pedacos.length; k += 2) {
                juntar(pedacos[k], pedacos[k + 1]);
            }
        }
        if (!achados.length) {
            for (var j = onde + 1; j < blocos.length; j++) {
                var cab2 = (blocos[j].split('\n')[0] || '').replace(/^#+\s*/, '')
                    .replace(/\*\*/g, '').trim();
                if (!MARCA.test(cab2)) break;      // acabou a seção
                juntar(cab2, blocos[j].split('\n').slice(1).join(' '));
            }
        }
        if (!achados.length) return [];

        /* Fechado: uma ou duas frases por trecho, até seis trechos.
           Aberto: o trecho inteiro, até encher a caixa. */
        var fora = [];
        var somado = 0;
        for (var n = 0; n < achados.length; n++) {
            var c = achados[n];
            if (!inteiras) {
                if (fora.length >= NO_RESUMO) break;
                var frase = cenaTexto(c.texto);
                if (frase) fora.push({ onde: c.onde, titulo: c.titulo, texto: frase });
                continue;
            }
            var corpo = c.texto;
            if (somado + corpo.length > TETO_MAIS) {
                corpo = corpo.slice(0, Math.max(0, TETO_MAIS - somado))
                    .replace(/\s+\S*$/, '') + '…';
            }
            somado += corpo.length;
            fora.push({ onde: c.onde, titulo: c.titulo, texto: corpo });
            if (somado >= TETO_MAIS) break;
        }
        return fora;
    }

    /** As cenas do capítulo, buscando o estudo completo dele. */
    function obterCenas(livro, cap, inteiras) {
        if (!livro || !cap || !B.estudos || !B.estudos.obter) return Promise.resolve([]);
        return B.estudos.obter(livro.nome + ' ' + cap, 'completo').then(function (e) {
            if (!e || !e.texto) return [];
            return cenasDe(e.texto, inteiras);
        }, function () { return []; });
    }

    /* O cartão do livro, para o "ver mais" do primeiro capítulo. */
    function obterCartaoLivro(livro) {
        if (!livro || !B.estudos || !B.estudos.obter) return Promise.resolve('');
        return B.estudos.obter(livro.nome, 'completo').then(function (e) {
            if (!e || !e.texto) return '';
            var sec = secaoCrua(e.texto, /cart[ãa]o do livro|por que este livro existe/i);
            var txt = String(sec || '').replace(/^\s*[*\-]\s*/gm, '• ')
                .replace(/\*\*/g, '').replace(/\*/g, '').trim();
            return txt.length > TETO_MAIS
                ? txt.slice(0, TETO_MAIS).replace(/\s+\S*$/, '') + '…'
                : txt;
        }, function () { return ''; });
    }

    /**
     * A frase-resumo de um livro inteiro.
     *
     * Vem do panorama daquele livro, que é um estudo como os outros —
     * 50 dos 66 já existem. Faltando ele, o que sobra é o tema do livro
     * que o app já carrega, dito como o que é. Resumo de livro não se
     * escreve aqui: ou sai de um estudo, ou sai do dado.
     */
    function obterResumoLivro(livro) {
        if (!livro) return Promise.resolve('');
        var reserva = function () {
            var ctx = analisar(livro, 1);
            return ctx && ctx.temaLivro ? ctx.temaLivro : '';
        };
        if (!B.estudos || !B.estudos.obter) return Promise.resolve(reserva());
        return B.estudos.obter(livro.nome, 'completo').then(function (comp) {
            if (comp && comp.texto) {
                var r = extrairResumoDeMarkdown(comp.texto);
                if (r) return r;
            }
            return reserva();
        }, reserva);
    }

    /**
     * O fio da narrativa: de onde este capítulo vem.
     *
     * Antes eram três passos — antes, aqui e depois. O "depois" contava
     * o capítulo seguinte antes de a pessoa ler o de hoje, e isso ou
     * estraga a leitura ou é ignorado. Ficaram dois passos, e o espaço
     * que sobrou foi para o que faltava: a ligação entre eles.
     */
    function renderFioNarrativa(livro, cap) {
        var ctx = analisar(livro, cap);
        if (!ctx || !cap) return '';
        var esc = B.ui.esc;

        var blocoAtualTxt = '';
        for (var i = 0; i < ctx.blocos.length; i++) {
            var b = ctx.blocos[i];
            if (cap >= b.de && cap <= b.ate) {
                var faixa = b.de === b.ate ? 'Cap. ' + b.de : 'Caps. ' + b.de + '–' + b.ate;
                blocoAtualTxt = livro.nome + ' (' + faixa + ') · ' + b.titulo;
                break;
            }
        }

        /*
         * Um passo só, a pedido: o resumo do capítulo anterior.
         *
         * O "você está aqui" repetia na caixa o que a pessoa ia ler
         * logo abaixo, e a ponte era uma terceira frase sobre a mesma
         * coisa. Quem abre o estudo quer saber de onde vem — e no
         * primeiro capítulo de um livro isso não é o capítulo de trás
         * (que é de outro livro), é o livro inteiro em que se entra.
         */
        var ehPrimeiro = cap === 1;
        var ant = ehPrimeiro ? null : vizinhoCapitulo(livro, cap, -1);

        /*
         * "Ver mais" abre AQUI DENTRO, não troca a tela.
         *
         * Antes o cabeçalho era um link para o estudo do capítulo
         * anterior: quem só queria lembrar do que aconteceu perdia o
         * capítulo de hoje e tinha de voltar. Agora o cartão cresce no
         * lugar, e ir para o outro estudo é um segundo toque, dito com
         * todas as letras.
         */
        var alvoMais = ehPrimeiro ? livro.nome : ant.ref;
        var cabecalho = function (etiqueta, titulo) {
            return '<button type="button" class="fio-passo-cab" data-fio-abrir ' +
                'aria-expanded="false">' +
                '<span class="fio-etiqueta">' + etiqueta + '</span>' +
                '<b>' + esc(titulo) + '</b>' +
                '<span class="fio-ir" data-fio-rotulo>ver mais ›</span>' +
                '</button>';
        };
        var pe = '<div class="fio-mais" data-fio-mais hidden></div>' +
            '<a class="fio-estudo" data-fio-estudo hidden href="#/estudo/' +
            encodeURIComponent(alvoMais) + '">' +
            'Ir para o estudo de ' + esc(alvoMais) + ' ›</a>';

        var passo = ehPrimeiro
            ? '<div class="fio-passo">' +
              cabecalho('📖 O LIVRO EM QUE VOCÊ ENTRA', livro.nome) +
              '<p class="fio-resumo" data-fio-resumo="livro">Carregando o panorama de ' +
              esc(livro.nome) + '…</p>' + pe +
              '</div>'
            : '<div class="fio-passo">' +
              cabecalho('◀ O CAPÍTULO ANTERIOR', ant.ref) +
              '<p class="fio-resumo" data-fio-resumo="ant">Carregando síntese de ' +
              esc(ant.ref) + '…</p>' +
              '<ul class="fio-cenas" data-fio-cenas hidden></ul>' + pe +
              '</div>';

        return '<section class="cartao fio-narrativa" data-fio-narrativa>' +
            '<div class="fio-topo">' +
            '<span class="fio-selo">🧵 Fio da Narrativa · De onde vem este capítulo</span>' +
            (blocoAtualTxt ? '<small class="fio-bloco">' + esc(blocoAtualTxt) + '</small>' : '') +
            '</div>' +
            '<div class="fio-passos">' + passo + '</div>' +
            '</section>';
    }

    /* Liga o "ver mais": carrega na primeira vez, depois só mostra. */
    function ligarVerMais(caixa, carregar) {
        var botao = B.ui.q('[data-fio-abrir]', caixa);
        var vao = B.ui.q('[data-fio-mais]', caixa);
        var link = B.ui.q('[data-fio-estudo]', caixa);
        var rotulo = B.ui.q('[data-fio-rotulo]', caixa);
        if (!botao || !vao) return;

        botao.addEventListener('click', function () {
            var abrindo = vao.hidden;
            if (abrindo && !vao.__cheio) {
                vao.__cheio = true;
                vao.innerHTML = '<p class="carregando">Abrindo…</p>';
                carregar().then(function (html) {
                    vao.innerHTML = html ||
                        '<p class="dica">Não há mais do que isto guardado no aparelho.</p>';
                }, function () {
                    vao.innerHTML = '<p class="dica">Não deu para abrir agora.</p>';
                });
            }
            vao.hidden = !abrindo;
            if (link) link.hidden = !abrindo;
            /* Aberto, a lista curta some: ela é o mesmo texto cortado,
               e repetida embaixo da inteira vira ruído. */
            var curtas = B.ui.q('[data-fio-cenas]', caixa);
            if (curtas && curtas.innerHTML) curtas.hidden = abrindo;
            botao.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
            if (rotulo) rotulo.textContent = abrindo ? 'ver menos ›' : 'ver mais ›';
        });
    }

    function preencherFioNarrativa(container, livro, cap, estudoAtual) {
        if (!container || !livro || !cap) return;
        var caixa = B.ui.q('[data-fio-narrativa]', container);
        if (!caixa) return;

        /* No primeiro capítulo, o resumo é do livro; nos outros, do
           capítulo de trás. Um dos dois existe sempre. */
        var elLivro = B.ui.q('[data-fio-resumo="livro"]', caixa);
        if (elLivro) {
            obterResumoLivro(livro).then(function (txt) {
                elLivro.textContent = txt ||
                    ('Panorama de ' + livro.nome + ' (' + livro.caps + ' capítulos).');
            });
            ligarVerMais(caixa, function () {
                return obterCartaoLivro(livro).then(function (txt) {
                    if (!txt) return '';
                    return '<p class="fio-mais-tit">O cartão do livro</p>' +
                        txt.split(/\n+/).map(function (l) {
                            return '<p>' + B.ui.esc(l) + '</p>';
                        }).join('');
                });
            });
            return;
        }

        var ant = vizinhoCapitulo(livro, cap, -1);
        if (!ant) return;

        var elAnt = B.ui.q('[data-fio-resumo="ant"]', caixa);
        if (elAnt) {
            obterResumoCapitulo(ant.livro, ant.cap, null).then(function (txt) {
                elAnt.textContent = txt || ('Capítulo anterior (' + ant.ref + ').');
            });
        }

        /* E o que aconteceu nele, trecho a trecho — que é o que faz
           lembrar. Sem o estudo completo do anterior não há cenas, e
           aí fica só a frase: melhor do que inventar o enredo. */
        var elCenas = B.ui.q('[data-fio-cenas]', caixa);
        if (elCenas) {
            obterCenas(ant.livro, ant.cap).then(function (cenas) {
                if (!cenas.length) return;
                elCenas.innerHTML = cenas.map(function (c) {
                    return '<li><b>' + B.ui.esc(c.onde) + '</b> ' +
                        B.ui.esc(c.texto) + '</li>';
                }).join('');
                elCenas.hidden = false;
            });
        }

        ligarVerMais(caixa, function () {
            return obterCenas(ant.livro, ant.cap, true).then(function (cenas) {
                if (!cenas.length) return '';
                return '<p class="fio-mais-tit">' + B.ui.esc(ant.ref) +
                    ', trecho a trecho</p>' +
                    cenas.map(function (c) {
                        return '<p><b>' + B.ui.esc(c.onde) + '</b> ' +
                            B.ui.esc(c.texto) + '</p>';
                    }).join('');
            });
        });
    }

    /* Liga as abas do Guia Exegético e os cliques de referências bíblicas */
    function ligar(container, livroPadrao, capPadrao) {
        if (!container) return;
        B.ui.qq('[data-ctx-aba]', container).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var alvo = btn.getAttribute('data-ctx-aba');
                var raiz = btn.closest('.ctx-corpo') || container;
                B.ui.qq('[data-ctx-aba]', raiz).forEach(function (b) {
                    b.classList.toggle('is-on', b === btn);
                });
                B.ui.qq('[data-ctx-painel]', raiz).forEach(function (p) {
                    p.hidden = p.getAttribute('data-ctx-painel') !== alvo;
                });
            });
        });

        B.ui.qq('[data-abrir-ref]', container).forEach(function (btn) {
            if (btn.__refLigado) return;
            btn.__refLigado = true;
            btn.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                abrirReferencia(btn.getAttribute('data-abrir-ref'), livroPadrao, capPadrao);
            });
        });

        B.ui.qq('[data-abrir-lugar]', container).forEach(function (btn) {
            if (btn.__lugarLigado) return;
            btn.__lugarLigado = true;
            btn.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var nome = btn.getAttribute('data-abrir-lugar');
                var desc = btn.getAttribute('data-lugar-desc') || '';
                if (B.telas && B.telas.mapa && B.telas.mapa.abrirModal) {
                    B.telas.mapa.abrirModal(nome, livroPadrao, capPadrao, desc);
                }
            });
        });
    }

    /* Substitui padrões em nós de texto dentro de um elemento, ignorando botões/links/cabeçalhos */
    function transformarNosDeTexto(raizEl, fnTransformarHtml) {
        if (!raizEl || !document.createTreeWalker) return;
        var nos = [];
        var walker = document.createTreeWalker(raizEl, NodeFilter.SHOW_TEXT, null, false);
        var n;
        while ((n = walker.nextNode())) {
            var p = n.parentNode;
            if (!p || !p.closest) continue;
            if (p.closest('button, a, code, h3, h4, h5, .bloco-exegese-topo, .selo-strong, .selo-epoca, .selo-debate, .est-sintese-selo, .ctx-rotulo')) {
                continue;
            }
            if ((n.nodeValue || '').trim().length < 2) continue;
            nos.push(n);
        }
        nos.forEach(function (noTexto) {
            var original = B.ui.esc(noTexto.nodeValue);
            var novoHtml = fnTransformarHtml(original);
            if (novoHtml !== original) {
                var span = document.createElement('span');
                span.innerHTML = novoHtml;
                var frag = document.createDocumentFragment();
                while (span.firstChild) frag.appendChild(span.firstChild);
                if (noTexto.parentNode) noTexto.parentNode.replaceChild(frag, noTexto);
            }
        });
    }

    /* Transforma referências bíblicas dentro do estudo (ex.: "vv. 1-8",
       "v. 14", "João 3:16", "2 Samuel 7:12-16", "Gn 15:6") em botões clicáveis
       que abrem o texto bíblico num modal instantâneo. */
    function enriquecerReferencias(prosaEl, livroAtual, capAtual) {
        if (!prosaEl || !livroAtual) return;
        var nomes = B.biblia.LIVROS.map(function (l) { return l.nome; })
            .concat(['Gn', 'Êx', 'Ex', 'Lv', 'Nm', 'Dt', 'Js', 'Jz', 'Rt', '1Sm', '2Sm', '1Rs', '2Rs',
                '1Cr', '2Cr', 'Ed', 'Ne', 'Et', 'Sl', 'Pv', 'Ec', 'Ct', 'Is', 'Jr', 'Lm', 'Ez', 'Dn',
                'Os', 'Jl', 'Am', 'Ob', 'Jn', 'Mq', 'Na', 'Hc', 'Sf', 'Ag', 'Zc', 'Ml',
                'Mt', 'Mc', 'Lc', 'Jo', 'At', 'Rm', '1Co', '2Co', 'Gl', 'Ef', 'Fp', 'Cl',
                '1Ts', '2Ts', '1Tm', '2Tm', 'Tt', 'Fm', 'Hb', 'Tg', '1Pe', '2Pe', '1Jo', '2Jo', '3Jo', 'Jd', 'Ap']);
        nomes.sort(function (a, b) { return b.length - a.length; });
        var padraoLivros = nomes.map(function (n) {
            return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|');
        var rxLivros = new RegExp('(^|[\\s(>"\'«“])((' + padraoLivros + ')\\s+(\\d{1,3})(?:[:.](\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?)(?=[\\s.,;:)"\'»”\\]<]|$)', 'g');

        transformarNosDeTexto(prosaEl, function (htmlEscapado) {
            var botoes = [];
            var h = htmlEscapado.replace(/\b(vv?\.\s*(\d+)(?:\s*[-–a]\s*(\d+))?)\b/gi, function (m, textoInteiro, v1, v2) {
                var ref = livroAtual.nome + ' ' + (capAtual || 1) + ':' + v1 + (v2 ? '-' + v2 : '');
                var idx = botoes.length;
                botoes.push('<button type="button" class="ref-inline" data-abrir-ref="' + B.ui.esc(ref) + '">' + textoInteiro + '</button>');
                return '\x01' + idx + '\x02';
            });
            h = h.replace(rxLivros, function (m, pre, refCompleta) {
                var refNorm = refCompleta.replace(/(\d+)\.(\d+)/, '$1:$2');
                var idx = botoes.length;
                botoes.push('<button type="button" class="ref-inline" data-abrir-ref="' + B.ui.esc(refNorm) + '">' + refCompleta + '</button>');
                return pre + '\x01' + idx + '\x02';
            });
            return h.replace(/\x01(\d+)\x02/g, function (_, idx) {
                return botoes[parseInt(idx, 10)] || '';
            });
        });

        ligar(prosaEl, livroAtual, capAtual);
    }

    /* Palavras comuns em português que coincidem com nomes de lugares na base mas não devem virar link sozinhas no meio de frases */
    var LUGARES_IGNORAR_SOLTOS = {
        'porta': 1, 'campo': 1, 'leste': 1, 'oeste': 1, 'norte': 1, 'sul': 1,
        'fonte': 1, 'poco': 1, 'vale': 1, 'monte': 1, 'cidade': 1, 'terra': 1,
        'caminho': 1, 'rocha': 1, 'muro': 1, 'torre': 1, 'jardim': 1, 'rio': 1,
        'mar': 1, 'lago': 1, 'deserto': 1, 'lugar santo': 1, 'tenda': 1, 'casa': 1
    };

    /* Transforma localidades bíblicas em botões clicáveis que abrem o popup interativo do mapa */
    function enriquecerLugares(prosaEl, livroAtual, capAtual) {
        if (!prosaEl || !livroAtual || !B.lugares) return;
        var cap = capAtual || 1;
        var esc = B.ui.esc;

        /* 1. Na seção "Os lugares", transforma cada título em negrito num botão de mapa imediato */
        var h4Lugares = acharSecaoH4(prosaEl, /^os lugares/i);
        if (h4Lugares) {
            elementosDaSecao(h4Lugares).forEach(function (el) {
                var itens = el.tagName === 'UL' || el.tagName === 'OL' ? B.ui.qq('li', el) : [el];
                itens.forEach(function (item) {
                    var strong = B.ui.q('strong, b', item);
                    if (!strong || strong.closest('button')) return;
                    var nomeBruto = (strong.textContent || '').replace(/^["'«“]+|["'»”.:—–-]+$/g, '').trim();
                    if (!nomeBruto || nomeBruto.length < 2) return;
                    var descItem = (item.textContent || '').trim();
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'lugar-inline';
                    btn.setAttribute('data-abrir-lugar', nomeBruto);
                    btn.setAttribute('data-lugar-desc', descItem);
                    btn.textContent = '📍 ' + nomeBruto;
                    strong.parentNode.replaceChild(btn, strong);
                });
            });
            ligar(prosaEl, livroAtual, cap);
        }

        /* 2. Carrega a base geográfica e transforma menções de localidades no corpo do estudo */
        B.lugares.carregar().then(function () {
            var mapaNomes = {};
            function adicionarNome(n) {
                if (!n || n.length < 3) return;
                var limpo = n.trim();
                var chaveBaixa = limpo.toLowerCase();
                if (LUGARES_IGNORAR_SOLTOS[chaveBaixa]) return;
                /* Só aceita nomes iniciados com letra maiúscula e sem palavras inglesas genéricas */
                if (!/^[A-ZÀ-Ý]/.test(limpo)) return;
                if (/\b(Mount|Valley|Gate|Brook|Sea|Spring|Stone|Oak|Hill|Plain|Forest|Hall|City|Tower|Wall)\b/.test(limpo)) return;
                mapaNomes[limpo] = true;
            }

            /* Lugares do próprio capítulo e contexto vizinho */
            if (livroAtual.usfm) {
                B.lugares.doCapitulo(livroAtual.usfm, cap).forEach(function (l) { adicionarNome(l.n); });
                var ctxLug = B.lugares.contexto(livroAtual.usfm, cap);
                if (ctxLug && ctxLug.lista) {
                    ctxLug.lista.forEach(function (l) { adicionarNome(l.n); });
                }
            }

            /* Principais localidades bíblicas em português */
            [
                'Monte Sinai', 'Deserto do Sinai', 'Sinai', 'Monte Horebe', 'Horebe',
                'Jerusalém', 'Monte Sião', 'Monte Moriá', 'Moriá', 'Monte das Oliveiras',
                'Rio Jordão', 'Jordão', 'Mar Morto', 'Mar da Galileia', 'Mar Vermelho', 'Mar Grande',
                'Cades-Barneia', 'Deserto de Parã', 'Deserto de Zim', 'Neguebe', 'Sefelá',
                'Judeia', 'Samaria', 'Galileia', 'Canaã', 'Egito', 'Gósen',
                'Jericó', 'Siquém', 'Siló', 'Betel', 'Hebrom', 'Berseba', 'Gilgal', 'Gibeão', 'Mispa', 'Ramá',
                'En-Gedi', 'Adulão', 'Hazerote', 'Monte Hor', 'Monte Nebo', 'Pisga', 'Monte Carmelo', 'Carmelo',
                'Monte Hermom', 'Monte Ebal', 'Monte Gilboa', 'Jaboque', 'Arnom', 'Eufrates',
                'Nazaré', 'Cafarnaum', 'Betsaida', 'Betânia', 'Belém', 'Emaús', 'Getsêmani', 'Gólgota',
                'Cesareia', 'Jope', 'Lida', 'Gaza', 'Asdode', 'Asquelom', 'Ecrom', 'Tiro', 'Sidom', 'Líbano',
                'Damasco', 'Antioquia', 'Tarso', 'Derbe', 'Listra', 'Icônio', 'Éfeso', ' Filipos',
                'Tessalônica', 'Bereia', 'Atenas', 'Corinto', 'Roma', 'Chipre', 'Creta', 'Patmos',
                'Galácia', 'Capadócia', 'Bitínia', 'Cilícia', 'Macedônia', 'Acaia', 'Decápolis',
                'Babilônia', 'Assíria', 'Nínive', 'Susã', 'Ur dos Caldeus', 'Harã', 'Carquemis',
                'Moabe', 'Edom', 'Amom', 'Midiã', 'Gileade', 'Basã', 'Hesbom', 'Edrei', 'Arade', 'Beer-Laai-Roi', 'Manre'
            ].forEach(adicionarNome);

            /* Nomes em português do banco de lugares (com acento ou conhecidos) */
            B.lugares.todos().forEach(function (l) {
                if (l.en && l.n !== l.en && l.n.length >= 4) {
                    adicionarNome(l.n);
                }
            });

            var listaNomes = Object.keys(mapaNomes);
            if (!listaNomes.length) return;
            listaNomes.sort(function (a, b) { return b.length - a.length; });

            var padrao = listaNomes.map(function (n) {
                return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }).join('|');
            var rxLugar = new RegExp('(^|[\\s(«"“])(' + padrao + ')(?=[\\s.,;:!?)»"”\\]]|$)', 'g');

            transformarNosDeTexto(prosaEl, function (htmlEscapado) {
                return htmlEscapado.replace(rxLugar, function (m, pre, nomeAchado) {
                    return pre + '<button type="button" class="lugar-inline" data-abrir-lugar="' + esc(nomeAchado) + '">📍 ' + nomeAchado + '</button>';
                });
            });

            ligar(prosaEl, livroAtual, cap);
        });
    }

    /* Classifica teólogos citados na seção "O que dizem os teólogos" por época histórica */
    function classificarEpocaTeologo(texto) {
        var t = (texto || '').toLowerCase();
        if (/agostinho|cris[óo]stomo|atan[áa]sio|ireneu|jer[ôo]nimo|or[íi]genes|tertuliano|ambr[óo]sio|cirilo|bas[íi]lio|greg[óo]rio|patr[íi]stica|pais da igreja|s[ée]c(?:ulo|\.)\s*(ii|iii|iv|v)\b/.test(t)) {
            return { rotulo: 'Patrística', classe: 'epoca--patristica' };
        }
        if (/calvino|lutero|melanchthon|zu[íi]nglio|bullinger|bucer|knox|reforma|heidelberg|belga|s[ée]c(?:ulo|\.)\s*xvi\b/.test(t)) {
            return { rotulo: 'Reforma (Séc. XVI)', classe: 'epoca--reforma' };
        }
        if (/owen|bunyan|edwards|matthew henry|\bhenry\b|spurgeon|bavinck|kuyper|hodge|warfield|lloyd-jones|westminster|dort|puritano|rutherf|watson|sibbes|flavel|baxter|s[ée]c(?:ulo|\.)\s*(xvii|xviii|xix)\b/.test(t)) {
            return { rotulo: 'Puritanos & Clássicos', classe: 'epoca--puritanos' };
        }
        return { rotulo: 'Exegese & Teologia Bíblica', classe: 'epoca--contemp' };
    }

    /* Extrai a primeira frase ou resumo limpo de um texto */
    function primeiraFrase(txt, maxLen) {
        var limpo = String(txt || '').replace(/\s+/g, ' ').trim();
        if (!limpo) return '';
        var m = limpo.match(/^(.+?[.!?])(?:\s|$)/);
        var f = m ? m[1] : limpo;
        if (maxLen && f.length > maxLen) {
            return f.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
        }
        return f;
    }

    /* Encontra uma seção <h4> pelo título dentro da prosa */
    function acharSecaoH4(prosaEl, regexTitulo) {
        var hs = B.ui.qq('h4', prosaEl);
        for (var i = 0; i < hs.length; i++) {
            if (regexTitulo.test(hs[i].textContent || '')) return hs[i];
        }
        return null;
    }

    /* Verifica se um <h4> é título de uma seção principal do estudo (e não um subtítulo "### vv. 1-15") */
    function ehH4SecaoPrincipal(el) {
        if (!el || el.tagName !== 'H4') return false;
        var t = (el.textContent || '').trim();
        if (/^(?:vv?\.|vers[íi]culos?)\s*\d+/i.test(t)) return false;
        return true;
    }

    /* Coleta todos os elementos irmãos entre um <h4> e o próximo <h4> de seção principal */
    function elementosDaSecao(h4) {
        var lista = [];
        if (!h4) return lista;
        var el = h4.nextElementSibling;
        while (el && !ehH4SecaoPrincipal(el)) {
            lista.push(el);
            el = el.nextElementSibling;
        }
        return lista;
    }

    /* Extrai a faixa de versículos [vIni, vFim] de um cabeçalho de bloco exegético */
    function extrairFaixaVersosTexto(texto, capAtual) {
        var t = String(texto || '').trim();
        if (!t) return null;
        /* 1. vv. 1-11, v. 8, vv. 1 a 5, Versículos 1-10, Versículo 4, (vv. 1-4) */
        var m1 = t.match(/\b(?:vv?\.|vers[íi]culos?|vers\.)\s*(\d{1,3})[a-z]?(?:\s*(?:[-–—a]|e|at[ée])\s*(\d{1,3})[a-z]?)?/i);
        if (m1) {
            var v1 = parseInt(m1[1], 10);
            var v2 = m1[2] ? parseInt(m1[2], 10) : v1;
            return [v1, Math.max(v1, v2)];
        }
        /* 2. Cap:v1-v2 ou Cap.v1-v2 (ex.: "13:1-5", "13.1-5") */
        var rxCap = new RegExp('\\b' + (capAtual || 1) + '\\s*[:.]\\s*(\\d{1,3})[a-z]?(?:\\s*[-–—a]\\s*(\\d{1,3})[a-z]?)?');
        var m2 = t.match(rxCap);
        if (m2) {
            var c1 = parseInt(m2[1], 10);
            var c2 = m2[2] ? parseInt(m2[2], 10) : c1;
            return [c1, Math.max(c1, c2)];
        }
        return null;
    }

    function extrairFaixaDeElemento(el, capAtual) {
        if (!el) return null;
        var tag = el.tagName;
        if (tag === 'H4' || tag === 'H5' || tag === 'H6') {
            return extrairFaixaVersosTexto(el.textContent, capAtual);
        }
        if (tag === 'P' || tag === 'LI') {
            var strong = el.firstElementChild;
            if (strong && (strong.tagName === 'STRONG' || strong.tagName === 'B')) {
                var fStrong = extrairFaixaVersosTexto(strong.textContent, capAtual);
                if (fStrong) return fStrong;
            }
            var inicioTxt = (el.textContent || '').trim().slice(0, 95);
            if (/^(?:vv?\.|vers[íi]culos?|\d+\.\s|\(\s*vv?\.)/i.test(inicioTxt) || (strong && (strong.tagName === 'STRONG' || strong.tagName === 'B'))) {
                return extrairFaixaVersosTexto(inicioTxt, capAtual);
            }
        }
        return null;
    }

    /**
     * A introdução do capítulo, antes do "parte por parte".
     *
     * Quem vai ler o capítulo quer saber, em dez segundos, o que vai
     * acontecer — e o estudo já sabe: cada trecho dele tem nome e
     * faixa de versículos. O roteiro é montado com esses nomes, na
     * ordem, e nada é escrito aqui. Estudo sem a seção não ganha
     * cartão: melhor nenhum do que um roteiro inventado.
     */
    function inserirIntroCapitulo(prosaEl, estudo, tese, livro, cap) {
        if (!prosaEl || !estudo || !estudo.texto) return;
        if (B.ui.q('[data-intro-cap]', prosaEl)) return;
        var h4 = acharSecaoH4(prosaEl, /parte por parte|bloco a bloco|passo a passo/i);
        if (!h4) return;

        /* Estudo sem trechos nomeados não ganha cartão: um roteiro
           inventado aqui seria pior do que nenhum. */
        var cenas = cenasDe(estudo.texto, false);
        if (cenas.length < 2) return;
        pintarIntro(prosaEl, h4, tese, cenas);
    }

    function pintarIntro(prosaEl, h4, tese, cenas) {
        if (B.ui.q('[data-intro-cap]', prosaEl)) return;
        var esc = B.ui.esc;

        /* Roteiro é linha de uma olhada: onde o estudo não deu nome ao
           trecho, corta-se na primeira pausa do texto, não na primeira
           frase inteira — que em estudo é longa. */
        function curto(txt) {
            var t = String(txt || '').replace(/\s+/g, ' ').trim();
            var corte = t.slice(0, 90);
            /* Frase curta inteira vale mais que meia frase longa. */
            var ponto = corte.indexOf('. ');
            if (ponto > 24) return corte.slice(0, ponto);
            var pausa = Math.max(corte.lastIndexOf(': '), corte.lastIndexOf('; '),
                corte.lastIndexOf(', '), corte.lastIndexOf(' — '));
            if (pausa > 34) return corte.slice(0, pausa);
            return t.length > 90 ? corte.replace(/\s+\S*$/, '') + '…' : t;
        }

        var linhas = cenas.map(function (c) {
            /* O nome que o estudo deu ao trecho; não havendo, o começo
               do próprio trecho. */
            var diz = c.titulo || curto(c.texto);
            return '<li><b>' + esc(c.onde) + '</b> ' + esc(diz) + '</li>';
        }).join('');

        var caixa = document.createElement('section');
        caixa.className = 'intro-cap';
        caixa.setAttribute('data-intro-cap', '');
        caixa.innerHTML = '<p class="intro-cap-selo">🧭 Antes de ler · o que acontece ' +
            'neste capítulo</p>' +
            /* A tese vem do DOM, onde os lugares já ganharam o seu 📍:
               aqui ela é texto corrido, e o pino ficaria solto. */
            (tese
                ? '<p class="intro-cap-tese">' +
                  esc(String(tese).replace(/📍\s*/g, '').replace(/\s+/g, ' ').trim()) +
                  '</p>'
                : '') +
            '<ol class="intro-cap-roteiro">' + linhas + '</ol>';
        h4.parentNode.insertBefore(caixa, h4);
    }

    /**
     * Tira uma seção da tela — e só da tela.
     *
     * O markdown guardado continua inteiro, que é de onde a tela Orar
     * tira a oração do capítulo. Aqui some apenas o que a pessoa não
     * quer ler no meio do estudo.
     */
    function tirarSecao(prosaEl, regexTitulo) {
        var h4 = acharSecaoH4(prosaEl, regexTitulo);
        if (!h4) return false;
        elementosDaSecao(h4).forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        if (h4.parentNode) h4.parentNode.removeChild(h4);
        return true;
    }

    /* As duas que saíram a pedido: as perguntas para meditar e a oração
       no meio do texto. A oração continua inteira em "Orar este
       capítulo", que é onde ela serve. */
    function tirarSecoesPedidas(prosaEl) {
        tirarSecao(prosaEl, /para meditar|perguntas para meditar/i);
        tirarSecao(prosaEl, /^\s*ora[çc][ãa]o\s*$/i);
    }

    function construirBlocosExegeseDOM(prosaEl, estudo, livroAtual, cap) {
        var esc = B.ui.esc;
        var h4Parte = acharSecaoH4(prosaEl, /parte por parte|bloco a bloco|passo a passo/i);
        var blocosExegese = [];
        if (h4Parte && (!estudo || estudo.tipo !== 'livro')) {
            var barraParte = document.createElement('div');
            barraParte.className = 'parte-por-parte-topo';
            barraParte.innerHTML =
                '<button type="button" class="btn btn--mini btn-toggle-todos-versos" data-toggle-todos-versos>' +
                '📖 Mostrar todos os textos bíblicos</button>';
            if (h4Parte.nextSibling) h4Parte.parentNode.insertBefore(barraParte, h4Parte.nextSibling);
            else h4Parte.parentNode.appendChild(barraParte);

            var elsBrutos = elementosDaSecao(h4Parte).filter(function (x) { return x !== barraParte; });
            var elsParte = [];

            /* Se os blocos de versículos vieram dentro de uma lista <ul>/<ol>, desempacota cada <li> em <p> */
            elsBrutos.forEach(function (el) {
                if ((el.tagName === 'UL' || el.tagName === 'OL') && el.children.length) {
                    var lis = B.ui.qq('li', el);
                    var quantosComFaixa = lis.filter(function (li) { return !!extrairFaixaDeElemento(li, cap); }).length;
                    if (quantosComFaixa > 0 && quantosComFaixa >= Math.ceil(lis.length / 2)) {
                        lis.forEach(function (li) {
                            var pNovo = document.createElement('p');
                            pNovo.innerHTML = li.innerHTML;
                            el.parentNode.insertBefore(pNovo, el);
                            elsParte.push(pNovo);
                        });
                        el.parentNode.removeChild(el);
                        return;
                    }
                }
                elsParte.push(el);
            });

            var blocoAtual = null;
            elsParte.forEach(function (el) {
                var faixa = extrairFaixaDeElemento(el, cap);
                if (faixa) {
                    var vIni = faixa[0];
                    var vFim = faixa[1];

                    var card = document.createElement('div');
                    card.className = 'bloco-exegese';
                    card.innerHTML =
                        '<div class="bloco-exegese-topo">' +
                        /* A referência já diz a faixa: "Levítico 22:1–9 (vv. 1–9)" era a
                           mesma informação duas vezes, e numa tela de celular isso
                           custava uma linha. */
                        '<span class="bloco-exegese-selo">📖 ' + esc(livroAtual.nome + ' ' + cap + ':' + (vIni === vFim ? vIni : vIni + '–' + vFim)) + '</span>' +
                        '<button type="button" class="bloco-exegese-toggle" data-toggle-versos>Mostrar texto bíblico</button>' +
                        '<button type="button" class="bloco-exegese-toggle" data-comparar-bloco="' + vIni + '-' + vFim + '">⚖️ Comparar edições</button>' +
                        (B.audio && B.audio.disponivel()
                            ? '<button type="button" class="bloco-exegese-toggle" ' +
                              'data-ouvir-bloco="' + vIni + '-' + vFim + '">🔊 Ouvir</button>' +
                              /* A velocidade só aparece enquanto este bloco está
                                 sendo lido: um botão de 1× em cada um dos blocos
                                 do capítulo seria ruído em cima do texto. */
                              '<button type="button" class="bloco-exegese-toggle" ' +
                              'data-vel-bloco title="Velocidade da voz" hidden>' +
                              esc(B.audio.rotulo()) + '</button>'
                            : '') +
                        '</div>' +
                        '<div class="bloco-versos-inline" data-versos-faixa="' + vIni + '-' + vFim + '" hidden>' +
                        '<small class="dica">Carregando versículos…</small>' +
                        '</div>' +
                        '<div class="bloco-exegese-comentario"></div>';

                    el.parentNode.insertBefore(card, el);
                    var comBox = B.ui.q('.bloco-exegese-comentario', card);
                    comBox.appendChild(el);
                    blocoAtual = { card: card, comBox: comBox, vIni: vIni, vFim: vFim };
                    blocosExegese.push(blocoAtual);
                } else if (blocoAtual) {
                    blocoAtual.comBox.appendChild(el);
                }
            });
        }
        return blocosExegese;
    }

    function ativarBlocosExegeseDOM(prosaEl, blocosExegese, livroAtual, cap) {
        if (!blocosExegese || !blocosExegese.length || !B.texto || !B.texto.capitulo) return;
        var esc = B.ui.esc;
        /* As ligações do livro vêm junto: elas entram por baixo de cada
           bloco, e pedi-las depois faria o quadro pular na tela. */
        var ligacoes = B.referencias
            ? B.referencias.carregar(livroAtual.usfm).catch(function () { return null; })
            : Promise.resolve(null);

        Promise.all([B.texto.capituloOuReserva(livroAtual.nome, cap), ligacoes])
            .then(function (dois) {
            var r = dois[0];
            var versos = r.versiculos;
            /* Quando a edição escolhida não tem este livro, o texto vem da
               Almeida — e isso é dito, em vez de passar por ser a outra. */
            /* De qual edição saiu este texto, dito no próprio bloco.
               Sem isto, quem lê (e quem conserta) não tem como saber se o
               que está na tela é a edição escolhida ou a de reserva. */
            var deOndeVeio = '<small class="dica v-bloco-fonte">' + (r.reserva
                ? 'Texto da <b>' + esc(r.edicao.nome) + '</b>: a edição que você carregou ' +
                  'não tem este livro.'
                : 'Texto: <b>' + esc(r.edicao.nome) + '</b>') + '</small>';
            B.ui.qq('[data-versos-faixa]', prosaEl).forEach(function (box) {
                var partes = (box.getAttribute('data-versos-faixa') || '').split('-');
                var v1 = Math.max(1, parseInt(partes[0], 10) || 1);
                var v2 = Math.min(versos.length, parseInt(partes[1], 10) || v1);
                var htmlV = [];
                for (var n = v1; n <= v2; n++) {
                    if (versos[n - 1]) {
                        htmlV.push('<p class="v-bloco-item"><b class="v-bloco-num">' + n + '</b> ' + esc(versos[n - 1]) + '</p>');
                    }
                }
                box.innerHTML = htmlV.length
                    ? htmlV.join('') + deOndeVeio + ligacoesDaFaixa(livroAtual, cap, v1, v2)
                    : '<small class="dica">Texto bíblico indisponível para esta faixa.</small>';
            });
        }, function () {
            B.ui.qq('[data-versos-faixa]', prosaEl).forEach(function (box) {
                box.hidden = true;
            });
        });

        prosaEl.addEventListener('click', function (ev) {
            var botao = ev.target.closest ? ev.target.closest('[data-ligacao]') : null;
            if (!botao) return;
            abrirReferencia(botao.getAttribute('data-ligacao'), livroAtual, cap);
        });

        ligarOuvirBlocos(prosaEl, livroAtual, cap);

        B.ui.qq('[data-toggle-versos]', prosaEl).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var card = btn.closest('.bloco-exegese');
                var box = card ? B.ui.q('.bloco-versos-inline', card) : null;
                if (!box) return;
                box.hidden = !box.hidden;
                btn.textContent = box.hidden ? 'Mostrar texto bíblico' : 'Ocultar texto bíblico';
                atualizarBotaoToggleTodos(prosaEl);
            });
        });

        var btnTodos = B.ui.q('[data-toggle-todos-versos]', prosaEl);
        if (btnTodos) {
            btnTodos.addEventListener('click', function () {
                var caixas = B.ui.qq('.bloco-versos-inline', prosaEl);
                var algumFechado = caixas.some(function (c) { return c.hidden; });
                caixas.forEach(function (c) { c.hidden = !algumFechado; });
                B.ui.qq('[data-toggle-versos]', prosaEl).forEach(function (b) {
                    b.textContent = algumFechado ? 'Ocultar texto bíblico' : 'Mostrar texto bíblico';
                });
                atualizarBotaoToggleTodos(prosaEl);
            });
        }

        B.ui.qq('[data-comparar-bloco]', prosaEl).forEach(function (btnComp) {
            btnComp.addEventListener('click', function () {
                var partes = (btnComp.getAttribute('data-comparar-bloco') || '').split('-');
                var v1 = parseInt(partes[0], 10) || 1;
                var v2 = parseInt(partes[1], 10) || v1;
                compararVersosModal(livroAtual.nome, cap, v1, v2);
            });
        });
    }

    function atualizarBotaoToggleTodos(prosaEl) {
        var btnTodos = B.ui.q('[data-toggle-todos-versos]', prosaEl);
        if (!btnTodos) return;
        var caixas = B.ui.qq('.bloco-versos-inline', prosaEl);
        var algumFechado = caixas.some(function (c) { return c.hidden; });
        btnTodos.textContent = algumFechado
            ? '📖 Mostrar todos os textos bíblicos'
            : '▴ Ocultar todos os textos bíblicos';
    }

    /**
     * Ouvir o trecho bíblico de um bloco, dentro do estudo.
     *
     * É o mesmo motor da tela de leitura (B.audio), aqui lendo só a
     * faixa daquele bloco — e abrindo o quadro do texto antes, porque
     * ouvir sem ver o versículo destacado perde metade da graça.
     */
    function ligarOuvirBlocos(prosaEl, livro, cap) {
        if (!B.audio || !B.audio.disponivel()) return;

        /* Mostra/esconde e repinta os botões de velocidade dos blocos. */
        function pintarVel(cardLendo) {
            B.ui.qq('[data-vel-bloco]', prosaEl).forEach(function (b) {
                b.textContent = B.audio.rotulo();
                b.hidden = !cardLendo || b.closest('.bloco-exegese') !== cardLendo;
            });
        }

        prosaEl.addEventListener('click', function (ev) {
            var vel = ev.target.closest ? ev.target.closest('[data-vel-bloco]') : null;
            if (vel) {
                /* Gira entre as velocidades e aplica no versículo em curso. */
                B.audio.trocarVelocidade(B.audio.proximaVelocidade());
                pintarVel(vel.closest('.bloco-exegese'));
                return;
            }

            var botao = ev.target.closest ? ev.target.closest('[data-ouvir-bloco]') : null;
            if (!botao) return;

            if (B.audio.estado().lendo) {
                B.audio.parar();
                B.ui.qq('[data-ouvir-bloco]', prosaEl).forEach(function (b) {
                    b.textContent = '🔊 Ouvir';
                });
                pintarVel(null);
                return;
            }

            var faixa = (botao.getAttribute('data-ouvir-bloco') || '').split('-');
            var v1 = parseInt(faixa[0], 10) || 1;
            var v2 = parseInt(faixa[1], 10) || v1;
            var card = botao.closest('.bloco-exegese');
            var caixa = card ? B.ui.q('.bloco-versos-inline', card) : null;
            if (caixa && caixa.hidden) {
                caixa.hidden = false;
                var abrir = card ? B.ui.q('[data-toggle-versos]', card) : null;
                if (abrir) abrir.textContent = 'Ocultar texto bíblico';
            }

            B.texto.capituloOuReserva(livro.nome, cap).then(function (r) {
                var versos = r.versiculos.slice(v1 - 1, v2);
                botao.textContent = '⏹ Parar';
                pintarVel(card);
                B.audio.ler(versos, function (i) {
                    var linhas = caixa ? B.ui.qq('.v-bloco-item', caixa) : [];
                    linhas.forEach(function (el, n) {
                        el.classList.toggle('is-lendo', n === i);
                    });
                    if (linhas[i]) linhas[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, function () {
                    botao.textContent = '🔊 Ouvir';
                    pintarVel(null);
                    if (caixa) {
                        B.ui.qq('.v-bloco-item.is-lendo', caixa).forEach(function (el) {
                            el.classList.remove('is-lendo');
                        });
                    }
                }, 0);
            }, function () { botao.textContent = '🔊 Ouvir'; pintarVel(null); });
        });

        /* Trocar de tela cala a voz. */
        if (!ligarOuvirBlocos.ouvindoRota) {
            ligarOuvirBlocos.ouvindoRota = true;
            window.addEventListener('hashchange', function () {
                if (B.audio.estado().lendo) B.audio.parar();
            });
        }
    }

    /**
     * As ligações da faixa, em cartõezinhos tocáveis.
     *
     * Não é a IA dizendo "veja também": é o conjunto do openbible.info,
     * conferido contra o texto do app. Oito por bloco — o suficiente
     * para puxar um fio, longe do suficiente para virar parede.
     */
    function ligacoesDaFaixa(livro, cap, v1, v2) {
        if (!B.referencias || !livro.usfm) return '';
        var lista = B.referencias.daFaixa(livro.usfm, cap, v1, v2).slice(0, 8);
        if (!lista.length) return '';
        var esc = B.ui.esc;
        return '<div class="bloco-ligacoes">' +
            '<small class="bloco-ligacoes-titulo">Onde mais a Bíblia diz isto</small>' +
            lista.map(function (x) {
                var h = B.referencias.humana(x.ref);
                if (!h) return '';
                return '<button type="button" class="ligacao" data-ligacao="' +
                    esc(h.livro + ' ' + h.capitulo + ':' + h.de +
                        (h.ate > h.de ? '-' + h.ate : '')) + '">' +
                    esc(h.texto) + '</button>';
            }).join('') +
            '</div>';
    }

    /* ---------- 5. Arqueologia, Costumes e Mundo Antigo (66 Livros & Épocas) ---------- */
    var ARQUEOLOGIA_EPOCAS = {
        patriarcas: {
            epoca: 'Era Patriarcal e Mesopotâmia / Canaã Antiga (Bronze Médio, c. 2100–1800 a.C.)',
            costumes: 'Contratos familiares de adoção, herança e dote (documentados nas Tábuas de Nuzi e Mari), hospitalidade sagrada de tenda, juramentos solenes com animais partidos ao meio (berit) e sepultamento em cavernas familiares compradas por peso em prata.',
            achados: [
                { titulo: 'Tábuas de Nuzi e Arquivos de Mari (Séc. XVIII–XV a.C.)', desc: 'Milhares de tabuinhas cuneiformes da Mesopotâmia que iluminam os costumes jurídicos de Gênesis: adoção de servo como herdeiro (Eliezer, Gn 15), filhos gerados por serva (Agar/Bila), bênção oral irrevogável no leito de morte e posse dos ídolos domésticos (terafins, Gn 31).' },
                { titulo: 'Código de Hamurabi e Leis do Antigo Oriente Próximo', desc: 'Estela babilônica em diorito negro (~1750 a.C.) que revela a estrutura social, preços de escravos (20 siclos de prata no Bronze Médio, exatamente como na venda de José em Gn 37:28) e contratos pastoris da época.' },
                { titulo: 'Rota dos Patriarcas na Cordilheira Central', desc: 'Siquém, Betel, Hebrom (Mamre) e Berseba: escavações confirmam ocupação e portões fortificados do Bronze Médio ao longo da estrada da cumeeira de Canaã.' }
            ]
        },
        exodo_sinai: {
            epoca: 'Egito Imperial, Êxodo e Aliança no Sinai (Bronze Tardio, c. 1500–1400/1250 a.C.)',
            costumes: 'Fabricação de tijolos de barro com palha sob cotas diárias de capatazes egípcios, estrutura de tratados internacionais de suserania-vassalagem e santuários móveis de tenda com mobiliário revestido de ouro e acácia.',
            achados: [
                { titulo: 'Tratados de Suserania Hititas (Séc. XIV–XIII a.C.)', desc: 'Êxodo 19–24, Levítico 26 e o livro inteiro de Deuteronômio seguem exatamente a estrutura diplomática dos tratados do Bronze Tardio (Preâmbulo, Prólogo Histórico da graça do Rei, Estipulações, Depósito no Santuário, Testemunhas, Bênçãos e Maldições) — e não dos tratados assírios posteriores.' },
                { titulo: 'Estela de Merneptá (c. 1208 a.C., Museu do Cairo)', desc: 'A mais antiga inscrição extrabíblica com o nome "Israel" em hieróglifos egípcios, usando o determinativo de "povo" (e não de cidade-estado), provando que Israel já estava estabelecido em Canaã no final do Bronze Tardio.' },
                { titulo: 'Papiro de Leiden 348, Tombos de Rekhmire e Avaris (Tell el-Dab\'a)', desc: 'Registros egípcios mostram trabalhadores semitas (Apiru) fazendo tijolos de barro com palha sob vigilância de feitores no Delta Oriental (região de Gósen/Ramessés).' }
            ]
        },
        conquista_juizes: {
            epoca: 'Conquista de Canaã e Período dos Juízes (Transição Bronze Tardio / Ferro I, c. 1400–1050 a.C.)',
            costumes: 'Confederação tribal reunida em torno do santuário central (Siló), resgate de terras e viúvas pelo parente remidor (Goel, Rute 4) na porta da cidade e embates contra a pentápole filisteia detentora do monopólio do ferro.',
            achados: [
                { titulo: 'Cartas de Tell el-Amarna (Séc. XIV a.C.)', desc: 'Correspondência diplomática em cuneiforme enviada por reis cananeus (inclusive de Jerusalém, Siquém e Gezer) ao Faraó do Egito, pedindo socorro urgente contra os "Habiru" que tomavam a região montanhosa.' },
                { titulo: 'Estratos de Destruição em Jericó, Hazor e Laquis', desc: 'Em Hazor ("a cabeça de todos aqueles reinos", Js 11:10), arqueólogos encontraram um palácio cananeu incendiado com estátuas de divindades deliberadamente decapitadas, exatamente como ordenado na Torá.' },
                { titulo: 'Altar no Monte Ebal e Siló', desc: 'Estrutura cultual do Ferro I no Monte Ebal (Js 8:30) com ossos exclusivamente de animais puros para sacrifício, além das fundações da área do Tabernáculo em Siló.' }
            ]
        },
        monarquia_unida: {
            epoca: 'Monarquia Unida: Saul, Davi e Salomão (Ferro IIA, c. 1050–931 a.C.)',
            costumes: 'Unção real com chifre de azeite, combate singular de campeões (1Sm 17), administração de escribas da corte real, alianças comerciais fenícias (Tiro) e arquitetura monumental com cantaria fenícia e vigas de cedro.',
            achados: [
                { titulo: 'Estela de Tel Dã — "Casa de Davi" (Séc. IX a.C.)', desc: 'Inscrição aramaica em basalto encontrada no norte de Israel contendo a expressão "BYTDWD" (Casa de Davi), sepultando de vez a tese cética de que o rei Davi seria apenas uma figura lendária.' },
                { titulo: 'Khirbet Qeiyafa (Shaaraim, Vale de Elá, c. 1000 a.C.)', desc: 'Cidade fortificada de Judá com duas portas (1Sm 17:52) da época exata de Davi, onde foi encontrado um óstraco com inscrição proto-hebraica ética sobre defender órfãos, viúvas e estrangeiros sob um rei justo.' },
                { titulo: 'Portões Salomônicos de Seis Câmaras (Hazor, Megido e Gezer)', desc: 'Complexos de portões fortificados e muros de casamata idênticos nas três cidades citadas em 1 Reis 9:15 como edificadas por Salomão.' }
            ]
        },
        reino_dividido: {
            epoca: 'Reinos Divididos de Israel e Judá & Impérios Assírio e Babilônico (Ferro IIB–IIC, 931–586 a.C.)',
            costumes: 'Santuários rivais em Dã e Betel, sincretismo nos "altos" (bamot) com postes-ídolos de Aserá, uso de selos reais em argila (bulas) e engenharia hidráulica subterrânea para resistir a cercos imperiais.',
            achados: [
                { titulo: 'Estela de Mesa / Pedra Moabita (c. 840 a.C., Museu do Louvre)', desc: 'Inscrição do rei Mesa de Moabe mencionada em 2 Reis 3, citando o rei Onri de Israel, o nome sagrado YHWH e a dinastia de Davi.' },
                { titulo: 'Obelisco Negro de Salmaneser III (841 a.C.) e Prisma de Senaqueribe (701 a.C.)', desc: 'O Obelisco Negro mostra o rei Jeú de Israel prostrado pagando tributo; o Prisma de Taylor registra a campanha assíria contra Judá: "Quanto a Ezequias, o judeu, tranquei-o em Jerusalém como um pássaro na gaiola" — confirmando que Senaqueribe jamais conseguiu tomar a cidade (2Rs 19; Is 37).' },
                { titulo: 'Túnel de Ezequias e Inscrição de Siloé (c. 701 a.C.)', desc: 'Túnel de 533 metros escavado na rocha viva sob Jerusalém (2Rs 20:20; 2Cr 32:30) para trazer água da fonte de Giom para dentro dos muros, com inscrição em hebraico clássico narrando o encontro das duas equipes de escavadores.' },
                { titulo: 'Bulas Reais (Ezequias, Isaías, Baruque e Gemarias) e Cartas de Laquis (588 a.C.)', desc: 'Impressões de sinetes em argila com os nomes do rei Ezequias, do escriba Baruque (filho de Nerias, secretário de Jeremias) e óstracos militares escritos durante o avanço final de Nabucodonosor.' }
            ]
        },
        exilio_retorno: {
            epoca: 'Exílio Babilônico e Restauração sob o Império Medo-Persa (586–400 a.C.)',
            costumes: 'Assentamento de exilados junto a canais na Babilônia (rio Quebar), surgimento do ensino comunitário da Torá, uso do aramaico imperial na chancelaria persa e restauração litúrgica centrada na leitura pública da Lei.',
            achados: [
                { titulo: 'Crônica Babilônica e Tábuas de Ração de Joaquim (Museu de Pérgamo)', desc: 'Registros oficiais de Nabucodonosor datando a tomada de Jerusalém (16 de março de 597 a.C.) e listando as porções reais de óleo e cevada entregues a "Yaukin (Joaquim), rei da terra de Judá" e seus cinco filhos na Babilônia (2Rs 25:27-30).' },
                { titulo: 'Cilindro de Ciro (539 a.C., Museu Britânico)', desc: 'Decreto real em argila no qual Ciro, o Grande, rei da Pérsia, relata sua política de repatriar povos cativos e devolver os utensílios sagrados para reconstruírem seus templos — confirmando historicamente o edito de Esdras 1 e 2 Crônicas 36:22-23.' },
                { titulo: 'Papiros de Elefantina (Séc. V a.C.)', desc: 'Cartas em aramaico que mencionam nominalmente Sambalate (governador de Samaria) e Joanã (sumo sacerdote de Jerusalém), personagens centrais do livro de Neemias.' }
            ]
        },
        poesia_sabedoria: {
            epoca: 'Culto do Templo de Jerusalém e Tradição Sapiencial de Israel (c. 1400–400 a.C.)',
            costumes: 'Canto antifonal de coros levíticos acompanhados de harpas, saltérios e címbalos; romarias anuais de subida a Sião (Salmos dos Degraus 120–134); ensino paterno na porta da cidade e poesia acróstica alfabética para memorização.',
            achados: [
                { titulo: 'Rolos dos Salmos e Sabedoria em Qumran (Mar Morto) e Massada', desc: 'Manuscritos antiquíssimos (como 11QPsa) que preservam a divisão estrófica, os títulos musicais levíticos e a devoção litúrgica de Israel séculos antes de Cristo.' },
                { titulo: 'Amuletos de Prata de Ketef Hinnom (Jerusalém, final do Séc. VII a.C.)', desc: 'Dois pequenos rolos de prata anteriores ao exílio babilônico gravados em paleo-hebraico com a Bênção Sacerdotal de Números 6:24-26 ("O Senhor te abençoe e te guarde...") e a fidelidade da aliança (hesed) — o mais antigo texto bíblico já escavado.' },
                { titulo: 'Paralelos Sapienciais do Antigo Oriente (Instrução de Amenemope)', desc: 'Demonstram o diálogo internacional da sabedoria antiga, mas destacam a singularidade radical de Israel: a verdadeira sabedoria não é técnica pragmática, mas o "temor de YHWH" (Pv 1:7).' }
            ]
        },
        evangelhos: {
            epoca: 'Judeia e Galileia do Segundo Templo sob Domínio Romano e Herodiano (c. 6 a.C.–33 d.C.)',
            costumes: 'Culto sabático nas sinagogas com leitura dos rolos da Lei e dos Profetas, tanques de purificação ritual (mikva\'ot), refeições reclinadas em triclínio, cobrança de impostos romanos por publicanos e peregrinação às três grandes festas em Jerusalém.',
            achados: [
                { titulo: 'Inscrição de Pôncio Pilatos (Cesareia Marítima) e Ossuário de Caifás', desc: 'Pedra dedicatória em latim com o título oficial "Pontius Pilatus, Praefectus Iudaeae" e a urna funerária calcária ricamente esculpida de "José, filho de Caifás", o sumo sacerdote que presidiu o julgamento de Jesus (Mt 26:57).' },
                { titulo: 'Tanque de Betesda (5 alpendres, Jo 5:2) e Tanque de Siloé (Jo 9:7)', desc: 'Céticos alegavam que o tanque de cinco pórticos em João 5 era invenção simbólica até que escavações em Jerusalém revelaram exatamente as duas bacias trapezoidais cercadas por quatro pórticos e um quinto central, além dos degraus do Tanque de Siloé do 1º século.' },
                { titulo: 'Sinagoga e Casa de Pedro em Cafarnaum e Barco da Galileia (1º Século)', desc: 'Fundações de basalto negro da sinagoga onde Jesus ensinou em João 6, a casa venerada desde o 1º século como residência de Simão Pedro e um barco de pesca de madeira do Mar da Galileia datado da época de Jesus.' },
                { titulo: 'Calcanhar de Yehohanan (Evidência Arqueológica de Crucificação Romana)', desc: 'Osso de calcanhar humano do 1º século em Jerusalém atravessado por um cravo de ferro de 11,5 cm com restos de madeira de oliveira, confirmando os detalhes forenses das crucificações romanas descritas nos Evangelhos.' }
            ]
        },
        igreja_primitiva: {
            epoca: 'Império Romano do 1º Século: Mundo Greco-Romano e Expansão Apostólica (c. 33–96 d.C.)',
            costumes: 'Viagens pelas estradas pavimentadas romanas (Via Egnácia, Via Ápia) e rotas marítimas de cereal alexandrino, cidadania romana (direito de apelar a César), trabalho artesanal em couro/tendas na ágora, envio de cartas em papiro por portadores da igreja e resistência ao culto imperial ("Kurios Kaisar" vs. "Kurios Iesous").',
            achados: [
                { titulo: 'Inscrição de Delfos (Proconsulado de Gálio, At 18:12) e Inscrição de Erasto em Corinto (Rm 16:23)', desc: 'A carta do imperador Cláudio em Delfos fixa o governo de Gálio na Acaia em 51–52 d.C. (âncora absoluta da cronologia de Paulo); em Corinto, uma laje de pedra perto do teatro diz: "Erasto, em retorno por sua edilidade (tesoureiro da cidade), pavimentou isto às suas próprias custas".' },
                { titulo: 'Inscrição dos Politarchas em Tessalônica (At 17:6) e Aviso do Templo (At 21:28)', desc: 'Críticos diziam que Lucas errou ao chamar os magistrados de Tessalônica de "politarchas", mas mais de 19 inscrições em arcos macedônios provaram sua precisão cirúrgica. Também foi encontrada a placa em grego do Templo de Herodes proibindo gentios de ultrapassarem o pátio sob pena de morte.' },
                { titulo: 'Templos do Culto Imperial em Éfeso, Pérgamo e Esmirna (Apocalipse 1–3)', desc: 'Altar monumental de Zeus/Império em Pérgamo ("o trono de Satanás", Ap 2:13) e inscrições do culto a Domiciano como "Dominus et Deus" (Senhor e Deus), que explicam a confissão de Tomé (Jo 20:28) e a perseguição às sete igrejas da Ásia.' }
            ]
        }
    };

    var ARQUEOLOGIA_POR_LIVRO = {
        'Gênesis': { epoca: 'patriarcas', destaque: 'Em Gênesis 1–11 temos o contraste apologético direto contra os mitos mesopotâmicos (Enuma Elish e Epopeia de Gilgamesh): o universo não nasce de guerra entre deuses caprichosos, mas da Palavra soberana do único Deus Criador. De Gênesis 12 a 50, os contratos de Nuzi/Mari e a ambientação egípcia de José (títulos da corte, investidura com anel-sinete e linho fino, embalsamamento) confirmam a historicidade do relato.' },
        'Êxodo': { epoca: 'exodo_sinai', destaque: 'As dez pragas do Êxodo são um julgamento direto contra o panteão do Egito ("executarei juízos contra todos os deuses do Egito", Êx 12:12): Hapi (Nilo), Heqet (rãs), Ra (sol/trevas) e o próprio Faraó (visto como Hórus encarnado). O Tabernáculo reflete a arquitetura de tendas reais de campanha do Bronze Tardio (como a tenda militar de Ramsés II em Kadesh), consagrada pela presença santa de YHWH.' },
        'Levítico': { epoca: 'exodo_sinai', destaque: 'Os rituais de Levítico contrastam radicalmente com a magia pagã cananeia e mesopotâmica: não há adivinhação pelo fígado de animais nem alimentação de ídolos, mas expiação substitutiva por sangue dada graciosamente por Deus ("Eu vo-lo tenho dado sobre o altar, para fazer expiação pela vossa alma", Lv 17:11).' },
        'Números': { epoca: 'exodo_sinai', destaque: 'A inscrição de Deir Alla (Vale do Jordão, c. 800 a.C.) menciona expressamente "Balaão, filho de Beor, o vidente dos deuses" (Nm 22–24), provando que Balaão era uma figura profética famosa em todo o corredor siro-moabita, além dos amuletos de prata de Ketef Hinnom com a bênção de Números 6:24-26.' },
        'Deuteronômio': { epoca: 'exodo_sinai', destaque: 'A estrutura inteira de Deuteronômio (caps. 1–34) reproduz com precisão os tratados de suserania hititas do 2º milênio a.C., nos quais o Grande Rei recorda seus atos de bondade e exige lealdade exclusiva (amor de aliança) do povo resgatado.' },
        'Josué': { epoca: 'conquista_juizes', destaque: 'As Cartas de Amarna, o incêndio do palácio cananeu de Hazor (Js 11) e a estrutura cultual do Monte Ebal (Js 8:30-35) ancoram a entrada de Israel na geografia e arqueologia real do final da Idade do Bronze.' },
        'Juízes': { epoca: 'conquista_juizes', destaque: 'A cerâmica bicromática filisteia na planície costeira (Gaza, Asdode, Asquelom, Gate e Ecrom), o templo de Baal-Berite em Siquém (Jz 9) e a multiplicação de aldeias israelitas nas montanhas sem ossos de porco confirmam o cenário de Juízes.' },
        'Rute': { epoca: 'conquista_juizes', destaque: 'A prática jurídica do resgate na porta da cidade com a entrega da sandália como validação de transferência de direito (Rt 4:7-8) é atestada nos documentos jurídicos de Nuzi e nos códigos legais do Antigo Oriente.' },
        '1 Samuel': { epoca: 'monarquia_unida', destaque: 'A inscrição de Tel Dã ("Casa de Davi"), a fortaleza de Khirbet Qeiyafa no Vale de Elá (diante do acampamento filisteu de Socó e Azeca em 1Sm 17:1) e a inscrição real de Áquis (Ikausu) em Ecrom iluminam o mundo de Samuel, Saul e Davi.' },
        '2 Samuel': { epoca: 'monarquia_unida', destaque: 'As escavações na Cidade de Davi (Jerusalém) revelaram a grande estrutura de pedra em degraus, o sistema subterrâneo de água de Warren (o "canal" pelo qual Joabe subiu para tomar a fortaleza jebuseia em 2Sm 5:8) e bulas reais.' },
        '1 Reis': { epoca: 'reino_dividido', destaque: 'Os portões de seis câmaras em Hazor, Megido e Gezer (1Rs 9:15) e o grande relevo do Faraó Sisaque (Shoshenq I) no Templo de Karnak no Egito, listando sua invasão contra Judá e Israel no 5º ano do rei Roboão (1Rs 14:25-26), confirmam a cronologia de Reis.' },
        '2 Reis': { epoca: 'reino_dividido', destaque: 'Nenhum livro do AT possui tantas confirmações epigráficas imperiais: a Estela de Mesa (2Rs 3), o Obelisco Negro de Jeú (2Rs 9–10), os anais de Tiglate-Pileser III e Sargão II (queda de Samaria em 722 a.C., 2Rs 17), o Túnel de Ezequias, o Prisma de Senaqueribe (2Rs 18–20) e as Crônicas Babilônicas (2Rs 24–25).' },
        '1 Crônicas': { epoca: 'monarquia_unida', destaque: 'Escrito na província persa de Yehud a partir de arquivos reais e genealógicos antigos, 1 Crônicas preserva a organização das 24 turmas sacerdotais e levíticas (1Cr 24), confirmada posteriormente em inscrições de sinagogas da Galileia e nos manuscritos do Mar Morto.' },
        '2 Crônicas': { epoca: 'reino_dividido', destaque: 'Detalha a engenharia de Ezequias (o Túnel de Siloé e os armazéns reais com selos "LMLK" — "Pertencente ao Rei" — encontrados em toda a Judeia), o achado do livro da Lei sob Josias e fecha com o decreto histórico confirmado no Cilindro de Ciro.' },
        'Esdras': { epoca: 'exilio_retorno', destaque: 'O Cilindro de Ciro (539 a.C.) e os documentos administrativos persas (em aramaico imperial, idêntico ao estilo diplomático das cartas reais em Esdras 4:8–6:18 e 7:12-26) atestam a autenticidade dos decretos de retorno.' },
        'Neemias': { epoca: 'exilio_retorno', destaque: 'Parte da muralha de Jerusalém reconstruída às pressas por Neemias em 52 dias foi escavada na Cidade de Davi, e os nomes dos adversários de Neemias (Sambalate de Samaria e Gesém, o árabe) foram encontrados nos Papiros de Elefantina e em taças de prata com inscrição aramaica.' },
        'Ester': { epoca: 'exilio_retorno', destaque: 'As escavações francesas no palácio de Inverno de Susã (Shushan) revelaram exatamente a planta descrita em Ester: o pátio externo, o pátio interno, a sala do trono real de Xerxes I (Assuero, 486–465 a.C.) e o uso de pavimentação colorida e colunas de mármore (Et 1:6).' },
        'Jó': { epoca: 'patriarcas', destaque: 'A riqueza medida em rebanhos e servos (Jó 1:3), a moeda "kesitah" (Jó 42:11, a mesma de Gn 33:19), a longevidade patriarcal e o papel do patriarca oferecendo sacrifícios pela família situam Jó no horizonte histórico dos Patriarcas em Uz (região de Edom/Arábia).' },
        'Salmos': { epoca: 'poesia_sabedoria', destaque: 'A poesia dos Salmos utiliza o paralelismo semítico (sinonímico, antitético e sintético), quiasmos e acrósticos alfabéticos (como os Salmos 25, 34, 111, 112, 119 e 145) desenhados para a liturgia musical do Templo e para gravar a Palavra na memória do povo.' },
        'Provérbios': { epoca: 'poesia_sabedoria', destaque: 'Coleções reais da corte de Salomão e dos escribas do rei Ezequias ("Os quais também copiaram os homens de Ezequias, rei de Judá", Pv 25:1), refletindo a intensa atividade literária de Judá nos séculos X a VIII a.C.' },
        'Eclesiastes': { epoca: 'poesia_sabedoria', destaque: 'O Pregador (Qohelet) examina toda a glória da sabedoria, arquitetura, jardins reais, música e tesouros acumulados "debaixo do sol" para expor sua transitoriedade (hevel — sopro/neblina) diante da eternidade de Deus.' },
        'Cânticos': { epoca: 'poesia_sabedoria', destaque: 'Rica imagética botânica, geográfica e aromática da terra de Israel (vinhas de En-Gedi, rosas de Sarom, cedros do Líbano, mirra e incenso), celebrando o jardim restaurado do amor conjugal.' },
        'Isaías': { epoca: 'reino_dividido', destaque: 'Em 2018, a poucos metros da bula do rei Ezequias no Ofel (Jerusalém), arqueólogos descobriram uma impressão de selo do século VIII a.C. com a inscrição "Pertencente a Isaías, nvy [profeta]". Além disso, o Grande Rolo de Isaías de Qumran (1QIsa, ~125 a.C.) provou a preservação fiel de todos os 66 capítulos.' },
        'Jeremias': { epoca: 'reino_dividido', destaque: 'Foram encontradas as bulas (selos de argila) originais de Baruque, filho de Nerias (o escriba de Jeremias, Jr 36:4), de Gemarias, filho de Safã (Jr 36:10), de Jucal, filho de Selemias e de Gedalias, filho de Pasur (os dois oficiais que lançaram Jeremias na cisterna de lama em Jr 38:1-6!).' },
        'Lamentações': { epoca: 'exilio_retorno', destaque: 'A camada espessa de cinzas, pontas de flechas babilônicas (tipo cita) e casas incendiadas de 586 a.C. escavadas na Cidade de Davi testemunham fisicamente a dor dos cinco poemas acrósticos de Lamentações.' },
        'Ezequiel': { epoca: 'exilio_retorno', destaque: 'A iconografia dos querubins alados guardiões de tronos e portões na Babilônia (Lamassu) e a rede de canais de irrigação da Mesopotâmia (como o canal Kabaru / rio Quebar em Nippur, onde vivia a colônia judaica documentada nas Tábuas de Murashu) formam o cenário visual das visões de Ezequiel.' },
        'Daniel': { epoca: 'exilio_retorno', destaque: 'Críticos negavam a existência histórica de Belsazar (Dn 5), pois Nabonido era o último rei listado. Porém, o Cilindro de Nabonido encontrado em Ur revelou que Nabonido se ausentou em Tema na Arábia e confiou a realeza na Babilônia ao seu filho primogênito Belsazar — razão exata pela qual Belsazar só podia oferecer a Daniel o "terceiro lugar no reino" (Dn 5:16, 29)!' },
        'Oséias': { epoca: 'reino_dividido', destaque: 'Os óstracos de Samaria (séc. VIII a.C.) registram remessas de vinho fino e azeite puro para a elite da capital e nomes teofóricos misturados com Baal, retratando a prosperidade corrupta e o sincretismo com o culto de fertilidade cananeu denunciados por Oséias.' },
        'Joel': { epoca: 'reino_dividido', destaque: 'Pragas devastadoras de gafanhotos migratórios (Schistocerca gregaria) no Levante podiam escurecer o sol e devorar toda a vegetação em horas, servindo de megafone histórico para o grande Dia do Senhor.' },
        'Amós': { epoca: 'reino_dividido', destaque: 'As placas de marfim finamente esculpidas encontradas nas escavações do palácio real de Samaria confirmam literalmente as "casas de marfim" e os "leitos de marfim" denunciados por Amós (Am 3:15; 6:4), além da camada geológica e estrutural do grande terremoto nos dias de Uzias e Jeroboão II (Am 1:1).' },
        'Obadias': { epoca: 'exilio_retorno', destaque: 'A fortaleza rochosa de Edom nas escarpas de arenito vermelho de Sela/Bozra (região de Petra) parecia inexpugnável ("tu que habitas nas fendas das rochas, na tua alta morada", Ob 3), mas caiu diante das incursões babilônicas e nabateias.' },
        'Jonas': { epoca: 'reino_dividido', destaque: 'As escavações em Nínive (Kuyunjik e Nebi Yunus, atual Mossul no Iraque) revelaram muralhas colossais de 12 km de perímetro com 15 portões monumentais e relevos palacianos da crueldade militar assíria ("a cidade sanguinária", Na 3:1) — tornando ainda mais chocante a relutância de Jonas e a misericórdia de Deus.' },
        'Miqueias': { epoca: 'reino_dividido', destaque: 'As escavações em Laquis (a segunda cidade mais importante de Judá, Mq 1:13) revelaram a gigantesca rampa de cerco construída pelo exército de Senaqueribe em 701 a.C. e os relevos do cerco de Laquis no palácio de Nínive (hoje no Museu Britânico).' },
        'Naum': { epoca: 'reino_dividido', destaque: 'A Crônica Babilônica de Nabopolassar relata a queda de Nínive em 612 a.C. diante da coalizão de babilônios e medos, e as escavações mostraram que parte da muralha de Nínive cedeu pela cheia do rio Khosr/Tigre — cumprindo literalmente Naum 1:8 e 2:6 ("As comportas dos rios se abrem, e o palácio é destruído").' },
        'Habacuque': { epoca: 'reino_dividido', destaque: 'Após a Batalha de Carquemis (605 a.C.), a cavalaria caldeia (babilônica) tornou-se a superpotência imparável do Oriente Médio. O famoso Comentário (Pesher) de Habacuque nos Manuscritos do Mar Morto preserva o texto hebraico antigo de Hc 1–2.' },
        'Sofonias': { epoca: 'reino_dividido', destaque: 'Sofonias profetiza em Jerusalém durante a reforma do rei Josias, citando bairros reais da topografia da cidade escavada hoje: a "Porta do Peixe", a "Cidade Baixa / Segundo Bairro (Mishneh)" e o "Machtesh" (vale comercial dos mercadores, Sf 1:10-11).' },
        'Ageu': { epoca: 'exilio_retorno', destaque: 'Os oráculos de Ageu são datados com precisão de dia e mês no 2º ano do rei Dario I, o Grande, da Pérsia (agosto a dezembro de 520 a.C.), sincronizados com o calendário agrícola de colheita de figos, uvas e azeitonas na Judeia.' },
        'Zacarias': { epoca: 'exilio_retorno', destaque: 'O sistema imperial persa de patrulheiros a cavalo que percorriam as províncias para levar relatórios ao Grande Rei forma o pano de fundo histórico da primeira visão noturna dos cavalos entre as muroteiras em Zacarias 1:8-11.' },
        'Malaquias': { epoca: 'exilio_retorno', destaque: 'Reflete o protocolo de etiqueta da corte persa ("Oferece-o ao teu governador! Acaso terá ele agrado em ti?", Ml 1:8 — usando o termo persa/acadiano "pehah" para o governador da província de Yehud).' },
        'Mateus': { epoca: 'evangelhos', destaque: 'As moedas como o estater/didracma do imposto do Templo (Mt 17:24-27), o denário de prata de Tibério César (Mt 22:19), as filactérias (tefilin) encontradas em Qumran (Mt 23:5) e o palácio-fortaleza de Herodes, o Grande (Herodium e Massada) iluminam cada página de Mateus.' },
        'Marcos': { epoca: 'evangelhos', destaque: 'Escrito com latinismos frequentes (legião, centurião, denário, quadrante, pretório) para leitores no contexto romano, Marcos preserva também as palavras aramaicas exatas dos lábios de Jesus: "Talita cumi", "Efatá", "Abba" e "Eloí, Eloí, lamá sabactâni".' },
        'Lucas': { epoca: 'evangelhos', destaque: 'O arqueólogo Sir William Ramsay comprovou que Lucas é um historiador de primeira grandeza: títulos políticos que mudavam de década para década (tetrarca, procônsul, pretor, politarca, asiarcas, proto da ilha de Malta) são empregados por Lucas sem um único anacronismo.' },
        'João': { epoca: 'evangelhos', destaque: 'A arqueologia de Jerusalém confirmou detalhes topográficos exclusivos de João que antes eram questionados: o Tanque de Betesda com seus 5 pórticos (Jo 5:2), o Tanque de Siloé (Jo 9:7), o Pórtico de Salomão no inverno (Jo 10:23) e o Litóstrotos/Gabbatha (Jo 19:13).' },
        'Atos': { epoca: 'igreja_primitiva', destaque: 'O livro de Atos é o documento antigo mais verificado pela epigrafia greco-romana: o altar "Ao Deus Desconhecido" e o Areópago em Atenas (At 17), o teatro de 24 mil lugares de Éfeso onde gritavam "Grande é a Diana dos efésios!" (At 19), a inscrição de Gálio em Delfos (At 18) e as rotas náuticas mediterrâneas do naufrágio em Malta (At 27).' },
        'Romanos': { epoca: 'igreja_primitiva', destaque: 'Escrita de Corinto (~57 d.C.) por mão de Tércio (Rm 16:22), menciona Erasto, tesoureiro da cidade (confirmado pela famosa inscrição pavimentada em Corinto), e reflete o retorno dos judeus a Roma após a morte do imperador Cláudio (que os havia expulsado em 49 d.C., cf. Suetônio e At 18:2).' },
        '1 Coríntios': { epoca: 'igreja_primitiva', destaque: 'Em Corinto foram escavados o Bema (tribunal de mármore no centro da ágora onde Paulo compareceu perante Gálio, At 18:12; 2Co 5:10), o Macellum (mercado de carnes citado em 1Co 10:25), os refeitórios do templo de Asclépio (1Co 8:10) e as inscrições dos Jogos Ístmicos (coroas de aipo perecível, 1Co 9:24-27).' },
        '2 Coríntios': { epoca: 'igreja_primitiva', destaque: 'A menção ao "etnarca do rei Aretas" guardando a cidade de Damasco (2Co 11:32) sincroniza-se com o reinado do rei nabateu Aretas IV (9 a.C.–40 d.C.), e a metáfora do triunfo romano com incenso aromático (2Co 2:14-16) reflete as procissões imperiais.' },
        'Gálatas': { epoca: 'igreja_primitiva', destaque: 'A figura do "paidagogos" (aio/tutor escravo que conduzia o menino à maturidade, Gl 3:24) e as leis greco-romanas de adoção e tutela testamentária (Gl 4:1-7) eram realidades cotidianas nas colônias romanas da Galácia (Antioquia da Pisídia, Icônio, Listra e Derbe).' },
        'Efésios': { epoca: 'igreja_primitiva', destaque: 'Escrita a uma metrópole dominada pelo colossal Templo de Ártemis (uma das sete maravilhas do mundo antigo) e pelos "Efésia Grammata" (amuletos mágicos queimados em At 19:19), Efésios proclama Cristo exaltado acima de todo principado e edifica a Igreja como o verdadeiro Templo Santo no Senhor (Ef 1:20-22; 2:19-22) — aludindo também ao muro divisório do Templo de Jerusalém (Ef 2:14).' },
        'Filipenses': { epoca: 'igreja_primitiva', destaque: 'Filipos era uma colônia militar romana ("Colonia Iulia Augusta Philippensis") cujos habitantes tinham extremo orgulho da cidadania de Roma; por isso Paulo lembra à igreja e à guarda pretoriana (Fp 1:13) que "a nossa cidadania (politeuma) está nos céus" (Fp 3:20).' },
        'Colossenses': { epoca: 'igreja_primitiva', destaque: 'No vale do rio Lico (Colossos, Laodiceia e Hierápolis), o sincretismo frígio misturava culto a anjos, ascetismo judaico e especulação cósmica ("stoicheia"), aos quais Paulo responde com o hino da supremacia cósmica de Cristo e a metáfora romana do "cheirographon" (cédula de dívida cancelada e cravada na cruz, Cl 2:14).' },
        '1 Tessalonicenses': { epoca: 'igreja_primitiva', destaque: 'Situada na Via Egnácia, Tessalônica recebia visitas oficiais imperiais chamadas tecnicamente de "Parousia" (vinda real), nas quais os cidadãos saíam ao encontro ("apantesis") do dignitário para escoltá-lo — vocabulário que Paulo aplica à volta gloriosa do verdadeiro Rei Jesus (1Ts 4:15-17).' },
        '2 Tessalonicenses': { epoca: 'igreja_primitiva', destaque: 'A advertência contra cartas falsificadas e a assinatura de próprio punho de Paulo ao final do papiro ("Saudação da minha própria mão, de mim, Paulo. Este é o sinal em todas as epístolas", 2Ts 3:17) refletem a prática epistolar greco-romana onde o autor ditava a um escriba (amanuense) e autenticava o rolo no fecho.' },
        '1 Timóteo': { epoca: 'igreja_primitiva', destaque: 'O cuidado com as viúvas desamparadas (1Tm 5), a oração pelas autoridades civis e a refutação de mitos e genealogias intermináveis em Éfeso mostram a organização pastoral das igrejas domésticas no final da década de 60 d.C.' },
        '2 Timóteo': { epoca: 'igreja_primitiva', destaque: 'Escrita de uma masmorra fria em Roma sob Nero (~66–67 d.C.), pouco antes do martírio de Paulo: o pedido da capa deixada em Trôade antes do inverno, dos rolos de papiro ("os livros") e especialmente dos códices de couro ("os pergaminhos", 2Tm 4:13, 21) é um testemunho histórico comovente.' },
        'Tito': { epoca: 'igreja_primitiva', destaque: 'A citação do poeta e filósofo cretense Epimênides de Cnossos (séc. VI a.C. — "Os cretenses são sempre mentirosos...", Tt 1:12) demonstra o domínio cultural de Paulo ao orientar Tito na organização de presbíteros nas cidades portuárias da ilha de Creta.' },
        'Filemom': { epoca: 'igreja_primitiva', destaque: 'No Império Romano, escravos fugitivos estavam sujeitos a suplício brutal ou marcação a ferro; compare esta carta com a famosa epístola de Plínio, o Jovem, a Sabiniano intercedendo por um liberto, e veja como o Evangelho vai infinitamente além: Onésimo volta "não já como escravo, antes, mais do que escravo, como irmão amado" (Fm 16).' },
        'Hebreus': { epoca: 'igreja_primitiva', destaque: 'A referência aos sacrifícios levíticos sendo oferecidos continuamente no presente (Hb 8:4; 10:1-2, 11) e a ausência de menção à destruição de Jerusalém por Tito apontam para uma data logo antes de 70 d.C., preparando os cristãos judeus para não retrocederem às sombras do Templo terreno.' },
        'Tiago': { epoca: 'igreja_primitiva', destaque: 'O vocabulário agrícola da Palestina ("chuva temporã e serôdia", vento quente Siroco que seca a erva, figueiras, oliveiras e fontes salgadas, Tg 1:11; 3:12; 5:7) e a reunião na "sinagoga" (assembleia cristã judaica, Tg 2:2) refletem o ambiente da Igreja mãe em Jerusalém antes de 62 d.C.' },
        '1 Pedro': { epoca: 'igreja_primitiva', destaque: 'Endereçada aos "forasteiros da Dispersão no Ponto, Galácia, Capadócia, Ásia e Bitínia" (1Pe 1:1) a partir de "Babilônia" (codinome cristão e judaico para Roma, 1Pe 5:13), prepara as igrejas da Ásia Menor para a fornalha da difamação e perseguição.' },
        '2 Pedro': { epoca: 'igreja_primitiva', destaque: 'Pedro atesta como testemunha ocular a majestade de Cristo no Monte da Transfiguração (2Pe 1:16-18) e reconhece as cartas de Paulo como parte das "outras Escrituras" (graphe, 2Pe 3:15-16), mostrando a consciência canônica ainda na era apostólica.' },
        '1 João': { epoca: 'igreja_primitiva', destaque: 'Escrita em Éfeso nas últimas décadas do 1º século (conforme o testemunho de Irineu de Lyon, discípulo de Policarpo, que por sua vez foi discípulo direto do apóstolo João), combate as sementes do docetismo/pré-gnosticismo (como o de Cerinto) que negava a verdadeira encarnação e morte expiatória de Jesus Cristo.' },
        '2 João': { epoca: 'igreja_primitiva', destaque: 'Uma folha única de papiro ("papel e tinta", 2Jo 12 — cerca de 245 palavras gregas) alertando as igrejas domésticas sobre pregadores itinerantes que negavam a encarnação de Cristo e abusavam da hospitalidade cristã.' },
        '3 João': { epoca: 'igreja_primitiva', destaque: 'Retrato vivo da transição missionária no final do 1º século: missionários itinerantes que saíam "por amor do Nome, sem receberem nada dos gentios" (3Jo 7), acolhidos pelo fiel Gaio apesar do autoritarismo local de Diótrefes.' },
        'Judas': { epoca: 'igreja_primitiva', destaque: 'Judas, irmão de Tiago e meio-irmão do Senhor, usa tríades retóricas semíticas e referências conhecidas do judaísmo do Segundo Templo para exortar a Igreja a batalhar pela fé apostólica entregue de uma vez por todas aos santos.' },
        'Apocalipse': { epoca: 'igreja_primitiva', destaque: 'Sir William Ramsay demonstrou que cada uma das sete cartas de Apocalipse 2–3 dialoga com a história e arqueologia local da sua cidade: a acrópole e o trono de Zeus em Pérgamo; as guildas comerciais com banquetes idolátricos em Tiatira; a cidadela de Sardes tomada duas vezes de surpresa por falta de vigília; os terremotos de Filadélfia; e o aqueduto de água morna de Laodiceia junto aos seus bancos, lã negra e colírio frígio (Ap 3:15-18).' }
    };

    /* ---------- 6. Discernimento Pastoral & Apologético (Erros e Más Leituras a Evitar) ---------- */
    var DISCERNIMENTO_POR_GRUPO = {
        pentateuco: {
            moralismo: 'Não leia os patriarcas ou Moisés como heróis impecáveis de autoajuda. A Torá expõe sem retoques o medo de Abraão, a trapaça de Jacó, a falha de Judá e a ira de Moisés para provar que a salvação repousa exclusivamente na fidelidade pactual de Deus (graça soberana), e nunca no mérito humano.',
            contexto: 'Não confunda a Lei de Moisés com um sistema de salvação por obras ("legalismo"), nem descarte o Antigo Testamento como se o Deus do Sinai fosse diferente do Pai de nosso Senhor Jesus Cristo (erro marcionita). A Lei foi dada após o resgate gratuito do Êxodo (Êx 20:2) para revelar a santidade de Deus, refrear o mal e nos servir de aio até Cristo (Gl 3:24; CFW Cap. 19).',
            anacronismo: 'Distinga cuidadosamente as leis cerimoniais (sacrifícios, pureza ritual e dieta, cumpridas e ab-rogadas na cruz de Cristo — Hb 9–10) e as leis civis/penais da teocracia de Israel (cujo princípio de equidade geral permanece, CFW 19.4) da Lei Moral eterna de Deus (resumida no Decálogo).'
        },
        historicos: {
            moralismo: 'Evite o "exemplarismo moralista" ("seja corajoso como Davi para vencer os gigantes financeiros da sua vida"). Nas narrativas históricas, descrição não é prescrição: o fato de a Bíblia registrar a poligamia dos reis, o voto precipitado de Jefté ou os erros dos juízes não significa que Deus os aprove. Em 1 Samuel 17, nós não somos Davi; nós somos o Israel paralisado no vale, e Cristo é o verdadeiro Ungido que esmaga a cabeça do gigante em nosso lugar!',
            contexto: 'Não arranque promessas feitas especificamente à teocracia nacional de Israel ou ao Templo de Salomão (como a bênção territorial da aliança mosaica) para sustentar a "Teologia da Prosperidade", esquecendo que na Nova Aliança a herança dos santos passa pela cruz rumo à Nova Criação.',
            anacronismo: 'Compreenda a "guerra santa" (herem) em Josué não como imperialismo étnico humano, mas como um juízo judicial único e localizado de Deus na história da redenção após 400 anos de longanimidade (Gn 15:16) — o mesmo juízo que depois caiu sobre o próprio Israel e Judá quando imitaram a idolatria cananeia (2Rs 17; 25).'
        },
        poeticos: {
            moralismo: 'Não transforme a honestidade visceral dos Salmos de lamento em falta de fé, nem reduza a sabedoria bíblica a dicas de coaching secular. Os Salmos nos ensinam a chorar, clamar e adorar na presença do Deus soberano, tendo Cristo como o Cantor supremo dos Salmos (Hb 2:12).',
            contexto: 'Cuidado extremo ao citar o livro de Jó: mais de 25 capítulos de Jó são discursos de Elifaz, Bildade e Zofar, que defendiam uma teologia da retribuição mecânica ("se você sofre, é porque pecou; se for fiel, sempre prosperará") — e no capítulo 42:7 o próprio Deus declara que os três amigos não falaram dEle o que era reto! Da mesma forma, leia Provérbios como princípios gerais de sabedoria pactual, e não como garantias matemáticas que anulam o mistério da providência.',
            anacronismo: 'Nos Salmos imprecatórios (clamores por justiça divina contra opressores cruéis), não os leia como licença para vingança pessoal carnal; são apelos judiciais entregues nas mãos do Juiz de toda a terra, que se cumprem ou na cruz de Cristo (que levou a maldição pelo pecador arrependido) ou no juízo final do Cordeiro.'
        },
        profetasMaiores: {
            moralismo: 'Não reduza os grandes profetas a simples ativistas sociais sem teologia da aliança, nem a cartomantes do fim do mundo desconectados da santidade. Isaías, Jeremias, Ezequiel e Daniel são promotores forenses do Pacto de Deus: o pecado central que eles denunciam é a traição ao Deus vivo (idolatria do coração e quebra da Lei).',
            contexto: 'O erro mais comum nos profetas é arrancar versículos de consolo de seu contexto histórico de exílio e disciplina (por exemplo, usar Jeremias 29:11 — "Eu bem sei os pensamentos que tenho a vosso respeito..." — como promessa de sucesso imediato, ignorando que no v. 10 Deus acabara de dizer que eles passariam 70 anos de cativeiro na Babilônia antes do retorno!).',
            anacronismo: 'Observe a "perspectiva profética" (telescopia): os profetas frequentemente enxergam na mesma visão duas montanhas alinhadas — o retorno do exílio babilônico no século VI a.C. (1º horizonte) e a redenção messiânica na primeira e segunda vindas de Cristo (2º e 3º horizontes).'
        },
        profetasMenores: {
            moralismo: 'Não leia Oséias, Jonas, Amós ou Habacuque apenas como histórias morais sobre caráter humano. O protagonista absoluto dos Doze Profetas é o Senhor (YHWH): Sua justiça inflexível contra a hipocrisia religiosa e Seu amor leal (hesed) que vence a infidelidade do Seu povo e alcança até as nações gentias.',
            contexto: 'Evite usar textos de Malaquias 3 (roubar a Deus nos dízimos) como barganha financeira de compra de bênçãos materiais, separando o texto do chamado ao arrependimento sincero do coração e do anúncio da vinda do Mensageiro da Aliança (Cristo) que purifica o Seu povo como fogo de ourives.',
            anacronismo: 'Ao ler o "Dia do Senhor" em Joel, Amós e Sofonias, não salte imediatamente para especulações geopolíticas modernas sem ver como a invasão de gafanhotos, da Assíria e da Babilônia já eram amostras históricas do juízo divino, e como Pedro em Atos 2:16-21 declara que a era escatológica prometida por Joel foi inaugurada na ressurreição de Cristo e no derramamento do Espírito no Pentecostes.'
        },
        evangelhos: {
            moralismo: 'Não reduza Jesus Cristo a um mero mestre de moral, revolucionário político ou terapeuta emocional. Os quatro Evangelhos são biografias cristológicas e kerigmáticas: cada milagre (sinal), parábola e discurso revela que Jesus é o Verbo Eterno encarnado, o Messias Filho de Davi e o Cordeiro de Deus que tira o pecado do mundo.',
            contexto: 'Ao interpretar as Parábolas de Jesus, evite o erro da alegorização arbitrária (tentar atribuir um significado místico oculto a cada moeda, jumento ou árvore da parábola). Pergunte sempre: a quem Jesus estava respondendo (fariseus, discípulos, multidão) e qual é o ponto central do Reino de Deus que a parábola estabelece? E no Sermão do Monte (Mt 5–7), não o leia como uma "nova lei para se salvar pelo esforço", mas como o caráter dos cidadãos do Reino que já foram alcançados pela graça e que nos mostra o quanto precisamos da justiça perfeita de Cristo.',
            anacronismo: 'Lembre-se do momento histórico-redentivo dos Evangelhos: Jesus viveu "nascido sob a Lei" (Gl 4:4), na transição entre a Antiga e a Nova Aliança, antes da consumação da cruz, ressurreição e Pentecostes. Leia cada cena em direção à Hora da Cruz e do Túmulo Vazio.'
        },
        atos: {
            moralismo: 'O livro de Atos não é as " façanhas de super-heróis espirituais", mas os Atos contínuos do Senhor Jesus Cristo ressurreto e entronizado à destra do Pai, edificando a Sua Igreja pela Palavra e pelo Espírito Santo (At 1:1-2, 8).',
            contexto: 'Regra hermenêutica de ouro para Atos: distinga entre o que é **descritivo de um evento histórico-redentivo único e irrepetível** (como o Pentecostes em Atos 2, que inaugura a época da Nova Aliança, ou o sorteio de Matias em Atos 1) e o que é **prescritivo e normativo para a Igreja em todos os séculos** (a perseverança na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações — At 2:42 —, o arrependimento e fé em Cristo e a missão a todas as nações).',
            anacronismo: 'Não julgue a unidade e generosidade voluntária da igreja de Jerusalém (At 2:44-45; 4:32–5:4) através de ideologias econômicas modernas (Pedro deixa explícito a Ananias em At 5:4 que a propriedade continuava sendo privada e a oferta era voluntária), nem transforme métodos circunstanciais (como lenços ou sombras) em amuletos supersticiosos.'
        },
        epistolas: {
            moralismo: 'A pior distorção nas Epístolas é inverter ou separar o **Indicativo da Graça** (o que Deus já fez por nós em Cristo: eleição, redenção, justificação, adoção, união com Cristo) do **Imperativo Moral** (como devemos viver em santificação pelo Espírito). Se você pregar os deveres de Efésios 4–6 ou Romanos 12–16 sem a base da graça de Efésios 1–3 e Romanos 1–8, você produzirá apenas legalismo morto ou desespero; se ficar só no indicativo sem o imperativo, cairá no antinomianismo (licenciosidade).',
            contexto: 'Nunca isole um versículo do fluxo do argumento epistolar! Textos como Filipenses 4:13 ("Tudo posso naquele que me fortalece") são frequentemente distorcidos como mantra de triunfo pessoal e ambição terrena, quando no contexto imediato (Fp 4:11-12) Paulo está falando da suficiência de Cristo para permanecer contente tanto na fartura quanto na fome, na prisão e na escassez! E na aparente tensão entre Paulo (Rm 3:28) e Tiago (Tg 2:24), lembre a síntese clássica dos Reformadores: "Somos justificados somente pela fé (Sola Fide), mas a fé que justifica nunca está só — ela opera pelo amor e produz boas obras como fruto e evidência viva".',
            anacronismo: 'Ao ler Apocalipse (incluído no bloco final do NT), evite tanto o sensacionalismo de jornal que tenta adivinhar datas (Mt 24:36) quanto o ceticismo que nega a volta visível e corporal de Cristo. Apocalipse foi escrito para consolar a Igreja fiel sob a pressão da Besta (o Estado totalitário e idólatra) e da Prostituta (a sedução mundana) com a certeza inabalável: "O Cordeiro que foi morto é digno" e já reina sobre a história!'
        }
    };

    /* ---------- 7. Os 7 Grandes Loci da Teologia Sistemática Reformada ---------- */
    var LOCI_SISTEMATICA = [
        {
            id: 'bibliologia',
            ordem: 'I. Bibliologia (Revelação & Escritura)',
            icone: '📖',
            latim: 'Locus de Sacra Scriptura',
            confissao: 'CFW Cap. 1 · Confissão Belga Arts. 2–7',
            rx: /\b(palavra de deus|escrituras?|lei do senhor|mandamentos?|profecia|inspirad|revela[çc][ãa]o|testemunho|estatutos|preceitos|decreto|or[áa]culo|livro da lei|verdade)\b/i,
            sintese: 'A autoridade suprema, suficiência, inerrância e eficácia da Palavra de Deus: quando a Escritura fala, o próprio Deus fala, iluminando o entendimento pelo Espírito Santo.'
        },
        {
            id: 'teontologia',
            ordem: 'II. Teontologia (Deus, Trindade, Decretos & Providência)',
            icone: '👑',
            latim: 'Locus de Deo & Providentia',
            confissao: 'CFW Caps. 2–5 · Breve Catecismo P. 4–11',
            rx: /\b(soberan[oa]|provid[êe]ncia|onipoten|santidade|santo|eterno|criador|gl[óo]ria de deus|justi[çc]a de deus|fidelidade|hesed|miseric[óo]rdia|trindade|decreto|todo-poderoso|yhwh|jav[ée]|alt[íi]ssimo)\b/i,
            sintese: 'Os atributos incomunicáveis e comunicáveis do Deus Trino, Sua santidade majestosa e Sua providência soberana que governa todas as criaturas e ações — até mesmo o mal humano — para a Sua própria glória e o bem dos Seus eleitos.'
        },
        {
            id: 'antropologia',
            ordem: 'III. Antropologia & Hamartiologia (Criação, Imagem & Pecado)',
            icone: '🥀',
            latim: 'Locus de Homine & Peccato',
            confissao: 'CFW Caps. 4, 6 · Cânones de Dort III/IV',
            rx: /\b(pecado|queda|idolatria|rebeli[ãa]o|iniquidade|transgress[ãa]o|culpa|cora[çc][ãa]o duro|carne|morte|cobi[çc]a|orgulho|soberba|apostasia|injusti[çc]a|imagem de deus|consci[êe]ncia)\b/i,
            sintese: 'A dignidade do ser humano criado à imagem de Deus (Imago Dei) e a gravidade radical do pecado (Depravação Total): a incapacidade humana de salvar a si mesmo, exigindo uma intervenção monergística da graça divina.'
        },
        {
            id: 'cristologia',
            ordem: 'IV. Cristologia (A Pessoa, Encarnação e Obra de Cristo)',
            icone: '✝️',
            latim: 'Locus de Christo Mediatore',
            confissao: 'CFW Cap. 8 · Catecismo de Heidelberg D. 6, 12–19',
            rx: /\b(cristo|messias|jesus|cordeiro|redentor|mediador|sacerdote|sacrif[íi]cio|expia[çc][ãa]o|cruz|sangue|ressurrei[çc][ãa]o|filho de davi|filho de deus|servo sofredor|verbo|encarna[çc][ãa]o|propicia[çc][ãa]o|resgate)\b/i,
            sintese: 'Jesus Cristo, verdadeiro Deus e verdadeiro homem em uma só pessoa, único Mediador da Aliança da Graça, exercendo Seus três ofícios (Profeta, Sacerdote e Rei) em Sua humilhação e exaltação, e realizando a expiação penal substitutiva perfeita.'
        },
        {
            id: 'soteriologia',
            ordem: 'V. Soteriologia (O Espírito Santo e a Ordem da Salvação — Ordo Salutis)',
            icone: '🕊️',
            latim: 'Locus de Gratia & Salute',
            confissao: 'CFW Caps. 10–18 · Cânones de Dort I–V',
            rx: /\b(gra[çc]a|f[ée]|justifica[çc][ãa]o|arrependimento|perd[ãa]o|salva[çc][ãa]o|elei[çc][ãa]o|regenera[çc][ãa]o|novo nascimento|esp[íi]rito santo|santifica[çc][ãa]o|ado[çc][ãa]o|perseveran[çc]a|redimid|vocac[ãa]o)\b/i,
            sintese: 'A aplicação da redenção comprada por Cristo ao pecador eleito pela operação eficaz do Espírito Santo: vocação eficaz, regeneração, fé e arrependimento, justificação somente pela fé (justiça imputada de Cristo), adoção, santificação progressiva e perseverança dos santos.'
        },
        {
            id: 'eclesiologia',
            ordem: 'VI. Eclesiologia & Meios de Graça (Igreja, Culto & Comunhão)',
            icone: '🏛️',
            latim: 'Locus de Ecclesia & Sacramentis',
            confissao: 'CFW Caps. 25–29 · Confissão Belga Arts. 27–35',
            rx: /\b(igreja|templo|tabern[áa]culo|santu[áa]rio|culto|adora[çc][ãa]o|sacerd[óo]cio|batismo|ceia|p[áa]scoa|comunh[ãa]o|presb[íi]tero|pastor|di[áa]cono|povo de deus|corpo de cristo|louvor|ora[çc][ãa]o|disciplina)\b/i,
            sintese: 'O povo do pacto reunido por Deus ao redor da Palavra, dos Sacramentos e da Oração: o princípio regulador do culto, a comunhão dos santos, o governo espiritual da Igreja e a missão às nações.'
        },
        {
            id: 'escatologia',
            ordem: 'VII. Escatologia (O Reino de Deus, Juízo Final & Nova Criação)',
            icone: '🌅',
            latim: 'Locus de Novissimis',
            confissao: 'CFW Caps. 32–33 · Catecismo de Heidelberg P. 52, 57–58',
            rx: /\b(reino de deus|reino dos c[ée]us|ju[íi]zo|dia do senhor|etern[oa]|esperan[çc]a|volta|vinda|parousia|nova jerusal[ée]m|novos c[ée]us|nova terra|glorifica[çc][ãa]o|trono|vit[óo]ria final|consuma[çc][ãa]o)\b/i,
            sintese: 'A tensão escatológica do Reino de Deus ("já inaugurado" na primeira vinda de Cristo, mas "ainda não consumado"), a vitória sobre os poderes do mal, a ressurreição do corpo, o Juízo Final e a habitação eterna de Deus com Seu povo nos Novos Céus e Nova Terra.'
        }
    ];

    /* Determina o Triplo Ofício de Cristo (Munus Triplex: Profeta, Sacerdote e Rei — Calvino, Institutas II.15; Breve Catecismo P. 23–26) no capítulo */
    function munusTriplexDoCapitulo(livro, cap, ctx, textoAnalise) {
        var g = livro.grupo;
        var t = (textoAnalise || '').toLowerCase();
        var profeta = 'Cristo, o **Supremo Profeta** (Dt 18:15; Hb 1:1-2), nos revela por Sua Palavra e Espírito a vontade perfeita de Deus para a nossa salvação neste capítulo.';
        var sacerdote = 'Cristo, o **Sumo Sacerdote Eterno** (Sl 110:4; Hb 7:25), se ofereceu uma só vez como sacrifício perfeito para expiar os pecados aqui expostos e intercede continuamente por nós.';
        var rei = 'Cristo, o **Rei Soberano** (Sl 2:6; Ap 19:16), subjuga-nos a Si mesmo, governa a história com cetro de justiça e nos defende e reprime todos os Seus e os nossos inimigos.';

        if (livro.nome === 'Levítico' || livro.nome === 'Hebreus' || /sacrif[íi]cio|altar|sacerdote|sangue|expia[çc][ãa]o|cordeiro|tabern[áa]culo|perd[ãa]o/.test(t)) {
            sacerdote = 'Em destaque neste capítulo: **Cristo como nosso Sumo Sacerdote e Cordeiro Expiatório** (BCW P. 25) — onde o sacerdócio terreno ou a oferta ritual era sombra ou insuficiente, Cristo entra no Santo dos Santos celestial pelo Seu próprio sangue para garantir acesso eterno a Deus.';
        }
        if (g === 'profetasMaiores' || g === 'profetasMenores' || livro.nome === 'Deuteronômio' || livro.nome === 'Provérbios' || /profeta|palavra do senhor|ensino|sabedoria|verdade|par[áa]bola|serm[ãa]o/.test(t)) {
            profeta = 'Em destaque neste capítulo: **Cristo como nosso Supremo Profeta e Sabedoria de Deus** (BCW P. 24; 1Co 1:24) — Ele é não apenas o mensageiro, mas o próprio Verbo Encarnado que desmascara o erro do coração e anuncia as boas-novas do Reino.';
        }
        if (g === 'historicos' || livro.nome === 'Salmos' || livro.nome === 'Daniel' || livro.nome === 'Apocalipse' || livro.nome === 'Mateus' || /rei|reino|trono|ju[íi]z|vit[óo]ria|batalha|davi|soberano/.test(t)) {
            rei = 'Em destaque neste capítulo: **Cristo como o Rei Ungido e Filho de Davi** (BCW P. 26) — em contraste com a fraqueza dos líderes terrenos e a arrogância dos impérios deste mundo, o Senhor Jesus governa com justiça infalível e guarda a Sua Igreja.';
        }

        return { profeta: profeta, sacerdote: sacerdote, rei: rei };
    }

    /* Seleciona de 3 a 4 Loci Sistemáticos mais relevantes para o capítulo */
    function classificarLociCapitulo(livro, cap, ctx, temasConf, textoAnalise) {
        var textoTotal = String(textoAnalise || '') + ' ' + (ctx ? ctx.temaLivro : '');
        if (temasConf && temasConf.length) {
            temasConf.forEach(function (tc) {
                textoTotal += ' ' + (tc.item.t || '') + ' ' + (tc.item.x || '');
            });
        }
        var escolhidos = [];
        var mapaIds = {};

        function addLocus(id) {
            if (mapaIds[id]) return;
            for (var i = 0; i < LOCI_SISTEMATICA.length; i++) {
                if (LOCI_SISTEMATICA[i].id === id) {
                    mapaIds[id] = true;
                    escolhidos.push(LOCI_SISTEMATICA[i]);
                    break;
                }
            }
        }

        /* Sempre testa afinidade textual pelo vocabulário do estudo */
        LOCI_SISTEMATICA.forEach(function (loc) {
            var matches = textoTotal.match(new RegExp(loc.rx.source, 'gi'));
            if (matches && matches.length >= 2) {
                addLocus(loc.id);
            }
        });

        /* Garante Loci essenciais conforme o grupo canônico caso faltem */
        if (livro.grupo === 'pentateuco') { addLocus('teontologia'); addLocus('antropologia'); addLocus('cristologia'); }
        else if (livro.grupo === 'historicos') { addLocus('teontologia'); addLocus('cristologia'); addLocus('eclesiologia'); }
        else if (livro.grupo === 'poeticos') { addLocus('teontologia'); addLocus('eclesiologia'); addLocus('soteriologia'); }
        else if (livro.grupo === 'profetasMaiores' || livro.grupo === 'profetasMenores') { addLocus('teontologia'); addLocus('cristologia'); addLocus('escatologia'); }
        else if (livro.grupo === 'evangelhos') { addLocus('cristologia'); addLocus('soteriologia'); addLocus('escatologia'); }
        else if (livro.grupo === 'atos') { addLocus('soteriologia'); addLocus('eclesiologia'); addLocus('cristologia'); }
        else { addLocus('soteriologia'); addLocus('cristologia'); addLocus('eclesiologia'); }

        return escolhidos.slice(0, 4);
    }

    /* Injeta as 6 Novas Áreas do Perito Reformado em Bíblia dentro de prosaEl */
    function injetarSeisAreasPeritoDOM(prosaEl, estudo, livroAtual, cap, ctx, dadosEstudo) {
        if (!prosaEl || !livroAtual || !ctx) return;
        var esc = B.ui.esc;
        var ehLivro = !!(estudo && estudo.tipo === 'livro');
        var refExib = ehLivro ? livroAtual.nome : (livroAtual.nome + ' ' + cap);
        var infoTempo = (B.tempo && B.tempo.doCapitulo) ? B.tempo.doCapitulo(livroAtual, cap) : null;
        var arqLivro = ARQUEOLOGIA_POR_LIVRO[livroAtual.nome] || {
            epoca: livroAtual.testamento === 'AT' ? 'reino_dividido' : 'igreja_primitiva',
            destaque: 'Este livro está profundamente enraizado na história real, na geografia e na cultura material do mundo bíblico.'
        };
        var arqEpoca = ARQUEOLOGIA_EPOCAS[arqLivro.epoca] || ARQUEOLOGIA_EPOCAS.reino_dividido;
        var discGrupo = DISCERNIMENTO_POR_GRUPO[livroAtual.grupo] || DISCERNIMENTO_POR_GRUPO.epistolas;

        /* -------------------------------------------------------------------------
           ÁREA 1: 📜 Teologia do Pacto e História da Redenção (Geerhardus Vos)
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /teologia do pacto|hist[óo]ria da reden[çc][ãa]o/i)) {
            var secPacto = document.createElement('section');
            secPacto.className = 'est-area-perito est-pacto';
            var faixaBloco = ctx.blocoAtual
                ? (ctx.blocoAtual.de === ctx.blocoAtual.ate ? 'Cap. ' + ctx.blocoAtual.de : 'Caps. ' + ctx.blocoAtual.de + '–' + ctx.blocoAtual.ate)
                : ('Caps. 1–' + livroAtual.caps);

            /* Barra visual de progressão das Alianças na História da Redenção */
            var etapasPacto = [
                { id: 'criacao', rotulo: '1. Criação / Adão' },
                { id: 'noetica', rotulo: '2. Noé' },
                { id: 'abraamica', rotulo: '3. Abraão' },
                { id: 'mosaica', rotulo: '4. Sinai / Moisés' },
                { id: 'davidica', rotulo: '5. Davi' },
                { id: 'nova_prometida', rotulo: '6. Profetas (Promessa)' },
                { id: 'nova', rotulo: '7. Nova Aliança em Cristo' }
            ];
            var trilhaPactoHtml = etapasPacto.map(function (et) {
                var ativo = ctx.alianca && ctx.alianca.id === et.id;
                return '<span class="pacto-etapa' + (ativo ? ' is-pacto-atual' : '') + '">' +
                    (ativo ? '✦ ' : '') + esc(et.rotulo) + '</span>';
            }).join('<span class="pacto-seta">→</span>');

            secPacto.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">📜 Teologia Bíblica Reformada · Geerhardus Vos</span>' +
                '<h4>📜 Teologia do Pacto e História da Redenção</h4>' +
                '<p class="dica">A Escritura não é uma coleção de textos isolados, mas o desdobramento orgânico e progressivo de uma única <b>Aliança da Graça</b> (CFW 7.3–6) que culmina na pessoa e obra de Jesus Cristo:</p>' +
                '</div>' +
                '<div class="pacto-trilha" aria-label="Linha das Alianças">' + trilhaPactoHtml + '</div>' +
                '<div class="perito-grade-2">' +
                '<div class="perito-card perito-card--ouro">' +
                '<span class="perito-card-rotulo">Aliança Vigente no Texto</span>' +
                '<b>' + esc(ctx.alianca.nome) + '</b>' +
                '<p><b>Mediador Federal:</b> ' + esc(ctx.alianca.mediador) + '</p>' +
                '<p><b>Sinal Visível do Pacto:</b> ' + esc(ctx.alianca.sinal) + '</p>' +
                '</div>' +
                '<div class="perito-card">' +
                '<span class="perito-card-rotulo">Movimento no Livro de ' + esc(livroAtual.nome) + '</span>' +
                '<b>' + esc(faixaBloco + ' · ' + (ctx.blocoAtual ? ctx.blocoAtual.titulo : livroAtual.nome)) + '</b>' +
                '<p><b>Eixo Teológico do Livro:</b> ' + esc(ctx.temaLivro) + '</p>' +
                '</div>' +
                '</div>' +
                '<div class="perito-card perito-card--largo">' +
                '<span class="perito-card-rotulo">A Promessa Federal e Sua Consumação em Cristo</span>' +
                '<p><b>Promessa da Aliança:</b> ' + esc(ctx.alianca.promessa) + '</p>' +
                '<p class="pacto-cumprimento"><b>✝️ Da Sombra à Realidade em Cristo:</b> ' + esc(dadosEstudo.cristoResumo || ctx.alianca.cristo) + '</p>' +
                '</div>';
            prosaEl.appendChild(secPacto);
        }

        /* -------------------------------------------------------------------------
           ÁREA 2: 🔍 Lente Hermenêutica & Estrutura Literária
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /lente hermen[êe]utica|estrutura liter[áa]ria/i)) {
            var secHerm = document.createElement('section');
            secHerm.className = 'est-area-perito est-hermeneutica';
            var mapaBlocosHtml = (ctx.blocos || []).map(function (b, idx) {
                var ehAtual = !ehLivro && cap >= b.de && cap <= b.ate;
                var fx = b.de === b.ate ? 'Cap. ' + b.de : 'Caps. ' + b.de + '–' + b.ate;
                return '<div class="herm-bloco-item' + (ehAtual ? ' is-bloco-atual' : '') + '">' +
                    '<span class="herm-bloco-num">' + (idx + 1) + 'º Movimento · ' + esc(fx) +
                    (ehAtual ? ' · 📍 VOCÊ ESTÁ AQUI (' + esc(refExib) + ')' : '') + '</span>' +
                    '<b>' + esc(b.titulo) + '</b>' +
                    '</div>';
            }).join('');

            var cenasCap = (!ehLivro && estudo && estudo.texto) ? cenasDe(estudo.texto, false) : [];
            var microEstruturaHtml = '';
            if (cenasCap && cenasCap.length >= 2) {
                microEstruturaHtml =
                    '<div class="perito-card perito-card--largo" style="margin-top:10px">' +
                    '<span class="perito-card-rotulo">Arquitetura Interna e Divisão de Cenas de ' + esc(refExib) + '</span>' +
                    '<div class="herm-cenas-grade">' +
                    cenasCap.map(function (c, idxC) {
                        return '<div class="herm-cena-chip">' +
                            '<span class="herm-cena-ord">Cena ' + (idxC + 1) + ' · ' + esc(c.onde) + '</span>' +
                            '<b>' + esc(c.titulo || primeiraFrase(c.texto, 85)) + '</b>' +
                            '</div>';
                    }).join('') +
                    '</div>' +
                    '</div>';
            }

            secHerm.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">🔍 Método Histórico-Gramatical & Analogia da Fé (CFW 1.9)</span>' +
                '<h4>🔍 Lente Hermenêutica & Estrutura Literária</h4>' +
                '<p class="dica">Para interpretar corretamente a Palavra da Verdade (2Tm 2:15), todo texto deve ser lido segundo as leis do seu gênero literário, dentro da estrutura do seu livro e em harmonia com todo o cânon:</p>' +
                '</div>' +
                '<div class="perito-grade-2">' +
                '<div class="perito-card">' +
                '<span class="perito-card-rotulo">Gênero Literário & Chave de Leitura</span>' +
                '<b>' + esc(ctx.genero.nome) + '</b>' +
                '<p>' + esc(ctx.genero.comoLer) + '</p>' +
                '<p class="dica"><b>Regra Reformada (Analogia Fidei):</b> "A regra infalível de interpretação da Escritura é a própria Escritura" (CFW 1.9) — textos mais obscuros devem ser iluminados pelos mais claros.</p>' +
                '</div>' +
                '<div class="perito-card perito-card--alerta">' +
                '<span class="perito-card-rotulo">⚠️ Armadilha Hermenêutica deste Gênero</span>' +
                '<b>O que NÃO fazer ao interpretar este texto</b>' +
                '<p>' + esc(ctx.genero.evitar) + '</p>' +
                '</div>' +
                '</div>' +
                '<div class="perito-card perito-card--largo">' +
                '<span class="perito-card-rotulo">Mapa Macroestrutural de ' + esc(livroAtual.nome) + ' (' + livroAtual.caps + ' capítulos)</span>' +
                '<div class="herm-blocos-lista">' + mapaBlocosHtml + '</div>' +
                '</div>' +
                microEstruturaHtml;
            prosaEl.appendChild(secHerm);
        }

        /* -------------------------------------------------------------------------
           ÁREA 3: 🏺 Arqueologia, Costumes e Mundo Antigo
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /arqueologia, costumes|mundo antigo/i)) {
            var secArq = document.createElement('section');
            secArq.className = 'est-area-perito est-arqueologia';
            var quadroCronologicoHtml = infoTempo
                ? '<div class="perito-grade-2">' +
                  '<div class="perito-card perito-card--ouro">' +
                  '<span class="perito-card-rotulo">⏳ Cronologia & Geopolítica (' + esc(infoTempo.era.curto) + ')</span>' +
                  '<b>Data Aproximada: ' + esc(infoTempo.data) + '</b>' +
                  '<p><b>Quem Reinava / Governava:</b> ' + esc(infoTempo.reinado) + '</p>' +
                  '<p><b>Potência Dominante:</b> ' + esc(infoTempo.imperio) + '</p>' +
                  '<p><b>Situação Geopolítica:</b> ' + esc(infoTempo.situacao) + '</p>' +
                  '</div>' +
                  '<div class="perito-card">' +
                  '<span class="perito-card-rotulo">🏺 Costumes & Cultura Material da Época</span>' +
                  '<b>' + esc(arqEpoca.epoca) + '</b>' +
                  '<p>' + esc(arqEpoca.costumes) + '</p>' +
                  '</div>' +
                  '</div>'
                : '';

            var achadosHtml = (arqEpoca.achados || []).map(function (a) {
                return '<div class="arq-achado-card">' +
                    '<span class="arq-selo">🏛️ Evidência Arqueológica & Epigráfica</span>' +
                    '<b>' + esc(a.titulo) + '</b>' +
                    '<p>' + esc(a.desc) + '</p>' +
                    '</div>';
            }).join('');

            secArq.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">🏺 História do Antigo Oriente Próximo & Mundo Greco-Romano</span>' +
                '<h4>🏺 Arqueologia, Costumes e Mundo Antigo</h4>' +
                '<p class="dica">A fé bíblica é histórica: Deus revelou-Se no espaço e no tempo reais. Veja as descobertas arqueológicas, inscrições antigas e costumes que iluminam <b>' + esc(refExib) + '</b>:</p>' +
                '</div>' +
                quadroCronologicoHtml +
                '<div class="perito-card perito-card--largo" style="margin-bottom:10px">' +
                '<span class="perito-card-rotulo">🔎 Destaque Histórico-Arqueológico de ' + esc(livroAtual.nome) + '</span>' +
                '<p>' + esc(arqLivro.destaque) + '</p>' +
                (infoTempo && infoTempo.contexto ? '<p class="dica" style="margin-top:6px"><b>Panorama Histórico:</b> ' + esc(infoTempo.contexto) + '</p>' : '') +
                '</div>' +
                '<div class="arq-grade">' + achadosHtml + '</div>';
            prosaEl.appendChild(secArq);
        }

        /* -------------------------------------------------------------------------
           ÁREA 4: ⚖️ Doutrinas Sistemáticas (Loci Theologici)
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /doutrinas sistem[áa]ticas|loci theologici/i)) {
            var secLoci = document.createElement('section');
            secLoci.className = 'est-area-perito est-loci';
            var lociAtivos = classificarLociCapitulo(livroAtual, cap, ctx, dadosEstudo.temasConf, dadosEstudo.textoCompleto);
            var lociCardsHtml = lociAtivos.map(function (loc) {
                return '<div class="locus-card">' +
                    '<div class="locus-card-topo">' +
                    '<span class="locus-icone">' + loc.icone + '</span>' +
                    '<div class="locus-titulos">' +
                    '<b>' + esc(loc.ordem) + '</b>' +
                    '<small>' + esc(loc.latim + ' · ' + loc.confissao) + '</small>' +
                    '</div>' +
                    '</div>' +
                    '<p>' + esc(loc.sintese) + '</p>' +
                    '</div>';
            }).join('');

            secLoci.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">⚖️ Teologia Sistemática Reformada · Calvino, Bavinck & Westminster</span>' +
                '<h4>⚖️ Doutrinas Sistemáticas (Loci Theologici)</h4>' +
                '<p class="dica">A exegese bíblica sadia deságua na Teologia Sistemática. Estes são os grandes <i>Loci Theologici</i> (pilares doutrinários) fundamentados neste texto:</p>' +
                '</div>' +
                '<div class="loci-grade">' + lociCardsHtml + '</div>';
            prosaEl.appendChild(secLoci);
        }

        /* -------------------------------------------------------------------------
           ÁREA 5: 🛡️ Discernimento Pastoral: Erros Comuns e Más Leituras a Evitar
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /discernimento pastoral|m[áa]s leituras a evitar/i)) {
            var secDisc = document.createElement('section');
            secDisc.className = 'est-area-perito est-discernimento';
            secDisc.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">🛡️ Apologética & Exegese Sóbria · Guarda do Bom Depósito (2Tm 1:14)</span>' +
                '<h4>🛡️ Discernimento Pastoral: Erros Comuns e Más Leituras a Evitar</h4>' +
                '<p class="dica">Tão importante quanto saber o que o texto diz é discernir o que ele <b>não</b> diz, protegendo a Igreja contra o moralismo, a teologia da prosperidade, o legalismo e o texto fora de contexto:</p>' +
                '</div>' +
                '<div class="disc-grade">' +
                '<div class="disc-card">' +
                '<span class="disc-selo">1. Contra o Moralismo Antropocêntrico</span>' +
                '<b>Leitura Teocêntrica & Cristocêntrica vs. Autoajuda</b>' +
                '<p>' + esc(discGrupo.moralismo) + '</p>' +
                '</div>' +
                '<div class="disc-card">' +
                '<span class="disc-selo">2. Contra o Texto Fora de Contexto</span>' +
                '<b>Fidelidade ao Fluxo do Argumento vs. Pretexto</b>' +
                '<p>' + esc(discGrupo.contexto) + '</p>' +
                '</div>' +
                '<div class="disc-card">' +
                '<span class="disc-selo">3. Contra o Anacronismo & Distorção da Aliança</span>' +
                '<b>Discernimento Histórico-Redentivo</b>' +
                '<p>' + esc(discGrupo.anacronismo) + '</p>' +
                '</div>' +
                '</div>';
            prosaEl.appendChild(secDisc);
        }

        /* -------------------------------------------------------------------------
           ÁREA 6: 💎 Tesouro Exegético e Homilético (Síntese de Estudo & Munus Triplex)
           ------------------------------------------------------------------------- */
        if (!acharSecaoH4(prosaEl, /tesouro exeg[ée]tico|munus triplex/i)) {
            var secTesouro = document.createElement('section');
            secTesouro.className = 'est-area-perito est-tesouro';
            var munus = munusTriplexDoCapitulo(livroAtual, cap, ctx, dadosEstudo.textoCompleto);
            var teseExib = dadosEstudo.teseCapitulo || ctx.temaLivro;
            var versoExib = dadosEstudo.versoAncoraTxt || ('Leia ' + refExib + ' observando como a palavra-chave e o clímax do capítulo revelam o caráter de Deus.');
            var termoExib = dadosEstudo.palavraChaveCurta || (livroAtual.testamento === 'AT'
                ? 'Hebraico Bíblico: observe os verbos de aliança (berit, hesed, shuv) e os nomes redentores de Deus neste capítulo.'
                : 'Grego Koiné: observe a relação entre os tempos verbais do indicativo da graça (charis, pistis, dikaiosyne) e os imperativos da vida em Cristo.');

            var sincLista = ctx.sincronismo || [];
            var paralelosTxt = sincLista.length
                ? (sincLista[0].texto + ' (' + (sincLista[0].refs || []).join(', ') + ')')
                : 'Use as referências cruzadas em cada bloco acima para praticar a regra de que a Escritura interpreta a Escritura.';

            secTesouro.innerHTML =
                '<div class="perito-sec-topo">' +
                '<span class="ctx-rotulo">💎 Quadro-Resumo do Exegeta & Pregador Reformado</span>' +
                '<h4>💎 Tesouro Exegético e Homilético (Síntese de Estudo)</h4>' +
                '<p class="dica">Quadro estruturado de consulta rápida para revisão pessoal, ensino em classe bíblica, discipulado ou preparo de exposição homilética de <b>' + esc(refExib) + '</b>:</p>' +
                '</div>' +
                '<div class="perito-grade-2">' +
                '<div class="perito-card perito-card--ouro">' +
                '<span class="perito-card-rotulo">🎯 Tese Exegética Central</span>' +
                '<p class="tesouro-tese">' + esc(teseExib) + '</p>' +
                '</div>' +
                '<div class="perito-card">' +
                '<span class="perito-card-rotulo">⚓ Versículo-Chave & Termo Original</span>' +
                '<p><b>Versículo-Âncora:</b> ' + esc(primeiraFrase(versoExib, 220)) + '</p>' +
                '<p><b>Joia do Original:</b> ' + esc(termoExib) + '</p>' +
                '</div>' +
                '</div>' +
                '<div class="perito-card perito-card--largo munus-box">' +
                '<span class="perito-card-rotulo">✝️ O Triplo Ofício de Cristo (Munus Triplex · Calvino, Institutas II.15 & BCW P. 23–26)</span>' +
                '<div class="munus-grade">' +
                '<div class="munus-item"><b>📣 Cristo como Profeta</b><p>' + esc(munus.profeta).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>') + '</p></div>' +
                '<div class="munus-item"><b>🩸 Cristo como Sacerdote</b><p>' + esc(munus.sacerdote).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>') + '</p></div>' +
                '<div class="munus-item"><b>👑 Cristo como Rei</b><p>' + esc(munus.rei).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>') + '</p></div>' +
                '</div>' +
                '</div>' +
                '<div class="perito-card perito-card--largo">' +
                '<span class="perito-card-rotulo">🔀 Harmonia Canônica & Paralelos Principais</span>' +
                '<p>' + esc(paralelosTxt) + '</p>' +
                '</div>';
            prosaEl.appendChild(secTesouro);
        }
    }

    /**
     * Enriquecimento Teológico e Pedagógico do Estudo: aplica os pilares
     * (Síntese sem repetir o 1º parágrafo, Bloco a Bloco com texto bíblico
     * embutido oculto inicialmente, Cartões de Léxico/Teólogos/Debate/Cristo,
     * 6 Novas Áreas do Perito Reformado, Catequese Reformada e 3 Gavetas Puritanas)
     * + Referências e Localidades clicáveis.
     */
    function enriquecerEstudoDOM(prosaEl, estudo, livroAtual, capAtual) {
        if (!prosaEl || !livroAtual) return;
        var esc = B.ui.esc;
        var cap = capAtual || 1;
        var ctx = analisar(livroAtual, cap);

        /* Remove o título <h3> redundante e o 1º parágrafo (tese já exibida no Fio da Narrativa) */
        var h3Topo = B.ui.q('h3', prosaEl);
        var pTese = h3Topo && h3Topo.nextElementSibling && h3Topo.nextElementSibling.tagName === 'P'
            ? h3Topo.nextElementSibling
            : B.ui.q('p', prosaEl);
        var teseCapitulo = pTese ? (pTese.textContent || '').trim() : (ctx ? ctx.temaLivro : '');

        if (pTese && pTese.parentNode === prosaEl) {
            pTese.parentNode.removeChild(pTese);
        }
        if (h3Topo && h3Topo.parentNode === prosaEl) {
            h3Topo.parentNode.removeChild(h3Topo);
        }

        tirarSecoesPedidas(prosaEl);

        /* Versículo-âncora */
        var h4VersosChave = acharSecaoH4(prosaEl, /vers[íi]culos?-chave/i);
        var versoAncoraTxt = '';
        if (h4VersosChave) {
            var elsVC = elementosDaSecao(h4VersosChave);
            for (var i = 0; i < elsVC.length; i++) {
                var liVC = elsVC[i].tagName === 'UL' ? B.ui.q('li', elsVC[i]) : (elsVC[i].tagName === 'P' ? elsVC[i] : null);
                if (liVC) {
                    versoAncoraTxt = (liVC.textContent || '').trim();
                    break;
                }
            }
        }

        /* Palavra no original */
        var h4Original = acharSecaoH4(prosaEl, /palavras? no original/i);
        var palavraChaveTxt = '';
        var palavraChaveCurta = '';
        if (h4Original) {
            var elsOrig = elementosDaSecao(h4Original);
            for (var j = 0; j < elsOrig.length; j++) {
                var itemO = elsOrig[j].tagName === 'UL' ? B.ui.q('li', elsOrig[j]) : (elsOrig[j].tagName === 'P' ? elsOrig[j] : null);
                if (itemO && (itemO.textContent || '').trim()) {
                    palavraChaveTxt = (itemO.textContent || '').trim();
                    var mTermo = palavraChaveTxt.match(/^([^:]+):\s*(.+)$/);
                    if (mTermo) {
                        palavraChaveCurta = mTermo[1].trim() + ' — ' + primeiraFrase(mTermo[2], 140);
                    } else {
                        palavraChaveCurta = primeiraFrase(palavraChaveTxt, 160);
                    }
                    break;
                }
            }
        }

        /* Como aponta para Cristo */
        var h4Cristo = acharSecaoH4(prosaEl, /aponta para cristo/i);
        var cristoResumo = '';
        if (h4Cristo) {
            var elsCr = elementosDaSecao(h4Cristo);
            for (var k = 0; k < elsCr.length; k++) {
                if (elsCr[k].tagName === 'P' && (elsCr[k].textContent || '').trim()) {
                    var txtCr = (elsCr[k].textContent || '').trim();
                    if (txtCr.length > 45 || k === elsCr.length - 1) {
                        cristoResumo = primeiraFrase(txtCr, 220);
                        break;
                    }
                }
            }
        }
        if (!cristoResumo && ctx && ctx.alianca) {
            cristoResumo = ctx.alianca.cristo;
        }

        /* Aplicação / Vida (Agenda) */
        var h4Vida = acharSecaoH4(prosaEl, /mesa de estudo para a vida|para a sua vida|para meditar/i);
        var agendaResumo = '';
        if (h4Vida) {
            var elsVida = elementosDaSecao(h4Vida);
            for (var v = 0; v < elsVida.length; v++) {
                var itemV = elsVida[v].tagName === 'UL' ? B.ui.q('li', elsVida[v]) : elsVida[v];
                if (itemV && (itemV.textContent || '').trim()) {
                    agendaResumo = primeiraFrase(itemV.textContent, 220);
                    break;
                }
            }
        }

        /* Oração (Oranda) */
        var h4Oracao = acharSecaoH4(prosaEl, /^ora[çc][ãa]o/i);
        var orandaResumo = '';
        if (h4Oracao) {
            var elsOr = elementosDaSecao(h4Oracao);
            for (var o = 0; o < elsOr.length; o++) {
                if ((elsOr[o].textContent || '').trim()) {
                    orandaResumo = (elsOr[o].textContent || '').trim();
                    break;
                }
            }
        }

        /* =========================================================================
           3. Transformar Seções em Cartões Visuais (Léxico, Teólogos, Debates, Cristo)
           ========================================================================= */

        /* O estudo escreve "[Strong H6918 / H6942]". Virando selo só o
           código, os colchetes ficavam soltos de fora dele, como lixo de
           pontuação em volta da etiqueta. */
        function selosStrong(html) {
            return String(html)
                .replace(/\[\s*((?:Strong\s+)?[GH]\d{3,4}(?:\s*\/\s*(?:Strong\s+)?[GH]\d{3,4})*)\s*\]/gi, '$1')
                .replace(/\b((?:Strong\s+)?[GH]\d{3,4})\b/gi, '<span class="selo-strong">$1</span>');
        }

        /* 3a. Cartões de Léxico (Hebraico / Grego com código Strong) */
        if (h4Original) {
            elementosDaSecao(h4Original).forEach(function (el) {
                if (el.tagName === 'UL') {
                    el.classList.add('lista-lexico');
                    B.ui.qq('li', el).forEach(function (li) {
                        li.classList.add('card-lexico');
                        li.innerHTML = selosStrong(li.innerHTML);
                    });
                } else if (el.tagName === 'P' && B.ui.q('strong, b', el)) {
                    el.classList.add('card-lexico');
                    el.innerHTML = selosStrong(el.innerHTML);
                }
            });
        }

        /* 3b. Cartões "Vozes da História da Igreja" (O que dizem os teólogos) */
        var h4Teologos = acharSecaoH4(prosaEl, /dizem os te[óo]logos/i);
        if (h4Teologos) {
            elementosDaSecao(h4Teologos).forEach(function (el) {
                if (el.tagName === 'UL') {
                    el.classList.add('lista-teologos');
                    B.ui.qq('li', el).forEach(function (li) {
                        li.classList.add('card-teologo');
                        var epoca = classificarEpocaTeologo(li.textContent || '');
                        var selo = '<span class="selo-epoca ' + epoca.classe + '">' + esc(epoca.rotulo) + '</span>';
                        li.innerHTML = '<div class="card-teologo-topo">' + selo + '</div>' +
                            '<div class="card-teologo-corpo">' + li.innerHTML + '</div>';
                    });
                } else if (el.tagName === 'P' && B.ui.q('strong, b', el)) {
                    el.classList.add('card-teologo');
                    var epocaP = classificarEpocaTeologo(el.textContent || '');
                    var seloP = '<span class="selo-epoca ' + epocaP.classe + '">' + esc(epocaP.rotulo) + '</span>';
                    el.innerHTML = '<div class="card-teologo-topo">' + seloP + '</div>' +
                        '<div class="card-teologo-corpo">' + el.innerHTML + '</div>';
                }
            });
        }

        /* 3c. Quadro de Debate Exegético (Onde os intérpretes discordam) */
        var h4Debate = acharSecaoH4(prosaEl, /int[ée]rpretes discordam/i);
        if (h4Debate) {
            elementosDaSecao(h4Debate).forEach(function (el) {
                if (el.tagName === 'UL') {
                    el.classList.add('lista-debates');
                    B.ui.qq('li', el).forEach(function (li) {
                        li.classList.add('card-debate');
                        li.innerHTML = '<span class="selo-debate">⚖️ Questão Exegética</span><div>' + li.innerHTML + '</div>';
                    });
                } else if (el.tagName === 'P' && B.ui.q('strong, b', el)) {
                    el.classList.add('card-debate');
                    el.innerHTML = '<span class="selo-debate">⚖️ Questão Exegética</span><div>' + el.innerHTML + '</div>';
                }
            });
        }

        /* 3d. Destaque Cristocêntrico (Como este capítulo aponta para Cristo) */
        if (h4Cristo) {
            var elsCristo = elementosDaSecao(h4Cristo);
            if (elsCristo.length) {
                var caixaCristo = document.createElement('div');
                caixaCristo.className = 'secao-cristo';
                h4Cristo.parentNode.insertBefore(caixaCristo, h4Cristo);
                caixaCristo.appendChild(h4Cristo);
                elsCristo.forEach(function (el) { caixaCristo.appendChild(el); });
            }
        }

        /* =========================================================================
           2. Exposição Bloco a Bloco com os Versículos Bíblicos Embutidos (Calvino)
           ========================================================================= */
        inserirIntroCapitulo(prosaEl, estudo, teseCapitulo, livroAtual, cap);
        var blocosExegese = construirBlocosExegeseDOM(prosaEl, estudo, livroAtual, cap);

        /* =========================================================================
           4. As 6 Novas Áreas do Perito Reformado em Bíblia (Pacto, Hermenêutica,
              Arqueologia, Loci Sistemáticos, Discernimento e Tesouro Exegético)
           ========================================================================= */
        var temasConf = (B.doutrina && livroAtual.usfm && (!estudo || estudo.tipo !== 'livro'))
            ? B.doutrina.temas(livroAtual.usfm, cap)
            : [];

        injetarSeisAreasPeritoDOM(prosaEl, estudo, livroAtual, cap, ctx, {
            teseCapitulo: teseCapitulo,
            versoAncoraTxt: versoAncoraTxt,
            palavraChaveCurta: palavraChaveCurta,
            cristoResumo: cristoResumo,
            temasConf: temasConf,
            textoCompleto: (estudo && estudo.texto) ? estudo.texto : (prosaEl.textContent || '')
        });

        /* =========================================================================
           5. Catequese & Confissão Reformada Integrada ao Estudo
           ========================================================================= */

        var catequeseEl = document.createElement('section');
        catequeseEl.className = 'est-catequese';
        if (temasConf && temasConf.length) {
            var cardsCat = temasConf.slice(0, 6).map(function (t, idx) {
                return '<div class="cat-card">' +
                    '<div class="cat-card-topo">' +
                    '<span class="cat-obra">' + esc(t.obra.nome) + ' (' + esc(t.obra.ano) + ')</span>' +
                    '<span class="cat-marca">' + esc(t.marca) + '</span>' +
                    '</div>' +
                    '<p class="cat-pergunta"><b>' + esc(t.item.t) + '</b></p>' +
                    '<button type="button" class="btn btn--mini cat-revelar" data-revelar-cat="cat-resp-' + idx + '">' +
                    '👁️ Toque para meditar e revelar a resposta confessional' +
                    '</button>' +
                    '<div class="cat-resposta" id="cat-resp-' + idx + '" hidden>' +
                    '<p>' + esc(t.item.x) + '</p>' +
                    '</div>' +
                    '</div>';
            }).join('');

            catequeseEl.innerHTML =
                '<div class="est-catequese-topo">' +
                '<span class="ctx-rotulo">🏛️ Tradição Reformada · Símbolos de Fé</span>' +
                '<h4>Catequese & Confissão Reformada neste Capítulo</h4>' +
                '<p class="dica">Este capítulo é texto-prova direto nas Confissões e Catecismos históricos (Westminster, Heidelberg, Confissão Belga e Cânones de Dort). Tente responder mentalmente antes de revelar:</p>' +
                '</div>' +
                '<div class="cat-lista">' + cardsCat + '</div>';
            prosaEl.appendChild(catequeseEl);
        } else if (ctx && ctx.alianca) {
            catequeseEl.innerHTML =
                '<div class="est-catequese-topo">' +
                '<span class="ctx-rotulo">🏛️ Catequese da Aliança</span>' +
                '<h4>Fixação Doutrinária (' + esc(ctx.alianca.nome) + ')</h4>' +
                '</div>' +
                '<div class="cat-card">' +
                '<p class="cat-pergunta"><b>Como ' + esc(livroAtual.nome + ' ' + cap) + ' se encaixa na Aliança da Graça e aponta para Cristo?</b></p>' +
                '<button type="button" class="btn btn--mini cat-revelar" data-revelar-cat="cat-resp-alianca">' +
                '👁️ Toque para revelar a síntese da Aliança' +
                '</button>' +
                '<div class="cat-resposta" id="cat-resp-alianca" hidden>' +
                '<p><b>Promessa do Pacto:</b> ' + esc(ctx.alianca.promessa) + '</p>' +
                '<p><b>Cumprimento em Cristo:</b> ' + esc(cristoResumo || ctx.alianca.cristo) + '</p>' +
                '</div>' +
                '</div>';
            prosaEl.appendChild(catequeseEl);
        }

        /* =========================================================================
           5. O Método Puritano das "3 Gavetas da Memória" (Credenda, Agenda, Oranda)
           ========================================================================= */
        var credendaTxt = cristoResumo || primeiraFrase(teseCapitulo, 220) || (ctx ? ctx.temaLivro : '');
        var agendaTxt = agendaResumo || 'Examine sua vida à luz da verdade central deste capítulo: que pecado precisa ser abandonado e que promessa precisa ser crida hoje?';
        /* A oração do capítulo saiu do meio do estudo a pedido, e esta
           gaveta a citava. Fica a orientação, e a oração inteira está
           em "Orar este capítulo". */
        var orandaTxt = 'Louve a Deus pelo que este capítulo revela do Seu caráter, ' +
            'confesse sua dependência da graça de Cristo e peça que o Espírito Santo ' +
            'grave esta Palavra no seu coração. A oração escrita para este capítulo ' +
            'está em "Orar este capítulo".';

        var gavetasEl = document.createElement('section');
        gavetasEl.className = 'est-gavetas';
        gavetasEl.innerHTML =
            '<div class="est-gavetas-topo">' +
            '<span class="ctx-rotulo">🗄️ Método Puritano de Retenção</span>' +
            '<h4>As 3 Gavetas da Memória (Doutrina · Vida · Oração)</h4>' +
            '<p class="dica">Os mestres puritanos ensinavam a nunca fechar a Bíblia sem guardar o capítulo em três gavetas da alma:</p>' +
            '</div>' +
            '<div class="gavetas-grade">' +
            '<div class="gaveta-card">' +
            '<span class="gaveta-num">1ª Gaveta · CREDENDA</span>' +
            '<b>O que devo CRER sobre Deus e Cristo?</b>' +
            '<p>' + esc(credendaTxt) + '</p>' +
            '</div>' +
            '<div class="gaveta-card">' +
            '<span class="gaveta-num">2ª Gaveta · AGENDA</span>' +
            '<b>O que devo PRATICAR e mudar hoje?</b>' +
            '<p>' + esc(agendaTxt) + '</p>' +
            '</div>' +
            '<div class="gaveta-card">' +
            '<span class="gaveta-num">3ª Gaveta · ORANDA</span>' +
            '<b>O que devo ORAR a partir deste texto?</b>' +
            '<p>' + esc(orandaTxt) + '</p>' +
            '</div>' +
            '</div>';
        prosaEl.appendChild(gavetasEl);

        /* Transforma localidades e referências bíblicas em botões clicáveis (via TreeWalker, preservando os cartões) */
        enriquecerLugares(prosaEl, livroAtual, cap);
        enriquecerReferencias(prosaEl, livroAtual, cap);

        B.ui.qq('[data-revelar-cat]', prosaEl).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-revelar-cat');
                var alvo = document.getElementById(id) || B.ui.q('#' + id, prosaEl);
                if (!alvo) return;
                alvo.hidden = !alvo.hidden;
                btn.textContent = alvo.hidden
                    ? '👁️ Toque para meditar e revelar a resposta confessional'
                    : '▴ Ocultar resposta confessional';
            });
        });

        /* Carrega os versículos bíblicos reais dentro de cada bloco exegético ("O capítulo, parte por parte") */
        ativarBlocosExegeseDOM(prosaEl, blocosExegese, livroAtual, cap);
    }

    /* Renderiza a faixa de Passagens Paralelas e Harmonia dos Evangelhos no topo do estudo */
    function renderParalelosCapitulo(livro, cap) {
        if (!livro || !cap) return '';
        var lista = sincronismo(livro.nome, cap);
        if (!lista || !lista.length) return '';
        var esc = B.ui.esc;
        var primeiro = lista[0];
        var chips = (primeiro.refs || []).map(function (r) {
            return '<button type="button" class="ref-inline chip-paralelo" data-abrir-ref="' + esc(r) + '">📖 ' + esc(r) + '</button>' +
                '<a class="chip-paralelo-estudo" href="#/estudo/' + encodeURIComponent(r) + '" title="Abrir estudo de ' + esc(r) + '">✦</a>';
        }).join('');
        return '<section class="cartao faixa-paralelos" data-faixa-paralelos>' +
            '<div class="faixa-paralelos-topo">' +
            '<span class="fio-selo">🔀 ' + esc(primeiro.rotulo || 'Passagens Paralelas & Harmonia Canônica') + '</span>' +
            '</div>' +
            '<p class="faixa-paralelos-desc">' + esc(primeiro.texto) + '</p>' +
            '<div class="faixa-paralelos-chips">' + chips + '</div>' +
            '</section>';
    }

    /* Abre um modal comparando lado a lado os versículos (vIni..vFim) em todas as edições disponíveis */
    function compararVersosModal(livroOuNome, cap, vIni, vFim) {
        var livro = typeof livroOuNome === 'string' ? B.biblia.livro(livroOuNome) : livroOuNome;
        if (!livro || !B.texto) return;
        var c = cap || 1;
        var esc = B.ui.esc;
        var todasEdicoes = B.texto.edicoes ? B.texto.edicoes() : B.texto.EDICOES;
        var chaves = Object.keys(todasEdicoes);

        var promessas = chaves.map(function (k) {
            if (B.texto.capituloDe) {
                return B.texto.capituloDe(k, livro.nome, c).catch(function () { return null; });
            }
            return B.texto.capituloOuReserva(livro.nome, c).then(function (r) {
                return { edicao: r.edicao, chave: k, versiculos: r.versiculos };
            }).catch(function () { return null; });
        });

        Promise.all(promessas).then(function (resultados) {
            var validos = resultados.filter(function (r) { return r && r.versiculos && r.versiculos.length; });
            if (!validos.length) return;
            var totalVersos = validos[0].versiculos.length;
            var ini = vIni ? Math.max(1, vIni) : 1;
            var fim = vFim ? Math.min(totalVersos, vFim) : Math.min(totalVersos, 12);
            var tituloFaixa = livro.nome + ' ' + c + (vIni ? ':' + ini + (fim > ini ? '–' + fim : '') : ' (vv. ' + ini + '–' + fim + ')');

            var linhasHtml = [];
            for (var v = ini; v <= fim; v++) {
                var cols = validos.map(function (edObj) {
                    var txt = edObj.versiculos[v - 1] || '—';
                    return '<div class="comp-edicao-col">' +
                        '<span class="comp-edicao-nome">' + esc(edObj.edicao.curto || edObj.edicao.nome) + '</span>' +
                        '<p class="comp-edicao-texto">' + esc(txt) + '</p>' +
                        '</div>';
                }).join('');
                linhasHtml.push(
                    '<div class="comp-verso-bloco">' +
                    '<div class="comp-verso-num">Versículo ' + v + '</div>' +
                    '<div class="comp-verso-grade">' + cols + '</div>' +
                    '</div>'
                );
            }

            var avisoMais = (!vIni && totalVersos > 12)
                ? '<p class="dica">Mostrando os primeiros 12 de ' + totalVersos + ' versículos. Toque em qualquer versículo na leitura ou nos blocos do estudo para comparar trechos específicos.</p>'
                : '';
            var linkExterno = '<p class="dica">Você pode carregar outras traduções (como NVI, ARA, NAA ou ACF em JSON) em <a href="#/config">Ajustes</a> para compará-las lado a lado aqui, ou <a href="' +
                esc(B.biblia.linkNVI(livro, c)) + '" target="_blank" rel="noopener">abrir em Bible.com</a>.</p>';

            B.ui.modal({
                titulo: '⚖️ Comparar edições · ' + tituloFaixa,
                html: '<div class="caixa-comparador-modal">' + linhasHtml.join('') + avisoMais + linkExterno + '</div>',
                textoOk: 'Fechar',
                textoCancelar: ''
            });
        });
    }

    /* Abre um modal mostrando o texto bíblico da referência clicada */
    function abrirReferencia(bruto, livroPadrao, capPadrao) {
        if (!bruto) return;
        var limpo = String(bruto).trim();
        var mVersos = limpo.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–a]\s*(\d+))?$/);
        var nomeLivro, cap, vIni = null, vFim = null;

        if (mVersos) {
            var interp = B.biblia.interpretar(mVersos[1] + ' ' + mVersos[2]);
            if (interp && interp.livro) {
                nomeLivro = interp.livro.nome;
                cap = interp.capitulo || parseInt(mVersos[2], 10);
                vIni = parseInt(mVersos[3], 10);
                vFim = mVersos[4] ? parseInt(mVersos[4], 10) : vIni;
            }
        }
        if (!nomeLivro) {
            var alvo = B.biblia.interpretar(limpo);
            if (alvo && alvo.livro) {
                nomeLivro = alvo.livro.nome;
                cap = alvo.capitulo || 1;
            } else if (livroPadrao) {
                nomeLivro = typeof livroPadrao === 'string' ? livroPadrao : livroPadrao.nome;
                cap = capPadrao || 1;
            }
        }
        if (!nomeLivro) return;

        var refCap = nomeLivro + ' ' + cap;
        var tituloModal = vIni
            ? refCap + ':' + vIni + (vFim && vFim !== vIni ? '–' + vFim : '')
            : refCap;

        B.texto.capituloOuReserva(nomeLivro, cap).then(function (r) {
            var versos = r.versiculos;
            var inicio = vIni ? Math.max(1, vIni) : 1;
            var fim = vFim ? Math.min(versos.length, vFim) : Math.min(versos.length, 15);
            var fatia = [];
            for (var i = inicio; i <= fim; i++) {
                if (versos[i - 1]) {
                    fatia.push('<p class="v-modal"><b>' + i + '</b> ' + B.ui.esc(versos[i - 1]) + '</p>');
                }
            }
            var mais = (!vIni && versos.length > 15
                ? '<p class="dica">Mostrando os primeiros 15 de ' + versos.length + ' versículos.</p>'
                : '') +
                (r.reserva
                    ? '<p class="dica">Texto da ' + B.ui.esc(r.edicao.nome) +
                      ': a edição que você carregou não tem este livro.</p>'
                    : '');

            B.ui.modal({
                titulo: '📖 ' + tituloModal,
                html: '<div class="caixa-versos-modal">' + fatia.join('') + mais + '</div>',
                textoOk: 'Abrir ' + refCap,
                textoCancelar: 'Fechar'
            }).then(function (irParaCapitulo) {
                if (irParaCapitulo) {
                    B.app.ir('ler', refCap);
                }
            });
        }, function () {
            B.app.ir('ler', refCap);
        });
    }

    return {
        analisar: analisar,
        renderPainel: renderPainel,
        __cenasDe: cenasDe,          // só para a conferência automática
        renderFioNarrativa: renderFioNarrativa,
        preencherFioNarrativa: preencherFioNarrativa,
        renderParalelosCapitulo: renderParalelosCapitulo,
        compararVersosModal: compararVersosModal,
        vizinhoCapitulo: vizinhoCapitulo,
        ligar: ligar,
        enriquecerReferencias: enriquecerReferencias,
        enriquecerEstudoDOM: enriquecerEstudoDOM,
        abrirReferencia: abrirReferencia
    };
})();
