# Product scope — Solar Farm Planner (Georensis concept)

## Objective
Provide rapid site-to-substation screening for potential ground-mounted PLTS: input land geometry, calculate indicative area and capacity, compare nearby GI locations, capture solar resource context, and create a documented shortlist for engineers.

## In scope (PoC)
- User-drawn and synthetic demo polygons.
- Geodesic area and centroid calculation in WGS84.
- User-uploaded GI point list with provenance and nominal voltage when known.
- Top-3 nearest GI by straight-line distance, plus optional indicative detour factor.
- GHI manual scenario or opt-in NASA POWER climatology.
- Simplified energy and capacity scenario; reproducible JSON report.
- Honest missing-data indicators and traceable assumptions.

## Not in scope
- Network load flow, hosting capacity, short-circuit, contingency/N-1, protection coordination, dynamic stability, frequency/voltage performance.
- Dispatch, PPA constraints, annual curtailment, firm capacity / ELCC.
- Land ownership verification, permits, ROW, land acquisition or actual routing.
- Final costing, financial IRR, LCOE, lender-grade yield estimates.
- Certified PLTS connection capacity or technical approval.

## Delivery strategy
- **M0:** Offline-first synthetic geospatial screen (this version).
- **M1:** Authorized/public GI & SUTT geometry plus provenance quality checks.
- **M2:** More land/solar/terrain layers, optional observed GI transformer and bay fields.
- **M3:** Machine-readable P2B study request / result integration; P2B remains the source of truth for network analytics.

## Guiding architecture
Core calculations are deterministic and separate from data providers and the UI. No GPU or model training is required. Unknown operational data is never inferred as observed.
