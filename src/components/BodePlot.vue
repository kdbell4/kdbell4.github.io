<script setup>
import { onMounted, ref } from 'vue';
const plot = ref(null);
onMounted(() => {
  const svg = plot.value, NS = "http://www.w3.org/2000/svg";
  const R1 = 10e3, C3 = 22e-12, R2 = 330, C1 = 10e-6, C2 = 100e-6, R3 = 5e3, R4 = 2e3, R5 = 100e3, C4 = 22e-12;
  // tiny complex helpers
  const c = (re, im = 0) => ({ re, im });
  const add = (a, b) => c(a.re + b.re, a.im + b.im), mul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const inv = a => div(c(1), a), abs = a => Math.hypot(a.re, a.im);
  function full(f) {
    const s = c(0, 2 * Math.PI * f);
    const Zf1 = inv(add(c(1 / R1), mul(s, c(C3)))), Zf2 = inv(add(c(1 / R5), mul(s, c(C4))));
    const Rp = 1 / (1 / R3 + 1 / R4), Yb = inv(add(inv(mul(s, c(C2))), c(Rp)));
    const H2 = div(c(1 / R2), add(add(c(1 / R2), mul(s, c(C1))), Yb));
    const sC2 = mul(s, c(C2)), H3 = div(sC2, add(sC2, c(1 / R3 + 1 / R4)));
    return abs(mul(mul(mul(Zf1, H2), H3), div(Zf2, c(R4))));
  }
  function ideal(f) {
    const w = 2 * Math.PI * f, lp = 1 / Math.hypot(1, w * R2 * C1), x = w * R3 * C2, hp = x / Math.hypot(1, x);
    return R1 * (R5 / R4) * lp * hp;
  }
  const W = 900, H = 340, L = 64, R = 16, T = 14, B = 44;
  const fmin = 0.05, fmax = 1000, gmin = 1e4, gmax = 1e6;
  const X = f => L + (Math.log10(f) - Math.log10(fmin)) / (Math.log10(fmax) - Math.log10(fmin)) * (W - L - R);
  const Y = g => T + (1 - (Math.log10(g) - Math.log10(gmin)) / (Math.log10(gmax) - Math.log10(gmin))) * (H - T - B);
  const el = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text) e.textContent = text; svg.appendChild(e); return e; };
  el("rect", { x: X(0.5), y: T, width: X(3.5) - X(0.5), height: H - T - B, fill: "var(--ir)", opacity: .12 });
  [0.1, 1, 10, 100, 1000].forEach(f => {
    el("line", { x1: X(f), x2: X(f), y1: T, y2: H - B, stroke: "var(--grid)" });
    el("text", { x: X(f), y: H - B + 20, "text-anchor": "middle", fill: "var(--ink-2)", "font-size": 12, "font-family": "var(--font-mono)" }, f >= 1 ? f + " Hz" : f + "");
  });
  for (let d = 2; d < 10; d++) [0.1, 1, 10, 100].forEach(dec => { const f = d * dec; if (f > fmin && f < fmax) el("line", { x1: X(f), x2: X(f), y1: T, y2: H - B, stroke: "var(--grid)", "stroke-dasharray": "2 4" }); });
  [[1e4, "10k"], [1e5, "100k"], [1e6, "1M"]].forEach(([g, t]) => {
    el("line", { x1: L, x2: W - R, y1: Y(g), y2: Y(g), stroke: "var(--grid)" });
    el("text", { x: L - 10, y: Y(g) + 4, "text-anchor": "end", fill: "var(--ink-2)", "font-size": 12, "font-family": "var(--font-mono)" }, t);
  });
  el("text", { x: 14, y: (T + H - B) / 2, transform: `rotate(-90 14 ${(T + H - B) / 2})`, "text-anchor": "middle", fill: "var(--ink-2)", "font-size": 12, "font-family": "var(--font-mono)" }, "gain, V/A");
  el("text", { x: X(2) - 6, y: T + 16, "text-anchor": "middle", fill: "var(--ir)", "font-size": 11, "font-family": "var(--font-mono)" }, "heart rate");
  const path = fn => { let d = ""; for (let i = 0; i <= 400; i++) { const f = fmin * (fmax / fmin) ** (i / 400), g = Math.max(gmin, Math.min(gmax, fn(f))); d += (i ? "L" : "M") + X(f).toFixed(1) + " " + Y(g).toFixed(1); } return d; };
  el("path", { d: path(ideal), fill: "none", stroke: "var(--ink-2)", "stroke-width": 1.5, "stroke-dasharray": "5 4" });
  el("path", { d: path(full), fill: "none", stroke: "var(--pulse)", "stroke-width": 2.5 });
  // -3 dB markers on the full curve
  let pk = 0, fpk = 1; for (let i = 0; i <= 2000; i++) { const f = 0.01 * 1e8 ** (i / 2000), g = full(f); if (g > pk) { pk = g; fpk = f; } }
  const cut = pk / Math.SQRT2, find = (a, b) => { for (let i = 0; i < 60; i++) { const m = Math.sqrt(a * b); (full(m) < cut) === (full(a) < cut) ? a = m : b = m; } return Math.sqrt(a * b); };
  [find(0.01, fpk), find(fpk, 1e4)].forEach((f, k) => {
    el("circle", { cx: X(f), cy: Y(cut), r: 4, fill: "var(--panel)", stroke: "var(--pulse)", "stroke-width": 2 });
    el("text", { x: X(f) + (k ? 8 : -8), y: Y(cut) + 22, "text-anchor": k ? "start" : "end", fill: "var(--pulse)", "font-size": 12, "font-family": "var(--font-mono)" }, `−3 dB · ${f.toFixed(f < 10 ? 2 : 0)} Hz`);
  });
  el("text", { x: X(fpk), y: Y(pk) - 10, "text-anchor": "middle", fill: "var(--ink)", "font-size": 12, "font-family": "var(--font-mono)" }, `${Math.round(pk / 1000)} kV/A`);
});
</script>

<template>
  <svg ref="plot" viewBox="0 0 900 340" role="img" aria-label="Transimpedance gain versus frequency for the analog front end"></svg>
</template>
