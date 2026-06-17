#!/usr/bin/env python
# Deterministic (no-LLM) galactic migration for very large pages.
# Preserves 100% of content; swaps head/nav, adds stars + last-update + site.js.
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEAD = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">\n'
        '    <link rel="stylesheet" href="theme.css">\n'
        "    <script>(function(){try{var l=localStorage.getItem('lang');if(l)document.documentElement.setAttribute('data-lang',l);}catch(e){}})();</script>\n"
        '    <style>.wrapper{background:transparent!important;background-color:transparent!important}#projects{padding-top:84px}</style>')

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

for f in sys.argv[1:]:
    path = os.path.join(ROOT, f)
    src = open(path + ".bak", encoding="utf-8").read() if os.path.exists(path + ".bak") else open(path, encoding="utf-8").read()
    h = re.sub(r'<html[^>]*>', '<html lang="en" data-lang="en">', src, count=1)
    h = h.replace('</head>', '    ' + HEAD + '\n</head>', 1)
    h = re.sub(r'<div class="navbar">.*?</div>\s*</div>', NAV, h, count=1, flags=re.S)
    h = re.sub(r'(<body[^>]*>)', r'\1\n    <div class="stars" aria-hidden="true"></div>', h, count=1)
    h = h.replace('</body>', '    <div class="last-update" data-last-update></div>\n    <script src="site.js"></script>\n</body>', 1)
    open(path, "w", encoding="utf-8").write(h)
    ok = all(x in h for x in ['theme.css','data-lang','class="stars"','site.js','class="navbar"']) and '<div class="navbar">' not in h
    print(f"{'OK' if ok else 'CHECK'}  {f}  {len(src)}->{len(h)} chars  navbar_swapped={'<div class=\"navbar\">' not in h}")
