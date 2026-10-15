# Calculation notes and constraints

**Coordinate reference**: WGS84 geographic latitude/longitude in decimal degrees. Polygon area uses ellipsoidal geodesic area (pyproj.Geod), not an area calculation in degrees.

**Representative location**: a small-area polygon's geometric centroid. For long corridors, very large/multipart sites, and remote parcels, change the anchor point and use real corridor modelling. The prototype enforces an illustrative <500,000 ha upper bound.

**Distances**: WGS84 geodesic from site centroid to each GI coordinate. The top three rows are **ranked by straight-line distance only**. Indicative route length = straight-line distance × route multiplier (default 1.30), not a road or SUTT construction route.

**Capacity**: MWp = polygon gross area (ha) × usable fraction (default 0.70) / assumed hectares per MWp (default 1.80). Neither the fraction nor the density is project verified.

**Annual production**: GWh/year ≈ MWp × 1000 × GHI(kWh/m²/day) × 365 × assumed plane-of-array factor (1.05) × performance ratio (0.80) / 1e6. It is a transparent rough scaling calculation; NOT a calibrated PVOUT estimate. It excludes detailed module/inverter response, angle, shading, soiling profile, degradation, interannual uncertainty, grid curtailment and line losses.

**GHI choices**: explicit manual assumption (default 4.5 kWh/m²/day) or opt-in NASA POWER climatology annual daily GHI parameter ALLSKY_SFC_SW_DWN. Data are treated as climate resource estimates, not measured performance at a parcel. If the online API fails, output is unavailable; no hidden synthetic substitution.

**Electrical interpretation**: nameplate voltage, geographical proximity, and optional transformer loading alone do not imply hosting capacity or available bay. P2B must assess feasibility and allowable injection. Ranking is for selecting investigation candidates, not approving connection.

**Provenance**: SIM-GI and SIM-SOLAR entries are synthetic; any uploaded GI rows are marked user-supplied/unverified even if a CSV claims verified. No loading, transformer MVA or bay fields exist in the current demonstration.
