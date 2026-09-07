/* =========================================================
   Role-play — segunda parte.

   Doze cenas não cobrem um ano. Estas seguem a mesma forma:
   contexto real, objetivo verificável e blocos obrigatórios,
   porque o que faz o exercício funcionar é ter algo a
   resolver, não ter algo a repetir.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.dialogos = F.data.dialogos.concat([

    {
        id: 'dl-emergencia', titulo: 'Ligação de emergência', nivel: 2,
        contexto: 'Você presenciou um acidente na rua e ligou para o 911.',
        seuPapel: 'Quem ligou', papelBot: 'Atendente de emergência',
        objetivo: 'Passar local, situação e estado da vítima em frases curtas e claras. Aqui rodeio custa vida.',
        obrigatorios: ['There has been an accident', 'He is conscious', 'How long until'],
        turnos: [
            { bot: "911, what's your emergency?", pt: '911, qual é a emergência?', dica: 'Primeira frase: o que aconteceu. Nada antes disso.', modelo: "There's been an accident — a car hit a cyclist." },
            { bot: "What's your location?", pt: 'Qual a sua localização?', dica: 'Rua, cruzamento, ponto de referência.', modelo: "Corner of Fifth and Oak, right in front of the pharmacy." },
            { bot: "Is the person conscious and breathing?", pt: 'A pessoa está consciente e respirando?', dica: 'Responda os dois itens, na ordem.', modelo: "He's conscious and breathing, but his leg looks broken and he can't move." },
            { bot: "Stay with him. Don't move him. Help is on the way.", pt: 'Fique com ele. Não o mova. A ajuda está a caminho.', dica: 'Confirme e pergunte o tempo.', modelo: "Understood, I won't move him. How long until they get here?" },
            { bot: "About four minutes. Stay on the line with me.", pt: 'Uns quatro minutos. Fique na linha comigo.', dica: 'Continue informando o que vê.', modelo: "I'm here. He's talking to me — he says he's dizzy but he knows where he is." }
        ],
        desafio: 'Refaça com uma emergência diferente: incêndio, desmaio, assalto.'
    },

    {
        id: 'dl-carro', titulo: 'Balcão de aluguel de carro', nivel: 2,
        contexto: 'Aeroporto, fim de viagem longa, e o atendente quer te empurrar seguro e upgrade.',
        seuPapel: 'Cliente', papelBot: 'Atendente vendedor',
        objetivo: 'Sair com o carro que você reservou, pelo preço que reservou. Dizer não três vezes, educadamente.',
        obrigatorios: ['I already have', 'No thanks, I am all set', 'Could you show me the total'],
        turnos: [
            { bot: "Welcome! I see you booked the compact. Can I interest you in an SUV for just fifteen more a day?", pt: 'Bem-vindo! Vejo que reservou o compacto. Posso te oferecer um SUV por só quinze a mais por dia?', dica: 'Recusa clara e simpática, sem justificar demais.', modelo: "No thanks, I'm all set with the compact." },
            { bot: "Sure. And for insurance, our full coverage is only twenty-nine a day.", pt: 'Claro. E de seguro, nossa cobertura total sai por vinte e nove ao dia.', dica: 'Diga que já tem cobertura — a frase que encerra a insistência.', modelo: "I already have coverage through my credit card, so I'll decline that." },
            { bot: "Are you sure? Without it you're liable for the full value of the vehicle.", pt: 'Tem certeza? Sem ele você responde pelo valor total do veículo.', dica: 'Mantenha a posição sem endurecer.', modelo: "I understand the risk, and I'm still going to decline. Thanks for explaining it." },
            { bot: "All right. You're all set — just sign here.", pt: 'Tudo bem. Está tudo certo — assine aqui.', dica: 'Antes de assinar: confira o total.', modelo: "Before I sign, could you show me the total with all the fees included?" },
            { bot: "Of course — it's two hundred and ten for four days, plus tax.", pt: 'Claro — duzentos e dez por quatro dias, mais impostos.', dica: 'Confirme e feche.', modelo: "That matches my reservation. Perfect — where do I pick it up?" }
        ],
        desafio: 'Refaça e negocie um upgrade gratuito por causa de um atraso no voo.'
    },

    {
        id: 'dl-aumento', titulo: 'Pedindo aumento', nivel: 3,
        contexto: '1:1 com seu gestor. Você preparou os números.',
        seuPapel: 'Você', papelBot: 'Gestora cautelosa',
        objetivo: 'Sair com um número ou uma data. Nunca com um "vamos ver".',
        obrigatorios: ['I would like to talk about compensation', 'Since March', 'What would it take'],
        turnos: [
            { bot: "Hey, we have half an hour. What's on your mind?", pt: 'Oi, temos meia hora. O que você tem em mente?', dica: 'Anuncie o assunto na primeira frase. Sem aquecimento.', modelo: "I'd like to talk about compensation, if this is a good time." },
            { bot: "Okay. Tell me what you're thinking.", pt: 'Certo. Me conte o que você está pensando.', dica: 'Fatos e escopo novo, com data. Nada de necessidade pessoal.', modelo: "Since March I've taken on the vendor relationship and two new regions, and the numbers held up. Based on the market, I'd be looking at around ninety." },
            { bot: "That's a big jump. The budget cycle closed last month.", pt: 'É um salto grande. O ciclo orçamentário fechou mês passado.', dica: 'Não recue no número; peça o caminho.', modelo: "I understand the timing is hard. What would it take to get there — and when could we revisit it?" },
            { bot: "Realistically? I could do five percent now and look again in July.", pt: 'Realisticamente? Consigo cinco por cento agora e reveja em julho.', dica: 'Aceite parcialmente e amarre o compromisso.', modelo: "I'll take the five percent. Can we put July in writing, with the criteria we'd use?" },
            { bot: "That's fair. Send me a summary and I'll confirm it by email.", pt: 'É justo. Me manda um resumo e eu confirmo por e-mail.', dica: 'Feche com prazo seu, não dela.', modelo: "It'll be in your inbox this afternoon. Thanks for taking it seriously." }
        ],
        desafio: 'Refaça com uma gestora que diz não duas vezes seguidas.'
    },

    {
        id: 'dl-cancelou', titulo: 'Amigo cancelando em cima da hora', nivel: 2,
        contexto: 'Vocês combinaram jantar hoje. Faltam duas horas e ele desmarca — de novo.',
        seuPapel: 'Você', papelBot: 'Amigo culpado',
        objetivo: 'Dizer que incomodou, sem brigar e sem fingir que está tudo bem.',
        obrigatorios: ['To be honest', 'It is not a big deal, but', 'Let us find a day'],
        turnos: [
            { bot: "Hey man, I'm so sorry — something came up and I can't make tonight.", pt: 'Cara, desculpa — surgiu uma coisa e não vou conseguir hoje.', dica: 'Não diga "no problem" automático. Ganhe um segundo.', modelo: "Ah, that's a shame — I'd already left work early." },
            { bot: "I know, I feel terrible. Rain check?", pt: 'Eu sei, me sinto péssimo. Fica para a próxima?', dica: 'Agora a verdade, com suavizador na frente.', modelo: "To be honest, this is the third time — it's not a big deal, but it does bug me a little." },
            { bot: "Yeah... that's fair. Work has been insane, but that's not your problem.", pt: 'É... justo. O trabalho está insano, mas o problema não é seu.', dica: 'Acolha sem apagar o que disse.', modelo: "I get it, and I'm not trying to make you feel worse. I just miss hanging out." },
            { bot: "Same. Let's do next week — I'll actually show up.", pt: 'Também sinto falta. Vamos semana que vem — eu apareço mesmo.', dica: 'Amarre em dia e hora, senão não acontece.', modelo: "Let's find a day right now — Thursday at eight? Put it in your calendar while we're talking." }
        ],
        desafio: 'Refaça sendo você quem cancela, e assuma sem inventar desculpa.'
    },

    {
        id: 'dl-tarefa', titulo: 'Recebendo uma tarefa mal explicada', nivel: 2,
        contexto: 'Seu gestor te passou algo vago numa mensagem e sumiu. Você o pegou no corredor.',
        seuPapel: 'Você', papelBot: 'Gestor apressado',
        objetivo: 'Sair com escopo, prazo e critério de pronto. Perguntar agora custa cinco minutos; não perguntar custa uma semana.',
        obrigatorios: ['Just so I am clear', 'What does done look like', 'By when do you need'],
        turnos: [
            { bot: "Did you see my message? Can you look into the churn thing?", pt: 'Viu minha mensagem? Você consegue olhar aquilo do churn?', dica: 'Repita o que entendeu, para ele corrigir.', modelo: "I did — just so I'm clear, you want an analysis of why customers are leaving, right?" },
            { bot: "Yeah, exactly. Something we can show the board.", pt: 'Isso, exatamente. Algo que a gente possa mostrar ao conselho.', dica: 'Agora o formato, que é o que muda o trabalho.', modelo: "Got it. Are we talking a one-page summary, or a full deck with the data behind it?" },
            { bot: "One page. They won't read more than that.", pt: 'Uma página. Eles não leem mais que isso.', dica: 'Critério de pronto.', modelo: "And what does done look like for you — three reasons with numbers, or a recommendation too?" },
            { bot: "Reasons and a recommendation. You know this better than I do.", pt: 'Motivos e uma recomendação. Você entende disso mais que eu.', dica: 'Prazo, sempre por último e sempre explícito.', modelo: "By when do you need it? And is there anything I should drop to make room?" },
            { bot: "Thursday. Push the pricing review to next week.", pt: 'Quinta. Empurre a revisão de preços para a semana que vem.', dica: 'Repita o combinado inteiro. É o seu seguro.', modelo: "Perfect: one page, three reasons with data, one recommendation, Thursday — and pricing moves to next week." }
        ],
        desafio: 'Refaça com um gestor que responde "sei lá, você que sabe" a tudo.'
    },

    {
        id: 'dl-desconto', titulo: 'Cliente pedindo desconto', nivel: 3,
        contexto: 'Você vende, e o cliente quer trinta por cento a menos.',
        seuPapel: 'Vendedor', papelBot: 'Cliente duro',
        objetivo: 'Defender o preço sem perder o cliente. Trocar desconto por escopo, nunca dar de graça.',
        obrigatorios: ['I understand', 'What I can do is', 'If we reduce'],
        turnos: [
            { bot: "Look, we like the proposal, but it's thirty percent over our budget.", pt: 'Olha, gostamos da proposta, mas está trinta por cento acima do orçamento.', dica: 'Nunca reaja com desconto imediato. Entenda primeiro.', modelo: "I understand. Can I ask — is the budget fixed, or is the concern the value at that price?" },
            { bot: "It's fixed. We simply don't have more than eighty.", pt: 'É fixo. Não temos mais que oitenta.', dica: 'Troque escopo por preço, sem drama.', modelo: "Then let's make eighty work. What I can do is deliver the core in phase one and move the reporting module to phase two." },
            { bot: "So we'd get less for the same money.", pt: 'Então receberíamos menos pelo mesmo dinheiro.', dica: 'Corrija com precisão, sem defensiva.', modelo: "You'd get everything you need to launch, for the budget you have. If we reduce the price without reducing scope, I'd be promising something I can't deliver well." },
            { bot: "Hm. And phase two — what would that cost later?", pt: 'Hm. E a fase dois — quanto custaria depois?', dica: 'Número claro e prazo de validade.', modelo: "Thirty, and I'll hold that price for six months so the decision isn't rushed." },
            { bot: "Okay. Send it over that way and I'll take it to the board.", pt: 'Certo. Manda desse jeito e eu levo ao conselho.', dica: 'Feche com próximo passo e data.', modelo: "You'll have it by tomorrow morning. When does the board meet, so I know when to follow up?" }
        ],
        desafio: 'Refaça e recuse a venda: pratique dizer não a um cliente ruim.'
    },

    {
        id: 'dl-farmacia', titulo: 'Farmácia em outro país', nivel: 1,
        contexto: 'Você está gripado, é domingo e não tem receita.',
        seuPapel: 'Cliente', papelBot: 'Farmacêutico',
        objetivo: 'Descrever sintomas, entender a posologia e sair com o remédio certo.',
        obrigatorios: ['I have got a', 'Is this over the counter', 'How often should I take it'],
        turnos: [
            { bot: "Hi, how can I help you today?", pt: 'Oi, como posso ajudar?', dica: 'Sintoma primeiro, duração depois.', modelo: "Hi — I've got a bad sore throat and a cough that started two days ago." },
            { bot: "Any fever?", pt: 'Tem febre?', dica: 'Responda e acrescente o que mais importa.', modelo: "A bit last night, around thirty-eight. No fever today, but I'm exhausted." },
            { bot: "This one should help. Take it after meals.", pt: 'Este deve ajudar. Tome depois das refeições.', dica: 'Pergunte a frequência antes de sair.', modelo: "How often should I take it, and for how many days?" },
            { bot: "Three times a day, up to five days.", pt: 'Três vezes ao dia, até cinco dias.', dica: 'Confirme se precisa de receita e o que evitar.', modelo: "Is this over the counter, or do I need a prescription for a refill? And can I take it with ibuprofen?" },
            { bot: "Over the counter, and yes, but leave four hours between them.", pt: 'Sem receita, e sim, mas espere quatro horas entre eles.', dica: 'Repita a instrução crítica.', modelo: "Four hours apart, three times a day, after meals. Got it — thank you." }
        ],
        desafio: 'Refaça descrevendo alergia ou dor de estômago.'
    },

    {
        id: 'dl-louca', titulo: 'Colega de apartamento e a louça', nivel: 2,
        contexto: 'A pia está cheia há três dias. Não é a sua louça.',
        seuPapel: 'Você', papelBot: 'Colega defensivo',
        objetivo: 'Resolver o conflito doméstico sem virar briga — e sem engolir.',
        obrigatorios: ['Can we talk about', 'It is starting to', 'How about we'],
        turnos: [
            { bot: "Hey, what's up?", pt: 'E aí, tudo bem?', dica: 'Anuncie o assunto, leve mas direto.', modelo: "Hey — can we talk about the kitchen for a second?" },
            { bot: "Oh God, the dishes? I was going to do them tonight.", pt: 'Ai, a louça? Eu ia lavar hoje à noite.', dica: 'Não discuta a intenção; fale do efeito.', modelo: "I know you're busy — it's starting to smell, and I've been cooking around it for three days." },
            { bot: "You could have just told me instead of stacking them on my side.", pt: 'Você podia ter falado em vez de empilhar do meu lado.', dica: 'Assuma sua parte, sem largar o pedido.', modelo: "Fair — that was passive of me, and I'm sorry. I should have said something on day one." },
            { bot: "Okay. So what do you want to do?", pt: 'Certo. E o que você quer fazer?', dica: 'Proponha uma regra simples, não um sermão.', modelo: "How about we do our own dishes the same night? No schedule, no chart — just before bed." },
            { bot: "Yeah, I can live with that.", pt: 'É, dá para viver com isso.', dica: 'Feche leve, sem cara de vitória.', modelo: "Deal. And I'll stop stacking them like a monument to your sins." }
        ],
        desafio: 'Refaça com o colega negando que a louça seja dele.'
    },

    {
        id: 'dl-politica', titulo: 'Colega puxando assunto polêmico', nivel: 3,
        contexto: 'Almoço de trabalho. Um colega começa a falar de política esperando concordância.',
        seuPapel: 'Você', papelBot: 'Colega opinativo',
        objetivo: 'Não concordar, não brigar e mudar de assunto sem parecer covarde. Habilidade social de alto nível.',
        obrigatorios: ['I try not to', 'I see it differently', 'Anyway, how is'],
        turnos: [
            { bot: "You saw the news, right? Unbelievable what they're doing.", pt: 'Viu as notícias, né? Inacreditável o que estão fazendo.', dica: 'Reconheça sem endossar.', modelo: "I saw the headlines, yeah. It's a mess either way you look at it." },
            { bot: "Come on, you must agree with me on this one.", pt: 'Fala sério, nisso você tem que concordar comigo.', dica: 'Diga a verdade de forma leve.', modelo: "Honestly, I try not to talk politics at work — I've seen it go badly too many times." },
            { bot: "That's a cop-out. Everyone has an opinion.", pt: 'Isso é fugir. Todo mundo tem opinião.', dica: 'Admita ter opinião sem entregá-la.', modelo: "I do have one, and I see it differently from you — which is exactly why I'd rather not do it over lunch." },
            { bot: "Fine, fine. I just thought you'd get it.", pt: 'Tá bom, tá bom. Só achei que você fosse entender.', dica: 'Feche com calor e vire a página.', modelo: "No hard feelings. Anyway, how's the move going — did you find a place yet?" }
        ],
        desafio: 'Refaça com o colega insistindo três vezes.'
    },

    {
        id: 'dl-tecnica', titulo: 'Entrevista técnica: a pergunta que você não sabe', nivel: 3,
        contexto: 'O entrevistador pergunta algo que você nunca usou.',
        seuPapel: 'Candidato', papelBot: 'Entrevistador técnico',
        objetivo: 'Não blefar, não desmoronar. Mostrar como você pensa quando não sabe — que é o que ele quer ver.',
        obrigatorios: ['I have not worked with', 'What I would do is', 'Am I on the right track'],
        turnos: [
            { bot: "How would you design a rate limiter for our API?", pt: 'Como você projetaria um limitador de requisições para nossa API?', dica: 'Se não sabe o termo, admita e siga raciocinando.', modelo: "I haven't built one from scratch, but let me think it through out loud — stop me if I go off track." },
            { bot: "Please, go ahead.", pt: 'Por favor, siga.', dica: 'Pense em voz alta, em passos.', modelo: "What I'd do is count requests per client in a time window, and reject once it passes a limit. The hard part is where you keep that count when you have several servers." },
            { bot: "Right. And how would you solve that?", pt: 'Certo. E como resolveria isso?', dica: 'Proponha, mesmo incerto, e marque a incerteza.', modelo: "My first instinct is a shared store that all servers read from — something fast, in memory. I could be missing something. Am I on the right track?" },
            { bot: "You are. What breaks if that shared store goes down?", pt: 'Está. O que quebra se esse armazenamento cair?', dica: 'Pense no pior caso, sem entrar em pânico.', modelo: "Then either everything is blocked or everything is allowed — and you have to decide which failure you prefer. I'd rather let traffic through than take the site down." },
            { bot: "Good instinct. That's the trade-off we argue about here.", pt: 'Bom instinto. É esse o dilema que discutimos aqui.', dica: 'Feche mostrando curiosidade, não alívio.', modelo: "Which side did you land on? I'd genuinely like to know how you handle it in production." }
        ],
        desafio: 'Refaça com uma pergunta da sua área que você realmente não sabe responder.'
    },

    {
        id: 'dl-banco-cobranca', titulo: 'Cobrança indevida no banco', nivel: 2,
        contexto: 'Uma taxa de trinta e cinco dólares apareceu na sua fatura.',
        seuPapel: 'Cliente', papelBot: 'Atendente com roteiro',
        objetivo: 'Contestar e conseguir o estorno. Persistir sem perder a educação.',
        obrigatorios: ['I am calling about a charge', 'I never authorized', 'Can I get a reference number'],
        turnos: [
            { bot: "Thank you for calling. How may I assist you today?", pt: 'Obrigado por ligar. Como posso ajudar?', dica: 'Uma frase: o que é e quanto é.', modelo: "I'm calling about a charge on my account — thirty-five dollars on the twelfth that I don't recognize." },
            { bot: "That's our monthly maintenance fee, sir.", pt: 'É nossa taxa mensal de manutenção, senhor.', dica: 'Contraponha com o fato que você tem.', modelo: "My account was opened as fee-free — that's what I was told when I signed up, and it's in the welcome email." },
            { bot: "The fee applies when the balance drops below one thousand.", pt: 'A taxa se aplica quando o saldo cai abaixo de mil.', dica: 'Peça a origem da regra, sem acusar.', modelo: "That wasn't explained to me at any point. Could you tell me where that condition is written?" },
            { bot: "I can see how that's frustrating. Let me see what I can do.", pt: 'Entendo a frustração. Deixa eu ver o que consigo fazer.', dica: 'Aqui é hora de esperar em silêncio.', modelo: "I appreciate it. I've been a customer for four years and I'd like to stay one." },
            { bot: "I've refunded the fee and flagged the account. It'll clear in two days.", pt: 'Estornei a taxa e sinalizei a conta. Cai em dois dias.', dica: 'Sempre saia com um número de protocolo.', modelo: "Thank you. Can I get a reference number for this call, in case it happens again next month?" }
        ],
        desafio: 'Refaça com o atendente negando o estorno até o fim.'
    },

    {
        id: 'dl-academia', titulo: 'Fazendo amizade na academia', nivel: 1,
        contexto: 'Você vê a mesma pessoa todo dia no mesmo horário.',
        seuPapel: 'Você', papelBot: 'Frequentador simpático',
        objetivo: 'Transformar reconhecimento em conversa, e conversa em contato. Sem forçar.',
        obrigatorios: ['I see you here', 'Do you mind if', 'Same time tomorrow'],
        turnos: [
            { bot: "(you both reach for the same weight)", pt: '(vocês dois pegam o mesmo peso)', dica: 'Aproveite o acaso — é a melhor deixa que existe.', modelo: "Go ahead, I'll take the next set. I see you here every morning, right?" },
            { bot: "Yeah, seven-ish. It's the only time I can make it.", pt: 'É, por volta das sete. É o único horário que consigo.', dica: 'Ache o comum e pergunte algo específico.', modelo: "Same for me. Do you mind if I ask how long you've been doing this routine? Your form is way better than mine." },
            { bot: "Ha, about three years. It took a while, believe me.", pt: 'Haha, uns três anos. Demorou, acredite.', dica: 'Peça um conselho pequeno — as pessoas adoram dar.', modelo: "Any chance you'd watch my squat once and tell me what I'm doing wrong?" },
            { bot: "Sure, go ahead. ... Your knees are caving in a bit.", pt: 'Claro, manda. ... Seus joelhos estão caindo para dentro.', dica: 'Agradeça e crie a próxima vez.', modelo: "That's really helpful, thank you. Same time tomorrow? I'll show you if I fixed it." }
        ],
        desafio: 'Refaça num contexto real seu: fila do café, corredor, vizinho.'
    },

    {
        id: 'dl-bug-leigo', titulo: 'Explicando um problema técnico para leigo', nivel: 3,
        contexto: 'A diretora comercial quer saber por que o sistema caiu ontem.',
        seuPapel: 'Você, do time técnico', papelBot: 'Diretora não técnica',
        objetivo: 'Explicar sem jargão, dizer o risco em termos de negócio e não prometer o impossível.',
        obrigatorios: ['Think of it like', 'The impact was', 'What we are doing about it'],
        turnos: [
            { bot: "So what actually happened yesterday? In plain English, please.", pt: 'Então o que aconteceu ontem? Em português claro, por favor.', dica: 'Uma analogia primeiro, detalhe depois.', modelo: "Think of it like a highway with one lane closed — everything still worked, but everything crawled." },
            { bot: "Why did the lane close?", pt: 'Por que a faixa fechou?', dica: 'Causa em uma frase, sem termos.', modelo: "A change we shipped on Tuesday made every order check a list that got much bigger than we expected." },
            { bot: "How bad was it for customers?", pt: 'Quão ruim foi para os clientes?', dica: 'Impacto em números do negócio, não do sistema.', modelo: "The impact was about ninety minutes of slow checkout and roughly forty orders that people gave up on." },
            { bot: "Can you promise it won't happen again?", pt: 'Você pode garantir que não acontece de novo?', dica: 'Não prometa. Diga o que muda.', modelo: "I can't promise that honestly. What we're doing about it is testing with real-size data before release, which would have caught this one." },
            { bot: "Fine. I need something I can tell the client.", pt: 'Certo. Preciso de algo para dizer ao cliente.', dica: 'Ofereça a frase pronta — é isso que ela quer.', modelo: "Tell them: a change slowed checkout for ninety minutes, no data was lost, and we've added a test that catches this class of problem." }
        ],
        desafio: 'Refaça explicando um problema real do seu trabalho para alguém de fora.'
    },

    {
        id: 'dl-convite', titulo: 'Convidando alguém para sair', nivel: 2,
        contexto: 'Você conheceu essa pessoa num evento e trocaram mensagens por uma semana.',
        seuPapel: 'Você', papelBot: 'A pessoa, interessada mas ocupada',
        objetivo: 'Fazer um convite concreto. Convite vago não vira encontro.',
        obrigatorios: ['I was wondering if', 'Would you be up for', 'No pressure'],
        turnos: [
            { bot: "Hey! Sorry, this week has been crazy.", pt: 'Oi! Desculpa, essa semana foi uma loucura.', dica: 'Não some. Reconheça e siga.', modelo: "No worries at all — I figured. How did the presentation go?" },
            { bot: "It went well, actually! Glad it's over.", pt: 'Foi bem, na verdade! Que bom que acabou.', dica: 'Agora o convite, específico.', modelo: "That deserves celebrating. I was wondering if you'd be up for dinner Friday — there's a place near the park I've wanted to try." },
            { bot: "Friday might be tight. Let me check.", pt: 'Sexta pode ser apertado. Deixa eu ver.', dica: 'Ofereça alternativa e uma saída fácil.', modelo: "Saturday works for me too, if that's easier. No pressure either way." },
            { bot: "Saturday's better. Eight?", pt: 'Sábado é melhor. Oito?', dica: 'Confirme com detalhe concreto.', modelo: "Eight it is. I'll book it and send you the address Thursday." }
        ],
        desafio: 'Refaça com a pessoa recusando — e receba o não com elegância.'
    },

    {
        id: 'dl-recusar', titulo: 'Recusando um convite sem magoar', nivel: 2,
        contexto: 'Seu chefe convida para o churrasco dele no domingo. Você não quer ir.',
        seuPapel: 'Você', papelBot: 'Chefe animado',
        objetivo: 'Dizer não de forma calorosa e definitiva. Um "talvez" custa mais caro que um não.',
        obrigatorios: ['That is really kind of you', 'I will not be able to make it', 'Have a great time'],
        turnos: [
            { bot: "We're doing a barbecue Sunday at my place — you should come!", pt: 'Vamos fazer um churrasco domingo lá em casa — você tem que vir!', dica: 'Agradeça de verdade antes de recusar.', modelo: "That's really kind of you — thanks for including me." },
            { bot: "Great! It starts around one.", pt: 'Ótimo! Começa por volta de uma.', dica: 'Agora o não, claro e sem mentira elaborada.', modelo: "I won't be able to make it this time, unfortunately — I've got family in town all weekend." },
            { bot: "Ah, that's a shame. Bring them along!", pt: 'Ah, que pena. Traga eles junto!', dica: 'Segundo não, mais firme e ainda gentil.', modelo: "That's generous, but I'll pass this round — it's the only day we get together." },
            { bot: "No problem at all. Next time, then.", pt: 'Sem problema. Na próxima, então.', dica: 'Feche calorosamente e crie a próxima.', modelo: "Definitely next time — have a great time Sunday, and save me a plate in spirit." }
        ],
        desafio: 'Refaça recusando um convite que você adoraria aceitar, mas não pode.'
    },

    {
        id: 'dl-cliente-internacional', titulo: 'Primeira reunião com cliente internacional', nivel: 3,
        contexto: 'Videochamada de abertura com um cliente nos EUA. Você conduz.',
        seuPapel: 'Você, liderando', papelBot: 'Cliente americano direto',
        objetivo: 'Conduzir a reunião inteira: abrir, alinhar agenda, ouvir e fechar com próximos passos.',
        obrigatorios: ['Thanks for making the time', 'Before we dive in', 'To recap the next steps'],
        turnos: [
            { bot: "Hi, can you hear me? Let's get started, I've got a hard stop at half past.", pt: 'Oi, está me ouvindo? Vamos começar, tenho que sair às e meia.', dica: 'Confirme o tempo e proponha a agenda.', modelo: "Loud and clear — thanks for making the time. Before we dive in: thirty minutes, and I'd like to spend most of it listening. Does that work?" },
            { bot: "Works for me. What do you need to know?", pt: 'Funciona. O que você precisa saber?', dica: 'Pergunta aberta e específica.', modelo: "Walk me through what's broken today. Not the system — the moment in your week when this problem actually costs you something." },
            { bot: "Honestly? Every Monday we spend two hours reconciling numbers by hand.", pt: 'Sinceramente? Toda segunda passamos duas horas conferindo números na mão.', dica: 'Repita para confirmar e quantifique.', modelo: "So two hours a week, every week — that's about a hundred hours a year of someone's time. Who does it, and what would they do instead?" },
            { bot: "My analyst. She'd do actual analysis, which is what I hired her for.", pt: 'Minha analista. Ela faria análise de verdade, que é para o que a contratei.', dica: 'Não venda ainda. Confirme o critério de sucesso.', modelo: "That's clear. So if this works, the measure isn't software — it's her Monday back. Fair?" },
            { bot: "Exactly. Send me something by Thursday?", pt: 'Exatamente. Me manda algo até quinta?', dica: 'Feche recapitulando tudo em voz alta.', modelo: "To recap the next steps: I send a one-page proposal Thursday, you share last month's numbers, and we meet again Tuesday. Anything I missed?" }
        ],
        desafio: 'Conduza uma reunião real de trinta minutos, do começo ao fim, em inglês.'
    },

    {
        id: 'dl-devolucao', titulo: 'Devolvendo sem nota fiscal', nivel: 2,
        contexto: 'Presente que não serviu, comprado por outra pessoa, sem recibo.',
        seuPapel: 'Cliente', papelBot: 'Atendente seguindo a política',
        objetivo: 'Conseguir troca ou crédito. Insistir com simpatia é a habilidade aqui.',
        obrigatorios: ['It was a gift', 'Is there anything you can do', 'I would be happy with'],
        turnos: [
            { bot: "Do you have the receipt?", pt: 'Você tem o recibo?', dica: 'Explique a situação antes que ele diga não.', modelo: "I don't — it was a gift, and the size doesn't fit. It still has the tag on it." },
            { bot: "Without a receipt I can't process a refund.", pt: 'Sem recibo não consigo fazer o reembolso.', dica: 'Aceite a regra e peça a alternativa.', modelo: "That makes sense. Is there anything you can do — an exchange or store credit, maybe?" },
            { bot: "Store credit would be at the current sale price, which is lower.", pt: 'O crédito seria pelo preço atual da promoção, que é menor.', dica: 'Aceite a perda pequena e feche.', modelo: "I'd be happy with that. Honestly, I just want something that fits." },
            { bot: "All right, let me see what I can do.", pt: 'Certo, deixa eu ver o que consigo.', dica: 'Reforce o lado humano.', modelo: "I really appreciate you working with me on this — I know it's not the standard process." }
        ],
        desafio: 'Refaça pedindo o gerente depois de um não definitivo.'
    },

    {
        id: 'dl-mentoria', titulo: 'Primeira conversa com um mentor', nivel: 3,
        contexto: 'Alguém sênior aceitou vinte minutos com você. É a única chance.',
        seuPapel: 'Você', papelBot: 'Mentor generoso mas sem tempo',
        objetivo: 'Fazer três perguntas boas e sair com um próximo passo. Não pedir "conselhos gerais".',
        obrigatorios: ['I have got three questions', 'What would you do in my place', 'Can I come back to you'],
        turnos: [
            { bot: "Hi! I've got twenty minutes — how can I help?", pt: 'Oi! Tenho vinte minutos — como posso ajudar?', dica: 'Estruture a conversa logo. Isso já impressiona.', modelo: "Thanks for this. I've got three questions, and I'll keep an eye on the clock so we don't run over." },
            { bot: "Perfect. Go for it.", pt: 'Perfeito. Manda.', dica: 'Pergunta específica, com contexto curto.', modelo: "First: I'm two years into operations and I keep getting pulled into firefighting. What would you do in my place to get out of it?" },
            { bot: "Honestly? I'd stop being good at firefighting. People give you what you're good at.", pt: 'Sinceramente? Eu pararia de ser bom em apagar incêndio. As pessoas te dão aquilo em que você é bom.', dica: 'Reaja e aprofunde, não pule para a próxima.', modelo: "That's uncomfortable and probably right. How did you make that shift without looking like you stopped caring?" },
            { bot: "I made the fix visible instead of the fire. Different story, same work.", pt: 'Tornei visível a solução, não o incêndio. História diferente, mesmo trabalho.', dica: 'Terceira pergunta e fechamento.', modelo: "Last one: if I do that for six months, what would tell you it worked? And can I come back to you then with what happened?" },
            { bot: "Fewer emergencies on your calendar. And yes — send me a note in six months.", pt: 'Menos emergências na sua agenda. E sim — me escreva em seis meses.', dica: 'Agradeça de forma concreta.', modelo: "I'll do exactly that. Thank you — this was the most useful twenty minutes of my month." }
        ],
        desafio: 'Escreva e grave as três perguntas que você faria a alguém real da sua área.'
    }
]);
