#!/usr/bin/env python
# Local-LLM driver: migrate remaining pages to the bilingual galactic theme.
# Uses Ollama (qwen2.5-coder:7b). Keeps .bak backups; only overwrites on valid output.
import json, sys, urllib.request, os, re

OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = ["Certifications.html","CodingLanguages.html","Softwares.html","projects.html",
         "services.html","2124.html","Medievale.html","SborroCraft.html","lapierre.html",
         "lapierreWiki.html","MCD.html","MCDPatchNotes.html","MDC_Downloads.html","503.html"]

HEAD = '''<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="theme.css">
    <script>(function(){try{var l=localStorage.getItem('lang');if(l)document.documentElement.setAttribute('data-lang',l);}catch(e){}})();</script>'''

NAV = '''<nav class="navbar">
        <h1 class="navbar-title">Tom<span class="navbar-as">[as]</span></h1>
        <button class="nav-toggle" aria-label="Menu">☰</button>
        <div class="nav-buttons">
            <a href="index.html">Home</a>
            <a href="AboutMe.html"><span class="t-en">About Me</span><span class="t-it">Chi sono</span></a>
            <a href="Certifications.html"><span class="t-en">Certifications</span><span class="t-it">Certificazioni</span></a>
            <a href="projects.html"><span class="t-en">Projects</span><span class="t-it">Progetti</span></a>
            <a href="Softwares.html"><span class="t-en">Software</span><span class="t-it">Software</span></a>
            <a href="CodingLanguages.html"><span class="t-en">Coding Languages</span><span class="t-it">Linguaggi</span></a>
            <span class="lang-switch"><button type="button" data-set-lang="en">EN</button><button type="button" data-set-lang="it">IT</button></span>
        </div>
    </nav>'''

PROMPT = '''You convert a portfolio HTML page to a new bilingual (English-default / Italian) dark "galactic" theme. Output ONLY the full final HTML file. No markdown fences, no comments, no explanation.

RULES:
1. First line exactly: <!DOCTYPE html>  then  <html lang="en" data-lang="en">.
2. In <head>: keep <meta charset> and <meta viewport> and a <title> ("<page> — Tomas Guardati"). Replace ALL <link rel=stylesheet> with EXACTLY this block (drop every old .css link):
%HEAD%
3. Immediately after <body> put: <div class="stars" aria-hidden="true"></div>
4. Replace the existing top navbar with EXACTLY:
%NAV%
5. Keep ALL existing page content, images (same src), links, videos, galleries. Do NOT invent content. Wrap the main content in <main class="content"> ... </main> unless it already uses <main class="hero"> style.
6. BILINGUAL: every user-visible text string must appear twice as siblings: English first then Italian. Inline use spans: <span class="t-en">English</span><span class="t-it">Italiano</span>. For block elements (p, h1, h2, h3, li, button text) duplicate the element adding class t-en (English translation, DEFAULT) and t-it (the ORIGINAL Italian text). Translate Italian->English accurately and naturally for the t-en side. Keep proper nouns/brand names as-is.
7. Just before </body> add exactly:
    <div class="last-update" data-last-update></div>
    <script src="site.js"></script>
8. Valid, balanced HTML. Keep classes like card, cards-aligned, image-container, overlay-text, gallery if present.

Now convert this file:
---
%FILE%
'''

def call(model, prompt):
    body = json.dumps({"model": model, "prompt": prompt, "stream": False,
                       "options": {"temperature": 0.15, "num_ctx": int(os.environ.get("NUM_CTX","16384"))}}).encode()
    req = urllib.request.Request(OLLAMA, body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1200) as r:
        return json.load(r)["response"]

def clean(txt):
    txt = txt.strip()
    txt = re.sub(r'^```[a-zA-Z]*\n', '', txt)
    txt = re.sub(r'\n```$', '', txt).strip()
    i = txt.lower().find("<!doctype")
    if i == -1: i = txt.lower().find("<html")
    return txt[i:] if i >= 0 else txt

def valid(h):
    low = h.lower()
    need = ['theme.css','data-lang','class="t-en"','class="t-it"','site.js','class="stars"','</html>']
    return all(n.lower() in low for n in need) and (low.startswith("<!doctype") or low.startswith("<html"))

def main():
    only = sys.argv[1:] or PAGES
    for p in only:
        path = os.path.join(ROOT, p)
        if not os.path.exists(path):
            print(f"SKIP  {p} (missing)"); continue
        src = open(path, encoding="utf-8").read()
        prompt = PROMPT.replace("%HEAD%", HEAD).replace("%NAV%", NAV).replace("%FILE%", src)
        try:
            out = clean(call(MODEL, prompt))
        except Exception as e:
            print(f"ERR   {p}: {e}"); continue
        if valid(out):
            open(path + ".bak", "w", encoding="utf-8").write(src)
            open(path, "w", encoding="utf-8").write(out + ("\n" if not out.endswith("\n") else ""))
            print(f"OK    {p}  ({len(src)}->{len(out)} chars)")
        else:
            open(path + ".llmout", "w", encoding="utf-8").write(out)
            print(f"FAIL  {p}  (invalid output saved to {p}.llmout, original kept)")

if __name__ == "__main__":
    main()
