/* =========================================================
   O segundo semestre — semanas 25 a 48.

   A primeira metade constrói a fala. A segunda tira o apoio:
   velocidade real, gente falando junto, assunto que você não
   escolheu e situação em que errar custa alguma coisa.

   Aqui as semanas param de introduzir sons novos — os 16 já
   foram todos — e passam a usar o som como manutenção,
   enquanto o alvo se desloca para função, registro e nuance.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.fases = F.data.fases.concat([
    {
        id: 5, nome: 'Velocidade real', semanas: '25–30',
        resumo: 'Tudo o que já funciona, agora rápido: nativo relaxado, sotaque diferente, duas pessoas falando ao mesmo tempo.',
        entrega: 'Ao fim: você entende conversa entre nativos que não estão falando com você.'
    },
    {
        id: 6, nome: 'Domínio profissional', semanas: '31–36',
        resumo: 'O inglês que decide carreira: conduzir reunião, negociar salário, dar notícia ruim, defender orçamento.',
        entrega: 'Ao fim: você conduz uma reunião de trinta minutos com nativos, sem ensaio.'
    },
    {
        id: 7, nome: 'Nuance e cultura', semanas: '37–42',
        resumo: 'Humor, ironia, registro e a arte de falar do nada por vinte minutos. É onde o quase-nativo se separa do avançado.',
        entrega: 'Ao fim: você faz um nativo rir de uma piada sua, e entende as dele.'
    },
    {
        id: 8, nome: 'Autonomia', semanas: '43–48',
        resumo: 'O programa se desmonta: você escolhe o tema, corrige o próprio erro e ensina em inglês. Sai do app.',
        entrega: 'Ao fim: o inglês deixou de ser matéria de estudo e virou ferramenta de trabalho.'
    }
]);

F.data.curriculo = F.data.curriculo.concat([

    /* ---------- fase 5: velocidade real ---------- */
    {
        s: 25, fase: 5, tema: 'Fala colada em velocidade de nativo',
        som: 'ligacao', shadowing: 'sh-contando-historia', ditado: 'dt-conversa-rapida', drill: 'dr-comparativo',
        dialogo: 'dl-alugar-apartamento', funcao: 'informal',
        gramatica: 'Produzir as reduções, não só reconhecê-las.',
        meta: 'Falar "whaddaya gonna do" sem pensar, e ouvir isso sem travar.',
        missao: 'Assista 3 horas de conteúdo sem legenda e anote 20 trechos que você precisou repetir.'
    },
    {
        s: 26, fase: 5, tema: 'Sotaques que não são o do curso',
        som: 'i-longo-curto', shadowing: 'sh-instrucoes', ditado: 'dt-britanico', drill: 'dr-quantificador',
        dialogo: 'dl-perdeu-carteira', funcao: 'viagem',
        gramatica: 'Vocabulário britânico × americano no dia a dia.',
        meta: 'Entender o mesmo texto lido por três sotaques diferentes.',
        missao: 'Ouça 30 minutos de podcast britânico, 30 de indiano e 30 de australiano.'
    },
    {
        s: 27, fase: 5, tema: 'Telefone e áudio ruim',
        som: 'epentese', shadowing: 'sh-cliente-dificil', ditado: 'dt-recado', drill: 'dr-indireta',
        dialogo: 'dl-jantar-na-casa', funcao: 'burocracia',
        gramatica: 'Soletrar, confirmar número e repetir sem irritar.',
        meta: 'Resolver um problema por telefone, do começo ao fim, sem trocar para o português.',
        missao: 'Ligue para um serviço internacional e resolva algo real — nem que seja uma dúvida.'
    },
    {
        s: 28, fase: 5, tema: 'Emergência e saúde',
        som: 'th-surdo', shadowing: 'sh-tecnico', ditado: 'dt-medico-escuta', drill: 'dr-so-neither',
        dialogo: 'dl-feedback', funcao: 'saude',
        gramatica: 'Imperativo e instruções curtas sob pressão.',
        meta: 'Passar local, situação e estado de alguém em menos de 30 segundos.',
        missao: 'Grave a si mesmo relatando três emergências diferentes. Ouça e corte o excesso.'
    },
    {
        s: 29, fase: 5, tema: 'Números, datas e dinheiro em velocidade',
        som: 'ritmo', shadowing: 'sh-negociacao', ditado: 'dt-numeros', drill: 'dr-usedto',
        dialogo: 'dl-pitch', funcao: 'dinheiro',
        gramatica: 'Aproximação: roughly, give or take, a fraction of.',
        meta: 'Falar valores, porcentagens e datas sem desacelerar a frase.',
        missao: 'Apresente um orçamento real de 3 minutos, com números, em inglês.'
    },
    {
        s: 30, fase: 5, tema: 'Conversa cruzada: três pessoas falando',
        som: 'ligacao', shadowing: 'sh-apresentacao-publica', ditado: 'dt-conversa-rapida', drill: 'dr-sugerir',
        dialogo: 'dl-conflito', funcao: 'reagir',
        gramatica: 'Entrar e sair do turno sem atropelar.',
        meta: 'Participar de uma conversa com dois ou mais nativos e falar cinco vezes.',
        missao: 'Entre numa conversa em grupo (online ou presencial) e não fique calado.'
    },

    /* ---------- fase 6: domínio profissional ---------- */
    {
        s: 31, fase: 6, tema: 'Conduzir uma reunião inteira',
        som: 'schwa', shadowing: 'sh-social', ditado: 'dt-negocios-escuta', drill: 'dr-colocacao',
        dialogo: 'dl-networking', funcao: 'reuniao',
        gramatica: 'Sinalização de discurso: first, before we move on, to recap.',
        meta: 'Abrir, distribuir a palavra, cortar quem se estende e fechar com ações.',
        missao: 'Conduza uma reunião de 30 minutos em inglês, do começo ao fim.'
    },
    {
        s: 32, fase: 6, tema: 'Delegar e cobrar',
        som: 's-final', shadowing: 'sh-noticia', ditado: 'dt-trabalho', drill: 'dr-clarificar',
        dialogo: 'dl-fofoca', funcao: 'lideranca',
        gramatica: 'Pedido indireto e cobrança educada.',
        meta: 'Cobrar um atraso sem soar agressivo nem covarde.',
        missao: 'Peça três coisas a três pessoas em inglês, cada uma num registro diferente.'
    },
    {
        s: 33, fase: 6, tema: 'Dar notícia ruim',
        som: 'l-final', shadowing: 'sh-discordar', ditado: 'dt-negocios-escuta', drill: 'dr-adjetivos',
        dialogo: 'dl-aumento', funcao: 'suavizar',
        gramatica: 'Suavizadores em cadeia sem perder a informação.',
        meta: 'Anunciar um atraso assumindo responsabilidade e propondo saída.',
        missao: 'Comunique um problema real ao seu time em inglês, por escrito e falado.'
    },
    {
        s: 34, fase: 6, tema: 'Negociar salário',
        som: 'ritmo', shadowing: 'sh-orcamento', ditado: 'dt-numeros', drill: 'dr-plural-irregular',
        dialogo: 'dl-desconto', funcao: 'dinheiro',
        gramatica: 'Condicionais de negociação e o uso do silêncio.',
        meta: 'Dizer o seu número e ficar calado depois.',
        missao: 'Simule a conversa com alguém que faça o papel duro. Grave e ouça.'
    },
    {
        s: 35, fase: 6, tema: 'Apresentar para plateia',
        som: 'schwa', shadowing: 'sh-podcast', ditado: 'dt-palestra', drill: 'dr-telefone-rapido',
        dialogo: 'dl-politica', funcao: 'apresentar',
        gramatica: 'Ênfase contrastiva e pausa dramática.',
        meta: 'Dez minutos de apresentação sem ler nada.',
        missao: 'Apresente ao vivo para um grupo. Peça que perguntem no fim.'
    },
    {
        s: 36, fase: 6, tema: 'Conflito no trabalho',
        som: 'th-sonoro', shadowing: 'sh-cliente-convencer', ditado: 'dt-negocios-escuta', drill: 'dr-perfect',
        dialogo: 'dl-tecnica', funcao: 'conflito',
        gramatica: 'Discurso indireto para relatar o que foi combinado.',
        meta: 'Discordar de alguém sênior em público sem virar confronto.',
        missao: 'Leve uma discordância real para uma reunião real, em inglês.'
    },

    /* ---------- fase 7: nuance e cultura ---------- */
    {
        s: 37, fase: 7, tema: 'Small talk longo, sem morrer no segundo turno',
        som: 'h-r', shadowing: 'sh-noticia-tech', ditado: 'dt-cotidiano', drill: 'dr-educado',
        dialogo: 'dl-bug-leigo', funcao: 'quebrar-gelo',
        gramatica: 'Devolver a bola: detalhe + pergunta, sempre.',
        meta: 'Vinte minutos de conversa fiada sem silêncio constrangedor.',
        missao: 'Converse 20 minutos com um estranho sobre nada em particular.'
    },
    {
        s: 38, fase: 7, tema: 'Contar história com timing',
        som: 'ritmo', shadowing: 'sh-piada', ditado: 'dt-filme', drill: 'dr-pergunta',
        dialogo: 'dl-cliente-internacional', funcao: 'historia',
        gramatica: 'Tempo verbal na narrativa e a virada guardada para o fim.',
        meta: 'Contar um causo de 3 minutos e prender a atenção até o fim.',
        missao: 'Conte a mesma história para três pessoas diferentes. Melhore a cada vez.'
    },
    {
        s: 39, fase: 7, tema: 'Humor e ironia',
        som: 'ligacao', shadowing: 'sh-retro', ditado: 'dt-filme', drill: 'dr-negativa',
        dialogo: 'dl-mentoria', funcao: 'humor',
        gramatica: 'Understatement, sarcasmo e a entonação que os carrega.',
        meta: 'Fazer alguém rir e perceber quando estão brincando com você.',
        missao: 'Assista stand-up sem legenda e anote 10 piadas que você entendeu — e por quê.'
    },
    {
        s: 40, fase: 7, tema: 'Registro: com o CEO, com o colega, com o amigo',
        som: 'palatalizacao', shadowing: 'sh-desculpa-grave', ditado: 'dt-britanico', drill: 'dr-condicional',
        dialogo: 'dl-apresentacao-perguntas', funcao: 'discurso',
        gramatica: 'A mesma ideia em três registros.',
        meta: 'Dizer a mesma coisa de três formas, conforme quem ouve.',
        missao: 'Escreva e grave três versões da mesma mensagem para três públicos.'
    },
    {
        s: 41, fase: 7, tema: 'Relações: aproximar, recusar, reconciliar',
        som: 'ae', shadowing: 'sh-debate-quente', ditado: 'dt-cotidiano', drill: 'dr-passado',
        dialogo: 'dl-negociando-prazo', funcao: 'relacionamento',
        gramatica: 'Pedidos, recusas e desculpas com calor humano.',
        meta: 'Recusar um convite sem magoar e pedir desculpa sem se destruir.',
        missao: 'Faça um convite real em inglês. E recuse um, com elegância.'
    },
    {
        s: 42, fase: 7, tema: 'Cultura: esporte, série, música, notícia',
        som: 'ng', shadowing: 'sh-despedida', ditado: 'dt-jogo', drill: 'dr-phrasal',
        dialogo: 'dl-time-remoto-conflito', funcao: 'cultura',
        gramatica: 'Opinar sobre gosto sem repetir "I like".',
        meta: 'Sustentar 10 minutos sobre um filme, um jogo ou um álbum.',
        missao: 'Discuta um jogo ou uma série com alguém que discorda de você.'
    },

    /* ---------- fase 8: autonomia ---------- */
    {
        s: 43, fase: 8, tema: 'Explicar o que é difícil',
        som: 'schwa', shadowing: 'sh-salario', ditado: 'dt-palestra', drill: 'dr-reacao',
        dialogo: 'dl-medico-segunda-opiniao', funcao: 'ensinar-f',
        gramatica: 'Analogia, checagem de compreensão e simplificação.',
        meta: 'Explicar algo técnico do seu trabalho para uma criança e para um diretor.',
        missao: 'Grave duas explicações do mesmo assunto, para os dois públicos.'
    },
    {
        s: 44, fase: 8, tema: 'Improviso sob fogo cruzado',
        som: 'h-r', shadowing: 'sh-discordando-educado', ditado: 'dt-academico', drill: 'dr-ganhar-tempo',
        dialogo: 'dl-aviao-vizinho', funcao: 'ganhar-tempo',
        gramatica: 'Reformular a pergunta antes de responder.',
        meta: 'Aguentar dez perguntas difíceis seguidas sem travar em nenhuma.',
        missao: 'Peça uma sabatina de 15 minutos a alguém, sem saber os temas.'
    },
    {
        s: 45, fase: 8, tema: 'Precisão: a palavra exata',
        som: 'i-longo-curto', shadowing: 'sh-mau-humor', ditado: 'dt-academico', drill: 'dr-relativa',
        dialogo: 'dl-garantia-negada', funcao: 'quantidade',
        gramatica: 'Colocações e a diferença entre sinônimos.',
        meta: 'Trocar 30 palavras genéricas por precisas na sua própria fala.',
        missao: 'Transcreva 5 minutos da sua fala gravada e reescreva com precisão.'
    },
    {
        s: 46, fase: 8, tema: 'Um dia inteiro em inglês',
        som: 'ritmo', shadowing: 'sh-negociando', ditado: 'dt-cotidiano', drill: 'dr-hedge',
        dialogo: 'dl-vender-sua-ideia', funcao: 'dia-a-dia',
        gramatica: 'Nenhum foco: é o teste de tudo junto.',
        meta: 'Doze horas sem pensar uma frase em português.',
        missao: 'Imersão total de um dia: pensamento, notas, telefone, monólogo interno.'
    },
    {
        s: 47, fase: 8, tema: 'Ensinar em inglês',
        som: 'schwa', shadowing: 'sh-noticia-radio', ditado: 'dt-palestra', drill: 'dr-reported',
        dialogo: 'dl-condolencias', funcao: 'ensinar-f',
        gramatica: 'Instrução, checagem e correção do outro.',
        meta: 'Trinta minutos ensinando algo real para gente real.',
        missao: 'Dê uma aula, um treinamento ou um tutorial ao vivo, em inglês.'
    },
    {
        s: 48, fase: 8, tema: 'O teste do ano',
        som: 'ritmo', shadowing: 'sh-podcast-opiniao', ditado: 'dt-conversa-rapida', drill: 'dr-numeros',
        dialogo: 'dl-recrutador-salario', funcao: 'discurso',
        gramatica: 'Tudo. Sem foco, sem apoio, sem aviso.',
        meta: 'Comparar a gravação de hoje com a da semana 1 — a única avaliação que não mente.',
        missao: 'Refaça a gravação de 90 segundos da semana 1, ouça as duas seguidas e escreva o que mudou. Depois escolha: recomeçar o ciclo num nível mais alto, ou seguir sem o app.'
    }
]);
