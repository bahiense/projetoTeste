/* =========================================================
   Role-play — parte 4: o resto do ano.

   Com estas o currículo chega a uma cena inédita por semana nas
   48 semanas. Todas são situações em que travar custa caro: ou
   dinheiro, ou tempo, ou a impressão que ficou de você.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.dialogos = (F.data.dialogos || []).concat([

    {
        id: 'dl-suporte-tecnico',
        titulo: 'Suporte técnico que não quer resolver',
        nivel: 2,
        contexto: "Terceira ligação sobre a mesma internet caindo. O atendente vai pedir para reiniciar o modem de novo.",
        seuPapel: 'Cliente já sem paciência',
        papelBot: 'Atendente seguindo o roteiro',
        objetivo: "Escapar do roteiro e conseguir um técnico ou um protocolo, sem gritar com quem não tem culpa.",
        obrigatorios: ["I've already tried that", "Is there someone else", "Can I get a reference number"],
        turnos: [
            { bot: "Thanks for calling. Can you unplug the modem for thirty seconds and plug it back in?", pt: 'Obrigado por ligar. Pode desligar o modem por trinta segundos e ligar de novo?', dica: "Corte o roteiro na primeira frase, com fato.", modelo: "I've already tried that three times this week, including twenty minutes ago." },
            { bot: "I understand. Unfortunately that's the first step in our process.", pt: 'Entendo. Infelizmente esse é o primeiro passo do nosso processo.', dica: 'Não brigue com o processo. Peça o passo seguinte.', modelo: "I get that it's the process. Since we've done step one, what's step two?" },
            { bot: "Step two would be a line test, but that takes up to 48 hours.", pt: 'O passo dois seria um teste de linha, mas leva até 48 horas.', dica: 'Peça a escalada com educação, sem ameaçar.', modelo: "Let's start it. And is there someone else I could speak to about a technician visit?" },
            { bot: "I can transfer you to level two, but the wait is about fifteen minutes.", pt: 'Posso transferir para o nível dois, mas a espera é de uns quinze minutos.', dica: 'Antes de ser transferido, garanta o registro.', modelo: "I'll wait. Before you transfer me, can I get a reference number for this call?" },
            { bot: "Of course. It's 4471-B. Transferring you now.", pt: 'Claro. É 4471-B. Transferindo agora.', dica: 'Repita o número em voz alta — e agradeça pelo nome.', modelo: "4471-B, got it. Thanks for actually helping, Marcus. Have a good one." }
        ],
        desafio: 'Refaça a cena com o atendente insistindo no modem três vezes. Não perca a educação.'
    },
    {
        id: 'dl-alugar-apartamento',
        titulo: 'Visitando um apartamento para alugar',
        nivel: 2,
        contexto: 'Você tem quinze minutos com o corretor e três perguntas que decidem tudo.',
        seuPapel: 'Interessado',
        papelBot: 'Corretor apressado',
        objetivo: 'Sair sabendo o custo real, o que está incluído e quando pode entrar — sem se comprometer.',
        obrigatorios: ["What's included", "Just so I'm clear", "I'd need to think it over"],
        turnos: [
            { bot: "So this is it. Two bedrooms, south facing, and the kitchen was redone last year.", pt: 'Então é este. Dois quartos, virado para o sul, e a cozinha foi reformada ano passado.', dica: 'Vá direto ao custo total, não ao preço anunciado.', modelo: "It's nice. What's included in the twenty-two hundred — is water and heating on top of that?" },
            { bot: "Heating is included, water and electricity aren't. Internet is on you.", pt: 'Aquecimento incluso, água e luz não. Internet por sua conta.', dica: 'Peça o número real de quem já morou.', modelo: "Just so I'm clear — what did the last tenant actually pay per month, all in?" },
            { bot: "Around twenty-six, twenty-seven hundred in winter.", pt: 'Uns dois mil e seiscentos, dois mil e setecentos no inverno.', dica: 'Pergunte pelo prazo e pela entrada, que é onde travam.', modelo: "That's helpful. And what's the deposit, and when could someone move in?" },
            { bot: "First, last, and one month deposit. It's available the first of next month.", pt: 'Primeiro, último e um mês de depósito. Disponível no dia primeiro.', dica: 'Não diga sim na hora. Reserve o seu tempo.', modelo: "Understood. I like the place, but I'd need to think it over and check the commute." },
            { bot: "Sure. Just so you know, there are two other people looking at it today.", pt: 'Claro. Só para saber, tem mais duas pessoas vendo hoje.', dica: 'Pressão de escassez: reconheça sem correr.', modelo: "That's fair — if it goes, it goes. I'll let you know by tomorrow morning either way." }
        ],
        desafio: 'Refaça negociando cem dólares a menos no aluguel. Comece pela pergunta, não pelo pedido.'
    },
    {
        id: 'dl-perdeu-carteira',
        titulo: 'Perdeu a carteira e precisa registrar',
        nivel: 2,
        contexto: 'Delegacia num país estrangeiro. Você precisa do boletim para o seguro.',
        seuPapel: 'Turista',
        papelBot: 'Policial no balcão',
        objetivo: 'Sair com o documento na mão, dando as informações na ordem que o outro pede.',
        obrigatorios: ["I'd like to report", 'the last time I had it', 'for insurance purposes'],
        turnos: [
            { bot: "Good afternoon. What can I do for you?", pt: 'Boa tarde. O que posso fazer por você?', dica: 'Uma frase: o que aconteceu e o que você quer.', modelo: "Good afternoon. I'd like to report a lost wallet — I think it happened on the metro this morning." },
            { bot: "Lost or stolen? They're different reports.", pt: 'Perdida ou roubada? São registros diferentes.', dica: 'Não invente. Diga o que você sabe e o que não sabe.', modelo: "Honestly, I'm not sure. I didn't feel anything, so I'd say lost." },
            { bot: "Alright. Where and when did you last have it?", pt: 'Certo. Onde e quando você a teve pela última vez?', dica: 'Ordem: hora, lugar, o que fez em seguida.', modelo: "The last time I had it was around nine, buying a ticket at Central Station. I noticed it was gone at the hotel." },
            { bot: "What was in it? Cards, documents, cash?", pt: 'O que tinha nela? Cartões, documentos, dinheiro?', dica: 'Liste com números — o seguro vai pedir.', modelo: "Two credit cards, my Brazilian driver's license, and about eighty euros in cash." },
            { bot: "Okay. I'll print the report, it takes about ten minutes.", pt: 'Certo. Vou imprimir o registro, uns dez minutos.', dica: 'Confirme que o papel serve para o que você precisa.', modelo: "Thank you. And this is the document I'd send for insurance purposes, correct?" }
        ],
        desafio: 'Refaça a cena com o policial dizendo que a delegacia certa é outra. Consiga o registro mesmo assim.'
    },
    {
        id: 'dl-aviao-vizinho',
        titulo: 'Vizinho de avião que não para de falar',
        nivel: 3,
        contexto: 'Voo de nove horas. Você quer dormir. Ele quer conversar.',
        seuPapel: 'Passageiro exausto',
        papelBot: 'Passageiro extrovertido',
        objetivo: 'Encerrar a conversa sem ser rude — a habilidade social mais difícil em outra língua.',
        obrigatorios: ["That's interesting", "I'm going to try to", 'Enjoy the rest of your flight'],
        turnos: [
            { bot: "First time flying to Lisbon? I go twice a year, my daughter lives there.", pt: 'Primeira vez indo pra Lisboa? Vou duas vezes por ano, minha filha mora lá.', dica: 'Responda curto. Cortês, mas sem abrir portas.', modelo: "Second time, actually. That's nice that you get to see her so often." },
            { bot: "It is! She married a Portuguese guy. Long story. Do you have kids?", pt: 'É sim! Ela casou com um português. Longa história. Você tem filhos?', dica: 'Responda e NÃO devolva a pergunta — aqui é o contrário do small talk.', modelo: "I do, two of them. They're at home with my wife this week." },
            { bot: "Oh, traveling alone then! Business or pleasure?", pt: 'Ah, viajando sozinho então! Negócios ou lazer?', dica: 'Sinalize o encerramento antes de fazê-lo.', modelo: "A bit of both. That's interesting about your daughter — I'm going to try to sleep a little before we land, though." },
            { bot: "Of course, of course. Long flight. I'll let you rest.", pt: 'Claro, claro. Voo longo. Vou te deixar descansar.', dica: 'Agradeça o recuo. Isso evita que ele volte em vinte minutos.', modelo: "I appreciate it, thank you. It was good talking to you." },
            { bot: "You too. Sleep well!", pt: 'Você também. Bom descanso!', dica: 'Feche a despedida de forma definitiva e simpática.', modelo: "Enjoy the rest of your flight — and say hi to Lisbon for me." }
        ],
        desafio: 'Refaça encerrando já no segundo turno, sem soar seco.'
    },
    {
        id: 'dl-recrutador-salario',
        titulo: 'Recrutador perguntando quanto você quer ganhar',
        nivel: 4,
        contexto: 'Primeira ligação. Ele quer o seu número antes de dizer o dele.',
        seuPapel: 'Candidato',
        papelBot: 'Recrutador',
        objetivo: 'Não dar o primeiro número. Descobrir a faixa deles sem parecer evasivo.',
        obrigatorios: ["What's the range for the role", 'depends on the whole package', "I'd rather not anchor"],
        turnos: [
            { bot: "Great to connect. Before we go further — what are your salary expectations?", pt: 'Ótimo falar com você. Antes de seguir — qual sua expectativa salarial?', dica: 'Devolva a pergunta sem recusar responder.', modelo: "Happy to get into that. What's the range for the role — I imagine you have a band approved?" },
            { bot: "We do, but I'd like to hear your number first.", pt: 'Temos, mas eu gostaria de ouvir o seu número primeiro.', dica: 'Explique POR QUE você não vai começar, em vez de só desviar.', modelo: "Sure — the honest answer is that it depends on the whole package: bonus, equity, how remote it is." },
            { bot: "Understood, but give me a ballpark so we don't waste each other's time.", pt: 'Entendo, mas me dê uma ordem de grandeza para não perdermos tempo.', dica: 'Concorde com o objetivo dele e ofereça o caminho.', modelo: "Agreed on not wasting time — that's exactly why I'd rather not anchor before I know what the role includes." },
            { bot: "Fair enough. The band is 140 to 175, depending on level.", pt: 'Justo. A faixa é 140 a 175, dependendo do nível.', dica: 'Reaja com neutralidade. Não comemore, não recuse.', modelo: "That's a workable range. Where I land inside it would depend on the level you'd bring me in at." },
            { bot: "Probably senior, maybe staff if the interviews go well.", pt: 'Provavelmente sênior, talvez staff se as entrevistas forem bem.', dica: 'Feche mantendo a porta aberta e o número em aberto.', modelo: "Then let's see how the process goes and talk numbers when we know the level. That's fair to both of us." }
        ],
        desafio: 'Refaça com o recrutador insistindo três vezes no seu número. Não dê.'
    },
    {
        id: 'dl-academia-primeira-aula',
        titulo: 'Primeira aula com personal trainer',
        nivel: 1,
        contexto: 'Academia nova, primeira avaliação. Ele vai perguntar do seu histórico.',
        seuPapel: 'Aluno novo',
        papelBot: 'Personal trainer',
        objetivo: 'Explicar a sua situação física e os seus limites, e sair com um plano concreto.',
        obrigatorios: ['I used to', 'My main goal is', 'I have to be careful with'],
        turnos: [
            { bot: "Welcome! So tell me, what's your training history like?", pt: 'Bem-vindo! Me conta, como é seu histórico de treino?', dica: 'Passado + presente em duas frases.', modelo: "I used to train three times a week, but I stopped about two years ago. Right now I do nothing." },
            { bot: "That's honest, I appreciate it. What are you looking to get out of this?", pt: 'Isso é honesto, agradeço. O que você quer conseguir com isso?', dica: 'Objetivo concreto, não "ficar em forma".', modelo: "My main goal is to stop getting out of breath on stairs. Losing some weight would be nice, but that's second." },
            { bot: "Perfect, that's a great goal. Any injuries I should know about?", pt: 'Perfeito, ótimo objetivo. Alguma lesão que eu deva saber?', dica: 'Seja específico sobre o limite — é o que evita machucar.', modelo: "I have to be careful with my lower back. Nothing serious, but deadlifts used to leave me sore for days." },
            { bot: "Got it, we'll work around that. How many days a week can you realistically come?", pt: 'Entendi, vamos contornar. Quantos dias por semana você consegue vir de verdade?', dica: 'Prometa menos do que você gostaria. É o que se cumpre.', modelo: "Realistically? Three. I could say four, but I know I wouldn't come on Fridays." },
            { bot: "Three is plenty. Let's start Monday, Wednesday, Saturday.", pt: 'Três é ótimo. Vamos começar segunda, quarta e sábado.', dica: 'Feche confirmando o combinado com hora.', modelo: "Monday, Wednesday, Saturday it is. Same time as today — seven in the morning?" }
        ],
        desafio: 'Refaça inventando uma lesão diferente e explicando exatamente o que dói e quando.'
    },
    {
        id: 'dl-cabeleireiro',
        titulo: 'Explicar o corte de cabelo que você quer',
        nivel: 1,
        contexto: 'Barbearia nova, num país estrangeiro. Se der errado, você convive com o erro por um mês.',
        seuPapel: 'Cliente',
        papelBot: 'Barbeiro',
        objetivo: 'Descrever o corte com precisão e conferir antes que ele comece.',
        obrigatorios: ['Not too short', 'Could you leave', 'Just a trim'],
        turnos: [
            { bot: "Have a seat. What are we doing today?", pt: 'Sente-se. O que vamos fazer hoje?', dica: 'Comece pelo geral, depois o detalhe.', modelo: "Just a trim, please — I don't want to change the shape, only clean it up." },
            { bot: "Sure. How short on the sides?", pt: 'Claro. Quão curto nas laterais?', dica: 'Use referência concreta: número, dedo, comparação.', modelo: "Not too short — maybe a number three? About like it is now, just tidier." },
            { bot: "And the top? A lot of guys are going shorter these days.", pt: 'E em cima? Muita gente está indo mais curto agora.', dica: 'Recuse a sugestão sem ofender o profissional.', modelo: "I'll stay boring, I think. Could you leave the top pretty much as it is?" },
            { bot: "No problem. What about the back of the neck — square or rounded?", pt: 'Sem problema. E a nuca — quadrada ou arredondada?', dica: 'Se não souber o termo, pergunte a diferença.', modelo: "Honestly, I never know the difference. Which one usually grows out better?" },
            { bot: "Rounded, in your case. Alright, let's get started.", pt: 'Arredondada, no seu caso. Certo, vamos começar.', dica: 'Confirme tudo antes da primeira tesourada.', modelo: "Rounded then. So: three on the sides, top the same, rounded at the back. Sound right?" }
        ],
        desafio: 'Refaça a cena pedindo algo que você nunca fez, e descrevendo sem saber o nome técnico.'
    },
    {
        id: 'dl-garantia-negada',
        titulo: 'A loja diz que a garantia não cobre',
        nivel: 3,
        contexto: 'Celular parou de carregar em oito meses. A loja diz que foi mau uso.',
        seuPapel: 'Cliente',
        papelBot: 'Gerente da loja',
        objetivo: 'Contestar a avaliação com fatos, e chegar a um laudo ou a uma solução — sem ameaçar processo no primeiro minuto.',
        obrigatorios: ['I understand what you are saying', 'What I can show you is', 'Where does that leave me'],
        turnos: [
            { bot: "Our technician says there's liquid damage inside. That voids the warranty.", pt: 'Nosso técnico diz que há dano por líquido. Isso anula a garantia.', dica: 'Não negue de cara. Peça o dado.', modelo: "I understand what you're saying. Can I see the report — where exactly is the damage?" },
            { bot: "Here. The indicator strip by the port has changed color.", pt: 'Aqui. A fita indicadora perto da entrada mudou de cor.', dica: 'Traga o seu fato, concreto e verificável.', modelo: "What I can show you is that it's never been near water — and it stopped charging the day after a software update." },
            { bot: "That could be a coincidence. The strip doesn't lie.", pt: 'Pode ser coincidência. A fita não mente.', dica: 'Ofereça o caminho da verificação independente.', modelo: "It might be. Would you be willing to send it to the manufacturer for a second opinion?" },
            { bot: "That takes three weeks and there's a fee if they agree with us.", pt: 'Leva três semanas e tem taxa se eles concordarem conosco.', dica: 'Pergunte a alternativa em vez de aceitar o beco.', modelo: "Three weeks I can live with. If they agree with you, I pay — where does that leave me if they don't?" },
            { bot: "Then it's replaced free and we refund the fee.", pt: 'Aí é trocado sem custo e devolvemos a taxa.', dica: 'Feche registrando o combinado por escrito.', modelo: "Let's do that. Can you put those terms on the receipt so we both have it in writing?" }
        ],
        desafio: 'Refaça sem usar a palavra "no" nenhuma vez, e ainda assim sem aceitar a recusa.'
    },
    {
        id: 'dl-jantar-na-casa',
        titulo: 'Jantar na casa de um colega estrangeiro',
        nivel: 2,
        contexto: 'Convite para a casa dele. Você chega, entrega o vinho e conhece a família.',
        seuPapel: 'Convidado',
        papelBot: 'Anfitrião',
        objetivo: 'Atravessar a primeira meia hora com naturalidade: chegada, elogio, conversa com quem você não conhece.',
        obrigatorios: ['Thanks for having me', 'Something smells amazing', 'Can I give you a hand'],
        turnos: [
            { bot: "Hey, you found it! Come in, come in.", pt: 'Ei, você achou! Entra, entra.', dica: 'Entrada + presente + elogio, tudo junto.', modelo: "Thanks for having me. I brought some wine — I have no idea if it goes with dinner." },
            { bot: "It's perfect, thank you. Kitchen's a mess, ignore it.", pt: 'É perfeito, obrigado. A cozinha está uma bagunça, ignora.', dica: 'Elogie algo específico, não o genérico.', modelo: "Something smells amazing in here. Is that the thing you were describing at the office?" },
            { bot: "It is! It's my grandmother's recipe. Ten more minutes.", pt: 'É sim! Receita da minha avó. Mais dez minutos.', dica: 'Ofereça ajuda concreta — é o que se faz.', modelo: "Can I give you a hand with anything? I'm useless at cooking but great at chopping." },
            { bot: "Actually yes — can you open that bottle while I check the oven?", pt: 'Na verdade sim — pode abrir aquela garrafa enquanto vejo o forno?', dica: 'Aceite a tarefa e puxe assunto com quem está por perto.', modelo: "On it. Is this your daughter? Hi — I'm Rodrigo, I work with your dad." },
            { bot: "That's Maya. She's ten and she'll talk your ear off about horses.", pt: 'É a Maya. Tem dez anos e vai falar sem parar sobre cavalos.', dica: 'Feche entrando no assunto da criança, não no seu.', modelo: "Horses I can do. Maya, what's the fastest one you've ever seen?" }
        ],
        desafio: 'Refaça conversando cinco turnos só com a criança de dez anos. É mais difícil que com o adulto.'
    }
]);
