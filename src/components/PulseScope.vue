<script setup>
import { onMounted, ref } from 'vue';
const canvas = ref(null);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
onMounted(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = canvas.value, ctx = cv.getContext("2d");
  const FS = 250, SWEEP = 3, BPM = 80, N = FS * SWEEP;
  const beat = t => { // t in [0,1) of one cardiac cycle
    const g = (m, s, a) => a * Math.exp(-((t - m) ** 2) / (2 * s * s));
    return g(0.17, 0.065, 1) + g(0.42, 0.075, 0.42) - g(0.32, 0.025, 0.08) + 0.06 * Math.sin(2 * Math.PI * t);
  };
  const sample = i => beat(((i / FS) * BPM / 60) % 1) + 0.012 * Math.sin(i * 1.7) * Math.sin(i * 0.31);
  let W, H;
  function size() {
    const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1;
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;
    for (let s = 0; s <= SWEEP * 5; s++) { const x = Math.round(s / (SWEEP * 5) * W) + .5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let r = 1; r < 6; r++) { const y = Math.round(r / 6 * H) + .5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const y = v => H * 0.82 - v * H * 0.55;
    ctx.strokeStyle = css("--pulse"); ctx.lineWidth = 2; ctx.lineJoin = "round";
    const gap = 18;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const pos = i, x = pos / N * W;
      const lag = (head - pos + N) % N;
      if (lag < gap && !reduce) { ctx.stroke(); ctx.beginPath(); continue; }
      const idx = pos <= head ? pos + Math.floor(frame / N) * N : pos + (Math.floor(frame / N) - 1) * N;
      const v = sample(idx);
      i === 0 || lag === gap ? ctx.moveTo(x, y(v)) : ctx.lineTo(x, y(v));
    }
    ctx.stroke();
    if (!reduce) { ctx.fillStyle = css("--pulse"); const hx = head / N * W; ctx.beginPath(); ctx.arc(hx, y(sample(frame)), 3.5, 0, 7); ctx.fill(); }
    // annotate the first full beat
    const period = FS * 60 / BPM, b0 = period;
    const label = (t, txt, dy) => {
      const i = b0 + t * period, x = (i % N) / N * W, yy = y(beat(t));
      ctx.fillStyle = css("--ink-2"); ctx.font = "500 11px " + css("--font-mono");
      ctx.beginPath(); ctx.arc(x, yy, 3, 0, 7); ctx.fill();
      ctx.fillText(txt, x + 8, yy + dy);
    };
    label(0.17, "systolic peak", -6); label(0.33, "dicrotic notch", 16);
  }
  let frame = reduce ? N - 1 : 0, head = frame % N, last = performance.now();
  size(); addEventListener("resize", () => { size(); draw(); });
  if (reduce) { draw(); return; }
  (function tick(now) {
    const adv = Math.min(40, Math.round((now - last) / 1000 * FS));
    if (adv > 0) { frame += adv; last = now; head = frame % N; draw(); }
    requestAnimationFrame(tick);
  })(last);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
});
</script>

<template>
  <figure class="scope" style="margin:0">
    <canvas ref="canvas" aria-label="Animated photoplethysmogram trace showing systolic peaks and dicrotic notches"></canvas>
    <div class="readout"><span>CH1 · outf · 250 S/s</span><span><b>80</b> BPM · sweep 3 s</span></div>
  </figure>
</template>
