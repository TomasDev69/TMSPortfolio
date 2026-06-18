/* =====================================================================
   site.js — shared behaviour for the galactic pages
   (language EN/IT, navbar hamburger, CS50 video modal, last-update stamp)

   >>> LAST_UPDATE: bump this date on every push to GitHub. <<<
   Format: DD/MM/YYYY. Single source of truth for the "Last update" badge.
   ===================================================================== */
const LAST_UPDATE = "18/06/2026";

/* ---- i18n ---------------------------------------------------------- */
const LANG_KEY = "lang";
const SUPPORTED_LANGS = ["en", "it"];

function getStoredLang() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
}
function storeLang(l) {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
}

function applyLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-set-lang]").forEach((b) =>
        b.classList.toggle("active", b.getAttribute("data-set-lang") === lang)
    );
    // localized "last update" badge
    const label = lang === "it" ? "Ultimo aggiornamento" : "Last update";
    document.querySelectorAll("[data-last-update]").forEach((el) => {
        el.innerHTML = label + ': <strong>' + LAST_UPDATE + "</strong>";
    });
}
function setLang(lang) { applyLang(lang); storeLang(lang); }

function isLikelyItaly() {
    try {
        if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Rome") return true;
    } catch (e) {}
    const langs = (navigator.languages && navigator.languages.length)
        ? navigator.languages : [navigator.language || ""];
    return langs.some((l) => (l || "").toLowerCase().startsWith("it"));
}

function showLangBanner() {
    if (document.querySelector(".lang-banner")) return;
    const b = document.createElement("div");
    b.className = "lang-banner";
    b.setAttribute("role", "dialog");
    b.innerHTML =
        '<span>Stai navigando dall’Italia: vuoi vedere il sito in italiano?</span>' +
        '<div class="lang-banner-actions">' +
            '<button class="btn-yes" type="button">Sì, in italiano</button>' +
            '<button class="btn-no" type="button">No, English</button>' +
        '</div>';
    document.body.appendChild(b);
    requestAnimationFrame(() => b.classList.add("show"));
    b.querySelector(".btn-yes").addEventListener("click", () => { setLang("it"); b.remove(); });
    b.querySelector(".btn-no").addEventListener("click", () => { setLang("en"); b.remove(); });
}

document.addEventListener("DOMContentLoaded", () => {
    /* ---- language ------------------------------------------------- */
    const stored = getStoredLang();
    applyLang(stored || "en");
    document.querySelectorAll("[data-set-lang]").forEach((btn) =>
        btn.addEventListener("click", () => setLang(btn.getAttribute("data-set-lang")))
    );
    // First visit from Italy → offer Italian (once; any choice is remembered)
    if (!stored && isLikelyItaly()) showLangBanner();

    /* ---- mobile navbar toggle ------------------------------------- */
    const toggle = document.querySelector(".nav-toggle");
    const navButtons = document.querySelector(".nav-buttons");
    if (toggle && navButtons) {
        toggle.addEventListener("click", () => navButtons.classList.toggle("open"));
        navButtons.querySelectorAll("a, button").forEach((b) =>
            b.addEventListener("click", () => navButtons.classList.remove("open"))
        );
    }

    /* ---- video modal ---------------------------------------------- */
    const modal = document.getElementById("video-modal");
    if (modal) {
        const frame = modal.querySelector("iframe");
        const src = frame ? frame.getAttribute("data-src") : null;

        const open = () => {
            if (frame && src) frame.src = src + "?rel=0&playsinline=1";
            modal.classList.add("open");
            document.body.style.overflow = "hidden";
        };
        const close = () => {
            modal.classList.remove("open");
            if (frame) frame.src = "";          // stop playback
            document.body.style.overflow = "";
        };

        document.querySelectorAll("[data-open-video]").forEach((b) =>
            b.addEventListener("click", open)
        );
        modal.querySelectorAll("[data-close-video]").forEach((b) =>
            b.addEventListener("click", close)
        );
        modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("open")) close();
        });
    }
});
