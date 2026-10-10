<script setup>
import { ref } from 'vue';

const views = [
  { label: 'Built', src: '/ppg-vitals-monitor/assets/build-front.webp', alt: 'Photo of the fabricated and hand-soldered PCB with the Teensy 4.0, two op-amps and through-hole passives' },
  { label: 'Back', src: '/ppg-vitals-monitor/assets/build-back.webp', alt: 'Photo of the back of the PCB showing the photodiode D1 and solder joints' },
  { label: 'Layout', src: '/ppg-vitals-monitor/assets/pcb-schematic.png', alt: 'KiCad layout view showing front copper in red, back copper in blue and the ground pour' },
  { label: 'Render', src: '/ppg-vitals-monitor/assets/pcb-3d.webp', alt: '3D render of the PCB from KiCad' },
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
      <img :src="views[selected].src" :alt="views[selected].alt" width="1200" height="860" />
    </div>
  </div>
</template>

<style scoped>
.board-tabs { display: contents; }
.tabs { grid-column: 1 / -1; }
</style>
