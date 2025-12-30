"""
Chord Engine - Generates musical chords using music theory formulas
"""

class ChordEngine:
    # Chord formulas: semitone intervals from root note
    CHORD_TYPES = {
        # Basic Triads
        'Major': [0, 4, 7],
        'Minor': [0, 3, 7],
        'Dim': [0, 3, 6],
        'Aug': [0, 4, 8],

        # Suspended Chords
        'Sus2': [0, 2, 7],
        'Sus4': [0, 5, 7],

        # Seventh Chords
        '7': [0, 4, 7, 10],           # Dominant 7th
        'Maj7': [0, 4, 7, 11],        # Major 7th
        'Min7': [0, 3, 7, 10],        # Minor 7th
        'Dim7': [0, 3, 6, 9],         # Diminished 7th
        'Min7b5': [0, 3, 6, 10],      # Half-diminished 7th
        'Aug7': [0, 4, 8, 10],        # Augmented 7th
        'MinMaj7': [0, 3, 7, 11],     # Minor-Major 7th

        # Extended Chords (9th)
        '9': [0, 4, 7, 10, 14],       # Dominant 9th
        'Maj9': [0, 4, 7, 11, 14],    # Major 9th
        'Min9': [0, 3, 7, 10, 14],    # Minor 9th
        'Add9': [0, 4, 7, 14],        # Add9 (no 7th)

        # Extended Chords (11th)
        '11': [0, 4, 7, 10, 14, 17],  # Dominant 11th
        'Maj11': [0, 4, 7, 11, 14, 17], # Major 11th
        'Min11': [0, 3, 7, 10, 14, 17], # Minor 11th

        # Extended Chords (13th)
        '13': [0, 4, 7, 10, 14, 21],  # Dominant 13th
        'Maj13': [0, 4, 7, 11, 14, 21], # Major 13th
        'Min13': [0, 3, 7, 10, 14, 21], # Minor 13th

        # Sixth Chords
        '6': [0, 4, 7, 9],            # Major 6th
        'Min6': [0, 3, 7, 9],         # Minor 6th
        '6/9': [0, 4, 7, 9, 14],      # 6/9 chord

        # Altered Chords
        '7b5': [0, 4, 6, 10],         # Dominant 7 flat 5
        '7#5': [0, 4, 8, 10],         # Dominant 7 sharp 5
        '7b9': [0, 4, 7, 10, 13],     # Dominant 7 flat 9
        '7#9': [0, 4, 7, 10, 15],     # Dominant 7 sharp 9 (Hendrix chord)

        # Power Chord
        '5': [0, 7],                  # Power chord (root + fifth)
    }

    # Note names to MIDI note numbers (C4 = middle C = 60)
    NOTE_VALUES = {
        'C': 0, 'C#': 1, 'Db': 1,
        'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6,
        'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10,
        'B': 11
    }

    def __init__(self, base_octave=4):
        """
        Initialize chord engine

        Args:
            base_octave: Base octave for chord generation (default: 4, middle C)
        """
        self.base_octave = base_octave

    def generate_chord(self, root: str, chord_type: str) -> list[int]:
        """
        Generate MIDI note numbers for a chord

        Args:
            root: Root note name (e.g., 'C', 'F#', 'Bb')
            chord_type: Type of chord (e.g., 'Major', 'Minor', '7')

        Returns:
            List of MIDI note numbers

        Example:
            >>> engine = ChordEngine()
            >>> engine.generate_chord('C', 'Major')
            [60, 64, 67]  # C4, E4, G4
        """
        if chord_type not in self.CHORD_TYPES:
            raise ValueError(f"Unknown chord type: {chord_type}")

        if root not in self.NOTE_VALUES:
            raise ValueError(f"Unknown root note: {root}")

        # Calculate base MIDI note (root note in base octave)
        base_midi = (self.base_octave * 12) + self.NOTE_VALUES[root]

        # Apply chord formula
        chord_formula = self.CHORD_TYPES[chord_type]
        midi_notes = [base_midi + interval for interval in chord_formula]

        return midi_notes

    def chord_to_note_names(self, midi_notes: list[int]) -> list[str]:
        """
        Convert MIDI note numbers to note names

        Args:
            midi_notes: List of MIDI note numbers

        Returns:
            List of note names with octaves
        """
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        result = []

        for midi_note in midi_notes:
            octave = (midi_note // 12) - 1
            note_index = midi_note % 12
            result.append(f"{note_names[note_index]}{octave}")

        return result

    def get_available_chord_types(self) -> list[str]:
        """Get list of available chord types"""
        return list(self.CHORD_TYPES.keys())

    def get_available_roots(self) -> list[str]:
        """Get list of common root notes (sharps only, no flats)"""
        return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
