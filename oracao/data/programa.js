/* =========================================================
   O programa de 21 dias (Módulo 9).

   Os exercícios são os do material, com os tempos que ele define.
   O campo `modo` diz ao app como montar o treino do dia:

     tema      sorteia um tema da lista e conta os dez segundos
     frase     a oração começa por uma frase dada
     cenario   sorteia um cenário completo
     duplo     duas orações seguidas, contextos diferentes
     imprevisto  alguém acrescenta informação no meio
     surpresa  o app escolhe tudo e só revela na hora
     estado    o foco é o estado mental, não o conteúdo

   `preparo` é quanto tempo o aluno tem antes de começar a falar.
   Zero significa que não há preparo: comece.
   ========================================================= */
window.A = window.A || {};

A.FASES = [
    { n: 1, dias: '1–7', nome: 'Começar', obj: 'Aprender a iniciar sem travar, sem planejar tudo antes.' },
    { n: 2, dias: '8–14', nome: 'Desenvolver', obj: 'Aprender a construir, conectar e aprofundar.' },
    { n: 3, dias: '15–21', nome: 'Conduzir', obj: 'Adaptar, improvisar e orar sob diferentes níveis de pressão.' }
];

A.PROGRAMA = [
    {
        dia: 1, fase: 1, titulo: 'Primeiro movimento', foco: 'Começar',
        segundos: 30, preparo: 10, modo: 'tema',
        objetivo: 'Treinar o ato de dar o primeiro passo sem esperar que tudo esteja planejado.',
        instrucao: 'Dez segundos para escolher o tema. Depois comece a orar em voz alta e pare em trinta segundos.',
        regra: 'Não planeje a oração inteira antes de começar. A primeira palavra já é o exercício.',
        reflexao: 'Eu consegui começar sem saber tudo o que diria?'
    },
    {
        dia: 2, fase: 1, titulo: 'Propósito', foco: 'A — Alinhe o Propósito',
        segundos: 60, preparo: 15, modo: 'tema',
        objetivo: 'Encontrar rapidamente a razão da oração antes de abrir a boca.',
        instrucao: 'Antes de orar, responda mentalmente: "por que estamos orando agora?". Depois ore por até um minuto.',
        regra: 'Hoje não tente usar todos os elementos do método. Só encontre o propósito, rápido.',
        reflexao: 'Eu soube por que estava orando antes de começar?'
    },
    {
        dia: 3, fase: 1, titulo: 'O momento', foco: 'L — Ligue o Céu ao Momento',
        segundos: 60, preparo: 20, modo: 'cenario',
        objetivo: 'Orar sobre o momento real, não uma oração genérica preparada.',
        instrucao: 'Vinte segundos observando: quem está aqui, o que está acontecendo, o que este momento precisa. Depois ore um minuto.',
        regra: 'Se a sua oração poderia ter sido feita em qualquer lugar, ela ainda não leu o momento.',
        reflexao: 'Minha oração soou como se fosse para este momento específico?'
    },
    {
        dia: 4, fase: 1, titulo: 'Uma ideia', foco: 'Os 5 Ângulos',
        segundos: 60, preparo: 10, modo: 'frase', frase: 'Deus está conosco.',
        objetivo: 'Perceber quantas direções uma única ideia pode tomar.',
        instrucao: 'Explore esta única ideia por um minuto: quem precisa lembrar disso hoje, onde isso aparece na realidade, do que precisamos por causa disso, o que isso revela sobre Deus, o que colocamos nas mãos dEle.',
        regra: 'Um assunto só. Não troque de tema para preencher o tempo.',
        reflexao: 'Consegui ficar na mesma ideia sem repetir a mesma frase?'
    },
    {
        dia: 5, fase: 1, titulo: 'Uma ponte', foco: 'Situação → Necessidade',
        segundos: 90, preparo: 10, modo: 'frase', frase: 'Senhor, estamos vivendo uma fase de incerteza...',
        objetivo: 'Sentir o momento em que a oração se move de um ponto para outro.',
        instrucao: 'Comece por essa frase e faça a ponte da situação para a necessidade. Continue por até noventa segundos.',
        regra: 'A necessidade precisa nascer da situação — não ser um assunto novo.',
        reflexao: 'Onde senti que a oração avançou? Onde travei na mesma ideia?'
    },
    {
        dia: 6, fase: 1, titulo: 'Profundidade', foco: 'Os 5 Níveis',
        segundos: 120, preparo: 30, modo: 'frase', frase: 'Senhor, ajuda minha família.',
        objetivo: 'Descobrir que um pedido simples contém muita profundidade.',
        instrucao: 'Antes de continuar, percorra: o que está acontecendo, o que isso está causando, do que realmente precisam, o que lembramos sobre Deus, o que entregamos. Depois ore até dois minutos.',
        regra: 'Profundidade não é palavra difícil. É detalhe verdadeiro.',
        reflexao: 'Fui além do pedido, ou fiquei repetindo o pedido?'
    },
    {
        dia: 7, fase: 1, titulo: 'Primeiro desafio', foco: 'Integração', desafio: true,
        segundos: 120, preparo: 10, modo: 'cenario', filtro: 'Família',
        objetivo: 'Juntar propósito, momento, desenvolvimento e profundidade sem anunciar o método.',
        instrucao: 'Dez segundos de preparo. Dois minutos de oração. Não tente demonstrar que está usando o método — apenas use.',
        regra: 'Não é avaliação. É integração.',
        reflexao: 'Onde travei? Onde fluiu? Em que momento pensei demais?'
    },
    {
        dia: 8, fase: 2, titulo: '5 Ângulos', foco: 'Desenvolver',
        segundos: 120, preparo: 15, modo: 'frase', frase: 'Deus cuida de nós.',
        objetivo: 'Expandir uma ideia sem repetir a mesma frase com palavras diferentes.',
        instrucao: 'Dois minutos explorando os cinco ângulos em voz alta: pessoas, situações, necessidades, fé, entrega.',
        regra: 'Se perceber que está repetindo, mude de ângulo — não de assunto.',
        reflexao: 'Quantos ângulos eu realmente usei?'
    },
    {
        dia: 9, fase: 2, titulo: '4 Pontes', foco: 'Conectar',
        segundos: 120, preparo: 15, modo: 'frase', frase: 'Uma família está enfrentando uma decisão.',
        objetivo: 'Não deixar ideias soltas: cada uma conecta à próxima.',
        instrucao: 'Pratique as quatro conexões, em ordem: parte → todo, situação → necessidade, necessidade → fé, fé → entrega.',
        regra: 'Sem frases de transição anunciadas. A ponte é a relação, não a frase.',
        reflexao: 'Alguém que ouvisse acompanharia o raciocínio sem se perguntar "por que isso agora"?'
    },
    {
        dia: 10, fase: 2, titulo: 'Do pedido à necessidade', foco: 'Nível 3',
        segundos: 120, preparo: 20, modo: 'frase', frase: 'Senhor, dá paz para essa pessoa.',
        objetivo: 'Ir além da superfície sem ultrapassar o que você realmente sabe.',
        instrucao: 'Antes de continuar, pergunte: por que ela precisa de paz? O que pode estar por baixo desse pedido? O que essa paz permitiria que ela vivesse?',
        regra: 'Não presuma informações que você não conhece. Profundidade não é especulação.',
        reflexao: 'Eu nomeei a necessidade real, ou repeti o pedido?'
    },
    {
        dia: 11, fase: 2, titulo: 'Uma oração mais longa', foco: 'ALTAR + Ângulos + Pontes',
        segundos: 180, preparo: 20, modo: 'frase', frase: 'Sabedoria para uma decisão.',
        objetivo: 'Ocupar três minutos avançando, e não repetindo.',
        instrucao: 'Três minutos. Quando perceber que está repetindo, use uma ponte e avance para o próximo ângulo.',
        regra: 'Não repita a mesma ideia com outras palavras para encher o tempo.',
        reflexao: 'Em quais momentos avancei? Em quais repeti para ganhar tempo?'
    },
    {
        dia: 12, fase: 2, titulo: 'Adaptação', foco: 'Módulo 8',
        segundos: 60, preparo: 10, modo: 'duplo',
        necessidade: 'Precisamos de direção',
        contextos: ['uma família diante de uma decisão', 'uma reunião de trabalho ou de ministério'],
        objetivo: 'Adaptar sem abandonar a estrutura.',
        instrucao: 'Duas orações de um minuto, mesma necessidade, contextos diferentes. Depois compare: o que mudou? O que permaneceu?',
        regra: 'Muda o conteúdo. A estrutura fica.',
        reflexao: 'O que mudou: contexto, linguagem, tom. O que permaneceu: estrutura, propósito, fé.'
    },
    {
        dia: 13, fase: 2, titulo: 'Improviso', foco: 'Começar sem pensar demais',
        segundos: 120, preparo: 10, modo: 'tema',
        objetivo: 'Receber uma situação de surpresa e começar sem pedir tempo.',
        instrucao: 'Dez segundos. Depois ore por dois minutos.',
        regra: 'Não peça tempo para pensar. O primeiro movimento já é o exercício.',
        reflexao: 'O que aconteceu na minha cabeça nos primeiros cinco segundos?'
    },
    {
        dia: 14, fase: 2, titulo: 'Segundo desafio', foco: 'Integração', desafio: true,
        segundos: 180, preparo: 10, modo: 'cenario', filtro: 'Célula',
        objetivo: 'Reunir desenvolvimento, conexão, profundidade e adaptação sem saber o que vem.',
        instrucao: 'Você não sabia que seria chamado. Dez segundos para se preparar, três minutos para conduzir.',
        regra: 'Continue mesmo sem saber exatamente o que virá depois.',
        reflexao: 'Onde senti mais segurança? Onde busquei repetir em vez de avançar?'
    },
    {
        dia: 15, fase: 3, titulo: 'Oração de 30 segundos', foco: 'Brevidade com intenção',
        segundos: 30, preparo: 10, modo: 'cenario', filtro: 'Gratidão',
        objetivo: 'Aprender que oração curta não significa oração rasa.',
        instrucao: 'Dez segundos de preparo. Trinta segundos de oração — uma única ideia bem conectada ao momento.',
        regra: 'Não corte no meio: encerre com propósito dentro do tempo.',
        reflexao: 'Minha oração soou intencional ou pareceu cortada?'
    },
    {
        dia: 16, fase: 3, titulo: 'Oração de 5 minutos', foco: 'Expandir sem repetir',
        segundos: 300, preparo: 30, modo: 'frase', frase: 'Famílias.',
        objetivo: 'Preencher o espaço com ângulos, pontes e profundidade — não com repetição.',
        instrucao: 'Cinco minutos. Use os cinco ângulos, as quatro pontes e os cinco níveis, sem anunciar nenhum.',
        regra: 'Se perceber que está repetindo: ponte, próximo ângulo, ou desça um nível.',
        reflexao: 'Em que momento senti que estava preenchendo tempo? Em que momento avancei de verdade?'
    },
    {
        dia: 17, fase: 3, titulo: 'Contexto difícil', foco: 'Discrição',
        segundos: 120, preparo: 20, modo: 'cenario', filtro: 'Hospital',
        objetivo: 'Ser profundo sem ultrapassar aquilo que você realmente sabe.',
        instrucao: 'Antes de orar, lembre: não inventar, não especular, não expor. Ore por dois minutos.',
        regra: 'Ore pelo que é seguro afirmar. "Tu conheces toda essa situação" é suficiente.',
        reflexao: 'Eu disse algo que não era meu para dizer?'
    },
    {
        dia: 18, fase: 3, titulo: 'O imprevisto', foco: 'Continuar quando o plano muda',
        segundos: 150, preparo: 10, modo: 'imprevisto',
        objetivo: 'Adaptar sem reiniciar.',
        instrucao: 'No meio da oração, alguém acrescenta uma informação. Não reinicie, não peça desculpas: faça uma ponte e continue.',
        regra: 'A oração não precisa recomeçar. Ela só precisa avançar.',
        reflexao: 'Consegui incluir o que apareceu sem quebrar o fio?'
    },
    {
        dia: 19, fase: 3, titulo: 'Orar sem olhar para si', foco: 'Estado mental',
        segundos: 120, preparo: 15, modo: 'estado',
        objetivo: 'Presença em vez de performance.',
        instrucao: 'Antes de começar, diga mentalmente: "não preciso impressionar, não preciso parecer confiante, preciso servir este momento". Toda vez que pensar "será que estou falando bem?", volte para: qual é o próximo movimento?',
        regra: 'O foco é o estado mental, não o conteúdo.',
        reflexao: 'Quantas vezes me peguei avaliando a mim mesmo? Consegui voltar?'
    },
    {
        dia: 20, fase: 3, titulo: 'Desafio completo', foco: 'Sem controle das variáveis', desafio: true,
        segundos: 0, preparo: 10, modo: 'surpresa',
        objetivo: 'Juntar tudo sem preparação excessiva.',
        instrucao: 'Contexto, necessidade e duração são escolhidos por outra pessoa — aqui, pelo app. Você só descobre na hora. Dez segundos e comece.',
        regra: 'Não negocie o tempo nem o tema.',
        reflexao: 'O método apareceu sozinho, ou tive que procurar por ele?'
    },
    {
        dia: 21, fase: 3, titulo: 'A prova final', foco: 'Conduzir', desafio: true,
        segundos: 240, preparo: 10, modo: 'surpresa',
        objetivo: 'Conduzir uma oração de verdade, do começo ao fim.',
        instrucao: 'Você está diante de um grupo. "Pode conduzir uma oração por este momento?" Dez segundos. De três a cinco minutos.',
        regra: 'Não tente demonstrar que está usando o método. Use.',
        reflexao: 'Comparando com o Dia 1: o que mudou em mim?'
    }
];

/* Avaliação final do programa (Módulo 9). Nota de 1 a 5 em cada habilidade —
   uma fotografia, não um diagnóstico. */
A.AVALIACAO = [
    { id: 'comecar', nome: 'Começar', p: 'Consigo começar sem planejar tudo?' },
    { id: 'desenvolver', nome: 'Desenvolver', p: 'Consigo expandir uma ideia?' },
    { id: 'conectar', nome: 'Conectar', p: 'Consigo passar de uma ideia para outra?' },
    { id: 'aprofundar', nome: 'Aprofundar', p: 'Consigo enxergar além do pedido superficial?' },
    { id: 'adaptar', nome: 'Adaptar', p: 'Consigo mudar a oração conforme o contexto?' },
    { id: 'improvisar', nome: 'Improvisar', p: 'Consigo continuar quando algo sai do plano?' },
    { id: 'confianca', nome: 'Confiança', p: 'Consigo continuar mesmo sentindo nervosismo?' }
];
