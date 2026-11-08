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

    /* ---------- 4. Sincronismo Histórico e Conexões Canônicas ---------- */
    /* Devolve paralelos históricos, profetas contemporâneos, Salmos ligados
       ou conexões AT <-> NT para o capítulo consultado. */
    function sincronismo(nomeLivro, cap) {
        var c = cap || 1;
        var itens = [];

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
            itens.push({ rotulo: 'Chave no NT', texto: 'O livro de Hebreus é o comentário inspirado sobre os sacrifícios, o sacerdócio e o Dia da Expiação de Levítico.', refs: ['Hebreus 9', 'Hebreus 10', '1 Pedro 1'] });
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

    /* Renderiza o painel "Raio-X Exegético e Teológico" do capítulo */
    function renderPainel(livroOuNome, cap, opcoes) {
        var ctx = analisar(livroOuNome, cap);
        if (!ctx) return '';
        var esc = B.ui.esc;
        var aberto = opcoes && opcoes.aberto;

        var blocosHtml = ctx.blocos.map(function (b) {
            var ativo = ctx.capitulo >= b.de && ctx.capitulo <= b.ate;
            var faixa = b.de === b.ate ? 'Cap. ' + b.de : 'Caps. ' + b.de + '–' + b.ate;
            return '<div class="ctx-bloco' + (ativo ? ' is-atual' : '') + '">' +
                '<span class="ctx-bloco-faixa">' + esc(faixa) + (ativo ? ' · VOCÊ ESTÁ AQUI' : '') + '</span>' +
                '<b>' + esc(b.titulo) + '</b>' +
                '</div>';
        }).join('');

        var sincHtml = ctx.sincronismo.map(function (s) {
            var botoes = (s.refs || []).map(function (r) {
                return '<button type="button" class="ctx-ref-chip" data-abrir-ref="' + esc(r) + '">📖 ' + esc(r) + '</button>';
            }).join('');
            return '<div class="ctx-sinc-item">' +
                '<span class="ctx-rotulo">' + esc(s.rotulo) + '</span>' +
                '<p>' + esc(s.texto) + '</p>' +
                (botoes ? '<div class="ctx-refs">' + botoes + '</div>' : '') +
                '</div>';
        }).join('');

        return '<details class="cartao ctx-painel"' + (aberto ? ' open' : '') + '>' +
            '<summary class="ctx-sumario">' +
            '<div class="ctx-sumario-txt">' +
            '<span class="ctx-selo">🔍 Guia Exegético · Raio-X do Capítulo</span>' +
            '<b>' + esc(ctx.alianca.nome) + ' · ' + esc(ctx.genero.nome) + '</b>' +
            '<small>Toque para ver Aliança, Estrutura de ' + esc(ctx.livro.nome) + ', Textos Paralelos e Chave de Leitura</small>' +
            '</div>' +
            '</summary>' +
            '<div class="ctx-corpo">' +

            '<div class="ctx-abas" role="tablist">' +
            '<button type="button" class="ctx-aba is-on" data-ctx-aba="estrutura">📐 Estrutura</button>' +
            '<button type="button" class="ctx-aba" data-ctx-aba="alianca">📜 Aliança & Cristo</button>' +
            '<button type="button" class="ctx-aba" data-ctx-aba="paralelos">🔗 Sincronismo</button>' +
            '<button type="button" class="ctx-aba" data-ctx-aba="genero">🧭 Como Ler</button>' +
            '</div>' +

            '<div class="ctx-secao" data-ctx-painel="estrutura">' +
            '<p class="ctx-tema"><b>Tema de ' + esc(ctx.livro.nome) + ':</b> ' + esc(ctx.temaLivro) + '</p>' +
            '<div class="ctx-blocos">' + blocosHtml + '</div>' +
            '</div>' +

            '<div class="ctx-secao" data-ctx-painel="alianca" hidden>' +
            '<div class="ctx-caixa">' +
            '<span class="ctx-rotulo">Pacto na História da Redenção</span>' +
            '<h4>' + esc(ctx.alianca.nome) + '</h4>' +
            '<p><b>Mediador:</b> ' + esc(ctx.alianca.mediador) + ' · <b>Sinal:</b> ' + esc(ctx.alianca.sinal) + '</p>' +
            '<p><b>A Promessa da Aliança:</b> ' + esc(ctx.alianca.promessa) + '</p>' +
            '<p class="ctx-cristo"><b>✝️ Cumprimento em Cristo:</b> ' + esc(ctx.alianca.cristo) + '</p>' +
            '</div>' +
            '</div>' +

            '<div class="ctx-secao" data-ctx-painel="paralelos" hidden>' +
            '<p class="dica" style="margin-top:0">Toque em qualquer referência abaixo para ler o texto bíblico sem sair desta tela:</p>' +
            sincHtml +
            '</div>' +

            '<div class="ctx-secao" data-ctx-painel="genero" hidden>' +
            '<div class="ctx-caixa">' +
            '<span class="ctx-rotulo">Gênero Literário</span>' +
            '<h4>' + esc(ctx.genero.nome) + '</h4>' +
            '<p><b>Chave de interpretação:</b> ' + esc(ctx.genero.comoLer) + '</p>' +
            '<p><b>Cuidado exegético:</b> ' + esc(ctx.genero.evitar) + '</p>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</details>';
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
    }

    /* Transforma referências bíblicas dentro do HTML de um estudo (ex.: "vv. 1-8",
       "v. 14", "João 3:16", "2 Samuel 7:12-16", "Romanos 8") em links clicáveis
       que abrem o texto bíblico num modal instantâneo. */
    function enriquecerReferencias(prosaEl, livroAtual, capAtual) {
        if (!prosaEl || !livroAtual) return;
        var html = prosaEl.innerHTML;

        /* 1. Transforma "vv. 1-8" ou "v. 14" em botões que abrem os versículos do próprio capítulo */
        html = html.replace(/\b(vv?\.\s*(\d+)(?:\s*[-–a]\s*(\d+))?)\b/gi, function (m, textoInteiro, v1, v2) {
            var ref = livroAtual.nome + ' ' + (capAtual || 1) + ':' + v1 + (v2 ? '-' + v2 : '');
            return '<button type="button" class="ref-inline" data-abrir-ref="' + B.ui.esc(ref) + '">' + textoInteiro + '</button>';
        });

        /* 2. Transforma referências explícitas como "João 3:16", "2 Samuel 7:12-16", "Gn 15:6" */
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
        var rx = new RegExp('(^|[\\s(>])((' + padraoLivros + ')\\s+(\\d{1,3})(?::(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?)(?=[\\s.,;:)\\]<]|$)', 'g');

        html = html.replace(rx, function (m, pre, refCompleta, nomeLiv, capStr, vIni, vFim) {
            return pre + '<button type="button" class="ref-inline" data-abrir-ref="' + B.ui.esc(refCompleta) + '">' + refCompleta + '</button>';
        });

        prosaEl.innerHTML = html;
        ligar(prosaEl, livroAtual, capAtual);
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

        B.texto.capitulo(nomeLivro, cap).then(function (versos) {
            var inicio = vIni ? Math.max(1, vIni) : 1;
            var fim = vFim ? Math.min(versos.length, vFim) : Math.min(versos.length, 15);
            var fatia = [];
            for (var i = inicio; i <= fim; i++) {
                if (versos[i - 1]) {
                    fatia.push('<p class="v-modal"><b>' + i + '</b> ' + B.ui.esc(versos[i - 1]) + '</p>');
                }
            }
            var mais = !vIni && versos.length > 15
                ? '<p class="dica">Mostrando os primeiros 15 de ' + versos.length + ' versículos.</p>'
                : '';

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
        ligar: ligar,
        enriquecerReferencias: enriquecerReferencias,
        abrirReferencia: abrirReferencia
    };
})();
