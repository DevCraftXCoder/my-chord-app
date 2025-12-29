# Quick Start Guide

## Windows Setup (Local Development)

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Backend

```bash
python main.py
```

The backend will start at http://localhost:8000

### 3. Open Frontend

Simply open `frontend/index.html` in your web browser, or use a local server:

```bash
cd frontend
python -m http.server 8080
```

Then open http://localhost:8080

### 4. Test the App

1. Click "Load Sample Progression" to load a I-V-vi-IV progression
2. Adjust BPM if desired
3. Click Play

**Note**: On Windows without FluidSynth installed, the backend will run in "mock mode" where it logs chords to console instead of playing audio. For full audio support, use Docker or install FluidSynth.

## Docker Setup (Full Audio Support)

### 1. Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop

### 2. Build and Run

```bash
docker-compose up --build
```

### 3. Access the App

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing the Backend

Run the test script to verify the chord and timing engines:

```bash
cd backend
python test_engines.py
```

## Example Usage

### Building a Progression

1. Click "Add Chord"
2. Select:
   - Root: C
   - Type: Major
   - Beats: 4
3. Click "Add"
4. Repeat for G Major, A Minor, F Major
5. Set BPM to 120
6. Enable Loop
7. Click Play

### Editing a Chord

Click on any chord in the progression to edit it.

### Removing a Chord

Click the × button on any chord to remove it.

## Common Progressions to Try

### Pop Progression (I-V-vi-IV)
- C Major (4 beats)
- G Major (4 beats)
- A Minor (4 beats)
- F Major (4 beats)

### Blues Progression (I-IV-V)
- C7 (4 beats)
- F7 (4 beats)
- G7 (4 beats)
- C7 (4 beats)

### Jazz ii-V-I
- D Minor7 (4 beats)
- G7 (4 beats)
- C Major7 (4 beats)

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify Python 3.11+ is installed

### No audio on Windows
- FluidSynth requires additional setup on Windows
- Use Docker for full audio support
- Backend will work in "mock mode" without FluidSynth

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Ensure API_BASE_URL in app.js matches your backend URL

## Next Steps

- Experiment with different chord types
- Try different BPM settings (slow: 60, medium: 120, fast: 180)
- Build your own progressions
- Check out the API docs at http://localhost:8000/docs
