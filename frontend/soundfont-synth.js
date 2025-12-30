// SoundFont-based Audio Synthesizer using real instrument samples
// Uses soundfont-player library for high-quality instrument sounds

class SoundFontSynth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeNotes = new Map();
        this.isInitialized = false;
        this.currentInstrument = null;
        this.instrumentName = 'acoustic_grand_piano';
        this.isLoading = false;
    }

    // Initialize audio context
    async initialize() {
        if (this.isInitialized) return true;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('[SoundFont] Audio context initialized');

            // Load default instrument
            await this.loadInstrument(this.instrumentName);

            return true;
        } catch (error) {
            console.error('[SoundFont] Failed to initialize:', error);
            return false;
        }
    }

    // Load instrument from SoundFont
    async loadInstrument(instrumentName) {
        if (this.isLoading) {
            console.log('[SoundFont] Already loading an instrument...');
            return;
        }

        this.isLoading = true;
        console.log('[SoundFont] Loading instrument:', instrumentName);

        try {
            // Use Soundfont-player CDN
            const response = await fetch(`https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrumentName}-mp3.js`);
            const text = await response.text();

            // Parse the soundfont data
            const soundfontData = this.parseSoundfont(text);
            this.currentInstrument = soundfontData;
            this.instrumentName = instrumentName;

            console.log('[SoundFont] ✅ Loaded:', instrumentName);
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('[SoundFont] Failed to load instrument:', error);
            this.isLoading = false;
            return false;
        }
    }

    // Parse soundfont JavaScript file
    parseSoundfont(text) {
        try {
            // Extract the MIDI.Soundfont object
            const match = text.match(/MIDI\.Soundfont\s*=\s*({[\s\S]*?});/);
            if (match) {
                const soundfont = eval('(' + match[1] + ')');
                return soundfont;
            }
            return {};
        } catch (error) {
            console.error('[SoundFont] Failed to parse soundfont:', error);
            return {};
        }
    }

    // Convert MIDI note number to frequency
    midiToFreq(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    // Get MIDI note name (e.g., 60 -> "C4")
    midiToNoteName(midiNote) {
        const noteNames = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = noteNames[midiNote % 12];
        return noteName + octave;
    }

    // Play a single note using SoundFont sample
    async playNote(midiNote, velocity = 100, duration = null) {
        if (!this.isInitialized || !this.currentInstrument) {
            console.warn('[SoundFont] Not ready. Initializing...');
            await this.initialize();
        }

        const noteName = this.midiToNoteName(midiNote);
        const sample = this.currentInstrument[noteName];

        if (!sample) {
            console.warn('[SoundFont] No sample for note:', noteName);
            return null;
        }

        try {
            // Decode base64 audio data
            const audioData = this.base64ToArrayBuffer(sample);
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);

            // Create buffer source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Create gain node for velocity
            const gainNode = this.audioContext.createGain();
            const volume = (velocity / 127) * 0.8;
            gainNode.gain.value = volume;

            // Connect audio graph
            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Play the note
            const now = this.audioContext.currentTime;
            source.start(now);

            // Stop after duration if specified
            if (duration) {
                source.stop(now + duration);
            }

            // Track active note
            const noteId = `${midiNote}-${Date.now()}`;
            this.activeNotes.set(noteId, { source, gainNode });

            // Clean up when done
            source.onended = () => {
                this.activeNotes.delete(noteId);
            };

            return noteId;
        } catch (error) {
            console.error('[SoundFont] Error playing note:', error);
            return null;
        }
    }

    // Convert base64 to ArrayBuffer
    base64ToArrayBuffer(base64) {
        // Remove data URL prefix if present
        const base64Data = base64.split(',')[1] || base64;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Play a chord (multiple notes at once)
    playChord(midiNotes, duration = 2.0) {
        const noteIds = [];
        midiNotes.forEach(note => {
            const id = this.playNote(note, 100, duration);
            if (id) noteIds.push(id);
        });
        return noteIds;
    }

    // Stop all active notes
    stopAll() {
        this.activeNotes.forEach(({ source }) => {
            try {
                source.stop();
            } catch (error) {
                // Note already stopped
            }
        });
        this.activeNotes.clear();
    }

    // Get available instruments
    getAvailableInstruments() {
        return [
            { id: 'acoustic_grand_piano', name: 'Acoustic Grand Piano' },
            { id: 'bright_acoustic_piano', name: 'Bright Acoustic Piano' },
            { id: 'electric_grand_piano', name: 'Electric Grand Piano' },
            { id: 'acoustic_guitar_nylon', name: 'Acoustic Guitar (Nylon)' },
            { id: 'acoustic_guitar_steel', name: 'Acoustic Guitar (Steel)' },
            { id: 'electric_guitar_clean', name: 'Electric Guitar (Clean)' },
            { id: 'electric_guitar_jazz', name: 'Electric Guitar (Jazz)' },
            { id: 'overdriven_guitar', name: 'Overdriven Guitar' },
            { id: 'distortion_guitar', name: 'Distortion Guitar' },
            { id: 'acoustic_bass', name: 'Acoustic Bass' },
            { id: 'electric_bass_finger', name: 'Electric Bass (Finger)' },
            { id: 'violin', name: 'Violin' },
            { id: 'cello', name: 'Cello' },
            { id: 'string_ensemble_1', name: 'String Ensemble' },
            { id: 'synth_strings_1', name: 'Synth Strings' }
        ];
    }
}
