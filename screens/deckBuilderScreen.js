/**
 * DeckBuilderScreen - Deck building and customization interface
 * Allows players to create and modify their spell decks
 */
class DeckBuilderScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        this.cardManager = null;
        this.availableSpells = [];
        this.currentDeck = {
            name: "New Deck",
            cards: [],
            maxCards: 30
        };
        this.filters = {
            search: "",
            mana: "all",
            rarity: "all"
        };
        this.selectedCard = null;
    }

    async setupContent() {
        try {
            // Load HTML template from external file
            const html = await window.templateLoader.loadScreenTemplate('screens/deckbuilder', 'deckBuilderScreen');
            this.element.innerHTML = html;

            // Initialize card manager
            this.cardManager = new CardManager();
            await this.cardManager.loadCards();
            
            // Load available spells
            this.availableSpells = this.cardManager.getAllCards();
            
            // Load existing decks or create default
            this.loadDecks();
            
            // Setup initial UI
            this.updateDeckInfo();
            this.updateSpellGrid();
            this.updateManaChart();
            
            console.log('✅ DeckBuilderScreen content setup complete');
        } catch (error) {
            console.error('❌ Failed to setup DeckBuilderScreen content:', error);
            this.element.innerHTML = `
                <div class="error-message">
                    <h2>⚠️ Error Loading Deck Builder</h2>
                    <p>Failed to load deck builder interface: ${error.message}</p>
                    <button onclick="this.closest('.screen').querySelector('.back-btn')?.click()">Go Back</button>
                </div>
            `;
        }
    }

    async onBeforeShow(data) {
        // If a deckId is provided, load that deck
        if (data && data.deckId) {
            await this.loadDeckById(data.deckId);
        } else {
            this.createNewDeck();
        }
        
        // Update UI after loading deck
        this.updateDeckInfo();
        this.updateDeckCardsList();
        this.updateManaChart();
        this.updateSpellGrid(); // Update spell grid to show proper indicators
    }

    bindEvents() {
        if (!this.element) return;

        // Header buttons
        this.addEventListenerSafe(
            this.element.querySelector('.back-btn'),
            'click',
            () => this.navigateTo('deck-list')
        );
        this.addEventListenerSafe(
            this.element.querySelector('.save-deck-btn'),
            'click',
            () => this.saveDeck()
        );
        this.addEventListenerSafe(
            this.element.querySelector('.delete-deck-btn'),
            'click',
            () => this.deleteDeck()
        );
        this.addEventListenerSafe(
            this.element.querySelector('.new-deck-btn'),
            'click',
            () => this.createNewDeck()
        );

        // Deck name editing
        this.addEventListenerSafe(
            this.element.querySelector('.deck-name-input'),
            'input',
            (e) => {
                this.currentDeck.name = e.target.value;
            }
        );

        // Filters
        this.addEventListenerSafe(
            this.element.querySelector('.search-input'),
            'input',
            (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.updateSpellGrid();
            }
        );
        this.addEventListenerSafe(
            this.element.querySelector('.mana-filter'),
            'change',
            (e) => {
                this.filters.mana = e.target.value;
                this.updateSpellGrid();
            }
        );
        this.addEventListenerSafe(
            this.element.querySelector('.rarity-filter'),
            'change',
            (e) => {
                this.filters.rarity = e.target.value;
                this.updateSpellGrid();
            }
        );
        this.addEventListenerSafe(
            this.element.querySelector('.clear-filters-btn'),
            'click',
            () => {
                this.clearFilters();
            }
        );

        // Spell grid interactions
        this.addEventListenerSafe(
            this.element.querySelector('.spell-grid'),
            'click',
            (e) => {
                const spellCard = e.target.closest('.spell-card');
                if (spellCard) {
                    this.handleSpellCardClick(spellCard);
                }
            }
        );

        // Deck list interactions
        this.addEventListenerSafe(
            this.element.querySelector('.deck-cards-list'),
            'click',
            (e) => {
                const deckCard = e.target.closest('.deck-card');
                if (deckCard) {
                    this.handleDeckCardClick(deckCard);
                }
            }
        );
    }

    handleSpellCardClick(spellCard) {
        const spellId = spellCard.dataset.spellId;
        const spell = this.availableSpells.find(s => s.id === spellId);
        
        if (!spell) return;

        // Don't allow clicking on disabled cards
        if (spellCard.classList.contains('disabled')) {
            this.showMessage('Maximum 2 copies per card allowed!', 'warning');
            return;
        }

        // Add to deck if not at max capacity
        if (this.currentDeck.cards.length < this.currentDeck.maxCards) {
            this.addCardToDeck(spell);
        } else {
            this.showMessage('Deck is full! Remove cards first.', 'warning');
        }
    }

    handleDeckCardClick(deckCard) {
        const spellId = deckCard.dataset.spellId;
        this.removeCardFromDeck(spellId);
    }

    addCardToDeck(spell) {
        // Check if we already have 2 copies (max per card)
        const existingCount = this.currentDeck.cards.filter(c => c.id === spell.id).length;
        if (existingCount >= 2) {
            this.showMessage('Maximum 2 copies per card allowed!', 'warning');
            return;
        }

        this.currentDeck.cards.push({ ...spell });
        this.updateDeckInfo();
        this.updateDeckCardsList();
        this.updateManaChart();
        this.updateSpellGrid(); // Update spell grid to reflect new card counts
        this.showMessage(`Added ${spell.name} to deck`, 'success');
    }

    removeCardFromDeck(spellId) {
        const index = this.currentDeck.cards.findIndex(c => c.id === spellId);
        if (index !== -1) {
            const removedCard = this.currentDeck.cards.splice(index, 1)[0];
            this.updateDeckInfo();
            this.updateDeckCardsList();
            this.updateManaChart();
            this.updateSpellGrid(); // Update spell grid to reflect new card counts
            this.showMessage(`Removed ${removedCard.name} from deck`, 'info');
        }
    }

    updateDeckInfo() {
        const deckNameInput = this.element.querySelector('.deck-name-input');
        const cardCount = this.element.querySelector('.card-count');
        
        if (deckNameInput) deckNameInput.value = this.currentDeck.name;
        if (cardCount) cardCount.textContent = `${this.currentDeck.cards.length}/${this.currentDeck.maxCards}`;
    }

    updateSpellGrid() {
        const spellGrid = this.element.querySelector('.spell-grid');
        if (!spellGrid) return;

        // Calculate card counts in current deck
        const deckCardCounts = {};
        this.currentDeck.cards.forEach(card => {
            deckCardCounts[card.id] = (deckCardCounts[card.id] || 0) + 1;
        });

        // Filter spells
        let filteredSpells = this.availableSpells.filter(spell => {
            const matchesSearch = !this.filters.search || 
                spell.name.toLowerCase().includes(this.filters.search) ||
                spell.text.toLowerCase().includes(this.filters.search);
            
            const matchesMana = this.filters.mana === 'all' || 
                spell.mana.toString() === this.filters.mana;
            
            const matchesRarity = this.filters.rarity === 'all' || 
                spell.rarity === this.filters.rarity;

            return matchesSearch && matchesMana && matchesRarity;
        });

        // Generate spell cards HTML
        spellGrid.innerHTML = filteredSpells.map(spell => {
            const countInDeck = deckCardCounts[spell.id] || 0;
            const isMaxed = countInDeck >= 2;
            const hasInDeck = countInDeck > 0;
            
            return `
                <div class="spell-card ${isMaxed ? 'disabled' : ''}" data-spell-id="${spell.id}" title="${spell.text}">
                    <div class="spell-art">${spell.art}</div>
                    <div class="spell-mana">${spell.mana}</div>
                    <div class="spell-name">${spell.name}</div>
                    <div class="spell-rarity ${spell.rarity}"></div>
                    ${hasInDeck ? `<div class="card-count-indicator">${countInDeck}/2</div>` : ''}
                </div>
            `;
        }).join('');
    }

    updateDeckCardsList() {
        const deckCardsList = this.element.querySelector('.deck-cards-list');
        if (!deckCardsList) return;

        // Group cards by ID and count
        const cardCounts = {};
        this.currentDeck.cards.forEach(card => {
            cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
        });

        // Generate deck cards HTML
        const uniqueCards = Object.keys(cardCounts).map(cardId => {
            const card = this.currentDeck.cards.find(c => c.id === cardId);
            return { ...card, count: cardCounts[cardId] };
        });

        deckCardsList.innerHTML = uniqueCards.map(card => `
            <div class="deck-card" data-spell-id="${card.id}">
                <span class="deck-card-art">${card.art}</span>
                <span class="deck-card-name">${card.name}</span>
                <span class="deck-card-count">x${card.count}</span>
                <span class="deck-card-mana">${card.mana}</span>
            </div>
        `).join('');
    }

    updateManaChart() {
        const manaChart = this.element.querySelector('.mana-chart');
        if (!manaChart) return;

        // Calculate mana distribution
        const manaCounts = [0, 0, 0, 0, 0, 0, 0]; // 0-6+ mana
        this.currentDeck.cards.forEach(card => {
            const mana = Math.min(card.mana, 6);
            manaCounts[mana]++;
        });

        // Find max count for scaling
        const maxCount = Math.max(...manaCounts, 1);

        // Generate chart bars
        manaChart.innerHTML = manaCounts.map((count, mana) => {
            const height = (count / maxCount) * 100;
            const label = mana === 6 ? '6+' : mana.toString();
            return `
                <div class="mana-bar">
                    <div class="mana-bar-fill" style="height: ${height}%"></div>
                    <div class="mana-bar-count">${count}</div>
                    <div class="mana-bar-label">${label}</div>
                </div>
            `;
        }).join('');
    }

    clearFilters() {
        this.filters = { search: "", mana: "all", rarity: "all" };
        
        const searchInput = this.element.querySelector('.search-input');
        const manaFilter = this.element.querySelector('.mana-filter');
        const rarityFilter = this.element.querySelector('.rarity-filter');
        
        if (searchInput) searchInput.value = '';
        if (manaFilter) manaFilter.value = 'all';
        if (rarityFilter) rarityFilter.value = 'all';
        
        this.updateSpellGrid();
    }

    saveDeck() {
        try {
            // Convert deck format for storage
            const deckToSave = {
                id: this.currentDeck.id || 'deck_' + Date.now(),
                name: this.currentDeck.name,
                description: this.currentDeck.description || '',
                cards: this.convertCardsToStorageFormat(this.currentDeck.cards),
                isDefault: false
            };
            
            this.cardManager.deckStorage.saveDeck(deckToSave);
            this.currentDeck.id = deckToSave.id; // Update current deck with ID
            this.showMessage(`Deck "${this.currentDeck.name}" saved!`, 'success');
        } catch (error) {
            this.showMessage(`Error saving deck: ${error.message}`, 'error');
        }
    }

    deleteDeck() {
        if (!this.currentDeck.id) {
            this.showMessage('Cannot delete unsaved deck', 'warning');
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${this.currentDeck.name}"?`)) {
            try {
                this.cardManager.deckStorage.deleteDeck(this.currentDeck.id);
                this.createNewDeck();
                this.showMessage('Deck deleted!', 'info');
            } catch (error) {
                this.showMessage(`Error deleting deck: ${error.message}`, 'error');
            }
        }
    }

    createNewDeck() {
        this.currentDeck = {
            id: null, // Will be assigned when saved
            name: "New Deck",
            description: "",
            cards: [],
            maxCards: 30
        };
        
        this.updateDeckInfo();
        this.updateDeckCardsList();
        this.updateManaChart();
        this.updateSpellGrid(); // Update spell grid to clear any indicators
        this.showMessage('New deck created!', 'success');
    }

    loadDecks() {
        const decks = this.cardManager.deckStorage.getAllDecks();
        if (decks.length > 0) {
            // Load first available deck
            this.loadDeckById(decks[0].id);
        }
    }

    async loadDeckById(deckId) {
        const foundDeck = this.cardManager.deckStorage.getDeck(deckId);
        
        if (foundDeck) {
            // Convert storage format to deck builder format
            this.currentDeck = this.convertStorageDeckToBuilder(foundDeck);
            console.log(`Loaded deck: ${foundDeck.name}`);
            return;
        }
        
        // If no deck found, create new deck
        console.warn(`Deck with ID ${deckId} not found, creating new deck`);
        this.createNewDeck();
    }

    convertStorageDeckToBuilder(storageDeck) {
        const convertedDeck = {
            id: storageDeck.id,
            name: storageDeck.name,
            description: storageDeck.description || '',
            cards: [],
            maxCards: 30
        };
        
        // Convert card definitions to actual card objects
        storageDeck.cards.forEach(cardDef => {
            const spell = this.availableSpells.find(s => s.id === cardDef.id);
            if (spell) {
                // Add the specified number of copies
                for (let i = 0; i < cardDef.count; i++) {
                    convertedDeck.cards.push({ ...spell });
                }
            } else {
                console.warn(`Spell ${cardDef.id} not found in available spells`);
            }
        });
        
        return convertedDeck;
    }

    convertCardsToStorageFormat(cards) {
        // Group cards by ID and count
        const cardCounts = {};
        cards.forEach(card => {
            cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
        });
        
        // Convert to storage format
        return Object.keys(cardCounts).map(cardId => ({
            id: cardId,
            count: cardCounts[cardId]
        }));
    }

    getScreenClass() {
        return 'deck-builder';
    }

    getScreenId() {
        return 'deck-builder';
    }
}

// Export to global scope
window.DeckBuilderScreen = DeckBuilderScreen;