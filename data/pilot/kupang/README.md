# Kupang public-data pilot

This is a **pre-registration geographic and allocation scenario**, not a land inventory, available connection capacity or procurement award.

## What is actual public data

- Study rectangle: 123.48–123.56 E, -10.27–-10.21 N, around Bolok / western Kupang, NTT. It does not cover all Kabupaten Kupang or all nearby GIs.
- One bounded OSM core API map extract, acquired after Overpass returned HTTP 500/502. Raw snapshot: `osm-snapshot.json`, with source URL and timestamp. 14,246 OSM elements; processed into 413 road ways and one tagged substation. No mass province extraction was attempted.
- GI Bolok: [OSM way 716898231](https://www.openstreetmap.org/way/716898231). The tag says 70,000 V. [PLN's July 2020 release](https://web.pln.co.id/cms/media/siaran-pers/2020/07/pln-operasikan-4-infrastruktur-kelistrikan-baru-listrik-pulau-timor-ntt-semakin-andal/) reports SUTT 150 kV Panaf–Bolok and a 60 MVA Bolok transformer. These may refer to different dates/configurations. They require technical reconciliation. **60 MVA was not converted into a PLTS receiving allowance.** The receiving MWac field remains null.
- NASA POWER: climatology at 123.56 E, -10.22 N. Annual mean GHI 5.9189 kWh/m²/day, with the reported climatology period and monthly values saved in `nasa-snapshot.json`. It is a regional resource estimate, not a parcel yield model.
- Copernicus DSM GLO-30: native-resolution elevation sampled from tile S11 E123. Dataset represents the surface including vegetation/buildings, not survey-grade bare earth.
- ESA WorldCover 2021 v200: native 10 m classification from S12 E123. It is historical land cover, not legal zoning, land ownership or present-day availability.

## Derived data and reproducibility

`grid-snapshot.json` preserves native raster sample results and exact source URLs/timestamps. The processing grid is 75 rows × 98 columns at approximately 90 m spacing. Criteria:

1. Center and four offset WorldCover samples all in shrubland (20), grassland (30) or bare/sparse vegetation (60).
2. Maximum native-pixel slope sampled at the center and its four immediate DSM neighbors ≤15°. Slopes use central finite differences and geodetic pixel spacing.
3. Distance to mapped drivable OSM road segments 20–1,500 m. Road class is not construction access permission or load-bearing certification.
4. Avoid sampled buildings and selected residential/industrial/cemetery/landfill/military/aerodrome footprints, buffered 25 m. This does not substitute for authoritative exclusions.
5. Four-neighbor connected components inside deterministic 16×16-cell blocks, at least 20 passing cells. Select the eight largest resulting patches. Thus patches are deliberately split at grid-block boundaries; they are not cadastral parcels and not an exhaustive set of available land.

The eight patches range from about 62.77 to 135.08 ha. `candidates.geojson` contains the polygons and evidence attributes. `pilot.json` is the complete app dataset. `web/assets/pilot-kupang.js` embeds the same snapshot so the portable app can work offline.

Routing uses a Dijkstra search on this grid, with center/corner-sampled WorldCover water/wetland/mangrove/no-data excluded and corner cutting prohibited. Urban/built-up and slope >15° are penalties. SKTT prefers cells within 150 m of mapped roads (weight 0.65), not a mandatory road-alignment rule. Both SUTT and SKTT are penalized for built-up ground; SKTT has larger steep-terrain penalties. Coordinates are simplified only by retaining direction changes. Length is geodesic along the generated path, not a distance multiplier. Rasterization can miss small obstacles; routes are **not** ROW, tower placement, cable trench design or a constructibility study. Road/surface condition, narrow rivers, crossings, soil thermal resistivity, utilities and joint bays remain unresolved.

Normal builds are offline and use the checked-in snapshot. To regenerate derived polygons/routes from saved raster and OSM samples:

```text
cd web
npm run build:pilot
npm run build
```

A fresh raster acquisition requires network access and is explicit: `node scripts/build-kupang-pilot.cjs --refresh`. Context acquisition scripts are one-time tooling and should not be run on every web build. OSM core API bounded extracts must remain small; use licensed extracts/appropriate providers for expansion.

## What remains scenario-only

There are **zero default applicant registrations**. The initial requested MWac per indicative area is a labeled exploratory choice: min(20, floor(60% of its assumed AC area capacity)), not a real proposal. Default physical parameters (65% usable fraction, 1.5 ha/MWp, 1.25 DC/AC and 0.8 PR) are generic assumptions.

No quota, incremental GI receiving MWac, connection CAPEX rate, GI works allowance or procurement bid is asserted as real data. Fields start unknown. Buttons labeled as synthetic examples fill:

- SUTT 2–5 billion Rp/km; SKTT 8–20 billion Rp/km; GI works 5–15 billion Rp/project.
- Regional quota 40 MWac, incremental GI allowance 30 MWac and connection budget 180 billion Rp.

These are illustrative test values, **not vendor quotes, PLN benchmarks, capacity calculations or procurement allocations**. They are preserved with explicit synthetic source labels in every exported scenario.

Connection CAPEX = grid-route km × selected method's rate + per-project GI allowance. This excludes PV plant CAPEX, land/ROW, special crossings, taxes, finance, shared corridors and scope uncertainty. Energy MWh/year = requested MWac × DC/AC × regional GHI × 365 × PR. Capacity must fit assumed usable area. No clipping, dispatch, cable losses, curtailment or P50/P90 is modeled.

Scoring is relative to the selected complete alternatives: lower upper-bound connection cost per MWac, higher MWh per MWac and shorter route distance. Weights are editable. Min–max ties within floating-point tolerance receive 50; equal regional irradiation does not create artificial yield rankings. Missing values are not zero and do not receive a score. This is a connection-investment comparison, not LCOE/IRR or a full investment committee decision.

## Allocation and later registrations

The solver compares combinations rather than taking the first ranked candidate. It respects regional remaining quota, each GI's incremental receiving limit, optional budget using cost upper bounds, allowed-method rules and at most one project/method per underlying area. Whole requests only; no partial project sizing. For the small default set it performs exact branch-and-bound enumeration; a search-node limit is reported as approximate if reached. No shared-corridor discount or electrical interaction model is invented.

Readiness/legal/documents are unknown on indicative patches. Imported registrations use a separate review mode: legal, documents and technical must all be `pass` with references; otherwise they fail eligibility regardless of score. Imported claims remain user-reported/unverified. An optional bid is displayed as information, not used to execute a tender or award a winner.

## Licenses and attribution

OSM elements and OSM-derived road/distance attributes are subject to the [ODbL](https://www.openstreetmap.org/copyright), with © OpenStreetMap contributors attribution. WorldCover is ESA WorldCover 2021 v200, CC BY 4.0. Copernicus DEM attribution: © DLR e.V. 2010–2014 / Airbus Defence and Space GmbH 2014–2018 under ESA mission-specific terms. NASA POWER source/period is retained. External dataset rights remain separate from this repository's MIT code license. Preserve the source manifest and attribution when sharing derived data.
