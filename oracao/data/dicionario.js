/* =========================================================
   Dicionário Altar — 100 palavras e expressões.

   Existe para ampliar o repertório, não para medir espiritualidade:
   "se uma palavra parece estranha na sua boca, não force o uso dela".
   Por isso cada verbete guarda a dica de quando *não* usar.
   ========================================================= */
window.A = window.A || {};

A.DIC_CATEGORIAS = [
    { id: 'pedir', nome: 'Pedir', d: 'Quando você precisa pedir algo a Deus' },
    { id: 'agradecer', nome: 'Agradecer', d: 'Quando você quer expressar gratidão' },
    { id: 'deus', nome: 'Quem Deus é', d: 'Quando você quer descrever o caráter de Deus' },
    { id: 'protecao', nome: 'Proteção', d: 'Quando você quer pedir que Deus cubra e guarde' },
    { id: 'dificil', nome: 'Momentos difíceis', d: 'Quando alguém está sofrendo' },
    { id: 'direcao', nome: 'Direção', d: 'Quando você precisa que Deus guie um caminho' },
    { id: 'igreja', nome: 'Igreja', d: 'Quando você ora pela comunidade' },
    { id: 'entrega', nome: 'Entrega e confiança', d: 'Quando a oração caminha para soltar' },
    { id: 'conectar', nome: 'Começar, conectar e encerrar', d: 'As junções da oração' }
];

A.DICIONARIO = [
    /* ---- pedir ---- */
    { n: 1, cat: 'pedir', p: 'Súplica', sig: 'Um pedido feito com humildade e urgência, reconhecendo a necessidade de Deus.', vez: 'Senhor, nós pedimos que Tu nos ajudes...', diga: 'Senhor, apresentamos diante de Ti a nossa súplica...', ex: 'Pai, recebe a nossa súplica por esta família.', dica: 'Natural em intercessão intensa. Para pedidos simples, "pedido" funciona bem.' },
    { n: 2, cat: 'pedir', p: 'Clamor', sig: 'Um grito do coração; apelo urgente e sincero.', vez: 'Senhor, nós estamos aqui te pedindo...', diga: 'Senhor, ouve o nosso clamor neste momento...', ex: 'Pai, o nosso clamor chega até Ti hoje.', dica: 'Use em urgência ou necessidade coletiva. Evite em agradecimentos.' },
    { n: 3, cat: 'pedir', p: 'Petição', sig: 'Um pedido específico apresentado a Deus.', vez: 'Senhor, o que a gente quer é...', diga: 'Apresentamos esta petição diante de Ti...', ex: 'Recebe, Pai, a nossa petição por este irmão.', dica: 'Boa para intercessão com foco claro.' },
    { n: 4, cat: 'pedir', p: 'Rogo', sig: 'Pedir com insistência e reverência.', vez: 'Senhor, tô te pedindo muito...', diga: 'Rogamos a Ti, Senhor, por esta situação...', ex: 'Pai, rogamos que Tua mão intervenha agora.', dica: 'Combina com momentos solenes. Não force se não se sentir à vontade.' },
    { n: 5, cat: 'pedir', p: 'Intercessão', sig: 'Orar em nome de outra pessoa, colocando-a diante de Deus.', vez: 'Senhor, ajuda esse irmão...', diga: 'Fazemos intercessão por este irmão, Senhor...', ex: 'Recebe nossa intercessão por esta família hoje.', dica: 'Essencial em orações coletivas.' },
    { n: 6, cat: 'pedir', p: 'Implorar', sig: 'Pedir com grande intensidade e humildade.', vez: 'Senhor, preciso muito que Tu...', diga: 'Imploro a Tua misericórdia sobre esta situação...', ex: 'Pai, imploro Tua graça sobre esta família.', dica: 'Reserve para momentos realmente urgentes.' },
    { n: 7, cat: 'pedir', p: 'Pleitear', sig: 'Apresentar um pedido com firmeza, como quem sustenta uma causa.', vez: 'Senhor, fica de olho nisso...', diga: 'Pleiteamos a Tua intervenção nesta causa...', ex: 'Senhor, pleiteamos a cura desta pessoa.', dica: 'Boa para intercessão com base bíblica.' },
    { n: 8, cat: 'pedir', p: 'Buscar', sig: 'Aproximar-se de Deus com intenção.', vez: 'Senhor, a gente tá aqui...', diga: 'Buscamos a Tua face neste momento...', ex: 'Senhor, buscamos Tua direção para esta decisão.', dica: 'Simples e versátil — uma das mais úteis do dicionário.' },
    { n: 9, cat: 'pedir', p: 'Apresentar', sig: 'Colocar diante de Deus uma necessidade, pessoa ou situação.', vez: 'Senhor, olha por...', diga: 'Apresentamos diante de Ti esta necessidade...', ex: 'Pai, apresentamos estes jovens diante de Ti.', dica: 'Excelente para transições. Fluida e natural.' },
    { n: 10, cat: 'pedir', p: 'Entregar', sig: 'Depositar em Deus algo que está além do nosso controle.', vez: 'Senhor, cuida disso pra gente...', diga: 'Entregamos esta situação nas Tuas mãos...', ex: 'Pai, entregamos nossos filhos nos Teus braços.', dica: 'Das expressões mais naturais para encerrar um pedido.' },

    /* ---- agradecer ---- */
    { n: 11, cat: 'agradecer', p: 'Gratidão', sig: 'Reconhecer profundamente o bem recebido de Deus.', vez: 'Senhor, obrigado por tudo...', diga: 'Expressamos nossa gratidão por Tua fidelidade...', ex: 'Com gratidão, nos colocamos diante de Ti, Senhor.', dica: 'Boa para abrir uma oração de ação de graças.' },
    { n: 12, cat: 'agradecer', p: 'Agradecimento', sig: 'Expressar verbalmente o que foi recebido.', vez: 'Senhor, a gente agradece muito...', diga: 'Elevamos nosso agradecimento por esta conquista...', ex: 'Recebe, Pai, nosso agradecimento sincero.', dica: 'Substitui bem o repetitivo "obrigado".' },
    { n: 13, cat: 'agradecer', p: 'Reconhecimento', sig: 'Declarar que Deus agiu e é o autor da bênção.', vez: 'Senhor, a gente sabe que foi o Senhor...', diga: 'Com reconhecimento, declaramos que foi Tua mão...', ex: 'Pai, em reconhecimento à Tua obra, Te glorificamos.', dica: 'Poderosa depois de testemunhos.' },
    { n: 14, cat: 'agradecer', p: 'Louvor', sig: 'Exaltar quem Deus é, independente das circunstâncias.', vez: 'Senhor, Te agradecemos...', diga: 'Elevamos nosso louvor ao Teu nome, Senhor...', ex: 'Nosso louvor sobe até Ti hoje, Pai.', dica: 'Distinto de gratidão: louvor celebra quem Ele é, não só o que fez.' },
    { n: 15, cat: 'agradecer', p: 'Exaltação', sig: 'Elevar o nome de Deus acima de tudo.', vez: 'Senhor, Tu és muito bom...', diga: 'Exaltamos o Teu nome sobre toda situação...', ex: 'Pai, que Tua exaltação ressoe nesta casa.', dica: 'Momentos de adoração e abertura de culto.' },
    { n: 16, cat: 'agradecer', p: 'Celebração', sig: 'Expressar alegria por algo que Deus realizou.', vez: 'Senhor, a gente tá feliz...', diga: 'Celebramos diante de Ti esta conquista...', ex: 'Em celebração, nos reunimos para declarar Tua bondade.', dica: 'Boa em momentos festivos da igreja.' },
    { n: 17, cat: 'agradecer', p: 'Bênção', sig: 'O favor e a provisão de Deus sobre uma vida ou situação.', vez: 'Senhor, abençoa...', diga: 'Que Tua bênção cubra esta família...', ex: 'Reconhecemos Tua bênção sobre este projeto, Pai.', dica: 'Use com especificidade: bênção sobre o quê, sobre quem?' },
    { n: 18, cat: 'agradecer', p: 'Fidelidade', sig: 'A constância de Deus em cumprir o que prometeu.', vez: 'Senhor, Tu nunca falha...', diga: 'Testemunhamos a Tua fidelidade sobre nossas vidas...', ex: 'Pai, Te agradecemos pela Tua fidelidade neste ano.', dica: 'Poderosa no encerramento de um ano ou período.' },
    { n: 19, cat: 'agradecer', p: 'Bondade', sig: 'O caráter bom de Deus agindo a favor do Seu povo.', vez: 'Senhor, Tu é bom...', diga: 'Reconhecemos a Tua bondade sobre nossas vidas...', ex: 'Pai, a Tua bondade nos sustentou até aqui.', dica: 'Combine com "fidelidade" para gratidão profunda.' },
    { n: 20, cat: 'agradecer', p: 'Misericórdia', sig: 'O amor compassivo de Deus que age mesmo quando não merecemos.', vez: 'Senhor, obrigado pela chance...', diga: 'Elevamos nossa gratidão pela Tua misericórdia...', ex: 'Pai, é pela Tua misericórdia que estamos aqui.', dica: 'Palavra de peso. Use com consciência do que ela carrega.' },

    /* ---- quem Deus é ---- */
    { n: 21, cat: 'deus', p: 'Soberania', sig: 'Deus governa sobre tudo.', ex: 'Pai, reconhecemos a Tua soberania sobre esta situação.' },
    { n: 22, cat: 'deus', p: 'Majestade', sig: 'A grandiosidade e a glória de Deus.', ex: 'Diante da Tua majestade, nos curvamos.' },
    { n: 23, cat: 'deus', p: 'Santidade', sig: 'A perfeição absoluta de Deus.', ex: 'Reconhecemos a Tua santidade, Senhor.' },
    { n: 24, cat: 'deus', p: 'Fidelidade', sig: 'Deus cumpre cada promessa.', ex: 'Tua fidelidade nos sustenta, Pai.' },
    { n: 25, cat: 'deus', p: 'Bondade', sig: 'O caráter bom de Deus em ação.', ex: 'Declaramos a Tua bondade sobre nossas vidas.' },
    { n: 26, cat: 'deus', p: 'Misericórdia', sig: 'Amor compassivo que age a favor do povo.', ex: 'Derrama a Tua misericórdia sobre nós.' },
    { n: 27, cat: 'deus', p: 'Graça', sig: 'O favor imerecido de Deus.', ex: 'Agimos sob a Tua graça, Senhor.' },
    { n: 28, cat: 'deus', p: 'Providência', sig: 'Deus supre e cuida com antecedência.', ex: 'Confiamos na Tua providência, Pai.' },
    { n: 29, cat: 'deus', p: 'Onipotência', sig: 'Deus todo-poderoso, sem limitações.', ex: 'Cremos na Tua onipotência sobre esta situação.' },
    { n: 30, cat: 'deus', p: 'Grandeza', sig: 'O tamanho e o peso de quem Deus é.', ex: 'Pai, a Tua grandeza está além das nossas palavras.' },

    /* ---- proteção ---- */
    { n: 31, cat: 'protecao', p: 'Guardar', sig: 'Deus como guardião ativo da nossa vida.', ex: 'Guarda esta família, Senhor, em Teu amor.' },
    { n: 32, cat: 'protecao', p: 'Amparar', sig: 'Sustento nos momentos de fragilidade.', ex: 'Ampara quem está fraco neste momento.' },
    { n: 33, cat: 'protecao', p: 'Sustentar', sig: 'Manter firme o que está ameaçado de cair.', ex: 'Sustenta este casal em Tua mão, Pai.' },
    { n: 34, cat: 'protecao', p: 'Proteger', sig: 'Simples e direto — sempre eficaz.', ex: 'Protege nossas famílias, Senhor.' },
    { n: 35, cat: 'protecao', p: 'Livrar', sig: 'Retirar de uma situação de perigo.', ex: 'Livra-nos do mal, Pai.' },
    { n: 36, cat: 'protecao', p: 'Preservar', sig: 'Manter íntegro o que Deus já deu.', ex: 'Preserva a saúde deste irmão, Senhor.' },
    { n: 37, cat: 'protecao', p: 'Resguardar', sig: 'Proteger com atenção especial.', ex: 'Resguarda estes jovens de todo o mal.' },
    { n: 38, cat: 'protecao', p: 'Fortalecer', sig: 'Dar força interior para resistir e avançar.', ex: 'Fortalece esta família na fé, Senhor.' },
    { n: 39, cat: 'protecao', p: 'Cobrir', sig: 'Imagem de proteção total.', ex: 'Cobre com Teu sangue este lar.' },
    { n: 40, cat: 'protecao', p: 'Cercar', sig: 'Proteção de todos os lados, sem brechas.', ex: 'Cerca esta vida com Teus anjos, Pai.' },

    /* ---- momentos difíceis ---- */
    { n: 41, cat: 'dificil', p: 'Consolo', sig: 'O toque de Deus que alivia a dor e traz paz.', vez: 'Senhor, ajuda essa pessoa...', diga: 'Derrama o Teu consolo sobre este coração...', ex: 'Pai, que o Teu consolo abrace esta família.', dica: 'Profunda em momentos de luto e perda.' },
    { n: 42, cat: 'dificil', p: 'Restauração', sig: 'Deus devolvendo o que foi perdido, consertando o que foi quebrado.', vez: 'Senhor, muda essa situação...', diga: 'Que a Tua restauração alcance este lar...', ex: 'Senhor, que a Tua restauração aconteça neste casamento.', dica: 'Recuperação física, relacional ou espiritual.' },
    { n: 43, cat: 'dificil', p: 'Renovação', sig: 'Um recomeço dado por Deus: nova força, novo ânimo.', vez: 'Senhor, dá força de novo...', diga: 'Que a Tua renovação alcance este coração cansado...', ex: 'Pai, renova as forças desta pessoa que está esgotada.', dica: 'Quando a pessoa está emocionalmente desgastada.' },
    { n: 44, cat: 'dificil', p: 'Refrigério', sig: 'Descanso e alívio que vêm da presença de Deus.', vez: 'Senhor, dá um descanso pra essa pessoa...', diga: 'Que o Teu refrigério alcance este coração, Pai...', ex: 'Senhor, sê o refrigério desta alma cansada.', dica: 'Palavra bíblica com profundidade. Use com consciência.' },
    { n: 45, cat: 'dificil', p: 'Fortalecimento', sig: 'O processo de Deus tornando alguém mais forte por dentro.', vez: 'Senhor, dá força...', diga: 'Opera o Teu fortalecimento interior nesta vida...', ex: 'Pai, que o Teu fortalecimento sustente este irmão.', dica: 'Para quem enfrenta pressão contínua.' },
    { n: 46, cat: 'dificil', p: 'Socorro', sig: 'Ajuda imediata em situação de urgência.', ex: 'Socorre, Senhor, este irmão em necessidade.' },
    { n: 47, cat: 'dificil', p: 'Esperança', sig: 'A confiança firme no cuidado de Deus.', ex: 'Acende a esperança neste coração, Pai.' },
    { n: 48, cat: 'dificil', p: 'Cura', sig: 'Restauração física, emocional ou espiritual.', ex: 'Que a Tua cura se manifeste neste corpo.' },
    { n: 49, cat: 'dificil', p: 'Amparo', sig: 'Deus como suporte nos momentos mais frágeis.', ex: 'Ampara quem está sozinho neste momento.' },
    { n: 50, cat: 'dificil', p: 'Conforto', sig: 'A presença de Deus como bálsamo para a dor.', ex: 'Que o Teu conforto envolva este coração partido.' },

    /* ---- direção ---- */
    { n: 51, cat: 'direcao', p: 'Direção', sig: 'O guia de Deus sobre o caminho a seguir.', ex: 'Senhor, precisamos da Tua direção para esta decisão.' },
    { n: 52, cat: 'direcao', p: 'Sabedoria', sig: 'A capacidade de escolher bem segundo Deus.', ex: 'Concede-nos sabedoria para agir corretamente, Pai.' },
    { n: 53, cat: 'direcao', p: 'Discernimento', sig: 'Ver além do aparente com os olhos de Deus.', ex: 'Que o Teu discernimento nos guie nesta hora.' },
    { n: 54, cat: 'direcao', p: 'Orientação', sig: 'Instrução divina para o próximo passo.', ex: 'Buscamos Tua orientação, Senhor.' },
    { n: 55, cat: 'direcao', p: 'Condução', sig: 'Deus guiando ativamente o percurso.', ex: 'Que Tua mão nos conduza neste processo.' },
    { n: 56, cat: 'direcao', p: 'Propósito', sig: 'O plano de Deus para uma pessoa ou situação.', ex: 'Revela o Teu propósito para esta vida, Senhor.' },
    { n: 57, cat: 'direcao', p: 'Caminho', sig: 'Simples e poderosa. Nunca soa artificial.', ex: 'Ilumina o nosso caminho, Pai.' },
    { n: 58, cat: 'direcao', p: 'Instrução', sig: 'Ensinamento direto de Deus.', ex: 'Que a Tua instrução nos alcance por meio da Palavra.' },
    { n: 59, cat: 'direcao', p: 'Entendimento', sig: 'Compreensão que vem do Espírito.', ex: 'Concede-nos entendimento nesta situação.' },
    { n: 60, cat: 'direcao', p: 'Decisão', sig: 'A escolha que honra a Deus.', ex: 'Que esta decisão seja tomada sob Tua luz, Senhor.' },

    /* ---- igreja ---- */
    { n: 61, cat: 'igreja', p: 'Comunhão', sig: 'A vida compartilhada do povo de Deus.', ex: 'Restaura a comunhão entre nós, Senhor.' },
    { n: 62, cat: 'igreja', p: 'Unidade', sig: 'O que o Espírito une e a discórdia tenta desfazer.', ex: 'Que a unidade prevaleça nesta congregação.' },
    { n: 63, cat: 'igreja', p: 'Edificação', sig: 'Aquilo que constrói e amadurece as pessoas.', ex: 'Que esta Palavra nos edifique, Pai.' },
    { n: 64, cat: 'igreja', p: 'Avivamento', sig: 'Vida espiritual renovada sobre uma comunidade.', ex: 'Derrama o Teu avivamento sobre esta igreja.' },
    { n: 65, cat: 'igreja', p: 'Consagração', sig: 'Separar algo ou alguém para o serviço de Deus.', ex: 'Que esta casa seja consagrada ao Teu serviço.' },
    { n: 66, cat: 'igreja', p: 'Santificação', sig: 'O processo de Deus formando caráter.', ex: 'Opera Tua santificação em nossas vidas.' },
    { n: 67, cat: 'igreja', p: 'Crescimento', sig: 'Aumento em número e em maturidade.', ex: 'Que esta igreja cresça para a Tua glória.' },
    { n: 68, cat: 'igreja', p: 'Serviço', sig: 'A postura de quem serve em vez de aparecer.', ex: 'Que nos tornemos instrumentos de serviço, Pai.' },
    { n: 69, cat: 'igreja', p: 'Fortalecimento', sig: 'Firmeza dada a cada membro.', ex: 'Fortalece cada membro desta congregação.' },
    { n: 70, cat: 'igreja', p: 'Ministério', sig: 'O trabalho entregue a cada pessoa dentro da igreja.', ex: 'Abençoa cada ministério desta casa, Senhor.' },

    /* ---- entrega ---- */
    { n: 71, cat: 'entrega', p: 'Entrega', sig: 'Colocar nas mãos de Deus o que não se resolve aqui.', ex: 'Em entrega, colocamos isto nas Tuas mãos.' },
    { n: 72, cat: 'entrega', p: 'Confiança', sig: 'Apoiar-se em Deus antes de ver a resposta.', ex: 'Com confiança, nos aproximamos de Ti.' },
    { n: 73, cat: 'entrega', p: 'Submissão', sig: 'Colocar a própria vontade sob a de Deus.', ex: 'Em submissão, nos colocamos sob Tua vontade.' },
    { n: 74, cat: 'entrega', p: 'Consagração', sig: 'Dedicar um tempo, um espaço ou uma vida a Deus.', ex: 'Consagramos este tempo ao Senhor.' },
    { n: 75, cat: 'entrega', p: 'Dependência', sig: 'Reconhecer que não damos conta sozinhos.', ex: 'Reconhecemos nossa dependência de Ti, Pai.' },
    { n: 76, cat: 'entrega', p: 'Descanso', sig: 'Parar de carregar o que já foi entregue.', ex: 'Descansamos esta situação em Ti, Senhor.' },
    { n: 77, cat: 'entrega', p: 'Espera', sig: 'A paciência ativa de quem confia.', ex: 'Em espera, aguardamos Tua resposta, Pai.' },
    { n: 78, cat: 'entrega', p: 'Rendição', sig: 'Abrir mão do controle.', ex: 'Em rendição, entregamos nossa vontade à Tua.' },
    { n: 79, cat: 'entrega', p: 'Esperança', sig: 'A expectativa firmada em Deus, não no cenário.', ex: 'Nossa esperança está firmada em Ti, Senhor.' },
    { n: 80, cat: 'entrega', p: 'Fé', sig: 'Crer antes de ver.', ex: 'Com fé, cremos que Tu agirás nesta situação.' },

    /* ---- começar, conectar e encerrar ---- */
    { n: 81, cat: 'conectar', p: '"Neste momento..."', sig: 'Situa a oração no tempo presente, criando foco.', dica: 'No início de qualquer oração ou transição. Alternativas: "nesta hora...", "agora, Senhor...".', ex: 'Neste momento, nos colocamos diante de Ti, Pai.' },
    { n: 82, cat: 'conectar', p: '"Diante da Tua presença..."', sig: 'Reconhece que Deus está presente e que a oração é dirigida a Ele.', dica: 'Abertura solene. Alternativas: "em Tua presença...", "diante de Ti...".', ex: 'Diante da Tua presença, nos colocamos com humildade.' },
    { n: 83, cat: 'conectar', p: '"Conforme a Tua Palavra..."', sig: 'Ancora o pedido em uma promessa bíblica.', dica: 'Só quando existe mesmo uma passagem por trás. Alternativa: "segundo prometeste...".', ex: 'Conforme a Tua Palavra, cremos que serás fiel.' },
    { n: 84, cat: 'conectar', p: '"Por isso..."', sig: 'Conector que liga um reconhecimento a um pedido.', dica: 'A ponte mais simples que existe. Use no lugar de "também quero pedir".', ex: 'Por isso, apresentamos esta necessidade a Ti.' },
    { n: 85, cat: 'conectar', p: '"Diante disso..."', sig: 'Liga o que foi percebido ao que vai ser pedido.', dica: 'Faz a transição sem anunciar mudança de assunto.', ex: 'Diante disso, pedimos sabedoria para os próximos passos.' },
    { n: 86, cat: 'conectar', p: '"Confiando em Ti..."', sig: 'Declara fé antes do pedido.', dica: 'Boa para iniciar um pedido difícil ou delicado.', ex: 'Confiando em Ti, apresentamos esta situação, Pai.' },
    { n: 87, cat: 'conectar', p: '"Entregamos em Tuas mãos..."', sig: 'Expressa rendição ao encerrar um pedido.', dica: 'Prepara o encerramento sem cortar a oração.', ex: 'Entregamos em Tuas mãos o que não conseguimos resolver.' },
    { n: 88, cat: 'conectar', p: '"Que a Tua vontade prevaleça..."', sig: 'Submissão à soberania de Deus, mesmo sem ver a resposta.', dica: 'Honesta quando o desfecho não depende de nós.', ex: 'Que a Tua vontade prevaleça sobre os nossos planos, Senhor.' },
    { n: 89, cat: 'conectar', p: '"Para a Tua glória..."', sig: 'Define o propósito final da oração.', dica: 'Reorienta o pedido para a honra de Deus, não para o nosso benefício.', ex: 'Age nesta situação para a Tua glória, Pai.' },
    { n: 90, cat: 'conectar', p: '"Para que o Teu nome seja glorificado..."', sig: 'A mesma ideia, em forma de propósito declarado.', dica: 'Encerramento comum em orações de consagração.', ex: 'Que tudo isso aconteça para que o Teu nome seja glorificado.' },
    { n: 91, cat: 'conectar', p: '"Em nome de Jesus..."', sig: 'Encerramento clássico, na autoridade de Cristo.', dica: 'Sozinho já encerra. Não precisa de fila de frases depois dele.', ex: 'Em nome de Jesus, amém.' },
    { n: 92, cat: 'conectar', p: '"No poderoso nome de Jesus..."', sig: 'Variação enfática do encerramento.', dica: 'Use quando a oração pediu intervenção, não em toda oração.', ex: 'No poderoso nome de Jesus, amém.' },
    { n: 93, cat: 'conectar', p: '"Cremos e recebemos..."', sig: 'Declara fé no que foi pedido.', dica: 'Combina com orações de intercessão.', ex: 'Cremos e recebemos o que o Senhor tem para nós.' },
    { n: 94, cat: 'conectar', p: '"Selamos esta oração em fé..."', sig: 'Fecha o que foi dito como quem confia.', dica: 'Encerramento firme, sem alongar.', ex: 'Selamos esta oração em fé, Senhor.' },
    { n: 95, cat: 'conectar', p: '"Que assim seja, Senhor."', sig: 'Um "amém" dito por extenso.', dica: 'Simples e reverente. Boa para grupos pequenos.', ex: 'Que assim seja, Senhor.' },
    { n: 96, cat: 'conectar', p: '"A Ti toda a glória."', sig: 'Doxologia curta de encerramento.', dica: 'Fecha sem pedir mais nada — e isso é bom.', ex: 'A Ti toda a glória, agora e sempre.' },
    { n: 97, cat: 'conectar', p: '"Declaramos sobre esta situação..."', sig: 'Afirma em voz alta o que se crê.', dica: 'Precisa vir depois de algo verdadeiro já dito, senão soa vazio.', ex: 'Declaramos sobre esta situação a paz que vem de Ti.' },
    { n: 98, cat: 'conectar', p: '"Recebemos por fé..."', sig: 'Recebe agora o que ainda não se vê.', dica: 'Boa em orações de gratidão antecipada.', ex: 'Recebemos por fé aquilo que ainda não vemos.' },
    { n: 99, cat: 'conectar', p: '"É em nome de Jesus que oramos."', sig: 'Encerramento explicativo, comum em cultos.', dica: 'Uma variação para não repetir sempre a mesma fórmula.', ex: 'É em nome de Jesus que oramos, amém.' },
    { n: 100, cat: 'conectar', p: '"Amém."', sig: 'O fim. Vale mais quando o que veio antes já concluiu.', dica: 'Se você precisa de três frases depois do amém, a oração ainda não tinha terminado.', ex: 'Amém.' }
];

/* Mapa de substituição — o antídoto para a frase que se repete.
   O analisador usa esta mesma tabela para sugerir alternativas
   quando percebe a mesma palavra voltando muitas vezes. */
A.SUBSTITUICOES = [
    { comum: 'ajuda', alt: ['sustenta', 'ampara', 'fortalece', 'socorre', 'intervém nesta situação'] },
    { comum: 'abençoa', alt: ['derrama Tua graça sobre', 'favorece', 'concede Tua bênção a'] },
    { comum: 'cuida', alt: ['guarda', 'ampara', 'preserva', 'sustenta com Tua mão'] },
    { comum: 'pedimos', alt: ['apresentamos diante de Ti', 'suplicamos', 'clamamos por', 'intercedemos'] },
    { comum: 'olha por', alt: ['volta Teu olhar para', 'manifesta Teu cuidado sobre', 'contempla esta necessidade'] },
    { comum: 'dá força', alt: ['fortalece', 'renova as forças de', 'sustenta interiormente'] },
    { comum: 'muda', alt: ['transforma', 'restaura', 'intervém com poder', 'renova este cenário'] },
    { comum: 'estamos aqui', alt: ['nos colocamos diante de Ti', 'nos reunimos em Tua presença', 'buscamos Tua face'] },
    { comum: 'agradecemos', alt: ['elevamos nossa gratidão', 'Te rendemos graças', 'reconhecemos Tua bondade'] },
    { comum: 'fica conosco', alt: ['permanece conosco', 'acompanha-nos', 'manifesta Tua presença neste lugar'] },
    { comum: 'protege', alt: ['guarda', 'cerca', 'cobre', 'resguarda', 'preserva'] },
    { comum: 'toca', alt: ['alcança', 'visita', 'restaura', 'renova'] }
];
