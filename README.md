# kdbell4.github.io

Personal project portfolio built with Astro and Vue 3, hosted at https://kdbell4.github.io.

Astro renders the three pages as static HTML. Vue powers the interactive project demos: the PPG waveform, frequency plot, PCB views, enclosure model, and hazard alert rule tester.

## Local development

```sh
pnpm install
pnpm dev
```

Open the URL printed by Astro. To check the production output:

```sh
pnpm build
pnpm preview
```

## Structure

- `src/pages/`: home and project pages
- `src/components/`: Vue interactive components
- `src/styles/`: page styles
- `public/`: images, video, and demo data copied into the static build

## Publishing

GitHub Pages serves the `main` branch from the repository root. Prepare and commit the static output with the source changes:

```sh
pnpm build:pages
git add -A
git commit -m "Update site"
git push origin main
```

`build:pages` writes the generated HTML and assets to the repository root. Edit files under `src/` and `public/`; the root HTML and `_astro/` directory are build output.
