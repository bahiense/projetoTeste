/* =========================================================
   Roteiro de estudo montado no próprio aparelho.

   É o que aparece quando não há chave do Gemini (ou quando ela falha):
   estrutura de abertura, desenvolvimento e fechamento a partir dos
   pontos-chave do tema, mais dicas e estratégia de estudo por nível.
   O formato é o mesmo que a IA devolve, para a tela não distinguir.
   ========================================================= */
window.O = window.O || {};

O.roteiro = (function () {
    'use strict';

    var DICAS = {
        iniciante: [
            'Fale em ritmo tranquilo e faça uma pausa curta entre uma ideia e outra.',
            'Use frases curtas: uma ideia por frase.',
            'Termine com uma frase que você já decidiu antes de começar.'
        ],
        intermediario: [
            'Comece direto pela ideia principal, sem "bom, então, é…".',
            'Use um exemplo concreto do cotidiano em pelo menos um dos pontos.',
            'Troque o "né?" por uma pausa: o silêncio passa segurança.',
            'Treine com cronômetro e mire em cerca de 80% do tempo máximo.'
        ],
        avancado: [
            'Abra com uma pergunta, um dado ou uma história curta, não com apresentação.',
            'Anuncie a estrutura ("vou defender isso com dois argumentos") para guiar quem ouve.',
            'Antecipe a principal objeção e responda a ela antes que alguém pergunte.',
            'Varie o volume e a velocidade para marcar as ideias mais importantes.',
            'Feche retomando a tese com outras palavras e uma chamada para ação.'
        ]
    };

    var ESTRATEGIA = [
        'Leia o roteiro uma vez inteiro, sem tentar decorar.',
        'Escreva só as palavras-chave de cada ponto em um papel ou na mente.',
        'Fale o roteiro em voz alta uma vez, olhando as palavras-chave.',
        'Fale de novo sem olhar nada, com cronômetro.',
        'Grave e envie para análise. Depois, repita focando no que a avaliação apontou.'
    ];

    function montar(tema, minutos) {
        var pontos = (tema.pontos && tema.pontos.length) ? tema.pontos : [
            'O que é o assunto e por que ele importa',
            'Um exemplo ou caso concreto',
            'O que quem ouve deve fazer ou pensar a partir disso'
        ];
        var nivel = tema.nivel || 'intermediario';
        var segundos = Math.round((minutos || 2) * 60);
        var tAbertura = Math.max(10, Math.round(segundos * 0.15));
        var tFecho = Math.max(10, Math.round(segundos * 0.15));

        return {
            titulo: tema.titulo,
            objetivo: tema.objetivo || ('Explicar, em até ' + minutos + ' minuto' +
                (minutos > 1 ? 's' : '') + ', o essencial sobre "' + tema.titulo + '".'),
            pontos: pontos.map(function (p) {
                return { titulo: p, explicacao: '' };
            }),
            estrutura: [
                { parte: 'Abertura', tempo: '~' + tAbertura + 's',
                    texto: 'Apresente o tema em uma frase direta e diga por que ele importa para quem ouve.' },
                { parte: 'Desenvolvimento', tempo: '~' + (segundos - tAbertura - tFecho) + 's',
                    texto: 'Passe pelos pontos-chave na ordem: ' + pontos.join('; ') +
                        '. Dê um exemplo concreto em pelo menos um deles.' },
                { parte: 'Fechamento', tempo: '~' + tFecho + 's',
                    texto: 'Retome a ideia principal com outras palavras e termine com uma frase de efeito ou um convite à ação.' }
            ],
            dicas: (DICAS[nivel] || DICAS.intermediario).slice(),
            estrategia: ESTRATEGIA.slice(),
            origem: 'local'
        };
    }

    return { montar: montar };
})();
