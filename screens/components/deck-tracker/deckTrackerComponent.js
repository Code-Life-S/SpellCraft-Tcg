class DeckTrackerComponent {
    constructor(rootElement, containerSelector) {
        this.root = rootElement;
        this.container = rootElement.querySelector(containerSelector);
        this.getDeckInfo = null;
        this.getCardCounts = null;
        this.getCardById = null;
    }

    destroy() {
        this.root = null;
        this.container = null;
    }

    setDataSources(getDeckInfo, getCardCounts, getCardById) {
        this.getDeckInfo = getDeckInfo;
        this.getCardCounts = getCardCounts;
        this.getCardById = getCardById;
    }

    update() {
        if (!this.getDeckInfo || !this.container) return;

        const deckInfo = this.getDeckInfo();
        const remainingCounts = this.getCardCounts ? this.getCardCounts() : {};

        const remainingEl = this.container.querySelector('#deck-remaining');
        if (remainingEl) {
            remainingEl.textContent = deckInfo.remainingCards;
        }

        const cardsContainer = this.container.querySelector('#deck-cards');
        if (!cardsContainer) return;

        cardsContainer.innerHTML = '';

        const cardEntries = Object.entries(remainingCounts);
        cardEntries.sort((a, b) => {
            const cardA = this.getCardById ? this.getCardById(a[0]) : null;
            const cardB = this.getCardById ? this.getCardById(b[0]) : null;
            if (cardA && cardB) {
                if (cardA.mana !== cardB.mana) return cardA.mana - cardB.mana;
                return cardA.name.localeCompare(cardB.name);
            }
            return 0;
        });

        cardEntries.forEach(([cardId, count]) => {
            const card = this.getCardById ? this.getCardById(cardId) : null;
            if (!card) return;
            const item = document.createElement('div');
            item.className = 'deck-card-item';
            item.innerHTML =
                '<span class="deck-card-mana">' + card.mana + '</span>' +
                '<span class="deck-card-art">' + card.art + '</span>' +
                '<span class="deck-card-name">' + card.name + '</span>' +
                '<span class="deck-card-count">x' + count + '</span>';
            cardsContainer.appendChild(item);
        });

        if (deckInfo.remainingCards === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'deck-empty-message';
            emptyMsg.textContent = 'Deck is empty!';
            cardsContainer.appendChild(emptyMsg);
        }
    }
}

window.DeckTrackerComponent = DeckTrackerComponent;
