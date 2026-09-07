/* =========================================================
   O programa de 24 semanas.

   Seis meses, quatro fases. Cada semana tem UM som, UMA
   estrutura, UMA função de conversa e UMA missão no mundo real.
   Um alvo por vez — currículo que ataca tudo ao mesmo tempo
   não muda nada em ninguém.

   A regra que sustenta o programa inteiro: 60 minutos por dia
   em dez blocos, 6 dias por semana, com a boca aberta em pelo
   menos 40 deles.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.fases = [
    {
        id: 1, nome: 'Reconstruir a boca', semanas: '1–6',
        resumo: 'Consertar os sons e, principalmente, o RITMO. Você já sabe inglês; o que trava é a musculatura e a música da língua.',
        entrega: 'Ao fim: nativo entende você na primeira vez, sem pedir para repetir.'
    },
    {
        id: 2, nome: 'Parar de traduzir', semanas: '7–12',
        resumo: 'Automatizar blocos e estruturas até saírem sem pensar. Aqui a fala deixa de ser tradução rápida e vira fala.',
        entrega: 'Ao fim: 10 minutos de conversa sem uma única pausa para procurar palavra.'
    },
    {
        id: 3, nome: 'Aguentar pressão', semanas: '13–18',
        resumo: 'Velocidade real, gente falando junto, discordância, improviso e humor. É onde a vergonha morre de vez.',
        entrega: 'Ao fim: você fala numa reunião de nativos sem ensaiar antes.'
    },
    {
        id: 4, nome: 'Refino quase-nativo', semanas: '19–24',
        resumo: 'Nuance, registro, ironia, sotaque fino e a habilidade de mudar de tom conforme a plateia.',
        entrega: 'Ao fim: as pessoas param de perguntar de onde você é — e passam a perguntar onde você aprendeu.'
    }
];

/* s=semana, som/shadowing/ditado/drill/dialogo/funcao = ids dos bancos */
F.data.curriculo = [
    {
        s: 1, fase: 1, tema: 'O TH e o fim das palavras',
        som: 'th-surdo', shadowing: 'sh-apresentacao', ditado: 'dt-reducoes', drill: 'dr-perfect',
        dialogo: 'dl-cafe-conferencia', funcao: 'quebrar-gelo',
        gramatica: 'Presente simples com advérbio de frequência no lugar certo.',
        meta: 'Falar "I think three things" sem um único S no lugar do TH.',
        missao: 'Grave 60 segundos se apresentando e ouça inteiro. Anote 3 acertos, não 3 erros.'
    },
    {
        s: 2, fase: 1, tema: 'O TH sonoro e a vogal fantasma',
        som: 'epentese', shadowing: 'sh-rotina', ditado: 'dt-flap', drill: 'dr-educado',
        dialogo: 'dl-restaurante', funcao: 'dia-a-dia',
        gramatica: 'Contrações obrigatórias: don\'t, isn\'t, I\'m, we\'ll.',
        meta: 'Dizer "I stopped the truck" com 4 sílabas, não 7.',
        missao: 'Narre sua manhã inteira em voz alta enquanto ela acontece, três dias seguidos.'
    },
    {
        s: 3, fase: 1, tema: 'O schwa — a vogal que carrega o inglês',
        som: 'schwa', shadowing: 'sh-cafe', ditado: 'dt-fracas', drill: 'dr-pergunta',
        dialogo: 'dl-imigracao', funcao: 'suavizar',
        gramatica: 'Artigos: a, an, the ou nada.',
        meta: 'Esmagar toda sílaba fraca: "company" = CÂM-pâ-ni.',
        missao: 'Pegue 10 palavras do seu trabalho e marque a sílaba forte de cada uma.'
    },
    {
        s: 4, fase: 1, tema: 'Ritmo: inglês tem batida',
        som: 'ritmo', shadowing: 'sh-pedir-ajuda', ditado: 'dt-perguntas', drill: 'dr-negativa',
        dialogo: 'dl-farmacia', funcao: 'reagir',
        gramatica: 'Perguntas com auxiliar, sem pausa antes.',
        meta: 'Falar batendo na mesa uma vez por palavra forte, sem perder a batida.',
        missao: 'Faça shadowing com a mão batendo o ritmo. 10 minutos por dia, 6 dias.'
    },
    {
        s: 5, fase: 1, tema: 'ship × sheep e o S inicial',
        som: 'i-longo-curto', shadowing: 'sh-primeiro-dia', ditado: 'dt-ligacao', drill: 'dr-condicional',
        dialogo: 'dl-academia', funcao: 'reagir',
        gramatica: 'There is / there are (nada de "it has").',
        meta: 'Acertar 18 de 20 num teste cego de pares mínimos.',
        missao: 'Mande um áudio de 1 minuto em inglês para alguém. Sem regravar.'
    },
    {
        s: 6, fase: 1, tema: 'L final, H e R — os três traidores',
        som: 'l-final', shadowing: 'sh-medico-sh', ditado: 'dt-flap', drill: 'dr-passado',
        dialogo: 'dl-academia-primeira-aula', funcao: 'opiniao',
        gramatica: 'Comparativos e superlativos na fala espontânea.',
        meta: 'Dizer "All the people will call" com a língua colada no céu da boca.',
        missao: 'Regrave a apresentação da semana 1 e compare lado a lado. A diferença vai te assustar.'
    },

    {
        s: 7, fase: 2, tema: 'Present perfect no automático',
        som: 'ed', shadowing: 'sh-elevador', ditado: 'dt-trabalho', drill: 'dr-phrasal',
        dialogo: 'dl-cabeleireiro', funcao: 'reuniao',
        gramatica: 'Present perfect × passado simples, sem pensar.',
        meta: 'Nunca mais dizer "I am here since Monday".',
        missao: 'Relate seu dia de trabalho em 30 segundos, todo dia, gravado.'
    },
    {
        s: 8, fase: 2, tema: 'Blocos de reunião',
        som: 's-final', shadowing: 'sh-pedido-telefone', ditado: 'dt-trabalho', drill: 'dr-reacao',
        dialogo: 'dl-standup', funcao: 'reuniao',
        gramatica: 'Modais de sugestão: should, could, might.',
        meta: 'Vinte chunks de reunião saindo sem tradução.',
        missao: 'Numa reunião real (ou simulada), fale 5 vezes. Conte.'
    },
    {
        s: 9, fase: 2, tema: 'Ganhar tempo sem travar',
        som: 'palatalizacao', shadowing: 'sh-crianca', ditado: 'dt-perguntas', drill: 'dr-ganhar-tempo',
        dialogo: 'dl-entrevista', funcao: 'ganhar-tempo',
        gramatica: 'Ordem das palavras em perguntas indiretas.',
        meta: 'Zero "hummm" em português numa conversa de 10 minutos.',
        missao: 'Primeira conversa por voz com um estranho num app de idiomas.'
    },
    {
        s: 10, fase: 2, tema: 'Contar história',
        som: 'v-w', shadowing: 'sh-opiniao-remoto', ditado: 'dt-filme', drill: 'dr-relativa',
        dialogo: 'dl-vizinho', funcao: 'historia',
        gramatica: 'Passado simples × contínuo na narrativa.',
        meta: 'Contar um perrengue de 2 minutos que faça alguém reagir.',
        missao: 'Conversa de 20 minutos sem uma palavra em português. Regra SYL.'
    },
    {
        s: 11, fase: 2, tema: 'Opinar e sustentar',
        som: 'ae', shadowing: 'sh-reuniao', ditado: 'dt-academico', drill: 'dr-hedge',
        dialogo: 'dl-medico', funcao: 'opiniao',
        gramatica: 'Frases longas com relativas — sair da fala picotada.',
        meta: 'Sustentar uma opinião por 90 segundos sem repetir argumento.',
        missao: 'Primeira conversa com um nativo. Anote quanto por cento você entendeu.'
    },
    {
        s: 12, fase: 2, tema: 'Phrasal verbs no lugar do formal',
        som: 'ng', shadowing: 'sh-entrevista', ditado: 'dt-filme', drill: 'dr-reported',
        dialogo: 'dl-emergencia', funcao: 'phrasal',
        gramatica: 'Phrasal verbs separáveis e inseparáveis, na fala.',
        meta: 'Trocar 15 verbos formais por phrasais sem esforço.',
        missao: 'Peça uma informação em inglês para um estranho, você começando a conversa.'
    },

    {
        s: 13, fase: 3, tema: 'Velocidade real',
        som: 'ligacao', shadowing: 'sh-historia', ditado: 'dt-filme', drill: 'dr-numeros',
        dialogo: 'dl-carro', funcao: 'informal',
        gramatica: 'Fala conectada como produção, não só como escuta.',
        meta: 'Entender uma série sem legenda, com 80% de compreensão.',
        missao: 'Assista 3 episódios sem legenda nenhuma. Anote o que perdeu.'
    },
    {
        s: 14, fase: 3, tema: 'Discordar sem brigar',
        som: 'th-sonoro', shadowing: 'sh-telefone', ditado: 'dt-academico', drill: 'dr-cortar',
        dialogo: 'dl-cancelou', funcao: 'concordar',
        gramatica: 'Concessão: "I see your point, but...".',
        meta: 'Discordar três vezes numa conversa sem ninguém se ofender.',
        missao: 'Discorde de alguém em inglês e sustente por 2 minutos.'
    },
    {
        s: 15, fase: 3, tema: 'Cliente difícil e conflito',
        som: 'ritmo', shadowing: 'sh-reclamar', ditado: 'dt-trabalho', drill: 'dr-linking',
        dialogo: 'dl-tarefa', funcao: 'suavizar',
        gramatica: 'Condicionais 1 e 2 em velocidade.',
        meta: 'Dar uma notícia ruim sem soar frio nem covarde.',
        missao: 'Numa reunião real, interrompa alguém educadamente. Uma vez basta.'
    },
    {
        s: 16, fase: 3, tema: 'Negociar',
        som: 'cluster-s', shadowing: 'sh-feedback-bom', ditado: 'dt-numeros', drill: 'dr-artigos',
        dialogo: 'dl-louca', funcao: 'negociar',
        gramatica: 'Condicional 2 e 3 para propor e lamentar.',
        meta: 'Negociar preço e prazo sem ceder na primeira resistência.',
        missao: 'Simule uma negociação real gravando os dois lados.'
    },
    {
        s: 17, fase: 3, tema: 'Falar em público',
        som: 'schwa', shadowing: 'sh-atraso', ditado: 'dt-academico', drill: 'dr-preposicoes',
        dialogo: 'dl-banco-cobranca', funcao: 'reuniao',
        gramatica: 'Ênfase contrastiva: mudar o sentido pela sílaba forte.',
        meta: 'Apresentar 5 minutos sem ler nada.',
        missao: 'Apresente para um grupo, ao vivo. Sem slide com texto.'
    },
    {
        s: 18, fase: 3, tema: 'Improviso sob fogo',
        som: 'h-r', shadowing: 'sh-chamada-ruim', ditado: 'dt-sotaques', drill: 'dr-stress',
        dialogo: 'dl-convite', funcao: 'ganhar-tempo',
        gramatica: 'Perguntas hostis: reformular antes de responder.',
        meta: 'Responder 5 perguntas difíceis sem travar em nenhuma.',
        missao: 'Peça para alguém te sabatinar por 10 minutos, sem aviso dos temas.'
    },

    {
        s: 19, fase: 4, tema: 'Registro: formal, neutro, íntimo',
        som: 'ligacao', shadowing: 'sh-agradecimento', ditado: 'dt-filme', drill: 'dr-small-talk',
        dialogo: 'dl-recusar', funcao: 'informal',
        gramatica: 'A mesma ideia em três registros diferentes.',
        meta: 'Dizer a mesma frase para um CEO, um colega e um amigo.',
        missao: 'Reescreva e grave três versões da mesma mensagem.'
    },
    {
        s: 20, fase: 4, tema: 'Humor e ironia',
        som: 'ritmo', shadowing: 'sh-aula', ditado: 'dt-filme', drill: 'dr-futuro',
        dialogo: 'dl-devolucao', funcao: 'idiomatico',
        gramatica: 'Understatement e sarcasmo por entonação.',
        meta: 'Fazer um nativo rir de uma piada sua. Uma vez que seja.',
        missao: 'Conte uma história engraçada para alguém e observe onde riram.'
    },
    {
        s: 21, fase: 4, tema: 'Sotaques que não são o seu',
        som: 'i-longo-curto', shadowing: 'sh-aluguel', ditado: 'dt-sotaques', drill: 'dr-passiva',
        dialogo: 'dl-hotel-problema', funcao: 'esclarecer',
        gramatica: 'Britânico × americano: vocabulário e pronúncia.',
        meta: 'Entender indiano, escocês e australiano sem pânico.',
        missao: 'Ouça 30 minutos de podcast de cada sotaque, e resuma em inglês.'
    },
    {
        s: 22, fase: 4, tema: 'Precisão: a palavra exata',
        som: 'ae', shadowing: 'sh-networking', ditado: 'dt-academico', drill: 'dr-tag',
        dialogo: 'dl-escola-filho', funcao: 'conectores',
        gramatica: 'Colocações: qual palavra anda com qual.',
        meta: 'Trocar "very big" por "massive", "huge", "enormous" com critério.',
        missao: 'Pegue um texto seu e substitua 20 palavras genéricas por precisas.'
    },
    {
        s: 23, fase: 4, tema: 'Pensar em inglês o dia inteiro',
        som: 'schwa', shadowing: 'sh-plano', ditado: 'dt-academico', drill: 'dr-arrependimento',
        dialogo: 'dl-viagem-perdeu-voo', funcao: 'historia',
        gramatica: 'Discurso indireto para relatar reunião inteira.',
        meta: 'Oito horas seguidas sem pensar uma frase em português.',
        missao: 'Um dia inteiro de imersão total. Telefone, notas, monólogo interno.'
    },
    {
        s: 24, fase: 4, tema: 'Ensinar em inglês — a prova final',
        som: 'ritmo', shadowing: 'sh-ligacao-ruim', ditado: 'dt-sotaques', drill: 'dr-ing-infinitivo',
        dialogo: 'dl-suporte-tecnico', funcao: 'reuniao',
        gramatica: 'Tudo junto, sem foco isolado. É o teste.',
        meta: 'Trinta minutos ensinando algo real, para gente real, em inglês.',
        missao: 'Dê uma aula, um treinamento ou um tutorial ao vivo. Grave. Compare com a semana 1.'
    }
];
