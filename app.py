"""Offline-first solar site and transmission proximity screening PoC."""
from __future__ import annotations

import json
from pathlib import Path

import folium
import streamlit as st
from folium.plugins import Draw
from shapely.geometry import mapping
from streamlit_folium import st_folium

from core.data import load_demo_substations, load_uploaded_substations
from core.spatial import (
    area_hectares,
    centroid_latlon,
    estimate_capacity_mwp,
    estimate_generation_gwh,
    nearest_substations,
    parse_site,
)
from integrations.nasa_power import get_annual_daily_ghi

ROOT = Path(__file__).parent
st.set_page_config(page_title="Solar Farm Planner | PoC", layout="wide", page_icon="☀️")

st.title("Solar Farm Planner")
st.caption("Georensis concept PoC · Solar site & transmission connection screening")
st.warning(
    "DEMO / PRE-SCREENING — Titik GI contoh bersifat sintetis, bukan data aset PLN. "
    "Jarak geografis bukan kapasitas interkoneksi. Studi N-1, stabilitas, curtailment, "
    "dan persetujuan penyambungan berada di luar scope aplikasi ini."
)

with st.sidebar:
    st.header("Sumber data GI")
    gi_source = st.radio(
        "Dataset gardu induk",
        ("Demo sintetis (offline)", "Upload CSV"),
    )
    uploaded = st.file_uploader(
        "CSV GI: name, lat, lon (voltage_kv opsional)",
        type=["csv"],
        disabled=gi_source != "Upload CSV",
    )
    st.divider()
    st.header("Asumsi skenario")
    usable_pct = st.slider("Porsi lahan yang dapat dipakai (%)", 30, 95, 70, 5)
    hectares_per_mwp = st.number_input(
        "Kebutuhan lahan (ha/MWp)", min_value=0.5, max_value=5.0, value=1.8, step=0.1
    )
    route_factor = st.slider(
        "Faktor panjang rute indikatif (× jarak lurus)", 1.0, 3.0, 1.3, 0.1
    )
    solar_mode = st.radio("GHI sumber", ("Asumsi manual", "NASA POWER (online)"))
    manual_ghi = st.number_input(
        "Asumsi GHI (kWh/m²/hari)", min_value=0.0, max_value=9.0, value=4.5, step=0.1,
        disabled=solar_mode != "Asumsi manual",
    )
    performance_ratio = st.slider("Performance ratio", 0.50, 0.95, 0.80, 0.01)
    poa_factor = st.slider("Faktor plane-of-array (asumsi)", 0.80, 1.30, 1.05, 0.01)

try:
    if gi_source == "Upload CSV":
        if uploaded is None:
            st.info("Unggah CSV GI untuk mengganti data sintetis. Contoh format ada di data/demo/substations.csv.")
            st.stop()
        stations = load_uploaded_substations(uploaded.getvalue())
        station_provenance = "User-uploaded / belum diverifikasi"
    else:
        stations = load_demo_substations(ROOT / "data/demo/substations.csv")
        station_provenance = "SYNTHETIC_DEMO"
except ValueError as exc:
    st.error(f"Data GI tidak valid: {exc}")
    st.stop()

with (ROOT / "data/demo/solar_site.geojson").open(encoding="utf-8") as handle:
    demo_collection = json.load(handle)
demo_geometry = demo_collection["features"][0]["geometry"]

col_map, col_report = st.columns([1.65, 1.0], gap="large")
with col_map:
    st.subheader("Peta interaktif")
    st.caption("Gambar polygon atau rectangle di peta, lalu pilih 'Polygon yang digambar'.")
    area_mode = st.radio(
        "Area yang dihitung", ("Polygon demo", "Polygon yang digambar"), horizontal=True
    )
    m = folium.Map(location=[-6.62, 107.44], zoom_start=11, tiles="OpenStreetMap")
    folium.GeoJson(
        demo_geometry,
        name="Lokasi demo sintetis",
        style_function=lambda _: {"color": "#bf7b19", "weight": 2, "fillOpacity": 0.10},
    ).add_to(m)
    for station in stations.itertuples(index=False):
        voltage = "unknown" if not station.voltage_kv == station.voltage_kv else f"{station.voltage_kv:g} kV"
        folium.Marker(
            [station.lat, station.lon],
            tooltip=f"{station.name} · {voltage} · {station.verification_status}",
            icon=folium.Icon(color="blue", icon="flash", prefix="fa"),
        ).add_to(m)
    Draw(
        export=False,
        draw_options={
            "polyline": False, "polygon": True, "rectangle": True,
            "circle": False, "circlemarker": False, "marker": False,
        },
    ).add_to(m)
    map_result = st_folium(
        m, height=510, use_container_width=True, key="site_map",
        returned_objects=["last_active_drawing"],
    )
    drawing = (map_result or {}).get("last_active_drawing")
    if drawing:
        try:
            selected_drawn = parse_site(drawing)
            st.session_state["drawn_site"] = mapping(selected_drawn)
        except (ValueError, KeyError, TypeError):
            st.warning("Gambar area berupa polygon atau rectangle (bukan marker/line).")

with col_report:
    st.subheader("Screening lokasi")
    if area_mode == "Polygon yang digambar" and "drawn_site" not in st.session_state:
        st.info("Belum ada polygon gambar. Buat polygon menggunakan toolbar di kiri atas peta.")
        st.stop()
    chosen = st.session_state["drawn_site"] if area_mode == "Polygon yang digambar" else demo_geometry
    try:
        geometry = parse_site(chosen)
        area_ha = area_hectares(geometry)
        if not (0 < area_ha < 500_000):
            raise ValueError("Luas polygon di luar rentang screening PoC (0–500.000 ha).")
    except ValueError as exc:
        st.error(f"Polygon tidak dapat diproses: {exc}")
        st.stop()
    lat, lon = centroid_latlon(geometry)
    capacity = estimate_capacity_mwp(
        area_ha, usable_fraction=usable_pct / 100, hectares_per_mwp=hectares_per_mwp
    )
    nearby = nearest_substations(
        stations, lat, lon, count=min(3, len(stations)), route_factor=route_factor
    )
    st.metric("Luas area", f"{area_ha:,.1f} ha")
    st.metric("Kapasitas PLTS indikatif", f"{capacity:,.1f} MWp")
    st.caption("Kapasitas berdasarkan luas × faktor pemanfaatan ÷ ha/MWp; bukan desain EPC.")

    @st.cache_data(ttl=24 * 3600, show_spinner=False)
    def cached_nasa_ghi(latitude: float, longitude: float) -> float:
        return get_annual_daily_ghi(latitude, longitude)

    ghi = manual_ghi
    ghi_provenance = "ASSUMED_MANUAL"
    if solar_mode == "NASA POWER (online)":
        try:
            ghi = cached_nasa_ghi(round(lat, 4), round(lon, 4))
            ghi_provenance = "NASA_POWER_CLIMATOLOGY"
        except Exception as exc:
            ghi = None
            ghi_provenance = "UNAVAILABLE"
            st.error(f"NASA POWER tidak tersedia: {exc}. Tidak menggunakan fallback diam-diam.")
    if ghi is not None:
        estimated_gwh = estimate_generation_gwh(
            capacity, ghi, performance_ratio=performance_ratio,
            plane_of_array_factor=poa_factor,
        )
        st.metric("GHI", f"{ghi:.2f} kWh/m²/hari", help=ghi_provenance)
        st.metric("Produksi energi indikatif", f"{estimated_gwh:,.1f} GWh/tahun")
        st.caption("Belum termasuk studi detail shading, degradasi, curtailment, atau P50/P90.")
    else:
        estimated_gwh = None
        st.caption("Energi belum dihitung karena data GHI tidak tersedia.")

    st.markdown("#### Kandidat GI berdasarkan jarak lurus")
    visible = nearby[["name", "voltage_kv", "straight_line_km", "indicative_route_km"]].copy()
    visible.columns = ["GI", "Tegangan (kV)", "Jarak lurus (km)", "Rute asumsi (km)"]
    st.dataframe(visible, hide_index=True, use_container_width=True)
    st.caption(
        f"Sumber GI: {station_provenance}. Peringkat jarak BUKAN rekomendasi kelayakan interkoneksi. "
        "Rute asumsi bukan rute ROW/desain aktual."
    )

report = {
    "report_type": "site_to_gi_pre_screening_only",
    "assessment_status": "NOT_APPROVED_FOR_GRID_CONNECTION",
    "site": {
        "geometry": mapping(geometry),
        "geometry_status": "synthetic" if area_mode == "Polygon demo" else "user_drawn_unverified",
        "centroid_lat": lat,
        "centroid_lon": lon,
        "gross_area_ha": round(area_ha, 3),
        "estimated_capacity_mwp": round(capacity, 3),
        "land_ownership": "UNKNOWN",
        "spatial_zoning": "NOT_ASSESSED",
    },
    "energy": {
        "ghi_daily_kwh_m2": ghi,
        "ghi_provenance": ghi_provenance,
        "estimated_generation_gwh_year": round(estimated_gwh, 3) if estimated_gwh is not None else None,
        "basis": "screening_only_not_bankable",
    },
    "assumptions": {
        "usable_fraction": usable_pct / 100,
        "hectares_per_mwp": hectares_per_mwp,
        "indicative_route_factor": route_factor,
        "performance_ratio": performance_ratio,
        "plane_of_array_factor": poa_factor,
    },
    "substations": nearby.where(nearby.notna(), None).to_dict(orient="records"),
    "substation_dataset_provenance": station_provenance,
    "out_of_scope": [
        "electrical connectivity validation", "hosting capacity", "N-1",
        "dynamic stability", "protection study", "curtailment", "connection approval",
    ],
}
st.download_button(
    "Unduh hasil screening (JSON)",
    json.dumps(report, ensure_ascii=False, indent=2, default=str),
    file_name="solar_screening_report.json",
    mime="application/json",
)
with st.expander("Batas analisis dan cara menggunakan"):
    st.write(
        "1. Jalankan demo sintetis tanpa data PLN. "
        "2. Gambar polygon atau gunakan polygon contoh. "
        "3. Bila ada CSV koordinat GI, unggah untuk mengganti data demo. "
        "4. NASA POWER hanya dipanggil ketika mode online dipilih. "
        "5. Hasil ini untuk prioritas studi awal; studi sistem dan evaluasi koneksi diserahkan ke P2B."
    )
