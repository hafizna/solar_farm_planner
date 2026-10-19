# Programme-led DPT screening — engineering hypothesis (October 2026)

## Why the entry point changed

The programme may define total MWp/MWac commitments before individual land parcels are selected. The application therefore starts from **capacity target and pilot geography**, then screens prospective land for **purchase or lease through DPT**, physical suitability, and 70/150 kV connection alternatives.

This is a product hypothesis, not an assertion that every project in the government's 100 GWp programme lacks a defined site.

## What changed in the PoC

- Added Program & Penjajakan DPT to the Beranda and left navigation.
- Input commitment capacity as MWp or MWac; show the corresponding DC/AC quantity and gross-area requirement.
- Evaluate each existing GIS pilot raster patch using regional NASA POWER GHI, DEM slope, mapped-road proximity, and eligible GI 70/150 kV route.
- Accept optional per-patch price under Beli (million Rp/ha) or Sewa (million Rp/ha/year).
- Compare land-only purchase outlay or discounted lease payments; prices are blank until supplied, except for an explicitly labeled synthetic demonstration example.
- Link to existing four-pilot GIS, SUTT/SKTT alternatives, and DPT mock workflow. No duplicated GIS dataset.
- Save only demo input in local browser storage; export JSON with data provenance disclaimer.
- Add Node unit tests and a Playwright browser test.

## Scope boundaries

Existing four public-data pilots use indicative raster patches (not cadastral polygons, not legal availability, not DPT bids), plus OSM substations/routes, Copernicus DEM, ESA WorldCover, and NASA POWER. Regional GHI does not discriminate yield between neighboring fields. Site/ROW permits, road constructability, land title, actual pricing, DPT status and substation spare hosting capacity all require authorized evidence.

The 100 GWp national commitment is not a quota for an individual 70/150 kV GI. Connection approval, load flow, N-1, fault level, stability and curtailment remain with Perencanaan Sistem/P2B.

For initial comparison only, buy outlay equals indicative gross area times quoted price per ha. Rent present value uses the same gross area times annual price per ha and an annuity factor over the entered term. Both exclude taxes, escalation, land residual value, access roads, ROW, connection bay, SUTT/SKTT construction, EPC, financing and operational costs. Land-only cost ranking is **not** a project-feasibility ranking.

## Public evidence checked

- Ministry of Energy and Mineral Resources, May 29 2026, described the need to accelerate regulations alongside securing land for the 100 GW programme: https://esdm.go.id/en/media-center/news-archives/plts-100-gw-wamen-esdm-kita-lakukan-percepatan
- Bappenas–PLN, September 28 2026, identified land and licensing certainty as implementation challenges: https://www.bappenas.go.id/berita/bappenas-pt-pln-bersinergi-kembangkan-plts-100-gwp-dukung-kemandirian-energi-ZJj2m
- The user's Instagram carousel could not be fetched and was not treated as verified project-site allocation data.

## Next engineering gates

1. Obtain a sample authorized DPT offer file with polygon, lease/buy indicative price, terms, proposed capacity and source documentation.
2. Validate exact parcel ownership, protected-land restrictions, irrigated-agriculture policy and right-of-way feasibility.
3. Match against an authorized GI inventory, and replace illustrative corridor costs with PLN engineering rate cards.
4. Hand off alternative connection points to the owner of formal system studies.
