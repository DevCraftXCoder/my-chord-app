// Web Audio API Synthesizer for Chord Player
// Generates realistic piano-like sounds in the browser

class AudioSynth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeNotes = new Map(); // Track playing notes
        this.isInitialized = false;
    }

    // Initialize audio context (must be called after user interaction)
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3; // 30% volume
            this.masterGain.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('[Audio] Web Audio synthesizer initialized');
            return true;
        } catch (error) {
            console.error('[Audio] Failed to initialize:', error);
            return false;
        }
    }

    // Convert MIDI note number to frequency
    midiToFreq(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    // Play a single note
    playNote(midiNote, velocity = 100, duration = null) {
        if (!this.isInitialized) {
            console.warn('[Audio] Not initialized. Call initialize() first.');
            return null;
        }

        const freq = this.midiToFreq(midiNote);
        const now = this.audioContext.currentTime;
        const volume = (velocity / 127) * 0.3; // Scale velocity to 0-0.3

        // Create oscillators for a richer piano-like sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();

        // Piano-like timbre: fundamental + harmonics
        osc1.frequency.value = freq;        // Fundamental
        osc2.frequency.value = freq * 2;    // 1st harmonic
        osc3.frequency.value = freq * 3;    // 2nd harmonic

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc3.type = 'triangle';

        // Create gain nodes for each oscillator
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();

        // Mix oscillators (fundamental louder, harmonics quieter)
        gain1.gain.value = volume;
        gain2.gain.value = volume * 0.3;
        gain3.gain.value = volume * 0.1;

        // Attack-Decay-Sustain-Release envelope
        const attackTime = 0.01;
        const decayTime = 0.2;
        const sustainLevel = 0.7;
        const releaseTime = 0.3;

        // Attack
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(volume, now + attackTime);

        // Decay to sustain
        gain1.gain.linearRampToValueAtTime(volume * sustainLevel, now + attackTime + decayTime);

        // Copy envelope to other gains
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
        gain2.gain.linearRampToValueAtTime(volume * 0.3 * sustainLevel, now + attackTime + decayTime);

        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(volume * 0.1, now + attackTime);
        gain3.gain.linearRampToValueAtTime(volume * 0.1 * sustainLevel, now + attackTime + decayTime);

        // Connect audio graph
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(this.masterGain);
        gain2.connect(this.masterGain);
        gain3.connect(this.masterGain);

        // Start oscillators
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        // Store reference
        const noteId = `note_${midiNote}_${Date.now()}`;
        this.activeNotes.set(noteId, { osc1, osc2, osc3, gain1, gain2, gain3 });

        // Auto-stop if duration specified
        if (duration) {
            setTimeout(() => this.stopNote(noteId, releaseTime), duration * 1000);
        }

        return noteId;
    }

    // Stop a specific note
    stopNote(noteId, releaseTime = 0.3) {
        const note = this.activeNotes.get(noteId);
        if (!note) return;

        const now = this.audioContext.currentTime;

        // Release envelope
        note.gain1.gain.cancelScheduledValues(now);
        note.gain1.gain.setValueAtTime(note.gain1.gain.value, now);
        note.gain1.gain.linearRampToValueAtTime(0, now + releaseTime);

        note.gain2.gain.cancelScheduledValues(now);
        note.gain2.gain.setValueAtTime(note.gain2.gain.value, now);
        note.gain2.gain.linearRampToValueAtTime(0, now + releaseTime);

        note.gain3.gain.cancelScheduledValues(now);
        note.gain3.gain.setValueAtTime(note.gain3.gain.value, now);
        note.gain3.gain.linearRampToValueAtTime(0, now + releaseTime);

        // Stop oscillators after release
        setTimeout(() => {
            note.osc1.stop();
            note.osc2.stop();
            note.osc3.stop();
            this.activeNotes.delete(noteId);
        }, releaseTime * 1000 + 100);
    }

    // Play a chord (multiple notes simultaneously)
    playChord(midiNotes, duration) {
        if (!this.isInitialized) {
            console.warn('[Audio] Not initialized');
            return [];
        }

        console.log(`[Audio] Playing chord: ${midiNotes} for ${duration}s`);

        const noteIds = midiNotes.map(note => this.playNote(note, 100, duration));
        return noteIds;
    }

    // Stop all active notes immediately
    stopAll() {
        console.log('[Audio] Stopping all notes');
        this.activeNotes.forEach((note, noteId) => {
            this.stopNote(noteId, 0.1);
        });
    }

    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    // Cleanup
    close() {
        this.stopAll();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.isInitialized = false;
    }
}

// Export for use in other scripts
window.AudioSynth = AudioSynth;
