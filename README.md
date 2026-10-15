# Solar Farm Planner

**Offline-first proof of concept for Georensis: solar-site selection and transmission proximity screening.**

The application helps users explore a polygon candidate, estimate indicative PLTS capacity and annual PV production, and locate the three closest substations in a dataset. It does **not** calculate hosting capacity, N-1 security, dynamic stability, curtailment, power flow, or approve interconnection. Those studies belong to authorized engineering/P2B tools.

> IMPORTANT: The four default substations and sample site polygon are **SYNTHETIC DEMO DATA**. They are not actual PLN assets or registered land parcels. Distances are geographic indicators only.

## Run locally (Python 3.11+)

1. Clone this private repository.
2. Create a virtual environment:
   - Linux/macOS: 'python -m venv .venv && source .venv/bin/activate'
   - Windows PowerShell: 'py -m venv .venv; .venv\Scripts\Activate.ps1'
3. Run 'python -m pip install -r requirements.txt'.
4. Run 'streamlit run app.py'.
5. Open the local address displayed by Streamlit.

No API key, GPU, PLN connection, or network access is needed for the synthetic demo (the map base tiles may require internet). When selecting NASA POWER in the sidebar, an internet connection is required.

## Demonstration workflow

1. Start with 'Demo sintetis (offline)' and 'Polygon demo'.
2. View four clearly labeled **SIM** substations and one synthetic site in the map.
3. Change land-use fraction, ha/MWp, detour factor, performance ratio, and irradiance assumptions.
4. Draw a polygon or rectangle and switch to 'Polygon yang digambar' to analyze it.
5. Optionally upload a substations CSV (minimum columns: 'name,lat,lon'; optional: 'voltage_kv,gi_id,source,verification_status'). Uploaded records remain marked *user-supplied/unverified*.
6. Optionally select 'NASA POWER (online)' for climatology GHI at the site centroid.
7. Export the screening report as JSON with assumptions, sources, and unresolved engineering tasks.

## Folder structure

    app.py                         Streamlit map and screening workflow
    core/
      data.py                      Dataset schema validation and provenance
      spatial.py                   WGS84 geodesic area, GI proximity, screening formulas
    integrations/
      nasa_power.py                Optional public NASA POWER climatology API
    data/
      demo/substations.csv         Synthetic GI points, not PLN
      demo/solar_site.geojson      Synthetic example land polygon
    docs/
      scope.md                     Product boundary and delivery stages
      data_requirements.md         Data acquisition register
      assumptions.md               Formulas, defaults, limitations
      integration_contract.md      Future data handoff to P2B
    tests/                         Unit tests, no network required

## Engineering scope and limitations

- Nearest GI is ranked by geodesic centroid distance. **Nearest is not necessarily technically feasible or cheapest.**
- The route-length multiplier is an assumption and cannot represent roads, ROW, line crossings or a constructible corridor.
- Site-capacity estimation uses geometric area and generic planning density, **not** design or permitting.
- Annual output uses a coarse GHI-to-energy formula, **not** a PV design, bankable P50/P90, power system dispatch model, or connection-point yield.
- Missing loading, transformer MVA, bay availability, ROW, network topology, ownership, land restrictions, and validated solar resource remain **unknown**. No missing value is treated as zero or substituted with actual-looking numbers.
- Do not present synthetic output as a real PLN engineering finding.

## Next development priorities

1. Verify GI coordinates/nominal voltages from a permitted data source.
2. Import public OSM substation/line GeoJSON with explicit completeness checks; no automatic mapping of a tower to a legal connection point.
3. Add verified solar resource and DEM/land-use layers with permissions/provenance.
4. Add optional trafo nameplate, observed loading with timestamps, and bay-availability fields after data authorization.
5. Agree with STI/P2B on identifiers and the handoff contract; do not build a shadow grid simulator.

Read 'docs/' before interpreting the results. This repository is MIT-licensed, but licensing of external datasets is independent of this code license.
