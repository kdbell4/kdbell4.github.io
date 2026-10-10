export const projects = [
  {
    title: 'PPG Vitals Monitor', href: '/ppg-vitals-monitor/',
    image: '/ppg-vitals-monitor/assets/enclosure-board.webp',
    imageAlt: 'Assembled PPG sensor board in its 3D printed enclosure',
    description: 'A finger-clip pulse sensor built around a photodiode, analog signal chain, Teensy 4.0, and custom 3D printed enclosure.',
    meta: '2026 · In progress', tags: ['Analog design', 'KiCad', 'FreeCAD', 'C++'],
    github: 'kdbell4/PPG-Vitals-Monitor',
  },
  {
    title: 'Hazard Detector', href: '/hazard-detector/',
    image: '/hazard-detector/assets/poster.jpg',
    imageAlt: 'Night bike path with the road surface outlined by MobileSAM',
    description: 'Real-time hazard detection for e-scooters. I built MobileSAM road segmentation so alerts fire for objects in the rider’s path.',
    meta: 'Spring 2026 · IEEE team project', tags: ['Computer vision', 'YOLOv8', 'MobileSAM', 'OpenCV'],
    github: 'kdbell4/hazard-detector',
  },
];
