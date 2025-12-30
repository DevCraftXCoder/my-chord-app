// Key Helper - Suggest chords based on musical keys

class KeyHelper {
    constructor() {
        // Major scale degrees
        this.majorScaleDegrees = {
            'I': 'Major',
            'ii': 'Minor',
            'iii': 'Minor',
            'IV': 'Major',
            'V': 'Major',
            'vi': 'Minor',
            'vii°': 'Dim'
        };

        // Natural minor scale degrees
        this.minorScaleDegrees = {
            'i': 'Minor',
            'ii°': 'Dim',
            'III': 'Major',
            'iv': 'Minor',
            'v': 'Minor',
            'VI': 'Major',
            'VII': 'Major'
        };

        // Common progressions
        this.commonProgressions = {
            'I-V-vi-IV': { name: 'Pop Progression', degrees: ['I', 'V', 'vi', 'IV'] },
            'I-IV-V': { name: 'Three Chord', degrees: ['I', 'IV', 'V'] },
            'ii-V-I': { name: 'Jazz Turnaround', degrees: ['ii', 'V', 'I'] },
            'I-vi-IV-V': { name: '50s Progression', degrees: ['I', 'vi', 'IV', 'V'] },
            'vi-IV-I-V': { name: 'Sensitive', degrees: ['vi', 'IV', 'I', 'V'] },
            'I-V-vi-iii-IV-I-IV-V': { name: 'Canon in D', degrees: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'] },
            'i-VI-III-VII': { name: 'Minor Pop', degrees: ['i', 'VI', 'III', 'VII'] }
        };

        // Notes in chromatic scale
        this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    }

    // Get note at interval from root
    getNoteAtInterval(root, interval) {
        const rootIndex = this.notes.indexOf(root);
        const targetIndex = (rootIndex + interval) % 12;
        return this.notes[targetIndex];
    }

    // Get chords in a major key
    getChordsInMajorKey(root) {
        const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // Major scale
        const chords = [];

        const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
        degrees.forEach((degree, index) => {
            const note = this.getNoteAtInterval(root, majorScaleIntervals[index]);
            chords.push({
                degree: degree,
                root: note,
                type: this.majorScaleDegrees[degree]
            });
        });

        return chords;
    }

    // Get chords in a minor key
    getChordsInMinorKey(root) {
        const minorScaleIntervals = [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale
        const chords = [];

        const degrees = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
        degrees.forEach((degree, index) => {
            const note = this.getNoteAtInterval(root, minorScaleIntervals[index]);
            chords.push({
                degree: degree,
                root: note,
                type: this.minorScaleDegrees[degree]
            });
        });

        return chords;
    }

    // Get suggested progression for a key
    getSuggestedProgressions(root, mode = 'major') {
        const chords = mode === 'major'
            ? this.getChordsInMajorKey(root)
            : this.getChordsInMinorKey(root);

        const suggestions = [];

        for (const [id, prog] of Object.entries(this.commonProgressions)) {
            // Check if all degrees exist in current mode
            const isValid = prog.degrees.every(degree =>
                chords.some(c => c.degree === degree)
            );

            if (isValid) {
                const progression = prog.degrees.map(degree => {
                    const chord = chords.find(c => c.degree === degree);
                    return {
                        root: chord.root,
                        chord_type: chord.type,
                        beats: 4
                    };
                });

                suggestions.push({
                    id: id,
                    name: prog.name,
                    progression: progression
                });
            }
        }

        return suggestions;
    }

    // Analyze current progression to detect key
    detectKey(progression) {
        if (!progression || progression.length === 0) return null;

        // Count occurrences of each root note
        const rootCounts = {};
        progression.forEach(chord => {
            rootCounts[chord.root] = (rootCounts[chord.root] || 0) + 1;
        });

        // Most common root is likely the tonic
        const tonic = Object.keys(rootCounts).reduce((a, b) =>
            rootCounts[a] > rootCounts[b] ? a : b
        );

        // Try to match with major or minor
        const majorChords = this.getChordsInMajorKey(tonic);
        const minorChords = this.getChordsInMinorKey(tonic);

        let majorMatches = 0;
        let minorMatches = 0;

        progression.forEach(chord => {
            if (majorChords.some(c => c.root === chord.root && c.type === chord.chord_type)) {
                majorMatches++;
            }
            if (minorChords.some(c => c.root === chord.root && c.type === chord.chord_type)) {
                minorMatches++;
            }
        });

        const mode = majorMatches >= minorMatches ? 'major' : 'minor';

        return {
            root: tonic,
            mode: mode,
            confidence: Math.max(majorMatches, minorMatches) / progression.length
        };
    }

    // Get chord suggestions for next chord based on current progression
    getNextChordSuggestions(progression) {
        if (!progression || progression.length === 0) {
            // Suggest starting with I or i
            return this.notes.map(note => ({
                root: note,
                chord_type: 'Major',
                reason: 'Start with tonic'
            }));
        }

        const lastChord = progression[progression.length - 1];
        const key = this.detectKey(progression);

        if (!key) return [];

        const availableChords = key.mode === 'major'
            ? this.getChordsInMajorKey(key.root)
            : this.getChordsInMinorKey(key.root);

        // Common chord movements
        const suggestions = availableChords.map(chord => ({
            root: chord.root,
            chord_type: chord.type,
            degree: chord.degree,
            reason: `In key of ${key.root} ${key.mode}`
        }));

        return suggestions.slice(0, 6); // Return top 6 suggestions
    }
}
