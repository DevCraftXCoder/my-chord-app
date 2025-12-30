// Chord Progression Player - Frontend JavaScript

const API_BASE_URL = 'http://localhost:8000';

// State
let progression = [];
let currentEditIndex = null;
let isPlaying = false;

// Web Audio Synthesizer
let audioSynth = null;

// DOM Elements
const bpmSlider = document.getElementById('bpm-slider');
const bpmValue = document.getElementById('bpm-value');
const addChordBtn = document.getElementById('add-chord-btn');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const loopCheckbox = document.getElementById('loop-checkbox');
const progressionContainer = document.getElementById('progression-container');
const chordPickerModal = document.getElementById('chord-picker-modal');
const rootPicker = document.getElementById('root-picker');
const typePicker = document.getElementById('type-picker');
const beatsPicker = document.getElementById('beats-picker');
const confirmChordBtn = document.getElementById('confirm-chord-btn');
const cancelChordBtn = document.getElementById('cancel-chord-btn');
const playbackStatus = document.getElementById('playback-status');
const backendStatus = document.getElementById('backend-status');
const loadPresetBtn = document.getElementById('load-preset-btn');

// Initialize
init();

async function init() {
    // Initialize Web Audio synthesizer
    audioSynth = new AudioSynth();

    setupEventListeners();
    await checkBackendStatus();
    updateProgressionDisplay();
}

function setupEventListeners() {
    console.log('[App] Setting up event listeners...');
    console.log('[App] addChordBtn:', addChordBtn);
    console.log('[App] chordPickerModal:', chordPickerModal);

    bpmSlider.addEventListener('input', handleBpmChange);
    addChordBtn.addEventListener('click', () => openChordPicker());
    playBtn.addEventListener('click', handlePlay);
    stopBtn.addEventListener('click', handleStop);
    confirmChordBtn.addEventListener('click', handleConfirmChord);
    cancelChordBtn.addEventListener('click', closeChordPicker);
    loadPresetBtn.addEventListener('click', loadPreset);

    // Close modal on outside click
    chordPickerModal.addEventListener('click', (e) => {
        if (e.target === chordPickerModal) {
            closeChordPicker();
        }
    });
}

// BPM Control
function handleBpmChange() {
    const bpm = parseInt(bpmSlider.value);
    bpmValue.textContent = bpm;
}

async function updateBackendBpm() {
    const bpm = parseInt(bpmSlider.value);
    try {
        await fetch(`${API_BASE_URL}/bpm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bpm })
        });
    } catch (error) {
        console.error('Failed to update BPM:', error);
    }
}

// Chord Picker
function openChordPicker(editIndex = null) {
    console.log('[App] openChordPicker called, editIndex:', editIndex);
    console.log('[App] chordPickerModal element:', chordPickerModal);

    currentEditIndex = editIndex;

    if (editIndex !== null) {
        const chord = progression[editIndex];
        rootPicker.value = chord.root;
        typePicker.value = chord.chord_type;
        beatsPicker.value = chord.beats;
    } else {
        rootPicker.value = 'C';
        typePicker.value = 'Major';
        beatsPicker.value = 4;
    }

    console.log('[App] Adding active class to modal...');
    chordPickerModal.classList.add('active');
    console.log('[App] Modal classes:', chordPickerModal.classList.toString());
}

function closeChordPicker() {
    chordPickerModal.classList.remove('active');
    currentEditIndex = null;
}

function handleConfirmChord() {
    const chord = {
        root: rootPicker.value,
        chord_type: typePicker.value,
        beats: parseInt(beatsPicker.value)
    };

    if (currentEditIndex !== null) {
        progression[currentEditIndex] = chord;
    } else {
        progression.push(chord);
    }

    updateProgressionDisplay();
    closeChordPicker();
}

// Progression Display
function updateProgressionDisplay() {
    progressionContainer.innerHTML = '';

    if (progression.length === 0) {
        progressionContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 2rem;">No chords added yet. Click "Add Chord" to get started!</p>';
        return;
    }

    progression.forEach((chord, index) => {
        const chordSlot = document.createElement('div');
        chordSlot.className = 'chord-slot';

        // Format chord name display
        let chordDisplay = chord.root;
        if (chord.chord_type !== 'Major') {
            chordDisplay += chord.chord_type;
        }

        chordSlot.innerHTML = `
            <div class="chord-name">${chordDisplay}</div>
            <div class="chord-duration">${chord.beats} beat${chord.beats > 1 ? 's' : ''}</div>
            <button class="chord-remove" onclick="removeChord(${index})">×</button>
        `;

        chordSlot.addEventListener('click', (e) => {
            if (!e.target.classList.contains('chord-remove')) {
                openChordPicker(index);
            }
        });

        progressionContainer.appendChild(chordSlot);
    });
}

function removeChord(index) {
    progression.splice(index, 1);
    updateProgressionDisplay();
}

// Playback
async function handlePlay() {
    if (progression.length === 0) {
        updateStatus('Add some chords first!', 'error');
        return;
    }

    // Initialize audio on first play (requires user interaction)
    console.log('[App] Checking audio initialization...');
    if (!audioSynth.isInitialized) {
        console.log('[App] Initializing audio for first time...');
        const initialized = await audioSynth.initialize();
        if (!initialized) {
            console.error('[App] ❌ Failed to initialize audio');
            updateStatus('Failed to initialize audio', 'error');
            return;
        }
        console.log('[App] ✅ Audio initialized');
    } else {
        console.log('[App] ✅ Audio already initialized');
    }

    const bpm = parseInt(bpmSlider.value);
    const loop = loopCheckbox.checked;

    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    updateStatus(`Playing ${loop ? '(looping)' : ''}`, 'success');

    // Start local audio playback
    playProgression(bpm, loop);
}

async function playProgression(bpm, loop) {
    do {
        for (let i = 0; i < progression.length; i++) {
            if (!isPlaying) break;

            const chord = progression[i];

            // Get MIDI notes for this chord from backend
            try {
                const response = await fetch(`${API_BASE_URL}/generate-chord`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        root: chord.root,
                        chord_type: chord.chord_type
                    })
                });

                const data = await response.json();
                const midiNotes = data.midi_notes;

                // Calculate duration in seconds
                const secondsPerBeat = 60 / bpm;
                const duration = secondsPerBeat * chord.beats;

                console.log(`[App] Playing ${chord.root}${chord.chord_type}: notes ${midiNotes}, duration ${duration}s`);

                // Play the chord with Web Audio
                audioSynth.playChord(midiNotes, duration);

                // Highlight current chord
                highlightChord(i);

                // Wait for chord duration
                await sleep(duration * 1000);

            } catch (error) {
                console.error('Error playing chord:', error);
            }
        }
    } while (isPlaying && loop);

    // Auto-stop if not looping
    if (!loop) {
        handleStop();
    }
}

function highlightChord(index) {
    const chordSlots = document.querySelectorAll('.chord-slot');
    chordSlots.forEach(slot => slot.classList.remove('active'));
    if (chordSlots[index]) {
        chordSlots[index].classList.add('active');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleStop() {
    isPlaying = false;
    playBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('Stopped', 'info');

    // Stop all audio
    if (audioSynth) {
        audioSynth.stopAll();
    }

    // Clear visual highlighting
    const chordSlots = document.querySelectorAll('.chord-slot');
    chordSlots.forEach(slot => slot.classList.remove('active'));
}


// Status Updates
function updateStatus(message, type = 'info') {
    playbackStatus.textContent = message;
    playbackStatus.style.color = type === 'error' ? 'var(--danger-color)' :
                                  type === 'success' ? 'var(--success-color)' :
                                  'var(--text-primary)';
}

// Backend Status Check
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            backendStatus.classList.add('connected');
            backendStatus.classList.remove('disconnected');
            return true;
        }
    } catch (error) {
        backendStatus.classList.add('disconnected');
        backendStatus.classList.remove('connected');
        updateStatus('Backend not connected', 'error');
        return false;
    }
}

// Load Preset Progression (I-V-vi-IV in C major)
function loadPreset() {
    progression = [
        { root: 'C', chord_type: 'Major', beats: 4 },  // I
        { root: 'G', chord_type: 'Major', beats: 4 },  // V
        { root: 'A', chord_type: 'Minor', beats: 4 },  // vi
        { root: 'F', chord_type: 'Major', beats: 4 }   // IV
    ];
    updateProgressionDisplay();
    updateStatus('Loaded I-V-vi-IV progression', 'success');
}

// Export for use in HTML onclick attributes
window.removeChord = removeChord;
