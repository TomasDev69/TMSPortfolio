#!/usr/bin/env python
# Deterministic status-badge classer. For every element with class
# "overlay-text", add ONE st-* class based on its visible text. Idempotent:
# skips elements that already carry any st-* class. Keeps overlay-text.
import sys, os
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ST = ("st-done", "st-disc", "st-planned", "st-wip")

def status_class(text):
    t = text or ""
    if "Completed" in t:
        return "st-done"
    if "Discontinued" in t:
        return "st-disc"
    if "Planned" in t:
        return "st-planned"
    if "Progress" in t:
        return "st-wip"
    return "st-wip"

def main():
    files = sys.argv[1:]
    for f in files:
        path = os.path.join(ROOT, f)
        soup = BeautifulSoup(open(path, encoding="utf-8").read(), "html.parser")
        counts = {s: 0 for s in ST}
        changed = 0
        for el in soup.find_all(class_="overlay-text"):
            cls = el.get("class") or []
            if any(c in ST for c in cls):
                continue
            st = status_class(el.get_text(" "))
            el["class"] = cls + [st]
            counts[st] += 1
            changed += 1
        if changed:
            open(path, "w", encoding="utf-8").write(str(soup))
        print(f"{f}: added {changed} status classes  " +
              "  ".join(f"{s}={counts[s]}" for s in ST))

if __name__ == "__main__":
    main()
