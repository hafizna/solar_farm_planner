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
