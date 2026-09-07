/* =========================================================
   Erros de brasileiro — segunda parte.

   Os da primeira parte são os que quebram a frase. Estes são
   os que passam despercebidos por anos e denunciam
   estrangeiro mesmo em quem fala bem.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.erros = F.data.erros.concat([

    /* ----- falsos amigos ----- */
    { tipo: 'falso-amigo', errado: 'I need to push the button to record.', certo: '(cuidado) push = apertar/empurrar; pull = puxar.', porque: 'Aqui está certo, mas o par push/pull inverte para quem lê "puxe".' },
    { tipo: 'falso-amigo', errado: 'She is very exquisite about food.', certo: 'She is very picky about food.', porque: '"Exquisite" é primoroso, refinado — elogio, não implicância.' },
    { tipo: 'falso-amigo', errado: 'I read a magazine of the store.', certo: 'I read a catalogue from the store.', porque: '"Magazine" é revista; loja é "store" ou "shop".' },
    { tipo: 'falso-amigo', errado: 'The novel passes in the 1920s.', certo: 'The novel is set in the 1920s.', porque: '"Novel" é romance (livro); novela de TV é "soap opera".' },
    { tipo: 'falso-amigo', errado: 'I have a large agenda today.', certo: 'I have a full schedule today.', porque: '"Agenda" em inglês é a pauta de uma reunião.' },
    { tipo: 'falso-amigo', errado: 'He is a very particular person.', certo: 'He is a private person. / He is a specific kind of person.', porque: '"Particular" é exigente ou específico, não "reservado".' },
    { tipo: 'falso-amigo', errado: 'The office is in the second floor of the building.', certo: 'On the second floor.', porque: 'Andar leva ON. E cuidado: "first floor" no Reino Unido é o nosso segundo.' },
    { tipo: 'falso-amigo', errado: 'I need to confirm my presence.', certo: 'I need to RSVP. / I need to confirm I am coming.', porque: '"Confirm my presence" é tradução literal e soa estranho.' },
    { tipo: 'falso-amigo', errado: 'This is a very actual topic.', certo: 'This is a very current topic.', porque: 'De novo o par actual/current — o erro mais persistente de todos.' },
    { tipo: 'falso-amigo', errado: 'He has a good notion of English.', certo: 'He has a good grasp of English.', porque: '"Notion" é ideia vaga; domínio é "grasp" ou "command".' },
    { tipo: 'falso-amigo', errado: 'I am attending a client right now.', certo: 'I am helping a customer right now.', porque: '"Attend" é comparecer a algo, não atender alguém.' },
    { tipo: 'falso-amigo', errado: 'We need to divulge the event.', certo: 'We need to promote / publicize the event.', porque: '"Divulge" é revelar um segredo.' },
    { tipo: 'falso-amigo', errado: 'The service was very prejudicial.', certo: 'The service was harmful / damaging.', porque: '"Prejudicial" existe, mas soa jurídico e raro. E "prejudice" é preconceito.' },
    { tipo: 'falso-amigo', errado: 'I will resume the meeting in one page.', certo: 'I will summarize the meeting in one page.', porque: '"Resume" é retomar; resumir é "summarize".' },
    { tipo: 'falso-amigo', errado: 'Can you retire the money for me?', certo: 'Can you withdraw the money for me?', porque: '"Retire" é aposentar-se.' },

    /* ----- tradução literal ----- */
    { tipo: 'literal', errado: 'I am going to make a party.', certo: 'I am going to throw / have a party.', porque: 'Festa não se "faz" com make.' },
    { tipo: 'literal', errado: 'Let me see if I understood.', certo: 'Let me see if I understand.', porque: 'Presente para verificar compreensão agora.' },
    { tipo: 'literal', errado: 'I am with 10 years of company.', certo: 'I have been with the company for 10 years.', porque: 'De novo o "estar com" traduzido ao pé da letra.' },
    { tipo: 'literal', errado: 'Nowadays in day...', certo: 'Nowadays / These days...', porque: '"Hoje em dia" traduzido inteiro vira redundância.' },
    { tipo: 'literal', errado: 'I have difficulty to speak.', certo: 'I have difficulty speaking.', porque: 'Difficulty pede -ING.' },
    { tipo: 'literal', errado: 'It is very difficult of doing.', certo: 'It is very difficult to do.', porque: 'Sem "of" antes do infinitivo.' },
    { tipo: 'literal', errado: 'I passed one year in London.', certo: 'I spent a year in London.', porque: 'Tempo se "gasta" com spend.' },
    { tipo: 'literal', errado: 'She has reason.', certo: 'She is right.', porque: '"Ter razão" é ser certo, com TO BE.' },
    { tipo: 'literal', errado: 'How much time do you have of experience?', certo: 'How much experience do you have?', porque: 'Ordem e vocabulário direto.' },
    { tipo: 'literal', errado: 'I go to the doctor tomorrow.', certo: "I'm going to the doctor tomorrow.", porque: 'Compromisso marcado no futuro pede present continuous.' },
    { tipo: 'literal', errado: 'What is the hour?', certo: 'What time is it?', porque: 'Pergunta fixa, sem tradução possível.' },
    { tipo: 'literal', errado: 'I stay very happy when you come.', certo: 'I get very happy when you come. / It makes me happy.', porque: '"Ficar" é GET (mudança de estado), não STAY (permanecer).' },
    { tipo: 'literal', errado: 'He is fault.', certo: "It's his fault.", porque: 'Culpa é posse: his fault, my fault.' },
    { tipo: 'literal', errado: 'Congratulations for your work.', certo: 'Congratulations on your work.', porque: 'Preposição fixa: congratulations ON.' },
    { tipo: 'literal', errado: 'I forgot my keys in the office.', certo: 'I left my keys at the office.', porque: '"Forget" não leva lugar; deixar algo em algum lugar é LEAVE.' },
    { tipo: 'literal', errado: 'Tell me about you.', certo: 'Tell me about yourself.', porque: 'Reflexivo obrigatório — e é a pergunta mais comum de entrevista.' },
    { tipo: 'literal', errado: 'I am boring in this meeting.', certo: 'I am bored in this meeting.', porque: '-ING descreve a coisa; -ED descreve você. "I am boring" = eu sou chato.' },
    { tipo: 'literal', errado: 'The travel was long.', certo: 'The trip was long.', porque: '"Travel" é o ato de viajar (incontável); a viagem é "trip" ou "journey".' },
    { tipo: 'literal', errado: 'I will make a course of English.', certo: 'I am going to take an English course.', porque: 'Curso se "faz" com take.' },
    { tipo: 'literal', errado: 'She works like a nurse.', certo: 'She works as a nurse.', porque: '"Like" compara; "as" indica função. Com like, ela imita uma enfermeira.' },

    /* ----- gramática sob pressão ----- */
    { tipo: 'gramatica', errado: 'If I will have time, I will call.', certo: 'If I have time, I will call.', porque: 'Depois de IF, presente — mesmo falando do futuro.' },
    { tipo: 'gramatica', errado: 'I am here since two hours.', certo: 'I have been here for two hours.', porque: 'SINCE marca ponto no tempo; FOR marca duração.' },
    { tipo: 'gramatica', errado: 'Everybody have finished.', certo: 'Everybody has finished.', porque: 'Everybody é singular.' },
    { tipo: 'gramatica', errado: 'I did not saw him.', certo: 'I did not see him.', porque: 'Com DID, o verbo volta ao infinitivo.' },
    { tipo: 'gramatica', errado: 'She is more tall than me.', certo: 'She is taller than me.', porque: 'Adjetivo curto leva -er, não "more".' },
    { tipo: 'gramatica', errado: 'It is the more important thing.', certo: 'It is the most important thing.', porque: 'Superlativo com "the most".' },
    { tipo: 'gramatica', errado: 'I have went there twice.', certo: 'I have been there twice.', porque: 'Particípio de go é gone; e para experiência usa-se "been".' },
    { tipo: 'gramatica', errado: 'He suggested to go early.', certo: 'He suggested going early.', porque: 'Suggest pede -ING.' },
    { tipo: 'gramatica', errado: 'I look forward to meet you.', certo: 'I look forward to meeting you.', porque: 'Aqui TO é preposição — pede -ING. Erro que aparece em e-mail formal.' },
    { tipo: 'gramatica', errado: 'Despite of the rain, we went.', certo: 'Despite the rain, we went. / In spite of the rain...', porque: '"Despite" nunca leva OF.' },
    { tipo: 'gramatica', errado: 'I told to him the truth.', certo: 'I told him the truth.', porque: 'TELL não leva TO antes da pessoa.' },
    { tipo: 'gramatica', errado: 'There is many reasons.', certo: 'There are many reasons.', porque: 'Concordância com o plural que vem depois.' },
    { tipo: 'gramatica', errado: 'She does not likes it.', certo: 'She does not like it.', porque: 'O -s já está no DOES.' },
    { tipo: 'gramatica', errado: 'I want that you come.', certo: 'I want you to come.', porque: 'WANT não aceita "that" — usa infinitivo com TO.' },
    { tipo: 'gramatica', errado: 'It was me who called.', certo: 'It was I who called. (formal) / It was me. (falado)', porque: 'Na fala real "me" é aceito; em texto formal, não.' },

    /* ----- pragmática ----- */
    { tipo: 'pragmatica', errado: 'You must do it like this.', certo: 'You might want to do it like this.', porque: '"Must" para outra pessoa soa ordem militar.' },
    { tipo: 'pragmatica', errado: 'Why did you do that?', certo: 'What was the thinking behind that?', porque: '"Why did you" soa acusação; reformular tira a carga.' },
    { tipo: 'pragmatica', errado: 'I need this now.', certo: 'Is there any chance you could get this to me today?', porque: 'Urgência sem embalagem soa desespero ou grosseria.' },
    { tipo: 'pragmatica', errado: 'That is not my job.', certo: "That's outside what I own, but let me point you to the right person.", porque: 'A frase original encerra a relação; a segunda resolve o problema.' },
    { tipo: 'pragmatica', errado: 'I told you.', certo: "We did talk about this — let's figure out where it broke.", porque: '"Eu avisei" é vitória de curto prazo e derrota de longo.' },
    { tipo: 'pragmatica', errado: 'Of course!', certo: 'Sure! / Absolutely!', porque: '"Of course" respondendo pergunta sincera soa "óbvio, seu bobo".' },
    { tipo: 'pragmatica', errado: 'Please, do it.', certo: 'When you get a chance, could you do it?', porque: '"Please" no imperativo não suaviza — reforça a ordem.' },
    { tipo: 'pragmatica', errado: 'I did not understand your accent.', certo: "Sorry, I didn't catch that.", porque: 'Culpar o sotaque do outro é ofensivo; culpe o ambiente ou a si mesmo.' },
    { tipo: 'pragmatica', errado: 'Are you sure?', certo: 'Just to double-check — is that the final number?', porque: '"Are you sure?" repetido soa desconfiança.' },
    { tipo: 'pragmatica', errado: 'I disagree.', certo: "I see it a bit differently — can I share why?", porque: 'A discordância seca fecha a porta antes do argumento.' }
]);
