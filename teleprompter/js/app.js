/* =========================================================
   Teleprompter — rola o texto na tela enquanto você grava.
   ========================================================= */
(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };

    // a propriedade .hidden só existe em HTMLElement; em <svg> é preciso mexer no atributo
    function setHidden(el, on) {
        if (on) el.setAttribute('hidden', '');
        else el.removeAttribute('hidden');
    }

    /* ---------------- estado ---------------- */

    var DEFAULTS = {
        speed: 10,
        size: 36,
        area: 60,
        opacity: 45,
        countdown: 3,
        mirrorCam: true,
        mirrorX: false,
        mirrorY: false,
        guide: true,
        audio: true,
        camera: 'user',
        quality: '1080'
    };

    var cfg = load('tp:settings', DEFAULTS);
    var scripts = load('tp:scripts', []);

    var stream = null;          // MediaStream da câmera
    var recorder = null;        // MediaRecorder
    var chunks = [];
    var recBlob = null;
    var recUrl = null;
    var videoSaved = false;
    var recHadAudio = false;
    var recStartedAt = 0;
    var recTimer = null;
    var wakeLock = null;
    var wantedCamera = false;
    var cameraNotice = '';   // aviso da abertura da câmera, mostrado junto das instruções

    var running = false;        // rolagem ativa
    var offset = 0;             // deslocamento atual em px
    var maxOffset = 0;
    var lastFrame = 0;
    var rafId = null;
    var hideTimer = null;
    var toastTimer = null;

    /* ---------------- diagnóstico ---------------- */

    var diag = [];

    function logDiag(line) {
        diag.push(line);
        if (diag.length > 40) diag.shift();
        renderDiag();
    }

    function renderDiag() {
        var el = $('diag-body');
        if (!el) return;
        el.textContent = diag.length ? diag.join('\n') : 'Ainda não usei a câmera.';
    }

    function shortConstraints(c) {
        var v = c.video, a = c.audio;
        var desc = [];
        if (v) {
            if (v === true) desc.push('vídeo simples');
            else if (v.width) desc.push('vídeo ' + (v.width.ideal || '?') + 'p');
            else desc.push('vídeo ' + ((v.facingMode && v.facingMode.ideal) || 'padrão'));
        }
        if (a) desc.push('áudio');
        return desc.join(' + ') || 'nada';
    }

    /* ---------------- persistência ---------------- */

    function load(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return clone(fallback);
            var val = JSON.parse(raw);
            if (Object.prototype.toString.call(fallback) === '[object Object]') {
                var merged = clone(fallback);
                for (var k in val) { if (k in merged) merged[k] = val[k]; }
                return merged;
            }
            return val;
        } catch (e) { return clone(fallback); }
    }

    function save(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* modo privado */ }
    }

    function clone(v) { return JSON.parse(JSON.stringify(v)); }

    /* ---------------- editor ---------------- */

    var script = $('script');
    script.value = localStorage.getItem('tp:text') || '';

    // o texto vai puro no localStorage (sem JSON), por isso não usa save()
    function saveText() { try { localStorage.setItem('tp:text', script.value); } catch (e) { } }

    script.addEventListener('input', function () {
        saveText();
        updateStats();
    });

    function wordCount(t) {
        var m = t.trim().match(/\S+/g);
        return m ? m.length : 0;
    }

    function updateStats() {
        var w = wordCount(script.value);
        $('stat-words').textContent = w + (w === 1 ? ' palavra' : ' palavras');
        // ~150 palavras por minuto, ajustado pela velocidade escolhida
        var secs = Math.round(w / (150 * (cfg.speed / 10)) * 60);
        $('stat-time').textContent = '~' + fmtTime(secs) + ' de leitura';
    }

    function fmtTime(s) {
        s = Math.max(0, Math.round(s));
        var m = Math.floor(s / 60);
        return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    }

    $('btn-clear').addEventListener('click', function () {
        if (!script.value || confirm('Apagar o texto atual?')) {
            script.value = '';
            saveText();
            updateStats();
            script.focus();
        }
    });

    /* ---------------- textos salvos ---------------- */

    function renderScripts() {
        var list = $('saved-list');
        $('saved-count').textContent = String(scripts.length);
        list.innerHTML = '';
        if (!scripts.length) {
            var empty = document.createElement('li');
            empty.className = 'saved-empty';
            empty.textContent = 'Nenhum texto salvo ainda.';
            list.appendChild(empty);
            return;
        }
        scripts.forEach(function (item, i) {
            var li = document.createElement('li');

            var name = document.createElement('span');
            name.className = 'name';
            name.textContent = item.name;
            li.appendChild(name);

            var open = document.createElement('button');
            open.type = 'button';
            open.textContent = 'Abrir';
            open.addEventListener('click', function () {
                script.value = item.text;
                saveText();
                updateStats();
                toastEditor('Texto carregado.');
            });
            li.appendChild(open);

            var del = document.createElement('button');
            del.type = 'button';
            del.className = 'del';
            del.textContent = 'Excluir';
            del.addEventListener('click', function () {
                if (!confirm('Excluir "' + item.name + '"?')) return;
                scripts.splice(i, 1);
                save('tp:scripts', scripts);
                renderScripts();
            });
            li.appendChild(del);

            list.appendChild(li);
        });
    }

    $('btn-save').addEventListener('click', function () {
        var name = $('save-name').value.trim();
        var text = script.value.trim();
        if (!text) { alert('Escreva um texto antes de salvar.'); return; }
        if (!name) { name = 'Texto ' + new Date().toLocaleDateString('pt-BR'); }
        var existing = -1;
        scripts.forEach(function (s, i) { if (s.name === name) existing = i; });
        if (existing >= 0) {
            if (!confirm('Já existe um texto com esse nome. Substituir?')) return;
            scripts[existing].text = script.value;
        } else {
            scripts.unshift({ name: name, text: script.value });
        }
        save('tp:scripts', scripts);
        $('save-name').value = '';
        renderScripts();
    });

    function toastEditor(msg) {
        $('stat-time').textContent = msg;
        setTimeout(updateStats, 1600);
    }

    /* ---------------- ajustes ---------------- */

    var controls = [
        ['set-speed', 'speed', 'out-speed'],
        ['set-size', 'size', 'out-size'],
        ['set-area', 'area', 'out-area'],
        ['set-opacity', 'opacity', 'out-opacity'],
        ['set-countdown', 'countdown', 'out-countdown']
    ];

    controls.forEach(function (c) {
        var el = $(c[0]);
        el.value = cfg[c[1]];
        $(c[2]).textContent = cfg[c[1]];
        el.addEventListener('input', function () {
            cfg[c[1]] = Number(el.value);
            $(c[2]).textContent = el.value;
            save('tp:settings', cfg);
            applyLook();
            if (c[1] === 'speed') updateStats();
        });
    });

    var toggles = [
        ['set-mirror-cam', 'mirrorCam'],
        ['set-mirror-x', 'mirrorX'],
        ['set-mirror-y', 'mirrorY'],
        ['set-guide', 'guide'],
        ['set-audio', 'audio']
    ];

    toggles.forEach(function (t) {
        var el = $(t[0]);
        el.checked = !!cfg[t[1]];
        el.addEventListener('change', function () {
            cfg[t[1]] = el.checked;
            save('tp:settings', cfg);
            applyLook();
        });
    });

    ['set-camera:camera', 'set-quality:quality'].forEach(function (pair) {
        var parts = pair.split(':');
        var el = $(parts[0]);
        el.value = cfg[parts[1]];
        el.addEventListener('change', function () {
            cfg[parts[1]] = el.value;
            save('tp:settings', cfg);
        });
    });

    /* ---------------- prompter: aparência ---------------- */

    var prompter = $('prompter');
    var viewport = $('viewport');
    var track = $('track');
    var textEl = $('text');

    function applyLook() {
        textEl.style.fontSize = cfg.size + 'px';
        viewport.style.height = cfg.area + '%';
        prompter.style.setProperty('--text-bg', (cfg.opacity / 100).toFixed(2));
        prompter.classList.toggle('bg-on', cfg.opacity > 0);
        prompter.classList.toggle('mirror-cam', cfg.mirrorCam);
        prompter.classList.toggle('guide-on', cfg.guide);

        var sx = cfg.mirrorX ? -1 : 1;
        var sy = cfg.mirrorY ? -1 : 1;
        textEl.style.transform = 'scale(' + sx + ',' + sy + ')';

        $('live-speed').textContent = cfg.speed;
        $('btn-mirror').classList.toggle('on', cfg.mirrorX);

        measure();
    }

    function measure() {
        // padding inferior para o texto poder rolar até o fim
        textEl.style.paddingBottom = Math.round(viewport.clientHeight * 0.85) + 'px';
        maxOffset = Math.max(0, track.offsetHeight - viewport.clientHeight);
        if (offset > maxOffset) offset = maxOffset;
        draw();
    }

    function draw() {
        track.style.transform = 'translate3d(0,' + (-offset).toFixed(2) + 'px,0)';
    }

    window.addEventListener('resize', function () {
        if (prompter.classList.contains('is-active')) measure();
    });

    /* ---------------- prompter: rolagem ---------------- */

    function pxPerSec() {
        return cfg.speed * cfg.size * 0.09;
    }

    function tick(now) {
        if (!running) return;
        if (!lastFrame) lastFrame = now;
        var dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;

        offset += pxPerSec() * dt;
        if (offset >= maxOffset) {
            offset = maxOffset;
            draw();
            setRunning(false);
            toast('Fim do texto.');
            return;
        }
        draw();
        rafId = requestAnimationFrame(tick);
    }

    function setRunning(on) {
        running = on;
        lastFrame = 0;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (on) rafId = requestAnimationFrame(tick);
        setHidden($('ico-play'), on);
        setHidden($('ico-pause'), !on);
        if (on) scheduleHide(); else showUI();
    }

    function restart() {
        offset = 0;
        draw();
    }

    /* ---------------- prompter: UI ---------------- */

    function showUI() {
        prompter.classList.remove('hide-ui');
        clearTimeout(hideTimer);
    }

    function isRecording() {
        return !!recorder && recorder.state === 'recording';
    }

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
            // durante a gravação os controles ficam à vista: o botão de parar
            // não pode sumir no meio do vídeo
            if (running && !isRecording()) prompter.classList.add('hide-ui');
        }, 3500);
    }

    function toast(msg) {
        var el = $('toast');
        el.textContent = msg;
        el.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
    }

    viewport.addEventListener('click', function () {
        if (prompter.classList.contains('hide-ui')) { showUI(); scheduleHide(); return; }
        setRunning(!running);
    });

    $('btn-play').addEventListener('click', function () { setRunning(!running); });
    $('btn-restart').addEventListener('click', function () { restart(); showUI(); scheduleHide(); });

    $('btn-faster').addEventListener('click', function () { nudgeSpeed(1); });
    $('btn-slower').addEventListener('click', function () { nudgeSpeed(-1); });

    function nudgeSpeed(d) {
        cfg.speed = Math.min(30, Math.max(1, cfg.speed + d));
        save('tp:settings', cfg);
        $('set-speed').value = cfg.speed;
        $('out-speed').textContent = cfg.speed;
        $('live-speed').textContent = cfg.speed;
        showUI();
        scheduleHide();
    }

    $('btn-bigger').addEventListener('click', function () { nudgeSize(4); });
    $('btn-smaller').addEventListener('click', function () { nudgeSize(-4); });

    function nudgeSize(d) {
        cfg.size = Math.min(96, Math.max(20, cfg.size + d));
        save('tp:settings', cfg);
        $('set-size').value = cfg.size;
        $('out-size').textContent = cfg.size;
        applyLook();
        showUI();
        scheduleHide();
    }

    $('btn-mirror').addEventListener('click', function () {
        cfg.mirrorX = !cfg.mirrorX;
        save('tp:settings', cfg);
        $('set-mirror-x').checked = cfg.mirrorX;
        applyLook();
        toast(cfg.mirrorX ? 'Texto espelhado.' : 'Texto normal.');
    });

    $('btn-flip').addEventListener('click', function () {
        if (recorder && recorder.state === 'recording') { toast('Pare a gravação para trocar de câmera.'); return; }
        cfg.camera = cfg.camera === 'user' ? 'environment' : 'user';
        cfg.mirrorCam = cfg.camera === 'user';
        $('set-camera').value = cfg.camera;
        $('set-mirror-cam').checked = cfg.mirrorCam;
        save('tp:settings', cfg);
        applyLook();
        startCamera(true);
    });

    $('btn-back').addEventListener('click', closePrompter);

    $('btn-perms').addEventListener('click', function () {
        if (bridge && typeof bridge.openSettings === 'function') {
            bridge.openSettings();
            toast('Libere Câmera e Microfone e volte para o app.');
        }
    });

    /* ---------------- câmera ---------------- */

    function qualityConstraints() {
        var map = { '720': [1280, 720], '1080': [1920, 1080], '2160': [3840, 2160] };
        var q = map[cfg.quality] || map['1080'];
        return { width: { ideal: q[0] }, height: { ideal: q[1] }, frameRate: { ideal: 30 } };
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(function (t) { t.stop(); });
            stream = null;
        }
        $('preview').srcObject = null;
    }

    /**
     * Abre a câmera tolerando as recusas mais comuns.
     *
     * Ordem: câmera e microfone juntos (mantém o som em sincronia) → se o
     * aparelho recusar o pedido combinado, pega a câmera sozinha e o microfone
     * sozinho e junta as faixas → se nem assim o microfone vier, grava mudo.
     * Vários aparelhos Android recusam o pedido combinado mesmo com as duas
     * permissões concedidas, e é aí que o vídeo saía sem áudio.
     */
    function openStream() {
        var face = { ideal: cfg.camera };
        var full = qualityConstraints();
        full.facingMode = face;
        var wantAudio = !!cfg.audio;
        var lastError = null;

        var together = wantAudio
            ? [{ video: full, audio: true }, { video: { facingMode: face }, audio: true }]
            : [];
        var videoOnly = [full, { facingMode: face }, true];

        function ask(constraints) {
            var label = shortConstraints(constraints);
            return navigator.mediaDevices.getUserMedia(constraints)
                .then(function (s) {
                    logDiag('pedi ' + label + ' -> ok (' +
                        s.getVideoTracks().length + 'v ' + s.getAudioTracks().length + 'a)');
                    return s;
                })
                .catch(function (err) {
                    logDiag('pedi ' + label + ' -> ' + ((err && err.name) || 'erro'));
                    return Promise.reject(err);
                });
        }

        function tryTogether(i) {
            if (i >= together.length) return Promise.reject(lastError);
            return ask(together[i]).catch(function (err) {
                lastError = err;
                return tryTogether(i + 1);
            });
        }

        function tryVideo(i) {
            if (i >= videoOnly.length) return Promise.reject(lastError);
            return ask({ video: videoOnly[i], audio: false }).catch(function (err) {
                lastError = err;
                return tryVideo(i + 1);
            });
        }

        function merge(videoStream, audioStream) {
            var out = new MediaStream();
            videoStream.getVideoTracks().forEach(function (t) { out.addTrack(t); });
            if (audioStream) {
                audioStream.getAudioTracks().forEach(function (t) { out.addTrack(t); });
            }
            return out;
        }

        // com a câmera já aberta, o microfone é aberto depois
        function videoThenAudio() {
            return tryVideo(0).then(function (videoStream) {
                if (!wantAudio) return videoStream;
                return ask({ audio: true })
                    .then(function (a) { return merge(videoStream, a); })
                    .catch(function () { return videoStream; });
            });
        }

        // alguns aparelhos só entregam o microfone se ele for aberto primeiro
        function audioThenVideo() {
            if (!wantAudio) return Promise.reject(lastError);
            return ask({ audio: true }).then(function (audioStream) {
                return tryVideo(0).then(
                    function (videoStream) { return merge(videoStream, audioStream); },
                    function (err) {
                        audioStream.getTracks().forEach(function (t) { t.stop(); });
                        return Promise.reject(err);
                    }
                );
            });
        }

        var first = together.length ? tryTogether(0) : Promise.reject(null);

        return first
            .catch(function () { return audioThenVideo(); })
            .catch(function () { return videoThenAudio(); })
            .then(
                function (s) { return { stream: s, error: null }; },
                function () { return { stream: null, error: lastError }; }
            );
    }

    function describeError(err) {
        if (!err) return 'erro desconhecido';
        var name = err.name || 'Error';
        if (name === 'NotAllowedError' || name === 'SecurityError') {
            return 'a permissão de câmera está negada';
        }
        if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
            return 'nenhuma câmera foi encontrada';
        }
        if (name === 'NotReadableError' || name === 'TrackStartError') {
            return 'a câmera está ocupada por outro app';
        }
        if (name === 'OverconstrainedError') {
            return 'a qualidade pedida não é aceita por esta câmera';
        }
        return name;
    }

    function startCamera(silent) {
        stopCamera();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            noCamera('Este aparelho não libera o acesso à câmera. O texto continua rolando normalmente.');
            return Promise.resolve(false);
        }

        cameraNotice = '';
        void silent;

        return openStream().then(function (result) {
            if (!result.stream) {
                var why = describeError(result.error);
                noCamera('Não consegui abrir a câmera: ' + why + '.' +
                    (permissionProblem(result.error) ? ' Toque em "Liberar acesso".' : ''));
                showPermissionHelp(permissionProblem(result.error));
                return false;
            }

            stream = result.stream;
            prompter.classList.remove('no-cam');

            var el = $('preview');
            el.srcObject = stream;
            var p = el.play();
            if (p && p.catch) p.catch(function () { });

            showPermissionHelp(false);
            logDiag('câmera aberta: ' + stream.getVideoTracks().length + ' vídeo, ' +
                stream.getAudioTracks().length + ' áudio');
            if (cfg.audio && !hasAudio()) {
                cameraNotice = 'Microfone indisponível: o vídeo vai ficar sem som. ' +
                    'Feche outros apps que usam o microfone, saia e entre de novo aqui.';
            }
            return true;
        });
    }

    function hasAudio() {
        return !!stream && stream.getAudioTracks().length > 0;
    }

    // chamado pelo lado Android assim que o sistema devolve a resposta da permissão
    window.__retryCamera = function () {
        if (wantedCamera && !stream) startCamera(true);
    };

    function permissionProblem(err) {
        return !!err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
    }

    /** No APK dá para levar a pessoa direto para a tela de permissões do sistema. */
    function showPermissionHelp(show) {
        var btn = $('btn-perms');
        btn.hidden = !(show && bridge && typeof bridge.openSettings === 'function');
    }

    function noCamera(msg) {
        prompter.classList.add('no-cam');
        toast(msg);
    }

    /* ---------------- gravação ---------------- */

    function pickMime() {
        var candidates = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=h264,aac',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        if (typeof MediaRecorder === 'undefined') return null;
        for (var i = 0; i < candidates.length; i++) {
            if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
        }
        return '';
    }

    function bitrate() {
        return cfg.quality === '2160' ? 20000000 : (cfg.quality === '1080' ? 8000000 : 4000000);
    }

    function startRecording() {
        if (!stream) { toast('Sem câmera: não dá para gravar. Use o gravador do celular ou libere a permissão.'); return; }
        var mime = pickMime();
        if (mime === null) { toast('Este navegador não grava vídeo. Use o Chrome atualizado.'); return; }

        chunks = [];
        try {
            recorder = new MediaRecorder(stream, mime
                ? { mimeType: mime, videoBitsPerSecond: bitrate() }
                : { videoBitsPerSecond: bitrate() });
        } catch (e) {
            try { recorder = new MediaRecorder(stream); }
            catch (e2) { toast('Não consegui iniciar a gravação neste aparelho.'); return; }
        }

        recorder.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
        recorder.onstop = function () {
            var type = (recorder && recorder.mimeType) || 'video/webm';
            recBlob = new Blob(chunks, { type: type });
            chunks = [];
            showResult();
        };
        recorder.onerror = function () { toast('A gravação falhou.'); stopRecording(); };

        recorder.start(1000);
        logDiag('gravando em ' + (recorder.mimeType || mime || 'formato padrão') +
            (hasAudio() ? ' com áudio' : ' SEM áudio'));
        recHadAudio = hasAudio();
        recStartedAt = Date.now();
        $('rec-status').hidden = false;
        $('btn-rec').classList.add('recording');
        recTimer = setInterval(function () {
            $('rec-time').textContent = fmtTime((Date.now() - recStartedAt) / 1000);
        }, 250);
        $('rec-time').textContent = '00:00';
    }

    function stopRecording() {
        clearInterval(recTimer);
        recTimer = null;
        $('rec-status').hidden = true;
        $('btn-rec').classList.remove('recording');
        if (recorder && recorder.state !== 'inactive') {
            try { recorder.stop(); } catch (e) { }
        }
        setRunning(false);
    }

    $('btn-rec').addEventListener('click', function () {
        if (recorder && recorder.state === 'recording') { stopRecording(); return; }
        showUI();
        runCountdown(function () {
            restart();
            startRecording();
            setRunning(true);
        });
    });

    function runCountdown(done) {
        var n = cfg.countdown;
        var box = $('countdown');
        var num = $('countdown-num');
        if (!n) { done(); return; }
        box.hidden = false;
        num.textContent = n;
        var id = setInterval(function () {
            n--;
            if (n <= 0) {
                clearInterval(id);
                box.hidden = true;
                done();
            } else {
                num.textContent = n;
            }
        }, 1000);
    }

    /* ---------------- resultado ---------------- */

    // dentro do APK existe uma ponte nativa que salva o vídeo direto na galeria
    var bridge = (function () {
        try {
            if (typeof AndroidBridge !== 'undefined' && AndroidBridge &&
                typeof AndroidBridge.isAvailable === 'function' && AndroidBridge.isAvailable()) {
                return AndroidBridge;
            }
        } catch (e) { /* navegador comum */ }
        return null;
    })();

    var bridgeSaved = false;

    function extFor(type) {
        return type.indexOf('mp4') >= 0 ? 'mp4' : 'webm';
    }

    function fileName(type) {
        var d = new Date();
        var p = function (v) { return (v < 10 ? '0' : '') + v; };
        return 'teleprompter-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
            '-' + p(d.getHours()) + p(d.getMinutes()) + '.' + extFor(type);
    }

    function showResult() {
        if (!recBlob || !recBlob.size) { toast('Nada foi gravado.'); return; }
        if (recUrl) URL.revokeObjectURL(recUrl);
        recUrl = URL.createObjectURL(recBlob);

        var v = $('result-video');
        v.src = recUrl;

        var mb = (recBlob.size / 1048576).toFixed(1);
        var secs = Math.round((Date.now() - recStartedAt) / 1000);
        $('result-meta').textContent = fmtTime(secs) + ' · ' + mb + ' MB · ' +
            extFor(recBlob.type).toUpperCase() + ' · ' + (recHadAudio ? 'com áudio' : 'sem áudio');

        var a = $('btn-download');
        a.href = recUrl;
        a.download = fileName(recBlob.type);

        videoSaved = false;
        bridgeSaved = false;

        if (bridge) {
            // no app não existe "baixar arquivo": o vídeo vai direto para a galeria
            a.hidden = true;
            $('btn-share').textContent = 'Salvar na galeria';
        }

        $('result').hidden = false;
    }

    function setSheetBusy(on) {
        $('btn-share').disabled = on;
        $('btn-discard').disabled = on;
    }

    /** Manda o vídeo em pedaços para o Android gravar em Filmes/Teleprompter. */
    function saveThroughBridge() {
        var CHUNK = 3 * 128 * 1024; // múltiplo de 3: cada pedaço vira base64 fechado
        var name = fileName(recBlob.type);
        var total = recBlob.size;
        var sent = 0;

        if (!bridge.begin(name, recBlob.type)) {
            $('result-meta').textContent = 'Não consegui criar o arquivo na galeria.';
            return;
        }

        setSheetBusy(true);
        var reader = new FileReader();

        function fail() {
            try { bridge.abort(); } catch (e) { }
            setSheetBusy(false);
            $('result-meta').textContent = 'Falha ao salvar o vídeo.';
        }

        reader.onerror = fail;

        reader.onload = function () {
            var s = String(reader.result);
            var comma = s.indexOf(',');
            var b64 = comma >= 0 ? s.slice(comma + 1) : s;

            if (!bridge.write(b64)) { fail(); return; }

            sent += CHUNK;
            if (sent < total) {
                $('result-meta').textContent = 'Salvando… ' +
                    Math.min(99, Math.round(sent / total * 100)) + '%';
                next();
                return;
            }

            var uri = bridge.finish();
            setSheetBusy(false);
            if (uri) {
                videoSaved = true;
                bridgeSaved = true;
                $('btn-share').textContent = 'Compartilhar';
                $('result-meta').textContent = 'Salvo na galeria, em Filmes/Teleprompter.';
            } else {
                fail();
            }
        };

        function next() { reader.readAsDataURL(recBlob.slice(sent, sent + CHUNK)); }

        $('result-meta').textContent = 'Salvando… 0%';
        next();
    }

    $('btn-share').addEventListener('click', function () {
        if (!recBlob) return;

        if (bridge) {
            if (bridgeSaved) { bridge.share(); } else { saveThroughBridge(); }
            return;
        }

        var file;
        try {
            file = new File([recBlob], fileName(recBlob.type), { type: recBlob.type });
        } catch (e) { file = null; }

        if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
            navigator.share({ files: [file], title: 'Vídeo do teleprompter' })
                .then(function () { videoSaved = true; })
                .catch(function () { });
        } else {
            $('btn-download').click();
        }
    });

    $('btn-download').addEventListener('click', function () { videoSaved = true; });

    $('btn-discard').addEventListener('click', function () {
        if (!videoSaved && !confirm('Você ainda não salvou este vídeo. Descartar mesmo assim?')) return;
        closeResult();
    });

    function closeResult() {
        $('result').hidden = true;
        $('result-video').removeAttribute('src');
        $('result-video').load();
        if (recUrl) { URL.revokeObjectURL(recUrl); recUrl = null; }
        recBlob = null;
    }

    /* ---------------- abrir / fechar prompter ---------------- */

    function requestWakeLock() {
        if (!('wakeLock' in navigator)) return;
        navigator.wakeLock.request('screen')
            .then(function (l) { wakeLock = l; })
            .catch(function () { });
    }

    function releaseWakeLock() {
        if (wakeLock) { try { wakeLock.release(); } catch (e) { } wakeLock = null; }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') return;
        if (!prompter.classList.contains('is-active')) return;

        requestWakeLock();

        // voltando da tela de permissões do sistema, tenta a câmera de novo
        if (wantedCamera && !stream) startCamera(true);
    });

    function openPrompter(withCamera) {
        var t = script.value.trim();
        if (!t) { alert('Escreva o texto antes de começar.'); script.focus(); return; }

        wantedCamera = !!withCamera;
        showPermissionHelp(false);

        textEl.textContent = script.value;
        $('editor').classList.remove('is-active');
        prompter.classList.add('is-active');
        prompter.classList.toggle('no-cam', !withCamera);

        applyLook();
        restart();
        setRunning(false);
        showUI();
        requestWakeLock();

        // mede depois do layout aplicar a altura da área de texto
        requestAnimationFrame(function () { requestAnimationFrame(measure); });

        if (withCamera) {
            startCamera(false).then(function (ok) {
                if (!ok) return;
                var base = 'Toque na tela para começar/pausar. Aperte o botão vermelho para gravar.';
                toast(cameraNotice ? cameraNotice + ' ' + base : base);
            });
        } else {
            toast('Modo só texto: toque na tela para começar/pausar.');
        }
    }

    function closePrompter() {
        if (recorder && recorder.state === 'recording') {
            if (!confirm('A gravação está em andamento. Parar e sair?')) return;
            stopRecording();
            return; // o resultado abre; sair de novo fecha
        }
        setRunning(false);
        wantedCamera = false;
        showPermissionHelp(false);
        stopCamera();
        releaseWakeLock();
        closeResult();
        prompter.classList.remove('is-active');
        $('editor').classList.add('is-active');
    }

    $('btn-start-cam').addEventListener('click', function () { openPrompter(true); });
    $('btn-start-plain').addEventListener('click', function () { openPrompter(false); });

    /* ---------------- teclado (útil em notebook / controle bluetooth) ---------------- */

    document.addEventListener('keydown', function (e) {
        if (!prompter.classList.contains('is-active')) return;
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'MediaPlayPause') {
            e.preventDefault(); setRunning(!running);
        } else if (e.key === 'ArrowUp') { e.preventDefault(); nudgeSpeed(1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); nudgeSpeed(-1); }
        else if (e.key === 'Home') { e.preventDefault(); restart(); }
        else if (e.key === 'Escape') { closePrompter(); }
    });

    function startDiag() {
        var v = 'site';
        try {
            if (bridge && typeof bridge.appVersion === 'function') v = 'app ' + bridge.appVersion();
        } catch (e) { /* ponte antiga */ }
        diag = [
            'versão: ' + v,
            'aparelho: ' + (navigator.userAgent.match(/Android [\d.]+/) || ['sem Android'])[0],
            'grava vídeo: ' + (typeof MediaRecorder !== 'undefined' ? 'sim' : 'não'),
            'formato: ' + (pickMime() || 'padrão')
        ];
        renderDiag();
    }

    function showVersion() {
        var v = 'site';
        try {
            if (bridge && typeof bridge.appVersion === 'function') v = 'app ' + bridge.appVersion();
        } catch (e) { /* versão antiga da ponte */ }
        $('version').textContent = 'Versão: ' + v;
    }

    /* ---------------- início ---------------- */

    showVersion();
    startDiag();
    updateStats();
    renderScripts();
    applyLook();

    // dentro do APK os arquivos já são locais; o cache do service worker só
    // atrapalharia, servindo versão antiga depois de atualizar o app
    if (!bridge && 'serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        });
    }
})();
