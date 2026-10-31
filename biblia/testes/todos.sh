#!/bin/sh
# Roda todas as suítes. Sobe o servidor se ele não estiver de pé.
cd "$(dirname "$0")/../.." || exit 1
curl -sf -o /dev/null http://127.0.0.1:8123/biblia/ || {
    python3 -m http.server 8123 >/dev/null 2>&1 &
    nosso=$!
    sleep 2
}
mau=0
for t in biblia/testes/teste-*.mjs; do
    printf '%-34s ' "$(basename "$t")"
    saida=$(timeout 300 node "$t" 2>&1 | tail -1)
    echo "$saida"
    case "$saida" in *"tudo certo"*) ;; *) mau=$((mau + 1)) ;; esac
done
[ -n "$nosso" ] && kill "$nosso" 2>/dev/null
[ "$mau" -eq 0 ] && echo "\n✓ todas as suítes passaram" || echo "\n✗ $mau suíte(s) com problema"
exit "$mau"
