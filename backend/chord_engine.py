"""
Chord Engine - Generates musical chords using music theory formulas
"""

class ChordEngine:
    # Chord formulas: semitone intervals from root note
    CHORD_TYPES = {
        'Major': [0, 4, 7],
        'Minor': [0, 3, 7],
        '7': [0, 4, 7, 10],
        'Maj7': [0, 4, 7, 11],
        'Min7': [0, 3, 7, 10],
        'Dim': [0, 3, 6],
        'Aug': [0, 4, 8],
        'Sus2': [0, 2, 7],
        'Sus4': [0, 5, 7],
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
