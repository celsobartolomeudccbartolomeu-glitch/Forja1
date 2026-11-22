/* FORJA·lang — interpretador com palavras-chave em português.
   var · mostra · se · senao · enquanto · e · ou · nao · verdadeiro · falso */
(function (g) {
"use strict";
var KW = { var:1, mostra:1, se:1, senao:1, enquanto:1, verdadeiro:1, falso:1, e:1, ou:1, nao:1 };
function err(line, msg) { return new Error("Linha " + line + ": " + msg); }

function tokenize(src) {
  var toks = [], i = 0, line = 1;
  function dig(c) { return c >= "0" && c <= "9"; }
  function alpha(c) { return /[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/.test(c); }
  while (i < src.length) {
    var c = src[i];
    if (c === "\n") { toks.push({ t: "nl", line: line }); line++; i++; continue; }
    if (c === " " || c === "\t" || c === "\r") { i++; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === '"' || c === "'") {
      var q = c, j = i + 1, s = "";
      while (j < src.length && src[j] !== q) {
        if (src[j] === "\n") throw err(line, "String não fechada");
        if (src[j] === "\\" && j + 1 < src.length) { s += src[j + 1]; j += 2; continue; }
        s += src[j]; j++;
      }
      if (j >= src.length) throw err(line, "String não fechada");
      toks.push({ t: "str", v: s, line: line }); i = j + 1; continue;
    }
    if (dig(c)) {
      var k = i; while (k < src.length && (dig(src[k]) || src[k] === ".")) k++;
      var raw = src.slice(i, k), v = Number(raw);
      if (isNaN(v)) throw err(line, "Número inválido: " + raw);
      toks.push({ t: "num", v: v, line: line }); i = k; continue;
    }
    if (alpha(c)) {
      var m = i; while (m < src.length && (alpha(src[m]) || dig(src[m]))) m++;
      var w = src.slice(i, m);
      toks.push(KW[w] ? { t: w, line: line } : { t: "id", v: w, line: line }); i = m; continue;
    }
    var two = src.slice(i, i + 2);
    if (two === "==" || two === "!=" || two === "<=" || two === ">=") { toks.push({ t: two, line: line }); i += 2; continue; }
    if ("+-*/%<>=(){};,".indexOf(c) >= 0) { toks.push({ t: c, line: line }); i++; continue; }
    throw err(line, "Símbolo inesperado: " + c);
  }
  toks.push({ t: "eof", line: line });
  return toks;
}

function parse(toks) {
  var pos = 0;
  function peek() { return toks[pos]; }
  function next() { return toks[pos++]; }
  function at(t) { return peek().t === t; }
  function expect(t, msg) { if (!at(t)) throw err(peek().line, msg || "Esperava '" + t + "'"); return next(); }
  function skip() { while (at("nl") || at(";")) next(); }

  function program() { var b = []; skip(); while (!at("eof")) { b.push(stmt()); skip(); } return b; }
  function block() {
    skip(); expect("{", "Esperava '{'");
    var b = []; skip();
    while (!at("}")) { if (at("eof")) throw err(peek().line, "Falta fechar '}'"); b.push(stmt()); skip(); }
    next(); return b;
  }
  function endStmt() {
    if (at("nl") || at(";") || at("eof") || at("}")) return;
    throw err(peek().line, "Fim de instrução esperado (nova linha ou ';')");
  }
  function stmt() {
    var tk = peek();
    if (at("var")) { next(); var id = expect("id", "Esperava nome de variável"); expect("=", "Esperava '=' depois do nome"); var e = expr(); endStmt(); return { k: "var", name: id.v, e: e, line: tk.line }; }
    if (at("mostra")) { next(); var e2 = expr(); endStmt(); return { k: "mostra", e: e2, line: tk.line }; }
    if (at("se")) {
      next(); var cond = expr(); var th = block(); var el = null;
      var save = pos; skip();
      if (at("senao")) { next(); skip(); el = at("se") ? [stmt()] : block(); } else pos = save;
      return { k: "se", cond: cond, th: th, el: el, line: tk.line };
    }
    if (at("enquanto")) { next(); var c2 = expr(); var b2 = block(); return { k: "enquanto", cond: c2, body: b2, line: tk.line }; }
    if (at("id")) { var id2 = next(); expect("=", "Esperava '=' na atribuição"); var e3 = expr(); endStmt(); return { k: "set", name: id2.v, e: e3, line: tk.line }; }
    throw err(tk.line, "Instrução inesperada" + (tk.v ? " '" + tk.v + "'" : ""));
  }
  function expr() { return ou(); }
  function ou() { var l = e(); while (at("ou")) { next(); l = { k: "bin", op: "ou", l: l, r: e(), line: l.line }; } return l; }
  function e() { var l = eq(); while (at("e")) { next(); l = { k: "bin", op: "e", l: l, r: eq(), line: l.line }; } return l; }
  function eq() { var l = cmp(); while (at("==") || at("!=")) { var op = next().t; l = { k: "bin", op: op, l: l, r: cmp(), line: l.line }; } return l; }
  function cmp() { var l = add(); while (at("<") || at(">") || at("<=") || at(">=")) { var op = next().t; l = { k: "bin", op: op, l: l, r: add(), line: l.line }; } return l; }
  function add() { var l = mul(); while (at("+") || at("-")) { var op = next().t; l = { k: "bin", op: op, l: l, r: mul(), line: l.line }; } return l; }
  function mul() { var l = un(); while (at("*") || at("/") || at("%")) { var op = next().t; l = { k: "bin", op: op, l: l, r: un(), line: l.line }; } return l; }
  function un() { if (at("nao") || at("-")) { var tk = next(); return { k: "un", op: tk.t, e: un(), line: tk.line }; } return prim(); }
  function prim() {
    var tk = peek();
    if (at("num")) { next(); return { k: "lit", v: tk.v, line: tk.line }; }
    if (at("str")) { next(); return { k: "lit", v: tk.v, line: tk.line }; }
    if (at("verdadeiro")) { next(); return { k: "lit", v: true, line: tk.line }; }
    if (at("falso")) { next(); return { k: "lit", v: false, line: tk.line }; }
    if (at("id")) { next(); return { k: "id", name: tk.v, line: tk.line }; }
    if (at("(")) { next(); var ex = expr(); expect(")", "Esperava ')'"); return ex; }
    throw err(tk.line, "Expressão esperada");
  }
  return program();
}

function run(source, print) {
  var out = print || function () {};
  try {
    var ast = parse(tokenize(String(source)));
    var env = {}, steps = 0;
    function tick(line) { if (++steps > 200000) throw err(line, "Limite de passos atingido — possível loop infinito."); }
    function has(n) { return Object.prototype.hasOwnProperty.call(env, n); }
    function truthy(v) { return v !== false && v !== 0 && v !== "" && v != null; }
    function fmt(v) { return typeof v === "string" ? v : typeof v === "boolean" ? (v ? "verdadeiro" : "falso") : String(v); }
    function needNums(l, r, line, op) {
      if (typeof l !== "number" || typeof r !== "number")
        throw err(line, "'" + op + "' precisa de números (recebi " + fmt(l) + " e " + fmt(r) + ")");
    }
    function ev(n) {
      tick(n.line);
      if (n.k === "lit") return n.v;
      if (n.k === "id") { if (!has(n.name)) throw err(n.line, "Variável '" + n.name + "' não definida"); return env[n.name]; }
      if (n.k === "un") {
        var v = ev(n.e);
        if (n.op === "nao") return !truthy(v);
        if (typeof v !== "number") throw err(n.line, "'-' só funciona com números");
        return -v;
      }
      var l = ev(n.l);
      if (n.op === "e") return truthy(l) ? truthy(ev(n.r)) : false;
      if (n.op === "ou") return truthy(l) ? true : truthy(ev(n.r));
      var r = ev(n.r);
      if (n.op === "+") { if (typeof l === "string" || typeof r === "string") return fmt(l) + fmt(r); needNums(l, r, n.line, "+"); return l + r; }
      if (n.op === "==") return l === r;
      if (n.op === "!=") return l !== r;
      needNums(l, r, n.line, n.op);
      if (n.op === "-") return l - r;
      if (n.op === "*") return l * r;
      if (n.op === "/") { if (r === 0) throw err(n.line, "Divisão por zero"); return l / r; }
      if (n.op === "%") { if (r === 0) throw err(n.line, "Módulo por zero"); return l % r; }
      if (n.op === "<") return l < r;
      if (n.op === ">") return l > r;
      if (n.op === "<=") return l <= r;
      if (n.op === ">=") return l >= r;
      throw err(n.line, "Operador desconhecido");
    }
    function exec(list) {
      for (var i = 0; i < list.length; i++) {
        var s = list[i]; tick(s.line);
        if (s.k === "var" || s.k === "set") env[s.name] = ev(s.e);
        else if (s.k === "mostra") out(fmt(ev(s.e)));
        else if (s.k === "se") { if (truthy(ev(s.cond))) exec(s.th); else if (s.el) exec(s.el); }
        else if (s.k === "enquanto") { while (truthy(ev(s.cond))) { exec(s.body); tick(s.line); } }
      }
    }
    exec(ast);
    return { ok: true };
  } catch (e) { return { ok: false, error: e && e.message ? e.message : String(e) }; }
}
g.ForjaLang = { run: run, version: "0.1-demo" };
})(window);
