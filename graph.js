/* =====================================================================
   portfolio-graph — self-building "Obsidian" style knowledge graph.

   At load it fetches the other portfolio pages, scrapes every .card
   (projects, certifications, software, coding languages) and the skill
   lists inside them, then renders an interactive force-directed graph.
   Shared skills are the same node, so projects/certs/etc. interconnect.
   Add a card anywhere and a node appears here automatically.

   NOTE: uses fetch(), so it only works when the site is served over http
   (Cloudflare Pages or `python -m http.server`), NOT opened via file://.
   Renders with force-graph (loaded from CDN in AboutMe.html).
   ===================================================================== */
(function () {
    var el = document.getElementById('portfolio-graph');
    if (!el || typeof ForceGraph !== 'function') return;
    var status = el.querySelector('.graph-status');

    /* category -> colour (matches theme.css tokens) + relative node value */
    var CAT = {
        me:       { color: '#ffffff', val: 7 },
        hub:      { color: '#cbd6dd', val: 5 },
        project:  { color: '#4d8df6', val: 3 },
        cert:     { color: '#ffcf4d', val: 3 },
        software: { color: '#2cacc9', val: 1.6 },
        language: { color: '#a78bfa', val: 1.6 },
        skill:    { color: '#f4b740', val: 1 }
    };
    var DIM = 'rgba(120,140,152,0.12)';

    var SOURCES = [
        { url: 'projects.html',        cat: 'project',  hub: 'Projects',       skills: true  },
        { url: 'Certifications.html',  cat: 'cert',     hub: 'Certifications', skills: true  },
        { url: 'Softwares.html',       cat: 'software', hub: 'Software',       skills: false },
        { url: 'CodingLanguages.html', cat: 'language', hub: 'Languages',      skills: false }
    ];

    var nodes = {};
    var links = [];
    function addNode(id, cat, label) {
        if (!nodes[id]) nodes[id] = { id: id, cat: cat, label: label || id, nb: {} };
        return nodes[id];
    }
    function addLink(a, b) {
        if (!a || !b || a === b) return;
        links.push({ source: a, target: b });
        if (nodes[a]) nodes[a].nb[b] = 1;
        if (nodes[b]) nodes[b].nb[a] = 1;
    }
    function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
    function cardTitle(h2) {
        var en = h2.querySelector('.t-en');
        return clean(en ? en.textContent : h2.textContent);
    }

    addNode('Tomas', 'me', 'Tomas');
    SOURCES.forEach(function (s) { addNode(s.hub, 'hub', s.hub); addLink('Tomas', s.hub); });

    Promise.all(SOURCES.map(function (src) {
        return fetch(src.url)
            .then(function (r) { return r.text(); })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                doc.querySelectorAll('.card').forEach(function (card) {
                    var h2 = card.querySelector('.card-body h2');
                    if (!h2) return;
                    var title = cardTitle(h2);
                    if (!title) return;
                    var nodeId = src.cat + ':' + title.toLowerCase();
                    if (nodes[nodeId]) return;
                    addNode(nodeId, src.cat, title);
                    addLink(src.hub, nodeId);
                    if (!src.skills) return;
                    var seen = {};
                    card.querySelectorAll('.card-body ul li').forEach(function (li) {
                        if (li.classList.contains('t-it')) return;
                        var t = clean(li.textContent);
                        if (!t || t.length > 46) return;
                        var key = t.toLowerCase();
                        if (seen[key]) return; seen[key] = 1;
                        var sid = 'skill:' + key;
                        addNode(sid, 'skill', t);
                        addLink(nodeId, sid);
                    });
                });
            })
            .catch(function () { return null; });
    })).then(function () {
        var list = Object.keys(nodes).map(function (k) { return nodes[k]; });
        if (list.length <= SOURCES.length + 1) {
            if (status) status.innerHTML =
                '<span class="t-en">The map needs the site to be served over http ' +
                '(it loads the other pages live). Open it on the deployed site or run ' +
                '<code>python -m http.server</code> in the project root.</span>' +
                '<span class="t-it">La mappa ha bisogno che il sito sia servito via http ' +
                '(carica le altre pagine in tempo reale). Aprila sul sito pubblicato o avvia ' +
                '<code>python -m http.server</code> nella cartella del progetto.</span>';
            return;
        }
        if (status) status.parentNode.removeChild(status);
        addCrossLinks(list);
        render({ nodes: list, links: links });
    });

    /* curated interlinks: a software directly to the language(s) it uses,
       a project to the software/languages it relies on. Resolved by label
       so they survive renames; missing nodes are simply skipped. */
    function addCrossLinks(list) {
        function find(cat, kw) {
            var exact = kw.charAt(0) === '=';
            var k = (exact ? kw.slice(1) : kw).toLowerCase();
            for (var i = 0; i < list.length; i++) {
                var n = list[i];
                if (n.cat !== cat) continue;
                var l = n.label.toLowerCase().trim();
                if (exact ? l === k : l.indexOf(k) !== -1) return n;
            }
            return null;
        }
        function join(aCat, aKw, bCat, bKw) {
            var a = find(aCat, aKw), b = find(bCat, bKw);
            if (a && b) addLink(a.id, b.id);
        }
        var SL = [
            ['blender', ['python']], ['unity', ['=c#']], ['unreal', ['c++']],
            ['roblox', ['lua']], ['android studio', ['kotlin', '=java']],
            ['=visual studio', ['=c#', 'c++']],
            ['visual studio code', ['javascript', 'python', '=html', 'css']],
            ['flutterflow', ['dart']], ['streamlit', ['python']], ['ollama', ['python']],
            ['lm studio', ['python']], ['comfyui', ['python']], ['mysql', ['sql']],
            ['supabase', ['sql']], ['n8n', ['javascript']], ['shopify', ['javascript']],
            ['claude code', ['python', 'javascript']]
        ];
        SL.forEach(function (p) { p[1].forEach(function (lang) { join('software', p[0], 'language', lang); }); });
        var PX = [
            ['certify', 'software', 'claude code'], ['certify', 'language', 'javascript'],
            ['certify', 'language', '=html'], ['certify', 'language', 'css'],
            ['tms lab', 'language', 'javascript'], ['tms lab', 'language', '=html'],
            ['tms lab', 'language', 'css'],
            ['jetson', 'software', 'ollama'], ['jetson', 'software', 'lm studio'],
            ['jetson', 'language', 'python'], ['surveil', 'software', 'ollama'],
            ['surveil', 'software', 'yolo'], ['surveil', 'language', 'python'],
            ['geodnet', 'language', 'python'], ['unfiltered', 'software', 'shopify'],
            ['unfiltered', 'software', 'photoshop'], ['unfiltered', 'software', 'picsart'],
            ['unfiltered', 'software', 'canva'], ['dtf', 'software', 'shopify'],
            ['dtf', 'software', 'photoshop'], ['python', 'language', 'python']
        ];
        PX.forEach(function (p) { join('project', p[0], p[1], p[2]); });

        /* certifications were an isolated cluster: tie each one to the
           languages / software / projects it actually relates to, so the
           whole graph interconnects. */
        var CX = [
            /* Harvard CS50x -> computer-science fundamentals */
            ['cs50', 'language', '=c'], ['cs50', 'language', 'python'], ['cs50', 'language', 'sql'],
            ['cs50', 'language', 'javascript'], ['cs50', 'language', '=html'], ['cs50', 'language', 'css'],
            ['cs50', 'software', 'visual studio code'], ['cs50', 'project', 'python'],
            /* IBM AI Fundamentals -> the local-AI stack */
            ['ibm', 'language', 'python'], ['ibm', 'software', 'ollama'], ['ibm', 'software', 'lm studio'],
            ['ibm', 'software', 'comfyui'], ['ibm', 'project', 'local ai'], ['ibm', 'project', 'jetson'],
            ['ibm', 'project', 'surveil'],
            /* Cisco Cybersecurity -> networking / security tooling */
            ['cisco', 'software', 'pi hole'], ['cisco', 'software', 'openmediavault'], ['cisco', 'language', 'bash'],
            /* Anthropic Claude Code 101 / in action -> Claude Code + things built with it */
            ['101', 'software', 'claude code'], ['101', 'language', 'python'], ['101', 'language', 'javascript'],
            ['101', 'project', 'certify'], ['101', 'project', 'tms lab'],
            ['in action', 'software', 'claude code'], ['in action', 'project', 'certify'], ['in action', 'project', 'tms lab'],
            /* Anthropic Subagents / Agent Skills / API -> Claude Code + Python */
            ['subagents', 'software', 'claude code'], ['subagents', 'language', 'python'],
            ['agent skills', 'software', 'claude code'], ['agent skills', 'language', 'python'],
            ['anthropic api', 'software', 'claude code'], ['anthropic api', 'language', 'python']
        ];
        CX.forEach(function (p) { join('cert', p[0], p[1], p[2]); });
    }

    function render(data) {
        var REL = 2.2;            /* radius = REL * sqrt(val) -> small nodes */
        var hover = null;
        function touches(link) { return hover && (link.source.id === hover.id || link.target.id === hover.id); }
        function lit(node) { return !hover || node.id === hover.id || hover.nb[node.id]; }

        var Graph = ForceGraph()(el)
            .backgroundColor('rgba(0,0,0,0)')
            .graphData(data)
            .nodeRelSize(REL)
            .nodeVal(function (n) { return (CAT[n.cat] || {}).val || 1; })
            .nodeColor(function (n) {
                if (!lit(n)) return DIM;
                return (CAT[n.cat] || {}).color || '#8aa0ad';
            })
            .nodeLabel(function (n) { return n.label; })
            .linkColor(function (l) {
                if (touches(l)) return 'rgba(120,205,235,0.9)';
                return hover ? 'rgba(138,160,173,0.04)' : 'rgba(138,160,173,0.16)';
            })
            .linkWidth(function (l) { return touches(l) ? 1.8 : 0.5; })
            .linkDirectionalParticles(0)
            .cooldownTime(8000)
            .d3VelocityDecay(0.28)
            .onNodeHover(function (n) { hover = n || null; el.style.cursor = n ? 'pointer' : 'grab'; })
            .onNodeClick(function (n) {
                Graph.centerAt(n.x, n.y, 600);
                Graph.zoom(Math.max(Graph.zoom(), 2.5), 600);
            })
            .nodeCanvasObjectMode(function () { return 'after'; })
            .nodeCanvasObject(function (node, ctx, scale) {
                var always = node.cat === 'me' || node.cat === 'hub';
                var isEntity = node.cat === 'project' || node.cat === 'cert' || node.cat === 'software' || node.cat === 'language';
                var hovered = hover && (node.id === hover.id || hover.nb[node.id]);
                /* clean when zoomed out (only hubs labelled); the named entities
                   reveal their label on a slight zoom-in, skills only when zoomed
                   close, and hovering always lights up a node + its neighbours. */
                var show = always || hovered || (isEntity && scale > 1.4) || (node.cat === 'skill' && scale > 3);
                if (!show) return;
                var r = REL * Math.sqrt((CAT[node.cat] || {}).val || 1);
                var fontSize = Math.max((node.cat === 'me' ? 5 : node.cat === 'hub' ? 4 : 3.6) * (12 / Math.max(scale, 4)) + 2, 2.5);
                ctx.font = '600 ' + fontSize + 'px Ubuntu, Verdana, sans-serif';
                var label = node.label;
                var w = ctx.measureText(label).width;
                var pad = fontSize * 0.35;
                var y = node.y + r + fontSize * 0.6;
                ctx.fillStyle = 'rgba(0,15,24,0.7)';
                ctx.fillRect(node.x - w / 2 - pad, y - pad * 0.4, w + pad * 2, fontSize + pad * 0.8);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = always ? '#ffffff' : 'rgba(232,242,247,0.92)';
                ctx.fillText(label, node.x, y);
            });

        /* forces: strong repulsion + long hub links spread the clusters out */
        Graph.d3Force('charge').strength(-90).distanceMax(420);
        Graph.d3Force('link')
            .distance(function (l) {
                var s = l.source.cat || (nodes[l.source] || {}).cat;
                var t = l.target.cat || (nodes[l.target] || {}).cat;
                if (s === 'me' || t === 'me') return 120;
                if (s === 'hub' || t === 'hub') return 70;
                return 26;                                 /* card <-> skill: tight */
            })
            .strength(0.7);

        function resize() { Graph.width(el.clientWidth).height(el.clientHeight); }
        resize();
        window.addEventListener('resize', resize);
        Graph.onEngineStop(function () { Graph.zoomToFit(600, 60); });
        setTimeout(function () { Graph.zoomToFit(600, 60); }, 2500);
    }
})();
