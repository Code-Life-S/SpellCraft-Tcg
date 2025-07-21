class CardManager {
    constructor() {
        this.allSpells = [];
        this.allDecks = [];
        this.currentDeck = [];
        this.remainingDeck = [];
        this.loaded = false;
        this.decksLoaded = false;
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
            
            // Also load decks
            await this.loadDecks();
        } catch (error) {
            console.error('Error loading cards:', error);
            // Fallback to hardcoded cards if JSON fails
            this.loadFallbackCards();
        }
    }

    async loadDecks() {
        try {
            const response = await fetch('cards/decks.json');
            if (!response.ok) {
                throw new Error(`Failed to load decks: ${response.status}`);
            }
            const data = await response.json();
            this.allDecks = data.decks;
            this.decksLoaded = true;
            
            // Load default starter deck
            this.loadDeck('starter_deck');
        } catch (error) {
            console.error('Error loading decks:', error);
            // Fallback to creating a basic deck from available cards
            this.createFallbackDeck();
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

    // Get starting hand from deck
    getStartingHand(count = 3) {
        if (!this.isLoaded()) {
            console.error('Cards and decks not loaded yet!');
            return [];
        }

        return this.drawMultipleCardsFromDeck(count);
    }

    // Legacy method for compatibility - now draws from deck
    getRandomCards(count = 3) {
        return this.getStartingHand(count);
    }

    // Get a single card from deck (for drawing)
    getRandomCard() {
        if (!this.isLoaded()) {
            console.error('Cards and decks not loaded yet!');
            return null;
        }

        return this.drawCardFromDeck();
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

    // Deck Management Methods
    loadDeck(deckId) {
        const deck = this.allDecks.find(d => d.id === deckId);
        if (!deck) {
            console.error(`Deck ${deckId} not found!`);
            return false;
        }

        // Build the deck array from card definitions
        this.currentDeck = [];
        deck.cards.forEach(cardDef => {
            const card = this.getCardById(cardDef.id);
            if (card) {
                for (let i = 0; i < cardDef.count; i++) {
                    this.currentDeck.push({
                        ...card,
                        deckIndex: this.currentDeck.length
                    });
                }
            }
        });

        // Reset and shuffle the deck
        this.resetDeck();
        
        console.log(`Loaded deck: ${deck.name} (${this.currentDeck.length} cards)`);
        return true;
    }

    shuffleDeck() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.remainingDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.remainingDeck[i], this.remainingDeck[j]] = [this.remainingDeck[j], this.remainingDeck[i]];
        }
    }

    resetDeck() {
        // Reset remaining deck to full deck
        this.remainingDeck = [...this.currentDeck];
        this.shuffleDeck();
    }

    drawCardFromDeck() {
        if (this.remainingDeck.length === 0) {
            console.warn('Deck is empty! Cannot draw more cards.');
            return null;
        }

        const drawnCard = this.remainingDeck.pop();
        return {
            ...drawnCard,
            instanceId: Date.now() + Math.random()
        };
    }

    drawMultipleCardsFromDeck(count) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            const card = this.drawCardFromDeck();
            if (card) {
                cards.push(card);
            }
        }
        return cards;
    }

    createFallbackDeck() {
        // Create a basic deck if decks.json fails to load
        if (this.allSpells.length === 0) return;

        this.currentDeck = [];
        // Add 2 copies of each available spell (up to 30 cards)
        const maxCards = 30;
        let cardCount = 0;

        for (const spell of this.allSpells) {
            if (cardCount >= maxCards) break;
            
            const copies = Math.min(2, maxCards - cardCount);
            for (let i = 0; i < copies; i++) {
                this.currentDeck.push({
                    ...spell,
                    deckIndex: this.currentDeck.length
                });
                cardCount++;
            }
        }

        this.resetDeck();
        this.decksLoaded = true;
        console.log('Created fallback deck with', this.currentDeck.length, 'cards');
    }

    // Get deck information for UI
    getDeckInfo() {
        return {
            totalCards: this.currentDeck.length,
            remainingCards: this.remainingDeck.length,
            cardsDrawn: this.currentDeck.length - this.remainingDeck.length
        };
    }

    // Get remaining cards grouped by card ID for deck tracker
    getRemainingCardCounts() {
        const counts = {};
        this.remainingDeck.forEach(card => {
            counts[card.id] = (counts[card.id] || 0) + 1;
        });
        return counts;
    }

    // Get all available decks
    getAvailableDecks() {
        return [...this.allDecks];
    }

    // Check if cards and decks are loaded
    isLoaded() {
        return this.loaded && this.decksLoaded;
    }
}

// Export for use in main game
window.CardManager = CardManager;