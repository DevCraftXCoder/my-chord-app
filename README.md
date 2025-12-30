# MyChord

**by DevXCoder**

A modern web-based chord progression player with drums, key helper, and save/load features.

## Features

- **36+ Chord Types**: Major, Minor, 7th, 9th, 11th, 13th, Suspended, Altered, and more
- **Progression Builder**: Drag-and-drop chord reordering with visual feedback
- **BPM Control**: Set tempo from 30-300 BPM
- **Web Audio Synthesis**: Browser-based audio with no plugins required
- **Drum Tracks**: 5 drum patterns (Rock, Pop, Jazz, Funk, Ballad) with volume control
- **Key Helper**: Shows chords in any key and suggests common progressions
- **Save/Load**: localStorage persistence with JSON export/import
- **Dark/Light Theme**: Toggle between dark and light modes
- **Keyboard Shortcuts**: Space (Play/Stop), Ctrl+S (Save), Ctrl+N (New Chord)
- **Looping**: Optional loop mode for continuous practice

## Architecture

```
[ Frontend (HTML/CSS/JS) ]
          ↓
[ Web Audio API ] ← [ FastAPI Backend ]
          ↓              ↓
[ Audio Synthesis ] [ Chord Engine ]
```

- **Frontend**: Vanilla JavaScript with Web Audio API for synthesis
- **Backend**: FastAPI for chord generation and music theory
- **Audio**: Browser-native Web Audio API (no plugins required)

## Chord System

Chords are generated using music theory interval formulas:

- **Major**: [0, 4, 7]
- **Minor**: [0, 3, 7]
- **7**: [0, 4, 7, 10]
- **Maj7**: [0, 4, 7, 11]
- **Min7**: [0, 3, 7, 10]
- **Dim**: [0, 3, 6]
- **Aug**: [0, 4, 8]
- **Sus2**: [0, 2, 7]
- **Sus4**: [0, 5, 7]

Example: C Major = C (0) + 0, 4, 7 = [C, E, G]

## Installation & Setup

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

**Backend:**

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Install FluidSynth (Linux)
sudo apt-get install fluidsynth libfluidsynth-dev fluid-soundfont-gm

# Run backend
python main.py
```

**Frontend:**

```bash
cd frontend

# Serve with any static file server
python -m http.server 8080
# Or use Live Server in VS Code
```

## Usage

1. **Set BPM**: Adjust the tempo slider (30-300 BPM)
2. **Add Chords**: Click "Add Chord" and select root note, chord type, and duration
3. **Build Progression**: Add multiple chords to create your progression
4. **Play**: Click the Play button to hear your progression
5. **Loop**: Enable looping for continuous playback
6. **Stop**: Click Stop to end playback

### Quick Start

Click "Load Sample Progression" to load a I-V-vi-IV progression in C major (C-G-Am-F).

## API Endpoints

- `GET /` - API status
- `GET /chord-types` - Get available chord types
- `GET /root-notes` - Get available root notes
- `POST /generate-chord` - Generate MIDI notes for a chord
- `GET /bpm` - Get current BPM
- `POST /bpm` - Set BPM
- `POST /play` - Start playback
- `POST /stop` - Stop playback
- `GET /playback-status` - Get playback status

Full API documentation: http://localhost:8000/docs

## Project Structure

```
Chord App/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── chord_engine.py      # Chord generation logic
│   ├── timing_engine.py     # BPM and timing logic
│   ├── synth_engine.py      # FluidSynth audio synthesis
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Styling
│   └── app.js              # Frontend logic
├── Dockerfile.backend      # Backend container
├── Dockerfile.frontend     # Frontend container
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## Timing Engine

BPM controls beat length:

```
seconds_per_beat = 60 / BPM

At 120 BPM:
60 / 120 = 0.5 seconds per beat

4-beat chord = 0.5 × 4 = 2 seconds
```

## Future Features

- Drum tracks and rhythm patterns
- Guitar strumming simulation
- Save/load progressions
- MIDI export
- Mobile app version
- Additional instruments
- Custom soundfonts

## Requirements

- Python 3.11+
- FastAPI
- FluidSynth
- Modern web browser

## License

MIT License
