#!/usr/bin/env python
# Per-element IT->EN translator. Wraps each Italian text element as a
# bilingual pair (<el class="t-en">EN</el><el class="t-it">IT</el>) so the
# existing html[data-lang] toggle shows the right one. Deterministic splicing
# via BeautifulSoup; Ollama only translates short fragments (no truncation).
import json, sys, os, re, copy, urllib.request
from bs4 import BeautifulSoup, NavigableString

OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAGS   = {"p", "h1", "h2", "h3", "h4", "li", "button"}
IT_HINT = re.compile(r"[àèéìòù]|(?:^|\W)(?:di|che|il|la|è|una|un|per|con|del|della|sono|ho|come|più|anche|nel|alla|questo|stato|gli|le|dei|delle|mio|miei|nostro|progetto|gioco|server|durante)(?:\W|$)", re.I)

def has_italian(t):
    return bool(t and t.strip()) and bool(IT_HINT.search(t))

def call(prompt):
    body = json.dumps({"model": MODEL, "prompt": prompt, "stream": False,
                       "options": {"temperature": 0.1, "num_ctx": 4096}}).encode()
    req = urllib.request.Request(OLLAMA, body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)["response"]

def translate(frag):
    p = ("Translate the Italian text in this HTML fragment to natural, professional English. "
         "Keep ALL HTML tags, attributes and entities exactly as-is. Do not add notes or quotes. "
         "Output ONLY the translated fragment.\n\n" + frag)
    out = call(p).strip()
    out = re.sub(r'^```[a-zA-Z]*\n?', '', out)
    out = re.sub(r'\n?```$', '', out).strip()
    return out

def has_t_class(el):
    c = el.get("class") or []
    return "t-en" in c or "t-it" in c

def main():
    files = sys.argv[1:]
    for f in files:
        path = os.path.join(ROOT, f)
        soup = BeautifulSoup(open(path, encoding="utf-8").read(), "html.parser")
        targets = []
        for el in soup.find_all(TAGS):
            if el.find_parent("nav"): continue
            if has_t_class(el): continue
            if el.find_parent(class_=["t-en", "t-it"]): continue
            if el.find(class_=["t-en", "t-it"]): continue
            inner = "".join(str(c) for c in el.contents).strip()
            if not inner: continue
            if not has_italian(el.get_text(" ")): continue
            targets.append((el, inner))
        n = 0
        for el, inner in targets:
            try:
                en_inner = translate(inner)
            except Exception as e:
                print("  err:", e); continue
            if not en_inner or len(en_inner) > len(inner) * 4: continue
            en = soup.new_tag(el.name)
            for k, v in el.attrs.items(): en[k] = v
            cls = [c for c in (en.get("class") or []) if c not in ("t-en", "t-it")]
            en["class"] = cls + ["t-en"]
            for node in BeautifulSoup(en_inner, "html.parser").contents:
                en.append(copy.copy(node))
            itc = [c for c in (el.get("class") or []) if c not in ("t-en", "t-it")]
            el["class"] = itc + ["t-it"]
            el.insert_before(en)
            n += 1
        if n:
            open(path, "w", encoding="utf-8").write(str(soup))
        print(f"{f}: wrapped {n}/{len(targets)} elements")

if __name__ == "__main__":
    main()
