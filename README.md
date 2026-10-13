# kdbell4.github.io
Access the website here: [kdbell4.github.io](https://kdbell4.github.io)

Kenny Bell's engineering portfolio, built with Astro and an adapted [as-folio](https://github.com/dadangnh/as-folio) theme. The theme's color system, typography, navigation, project cards, and light/dark toggle are used with original project content. The adapted theme code is covered by the [as-folio MIT license](licenses/as-folio-MIT.txt).

## Develop

```sh
pnpm install
pnpm dev
```

`pnpm build` generates the static site in `dist/`. Use `pnpm preview` to preview the build locally.

## Deployment

GitHub Actions builds and publishes `dist/` on every push to `main`, using `.github/workflows/deploy.yml`. Set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. You can also trigger deployment manually from the Actions tab.

Commit the source files and `pnpm-lock.yaml`; `dist/` is ignored by Git. Generated website files do not need to be copied into the repository root.

## Pages

- `/`: about and featured projects
- `/projects/`: project index
- `/ppg-vitals-monitor/`: PPG Vitals Monitor case study
- `/hazard-detector/`: Hazard Detector case study

The two case studies retain their Vue interactions and media under `public/`.
