// Storage Manager - Handle saving/loading progressions

class StorageManager {
    constructor() {
        this.storageKey = 'chordProgressions';
    }

    // Get all saved progressions
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];

            const parsed = JSON.parse(data);

            // Security: Validate structure
            if (!Array.isArray(parsed)) {
                console.warn('[Storage] Invalid data format, resetting');
                return [];
            }

            // Security: Validate each item
            return parsed.filter(item =>
                item &&
                typeof item.id === 'number' &&
                typeof item.name === 'string' &&
                Array.isArray(item.progression) &&
                typeof item.bpm === 'number'
            );
        } catch (error) {
            console.error('[Storage] Failed to parse data:', error);
            return [];
        }
    }

    // Save a progression
    save(name, progression, bpm) {
        const progressions = this.getAll();
        const newProgression = {
            id: Date.now(),
            name: name,
            progression: progression,
            bpm: bpm,
            createdAt: new Date().toISOString()
        };

        progressions.push(newProgression);
        localStorage.setItem(this.storageKey, JSON.stringify(progressions));
        console.log('[Storage] Saved progression:', name);
        return newProgression;
    }

    // Update existing progression
    update(id, name, progression, bpm) {
        const progressions = this.getAll();
        const index = progressions.findIndex(p => p.id === id);

        if (index !== -1) {
            progressions[index] = {
                ...progressions[index],
                name: name,
                progression: progression,
                bpm: bpm,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(progressions));
            console.log('[Storage] Updated progression:', name);
            return progressions[index];
        }
        return null;
    }

    // Delete a progression
    delete(id) {
        const progressions = this.getAll();
        const filtered = progressions.filter(p => p.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        console.log('[Storage] Deleted progression ID:', id);
    }

    // Load a specific progression
    load(id) {
        const progressions = this.getAll();
        return progressions.find(p => p.id === id);
    }

    // Export as JSON file
    exportToFile(progression, name) {
        const data = {
            name: name,
            progression: progression.progression,
            bpm: progression.bpm,
            exportedAt: new Date().toISOString(),
            appVersion: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[Storage] Exported to file:', name);
    }

    // Import from JSON file
    importFromFile(file, callback) {
        // Security: Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
            alert('File too large. Maximum size is 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Security: Validate structure thoroughly
                if (!data.progression || !Array.isArray(data.progression)) {
                    throw new Error('Invalid progression data');
                }

                if (data.progression.length > 100) {
                    throw new Error('Progression too long (max 100 chords)');
                }

                // Security: Validate each chord
                for (const chord of data.progression) {
                    if (!chord.root || !chord.chord_type || typeof chord.beats !== 'number') {
                        throw new Error('Invalid chord format');
                    }
                    if (chord.beats < 1 || chord.beats > 16) {
                        throw new Error('Invalid beats value (must be 1-16)');
                    }
                }

                // Security: Sanitize name
                if (data.name) {
                    const div = document.createElement('div');
                    div.textContent = data.name;
                    data.name = div.innerHTML.substring(0, 100);
                }

                callback(data);
                console.log('[Storage] Imported from file:', data.name);
            } catch (error) {
                console.error('[Storage] Import failed:', error);
                alert('Failed to import file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Clear all saved progressions
    clearAll() {
        localStorage.removeItem(this.storageKey);
        console.log('[Storage] Cleared all progressions');
    }
}
