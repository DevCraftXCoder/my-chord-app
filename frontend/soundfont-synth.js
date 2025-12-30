// SoundFont-based Audio Synthesizer using real instrument samples
// Uses Tone.js Sampler for high-quality instrument sounds

class SoundFontSynth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeNotes = new Map();
        this.isInitialized = false;
        this.currentInstrument = {};
        this.instrumentName = 'acoustic_grand_piano';
        this.isLoading = false;
    }

    // Initialize audio context
    async initialize() {
        if (this.isInitialized) return true;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain (moderate volume to prevent clipping)
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.6;

            // Create compressor for better dynamics and loudness
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -18;
            this.compressor.knee.value = 15;
            this.compressor.ratio.value = 6;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.1;

            // Create limiter (prevents clipping/distortion)
            this.limiter = this.audioContext.createDynamicsCompressor();
            this.limiter.threshold.value = -0.5;
            this.limiter.knee.value = 0;
            this.limiter.ratio.value = 20;
            this.limiter.attack.value = 0.001;
            this.limiter.release.value = 0.01;

            // Connect chain: masterGain -> compressor -> limiter -> destination
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.limiter);
            this.limiter.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('[SoundFont] Audio initialized: Gain -> Compressor -> Limiter -> Output');

            // Load default instrument
            await this.loadInstrument(this.instrumentName);

            return true;
        } catch (error) {
            console.error('[SoundFont] Failed to initialize:', error);
            return false;
        }
    }

    // Load instrument from SoundFont CDN
    async loadInstrument(instrumentName) {
        if (this.isLoading) {
            console.log('[SoundFont] Already loading...');
            return false;
        }

        this.isLoading = true;
        console.log('[SoundFont] Loading instrument:', instrumentName);

        try {
            // Use simplified approach: load key samples
            const baseUrl = `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrumentName}-mp3`;

            // Load samples for common notes (C3-C6 range)
            const notesToLoad = [
                'C3', 'Cs3', 'D3', 'Ds3', 'E3', 'F3', 'Fs3', 'G3', 'Gs3', 'A3', 'As3', 'B3',
                'C4', 'Cs4', 'D4', 'Ds4', 'E4', 'F4', 'Fs4', 'G4', 'Gs4', 'A4', 'As4', 'B4',
                'C5', 'Cs5', 'D5', 'Ds5', 'E5', 'F5', 'Fs5', 'G5', 'Gs5', 'A5', 'As5', 'B5',
                'C6'
            ];

            const instrument = {};
            const loadPromises = notesToLoad.map(async (noteName) => {
                try {
                    const url = `${baseUrl}/${noteName}.mp3`;
                    const response = await fetch(url);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                        instrument[noteName] = audioBuffer;
                    }
                } catch (error) {
                    console.warn(`[SoundFont] Failed to load ${noteName}:`, error.message);
                }
            });

            await Promise.all(loadPromises);

            this.currentInstrument = instrument;
            this.instrumentName = instrumentName;

            const loadedCount = Object.keys(instrument).length;
            console.log(`[SoundFont] ✅ Loaded ${loadedCount} samples for ${instrumentName}`);

            this.isLoading = false;
            return loadedCount > 0;
        } catch (error) {
            console.error('[SoundFont] Failed to load instrument:', error);
            this.isLoading = false;
            return false;
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

    // Play a single note using SoundFont sample with scheduled timing
    playNote(midiNote, velocity = 100, duration = null, startTime = null) {
        if (!this.isInitialized || !this.currentInstrument) {
            console.warn('[SoundFont] Not ready yet');
            return null;
        }

        const noteName = this.midiToNoteName(midiNote);
        const audioBuffer = this.currentInstrument[noteName];

        if (!audioBuffer) {
            console.warn('[SoundFont] No sample for note:', noteName, '(MIDI:', midiNote, ')');
            return null;
        }

        try {
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

            // Use scheduled timing or play immediately
            const scheduledStart = startTime !== null ? startTime : this.audioContext.currentTime;
            source.start(scheduledStart);

            // Stop after duration if specified
            if (duration) {
                source.stop(scheduledStart + duration);
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

    // Play a chord (multiple notes at once) with scheduled timing
    playChord(midiNotes, duration = 2.0, startTime = null) {
        const noteIds = [];
        midiNotes.forEach(note => {
            const id = this.playNote(note, 100, duration, startTime);
            if (id) noteIds.push(id);
        });
        return noteIds;
    }

    // Stop all active notes (including scheduled ones)
    stopAll() {
        const now = this.audioContext.currentTime;
        this.activeNotes.forEach(({ source, gainNode }) => {
            try {
                // Immediately ramp down volume to prevent clicks (faster: 5ms)
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

                // Stop the source very soon
                source.stop(now + 0.005);
            } catch (error) {
                // Note already stopped or can't be stopped
                console.warn('[SoundFont] Could not stop note:', error.message);
            }
        });
        this.activeNotes.clear();
        console.log('[SoundFont] Stopped all notes');
    }

    // Set master volume
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
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
