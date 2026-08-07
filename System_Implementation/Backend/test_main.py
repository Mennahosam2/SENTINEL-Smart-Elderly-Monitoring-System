import numpy as np
import io

from main import get_status, prepare_single_signal


def test_high_bp():
    assert get_status(150, 95) == "High"


def test_low_bp():
    assert get_status(80, 50) == "Low"


def test_normal_bp():
    assert get_status(120, 80) == "Normal"


def test_prepare_signal_exact_length():
    signal = np.random.rand(3750)

    bytes_io = io.BytesIO()
    np.save(bytes_io, signal)

    result = prepare_single_signal(bytes_io.getvalue())

    assert result.shape == (1, 3750, 1)


def test_prepare_signal_short_padding():
    signal = np.random.rand(3000)

    bytes_io = io.BytesIO()
    np.save(bytes_io, signal)

    result = prepare_single_signal(bytes_io.getvalue())

    assert result.shape == (1, 3750, 1)


def test_prepare_signal_long_truncation():
    signal = np.random.rand(5000)

    bytes_io = io.BytesIO()
    np.save(bytes_io, signal)

    result = prepare_single_signal(bytes_io.getvalue())

    assert result.shape == (1, 3750, 1)