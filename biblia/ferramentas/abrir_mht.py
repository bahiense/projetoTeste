"""Lê a parte HTML de uma página salva, respeitando o encoding real.

Duas das páginas declaram UTF-8 e estão em windows-1252. Acreditar na
declaração entregaria o texto todo corrompido.
"""
import email, re, html as H

def html_de(caminho):
    msg = email.message_from_file(open(caminho, encoding='utf8', errors='replace'))
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            b = part.get_payload(decode=True)
            for enc in ('utf-8', 'windows-1252', 'iso-8859-1'):
                try:
                    d = b.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            return re.sub(r'\\u([0-9a-fA-F]{4})',
                          lambda m: chr(int(m.group(1), 16)), d)
    return ''

def texto(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', H.unescape(s).replace(' ', ' ')).strip()
