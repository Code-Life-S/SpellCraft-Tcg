/**
 * DeckStorageManager - Unified deck storage using localStorage
 * Handles all deck operations with a single source of truth
 */
class DeckStorageManager {
    constructor() {
        this.STORAGE_KEY = 'spellcaster_decks';
        this.VERSION_KEY = 'spellcaster_decks_version';
        this.CURRENT_VERSION = 1;
        this.initialized = false;
    }

    /**
     * Initialize storage - load defaults on first run
     */
    async initialize() {
        if (this.initialized) return;

        const version = localStorage.getItem(this.VERSION_KEY);
        
        if (!version || parseInt(version) < this.CURRENT_VERSION) {
            console.log('Initializing deck storage with defaults...');
            await this.loadDefaultDecks();
            localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION.toString());
        }

        this.initialized = true;
        console.log('✅ DeckStorageManager initialized');
    }

    /**
     * Load default decks from JSON and merge with existing
     */
    async loadDefaultDecks() {
        try {
            const response = await fetch('cards/decks.json');
            if (!response.ok) {
                throw new Error(`Failed to load default decks: ${response.status}`);
            }
            
            const data = await response.json();
            const existingDecks = this.getAllDecks();
            
            // Convert default decks to unified format
            const defaultDecks = data.decks.map(deck => ({
                ...deck,
                isDefault: true,
                created: Date.now(),
                modified: Date.now()
            }));

            // Merge with existing custom decks (don't overwrite custom decks)
            const mergedDecks = this.mergeDecks(existingDecks, defaultDecks);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedDecks));
            console.log(`Loaded ${defaultDecks.length} default decks`);
            
        } catch (error) {
            console.warn('Could not load default decks:', error);
            // Continue with existing decks or empty array
        }
    }

    /**
     * Merge existing decks with new defaults
     */
    mergeDecks(existingDecks, defaultDecks) {
        const merged = [...existingDecks];
        
        defaultDecks.forEach(defaultDeck => {
            const existingIndex = merged.findIndex(d => d.id === defaultDeck.id);
            
            if (existingIndex === -1) {
                // Add new default deck
                merged.push(defaultDeck);
            } else if (merged[existingIndex].isDefault) {
                // Update existing default deck (preserve user modifications)
                merged[existingIndex] = {
                    ...defaultDeck,
                    modified: merged[existingIndex].modified || Date.now()
                };
            }
            // Don't overwrite custom decks with same ID
        });

        return merged;
    }

    /**
     * Get all decks from storage
     */
    getAllDecks() {
        try {
            const decks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            return Array.isArray(decks) ? decks : [];
        } catch (error) {
            console.error('Error reading decks from storage:', error);
            return [];
        }
    }

    /**
     * Get specific deck by ID
     */
    getDeck(deckId) {
        const decks = this.getAllDecks();
        return decks.find(deck => deck.id === deckId) || null;
    }

    /**
     * Save or update a deck
     */
    saveDeck(deck) {
        if (!deck.id || !deck.name) {
            throw new Error('Deck must have id and name');
        }

        const decks = this.getAllDecks();
        const existingIndex = decks.findIndex(d => d.id === deck.id);
        
        const deckToSave = {
            ...deck,
            modified: Date.now(),
            created: deck.created || Date.now()
        };

        if (existingIndex !== -1) {
            // Update existing deck
            decks[existingIndex] = deckToSave;
        } else {
            // Add new deck
            decks.push(deckToSave);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(decks));
        console.log(`Saved deck: ${deck.name}`);
        return deckToSave;
    }

    /**
     * Delete a deck by ID
     */
    deleteDeck(deckId) {
        const decks = this.getAllDecks();
        const deckIndex = decks.findIndex(d => d.id === deckId);
        
        if (deckIndex === -1) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const deck = decks[deckIndex];
        
        // Prevent deletion of default decks (optional - you might want to allow this)
        if (deck.isDefault) {
            throw new Error('Cannot delete default decks. Use reset instead.');
        }

        decks.splice(deckIndex, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(decks));
        console.log(`Deleted deck: ${deck.name}`);
        return deck;
    }

    /**
     * Duplicate a deck with new ID
     */
    duplicateDeck(deckId, newName = null) {
        const originalDeck = this.getDeck(deckId);
        if (!originalDeck) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const duplicatedDeck = {
            ...originalDeck,
            id: 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: newName || `${originalDeck.name} (Copy)`,
            isDefault: false,
            created: Date.now(),
            modified: Date.now()
        };

        return this.saveDeck(duplicatedDeck);
    }

    /**
     * Reset a default deck to its original state
     */
    async resetDeckToDefault(deckId) {
        const deck = this.getDeck(deckId);
        if (!deck || !deck.isDefault) {
            throw new Error('Can only reset default decks');
        }

        // Reload defaults and find this deck
        const response = await fetch('cards/decks.json');
        const data = await response.json();
        const originalDeck = data.decks.find(d => d.id === deckId);
        
        if (!originalDeck) {
            throw new Error('Original deck definition not found');
        }

        const resetDeck = {
            ...originalDeck,
            isDefault: true,
            created: deck.created,
            modified: Date.now()
        };

        return this.saveDeck(resetDeck);
    }

    /**
     * Create a new empty deck
     */
    createNewDeck(name = 'New Deck') {
        const newDeck = {
            id: 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name,
            description: '',
            cards: [],
            isDefault: false,
            created: Date.now(),
            modified: Date.now()
        };

        return this.saveDeck(newDeck);
    }

    /**
     * Get deck statistics
     */
    getDeckStats() {
        const decks = this.getAllDecks();
        return {
            total: decks.length,
            default: decks.filter(d => d.isDefault).length,
            custom: decks.filter(d => !d.isDefault).length,
            totalCards: decks.reduce((sum, deck) => {
                return sum + (deck.cards?.reduce((cardSum, card) => cardSum + (card.count || 1), 0) || 0);
            }, 0)
        };
    }

    /**
     * Export all decks as JSON
     */
    exportDecks() {
        const decks = this.getAllDecks();
        return {
            version: this.CURRENT_VERSION,
            exported: Date.now(),
            decks: decks
        };
    }

    /**
     * Import decks from JSON (merge with existing)
     */
    importDecks(importData, overwrite = false) {
        if (!importData.decks || !Array.isArray(importData.decks)) {
            throw new Error('Invalid import data format');
        }

        const existingDecks = this.getAllDecks();
        let imported = 0;
        let skipped = 0;

        importData.decks.forEach(importDeck => {
            const existingIndex = existingDecks.findIndex(d => d.id === importDeck.id);
            
            if (existingIndex === -1) {
                // New deck - add it
                existingDecks.push({
                    ...importDeck,
                    created: Date.now(),
                    modified: Date.now()
                });
                imported++;
            } else if (overwrite) {
                // Overwrite existing
                existingDecks[existingIndex] = {
                    ...importDeck,
                    created: existingDecks[existingIndex].created,
                    modified: Date.now()
                };
                imported++;
            } else {
                skipped++;
            }
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingDecks));
        return { imported, skipped };
    }

    /**
     * Clear all storage (for development/testing)
     */
    clearAllStorage() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.VERSION_KEY);
        this.initialized = false;
        console.log('🗑️ Cleared all deck storage');
    }
}

// Export to global scope
window.DeckStorageManager = DeckStorageManager;