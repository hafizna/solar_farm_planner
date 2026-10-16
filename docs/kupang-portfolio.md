# Penjajakan & Alokasi — Kupang

The portable app still opens **login → map**. Click the **Pilot Kupang** map label (or Penjajakan & Alokasi rail button) to use the public-data pilot. It is separate from the older Screening & Koridor page that remains omitted from the portable edition.

1. **Pilih area:** inspect eight grid-derived indicative patches, filter area/slope/road-cover class/GI distance, and select patches. The map works with embedded vectors offline; satellite tiles are optional online context.
2. **Bandingkan investasi:** adjust assumed usable fraction, ha/MWp, DC/AC, PR and requested MWac. Compare precomputed land-aware SUTT/SKTT routes. Enter cost ranges/source, or explicitly load the synthetic cost example. An allowed-method selector can make SUTT-only or SKTT-only a scenario gate.
3. **Simulasi kuota:** supply a source, remaining regional quota, incremental receiving capacity at GI and optional connection budget; or explicitly load synthetic limits. Run the combination search, then export HTML/JSON/GeoJSON.

The current public-data snapshot uses 413 OSM road ways, GI Bolok, NASA POWER GHI 5.9189 kWh/m²/day, WorldCover 2021 and Copernicus DSM. Eight patches and 16 routes are derived—not registered land. GI voltage/configuration requires reconciliation between the OSM tag and historical PLN release. No actual applicant, quota, receiving capability or connection CAPEX is invented. See [data/pilot/kupang/README.md](../data/pilot/kupang/README.md) for algorithms, licenses, source dates and explicit synthetic example values.

Area capacity: `ha × usable fraction / ha-per-MWp`. Installed MWp: `requested MWac × DC/AC`. Energy is gross indicative PV output; MW export is not energy dispatch or confirmed grid headroom. Relative scores compare connection CAPEX per MW, energy per MW and distance; readiness is not assigned fabricated scores.

The exact small-case allocation engine enforces regional and per-GI MWac limits, conservative connection CAPEX budget and one method/application per area. Unknown limits block the result; explicit zero means exhausted capacity. Missing-cost alternatives are excluded and disclosed. This is a review scenario, not a bidding award, financial feasibility decision or interconnection approval.

Later registrations can be imported as:

```json
{
  "applications": [
    {
      "id": "APP-001",
      "candidateId": "KP-01",
      "requestedMwac": 10,
      "readiness": {"legal": "unknown", "documents": "unknown", "technical": "unknown"},
      "evidence": {},
      "bidRpKwh": null
    }
  ]
}
```

Each `pass` status needs an evidence reference. Any fail/unknown gates out a registration in review mode. User-imported evidence is not authenticated by the app. Repeated applications to the same underlying patch cannot both be allocated. Bid values are displayed, not auction-scored. Actual arbitrary registration polygons, official capacity ingestion and multi-user registration storage remain future work.

`web/portable/georensis-solar.html` embeds the pilot for sharing. `web/portable/contoh-alokasi-kupang.html` is a generated standalone report using real geographic inputs with **synthetic cost/quota/GI receiving assumptions**. Both can be opened without a server. Reports retain source manifests, unknowns, assumptions and complete JSON evidence; they make no network requests.
