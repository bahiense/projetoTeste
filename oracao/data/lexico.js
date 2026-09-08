/* =========================================================
   Léxicos do analisador.

   O app não entende português: ele reconhece palavras. Cada lista
   abaixo é um conjunto de pistas — raízes de palavra (o casamento
   entre "sabedoria" e "sabedor" acontece pelo prefixo) e expressões
   inteiras, que casam por trecho.

   Isso tem limite, e o limite é dito na cara do aluno na tela de
   resultado: é indicador de treino, não laudo sobre a oração.
   ========================================================= */
window.A = window.A || {};

/* Palavras que indicam cada um dos 5 Ângulos.
   `raiz` casa por começo de palavra; `frase` casa em qualquer lugar do texto. */
A.LEXICO_ANGULOS = {
    pessoas: {
        raiz: ['familia', 'filho', 'filha', 'marido', 'esposa', 'esposo', 'mulher', 'homem',
            'pai', 'mae', 'pais', 'irmao', 'irma', 'irmaos', 'avo', 'avos', 'neto', 'neta',
            'crianca', 'jovem', 'jovens', 'adolescente', 'casal', 'noivo', 'noiva',
            'pastor', 'pastora', 'lider', 'lideranca', 'obreiro', 'diacono', 'presbitero',
            'congregacao', 'igreja', 'membro', 'visitante', 'vizinho', 'amigo', 'amiga',
            'enfermo', 'doente', 'paciente', 'viuva', 'orfao', 'idoso', 'professor',
            'aluno', 'equipe', 'time', 'colega', 'funcionario', 'medico', 'enfermeir',
            'ele', 'ela', 'eles', 'elas', 'nome'],
        frase: ['cada um', 'cada pessoa', 'cada familia', 'cada lar', 'os que estao',
            'quem esta aqui', 'todos aqui', 'essa pessoa', 'esta pessoa', 'esse irmao']
    },
    situacoes: {
        raiz: ['dificuldade', 'dificil', 'crise', 'luta', 'peso', 'cansaco', 'cansad',
            'doenca', 'enfermidade', 'diagnostico', 'tratamento', 'internad', 'cirurgia',
            'perda', 'luto', 'morte', 'falecim', 'separacao', 'divorcio', 'briga',
            'conflito', 'discussao', 'magoa', 'ferida', 'decisao', 'escolha', 'mudanca',
            'desemprego', 'emprego', 'trabalho', 'conta', 'divida', 'financeir', 'dinheiro',
            'estudo', 'prova', 'escola', 'faculdade', 'viagem', 'estrada', 'espera',
            'incerteza', 'medo', 'ansiedade', 'angustia', 'preocupa', 'solidao', 'sozinh',
            'pressao', 'desgaste', 'esgotad', 'exaust', 'semana', 'dia', 'noite', 'hoje',
            'agora', 'momento', 'situacao', 'aconteceu', 'acontecendo', 'vivendo',
            'enfrentando', 'passando', 'carrega', 'atravessa'],
        frase: ['esta passando por', 'estao passando', 'o que estao vivendo', 'neste momento',
            'nesta semana', 'esta noite', 'esta manha', 'nos ultimos dias', 'chegamos aqui',
            'viemos de', 'depois de uma semana']
    },
    necessidades: {
        raiz: ['sabedoria', 'direcao', 'clareza', 'discernimento', 'orientacao', 'entendimento',
            'forca', 'coragem', 'animo', 'firmeza', 'paciencia', 'humildade', 'perdao',
            'reconciliacao', 'restauracao', 'cura', 'saude', 'alivio', 'descanso', 'refrigerio',
            'renovacao', 'paz', 'consolo', 'conforto', 'esperanca', 'provisao', 'sustento',
            'protecao', 'livramento', 'unidade', 'comunhao', 'amor', 'alegria', 'graca',
            'ajuda', 'socorro', 'amparo', 'presenca', 'companhia', 'cuidado', 'preciso',
            'precisam', 'precisamos', 'necessit'],
        frase: ['do que precisam', 'nos falta', 'precisamos de', 'eles precisam',
            'da a eles', 'concede a', 'que eles encontrem']
    },
    fe: {
        raiz: ['creio', 'cremos', 'cre', 'fe', 'confiamos', 'confio', 'confianca', 'sabemos',
            'conheces', 'conhece', 'fiel', 'fidelidade', 'poderos', 'capaz', 'soberan',
            'santidade', 'bondade', 'misericordia', 'providencia', 'onipot', 'promessa',
            'prometeu', 'palavra', 'escritura', 'versiculo', 'salmo', 'jesus', 'cristo',
            'espirito'],
        frase: ['tu es', 'tu podes', 'tu conheces', 'tu sabes', 'nos cremos', 'nos sabemos',
            'sabemos que tu', 'porque tu', 'tua palavra diz', 'nada e impossivel',
            'tu estas', 'tu nao', 'contigo nada', 'lembramos que', 'nos lembramos']
    },
    entrega: {
        raiz: ['entregamos', 'entrego', 'entrega', 'colocamos', 'coloco', 'depositamos',
            'soltamos', 'largamos', 'rendemos', 'rendicao', 'descansamos', 'submissao',
            'confiamos', 'deixamos', 'apresentamos', 'consagramos', 'dependencia'],
        frase: ['em tuas maos', 'nas tuas maos', 'nos teus bracos', 'diante de ti',
            'seja feita a tua vontade', 'que a tua vontade', 'o que nao conseguimos',
            'aquilo que nao', 'nao esta em nossas maos', 'a ti entregamos']
    }
};

/* Vocativos. Quando vêm em fila, sem ideia entre eles, são o
   "sintoma mais visível" do Módulo 2. */
A.VOCATIVOS = ['senhor', 'pai', 'deus', 'jesus', 'cristo', 'senhora', 'papai', 'amado'];
A.VOCATIVOS_FRASE = ['meu deus', 'meu pai', 'pai amado', 'senhor jesus', 'pai celestial',
    'pai eterno', 'oh senhor', 'o senhor deus', 'papai do ceu', 'querido pai', 'amado pai'];

/* Muletas e enchimento. Não são pecado — são sinal de que a próxima
   ideia ainda não chegou. */
A.MULETAS = ['tipo assim', 'ne', 'entao assim', 'sabe', 'assim oh', 'ai entao',
    'aham', 'hum', 'e ai', 'tipo', 'assim tipo', 'sei la'];

/* Marcadores de vagueza: dizem tudo e não dizem nada. */
A.VAGO = ['tudo', 'todas as coisas', 'todos os nossos', 'toda situacao', 'qualquer coisa',
    'todas as pessoas', 'cada coisa', 'em todas as areas', 'em todos os sentidos',
    'aquilo tudo', 'todas as necessidades', 'todo o mal', 'todos os problemas',
    'abencoa a todos', 'abencoa tudo'];

/* Marcadores de especificidade: nomeiam algo que existe de verdade.
   O analisador conta estes contra os de vagueza. */
A.ESPECIFICO_FRASE = ['esta familia', 'este casal', 'esta pessoa', 'este irmao', 'esta irma',
    'esta noite', 'esta semana', 'hoje', 'amanha', 'nesta casa', 'nesta sala',
    'neste hospital', 'nesta igreja', 'no trabalho dele', 'na escola', 'a decisao que',
    'a cirurgia', 'a viagem', 'a entrevista', 'o tratamento', 'o diagnostico',
    'a conversa de ontem', 'o que aconteceu', 'os filhos deles', 'o filho dela',
    'a mae dele', 'o pai dela'];

/* Assuntos: usados para detectar a "oração em lista" do Módulo 5.
   Muitos assuntos, poucas palavras em cada um, nenhuma conexão. */
A.TOPICOS = [
    { id: 'familia', raiz: ['familia', 'lar', 'casa', 'filho', 'filha', 'marido', 'esposa', 'casamento'] },
    { id: 'trabalho', raiz: ['trabalho', 'emprego', 'servico', 'profiss', 'patrao', 'empresa', 'carreira'] },
    { id: 'igreja', raiz: ['igreja', 'congregacao', 'ministerio', 'celula', 'culto', 'louvor', 'obreiro'] },
    { id: 'saude', raiz: ['saude', 'doenca', 'enfermo', 'cura', 'hospital', 'medico', 'corpo', 'cirurgia'] },
    { id: 'amigos', raiz: ['amigo', 'amiga', 'vizinho', 'colega', 'companheiro'] },
    { id: 'financas', raiz: ['financ', 'dinheiro', 'divida', 'conta', 'provisao', 'salario', 'sustento'] },
    { id: 'lideranca', raiz: ['pastor', 'lider', 'lideranca', 'presbitero', 'diacono', 'missionari'] },
    { id: 'pais', raiz: ['pais', 'nacao', 'governo', 'autoridade', 'governante', 'presidente', 'cidade'] },
    { id: 'estudos', raiz: ['estudo', 'escola', 'faculdade', 'prova', 'vestibular', 'professor', 'aluno'] },
    { id: 'jovens', raiz: ['jovem', 'jovens', 'adolescente', 'crianca', 'juventude'] },
    { id: 'missoes', raiz: ['missao', 'missionari', 'evangel', 'campo', 'nacoes'] },
    { id: 'viagem', raiz: ['viagem', 'estrada', 'voo', 'caminho de volta', 'mudanca de cidade'] }
];

/* Palavras que costumam aparecer como escudo, não como conteúdo
   (Módulo 6: "profundidade não é falar difícil"). */
A.PALAVRAS_DIFICEIS = ['consubstancial', 'propiciacao', 'escatolog', 'imanencia', 'soteriolog',
    'hermeneutic', 'inefavel', 'magnanim', 'sempiterno', 'onisciencia', 'perscrut',
    'incomensuravel', 'panoplia', 'ontolog', 'teofania', 'kenose', 'hipostatica'];

/* Aberturas genéricas: louvor automático que serve para qualquer
   situação e por isso não liga a oração a nenhuma. */
A.ABERTURA_GENERICA = ['te louvamos', 'te bendizemos', 'te glorificamos', 'te adoramos',
    'aleluia', 'gloria a deus', 'quao grande es tu', 'santo santo santo'];

/* Encerramento: como saber se a oração concluiu ou apenas parou. */
A.ENCERRAMENTO = ['amem', 'em nome de jesus', 'no poderoso nome de jesus', 'para a tua gloria',
    'a ti toda a gloria', 'que assim seja', 'nome do teu filho', 'e o que pedimos'];

/* Frases de repetição pura — ditas para preencher o silêncio. */
A.REPETICAO_TIPICA = ['nos te pedimos', 'nos oramos', 'continua abencoando', 'abencoa senhor',
    'estamos aqui', 'nos queremos', 'nos viemos'];
