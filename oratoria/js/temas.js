/* =========================================================
   Banco de temas embutido.

   Serve para treinar sem chave e sem internet: cada tema já vem com
   objetivo e pontos-chave, que viram o roteiro e a lista de cobertura
   da análise local. Com a chave do Gemini, o sorteio passa a pedir
   temas novos à IA e este banco fica de reserva.
   ========================================================= */
window.O = window.O || {};

O.temas = (function () {
    'use strict';

    var NIVEIS = {
        iniciante: { nome: 'Iniciante', minutos: 1, dica: 'Temas do dia a dia, em até 1 minuto.' },
        intermediario: { nome: 'Intermediário', minutos: 2, dica: 'Temas de trabalho e sociedade, em até 2 minutos.' },
        avancado: { nome: 'Avançado', minutos: 3, dica: 'Temas que pedem argumento e posição, em até 3 minutos.' }
    };

    var BANCO = {
        iniciante: [
            ['O melhor conselho que você já recebeu', 'Contar qual foi o conselho, quem deu e o que mudou na sua vida.',
                ['Quem deu o conselho e em que momento', 'O que o conselho dizia', 'Como você o aplicou', 'O que ele mudou']],
            ['Uma viagem que marcou você', 'Descrever uma viagem e explicar por que ela ficou na memória.',
                ['Para onde foi e com quem', 'Um momento marcante', 'O que aprendeu', 'Se recomendaria']],
            ['Seu hobby favorito', 'Apresentar um hobby e convencer o ouvinte a experimentá-lo.',
                ['O que é e como começou', 'O que ele traz de bom', 'Como alguém pode começar']],
            ['Uma pessoa que inspira você', 'Apresentar alguém que admira e mostrar o que aprendeu com essa pessoa.',
                ['Quem é a pessoa', 'Uma atitude que inspira', 'O que você leva dela para sua vida']],
            ['Como seria seu dia perfeito', 'Descrever, do começo ao fim, um dia ideal e o que ele revela sobre você.',
                ['Como o dia começa', 'O ponto alto do dia', 'Com quem você estaria', 'O que isso diz sobre você']],
            ['Um livro, filme ou série que recomendo', 'Recomendar uma obra sem contar o final e dar motivos para assistir ou ler.',
                ['Do que se trata, sem spoiler', 'O que a torna especial', 'Para quem você recomenda']],
            ['A importância de dormir bem', 'Explicar por que o sono importa e dar dicas práticas.',
                ['O que o sono faz pelo corpo e pela mente', 'O que atrapalha o sono', 'Duas dicas práticas']],
            ['Minha comida preferida', 'Apresentar um prato de forma que dê vontade de experimentar.',
                ['Qual é o prato e de onde vem', 'Sabor, cheiro e memória ligada a ele', 'Onde ou como provar']],
            ['Um erro que me ensinou muito', 'Contar um erro e transformar a história em aprendizado útil para quem ouve.',
                ['O que aconteceu', 'Como você percebeu o erro', 'O que aprendeu', 'O conselho para quem ouve']],
            ['Por que vale a pena aprender algo novo', 'Defender o hábito de aprender coisas novas em qualquer idade.',
                ['Um exemplo de algo que você aprendeu', 'Benefícios para a mente e a carreira', 'Como começar com pouco tempo']],
            ['O lugar onde eu cresci', 'Descrever sua cidade ou bairro e o que ele tem de único.',
                ['Onde fica e como é', 'Uma lembrança de infância', 'O que mudou e o que continua igual']],
            ['Uma meta para os próximos meses', 'Apresentar uma meta pessoal e o plano para alcançá-la.',
                ['Qual é a meta', 'Por que ela importa para você', 'Os primeiros passos', 'Como vai medir o progresso']]
        ],
        intermediario: [
            ['Produtividade no ambiente de trabalho', 'Explicar o que contribui para a produtividade e por que ela depende tanto da organização quanto do bem-estar.',
                ['Prioridades claras', 'Organização do tempo', 'Menos distrações', 'Pausas e bem-estar']],
            ['Como a tecnologia mudou a forma como aprendemos', 'Mostrar como a tecnologia transformou o aprendizado, com ganhos e cuidados.',
                ['Acesso a conteúdo em qualquer lugar', 'Aprendizado no próprio ritmo', 'O risco da distração e da superficialidade', 'Como usar a tecnologia a favor']],
            ['Trabalho remoto: vantagens e desafios', 'Apresentar os dois lados do trabalho remoto e uma conclusão equilibrada.',
                ['Flexibilidade e tempo ganho', 'Isolamento e comunicação', 'Limites entre casa e trabalho', 'O que faz o modelo funcionar']],
            ['A importância da educação financeira', 'Explicar por que todos deveriam aprender a cuidar do dinheiro.',
                ['Orçamento e controle de gastos', 'Reserva de emergência', 'Juros: inimigo e aliado', 'Um primeiro passo simples']],
            ['Como dar um feedback construtivo', 'Ensinar a dar feedback que ajuda sem magoar.',
                ['Falar do comportamento, não da pessoa', 'Ser específico com exemplos', 'Momento e lugar certos', 'Combinar o próximo passo']],
            ['Inteligência artificial no dia a dia', 'Mostrar onde a IA já está presente e como usá-la com responsabilidade.',
                ['Exemplos do cotidiano', 'Ganhos de tempo e acesso', 'Cuidados com erros e privacidade', 'Como aprender a usar bem']],
            ['Como se preparar para uma entrevista de emprego', 'Dar um roteiro prático de preparação para entrevistas.',
                ['Pesquisar a empresa e a vaga', 'Preparar histórias de resultados', 'Linguagem corporal e pontualidade', 'Perguntas para fazer no fim']],
            ['O papel da empatia na liderança', 'Defender que empatia é uma competência de liderança, não fraqueza.',
                ['O que é empatia na prática', 'Efeito na confiança da equipe', 'Empatia com firmeza', 'Um exemplo concreto']],
            ['Sustentabilidade começa em casa', 'Mostrar atitudes simples que reduzem o impacto ambiental.',
                ['Consumo consciente', 'Água e energia', 'Lixo e reciclagem', 'O efeito somado de pequenas ações']],
            ['Como lidar com a ansiedade antes de falar em público', 'Explicar por que o nervosismo aparece e como controlá-lo.',
                ['O nervosismo é normal e até útil', 'Preparação reduz o medo', 'Respiração e postura', 'Começar forte nos primeiros segundos']],
            ['Por que as pessoas resistem a mudanças', 'Explicar a resistência à mudança e como conduzir pessoas por ela.',
                ['Medo do desconhecido', 'Perda de controle e de rotina', 'Comunicar o porquê', 'Envolver as pessoas no processo']],
            ['O valor da leitura na era das telas', 'Defender o hábito da leitura frente ao consumo rápido de conteúdo.',
                ['Leitura profunda versus rolagem', 'Vocabulário e argumentação', 'Como criar o hábito', 'Ler em telas conta?']]
        ],
        avancado: [
            ['Redes sociais aproximam ou afastam as pessoas?', 'Tomar uma posição clara e defendê-la com argumentos e contra-argumentos.',
                ['Sua tese em uma frase', 'Dois argumentos a favor', 'O melhor argumento contrário e sua resposta', 'Conclusão que retoma a tese']],
            ['Deveríamos ter uma semana de trabalho de quatro dias?', 'Argumentar sobre a semana de quatro dias com dados, exemplos e posição final.',
                ['Produtividade e bem-estar', 'Custos e setores em que não funciona', 'Experiências de empresas e países', 'Sua proposta']],
            ['O futuro das profissões com a inteligência artificial', 'Analisar quais trabalhos mudam, quais surgem e como se preparar.',
                ['Tarefas automatizáveis versus profissões', 'Novas funções que surgem', 'Habilidades que ganham valor', 'Responsabilidade de empresas e governos']],
            ['Pitch: apresente uma ideia de negócio', 'Fazer um pitch convincente de uma ideia de negócio, real ou imaginária.',
                ['O problema e quem sofre com ele', 'A solução e o diferencial', 'Como o negócio ganha dinheiro', 'O pedido ao investidor']],
            ['Liberdade de expressão tem limites?', 'Discutir os limites da liberdade de expressão com nuance e posição.',
                ['Por que a liberdade de expressão é essencial', 'Onde ela entra em conflito com outros direitos', 'Quem decide o limite', 'Sua posição']],
            ['Como convencer quem pensa diferente', 'Ensinar técnicas de persuasão ética para conversas difíceis.',
                ['Ouvir antes de argumentar', 'Encontrar valores em comum', 'Perguntas em vez de ataques', 'Aceitar avanços pequenos']],
            ['Meritocracia: mito ou realidade?', 'Analisar a meritocracia considerando esforço e ponto de partida.',
                ['O que o conceito promete', 'O peso das condições de partida', 'Onde o mérito funciona', 'Que sistema seria mais justo']],
            ['Apresente um projeto à diretoria', 'Simular a defesa de um projeto para executivos que têm pouco tempo.',
                ['Resumo em uma frase', 'Problema, impacto e números', 'Plano, prazo e custo', 'Riscos e decisão que você pede']],
            ['A educação deveria ensinar habilidades socioemocionais?', 'Defender uma posição sobre o ensino de habilidades socioemocionais nas escolas.',
                ['O que são essas habilidades', 'Impacto na vida adulta e no trabalho', 'Críticas e riscos', 'Como implementar bem']],
            ['O consumo de notícias falsas e a responsabilidade de cada um', 'Explicar como a desinformação se espalha e o papel do cidadão.',
                ['Por que notícias falsas viralizam', 'O custo para a sociedade', 'Como checar antes de compartilhar', 'O papel das plataformas']],
            ['Discurso de homenagem a um mentor', 'Fazer um discurso emocionante e estruturado em homenagem a alguém.',
                ['Quem é e como vocês se conheceram', 'Uma história que mostra quem a pessoa é', 'O legado que ela deixa', 'O agradecimento final']],
            ['Vale a pena empreender no Brasil?', 'Avaliar riscos e oportunidades de empreender e chegar a uma recomendação.',
                ['Burocracia, impostos e crédito', 'Mercado grande e problemas a resolver', 'Perfil de quem se dá bem', 'Sua recomendação']]
        ]
    };

    function montar(nivel, linha) {
        return {
            titulo: linha[0],
            objetivo: linha[1],
            pontos: linha[2].slice(),
            nivel: nivel,
            origem: 'banco'
        };
    }

    /* Sorteia evitando os temas já treinados, enquanto houver algum novo. */
    function sortear(nivel, jaFeitos) {
        var lista = BANCO[nivel] || BANCO.intermediario;
        var feitos = jaFeitos || [];
        var novos = lista.filter(function (l) { return feitos.indexOf(l[0]) < 0; });
        var pool = novos.length ? novos : lista;
        return montar(nivel, pool[Math.floor(Math.random() * pool.length)]);
    }

    function todos(nivel) {
        return (BANCO[nivel] || []).map(function (l) { return montar(nivel, l); });
    }

    return { NIVEIS: NIVEIS, sortear: sortear, todos: todos };
})();
