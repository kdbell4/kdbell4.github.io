<script setup>
import { ref } from 'vue';

const views = [
  { label: 'Layout', src: '/ppg-vitals-monitor/assets/pcb-schematic.png', width: 866, height: 484, alt: 'KiCad layout view showing front copper in red, back copper in blue and the ground pour' },
  { label: 'Render', src: '/ppg-vitals-monitor/assets/pcb-3d.webp', width: 1200, height: 735, alt: '3D render of the PCB from KiCad' },
  { label: 'Built', src: '/ppg-vitals-monitor/assets/build-front.webp', width: 1200, height: 860, alt: 'Photo of the fabricated and hand-soldered PCB with the Teensy 4.0, two op-amps and through-hole passives' },
  { label: 'Back', src: '/ppg-vitals-monitor/assets/build-back.webp', width: 1200, height: 860, alt: 'Photo of the back of the PCB showing the photodiode D1 and solder joints' },
];
const selected = ref(0);

function onKeydown(event, index) {
  const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
  if (!delta) return;
  event.preventDefault();
  selected.value = (index + delta + views.length) % views.length;
  event.currentTarget.parentElement.children[selected.value].focus();
}
</script>

<template>
  <div class="board-tabs">
    <div class="tabs" role="tablist" aria-label="Board views">
      <button v-for="(view, index) in views" :key="view.label" type="button" role="tab"
        :id="`tab-${index}`" :aria-selected="selected === index" :aria-controls="'board-panel'"
        :tabindex="selected === index ? 0 : -1" @click="selected = index" @keydown="onKeydown($event, index)">
        {{ view.label }}
      </button>
    </div>
    <div id="board-panel" class="board" role="tabpanel" :aria-labelledby="`tab-${selected}`">
      <img :src="views[selected].src" :alt="views[selected].alt" :width="views[selected].width" :height="views[selected].height" />
    </div>
    <p class="caption"><a :href="views[selected].src">Open full-size {{ views[selected].label.toLowerCase() }} image</a></p>
  </div>
</template>

<style scoped>
.board-tabs { display: grid; gap: 10px; min-width: 0; }
.caption { margin-top: 0; }
</style>
