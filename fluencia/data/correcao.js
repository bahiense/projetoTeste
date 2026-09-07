/* =========================================================
   Correção por regras.

   O app não entende inglês: não há modelo de linguagem aqui
   dentro, e tudo funciona sem internet. O que ele sabe fazer é
   reconhecer os erros que o falante de português comete de
   forma previsível — e esses são muitos, repetidos e fáceis de
   detectar por padrão de texto.

   Cada regra é de alta confiança: só dispara quando o trecho é
   inequivocamente errado. Preferimos deixar passar erro a
   acusar uma frase correta, porque corretor que erra faz o
   aluno desconfiar de tudo o que ele diz.

   O texto chega em minúsculas e sem pontuação, como sai do
   reconhecimento de fala.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.correcoes = [

    /* ---------- ser e estar ---------- */
    { re: /\bi (?:have|has) (\d+|thirty|forty|twenty|fifty) years?\b/, troca: "I'm $1 years old", porque: 'Idade é com TO BE: "I\'m 34", nunca "I have 34 years".' },
    { re: /\bi am with (hungry|cold|hot|thirsty|sleepy|scared|afraid)\b/, troca: "I'm $1", porque: 'Estado é adjetivo direto: "I\'m hungry", não "I\'m with hungry".' },
    { re: /\bi (?:stay|get) (?:very )?(happy|sad|nervous|angry|tired) when\b/, troca: 'I get $1 when', porque: '"Ficar" é GET (mudar de estado), não STAY (permanecer).' },
    { re: /\bi am boring\b/, troca: "I'm bored", porque: '"I am boring" quer dizer "eu sou chato". Quem sente é -ED.' },
    { re: /\bi am agree\b/, troca: 'I agree', porque: '"Agree" já é verbo — não leva TO BE.' },
    { re: /\bshe (?:have|has been) reason\b|\b(?:he|she) has reason\b/, troca: 'he/she is right', porque: '"Ter razão" é BE RIGHT.' },

    /* ---------- tempos verbais ---------- */
    { re: /\bi (?:am|work|live|study) here since\b/, troca: "I've been here since", porque: 'Começou no passado e continua: present perfect, não presente.' },
    { re: /\bi (?:work|live|study) (?:here )?for (\w+) years?\b/, troca: "I've been working for $1 years", porque: 'Duração até agora pede present perfect.' },
    { re: /\bi am living here for\b/, troca: "I've been living here for", porque: 'Mesma regra: duração até hoje é present perfect.' },
    { re: /\bi (?:did not|didn't) went\b/, troca: "I didn't go", porque: 'Depois de DID o verbo volta ao infinitivo.' },
    { re: /\b(?:he|she) (?:do not|don't) \b/, troca: "he/she doesn't", porque: 'Terceira pessoa: DOES.' },
    { re: /\b(?:he|she) have\b/, troca: 'he/she has', porque: 'Terceira pessoa: HAS.' },
    { re: /\bdo you can\b/, troca: 'can you', porque: 'Modal não leva auxiliar: "Can you...?".' },
    { re: /\bif i (?:would|will) (?:have|be|go|do)\b/, troca: 'if I had / if I were', porque: 'Depois de IF não entra WILL nem WOULD.' },
    { re: /\bi have went\b/, troca: "I've gone / I've been", porque: 'Particípio de GO é GONE; para experiência, BEEN.' },
    { re: /\byesterday i have\b/, troca: 'yesterday I + passado simples', porque: 'Tempo passado definido não aceita present perfect.' },

    /* ---------- verbos que pedem outra forma ---------- */
    { re: /\bmake a question\b/, troca: 'ask a question', porque: 'Pergunta se pede (ASK), não se faz.' },
    { re: /\bdo a question\b/, troca: 'ask a question', porque: 'Pergunta se pede (ASK).' },
    { re: /\bi did a mistake\b/, troca: 'I made a mistake', porque: 'Erro se faz com MAKE.' },
    { re: /\btake a decision\b/, troca: 'make a decision', porque: 'Decisão se faz com MAKE.' },
    { re: /\bgive a look\b/, troca: 'take a look', porque: 'Colocação fixa: TAKE a look.' },
    { re: /\bmake a course\b/, troca: 'take a course', porque: 'Curso se faz com TAKE.' },
    { re: /\bi lost (?:the|my) (flight|bus|train|meeting|class)\b/, troca: 'I missed the $1', porque: 'Perder no sentido de não pegar é MISS.' },
    { re: /\bexplain me\b/, troca: 'explain to me', porque: 'EXPLAIN exige TO antes da pessoa.' },
    { re: /\bsaid me\b/, troca: 'told me', porque: 'SAY não leva pessoa direto; TELL leva.' },
    { re: /\btold to (me|him|her|them|us)\b/, troca: 'told $1', porque: 'TELL não leva TO antes da pessoa.' },
    { re: /\bi know to (\w+)\b/, troca: 'I know how to $1', porque: 'KNOW HOW TO para habilidade.' },
    { re: /\bi want that you\b/, troca: 'I want you to', porque: 'WANT não aceita THAT: "I want you to come".' },
    { re: /\bsuggested me to\b/, troca: 'suggested that I', porque: 'SUGGEST não leva "me to".' },
    { re: /\basked for (him|her|them|me) to\b/, troca: 'asked $1 to', porque: 'ASK não leva FOR antes da pessoa.' },
    { re: /\bi forgot (?:my|the) (\w+) in\b/, troca: 'I left my $1 at', porque: 'Deixar algo em algum lugar é LEAVE, não FORGET.' },
    { re: /\bi have difficulty to (\w+)\b/, troca: 'I have difficulty $1ing', porque: 'DIFFICULTY pede -ING.' },
    { re: /\blook forward to (meet|hear|see|talk|work)\b/, troca: 'look forward to $1ing', porque: 'Aqui TO é preposição: pede -ING.' },
    { re: /\bi am accustomed to (\w+)\b/, troca: "I'm used to $1ing", porque: 'USED TO + -ING para hábito atual.' },
    { re: /\bi passed (one|two|three|four|five|\d+) years?\b/, troca: 'I spent $1 years', porque: 'Tempo se gasta com SPEND.' },
    { re: /\bworks? like a (\w+)\b/, troca: 'work as a $1', porque: 'LIKE compara; AS indica função. Com LIKE você só imita a profissão.' },
    { re: /\bi assisted (?:the|a) (game|movie|class|meeting)\b/, troca: 'I watched the $1', porque: '"Assist" é ajudar.' },

    /* ---------- preposições ---------- */
    { re: /\bdepends? of\b/, troca: 'depend on', porque: 'Preposição fixa: DEPEND ON.' },
    { re: /\bcongratulations for\b/, troca: 'congratulations on', porque: 'Preposição fixa: CONGRATULATIONS ON.' },
    { re: /\bdespite of\b/, troca: 'despite', porque: 'DESPITE nunca leva OF (ou use "in spite of").' },
    { re: /\bmarried with\b/, troca: 'married to', porque: 'Casado é MARRIED TO.' },
    { re: /\bi go to there\b/, troca: 'I go there', porque: 'THERE e HOME não levam TO.' },
    { re: /\bin the (first|second|third|fourth|fifth) floor\b/, troca: 'on the $1 floor', porque: 'Andar leva ON.' },
    { re: /\barrived in the airport\b/, troca: 'arrived at the airport', porque: 'Chegar a um ponto é ARRIVE AT.' },
    { re: /\bgood in (math|english|sports)\b/, troca: 'good at $1', porque: 'Ser bom em algo é GOOD AT.' },

    /* ---------- substantivos e concordância ---------- */
    { re: /\binformations\b/, troca: 'information', porque: 'Information é incontável: não tem plural.' },
    { re: /\badvices\b/, troca: 'advice', porque: 'Advice é incontável.' },
    { re: /\bfeedbacks\b/, troca: 'feedback', porque: 'Feedback é incontável.' },
    { re: /\bequipments\b/, troca: 'equipment', porque: 'Equipment é incontável.' },
    { re: /\bpeople is\b/, troca: 'people are', porque: 'PEOPLE é plural, sempre.' },
    { re: /\beverybody are\b|\beveryone are\b/, troca: 'everybody is', porque: 'EVERYBODY é singular.' },
    { re: /\bthere is many\b|\bthere is a lot of (\w+s)\b/, troca: 'there are many', porque: 'Concordância com o plural que vem depois.' },
    { re: /\bit has (?:many|a lot of|some) (\w+)\b/, troca: 'there are $1', porque: '"Ter" existencial é THERE IS / THERE ARE.' },
    { re: /\bthe most part of\b/, troca: 'most', porque: 'É só "most people", "most of the time".' },
    { re: /\bi have much work\b/, troca: 'I have a lot of work', porque: '"Much" em afirmativa soa livresco.' },
    { re: /\bi have a doubt\b/, troca: 'I have a question', porque: '"Doubt" é dúvida no sentido de desconfiança.' },
    { re: /\bthe travel was\b/, troca: 'the trip was', porque: '"Travel" é o ato de viajar; a viagem é TRIP.' },

    /* ---------- comparativos e artigos ---------- */
    { re: /\bmore (tall|big|small|fast|slow|old|young|cheap|easy|hard|rich|happy)\b/, troca: '$1er', porque: 'Adjetivo curto leva -ER, não "more".' },
    { re: /\bthe more (important|difficult|expensive|beautiful)\b/, troca: 'the most $1', porque: 'Superlativo com THE MOST.' },
    { re: /\bmore better\b/, troca: 'better', porque: 'BETTER já é comparativo.' },

    /* ---------- falsos amigos ---------- */
    { re: /\bi pretend to\b/, troca: 'I intend to / I plan to', porque: '"Pretend" é FINGIR.' },
    { re: /\bactually i (live|work|study)\b/, troca: 'currently I $1', porque: '"Actually" é "na verdade", não "atualmente".' },
    { re: /\beventually i\b/, troca: 'occasionally I', porque: '"Eventually" é "no fim das contas".' },
    { re: /\brealize (?:the|this|a) (task|project|work)\b/, troca: 'carry out the $1', porque: '"Realize" é perceber.' },
    { re: /\bi need to confirm my presence\b/, troca: "I need to confirm I'm coming", porque: '"Confirm my presence" é tradução literal.' },

    /* ---------- pragmática ---------- */
    { re: /\bsorry for my english\b/, troca: '(não diga isso)', porque: 'Pedir desculpa pelo inglês baixa sua autoridade e não melhora nada. Se precisar, diga "bear with me, English is my second language".' },
    { re: /\brepeat please\b/, troca: 'sorry, could you say that again', porque: '"Repeat" soa comando de professor para aluno.' },
    { re: /\bi want a (coffee|beer|water|sandwich)\b/, troca: 'could I get a $1, please', porque: '"I want" em loja soa grosseiro.' },
    { re: /\btell me about you\b/, troca: 'tell me about yourself', porque: 'Reflexivo obrigatório — e é a pergunta mais comum de entrevista.' },
    { re: /\bi did not understand nothing\b/, troca: "I didn't catch that last part", porque: 'Dupla negativa, e admitir "nada" fecha a conversa.' }
];

/* Observações de exercício: não são erros de inglês, são desvios do que
   aquele drill treina. Uma reação de dez palavras não é reação. */
F.data.observacoes = {
    'pergunta-de-volta': {
        testa: function (t) {
            return !/\b(how about you|what about you|and you|do you|did you|have you|are you|were you|would you|can you|is it|any chance)\b/.test(t);
        },
        aviso: 'Você respondeu, mas não devolveu a pergunta. Neste drill, devolver a bola é o objetivo — ' +
            'sem isso a conversa morre no seu turno. Termine com "How about you?" ou "And you?".'
    },
    'curto': {
        testa: function (t) { return F.texto.palavras(t).length > 12; },
        aviso: 'Reação é curta por natureza — duas a cinco palavras. Aqui você fez um comentário, ' +
            'e o tempo do outro passou.'
    },
    'sem-pedido': {
        testa: function (t) {
            return !/\b(could you|would you|can you|sorry|do you mind|any chance|please)\b/.test(t);
        },
        aviso: 'Faltou o pedido educado. É ele que transforma a ordem em pergunta.'
    }
};
