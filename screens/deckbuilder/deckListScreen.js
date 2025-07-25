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
        this.decks = this.cardManager.getAvailableDecks();

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
            count.textContent = `${deck.cards.length} cards`;
            item.appendChild(count);

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-deck-btn';
            delBtn.title = 'Delete Deck';
            delBtn.dataset.deckId = deck.id;
            delBtn.textContent = '🗑️';
            item.appendChild(delBtn);

            deckList.appendChild(item);
        });
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
        this.decks = this.cardManager.getAvailableDecks();
        this.renderDecks();
        this.showMessage('New deck created!', 'success');
    }

    deleteDeck(deckId) {
        if (!confirm('Are you sure you want to delete this deck?')) return;
        let decks = this._getStoredDecks();
        decks = decks.filter(d => d.id !== deckId);
        localStorage.setItem('spellcaster_decks', JSON.stringify(decks));
        this.decks = this.cardManager.getAvailableDecks();
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