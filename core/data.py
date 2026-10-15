"""Load and validate substation locations, preserving data provenance."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pandas as pd

REQUIRED = ("name", "lat", "lon")
OPTIONAL = ("gi_id", "voltage_kv", "source", "verification_status")


def validate_substations(frame: pd.DataFrame, *, uploaded: bool = False) -> pd.DataFrame:
    missing = set(REQUIRED) - set(frame.columns)
    if missing:
        raise ValueError("Kolom wajib belum ada: " + ", ".join(sorted(missing)))
    if frame.empty:
        raise ValueError("Dataset GI kosong.")
    df = frame.copy()
    for col in ("lat", "lon"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    if df[["lat", "lon"]].isna().any().any():
        raise ValueError("Koordinat GI harus berupa angka; tidak boleh kosong.")
    if (~df["lat"].between(-90, 90)).any() or (~df["lon"].between(-180, 180)).any():
        raise ValueError("Koordinat GI di luar rentang latitude/longitude.")
    df["name"] = df["name"].astype("string").str.strip()
    if df["name"].isna().any() or (df["name"] == "").any():
        raise ValueError("Nama GI tidak boleh kosong.")
    if "voltage_kv" not in df:
        df["voltage_kv"] = float("nan")
    df["voltage_kv"] = pd.to_numeric(df["voltage_kv"], errors="coerce")
    if (df["voltage_kv"].dropna() <= 0).any():
        raise ValueError("Tegangan GI, jika diisi, harus > 0 kV.")
    if "gi_id" not in df:
        df["gi_id"] = [f"UPLOAD-{i+1:03d}" for i in range(len(df))]
    df["gi_id"] = df["gi_id"].astype("string")
    if "source" not in df:
        df["source"] = "USER_UPLOAD" if uploaded else "UNKNOWN"
    if "verification_status" not in df:
        df["verification_status"] = "unverified"
    if uploaded:
        # A user-uploaded CSV is never silently promoted to verified status.
        df["verification_status"] = "user_supplied_unverified"
    return df[list(REQUIRED) + list(OPTIONAL)].reset_index(drop=True)


def load_demo_substations(path: str | Path) -> pd.DataFrame:
    return validate_substations(pd.read_csv(path), uploaded=False)


def load_uploaded_substations(content: bytes) -> pd.DataFrame:
    if len(content) > 10 * 1024 * 1024:
        raise ValueError("Maksimum ukuran berkas GI adalah 10 MB.")
    try:
        frame = pd.read_csv(BytesIO(content))
    except (UnicodeDecodeError, pd.errors.ParserError) as exc:
        raise ValueError("CSV tidak dapat dibaca. Gunakan UTF-8 dan delimiter koma.") from exc
    return validate_substations(frame, uploaded=True)
