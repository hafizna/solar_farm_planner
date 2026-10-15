import pandas as pd
import pytest

from core.spatial import (
    area_hectares,
    centroid_latlon,
    estimate_capacity_mwp,
    estimate_generation_gwh,
    nearest_substations,
    parse_site,
)


def test_area_and_centroid_are_geospatial_not_degrees():
    polygon = parse_site({
        "type": "Polygon",
        "coordinates": [[[107.0, -6.0], [107.01, -6.0], [107.01, -6.01],
                         [107.0, -6.01], [107.0, -6.0]]],
    })
    assert 100 < area_hectares(polygon) < 130
    lat, lon = centroid_latlon(polygon)
    assert -6.01 < lat < -6.0
    assert 107.0 < lon < 107.01


def test_nearest_station_and_route_factor():
    df = pd.DataFrame([
        {"name": "Near", "lat": -6.0, "lon": 107.001},
        {"name": "Far", "lat": -7.0, "lon": 107.001},
    ])
    out = nearest_substations(df, -6.0, 107.0, count=2, route_factor=1.5)
    assert list(out["name"]) == ["Near", "Far"]
    assert out.loc[0, "indicative_route_km"] == pytest.approx(
        out.loc[0, "straight_line_km"] * 1.5, abs=0.001
    )


def test_generation_is_indicative_and_scales_with_capacity():
    capacity = estimate_capacity_mwp(90, usable_fraction=0.70, hectares_per_mwp=1.8)
    assert capacity == pytest.approx(35)
    gwh = estimate_generation_gwh(capacity, 4.5, performance_ratio=0.8,
                                  plane_of_array_factor=1.0)
    assert gwh == pytest.approx(45.99, abs=0.01)


def test_invalid_polygon_and_coverage_rejected():
    with pytest.raises(ValueError):
        parse_site({"type": "Point", "coordinates": [107, -6]})
    with pytest.raises(ValueError):
        estimate_capacity_mwp(100, usable_fraction=1.2, hectares_per_mwp=1.8)
