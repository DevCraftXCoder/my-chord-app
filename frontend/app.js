// Chord Progression Player - Frontend JavaScript

const API_BASE_URL = 'http://localhost:8000';

// State
let progression = [];
let currentEditIndex = null;
let isPlaying = false;

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
    setupEventListeners();
    await checkBackendStatus();
    updateProgressionDisplay();
}

function setupEventListeners() {
    bpmSlider.addEventListener('input', handleBpmChange);
    addChordBtn.addEventListener('click', openChordPicker);
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

    chordPickerModal.classList.add('active');
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
        chordSlot.innerHTML = `
            <div class="chord-name">${chord.root}${chord.chord_type === 'Major' ? '' : chord.chord_type}</div>
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

    const bpm = parseInt(bpmSlider.value);
    const loop = loopCheckbox.checked;

    try {
        const response = await fetch(`${API_BASE_URL}/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                progression,
                bpm,
                loop
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail);
        }

        isPlaying = true;
        playBtn.disabled = true;
        stopBtn.disabled = false;
        updateStatus(`Playing ${loop ? '(looping)' : ''}`, 'success');
        animatePlayback();

    } catch (error) {
        console.error('Playback error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

async function handleStop() {
    try {
        await fetch(`${API_BASE_URL}/stop`, {
            method: 'POST'
        });

        isPlaying = false;
        playBtn.disabled = false;
        stopBtn.disabled = true;
        updateStatus('Stopped', 'info');
        clearPlaybackAnimation();

    } catch (error) {
        console.error('Stop error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

function animatePlayback() {
    if (!isPlaying) return;

    const chordSlots = document.querySelectorAll('.chord-slot');
    let currentIndex = 0;

    function highlightNext() {
        if (!isPlaying) {
            clearPlaybackAnimation();
            return;
        }

        chordSlots.forEach(slot => slot.classList.remove('active'));

        if (chordSlots[currentIndex]) {
            chordSlots[currentIndex].classList.add('active');

            const chord = progression[currentIndex];
            const bpm = parseInt(bpmSlider.value);
            const duration = (60 / bpm) * chord.beats * 1000;

            currentIndex = (currentIndex + 1) % progression.length;
            setTimeout(highlightNext, duration);
        }
    }

    highlightNext();
}

function clearPlaybackAnimation() {
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
