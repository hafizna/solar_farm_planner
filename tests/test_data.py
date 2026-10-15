from io import StringIO

import pandas as pd
import pytest

from core.data import load_uploaded_substations, validate_substations


def test_uploaded_records_cannot_claim_verified():
    csv = b"name,lat,lon,voltage_kv,verification_status\nGI X,-6.2,107.3,150,verified\n"
    out = load_uploaded_substations(csv)
    assert out.loc[0, "verification_status"] == "user_supplied_unverified"
    assert out.loc[0, "voltage_kv"] == 150


def test_missing_coordinates_rejected():
    df = pd.read_csv(StringIO("name,lat,lon\nX,,107.0"))
    with pytest.raises(ValueError):
        validate_substations(df)


def test_voltage_optional_for_minimum_csv():
    out = load_uploaded_substations(b"name,lat,lon\nX,-6.5,107.4\n")
    assert pd.isna(out.loc[0, "voltage_kv"])
