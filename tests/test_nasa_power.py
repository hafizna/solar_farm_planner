from unittest.mock import Mock, patch

import pytest

from integrations.nasa_power import get_annual_daily_ghi


@patch("integrations.nasa_power.requests.get")
def test_ghi_is_read_from_ann(mock_get):
    response = Mock()
    response.json.return_value = {
        "properties": {"parameter": {"ALLSKY_SFC_SW_DWN": {"ANN": 4.67}}}
    }
    mock_get.return_value = response
    assert get_annual_daily_ghi(-6.6, 107.4) == pytest.approx(4.67)
    response.raise_for_status.assert_called_once()


@patch("integrations.nasa_power.requests.get")
def test_missing_ghi_is_not_silently_filled(mock_get):
    response = Mock()
    response.json.return_value = {"properties": {"parameter": {}}}
    mock_get.return_value = response
    with pytest.raises(ValueError):
        get_annual_daily_ghi(-6.6, 107.4)
