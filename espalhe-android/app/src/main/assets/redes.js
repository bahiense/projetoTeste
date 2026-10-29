/*
 * As redes, os apps que publicam nelas e os formatos que cada uma pede.
 *
 * w×h é o tamanho do arquivo que sai; tela diz que moldura a prévia desenha
 * (e quais áreas a interface da rede cobre); maxSeg é só para avisar —
 * passar disso não impede o envio, mas o app da rede pode cortar ou dividir.
 * padrao marca o formato já escolhido quando a mídia é foto ou vídeo.
 * leve marca a versão Lite do app: menor e sem o peso do feed, é a sugerida
 * quando nenhum app da rede está instalado.
 *
 * metricas diz como o perfil se liga para ler os números (Metricas.kt):
 * 'token' (colado do painel da Meta), 'google' ou 'tiktok' (login no
 * navegador). Sem isso, semMetricas explica por que a rede não deixa.
 */
const REDES = [
    {
        id: 'instagram', nome: 'Instagram', cor: '#E1306C', sigla: 'IG',
        metricas: 'token',
        apps: [
            { pacote: 'com.instagram.android', nome: 'Instagram' },
            { pacote: 'com.instagram.lite', nome: 'Instagram Lite', leve: true },
            { pacote: 'com.facebook.pages.app', nome: 'Meta Business Suite' },
        ],
        dica: 'O Instagram pergunta onde publicar (Feed, Stories ou Reels): escolha o mesmo formato daqui.',
        formatos: [
            { id: 'post45', nome: 'Post retrato', w: 1080, h: 1350, tipos: ['foto', 'video'], tela: 'feed', padrao: ['foto'] },
            { id: 'post34', nome: 'Post 3:4', w: 1080, h: 1440, tipos: ['foto', 'video'], tela: 'feed' },
            { id: 'post11', nome: 'Post quadrado', w: 1080, h: 1080, tipos: ['foto', 'video'], tela: 'feed' },
            { id: 'stories', nome: 'Stories', w: 1080, h: 1920, tipos: ['foto', 'video'], tela: 'story', maxSeg: 60 },
            { id: 'reels', nome: 'Reels', w: 1080, h: 1920, tipos: ['video'], tela: 'vertical', maxSeg: 180, padrao: ['video'] },
        ],
    },
    {
        id: 'facebook', nome: 'Facebook', cor: '#1877F2', sigla: 'f',
        metricas: 'token',
        apps: [
            { pacote: 'com.facebook.katana', nome: 'Facebook' },
            { pacote: 'com.facebook.lite', nome: 'Facebook Lite', leve: true },
            { pacote: 'com.facebook.pages.app', nome: 'Meta Business Suite' },
        ],
        dica: 'O Facebook pergunta se é Feed, Story ou Reels. Para publicar numa Página, cadastre o perfil com o app Meta Business Suite.',
        formatos: [
            { id: 'post45', nome: 'Post retrato', w: 1080, h: 1350, tipos: ['foto', 'video'], tela: 'feed', padrao: ['foto'] },
            { id: 'post11', nome: 'Post quadrado', w: 1080, h: 1080, tipos: ['foto', 'video'], tela: 'feed' },
            { id: 'stories', nome: 'Stories', w: 1080, h: 1920, tipos: ['foto', 'video'], tela: 'story', maxSeg: 60 },
            { id: 'reels', nome: 'Reels', w: 1080, h: 1920, tipos: ['video'], tela: 'vertical', padrao: ['video'] },
        ],
    },
    {
        id: 'whatsapp', nome: 'WhatsApp', cor: '#25D366', sigla: 'W',
        semMetricas: 'O WhatsApp não deixa nenhum app ler quem viu o seu status. Veja no próprio WhatsApp, abrindo o status e puxando para cima.',
        apps: [
            { pacote: 'com.whatsapp', nome: 'WhatsApp' },
            { pacote: 'com.whatsapp.w4b', nome: 'WhatsApp Business' },
        ],
        dica: 'No WhatsApp, toque em “Meu status”, no topo da lista de conversas.',
        formatos: [
            { id: 'status', nome: 'Status', w: 1080, h: 1920, tipos: ['foto', 'video'], tela: 'status', maxSeg: 60, padrao: ['foto', 'video'] },
        ],
    },
    {
        id: 'tiktok', nome: 'TikTok', cor: '#FE2C55', sigla: 'TT',
        metricas: 'tiktok',
        apps: [
            { pacote: 'com.zhiliaoapp.musically', nome: 'TikTok' },
            { pacote: 'com.ss.android.ugc.trill', nome: 'TikTok (Ásia)' },
            { pacote: 'com.zhiliaoapp.musically.go', nome: 'TikTok Lite', leve: true },
        ],
        dica: 'O TikTok abre o editor com a mídia; cole a legenda na tela de publicar.',
        formatos: [
            { id: 'video', nome: 'Vídeo / foto', w: 1080, h: 1920, tipos: ['foto', 'video'], tela: 'vertical', maxSeg: 600, padrao: ['foto', 'video'] },
        ],
    },
    {
        id: 'youtube', nome: 'YouTube', cor: '#FF0000', sigla: '▶',
        metricas: 'google',
        apps: [{ pacote: 'com.google.android.youtube', nome: 'YouTube' }],
        dica: 'O YouTube abre a tela de envio. Vídeo vertical de até 3 minutos vira Short.',
        formatos: [
            { id: 'shorts', nome: 'Shorts', w: 1080, h: 1920, tipos: ['video'], tela: 'vertical', maxSeg: 180, padrao: ['video'] },
            { id: 'video169', nome: 'Vídeo 16:9', w: 1920, h: 1080, tipos: ['video'], tela: 'feed' },
        ],
    },
    {
        id: 'kwai', nome: 'Kwai', cor: '#FF7A00', sigla: 'K',
        semMetricas: 'O Kwai não tem API pública de métricas. Veja no app do Kwai.',
        apps: [{ pacote: 'com.kwai.video', nome: 'Kwai' }],
        dica: 'O Kwai abre o editor com o vídeo; cole a legenda antes de publicar.',
        formatos: [
            { id: 'video', nome: 'Vídeo', w: 1080, h: 1920, tipos: ['video'], tela: 'vertical', padrao: ['video'] },
        ],
    },
    {
        id: 'threads', nome: 'Threads', cor: '#9A9A9A', sigla: '@',
        metricas: 'token',
        apps: [{ pacote: 'com.instagram.barcelona', nome: 'Threads' }],
        dica: 'O Threads abre um post novo com a mídia.',
        formatos: [
            { id: 'post45', nome: 'Post retrato', w: 1080, h: 1350, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 300, padrao: ['foto', 'video'] },
            { id: 'post11', nome: 'Post quadrado', w: 1080, h: 1080, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 300 },
        ],
    },
    {
        id: 'x', nome: 'X (Twitter)', cor: '#D9D9D9', sigla: '𝕏',
        semMetricas: 'A API do X só entrega métricas em planos pagos. Veja no app do X.',
        apps: [{ pacote: 'com.twitter.android', nome: 'X' }],
        dica: 'O X abre um post novo com a mídia. Sem assinatura, o texto vai até 280 caracteres.',
        formatos: [
            { id: 'post169', nome: 'Post 16:9', w: 1920, h: 1080, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 140 },
            { id: 'post45', nome: 'Post retrato', w: 1080, h: 1350, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 140, padrao: ['foto', 'video'] },
        ],
        limiteTexto: 280,
    },
    {
        id: 'linkedin', nome: 'LinkedIn', cor: '#0A66C2', sigla: 'in',
        semMetricas: 'O LinkedIn só libera métricas de perfil pessoal para parceiros aprovados. Veja no app do LinkedIn.',
        apps: [{ pacote: 'com.linkedin.android', nome: 'LinkedIn' }],
        dica: 'O LinkedIn abre uma publicação nova com a mídia.',
        formatos: [
            { id: 'post45', nome: 'Post retrato', w: 1080, h: 1350, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 600, padrao: ['foto', 'video'] },
            { id: 'post11', nome: 'Post quadrado', w: 1080, h: 1080, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 600 },
            { id: 'post169', nome: 'Post 16:9', w: 1920, h: 1080, tipos: ['foto', 'video'], tela: 'feed', maxSeg: 600 },
        ],
    },
    {
        id: 'pinterest', nome: 'Pinterest', cor: '#E60023', sigla: 'P',
        semMetricas: 'Ainda não ligado aqui. Veja em Estatísticas, no app do Pinterest.',
        apps: [{ pacote: 'com.pinterest', nome: 'Pinterest' }],
        dica: 'O Pinterest pede a pasta onde salvar o Pin.',
        formatos: [
            { id: 'pin', nome: 'Pin 2:3', w: 1000, h: 1500, tipos: ['foto', 'video'], tela: 'feed', padrao: ['foto', 'video'] },
        ],
    },
];

/*
 * O que a interface de cada tipo de tela cobre, em fração da altura (topo,
 * base) e da largura (dir). Texto e rosto fora dessas faixas não somem atrás
 * do nome, dos botões e da legenda.
 */
const AREAS_COBERTAS = {
    story: { topo: 0.13, base: 0.17, dir: 0 },
    vertical: { topo: 0.10, base: 0.27, dir: 0.16 },
    status: { topo: 0.10, base: 0.14, dir: 0 },
    feed: { topo: 0, base: 0, dir: 0 },
};
