# Voice Truth Scanner - API Integration

This project now integrates with a Python Flask API for real deepfake voice detection using machine learning.

## API Setup

### Prerequisites

1. Python 3.8 or higher
2. Required Python packages (install using pip):

```bash
pip install flask flask-cors librosa numpy pandas joblib
```

### API Server Setup

1. Create a file named `api_server.py` with the following content:

```python
from flask import Flask, request, jsonify
import librosa
import numpy as np
import pandas as pd
import joblib
import os
import tempfile
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load your trained model (make sure the model file exists)
model = joblib.load("deepfake_voice_detector.pkl")

def extract_features(wav_path, fs=44100, window_size_sec=0.2):
    y, sr = librosa.load(wav_path, sr=fs)
    window_size = int(fs * window_size_sec)
    num_windows = int(np.floor(len(y) / window_size))
    rows = []
    for i in range(num_windows):
        start = i * window_size
        end = start + window_size
        y_win = y[start:end]
        features = {
            "chroma_stft": np.mean(librosa.feature.chroma_stft(y=y_win, sr=sr)),
            "rms": np.mean(librosa.feature.rms(y=y_win)),
            "spectral_centroid": np.mean(librosa.feature.spectral_centroid(y=y_win, sr=sr)),
            "spectral_bandwidth": np.mean(librosa.feature.spectral_bandwidth(y=y_win, sr=sr)),
            "rolloff": np.mean(librosa.feature.spectral_rolloff(y=y_win, sr=sr)),
            "zero_crossing_rate": np.mean(librosa.feature.zero_crossing_rate(y_win)),
        }
        mfccs = librosa.feature.mfcc(y=y_win, sr=sr, n_mfcc=20)
        for j in range(20):
            features[f"mfcc{j+1}"] = np.mean(mfccs[j])
        rows.append(features)
    df = pd.DataFrame(rows)
    return df

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        file.save(tmp.name)
        features_df = extract_features(tmp.name)
        os.unlink(tmp.name)
    # Make predictions
    preds = model.predict(features_df)
    return jsonify({'predictions': preds.tolist()})

@app.route('/test', methods=['GET'])
def test():
    return "API is working!"

if __name__ == '__main__':
    app.run(debug=True)
```

2. Place your trained model file `deepfake_voice_detector.pkl` in the same directory as `api_server.py`

3. Run the API server:

```bash
python api_server.py
```

The API will be available at `http://localhost:5000`

## How It Works

### Real-time Audio Processing

The web application now:

1. **Records audio in 0.2-second intervals** - matching the model's training window size
2. **Converts audio to WAV format** - ensures compatibility with the API
3. **Sends chunks to the API** - for real-time analysis
4. **Processes ML predictions** - uses majority voting for robust results

### Smart Confidence Calculation

Instead of random confidence scores, the app now:

- Keeps track of the **last 15 API responses**
- Uses **majority voting** to determine authenticity
- Calculates **confidence based on consistency** of recent predictions
- Displays **real vs. fake ratio** in the details

### Features

- **Real-time API status indicator** - shows if the ML model is connected
- **Error handling** - graceful fallbacks when API is unavailable
- **Processing indicators** - visual feedback during analysis
- **Detailed results** - shows segment-by-segment analysis

## API Endpoints

### `GET /test`
Tests if the API is running
- **Response**: `"API is working!"`

### `POST /predict`
Analyzes audio for deepfake detection
- **Input**: WAV audio file (multipart/form-data)
- **Output**: `{"predictions": [1, 0, 1, ...]}`
  - `1` = authentic voice
  - `0` = suspicious/deepfake

## Troubleshooting

### API Connection Issues
- Make sure Python server is running on port 5000
- Check console for CORS errors
- Verify model file exists and is accessible

### Audio Recording Issues
- Grant microphone permissions in browser
- Check browser compatibility (Chrome/Firefox recommended)
- Ensure sample rate is set to 44.1kHz

### Model Performance
- Ensure model was trained on similar audio format
- Check that feature extraction matches training pipeline
- Consider retraining if accuracy is poor

## Technical Details

- **Audio Format**: 44.1kHz, mono, WAV
- **Window Size**: 0.2 seconds (matches model training)
- **Features**: MFCC (20), Chroma, RMS, Spectral features
- **Prediction Smoothing**: 15-sample rolling majority vote
- **Update Frequency**: Every 0.2 seconds during recording
