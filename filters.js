/* filters.js — minimal, reusable card filter.
   Drop a <div class="filter-bar" data-filter-scope="#projects"></div> on a page
   that has galactic .card elements with .quest-badge (quest-main/quest-side) and
   .overlay-text (st-*) pills. The bar auto-detects which values are present,
   builds bilingual chips and shows/hides cards. No dependencies. */
(function () {
  "use strict";

  var QUEST = {
    main: { en: "Main Quest", it: "Main Quest" },
    side: { en: "Side Quest", it: "Side Quest" }
  };
  var STATUS = {
    done:      { en: "Completed",        it: "Completati" },
    wip:       { en: "Work in Progress", it: "In corso" },
    planned:   { en: "Planned",          it: "In programma" },
    paused:    { en: "Paused",           it: "In pausa" },
    disc:      { en: "Discontinued",     it: "Sospesi" },
    cancelled: { en: "Cancelled",        it: "Annullati" }
  };
  var QUEST_ORDER  = ["main", "side"];
  var STATUS_ORDER = ["wip", "done", "planned", "paused", "disc", "cancelled"];

  function questOf(card) {
    var b = card.querySelector(".quest-badge");
    if (!b) return null;
    if (b.classList.contains("quest-main")) return "main";
    if (b.classList.contains("quest-side")) return "side";
    return null;
  }
  function statusOf(card) {
    var o = card.querySelector(".overlay-text");
    if (!o) return null;
    var m = (o.className.match(/\bst-([a-z]+)\b/));
    return m ? m[1] : null;
  }

  function bilingual(en, it) {
    return '<span class="t-en">' + en + '</span><span class="t-it">' + it + '</span>';
  }

  function buildGroup(bar, groupName, order, dict, present) {
    var values = order.filter(function (v) { return present[v]; });
    if (values.length < 2) return; // nothing meaningful to filter on

    var labels = { type:   { en: "Type",   it: "Tipo" },
                   status: { en: "Status", it: "Stato" } };
    var all =    { en: "All", it: "Tutti" };

    var wrap = document.createElement("div");
    wrap.className = "filter-group";

    var label = document.createElement("span");
    label.className = "filter-label";
    label.innerHTML = bilingual(labels[groupName].en, labels[groupName].it);
    wrap.appendChild(label);

    function chip(value, html, active) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip" + (active ? " active" : "");
      b.dataset.group = groupName;
      b.dataset.value = value;
      b.innerHTML = html;
      wrap.appendChild(b);
      return b;
    }

    chip("all", bilingual(all.en, all.it), true);
    values.forEach(function (v) { chip(v, bilingual(dict[v].en, dict[v].it), false); });
    bar.appendChild(wrap);
  }

  function init(bar) {
    var scope = document.querySelector(bar.dataset.filterScope || "body");
    if (!scope) return;
    var cards = [].slice.call(scope.querySelectorAll(".card"));
    if (!cards.length) return;

    var presentQuest = {}, presentStatus = {};
    cards.forEach(function (card) {
      var q = questOf(card), s = statusOf(card);
      card._quest = q; card._status = s;
      if (q) presentQuest[q] = true;
      if (s) presentStatus[s] = true;
    });

    buildGroup(bar, "type",   QUEST_ORDER,  QUEST,  presentQuest);
    buildGroup(bar, "status", STATUS_ORDER, STATUS, presentStatus);
    if (!bar.children.length) { bar.style.display = "none"; return; }

    // live result count
    var count = document.createElement("span");
    count.className = "filter-count";
    bar.appendChild(count);

    var active = { type: "all", status: "all" };

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = (active.type === "all" || card._quest === active.type) &&
                 (active.status === "all" || card._status === active.status);
        card.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      count.innerHTML = bilingual(shown + " shown", shown + " visibili");
    }

    bar.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      var g = chip.dataset.group;
      active[g] = chip.dataset.value;
      [].forEach.call(bar.querySelectorAll('.filter-chip[data-group="' + g + '"]'),
        function (c) { c.classList.toggle("active", c === chip); });
      apply();
    });

    apply();
  }

  function boot() {
    [].forEach.call(document.querySelectorAll(".filter-bar[data-filter-scope]"), init);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
