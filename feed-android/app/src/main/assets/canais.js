/*
 * O que o app sugere seguir e o que ele reconhece como política. Edite à
 * vontade: cada nome é buscado no YouTube, e você confere o canal achado
 * antes de se inscrever.
 */
window.FEED_CANAIS = [
    {
        nome: "Rock clássico",
        canais: [
            "Led Zeppelin", "The Beatles", "The Rolling Stones", "Pink Floyd",
            "Queen Official", "The Who", "Deep Purple", "Eric Clapton",
            "Creedence Clearwater Revival", "Eagles", "Lynyrd Skynyrd",
            "Tom Petty and the Heartbreakers", "Bruce Springsteen", "ZZ Top",
            "Dire Straits", "Allman Brothers Band",
        ],
    },
    {
        nome: "Jazz",
        canais: [
            "Miles Davis", "John Coltrane", "Louis Armstrong", "Ella Fitzgerald",
            "Dave Brubeck", "Blue Note Records",
        ],
    },
    {
        nome: "Blues",
        canais: [
            "B.B. King", "Muddy Waters", "John Lee Hooker", "Stevie Ray Vaughan",
            "Buddy Guy", "Joe Bonamassa",
        ],
    },
    {
        nome: "Country",
        canais: [
            "Johnny Cash", "Willie Nelson", "Dolly Parton", "Merle Haggard",
            "Hank Williams", "Chris Stapleton",
        ],
    },
    {
        nome: "Cristianismo reformado",
        canais: [
            "Ministério Fiel", "Voltemos ao Evangelho", "Augustus Nicodemus Lopes",
            "Coalizão pelo Evangelho", "Hernandes Dias Lopes", "Ligonier Ministries",
            "Desiring God", "Keith and Kristyn Getty", "Sovereign Grace Music",
        ],
    },
];

/*
 * Termos comparados sem acento e em minúsculas, como palavra inteira — por
 * isso "pt" não casa dentro de "captura". Siglas curtas ainda podem marcar
 * um canal por engano; é para isso que existe a revisão antes de cancelar.
 */
window.FEED_POLITICA = [
    "politica", "politico", "politicos", "politicas",
    "eleicao", "eleicoes", "eleitoral", "candidato", "candidata",
    "deputado", "deputada", "senador", "senadora", "vereador", "vereadora",
    "governador", "prefeito", "presidente", "ministro", "ministra",
    "congresso", "camara dos deputados", "senado", "planalto", "brasilia",
    "partido", "esquerda", "direita", "conservador", "conservadora",
    "progressista", "liberalismo", "socialismo", "comunismo", "marxismo",
    "ideologia", "militante", "militancia", "democracia", "impeachment",
    "lula", "bolsonaro", "bolsonarista", "petista", "lulista",
    "stf", "tse", "cpi", "pt", "pl", "psol", "mdb", "psdb", "pdt", "psb",
    "uniao brasil", "republicanos", "mbl",
    "geopolitica", "governo", "oposicao", "patriota", "patriotas",
];
