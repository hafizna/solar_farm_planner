# Data acquisition register (15 October 2026)

Self-reported starting inventory:
- **Partial:** GI list with coordinates and nominal voltage.
- **Unavailable:** SUTT/SUTET route / towers, candidate PLTS polygon, DEM/land cover, roads, transformer MVA, historical loading, bay/circuit information, BUMN/Pemda land rights.
- **Not yet checked:** site GHI/PVOUT.

The PoC supplies *synthetic* GI and site geometry to demonstrate method, not to replace real datasets.

| Data | Priority | Candidate source | PoC fallback | Condition before real use |
| --- | --- | --- | --- | --- |
| GI ID, coordinate, voltage | P0 | Authorized asset export / Peta Risiko; OSM as provisional | SIM-GI synthetic CSV | Verify against asset master |
| Candidate site polygon | P0 | Input; public permitted polygons; project list | SIM-SOLAR GeoJSON or hand draw | Confirm parcel vs drawing |
| GHI | P0 | NASA POWER; Global Solar Atlas | Manual explicit scenario | Check resolution and climatology period |
| SUTT/SUTET alignment and circuit IDs | P1 | Approved transmission GIS; OSM as provisional | Not included | Validate circuits and ROW |
| DEM, terrain slope | P1 | BIG DEMNAS; open DEM | Not included | Datum, tile, data licence |
| Land cover / road accessibility | P1 | ESA WorldCover / OSM / BIG | Not included | Updated dataset and local review |
| Land tenure, zoning, restrictions | P1 | ATR/BPN, BUMN/Pemda, spatial plans | UNKNOWN | Competent-authority confirmation |
| Transformer MVA and timestamped loading | P1 | Authorized PLN data | UNKNOWN | Define measurement hour and asset identity |
| Bay and terminal configuration | P1 | GI/engineering records | UNKNOWN | Validate engineering design |
| Detailed power system studies | P2 | P2B tools | Outside application | Separate study process |

All datasets must have 'source', 'as_of_date' where applicable, 'verification_status', units, and an asset/site identifier. Current app export covers main assumptions and source categories, but is not yet a certified enterprise provenance ledger.

Suggested portals (review access terms independently):
- https://overpass-turbo.eu/
- https://download.geofabrik.de/asia/indonesia.html
- https://power.larc.nasa.gov/
- https://globalsolaratlas.info/
- https://bhumi.atrbpn.go.id/
- https://geoservices.big.go.id/
- https://esa-worldcover.org/

Do not scrape restricted systems, bypass authentication, or automatically equate map availability with permitted engineering use.
