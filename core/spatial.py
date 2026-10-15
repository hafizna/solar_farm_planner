"""Geodesic site-area and substation proximity calculations (WGS84)."""
from __future__ import annotations

import math

import pandas as pd
from pyproj import Geod
from shapely.geometry import shape
from shapely.geometry.base import BaseGeometry

GEOD = Geod(ellps="WGS84")


def parse_site(geometry: dict) -> BaseGeometry:
    if geometry.get("type") == "Feature":
        geometry = geometry["geometry"]
    geom = shape(geometry)
    if geom.geom_type not in ("Polygon", "MultiPolygon"):
        raise ValueError("Area PLTS harus berupa Polygon atau MultiPolygon.")
    if not geom.is_valid or geom.is_empty:
        raise ValueError("Polygon tidak valid. Perbaiki bentuk atau titik perpotongan.")
    return geom


def area_hectares(geometry: BaseGeometry) -> float:
    area_m2, _ = GEOD.geometry_area_perimeter(geometry)
    return abs(area_m2) / 10_000.0


def centroid_latlon(geometry: BaseGeometry) -> tuple[float, float]:
    # Geographic centroid is suitable for this small-area proximity pre-screening.
    return float(geometry.centroid.y), float(geometry.centroid.x)


def nearest_substations(
    stations: pd.DataFrame,
    latitude: float,
    longitude: float,
    *,
    count: int = 3,
    route_factor: float = 1.3,
) -> pd.DataFrame:
    if route_factor < 1:
        raise ValueError("Faktor rute harus >= 1.")
    if count < 1:
        raise ValueError("Jumlah kandidat harus >= 1.")
    records = stations.copy()
    distances = []
    for row in records.itertuples(index=False):
        _, _, distance_m = GEOD.inv(longitude, latitude, float(row.lon), float(row.lat))
        distances.append(round(distance_m / 1000.0, 3))
    records["straight_line_km"] = distances
    records["indicative_route_km"] = (records["straight_line_km"] * route_factor).round(3)
    records = records.sort_values(["straight_line_km", "name"], kind="stable")
    return records.head(count).reset_index(drop=True)


def estimate_capacity_mwp(
    gross_area_ha: float,
    *,
    usable_fraction: float,
    hectares_per_mwp: float,
) -> float:
    if not (0 < usable_fraction <= 1) or hectares_per_mwp <= 0 or gross_area_ha < 0:
        raise ValueError("Parameter kapasitas PLTS tidak valid.")
    return gross_area_ha * usable_fraction / hectares_per_mwp


def estimate_generation_gwh(
    capacity_mwp: float,
    daily_ghi_kwh_m2: float,
    *,
    performance_ratio: float = 0.8,
    plane_of_array_factor: float = 1.05,
) -> float:
    """Illustrative annual output, not bankable PV yield or dispatchable energy."""
    numbers = (capacity_mwp, daily_ghi_kwh_m2, performance_ratio, plane_of_array_factor)
    if not all(math.isfinite(float(n)) for n in numbers):
        raise ValueError("Nilai parameter produksi tidak boleh NaN/inf.")
    if capacity_mwp < 0 or daily_ghi_kwh_m2 < 0:
        raise ValueError("Kapasitas dan GHI tidak boleh negatif.")
    if not (0 < performance_ratio <= 1) or plane_of_array_factor <= 0:
        raise ValueError("PR/faktor orientasi tidak valid.")
    return capacity_mwp * 1000.0 * daily_ghi_kwh_m2 * 365.0 * performance_ratio * plane_of_array_factor / 1e6
