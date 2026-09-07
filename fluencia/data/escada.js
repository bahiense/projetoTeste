/* =========================================================
   Escada da coragem — 20 degraus.

   A vergonha de falar não some com teoria: some com exposição
   graduada, o mesmo mecanismo usado para tratar fobia. Cada
   degrau é um pouco mais assustador que o anterior e só isso.

   Regra: só sobe quem cumpriu o degrau DUAS vezes. E o degrau
   não se cumpre "mais ou menos" — ou fez, ou não fez.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.escada = [
    {
        n: 1, fase: 'sozinho', titulo: 'Falar sozinho no espelho por 3 minutos',
        missao: 'Descreva em voz alta o que você fez hoje, olhando nos seus próprios olhos.',
        porque: 'Sua voz em inglês precisa deixar de ser estranha PARA VOCÊ antes de ser ouvida por outro.',
        debrief: 'Em que momento você quis parar? Foi vergonha ou falta de palavra?'
    },
    {
        n: 2, fase: 'sozinho', titulo: 'Gravar 60 segundos e ouvir até o fim',
        missao: 'Grave-se falando sobre seu trabalho. Ouça inteiro sem pular. Anote três coisas boas.',
        porque: 'Quase todo brasileiro odeia a própria voz em inglês e nunca se ouviu. Isso mantém o erro invisível.',
        debrief: 'O que você imaginava que soava pior do que realmente soa?'
    },
    {
        n: 3, fase: 'sozinho', titulo: 'Narrar sua manhã enquanto ela acontece',
        missao: 'Do despertador ao café, narre tudo em voz baixa, em inglês. Trinta minutos.',
        porque: 'Cria o hábito de pensar em inglês em vez de traduzir. É o exercício que mais economiza tempo.',
        debrief: 'Quais palavras do seu cotidiano você não sabia? Anote e busque HOJE.'
    },
    {
        n: 4, fase: 'sozinho', titulo: 'Shadowing em voz alta com a porta aberta',
        missao: 'Faça 10 minutos de shadowing sem se importar se alguém da casa ouve.',
        porque: 'O primeiro público é a sua família. Se você abaixa a voz para eles, vai abaixar para o mundo.',
        debrief: 'Você diminuiu o volume quando alguém passou? Por quê?'
    },
    {
        n: 5, fase: 'assíncrono', titulo: 'Áudio de 1 minuto para um amigo',
        missao: 'Mande um áudio em inglês para alguém que também estuda. Sem regravar.',
        porque: '"Sem regravar" é o ponto do exercício. Regravar é fuga.',
        debrief: 'Quantas vezes você quase apagou antes de mandar?'
    },
    {
        n: 6, fase: 'assíncrono', titulo: 'Comentar em vídeo público',
        missao: 'Escreva três comentários em inglês em vídeos ou posts de gringos. Sem tradutor.',
        porque: 'Exposição escrita e pública, com risco baixo. Aquece para o risco alto.',
        debrief: 'Alguém respondeu? Você respondeu de volta?'
    },
    {
        n: 7, fase: 'assíncrono', titulo: 'Vídeo de 2 minutos falando de você',
        missao: 'Grave em vídeo (não só áudio) uma apresentação sua e assista inteira.',
        porque: 'Vídeo acrescenta o corpo: mão na boca, olhar fugindo, ombro encolhido. Tudo isso vaza para a voz.',
        debrief: 'O que seu corpo estava fazendo enquanto você falava?'
    },
    {
        n: 8, fase: 'assíncrono', titulo: 'Postar o vídeo em algum lugar onde conhecidos vejam',
        missao: 'Stories, grupo de estudo, LinkedIn. Precisa ser visível para gente que te conhece.',
        porque: 'O medo do julgamento de conhecidos é maior que o de estranhos. Enfrente o maior primeiro.',
        debrief: 'O que você temia que acontecesse? O que aconteceu de fato?'
    },
    {
        n: 9, fase: 'ao vivo', titulo: 'Primeira conversa por voz com estranho (app de idiomas)',
        missao: '10 minutos com alguém que também está aprendendo. Ambos ruins, ninguém julga.',
        porque: 'O parceiro que também erra é o ambiente psicologicamente mais seguro que existe.',
        debrief: 'Quantas vezes você pediu para repetir? (Muitas = bom sinal.)'
    },
    {
        n: 10, fase: 'ao vivo', titulo: 'Conversa de 20 minutos sem uma palavra em português',
        missao: 'Com quem for. Regra SYL: se travar, descreva a palavra em inglês em vez de trocar de língua.',
        porque: 'Esta é a regra que mais acelera fluência de todas: proibir a saída fácil.',
        debrief: 'Como você contornou a palavra que não sabia? Essa habilidade é ouro.'
    },
    {
        n: 11, fase: 'ao vivo', titulo: 'Falar com nativo pela primeira vez',
        missao: '15 minutos com falante nativo. Pode ser professor pago — o degrau é o nativo, não o preço.',
        porque: 'A velocidade real é outro planeta. Você precisa levar esse choque logo, não no fim.',
        debrief: 'Quanto por cento você entendeu? Anote o número, ele vai subir.'
    },
    {
        n: 12, fase: 'ao vivo', titulo: 'Pedir informação a um estranho em inglês',
        missao: 'Turista no aeroporto, hotel, atendimento internacional por telefone. Fale primeiro.',
        porque: 'Iniciar é mais difícil que responder. Aqui você é quem começa.',
        debrief: 'Você ensaiou a frase antes? Da próxima, não ensaie.'
    },
    {
        n: 13, fase: 'ao vivo', titulo: 'Discordar de alguém em inglês',
        missao: 'Numa conversa real, discorde e sustente seu ponto por dois minutos.',
        porque: 'Discordar exige a língua que você menos treina: suavizadores, condicionais, contra-argumento.',
        debrief: 'Você recuou por falta de argumento ou por falta de palavra?'
    },
    {
        n: 14, fase: 'ao vivo', titulo: 'Contar uma história engraçada e fazer alguém rir',
        missao: 'Humor em outra língua é o teste final de timing e ritmo.',
        porque: 'Piada depende de pausa e ênfase — exatamente o que falta no sotaque brasileiro.',
        debrief: 'A pessoa riu no lugar certo ou por educação?'
    },
    {
        n: 15, fase: 'ao vivo', titulo: 'Reunião de trabalho falando pelo menos 5 vezes',
        missao: 'Conte as intervenções. Cinco, mínimo. "Yes" não conta.',
        porque: 'Quem fica quieto em reunião não é avaliado como quieto: é avaliado como sem opinião.',
        debrief: 'Quais intervenções você engoliu? Por quê?'
    },
    {
        n: 16, fase: 'ao vivo', titulo: 'Interromper alguém educadamente',
        missao: 'Use "Can I jump in here?" numa conversa real com mais de duas pessoas.',
        porque: 'Brasileiro em inglês costuma esperar um espaço que nunca vem. Espaço se toma.',
        debrief: 'Como as pessoas reagiram? (Spoiler: normalmente, com naturalidade.)'
    },
    {
        n: 17, fase: 'pressão', titulo: 'Apresentar 5 minutos para um grupo',
        missao: 'Sem ler slide. Pode ter tópicos, não pode ter texto pronto.',
        porque: 'Ler texto pronto é a muleta que impede a fala espontânea de amadurecer.',
        debrief: 'Onde você travou? Era conteúdo ou língua?'
    },
    {
        n: 18, fase: 'pressão', titulo: 'Responder perguntas hostis depois da apresentação',
        missao: 'Peça para alguém te fazer 5 perguntas difíceis, sem aviso do que virá.',
        porque: 'Q&A é improviso sob pressão — o estado mais próximo da fluência real.',
        debrief: 'Você ganhou tempo com chunks ou ficou em silêncio?'
    },
    {
        n: 19, fase: 'pressão', titulo: 'Conduzir uma reunião inteira em inglês',
        missao: 'Abrir, dar a palavra, cortar quem se estende, resumir e fechar.',
        porque: 'Conduzir exige controlar a interação, não só participar dela.',
        debrief: 'Você conseguiu cortar alguém educadamente?'
    },
    {
        n: 20, fase: 'pressão', titulo: 'Ensinar algo por 30 minutos em inglês',
        missao: 'Uma aula, um treinamento, um tutorial ao vivo para pessoas reais.',
        porque: 'É o exercício final do método missionário: você não usa a língua, você TRABALHA nela.',
        debrief: 'Em algum momento você esqueceu que estava falando inglês? Esse é o ponto de chegada.'
    }
];
