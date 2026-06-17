#!/usr/bin/env python
# Per-element de-dasher. Finds leaf-most elements whose text contains an
# em/en dash (or &mdash;/&ndash;) and asks Ollama to rewrite the fragment
# replacing the dash with natural punctuation, keeping all HTML/attrs/classes
# and the same language. Idempotent + safe: only replaces contents when the
# result has no dash and stays length-sane. Modeled on tools/translate.py.
import json, sys, os, re, copy, urllib.request
from bs4 import BeautifulSoup

OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAGS   = {"p", "h1", "h2", "h3", "h4", "li", "span", "a", "button", "title"}

# Dash detection. The HTML is already parsed so entities are decoded to the
# real chars, but we also match the literal entity text just in case.
DASH_RE = re.compile(r"[—–]|&mdash;|&ndash;")

def has_dash(s):
    return bool(s) and bool(DASH_RE.search(s))

def call(prompt):
    body = json.dumps({"model": MODEL, "prompt": prompt, "stream": False,
                       "options": {"temperature": 0.1, "num_ctx": 4096}}).encode()
    req = urllib.request.Request(OLLAMA, body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)["response"]

def clean(out):
    out = out.strip()
    out = re.sub(r'^```[a-zA-Z]*\n?', '', out)
    out = re.sub(r'\n?```$', '', out).strip()
    return out

def dedash(frag):
    p = ("Rewrite this HTML fragment removing em/en dashes used as punctuation, "
         "replacing them with natural punctuation — a colon for 'Brand — Title' "
         "patterns, a comma or period inside sentences. Keep ALL HTML "
         "tags/attributes/classes (including t-en/t-it) intact and keep the SAME "
         "language of the text. Output ONLY the fragment.\n\n" + frag)
    return clean(call(p))

def main():
    files = sys.argv[1:]
    for f in files:
        path = os.path.join(ROOT, f)
        soup = BeautifulSoup(open(path, encoding="utf-8").read(), "html.parser")
        targets = []
        for el in soup.find_all(TAGS):
            # leaf-most: skip if a descendant element is also a target tag
            # whose own text carries a dash (process the inner one instead).
            if any(d.name in TAGS and has_dash(d.get_text())
                   for d in el.find_all(TAGS)):
                continue
            if not has_dash(el.get_text()):
                continue
            inner = "".join(str(c) for c in el.contents).strip()
            if not inner:
                continue
            targets.append((el, inner))
        n = 0
        for el, inner in targets:
            try:
                out = dedash(inner)
            except Exception as e:
                print("  err:", e); continue
            if not out:
                continue
            if has_dash(out):
                continue
            if len(out) > len(inner) * 3:
                continue
            el.clear()
            for node in BeautifulSoup(out, "html.parser").contents:
                el.append(copy.copy(node))
            n += 1
        if n:
            open(path, "w", encoding="utf-8").write(str(soup))
        print(f"{f}: dedashed {n}/{len(targets)} elements")

if __name__ == "__main__":
    main()
