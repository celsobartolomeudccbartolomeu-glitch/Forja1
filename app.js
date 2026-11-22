/* FORJA — aplicação completa.
   Modo demo local (localStorage) funciona sem servidor.
   Com Supabase configurado, os dados passam para a nuvem. */
(function () {
"use strict";
var $ = function (s) { return document.querySelector(s); };
var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function safeUrl(u) { u = String(u == null ? "" : u).trim(); return /^https?:\/\//i.test(u) ? u : ""; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function debounce(fn, ms) { var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); }; }
var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var LS = {
  get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};
var KIND = { project: "Projeto", code: "Código", video: "Vídeo" };
var TIP_CATS = ["Termux", "Workflow", "Git", "JavaScript", "Segurança", "SQL", "TrebEdit"];
var TECH_CATS = ["Escolas", "Ferramentas", "Comunidade", "Jogos"];
var DIFFS = ["fácil", "média", "difícil"];

var BOOKS = [
  { id: "b1", title: "Eloquent JavaScript", author: "Marijn Haverbeke", year: 2024, level: "iniciante", lang: "EN", tags: ["JavaScript", "Web"], url: "https://eloquentjavascript.net", c: 0, blurb: "A porta de entrada séria para JavaScript: linguagem, browser e Node, com exercícios no fim de cada capítulo. Grátis online." },
  { id: "b2", title: "You Don't Know JS Yet", author: "Kyle Simpson", year: 2020, level: "intermédio", lang: "EN", tags: ["JavaScript", "Fundamentos"], url: "https://github.com/getify/You-Dont-Know-JS", c: 1, blurb: "A série que desmonta os mitos do JavaScript: scopes, closures, this, tipos. Lê-se inteiro no GitHub, de graça." },
  { id: "b3", title: "Automate the Boring Stuff", author: "Al Sweigart", year: 2019, level: "iniciante", lang: "EN", tags: ["Python", "Automação"], url: "https://automatetheboringstuff.com", c: 2, blurb: "Programar para resolver tarefas chatas: ficheiros, folhas de cálculo, emails. Perfeito para quem está a começar." },
  { id: "b4", title: "The Pragmatic Programmer", author: "Hunt & Thomas", year: 2019, level: "intermédio", lang: "EN", tags: ["Carreira", "Boas práticas"], url: null, c: 3, blurb: "Hábitos de quem constrói software que dura: responsabilidade, protótipos, debugging, automatização." },
  { id: "b5", title: "Clean Code", author: "Robert C. Martin", year: 2008, level: "intermédio", lang: "EN", tags: ["Legibilidade"], url: null, c: 4, blurb: "Nomes, funções pequenas, comentários honestos. Discorda-se de partes — mas muda como escreves código." },
  { id: "b6", title: "Grokking Algorithms", author: "Aditya Bhargava", year: 2016, level: "intermédio", lang: "EN", tags: ["Algoritmos", "Ilustrado"], url: null, c: 5, blurb: "Algoritmos explicados com desenhos e exemplos reais: pesquisa, ordenação, grafos. Sem matemática pesada." },
  { id: "b7", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", year: 2017, level: "avançado", lang: "EN", tags: ["Dados", "Sistemas"], url: null, c: 6, blurb: "A referência moderna de bases de dados e sistemas distribuídos. Lê quando o sistema escolar crescer a sério." },
  { id: "b8", title: "Code Complete", author: "Steve McConnell", year: 2004, level: "avançado", lang: "EN", tags: ["Construção"], url: null, c: 7, blurb: "900 páginas sobre a arte de construir software: design, variáveis, loops, testes. Denso, mas paga o tempo." }
];
var TIPS = [
  { id: "t1", title: "Liga o Termux ao armazenamento", cat: "Termux", body: "Sem isto, o Termux não vê a pasta onde o TrebEdit e o Acode guardam os projetos. Corre uma vez e aceita a permissão.", code: "termux-setup-storage\ncd ~/storage/shared/Download/Forja", lang: "bash" },
  { id: "t2", title: "Servidor local num comando", cat: "Workflow", body: "Para veres o site no browser exatamente como vai ficar online, serve a pasta do projeto.", code: "python -m http.server 8000\n# abre http://localhost:8000", lang: "bash" },
  { id: "t3", title: "Backup do código no GitHub", cat: "Git", body: "Meses de trabalho não podem viver só num telemóvel. Faz push no fim de cada sessão.", code: "pkg install git\ngit init\ngit add .\ngit commit -m \"forja\"\ngit push -u origin main", lang: "bash" },
  { id: "t4", title: "console.table arruma arrays", cat: "JavaScript", body: "Em vez de vinte console.log, uma tabela legível. Experimenta na IDE com o exemplo «Médias da turma».", code: "console.table([\n  { aluno: \"Ana\", media: 15.2 },\n  { aluno: \"Bruno\", media: 10.0 }\n]);", lang: "js" },
  { id: "t5", title: "Nunca guardes passwords em texto simples", cat: "Segurança", body: "No Supabase, o Auth trata das passwords. Se fizeres o teu servidor, usa scrypt ou bcrypt com salt.", code: "const salt = crypto.randomBytes(16).toString(\"hex\");\nconst hash = crypto.scryptSync(pw, salt, 64).toString(\"hex\");", lang: "js" },
  { id: "t6", title: "Desenha o schema antes do código", cat: "SQL", body: "Tabelas, chaves estrangeiras e CHECKs primeiro; rotas depois. Evita metade dos bugs do sistema escolar.", code: "CREATE TABLE notas (\n  valor REAL NOT NULL CHECK (valor BETWEEN 0 AND 20),\n  aluno_id INTEGER NOT NULL REFERENCES alunos(id)\n);", lang: "sql" },
  { id: "t7", title: "Ficheiros separados, caminhos relativos", cat: "TrebEdit", body: "HTML, CSS e JS na mesma pasta do projeto. O HTML liga-os por caminho relativo — e os nomes têm de ser iguais aos do ficheiro.", code: '<link rel="stylesheet" href="styles.css">\n<script src="app.js"></script>', lang: "html" },
  { id: "t8", title: "Mede antes de otimizar", cat: "JavaScript", body: "«Está lento» não é diagnóstico. Mede com performance.now() e otimiza só o que os números acusam.", code: "const t0 = performance.now();\ntrabalhoPesado();\nconsole.log((performance.now() - t0).toFixed(1) + \" ms\");", lang: "js" }
];
var SEED_POSTS = [
  { id: "seed-1", author_id: null, author_name: "FORJA", kind: "project", title: "Sistema Escolar Web", summary: "Matrículas, confirmações e médias sem papel. Schema SQL primeiro, rotas depois — uma escola real a usar vale por mil demos.", code: null, language: null, repo_url: null, demo_url: null, video_url: null, video_path: null, tags: ["Escolas", "Node", "SQL"], pinned: true, sort_order: 10, like_count: 14, created_at: Date.UTC(2026, 10, 4), updated_at: Date.UTC(2026, 10, 4) },
  { id: "seed-2", author_id: null, author_name: "FORJA", kind: "code", title: "Médias da turma", summary: "Funções puras para calcular médias por aluno e por turma. Copia, cola na IDE e corre.", code: 'const turma = [\n  { nome: "Ana", notas: [14, 16, 12] },\n  { nome: "Bruno", notas: [9, 11, 10] },\n  { nome: "Carla", notas: [17, 18, 19] }\n];\nconst media = ns => ns.reduce((a, b) => a + b, 0) / ns.length;\n\nconsole.table(turma.map(a => ({\n  aluno: a.nome,\n  media: +media(a.notas).toFixed(1),\n  situacao: media(a.notas) >= 10 ? "Aprovado" : "Reprovado"\n})));', language: "js", repo_url: null, demo_url: null, video_url: null, video_path: null, tags: ["JavaScript", "Escolas"], pinned: true, sort_order: 20, like_count: 21, created_at: Date.UTC(2026, 10, 6), updated_at: Date.UTC(2026, 10, 6) },
  { id: "seed-3", author_id: null, author_name: "FORJA", kind: "video", title: "Leitor de vídeo da comunidade", summary: "Demonstração do leitor: contas criadas publicam vídeos por URL ou upload; visitantes apenas assistem. Este ficheiro é de exemplo, domínio público.", code: null, language: null, repo_url: null, demo_url: null, video_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", video_path: null, tags: ["Demo", "Vídeo"], pinned: false, sort_order: 30, like_count: 9, created_at: Date.UTC(2026, 10, 8), updated_at: Date.UTC(2026, 10, 8) },
  { id: "seed-4", author_id: null, author_name: "FORJA", kind: "code", title: "Tabuada em FORJA·lang", summary: "O modo demo da IDE usa palavras-chave em português: var, mostra, se, enquanto. Este snippet corre no editor.", code: 'var n = 7\nvar i = 1\nenquanto i <= 10 {\n  mostra n + " × " + i + " = " + (n * i)\n  i = i + 1\n}', language: "forja", repo_url: null, demo_url: null, video_url: null, video_path: null, tags: ["Linguagem", "Demo"], pinned: false, sort_order: 40, like_count: 17, created_at: Date.UTC(2026, 10, 10), updated_at: Date.UTC(2026, 10, 10) },
  { id: "seed-5", author_id: null, author_name: "FORJA", kind: "project", title: "Linguagem + IDE Web", summary: "Linguagem própria com IDE web e versão desktop, escrita no telemóvel. O módulo FORJA·lang desta IDE é o primeiro tijolo, em 30% do caminho.", code: null, language: null, repo_url: null, demo_url: null, video_url: null, video_path: null, tags: ["Interpretador", "JavaScript"], pinned: false, sort_order: 50, like_count: 26, created_at: Date.UTC(2026, 10, 12), updated_at: Date.UTC(2026, 10, 12) },
  { id: "seed-6", author_id: null, author_name: "FORJA", kind: "code", title: "Schema SQLite escolar", summary: "Tabelas, chaves estrangeiras e CHECKs antes do código. Uma base bem desenhada evita metade dos bugs.", code: "CREATE TABLE IF NOT EXISTS notas (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,\n  disciplina TEXT NOT NULL,\n  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),\n  valor REAL NOT NULL CHECK (valor BETWEEN 0 AND 20),\n  peso REAL NOT NULL DEFAULT 1\n);\nCREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(aluno_id);", language: "sql", repo_url: null, demo_url: null, video_url: null, video_path: null, tags: ["SQL", "Escolas"], pinned: false, sort_order: 60, like_count: 6, created_at: Date.UTC(2026, 10, 14), updated_at: Date.UTC(2026, 10, 14) }
];
var SEED_TECH = [
  { id: "x1", title: "Leitor QR para confirmação de matrícula", desc: "Cada matrícula gera um QR; à porta da escola um telemóvel lê e confirma em segundos. Liga direto ao sistema escolar e acaba com as listas em papel.", stack: ["JavaScript", "PWA", "SQLite"], cat: "Escolas", diff: "média", likes: 14, author: "FORJA", created: Date.UTC(2026, 10, 4) },
  { id: "x2", title: "PWA de horários offline", desc: "Horário de aulas que abre sem internet, guardado no dispositivo com IndexedDB e atualizado quando há rede. Essencial onde os dados móveis são caros.", stack: ["HTML", "IndexedDB", "Service Worker"], cat: "Escolas", diff: "fácil", likes: 9, author: "FORJA", created: Date.UTC(2026, 10, 6) },
  { id: "x3", title: "Sincronizador TrebEdit ↔ GitHub", desc: "Um script no Termux que faz commit e push automático das pastas de projeto no fim do dia. Backup sem pensar, histórico completo do trabalho.", stack: ["Node", "Git", "Termux"], cat: "Ferramentas", diff: "média", likes: 21, author: "FORJA", created: Date.UTC(2026, 10, 8) },
  { id: "x4", title: "Bot de médias por WhatsApp", desc: "O encarregado envia o número do aluno e recebe as médias do trimestre. Uma ponte entre a base de dados escolar e a app que toda a gente já usa.", stack: ["Node", "API WhatsApp", "SQLite"], cat: "Escolas", diff: "difícil", likes: 17, author: "FORJA", created: Date.UTC(2026, 10, 10) },
  { id: "x5", title: "Cantina escolar sem filas", desc: "Saldo e senhas digitais para a cantina: o aluno paga por transferência, recebe um código, e a fila anda. Relatório diário automático para a secretaria.", stack: ["Node", "SQLite", "QR"], cat: "Escolas", diff: "média", likes: 8, author: "FORJA", created: Date.UTC(2026, 10, 12) },
  { id: "x6", title: "Mini-IDE de linguagem em português", desc: "Um interpretador com palavras-chave em PT e editor no browser — o primeiro passo para ensinar programação sem a barreira do inglês.", stack: ["JavaScript", "Parser"], cat: "Ferramentas", diff: "difícil", likes: 26, author: "FORJA", created: Date.UTC(2026, 10, 14) }
];
var EXAMPLES = {
  forja: [
    { name: "Olá, FORJA", code: '// A tua primeira instrução\nvar nome = "mundo"\nmostra "Olá, " + nome + "!"\nvar ano = 2026\nmostra "FORJA a arder em " + ano\n' },
    { name: "Tabuada do 7", code: 'var n = 7\nvar i = 1\nenquanto i <= 10 {\n  mostra n + " × " + i + " = " + (n * i)\n  i = i + 1\n}\n' },
    { name: "Contagem decrescente", code: 'var t = 5\nenquanto t > 0 {\n  mostra t\n  t = t - 1\n}\nmostra "Lançar!"\n' },
    { name: "Se / senão", code: 'var idade = 17\nse idade >= 18 {\n  mostra "Pode entrar"\n} senao {\n  mostra "Ainda faltam " + (18 - idade) + " anos"\n}\n' }
  ],
  js: [
    { name: "Médias da turma", code: 'const turma = [\n  { nome: "Ana", notas: [14, 16, 12] },\n  { nome: "Bruno", notas: [9, 11, 10] },\n  { nome: "Carla", notas: [17, 18, 19] }\n];\nconst media = ns => ns.reduce((a, b) => a + b, 0) / ns.length;\n\nconsole.table(turma.map(a => ({\n  aluno: a.nome,\n  media: +media(a.notas).toFixed(1),\n  situacao: media(a.notas) >= 10 ? "Aprovado" : "Reprovado"\n})));\nconsole.log("Média da turma:", media(turma.flatMap(a => a.notas)).toFixed(1));\n' },
    { name: "FizzBuzz clássico", code: 'for (let i = 1; i <= 20; i++) {\n  if (i % 15 === 0) console.log("FizzBuzz");\n  else if (i % 3 === 0) console.log("Fizz");\n  else if (i % 5 === 0) console.log("Buzz");\n  else console.log(i);\n}\n' },
    { name: "Async / await", code: 'const espera = ms => new Promise(r => setTimeout(r, ms));\nconsole.log("A começar…");\nawait espera(500);\nconsole.log("Meio segundo depois");\n' }
  ],
  html: [
    { name: "Cartão de aluno", code: '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n  body { font-family: system-ui; display: grid; place-items: center;\n         min-height: 100vh; margin: 0; background: #0e1320; }\n  .cartao { width: 260px; padding: 22px; border-radius: 16px;\n    background: linear-gradient(135deg, #ffb03a, #ff5c38);\n    color: #1a1206; box-shadow: 0 18px 50px rgba(255,92,56,.35); }\n  h2 { margin: 0 0 4px; }\n  p { margin: 2px 0; font-size: 14px; }\n  .num { font-family: monospace; letter-spacing: 2px; margin-top: 14px; font-weight: 700; }\n</style>\n</head>\n<body>\n  <div class="cartao">\n    <h2>Ana Fernandes</h2>\n    <p>10.ª classe · Turma B</p>\n    <p>Média: 15,2</p>\n    <p class="num">N.º 2026-0042</p>\n  </div>\n</body>\n</html>\n' },
    { name: "Botão com contador", code: '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8">\n<style>\n  body { font-family: system-ui; display: grid; place-items: center;\n         min-height: 100vh; margin: 0; background: #0e1320; color: #f4ecdf; }\n  button { font-size: 18px; padding: 14px 28px; border: 0; border-radius: 12px;\n    background: linear-gradient(120deg, #3fd8ff, #8dff57); color: #06210f;\n    font-weight: 700; cursor: pointer; transition: .2s; }\n  button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(141,255,87,.35); }\n</style>\n</head>\n<body>\n  <div style="text-align:center">\n    <button id="b">Clica-me</button>\n    <p id="p">0 cliques</p>\n  </div>\n  <script>\n    let n = 0;\n    document.getElementById("b").onclick = function () {\n      document.getElementById("p").textContent = ++n + " cliques";\n    };\n  <\/script>\n</body>\n</html>\n' }
  ]
};
var S = {
  cfg: LS.get("forja_cfg", null) || window.FORJA_CONFIG || { supabaseUrl: "", supabaseAnonKey: "" },
  backend: "demo", client: null, user: null, profile: null,
  posts: [], tech: [], myLikes: new Set(), techLikes: new Set(), views: [],
  filters: { q: "", kind: "", tag: "", sort: "new" },
  techFilters: { cat: "", diff: "", sort: "pop" },
  lib: { tab: "books", q: "", level: "", sort: "titulo" },
  manage: false, selected: new Set(),
  snips: LS.get("forja_snips", []),
  ide: { mode: "forja", buffers: {}, running: false, prefs: LS.get("forja_prefs", { font: 16, tabs: 2, wrap: false, nums: true, theme: "forja", auto: false }) },
  pending: null
};
var demo = null, ambientStarted = false, counted = false, activeWorker = null, drawerPost = null, lastFocus = null, drawerTimer = null;

/* ══════════ modo demo local ══════════ */
function demoStore() {
  var d = LS.get("forja_demo_v2", null);
  if (!d) {
    d = { users: [], sessions: {}, posts: SEED_POSTS.map(function (p) { return Object.assign({}, p); }), tech: SEED_TECH.map(function (t) { return Object.assign({}, t); }), likes: {}, techLikes: {}, views: {} };
    LS.set("forja_demo_v2", d);
  }
  if (!d.tech) d.tech = SEED_TECH.map(function (t) { return Object.assign({}, t); });
  if (!d.techLikes) d.techLikes = {};
  if (!d.views) d.views = {};
  return d;
}
function saveDemo() { LS.set("forja_demo_v2", demo); }
function hashPw(pw, salt) {
  if (window.crypto && crypto.subtle && crypto.subtle.digest) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + "|" + pw)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    }).catch(function () { return fallbackHash(pw, salt); });
  }
  return Promise.resolve(fallbackHash(pw, salt));
}
function fallbackHash(pw, salt) {
  var s = salt + "|" + pw, h = 5381;
  for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "fb" + (h >>> 0).toString(16) + s.length.toString(16);
}
function loadScript(url) {
  return new Promise(function (res, rej) {
    var s = document.createElement("script");
    s.src = url; s.async = true;
    s.onload = function () { res(); };
    s.onerror = function () { rej(new Error("Não foi possível carregar a biblioteca Supabase.")); };
    document.head.appendChild(s);
  });
}

/* ══════════ camada de dados ══════════ */
function initBackend() {
  var cfg = S.cfg;
  if (cfg && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    return loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js")
      .then(function () {
        if (!window.supabase || !window.supabase.createClient) throw new Error("Biblioteca Supabase indisponível.");
        S.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
        return S.client.from("posts").select("id").limit(1);
      })
      .then(function (r) {
        if (r.error) throw new Error("Tabelas não encontradas. Corre o schema.sql no SQL Editor do Supabase.");
        S.backend = "supabase";
        return S.client.auth.getSession();
      })
      .then(function (r) {
        var session = r && r.data ? r.data.session : null;
        if (session) return setUser(session.user);
      })
      .then(function () {
        S.client.auth.onAuthStateChange(function (_e, session) {
          if (session) setUser(session.user).then(loadAll).then(renderAll);
          else { clearUser(); loadAll().then(renderAll); }
        });
      })
      .catch(function (e) {
        S.backend = "demo"; S.client = null; demo = demoStore(); restoreDemoSession();
        toast(e.message + " A usar modo demo local.", { type: "info", dur: 6000 });
      });
  }
  S.backend = "demo"; demo = demoStore(); restoreDemoSession();
  return Promise.resolve();
}
function restoreDemoSession() {
  var tok = LS.get("forja_demo_token", null);
  var id = tok && demo.sessions[tok];
  var u = id ? demo.users.filter(function (x) { return x.id === id; })[0] : null;
  if (u) { S.user = { id: u.id, email: u.email }; S.profile = u; }
}
function setUser(u) {
  S.user = u;
  return S.client.from("profiles").select("*").eq("id", u.id).single().then(function (r) {
    S.profile = r.data || { id: u.id, username: (u.email || "dev").split("@")[0], role: "user" };
  });
}
function clearUser() {
  S.user = null; S.profile = null; S.myLikes = new Set(); S.techLikes = new Set();
  S.manage = false; S.selected.clear();
}
function loadAll() {
  return Promise.all([loadPosts(), loadTech(), loadLikes(), loadViews()]);
}
function loadPosts() {
  if (S.backend === "supabase") {
    return S.client.from("posts").select("*, profiles(username, role)").order("created_at", { ascending: false }).limit(200)
      .then(function (r) { if (r.error) throw r.error; S.posts = r.data || []; })
      .catch(function (e) { toast("Erro a ler publicações: " + e.message, { type: "err" }); S.posts = []; });
  }
  S.posts = demo.posts.slice(); return Promise.resolve();
}
function loadTech() {
  if (S.backend === "supabase") {
    return S.client.from("tech").select("*").order("created", { ascending: false }).limit(200)
      .then(function (r) { S.tech = r.error ? SEED_TECH.map(function (t) { return Object.assign({}, t); }) : (r.data || []); })
      .catch(function () { S.tech = SEED_TECH.map(function (t) { return Object.assign({}, t); }); });
  }
  S.tech = demo.tech.slice(); return Promise.resolve();
}
function loadLikes() {
  if (!S.user) { S.myLikes = new Set(); S.techLikes = new Set(); return Promise.resolve(); }
  if (S.backend === "supabase") {
    return Promise.all([
      S.client.from("likes").select("post_id").eq("user_id", S.user.id),
      S.client.from("tech_likes").select("tech_id").eq("user_id", S.user.id)
    ]).then(function (rs) {
      S.myLikes = new Set((rs[0].data || []).map(function (x) { return x.post_id; }));
      S.techLikes = new Set((rs[1].data || []).map(function (x) { return x.tech_id; }));
    }).catch(function () { S.myLikes = new Set(); S.techLikes = new Set(); });
  }
  S.myLikes = new Set(demo.likes[S.user.id] || []);
  S.techLikes = new Set(demo.techLikes[S.user.id] || []);
  return Promise.resolve();
}
function loadViews() {
  if (S.user && S.backend === "supabase") {
    return S.client.from("saved_views").select("*").eq("user_id", S.user.id).order("created_at", { ascending: false })
      .then(function (r) { S.views = r.data || []; }).catch(function () { S.views = []; });
  }
  if (S.user && S.backend === "demo") { S.views = demo.views[S.user.id] || []; return Promise.resolve(); }
  S.views = LS.get("forja_views_guest", []); return Promise.resolve();
}
function stripPost(p) {
  return {
    kind: p.kind, title: p.title, summary: p.summary, code: p.code || null, language: p.language || null,
    repo_url: p.repo_url || null, demo_url: p.demo_url || null, video_url: p.video_url || null,
    video_path: p.video_path || null, tags: p.tags || [], sort_order: p.sort_order || 0
  };
}
function createPost(payload) {
  if (S.backend === "supabase") {
    return S.client.from("posts").insert(Object.assign({}, payload, { author_id: S.user.id })).select("*, profiles(username, role)").single()
      .then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  var p = Object.assign({ id: uid(), author_id: S.user.id, author_name: S.profile.username, like_count: 0, pinned: false, created_at: Date.now(), updated_at: Date.now() }, payload);
  demo.posts.unshift(p); saveDemo(); return Promise.resolve(p);
}
function updatePost(id, payload) {
  if (S.backend === "supabase") {
    return S.client.from("posts").update(payload).eq("id", id).select("*, profiles(username, role)").single()
      .then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  var p = demo.posts.filter(function (x) { return x.id === id; })[0];
  if (!p) return Promise.reject(new Error("Publicação não encontrada."));
  Object.assign(p, payload, { updated_at: Date.now() }); saveDemo(); return Promise.resolve(p);
}
function deletePost(id) {
  var p = S.posts.filter(function (x) { return x.id === id; })[0];
  if (S.backend === "supabase") {
    var pre = p && p.video_path ? S.client.storage.from("forja-videos").remove([p.video_path]).catch(function () {}) : Promise.resolve();
    return pre.then(function () { return S.client.from("posts").delete().eq("id", id); })
      .then(function (r) { if (r.error) throw r.error; });
  }
  demo.posts = demo.posts.filter(function (x) { return x.id !== id; }); saveDemo(); return Promise.resolve();
}
/* liked = estado ANTES do clique (a interface já foi atualizada de forma otimista) */
function toggleLike(id, liked) {
  if (S.backend === "supabase") {
    var q = liked
      ? S.client.from("likes").delete().eq("post_id", id).eq("user_id", S.user.id)
      : S.client.from("likes").insert({ post_id: id, user_id: S.user.id });
    return q.then(function (r) { if (r.error) throw r.error; return !liked; });
  }
  var arr = demo.likes[S.user.id] || (demo.likes[S.user.id] = []);
  var i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
  var p = demo.posts.filter(function (x) { return x.id === id; })[0];
  /* em modo demo o objeto é o mesmo da lista; a contagem já foi mexida na interface */
  if (p && S.posts.indexOf(p) < 0) p.like_count = Math.max(0, (p.like_count || 0) + (liked ? -1 : 1));
  saveDemo(); return Promise.resolve(!liked);
}
function toggleTechLike(id, liked) {
  if (S.backend === "supabase") {
    var q = liked
      ? S.client.from("tech_likes").delete().eq("tech_id", id).eq("user_id", S.user.id)
      : S.client.from("tech_likes").insert({ tech_id: id, user_id: S.user.id });
    return q.then(function (r) { if (r.error) throw r.error; return !liked; });
  }
  var arr = demo.techLikes[S.user.id] || (demo.techLikes[S.user.id] = []);
  var i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
  var t = demo.tech.filter(function (x) { return x.id === id; })[0];
  if (t && S.tech.indexOf(t) < 0) t.likes = Math.max(0, (t.likes || 0) + (liked ? -1 : 1));
  saveDemo(); return Promise.resolve(!liked);
}
function createTech(payload) {
  if (S.backend === "supabase") {
    return S.client.from("tech").insert(Object.assign({}, payload, { author_id: S.user.id })).select("*").single()
      .then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  var t = Object.assign({ id: uid(), likes: 0, author: S.profile.username, author_id: S.user.id, created: Date.now() }, payload);
  demo.tech.unshift(t); saveDemo(); return Promise.resolve(t);
}
function deleteTech(id) {
  if (S.backend === "supabase") return S.client.from("tech").delete().eq("id", id).then(function (r) { if (r.error) throw r.error; });
  demo.tech = demo.tech.filter(function (x) { return x.id !== id; }); saveDemo(); return Promise.resolve();
}
function saveView(name) {
  var filters = Object.assign({}, S.filters);
  if (S.user && S.backend === "supabase") {
    return S.client.from("saved_views").insert({ user_id: S.user.id, name: name, filters: filters }).select().single()
      .then(function (r) { if (r.error) throw r.error; S.views.unshift(r.data); });
  }
  var v = { id: uid(), name: name, filters: filters, created_at: Date.now() };
  S.views.unshift(v);
  if (S.user && S.backend === "demo") { demo.views[S.user.id] = S.views; saveDemo(); }
  else LS.set("forja_views_guest", S.views);
  return Promise.resolve();
}
function deleteView(id) {
  S.views = S.views.filter(function (v) { return v.id !== id; });
  if (S.user && S.backend === "supabase") return S.client.from("saved_views").delete().eq("id", id).then(function () {});
  if (S.user && S.backend === "demo") { demo.views[S.user.id] = S.views; saveDemo(); }
  else LS.set("forja_views_guest", S.views);
  return Promise.resolve();
}
function reorderPosts(ids) {
  if (S.backend === "supabase") {
    return ids.reduce(function (chain, id, i) {
      return chain.then(function () { return S.client.from("posts").update({ sort_order: i * 10 }).eq("id", id); });
    }, Promise.resolve());
  }
  ids.forEach(function (id, i) {
    var p = demo.posts.filter(function (x) { return x.id === id; })[0];
    if (p) p.sort_order = i * 10;
  });
  saveDemo(); return Promise.resolve();
}
function uploadVideo(file, onProgress) {
  if (S.backend === "supabase") {
    var safe = file.name.replace(/[^\w.\-]/g, "_");
    var path = S.user.id + "/" + Date.now() + "-" + safe;
    if (onProgress) onProgress("A enviar vídeo…");
    return S.client.storage.from("forja-videos").upload(path, file, { contentType: file.type || "video/mp4", upsert: false })
      .then(function (r) { if (r.error) throw r.error; return { video_path: path, video_url: null }; });
  }
  if (file.size > 8 * 1024 * 1024) return Promise.reject(new Error("Em modo demo usa um URL ou um ficheiro até 8 MB. Com Supabase o limite é 50 MB."));
  if (onProgress) onProgress("A ler vídeo…");
  return new Promise(function (res, rej) {
    var fr = new FileReader();
    fr.onload = function () { res({ video_path: null, video_url: fr.result }); };
    fr.onerror = function () { rej(new Error("Não foi possível ler o ficheiro.")); };
    fr.readAsDataURL(file);
  });
}
function videoSrc(p) {
  if (p.video_path && S.backend === "supabase" && S.client) {
    var r = S.client.storage.from("forja-videos").getPublicUrl(p.video_path);
    return r && r.data ? r.data.publicUrl : "";
  }
  var u = String(p.video_url || "");
  return /^(https?:|data:)/i.test(u) ? u : "";
}

/* ══════════ autenticação ══════════ */
function requireAuth(cb) {
  if (S.user) cb();
  else { S.pending = cb; authModal("register"); }
}
function signUp(email, username, password) {
  if (S.backend === "supabase") {
    return S.client.auth.signUp({ email: email, password: password, options: { data: { username: username } } })
      .then(function (r) {
        if (r.error) throw r.error;
        if (r.data.session) return setUser(r.data.session.user).then(loadAll).then(function () { return { session: true }; });
        return { session: false };
      });
  }
  if (demo.users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) return Promise.reject(new Error("Esse email já existe neste dispositivo."));
  if (demo.users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })) return Promise.reject(new Error("Esse username já existe."));
  var salt = uid();
  return hashPw(password, salt).then(function (hash) {
    var u = { id: uid(), email: email, username: username, salt: salt, hash: hash, role: demo.users.length ? "user" : "owner", created_at: Date.now() };
    demo.users.push(u);
    var tok = uid(); demo.sessions[tok] = u.id; LS.set("forja_demo_token", tok); saveDemo();
    S.user = { id: u.id, email: u.email }; S.profile = u;
    return loadAll().then(function () { return { session: true }; });
  });
}
function signIn(email, password) {
  if (S.backend === "supabase") {
    return S.client.auth.signInWithPassword({ email: email, password: password })
      .then(function (r) { if (r.error) throw r.error; return setUser(r.data.user); })
      .then(loadAll).then(function () { return { session: true }; });
  }
  var u = demo.users.filter(function (x) { return x.email.toLowerCase() === email.toLowerCase(); })[0];
  if (!u) return Promise.reject(new Error("Email ou password incorretos."));
  return hashPw(password, u.salt).then(function (hash) {
    if (hash !== u.hash) throw new Error("Email ou password incorretos.");
    var tok = uid(); demo.sessions[tok] = u.id; LS.set("forja_demo_token", tok); saveDemo();
    S.user = { id: u.id, email: u.email }; S.profile = u;
    return loadAll().then(function () { return { session: true }; });
  });
}
function signOut() {
  var done = S.backend === "supabase"
    ? S.client.auth.signOut().catch(function () {})
    : Promise.resolve().then(function () {
        var tok = LS.get("forja_demo_token", null);
        if (tok) delete demo.sessions[tok];
        LS.del("forja_demo_token"); saveDemo();
      });
  return done.then(function () { clearUser(); return loadAll(); }).then(function () { renderAll(); toast("Sessão terminada.", { type: "info" }); });
}
function authModal(tab) {
  var mode = tab || "register";
  var sub = S.backend === "supabase" ? "Supabase Auth · email + password" : "Modo demo local · conta guardada neste dispositivo";
  openModal(
    '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3 data-h>Criar conta</h3><p class="modal-sub">' + esc(sub) + '</p>' +
    '<div class="seg"><button class="seg-btn" data-t="login">Entrar</button><button class="seg-btn" data-t="register">Criar conta</button></div>' +
    '<form data-f novalidate>' +
      '<label class="fld"><span>Email</span><input data-email type="email" autocomplete="email" inputmode="email"></label>' +
      '<label class="fld" data-ufield><span>Username</span><input data-u maxlength="24" autocomplete="username"></label>' +
      '<label class="fld"><span>Password</span><span class="pw-wrap"><input data-p type="password" maxlength="72" autocomplete="new-password"><button type="button" class="eye" data-eye aria-label="Mostrar password">👁</button></span></label>' +
      '<p class="form-err" data-e hidden></p><p class="form-ok" data-ok hidden></p>' +
      '<button class="btn btn-block" data-b type="submit">' + (mode === "login" ? "Entrar" : "Criar conta") + '</button>' +
    '</form>' +
    '<p class="modal-note">Visitantes podem ler, copiar código, ver vídeos e usar a IDE. Publicar exige conta.</p>',
    function (root) {
      function paintMode() {
        root.querySelector("[data-h]").textContent = mode === "login" ? "Entrar" : "Criar conta";
        root.querySelector("[data-b]").textContent = mode === "login" ? "Entrar" : "Criar conta";
        root.querySelector("[data-ufield]").hidden = mode === "login";
        root.querySelector("[data-p]").autocomplete = mode === "login" ? "current-password" : "new-password";
        root.querySelectorAll("[data-t]").forEach(function (b) { b.classList.toggle("active", b.dataset.t === mode); });
        root.querySelector("[data-e]").hidden = true; root.querySelector("[data-ok]").hidden = true;
      }
      paintMode();
      root.querySelector("[data-x]").onclick = closeModal;
      root.querySelectorAll("[data-t]").forEach(function (b) { b.onclick = function () { mode = b.dataset.t; paintMode(); }; });
      root.querySelector("[data-eye]").onclick = function () {
        var p = root.querySelector("[data-p]"); p.type = p.type === "password" ? "text" : "password";
      };
      root.querySelector("[data-f]").onsubmit = function (e) {
        e.preventDefault();
        var email = root.querySelector("[data-email]").value.trim();
        var password = root.querySelector("[data-p]").value;
        var username = root.querySelector("[data-u]").value.trim();
        var errEl = root.querySelector("[data-e]"), okEl = root.querySelector("[data-ok]");
        function err(m) { errEl.textContent = m; errEl.hidden = false; okEl.hidden = true; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("Email inválido.");
        if (password.length < 6) return err("Password: mínimo 6 caracteres.");
        if (mode === "register" && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) return err("Username: 3–24 letras, números ou _");
        var btn = root.querySelector("[data-b]");
        btn.disabled = true; btn.textContent = mode === "login" ? "A entrar…" : "A criar conta…";
        var task = mode === "register" ? signUp(email, username, password) : signIn(email, password);
        task.then(function (r) {
          if (!r.session) {
            okEl.textContent = "Conta criada. Confirma o email e depois entra.";
            okEl.hidden = false; errEl.hidden = true;
            btn.disabled = false; btn.textContent = "Criar conta"; mode = "login"; paintMode();
            return;
          }
          closeModal(); renderAll();
          toast("Bem-vindo, " + (S.profile ? S.profile.username : email));
          var p = S.pending; S.pending = null; if (p) p();
        }).catch(function (e2) {
          err(e2.message || "Falha na autenticação.");
          btn.disabled = false; btn.textContent = mode === "login" ? "Entrar" : "Criar conta";
        });
      };
    }
  );
}

/* ══════════ UI base ══════════ */
function openModal(html, mount) {
  lastFocus = document.activeElement;
  var r = $("#modalRoot");
  r.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + "</div>";
  r.hidden = false; document.body.style.overflow = "hidden";
  r.onclick = function (e) { if (e.target === r) closeModal(); };
  if (mount) mount(r);
  var f = r.querySelector("input:not([type=file]),textarea,select");
  if (f) try { f.focus(); } catch (e) {}
}
function closeModal() {
  var r = $("#modalRoot"); r.hidden = true; r.innerHTML = "";
  if (!$("#drawer").classList.contains("show")) document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
}
function toast(msg, opts) {
  opts = opts || {};
  var box = $("#toasts");
  while (box.children.length >= 3) box.firstChild.remove();
  var t = document.createElement("div");
  t.className = "toast " + (opts.type || "ok");
  t.innerHTML = "<i></i><span>" + esc(msg) + "</span>";
  var killed = false;
  function kill() { if (killed) return; killed = true; t.classList.add("out"); setTimeout(function () { t.remove(); }, 320); }
  if (opts.action) {
    var b = document.createElement("button");
    b.textContent = opts.action.label;
    b.onclick = function () { opts.action.fn(); kill(); };
    t.appendChild(b);
  }
  box.appendChild(t);
  setTimeout(kill, opts.action ? 6500 : (opts.dur || 4200));
}
function copyText(txt) {
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Copiado"); } catch (e) { toast("Não foi possível copiar.", { type: "err" }); }
    ta.remove();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function () { toast("Copiado"); }).catch(fallback);
  } else fallback();
}
function download(name, txt) {
  var a = document.createElement("a");
  var url = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}
function fmtDate(ts) {
  var d = new Date(typeof ts === "string" ? ts : Number(ts));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}
function authorOf(p) { return (p.profiles && p.profiles.username) || p.author_name || p.author || "FORJA"; }
function isMine(item) {
  if (!S.user) return false;
  if (item.author_id) return item.author_id === S.user.id;
  return S.backend === "demo" && item.author && S.profile && item.author === S.profile.username;
}

/* ══════════ realce de sintaxe ══════════ */
var LANGS = {
  js: [[/\/\/[^\n]*|\/\*[\s\S]*?\*\//, "com"], [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/, "str"], [/\b(?:const|let|var|function|return|if|else|for|while|new|class|extends|try|catch|finally|throw|async|await|of|in|typeof|instanceof|switch|case|break|continue|do|delete|void|import|export|from|default|this|super|static)\b/, "kw"], [/\b(?:true|false|null|undefined|NaN|Infinity)\b/, "lit"], [/\b\d+(?:\.\d+)?\b/, "num"], [/[A-Za-z_$][\w$]*(?=\s*\()/, "fn"]],
  forja: [[/\/\/[^\n]*/, "com"], [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, "str"], [/\b(?:var|mostra|se|senao|enquanto|e|ou|nao)\b/, "kw"], [/\b(?:verdadeiro|falso)\b/, "lit"], [/\b\d+(?:\.\d+)?\b/, "num"]],
  html: [[/<!--[\s\S]*?-->/, "com"], [/"[^"]*"|'[^']*'/, "str"], [/<\/?[a-zA-Z][\w-]*|\/?>/, "tag"], [/[a-zA-Z-]+(?==)/, "attr"]],
  css: [[/\/\*[\s\S]*?\*\//, "com"], [/"[^"]*"|'[^']*'/, "str"], [/@[\w-]+/, "kw"], [/[\w-]+(?=\s*:)/, "attr"], [/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|fr|deg)?/, "num"]],
  sql: [[/--[^\n]*/, "com"], [/'(?:''|[^'])*'/, "str"], [/\b(?:CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|DEFAULT|INTEGER|TEXT|REAL|BLOB|UNIQUE|AUTOINCREMENT|INSERT|INTO|VALUES|SELECT|FROM|WHERE|JOIN|LEFT|ON|GROUP|BY|ORDER|LIMIT|UPDATE|SET|DELETE|AND|OR|AS|INDEX|IF|EXISTS|CHECK|CASCADE|BETWEEN|IN|PRAGMA)\b/i, "kw"], [/\b\d+(?:\.\d+)?\b/, "num"]],
  bash: [[/#[^\n]*/, "com"], [/"[^"]*"|'[^']*'/, "str"], [/\b(?:pkg|npm|node|python|git|cd|termux-setup-storage|cp|mkdir)\b/, "kw"]],
  txt: [[/$^/, "com"]]
};
function highlight(code, lang) {
  var specs = LANGS[lang] || LANGS.js;
  var flags = "g" + (specs.some(function (s) { return s[0].flags.indexOf("i") >= 0; }) ? "i" : "");
  var re;
  try { re = new RegExp(specs.map(function (s) { return "(" + s[0].source + ")"; }).join("|"), flags); }
  catch (e) { return esc(code); }
  var out = "", last = 0, m, guard = 0;
  while ((m = re.exec(code)) && guard++ < 20000) {
    out += esc(code.slice(last, m.index));
    var cls = "";
    for (var g = 1; g < m.length; g++) if (m[g] !== undefined) { cls = specs[g - 1][1]; break; }
    out += '<span class="tk-' + cls + '">' + esc(m[0]) + "</span>";
    last = m.index + m[0].length;
    if (m[0] === "") re.lastIndex++;
  }
  return out + esc(code.slice(last));
}

/* ══════════ média (vídeo / código / projeto) ══════════ */
function mediaHTML(p, full) {
  if (p.kind === "code") {
    var code = p.code || "";
    var shown = full ? code : code.split("\n").slice(0, 6).join("\n");
    return full
      ? "<pre><code>" + highlight(shown, p.language || "js") + "</code></pre>"
      : '<div class="post-media"><pre>' + highlight(shown, p.language || "js") + "</pre></div>";
  }
  if (p.kind === "video") {
    var src = videoSrc(p);
    if (!full) return '<div class="post-media"><span class="play">▶</span></div>';
    if (!src) return '<div class="post-media"><span class="play">▶</span></div>';
    var yt = src.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    var vm = src.match(/vimeo\.com\/(\d+)/);
    if (yt) return '<div class="video-box"><iframe src="https://www.youtube.com/embed/' + yt[1] + '" title="' + esc(p.title) + '" allow="accelerometer;clipboard-write;encrypted-media;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    if (vm) return '<div class="video-box"><iframe src="https://player.vimeo.com/video/' + vm[1] + '" title="' + esc(p.title) + '" allowfullscreen loading="lazy"></iframe></div>';
    return '<div class="video-box"><video controls preload="metadata" src="' + esc(src) + '"></video></div>';
  }
  return '<div class="post-media project"><span>PROJETO</span></div>';
}
function openDrawer(p) {
  if (!p) return;
  drawerPost = p;
  $("#dKind").textContent = KIND[p.kind] || p.kind;
  $("#dKind").className = "badge " + p.kind;
  $("#dTitle").textContent = p.title;
  var mine = isMine(p);
  var body = $("#dBody");
  body.innerHTML =
    '<p class="drawer-meta">@' + esc(authorOf(p)) + " · " + fmtDate(p.created_at || p.created) + " · ♥ " + (p.like_count || 0) + "</p>" +
    '<p class="summary">' + esc(p.summary) + "</p>" +
    mediaHTML(p, true) +
    '<div class="drawer-actions">' +
      (safeUrl(p.repo_url) ? '<a class="btn-ghost btn-sm" href="' + esc(safeUrl(p.repo_url)) + '" target="_blank" rel="noopener">Repositório ↗</a>' : "") +
      (safeUrl(p.demo_url) ? '<a class="btn-ghost btn-sm" href="' + esc(safeUrl(p.demo_url)) + '" target="_blank" rel="noopener">Demo ↗</a>' : "") +
      (p.kind === "code" ? '<button class="btn-ghost btn-sm" data-copy>Copiar código</button><button class="btn-ghost btn-sm" data-dl>↓ Descarregar</button><button class="btn btn-cool btn-sm" data-openide>Abrir na IDE</button>' : "") +
      (mine ? '<button class="btn btn-sm" data-edit>Editar</button><button class="btn btn-sm btn-danger" data-del>Apagar</button>' : "") +
    "</div>" +
    '<div class="tags">' + (p.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>";
  var c;
  if ((c = body.querySelector("[data-copy]"))) c.onclick = function () { copyText(p.code || ""); };
  if ((c = body.querySelector("[data-dl]"))) c.onclick = function () {
    var ext = p.language === "forja" ? "forja" : (p.language || "txt");
    download(p.title.replace(/[^\w\-]+/g, "-").toLowerCase() + "." + ext, p.code || "");
  };
  if ((c = body.querySelector("[data-openide]"))) c.onclick = function () {
    var mode = p.language === "html" ? "html" : p.language === "forja" ? "forja" : "js";
    closeDrawer(); setMode(mode); ta().value = p.code || ""; updateEditor();
    document.getElementById("ide").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    toast("Código aberto na IDE");
  };
  if ((c = body.querySelector("[data-edit]"))) c.onclick = function () { closeDrawer(); publisherModal(p); };
  if ((c = body.querySelector("[data-del]"))) c.onclick = function () { closeDrawer(); removePost(p); };
  var dr = $("#drawer"), sc = $("#drawerScrim");
  clearTimeout(drawerTimer);
  dr.hidden = false; sc.hidden = false; document.body.style.overflow = "hidden";
  requestAnimationFrame(function () { requestAnimationFrame(function () { dr.classList.add("show"); sc.classList.add("show"); }); });
  $("#dClose").focus();
}
function closeDrawer() {
  var dr = $("#drawer"), sc = $("#drawerScrim");
  dr.classList.remove("show"); sc.classList.remove("show");
  clearTimeout(drawerTimer);
  drawerTimer = setTimeout(function () { dr.hidden = true; sc.hidden = true; }, 380);
  if ($("#modalRoot").hidden) document.body.style.overflow = "";
}

/* ══════════ feed da comunidade ══════════ */
function filteredPosts() {
  var f = S.filters, q = f.q.toLowerCase();
  var list = S.posts.filter(function (p) {
    if (f.kind && p.kind !== f.kind) return false;
    if (f.tag && (p.tags || []).indexOf(f.tag) < 0) return false;
    if (q && (p.title + " " + p.summary + " " + (p.tags || []).join(" ") + " " + authorOf(p)).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var sorts = {
    new: function (a, b) { return new Date(b.created_at) - new Date(a.created_at); },
    pop: function (a, b) { return (b.like_count || 0) - (a.like_count || 0); },
    title: function (a, b) { return a.title.localeCompare(b.title); },
    manual: function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0) || new Date(b.created_at) - new Date(a.created_at); }
  };
  return list.slice().sort(sorts[f.sort] || sorts.new);
}
function renderFeed() {
  var list = filteredPosts(), feed = $("#feed");
  $("#manualHint").hidden = S.filters.sort !== "manual";
  if (!list.length) {
    feed.innerHTML = '<div class="empty">Nada corresponde a estes filtros. Contas criadas podem publicar o primeiro projeto, código ou vídeo.</div>';
    return;
  }
  feed.innerHTML = list.map(function (p) {
    var mine = isMine(p), draggable = S.filters.sort === "manual" && mine;
    return '<article class="card post-card" data-id="' + esc(p.id) + '"' + (draggable ? ' draggable="true"' : "") + ">" +
      (S.manage && mine ? '<input type="checkbox" class="post-check" data-check="' + esc(p.id) + '"' + (S.selected.has(p.id) ? " checked" : "") + ' aria-label="Selecionar">' : "") +
      '<span class="badge ' + p.kind + '">' + KIND[p.kind] + "</span>" +
      mediaHTML(p, false) +
      "<h3>" + esc(p.title) + "</h3>" +
      '<p class="post-summary">' + esc(p.summary) + "</p>" +
      '<div class="tags">' + (p.tags || []).slice(0, 4).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" +
      '<div class="post-foot">' +
        '<button class="like' + (S.myLikes.has(p.id) ? " liked" : "") + '" data-like="' + esc(p.id) + '">♥ <b>' + (p.like_count || 0) + "</b></button>" +
        '<span class="post-author">@' + esc(authorOf(p)) + "</span>" +
        '<span class="post-actions">' + (mine ? '<button class="icon-btn" data-edit="' + esc(p.id) + '" title="Editar" aria-label="Editar">✎</button><button class="icon-btn del" data-del="' + esc(p.id) + '" title="Apagar" aria-label="Apagar">🗑</button>' : "") + "</span>" +
      "</div></article>";
  }).join("");

  $$("#feed .post-card").forEach(function (card) {
    var id = card.dataset.id;
    card.addEventListener("click", function (e) {
      if (e.target.closest("button,input,a")) return;
      openDrawer(S.posts.filter(function (p) { return p.id === id; })[0]);
    });
    card.addEventListener("dragstart", function (e) {
      if (S.filters.sort !== "manual" || !card.hasAttribute("draggable")) { e.preventDefault(); return; }
      card.classList.add("dragging");
      try { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; } catch (err) {}
    });
    card.addEventListener("dragend", function () { card.classList.remove("dragging"); });
    card.addEventListener("dragover", function (e) {
      if (S.filters.sort !== "manual" || !card.hasAttribute("draggable")) return;
      e.preventDefault(); card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", function () { card.classList.remove("drag-over"); });
    card.addEventListener("drop", function (e) {
      e.preventDefault(); card.classList.remove("drag-over");
      var from; try { from = e.dataTransfer.getData("text/plain"); } catch (err) { from = ""; }
      if (!from || from === id || !card.hasAttribute("draggable")) return;
      var visible = filteredPosts().map(function (p) { return p.id; });
      var a = visible.indexOf(from), b = visible.indexOf(id);
      if (a < 0 || b < 0) return;
      visible.splice(a, 1); visible.splice(b, 0, from);
      var mineIds = visible.filter(function (x) {
        var p = S.posts.filter(function (y) { return y.id === x; })[0];
        return p && isMine(p);
      });
      mineIds.forEach(function (x, i) {
        var p = S.posts.filter(function (y) { return y.id === x; })[0];
        if (p) p.sort_order = i * 10;
      });
      renderFeed();
      reorderPosts(mineIds).then(function () { toast("Ordem guardada"); })
        .catch(function (err) { toast(err.message, { type: "err" }); loadPosts().then(renderFeed); });
    });
  });
  $$("#feed [data-like]").forEach(function (b) {
    b.onclick = function (e) { e.stopPropagation(); likePost(b.dataset.like, b); };
  });
  $$("#feed [data-edit]").forEach(function (b) {
    b.onclick = function (e) { e.stopPropagation(); publisherModal(S.posts.filter(function (p) { return p.id === b.dataset.edit; })[0]); };
  });
  $$("#feed [data-del]").forEach(function (b) {
    b.onclick = function (e) { e.stopPropagation(); removePost(S.posts.filter(function (p) { return p.id === b.dataset.del; })[0]); };
  });
  $$("#feed [data-check]").forEach(function (c) {
    c.onchange = function () {
      if (c.checked) S.selected.add(c.dataset.check); else S.selected.delete(c.dataset.check);
      renderBulk();
    };
    c.onclick = function (e) { e.stopPropagation(); };
  });
}
function likePost(id, btn) {
  if (!S.user) { toast("Cria conta para apoiar com ♥", { type: "info" }); S.pending = null; authModal("register"); return; }
  var p = S.posts.filter(function (x) { return x.id === id; })[0];
  if (!p) return;
  var was = S.myLikes.has(id);
  if (was) { S.myLikes.delete(id); p.like_count = Math.max(0, (p.like_count || 0) - 1); }
  else { S.myLikes.add(id); p.like_count = (p.like_count || 0) + 1; }
  btn.classList.toggle("liked", !was);
  btn.classList.add("pop"); setTimeout(function () { btn.classList.remove("pop"); }, 380);
  btn.querySelector("b").textContent = p.like_count;
  btn.disabled = true;
  toggleLike(id, was).then(function (nowLiked) {
    if (nowLiked) S.myLikes.add(id); else S.myLikes.delete(id);
    var real = S.posts.filter(function (x) { return x.id === id; })[0];
    if (S.backend === "demo" && real) p.like_count = real.like_count;
    btn.classList.toggle("liked", nowLiked);
    btn.querySelector("b").textContent = p.like_count;
    renderStats();
  }).catch(function (e) {
    if (was) { S.myLikes.add(id); p.like_count = (p.like_count || 0) + 1; }
    else { S.myLikes.delete(id); p.like_count = Math.max(0, (p.like_count || 0) - 1); }
    btn.classList.toggle("liked", was); btn.querySelector("b").textContent = p.like_count;
    toast(e.message, { type: "err" });
  }).then(function () { btn.disabled = false; });
}
function removePost(p) {
  if (!p || !isMine(p)) return;
  var i = S.posts.findIndex(function (x) { return x.id === p.id; });
  if (i < 0) return;
  S.posts.splice(i, 1); S.selected.delete(p.id);
  renderFeed(); renderBulk(); renderStats(); renderTags();
  deletePost(p.id).catch(function () {});
  toast("Publicação apagada.", { type: "info", action: { label: "Anular", fn: function () {
    createPost(stripPost(p)).then(function (np) {
      S.posts.splice(Math.min(i, S.posts.length), 0, np);
      renderFeed(); renderStats(); renderTags(); toast("Restaurada");
    }).catch(function (e) {
      S.posts.splice(Math.min(i, S.posts.length), 0, p);
      renderFeed(); renderStats(); renderTags(); toast(e.message, { type: "err" });
    });
  } } });
}
function renderBulk() {
  $("#bulkBar").hidden = !S.manage;
  $("#bulkCount").textContent = S.selected.size + " selecionado" + (S.selected.size === 1 ? "" : "s");
  $("#bulkDelete").disabled = S.selected.size === 0;
  $("#manageBtn").textContent = S.manage ? "A gerir" : "Gerir";
}
function bulkDelete() {
  var ids = Array.from(S.selected);
  var items = ids.map(function (id) { return S.posts.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
  if (!items.length) return;
  S.posts = S.posts.filter(function (p) { return !S.selected.has(p.id); });
  S.selected.clear(); renderBulk(); renderFeed(); renderStats(); renderTags();
  items.reduce(function (chain, p) { return chain.then(function () { return deletePost(p.id).catch(function () {}); }); }, Promise.resolve());
  toast(items.length + (items.length === 1 ? " publicação apagada." : " publicações apagadas."), { type: "info", action: { label: "Anular", fn: function () {
    items.reduce(function (chain, p) {
      return chain.then(function () {
        return createPost(stripPost(p)).then(function (np) { S.posts.push(np); }).catch(function () { S.posts.push(p); });
      });
    }, Promise.resolve()).then(function () { renderFeed(); renderStats(); renderTags(); toast("Restauradas"); });
  } } });
}
function renderTags() {
  var seen = {}, tags = [];
  S.posts.forEach(function (p) { (p.tags || []).forEach(function (t) { if (!seen[t]) { seen[t] = 1; tags.push(t); } }); });
  tags.sort();
  $("#tagFilter").innerHTML = '<option value="">Todas as tags</option>' + tags.map(function (t) {
    return "<option" + (S.filters.tag === t ? " selected" : "") + ">" + esc(t) + "</option>";
  }).join("");
}
function renderViews() {
  var html = '<option value="">Vistas guardadas…</option>' + S.views.map(function (v) {
    return '<option value="' + esc(v.id) + '">' + esc(v.name) + "</option>";
  }).join("");
  if (S.views.length) html += '<option value="__del">− Apagar a vista selecionada</option>';
  $("#views").innerHTML = html;
}
function saveViewModal() {
  openModal(
    '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>Guardar vista</h3>' +
    '<p class="modal-sub">Guarda os filtros atuais: ' + esc(S.filters.kind ? KIND[S.filters.kind] : "tudo") + " · " + esc(S.filters.tag || "todas as tags") + " · " + esc($("#sort").options[$("#sort").selectedIndex].text) + "</p>" +
    '<form data-f novalidate><label class="fld"><span>Nome da vista</span><input data-n maxlength="40" placeholder="ex.: código de escolas"></label>' +
    '<p class="form-err" data-e hidden></p><button class="btn btn-block" type="submit">Guardar vista</button></form>',
    function (root) {
      root.querySelector("[data-x]").onclick = closeModal;
      root.querySelector("[data-f]").onsubmit = function (e) {
        e.preventDefault();
        var name = root.querySelector("[data-n]").value.trim();
        var errEl = root.querySelector("[data-e]");
        if (name.length < 2) { errEl.textContent = "Nome demasiado curto."; errEl.hidden = false; return; }
        saveView(name).then(function () { renderViews(); closeModal(); toast("Vista guardada"); })
          .catch(function (err) { errEl.textContent = err.message; errEl.hidden = false; });
      };
    }
  );
}

/* ══════════ publicador ══════════ */
function publisherModal(edit, prefill) {
  requireAuth(function () {
    var kind0 = (edit && edit.kind) || (prefill && prefill.kind) || "project";
    openModal(
      '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>' + (edit ? "Editar publicação" : "Publicar na comunidade") + "</h3>" +
      '<p class="modal-sub">Publicas como @' + esc(S.profile ? S.profile.username : "dev") + '. Só tu podes editar ou apagar isto.</p>' +
      '<div class="seg"><button class="seg-btn" data-k="project">Projeto</button><button class="seg-btn" data-k="code">Código</button><button class="seg-btn" data-k="video">Vídeo</button></div>' +
      '<form data-f novalidate>' +
        '<label class="fld"><span>Título</span><input data-title maxlength="120" value="' + esc(edit ? edit.title : "") + '"></label>' +
        '<label class="fld"><span>Resumo</span><textarea data-summary maxlength="800">' + esc(edit ? edit.summary : "") + "</textarea></label>" +
        '<label class="fld"><span>Tags (separadas por vírgulas)</span><input data-tags maxlength="160" value="' + esc(edit ? (edit.tags || []).join(", ") : "") + '" placeholder="ex.: Escolas, JavaScript"></label>' +
        '<div data-pane="project">' +
          '<label class="fld"><span>Repositório (URL)</span><input data-repo type="url" value="' + esc(edit && edit.repo_url ? edit.repo_url : "") + '" placeholder="https://github.com/…"></label>' +
          '<label class="fld"><span>Demo (URL)</span><input data-demo type="url" value="' + esc(edit && edit.demo_url ? edit.demo_url : "") + '" placeholder="https://…"></label>' +
        "</div>" +
        '<div data-pane="code" hidden>' +
          '<label class="fld"><span>Linguagem</span><select data-lang><option value="js">JavaScript</option><option value="html">HTML</option><option value="css">CSS</option><option value="sql">SQL</option><option value="forja">FORJA·lang</option><option value="bash">Bash</option><option value="txt">Texto</option></select></label>' +
          '<label class="fld"><span>Código</span><textarea data-code class="mono" rows="10">' + esc((edit && edit.code) || (prefill && prefill.code) || "") + "</textarea></label>" +
        "</div>" +
        '<div data-pane="video" hidden>' +
          '<label class="fld"><span>URL do vídeo (YouTube, Vimeo ou MP4)</span><input data-vurl type="url" value="' + esc(edit && edit.video_url ? edit.video_url : "") + '" placeholder="https://…"></label>' +
          '<div class="fld"><span>Ou enviar ficheiro (MP4 / WebM / Ogg)</span><div class="upload-row"><input data-vfile type="file" accept="video/mp4,video/webm,video/ogg"><span data-vname class="drawer-meta">' + (edit && edit.video_path ? "vídeo atual guardado" : "") + "</span></div></div>" +
        "</div>" +
        '<p class="form-err" data-e hidden></p>' +
        '<button class="btn btn-block" data-b type="submit">' + (edit ? "Guardar alterações" : "Publicar") + "</button>" +
      "</form>",
      function (root) {
        var kind = kind0;
        function paintKind() {
          root.querySelectorAll("[data-k]").forEach(function (b) { b.classList.toggle("active", b.dataset.k === kind); });
          root.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== kind; });
        }
        paintKind();
        var langSel = root.querySelector("[data-lang]");
        langSel.value = (edit && edit.language) || (prefill && prefill.language) || "js";
        if (prefill && prefill.language && ["js", "html", "forja"].indexOf(prefill.language) < 0) langSel.value = "txt";
        root.querySelector("[data-x]").onclick = closeModal;
        root.querySelectorAll("[data-k]").forEach(function (b) { b.onclick = function () { kind = b.dataset.k; paintKind(); }; });
        root.querySelector("[data-vfile]").onchange = function (e) {
          var f = e.target.files[0];
          root.querySelector("[data-vname]").textContent = f ? f.name + " · " + (f.size / 1048576).toFixed(1) + " MB" : "";
        };
        root.querySelector("[data-f]").onsubmit = function (e) {
          e.preventDefault();
          var errEl = root.querySelector("[data-e]");
          function err(m) { errEl.textContent = m; errEl.hidden = false; }
          errEl.hidden = true;
          var title = root.querySelector("[data-title]").value.trim();
          var summary = root.querySelector("[data-summary]").value.trim();
          var tags = root.querySelector("[data-tags]").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8);
          if (title.length < 3) return err("Título: pelo menos 3 caracteres.");
          if (summary.length < 10) return err("Resumo: pelo menos 10 caracteres.");
          var payload = { kind: kind, title: title, summary: summary, tags: tags, code: null, language: null, repo_url: null, demo_url: null, video_url: null, video_path: null, sort_order: edit ? (edit.sort_order || 0) : Date.now() % 100000 };
          var btn = root.querySelector("[data-b]");
          function fail(m) { err(m); btn.disabled = false; btn.textContent = edit ? "Guardar alterações" : "Publicar"; }
          function ready() {
            btn.disabled = true; btn.textContent = edit ? "A guardar…" : "A publicar…";
            if (edit) {
              var i = S.posts.findIndex(function (p) { return p.id === edit.id; });
              var old = S.posts[i];
              S.posts[i] = Object.assign({}, old, payload);
              renderFeed(); renderStats(); renderTags(); closeModal();
              updatePost(edit.id, payload).then(function (np) {
                S.posts[i] = np; renderFeed(); renderTags(); toast("Publicação atualizada");
              }).catch(function (e2) {
                S.posts[i] = old; renderFeed(); renderTags(); toast(e2.message, { type: "err" });
              });
            } else {
              var temp = Object.assign({ id: "tmp-" + uid(), author_id: S.user.id, author_name: S.profile ? S.profile.username : "eu", like_count: 0, created_at: Date.now(), updated_at: Date.now(), profiles: S.profile ? { username: S.profile.username } : null }, payload);
              S.posts.unshift(temp); renderFeed(); renderStats(); renderTags(); closeModal();
              createPost(payload).then(function (np) {
                var k = S.posts.findIndex(function (p) { return p.id === temp.id; });
                if (k >= 0) S.posts[k] = np; else S.posts.unshift(np);
                renderFeed(); renderTags(); toast("Publicado na comunidade");
              }).catch(function (e2) {
                S.posts = S.posts.filter(function (p) { return p.id !== temp.id; });
                renderFeed(); renderStats(); renderTags(); toast(e2.message, { type: "err" });
              });
            }
          }
          if (kind === "project") {
            var repo = root.querySelector("[data-repo]").value.trim();
            var demoUrl = root.querySelector("[data-demo]").value.trim();
            if (repo && !/^https?:\/\//.test(repo)) return err("URL do repositório inválido.");
            if (demoUrl && !/^https?:\/\//.test(demoUrl)) return err("URL da demo inválido.");
            payload.repo_url = repo || null; payload.demo_url = demoUrl || null;
            ready();
          } else if (kind === "code") {
            var code = root.querySelector("[data-code]").value;
            if (!code.trim()) return err("Cola o código que queres partilhar.");
            if (code.length > 60000) return err("Código demasiado longo (máx. 60 000 caracteres).");
            payload.code = code; payload.language = langSel.value;
            ready();
          } else {
            var file = root.querySelector("[data-vfile]").files[0];
            var vurl = root.querySelector("[data-vurl]").value.trim();
            if (file) {
              var maxMb = S.backend === "supabase" ? 50 : 8;
              if (file.size > maxMb * 1024 * 1024) return err("Vídeo demasiado grande (máx. " + maxMb + " MB" + (S.backend === "supabase" ? "" : " em modo demo") + ").");
              btn.disabled = true; btn.textContent = "A enviar vídeo…";
              uploadVideo(file, function (m) { btn.textContent = m; }).then(function (r) {
                payload.video_path = r.video_path; payload.video_url = r.video_url; ready();
              }).catch(function (e2) { fail(e2.message); });
            } else if (vurl) {
              if (!/^https?:\/\//.test(vurl)) return err("URL do vídeo inválido.");
              payload.video_url = vurl; ready();
            } else if (edit && edit.video_path) {
              payload.video_path = edit.video_path; ready();
            } else return err("Indica um URL ou envia um ficheiro de vídeo.");
          }
        };
      }
    );
  });
}

/* ══════════ IDE ══════════ */
function ta() { return $("#code"); }
function applyPrefs() {
  var p = S.ide.prefs, w = $("#edWrap");
  w.style.setProperty("--efs", p.font + "px");
  w.style.setProperty("--tabs", p.tabs);
  w.classList.toggle("wrap", p.wrap);
  w.classList.toggle("nums", p.nums);
  $("#ideShell").dataset.etheme = p.theme;
  $("#ideFont").value = p.font; $("#ideFontVal").textContent = p.font;
  $("#ideTabSize").value = p.tabs; $("#ideWrap").checked = p.wrap; $("#ideNums").checked = p.nums;
  $("#ideTheme").value = p.theme; $("#ideAuto").checked = p.auto;
  LS.set("forja_prefs", p);
}
var hlQueued = false;
function updateEditor() {
  var code = ta().value;
  S.ide.buffers[S.ide.mode] = code;
  if (!hlQueued) { hlQueued = true; requestAnimationFrame(function () { hlQueued = false; paint(); }); }
  $("#stLines").textContent = code.split("\n").length;
  $("#stChars").textContent = code.length;
}
function paint() {
  var code = ta().value, el = $("#hlCode");
  if (code.length > 20000) el.textContent = code;
  else el.innerHTML = highlight(code, S.ide.mode) + "\n";
  var n = code.split("\n").length, nums = [];
  for (var i = 1; i <= n; i++) nums.push(i);
  $("#gInner").innerHTML = nums.join("<br>");
  syncScroll();
}
function syncScroll() {
  var t = ta(), hl = $("#hl");
  hl.scrollTop = t.scrollTop; hl.scrollLeft = t.scrollLeft;
  $("#gInner").style.transform = "translateY(" + -t.scrollTop + "px)";
}
function setMode(m) {
  S.ide.buffers[S.ide.mode] = ta().value;
  S.ide.mode = m;
  $$("#modeSeg .seg-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.mode === m); });
  ta().value = S.ide.buffers[m] || "";
  $("#ideExample").innerHTML = '<option value="">Exemplos…</option>' + EXAMPLES[m].map(function (e, i) {
    return '<option value="' + i + '">' + esc(e.name) + "</option>";
  }).join("");
  $("#stMode").textContent = m === "forja" ? "FORJA·lang demo" : m === "js" ? "JavaScript" : "HTML · ao vivo";
  $("#outConsole").hidden = m === "html";
  $("#htmlWrap").hidden = m !== "html";
  paint(); updateEditor();
  if (m === "html" && S.ide.prefs.auto) renderFrame();
}
function addLog(type, text) {
  var c = $("#outConsole");
  while (c.children.length >= 300) c.firstChild.remove();
  var d = document.createElement("div");
  d.className = "log log-" + type; d.textContent = text;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function renderFrame() {
  $("#htmlOut").srcdoc = ta().value;
  $("#stTime").textContent = "Pré-visualização atualizada";
}
var autoRun = debounce(function () { if (S.ide.mode === "html" && S.ide.prefs.auto) renderFrame(); }, 600);
function setRunning(on) {
  S.ide.running = on;
  $("#ideRun").disabled = on;
  $("#ideRun").textContent = on ? "… a correr" : "▶ Correr";
}
function runCode() {
  var mode = S.ide.mode, code = ta().value;
  if (S.ide.running) { toast("Ainda a correr…", { type: "info" }); return; }
  if (mode === "html") { renderFrame(); return; }
  var t0 = performance.now();
  if (mode === "forja") {
    addLog("sys", "▶ FORJA·lang demo");
    var r = window.ForjaLang.run(code, function (l) { addLog("log", l); });
    var ms = (performance.now() - t0).toFixed(1);
    if (r.ok) { addLog("sys", "✓ Terminado em " + ms + " ms"); $("#stTime").textContent = "✓ " + ms + " ms"; }
    else { addLog("error", r.error); $("#stTime").textContent = "✗ erro"; }
    return;
  }
  setRunning(true);
  addLog("sys", "▶ JavaScript (isolado, máx. 3 s)");
  var workerSrc = 'self.onmessage=function(e){var fmt=function(v){if(typeof v==="string")return v;if(v instanceof Error)return v.message;try{var s=JSON.stringify(v,null,2);return s===undefined?String(v):s;}catch(x){return String(v);}};var send=function(t,a){postMessage({type:t,args:Array.prototype.map.call(a,fmt)});};var cons={log:function(){send("log",arguments);},info:function(){send("info",arguments);},warn:function(){send("warn",arguments);},error:function(){send("error",arguments);},table:function(v){send("log",[v]);}};var t0=performance.now();var AF=Object.getPrototypeOf(async function(){}).constructor;try{var fn=new AF("console",e.data);Promise.resolve(fn(cons)).then(function(){postMessage({type:"done",ms:performance.now()-t0});}).catch(function(err){postMessage({type:"error",args:[String(err&&err.message||err)]});});}catch(err){postMessage({type:"error",args:[String(err&&err.message||err)]});}};';
  var w = null, url = null;
  try {
    url = URL.createObjectURL(new Blob([workerSrc], { type: "text/javascript" }));
    w = new Worker(url);
  } catch (e) { w = null; }
  if (url) URL.revokeObjectURL(url);
  if (!w) {
    try {
      var logs = [];
      var cons = {
        log: function () { logs.push(["log", arguments]); }, info: function () { logs.push(["info", arguments]); },
        warn: function () { logs.push(["warn", arguments]); }, error: function () { logs.push(["error", arguments]); },
        table: function (v) { logs.push(["log", [v]]); }
      };
      new Function("console", code)(cons);
      logs.forEach(function (pair) {
        addLog(pair[0], Array.prototype.map.call(pair[1], function (x) {
          return typeof x === "string" ? x : JSON.stringify(x, null, 2);
        }).join(" "));
      });
      addLog("sys", "✓ Terminado");
      $("#stTime").textContent = "✓ concluído";
    } catch (err) { addLog("error", String(err.message || err)); $("#stTime").textContent = "✗ erro"; }
    setRunning(false); return;
  }
  activeWorker = w;
  function finish() {
    clearTimeout(timer);
    if (activeWorker) { activeWorker.terminate(); activeWorker = null; }
    setRunning(false);
  }
  var timer = setTimeout(function () {
    addLog("error", "Tempo esgotado (3 s) — possível loop infinito.");
    $("#stTime").textContent = "✗ timeout"; finish();
  }, 3000);
  w.onmessage = function (e) {
    var d = e.data;
    if (d.type === "done") { addLog("sys", "✓ Terminado em " + d.ms.toFixed(1) + " ms"); $("#stTime").textContent = "✓ " + d.ms.toFixed(1) + " ms"; finish(); }
    else if (d.type === "error") { addLog("error", d.args.join(" ")); $("#stTime").textContent = "✗ erro"; finish(); }
    else addLog(d.type, d.args.join(" "));
  };
  w.onerror = function (e) { addLog("error", e.message || "Erro no worker"); $("#stTime").textContent = "✗ erro"; finish(); };
  w.postMessage(code);
}
function insertTab() {
  var t = ta(), s = t.selectionStart, e = t.selectionEnd;
  var sp = new Array(S.ide.prefs.tabs + 1).join(" ");
  t.value = t.value.slice(0, s) + sp + t.value.slice(e);
  t.selectionStart = t.selectionEnd = s + sp.length;
  updateEditor(); autoRun();
}
function renderSnips() {
  var row = $("#snipRow");
  if (!S.snips.length) { row.innerHTML = '<span class="snip-empty">Ainda nada guardado — escreve algo e carrega em «Guardar snippet».</span>'; return; }
  row.innerHTML = S.snips.map(function (s) {
    return '<span class="snip"><button data-load="' + esc(s.id) + '" title="' + esc(s.mode) + '">' + esc(s.name) + '</button><button class="snip-x" data-del="' + esc(s.id) + '" aria-label="Apagar snippet">×</button></span>';
  }).join("");
  $$("#snipRow [data-load]").forEach(function (b) {
    b.onclick = function () {
      var s = S.snips.filter(function (x) { return x.id === b.dataset.load; })[0];
      if (!s) return;
      setMode(s.mode); ta().value = s.code; updateEditor();
      if (s.mode === "html" && S.ide.prefs.auto) renderFrame();
      toast("Snippet «" + s.name + "» carregado");
    };
  });
  $$("#snipRow [data-del]").forEach(function (b) {
    b.onclick = function () {
      var i = S.snips.findIndex(function (x) { return x.id === b.dataset.del; });
      if (i < 0) return;
      var s = S.snips.splice(i, 1)[0];
      LS.set("forja_snips", S.snips); renderSnips();
      toast("Snippet apagado.", { type: "info", action: { label: "Anular", fn: function () {
        S.snips.splice(Math.min(i, S.snips.length), 0, s); LS.set("forja_snips", S.snips); renderSnips();
      } } });
    };
  });
}
function saveSnippetModal() {
  openModal(
    '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>Guardar snippet local</h3>' +
    '<p class="modal-sub">Fica neste dispositivo, sem conta. Para partilhar com todos, usa «Publicar código».</p>' +
    '<form data-f novalidate><label class="fld"><span>Nome</span><input data-n maxlength="60" placeholder="ex.: médias da turma"></label>' +
    '<p class="form-err" data-e hidden></p><button class="btn btn-block" type="submit">Guardar</button></form>',
    function (root) {
      root.querySelector("[data-x]").onclick = closeModal;
      root.querySelector("[data-f]").onsubmit = function (e) {
        e.preventDefault();
        var name = root.querySelector("[data-n]").value.trim();
        if (!name) { var el = root.querySelector("[data-e]"); el.textContent = "Dá um nome ao snippet."; el.hidden = false; return; }
        S.snips.push({ id: uid(), name: name, mode: S.ide.mode, code: ta().value, updated: Date.now() });
        LS.set("forja_snips", S.snips); renderSnips(); closeModal(); toast("Snippet guardado");
      };
    }
  );
}
/* ══════════ biblioteca ══════════ */
var LVL = { iniciante: 0, "intermédio": 1, "avançado": 2 };
function renderBooks() {
  var q = S.lib.q.toLowerCase();
  var list = BOOKS.filter(function (b) {
    if (S.lib.level && b.level !== S.lib.level) return false;
    if (q && (b.title + " " + b.author + " " + b.tags.join(" ") + " " + b.blurb).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var sorts = {
    titulo: function (a, b) { return a.title.localeCompare(b.title); },
    novo: function (a, b) { return b.year - a.year; },
    nivel: function (a, b) { return LVL[a.level] - LVL[b.level]; }
  };
  list = list.slice().sort(sorts[S.lib.sort] || sorts.titulo);
  $("#bookGrid").innerHTML = list.length ? list.map(function (b) {
    return '<article class="card book-card"><div class="cover c' + b.c + '"><span class="c-lvl">' + esc(b.level) + "</span>" +
      "<div><h4>" + esc(b.title) + '</h4><p class="c-author">' + esc(b.author) + "</p></div>" +
      '<span class="c-year">' + b.year + " · " + esc(b.lang) + "</span></div>" +
      '<p class="book-blurb">' + esc(b.blurb) + "</p>" +
      '<div class="tags">' + b.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" +
      (b.url ? '<a class="book-link" href="' + esc(b.url) + '" target="_blank" rel="noopener">Ler grátis ↗</a>' : '<span class="drawer-meta">Referência · edição impressa</span>') +
      "</article>";
  }).join("") : '<div class="empty">Nenhum livro corresponde à procura.</div>';
}
function renderTips() {
  var q = S.lib.q.toLowerCase();
  var list = TIPS.filter(function (t) {
    return !q || (t.title + " " + t.body + " " + t.cat + " " + t.code).toLowerCase().indexOf(q) >= 0;
  });
  $("#tipGrid").innerHTML = list.length ? list.map(function (t) {
    return '<article class="card tip-card"><span class="tip-cat">' + esc(t.cat) + "</span><h3>" + esc(t.title) + "</h3>" +
      '<p class="tip-body">' + esc(t.body) + "</p>" +
      '<div class="tip-code"><button class="tip-copy" data-tip="' + esc(t.id) + '">copiar</button><code>' + highlight(t.code, t.lang) + "</code></div></article>";
  }).join("") : '<div class="empty">Nenhuma dica corresponde à procura.</div>';
  $$("#tipGrid [data-tip]").forEach(function (b) {
    b.onclick = function () {
      var t = TIPS.filter(function (x) { return x.id === b.dataset.tip; })[0];
      if (t) copyText(t.code);
    };
  });
}

/* ══════════ projetos tech ══════════ */
function diffCls(d) { return d === "fácil" ? "facil" : d === "média" ? "media" : "dificil"; }
function renderTechCats() {
  var html = '<button class="chip' + (!S.techFilters.cat ? " active" : "") + '" data-c="">Todas</button>';
  html += TECH_CATS.map(function (c) {
    return '<button class="chip' + (S.techFilters.cat === c ? " active" : "") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>";
  }).join("");
  $("#techCats").innerHTML = html;
  $$("#techCats .chip").forEach(function (b) {
    b.onclick = function () { S.techFilters.cat = b.dataset.c; renderTechCats(); renderTech(); };
  });
}
function renderTech() {
  var f = S.techFilters;
  var list = S.tech.filter(function (t) {
    return (!f.cat || t.cat === f.cat) && (!f.diff || t.diff === f.diff);
  });
  list = list.slice().sort(f.sort === "new"
    ? function (a, b) { return new Date(b.created || b.created_at) - new Date(a.created || a.created_at); }
    : function (a, b) { return (b.likes || 0) - (a.likes || 0); });
  $("#techGrid").innerHTML = list.length ? list.map(function (t) {
    var mine = isMine(t);
    return '<article class="card tech-card"><div class="tech-top"><span class="tip-cat">' + esc(t.cat) + '</span><span class="diff ' + diffCls(t.diff) + '">' + esc(t.diff) + "</span></div>" +
      "<h3>" + esc(t.title) + '</h3><p class="tech-desc">' + esc(t.desc) + "</p>" +
      '<div class="tags">' + (t.stack || []).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" +
      '<div class="tech-foot"><button class="like' + (S.techLikes.has(t.id) ? " liked" : "") + '" data-tlike="' + esc(t.id) + '">♥ <b>' + (t.likes || 0) + "</b></button>" +
      "<span>@" + esc(t.author || "FORJA") + "</span>" +
      (mine ? '<button class="icon-btn del" data-tdel="' + esc(t.id) + '" aria-label="Apagar ideia">🗑</button>' : "") +
      "</div></article>";
  }).join("") : '<div class="empty">Nenhuma ideia nesta categoria — submete a primeira.</div>';
  $$("#techGrid [data-tlike]").forEach(function (b) { b.onclick = function () { likeTech(b.dataset.tlike, b); }; });
  $$("#techGrid [data-tdel]").forEach(function (b) { b.onclick = function () { removeTech(b.dataset.tdel); }; });
}
function likeTech(id, btn) {
  if (!S.user) { toast("Cria conta para apoiar ideias ♥", { type: "info" }); S.pending = null; authModal("register"); return; }
  var t = S.tech.filter(function (x) { return x.id === id; })[0];
  if (!t) return;
  var was = S.techLikes.has(id);
  if (was) { S.techLikes.delete(id); t.likes = Math.max(0, (t.likes || 0) - 1); }
  else { S.techLikes.add(id); t.likes = (t.likes || 0) + 1; }
  btn.classList.toggle("liked", !was); btn.classList.add("pop");
  setTimeout(function () { btn.classList.remove("pop"); }, 380);
  btn.querySelector("b").textContent = t.likes;
  btn.disabled = true;
  toggleTechLike(id, was).then(function (nowLiked) {
    if (nowLiked) S.techLikes.add(id); else S.techLikes.delete(id);
    btn.classList.toggle("liked", nowLiked);
    btn.querySelector("b").textContent = t.likes;
  }).catch(function (e) {
    if (was) { S.techLikes.add(id); t.likes = (t.likes || 0) + 1; }
    else { S.techLikes.delete(id); t.likes = Math.max(0, (t.likes || 0) - 1); }
    btn.classList.toggle("liked", was); btn.querySelector("b").textContent = t.likes;
    toast(e.message, { type: "err" });
  }).then(function () { btn.disabled = false; });
}
function techModal() {
  requireAuth(function () {
    openModal(
      '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>Submeter ideia tech</h3>' +
      '<p class="modal-sub">O que gostavas de construir — ou de ver construído?</p>' +
      '<form data-f novalidate>' +
        '<label class="fld"><span>Título</span><input data-t maxlength="120"></label>' +
        '<label class="fld"><span>Descrição</span><textarea data-d maxlength="1200"></textarea></label>' +
        '<label class="fld"><span>Stack (vírgulas)</span><input data-s maxlength="200" placeholder="ex.: Node, SQLite, PWA"></label>' +
        '<label class="fld"><span>Categoria</span><select data-c>' + TECH_CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + "</select></label>" +
        '<label class="fld"><span>Dificuldade</span><select data-v>' + DIFFS.map(function (d) { return "<option>" + esc(d) + "</option>"; }).join("") + "</select></label>" +
        '<p class="form-err" data-e hidden></p><button class="btn btn-cool btn-block" data-b type="submit">Submeter ideia</button>' +
      "</form>",
      function (root) {
        root.querySelector("[data-x]").onclick = closeModal;
        root.querySelector("[data-f]").onsubmit = function (e) {
          e.preventDefault();
          var title = root.querySelector("[data-t]").value.trim();
          var desc = root.querySelector("[data-d]").value.trim();
          var stack = root.querySelector("[data-s]").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 6);
          var cat = root.querySelector("[data-c]").value, diff = root.querySelector("[data-v]").value;
          var errEl = root.querySelector("[data-e]");
          function err(m) { errEl.textContent = m; errEl.hidden = false; }
          if (title.length < 4) return err("Título demasiado curto.");
          if (desc.length < 20) return err("Descreve a ideia com pelo menos 20 caracteres.");
          if (!stack.length) return err("Indica pelo menos uma tecnologia.");
          var payload = { title: title, desc: desc, stack: stack, cat: cat, diff: diff };
          var btn = root.querySelector("[data-b]"); btn.disabled = true; btn.textContent = "A submeter…";
          var temp = Object.assign({ id: "tmp-" + uid(), likes: 0, author: S.profile.username, author_id: S.user.id, created: Date.now() }, payload);
          S.tech.unshift(temp); renderTech(); closeModal();
          createTech(payload).then(function (nt) {
            var i = S.tech.findIndex(function (x) { return x.id === temp.id; });
            if (i >= 0) S.tech[i] = nt; else S.tech.unshift(nt);
            renderTech(); toast("Ideia submetida");
          }).catch(function (e2) {
            S.tech = S.tech.filter(function (x) { return x.id !== temp.id; });
            renderTech(); toast(e2.message, { type: "err" });
          });
        };
      }
    );
  });
}
function removeTech(id) {
  var i = S.tech.findIndex(function (t) { return t.id === id; });
  if (i < 0) return;
  var t = S.tech[i];
  if (!isMine(t)) return;
  S.tech.splice(i, 1); renderTech();
  deleteTech(id).catch(function () {});
  toast("Ideia apagada.", { type: "info", action: { label: "Anular", fn: function () {
    createTech({ title: t.title, desc: t.desc, stack: t.stack, cat: t.cat, diff: t.diff })
      .then(function (nt) { S.tech.unshift(nt); renderTech(); })
      .catch(function () { S.tech.splice(Math.min(i, S.tech.length), 0, t); renderTech(); });
  } } });
}

/* ══════════ estatísticas / auth / render ══════════ */
function renderStats() {
  var stats = {
    posts: S.posts.length,
    code: S.posts.filter(function (p) { return p.kind === "code"; }).length,
    video: S.posts.filter(function (p) { return p.kind === "video"; }).length,
    books: BOOKS.length
  };
  $$("[data-stat]").forEach(function (el) {
    var v = stats[el.dataset.stat] || 0;
    el.dataset.target = v;
    if (counted) el.textContent = v;
  });
}
function renderAuth() {
  var el = $("#navAuth");
  if (S.user) {
    var name = S.profile ? S.profile.username : (S.user.email || "dev");
    el.innerHTML = '<span class="ava">' + esc(name.charAt(0).toUpperCase()) + '</span><span class="nav-user">' + esc(name) + '</span><button class="link-btn" data-logout>Sair</button>';
    el.querySelector("[data-logout]").onclick = signOut;
  } else {
    el.innerHTML = '<span class="chip-guest">Visitante</span><button class="btn-ghost btn-sm" data-login>Entrar</button>';
    el.querySelector("[data-login]").onclick = function () { authModal("login"); };
  }
}
function renderAll() {
  renderAuth(); renderFeed(); renderTags(); renderViews(); renderBulk();
  renderStats(); renderSnips(); renderBooks(); renderTips(); renderTechCats(); renderTech();
  $("#setupBanner").hidden = S.backend !== "demo";
  $("#stBackend").textContent = S.backend === "supabase" ? "Supabase na nuvem" : "demo local";
  $("#backendBadge").textContent = S.backend === "supabase" ? "Supabase + Pages" : "demo local";
  $("#manageBtn").disabled = !S.user;
  $("#manageBtn").title = S.user ? "Gerir as tuas publicações" : "Entra com a tua conta para gerir";
}
function countUp() {
  if (counted) return; counted = true;
  $$("[data-stat]").forEach(function (el) {
    var target = parseInt(el.dataset.target || "0", 10);
    if (reduced) { el.textContent = target; return; }
    var t0 = performance.now(), dur = 900;
    function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ══════════ ambiente ══════════ */
function startAmbient() {
  if (ambientStarted) return; ambientStarted = true;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) $$("[data-spy]").forEach(function (a) { a.classList.toggle("active", a.dataset.spy === e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["comunidade", "ide", "biblioteca", "tech", "sobre"].forEach(function (id) {
      var el = document.getElementById(id); if (el) spy.observe(el);
    });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(); sio.disconnect(); } });
    }, { threshold: .3 });
    sio.observe($(".stats"));
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
    countUp();
  }
  if (reduced) {
    $("#termBody").innerHTML = '<span class="out">visitante → ler / copiar / assistir\nconta criada → publicar / editar / apagar\ncada um só altera o que é seu</span>';
    return;
  }
  startEmbers(); startTyping(); startParallax();
}
function startParallax() {
  var a = $("#aurora"), queued = false;
  addEventListener("scroll", function () {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; a.style.transform = "translateY(" + (scrollY * .1) + "px)"; });
  }, { passive: true });
}
function startEmbers() {
  var cv = $("#embers");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d"), hero = $("#inicio");
  var DPR = Math.min(devicePixelRatio || 1, 1.5);
  var W = 0, H = 0, parts = [], visible = true, raf = null;
  var COLORS = ["255,176,58", "255,92,56", "255,92,56", "255,176,58", "63,216,255", "255,79,163"];
  function spawn() {
    return { x: Math.random() * W, y: H + Math.random() * H, vy: .25 + Math.random() * .7, vx: (Math.random() - .5) * .3, r: .8 + Math.random() * 2.2, c: COLORS[Math.floor(Math.random() * COLORS.length)], ph: Math.random() * 6.28 };
  }
  function size() {
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = Math.max(1, W * DPR); cv.height = Math.max(1, H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.min(110, Math.floor(W / 9));
    parts = []; for (var i = 0; i < n; i++) parts.push(spawn());
  }
  function tick(t) {
    raf = null;
    if (!visible || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .18;
      if (p.y < -8) { var np = spawn(); np.y = H + 8; parts[i] = np; p = np; }
      var a = .25 + .45 * Math.abs(Math.sin(t / 500 + p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "rgba(" + p.c + "," + a.toFixed(2) + ")"; ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(hero);
  }
  document.addEventListener("visibilitychange", kick);
  addEventListener("resize", debounce(size, 200));
  size(); kick();
}
function startTyping() {
  var body = $("#termBody");
  var demos = [
    { code: 'var nome = "mundo"\nmostra "Olá, " + nome + "!"\nmostra "FORJA a arder em 2026"', out: ["Olá, mundo!", "FORJA a arder em 2026"] },
    { code: 'var t = 3\nenquanto t > 0 {\n  mostra t\n  t = t - 1\n}\nmostra "Publicar!"', out: ["3", "2", "1", "Publicar!"] }
  ];
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var i = 0;
  (function loop() {
    function step() {
      if (document.hidden) return sleep(500).then(step);
      var d = demos[i % demos.length]; i++;
      body.innerHTML = "";
      var cursor = document.createElement("span"); cursor.className = "cursor";
      var lines = d.code.split("\n"), li = 0;
      function typeLine() {
        if (li >= lines.length) {
          cursor.remove();
          var oi = 0;
          function outLine() {
            if (oi >= d.out.length) return sleep(2800).then(step);
            var r = document.createElement("div"); r.className = "out";
            r.textContent = "→ " + d.out[oi]; body.appendChild(r); oi++;
            return sleep(280).then(outLine);
          }
          return outLine();
        }
        var line = lines[li], row = document.createElement("div");
        body.appendChild(row); body.appendChild(cursor);
        var ci = 0;
        function typeChar() {
          if (document.hidden) return sleep(400).then(typeChar);
          if (ci >= line.length) {
            row.innerHTML = highlight(line, "forja") || "&nbsp;";
            li++; return sleep(110).then(typeLine);
          }
          ci++;
          row.textContent = line.slice(0, ci);
          row.appendChild(cursor);
          return sleep(24).then(typeChar);
        }
        return typeChar();
      }
      return typeLine();
    }
    step();
  })();
}

/* ══════════ configurar Supabase ══════════ */
function setupModal() {
  openModal(
    '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>Ligar o Supabase</h3>' +
    '<p class="modal-sub">Corre primeiro o <b>schema.sql</b> no SQL Editor do Supabase. Depois cola aqui o URL e a <b>anon key</b>. A service_role key nunca vai no site.</p>' +
    '<form data-f novalidate>' +
      '<label class="fld"><span>Project URL</span><input data-url type="url" value="' + esc(S.cfg.supabaseUrl || "") + '" placeholder="https://xxxx.supabase.co"></label>' +
      '<label class="fld"><span>anon public key</span><input data-key value="' + esc(S.cfg.supabaseAnonKey || "") + '"></label>' +
      '<p class="form-err" data-e hidden></p>' +
      '<button class="btn btn-block" data-b type="submit">Testar e ligar</button>' +
    "</form>" +
    '<button class="btn-ghost btn-block" data-demo style="margin-top:10px">Continuar em modo demo local</button>' +
    '<p class="modal-note">Em modo demo, tudo funciona neste dispositivo: contas, publicações, vídeos até 8 MB, likes e vistas. Com Supabase, os dados passam a estar disponíveis em qualquer telemóvel.</p>',
    function (root) {
      root.querySelector("[data-x]").onclick = closeModal;
      root.querySelector("[data-demo]").onclick = function () {
        LS.del("forja_cfg"); S.cfg = { supabaseUrl: "", supabaseAnonKey: "" };
        closeModal(); toast("A recarregar em modo demo…", { type: "info" });
        setTimeout(function () { location.reload(); }, 600);
      };
      root.querySelector("[data-f]").onsubmit = function (e) {
        e.preventDefault();
        var url = root.querySelector("[data-url]").value.trim().replace(/\/+$/, "");
        var key = root.querySelector("[data-key]").value.trim();
        var errEl = root.querySelector("[data-e]");
        function err(m) { errEl.textContent = m; errEl.hidden = false; }
        if (!/^https:\/\/.+\..+/.test(url)) return err("URL inválido. Deve começar por https://");
        if (key.length < 20) return err("anon key inválida.");
        var btn = root.querySelector("[data-b]");
        btn.disabled = true; btn.textContent = "A testar ligação…";
        loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js")
          .then(function () {
            if (!window.supabase) throw new Error("Biblioteca Supabase indisponível. Verifica a ligação à internet.");
            var c = window.supabase.createClient(url, key);
            return c.from("posts").select("id").limit(1);
          })
          .then(function (r) {
            if (r.error) throw new Error("Ligação feita, mas as tabelas não existem. Corre o schema.sql no SQL Editor.");
            LS.set("forja_cfg", { supabaseUrl: url, supabaseAnonKey: key });
            S.cfg = { supabaseUrl: url, supabaseAnonKey: key };
            closeModal(); toast("Supabase ligado. A recarregar…");
            setTimeout(function () { location.reload(); }, 700);
          })
          .catch(function (e2) { err(e2.message); btn.disabled = false; btn.textContent = "Testar e ligar"; });
      };
    }
  );
}

/* ══════════ bindings ══════════ */
function bindAll() {
  $("#menuBtn").onclick = function () {
    var m = $("#mobileMenu"); m.hidden = !m.hidden;
    $("#menuBtn").setAttribute("aria-expanded", String(!m.hidden));
  };
  $$("#mobileMenu a").forEach(function (a) {
    a.onclick = function () { $("#mobileMenu").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); };
  });
  $("#navPublish").onclick = function () { publisherModal(); };
  $("#heroPublish").onclick = function () { publisherModal(); };
  $("#setupOpen").onclick = setupModal;

  $("#q").oninput = debounce(function (e) { S.filters.q = e.target.value; renderFeed(); }, 150);
  $$("#kindChips .chip").forEach(function (b) {
    b.onclick = function () {
      S.filters.kind = b.dataset.kind;
      $$("#kindChips .chip").forEach(function (x) { x.classList.toggle("active", x === b); });
      renderFeed();
    };
  });
  $("#tagFilter").onchange = function (e) { S.filters.tag = e.target.value; renderFeed(); };
  $("#sort").onchange = function (e) { S.filters.sort = e.target.value; renderFeed(); };
  $("#views").onchange = function (e) {
    var v = e.target.value;
    if (v === "__del") {
      e.target.value = "";
      openModal(
        '<button class="modal-x" data-x aria-label="Fechar">✕</button><h3>Apagar vista</h3><p class="modal-sub">Escolhe a vista a apagar.</p>' +
        '<div class="chips">' + S.views.map(function (x) { return '<button class="chip" data-v="' + esc(x.id) + '">' + esc(x.name) + "</button>"; }).join("") + "</div>",
        function (root) {
          root.querySelector("[data-x]").onclick = closeModal;
          root.querySelectorAll("[data-v]").forEach(function (b) {
            b.onclick = function () {
              deleteView(b.dataset.v).then(function () { renderViews(); closeModal(); toast("Vista apagada."); });
            };
          });
        }
      );
      return;
    }
    var view = S.views.filter(function (x) { return x.id === v; })[0];
    if (!view) return;
    S.filters = Object.assign({}, S.filters, view.filters || {});
    $("#q").value = S.filters.q || "";
    $("#sort").value = S.filters.sort || "new";
    renderTags();
    $("#tagFilter").value = S.filters.tag || "";
    $$("#kindChips .chip").forEach(function (x) { x.classList.toggle("active", x.dataset.kind === (S.filters.kind || "")); });
    renderFeed(); toast("Vista «" + view.name + "» aplicada");
  };
  $("#saveView").onclick = saveViewModal;
  $("#manageBtn").onclick = function () {
    if (!S.user) { authModal("register"); return; }
    S.manage = !S.manage; S.selected.clear(); renderBulk(); renderFeed();
  };
  $("#bulkCancel").onclick = function () { S.manage = false; S.selected.clear(); renderBulk(); renderFeed(); };
  $("#selectAll").onclick = function () {
    S.posts.filter(isMine).forEach(function (p) { S.selected.add(p.id); });
    renderBulk(); renderFeed();
  };
  $("#bulkDelete").onclick = bulkDelete;
  $("#dClose").onclick = closeDrawer;
  $("#drawerScrim").onclick = closeDrawer;

  $$("#libTabs .seg-btn").forEach(function (b) {
    b.onclick = function () {
      S.lib.tab = b.dataset.lib;
      $$("#libTabs .seg-btn").forEach(function (x) { x.classList.toggle("active", x === b); });
      $("#bookGrid").hidden = S.lib.tab !== "books";
      $("#tipGrid").hidden = S.lib.tab !== "tips";
      $("#bookLevel").hidden = S.lib.tab !== "books";
      $("#bookSort").hidden = S.lib.tab !== "books";
    };
  });
  $("#libSearch").oninput = debounce(function (e) { S.lib.q = e.target.value; renderBooks(); renderTips(); }, 150);
  $("#bookLevel").onchange = function (e) { S.lib.level = e.target.value; renderBooks(); };
  $("#bookSort").onchange = function (e) { S.lib.sort = e.target.value; renderBooks(); };

  $("#techDiff").onchange = function (e) { S.techFilters.diff = e.target.value; renderTech(); };
  $("#techSort").onchange = function (e) { S.techFilters.sort = e.target.value; renderTech(); };
  $("#techNew").onclick = techModal;

  ["forja", "js", "html"].forEach(function (m) { S.ide.buffers[m] = EXAMPLES[m][0].code; });
  applyPrefs();
  $$("#modeSeg .seg-btn").forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });
  $("#ideExample").onchange = function (e) {
    var i = e.target.value; if (i === "") return;
    ta().value = EXAMPLES[S.ide.mode][+i].code; updateEditor(); autoRun();
    e.target.value = ""; toast("Exemplo carregado");
  };
  $("#ideRun").onclick = runCode;
  $("#ideSave").onclick = saveSnippetModal;
  $("#idePublish").onclick = function () { publisherModal(null, { kind: "code", code: ta().value, language: S.ide.mode }); };
  $("#ideDl").onclick = function () { download("codigo." + (S.ide.mode === "forja" ? "forja" : S.ide.mode), ta().value); };
  $("#ideTabBtn").onclick = function () { insertTab(); ta().focus(); };
  $("#ideClear").onclick = function () { $("#outConsole").innerHTML = ""; $("#stTime").textContent = "Saída limpa"; };
  $("#ideFont").oninput = function (e) { S.ide.prefs.font = +e.target.value; applyPrefs(); };
  $("#ideTabSize").onchange = function (e) { S.ide.prefs.tabs = +e.target.value; applyPrefs(); };
  $("#ideWrap").onchange = function (e) { S.ide.prefs.wrap = e.target.checked; applyPrefs(); paint(); };
  $("#ideNums").onchange = function (e) { S.ide.prefs.nums = e.target.checked; applyPrefs(); };
  $("#ideTheme").onchange = function (e) { S.ide.prefs.theme = e.target.value; applyPrefs(); };
  $("#ideAuto").onchange = function (e) {
    S.ide.prefs.auto = e.target.checked; applyPrefs();
    if (S.ide.mode === "html" && e.target.checked) renderFrame();
  };
  var t = ta();
  t.addEventListener("input", function () { updateEditor(); autoRun(); });
  t.addEventListener("scroll", syncScroll, { passive: true });
  t.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); return; }
    if (e.key === "Tab") { e.preventDefault(); insertTab(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      var s = t.selectionStart, before = t.value.slice(0, s);
      var line = before.slice(before.lastIndexOf("\n") + 1);
      var indent = (line.match(/^\s*/) || [""])[0];
      if (/\{\s*$/.test(line)) indent += new Array(S.ide.prefs.tabs + 1).join(" ");
      var ins = "\n" + indent;
      t.value = before + ins + t.value.slice(t.selectionEnd);
      t.selectionStart = t.selectionEnd = s + ins.length;
      updateEditor(); autoRun();
    }
  });
  setMode("forja");

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!$("#modalRoot").hidden) closeModal();
    else if ($("#drawer").classList.contains("show")) closeDrawer();
    else if (!$("#mobileMenu").hidden) { $("#mobileMenu").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }
  });
  addEventListener("beforeunload", function () { if (activeWorker) activeWorker.terminate(); });
}

/* ══════════ arranque ══════════ */
function boot() {
  bindAll();
  renderBooks(); renderTips(); renderTechCats();
  initBackend()
    .then(loadAll)
    .then(function () { renderAll(); startAmbient(); })
    .catch(function (e) {
      S.backend = "demo"; demo = demoStore(); restoreDemoSession();
      return loadAll().then(function () { renderAll(); startAmbient(); toast("A correr em modo demo local.", { type: "info" }); });
    });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
