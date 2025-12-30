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

// ========================================
// NEW FEATURES: Drums, Key Helper, Storage, UI
// ========================================

// Initialize new modules
let drumTrack = null;
let keyHelper = null;
let storageManager = null;

// New DOM Elements
const drumsEnabled = document.getElementById('drums-enabled');
const drumPattern = document.getElementById('drum-pattern');
const drumVolume = document.getElementById('drum-volume');
const drumVolumeValue = document.getElementById('drum-volume-value');
const keyRoot = document.getElementById('key-root');
const keyMode = document.getElementById('key-mode');
const showKeyChordsBtn = document.getElementById('show-key-chords-btn');
const suggestProgressionBtn = document.getElementById('suggest-progression-btn');
const keyInfo = document.getElementById('key-info');
const progressionNameInput = document.getElementById('progression-name');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const savedProgressionsContainer = document.getElementById('saved-progressions');
const themeToggle = document.getElementById('theme-toggle');

// Initialize new features
function initNewFeatures() {
    // Initialize modules
    drumTrack = new DrumTrack(audioSynth.audioContext);
    keyHelper = new KeyHelper();
    storageManager = new StorageManager();

    // Setup event listeners for new features
    drumsEnabled.addEventListener('change', handleDrumsToggle);
    drumPattern.addEventListener('change', (e) => drumTrack.setPattern(e.target.value));
    drumVolume.addEventListener('input', handleDrumVolumeChange);
    showKeyChordsBtn.addEventListener('click', showChordsInKey);
    suggestProgressionBtn.addEventListener('click', suggestProgression);
    saveBtn.addEventListener('click', saveProgression);
    exportBtn.addEventListener('click', exportProgression);
    importFile.addEventListener('change', importProgression);
    themeToggle.addEventListener('click', toggleTheme);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Load saved progressions
    displaySavedProgressions();

    // Load theme preference
    loadTheme();

    console.log('[App] New features initialized');
}

// Call after audio init
const originalInit = init;
async function init() {
    await originalInit();
    initNewFeatures();
}

// Drums
function handleDrumsToggle() {
    if (drumsEnabled.checked && isPlaying) {
        drumTrack.start(parseInt(bpmSlider.value));
    } else {
        drumTrack.stop();
    }
}

function handleDrumVolumeChange() {
    const volume = parseInt(drumVolume.value) / 100;
    drumTrack.setVolume(volume);
    drumVolumeValue.textContent = `${drumVolume.value}%`;
}

// Update playProgression to include drums
const originalHandlePlay = handlePlay;
async function handlePlay() {
    await originalHandlePlay();
    if (drumsEnabled.checked) {
        drumTrack.start(parseInt(bpmSlider.value));
    }
}

const originalHandleStop = handleStop;
async function handleStop() {
    await originalHandleStop();
    drumTrack.stop();
}

// Key Helper
function showChordsInKey() {
    const root = keyRoot.value;
    const mode = keyMode.value;
    const chords = mode === 'major'
        ? keyHelper.getChordsInMajorKey(root)
        : keyHelper.getChordsInMinorKey(root);

    let html = `<h4>Chords in ${root} ${mode}:</h4><div class="key-chord-grid">`;
    chords.forEach(chord => {
        html += `<div class="key-chord" onclick="addChordFromKey('${chord.root}', '${chord.type}')">${chord.degree}: ${chord.root}${chord.type === 'Major' ? '' : chord.type}</div>`;
    });
    html += '</div>';
    keyInfo.innerHTML = html;
}

function suggestProgression() {
    const root = keyRoot.value;
    const mode = keyMode.value;
    const suggestions = keyHelper.getSuggestedProgressions(root, mode);

    let html = `<h4>Suggested Progressions in ${root} ${mode}:</h4>`;
    suggestions.forEach(sugg => {
        html += `<div class="progression-suggestion" onclick='loadSuggestedProgression(${JSON.stringify(sugg.progression)})'>
            <strong>${sugg.name}</strong><br>
            ${sugg.progression.map(c => c.root + (c.chord_type === 'Major' ? '' : c.chord_type)).join(' - ')}
        </div>`;
    });
    keyInfo.innerHTML = html;
}

window.addChordFromKey = function(root, type) {
    progression.push({ root: root, chord_type: type, beats: 4 });
    updateProgressionDisplay();
    updateStatus(`Added ${root}${type === 'Major' ? '' : type}`, 'success');
};

window.loadSuggestedProgression = function(prog) {
    progression = prog;
    updateProgressionDisplay();
    updateStatus('Loaded suggested progression', 'success');
};

// Storage
function saveProgression() {
    const name = progressionNameInput.value.trim() || `Progression ${Date.now()}`;
    if (progression.length === 0) {
        updateStatus('Add some chords first!', 'error');
        return;
    }

    storageManager.save(name, progression, parseInt(bpmSlider.value));
    progressionNameInput.value = '';
    displaySavedProgressions();
    updateStatus(`Saved "${name}"`, 'success');
}

function exportProgression() {
    const name = progressionNameInput.value.trim() || `Progression_${Date.now()}`;
    if (progression.length === 0) {
        updateStatus('Add some chords first!', 'error');
        return;
    }

    const data = {
        name: name,
        progression: progression,
        bpm: parseInt(bpmSlider.value)
    };
    storageManager.exportToFile(data, name);
    updateStatus(`Exported "${name}"`, 'success');
}

function importProgression(e) {
    const file = e.target.files[0];
    if (!file) return;

    storageManager.importFromFile(file, (data) => {
        progression = data.progression;
        bpmSlider.value = data.bpm || 120;
        bpmValue.textContent = bpmSlider.value;
        progressionNameInput.value = data.name;
        updateProgressionDisplay();
        updateStatus(`Imported "${data.name}"`, 'success');
    });
}

function displaySavedProgressions() {
    const saved = storageManager.getAll();
    if (saved.length === 0) {
        savedProgressionsContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">No saved progressions yet</p>';
        return;
    }

    let html = '';
    saved.forEach(item => {
        html += `<div class="saved-progression-item">
            <div class="saved-progression-info">
                <div class="saved-progression-name">${item.name}</div>
                <div class="saved-progression-meta">${item.progression.length} chords • ${item.bpm} BPM</div>
            </div>
            <div class="saved-progression-actions">
                <button class="btn btn-primary" onclick="loadSavedProgression(${item.id})">Load</button>
                <button class="btn btn-secondary" onclick="exportSavedProgression(${item.id})">Export</button>
                <button class="btn btn-danger" onclick="deleteSavedProgression(${item.id})">Delete</button>
            </div>
        </div>`;
    });
    savedProgressionsContainer.innerHTML = html;
}

window.loadSavedProgression = function(id) {
    const item = storageManager.load(id);
    if (item) {
        progression = item.progression;
        bpmSlider.value = item.bpm;
        bpmValue.textContent = item.bpm;
        progressionNameInput.value = item.name;
        updateProgressionDisplay();
        updateStatus(`Loaded "${item.name}"`, 'success');
    }
};

window.exportSavedProgression = function(id) {
    const item = storageManager.load(id);
    if (item) {
        storageManager.exportToFile(item, item.name);
        updateStatus(`Exported "${item.name}"`, 'success');
    }
};

window.deleteSavedProgression = function(id) {
    if (confirm('Delete this progression?')) {
        storageManager.delete(id);
        displaySavedProgressions();
        updateStatus('Deleted', 'info');
    }
};

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌙 Dark Mode';
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Space = Play/Stop
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        if (isPlaying) {
            handleStop();
        } else {
            handlePlay();
        }
    }

    // Ctrl+S = Save
    if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        saveProgression();
    }

    // Ctrl+N = New Chord
    if (e.ctrlKey && e.code === 'KeyN') {
        e.preventDefault();
        openChordPicker();
    }

    // Escape = Close Modal
    if (e.code === 'Escape') {
        closeChordPicker();
    }
}

// Drag and Drop for chord reordering
function makeChordsDraggable() {
    const chordSlots = document.querySelectorAll('.chord-slot');
    chordSlots.forEach((slot, index) => {
        slot.draggable = true;
        slot.dataset.index = index;

        slot.addEventListener('dragstart', handleDragStart);
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragend', handleDragEnd);
    });
}

let draggedIndex = null;

function handleDragStart() {
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const dropIndex = parseInt(this.dataset.index);

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
        const draggedChord = progression[draggedIndex];
        progression.splice(draggedIndex, 1);
        progression.splice(dropIndex, 0, draggedChord);
        updateProgressionDisplay();
    }

    this.classList.remove('drag-over');
}

function handleDragEnd() {
    document.querySelectorAll('.chord-slot').forEach(slot => {
        slot.classList.remove('dragging', 'drag-over');
    });
    draggedIndex = null;
}

// Update the original updateProgressionDisplay to add drag-drop
const originalUpdateProgressionDisplay = updateProgressionDisplay;
function updateProgressionDisplay() {
    originalUpdateProgressionDisplay();
    makeChordsDraggable();
}
