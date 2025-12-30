// Storage Manager - Handle saving/loading progressions

class StorageManager {
    constructor() {
        this.storageKey = 'chordProgressions';
    }

    // Get all saved progressions
    getAll() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
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
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.progression && Array.isArray(data.progression)) {
                    callback(data);
                    console.log('[Storage] Imported from file:', data.name);
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('[Storage] Import failed:', error);
                alert('Failed to import file. Please check the format.');
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
