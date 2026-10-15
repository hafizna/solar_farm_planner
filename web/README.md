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
