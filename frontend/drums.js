// Drum Track Engine - Web Audio drum synthesis

class DrumTrack {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.masterGain = null;
        this.isPlaying = false;
        this.intervalId = null;
        this.currentBeat = 0;
        this.volume = 0.3; // 30% volume for drums

        // Drum patterns (16th note grid)
        this.patterns = {
            'basic': {
                name: 'Basic Rock',
                kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
            },
            'pop': {
                name: 'Pop Beat',
                kick:  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            'jazz': {
                name: 'Jazz Swing',
                kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                hihat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0]
            },
            'funk': {
                name: 'Funk Groove',
                kick:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
            },
            'ballad': {
                name: 'Ballad',
                kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
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

    // Synthesize kick drum
    playKick(time = this.audioContext.currentTime) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    // Synthesize snare drum
    playSnare(time = this.audioContext.currentTime) {
        // Tone component
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(200, time);
        oscGain.gain.setValueAtTime(0.3, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Noise component
        const bufferSize = this.audioContext.sampleRate * 0.2;
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
        noiseFilter.frequency.value = 1000;
        noiseGain.gain.setValueAtTime(0.7, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.2);
        noise.start(time);
        noise.stop(time + 0.2);
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

        const sixteenthNoteTime = (60 / bpm) / 4; // Time per 16th note in seconds
        const intervalMs = sixteenthNoteTime * 1000;

        console.log('[Drums] Started pattern:', this.currentPattern, 'at', bpm, 'BPM');

        this.intervalId = setInterval(() => {
            const pattern = this.patterns[this.currentPattern];
            const time = this.audioContext.currentTime;

            if (pattern.kick[this.currentBeat]) this.playKick(time);
            if (pattern.snare[this.currentBeat]) this.playSnare(time);
            if (pattern.hihat[this.currentBeat]) this.playHihat(time);

            this.currentBeat = (this.currentBeat + 1) % 16;
        }, intervalMs);
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
