"""
Synthesizer Engine - Handles audio synthesis using FluidSynth
"""

import time
from typing import List, Optional
try:
    import fluidsynth
    FLUIDSYNTH_AVAILABLE = True
except (ImportError, FileNotFoundError, OSError):
    FLUIDSYNTH_AVAILABLE = False
    print("Warning: FluidSynth not available. Running in mock mode - chords will be logged to console.")


class SynthEngine:
    def __init__(self, soundfont_path: Optional[str] = None):
        """
        Initialize synthesizer engine

        Args:
            soundfont_path: Path to .sf2 soundfont file (optional)
        """
        self.fs = None
        self.sfid = None
        self.is_initialized = False

        if FLUIDSYNTH_AVAILABLE:
            try:
                self._initialize_fluidsynth(soundfont_path)
            except Exception as e:
                print(f"Failed to initialize FluidSynth: {e}")
        else:
            print("FluidSynth not available - audio playback disabled")

    def _initialize_fluidsynth(self, soundfont_path: Optional[str] = None):
        """Initialize FluidSynth with settings"""
        self.fs = fluidsynth.Synth()
        self.fs.start(driver="dsound" if soundfont_path else None)

        # Load soundfont if provided
        if soundfont_path:
            self.sfid = self.fs.sfload(soundfont_path)
            self.fs.program_select(0, self.sfid, 0, 0)

        self.is_initialized = True

    def play_note(self, midi_note: int, velocity: int = 100, channel: int = 0):
        """
        Play a single MIDI note

        Args:
            midi_note: MIDI note number (0-127)
            velocity: Note velocity/volume (0-127)
            channel: MIDI channel (0-15)
        """
        if not self.is_initialized:
            print(f"[Mock] Playing note: {midi_note} (velocity: {velocity})")
            return

        self.fs.noteon(channel, midi_note, velocity)

    def stop_note(self, midi_note: int, channel: int = 0):
        """
        Stop a MIDI note

        Args:
            midi_note: MIDI note number (0-127)
            channel: MIDI channel (0-15)
        """
        if not self.is_initialized:
            print(f"[Mock] Stopping note: {midi_note}")
            return

        self.fs.noteoff(channel, midi_note)

    def play_chord(self, midi_notes: List[int], duration: float, velocity: int = 100, channel: int = 0):
        """
        Play a chord (multiple notes simultaneously) for a specified duration

        Args:
            midi_notes: List of MIDI note numbers
            duration: Duration in seconds
            velocity: Note velocity/volume (0-127)
            channel: MIDI channel (0-15)
        """
        if not self.is_initialized:
            print(f"[Mock] Playing chord: {midi_notes} for {duration}s")
            time.sleep(duration)
            return

        # Start all notes
        for note in midi_notes:
            self.fs.noteon(channel, note, velocity)

        # Wait for duration
        time.sleep(duration)

        # Stop all notes
        for note in midi_notes:
            self.fs.noteoff(channel, note)

    def stop_all_notes(self, channel: int = 0):
        """
        Stop all notes on a channel

        Args:
            channel: MIDI channel (0-15)
        """
        if not self.is_initialized:
            print("[Mock] Stopping all notes")
            return

        # Send note off for all possible MIDI notes
        for note in range(128):
            self.fs.noteoff(channel, note)

    def set_instrument(self, program: int, channel: int = 0):
        """
        Change instrument/program

        Args:
            program: MIDI program number (0-127)
            channel: MIDI channel (0-15)
        """
        if not self.is_initialized:
            print(f"[Mock] Setting instrument to program {program}")
            return

        if self.sfid is not None:
            self.fs.program_select(channel, self.sfid, 0, program)
        else:
            self.fs.program_change(channel, program)

    def cleanup(self):
        """Clean up synthesizer resources"""
        if self.is_initialized and self.fs:
            self.fs.delete()
            self.is_initialized = False
