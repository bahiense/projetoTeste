/* =========================================================
   O curso — os dez módulos do Método Altar, condensados para ler
   no celular.

   Cada módulo tem o diagnóstico (o problema real), a virada (a
   ideia que resolve) e um exercício que manda o aluno falar em voz
   alta. Ler módulo sem falar não muda nada: por isso todo módulo
   termina apontando para um treino do app.

   Não há estimativa de leitura nem duração de exercício: o app não
   cronometra nada. Cada um lê e ora no ritmo que quiser.
   ========================================================= */
window.A = window.A || {};

A.MODULOS = [
    {
        n: 1,
        id: 'medo',
        titulo: 'O medo de orar em público',
        sub: 'Por que você trava — e por que isso pode ser aprendido.',
        chave: 'Medo não é falta de fé. É excesso de preocupação com a própria performance.',
        secoes: [
            {
                t: 'A cena que todo mundo teme',
                p: [
                    '"Irmão, pode fazer uma oração?" A mente fica em branco. As palavras somem. ' +
                    'E aí chegam as três perguntas: e se acabar rápido, e se me julgarem, e se eu errar.',
                    'Milhares de cristãos sinceros oram todos os dias em casa e travam completamente ' +
                    'quando são chamados a orar em público. Não são pessoas sem fé. São pessoas que ' +
                    'ainda não aprenderam a conduzir uma oração quando outras pessoas estão ouvindo.'
                ]
            },
            {
                t: 'Dois pensamentos competindo',
                p: [
                    'Quando você está na frente dos outros, dois pensamentos disputam a mesma cabeça: ' +
                    '"o que eu quero dizer a Deus?" e "o que essas pessoas estão pensando de mim?".',
                    'O segundo chega sem ser convidado e rouba o foco palavra por palavra. Quando os ' +
                    'dois competem, o resultado é previsível: você perde o fio, a mente se divide, e vem o branco.'
                ]
            },
            {
                t: 'Talvez o problema não seja começar',
                p: [
                    'A maioria das pessoas consegue começar uma oração. Encontra uma saudação, um ' +
                    'agradecimento, um pedido inicial. O problema aparece logo depois — no silêncio que ' +
                    'vem depois das primeiras palavras.',
                    '"Senhor, abençoa minha família..." e então: e agora? A dificuldade real não é ' +
                    'começar. É não saber desenvolver aquilo que você acabou de dizer.'
                ]
            },
            {
                t: 'Não decore frases. Entenda o caminho.',
                p: [
                    'Uma oração pública raramente é igual à outra: muda o lugar, as pessoas, o momento e ' +
                    'a necessidade. Quem depende de uma oração memorizada fica perdido a cada variação.',
                    'Quem entende o processo não depende da memória. Se esquece uma frase, retoma com o ' +
                    'método. Se a situação muda, se adapta. A confiança cresce a cada oração, em vez de ' +
                    'depender de lembrar o texto certo.'
                ]
            }
        ],
        destaque: 'Você não precisa saber uma oração inteira. Precisa saber qual é o próximo passo.',
        exercicio: {
            t: 'Comece com "Senhor, abençoa minha família..." e responda em voz alta:',
            itens: [
                'Quem da sua família você quer incluir?',
                'O que você gostaria que Deus fizesse por eles?',
                'Existe uma situação específica no seu coração agora?',
                'Quem mais poderia ser incluído?'
            ],
            fecho: 'Você acabou de gerar conteúdo para uma oração inteira. Ele já estava dentro de você.'
        }
    },
    {
        n: 2,
        id: 'problema',
        titulo: 'O problema que ninguém te ensinou',
        sub: 'O que fazer depois da primeira frase.',
        chave: 'O problema não é falta de frases. É falta de direção.',
        secoes: [
            {
                t: 'Quatro causas reais — nenhuma delas é falta de fé',
                p: [
                    '1. Falta de direção: a primeira frase existe, o caminho depois dela não.',
                    '2. Excesso de preocupação: duas mentes trabalhando ao mesmo tempo, nenhuma das duas bem.',
                    '3. Tentativa de parecer espiritual: palavras difíceis para compensar a insegurança.',
                    '4. Falta de prática: nunca houve oportunidade de treinar desenvolver uma ideia em voz alta.',
                    'Nenhum desses problemas é espiritual. Todos são treináveis.'
                ]
            },
            {
                t: 'Particular e pública têm o mesmo propósito',
                p: [
                    'Não existe oração "mais sagrada" porque mais pessoas estão ouvindo. Mas existe uma ' +
                    'diferença prática: na oração pública, outras pessoas precisam conseguir acompanhar.',
                    'Organizar uma oração pública não a torna menos espiritual. Não é técnica no lugar da ' +
                    'unção — é clareza para que os outros consigam caminhar junto com você diante de Deus. ' +
                    'É um ato de amor pela congregação.'
                ]
            },
            {
                t: 'O sintoma mais visível',
                p: [
                    '"Pai... Senhor... meu Deus... Pai..." A repetição de vocativos sem uma ideia depois ' +
                    'raramente é falta de sinceridade. É quase sempre um espaço sendo preenchido enquanto ' +
                    'a pessoa procura a próxima ideia.',
                    'Reconhecer esse padrão em si mesmo não é motivo de vergonha. É o primeiro passo para mudar.'
                ]
            },
            {
                t: 'O erro mais silencioso',
                p: [
                    'Tentar pensar na oração inteira de uma vez: o próximo pedido, o versículo, o final, o ' +
                    'que as pessoas estão achando, quanto tempo já passou — tudo ao mesmo tempo, enquanto ' +
                    'ainda está falando.',
                    'O resultado é sobrecarga cognitiva. A mente não consegue fazer tudo isso junto. Então ela para.'
                ]
            }
        ],
        destaque: 'Você não precisa de mais palavras. Precisa de um mapa.',
        exercicio: {
            t: 'Olhe para a frase "Senhor, abençoa minha família" e liste em voz alta 6 lugares para onde ela pode ir.',
            itens: [
                'Sem repetir o mesmo pedido com outras palavras.',
                'Cada ideia precisa nascer da anterior.',
                'Termine em entrega.'
            ],
            fecho: 'Estrutura não mata a espontaneidade. Estrutura dá direção para a espontaneidade.'
        }
    },
    {
        n: 3,
        id: 'mapa',
        titulo: 'O mapa ALTAR',
        sub: 'A estrutura que organiza uma oração do começo ao fim.',
        chave: 'O método organiza a comunicação. O coração vem de você.',
        secoes: [
            {
                t: 'O que o ALTAR não é',
                p: [
                    'Não é uma oração decorada para repetir. Não é um roteiro seguido palavra por palavra. ' +
                    'Não é técnica para impressionar. Não é fórmula para garantir uma oração "perfeita".',
                    'É uma estrutura mental: organiza o pensamento para que você fique livre para orar com o coração.'
                ]
            },
            {
                t: 'Os cinco movimentos',
                p: [
                    'A — Alinhe o Propósito: qual é o objetivo desta oração?',
                    'L — Ligue o Céu ao Momento: o que está acontecendo aqui?',
                    'T — Trace o Caminho: para onde essa oração pode ir agora?',
                    'A — Aproxime a Congregação: as pessoas conseguem acompanhar e participar?',
                    'R — Reafirme a Confiança: em que estamos confiando enquanto encerramos?'
                ]
            },
            {
                t: 'O mapa orienta, não aprisiona',
                p: [
                    'Não é uma escada para subir degrau por degrau. Dá para voltar a um assunto, ficar em ' +
                    'uma única ideia e explorá-la, mudar de direção por um impulso legítimo, ou encerrar ' +
                    'antes de usar todas as possibilidades.',
                    'Brevidade com intenção é muito mais poderosa do que extensão artificial.'
                ]
            },
            {
                t: 'No começo você percorre as letras. Depois, não.',
                p: [
                    'É normal pensar "já fiz o A e o L, qual é o próximo?" no início. Isso é aprendizagem.',
                    'Com prática, o mapa some como estrutura consciente e resta só a pergunta: "qual é o ' +
                    'próximo movimento?". O mapa fica na mente. A oração fica no coração.'
                ]
            }
        ],
        destaque: 'A · L · T · A · R — um mapa para organizar a oração, não uma fórmula para substituir o coração.',
        exercicio: {
            t: 'Você está numa célula e pedem que ore por uma família em dificuldade. Antes de orar, responda:',
            itens: [
                'A — qual é o propósito?',
                'L — o que está acontecendo?',
                'T — para onde a oração pode ir?',
                'A — que linguagem vai usar?',
                'R — em que vai terminar confiando?'
            ],
            fecho: 'Agora faça a oração em voz alta. Sem escrever antes.'
        }
    },
    {
        n: 4,
        id: 'angulos',
        titulo: 'Como fazer uma ideia crescer',
        sub: 'Os 5 Ângulos: desenvolver sem ficar sem palavras.',
        chave: 'Você não fica sem palavras. Você fica sem perguntas.',
        secoes: [
            {
                t: 'O erro de pular de assunto',
                p: [
                    'A oração começa com família, vai para o trabalho, depois a igreja, a saúde, o governo, ' +
                    'os amigos. Tudo em segundos, tudo na superfície.',
                    'Parece intercessão ampla. É troca de assunto para não ficar sem palavras. Não está ' +
                    'desenvolvendo nada — está sobrevivendo à oração.'
                ]
            },
            {
                t: 'Uma ideia é um território',
                p: [
                    'Quando você diz "família", parece que falou tudo. Mas família não é uma palavra — é um ' +
                    'mundo inteiro, com pessoas reais, situações reais, necessidades reais, uma fé que pode ' +
                    'ser expressa e uma entrega que pode ser feita.',
                    'O problema não é que a ideia é pequena. É que você ainda não aprendeu a entrar nela.'
                ]
            },
            {
                t: 'Os cinco ângulos',
                p: [
                    'Pessoas — quem está envolvido nisso?',
                    'Situações — o que essas pessoas estão vivendo?',
                    'Necessidades — do que elas precisam?',
                    'Fé — o que podemos lembrar sobre Deus diante disso?',
                    'Entrega — o que estamos colocando nas mãos de Deus?',
                    'Não são frases para decorar. São perguntas que encontram conteúdo que você já tem dentro.'
                ]
            },
            {
                t: 'Quando é hora de seguir em frente',
                p: [
                    'Quando você já explorou o que era relevante. Quando percebe que está dizendo a mesma ' +
                    'coisa com outras palavras. Quando outra necessidade importante começa a aparecer.',
                    'Desenvolver não significa insistir. Você permanece enquanto houver algo verdadeiro a dizer.'
                ]
            }
        ],
        destaque: 'Boas perguntas encontram conteúdo que você já tinha — mas não sabia como acessar.',
        exercicio: {
            t: 'Ore pela sua igreja usando os cinco ângulos, um minuto:',
            itens: [
                'Pessoas: quem especificamente?',
                'Situações: o que estão vivendo de real?',
                'Necessidades: do que precisam de Deus?',
                'Fé: o que você pode afirmar sobre quem Deus é?',
                'Entrega: o que coloca nas mãos dEle?'
            ],
            fecho: 'Um assunto só. Sem pular para outro.'
        }
    },
    {
        n: 5,
        id: 'pontes',
        titulo: 'Fazer transições',
        sub: 'As 4 Pontes: passar de uma ideia para outra sem perder o fio.',
        chave: 'O problema não é mudar de assunto. É mudar de assunto sem construir uma ponte.',
        secoes: [
            {
                t: 'Uma oração não é uma lista',
                p: [
                    'Família, trabalho, igreja, saúde, amigos. Todos os assuntos são legítimos — o problema ' +
                    'é a ausência de conexão entre eles.',
                    'Quando a oração soa como lista, quem ouve sente que está acompanhando tópicos sendo ' +
                    'marcados, não um pensamento que avança.'
                ]
            },
            {
                t: 'Transição não é frase — é relação',
                p: [
                    'Muita gente procura a frase bonita que liga dois assuntos e acaba soando artificial. ' +
                    'Uma transição de verdade é uma conexão de pensamento.',
                    'Quando a relação existe, quem ouve nem percebe que houve transição. Simplesmente pensa: ' +
                    '"claro, faz sentido ir para isso agora".'
                ]
            },
            {
                t: 'As quatro pontes',
                p: [
                    'Parte → Todo: um detalhe específico abre uma visão maior.',
                    'Situação → Necessidade: o que está acontecendo conduz ao que precisa ser pedido.',
                    'Necessidade → Fé: o que falta conduz ao que cremos sobre Deus.',
                    'Fé → Entrega: aquilo em que confiamos conduz ao ato de soltar.'
                ]
            },
            {
                t: 'Não anuncie a costura',
                p: [
                    '"Agora eu quero falar sobre...", "passando para outro assunto...", "também quero pedir..." ' +
                    '— essas frases revelam exatamente o que deveriam esconder.',
                    'Uma oração natural não anuncia a própria estrutura. Quando a conexão existe, nenhuma ' +
                    'frase de transição é necessária.'
                ]
            }
        ],
        destaque: 'A nova ideia nasceu da anterior? Existe razão para ir para lá agora? Quem ouve consegue acompanhar?',
        exercicio: {
            t: 'Comece com "Senhor, cuida da nossa igreja..." e construa quatro movimentos conectados:',
            itens: [
                'De "igreja" para algo específico dentro dela.',
                'Do específico para a necessidade que ele revela.',
                'Da necessidade para o que a fé afirma.',
                'Da fé para o que pode ser entregue.'
            ],
            fecho: 'Não existe resposta certa. Existe conexão entre os passos.'
        }
    },
    {
        n: 6,
        id: 'profundidade',
        titulo: 'Como dar profundidade',
        sub: 'Os 5 Níveis: enxergar além do pedido.',
        chave: 'Não procure palavras mais bonitas. Procure detalhes mais verdadeiros.',
        secoes: [
            {
                t: 'Profundidade não é tamanho',
                p: [
                    'Uma oração de dez minutos não é necessariamente melhor do que uma de dois. ' +
                    'Profundidade não se mede pelo relógio.',
                    'Mede-se pela clareza com que você enxerga a situação, pela honestidade com que nomeia ' +
                    'o que está sendo vivido e pela fé com que conecta isso ao caráter de Deus.'
                ]
            },
            {
                t: 'A superfície é o que todos veem',
                p: [
                    '"Ore pelo meu casamento." A superfície é clara. Por trás pode haver distância, ' +
                    'dificuldade de comunicação, mágoas, medo de perder o relacionamento, filhos percebendo ' +
                    'os conflitos, necessidade de perdão.',
                    'Você não precisa mencionar tudo isso — e muitas vezes não deve, para preservar a ' +
                    'privacidade. Mas enxergar esses territórios é o que permite falar de forma verdadeira.'
                ]
            },
            {
                t: 'Pedido e necessidade não são a mesma coisa',
                p: [
                    'O pedido é o que a pessoa consegue articular. A necessidade é o que ela realmente ' +
                    'precisa, muitas vezes sem saber expressar.',
                    '"Senhor, abre uma porta" → "precisamos de sabedoria para saber qual porta atravessar". ' +
                    '"Restaura esse casamento" → "dá humildade para ouvir, coragem para pedir perdão e ' +
                    'sabedoria para reconstruir".'
                ]
            },
            {
                t: 'Profundidade não é falar difícil',
                p: [
                    'Palavras que poucos entendem criam distância em vez de conexão. "Senhor, dá força para ' +
                    'continuar quando ninguém percebe o quanto está difícil" é profunda porque é verdadeira.',
                    'E profundidade também não é emoção forçada: tom carregado, pausa dramática e repetição ' +
                    'para criar efeito não produzem profundidade. Verdade produz.'
                ]
            }
        ],
        destaque: 'Estou repetindo o que já disse com outras palavras — ou revelando uma camada nova?',
        exercicio: {
            t: 'Aprofunde "Senhor, ajuda essa mãe" percorrendo os cinco níveis:',
            itens: [
                'O que ela pode estar vivendo?',
                'O que isso está causando nela?',
                'Do que ela realmente precisa?',
                'O que podemos lembrar sobre Deus?',
                'O que entregamos a Ele?'
            ],
            fecho: 'Depois ore em voz alta. Sem inventar o que você não sabe.'
        }
    },
    {
        n: 7,
        id: 'confianca',
        titulo: 'Como orar com confiança',
        sub: 'O estado mental de quem ora mesmo com medo.',
        chave: 'O medo pode estar presente sem estar no controle.',
        secoes: [
            {
                t: 'Saber o método e acessá-lo sob pressão são coisas diferentes',
                p: [
                    'Você pode dominar o ALTAR, os Ângulos, as Pontes e os Níveis — e ainda assim ficar em ' +
                    'branco quando todos olham para você.',
                    'Isso não significa que você não aprendeu. Significa que falta treinar uma habilidade ' +
                    'específica: entrar no estado mental que permite executar o método sob pressão.'
                ]
            },
            {
                t: 'A ordem certa',
                p: [
                    'Muita gente espera: conforto → confiança → ação. E o momento nunca chega.',
                    'A ordem que funciona é a inversa: ação → experiência → confiança. Cada vez que você ora ' +
                    'mesmo com medo, produz uma evidência interna de que é capaz. Confiança é a soma dessas evidências.'
                ]
            },
            {
                t: 'Mude o foco',
                p: [
                    'Foco em si mesmo: "minha voz está tremendo?", "estou falando bonito?", "estão me julgando?". ' +
                    'Quanto mais atenção em si, maior a pressão.',
                    'Foco na missão: "por que estou orando?", "o que essas pessoas estão vivendo?", "qual é o ' +
                    'próximo passo?". Instrumentos não ficam travados pensando em si mesmos.'
                ]
            },
            {
                t: 'A pausa não é sua inimiga',
                p: [
                    'Uma pausa de dois segundos parece uma eternidade para quem ora e passa despercebida para ' +
                    'quem ouve — ou é percebida como profundidade intencional.',
                    'O problema não é a pausa: é o que fazemos para preenchê-la. Uma pausa consciente é melhor ' +
                    'do que uma frase desesperada.'
                ]
            },
            {
                t: 'Errar não invalida a oração',
                p: [
                    'Trocou uma palavra, repetiu uma frase, precisou se corrigir, falou mais baixo: corrija o ' +
                    'necessário e continue. Sem se desculpar por cada imperfeição.',
                    'Orações que parecem humanas e presentes frequentemente tocam mais do que orações impecáveis e distantes.'
                ]
            }
        ],
        destaque: 'Quando não souber o que fazer, volte ao próximo movimento.',
        exercicio: {
            t: 'Antes de orar, diga mentalmente: "não preciso impressionar, preciso servir este momento". Depois:',
            itens: [
                'Respire uma vez, devagar.',
                'Escolha começar mais lento do que o nervosismo pede.',
                'Pense só no primeiro movimento.',
                'Ore — e volte para "qual é o próximo passo?" toda vez que se pegar avaliando a si mesmo.'
            ],
            fecho: 'O objetivo não é a oração perfeita. É perceber o que muda quando você para de tentar controlar tudo antes de começar.'
        }
    },
    {
        n: 8,
        id: 'adaptar',
        titulo: 'Adaptar para qualquer situação',
        sub: 'A mesma estrutura em culto, hospital, casamento, velório ou reunião.',
        chave: 'O método não muda. O contexto muda.',
        secoes: [
            {
                t: 'Leia o momento em três perguntas',
                p: [
                    'Quem está diante de mim? O que está acontecendo? O que este momento precisa?',
                    'Nem sempre o óbvio é o que o momento pede. Um casamento pode precisar de sabedoria, não ' +
                    'só de bênção. Um hospital pode precisar de força, não só de cura.'
                ]
            },
            {
                t: 'Três adaptadores',
                p: [
                    'Pessoas: congregação, família, um casal, uma pessoa — a linguagem e o foco mudam.',
                    'Momento: culto, casamento, hospital, velório, reunião — o tom muda.',
                    'Necessidade: sabedoria, força, consolo, direção — é ela que define o coração da oração.'
                ]
            },
            {
                t: 'Quando o tempo muda',
                p: [
                    'Duração altera a quantidade de desenvolvimento, não a estrutura. Em 30 segundos você ' +
                    'condensa cada etapa do ALTAR em uma frase. Em cinco minutos você desenvolve com ' +
                    'ângulos, pontes e níveis.',
                    'Mais tempo não significa mais repetição. Significa mais espaço para desenvolver.'
                ]
            },
            {
                t: 'Situações sensíveis',
                p: [
                    'Não invente. Não especule. Não exponha. Não mencione detalhes que você ouviu de terceiros ' +
                    'nem finja conhecer toda a situação.',
                    '"Senhor, Tu conheces toda essa situação. Nós não sabemos tudo o que está acontecendo, mas ' +
                    'sabemos que Tu conheces." — é respeitoso, verdadeiro e suficiente.'
                ]
            }
        ],
        destaque: 'Honestidade diante de Deus é mais poderosa que precisão de informações.',
        exercicio: {
            t: 'A mesma necessidade — "precisamos de direção" — em dois contextos, um minuto cada:',
            itens: [
                'Uma família diante de uma decisão.',
                'Uma reunião de trabalho ou de ministério.',
                'Depois pergunte: o que mudou? O que permaneceu?'
            ],
            fecho: 'Mudou o contexto, a linguagem e o tom. Permaneceu a estrutura, o propósito e a fé.'
        }
    },
    {
        n: 9,
        id: 'programa',
        titulo: 'O programa de 21 dias',
        sub: 'Onde o entendimento vira habilidade.',
        chave: 'Pratique pequeno. Repita. Aumente a dificuldade.',
        secoes: [
            {
                t: 'Não é o número 21 que transforma',
                p: [
                    'Não existe promessa científica de que 21 dias criam um hábito. O valor está na ' +
                    'consistência, na progressão e na intencionalidade.',
                    'São três fases: dias 1 a 7 aprender a começar, 8 a 14 aprender a desenvolver, ' +
                    '15 a 21 aprender a conduzir.'
                ]
            },
            {
                t: 'Cinco regras para não abandonar',
                p: [
                    '1. Pratique todos os dias, mesmo que pouco.',
                    '2. Não escreva a oração inteira antes — o programa treina construção, não memorização.',
                    '3. Não busque perfeição: o objetivo é terminar o exercício.',
                    '4. Faça em voz alta. Pensar sobre oração não substitui orar.',
                    '5. Registre o que percebeu: o que foi fácil, o que foi difícil.'
                ]
            }
        ],
        destaque: 'Uma oração concluída imperfeita vale mais do que uma oração perfeita não iniciada.',
        exercicio: {
            t: 'O programa está na aba Programa. Comece hoje pelo Dia 1:',
            itens: [
                'Escolha um tema.',
                'Ore em voz alta — uma ideia, dita inteira.',
                'Uma frase de reflexão no fim.'
            ],
            fecho: 'É pouco de propósito. O exercício é começar sem planejar tudo.'
        }
    },
    {
        n: 10,
        id: 'vidareal',
        titulo: 'O método na vida real',
        sub: 'Quando o método desaparece, a oração aparece.',
        chave: 'A resposta mudou: de "e se eu travar?" para "se eu travar, sei como continuar".',
        secoes: [
            {
                t: 'A pergunta que resolve quase tudo',
                p: [
                    '"E agora?" Ela não exige que você enxergue a oração inteira — só o próximo movimento.',
                    'Falei da situação → identifique a necessidade. Identifiquei a necessidade → lembre quem ' +
                    'Deus é. Lembrei quem Deus é → aprofunde, inclua mais pessoas ou caminhe para a entrega.',
                    'As respostas possíveis sempre existem: desenvolver, conectar, aprofundar, incluir, entregar ou encerrar.'
                ]
            },
            {
                t: 'Quem está ouvindo não precisa ver o método',
                p: [
                    'Ninguém deve perceber "agora ele está no terceiro ângulo". Se a estrutura aparece, é ' +
                    'porque está aparecendo demais.',
                    'O que a congregação deve perceber é sinceridade, direção, profundidade, conexão e propósito. ' +
                    'Esses são os resultados do método funcionando nos bastidores.'
                ]
            },
            {
                t: 'Curta demais, longa demais',
                p: [
                    '"Sinto que terminei rápido demais": não repita. Pergunte o que ainda não foi desenvolvido ' +
                    'e use outro ângulo, ou aprofunde um nível.',
                    '"Estou repetindo": encerre a ideia atual com clareza, faça uma ponte, aprofunde ou caminhe ' +
                    'conscientemente para a entrega.'
                ]
            }
        ],
        destaque: 'Sua voz não precisa ser perfeita. Ela precisa estar disponível.',
        exercicio: {
            t: 'Prática final, sem instruções detalhadas:',
            itens: [
                'Pense em alguém ou em alguma situação.',
                'Faça o checklist mental: quem, o quê, necessidade, primeiro movimento.',
                'Ore em voz alta, até o assunto se completar.',
                'Depois fique em silêncio um instante e perceba: "eu consegui continuar".'
            ],
            fecho: 'Você não precisa de permissão nem de condições perfeitas. Precisa apenas começar.'
        }
    }
];
