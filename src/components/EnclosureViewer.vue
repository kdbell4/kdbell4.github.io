<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = ref(null);
const fallback = ref('Loading 3D model…');
const ready = ref(false);
const explode = ref(0.55);
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
let renderer, controls, observer, themeObserver, frame, media;
let meshes = {};
let recolor;

watch(explode, value => {
  for (const mesh of Object.values(meshes)) mesh.position.z = mesh.userData.dir * value * 45;
});

onMounted(async () => {
  let data;
  try {
    const response = await fetch('/ppg-vitals-monitor/assets/parts.json');
    if (!response.ok) throw new Error('Model request failed');
    data = await response.json();
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true });
  } catch {
    fallback.value = 'The enclosure model could not load. The part list below describes each piece.';
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
  camera.up.set(0, 0, 1);
  camera.position.set(-230, -290, 210);
  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 0.75);
  key.position.set(-1, -2, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.3);
  rim.position.set(2, 1, -1);
  scene.add(rim);

  const binary = encoded => Uint8Array.from(atob(encoded), char => char.charCodeAt(0)).buffer;
  const parts = {
    main_body: ['--ink-2', 0],
    enclosure_cover: ['--ir', -1],
    led_holder: ['--pulse', 1.4],
    photodiode_cover: ['--mask', 2.2],
  };
  for (const [name, [token, direction]] of Object.entries(parts)) {
    const part = data[name];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(binary(part.v)), 3));
    geometry.setIndex(new THREE.BufferAttribute(part.i32 ? new Uint32Array(binary(part.i)) : new Uint16Array(binary(part.i)), 1));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: css(token), roughness: 0.7, metalness: 0.05, flatShading: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { token, dir: direction };
    mesh.position.z = direction * explode.value * 45;
    scene.add(mesh);
    meshes[name] = mesh;
  }

  recolor = () => {
    for (const mesh of Object.values(meshes)) mesh.material.color.set(css(mesh.userData.token));
  };
  media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', recolor);
  themeObserver = new MutationObserver(recolor);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const size = () => {
    const bounds = canvas.value.getBoundingClientRect();
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
  };
  observer = new ResizeObserver(size);
  observer.observe(canvas.value);
  size();
  ready.value = true;
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  };
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  themeObserver?.disconnect();
  if (media && recolor) media.removeEventListener('change', recolor);
  controls?.dispose();
  for (const mesh of Object.values(meshes)) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  renderer?.dispose();
});
</script>

<template>
  <div class="viewer">
    <canvas ref="canvas" aria-label="Interactive 3D model of the enclosure parts"></canvas>
    <span class="hint">Drag to orbit · scroll or pinch to zoom</span>
    <div class="ctl">
      <label for="explode">Explode</label>
      <input id="explode" v-model.number="explode" type="range" min="0" max="1" step="0.01" />
    </div>
    <div v-if="!ready" class="fallback">{{ fallback }}</div>
  </div>
</template>
