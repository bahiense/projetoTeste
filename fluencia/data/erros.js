/* =========================================================
   Erros de brasileiro — interferência do português.

   Não são "erros bobos": são a estrutura do português vazando.
   Cada um tem uma frase de teste para a boca gravar a forma
   certa por repetição, não por regra.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.erros = [

    /* ----- falsos amigos ----- */
    { tipo: 'falso-amigo', errado: 'I pretend to travel next year.', certo: 'I intend / plan to travel next year.', porque: '"Pretend" é FINGIR. Você acabou de dizer que finge viajar.' },
    { tipo: 'falso-amigo', errado: 'Actually I live in Brazil.', certo: 'Currently / Right now I live in Brazil.', porque: '"Actually" é "na verdade", não "atualmente".' },
    { tipo: 'falso-amigo', errado: 'Eventually I go to the gym.', certo: 'Occasionally / Sometimes I go to the gym.', porque: '"Eventually" é "no fim das contas", não "eventualmente".' },
    { tipo: 'falso-amigo', errado: 'I need to realize this task.', certo: 'I need to carry out / do this task.', porque: '"Realize" é perceber, dar-se conta.' },
    { tipo: 'falso-amigo', errado: 'She is very sensible about it.', certo: 'She is very sensitive about it.', porque: '"Sensible" é sensato; "sensitive" é sensível.' },
    { tipo: 'falso-amigo', errado: 'I did a college course.', certo: 'I took a university course.', porque: 'Nos EUA "college" é a faculdade, mas o verbo é "take", não "do".' },
    { tipo: 'falso-amigo', errado: 'My parents came to the party.', certo: 'My relatives came to the party.', porque: '"Parents" é só pai e mãe. Parentes = relatives.' },
    { tipo: 'falso-amigo', errado: 'The fabric produces shoes.', certo: 'The factory produces shoes.', porque: '"Fabric" é tecido.' },
    { tipo: 'falso-amigo', errado: 'I have a compromise at three.', certo: 'I have an appointment at three.', porque: '"Compromise" é acordo com concessão.' },
    { tipo: 'falso-amigo', errado: 'Push the door to open.', certo: '(cuidado) Push = empurrar; Pull = puxar.', porque: 'O clássico da porta. "Puxe" parece "push" mas é "pull".' },
    { tipo: 'falso-amigo', errado: 'This is a comprehensive person.', certo: 'This is an understanding person.', porque: '"Comprehensive" é abrangente.' },
    { tipo: 'falso-amigo', errado: 'The costume here is different.', certo: 'The custom here is different.', porque: '"Costume" é fantasia, roupa de festa.' },
    { tipo: 'falso-amigo', errado: 'I assisted the game yesterday.', certo: 'I watched the game yesterday.', porque: '"Assist" é ajudar.' },
    { tipo: 'falso-amigo', errado: 'He has a good education.', certo: 'He has good manners. / He is well-educated (escolaridade).', porque: '"Education" é escolaridade, não boa educação.' },
    { tipo: 'falso-amigo', errado: 'Support this noise', certo: 'Put up with / stand this noise', porque: '"Support" é apoiar, não suportar.' },

    /* ----- tradução literal ----- */
    { tipo: 'literal', errado: 'I have 34 years.', certo: "I'm 34 (years old).", porque: 'Idade é com o verbo TO BE. Erro mais comum do Brasil.' },
    { tipo: 'literal', errado: 'I am with hunger. / I am with cold.', certo: "I'm hungry. / I'm cold.", porque: 'Estado é adjetivo, não "estar com".' },
    { tipo: 'literal', errado: 'I have 10 years of experience in this. (ok)', certo: "I've had 10 years of experience — ou 'I have 10 years of experience'.", porque: 'Este é aceitável; o erro vizinho é "I have 34 years".' },
    { tipo: 'literal', errado: 'Make a question.', certo: 'Ask a question.', porque: 'Pergunta se "pede", não se "faz".' },
    { tipo: 'literal', errado: 'I did a mistake.', certo: 'I made a mistake.', porque: 'Erro se "faz" com MAKE.' },
    { tipo: 'literal', errado: 'Explain me this.', certo: 'Explain this to me.', porque: '"Explain" exige TO antes da pessoa. Vale para "say" também.' },
    { tipo: 'literal', errado: 'It depends of the client.', certo: 'It depends on the client.', porque: 'Preposição fixa: depend ON.' },
    { tipo: 'literal', errado: 'I am agree with you.', certo: 'I agree with you.', porque: '"Agree" já é verbo. Não leva TO BE.' },
    { tipo: 'literal', errado: 'The people is late.', certo: 'The people are late.', porque: '"People" é plural. Sempre.' },
    { tipo: 'literal', errado: 'I have a doubt.', certo: 'I have a question.', porque: '"Doubt" é dúvida no sentido de desconfiança.' },
    { tipo: 'literal', errado: 'Everybody are ready.', certo: 'Everybody is ready.', porque: '"Everybody / everyone" é singular. Ao contrário de "people".' },
    { tipo: 'literal', errado: 'I am here since Monday.', certo: "I've been here since Monday.", porque: 'Ação que começou no passado e continua = present perfect.' },
    { tipo: 'literal', errado: 'I work here since 2019.', certo: "I've worked / I've been working here since 2019.", porque: 'O mesmo erro, na forma mais frequente.' },
    { tipo: 'literal', errado: 'Yesterday I have gone to the office.', certo: 'Yesterday I went to the office.', porque: 'Com tempo passado definido, use passado simples.' },
    { tipo: 'literal', errado: 'I go to there.', certo: 'I go there.', porque: '"There / home" não levam TO.' },
    { tipo: 'literal', errado: 'She said me that...', certo: 'She told me that... / She said that...', porque: 'SAY não leva pessoa direto; TELL leva.' },
    { tipo: 'literal', errado: 'How is called this?', certo: 'What is this called?', porque: 'Pergunta com WHAT, não HOW.' },
    { tipo: 'literal', errado: 'I know to swim.', certo: 'I know how to swim.', porque: 'KNOW + HOW TO para habilidade.' },
    { tipo: 'literal', errado: 'Take a decision.', certo: 'Make a decision.', porque: 'Decisão se faz com MAKE.' },
    { tipo: 'literal', errado: 'I lost the flight.', certo: 'I missed the flight.', porque: 'Perder no sentido de não pegar = MISS.' },
    { tipo: 'literal', errado: 'Give a look at this.', certo: 'Take a look at this.', porque: 'Colocação fixa com TAKE.' },
    { tipo: 'literal', errado: 'Any news? — "Novidades?"', certo: 'Any news? / What is new?', porque: 'Cuidado: "news" é incontável e singular: "the news IS good".' },
    { tipo: 'literal', errado: 'I have much work.', certo: 'I have a lot of work.', porque: '"Much" em afirmativa soa livresco. Use "a lot of".' },
    { tipo: 'literal', errado: 'More or less', certo: 'Sort of / kind of / roughly', porque: '"More or less" existe, mas soa traduzido em resposta rápida.' },
    { tipo: 'literal', errado: 'Until now I did not receive.', certo: "So far I haven't received it.", porque: '"Until now" é raro; "so far" é o natural.' },
    { tipo: 'literal', errado: 'I am accustomed to work late.', certo: "I'm used to working late.", porque: 'USED TO + verbo com -ING quando é hábito atual.' },
    { tipo: 'literal', errado: 'He suggested me to go.', certo: 'He suggested that I go. / He suggested going.', porque: 'SUGGEST nunca leva "me to".' },

    /* ----- gramática sob pressão ----- */
    { tipo: 'gramatica', errado: 'If I would have time, I would go.', certo: 'If I had time, I would go.', porque: 'No IF não entra "would". Nunca.' },
    { tipo: 'gramatica', errado: 'I did not went.', certo: "I didn't go.", porque: 'Com DID o verbo volta ao infinitivo.' },
    { tipo: 'gramatica', errado: 'She do not like it.', certo: "She doesn't like it.", porque: 'Terceira pessoa: does.' },
    { tipo: 'gramatica', errado: 'I am working here for 3 years.', certo: "I've been working here for 3 years.", porque: 'Duração até agora = present perfect continuous.' },
    { tipo: 'gramatica', errado: 'Do you can help me?', certo: 'Can you help me?', porque: 'Modal não leva auxiliar.' },
    { tipo: 'gramatica', errado: 'I have 2 informations.', certo: 'I have two pieces of information.', porque: 'Information, advice, feedback e equipment são incontáveis.' },
    { tipo: 'gramatica', errado: 'The most part of people.', certo: 'Most people.', porque: 'Sem "the", sem "part", sem "of".' },
    { tipo: 'gramatica', errado: 'I asked for him to come.', certo: 'I asked him to come.', porque: 'ASK não leva FOR antes de pessoa.' },
    { tipo: 'gramatica', errado: 'It has many people here.', certo: 'There are many people here.', porque: '"Ter" existencial em inglês é THERE IS / THERE ARE.' },
    { tipo: 'gramatica', errado: 'I look forward to hear from you.', certo: 'I look forward to hearing from you.', porque: 'O TO aqui é preposição: pede -ING.' },

    /* ----- pragmática: soar rude sem querer ----- */
    { tipo: 'pragmatica', errado: 'Send me the file.', certo: 'Could you send me the file when you get a chance?', porque: 'O imperativo direto, normal em português, soa ordem seca em inglês.' },
    { tipo: 'pragmatica', errado: 'I want a coffee.', certo: "Could I get a coffee, please? / I'll have a coffee.", porque: '"I want" é de criança pedindo. Em loja soa grosseiro.' },
    { tipo: 'pragmatica', errado: 'You are wrong.', certo: "I'm not sure that's right — my numbers show something different.", porque: 'Correção direta em público custa relação em cultura anglófona.' },
    { tipo: 'pragmatica', errado: 'No.', certo: "I'd love to, but I can't this week.", porque: 'Um "no" seco encerra a interação e soa hostil.' },
    { tipo: 'pragmatica', errado: 'Sorry for my English.', certo: '(não diga nada) ou "Bear with me, English is my second language."', porque: 'Pedir desculpa pelo inglês baixa sua autoridade e não melhora nada. É o pior hábito do brasileiro.' },
    { tipo: 'pragmatica', errado: 'Repeat, please.', certo: 'Sorry, could you say that again?', porque: '"Repeat" soa comando de professor para aluno.' },
    { tipo: 'pragmatica', errado: 'I did not understand nothing.', certo: "I didn't catch that last part.", porque: 'Além da dupla negativa, admitir "nada" fecha a conversa. Localize o que faltou.' },
    { tipo: 'pragmatica', errado: 'Your idea is bad.', certo: 'I see the appeal — my worry is the cost.', porque: 'Critique a ideia pelo risco específico, não pelo valor geral.' },
    { tipo: 'pragmatica', errado: 'It is obvious.', certo: 'I think it comes down to...', porque: '"Obvious" acusa o outro de burrice sem querer.' },
    { tipo: 'pragmatica', errado: 'Calm down.', certo: "Let's take a step back.", porque: '"Calm down" incendeia qualquer conversa, em qualquer língua.' }
];
