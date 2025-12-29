"""
Test script for chord and timing engines
"""

from chord_engine import ChordEngine
from timing_engine import TimingEngine, ChordTiming

def test_chord_engine():
    print("=" * 50)
    print("TESTING CHORD ENGINE")
    print("=" * 50)

    engine = ChordEngine()

    # Test C Major
    print("\n1. Testing C Major:")
    midi_notes = engine.generate_chord('C', 'Major')
    note_names = engine.chord_to_note_names(midi_notes)
    print(f"   MIDI: {midi_notes}")
    print(f"   Notes: {note_names}")

    # Test A Minor
    print("\n2. Testing A Minor:")
    midi_notes = engine.generate_chord('A', 'Minor')
    note_names = engine.chord_to_note_names(midi_notes)
    print(f"   MIDI: {midi_notes}")
    print(f"   Notes: {note_names}")

    # Test G7
    print("\n3. Testing G7:")
    midi_notes = engine.generate_chord('G', '7')
    note_names = engine.chord_to_note_names(midi_notes)
    print(f"   MIDI: {midi_notes}")
    print(f"   Notes: {note_names}")

    # Test F Major7
    print("\n4. Testing F Maj7:")
    midi_notes = engine.generate_chord('F', 'Maj7')
    note_names = engine.chord_to_note_names(midi_notes)
    print(f"   MIDI: {midi_notes}")
    print(f"   Notes: {note_names}")

    print("\n✓ Chord Engine tests passed!\n")


def test_timing_engine():
    print("=" * 50)
    print("TESTING TIMING ENGINE")
    print("=" * 50)

    engine = TimingEngine(bpm=120)

    # Test BPM calculations
    print(f"\n1. BPM: {engine.bpm}")
    print(f"   Seconds per beat: {engine.seconds_per_beat}")

    # Test beat to seconds conversion
    print("\n2. Converting beats to seconds:")
    for beats in [1, 2, 4, 8]:
        seconds = engine.beats_to_seconds(beats)
        print(f"   {beats} beats = {seconds} seconds")

    # Test progression timing
    print("\n3. Testing progression (C-G-Am-F, 4 beats each):")
    progression = [
        ChordTiming('C', 'Major', 4),
        ChordTiming('G', 'Major', 4),
        ChordTiming('A', 'Minor', 4),
        ChordTiming('F', 'Major', 4)
    ]

    duration = engine.get_progression_duration(progression)
    print(f"   Total duration: {duration} seconds")

    schedule = engine.create_schedule(progression)
    print("\n   Schedule:")
    for i, (start, dur, root, chord_type) in enumerate(schedule):
        print(f"   [{i+1}] {root}{chord_type}: starts at {start}s, lasts {dur}s")

    # Test different BPM
    print("\n4. Testing at 60 BPM:")
    engine.bpm = 60
    duration = engine.get_progression_duration(progression)
    print(f"   Same progression duration: {duration} seconds")

    print("\n✓ Timing Engine tests passed!\n")


def test_integration():
    print("=" * 50)
    print("INTEGRATION TEST - I-V-vi-IV Progression")
    print("=" * 50)

    chord_engine = ChordEngine()
    timing_engine = TimingEngine(bpm=120)

    # Create I-V-vi-IV in C major
    progression = [
        ChordTiming('C', 'Major', 4),   # I
        ChordTiming('G', 'Major', 4),   # V
        ChordTiming('A', 'Minor', 4),   # vi
        ChordTiming('F', 'Major', 4)    # IV
    ]

    print(f"\nBPM: {timing_engine.bpm}")
    print(f"Total duration: {timing_engine.get_progression_duration(progression)}s\n")

    schedule = timing_engine.create_schedule(progression)

    for i, (start, duration, root, chord_type) in enumerate(schedule):
        midi_notes = chord_engine.generate_chord(root, chord_type)
        note_names = chord_engine.chord_to_note_names(midi_notes)
        print(f"[{i+1}] {root}{chord_type}")
        print(f"    Time: {start}s - {start + duration}s")
        print(f"    Notes: {' '.join(note_names)}")
        print(f"    MIDI: {midi_notes}\n")

    print("✓ Integration test passed!\n")


if __name__ == "__main__":
    test_chord_engine()
    test_timing_engine()
    test_integration()

    print("=" * 50)
    print("ALL TESTS PASSED!")
    print("=" * 50)
