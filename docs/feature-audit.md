# Feature inventory and evidence (demo as of 15 October 2026)

Legend: **Implemented demo** (UI/workflow works on synthetic data), **Scenario-only** (calculation exists but depends on unverifiable assumptions), **Not implemented** (cannot claim availability).

| Capability | State | What works / limitation |
| --- | --- | --- |
| Demo entry / profile | Implemented demo | Client-side form, role label and tab-session; **not authentication, authorization, or security**. |
| Beranda, Land-first/Grid-first shortcuts | Implemented demo | Home guides users to pages. Workflow engine not yet stage-gated. |
| GI national list | Implemented demo | GI 70/150 kV search/filter/province and open on map. GI dataset is synthetic. |
| RUPTL plan table | Implemented demo | RE Base/ARED and type filters from embedded spreadsheet-derived demo data. Verify numbers against source document before use. |
| Basemap options and theme/fonts | Implemented demo | Leaflet local asset; Esri/OSM tile requests require network. Themes persist in browser. |
| Solar candidate points & suitability scoring | Scenario-only | Embedded candidate points and areas; scores use synthetic attributes and adjustable assumptions. |
| SUTT/SKTT corridor raster-style routing | Scenario-only | Grid search with coarse coastline and optional GeoJSON obstacles. **Not field-feasible** without ROW, river crossings, access, full topology, DEM, constraints and survey. |
| Shortlist, verification checklist, DPT mock workflow | Implemented demo | Browser localStorage only. No shared database, access controls, or approval audit trail. |
| CSV/Excel upload | Implemented demo | Lahan and RUPTL data upload; not general import of verified PLN GI or network GIS. |
| Report print/export | Implemented demo | Reports reflect synthetic input and assumptions, not engineering approval. |
| Polygon bidang tanah + net developable area | Not implemented | Sample locations mostly point + area attributes. |
| Access road and construction logistics analysis | Not implemented | No route access, bridge classification, logistics or ROW permitting datasets. |
| Field-verified SUTT/SKTT routing and corridor cost | Not implemented | No validated alignment, crossings, towers, material/civil BOQ, uncertainty or multi-route comparison. |
| Financial feasibility, LCOE/IRR | Not implemented | No CAPEX benchmark or commercial model. |
| Live GIS data ingestion | Not implemented | No production connectors to Peta Risiko, OSM vector network, land parcels, or DEM. |
| Live solar resource in static frontend | Not implemented | NASA POWER is available only as a separate Python experiment in repository root. |
| P2B feasibility / N-1 / stability / curtailment | Intentionally out of scope | Requires authorized P2B tools and validated model. |
| User authentication and shared data management | Not implemented | Demo entry does not protect Vercel deployment or provide organizational user accounts. |

**Do not merge the demo label with engineering feasibility.** The next major technical increment should be actual GIS ingestion, polygon/constraints, audited alignment alternatives, and confidence labels.

## Geographic screening increment

The new **Screening & Koridor** page adds polygon import/drawing, net area after overlapping exclusions, representative-point road distance, user-supplied constraint exposure, three candidate GIs × SUTT/SKTT, selectable alignments, cost ranges only from explicit user benchmarks, external study status import, and JSON/GeoJSON/CSV handoff. This supersedes the polygon-not-implemented row **for this page only**. DEM raster processing, verified GIS acquisition, detailed civil/electrical design, and automatic verification of study approvals remain unimplemented. See [screening-workspace.md](screening-workspace.md).

## Portable / online increment

Beranda now has one primary project workflow. A generated single-file HTML app works without hosting; per-project HTML reports embed their map, evidence and interactions for offline sharing. Optional online adapters fetch NASA climatology, within-parcel DEM slope/WorldCover indicators, OSM road/GI candidates, and BNPB point-hazard indicators. These supersede the earlier blanket "no live ingestion" and "no frontend solar resource" rows for the new screening workspace only. They do not provide verified parcel ownership, corridor-wide DEM, actual GI capacity/bay approval, or production GIS completeness. Availability and CORS vary; see [portable-and-live.md](portable-and-live.md).

## Kupang pre-registration pilot

The shareable map now also contains **Penjajakan & Alokasi**: eight public-raster-derived indicative areas and 16 SUTT/SKTT alternatives toward GI Bolok. No default applicant, receiving capacity, quota or CAPEX is presented as real. Users explicitly supply those inputs or load labeled synthetic scenarios. The pure allocation engine compares whole-project combinations under regional/GI/budget limits, with one allocation per underlying area. HTML reports work offline. See [kupang-portfolio.md](kupang-portfolio.md) and the [source/algorithm register](../data/pilot/kupang/README.md).
