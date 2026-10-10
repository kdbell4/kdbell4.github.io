<script setup>
import { onMounted, ref, watch } from 'vue';

const canvas = ref(null);
const selectedClass = ref('person');
const result = ref({ close: false, path: false, low: false, area: 0, bottom: 0 });
const loadError = ref('');
const thresholds = { person: 0.15, vehicle: 0.22, other: 0.08 };
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const check = (ok, yes, no) => ok ? yes : no;

onMounted(async () => {
  const cv = canvas.value;
  const ctx = cv.getContext('2d');
  let data, image = new Image();
  try {
    const response = await fetch('/hazard-detector/assets/sample.json');
    if (!response.ok) throw new Error('Sample request failed');
    data = await response.json();
    image.src = '/hazard-detector/assets/sample.jpg';
    await image.decode();
  } catch {
    loadError.value = 'Sample frame could not load.';
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.fillText(loadError.value, 20, 40);
    return;
  }

  const W = cv.width = data.w;
  const H = cv.height = data.h;
  const polygon = data.polygon.map(([x, y]) => [x * W, y * H]);
  const person = data.boxes.find(item => item.label === 'person');
  const box = person
    ? { x: person.xyxy[0] * W, y: person.xyxy[1] * H, w: (person.xyxy[2] - person.xyxy[0]) * W, h: (person.xyxy[3] - person.xyxy[1]) * H }
    : { x: W * 0.32, y: H * 0.55, w: W * 0.36, h: H * 0.3 };

  const inside = (px, py) => {
    let contained = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) contained = !contained;
    }
    return contained;
  };
  const evaluate = () => {
    const area = box.w * box.h / (W * H);
    const bx = box.x + box.w / 2;
    const by = box.y + box.h;
    return { area, close: area > thresholds[selectedClass.value], path: inside(bx, by), low: by > H * 0.6, bx, by, bottom: by / H };
  };
  const clamp = () => {
    box.w = Math.min(box.w, W);
    box.h = Math.min(box.h, H);
    box.x = Math.min(Math.max(0, box.x), W - box.w);
    box.y = Math.min(Math.max(0, box.y), H - box.h);
  };

  function draw() {
    const current = evaluate();
    const hazard = current.close && current.path && current.low;
    ctx.drawImage(image, 0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.fillRect(0, H * 0.6, W, H * 0.4);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, H * 0.6); ctx.lineTo(W, H * 0.6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '500 12px ' + css('--font-mono');
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillText('60% line', 8, H * 0.6 - 6);

    ctx.beginPath();
    polygon.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(90,200,120,.26)'; ctx.fill();
    ctx.strokeStyle = 'rgb(110,235,140)'; ctx.lineWidth = 2; ctx.stroke();
    [0.4, 0.5, 0.6].forEach(fraction => {
      ctx.beginPath(); ctx.arc(W * fraction, H - 3, 5, 0, 7);
      ctx.fillStyle = 'rgb(110,235,140)'; ctx.fill();
    });

    const color = hazard ? 'rgb(235,60,60)' : 'rgb(90,200,235)';
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = color;
    ctx.fillRect(box.x + box.w - 14, box.y + box.h - 14, 14, 14);
    ctx.beginPath(); ctx.arc(current.bx, current.by, 6, 0, 7);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    const tag = (hazard ? 'HAZARD ' : '') + (selectedClass.value === 'other' ? 'object' : selectedClass.value);
    ctx.font = '600 13px ' + css('--font-mono');
    const width = ctx.measureText(tag).width;
    ctx.fillStyle = color;
    ctx.fillRect(box.x, Math.max(0, box.y - 22), width + 12, 22);
    ctx.fillStyle = '#fff';
    ctx.fillText(tag, box.x + 6, Math.max(15, box.y - 6));
    result.value = current;
  }

  const point = event => {
    const bounds = cv.getBoundingClientRect();
    return [(event.clientX - bounds.left) * W / bounds.width, (event.clientY - bounds.top) * H / bounds.height];
  };
  let drag = null;
  cv.addEventListener('pointerdown', event => {
    const [x, y] = point(event);
    const nearCorner = Math.abs(x - (box.x + box.w)) < 26 && Math.abs(y - (box.y + box.h)) < 26;
    const inBox = x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h;
    if (nearCorner) drag = { mode: 'size', x, y, b: { ...box } };
    else if (inBox) drag = { mode: 'move', x, y, b: { ...box } };
    else {
      box.x = x - box.w / 2; box.y = y - box.h;
      drag = { mode: 'move', x, y, b: { ...box } };
    }
    cv.setPointerCapture(event.pointerId);
    cv.style.cursor = 'grabbing';
    clamp(); draw();
  });
  cv.addEventListener('pointermove', event => {
    if (!drag) return;
    const [x, y] = point(event), dx = x - drag.x, dy = y - drag.y;
    if (drag.mode === 'move') { box.x = drag.b.x + dx; box.y = drag.b.y + dy; }
    else { box.w = Math.max(24, drag.b.w + dx); box.h = Math.max(24, drag.b.h + dy); }
    clamp(); draw();
  });
  const end = () => { drag = null; cv.style.cursor = 'grab'; };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('keydown', event => {
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = 10;
    if (event.shiftKey) {
      box.w = Math.max(24, box.w + direction[0] * step);
      box.h = Math.max(24, box.h + direction[1] * step);
    } else {
      box.x += direction[0] * step;
      box.y += direction[1] * step;
    }
    clamp(); draw();
  });
  watch(selectedClass, draw);
  draw();
});
</script>

<template>
  <div class="tester">
    <div class="stage-wrap">
      <canvas ref="canvas" id="rule" width="360" height="640" tabindex="0" aria-label="Video frame with the road outline and a draggable detection box. Use arrow keys to move the box, shift plus arrows to resize."></canvas>
    </div>
    <div style="display:grid;gap:14px;min-width:0">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span class="hint">Object class</span>
        <div class="seg" role="group" aria-label="Object class">
          <button v-for="item in [['person', 'person'], ['vehicle', 'vehicle'], ['other', 'pothole, rock…']]" :key="item[0]"
            type="button" :aria-pressed="selectedClass === item[0]" @click="selectedClass = item[0]">{{ item[1] }}</button>
        </div>
      </div>
      <div class="checks">
        <div class="check"><span class="mark" :class="result.close ? 'ok' : 'no'">{{ check(result.close, '✓', '✗') }}</span><div><b>Close enough</b><span class="d">Box covers more of the frame than the class threshold: 15% for people, 22% for vehicles, 8% for ground hazards.</span></div><span class="val">{{ (result.area * 100).toFixed(1) }}% / {{ thresholds[selectedClass] * 100 }}%</span></div>
        <div class="check"><span class="mark" :class="result.path ? 'ok' : 'no'">{{ check(result.path, '✓', '✗') }}</span><div><b>In the path</b><span class="d">The bottom-centre of the box, where the object meets the ground, lands inside the road outline.</span></div><span class="val">{{ check(result.path, 'on road', 'off road') }}</span></div>
        <div class="check"><span class="mark" :class="result.low ? 'ok' : 'no'">{{ check(result.low, '✓', '✗') }}</span><div><b>Low in frame</b><span class="d">The bottom edge is in the lower 40% of the frame, so the object is near the scooter, not down the road.</span></div><span class="val">{{ Math.round(result.bottom * 100) }}% down</span></div>
      </div>
      <div class="verdict">
        <span class="chip" :class="result.close && result.path && result.low ? 'alert' : 'quiet'">{{ result.close && result.path && result.low ? 'Alert' : 'No alert' }}</span>
        <span class="hint">{{ result.close && result.path && result.low ? 'All three checks pass.' : `Ignored: ${[!result.close && 'too small', !result.path && 'off the road', !result.low && 'too far up'].filter(Boolean).join(', ')}.` }}</span>
      </div>
      <span v-if="loadError" class="hint" role="status">{{ loadError }}</span>
    </div>
  </div>
</template>
