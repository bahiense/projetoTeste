/* =========================================================
   Cenários de oração pública.

   Cada um traz a leitura do momento que o Módulo 8 pede — quem,
   o quê, necessidade — como *referência*, não como resposta certa:
   o app mostra depois que a pessoa já orou, para comparar com o que
   ela mesma percebeu. Mostrar antes seria entregar a oração pronta,
   que é exatamente o que o método não quer.

   pressao: 1 tranquilo, 2 pede jogo de cintura, 3 pesado de verdade.
   Não há duração: a oração acaba quando o assunto acaba.
   ========================================================= */
window.A = window.A || {};

A.CENARIOS = [
    {
        id: 'culto-abertura',
        contexto: 'Culto',
        titulo: 'Abrir o culto de domingo',
        cena: 'A congregação chegou de uma semana agitada. O culto vai começar e o pastor chama você para abrir em oração.',
        quem: 'A congregação inteira — gente que veio de semanas muito diferentes.',
        oque: 'O início de um encontro coletivo.',
        necessidade: 'Consagrar o momento, convidar Deus a governar o culto, acolher quem chegou cansado.',
        primeiro: 'Reconheça o momento coletivo antes de pedir qualquer coisa.',
        pressao: 1
    },
    {
        id: 'culto-oferta',
        contexto: 'Culto',
        titulo: 'Oração da oferta',
        cena: 'O pastor pede que você ore antes da coleta da oferta.',
        quem: 'A congregação, incluindo quem está apertado financeiramente.',
        oque: 'Um ato de entrega no meio do culto.',
        necessidade: 'Consagrar o ato, agradecer a fidelidade de Deus, orientar os corações para a generosidade sem constranger ninguém.',
        primeiro: 'Comece por gratidão pelo que já foi provido, não por pedido.',
        pressao: 1
    },
    {
        id: 'culto-encerrar',
        contexto: 'Culto',
        titulo: 'Encerrar o culto',
        cena: 'A palavra terminou. Pedem que você encerre em oração antes da bênção final.',
        quem: 'Pessoas que acabaram de ouvir a mensagem e vão voltar para a semana.',
        oque: 'O fim de um encontro e o começo da semana.',
        necessidade: 'Que o que foi ouvido não fique só na sala; força para a semana que começa.',
        primeiro: 'Ligue a oração ao que acabou de ser dito na mensagem.',
        pressao: 1
    },
    {
        id: 'culto-surpresa',
        contexto: 'Culto',
        titulo: 'Chamado de surpresa no meio do culto',
        cena: 'Alguém aponta para você no meio do culto: "vamos pedir para você fazer a oração".',
        quem: 'A congregação, e os olhos todos em você.',
        oque: 'Um convite sem aviso.',
        necessidade: 'Um primeiro movimento, só isso. O resto vem depois dele.',
        primeiro: 'Respire. Volte ao propósito: por que estamos aqui? Comece.',
        pressao: 3
    },
    {
        id: 'celula-abrir',
        contexto: 'Célula',
        titulo: 'Abrir o encontro da célula',
        cena: 'O grupo acabou de se sentar na sala. Pedem que você abra.',
        quem: 'Um grupo pequeno, gente que se conhece.',
        oque: 'O começo de um encontro depois de um dia de trabalho.',
        necessidade: 'Que as pessoas larguem o peso da semana e estejam presentes ali.',
        primeiro: 'Nomeie o que o grupo trouxe: cansaço, correria, alívio de estar ali.',
        pressao: 1
    },
    {
        id: 'celula-encerrar',
        contexto: 'Célula',
        titulo: 'Encerrar o encontro do grupo',
        cena: 'Alguém diz: "você pode encerrar nosso encontro em oração?" Você não sabia que seria chamado.',
        quem: 'O grupo, com tudo o que foi compartilhado ali.',
        oque: 'O fecho de uma conversa que teve conteúdo real.',
        necessidade: 'Recolher diante de Deus o que foi dito, sem repetir tudo.',
        primeiro: 'Pegue o assunto que mais pesou na conversa e comece por ele.',
        pressao: 2
    },
    {
        id: 'celula-enfermo',
        contexto: 'Célula',
        titulo: 'Orar por alguém doente do grupo',
        cena: 'Alguém da célula está doente e o grupo pede que você ore por essa pessoa agora.',
        quem: 'A pessoa enferma e a família dela, e o grupo que se importa.',
        oque: 'Uma enfermidade concreta, com medo em volta.',
        necessidade: 'Cura, mas também descanso e presença — e conforto para quem cuida.',
        primeiro: 'Fale ao Deus que conhece o corpo e a história dessa pessoa.',
        pressao: 2
    },
    {
        id: 'familia-decisao',
        contexto: 'Família',
        titulo: 'Família diante de uma decisão',
        cena: 'Uma família está diante de uma escolha grande e pede que você ore antes de encerrar o encontro.',
        quem: 'Pais, filhos, quem mais está na decisão.',
        oque: 'Uma escolha que muda o futuro e que ninguém tem certeza de como fazer.',
        necessidade: 'Sabedoria, clareza e paz enquanto a resposta não vem.',
        primeiro: 'Reconheça o peso da escolha sem dramatizar.',
        pressao: 2
    },
    {
        id: 'familia-refeicao',
        contexto: 'Família',
        titulo: 'Agradecer antes da refeição',
        cena: 'A mesa está posta, todos de pé, e pedem que você agradeça.',
        quem: 'A família e as visitas.',
        oque: 'Um momento simples e curto.',
        necessidade: 'Gratidão concreta — e brevidade com intenção.',
        primeiro: 'Uma ideia só, bem conectada ao momento. Curta e inteira basta.',
        pressao: 1
    },
    {
        id: 'familia-conflito',
        contexto: 'Família',
        titulo: 'Família em conflito',
        cena: 'Há uma tensão antiga na família e pedem oração — com as pessoas envolvidas na sala.',
        quem: 'Pessoas magoadas, que estão se ouvindo.',
        oque: 'Um conflito real que você não vai resolver com palavras.',
        necessidade: 'Humildade para ouvir, coragem para pedir perdão, paciência.',
        primeiro: 'Não tome partido nem exponha ninguém. Fale ao Deus que conhece os dois lados.',
        cuidado: 'Nada de indiretas. Uma oração nunca deve ser um recado.',
        pressao: 3
    },
    {
        id: 'familia-viagem',
        contexto: 'Família',
        titulo: 'Antes de uma viagem',
        cena: 'A família vai pegar a estrada e pedem uma oração antes de sair.',
        quem: 'Quem vai e quem fica.',
        oque: 'Uma partida, com a ansiedade que ela traz.',
        necessidade: 'Proteção na estrada, calma no caminho, reencontro.',
        primeiro: 'Curta e específica: entrada e saída, ida e volta.',
        pressao: 1
    },
    {
        id: 'hospital-visita',
        contexto: 'Hospital',
        titulo: 'Visita ao enfermo',
        cena: 'Você está no quarto do hospital com a família em volta. "Você pode fazer uma oração?"',
        quem: 'A pessoa internada, a família cansada, talvez alguém da equipe ouvindo.',
        oque: 'Dor real, cansaço real, medo real.',
        necessidade: 'Presença, força, consolo, esperança — e descanso para quem está cuidando.',
        primeiro: 'Reconheça o peso do momento sem dramatizar.',
        cuidado: 'Não explique a doença, não invente diagnóstico, não prometa resultado. Ore pelo que é seguro afirmar.',
        pressao: 3
    },
    {
        id: 'hospital-cirurgia',
        contexto: 'Hospital',
        titulo: 'Antes de uma cirurgia',
        cena: 'A cirurgia é daqui a pouco. A família está no corredor e pede que você ore.',
        quem: 'O paciente, a família, a equipe médica.',
        oque: 'Uma espera com medo dentro.',
        necessidade: 'Calma agora, mãos firmes para quem opera, esperança para quem espera.',
        primeiro: 'Nomeie a espera. É o que todos estão vivendo neste minuto.',
        cuidado: 'Não prometa o resultado da cirurgia.',
        pressao: 3
    },
    {
        id: 'velorio',
        contexto: 'Luto',
        titulo: 'Oração no velório',
        cena: 'A família está reunida diante da perda e pedem que você ore.',
        quem: 'Quem perdeu alguém, e quem não sabe o que dizer.',
        oque: 'Uma dor que não tem solução hoje.',
        necessidade: 'Presença, consolo, memória — e permissão para chorar.',
        primeiro: 'Não tente explicar a perda. Fique perto e fale ao Deus de toda consolação.',
        cuidado: 'Nada de justificar a morte nem de discursar. Curto e verdadeiro.',
        pressao: 3
    },
    {
        id: 'luto-domingo',
        contexto: 'Luto',
        titulo: 'A igreja que perdeu alguém',
        cena: 'A congregação se reúne no domingo depois da morte de um irmão da igreja.',
        quem: 'Toda a comunidade, e a família enlutada na primeira fileira.',
        oque: 'Uma ausência que todos sentem no mesmo lugar.',
        necessidade: 'Consolo coletivo, gratidão pela vida, amparo para a família.',
        primeiro: 'Nomeie a ausência com cuidado, sem transformar em discurso.',
        pressao: 3
    },
    {
        id: 'casamento',
        contexto: 'Celebração',
        titulo: 'Oração pelo casal no casamento',
        cena: 'Cerimônia de casamento, todos olhando. "Você poderia orar pelo casal?"',
        quem: 'O casal, as duas famílias, os amigos — e gente que não é da igreja.',
        oque: 'O começo de uma nova família diante de Deus e das pessoas.',
        necessidade: 'Sabedoria e direção para o caminho à frente, não só bênção genérica.',
        primeiro: 'Nomeie o momento como sagrado e inclua os presentes.',
        pressao: 2
    },
    {
        id: 'batismo',
        contexto: 'Celebração',
        titulo: 'Oração no batismo',
        cena: 'Alguém vai descer às águas e pedem que você ore antes.',
        quem: 'Quem está sendo batizado, a família, a igreja.',
        oque: 'Uma decisão pública sendo selada.',
        necessidade: 'Firmeza para o que vem depois da festa.',
        primeiro: 'Fale da decisão, não do evento.',
        pressao: 1
    },
    {
        id: 'aniversario',
        contexto: 'Celebração',
        titulo: 'Aniversário na casa de alguém',
        cena: 'Sala cheia, bolo na mesa, e pedem que você ore pelo aniversariante.',
        quem: 'O aniversariante e gente de todo tipo — nem todos da igreja.',
        oque: 'Uma celebração leve.',
        necessidade: 'Gratidão pela vida, e uma linguagem que não constranja ninguém.',
        primeiro: 'Agradeça por algo específico dessa pessoa, não por "mais um ano".',
        pressao: 1
    },
    {
        id: 'bebe',
        contexto: 'Celebração',
        titulo: 'Apresentação de uma criança',
        cena: 'Um casal apresenta o filho na igreja e pedem sua oração.',
        quem: 'Os pais, a criança, os avós, a congregação.',
        oque: 'O começo de uma criação, com todo o cansaço e a alegria juntos.',
        necessidade: 'Sabedoria para os pais, cobertura para a criança, apoio da comunidade.',
        primeiro: 'Fale primeiro dos pais: são eles que vão carregar o dia a dia.',
        pressao: 1
    },
    {
        id: 'reuniao-lideranca',
        contexto: 'Reunião',
        titulo: 'Encerrar uma reunião de liderança',
        cena: 'A reunião terminou com decisões tomadas e responsabilidades distribuídas.',
        quem: 'Os líderes, cada um com uma tarefa nas mãos.',
        oque: 'Decisões que já foram tomadas e agora precisam ser executadas.',
        necessidade: 'Sabedoria para executar e unidade para sustentar o que foi decidido.',
        primeiro: 'Entregue o que foi discutido — nomeie, sem repetir a pauta inteira.',
        pressao: 1
    },
    {
        id: 'reuniao-trabalho',
        contexto: 'Reunião',
        titulo: 'Reunião de trabalho com pessoas de outras crenças',
        cena: 'Fim de uma reunião de equipe. Pedem que você faça uma oração. Nem todos ali são cristãos.',
        quem: 'Profissionais, com fés diferentes e nenhuma.',
        oque: 'Um ambiente de trabalho, não um culto.',
        necessidade: 'Direção para as decisões, respeito por quem está ouvindo.',
        primeiro: 'Linguagem objetiva, sem jargão religioso pesado. Curta.',
        cuidado: 'Ninguém deve sair dali constrangido. Serviço, não pregação.',
        pressao: 2
    },
    {
        id: 'projeto-novo',
        contexto: 'Reunião',
        titulo: 'Começo de um projeto da igreja',
        cena: 'A igreja vai começar algo novo e pedem oração de consagração.',
        quem: 'A congregação, os líderes, quem vai trabalhar nisso.',
        oque: 'Um começo, com fé sendo exercitada e conta para pagar.',
        necessidade: 'Que o projeto pertença a Deus e não à ansiedade de ninguém.',
        primeiro: 'Consagre antes de pedir resultado.',
        pressao: 1
    },
    {
        id: 'jovens',
        contexto: 'Ministério',
        titulo: 'Oração pelo grupo de jovens',
        cena: 'Encontro de jovens, e pedem que você ore por eles.',
        quem: 'Adolescentes e jovens adultos em formação.',
        oque: 'Dúvidas sobre futuro, identidade e caminho, com muitas vozes ao redor.',
        necessidade: 'Sabedoria para escolher, coragem para permanecer, companhia real.',
        primeiro: 'Fale do que eles vivem de verdade, não do que deveriam viver.',
        pressao: 2
    },
    {
        id: 'criancas',
        contexto: 'Ministério',
        titulo: 'Oração com crianças',
        cena: 'Você está com a turma das crianças e vai encerrar em oração.',
        quem: 'Crianças pequenas, que entendem tudo o que é concreto.',
        oque: 'Um encontro que precisa terminar com algo que elas levem.',
        necessidade: 'Frases curtas, imagens concretas, nada abstrato.',
        primeiro: 'Uma ideia só, com palavras que uma criança de seis anos usa.',
        pressao: 1
    },
    {
        id: 'missionario',
        contexto: 'Ministério',
        titulo: 'Envio de um missionário',
        cena: 'Alguém está sendo enviado e a igreja ora antes da partida.',
        quem: 'Quem vai, a família que fica, a igreja que envia.',
        oque: 'Uma despedida com propósito.',
        necessidade: 'Coragem para quem vai, consolo para quem fica, provisão para o caminho.',
        primeiro: 'Inclua os dois lados: quem parte e quem permanece.',
        pressao: 2
    },
    {
        id: 'obreiros',
        contexto: 'Ministério',
        titulo: 'Antes do culto, com a equipe',
        cena: 'Equipe de louvor e obreiros reunidos nos bastidores, minutos antes do culto.',
        quem: 'Quem vai servir, muitas vezes cansado e nervoso.',
        oque: 'Um minuto de silêncio antes de tudo começar.',
        necessidade: 'Que o serviço não vire performance; unidade na equipe.',
        primeiro: 'Curta e direta. Todo mundo está de pé e o relógio está correndo.',
        pressao: 1
    },
    {
        id: 'crise-financeira',
        contexto: 'Necessidade',
        titulo: 'Família com dificuldade financeira',
        cena: 'Uma família da igreja está passando aperto e pedem oração ao final do culto.',
        quem: 'A família, com a vergonha que a situação costuma trazer.',
        oque: 'Contas, incerteza e cansaço — e a exposição de estar ali na frente.',
        necessidade: 'Provisão, sabedoria para administrar, paz diante da incerteza, dignidade.',
        primeiro: 'Nomeie a dificuldade sem detalhar nada que exponha a família.',
        cuidado: 'Não cite valores, dívidas nem o que você ouviu de terceiros.',
        pressao: 3
    },
    {
        id: 'desemprego',
        contexto: 'Necessidade',
        titulo: 'Alguém que perdeu o emprego',
        cena: 'Um irmão perdeu o trabalho e pede oração no grupo.',
        quem: 'Ele, e a família que depende dele.',
        oque: 'Perda de renda e, junto, um golpe na identidade.',
        necessidade: 'Provisão, porta aberta — e que ele não se perca de si mesmo enquanto espera.',
        primeiro: 'Fale da pessoa antes de falar da vaga.',
        pressao: 2
    },
    {
        id: 'restauracao',
        contexto: 'Necessidade',
        titulo: 'Casamento em crise',
        cena: 'Um casal pede oração pelo casamento, na frente de outras pessoas.',
        quem: 'Os dois, cada um com uma versão da história.',
        oque: 'Distância, mágoa e medo — o que aparece é só a superfície.',
        necessidade: 'Humildade para ouvir, coragem para pedir perdão, sabedoria para reconstruir.',
        primeiro: 'Fale da necessidade, não do problema que você imagina.',
        cuidado: 'Não especule sobre o que aconteceu. Não exponha nenhum dos dois.',
        pressao: 3
    },
    {
        id: 'gratidao-testemunho',
        contexto: 'Gratidão',
        titulo: 'Depois de um testemunho',
        cena: 'Alguém acabou de contar o que Deus fez e pedem que você ore agradecendo.',
        quem: 'Quem testemunhou e a igreja que ouviu.',
        oque: 'Uma alegria concreta, com nome e história.',
        necessidade: 'Reconhecer o autor sem transformar a pessoa em herói.',
        primeiro: 'Agradeça pelo detalhe específico que acabou de ser contado.',
        pressao: 1
    },
    {
        id: 'fim-de-ano',
        contexto: 'Gratidão',
        titulo: 'Encerramento de um ano',
        cena: 'Último culto do ano. Pedem uma oração de gratidão e entrega.',
        quem: 'Uma igreja inteira, com anos muito diferentes dentro da mesma sala.',
        oque: 'Um ciclo terminando — para uns, de conquista; para outros, de perda.',
        necessidade: 'Gratidão que não ignora quem sofreu, e esperança para o que vem.',
        primeiro: 'Inclua os dois lados desde a abertura.',
        pressao: 2
    },
    {
        id: 'improviso-total',
        contexto: 'Improviso',
        titulo: 'Sem contexto nenhum',
        cena: 'Alguém simplesmente diz: "pode conduzir uma oração por este momento?" e devolve o microfone.',
        quem: 'Quem estiver ali. Você precisa olhar antes de falar.',
        oque: 'Você não sabe. Descubra olhando, antes da primeira palavra.',
        necessidade: 'A que o momento pedir. Uma palavra já orienta o coração da oração.',
        primeiro: 'Leia o momento em três perguntas e comece pelo propósito.',
        pressao: 3
    },
    {
        id: 'pessoa-sozinha',
        contexto: 'Improviso',
        titulo: 'Uma pessoa só, no corredor',
        cena: 'Alguém te para depois do culto: "ora por mim?" e não explica muita coisa.',
        quem: 'Uma pessoa, cara a cara.',
        oque: 'Algo que ela não conseguiu nomear inteiro.',
        necessidade: 'Ser vista. E o que ela não disse continua sendo conhecido por Deus.',
        primeiro: 'Pergunte uma coisa só antes de orar. Depois ore pelo que é seguro afirmar.',
        cuidado: 'Não presuma o que não foi dito. "Tu conheces toda essa situação" é suficiente.',
        pressao: 2
    },
    {
        id: 'visitante',
        contexto: 'Improviso',
        titulo: 'Numa igreja que não é a sua',
        cena: 'Você está visitando outra igreja e o pastor te chama para orar.',
        quem: 'Pessoas que você não conhece, com jeito próprio de orar.',
        oque: 'Um convite gentil e uma cultura que não é a sua.',
        necessidade: 'Servir aquele povo, não mostrar o seu estilo.',
        primeiro: 'Ore pelo que é comum a todos: a presença de Deus e o momento que está sendo vivido.',
        pressao: 2
    }
];

/* Temas soltos para os dias de sorteio (Módulo 9, dias 1 e 13). */
A.TEMAS = [
    'Gratidão', 'Família', 'Igreja', 'Trabalho', 'Proteção', 'Decisão',
    'Preocupação', 'Viagem', 'Novo projeto', 'Perdão', 'Saúde', 'Filhos',
    'Casamento', 'Amigos', 'Liderança', 'Provisão', 'Direção', 'Descanso',
    'Coragem', 'Unidade', 'Vizinhos', 'Estudos', 'Luto', 'Recomeço'
];

/* Imprevistos para o Dia 18: alguém acrescenta uma informação no meio da
   oração e você precisa continuar sem reiniciar nem pedir desculpas. */
A.IMPREVISTOS = [
    'Lembra também da decisão que eles precisam tomar.',
    'Ora também pela mãe dele, que está internada.',
    'Tem uma visita aqui hoje que veio pela primeira vez.',
    'Inclui os que não puderam vir.',
    'Ora também pela viagem de amanhã.',
    'A filha deles está passando por uma fase difícil na escola.',
    'Também tem gente aqui procurando emprego.',
    'Lembra do nosso pastor, que está cansado.',
    'Ora pelo casal que vai casar no sábado.',
    'Tem alguém aqui que perdeu alguém essa semana.'
];

/* Contextos, para os filtros da tela de treino. */
A.CONTEXTOS = ['Culto', 'Célula', 'Família', 'Hospital', 'Luto', 'Celebração', 'Reunião', 'Ministério', 'Necessidade', 'Gratidão', 'Improviso'];
