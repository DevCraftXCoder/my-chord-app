"""
FastAPI Backend for Chord Progression App
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import asyncio
import threading

from chord_engine import ChordEngine
from timing_engine import TimingEngine, ChordTiming
from synth_engine import SynthEngine

app = FastAPI(title="Chord Progression API", version="1.0.0")

# CORS middleware for frontend communication
# SECURITY FIX: Restrict CORS to specific origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:8080",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
chord_engine = ChordEngine()
timing_engine = TimingEngine(bpm=120)
synth_engine = SynthEngine()

# SECURITY FIX: Thread lock for playback state to prevent race conditions
playback_lock = threading.Lock()

# Playback state
playback_state = {
    "is_playing": False,
    "current_progression": [],
    "loop_enabled": True,
    "playback_thread": None
}


# Pydantic models for API
class ChordRequest(BaseModel):
    root: str = Field(..., example="C")
    chord_type: str = Field(..., example="Major")


class ChordResponse(BaseModel):
    root: str
    chord_type: str
    midi_notes: List[int]
    note_names: List[str]


class ProgressionChord(BaseModel):
    root: str = Field(..., example="C")
    chord_type: str = Field(..., example="Major")
    beats: int = Field(default=4, ge=1, le=16, example=4)


class PlaybackRequest(BaseModel):
    # SECURITY FIX: Limit progression size to prevent DoS attacks
    progression: List[ProgressionChord] = Field(..., min_length=1, max_length=100)
    bpm: int = Field(default=120, ge=30, le=300)
    loop: bool = Field(default=True)


class BPMUpdateRequest(BaseModel):
    bpm: int = Field(..., ge=30, le=300, example=120)


# API Endpoints
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Chord Progression API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/chord-types")
async def get_chord_types():
    """Get available chord types"""
    return {
        "chord_types": chord_engine.get_available_chord_types()
    }


@app.get("/root-notes")
async def get_root_notes():
    """Get available root notes"""
    return {
        "root_notes": chord_engine.get_available_roots()
    }


@app.post("/generate-chord", response_model=ChordResponse)
async def generate_chord(request: ChordRequest):
    """Generate MIDI notes for a chord"""
    try:
        midi_notes = chord_engine.generate_chord(request.root, request.chord_type)
        note_names = chord_engine.chord_to_note_names(midi_notes)

        return ChordResponse(
            root=request.root,
            chord_type=request.chord_type,
            midi_notes=midi_notes,
            note_names=note_names
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/bpm")
async def get_bpm():
    """Get current BPM"""
    return {
        "bpm": timing_engine.bpm,
        "seconds_per_beat": timing_engine.seconds_per_beat
    }


@app.post("/bpm")
async def set_bpm(request: BPMUpdateRequest):
    """Set BPM"""
    try:
        timing_engine.bpm = request.bpm
        return {
            "bpm": timing_engine.bpm,
            "seconds_per_beat": timing_engine.seconds_per_beat
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/play")
async def play_progression(request: PlaybackRequest):
    """Start playing chord progression"""
    global playback_state

    # SECURITY FIX: Use lock to prevent race conditions
    with playback_lock:
        if playback_state["is_playing"]:
            raise HTTPException(status_code=409, detail="Playback already in progress")

        # Update BPM
        timing_engine.bpm = request.bpm

        # Convert to ChordTiming objects
        progression = [
            ChordTiming(root=chord.root, chord_type=chord.chord_type, beats=chord.beats)
            for chord in request.progression
        ]

        # Store progression
        playback_state["current_progression"] = progression
        playback_state["loop_enabled"] = request.loop
        playback_state["is_playing"] = True

    # Start playback in background thread
    def playback_worker():
        try:
            while playback_state["is_playing"]:
                schedule = timing_engine.create_schedule(progression)

                for start_time, duration, root, chord_type in schedule:
                    if not playback_state["is_playing"]:
                        break

                    # Generate and play chord
                    midi_notes = chord_engine.generate_chord(root, chord_type)
                    synth_engine.play_chord(midi_notes, duration)

                if not playback_state["loop_enabled"]:
                    break

        finally:
            with playback_lock:
                playback_state["is_playing"] = False
            synth_engine.stop_all_notes()

    thread = threading.Thread(target=playback_worker, daemon=True)
    thread.start()
    playback_state["playback_thread"] = thread

    return {
        "status": "playing",
        "progression_duration": timing_engine.get_progression_duration(progression),
        "loop": request.loop
    }


@app.post("/stop")
async def stop_playback():
    """Stop playback"""
    global playback_state

    # SECURITY FIX: Use lock to prevent race conditions
    with playback_lock:
        if not playback_state["is_playing"]:
            raise HTTPException(status_code=409, detail="No playback in progress")

        playback_state["is_playing"] = False

    synth_engine.stop_all_notes()

    return {"status": "stopped"}


@app.get("/playback-status")
async def get_playback_status():
    """Get current playback status"""
    return {
        "is_playing": playback_state["is_playing"],
        "loop_enabled": playback_state["loop_enabled"],
        "bpm": timing_engine.bpm
    }


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    playback_state["is_playing"] = False
    synth_engine.cleanup()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
