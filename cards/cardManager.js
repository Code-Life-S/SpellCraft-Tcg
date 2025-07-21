class CardManager {
    constructor() {
        this.allSpells = [];
        this.loaded = false;
    }

    async loadCards() {
        try {
            const response = await fetch('cards/spells.json');
            if (!response.ok) {
                throw new Error(`Failed to load cards: ${response.status}`);
            }
            const data = await response.json();
            this.allSpells = data.spells;
            this.validateCards();
            this.loaded = true;
        } catch (error) {
            console.error('Error loading cards:', error);
            // Fallback to hardcoded cards if JSON fails
            this.loadFallbackCards();
        }
    }

    validateCards() {
        // Basic validation - could be expanded for development mode
        const requiredFields = ['id', 'name', 'type', 'mana', 'rarity', 'text', 'art', 'targetType'];
        const validTargetTypes = ['single', 'all', 'random', 'self'];
        
        this.allSpells.forEach((card, index) => {
            // Check critical fields only
            if (!card.id || !card.name || !validTargetTypes.includes(card.targetType)) {
                console.error(`Invalid card at index ${index}:`, card);
            }
        });
    }

    loadFallbackCards() {
        this.allSpells = [
            {
                id: "fire_bolt",
                name: "Fire Bolt",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Deal 3 damage to target enemy.",
                art: "🔥",
                damage: 3,
                targetType: "single"
            },
            {
                id: "healing_light",
                name: "Healing Light",
                type: "spell",
                mana: 2,
                rarity: "common",
                text: "Restore 5 health to yourself.",
                art: "✨",
                healing: 5,
                targetType: "self"
            }
        ];
        this.loaded = true;
    }

    // Get random cards for starting hand
    getRandomCards(count = 3) {
        if (!this.loaded) {
            console.error('Cards not loaded yet!');
            return [];
        }

        const cards = [];
        for (let i = 0; i < count; i++) {
            const randomCard = this.allSpells[Math.floor(Math.random() * this.allSpells.length)];
            // Create a copy with unique ID for hand tracking
            cards.push({
                ...randomCard,
                handIndex: i,
                instanceId: Date.now() + Math.random()
            });
        }
        return cards;
    }

    // Get a single random card (for drawing)
    getRandomCard() {
        if (!this.loaded || this.allSpells.length === 0) {
            console.error('No cards available!');
            return null;
        }

        const randomCard = this.allSpells[Math.floor(Math.random() * this.allSpells.length)];
        return {
            ...randomCard,
            instanceId: Date.now() + Math.random()
        };
    }

    // Filter cards by criteria (future deck building)
    filterCards(criteria = {}) {
        if (!this.loaded) return [];

        return this.allSpells.filter(card => {
            if (criteria.mana !== undefined && card.mana !== criteria.mana) return false;
            if (criteria.rarity && card.rarity !== criteria.rarity) return false;
            if (criteria.targetType && card.targetType !== criteria.targetType) return false;
            if (criteria.maxMana !== undefined && card.mana > criteria.maxMana) return false;
            if (criteria.minMana !== undefined && card.mana < criteria.minMana) return false;
            return true;
        });
    }

    // Get cards by rarity (useful for deck building)
    getCardsByRarity(rarity) {
        return this.filterCards({ rarity });
    }

    // Get cards by mana cost
    getCardsByMana(mana) {
        return this.filterCards({ mana });
    }

    // Get all available cards (for deck building UI)
    getAllCards() {
        return [...this.allSpells]; // Return copy to prevent modification
    }

    // Validate a deck composition (future feature)
    validateDeck(cardIds) {
        if (!Array.isArray(cardIds)) return false;
        
        // Basic validation - all cards exist
        return cardIds.every(id => this.allSpells.some(card => card.id === id));
    }

    // Get card by ID
    getCardById(id) {
        return this.allSpells.find(card => card.id === id);
    }

    // Check if cards are loaded
    isLoaded() {
        return this.loaded;
    }
}

// Export for use in main game
window.CardManager = CardManager;