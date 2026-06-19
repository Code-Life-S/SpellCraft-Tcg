class PlayerHandComponent {
    constructor(rootElement, containerSelector) {
        this.root = rootElement;
        this.container = rootElement.querySelector(containerSelector);
        this.onCardClick = null;
    }

    destroy() {
        this.root = null;
        this.container = null;
        this.onCardClick = null;
    }

    render(cards, currentMana) {
        this.container.innerHTML = '';
        cards.forEach((card, index) => {
            const el = this.createCardElement(card, index, currentMana);
            this.container.appendChild(el);
        });
    }

    createCardElement(card, index, currentMana) {
        const cardDiv = document.createElement('div');
        const rarity = card.rarity || 'common';
        cardDiv.className = 'card ' + rarity;
        cardDiv.dataset.handIndex = index;
        cardDiv.dataset.instanceId = card.instanceId || '';

        if (currentMana !== undefined && card.mana > currentMana) {
            cardDiv.style.opacity = '0.5';
            cardDiv.style.cursor = 'not-allowed';
        }

        const manaDiv = document.createElement('div');
        manaDiv.className = 'card-mana';
        manaDiv.textContent = card.mana;

        const artDiv = document.createElement('div');
        artDiv.className = 'card-art';
        artDiv.textContent = card.art;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;

        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.textContent = card.text;

        cardDiv.appendChild(manaDiv);
        cardDiv.appendChild(artDiv);
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(textDiv);

        return cardDiv;
    }

    selectCard(index) {
        this.deselectAll();
        const card = this.container.querySelector(`[data-hand-index="${index}"]`);
        if (card) card.classList.add('selected');
    }

    deselectAll() {
        this.container.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    }

    addCastingEffect(index) {
        const card = this.container.querySelector(`[data-hand-index="${index}"]`);
        if (card) {
            card.classList.add('casting');
        }
    }

    removeCardFromDom(index) {
        const card = this.container.querySelector(`[data-hand-index="${index}"]`);
        if (card && card.parentNode) {
            card.parentNode.removeChild(card);
        }
    }

    bindClick(handler) {
        this.onCardClick = handler;
    }
}

window.PlayerHandComponent = PlayerHandComponent;
