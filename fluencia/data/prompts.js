/* =========================================================
   Falar sob pressão — os temas.

   Regra do CTM: fale o tempo inteiro, sem parar, mesmo errado.
   Corrigir vem depois. Quem para para pensar a palavra certa
   nunca chega à fluência — chega à tradução rápida, que é outra
   coisa e cansa muito mais.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.prompts = {

    /* Falar sozinho, sem parar, cronometrado. */
    monologo: [
        { p: 'Describe your morning today, minute by minute, from waking up to now.', pt: 'Descreva sua manhã de hoje, minuto a minuto.', n: 1, t: 60 },
        { p: 'Explain your job to a ten-year-old.', pt: 'Explique seu trabalho para uma criança de dez anos.', n: 1, t: 60 },
        { p: 'What did you eat yesterday, and was it any good?', pt: 'O que você comeu ontem, e estava bom?', n: 1, t: 60 },
        { p: 'Describe the room you are in right now, in detail.', pt: 'Descreva o cômodo onde você está, em detalhe.', n: 1, t: 60 },
        { p: 'Tell the story of how you got your current job.', pt: 'Conte como você conseguiu seu trabalho atual.', n: 2, t: 90 },
        { p: 'What is the most useless thing you own, and why do you keep it?', pt: 'Qual a coisa mais inútil que você tem, e por que guarda?', n: 2, t: 90 },
        { p: 'Describe someone in your family without saying their name.', pt: 'Descreva alguém da família sem dizer o nome.', n: 2, t: 90 },
        { p: 'Talk about a decision you regret.', pt: 'Fale sobre uma decisão da qual se arrepende.', n: 2, t: 90 },
        { p: 'What would you do with six months off and no money problems?', pt: 'O que faria com seis meses de folga e sem problema de dinheiro?', n: 2, t: 90 },
        { p: 'Explain how to make your favorite dish, step by step.', pt: 'Explique como fazer seu prato favorito, passo a passo.', n: 2, t: 90 },
        { p: 'Describe the worst trip you have ever taken.', pt: 'Descreva a pior viagem que você já fez.', n: 2, t: 120 },
        { p: 'What is something everyone believes that you think is wrong?', pt: 'O que todo mundo acredita e você acha errado?', n: 3, t: 120 },
        { p: 'Argue for something you personally disagree with.', pt: 'Defenda algo de que você discorda.', n: 3, t: 120 },
        { p: 'Explain the biggest problem in your industry and how you would fix it.', pt: 'Explique o maior problema do seu setor e como resolveria.', n: 3, t: 120 },
        { p: 'Tell a story that makes you look bad, and be honest about it.', pt: 'Conte uma história em que você não sai bem na foto.', n: 3, t: 120 },
        { p: 'What has changed in your country in the last ten years?', pt: 'O que mudou no seu país nos últimos dez anos?', n: 3, t: 120 },
        { p: 'Describe a person who changed your life, and what exactly they did.', pt: 'Descreva alguém que mudou sua vida, e o que exatamente fez.', n: 3, t: 120 },
        { p: 'If you had to leave your country tomorrow, where would you go and why?', pt: 'Se tivesse que sair do país amanhã, para onde iria?', n: 3, t: 120 },
        { p: 'Explain something technical from your work to a non-technical audience.', pt: 'Explique algo técnico do seu trabalho para leigos.', n: 3, t: 150 },
        { p: 'What advice would you give yourself ten years ago — and would you have listened?', pt: 'Que conselho daria a si mesmo dez anos atrás?', n: 3, t: 150 }
    ],

    /* Perguntas reais de entrevista, das mais pedidas às mais cruéis. */
    entrevista: [
        { p: 'Tell me about yourself.', pt: 'Fale sobre você.', n: 1, t: 90, dica: 'Presente → passado → futuro. Dois minutos no máximo, um é melhor.' },
        { p: 'Why are you interested in this role?', pt: 'Por que essa vaga te interessa?', n: 1, t: 60, dica: 'Sobre a empresa e o problema, não sobre o seu currículo.' },
        { p: 'What are you best at?', pt: 'No que você é melhor?', n: 1, t: 60 },
        { p: 'Walk me through your resume.', pt: 'Me guie pelo seu currículo.', n: 2, t: 120, dica: 'Transições: "and that led me to...".' },
        { p: 'Tell me about a conflict with a coworker.', pt: 'Fale de um conflito com um colega.', n: 2, t: 120, dica: 'Nunca faça o outro de vilão.' },
        { p: 'Describe a time you failed.', pt: 'Descreva uma vez em que você falhou.', n: 2, t: 120 },
        { p: 'What is your biggest weakness?', pt: 'Qual sua maior fraqueza?', n: 2, t: 90, dica: 'Fraqueza real + o que você fez a respeito.' },
        { p: 'Why are you leaving your current job?', pt: 'Por que está saindo do emprego atual?', n: 2, t: 90, dica: 'Nunca fale mal do chefe. Fale do que você busca.' },
        { p: 'Tell me about a time you had to convince someone senior.', pt: 'Uma vez em que teve que convencer alguém acima de você.', n: 3, t: 120 },
        { p: 'How do you prioritize when everything is urgent?', pt: 'Como prioriza quando tudo é urgente?', n: 3, t: 120 },
        { p: 'Give me an example of a decision you made with incomplete information.', pt: 'Uma decisão tomada com informação incompleta.', n: 3, t: 120 },
        { p: 'What would your last manager say is hard about working with you?', pt: 'O que seu último chefe diria de difícil em trabalhar com você?', n: 3, t: 120, dica: 'A pergunta mais cruel que existe. Responda de verdade.' },
        { p: 'Where do you see yourself in five years?', pt: 'Onde se vê em cinco anos?', n: 2, t: 90 },
        { p: 'What are your salary expectations?', pt: 'Qual sua expectativa salarial?', n: 3, t: 60, dica: 'Faixa, com justificativa, e devolva a pergunta.' },
        { p: 'Do you have any questions for us?', pt: 'Tem perguntas para nós?', n: 1, t: 90, dica: 'Sempre tenha três. Não ter é a maior bandeira vermelha.' }
    ],

    /* "Ensine a lição": o coração do método missionário.
       Você aprende a língua ensinando conteúdo nela. */
    ensinar: [
        { p: 'Teach me how to use the metro in your city, as if I just landed.', pt: 'Ensine como usar o metrô da sua cidade.', n: 1, t: 120 },
        { p: 'Teach me a skill you have that most people do not.', pt: 'Ensine uma habilidade sua que a maioria não tem.', n: 2, t: 150 },
        { p: 'Teach me the rules of a game you love, well enough for me to play.', pt: 'Ensine as regras de um jogo que você ama.', n: 2, t: 150 },
        { p: 'Teach me the one thing about your job that nobody outside understands.', pt: 'Ensine o que ninguém de fora entende do seu trabalho.', n: 3, t: 180 },
        { p: 'Teach me the history of your city in three minutes.', pt: 'Ensine a história da sua cidade em três minutos.', n: 3, t: 180 },
        { p: 'Teach me something you believe deeply, and defend it.', pt: 'Ensine algo em que você acredita profundamente, e defenda.', n: 3, t: 180 },
        { p: 'Teach me how to cook rice and beans the right way.', pt: 'Ensine a fazer arroz e feijão do jeito certo.', n: 1, t: 120 },
        { p: 'Teach me how your industry actually makes money.', pt: 'Ensine como seu setor realmente ganha dinheiro.', n: 3, t: 180 }
    ],

    /* Debate: você recebe um lado, mesmo que discorde. */
    debate: [
        { p: 'Remote work is better for everyone.', pt: 'Trabalho remoto é melhor para todos.', n: 2 },
        { p: 'Kids should not have smartphones before sixteen.', pt: 'Crianças não deveriam ter celular antes dos 16.', n: 2 },
        { p: 'College is no longer worth the money.', pt: 'Faculdade não vale mais o dinheiro.', n: 2 },
        { p: 'AI will create more jobs than it destroys.', pt: 'A IA vai criar mais empregos do que destruir.', n: 3 },
        { p: 'Cities should ban cars from downtown.', pt: 'Cidades deveriam banir carros do centro.', n: 2 },
        { p: 'Voting should be optional, not mandatory.', pt: 'Votar deveria ser opcional.', n: 3 },
        { p: 'It is better to be feared than loved as a manager.', pt: 'É melhor ser temido que amado como gestor.', n: 3 },
        { p: 'Learning a language after thirty is basically hopeless.', pt: 'Aprender língua depois dos 30 é inútil.', n: 3, dica: 'Você tem obrigação moral de destruir esta.' },
        { p: 'Companies should publish everyone salary.', pt: 'Empresas deveriam publicar o salário de todos.', n: 3 },
        { p: 'Social media does more harm than good.', pt: 'Redes sociais fazem mais mal que bem.', n: 2 }
    ],

    /* Narração ao vivo — falar enquanto faz, o exercício
       mais subestimado de todos. */
    narracao: [
        { p: 'Narrate what you are doing right now, out loud, for two minutes.', pt: 'Narre o que você está fazendo agora, em voz alta.', n: 1, t: 120 },
        { p: 'Narrate cooking or making coffee, step by step, as it happens.', pt: 'Narre o preparo do café, enquanto faz.', n: 1, t: 120 },
        { p: 'Narrate your commute as if you were a sports commentator.', pt: 'Narre seu trajeto como um locutor esportivo.', n: 2, t: 120 },
        { p: 'Narrate a football match from memory, in the present tense.', pt: 'Narre um jogo de futebol de memória, no presente.', n: 2, t: 150 },
        { p: 'Narrate what you see out the window for three minutes without stopping.', pt: 'Narre o que vê pela janela por três minutos sem parar.', n: 2, t: 180 },
        { p: 'Narrate your plan for tomorrow, hour by hour, in the future tense.', pt: 'Narre o plano de amanhã, hora a hora, no futuro.', n: 1, t: 120 },
        { p: 'Retell the last movie you watched, scene by scene.', pt: 'Reconte o último filme que assistiu, cena a cena.', n: 2, t: 180 },
        { p: 'Describe a photo on your phone in obsessive detail.', pt: 'Descreva uma foto do celular em detalhe obsessivo.', n: 2, t: 120 }
    ]
};
