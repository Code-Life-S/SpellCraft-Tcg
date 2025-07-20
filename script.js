class TCGGame {
    constructor() {
        this.playerHand = [];
        this.currentMana = 3;
        this.maxMana = 10;
        
        this.initializeGame();
    }

    initializeGame() {
        this.createSampleCards();
        this.renderPlayerHand();
        this.bindEvents();
    }

    createSampleCards() {
        // Sample card data inspired by Hearthstone
        const sampleCards = [
            {
                id: 1,
                name: "Fire Bolt",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Deal 3 damage to any target.",
                art: "🔥"
            },
            {
                id: 2,
                name: "Goblin Warrior",
                type: "minion",
                mana: 2,
                attack: 2,
                health: 1,
                rarity: "common",
                text: "A fierce little warrior.",
                art: "👹"
            },
            {
                id: 3,
                name: "Lightning Storm",
                type: "spell",
                mana: 3,
                rarity: "rare",
                text: "Deal 2-3 damage to all enemy minions.",
                art: "⚡"
            },
            {
                id: 4,
                name: "Ancient Guardian",
                type: "minion",
                mana: 4,
                attack: 3,
                health: 6,
                rarity: "epic",
                text: "Taunt. Can't attack heroes.",
                art: "🗿"
            },
            {
                id: 5,
                name: "Dragon Lord",
                type: "minion",
                mana: 8,
                attack: 8,
                health: 8,
                rarity: "legendary",
                text: "Battlecry: Deal 4 damage to all enemies.",
                art: "🐉"
            },
            {
                id: 6,
                name: "Healing Potion",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Restore 5 health to your hero.",
                art: "🧪"
            },
            {
                id: 7,
                name: "Knight Champion",
                type: "minion",
                mana: 5,
                attack: 4,
                health: 5,
                rarity: "rare",
                text: "Divine Shield, Charge",
                art: "⚔️"
            }
        ];

        // Add 5 random cards to player's hand
        for (let i = 0; i < 5; i++) {
            const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)];
            this.playerHand.push({...randomCard, handIndex: i});
        }
    }

    renderPlayerHand() {
        const handContainer = document.getElementById('player-hand');
        handContainer.innerHTML = '';

        this.playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            handContainer.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.type} ${card.rarity}`;
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.handIndex = index;

        // Mana cost
        const manaDiv = document.createElement('div');
        manaDiv.className = 'card-mana';
        manaDiv.textContent = card.mana;

        // Card art
        const artDiv = document.createElement('div');
        artDiv.className = 'card-art';
        artDiv.textContent = card.art;

        // Card name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;

        // Card text
        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.textContent = card.text;

        // Assemble card
        cardDiv.appendChild(manaDiv);
        cardDiv.appendChild(artDiv);
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(textDiv);

        // Add stats for minions
        if (card.type === 'minion') {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'card-stats';

            const attackDiv = document.createElement('div');
            attackDiv.className = 'card-attack';
            attackDiv.textContent = card.attack;

            const healthDiv = document.createElement('div');
            healthDiv.className = 'card-health';
            healthDiv.textContent = card.health;

            statsDiv.appendChild(attackDiv);
            statsDiv.appendChild(healthDiv);
            cardDiv.appendChild(statsDiv);
        }

        return cardDiv;
    }

    bindEvents() {
        // Card click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.card')) {
                const card = e.target.closest('.card');
                this.handleCardClick(card);
            }
        });

        // End turn button
        document.getElementById('end-turn').addEventListener('click', () => {
            this.endTurn();
        });

        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });
    }

    handleCardClick(cardElement) {
        const handIndex = parseInt(cardElement.dataset.handIndex);
        const card = this.playerHand[handIndex];

        if (card.mana <= this.currentMana) {
            this.playCard(handIndex);
        } else {
            this.showMessage(`Not enough mana! Need ${card.mana}, have ${this.currentMana}`);
        }
    }

    playCard(handIndex) {
        const card = this.playerHand[handIndex];
        
        // Deduct mana
        this.currentMana -= card.mana;
        this.updateManaDisplay();

        // Remove card from hand
        this.playerHand.splice(handIndex, 1);

        // Show play effect
        this.showMessage(`Played ${card.name}!`);

        // Re-render hand
        this.renderPlayerHand();

        // Add card effect logic here (for now just a message)
        setTimeout(() => {
            this.applyCardEffect(card);
        }, 500);
    }

    applyCardEffect(card) {
        // Placeholder for card effects
        switch(card.type) {
            case 'spell':
                this.showMessage(`${card.name} spell effect activated!`);
                break;
            case 'minion':
                this.showMessage(`${card.name} summoned to the battlefield!`);
                break;
        }
    }

    showCardDetails(cardElement) {
        // Add visual feedback for card inspection
        cardElement.style.zIndex = '100';
    }

    showMessage(message) {
        // Create temporary message display
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }

    updateManaDisplay() {
        document.getElementById('current-mana').textContent = this.currentMana;
    }

    endTurn() {
        // Reset mana (simplified)
        this.currentMana = Math.min(this.maxMana, this.currentMana + 1);
        this.updateManaDisplay();
        
        // Draw a card (simplified)
        this.drawCard();
        
        this.showMessage("Turn ended! Drew a card.");
    }

    drawCard() {
        // Simple card draw - add a random card
        const newCards = [
            {
                id: Date.now(),
                name: "Mystery Card",
                type: "spell",
                mana: Math.floor(Math.random() * 5) + 1,
                rarity: "common",
                text: "A mysterious new card!",
                art: "❓"
            }
        ];

        if (this.playerHand.length < 10) {
            this.playerHand.push(newCards[0]);
            this.renderPlayerHand();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TCGGame();
});