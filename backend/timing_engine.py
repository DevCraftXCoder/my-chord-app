"""
Timing Engine - Handles BPM and beat scheduling
"""

from dataclasses import dataclass
from typing import List
import time


@dataclass
class ChordTiming:
    """Represents a chord with its duration"""
    root: str
    chord_type: str
    beats: int  # Duration in beats


class TimingEngine:
    def __init__(self, bpm: int = 120):
        """
        Initialize timing engine

        Args:
            bpm: Beats per minute (default: 120)
        """
        self._bpm = bpm
        self._seconds_per_beat = 60.0 / bpm

    @property
    def bpm(self) -> int:
        """Get current BPM"""
        return self._bpm

    @bpm.setter
    def bpm(self, value: int):
        """
        Set BPM and recalculate timing

        Args:
            value: New BPM value (30-300)
        """
        if not 30 <= value <= 300:
            raise ValueError("BPM must be between 30 and 300")
        self._bpm = value
        self._seconds_per_beat = 60.0 / value

    @property
    def seconds_per_beat(self) -> float:
        """Get duration of one beat in seconds"""
        return self._seconds_per_beat

    def beats_to_seconds(self, beats: int) -> float:
        """
        Convert beats to seconds based on current BPM

        Args:
            beats: Number of beats

        Returns:
            Duration in seconds

        Example:
            At 120 BPM, 4 beats = 2.0 seconds
        """
        return beats * self._seconds_per_beat

    def seconds_to_beats(self, seconds: float) -> float:
        """
        Convert seconds to beats based on current BPM

        Args:
            seconds: Duration in seconds

        Returns:
            Number of beats
        """
        return seconds / self._seconds_per_beat

    def get_progression_duration(self, progression: List[ChordTiming]) -> float:
        """
        Calculate total duration of a chord progression in seconds

        Args:
            progression: List of ChordTiming objects

        Returns:
            Total duration in seconds
        """
        total_beats = sum(chord.beats for chord in progression)
        return self.beats_to_seconds(total_beats)

    def create_schedule(self, progression: List[ChordTiming]) -> List[tuple]:
        """
        Create a playback schedule for a chord progression

        Args:
            progression: List of ChordTiming objects

        Returns:
            List of (start_time, duration, root, chord_type) tuples

        Example:
            At 120 BPM with progression [C Major 4 beats, G Major 4 beats]:
            [(0.0, 2.0, 'C', 'Major'), (2.0, 2.0, 'G', 'Major')]
        """
        schedule = []
        current_time = 0.0

        for chord_timing in progression:
            duration = self.beats_to_seconds(chord_timing.beats)
            schedule.append((
                current_time,
                duration,
                chord_timing.root,
                chord_timing.chord_type
            ))
            current_time += duration

        return schedule

    def get_metronome_intervals(self) -> float:
        """
        Get interval for metronome clicks (one per beat)

        Returns:
            Interval in seconds between clicks
        """
        return self._seconds_per_beat
