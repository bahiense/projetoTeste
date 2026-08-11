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
    var recStartedAt = 0;
    var recTimer = null;
    var wakeLock = null;

    var running = false;        // rolagem ativa
    var offset = 0;             // deslocamento atual em px
    var maxOffset = 0;
    var lastFrame = 0;
    var rafId = null;
    var hideTimer = null;
    var toastTimer = null;

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

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
            if (running) prompter.classList.add('hide-ui');
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

    function startCamera(silent) {
        stopCamera();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            noCamera('Este navegador não permite usar a câmera. O texto continua rolando normalmente.');
            return Promise.resolve(false);
        }
        var video = qualityConstraints();
        video.facingMode = { ideal: cfg.camera };

        return navigator.mediaDevices.getUserMedia({ video: video, audio: !!cfg.audio })
            .then(function (s) {
                stream = s;
                prompter.classList.remove('no-cam');
                var el = $('preview');
                el.srcObject = s;
                var p = el.play();
                if (p && p.catch) p.catch(function () { });
                return true;
            })
            .catch(function (err) {
                var msg = 'Não consegui abrir a câmera.';
                if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
                    msg = 'Permissão de câmera negada. Libere nas configurações do navegador para gravar.';
                } else if (err && err.name === 'NotFoundError') {
                    msg = 'Nenhuma câmera encontrada neste aparelho.';
                }
                noCamera(silent ? msg : msg + ' O texto continua rolando normalmente.');
                return false;
            });
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
        $('result-meta').textContent = fmtTime(secs) + ' · ' + mb + ' MB · ' + extFor(recBlob.type).toUpperCase();

        var a = $('btn-download');
        a.href = recUrl;
        a.download = fileName(recBlob.type);

        videoSaved = false;
        $('result').hidden = false;
    }

    $('btn-share').addEventListener('click', function () {
        if (!recBlob) return;
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
        if (document.visibilityState === 'visible' && prompter.classList.contains('is-active')) requestWakeLock();
    });

    function openPrompter(withCamera) {
        var t = script.value.trim();
        if (!t) { alert('Escreva o texto antes de começar.'); script.focus(); return; }

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
                if (ok) toast('Toque na tela para começar/pausar. Aperte o botão vermelho para gravar.');
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

    /* ---------------- início ---------------- */

    updateStats();
    renderScripts();
    applyLook();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        });
    }
})();
