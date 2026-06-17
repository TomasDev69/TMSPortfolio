# Portfolio2026 — guida per Claude

Portfolio personale **statico** (HTML/CSS/JS puro, nessun build step, nessun
framework) di **Tomas Guardati**. Nato come progetto della settimana 8 del
corso **CS50x** di Harvard (2024) e aggiornato nel tempo. Deploy su Cloudflare
Pages. La vecchia versione live è https://portfolio-8pl.pages.dev/ (sarà
ricaricato altrove).

## ⚠️ Regola fissa: aggiorna la data ad ogni push

**Prima di ogni push su GitHub, aggiorna `LAST_UPDATE` in `site.js`** con la
data odierna in formato `DD/MM/YYYY`. È l'unica fonte di verità del badge
"Last update" mostrato in basso a destra su Home e Certifications. Una sola
riga da cambiare:

```js
const LAST_UPDATE = "16/06/2026";
```

## Come si guarda in locale

È tutto statico: basta aprire i `.html` nel browser, oppure
`python -m http.server` nella root e visitare `http://localhost:8000`.

## Architettura del progetto

- **Tutti i file sorgente sono nella root.** Le pagine sono `.html`
  indipendenti che si linkano a vicenda con `onclick="location.href=..."`
  nella navbar (Tom`[as]`).
- Le immagini stanno in `Immagini/` (sottocartelle per progetto/tema).
- I font locali stanno in `Fonts/` (Roboto, Adult-Swim). Le pagine nuove
  caricano anche Ubuntu/Roboto da Google Fonts.

### Tema "galattico" condiviso (nuovo)
- **`theme.css`** — tema scuro galattico: starfield generato in CSS (nessuna
  immagine pesante) su `#001524`, design token (variabili `:root`), navbar
  responsive con hamburger, bottoni `.btn`, badge `.last-update`, modale video,
  card certificazioni. Va linkato **dopo** l'eventuale CSS della pagina così da
  fare override pulito.
- **`site.js`** — comportamenti condivisi: toggle hamburger mobile, modale del
  video CS50 (YouTube), e iniezione di `LAST_UPDATE` negli elementi
  `[data-last-update]`.
- Attualmente `theme.css` + `site.js` sono linkati **solo** su `index.html` e
  `Certifications.html`. Le altre pagine usano ancora il vecchio CSS (vedi
  sotto) — vanno migrate al tema quando si farà il redesign completo.

### Pagine e quale CSS usano
| Pagina | CSS |
|---|---|
| `index.html` (home) | `theme.css` |
| `Certifications.html` | `theme.css` |
| `AboutMe.html` | `AboutMeStyle.css` |
| `projects.html` | `StyleProjects.css` + `projects.js` |
| `Softwares.html` | `Certifications.css` |
| `CodingLanguages.html` | `Certifications.css` |
| `MCD.html`, `503.html` | `styles.css` |
| `SborroCraft.html`, `Medievale.html`, `lapierre*.html`, `2124.html`, `MCDPatchNotes.html` | CSS dedicati omonimi |

> ⚠️ `styles.css` è condiviso da `MCD.html`/`503.html`/`index.html` (anche se
> la home ora non lo linka più), e `Certifications.css` da
> `Softwares.html`/`CodingLanguages.html`. **Non** modificare questi due file
> in modo invasivo senza controllare le pagine che li condividono — per questo
> il tema nuovo è in `theme.css` separato.

### Duplicati / artefatti da ignorare
- `Portfolio/` e `TMSPortfolio/` nella root sono **copie/cartelle di sync di
  Google Drive** (untracked, contengono `desktop.ini`). Non sono il progetto:
  lavorare sempre sui file nella root tracciati da git. `desktop.ini` e
  `.tmp.driveupload*` sono in `.gitignore`.

## Contenuti

- **Home (`index.html`)**: hero con foto, titolo, tagline, nota sul fatto che
  il design è cambiato negli anni, bottoni About/Projects + bottone che apre il
  **video CS50** (https://youtu.be/0ljiu_oF_mQ) in una modale, badge last-update.
- **Certificazioni (`Certifications.html`)**: card per CS50x (2024), IBM AI
  Fundamentals (2024), Cisco Cybersecurity (2023), Cambridge FCE (2023) e le 3
  Anthropic Academy (2026): *Claude Code 101*, *Introduction to Subagents*,
  *Introduction to Agent Skills* — immagini renderizzate in
  `Immagini/Anthropic/` con link di verifica skilljar.

## TODO aperti
- **CAE (Cambridge C1 Advanced)**: Tomas l'ha conseguito ma il file non è
  ancora disponibile. Aggiungere una card in `Certifications.html` quando
  fornirà immagine/PDF o link di verifica.
- Migrare le pagine restanti (AboutMe, Projects, Softwares, CodingLanguages…)
  al tema `theme.css` per un look uniforme (redesign completo).

## Note operative
- L'utente scrive in italiano; i contenuti del sito sono in italiano.
- I certificati PDF originali Anthropic sono in `C:\Users\Guard\Documents\`
  (`anthropic-*-standard-certificate.pdf`); le versioni PNG mostrate nel sito
  sono state renderizzate e ridimensionate a 1100px in `Immagini/Anthropic/`.
