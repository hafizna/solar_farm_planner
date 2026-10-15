"""Read NASA POWER climatology GHI for an explicitly requested coordinate."""
from __future__ import annotations

import math

import requests

POWER_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/climatology/point"


def get_annual_daily_ghi(latitude: float, longitude: float, *, timeout: int = 15) -> float:
    response = requests.get(
        POWER_ENDPOINT,
        params={
            "parameters": "ALLSKY_SFC_SW_DWN",
            "community": "RE",
            "latitude": round(latitude, 5),
            "longitude": round(longitude, 5),
            "format": "JSON",
        },
        timeout=timeout,
    )
    response.raise_for_status()
    payload = response.json()
    try:
        value = float(payload["properties"]["parameter"]["ALLSKY_SFC_SW_DWN"]["ANN"])
    except (TypeError, KeyError, ValueError) as exc:
        raise ValueError("NASA POWER tidak mengembalikan nilai GHI tahunan.") from exc
    if not math.isfinite(value) or value < 0 or value == -999:
        raise ValueError("Data GHI NASA POWER kosong/tidak valid.")
    return value
