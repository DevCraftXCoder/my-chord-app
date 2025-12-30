// Drum Track Engine - Web Audio drum synthesis

class DrumTrack {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.masterGain = null;
        this.isPlaying = false;
        this.intervalId = null;
        this.currentBeat = 0;
        this.volume = 0.3; // 30% volume for drums

        // Modern trap/hip-hop drum patterns - Kick and Snare only
        this.patterns = {
            'basic': {
                name: 'Trap',
                kick:  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'pop': {
                name: 'Melodic Trap',
                kick:  [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'jazz': {
                name: 'Bouncy',
                kick:  [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'funk': {
                name: 'Hard',
                kick:  [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'ballad': {
                name: 'Chill Trap',
                kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'drill': {
                name: 'Drill',
                kick:  [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'rage': {
                name: 'Rage',
                kick:  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'hyperpop': {
                name: 'Hyperpop',
                kick:  [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'plugg': {
                name: 'Plugg',
                kick:  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'jersey': {
                name: 'Jersey Club',
                kick:  [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'emo': {
                name: 'Emo Trap',
                kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            'yeat': {
                name: 'Yeat Style',
                kick:  [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        };

        this.currentPattern = 'basic';
    }

    initialize() {
        if (!this.masterGain) {
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            console.log('[Drums] Initialized');
        }
    }

    // Synthesize 808-style kick drum
    playKick(time = this.audioContext.currentTime) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Lower, punchier 808 sound
        osc.frequency.setValueAtTime(60, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.8);

        gain.gain.setValueAtTime(1.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.8);
    }

    // Synthesize trap-style snare drum (snappy and crisp)
    playSnare(time = this.audioContext.currentTime) {
        // Tone component - higher pitch for modern trap sound
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(250, time);
        oscGain.gain.setValueAtTime(0.4, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Noise component - brighter and snappier
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;
        noiseGain.gain.setValueAtTime(1.0, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.15);
        noise.start(time);
        noise.stop(time + 0.15);
    }

    // Synthesize hi-hat
    playHihat(time = this.audioContext.currentTime) {
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(time);
        noise.stop(time + 0.05);
    }

    // Start playing pattern
    start(bpm) {
        if (!this.masterGain) this.initialize();

        this.stop(); // Stop any existing playback
        this.isPlaying = true;
        this.currentBeat = 0;
        this.bpm = bpm;

        const sixteenthNoteTime = (60 / bpm) / 4; // Time per 16th note in seconds
        const lookahead = 0.1; // Schedule drums 100ms ahead
        const scheduleInterval = 25; // Check every 25ms

        console.log('[Drums] Started pattern:', this.currentPattern, 'at', bpm, 'BPM');

        // Start time for synchronization
        this.startTime = this.audioContext.currentTime;
        this.nextNoteTime = this.startTime;

        const scheduler = () => {
            if (!this.isPlaying) return;

            // Schedule all notes that need to play in the next lookahead window
            while (this.nextNoteTime < this.audioContext.currentTime + lookahead) {
                const pattern = this.patterns[this.currentPattern];

                if (pattern.kick[this.currentBeat]) this.playKick(this.nextNoteTime);
                if (pattern.snare[this.currentBeat]) this.playSnare(this.nextNoteTime);
                if (pattern.hihat[this.currentBeat]) this.playHihat(this.nextNoteTime);

                this.nextNoteTime += sixteenthNoteTime;
                this.currentBeat = (this.currentBeat + 1) % 16;
            }
        };

        // Run scheduler at regular intervals
        this.intervalId = setInterval(scheduler, scheduleInterval);
        scheduler(); // Start immediately
    }

    // Stop playing
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.currentBeat = 0;
            this.isPlaying = false;
            console.log('[Drums] Stopped');
        }
    }

    // Set pattern
    setPattern(patternName) {
        if (this.patterns[patternName]) {
            this.currentPattern = patternName;
            console.log('[Drums] Changed pattern to:', patternName);
        }
    }

    // Set volume
    setVolume(volume) {
        this.volume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }

    // Get available patterns
    getPatterns() {
        return Object.keys(this.patterns).map(key => ({
            id: key,
            name: this.patterns[key].name
        }));
    }
}
