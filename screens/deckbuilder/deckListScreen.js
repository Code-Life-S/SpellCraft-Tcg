class DeckListScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        this.cardManager = null;
        this.decks = [];
    }

    async setupContent() {
        // Load decks from CardManager
        this.cardManager = new CardManager();
        await this.cardManager.loadCards();
        
        // Combine predefined decks and custom decks
        this.loadAllDecks();

        // Load HTML template
        const html = await window.templateLoader.loadScreenTemplate('screens/deckbuilder', 'deckListScreen');
        this.element.innerHTML = html;

        // Add CSS (if not already present)
        if (!document.getElementById('deck-list-screen-css')) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = 'screens/deckbuilder/deckListScreen.css';
            style.id = 'deck-list-screen-css';
            document.head.appendChild(style);
        }

        this.renderDecks();
    }

    loadAllDecks() {
        // Get predefined decks from CardManager
        const predefinedDecks = this.cardManager.getAvailableDecks();
        
        // Get custom decks from localStorage
        const customDecks = this._getStoredDecks();
        
        // Combine both, with custom decks taking precedence if same ID
        this.decks = [...predefinedDecks];
        
        // Add custom decks that don't override predefined ones
        customDecks.forEach(customDeck => {
            const existingIndex = this.decks.findIndex(d => d.id === customDeck.id);
            if (existingIndex !== -1) {
                // Replace predefined deck with custom version
                this.decks[existingIndex] = customDeck;
            } else {
                // Add new custom deck
                this.decks.push(customDeck);
            }
        });
        
        console.log(`Loaded ${this.decks.length} decks (${predefinedDecks.length} predefined, ${customDecks.length} custom)`);
    }

    renderDecks() {
        const deckList = this.element.querySelector('.deck-list');
        const emptyMsg = this.element.querySelector('.empty-deck-message');
        // Remove all children
        while (deckList.firstChild) deckList.removeChild(deckList.firstChild);
        if (!this.decks.length) {
            emptyMsg.style.display = '';
            return;
        } else {
            emptyMsg.style.display = 'none';
        }
        this.decks.forEach(deck => {
            const item = document.createElement('div');
            item.className = 'deck-list-item';
            item.dataset.deckId = deck.id;

            const name = document.createElement('span');
            name.className = 'deck-list-name';
            name.textContent = deck.name;
            item.appendChild(name);

            const count = document.createElement('span');
            count.className = 'deck-list-count';
            // Calculate total cards for predefined decks
            const totalCards = this.calculateDeckSize(deck);
            count.textContent = `${totalCards} cards`;
            item.appendChild(count);

            // Only show delete button for custom decks (not predefined ones)
            const isPredefined = this.cardManager.getAvailableDecks().some(d => d.id === deck.id);
            if (!isPredefined) {
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-deck-btn';
                delBtn.title = 'Delete Deck';
                delBtn.dataset.deckId = deck.id;
                delBtn.textContent = '🗑️';
                item.appendChild(delBtn);
            }

            deckList.appendChild(item);
        });
    }

    calculateDeckSize(deck) {
        if (deck.cards && Array.isArray(deck.cards)) {
            // For custom decks, cards is an array of card objects
            if (deck.cards.length > 0 && deck.cards[0].id) {
                return deck.cards.length;
            }
            // For predefined decks, cards is an array of {id, count} objects
            return deck.cards.reduce((total, cardDef) => total + (cardDef.count || 1), 0);
        }
        return 0;
    }

    bindEvents() {
        // Back button
        this.addEventListenerSafe(
            this.element.querySelector('.back-btn'),
            'click',
            () => this.navigateTo('mainmenu')
        );
        // New deck button
        this.addEventListenerSafe(
            this.element.querySelector('.new-deck-btn'),
            'click',
            () => this.createNewDeck()
        );
        // Deck list click (select or delete)
        this.addEventListenerSafe(
            this.element.querySelector('.deck-list'),
            'click',
            (e) => {
                const deleteBtn = e.target.closest('.delete-deck-btn');
                if (deleteBtn) {
                    const deckId = deleteBtn.dataset.deckId;
                    this.deleteDeck(deckId);
                    return;
                }
                const deckItem = e.target.closest('.deck-list-item');
                if (deckItem) {
                    const deckId = deckItem.dataset.deckId;
                    this.openDeck(deckId);
                }
            }
        );
    }

    _getStoredDecks() {
        try {
            return JSON.parse(localStorage.getItem('spellcaster_decks') || '[]');
        } catch {
            return [];
        }
    }

    createNewDeck() {
        const name = prompt('Enter a name for your new deck:', 'New Deck');
        if (!name) return;
        const newDeck = {
            id: 'deck_' + Date.now(),
            name,
            cards: [],
            maxCards: 30
        };
        // Save to localStorage
        const decks = this._getStoredDecks();
        decks.push(newDeck);
        localStorage.setItem('spellcaster_decks', JSON.stringify(decks));
        this.loadAllDecks();
        this.renderDecks();
        this.showMessage('New deck created!', 'success');
    }

    deleteDeck(deckId) {
        if (!confirm('Are you sure you want to delete this deck?')) return;
        let decks = this._getStoredDecks();
        decks = decks.filter(d => d.id !== deckId);
        localStorage.setItem('spellcaster_decks', JSON.stringify(decks));
        this.loadAllDecks();
        this.renderDecks();
        this.showMessage('Deck deleted!', 'info');
    }

    openDeck(deckId) {
        this.navigateTo('deck-builder', { deckId });
    }

    getScreenClass() {
        return 'deck-list';
    }
    getScreenId() {
        return 'deck-list';
    }
}
window.DeckListScreen = DeckListScreen;