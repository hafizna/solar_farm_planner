# Georensis Solar — static web frontend

This is the modularized version of the latest reviewed Solar Farm Planner / Georensis PoC HTML. It lives in `web/`, alongside the Python Streamlit PoC in the repository root.

## Run locally (Node.js 18+)

```bash
cd web
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. The one-time `npm install` fetches Leaflet 1.9.4; the preparation script copies Leaflet's CSS, JS, and images locally. After installation, the UI no longer relies on Leaflet CDN availability.

**Basemap tiles remain external.** If OpenStreetMap tiles are blocked, switch to Esri Streets/Light Gray/Satellite or offline outline. Local Leaflet and remote map tiles are two different dependencies.

## Vercel deployment (later)

- Import the **private** GitHub repository `hafizna/solar_farm_planner`.
- Set **Root Directory** to `web`, framework **Other**, build command `npm run build`, output directory `dist`.
- Use private/protected preview deployment while data governance is uncertain.

`npm run build` creates `web/dist`, containing the static HTML, JS, CSS and local Leaflet assets. No Python backend or GPU is required.

## Source structure

- `index.html` — HTML markup.
- `assets/styles.css` — styling, light/dark modes, typography.
- `assets/ui-preferences.js` — theme/font preferences.
- `assets/demo-data.js` — synthetic GI, site and RUPTL dataset.
- `assets/map-model.js` — map and engineering screening logic.
- `assets/pages.js` — navigation, reports, shortlist and workflow.
- `scripts/` — local test server, Leaflet asset preparation and static deployment build.

## Scope and limits

- GI and candidate land inventory are **synthetic demo data**; statuses, loadings, bays and land rights are not verified.
- The current PoC allows PLTS candidate connections only via **70/150 kV GI**, not higher-voltage GITET.
- SUTT/SKTT corridor calculations are preliminary, not field-verified construction designs.
- Hosting capacity, N-1, stability, curtailment and approval remain with P2B.
- Data edits and shortlist status are saved in browser `localStorage`, **not** to a shared database. Vercel deployment alone does not enable collaboration or data synchronization.

Don't upload confidential PLN information or make the application publicly accessible before reviewing dataset licensing, permissions and project governance.

## Screening & Koridor

The Georensis workspace now supports a polygon-based pilot, explicit GIS exclusions/penalties, three GI alternatives with SUTT/SKTT, optional sourced cost ranges, and engineering handoff export. See [screening-workspace.md](../docs/screening-workspace.md) for the input schema, formulas, scenario weights and limitations. The Georensis monogram replaces the hand-drawn PLN mark.

## Portable HTML and online enrichment

Build now also creates [`portable/georensis-solar.html`](portable/georensis-solar.html): a single file that recipients can open without a server. The screening page exports independent offline HTML reports. Online enrichment includes OSM, NASA POWER, Copernicus DEM, WorldCover and InaRISK adapters with per-source failure states; portable mode depends on provider CORS, while local/Vercel mode uses bounded API adapters. See [portable-and-live.md](../docs/portable-and-live.md) for sharing instructions, source limits and actual availability checks. The local development server must be restarted after the new `/api` handlers are added.

## Kupang pilot

The portable login still opens the map. **Pilot Kupang / Penjajakan & Alokasi** adds eight indicative patches from actual WorldCover/DSM/OSM data, NASA GHI, and GI Bolok context; its capacity, cost and quota calculations are explicit scenarios. See [kupang-portfolio.md](../docs/kupang-portfolio.md). To rebuild derived pilot data from the saved acquisition snapshot, run `npm run build:pilot`; ordinary `npm run build` does not fetch data. The shareable artifact remains `portable/georensis-solar.html`.

## Cloud development handoff

Use Node.js 22 and the `web` directory for the current frontend:

```bash
cd web
npm ci
npm run build
npm run dev
```

The development server listens on port 3000. `npm run build` also generates the shareable `web/portable/georensis-solar.html`; generated HTML, dependencies and browser binaries are intentionally ignored by Git. Public pilot snapshots and derived assets are committed, so normal builds do not require GIS acquisition endpoints.

Validation: `npm run test:unit`, then `npx playwright install --with-deps chromium` and `npm run test:e2e`. See [multi-pilot.md](../docs/multi-pilot.md) for four-pilot data coverage and scenario isolation. The root Streamlit application is the earlier prototype; start from `web/` for current work.
