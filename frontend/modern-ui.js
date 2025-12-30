// Modern UI Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializePianoKeyboard();
    initializeChordPills();
    setupModernEventListeners();
});

// Generate Piano Keyboard
function initializePianoKeyboard() {
    const pianoContainer = document.getElementById('piano-keyboard');
    if (!pianoContainer) return;

    const octaves = 2; // Show 2 octaves
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    for (let octave = 0; octave < octaves; octave++) {
        notes.forEach((note, index) => {
            const key = document.createElement('div');
            key.className = note.includes('#') ? 'piano-key black' : 'piano-key white';
            key.dataset.note = note + (octave + 4);

            // Add click event
            key.addEventListener('click', function() {
                playPianoNote(this.dataset.note);
                highlightKey(this);
            });

            pianoContainer.appendChild(key);
        });
    }
}

// Highlight piano key when played
function highlightKey(keyElement) {
    keyElement.classList.add('active');
    setTimeout(() => {
        keyElement.classList.remove('active');
    }, 300);
}

// Play note (to be integrated with existing audio system)
function playPianoNote(note) {
    console.log('Playing note:', note);
    // This will be connected to the existing soundfont-synth.js
}

// Initialize sample chord pills
function initializeChordPills() {
    const container = document.querySelector('.modern-progression');
    if (!container) return;

    // Sample progression: C - Am - F - G
    const sampleChords = [
        { chords: 'C / Am / F / G', label: 'verse' },
        { chords: 'F / G / Am / Em', label: 'chorus' },
        { chords: 'F / G / C', label: 'tag' }
    ];

    sampleChords.forEach(item => {
        const pill = createChordPill(item.chords, item.label);
        container.appendChild(pill);
    });
}

// Create a chord pill element
function createChordPill(chordText, label) {
    const pill = document.createElement('div');
    pill.className = `chord-pill ${label}`;

    pill.innerHTML = `
        <div class="chord-pill-content">${chordText}</div>
        <div class="chord-pill-label">${label}</div>
        <button class="chord-pill-remove">✕</button>
    `;

    // Remove button handler
    pill.querySelector('.chord-pill-remove').addEventListener('click', function(e) {
        e.stopPropagation();
        pill.remove();
    });

    return pill;
}

// Setup modern UI event listeners
function setupModernEventListeners() {
    // Add progression button (old one)
    const addProgBtn = document.getElementById('add-chord-progression-btn');
    if (addProgBtn) {
        addProgBtn.addEventListener('click', function() {
            // Show chord picker modal
            const modal = document.getElementById('chord-picker-modal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }

    // Add chord button (new simple one)
    const addChordBtn = document.getElementById('add-chord-btn');
    if (addChordBtn) {
        addChordBtn.addEventListener('click', function() {
            // Show chord picker modal
            const modal = document.getElementById('chord-picker-modal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }

    // Quick chord buttons
    document.querySelectorAll('.quick-chord-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chordName = this.dataset.chord;
            addQuickChord(chordName);
        });
    });

    // Randomize button
    const randomizeBtn = document.getElementById('randomize-btn');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', function() {
            const loadRandomBtn = document.getElementById('load-random-btn');
            if (loadRandomBtn) {
                loadRandomBtn.click();
            }
        });
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (typeof clearProgression === 'function') {
                clearProgression();
            }
        });
    }

    // Modern play button
    const playBtnModern = document.getElementById('play-btn-modern');
    const originalPlayBtn = document.getElementById('play-btn');
    const originalStopBtn = document.getElementById('stop-btn');

    if (playBtnModern && originalPlayBtn) {
        playBtnModern.addEventListener('click', function() {
            const svg = this.querySelector('svg');
            const currentPath = svg.querySelector('path').getAttribute('d');

            // Check if currently playing by checking if stop button is enabled
            const isPlaying = originalStopBtn && !originalStopBtn.disabled;

            if (isPlaying) {
                // Pause playback (not stop)
                if (typeof handlePause === 'function') {
                    handlePause();
                }
                // Change to play icon
                svg.querySelector('path').setAttribute('d', 'M8 5v14l11-7z');
            } else {
                // Start/Resume playback
                originalPlayBtn.click();
                // Change to pause icon
                svg.querySelector('path').setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z');
            }
        });

        // Listen for play button state changes to update icon
        if (originalPlayBtn) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'disabled') {
                        const svg = playBtnModern.querySelector('svg');
                        if (!originalPlayBtn.disabled) {
                            // Not playing - show play icon
                            svg.querySelector('path').setAttribute('d', 'M8 5v14l11-7z');
                        } else {
                            // Playing - show pause icon
                            svg.querySelector('path').setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z');
                        }
                    }
                });
            });
            observer.observe(originalPlayBtn, { attributes: true });
        }
    }

    // Chord circle buttons
    document.querySelectorAll('.chord-circle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chord-circle-btn').forEach(b => b.classList.remove('chord-active'));
            this.classList.add('chord-active');

            const chord = this.dataset.chord;
            console.log('Selected chord:', chord);

            // Highlight corresponding notes on piano
            highlightChordOnPiano(chord);
        });
    });

    // Preset cards
    document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', function() {
            const type = card.querySelector('.preset-type')?.textContent;
            console.log('Selected preset:', type || 'custom');

            // Load preset progression (to be implemented)
            loadPreset(type);
        });
    });

    // Control panels
    document.querySelectorAll('.control-panel').forEach(panel => {
        panel.addEventListener('click', function() {
            const label = this.querySelector('.panel-sublabel').textContent;
            console.log('Clicked panel:', label);

            // Show corresponding settings (to be implemented)
            if (label.includes('key')) {
                showKeySettings();
            } else if (label.includes('tempo')) {
                showTempoSettings();
            } else if (label.includes('sounds')) {
                showSoundSettings();
            }
        });
    });

    // Info button
    document.querySelector('.info-btn')?.addEventListener('click', function() {
        alert('Chord Progression Builder\n\nCreate beautiful chord progressions with our intuitive interface.');
    });

    // Home button
    document.getElementById('home-btn')?.addEventListener('click', function() {
        location.reload();
    });

    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', function() {
        // Toggle old controls visibility
        const oldSections = document.querySelectorAll('.top-controls, .instrument-section, .drums-section, .key-helper-section, .preset-section');
        oldSections.forEach(section => {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Highlight chord notes on piano
function highlightChordOnPiano(chordName) {
    // Clear existing highlights
    document.querySelectorAll('.piano-key').forEach(key => {
        key.classList.remove('active');
    });

    // Simple chord mapping (can be expanded)
    const chordMap = {
        'C': ['C4', 'E4', 'G4'],
        'Am': ['A4', 'C5', 'E5'],
        'F': ['F4', 'A4', 'C5'],
        'G': ['G4', 'B4', 'D5']
    };

    const notes = chordMap[chordName] || [];
    notes.forEach(note => {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.add('active');
        }
    });
}

// Show settings panels (placeholders)
function showKeySettings() {
    alert('Key settings panel - to be implemented');
}

function showTempoSettings() {
    alert('Tempo settings panel - to be implemented');
}

function showSoundSettings() {
    alert('Sound settings panel - to be implemented');
}

function loadPreset(type) {
    alert(`Loading ${type || 'custom'} preset - to be implemented`);
}

// Add a quick chord to the progression
function addQuickChord(chordName) {
    // Parse chord name to root and type
    let root = chordName;
    let type = 'Major';

    // Handle minor chords (Dm, Em, Am)
    if (chordName.includes('m') && !chordName.includes('dim')) {
        root = chordName.replace('m', '');
        type = 'Minor';
    }
    // Handle diminished (Bdim)
    else if (chordName.includes('dim')) {
        root = chordName.replace('dim', '');
        type = 'Dim';
    }

    // Directly add the chord to progression (more reliable than clicking buttons)
    const chord = {
        root: root,
        chord_type: type,
        beats: 4
    };

    // Access the global progression array from app.js
    if (typeof progression !== 'undefined' && typeof updateProgressionDisplay === 'function') {
        progression.push(chord);
        updateProgressionDisplay();
        console.log('[ModernUI] Added quick chord:', chordName, 'Progression length:', progression.length);
    } else {
        console.error('[ModernUI] Could not add chord - progression or updateProgressionDisplay not found');
    }
}

// Export functions for use in other scripts
window.modernUI = {
    createChordPill,
    highlightChordOnPiano,
    highlightKey,
    addQuickChord
};
