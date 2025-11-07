import os
import sounddevice as sd
import soundfile as sf
import numpy as np
import tempfile
import noisereduce as nr
from typing import Optional

SAMPLE_RATE = 16000
RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "recordings")
os.makedirs(RECORDINGS_DIR, exist_ok=True)


def list_input_devices():
    devices = sd.query_devices()
    input_devices = [(i, d["name"]) for i, d in enumerate(devices) if d["max_input_channels"] > 0]
    return input_devices


def choose_input_device(default=True):
    """
    Return device index. If default True, returns default input device.
    """
    try:
        if default:
            return sd.default.device[0]
        devices = list_input_devices()
        return devices[0][0] if devices else None
    except Exception:
        return None


def record_audio(duration: float = 8.0, device_index: Optional[int] = None, filename: Optional[str] = None):
    """
    Records audio using sounddevice and saves to WAV with SAMPLE_RATE.
    Returns path to wav file or None if failed.
    """
    if device_index is None:
        device_index = choose_input_device()

    if filename is None:
        fd, filepath = tempfile.mkstemp(suffix=".wav", dir=RECORDINGS_DIR)
        os.close(fd)
    else:
        filepath = filename

    try:
        print(f"Recording for {duration}s on device {device_index} -> {filepath}")
        audio = sd.rec(int(duration * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='float32', device=device_index)
        sd.wait()
        # save as 16-bit PCM
        sf.write(filepath, audio, SAMPLE_RATE, subtype='PCM_16')
        if os.path.getsize(filepath) < 2000:
            # very short / empty
            raise RuntimeError("Empty/very short recording")
        return filepath
    except Exception as e:
        print("Recording failed:", e)
        return None


def reduce_noise(filepath: str, prop_decrease: float = 0.9):
    """
    Simple noise reduction (in-place overwrite).
    """
    try:
        data, sr = sf.read(filepath)
        if len(data.shape) > 1:
            data = data[:, 0]
        reduced = nr.reduce_noise(y=data, sr=sr, prop_decrease=prop_decrease)
        sf.write(filepath, reduced, sr)
        return filepath
    except Exception as e:
        print("Noise reduction error:", e)
        return filepath


def get_audio_duration(filepath: str):
    try:
        info = sf.info(filepath)
        return float(info.duration)
    except Exception:
        return None
