# Geographic screening workspace

Open **Screening & Koridor** (or Land-first on Beranda). The original map explorer and Streamlit experiment remain separate.

## Workflow

1. Load the synthetic pilot, import a GeoJSON FeatureCollection, or draw a parcel on the map. Use one Polygon/MultiPolygon site per project.
2. Set project source/date, land utilization, hectares per MWp, and SKTT road preference/buffer. Imported GIS is user-supplied and unverified. Project state stays in memory for this page session; export before closing or refreshing.
3. Compare the three geographically closest eligible GIs, each with SUTT and SKTT. If uploaded GIs exist they replace the demo GI pool for this project. Otherwise synthetic GIs are clearly labeled. GI candidates beyond 80 km require a smaller pilot region / local GI upload.
4. Select a route. Inspect length, share of sampled alignment near uploaded roads, encountered constraint features, and missing information. No automatic technical/economic winner is declared.
5. Optionally enter a source and positive low/high cost per km for either method. The result is a route-length allowance, excluding GI/bay works, special crossings, land, taxes and other project costs.
6. Import externally issued studies as JSON, then export handoff JSON, GeoJSON or CSV. External status is user-reported, not a verified approval.

## GIS input contract

WGS84 [longitude, latitude], within Indonesia. Maximum 3 MB, 500 features and 20,000 vertices. Closed non-self-intersecting polygon rings are required. An invalid import leaves the existing project untouched. The downloadable pilot is a complete synthetic example.

Each feature requires `properties.class`:

| Class | Geometry / meaning |
| --- | --- |
| `site` | One Polygon or MultiPolygon; parcel boundary |
| `gi` | Point; `kv` 70 or 150, optional unique `id`, `name` |
| `road` | LineString / MultiLineString preferred; corridor preference |
| `water` | Water or river geometry; default penalty, not a river-crossing design |
| `protected` | Explicit project exclusion; excluded by default |
| `urban` | Settlement / built-up constraint |
| `steep` | User-provided terrain constraint polygon; **not raster DEM processing** |
| `soil` | User-provided difficult-ground constraint |
| `flood` | User-provided flood constraint |

Optional properties: `source`, `name`, `rule` (`exclude`, `penalty`, `prefer`), `buffer_m` (1–2000 for point/line constraints). `prefer` is supported only for roads. Roads default to preference; protected areas default to exclusion; others default to penalties. A user must confirm whether an actual area is legally excluded. Imported geometry is not an authoritative permitting determination.

Road proximity for SKTT uses the user buffer (25–1000 m). Other point/line constraints use `buffer_m` or a 100 m scenario buffer. Polygon shapes are used as supplied. A road exclusion overrides road preference. Routing penalties are relative scenario weights: urban SUTT 12 / SKTT 1.65, steep 4 / 8, flood or water penalty 3 / 6, difficult soil 4 / 8; road preference SKTT 0.5, 0.78 or 1. They are not prices, engineering limits or universal requirements. Water marked `exclude` is blocked; water marked `penalty` may be crossed and must be reviewed externally.

## Calculations and limits

- Gross area uses Turf geodesic area. Net site uses polygon difference against all exclusions at once, so overlap is deducted once. Developable area = net site × user utilization fraction. Capacity = developable hectares / hectares per MWp. Missing restriction layers mean net area is provisional.
- Geometry overlaps with settlement, slope, soil and flood layers are reported in hectares, with overlaps within a class unioned first. Missing classes remain unknown. Road distance is from a representative point in the net parcel, not an access-road route.
- A representative point on the remaining polygon anchors routing; it is not a confirmed plant substation or GI bay entrance.
- Grid pathfinding uses a bounded 24–84 cell grid per axis and method-specific weights. Coarse coastline is applied only when both anchors fall within it. This is not a verified land/water boundary. Rasterization and midpoint/100–150 m sampling can miss small features. New-workspace routes are also checked against exact exclusion polygons; intersections invalidate an alternative rather than being reported as safe.
- Encounters count distinct constraint features touched in sampling, not independent engineering crossings. A failed search means no route was found within this grid/window, not proven infeasibility.
- Road share is sampled route length within the road buffer. It proves neither constructible cable trench nor rights to use a road corridor. No joint bay, thermal resistivity, underground utility, bridge/load-class or cable ampacity analysis is performed.
- The workspace does not ingest DEM raster, live road/parcel services, or approved network models. Such sources must be obtained/validated separately. All outputs retain provenance and missing-data lists.

## External study JSON

```json
[
  {
    "gi_id": "pilot-a",
    "status": "in_review",
    "reference": "STUDY-001",
    "date": "2026-10-15",
    "notes": "Awaiting authorized grid study"
  }
]
```

GI ID must belong to the current project GI pool. Status: `not_started`, `in_review`, `needs_revision`, `approved`, `rejected`. Reference and valid calendar date are mandatory. An approved user-reported record is not treated as a system-verified interconnection approval.

## Handoff

`georensis-screening-v1` JSON includes original inputs, parcel/net geometry, area/capacity assumptions, cost source/ranges, six route alternatives with GI/source/status, reported studies and unresolved tasks. GeoJSON contains input layers, net parcel and found route lines; JSON is the complete evidence package. CSV is the concise alternative table. Exports do not upload data or create a shared database.

## Local checks

From `web`: `npm ci`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`. Set `PORT` to an unused local port if another app is using 3000. Build bundles Leaflet and Turf locally; only basemap tiles need network.
