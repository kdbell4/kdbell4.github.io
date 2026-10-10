# kdbell4.github.io

Kenny Bell's engineering portfolio, built with Astro and an adapted [as-folio](https://github.com/dadangnh/as-folio) theme. The theme's color system, typography, navigation, project cards, and light/dark toggle are used with original project content. The adapted theme code is covered by the [as-folio MIT license](licenses/as-folio-MIT.txt).

## Develop

```sh
pnpm install
pnpm dev
```

`pnpm build` generates the static site in `dist/`. `pnpm build:pages` also copies that output into the repository root, where GitHub Pages serves it. Commit the source and generated files together when publishing.

## Pages

- `/`: about and featured projects
- `/projects/`: project index
- `/ppg-vitals-monitor/`: PPG Vitals Monitor case study
- `/hazard-detector/`: Hazard Detector case study

The two case studies retain their Vue interactions and media under `public/`.
